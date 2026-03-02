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
  const [engine, setEngine] = useState<"OPENAI" | "GEMINI" | "PERPLEXITY">(
    "OPENAI",
  );
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
      if (!res.ok) {
        setErr(data?.error || "Erreur");
        return;
      }
      router.push(`/runs/${data.runId}`);
    } catch {
      setErr("Erreur réseau.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex items-center gap-3">
      <select
        className="rounded-md border px-3 py-2 text-sm"
        value={engine}
        onChange={(e) => setEngine(e.target.value as any)}
        disabled={loading}
      >
        <option value="OPENAI">ChatGPT (OpenAI)</option>
        <option value="GEMINI">Gemini</option>
        <option value="PERPLEXITY">Perplexity</option>
      </select>

      <button
        onClick={launch}
        disabled={loading}
        className="rounded-md bg-black px-4 py-2 text-sm text-white disabled:opacity-60"
      >
        {loading ? "Run..." : "Lancer un run"}
      </button>

      {err && <span className="text-sm text-red-600">{err}</span>}
    </div>
  );
}
