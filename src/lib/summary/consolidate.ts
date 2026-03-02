type Rec = {
  title: string;
  impact: "high" | "medium" | "low";
  effort: "high" | "medium" | "low";
  actions: string[];
};

const impactWeight = { high: 3, medium: 2, low: 1 } as const;
const effortWeight = { low: 3, medium: 2, high: 1 } as const;

function norm(s: string) {
  return s.trim().toLowerCase().replace(/\s+/g, " ");
}

export function consolidateRecommendations(results: any[]) {
  const map = new Map<string, Rec & { count: number }>();

  for (const r of results) {
    const recs: Rec[] = Array.isArray(r.recommendations) ? r.recommendations : [];
    for (const rec of recs) {
      const key = norm(rec.title);
      const existing = map.get(key);
      if (!existing) {
        map.set(key, { ...rec, count: 1 });
      } else {
        // merge actions + bump count
        const mergedActions = Array.from(
          new Set([...(existing.actions || []), ...(rec.actions || [])].map((a) => a.trim()).filter(Boolean))
        );
        map.set(key, { ...existing, actions: mergedActions, count: existing.count + 1 });
      }
    }
  }

  const consolidated = Array.from(map.values()).map((r) => {
    const score = impactWeight[r.impact] * 10 + effortWeight[r.effort] * 6 + Math.min(10, r.count);
    return { ...r, score };
  });

  consolidated.sort((a, b) => b.score - a.score);

  return consolidated;
}

export function computeRunScore(results: any[]) {
  // moyenne des visibility_score (si absent => 0)
  const scores = results
    .map((r) => (r.scores && typeof r.scores.visibility_score === "number" ? r.scores.visibility_score : 0))
    .filter((n) => typeof n === "number");

  if (!scores.length) return 0;
  const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
  return Math.round(avg);
}

export function consolidateCompetitors(results: any[]) {
  const all = results
    .flatMap((r) => (Array.isArray(r.competitors) ? r.competitors : []))
    .map((s: any) => String(s))
    .filter(Boolean);

  const counts = all.reduce<Record<string, number>>((acc, c) => {
    acc[c] = (acc[c] || 0) + 1;
    return acc;
  }, {});

  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 12)
    .map(([name, count]) => ({ name, count }));
}