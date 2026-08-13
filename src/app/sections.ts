/* ═══════════════════════════════════════════════════════════
   TELLIAN CAPITAL — SEKTIONS-REGISTRY (Desktop, horizontaler Track)
   Single source of truth für Anzahl, Reihenfolge und Breite der
   Sektionen. Vorher lagen die Breiten an fünf hartcodierten
   Stellen im JSX verstreut; beide Navigationen rechneten mit
   einer Gesamtbreite, die es nicht gab.
   ═══════════════════════════════════════════════════════════ */

/**
 * Breite der Snap-Sektionen.
 *
 * Bei 94vw bleiben 6vw der Folgesektion sichtbar — das ist der
 * Abstandshalter. Die früheren fünf 4vw-Atemräume zwischen den
 * Sektionen entfallen dadurch ersatzlos.
 */
export const SECTION_WIDTH = "94vw";

/**
 * Sektion 6 (Kontakt) schliesst den Track ab und ist volle
 * Viewportbreite. Dadurch liegt ihr linker Rand exakt auf
 * `maxScroll` — der letzte Rastpunkt ist zugleich das Scrollende.
 */
export const SECTION_WIDTH_LAST = "100vw";

/**
 * `snap` — die Sektion ist genau ein Rastpunkt.
 * `free` — innerhalb der Sektion wird frei gescrollt; gerastet wird
 *          nur an ihren beiden Enden.
 */
export type SectionScroll = "snap" | "free";

export interface SectionDef {
  /** Stabiler Schlüssel, unabhängig von Position und Beschriftung. */
  key: string;
  /** Kurzform für Navigation und Debug-Ausgabe. */
  label: string;
  scroll: SectionScroll;
}

/**
 * Reihenfolge im Track. Der Index ist die Sektionsnummer,
 * auf die sich Rastung und Navigation beziehen.
 */
export const SECTIONS: readonly SectionDef[] = [
  { key: "hero",        label: "Start",        scroll: "snap" },
  { key: "philosophie", label: "Philosophie",  scroll: "snap" },
  { key: "vermoegen",   label: "Mandat",       scroll: "snap" },
  { key: "strategien",  label: "Portfolio",    scroll: "snap" },
  /* TEMPORARY — Team-Filmstrip, inhaltsabgeleitet ~194vw breit
     (60vw Padding + 6 × 21vw + 5 × 24px). Als einzelner Rastpunkt wäre
     rund die Hälfte der Porträts unerreichbar, deshalb freies Scrollen
     innerhalb der Sektion.

     Entfällt mit dem Umbau von Sektion 5 auf zwei Reihen: dann greift
     hier SECTION_WIDTH und scroll wird "snap". Damit verschwindet auch
     der Free-Scroll-Zweig in useHorizontalScroll.ts. */
  { key: "ueber-uns",   label: "Team",         scroll: "free" },
  { key: "kontakt",     label: "Kontakt",      scroll: "snap" },
];

export const SECTION_COUNT = SECTIONS.length;
