import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { ask } from "@/lib/llm";
import type { Engine } from "@/lib/llm/types";
import { basicAnalyze } from "@/lib/analyze/basic";
import { analyzeVisibilityWithOpenAI } from "@/lib/analyze/structuredOpenAI";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const projectId = String(body.projectId || "");
    const engine = String(body.engine || "OPENAI") as Engine;

    if (!projectId) {
      return NextResponse.json(
        { error: "projectId required" },
        { status: 400 },
      );
    }

    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: { prompts: { orderBy: { createdAt: "asc" } } },
    });

    if (!project)
      return NextResponse.json({ error: "Not found" }, { status: 404 });

    const run = await prisma.run.create({
      data: {
        projectId: project.id,
        engine,
        model:
          engine === "OPENAI"
            ? process.env.OPENAI_MODEL
            : engine === "GEMINI"
              ? process.env.GEMINI_MODEL
              : process.env.PERPLEXITY_MODEL,
        status: "RUNNING",
      },
    });

    const system =
      project.language === "fr"
        ? "Tu es un assistant qui répond de façon utile, structurée, et concrète."
        : "You are a helpful assistant. Answer in a structured and concrete way.";

    // Exécution séquentielle (MVP). On parallélisera plus tard si besoin.
    for (const p of project.prompts) {
      const { text: answer } = await ask(engine, { prompt: p.text, system });

      const analysis = await analyzeVisibilityWithOpenAI({
        language: project.language as "fr" | "en",
        brandName: project.brandName,
        domain: project.domain,
        prompt: p.text,
        answer,
      });

      await prisma.result.upsert({
        where: { runId_promptId: { runId: run.id, promptId: p.id } },
        update: {
          rawAnswer: answer,
          isMentioned: analysis.brand_mentioned,
          position: analysis.brand_position,
          contextSnippets: analysis.context_snippets,
          competitors: analysis.competitors_before,
          scores: analysis.scores,
          recommendations: analysis.recommendations,
        },
        create: {
          runId: run.id,
          promptId: p.id,
          rawAnswer: answer,
          isMentioned: analysis.brand_mentioned,
          position: analysis.brand_position,
          contextSnippets: analysis.context_snippets,
          competitors: analysis.competitors_before,
          scores: analysis.scores,
          recommendations: analysis.recommendations,
        },
      });
    }

    await prisma.run.update({
      where: { id: run.id },
      data: { status: "SUCCESS" },
    });

    return NextResponse.json({ runId: run.id }, { status: 201 });
  } catch (err: any) {
    console.error(err);
    // si run a été créé et qu'on veut stocker l'erreur, on améliorera ensuite
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
