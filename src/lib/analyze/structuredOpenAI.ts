import OpenAI from "openai";
import { VisibilityAnalysisSchema } from "./visibilitySchema";

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export type VisibilityAnalysis = {
  brand_mentioned: boolean;
  brand_position: number | null;
  brands_ranked: string[];
  competitors_before: string[];
  context_snippets: string[];
  sentiment: "positive" | "neutral" | "negative" | "mixed";
  why_competitors_before: { competitor: string; reasons: string[] }[];
  recommendations: { title: string; impact: "high" | "medium" | "low"; effort: "high" | "medium" | "low"; actions: string[] }[];
  scores: { visibility_score: number };
};

export async function analyzeVisibilityWithOpenAI(input: {
  language: "fr" | "en";
  brandName: string;
  domain: string;
  prompt: string;
  answer: string;
}): Promise<VisibilityAnalysis> {
  const model = process.env.ANALYZER_OPENAI_MODEL || "gpt-4o-mini";

  const system =
    input.language === "fr"
      ? "Tu es un analyste GEO (visibilité de marque dans les LLMs). Tu extrais un classement de marques citées dans la réponse et des recommandations concrètes d'amélioration de visibilité IA."
      : "You are a GEO analyst (brand visibility in LLMs). Extract ranked brands mentioned and produce concrete recommendations to improve AI visibility.";

  const user =
    input.language === "fr"
      ? `Marque: ${input.brandName}
Domaine: ${input.domain}

Prompt utilisé:
${input.prompt}

Réponse du modèle:
${input.answer}

Tâche:
1) Détecter si la marque OU le domaine est cité.
2) Extraire un ranking de marques/solutions (dans l'ordre d'apparition / importance).
3) Déterminer la position de la marque (1 = première) si elle apparaît, sinon null.
4) Lister les concurrents avant la marque.
5) Donner 2-4 raisons pour chaque concurrent avant.
6) Donner 5-8 recommandations GEO concrètes (titres + actions), priorisées par impact/effort.
7) Donner un score 0-100.
Retourne STRICTEMENT le JSON schema demandé.`
      : `Brand: ${input.brandName}
Domain: ${input.domain}

Prompt used:
${input.prompt}

Model answer:
${input.answer}

Task:
1) Detect if brand OR domain is mentioned.
2) Extract ranked brands/solutions (order of appearance / importance).
3) Compute brand position (1 = first) if present, else null.
4) List competitors before the brand.
5) Give 2-4 reasons for each competitor ahead.
6) Give 5-8 concrete GEO recommendations (titles + actions) with impact/effort.
7) Give a 0-100 score.
Return STRICTLY the required JSON schema.`;

  // Structured Outputs via Responses API (text.format json_schema) :contentReference[oaicite:1]{index=1}
  const res = await client.responses.create({
    model,
    input: [
      { role: "system", content: system },
      { role: "user", content: user },
    ],
    text: {
      format: {
        type: "json_schema",
        name: "visibility_analysis",
        schema: VisibilityAnalysisSchema,
        strict: true,
      },
    },
  });

  const txt = res.output_text || "{}";
  return JSON.parse(txt) as VisibilityAnalysis;
}