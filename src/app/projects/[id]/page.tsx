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
    <main className="mx-auto max-w-5xl p-6">
      <div className="flex items-start justify-between gap-6">
        <div>
          <h1 className="text-2xl font-semibold">{project.brandName}</h1>
          <p className="mt-1 text-gray-600">
            Domaine: <span className="font-mono">{project.domain}</span> •
            Langue: <span className="font-mono">{project.language}</span>
          </p>
        </div>

        <div className="flex gap-3">
          <Link
            href="/"
            className="rounded-md bg-black px-4 py-2 text-sm text-white"
          >
            Nouveau projet
          </Link>
        </div>
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
      <section className="mt-10">
        <LastRunsByEngine projectId={project.id} />
      </section>
      <section className="mt-10">
        <ProjectTrends projectId={project.id} />
      </section>
      <section className="mt-10">
        <h2 className="text-lg font-medium">
          Historique des runs (placeholder)
        </h2>
        <p className="mt-2 text-sm text-gray-600">
          À la prochaine étape, on ajoute{" "}
          <span className="font-mono">/api/runs</span> + l’écran run.
        </p>

        <div className="mt-3 rounded-xl border p-4 text-sm text-gray-700">
          {project.runs.length === 0 ? (
            <p>Aucun run pour le moment.</p>
          ) : (
            <ul className="space-y-2">
              {project.runs.map((r) => (
                <li key={r.id} className="flex items-center justify-between">
                  <span className="font-mono">{r.engine}</span>
                  <span className="text-gray-600">
                    {new Date(r.createdAt).toLocaleString()}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </main>
  );
}
