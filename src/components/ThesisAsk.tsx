// src/components/ThesisAsk.tsx
import { useState } from "react";

export default function ThesisAsk() {
  const [q, setQ] = useState("");
  const [a, setA] = useState<string | null>(null);
  const [sources, setSources] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function ask() {
    setLoading(true); setErr(null); setA(null); setSources([]);
    try {
      const r = await fetch("/api/ask", {
        method: "POST",
        headers: {"Content-Type":"application/json"},
        body: JSON.stringify({ query: q }),
      });
      const ct = r.headers.get("content-type") || "";
      const raw = await r.text();
      const data = ct.includes("application/json") ? JSON.parse(raw) : { error: raw };
      if (!r.ok) throw new Error(data.error || r.statusText);
      setA(data.answer);
      setSources(data.sources || []);
    } catch (e: any) {
      setErr(e.message || String(e));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-2xl border border-skin-line/50 bg-skin-card p-4 sm:p-5 shadow-sm">
      <div className="flex gap-2">
        <input
          className="flex-1 rounded-md border border-skin-line px-3 py-2 outline-none focus:ring-2 focus:ring-skin-accent/60 bg-transparent"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Ask about J-PLUS, CARMENES, UCDs…"
        />
        <button
          onClick={ask}
          disabled={loading || !q.trim()}
          className="rounded-md bg-skin-accent text-skin-inverted px-4 py-2 disabled:opacity-60"
        >
          {loading ? "Thinking…" : "Ask"}
        </button>
      </div>

      {err && <p className="mt-3 text-red-600 text-sm">{err}</p>}

      {a && (
        <div className="prose prose-neutral dark:prose-invert mt-5">
          <h3>Answer</h3>
          <p>{a}</p>

          {sources?.length > 0 && (
            <>
              <h4>Sources</h4>
              <ol className="list-decimal pl-5">
                {sources.map((s: any, i: number) => {
                  const m = s.meta || {};
                  const path = [m.chapter_key && `Ch.${m.chapter_key}: ${m.chapter}`, m.section_key && `S.${m.section_key}: ${m.section}`, m.subsection_key && `SS.${m.subsection_key}: ${m.subsection}`]
                    .filter(Boolean).join(" | ");
                  return <li key={i}>{path || "(no path)"}</li>;
                })}
              </ol>
            </>
          )}
        </div>
      )}
    </div>
  );
}
