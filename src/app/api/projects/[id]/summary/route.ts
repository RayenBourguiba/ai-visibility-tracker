import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { computeRunScore } from "@/lib/summary/consolidate";

type Ctx = { params: Promise<{ id: string }> }; 

export async function GET(_req: Request, ctx: Ctx) {
  const { id } = await ctx.params; 

  if (!id) {
    return NextResponse.json({ error: "Missing id" }, { status: 400 });
  }

  const project = await prisma.project.findUnique({
    where: { id },
    include: {
      runs: {
        orderBy: { createdAt: "asc" },
        include: { results: true },
      },
    },
  });

  if (!project) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const series = project.runs.map((run) => {
    const total = run.results.length || 0;
    const mentioned = run.results.filter((r) => r.isMentioned).length;
    const mentionRate = total === 0 ? 0 : Math.round((mentioned / total) * 100);

    const positions = run.results
      .map((r) => r.position)
      .filter((x): x is number => typeof x === "number");

    const avgPosition =
      positions.length === 0
        ? null
        : Math.round((positions.reduce((a, b) => a + b, 0) / positions.length) * 10) / 10;

    const runScore = computeRunScore(run.results);

    return {
      runId: run.id,
      engine: run.engine,
      createdAt: run.createdAt,
      runScore,
      mentionRate,
      avgPosition,
      status: run.status,
    };
  });

  const engines = ["OPENAI", "GEMINI", "PERPLEXITY"] as const;
  const lastByEngine = engines.map((e) => {
    const runs = series
      .filter((s) => s.engine === e)
      .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
    return runs[0] ?? null;
  });

  return NextResponse.json({
    project: {
      id: project.id,
      domain: project.domain,
      brandName: project.brandName,
      language: project.language,
    },
    series,
    lastByEngine,
  });
}