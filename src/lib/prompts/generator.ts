import { PROMPT_TEMPLATES_EN, PROMPT_TEMPLATES_FR, PromptTemplate } from "./templates";
import type { PromptSetKey } from "./sets";

type GeneratePromptsInput = {
  domain: string;
  brandName: string;
  language: "fr" | "en";
  sector?: string; // pour MVP: optionnel, sinon "ce secteur"
};

const DEFAULT_SECTOR = {
  fr: "ce secteur",
  en: "this space",
};

const DEFAULT_PROBLEMS = {
  fr: [
    "générer des leads qualifiés",
    "automatiser des tâches répétitives",
    "améliorer la visibilité marketing",
    "réduire les coûts opérationnels",
    "mieux analyser les données",
  ],
  en: [
    "generate qualified leads",
    "automate repetitive tasks",
    "improve marketing visibility",
    "reduce operational costs",
    "analyze data more effectively",
  ],
};

function fillTemplate(text: string, vars: Record<string, string>) {
  return text.replace(/{{(\w+)}}/g, (_, key) => vars[key] ?? `{{${key}}}`);
}

export function generatePrompts(input: GeneratePromptsInput) {
  const templates: PromptTemplate[] =
    input.language === "fr" ? PROMPT_TEMPLATES_FR : PROMPT_TEMPLATES_EN;

  const sector = input.sector?.trim() || DEFAULT_SECTOR[input.language];

  const problems = DEFAULT_PROBLEMS[input.language];

  const baseVars = {
    brand: input.brandName,
    domain: input.domain,
    sector,
  };

  const out: { text: string; category: string; setKey: PromptSetKey }[] = [];

  for (const t of templates) {
    if (t.text.includes("{{problem}}")) {
      for (const p of problems.slice(0, 3)) {
        out.push({
          setKey: t.setKey,
          category: t.category,
          text: fillTemplate(t.text, { ...baseVars, problem: p }),
        });
      }
    } else {
      out.push({
        setKey: t.setKey,
        category: t.category,
        text: fillTemplate(t.text, baseVars),
      });
    }
  }

  const extra =
    input.language === "fr"
      ? [
          `Que sais-tu sur ${input.brandName} (${input.domain}) ?`,
          `Cite des ressources fiables à propos de ${input.brandName}.`,
        ]
      : [
          `What do you know about ${input.brandName} (${input.domain})?`,
          `List reliable sources about ${input.brandName}.`,
        ];

  for (const e of extra) out.push({ setKey: "core", category: "discovery", text: e });

  // Dédupe simple
  const seen = new Set<string>();
  return out.filter((p) => {
    const key = p.text.toLowerCase().trim();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}