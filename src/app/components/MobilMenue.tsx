import { useEffect, useRef } from "react";

import { C, cormorant, sans } from "../tokens";
import { SECTIONS, NEBEN_VERWEISE, sectionOrdinal } from "../sections";
import type { LegalPath } from "./LegalOverlay";
import logoDunkel from "../../assets/logo/tellian-logo-dunkel.svg";

/* ═══════════════════════════════════════════════════════════
   MOBILES MENÜ

   Nur im schmalen Zweig. Auf Desktop gibt es genau zwei
   Navigationselemente — Kopfzeile und Stationsleiste —, ein Overlay
   gehört dort nicht dazu.

   Die sechs Stationsnamen kommen aus der Registry, dieselbe Quelle
   wie die Stationsleiste. Vorher führte das Overlay eine eigene
   Gliederung mit Philosophie, Vermögensverwaltung und Über uns —
   Stationen, die es nicht mehr gibt.

   Darunter Solutions und die rechtlichen Verweise. Auf Desktop
   stehen sie ausschliesslich im Fussband von Station 6; das Menü ist
   der schmale Ersatz dafür, weil es dort keine Stationsleiste gibt.
   ═══════════════════════════════════════════════════════════ */

interface Props {
  offen: boolean;
  onSchliessen: () => void;
  activeIndex: number;
  onNavigate: (index: number) => void;
  onOpenLegal?: (path: LegalPath) => void;
}

export function MobilMenue({
  offen,
  onSchliessen,
  activeIndex,
  onNavigate,
  onOpenLegal,
}: Props) {
  const panelRef = useRef<HTMLDivElement | null>(null);

  /* Solange das Menü offen ist, scrollt die Seite darunter nicht. */
  useEffect(() => {
    if (!offen) return;
    const vorher = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = vorher;
    };
  }, [offen]);

  /* Escape schliesst, und der Fokus bleibt im Panel gefangen —
     sonst tabbte man hinter das Overlay in die verdeckte Seite. */
  useEffect(() => {
    if (!offen) return;
    const auf = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        onSchliessen();
        return;
      }
      if (e.key !== "Tab") return;
      const panel = panelRef.current;
      if (!panel) return;
      const ziele = panel.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled])',
      );
      if (!ziele.length) return;
      const erster = ziele[0];
      const letzter = ziele[ziele.length - 1];
      if (e.shiftKey && document.activeElement === erster) {
        e.preventDefault();
        letzter.focus();
      } else if (!e.shiftKey && document.activeElement === letzter) {
        e.preventDefault();
        erster.focus();
      }
    };
    document.addEventListener("keydown", auf);
    return () => document.removeEventListener("keydown", auf);
  }, [offen, onSchliessen]);

  useEffect(() => {
    if (!offen) return;
    const id = window.setTimeout(() => {
      panelRef.current?.querySelector<HTMLElement>("button, a")?.focus();
    }, 60);
    return () => window.clearTimeout(id);
  }, [offen]);

  const nebenStil: React.CSSProperties = {
    fontFamily: sans,
    fontSize: "13px",
    letterSpacing: "0.02em",
    color: C.accent,
    background: "transparent",
    border: "none",
    padding: "6px 0",
    textAlign: "left",
    textDecoration: "none",
    cursor: "pointer",
  };

  return (
    <div
      ref={panelRef}
      role="dialog"
      aria-modal="true"
      aria-label="Menü"
      className="tellian-menue"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 200,
        backgroundColor: C.bg,
        display: "flex",
        flexDirection: "column",
        opacity: offen ? 1 : 0,
        visibility: offen ? "visible" : "hidden",
        transition: `opacity 280ms ease, visibility 0s linear ${offen ? "0s" : "280ms"}`,
      }}
    >
      {/* Kopf des Menüs — dasselbe Logo, dieselbe Höhe wie die
          Kopfzeile darunter, damit beim Öffnen nichts springt. */}
      <div
        style={{
          height: "var(--tellian-kopf-height)",
          paddingLeft: "var(--tellian-band-pad-x)",
          paddingRight: "var(--tellian-band-pad-x)",
          boxSizing: "border-box",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexShrink: 0,
        }}
      >
        <img
          src={logoDunkel}
          alt="Tellian Capital"
          style={{ height: "var(--tellian-kopf-logo-h)", width: "auto", display: "block" }}
        />
        <button
          type="button"
          onClick={onSchliessen}
          aria-label="Menü schliessen"
          className="tellian-menue-ziel"
          style={{
            background: "transparent",
            border: "none",
            cursor: "pointer",
            width: 44,
            height: 44,
            marginRight: -10,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <svg width="18" height="18" viewBox="0 0 16 16" fill="none" aria-hidden>
            <line x1="1.5" y1="1.5" x2="14.5" y2="14.5" stroke={C.ink} strokeWidth="1.25" strokeLinecap="round" />
            <line x1="14.5" y1="1.5" x2="1.5" y2="14.5" stroke={C.ink} strokeWidth="1.25" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      {/* ── Die sechs Stationen ── */}
      <nav
        aria-label="Stationen"
        style={{
          flex: 1,
          minHeight: 0,
          overflowY: "auto",
          paddingLeft: "var(--tellian-band-pad-x)",
          paddingRight: "var(--tellian-band-pad-x)",
          paddingTop: "clamp(20px, 4vh, 40px)",
          paddingBottom: "clamp(24px, 4vh, 44px)",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {SECTIONS.map((s, i) => {
          const aktiv = activeIndex === i;
          return (
            <button
              key={s.key}
              type="button"
              onClick={() => {
                onNavigate(i);
                onSchliessen();
              }}
              aria-current={aktiv ? "page" : undefined}
              className="tellian-menue-ziel"
              style={{
                display: "flex",
                alignItems: "baseline",
                gap: "14px",
                padding: "clamp(9px, 1.4vh, 14px) 0",
                background: "transparent",
                border: "none",
                textAlign: "left",
                cursor: "pointer",
              }}
            >
              <span
                aria-hidden
                style={{
                  fontFamily: sans,
                  fontSize: "12px",
                  color: C.muted,
                  fontVariantNumeric: "tabular-nums",
                }}
              >
                {sectionOrdinal(i)}
              </span>
              <span
                style={{
                  fontFamily: cormorant,
                  fontSize: "clamp(26px, 6vw, 34px)",
                  fontWeight: 300,
                  lineHeight: 1.15,
                  color: aktiv ? C.ink : C.accent,
                }}
              >
                {s.label}
              </span>
            </button>
          );
        })}

        {/* ── Solutions und Rechtliches ── */}
        <div
          style={{
            marginTop: "auto",
            paddingTop: "clamp(28px, 5vh, 52px)",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
            columnGap: "16px",
          }}
        >
          {NEBEN_VERWEISE.map((v) =>
            v.legal ? (
              <button
                key={v.text}
                type="button"
                onClick={() => {
                  onOpenLegal?.(v.href as LegalPath);
                  onSchliessen();
                }}
                className="tellian-menue-ziel"
                style={nebenStil}
              >
                {v.text}
              </button>
            ) : (
              <a
                key={v.text}
                href={v.href}
                {...(v.extern ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                className="tellian-menue-ziel"
                style={nebenStil}
              >
                {v.text}
              </a>
            ),
          )}
        </div>
      </nav>

      <style>{`
        .tellian-menue-ziel { outline: none; }
        .tellian-menue-ziel:focus-visible {
          outline: 2px solid var(--tellian-muted);
          outline-offset: 3px;
        }
        @media (prefers-reduced-motion: reduce) {
          .tellian-menue { transition: none !important; }
        }
      `}</style>
    </div>
  );
}
