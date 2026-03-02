import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/db/prisma";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
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

  if (!run) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ run });
}