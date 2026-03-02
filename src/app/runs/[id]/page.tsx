import { prisma } from "@/lib/db/prisma";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function RunPage({ 
    params 
}: { 
    params: Promise<{ id: string }>
}) {
  const { id } = await params;
  if (!id) return notFound();

  const run = await prisma.run.findUnique({
    where: { id },
    include: {
      project: true,
      results: {
        include: { prompt: true },
        orderBy: { createdAt: "asc" },
      },
    },
  });

  if (!run) return notFound();

  const total = run.results.length || 1;
  const mentioned = run.results.filter((r) => r.isMentioned).length;
  const mentionRate = Math.round((mentioned / total) * 100);

  const avgPos = (() => {
    const positions = run.results.map((r) => r.position).filter((x): x is number => typeof x === "number");
    if (!positions.length) return null;
    return Math.round((positions.reduce((a, b) => a + b, 0) / positions.length) * 10) / 10;
  })();

  return (
    <main className="mx-auto max-w-6xl p-6">
      <div className="flex items-start justify-between gap-6">
        <div>
          <h1 className="text-2xl font-semibold">Run — {run.engine}</h1>
          <p className="mt-1 text-gray-600">
            {run.project.brandName} • <span className="font-mono">{run.project.domain}</span> •{" "}
            {new Date(run.createdAt).toLocaleString()}
          </p>
        </div>

        <Link
          href={`/projects/${run.projectId}`}
          className="rounded-md border px-4 py-2 text-sm"
        >
          ← Retour projet
        </Link>
      </div>

      <section className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border p-4">
          <div className="text-sm text-gray-600">Mention rate</div>
          <div className="mt-1 text-2xl font-semibold">{mentionRate}%</div>
        </div>
        <div className="rounded-xl border p-4">
          <div className="text-sm text-gray-600">Position moyenne (approx)</div>
          <div className="mt-1 text-2xl font-semibold">{avgPos ?? "—"}</div>
        </div>
        <div className="rounded-xl border p-4">
          <div className="text-sm text-gray-600">Status</div>
          <div className="mt-1 text-2xl font-semibold">{run.status}</div>
        </div>
      </section>

      <section className="mt-8">
        <h2 className="text-lg font-medium">Résultats par prompt</h2>
        <div className="mt-3 overflow-hidden rounded-xl border">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-left">
              <tr>
                <th className="px-4 py-3">Catégorie</th>
                <th className="px-4 py-3">Prompt</th>
                <th className="px-4 py-3">Mention</th>
                <th className="px-4 py-3">Position</th>
                <th className="px-4 py-3">Contexte</th>
              </tr>
            </thead>
            <tbody>
              {run.results.map((r) => (
                <tr key={r.id} className="border-t align-top">
                  <td className="px-4 py-3 font-mono text-xs text-gray-600">{r.prompt.category}</td>
                  <td className="px-4 py-3">{r.prompt.text}</td>
                  <td className="px-4 py-3">{r.isMentioned ? "✅" : "—"}</td>
                  <td className="px-4 py-3">{r.position ?? "—"}</td>
                  <td className="px-4 py-3 max-w-md">
                    {Array.isArray(r.contextSnippets) && r.contextSnippets.length
                      ? String(r.contextSnippets[0])
                      : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <details className="mt-6 rounded-xl border p-4">
          <summary className="cursor-pointer text-sm font-medium">Voir les réponses brutes</summary>
          <div className="mt-4 space-y-4">
            {run.results.map((r) => (
              <div key={r.id} className="rounded-lg border p-3">
                <div className="text-xs text-gray-600">{r.prompt.text}</div>
                <pre className="mt-2 whitespace-pre-wrap text-sm">{r.rawAnswer}</pre>
              </div>
            ))}
          </div>
        </details>
      </section>
    </main>
  );
}