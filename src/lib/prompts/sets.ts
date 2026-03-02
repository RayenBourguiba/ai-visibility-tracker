export type PromptSetKey =
  | "core"
  | "buyer_intent"
  | "alternatives"
  | "comparisons"
  | "problems"
  | "integration";

export const PROMPT_SETS: { key: PromptSetKey; labelFr: string; labelEn: string }[] = [
  { key: "core", labelFr: "Core", labelEn: "Core" },
  { key: "buyer_intent", labelFr: "Intent d’achat", labelEn: "Buyer intent" },
  { key: "alternatives", labelFr: "Alternatives", labelEn: "Alternatives" },
  { key: "comparisons", labelFr: "Comparatifs", labelEn: "Comparisons" },
  { key: "problems", labelFr: "Problèmes", labelEn: "Problems" },
  { key: "integration", labelFr: "Intégration / Implémentation", labelEn: "Integration / Implementation" },
];