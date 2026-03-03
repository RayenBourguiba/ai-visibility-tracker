"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function RunButton({
  projectId,
  promptSetKey,
}: {
  projectId: string;
  promptSetKey?: string | null;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [engine, setEngine] = useState<"OPENAI" | "GEMINI" | "PERPLEXITY">("OPENAI");
  const [err, setErr] = useState<string | null>(null);

  async function launch() {
    setErr(null);
    setLoading(true);
    try {
      const res = await fetch("/api/runs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId, engine, promptSetKey: promptSetKey || undefined }),
      });
      const data = await res.json();
      if (!res.ok) { setErr(data?.error || "Erreur"); return; }
      router.push(`/runs/${data.runId}`);
    } catch {
      setErr("Erreur réseau.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
      <select
        value={engine}
        onChange={(e) => setEngine(e.target.value as any)}
        disabled={loading}
        style={{ width: "auto", fontSize: "0.78rem", padding: "0.5rem 2rem 0.5rem 0.8rem" }}
      >
        <option value="OPENAI">ChatGPT (OpenAI)</option>
        <option value="GEMINI">Gemini</option>
        <option value="PERPLEXITY">Perplexity</option>
      </select>

      <button
        onClick={launch}
        disabled={loading}
        className="btn btn-primary"
        style={{ opacity: loading ? 0.6 : 1 }}
      >
        {loading ? "En cours…" : "▶ Lancer un run"}
      </button>

      {err && (
        <span style={{ fontSize: "0.75rem", color: "#c0291e", fontFamily: "var(--font-mono)" }}>
          {err}
        </span>
      )}
    </div>
  );
}