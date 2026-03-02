"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type ApiError =
  | { error: string; details?: { message: string }[] }
  | { error: string };

export default function CreateProjectForm() {
  const router = useRouter();
  const [domain, setDomain] = useState("");
  const [brandName, setBrandName] = useState("");
  const [language, setLanguage] = useState<"fr" | "en">("fr");
  const [sector, setSector] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setLoading(true);

    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ domain, brandName, language, sector: sector || undefined }),
      });

      if (!res.ok) {
        const data = (await res.json()) as ApiError;
        const msg =
          "details" in data && data.details?.length
            ? data.details[0].message
            : ("error" in data ? data.error : "Erreur");
        setErr(msg);
        return;
      }

      const data = await res.json();
      router.push(`/projects/${data.project.id}`);
    } catch {
      setErr("Erreur réseau.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="max-w-xl space-y-4">
      <div>
        <label className="block text-sm font-medium">Domaine</label>
        <input
          className="mt-1 w-full rounded-md border px-3 py-2"
          placeholder="ex: example.com"
          value={domain}
          onChange={(e) => setDomain(e.target.value)}
          required
        />
        <p className="mt-1 text-xs text-gray-500">Sans http(s). Juste le domaine.</p>
      </div>

      <div>
        <label className="block text-sm font-medium">Nom de marque</label>
        <input
          className="mt-1 w-full rounded-md border px-3 py-2"
          placeholder="ex: Example"
          value={brandName}
          onChange={(e) => setBrandName(e.target.value)}
          required
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium">Langue</label>
          <select
            className="mt-1 w-full rounded-md border px-3 py-2"
            value={language}
            onChange={(e) => setLanguage(e.target.value as "fr" | "en")}
          >
            <option value="fr">Français</option>
            <option value="en">English</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium">Secteur (optionnel)</label>
          <input
            className="mt-1 w-full rounded-md border px-3 py-2"
            placeholder={language === "fr" ? "ex: assurance, fintech..." : "e.g. insurance, fintech..."}
            value={sector}
            onChange={(e) => setSector(e.target.value)}
          />
        </div>
      </div>

      {err && <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">{err}</div>}

      <button
        type="submit"
        disabled={loading}
        className="rounded-md bg-black px-4 py-2 text-white disabled:opacity-60"
      >
        {loading ? "Création..." : "Créer le projet"}
      </button>
    </form>
  );
}