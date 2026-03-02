"use client";

import { PROMPT_SETS } from "@/lib/prompts/sets";

export default function PromptSetPicker({
  value,
  onChange,
  language,
}: {
  value: string | "ALL";
  onChange: (v: string | "ALL") => void;
  language: "fr" | "en";
}) {
  return (
    <select
      className="rounded-md border px-3 py-2 text-sm"
      value={value}
      onChange={(e) => onChange(e.target.value as any)}
    >
      <option value="ALL">{language === "fr" ? "Tous les sets" : "All sets"}</option>
      {PROMPT_SETS.map((s) => (
        <option key={s.key} value={s.key}>
          {language === "fr" ? s.labelFr : s.labelEn}
        </option>
      ))}
    </select>
  );
}