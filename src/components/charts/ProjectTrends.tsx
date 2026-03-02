"use client";

import { useEffect, useMemo, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
  CartesianGrid,
} from "recharts";

type Point = {
  runId: string;
  engine: "OPENAI" | "GEMINI" | "PERPLEXITY";
  createdAt: string;
  runScore: number;
  mentionRate: number;
  avgPosition: number | null;
  status: string;
};

function formatDate(d: string) {
  const dt = new Date(d);
  return dt.toLocaleDateString(undefined, { month: "2-digit", day: "2-digit" }) + " " +
    dt.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
}

export default function ProjectTrends({ projectId }: { projectId: string }) {
  const [data, setData] = useState<Point[]>([]);
  const [loading, setLoading] = useState(true);
  const [engine, setEngine] = useState<"ALL" | Point["engine"]>("ALL");
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/projects/${projectId}/summary`);
        const json = await res.json();
        if (!res.ok) throw new Error(json?.error || "Error");
        if (!mounted) return;

        const series: Point[] = (json.series || []).map((p: any) => ({
          ...p,
          createdAt: new Date(p.createdAt).toISOString(),
        }));
        setData(series);
      } catch (e: any) {
        setErr(e?.message || "Erreur");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [projectId]);

  const filtered = useMemo(() => {
    const ok = data.filter((p) => p.status === "SUCCESS");
    if (engine === "ALL") return ok;
    return ok.filter((p) => p.engine === engine);
  }, [data, engine]);

  // Recharts wants a clean x-key; we keep label short
  const chartData = useMemo(
    () =>
      filtered.map((p) => ({
        ...p,
        t: formatDate(p.createdAt),
        avgPosition: p.avgPosition ?? undefined,
      })),
    [filtered]
  );

  if (loading) return <div className="rounded-xl border p-4 text-sm text-gray-600">Chargement…</div>;
  if (err) return <div className="rounded-xl border p-4 text-sm text-red-600">{err}</div>;
  if (data.length === 0)
    return <div className="rounded-xl border p-4 text-sm text-gray-600">Aucun run pour le moment.</div>;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="text-sm font-medium">Évolution dans le temps</div>
          <div className="text-xs text-gray-600">Score global & mention rate (par engine)</div>
        </div>

        <select
          className="rounded-md border px-3 py-2 text-sm"
          value={engine}
          onChange={(e) => setEngine(e.target.value as any)}
        >
          <option value="ALL">Tous</option>
          <option value="OPENAI">OpenAI</option>
          <option value="GEMINI">Gemini</option>
          <option value="PERPLEXITY">Perplexity</option>
        </select>
      </div>

      <div className="rounded-xl border p-4">
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="t" tick={{ fontSize: 12 }} interval="preserveStartEnd" />
              <YAxis yAxisId="left" domain={[0, 100]} tick={{ fontSize: 12 }} />
              <YAxis yAxisId="right" orientation="right" domain={[0, 100]} tick={{ fontSize: 12 }} />
              <Tooltip />
              <Legend />
              <Line yAxisId="left" type="monotone" dataKey="runScore" name="Score global" dot={false} />
              <Line yAxisId="right" type="monotone" dataKey="mentionRate" name="Mention rate (%)" dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <p className="mt-2 text-xs text-gray-500">
          Note: les résultats peuvent varier d’un jour à l’autre selon le modèle et le prompt set.
        </p>
      </div>
    </div>
  );
}