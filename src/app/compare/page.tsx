import Link from "next/link";
import { headers } from "next/headers";

async function fetchCompare(runA: string, runB: string) {
  const h = await headers();
  const proto = h.get("x-forwarded-proto") ?? "http";
  const host = h.get("x-forwarded-host") ?? h.get("host");

  if (!host) throw new Error("Missing host header");

  const url = new URL(`${proto}://${host}/api/compare`);
  url.searchParams.set("runA", runA);
  url.searchParams.set("runB", runB);

  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error(`Compare API failed: ${res.status}`);
  return res.json();
}

export default async function ComparePage({
  searchParams,
}: {
  searchParams: Promise<{ runA?: string; runB?: string }>;
}) {
  const { runA = "", runB = "" } = await searchParams;

  if (!runA || !runB) {
    return (
      <main className="mx-auto max-w-4xl p-6">
        <h1 className="text-2xl font-semibold">Compare runs</h1>
        <p className="mt-2 text-gray-600">Utilise: /compare?runA=...&runB=...</p>
      </main>
    );
  }

  const data = await fetchCompare(runA, runB);

  return (
    <main className="mx-auto max-w-6xl p-6">
      <h1 className="text-2xl font-semibold">Compare runs</h1>

      <section className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="rounded-xl border p-4">
          <div className="text-sm text-gray-600">Run A</div>
          <div className="mt-1 font-mono text-sm">{data.runA?.id}</div>
          <div className="mt-2 text-2xl font-semibold">{data.runA?.score}</div>
          <div className="text-sm text-gray-600">
            Mention: {data.runA?.mentionRate}% • {data.runA?.engine}
          </div>
          <div className="mt-3">
            <Link className="underline text-sm" href={`/runs/${data.runA?.id}`}>
              Voir run A
            </Link>
          </div>
        </div>

        <div className="rounded-xl border p-4">
          <div className="text-sm text-gray-600">Run B</div>
          <div className="mt-1 font-mono text-sm">{data.runB?.id}</div>
          <div className="mt-2 text-2xl font-semibold">{data.runB?.score}</div>
          <div className="text-sm text-gray-600">
            Mention: {data.runB?.mentionRate}% • {data.runB?.engine}
          </div>
          <div className="mt-3">
            <Link className="underline text-sm" href={`/runs/${data.runB?.id}`}>
              Voir run B
            </Link>
          </div>
        </div>
      </section>

      <section className="mt-8">
        <h2 className="text-lg font-medium">Top améliorations (Δ score)</h2>
        <div className="mt-3 overflow-hidden rounded-xl border">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-left">
              <tr>
                <th className="px-4 py-3">Δ</th>
                <th className="px-4 py-3">Set</th>
                <th className="px-4 py-3">Prompt</th>
                <th className="px-4 py-3">A</th>
                <th className="px-4 py-3">B</th>
              </tr>
            </thead>
            <tbody>
              {(data.diffsTopImproved || []).map((d: any) => (
                <tr key={d.promptId} className="border-t align-top">
                  <td className="px-4 py-3 font-mono">{d.deltaScore}</td>
                  <td className="px-4 py-3 font-mono text-xs text-gray-600">{d.setKey}</td>
                  <td className="px-4 py-3">{d.prompt}</td>
                  <td className="px-4 py-3 font-mono text-xs">
                    {d.a ? `${d.a.score} (m:${d.a.mentioned ? "y" : "n"} p:${d.a.position ?? "-"})` : "—"}
                  </td>
                  <td className="px-4 py-3 font-mono text-xs">
                    {d.b ? `${d.b.score} (m:${d.b.mentioned ? "y" : "n"} p:${d.b.position ?? "-"})` : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mt-8">
        <h2 className="text-lg font-medium">Nouveaux concurrents (dans B)</h2>
        <div className="mt-3 flex flex-wrap gap-2">
          {(data.newCompetitors || []).length ? (
            (data.newCompetitors || []).map((c: string) => (
              <span key={c} className="rounded-full border px-3 py-1 text-sm">{c}</span>
            ))
          ) : (
            <span className="text-sm text-gray-600">—</span>
          )}
        </div>
      </section>
    </main>
  );
}