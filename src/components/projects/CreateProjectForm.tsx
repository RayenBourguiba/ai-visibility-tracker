"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type ApiError =
  | { error: string; details?: { message: string }[] }
  | { error: string };

const inputStyle: React.CSSProperties = {
  width: "100%",
  background: "#f5f3ff",
  border: "1.5px solid #ddd8f8",
  borderRadius: "6px",
  color: "#1a1035",
  fontFamily: "'IBM Plex Mono', monospace",
  fontSize: "0.875rem",
  padding: "0.65rem 0.9rem",
  outline: "none",
  transition: "border-color 0.15s, box-shadow 0.15s",
  appearance: "none" as const,
  marginTop: "0.4rem",
};

const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: "0.68rem",
  fontWeight: 600,
  color: "#5b4e8a",
  textTransform: "uppercase",
  letterSpacing: "0.09em",
  marginBottom: "0",
};

export default function CreateProjectForm() {
  const router = useRouter();
  const [domain, setDomain] = useState("");
  const [brandName, setBrandName] = useState("");
  const [language, setLanguage] = useState<"fr" | "en">("fr");
  const [sector, setSector] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [focused, setFocused] = useState<string | null>(null);

  const focusStyle: React.CSSProperties = {
    borderColor: "#6c47ff",
    background: "#fff",
    boxShadow: "0 0 0 3px rgba(108,71,255,0.15)",
  };

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
    <form onSubmit={onSubmit} style={{ maxWidth: "560px", display: "flex", flexDirection: "column", gap: "1.25rem" }}>

      {/* Domaine */}
      <div>
        <label style={labelStyle}>Domaine</label>
        <input
          style={{ ...inputStyle, ...(focused === "domain" ? focusStyle : {}) }}
          placeholder="ex: example.com"
          value={domain}
          onChange={(e) => setDomain(e.target.value)}
          onFocus={() => setFocused("domain")}
          onBlur={() => setFocused(null)}
          required
        />
        <p style={{ marginTop: "0.3rem", fontSize: "0.7rem", color: "#9b8fc0", fontFamily: "'IBM Plex Mono', monospace" }}>
          Sans http(s). Juste le domaine.
        </p>
      </div>

      {/* Nom de marque */}
      <div>
        <label style={labelStyle}>Nom de marque</label>
        <input
          style={{ ...inputStyle, ...(focused === "brand" ? focusStyle : {}) }}
          placeholder="ex: Example"
          value={brandName}
          onChange={(e) => setBrandName(e.target.value)}
          onFocus={() => setFocused("brand")}
          onBlur={() => setFocused(null)}
          required
        />
      </div>

      {/* Langue + Secteur */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
        <div>
          <label style={labelStyle}>Langue</label>
          <div style={{ position: "relative" }}>
            <select
              style={{
                ...inputStyle,
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%235b4e8a' d='M6 8L1 3h10z'/%3E%3C/svg%3E")`,
                backgroundRepeat: "no-repeat",
                backgroundPosition: "right 0.8rem center",
                paddingRight: "2.2rem",
                cursor: "pointer",
                ...(focused === "lang" ? focusStyle : {}),
              }}
              value={language}
              onChange={(e) => setLanguage(e.target.value as "fr" | "en")}
              onFocus={() => setFocused("lang")}
              onBlur={() => setFocused(null)}
            >
              <option value="fr">Français</option>
              <option value="en">English</option>
            </select>
          </div>
        </div>

        <div>
          <label style={labelStyle}>Secteur <span style={{ opacity: 0.5, textTransform: "none", fontSize: "0.65rem" }}>(optionnel)</span></label>
          <input
            style={{ ...inputStyle, ...(focused === "sector" ? focusStyle : {}) }}
            placeholder={language === "fr" ? "ex: assurance, fintech..." : "e.g. insurance, fintech..."}
            value={sector}
            onChange={(e) => setSector(e.target.value)}
            onFocus={() => setFocused("sector")}
            onBlur={() => setFocused(null)}
          />
        </div>
      </div>

      {/* Error */}
      {err && (
        <div style={{
          borderRadius: "6px",
          border: "1.5px solid #fca5a5",
          background: "#fff1f1",
          padding: "0.75rem 1rem",
          fontSize: "0.82rem",
          color: "#c0291e",
          fontFamily: "'IBM Plex Mono', monospace",
        }}>
          {err}
        </div>
      )}

      {/* Submit */}
      <div>
        <button
          type="submit"
          disabled={loading}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.4rem",
            fontFamily: "'IBM Plex Mono', monospace",
            fontSize: "0.82rem",
            fontWeight: 600,
            letterSpacing: "0.03em",
            padding: "0.65rem 1.4rem",
            borderRadius: "6px",
            border: "none",
            cursor: loading ? "not-allowed" : "pointer",
            background: loading ? "#a78bfa" : "#6c47ff",
            color: "#fff",
            boxShadow: "0 2px 8px rgba(108,71,255,0.28)",
            transition: "all 0.15s",
            opacity: loading ? 0.75 : 1,
          }}
        >
          {loading ? "Création..." : "Créer le projet"}
        </button>
      </div>
    </form>
  );
}