import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

async function createRun(projectId: string, engine: string, promptSetKey?: string) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/api/runs`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ projectId, engine, promptSetKey }),
  });
  return res.ok;
}

export async function POST(req: Request) {
  const secret = req.headers.get("x-cron-secret");
  if (!secret || secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const engine = String(body.engine || "OPENAI");
  const promptSetKey = body.promptSetKey ? String(body.promptSetKey) : undefined;

  const projects = await prisma.project.findMany({ select: { id: true } });

  let ok = 0;
  let failed = 0;

  for (const p of projects) {
    const success = await createRun(p.id, engine, promptSetKey);
    success ? ok++ : failed++;
  }

  return NextResponse.json({ ok, failed, engine, promptSetKey });
}