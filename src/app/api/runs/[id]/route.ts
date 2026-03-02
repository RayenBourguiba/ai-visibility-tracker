import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const run = await prisma.run.findUnique({
    where: { id: params.id },
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