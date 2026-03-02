"use client";

import { useMemo, useState } from "react";
import PromptSetPicker from "./PromptSetPicker";
import RunButton from "./RunButton";

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
    <section className="mt-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-medium">Prompts ({filtered.length})</h2>
        <div className="flex items-center gap-3">
          <PromptSetPicker value={setKey} onChange={setSetKey} language={language} />
          <RunButton projectId={projectId} promptSetKey={setKey === "ALL" ? null : setKey} />
        </div>
      </div>

      <div className="mt-3 overflow-hidden rounded-xl border">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left">
            <tr>
              <th className="px-4 py-3">Set</th>
              <th className="px-4 py-3">Catégorie</th>
              <th className="px-4 py-3">Prompt</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((p) => (
              <tr key={p.id} className="border-t">
                <td className="px-4 py-3 font-mono text-xs text-gray-600">{p.setKey}</td>
                <td className="px-4 py-3 font-mono text-xs text-gray-600">{p.category}</td>
                <td className="px-4 py-3">{p.text}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}