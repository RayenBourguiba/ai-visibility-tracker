import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import type { Prisma } from "@prisma/client";
import { computeRunScore } from "@/lib/summary/consolidate";

type RunWithResults = Prisma.RunGetPayload<{
  include: {
    project: true;
    results: { include: { prompt: true } };
  };
}>;

type RunResult = RunWithResults["results"][number];

function indexByPrompt(results: RunWithResults["results"]) {
  const m = new Map<string, RunResult>();
  for (const r of results) m.set(r.promptId, r);
  return m;
}

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const runAId = url.searchParams.get("runA");
  const runBId = url.searchParams.get("runB");

  if (!runAId || !runBId) {
    return NextResponse.json({ error: "runA and runB required" }, { status: 400 });
  }

  const [A, B] = await Promise.all([
    prisma.run.findUnique({
      where: { id: runAId },
      include: { project: true, results: { include: { prompt: true } } },
    }),
    prisma.run.findUnique({
      where: { id: runBId },
      include: { project: true, results: { include: { prompt: true } } },
    }),
  ]);

  if (!A || !B) return NextResponse.json({ error: "Run not found" }, { status: 404 });

  const runA = A as RunWithResults;
  const runB = B as RunWithResults;

  const scoreA = computeRunScore(runA.results);
  const scoreB = computeRunScore(runB.results);

  const totalA = runA.results.length || 1;
  const totalB = runB.results.length || 1;

  const mentionRateA = Math.round((runA.results.filter((r: RunResult) => r.isMentioned).length / totalA) * 100);
  const mentionRateB = Math.round((runB.results.filter((r: RunResult) => r.isMentioned).length / totalB) * 100);

  const mapA = indexByPrompt(runA.results);
  const mapB = indexByPrompt(runB.results);

  const promptIds = Array.from(new Set([...mapA.keys(), ...mapB.keys()]));

  const diffs = promptIds.map((pid) => {
    const a = mapA.get(pid);
    const b = mapB.get(pid);

    const aScore = (a?.scores as any)?.visibility_score ?? 0;
    const bScore = (b?.scores as any)?.visibility_score ?? 0;

    return {
      promptId: pid,
      prompt: b?.prompt?.text || a?.prompt?.text || "",
      category: (b?.prompt as any)?.category || (a?.prompt as any)?.category || "",
      setKey: (b?.prompt as any)?.setKey || (a?.prompt as any)?.setKey || "",
      a: a ? { mentioned: a.isMentioned, position: a.position, score: aScore } : null,
      b: b ? { mentioned: b.isMentioned, position: b.position, score: bScore } : null,
      deltaScore: bScore - aScore,
    };
  });

  diffs.sort((x, y) => y.deltaScore - x.deltaScore);

  const competitorsA = new Set(
    runA.results
      .flatMap((r: RunResult) => (Array.isArray(r.competitors) ? (r.competitors as any[]) : []))
      .map(String)
  );

  const competitorsB = new Set(
    runB.results
      .flatMap((r: RunResult) => (Array.isArray(r.competitors) ? (r.competitors as any[]) : []))
      .map(String)
  );

  const newCompetitors = Array.from(competitorsB).filter((c) => !competitorsA.has(c)).slice(0, 20);

  return NextResponse.json({
    runA: { id: runA.id, engine: runA.engine, createdAt: runA.createdAt, score: scoreA, mentionRate: mentionRateA },
    runB: { id: runB.id, engine: runB.engine, createdAt: runB.createdAt, score: scoreB, mentionRate: mentionRateB },
    diffsTopImproved: diffs.slice(0, 10),
    diffsTopRegressed: diffs.slice(-10).reverse(),
    newCompetitors,
  });
}