import ProjectTrends from "@/components/charts/ProjectTrends";
import LastRunsByEngine from "@/components/projects/LastRunsByEngine";
import { prisma } from "@/lib/db/prisma";
import Link from "next/link";
import { notFound } from "next/navigation";
import ProjectPromptsPanel from "@/components/projects/ProjectPromptsPanel";

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ id?: string }>;
}) {
  const { id } = await params;

  if (!id) return notFound();

  const project = await prisma.project.findUnique({
    where: { id },
    include: {
      prompts: { orderBy: { createdAt: "asc" } },
      runs: { orderBy: { createdAt: "desc" }, take: 10 },
    },
  });

  if (!project) return notFound();

  return (
    <main style={{ maxWidth: "920px", margin: "0 auto", padding: "3rem 2rem" }}>
      {" "}
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
            {project.brandName}
          </h1>
          <p
            style={{
              fontSize: "0.78rem",
              color: "var(--text-secondary)",
              marginTop: "0.35rem",
              fontFamily: "var(--font-mono)",
            }}
          >
            Domaine: {project.domain} • Langue: {project.language}
          </p>
        </div>
        <Link href="/" className="btn btn-ghost">
          + Nouveau projet
        </Link>
      </div>
      <ProjectPromptsPanel
        projectId={project.id}
        language={project.language as "fr" | "en"}
        prompts={project.prompts.map((p) => ({
          id: p.id,
          text: p.text,
          category: p.category,
          setKey: p.setKey,
        }))}
      />{" "}
      <section style={{ marginTop: "2.5rem" }}>
        <LastRunsByEngine projectId={project.id} />
      </section>
      <section style={{ marginTop: "2.5rem" }}>
        <ProjectTrends projectId={project.id} />
      </section>{" "}
      <section style={{ marginTop: "2.5rem", paddingBottom: "4rem" }}>
        <div
          style={{
            background: "var(--bg-surface)",
            border: "1.5px solid var(--border)",
            borderRadius: "var(--radius-lg)",
            padding: "1.75rem 2rem",
            boxShadow: "var(--shadow-sm)",
          }}
        >
          <div
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "1rem",
              fontWeight: 700,
              color: "var(--text-primary)",
              letterSpacing: "-0.01em",
              marginBottom: "0.75rem",
            }}
          >
            Historique des runs
          </div>
          <p
            style={{
              fontSize: "0.78rem",
              color: "var(--text-secondary)",
              fontFamily: "var(--font-mono)",
              marginBottom: "1rem",
            }}
          >
            À la prochaine étape, on ajoute{" "}
            <code style={{ color: "var(--accent)" }}>/api/runs</code> + l'écran
            run.
          </p>
          <div
            style={{
              background: "var(--bg-raised)",
              border: "1.5px solid var(--border)",
              borderRadius: "var(--radius-md)",
              padding: "1rem 1.5rem",
              fontSize: "0.82rem",
              color: "var(--text-muted)",
              fontFamily: "var(--font-mono)",
            }}
          >
            {project.runs.length === 0 ? (
              <p>Aucun run pour le moment.</p>
            ) : (
              <ul
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.5rem",
                }}
              >
                {project.runs.map((r) => (
                  <li
                    key={r.id}
                    style={{ display: "flex", justifyContent: "space-between" }}
                  >
                    <span>{r.engine}</span>
                    <span style={{ color: "var(--text-muted)" }}>
                      {new Date(r.createdAt).toLocaleString()}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
