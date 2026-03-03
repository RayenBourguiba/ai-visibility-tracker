"use client";

import { useMemo, useState } from "react";
import PromptSetPicker from "./PromptSetPicker";
import RunButton from "./RunButton";

const TAG_STYLES: Record<string, { bg: string; color: string }> = {
  core:           { bg: "#e0f7ee", color: "#0d7a4e" },
  buyer_intent:   { bg: "#e0eeff", color: "#1a5fd4" },
  alternatives:   { bg: "#fff3e0", color: "#b85c00" },
  comparisons:    { bg: "#f3e8ff", color: "#7c2db8" },
  problems:       { bg: "#ffe8e8", color: "#c0291e" },
  integration:    { bg: "#e0f5ff", color: "#0672a8" },
  discovery:      { bg: "#e0f7ee", color: "#0d7a4e" },
  pricing:        { bg: "#fff3e0", color: "#b85c00" },
  reviews:        { bg: "#f3e8ff", color: "#7c2db8" },
  comparison:     { bg: "#e0eeff", color: "#1a5fd4" },
  implementation: { bg: "#e0f5ff", color: "#0672a8" },
};

function Tag({ label }: { label: string }) {
  const s = TAG_STYLES[label] ?? { bg: "var(--bg-raised)", color: "var(--text-secondary)" };
  return (
    <span style={{
      display: "inline-block",
      fontFamily: "var(--font-mono)",
      fontSize: "0.62rem",
      fontWeight: 700,
      letterSpacing: "0.05em",
      padding: "0.2rem 0.6rem",
      borderRadius: "99px",
      background: s.bg,
      color: s.color,
      whiteSpace: "nowrap" as const,
      textTransform: "lowercase" as const,
    }}>
      {label}
    </span>
  );
}

export default function ProjectPromptsPanel({
  projectId,
  language,
  prompts,
}: {
  projectId: string;
  language: "fr" | "en";
  prompts: { id: string; text: string; category: string; setKey: string }[];
}) {
  const [setKey, setSetKey] = useState<string | "ALL">("ALL");

  const filtered = useMemo(() => {
    if (setKey === "ALL") return prompts;
    return prompts.filter((p) => p.setKey === setKey);
  }, [prompts, setKey]);

  return (
    <section style={{ marginTop: "2.5rem" }}>

      {/* Toolbar */}
      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: "0.75rem", marginBottom: "1rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: "1.05rem", fontWeight: 700, color: "var(--text-primary)", letterSpacing: "-0.01em" }}>
            Prompts
          </h2>
          <span style={{
            fontFamily: "var(--font-mono)", fontSize: "0.68rem", fontWeight: 600,
            color: "var(--accent)", background: "rgba(108,71,255,0.08)",
            border: "1px solid rgba(108,71,255,0.18)", borderRadius: "99px", padding: "0.18rem 0.6rem",
          }}>
            {filtered.length}
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
          <PromptSetPicker value={setKey} onChange={setSetKey} language={language} />
          <RunButton projectId={projectId} promptSetKey={setKey === "ALL" ? null : setKey} />
        </div>
      </div>

      {/* Table */}
      <div style={{ border: "1.5px solid var(--border)", borderRadius: "var(--radius-lg)", overflow: "hidden", boxShadow: "var(--shadow-sm)", background: "var(--bg-surface)" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.83rem" }}>
          <thead>
            <tr style={{ background: "var(--bg-raised)", borderBottom: "1.5px solid var(--border)" }}>
              {["Set", "Catégorie", "Prompt"].map((h, i) => (
                <th key={h} style={{
                  textAlign: "left", padding: "0.75rem 1rem",
                  fontSize: "0.62rem", fontWeight: 700, color: "var(--text-muted)",
                  textTransform: "uppercase", letterSpacing: "0.1em",
                  fontFamily: "var(--font-mono)",
                  width: i === 2 ? undefined : i === 0 ? 120 : 130,
                }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((p, i) => (
              <tr
                key={p.id}
                style={{ borderTop: i === 0 ? "none" : "1px solid var(--border)", transition: "background 0.1s" }}
                onMouseEnter={e => (e.currentTarget.style.background = "var(--bg-hover)")}
                onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
              >
                <td style={{ padding: "0.8rem 1rem", verticalAlign: "middle" }}><Tag label={p.setKey} /></td>
                <td style={{ padding: "0.8rem 1rem", verticalAlign: "middle" }}><Tag label={p.category} /></td>
                <td style={{ padding: "0.8rem 1rem", color: "var(--text-secondary)", fontFamily: "var(--font-mono)", fontSize: "0.82rem", lineHeight: 1.55, verticalAlign: "middle" }}>
                  {p.text}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
