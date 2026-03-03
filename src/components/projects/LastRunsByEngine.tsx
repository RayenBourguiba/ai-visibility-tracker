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
    return () => { mounted = false; };
  }, [projectId]);

  const engines = ["OPENAI", "GEMINI", "PERPLEXITY"] as const;

  return (
    <div style={{
      background: "var(--bg-surface)",
      border: "1.5px solid var(--border)",
      borderRadius: "var(--radius-lg)",
      padding: "1.75rem 2rem",
      boxShadow: "var(--shadow-sm)",
    }}>
      <div style={{
        fontFamily: "var(--font-display)",
        fontSize: "1rem",
        fontWeight: 700,
        color: "var(--text-primary)",
        marginBottom: "1.25rem",
        letterSpacing: "-0.01em",
      }}>
        Dernier run par engine
      </div>

      {loading ? (
        <div style={{ fontSize: "0.82rem", color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
          Chargement…
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1rem" }}>
          {engines.map((e, idx) => {
            const r = last[idx];
            return (
              <div key={e} style={{
                background: "var(--bg-raised)",
                border: "1.5px solid var(--border)",
                borderRadius: "var(--radius-md)",
                padding: "1.25rem 1.5rem",
              }}>
                <div style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "0.62rem",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                  color: "var(--text-muted)",
                  marginBottom: "0.75rem",
                }}>
                  {e}
                </div>
                {!r ? (
                  <div style={{ fontSize: "0.82rem", color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
                    Aucun run pour le moment.
                  </div>
                ) : (
                  <>
                    <div style={{
                      fontSize: "2rem",
                      fontWeight: 700,
                      fontFamily: "var(--font-display)",
                      color: "var(--text-primary)",
                      letterSpacing: "-0.03em",
                      lineHeight: 1,
                      marginBottom: "0.5rem",
                    }}>
                      {r.runScore}
                    </div>
                    <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)", fontFamily: "var(--font-mono)", marginBottom: "0.75rem" }}>
                      Mention: {r.mentionRate}% • Pos: {r.avgPosition ?? "—"}
                    </div>
                    <Link href={`/runs/${r.runId}`} style={{
                      fontSize: "0.72rem",
                      fontFamily: "var(--font-mono)",
                      fontWeight: 600,
                      color: "var(--accent)",
                      textDecoration: "none",
                      borderBottom: "1px solid rgba(108,71,255,0.3)",
                      paddingBottom: "1px",
                    }}>
                      Voir le run →
                    </Link>
                  </>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}