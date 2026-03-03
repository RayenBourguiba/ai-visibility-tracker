"use client";

import { useEffect, useMemo, useState } from "react";
import {
  LineChart, Line, XAxis, YAxis, Tooltip,
  ResponsiveContainer, Legend, CartesianGrid,
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

const cardStyle: React.CSSProperties = {
  background: "var(--bg-surface)",
  border: "1.5px solid var(--border)",
  borderRadius: "var(--radius-lg)",
  padding: "1.75rem 2rem",
  boxShadow: "var(--shadow-sm)",
};

const titleStyle: React.CSSProperties = {
  fontFamily: "var(--font-display)",
  fontSize: "1rem",
  fontWeight: 700,
  color: "var(--text-primary)",
  letterSpacing: "-0.01em",
};

const subtitleStyle: React.CSSProperties = {
  fontSize: "0.75rem",
  color: "var(--text-secondary)",
  fontFamily: "var(--font-mono)",
  marginTop: "0.25rem",
};

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
    return () => { mounted = false; };
  }, [projectId]);

  const filtered = useMemo(() => {
    const ok = data.filter((p) => p.status === "SUCCESS");
    return engine === "ALL" ? ok : ok.filter((p) => p.engine === engine);
  }, [data, engine]);

  const chartData = useMemo(
    () => filtered.map((p) => ({
      ...p,
      t: formatDate(p.createdAt),
      avgPosition: p.avgPosition ?? undefined,
    })),
    [filtered]
  );

  // All states render inside the same card shell
  const renderContent = () => {
    if (loading) return (
      <div style={{ fontSize: "0.82rem", color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
        Chargement…
      </div>
    );
    if (err) return (
      <div style={{ fontSize: "0.82rem", color: "#c0291e", fontFamily: "var(--font-mono)" }}>
        {err}
      </div>
    );
    if (data.length === 0) return (
      <div style={{
        background: "var(--bg-raised)",
        border: "1.5px solid var(--border)",
        borderRadius: "var(--radius-md)",
        padding: "1rem 1.5rem",
        fontSize: "0.82rem",
        color: "var(--text-muted)",
        fontFamily: "var(--font-mono)",
      }}>
        Aucun run pour le moment.
      </div>
    );

    return (
      <div style={{
        background: "var(--bg-raised)",
        border: "1.5px solid var(--border)",
        borderRadius: "var(--radius-md)",
        padding: "1.25rem",
      }}>
        <div style={{ height: 320 }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="t" tick={{ fontSize: 11, fontFamily: "var(--font-mono)", fill: "var(--text-muted)" }} interval="preserveStartEnd" />
              <YAxis yAxisId="left" domain={[0, 100]} tick={{ fontSize: 11, fontFamily: "var(--font-mono)", fill: "var(--text-muted)" }} />
              <YAxis yAxisId="right" orientation="right" domain={[0, 100]} tick={{ fontSize: 11, fontFamily: "var(--font-mono)", fill: "var(--text-muted)" }} />
              <Tooltip contentStyle={{ fontFamily: "var(--font-mono)", fontSize: "0.75rem", borderRadius: "var(--radius-sm)", border: "1.5px solid var(--border)" }} />
              <Legend wrapperStyle={{ fontFamily: "var(--font-mono)", fontSize: "0.72rem" }} />
              <Line yAxisId="left" type="monotone" dataKey="runScore" name="Score global" stroke="var(--accent)" strokeWidth={2} dot={false} />
              <Line yAxisId="right" type="monotone" dataKey="mentionRate" name="Mention rate (%)" stroke="#0d7a4e" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <p style={{ marginTop: "0.75rem", fontSize: "0.7rem", color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
          Note: les résultats peuvent varier d'un jour à l'autre selon le modèle et le prompt set.
        </p>
      </div>
    );
  };

  return (
    <div style={cardStyle}>
      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "flex-start", justifyContent: "space-between", gap: "1rem", marginBottom: "1.25rem" }}>
        <div>
          <div style={titleStyle}>Évolution dans le temps</div>
          <div style={subtitleStyle}>Score global & mention rate (par engine)</div>
        </div>
        <select
          value={engine}
          onChange={(e) => setEngine(e.target.value as any)}
          style={{ width: "auto", fontSize: "0.78rem", padding: "0.5rem 2rem 0.5rem 0.8rem" }}
        >
          <option value="ALL">Tous</option>
          <option value="OPENAI">OpenAI</option>
          <option value="GEMINI">Gemini</option>
          <option value="PERPLEXITY">Perplexity</option>
        </select>
      </div>

      {renderContent()}
    </div>
  );
}