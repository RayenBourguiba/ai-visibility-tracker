"use client";

export default function ExportButtons({ runId }: { runId: string }) {
  const jsonUrl = `/api/runs/${runId}/export?format=json`;
  const csvUrl = `/api/runs/${runId}/export?format=csv`;

  return (
    <div style={{ display: "flex", gap: "0.6rem" }}>
      <a className="btn btn-ghost" href={jsonUrl} target="_blank" rel="noreferrer">
        ↓ JSON
      </a>
      <a className="btn btn-ghost" href={csvUrl} target="_blank" rel="noreferrer">
        ↓ CSV
      </a>
    </div>
  );
}