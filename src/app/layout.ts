import type { CSSProperties } from "react";
import type { Breakpoint } from "./components/useBreakpoint";

/* ═══════════════════════════════════════════════════════════
   TELLIAN CAPITAL — RESPONSIVE LAYOUT-KONSTANTEN
   Single source of truth für Text-Spalte und Bildbereich.
   Alle sechs Abschnitte (Hero, Anlagephilosophie,
   Vermögensverwaltung, Anlagestrategien, Über uns, Kontakt)
   teilen exakt diese Werte.
   ═══════════════════════════════════════════════════════════ */

/* ── Per-breakpoint tokens ── */
const TOKENS = {
  desktop: {
    columnWidth: "56vw",
    imageLeft: "44vw",
    breathingSpace: "8vw",
    contentGap: "4vw",
    paddingLeft: "clamp(36px, 5vw, 120px)",
    paddingRight: "4vw",
    paddingTop: "clamp(36px, 5vh, 80px)",
    paddingBottom: "clamp(24px, 3vh, 56px)",
    bodyMaxWidth: "480px",
    sectionWidth: "110vw",
    heroWidth: "110vw",
  },
  tablet: {
    columnWidth: "100%",
    imageLeft: "0",
    breathingSpace: "0px",
    contentGap: "0px",
    paddingLeft: "clamp(32px, 6vw, 80px)",
    paddingRight: "clamp(32px, 6vw, 80px)",
    paddingTop: "clamp(48px, 8vh, 96px)",
    paddingBottom: "clamp(32px, 5vh, 64px)",
    bodyMaxWidth: "580px",
    sectionWidth: "100%",
    heroWidth: "100%",
  },
  mobile: {
    columnWidth: "100%",
    imageLeft: "0",
    breathingSpace: "0px",
    contentGap: "0px",
    paddingLeft: "20px",
    paddingRight: "20px",
    paddingTop: "40px",
    paddingBottom: "32px",
    bodyMaxWidth: "100%",
    sectionWidth: "100%",
    heroWidth: "100%",
  },
} as const;

/* ═══════════════════════════════════════════════════════════
   STANDARDISIERTE VERTIKALE ABSTÄNDE (alle Sections)
   Mit clamp() für Responsive-Skalierung auf kleinen Viewports.
   Max-Werte entsprechen Design-Referenz auf grossen Screens.
   ═══════════════════════════════════════════════════════════ */
export const SPACING = {
  /** Eyebrow → Akzentlinie (Ref: 24px) */
  eyebrowToAccent: "clamp(16px, 2.5vh, 24px)",
  /** Akzentlinie → Headline (Ref: 16px) */
  accentToHeadline: "clamp(10px, 1.5vh, 16px)",
  /** Headline → Body (Ref: 28px) */
  headlineToBody: "clamp(18px, 3vh, 28px)",
  /** Body → CTA (Ref: 32px) */
  bodyToCta: "clamp(20px, 3.5vh, 32px)",
  /** Zwischen Body-Absätzen (Ref: 16px) */
  bodyParagraphGap: "clamp(10px, 1.6vh, 16px)",
} as const;

export type LayoutTokens = (typeof TOKENS)[Breakpoint];

/** Get layout tokens for a given breakpoint */
export function getLayout(bp: Breakpoint): LayoutTokens {
  return TOKENS[bp];
}

/** Legacy static export — kept for backward compat during migration */
export const LAYOUT = TOKENS.desktop;

/**
 * Build CSSProperties for the standard text column at a given breakpoint.
 */
export function getTextColumnStyle(bp: Breakpoint): CSSProperties {
  const t = TOKENS[bp];
  return {
    width: t.columnWidth,
    paddingLeft: t.paddingLeft,
    paddingRight: t.paddingRight,
    paddingTop: t.paddingTop,
    paddingBottom: t.paddingBottom,
  };
}

/** Legacy static export */
export const TEXT_COLUMN_STYLE: CSSProperties = {
  width: LAYOUT.columnWidth,
  paddingLeft: LAYOUT.paddingLeft,
  paddingRight: LAYOUT.paddingRight,
  paddingTop: LAYOUT.paddingTop,
  paddingBottom: LAYOUT.paddingBottom,
};
