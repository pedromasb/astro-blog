// src/pages/api/ask.ts
import type { APIRoute } from "astro";
import { Pinecone } from "@pinecone-database/pinecone";
import OpenAI from "openai";

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

// Embeddings for a single query using HF Inference (feature-extraction)
async function embedQueryHF(query: string): Promise<number[]> {
  if (!HF_TOKEN) throw new Error("HF_TOKEN is not set in env");

  // Primary: explicit feature-extraction endpoint (returns embeddings)
  const urlFE =
    "https://api-inference.huggingface.co/pipeline/feature-extraction/sentence-transformers/all-mpnet-base-v2";

  const payload = {
    inputs: query,
    options: { wait_for_model: true },
  };

  // Try feature-extraction route first
  let resp = await fetch(urlFE, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${HF_TOKEN}`,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(payload),
  });

  // If the model is warming up, retry briefly
  for (let attempt = 0; resp.status === 503 && attempt < 2; attempt++) {
    await new Promise((r) => setTimeout(r, 1200));
    resp = await fetch(urlFE, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${HF_TOKEN}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(payload),
    });
  }

  if (!resp.ok) {
    // Fallback: models endpoint with parameters that most backends accept for embeddings
    const urlModels =
      "https://api-inference.huggingface.co/models/sentence-transformers/all-mpnet-base-v2";
    const resp2 = await fetch(urlModels, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${HF_TOKEN}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        inputs: query,
        options: { wait_for_model: true },
        // some backends honor these for embeddings; harmless if ignored
        parameters: { pooling: "mean", normalize: true },
      }),
    });

    if (!resp2.ok) {
      const t1 = await resp.text().catch(() => "");
      const t2 = await resp2.text().catch(() => "");
      throw new Error(
        `HF error (feature-extraction: ${resp.status} -> ${t1}) and (models: ${resp2.status} -> ${t2})`
      );
    }

    const data2 = await resp2.json();
    const vec2 = Array.isArray(data2[0]) ? data2[0] : data2;
    if (!Array.isArray(vec2) || vec2.length === 0) {
      throw new Error("HF returned empty embedding (models endpoint)");
    }
    return vec2 as number[];
  }

  const data = await resp.json();
  const vec = Array.isArray(data[0]) ? data[0] : data;
  if (!Array.isArray(vec) || vec.length === 0) {
    throw new Error("HF returned empty embedding (feature-extraction endpoint)");
  }
  return vec as number[];
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
