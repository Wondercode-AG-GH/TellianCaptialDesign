import { useEffect } from "react";
import { createPortal } from "react-dom";
import type { ReactNode } from "react";

import { C, serif, sans } from "../tokens";
import { EASE } from "../../styles/motion";
import logoHorizontal from "../../assets/logo/Tellian__Imperial purple logo.svg";

interface SubpageOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  /** Small uppercase eyebrow shown above the hero headline */
  eyebrow: string;
  /** Serif headline with optional <em> — JSX allowed */
  headline: ReactNode;
  /** Everything rendered inside the overlay below the hero
   *  (e.g. FLIP anchor area, detail content, footer) */
  children: ReactNode;
}

/**
 * Reusable subpage overlay shell.
 * Renders via React Portal to document.body, animates open/close, handles
 * the sticky top bar with back button, and the hero title block.
 * Each concrete subpage provides its own `children` (stepper/FLIP/detail).
 */
export function SubpageOverlay({
  isOpen,
  onClose,
  eyebrow,
  headline,
  children,
}: SubpageOverlayProps) {
  /* Scroll to top each time overlay opens so long-scroll content starts fresh */
  useEffect(() => {
    if (!isOpen) return;
    const overlay = document.getElementById("tellian-subpage-overlay");
    if (overlay) overlay.scrollTo({ top: 0 });
  }, [isOpen]);

  /* ESC to close */
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, onClose]);

  if (typeof document === "undefined") return null;

  return createPortal(
    <div
      id="tellian-subpage-overlay"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 90,
        backgroundColor: C.bg,
        overflowY: "auto",
        WebkitOverflowScrolling: "touch",
        opacity: isOpen ? 1 : 0,
        pointerEvents: isOpen ? "auto" : "none",
        visibility: isOpen ? "visible" : "hidden",
        transition: `opacity 400ms ease-out, visibility 0s linear ${isOpen ? "0s" : "800ms"}`,
      }}
    >
      {/* ═══ Top Bar (sticky) ═══ */}
      <div
        style={{
          position: "sticky",
          top: 0,
          zIndex: 10,
          backgroundColor: "rgba(249, 249, 247, 0.92)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          borderBottom: `1px solid ${C.line}`,
          height: 56,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 32px",
          opacity: isOpen ? 1 : 0,
          transition: `opacity 300ms ease-out ${isOpen ? "900ms" : "0ms"}`,
        }}
      >
        {/* Dasselbe Logo wie in der Kopfzeile der Hauptseite. Vorher
            stand hier der Schriftzug in Inter gesperrt — weder die
            Wortmarke noch die richtige Schrift. */}
        <img
          src={logoHorizontal}
          alt="Tellian Capital"
          style={{ width: "112px", height: "auto", display: "block" }}
        />
        <button
          onClick={onClose}
          style={{
            background: "transparent", border: "none", cursor: "pointer",
            padding: "10px 4px", minHeight: "44px",
            display: "inline-flex", alignItems: "center", gap: "6px",
            fontFamily: sans, fontSize: "12px", letterSpacing: "0.13em",
            textTransform: "uppercase", color: C.stone,
            transition: "color 300ms ease-out",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = C.dark)}
          onMouseLeave={(e) => (e.currentTarget.style.color = C.stone)}
        >
          <span aria-hidden>←</span>
          <span>Zurück</span>
        </button>
      </div>

      {/* ═══ Kopf — Eyebrow und Titel ═══
          Nur, wenn es etwas zu zeigen gibt. Die Unterseite
          Vermögensverwaltung bringt ihren Titel selbst mit und
          übergibt hier null — der Block stand trotzdem und belegte
          gemessene 120px Innenabstand plus zwei leere Zeilen. */}
      {(eyebrow || headline) && (
      <div
        style={{
          textAlign: "center",
          padding: "80px 48px 40px",
          opacity: isOpen ? 1 : 0,
          transform: isOpen ? "translateY(0)" : "translateY(-12px)",
          transition: `opacity 600ms ease-out ${isOpen ? "500ms" : "0ms"}, transform 600ms ${EASE.standard} ${isOpen ? "500ms" : "0ms"}`,
        }}
      >
        <span
          style={{
            fontFamily: sans, fontSize: "12px", letterSpacing: "0.22em",
            color: C.stone, textTransform: "uppercase", display: "block",
          }}
        >
          {eyebrow}
        </span>
        <h1
          style={{
            fontFamily: serif,
            fontSize: "clamp(40px, 4.5vw, 56px)",
            lineHeight: 1.05, color: C.dark, letterSpacing: "-0.02em",
            margin: "20px 0 0 0", fontWeight: 400,
          }}
        >
          {headline}
        </h1>
      </div>
      )}

      {/* ═══ Custom per-subpage content ═══ */}
      {children}
    </div>,
    document.body
  );
}
