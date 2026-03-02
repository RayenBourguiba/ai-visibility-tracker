import { GoogleGenAI } from "@google/genai";
import type { AskInput, AskOutput } from "./types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function askGemini(input: AskInput): Promise<AskOutput> {
  const model = process.env.GEMINI_MODEL || "gemini-2.0-flash";

  const res = await ai.models.generateContent({
    model,
    contents: [
      ...(input.system ? [{ role: "user", parts: [{ text: input.system }] }] : []),
      { role: "user", parts: [{ text: input.prompt }] },
    ],
  });

  const text = res.text ?? "";
  return { text, meta: { model } };
}