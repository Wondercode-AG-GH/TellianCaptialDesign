import { useState } from "react";

import { C, cormorant, sans } from "../tokens";

/* ═══════════════════════════════════════════════════════════
   KOPFZEILE

   Ersetzt die vertikale Schiene links, die damit entfällt.

   Sie liegt fest am oberen Rand und gilt für alle Stationen —
   deshalb ein eigenes Bauteil und nicht Teil von Station 1,
   auch wenn sie dort als oberes der drei Bänder erscheint.

   Die Navigation zwischen den Stationen trägt die Stationsleiste
   unten; hier stehen nur Marke, Sprache und Portalzugang.
   ═══════════════════════════════════════════════════════════ */

interface Props {
  /** Zurück zur ersten Station. */
  onHome: () => void;
  onLoginClick: () => void;
  /** Erst nach dem Intro einblenden. */
  visible: boolean;
}

export function SiteHeader({ onHome, onLoginClick, visible }: Props) {
  const [lang, setLang] = useState<"DE" | "EN">("DE");
  const [portalHover, setPortalHover] = useState(false);

  return (
    <header
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 140,
        height: "var(--tellian-s1-header-height)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        paddingLeft: "clamp(28px, 3.4vw, 56px)",
        paddingRight: "clamp(28px, 3.4vw, 56px)",
        borderBottom: `1px solid ${C.line}`,
        backgroundColor: C.bg,
        opacity: visible ? 1 : 0,
        transition: "opacity 500ms ease-out",
        pointerEvents: visible ? "auto" : "none",
      }}
    >
      {/* ── Wortmarke ── */}
      <button
        onClick={onHome}
        aria-label="Zur ersten Station"
        style={{
          border: "none",
          background: "transparent",
          padding: 0,
          cursor: "pointer",
          outline: "none",
          fontFamily: cormorant,
          fontSize: "var(--tellian-s1-wordmark-size)",
          fontWeight: 300,
          letterSpacing: "var(--tellian-s1-wordmark-tracking)",
          color: C.ink,
          lineHeight: 1,
          /* Die Sperrung setzt rechts einen Leerraum hinter das letzte
             Zeichen; ohne Ausgleich steht die Marke optisch zu weit
             rechts. */
          textIndent: "0.42em",
          marginLeft: "-0.21em",
        }}
      >
        TELLIAN
      </button>

      {/* ── Sprache und Portal ── */}
      <div style={{ display: "flex", alignItems: "center", gap: "clamp(16px, 1.8vw, 28px)" }}>
        <div
          role="group"
          aria-label="Sprache"
          style={{ display: "flex", alignItems: "center", gap: "8px" }}
        >
          {(["DE", "EN"] as const).map((code, i) => (
            <span key={code} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              {i > 0 && (
                <span aria-hidden style={{ color: C.line, fontSize: "11px" }}>
                  /
                </span>
              )}
              <button
                onClick={() => setLang(code)}
                aria-pressed={lang === code}
                style={{
                  border: "none",
                  background: "transparent",
                  padding: 0,
                  cursor: "pointer",
                  outline: "none",
                  fontFamily: sans,
                  fontSize: "var(--tellian-s1-header-item-size)",
                  letterSpacing: "0.1em",
                  color: lang === code ? C.ink : C.greigeSoft,
                  transition: "color 200ms ease",
                }}
              >
                {code}
              </button>
            </span>
          ))}
        </div>

        <button
          onClick={onLoginClick}
          onMouseEnter={() => setPortalHover(true)}
          onMouseLeave={() => setPortalHover(false)}
          style={{
            fontFamily: sans,
            fontSize: "var(--tellian-s1-header-item-size)",
            letterSpacing: "0.1em",
            color: C.ink,
            background: "transparent",
            border: `1px solid ${portalHover ? C.ink : C.line}`,
            borderRadius: "2px",
            padding: "9px 18px",
            cursor: "pointer",
            outline: "none",
            transition: "border-color 220ms ease",
          }}
        >
          Kundenportal
        </button>
      </div>
    </header>
  );
}
