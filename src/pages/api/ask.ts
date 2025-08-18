// src/pages/api/ask.ts
import type { APIRoute } from "astro";
import { Pinecone } from "@pinecone-database/pinecone";
import OpenAI from "openai";
import { InferenceClient } from "@huggingface/inference";

// ---- config from env ----
const PINECONE_API_KEY = import.meta.env.PINECONE_API_KEY!;
const PINECONE_INDEX = import.meta.env.PINECONE_INDEX || "thesis-chat";
const PINECONE_NAMESPACE = import.meta.env.PINECONE_NAMESPACE || "ch_in_emb"; // or "v1"
const HF_TOKEN = import.meta.env.HF_TOKEN!; // Hugging Face Inference token
const OPENAI_API_KEY = import.meta.env.OPENAI_API_KEY!;

// ---- init clients ----
const pc = new Pinecone({ apiKey: PINECONE_API_KEY });
const index = pc.Index(PINECONE_INDEX);
const openai = new OpenAI({ apiKey: OPENAI_API_KEY });
const hf = new InferenceClient(import.meta.env.HF_TOKEN!);


// Embeddings for a single query (all-mpnet-base-v2, 768-d)
async function embedQueryHF(query: string): Promise<number[]> {
  if (!import.meta.env.HF_TOKEN) {
    throw new Error("HF_TOKEN is not set in env");
  }

  // Hits the correct feature-extraction task (no manual URL juggling)
  const out = await hf.featureExtraction({
    model: "sentence-transformers/all-mpnet-base-v2",
    inputs: query,
    // these are honored by sentence-transformers backends; ignored if unsupported
    pooling: "mean",
    normalize: true,
    wait_for_model: true,
  });

  // SDK returns number[] or number[][] depending on batching → normalize:
  const vec = Array.isArray((out as number[] | number[][])[0])
    ? (out as number[][])[0]
    : (out as number[]);
  if (!Array.isArray(vec) || vec.length === 0) {
    throw new Error("HF returned empty embedding");
  }
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

function trim(s = "", max = 1100) {
  s = s.trim();
  return s.length <= max ? s : s.slice(0, max) + " …";
}

function buildPrompt(question: string, contexts: { text: string; meta: any }[]) {
  const numbered = contexts.map((c, i) => {
    const header = asPath(c.meta);
    return `[[${i + 1}]] ${header}\n${trim(c.text)}`;
  });
  const ctx = numbered.join("\n\n---\n\n");

  const system =
    "You are a careful, factual assistant. Answer using ONLY the provided context blocks; do not invent information. " +
    "Explain clearly (not overly terse). Cite the blocks you used by bracket number like [1], [2]. " +
    "If the answer is not contained in the context, say you don't know.";
  const user = `Question: ${question}\n\nContext:\n${ctx}\n\n`;

  return { system, user };
}

export const POST: APIRoute = async ({ request }) => {
  try {
    const { query } = await request.json();
    if (!query || typeof query !== "string") {
      return new Response(JSON.stringify({ error: "Missing 'query' string" }), { status: 400 });
    }

    // 1) embed query
    const qvec = await embedQueryHF(query);

    // 2) vector search (grab plenty; we‘ll keep top 6–8)
    const res = await index.query({
      vector: qvec,
      topK: 50,
      includeMetadata: true,
      namespace: PINECONE_NAMESPACE,
    });

    const matches = (res.matches || []).map((m: any) => ({
      text: m.metadata?.text || "",
      meta: m.metadata || {},
      score: m.score,
      id: m.id,
    }));

    // (Optional) rerank with Cohere here if you want; otherwise, just take top-N
    const topK = 8;
    const top = matches.slice(0, topK);

    // 3) build prompt
    const { system, user } = buildPrompt(query, top);

    // 4) call OpenAI (use gpt-4o-mini for speed/cost)
    const completion = await openai.chat.completions.create({
      model: "gpt-5-mini",
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
    });

    const answer = completion.choices[0]?.message?.content ?? "No answer.";
    return new Response(JSON.stringify({ answer, sources: top }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: String(err?.message || err) }), { status: 500 });
  }
};
