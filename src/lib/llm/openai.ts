import OpenAI from "openai";
import type { AskInput, AskOutput } from "./types";

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function askOpenAI(input: AskInput): Promise<AskOutput> {
  const model = process.env.OPENAI_MODEL || "gpt-4.1-mini";

  const res = await client.responses.create({
    model,
    input: [
      ...(input.system ? [{ role: "system" as const, content: input.system }] : []),
      { role: "user" as const, content: input.prompt },
    ],
  });

  const text = res.output_text ?? "";
  return { text, meta: { model } };
}