export const VisibilityAnalysisSchema = {
  type: "object",
  additionalProperties: false,
  properties: {
    brand_mentioned: { type: "boolean" },
    brand_position: { type: ["integer", "null"] },
    brands_ranked: {
      type: "array",
      items: { type: "string" },
    },
    competitors_before: {
      type: "array",
      items: { type: "string" },
    },
    context_snippets: {
      type: "array",
      items: { type: "string" },
    },
    sentiment: {
      type: "string",
      enum: ["positive", "neutral", "negative", "mixed"],
    },
    why_competitors_before: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          competitor: { type: "string" },
          reasons: { type: "array", items: { type: "string" } },
        },
        required: ["competitor", "reasons"],
      },
    },
    recommendations: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          title: { type: "string" },
          impact: { type: "string", enum: ["high", "medium", "low"] },
          effort: { type: "string", enum: ["high", "medium", "low"] },
          actions: { type: "array", items: { type: "string" } },
        },
        required: ["title", "impact", "effort", "actions"],
      },
    },
    scores: {
      type: "object",
      additionalProperties: false,
      properties: {
        visibility_score: { type: "integer", minimum: 0, maximum: 100 },
      },
      required: ["visibility_score"],
    },
  },
  required: [
    "brand_mentioned",
    "brand_position",
    "brands_ranked",
    "competitors_before",
    "context_snippets",
    "sentiment",
    "why_competitors_before",
    "recommendations",
    "scores",
  ],
} as const;