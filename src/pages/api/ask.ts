// src/pages/api/ask.ts
import type { APIRoute } from "astro";
import { Pinecone } from "@pinecone-database/pinecone";
import OpenAI from "openai";

export const prerender = false;
export const runtime = 'node'; // ensure Node runtime on Vercel


// --- Lazy singletons (initialized on first call only)
let _pc: Pinecone | null = null;
let _openai: OpenAI | null = null;

function requireEnv(name: string): string {
  const v = (import.meta as any).env?.[name];
  if (!v) throw new Error(`Missing env var: ${name}`);
  return v;
}

function getClients() {
  // Validate env inside the handler so errors are caught and serialized to JSON
  const PINECONE_API_KEY = process.env.PINECONE_API_KEY!;
  const OPENAI_API_KEY = process.env.OPENAI_API_KEY!;

  if (!_pc) _pc = new Pinecone({ apiKey: PINECONE_API_KEY });
  if (!_openai) _openai = new OpenAI({ apiKey: OPENAI_API_KEY });

  return { pc: _pc!, openai: _openai!};
}

const PINECONE_INDEX = process.env.PINECONE_INDEX     || "thesis-chat";
// const PINECONE_NAMESPACE = process.env.PINECONE_NAMESPACE || "v1";
const PINECONE_NAMESPACE = "vf";

// Embeddings with HF feature-extraction (SDK picks correct endpoint)
async function embedQueryOpenAI(openai: OpenAI, query: string): Promise<number[]> {
  const resp = await openai.embeddings.create({
    model: "text-embedding-3-small",
    input: query,
  });
  return resp.data[0].embedding as unknown as number[];
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
  const ctx = numbered.join("\n\n---\n\n");
  
  const system =
    "You answer questions using ONLY the provided context blocks. If the context contains relevant information, use it to answer, even if partial, and do not state what is missing or give any notes about the text. If the context provides related information (e.g. mentions a person, concept, or tool), summarize what the context says about it, even if it does not fully answer the question. If the context gives only fragments, quote or paraphrase them. If nothing at all is relevant, then say the question is outside the context of this PhD thesis. " +
    "You are a helpful research assistant that answers questions about a PhD thesis. Your style should be clear, formal, and scientifically accurate, but accessible to researchers and graduate students. Keep answers well-structured and balanced: not too brief, not overly long — aim for 2–5 short paragraphs, or lists when helpful. " +
    "Cite the blocks you used by bracket number like [1], [2]. " +
    "Always respond in Markdown. Use headings (`##`), bullet points, and numbered lists for readability. " +
    "Take into account that temperature values will appear with the unit ,K in the context. " + 
    "Answer in the user's language.";

  const user = `Question: ${question}\n\nContext:\n${ctx}\n\nWrite the answer with bracketed citations to the blocks you used (e.g., [1], [2]).`;
  return { system, user };
}


export const POST: APIRoute = async ({ request }) => {
  console.log('API /ask endpoint called');
  
  try {
    // Parse request body
    let body;
    try {
      const rawBody = await request.text();
      console.log('Raw request body:', rawBody);
      body = JSON.parse(rawBody);
    } catch (parseError) {
      console.error('Failed to parse request body:', parseError);
      return new Response(
        JSON.stringify({ error: "Invalid request body - must be valid JSON" }), 
        { 
          status: 400, 
          headers: { "Content-Type": "application/json" } 
        }
      );
    }
    
    const query = body?.query;
    if (!query || typeof query !== "string") {
      return new Response(
        JSON.stringify({ error: "Missing 'query' string in request body" }), 
        { 
          status: 400, 
          headers: { "Content-Type": "application/json" } 
        }
      );
    }
    
    console.log('Processing query:', query);

    // Initialize clients
    let pc, openai;
    try {
      const clients = getClients();
      pc = clients.pc;
      openai = clients.openai;
      console.log('Clients initialized successfully');
    } catch (clientError) {
      console.error('Failed to initialize clients:', clientError);
      return new Response(
        JSON.stringify({ error: `Failed to initialize services: ${clientError.message}` }), 
        { 
          status: 500, 
          headers: { "Content-Type": "application/json" } 
        }
      );
    }

    const index = pc.Index(PINECONE_INDEX);

    // 1) Generate embedding
    let qvec;
    try {
      console.log('Generating embedding...');
      qvec = await embedQueryOpenAI(openai, query);
      console.log('Embedding generated, dimension:', qvec.length);
    } catch (embedError) {
      console.error('Embedding generation failed:', embedError);
      return new Response(
        JSON.stringify({ error: `Failed to generate embedding: ${embedError.message}` }), 
        { 
          status: 500, 
          headers: { "Content-Type": "application/json" } 
        }
      );
    }

    // 2) Vector search
    let matches;
    try {
      console.log('Performing vector search...');
      const res = await index.namespace(PINECONE_NAMESPACE).query({
        vector: qvec,
        topK: 6,
        includeMetadata: true,
      });
      
      matches = (res.matches || []).map((m: any) => ({
        id: m.id,
        text: m.metadata?.text || "",
        meta: m.metadata || {},
        score: m.score,
      }));
      
      console.log('Vector search complete, found', matches.length, 'matches');
    } catch (searchError) {
      console.error('Vector search failed:', searchError);
      return new Response(
        JSON.stringify({ error: `Vector search failed: ${searchError.message}` }), 
        { 
          status: 500, 
          headers: { "Content-Type": "application/json" } 
        }
      );
    }

    // Use top 6 results
    const top = matches.slice(0, 6);

    // 3) Build prompt
    const { system, user } = buildPrompt(query, top);
    console.log('Prompt built, sending to OpenAI...');

    // 4) Call OpenAI
    let completion;
    try {
      completion = await openai.chat.completions.create({
        model: "gpt-5-mini",
        messages: [
          { role: "system", content: system },
          { role: "user", content: user },
        ]
      });
      console.log('OpenAI response received');
    } catch (openaiError: any) {
      console.error('OpenAI API call failed:', openaiError);
      
      // Check if it's an OpenAI SDK error
      if (openaiError?.error) {
        console.error('OpenAI error details:', openaiError.error);
        return new Response(
          JSON.stringify({ 
            error: `OpenAI API error: ${openaiError.error?.message || openaiError.message}`,
            code: openaiError.error?.code,
            type: openaiError.error?.type
          }), 
          { 
            status: 500, 
            headers: { "Content-Type": "application/json" } 
          }
        );
      }
      
      // Generic error
      return new Response(
        JSON.stringify({ error: `Failed to generate response: ${openaiError.message || 'Unknown error'}` }), 
        { 
          status: 500, 
          headers: { "Content-Type": "application/json" } 
        }
      );
    }

    const answer = completion.choices?.[0]?.message?.content ?? "No answer generated.";

    const sources = top.map(m => ({
      id: m.id,
      score: m.score,
      metadata: m.meta,
      path: asPath(m.meta || {}),
    }));

    console.log('Sending successful response');
    
    return new Response(
      JSON.stringify({ answer, sources }), 
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );

  } catch (unexpectedError: any) {
    console.error('Unexpected error in API handler:', unexpectedError);
    console.error('Error stack:', unexpectedError?.stack);
    
    // Always return valid JSON
    return new Response(
      JSON.stringify({ 
        error: "An unexpected error occurred. Please check server logs.",
        message: unexpectedError?.message || 'Unknown error',
        details: process.env.NODE_ENV === 'development' ? unexpectedError?.stack : undefined 
      }), 
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
};