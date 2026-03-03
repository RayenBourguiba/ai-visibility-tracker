import { prisma } from "@/lib/db/prisma";
import Link from "next/link";
import { notFound } from "next/navigation";
import { consolidateRecommendations } from "@/lib/summary/consolidate";

const IMPACT_COLORS: Record<string, { bg: string; color: string }> = {
  high:   { bg: "#ffe8e8", color: "#c0291e" },
  medium: { bg: "#fff3e0", color: "#b85c00" },
  low:    { bg: "#e0f7ee", color: "#0d7a4e" },
};

const EFFORT_COLORS: Record<string, { bg: string; color: string }> = {
  low:    { bg: "#e0f7ee", color: "#0d7a4e" },
  medium: { bg: "#fff3e0", color: "#b85c00" },
  high:   { bg: "#ffe8e8", color: "#c0291e" },
};

function Badge({ label, style }: { label: string; style?: { bg: string; color: string } }) {
  const s = style ?? { bg: "var(--bg-raised)", color: "var(--text-muted)" };
  return (
    <span style={{
      display: "inline-block",
      fontFamily: "var(--font-mono)",
      fontSize: "0.62rem",
      fontWeight: 700,
      letterSpacing: "0.05em",
      padding: "0.22rem 0.65rem",
      borderRadius: "99px",
      background: s.bg,
      color: s.color,
      whiteSpace: "nowrap",
    }}>
      {label}
    </span>
  );
}

export default async function RunRecommendationsPage({
  params,
}: {
  params: Promise<{ id?: string }>;
}) {
  const { id } = await params;
  if (!id) return notFound();

  const run = await prisma.run.findUnique({
    where: { id },
    include: {
      project: true,
      results: { orderBy: { createdAt: "asc" } },
    },
  });

  if (!run) return notFound();

  const recs = consolidateRecommendations(run.results);

  return (
    <main style={{ maxWidth: "960px", margin: "0 auto", padding: "3rem 2rem 5rem" }}>

      {/* ── Header ── */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "1.5rem", marginBottom: "2.5rem" }}>
        <div>
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: "2rem", fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.03em" }}>
            Recommandations
          </h1>
          <p style={{ marginTop: "0.35rem", fontSize: "0.78rem", color: "var(--text-secondary)", fontFamily: "var(--font-mono)" }}>
            {run.project.brandName} • {run.project.domain} • {run.engine}
          </p>
        </div>
        <Link href={`/runs/${run.id}`} className="btn btn-ghost" style={{ fontSize: "0.78rem", flexShrink: 0 }}>
          ← Retour run
        </Link>
      </div>

      {/* ── List ── */}
      {recs.length === 0 ? (
        <div style={{
          background: "var(--bg-surface)", border: "1.5px solid var(--border)",
          borderRadius: "var(--radius-lg)", padding: "1.5rem 2rem",
          fontSize: "0.82rem", color: "var(--text-muted)", fontFamily: "var(--font-mono)",
        }}>
          Aucune recommandation.
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}>
          {recs.map((r, idx) => (
            <div key={idx} style={{
              background: "var(--bg-surface)",
              border: "1.5px solid var(--border)",
              borderRadius: "var(--radius-lg)",
              padding: "1.25rem 1.5rem",
              boxShadow: "var(--shadow-sm)",
            }}>
              {/* Title row */}
              <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: "0.75rem", marginBottom: "0.75rem" }}>
                <div style={{ fontFamily: "var(--font-display)", fontSize: "1rem", fontWeight: 700, color: "var(--text-primary)", letterSpacing: "-0.01em" }}>
                  {r.title}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", flexShrink: 0 }}>
                  <Badge label={`Impact: ${r.impact}`} style={IMPACT_COLORS[r.impact?.toLowerCase()] } />
                  <Badge label={`Effort: ${r.effort}`} style={EFFORT_COLORS[r.effort?.toLowerCase()]} />
                  <Badge label={`×${r.count}`} />
                </div>
              </div>

              {/* Actions */}
              {Array.isArray(r.actions) && r.actions.length > 0 && (
                <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
                  {r.actions.slice(0, 8).map((a, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: "0.6rem" }}>
                      <span style={{ color: "var(--accent)", fontFamily: "var(--font-mono)", fontSize: "0.7rem", marginTop: "0.15rem", flexShrink: 0 }}>→</span>
                      <span style={{ fontSize: "0.82rem", color: "var(--text-secondary)", lineHeight: 1.55 }}>{a}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </main>
  );
}