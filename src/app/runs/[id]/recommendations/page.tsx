import { prisma } from "@/lib/db/prisma";
import Link from "next/link";
import { notFound } from "next/navigation";
import { consolidateRecommendations } from "@/lib/summary/consolidate";

export default async function RunRecommendationsPage({ params }: { params: { id: string } }) {
  const run = await prisma.run.findUnique({
    where: { id: params.id },
    include: {
      project: true,
      results: { orderBy: { createdAt: "asc" } },
    },
  });

  if (!run) return notFound();

  const recs = consolidateRecommendations(run.results);

  return (
    <main className="mx-auto max-w-5xl p-6">
      <div className="flex items-start justify-between gap-6">
        <div>
          <h1 className="text-2xl font-semibold">Recommendations (consolidées)</h1>
          <p className="mt-1 text-gray-600">
            {run.project.brandName} • <span className="font-mono">{run.project.domain}</span> • {run.engine}
          </p>
        </div>

        <Link href={`/runs/${run.id}`} className="rounded-md border px-4 py-2 text-sm">
          ← Retour run
        </Link>
      </div>

      <div className="mt-6 space-y-3">
        {recs.length === 0 ? (
          <div className="rounded-xl border p-4 text-sm text-gray-600">Aucune recommandation.</div>
        ) : (
          recs.map((r, idx) => (
            <div key={idx} className="rounded-xl border p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="text-base font-medium">{r.title}</div>
                <div className="text-xs text-gray-600">
                  Impact: {r.impact} • Effort: {r.effort} • Occurrences: {r.count}
                </div>
              </div>

              {Array.isArray(r.actions) && r.actions.length ? (
                <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-gray-800">
                  {r.actions.slice(0, 8).map((a, i) => (
                    <li key={i}>{a}</li>
                  ))}
                </ul>
              ) : null}
            </div>
          ))
        )}
      </div>
    </main>
  );
}