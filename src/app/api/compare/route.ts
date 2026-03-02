import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { computeRunScore } from "@/lib/summary/consolidate";

function indexByPrompt(results: any[]) {
  const m = new Map<string, any>();
  for (const r of results) m.set(r.promptId, r);
  return m;
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const runA = url.searchParams.get("runA");
  const runB = url.searchParams.get("runB");

  if (!runA || !runB) {
    return NextResponse.json(
      { error: "runA and runB required" },
      { status: 400 },
    );
  }

  const [A, B] = await Promise.all([
    prisma.run.findUnique({
      where: { id: runA },
      include: { project: true, results: { include: { prompt: true } } },
    }),
    prisma.run.findUnique({
      where: { id: runB },
      include: { project: true, results: { include: { prompt: true } } },
    }),
  ]);

  if (!A || !B)
    return NextResponse.json({ error: "Run not found" }, { status: 404 });

  const scoreA = computeRunScore(A.results);
  const scoreB = computeRunScore(B.results);

  const totalA = A.results.length || 1;
  const totalB = B.results.length || 1;

  const mentionRateA = Math.round(
    (A.results.filter((r: { isMentioned: boolean }) => r.isMentioned).length /
      totalA) *
      100,
  );

  const mentionRateB = Math.round(
    (B.results.filter((r: { isMentioned: boolean }) => r.isMentioned).length /
      totalB) *
      100,
  );
  const mapA = indexByPrompt(A.results);
  const mapB = indexByPrompt(B.results);

  // diff par promptId (on suppose mêmes prompts si même project; sinon intersection)
  const promptIds = Array.from(new Set([...mapA.keys(), ...mapB.keys()]));

  const diffs = promptIds.map((pid) => {
    const a = mapA.get(pid);
    const b = mapB.get(pid);
    return {
      promptId: pid,
      prompt: b?.prompt?.text || a?.prompt?.text || "",
      category: b?.prompt?.category || a?.prompt?.category || "",
      setKey: b?.prompt?.setKey || a?.prompt?.setKey || "",
      a: a
        ? {
            mentioned: a.isMentioned,
            position: a.position,
            score: a.scores?.visibility_score ?? 0,
          }
        : null,
      b: b
        ? {
            mentioned: b.isMentioned,
            position: b.position,
            score: b.scores?.visibility_score ?? 0,
          }
        : null,
      deltaScore:
        (b?.scores?.visibility_score ?? 0) - (a?.scores?.visibility_score ?? 0),
    };
  });

  diffs.sort((x, y) => y.deltaScore - x.deltaScore);

  const competitorsA = new Set(
    A.results
      .flatMap((r) => (Array.isArray(r.competitors) ? r.competitors : []))
      .map(String),
  );
  const competitorsB = new Set(
    B.results
      .flatMap((r) => (Array.isArray(r.competitors) ? r.competitors : []))
      .map(String),
  );

  const newCompetitors = Array.from(competitorsB)
    .filter((c) => !competitorsA.has(c))
    .slice(0, 20);

  return NextResponse.json({
    runA: {
      id: A.id,
      engine: A.engine,
      createdAt: A.createdAt,
      score: scoreA,
      mentionRate: mentionRateA,
    },
    runB: {
      id: B.id,
      engine: B.engine,
      createdAt: B.createdAt,
      score: scoreB,
      mentionRate: mentionRateB,
    },
    diffsTopImproved: diffs.slice(0, 10),
    diffsTopRegressed: diffs.slice(-10).reverse(),
    newCompetitors,
  });
}
