import CreateProjectForm from "@/components/projects/CreateProjectForm";
import { prisma } from "@/lib/db/prisma";
import Link from "next/link";

export default async function HomePage() {
  const projects = await prisma.project.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { runs: true, prompts: true } } },
  });

  return (
    <main
      style={{
        minHeight: "100vh",
        backgroundColor: "var(--bg)",
        backgroundImage:
          "radial-gradient(circle, rgba(108,71,255,0.12) 1px, transparent 1px)",
        backgroundSize: "28px 28px",
      }}
    >
      <div
        style={{ maxWidth: 700, margin: "0 auto", padding: "4rem 2rem 6rem" }}
      >
        {/* Header */}
        <div style={{ marginBottom: "2.5rem" }}>
          <h1
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "2.2rem",
              fontWeight: 800,
              color: "var(--text-primary)",
              letterSpacing: "-0.03em",
              lineHeight: 1.1,
            }}
          >
            AI Visibility Tracker
          </h1>
          <p
            style={{
              marginTop: "0.5rem",
              fontSize: "0.82rem",
              color: "var(--text-secondary)",
              fontFamily: "var(--font-mono)",
            }}
          >
            Crée un projet, génère des prompts, puis lance des runs
            (ChatGPT/Gemini/Perplexity) pour mesurer la visibilité.
          </p>
        </div>

        {/* Create form card */}
        <div
          style={{
            background: "var(--bg-surface)",
            border: "1.5px solid var(--border)",
            borderRadius: "var(--radius-lg)",
            padding: "2rem",
            boxShadow: "var(--shadow-sm)",
            marginBottom: "2.5rem",
          }}
        >
          <h2
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "1.1rem",
              fontWeight: 700,
              color: "var(--text-primary)",
              letterSpacing: "-0.01em",
              marginBottom: "1.75rem",
            }}
          >
            Nouveau projet
          </h2>
          <CreateProjectForm />
        </div>

        {/* Projects list */}
        {projects.length > 0 && (
          <div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.6rem",
                marginBottom: "1rem",
              }}
            >
              <h2
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "1.05rem",
                  fontWeight: 700,
                  color: "var(--text-primary)",
                  letterSpacing: "-0.01em",
                }}
              >
                Projets
              </h2>
              <span
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "0.65rem",
                  fontWeight: 600,
                  color: "var(--accent)",
                  background: "rgba(108,71,255,0.08)",
                  border: "1px solid rgba(108,71,255,0.18)",
                  borderRadius: "99px",
                  padding: "0.18rem 0.6rem",
                }}
              >
                {projects.length}
              </span>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "0.75rem",
              }}
            >
              {projects.map((p) => (
                <Link
                  key={p.id}
                  href={`/projects/${p.id}`}
                  style={{ textDecoration: "none" }}
                >
                  <div
                    className="project-card"
                    style={{
                      background: "var(--bg-surface)",
                      border: "1.5px solid var(--border)",
                      borderRadius: "var(--radius-lg)",
                      padding: "1.25rem 1.5rem",
                      boxShadow: "var(--shadow-sm)",
                      display: "flex",
                      flexDirection: "column",
                      gap: "0.75rem",
                      cursor: "pointer",
                      transition: "border-color 0.15s, box-shadow 0.15s",
                    }}
                  >
                    <div>
                      <div
                        style={{
                          fontFamily: "var(--font-display)",
                          fontSize: "0.95rem",
                          fontWeight: 700,
                          color: "var(--text-primary)",
                          letterSpacing: "-0.01em",
                          marginBottom: "0.2rem",
                        }}
                      >
                        {p.brandName}
                      </div>
                      <div
                        style={{
                          fontFamily: "var(--font-mono)",
                          fontSize: "0.72rem",
                          color: "var(--text-muted)",
                        }}
                      >
                        {p.domain} • {p.language}
                      </div>
                    </div>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.5rem",
                      }}
                    >
                      <span
                        style={{
                          fontFamily: "var(--font-mono)",
                          fontSize: "0.62rem",
                          fontWeight: 600,
                          color: "var(--text-muted)",
                          background: "var(--bg-raised)",
                          border: "1.5px solid var(--border)",
                          borderRadius: "99px",
                          padding: "0.22rem 0.65rem",
                        }}
                      >
                        {p._count.prompts} prompts
                      </span>
                      <span
                        style={{
                          fontFamily: "var(--font-mono)",
                          fontSize: "0.62rem",
                          fontWeight: 600,
                          color:
                            p._count.runs > 0
                              ? "var(--accent)"
                              : "var(--text-muted)",
                          background:
                            p._count.runs > 0
                              ? "rgba(108,71,255,0.08)"
                              : "var(--bg-raised)",
                          border: `1.5px solid ${p._count.runs > 0 ? "rgba(108,71,255,0.18)" : "var(--border)"}`,
                          borderRadius: "99px",
                          padding: "0.22rem 0.65rem",
                        }}
                      >
                        {p._count.runs} runs
                      </span>
                      <span
                        style={{
                          marginLeft: "auto",
                          color: "var(--accent)",
                          fontSize: "0.85rem",
                        }}
                      >
                        →
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
