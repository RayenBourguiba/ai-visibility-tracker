import { prisma } from "@/lib/db/prisma";
import { NextResponse, NextRequest} from "next/server";
import {
  computeRunScore,
  consolidateCompetitors,
  consolidateRecommendations,
} from "@/lib/summary/consolidate";

function toCSV(rows: Record<string, any>[]) {
  const headers = Array.from(new Set(rows.flatMap((r) => Object.keys(r))));
  const escape = (v: any) => {
    const s = v === null || v === undefined ? "" : String(v);
    const needsQuotes = /[",\n]/.test(s);
    const clean = s.replace(/"/g, '""');
    return needsQuotes ? `"${clean}"` : clean;
  };

  return [
    headers.join(","),
    ...rows.map((r) => headers.map((h) => escape(r[h])).join(",")),
  ].join("\n");
}

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  const url = new URL(req.url);
  const format = (url.searchParams.get("format") || "json").toLowerCase();

  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  const run = await prisma.run.findUnique({
    where: { id },
    include: {
      project: true,
      results: { include: { prompt: true }, orderBy: { createdAt: "asc" } },
    },
  });
  if (!run) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const runScore = computeRunScore(run.results);
  const competitors = consolidateCompetitors(run.results);
  const recommendations = consolidateRecommendations(run.results);

  if (format === "csv") {
    const rows = run.results.map((r) => ({
      run_id: run.id,
      engine: run.engine,
      created_at: run.createdAt.toISOString(),
      project_domain: run.project.domain,
      brand: run.project.brandName,
      prompt_category: r.prompt.category,
      prompt: r.prompt.text,
      mentioned: r.isMentioned ? "yes" : "no",
      position: r.position ?? "",
      visibility_score:
        (r.scores as { visibility_score?: number | string } | null)
          ?.visibility_score ?? "",
      top_context: Array.isArray(r.contextSnippets) ? r.contextSnippets[0] : "",
    }));

    const csv = toCSV(rows);
    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="run_${run.id}.csv"`,
      },
    });
  }

  // JSON export (inclut summary consolidé)
  return NextResponse.json({
    run: {
      id: run.id,
      engine: run.engine,
      model: run.model,
      status: run.status,
      createdAt: run.createdAt,
    },
    project: {
      id: run.project.id,
      domain: run.project.domain,
      brandName: run.project.brandName,
      language: run.project.language,
    },
    summary: {
      runScore,
      mentionRate:
        run.results.length === 0
          ? 0
          : Math.round(
              (run.results.filter((r) => r.isMentioned).length /
                run.results.length) *
                100,
            ),
      avgPosition: (() => {
        const positions = run.results
          .map((r) => r.position)
          .filter((x): x is number => typeof x === "number");
        if (!positions.length) return null;
        return (
          Math.round(
            (positions.reduce((a, b) => a + b, 0) / positions.length) * 10,
          ) / 10
        );
      })(),
      topCompetitors: competitors,
      recommendations,
    },
    results: run.results.map((r) => ({
      promptId: r.promptId,
      category: r.prompt.category,
      prompt: r.prompt.text,
      isMentioned: r.isMentioned,
      position: r.position,
      contextSnippets: r.contextSnippets,
      competitors: r.competitors,
      scores: r.scores,
      recommendations: r.recommendations,
      rawAnswer: r.rawAnswer,
    })),
  });
}
