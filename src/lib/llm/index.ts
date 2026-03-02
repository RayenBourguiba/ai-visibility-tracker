import type { AskInput, AskOutput, Engine } from "./types";
import { askOpenAI } from "./openai";
import { askGemini } from "./gemini";
import { askPerplexity } from "./perplexity";

export async function ask(engine: Engine, input: AskInput): Promise<AskOutput> {
  switch (engine) {
    case "OPENAI":
      return askOpenAI(input);
    case "GEMINI":
      return askGemini(input);
    case "PERPLEXITY":
      return askPerplexity(input);
    default:
      throw new Error(`Unsupported engine: ${engine}`);
  }
}