import OpenAI from "openai";
import type { AskInput, AskOutput } from "./types";

const client = new OpenAI({
  apiKey: process.env.PERPLEXITY_API_KEY,
  baseURL: "https://api.perplexity.ai",
});

export async function askPerplexity(input: AskInput): Promise<AskOutput> {
  const model = process.env.PERPLEXITY_MODEL || "sonar";

  const res = await client.chat.completions.create({
    model,
    messages: [
      ...(input.system ? [{ role: "system" as const, content: input.system }] : []),
      { role: "user" as const, content: input.prompt },
    ],
    temperature: 0.2,
  });

  const text = res.choices?.[0]?.message?.content ?? "";
  return { text, meta: { model } };
}