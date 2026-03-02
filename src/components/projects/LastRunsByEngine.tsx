"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type LastRun = {
  runId: string;
  engine: "OPENAI" | "GEMINI" | "PERPLEXITY";
  createdAt: string;
  runScore: number;
  mentionRate: number;
  avgPosition: number | null;
  status: string;
} | null;

export default function LastRunsByEngine({ projectId }: { projectId: string }) {
  const [last, setLast] = useState<LastRun[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const res = await fetch(`/api/projects/${projectId}/summary`);
      const json = await res.json();
      if (!mounted) return;
      setLast(json.lastByEngine || []);
      setLoading(false);
    })();
    return () => {
      mounted = false;
    };
  }, [projectId]);

  if (loading) return <div className="rounded-xl border p-4 text-sm text-gray-600">Chargement…</div>;

  const engines = ["OPENAI", "GEMINI", "PERPLEXITY"] as const;

  return (
    <div className="rounded-xl border p-4">
      <div className="text-sm font-medium">Dernier run par engine</div>
      <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
        {engines.map((e, idx) => {
          const r = last[idx];
          return (
            <div key={e} className="rounded-lg border p-3">
              <div className="text-xs text-gray-600">{e}</div>
              {!r ? (
                <div className="mt-2 text-sm text-gray-600">—</div>
              ) : (
                <>
                  <div className="mt-2 text-2xl font-semibold">{r.runScore}</div>
                  <div className="mt-1 text-xs text-gray-600">
                    Mention: {r.mentionRate}% • Pos: {r.avgPosition ?? "—"}
                  </div>
                  <div className="mt-2">
                    <Link className="text-sm underline" href={`/runs/${r.runId}`}>
                      Voir
                    </Link>
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}