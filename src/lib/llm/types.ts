export type Engine = "OPENAI" | "GEMINI" | "PERPLEXITY";

export type AskInput = {
  prompt: string;
  system?: string;
};

export type AskOutput = {
  text: string;
  meta?: Record<string, any>;
};