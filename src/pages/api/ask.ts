// src/pages/api/ask.ts
import type { APIRoute } from "astro";
import { Pinecone } from "@pinecone-database/pinecone";
import OpenAI from "openai";
import { InferenceClient } from "@huggingface/inference";
import { CohereClient } from "cohere-ai";

export const prerender = false;
export const runtime = 'node'; // ensure Node runtime on Vercel


// --- Lazy singletons (initialized on first call only)
let _pc: Pinecone | null = null;
let _openai: OpenAI | null = null;
let _hf: InferenceClient | null = null;
let _cohere: CohereClient | null = null;

function requireEnv(name: string): string {
  const v = (import.meta as any).env?.[name];
  if (!v) throw new Error(`Missing env var: ${name}`);
  return v;
}

function getClients() {
  // Validate env inside the handler so errors are caught and serialized to JSON
  const PINECONE_API_KEY = process.env.PINECONE_API_KEY!;
  const OPENAI_API_KEY = process.env.OPENAI_API_KEY!;
  const HF_TOKEN = requireEnv("HF_TOKEN");
  const COHERE_API_KEY   = (import.meta as any).env?.COHERE_API_KEY; // optional

  if (!_pc) _pc = new Pinecone({ apiKey: PINECONE_API_KEY });
  if (!_openai) _openai = new OpenAI({ apiKey: OPENAI_API_KEY });
  if (!_hf) _hf = new InferenceClient(HF_TOKEN);
  if (!_cohere && COHERE_API_KEY) _cohere = new CohereClient({ token: COHERE_API_KEY });

  return { pc: _pc!, openai: _openai!, hf: _hf!, cohere: _cohere};
}

const PINECONE_INDEX = process.env.PINECONE_INDEX     || "thesis-chat";
const PINECONE_NAMESPACE = "v1";
// const PINECONE_NAMESPACE = process.env.PINECONE_NAMESPACE || "ch_in_emb";

// Embeddings with HF feature-extraction (SDK picks correct endpoint)
async function embedQueryHF(hf: InferenceClient, query: string): Promise<number[]> {
  const out = await hf.featureExtraction({
    model: "sentence-transformers/all-mpnet-base-v2",
    inputs: query,
    pooling: "mean",
    normalize: true,
    wait_for_model: true,
  });
  const vec = Array.isArray((out as number[] | number[][])[0])
    ? (out as number[][])[0]
    : (out as number[]);
  if (!Array.isArray(vec) || vec.length === 0) throw new Error("HF returned empty embedding");
  return vec;
}

function asPath(md: any) {
  const parts = [
    md?.chapter_key && `Ch.${md.chapter_key}: ${md.chapter || ""}`,
    md?.section_key && `S.${md.section_key}: ${md.section || ""}`,
    md?.subsection_key && `SS.${md.subsection_key}: ${md.subsection || ""}`,
  ].filter(Boolean);
  return parts.join(" | ");
}

function trim(s = "", max = 900) {
  s = s.trim();
  return s.length <= max ? s : s.slice(0, max) + " …";
}

function preview(text = "", max = 180) {
  text = text.replace(/\s+/g, " ").trim();
  return text.length <= max ? text : text.slice(0, max) + "…";
}

function buildPrompt(question: string, contexts: { text: string; meta: any }[]) {
  const numbered = contexts.map((c, i) => {
    const header = asPath(c.meta);
    return `[[${i + 1}]] ${header}\n${trim(c.text)}`;
  });
  const ctx = numbered.join("\n\n---\n\n");  const system =
    "You answer questions using ONLY the provided context blocks." +
    "Be concise but don’t oversimplify. " +
    "Cite the blocks you used by bracket number like [1], [2]. " +
    "Format your answers using Markdown (bold, italics, bullet points, code blocks)." +
    "If the answer is not contained in the context, just say exactly that the question is outside the context of this PhD thesis.";

  const user = `Question: ${question}\n\nContext:\n${ctx}\n\nWrite the answer with bracketed citations to the blocks you used (e.g., [1], [2]).`;
  return { system, user };
}

type Match = { id: string; text: string; meta: any; score: number };

async function rerankWithCohere(query: string, matches: Match[], cohere?: CohereClient, keep = 8) {
  if (!cohere || matches.length === 0) return matches.slice(0, keep);

  // Prepare docs for Cohere
  const documents = matches.map((m, i) => ({
    id: String(i),            // we’ll map back by this
    text: m.text || "",
  }));

  // Choose model: english or multilingual
  const model = "rerank-english-v3.0"; // or "rerank-multilingual-v3.0" if you expect ES content

  const rr = await cohere.rerank({
    model,
    query,
    documents,
    topN: Math.min(keep, documents.length),
  });

  // Reorder matches by Cohere’s result indices
  const order = rr.results
    .sort((a, b) => (b.relevanceScore ?? 0) - (a.relevanceScore ?? 0))
    .map(r => Number(r.index));

  const re = order.map(i => ({
    ...matches[i],
    rerankScore: rr.results.find(r => Number(r.index) === i)?.relevanceScore ?? null,
  }));

  return re;
}

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json().catch(() => ({}));
    const query = body?.query;
    if (!query || typeof query !== "string") {
      return new Response(JSON.stringify({ error: "Missing 'query' string" }), { status: 400, headers: { "Content-Type": "application/json" } });
    }

    const { pc, openai, hf } = getClients();
    const index = pc.Index(PINECONE_INDEX);

    // 1) embed
    const qvec = await embedQueryHF(hf, query);

    // 2) vector search (namespace via chaining for SDKs that require it)
    const res = await index.namespace(PINECONE_NAMESPACE).query({
      vector: qvec,
      topK: 25,
      includeMetadata: true,
    });

    const matches = (res.matches || []).map((m: any) => ({
      id: m.id,
      text: m.metadata?.text || "",
      meta: m.metadata || {},
      score: m.score, // vector sim score (pre-rerank)
    }));

    const topK = 6;
    const { cohere } = getClients();
    let top: Match[];

    try {
      top = await rerankWithCohere(query, matches, cohere ?? undefined, topK);
    } catch (e) {
      // Fail open: if rerank errors, fall back to vector order
      top = matches.slice(0, topK);
    }

    // 3) prompt
    const { system, user } = buildPrompt(query, top);

    // 4) LLM
    const completion = await openai.chat.completions.create({
      model: "gpt-5-mini",           // valid model
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
    });

    const answer = completion.choices?.[0]?.message?.content ?? "No answer.";

    const sources = top.map(m => ({
      id: m.id,
      score: m.score,
      text: m.text,
      metadata: m.meta,            // <-- normalize key for the client
      path: asPath(m.meta || {}),  // <-- optional convenience
      preview: preview(m.text),
    }));

    return new Response(JSON.stringify({ answer, sources }), {
      headers: { "Content-Type": "application/json" },
    });

    } catch (err: any) {
      const detail = (err?.response && (await err.response.text?.()?.catch(()=>null))) || err?.message || String(err);
      return new Response(JSON.stringify({ error: detail }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }
};

export const GET: APIRoute = async () =>
  new Response(JSON.stringify({ ok: true, hint: "Use POST { query }" }), {
    headers: { "Content-Type": "application/json; charset=utf-8" },
  });

  export const OPTIONS: APIRoute = async () =>
  new Response(null, {
    status: 204,
    headers: {
      Allow: "GET, POST, OPTIONS",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "content-type, authorization",
    },
  });