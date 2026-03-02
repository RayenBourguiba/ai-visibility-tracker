"use client";

export default function ExportButtons({ runId }: { runId: string }) {
  const jsonUrl = `/api/runs/${runId}/export?format=json`;
  const csvUrl = `/api/runs/${runId}/export?format=csv`;

  return (
    <div className="flex gap-2">
      <a className="rounded-md border px-3 py-2 text-sm" href={jsonUrl} target="_blank" rel="noreferrer">
        Export JSON
      </a>
      <a className="rounded-md border px-3 py-2 text-sm" href={csvUrl} target="_blank" rel="noreferrer">
        Export CSV
      </a>
    </div>
  );
}