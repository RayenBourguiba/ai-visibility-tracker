function escapeRegExp(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function basicAnalyze(opts: {
  answer: string;
  brandName: string;
  domain: string;
}) {
  const { answer, brandName, domain } = opts;
  const text = answer || "";

  const brandRe = new RegExp(`\\b${escapeRegExp(brandName)}\\b`, "i");
  const domainRe = new RegExp(escapeRegExp(domain), "i");

  const isMentioned = brandRe.test(text) || domainRe.test(text);

  // Contexte : 1 phrase autour de la 1ère mention
  let contextSnippets: string[] = [];
  if (isMentioned) {
    const idx = text.search(brandRe) >= 0 ? text.search(brandRe) : text.search(domainRe);
    const start = Math.max(0, idx - 160);
    const end = Math.min(text.length, idx + 160);
    contextSnippets = [text.slice(start, end).trim()];
  }

  // Position (approx) : si réponse contient une liste numérotée/bullets, on essaye de détecter le rang
  // (c’est volontairement simple; on fera mieux ensuite via parsing LLM)
  let position: number | null = null;
  const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);
  const listLines = lines.filter((l) => /^(\d+[\).\s]|[-*•]\s)/.test(l));
  if (listLines.length) {
    for (let i = 0; i < listLines.length; i++) {
      if (brandRe.test(listLines[i]) || domainRe.test(listLines[i])) {
        position = i + 1;
        break;
      }
    }
  }

  return {
    isMentioned,
    position,
    contextSnippets,
    competitors: [], // rempli à l’étape suivante (parser amélioré)
    scores: {
      visibilityScore: isMentioned ? (position ? Math.max(0, 100 - (position - 1) * 15) : 60) : 0,
    },
  };
}