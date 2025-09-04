// src/pages/api/ask.ts
import type { APIRoute } from "astro";
import { Pinecone } from "@pinecone-database/pinecone";
import OpenAI from "openai";
import { InferenceClient } from "@huggingface/inference";

export const prerender = false;
export const runtime = 'node'; // ensure Node runtime on Vercel


// --- Lazy singletons (initialized on first call only)
let _pc: Pinecone | null = null;
let _openai: OpenAI | null = null;
let _hf: InferenceClient | null = null;

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

  if (!_pc) _pc = new Pinecone({ apiKey: PINECONE_API_KEY });
  if (!_openai) _openai = new OpenAI({ apiKey: OPENAI_API_KEY });
  if (!_hf) _hf = new InferenceClient(HF_TOKEN);

  return { pc: _pc!, openai: _openai!, hf: _hf! };
}

const PINECONE_INDEX = process.env.PINECONE_INDEX     || "thesis-chat";
// const PINECONE_NAMESPACE = process.env.PINECONE_NAMESPACE || "v1";
const PINECONE_NAMESPACE = "vf";

// Embeddings with HF feature-extraction (SDK picks correct endpoint)
async function embedQueryHF(hf: InferenceClient, query: string): Promise<number[]> {
  const out = await hf.featureExtraction({
    // model: "sentence-transformers/paraphrase-multilingual-mpnet-base-v2",
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

function trim(s = "", max = 5000) {
  s = s.trim();
  return s.length <= max ? s : s.slice(0, max) + " …";
}


function buildPrompt(question: string, contexts: { text: string; meta: any }[]) {
  const numbered = contexts.map((c, i) => {
    const header = asPath(c.meta);
    return `[[${i + 1}]] ${header}\n${trim(c.text)}`;
  });
  const ctx = numbered.join("\n\n---\n\n");  const system =
    "You answer questions using ONLY the provided context blocks. If the context contains relevant information, use it to answer, even if partial, and do not state what is missing or give any notes about the text. If the context provides related information (e.g. mentions a person, concept, or tool), summarize what the context says about it, even if it does not fully answer the question. If the context gives only fragments, quote or paraphrase them. If nothing at all is relevant, then say the question is outside the context of this PhD thesis" +
    "You are a helpful research assistant that answers questions about a PhD thesis. Your style should be clear, formal, and scientifically accurate, but accessible to researchers and graduate students. Keep answers well-structured and balanced: not too brief, not overly long — aim for 2–5 short paragraphs, or lists when helpful. " +
    "Cite the blocks you used by bracket number like [1], [2]. " +
    "Always respond in Markdown. Use headings (`##`), bullet points, and numbered lists for readability." +
    "Take into account that temperature values will appear with the unit ,K in the context" + 
    "Answer in the user’s language.";

  const user = `Question: ${question}\n\nContext:\n${ctx}\n\nWrite the answer with bracketed citations to the blocks you used (e.g., [1], [2]).`;
  return { system, user };
}

type Match = { id: string; text: string; meta: any; score: number };


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
      topK: 6,
      includeMetadata: true,
    });

    const matches = (res.matches || []).map((m: any) => ({
      id: m.id,
      text: m.metadata?.text || "",
      meta: m.metadata || {},
      score: m.score, // vector sim score (pre-rerank)
    }));

    // Use top 6 results from vector search directly
    const top = matches.slice(0, 6);

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
      metadata: m.meta,            // <-- normalize key for the client
      path: asPath(m.meta || {}),  // <-- optional convenience
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