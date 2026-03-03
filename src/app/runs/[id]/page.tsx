import { prisma } from "@/lib/db/prisma";
import Link from "next/link";
import { notFound } from "next/navigation";
import ExportButtons from "@/components/runs/ExportButtons";
import {
  computeRunScore,
  consolidateCompetitors,
} from "@/lib/summary/consolidate";

export default async function RunPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  if (!id) return notFound();

  const run = await prisma.run.findUnique({
    where: { id },
    include: {
      project: true,
      results: { include: { prompt: true }, orderBy: { createdAt: "asc" } },
    },
  });

  if (!run) return notFound();

  const runScore = computeRunScore(run.results);
  const topCompetitors = consolidateCompetitors(run.results);
  const total = run.results.length || 1;
  const mentioned = run.results.filter((r) => r.isMentioned).length;
  const mentionRate = Math.round((mentioned / total) * 100);

  const avgPos = (() => {
    const positions = run.results
      .map((r) => r.position)
      .filter((x): x is number => typeof x === "number");
    if (!positions.length) return null;
    return (
      Math.round(
        (positions.reduce((a, b) => a + b, 0) / positions.length) * 10,
      ) / 10
    );
  })();

  const statusColor =
    run.status === "SUCCESS"
      ? { bg: "#e0f7ee", color: "#0d7a4e" }
      : run.status === "FAILED"
        ? { bg: "#ffe8e8", color: "#c0291e" }
        : { bg: "#fff3e0", color: "#b85c00" };

  return (
    <main
      style={{ maxWidth: "960px", margin: "0 auto", padding: "3rem 2rem 5rem" }}
    >
      {/* ── Header ── */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: "1.5rem",
          marginBottom: "2.5rem",
        }}
      >
        <div>
          <h1
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "2rem",
              fontWeight: 800,
              color: "var(--text-primary)",
              letterSpacing: "-0.03em",
            }}
          >
            Run — {run.engine}
          </h1>
          <p
            style={{
              marginTop: "0.35rem",
              fontSize: "0.78rem",
              color: "var(--text-secondary)",
              fontFamily: "var(--font-mono)",
            }}
          >
            {run.project.brandName} • {run.project.domain} •{" "}
            {new Date(run.createdAt).toLocaleString()}
          </p>
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.6rem",
            flexShrink: 0,
          }}
        >
          <ExportButtons runId={run.id} />
          <Link
            href={`/runs/${run.id}/recommendations`}
            className="btn btn-primary"
            style={{ fontSize: "0.78rem" }}
          >
            Recommendations
          </Link>
          <Link
            href={`/projects/${run.projectId}`}
            className="btn btn-ghost"
            style={{ fontSize: "0.78rem" }}
          >
            ← Projet
          </Link>
        </div>
      </div>

      {/* ── KPI Cards ── */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: "1rem",
          marginBottom: "2rem",
        }}
      >
        {[
          { label: "Mention rate", value: `${mentionRate}%` },
          { label: "Position moyenne", value: avgPos ?? "—" },
          { label: "Score global", value: runScore },
          { label: "Status", value: run.status, style: statusColor },
        ].map(({ label, value, style }) => (
          <div
            key={label}
            style={{
              background: "var(--bg-surface)",
              border: "1.5px solid var(--border)",
              borderRadius: "var(--radius-lg)",
              padding: "1.25rem 1.5rem",
              boxShadow: "var(--shadow-sm)",
            }}
          >
            <div
              style={{
                fontSize: "0.62rem",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                color: "var(--text-muted)",
                fontFamily: "var(--font-mono)",
                marginBottom: "0.6rem",
              }}
            >
              {label}
            </div>
            <div
              style={{
                fontSize: "2rem",
                fontWeight: 800,
                fontFamily: "var(--font-display)",
                letterSpacing: "-0.03em",
                lineHeight: 1,
                ...(style
                  ? {
                      display: "inline-block",
                      background: style.bg,
                      color: style.color,
                      borderRadius: "var(--radius-sm)",
                      padding: "0.2rem 0.75rem",
                      fontSize: "1rem",
                      fontFamily: "var(--font-mono)",
                      fontWeight: 700,
                    }
                  : { color: "var(--text-primary)" }),
              }}
            >
              {String(value)}
            </div>
          </div>
        ))}
      </div>

      {/* ── Competitors + Recommendations ── */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "1rem",
          marginBottom: "2rem",
        }}
      >
        {/* Competitors */}
        <div
          style={{
            background: "var(--bg-surface)",
            border: "1.5px solid var(--border)",
            borderRadius: "var(--radius-lg)",
            padding: "1.5rem",
            boxShadow: "var(--shadow-sm)",
          }}
        >
          <div
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "0.95rem",
              fontWeight: 700,
              color: "var(--text-primary)",
              marginBottom: "1rem",
            }}
          >
            Concurrents fréquents
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
            {topCompetitors.length === 0 ? (
              <span
                style={{
                  fontSize: "0.82rem",
                  color: "var(--text-muted)",
                  fontFamily: "var(--font-mono)",
                }}
              >
                —
              </span>
            ) : (
              topCompetitors.map((c) => (
                <span
                  key={c.name}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "0.35rem",
                    background: "var(--bg-raised)",
                    border: "1.5px solid var(--border)",
                    borderRadius: "99px",
                    padding: "0.3rem 0.85rem",
                    fontSize: "0.72rem",
                    fontFamily: "var(--font-mono)",
                    fontWeight: 600,
                    color: "var(--text-secondary)",
                  }}
                >
                  {c.name}
                  <span style={{ color: "var(--text-muted)", fontWeight: 400 }}>
                    ({c.count})
                  </span>
                </span>
              ))
            )}
          </div>
        </div>

        {/* Recommendations */}
        <div
          style={{
            background: "var(--bg-surface)",
            border: "1.5px solid var(--border)",
            borderRadius: "var(--radius-lg)",
            padding: "1.5rem",
            boxShadow: "var(--shadow-sm)",
          }}
        >
          <div
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "0.95rem",
              fontWeight: 700,
              color: "var(--text-primary)",
              marginBottom: "1rem",
            }}
          >
            Recommandations (extrait)
          </div>
          {run.results[0]?.recommendations &&
          Array.isArray(run.results[0].recommendations) ? (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "0.6rem",
              }}
            >
              {(run.results[0].recommendations as any[])
                .slice(0, 4)
                .map((rec, idx) => (
                  <div
                    key={idx}
                    style={{
                      background: "var(--bg-raised)",
                      border: "1.5px solid var(--border)",
                      borderRadius: "var(--radius-md)",
                      padding: "0.85rem 1rem",
                    }}
                  >
                    <div
                      style={{
                        fontSize: "0.82rem",
                        fontWeight: 700,
                        color: "var(--text-primary)",
                        marginBottom: "0.25rem",
                      }}
                    >
                      {String(rec.title)}
                    </div>
                    <div
                      style={{
                        fontSize: "0.7rem",
                        color: "var(--text-muted)",
                        fontFamily: "var(--font-mono)",
                      }}
                    >
                      Impact: {String(rec.impact)} • Effort:{" "}
                      {String(rec.effort)}
                    </div>
                  </div>
                ))}
            </div>
          ) : (
            <span
              style={{
                fontSize: "0.82rem",
                color: "var(--text-muted)",
                fontFamily: "var(--font-mono)",
              }}
            >
              —
            </span>
          )}
          <p
            style={{
              marginTop: "0.75rem",
              fontSize: "0.68rem",
              color: "var(--text-muted)",
              fontFamily: "var(--font-mono)",
            }}
          >
            Une page "Recommendations" consolidée arrive bientôt.
          </p>
        </div>
      </div>

      {/* ── Results Table ── */}
      <div style={{ marginBottom: "2rem" }}>
        <div
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "1rem",
            fontWeight: 700,
            color: "var(--text-primary)",
            marginBottom: "1rem",
            letterSpacing: "-0.01em",
          }}
        >
          Résultats par prompt
        </div>
        <div
          style={{
            background: "var(--bg-surface)",
            border: "1.5px solid var(--border)",
            borderRadius: "var(--radius-lg)",
            overflow: "hidden",
            boxShadow: "var(--shadow-sm)",
          }}
        >
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              fontSize: "0.82rem",
            }}
          >
            <thead>
              <tr
                style={{
                  background: "var(--bg-raised)",
                  borderBottom: "1.5px solid var(--border)",
                }}
              >
                {["Catégorie", "Prompt", "Mention", "Position", "Contexte"].map(
                  (h) => (
                    <th
                      key={h}
                      style={{
                        textAlign: "left",
                        padding: "0.9rem 1.25rem",
                        fontSize: "0.6rem",
                        fontWeight: 700,
                        color: "var(--text-muted)",
                        textTransform: "uppercase",
                        letterSpacing: "0.1em",
                        fontFamily: "var(--font-mono)",
                      }}
                    >
                      {h}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody>
              {run.results.map((r, i) => (
                <tr
                  key={r.id}
                  className="run-result-row"
                  style={{
                    borderTop: i === 0 ? "none" : "1px solid var(--border)",
                  }}
                >
                  {" "}
                  <td
                    style={{ padding: "0.9rem 1.25rem", verticalAlign: "top" }}
                  >
                    <span
                      style={{
                        display: "inline-block",
                        fontFamily: "var(--font-mono)",
                        fontSize: "0.62rem",
                        fontWeight: 700,
                        padding: "0.25rem 0.65rem",
                        borderRadius: "99px",
                        background: "var(--bg-raised)",
                        border: "1.5px solid var(--border)",
                        color: "var(--text-secondary)",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {r.prompt.category}
                    </span>
                  </td>
                  <td
                    style={{
                      padding: "0.9rem 1.25rem",
                      color: "var(--text-secondary)",
                      fontFamily: "var(--font-mono)",
                      fontSize: "0.78rem",
                      lineHeight: 1.55,
                      verticalAlign: "top",
                      maxWidth: "280px",
                    }}
                  >
                    {r.prompt.text}
                  </td>
                  <td
                    style={{
                      padding: "0.9rem 1.25rem",
                      verticalAlign: "top",
                      textAlign: "center",
                    }}
                  >
                    {r.isMentioned ? (
                      <span
                        style={{
                          fontSize: "0.7rem",
                          fontWeight: 700,
                          color: "#0d7a4e",
                          background: "#e0f7ee",
                          borderRadius: "99px",
                          padding: "0.2rem 0.6rem",
                          fontFamily: "var(--font-mono)",
                        }}
                      >
                        ✓ oui
                      </span>
                    ) : (
                      <span
                        style={{
                          fontSize: "0.7rem",
                          color: "var(--text-muted)",
                          fontFamily: "var(--font-mono)",
                        }}
                      >
                        —
                      </span>
                    )}
                  </td>
                  <td
                    style={{
                      padding: "0.9rem 1.25rem",
                      verticalAlign: "top",
                      fontFamily: "var(--font-mono)",
                      fontSize: "0.82rem",
                      color: "var(--text-primary)",
                      fontWeight: 600,
                    }}
                  >
                    {r.position ?? "—"}
                  </td>
                  <td
                    style={{
                      padding: "0.9rem 1.25rem",
                      verticalAlign: "top",
                      color: "var(--text-secondary)",
                      fontFamily: "var(--font-mono)",
                      fontSize: "0.75rem",
                      lineHeight: 1.5,
                      maxWidth: "220px",
                    }}
                  >
                    {Array.isArray(r.contextSnippets) &&
                    r.contextSnippets.length
                      ? String(r.contextSnippets[0])
                      : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Raw answers ── */}
      <details
        style={{
          background: "var(--bg-surface)",
          border: "1.5px solid var(--border)",
          borderRadius: "var(--radius-lg)",
          padding: "1.25rem 1.5rem",
          boxShadow: "var(--shadow-sm)",
        }}
      >
        <summary
          style={{
            cursor: "pointer",
            fontSize: "0.82rem",
            fontWeight: 700,
            fontFamily: "var(--font-mono)",
            color: "var(--text-secondary)",
            userSelect: "none",
          }}
        >
          Voir les réponses brutes
        </summary>
        <div
          style={{
            marginTop: "1.25rem",
            display: "flex",
            flexDirection: "column",
            gap: "1rem",
          }}
        >
          {run.results.map((r) => (
            <div
              key={r.id}
              style={{
                background: "var(--bg-raised)",
                border: "1.5px solid var(--border)",
                borderRadius: "var(--radius-md)",
                padding: "1rem 1.25rem",
              }}
            >
              <div
                style={{
                  fontSize: "0.7rem",
                  color: "var(--text-muted)",
                  fontFamily: "var(--font-mono)",
                  marginBottom: "0.6rem",
                }}
              >
                {r.prompt.text}
              </div>
              <pre
                style={{
                  whiteSpace: "pre-wrap",
                  fontSize: "0.78rem",
                  fontFamily: "var(--font-mono)",
                  color: "var(--text-secondary)",
                  lineHeight: 1.6,
                }}
              >
                {r.rawAnswer}
              </pre>
            </div>
          ))}
        </div>
      </details>
    </main>
  );
}
