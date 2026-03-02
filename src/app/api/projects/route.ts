import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { createProjectSchema } from "@/lib/validation/project";
import { generatePrompts } from "@/lib/prompts/generator";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const input = createProjectSchema.parse(body);

    const prompts = generatePrompts({
      domain: input.domain,
      brandName: input.brandName,
      language: input.language,
      sector: input.sector,
    });

    const project = await prisma.project.create({
      data: {
        domain: input.domain,
        brandName: input.brandName,
        language: input.language,
        prompts: {
          create: prompts.map((p) => ({
            text: p.text,
            category: p.category,
            setKey: p.setKey,
          })),
        },
      },
      include: { prompts: true },
    });

    return NextResponse.json({ project }, { status: 201 });
  } catch (err: any) {
    // Zod errors
    if (err?.name === "ZodError") {
      return NextResponse.json(
        { error: "Validation error", details: err.errors },
        { status: 400 },
      );
    }
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function GET() {
  // optionnel: liste des projets (utile si tu veux une page dashboard plus tard)
  const projects = await prisma.project.findMany({
    orderBy: { createdAt: "desc" },
    take: 20,
  });
  return NextResponse.json({ projects });
}
