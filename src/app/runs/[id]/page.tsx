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
      results: {
        include: { prompt: true },
        orderBy: { createdAt: "asc" },
      },
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

  const allCompetitors = run.results
    .flatMap((r) =>
      Array.isArray(r.competitors) ? (r.competitors as any[]) : [],
    )
    .map(String);

  /* const topCompetitors = Object.entries(
    allCompetitors.reduce<Record<string, number>>((acc, c) => {
      acc[c] = (acc[c] || 0) + 1;
      return acc;
    }, {}),
  )
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8); */

  return (
    <main className="mx-auto max-w-6xl p-6">
      <div className="flex items-start justify-between gap-6">
        <div>
          <h1 className="text-2xl font-semibold">Run — {run.engine}</h1>
          <p className="mt-1 text-gray-600">
            {run.project.brandName} •{" "}
            <span className="font-mono">{run.project.domain}</span> •{" "}
            {new Date(run.createdAt).toLocaleString()}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <ExportButtons runId={run.id} />
          <Link
            href={`/runs/${run.id}/recommendations`}
            className="rounded-md bg-black px-4 py-2 text-sm text-white"
          >
            Recommendations
          </Link>
          <Link
            href={`/projects/${run.projectId}`}
            className="rounded-md border px-4 py-2 text-sm"
          >
            ← Projet
          </Link>
        </div>{" "}
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
        <div className="rounded-xl border p-4">
          <div className="text-sm text-gray-600">Score global (0-100)</div>
          <div className="mt-1 text-2xl font-semibold">{runScore}</div>
        </div>
      </section>

      <section className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="rounded-xl border p-4">
          <h3 className="text-sm font-medium">
            Concurrents les plus fréquents (avant la marque)
          </h3>
          <div className="mt-3 flex flex-wrap gap-2">
            {topCompetitors.length === 0 ? (
              <span className="text-sm text-gray-600">—</span>
            ) : (
              topCompetitors.map((c) => (
                <span
                  key={c.name}
                  className="rounded-full border px-3 py-1 text-sm"
                >
                  {c.name} <span className="text-gray-500">({c.count})</span>
                </span>
              ))
            )}
          </div>
        </div>

        <div className="rounded-xl border p-4">
          <h3 className="text-sm font-medium">Recommandations (extrait)</h3>
          <ul className="mt-3 space-y-2 text-sm">
            {run.results[0]?.recommendations &&
            Array.isArray(run.results[0].recommendations) ? (
              (run.results[0].recommendations as any[])
                .slice(0, 5)
                .map((rec, idx) => (
                  <li key={idx} className="rounded-lg border p-3">
                    <div className="font-medium">{String(rec.title)}</div>
                    <div className="mt-1 text-gray-600">
                      Impact: {String(rec.impact)} • Effort:{" "}
                      {String(rec.effort)}
                    </div>
                    {Array.isArray(rec.actions) && rec.actions.length ? (
                      <ul className="mt-2 list-disc pl-5 text-gray-700">
                        {rec.actions.slice(0, 3).map((a: any, i: number) => (
                          <li key={i}>{String(a)}</li>
                        ))}
                      </ul>
                    ) : null}
                  </li>
                ))
            ) : (
              <li className="text-gray-600">—</li>
            )}
          </ul>
          <p className="mt-2 text-xs text-gray-500">
            (On affichera bientôt une page “Recommendations” consolidée sur tout
            le run.)
          </p>
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
                  <td className="px-4 py-3 font-mono text-xs text-gray-600">
                    {r.prompt.category}
                  </td>
                  <td className="px-4 py-3">{r.prompt.text}</td>
                  <td className="px-4 py-3">{r.isMentioned ? "✅" : "—"}</td>
                  <td className="px-4 py-3">{r.position ?? "—"}</td>
                  <td className="px-4 py-3 max-w-md">
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

        <details className="mt-6 rounded-xl border p-4">
          <summary className="cursor-pointer text-sm font-medium">
            Voir les réponses brutes
          </summary>
          <div className="mt-4 space-y-4">
            {run.results.map((r) => (
              <div key={r.id} className="rounded-lg border p-3">
                <div className="text-xs text-gray-600">{r.prompt.text}</div>
                <pre className="mt-2 whitespace-pre-wrap text-sm">
                  {r.rawAnswer}
                </pre>
              </div>
            ))}
          </div>
        </details>
      </section>
    </main>
  );
}
