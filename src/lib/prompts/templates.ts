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
  category: PromptCategory;
  // `{{brand}}`, `{{domain}}`, `{{sector}}` placeholders
  text: string;
};

export const PROMPT_TEMPLATES_FR: PromptTemplate[] = [
  { category: "discovery", text: "Quels sont les meilleurs outils/solutions dans le secteur de {{sector}} ?" },
  { category: "comparison", text: "Compare {{brand}} avec 5 alternatives connues dans le secteur de {{sector}}." },
  { category: "alternatives", text: "Quelles sont les meilleures alternatives à {{brand}} et pourquoi ?" },
  { category: "pricing", text: "Quels sont les prix typiques des solutions de {{sector}} ? Où se situe {{brand}} ?" },
  { category: "reviews", text: "Quels avis reviennent le plus sur {{brand}} ? Avantages / inconvénients." },
  { category: "use_cases", text: "Dans quels cas utiliser {{brand}} plutôt qu'un concurrent ? Donne des exemples." },
  { category: "problems", text: "J'ai besoin de résoudre ce problème : {{problem}}. Quelles solutions recommandes-tu ?" },
  { category: "implementation", text: "Comment choisir une solution de {{sector}} ? Donne une checklist de critères." },
];

export const PROMPT_TEMPLATES_EN: PromptTemplate[] = [
  { category: "discovery", text: "What are the best tools/solutions in the {{sector}} space?" },
  { category: "comparison", text: "Compare {{brand}} with 5 well-known alternatives in {{sector}}." },
  { category: "alternatives", text: "What are the best alternatives to {{brand}} and why?" },
  { category: "pricing", text: "What are typical pricing models in {{sector}}? Where does {{brand}} fit?" },
  { category: "reviews", text: "What do users commonly say about {{brand}}? Pros / cons." },
  { category: "use_cases", text: "When should someone choose {{brand}} over competitors? Give examples." },
  { category: "problems", text: "I need to solve: {{problem}}. What solutions do you recommend?" },
  { category: "implementation", text: "How do you choose a {{sector}} solution? Provide a decision checklist." },
];