import type { PromptSetKey } from "./sets";

export type PromptCategory =
  | "discovery"
  | "comparison"
  | "alternatives"
  | "pricing"
  | "reviews"
  | "use_cases"
  | "problems"
  | "implementation";

export type PromptTemplate = {
  setKey: PromptSetKey;
  category: PromptCategory;
  // `{{brand}}`, `{{domain}}`, `{{sector}}` placeholders
  text: string;
};

export const PROMPT_TEMPLATES_FR: PromptTemplate[] = [
  { setKey: "core", category: "discovery", text: "Quels sont les meilleurs outils/solutions dans le secteur de {{sector}} ?" },
  { setKey: "core", category: "pricing", text: "Quels sont les modèles de prix dans {{sector}} ? Où se situe {{brand}} ?" },
  { setKey: "core", category: "reviews", text: "Quels avis reviennent le plus sur {{brand}} ? Avantages / inconvénients." },

  { setKey: "buyer_intent", category: "comparison", text: "Je veux acheter une solution de {{sector}}. Quelles 5 solutions recommandes-tu et pourquoi ?" },
  { setKey: "buyer_intent", category: "comparison", text: "Quelle solution choisir entre {{brand}} et ses concurrents si mon critère n°1 est le ROI ?" },

  { setKey: "alternatives", category: "alternatives", text: "Quelles sont les meilleures alternatives à {{brand}} et pourquoi ?" },
  { setKey: "alternatives", category: "alternatives", text: "Si {{brand}} n’existait pas, quelles solutions choisirais-tu ? Classe-les." },

  { setKey: "comparisons", category: "comparison", text: "Compare {{brand}} avec 5 alternatives connues dans {{sector}}. Fais un tableau." },
  { setKey: "comparisons", category: "comparison", text: "Donne un classement top 10 des solutions de {{sector}} avec justification courte." },

  { setKey: "problems", category: "problems", text: "J'ai besoin de résoudre : {{problem}}. Quelles solutions recommandes-tu ?" },

  { setKey: "integration", category: "implementation", text: "Comment intégrer une solution de {{sector}} dans une stack existante ? Checklist." },
  { setKey: "integration", category: "implementation", text: "Quels critères techniques doivent être vérifiés avant d’adopter {{brand}} ?" },
];

export const PROMPT_TEMPLATES_EN: PromptTemplate[] = [
  { setKey: "core", category: "discovery", text: "What are the best tools/solutions in the {{sector}} space?" },
  { setKey: "core", category: "pricing", text: "What are typical pricing models in {{sector}}? Where does {{brand}} fit?" },
  { setKey: "core", category: "reviews", text: "What do users commonly say about {{brand}}? Pros / cons." },

  { setKey: "buyer_intent", category: "comparison", text: "I want to buy a {{sector}} solution. Recommend 5 options and why." },
  { setKey: "buyer_intent", category: "comparison", text: "Which should I choose between {{brand}} and competitors if ROI is the #1 goal?" },

  { setKey: "alternatives", category: "alternatives", text: "What are the best alternatives to {{brand}} and why?" },
  { setKey: "alternatives", category: "alternatives", text: "If {{brand}} didn’t exist, what would you pick? Rank them." },

  { setKey: "comparisons", category: "comparison", text: "Compare {{brand}} with 5 well-known alternatives in {{sector}}. Make a table." },
  { setKey: "comparisons", category: "comparison", text: "Give a top 10 ranking of {{sector}} solutions with brief justification." },

  { setKey: "problems", category: "problems", text: "I need to solve: {{problem}}. What solutions do you recommend?" },

  { setKey: "integration", category: "implementation", text: "How do you integrate a {{sector}} solution into an existing stack? Checklist." },
  { setKey: "integration", category: "implementation", text: "What technical criteria should be checked before adopting {{brand}}?" },
];