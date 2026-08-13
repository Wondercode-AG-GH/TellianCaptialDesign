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

export interface SectionDef {
  /** Stabiler Schlüssel, unabhängig von Position und Beschriftung. */
  key: string;
  /** Kurzform für Navigation und Debug-Ausgabe. */
  label: string;
}

/**
 * Reihenfolge im Track. Der Index ist die Sektionsnummer,
 * auf die sich Rastung und Navigation beziehen.
 */
export const SECTIONS: readonly SectionDef[] = [
  { key: "hero",        label: "Start" },
  { key: "philosophie", label: "Philosophie" },
  { key: "vermoegen",   label: "Mandat" },
  { key: "strategien",  label: "Portfolio" },
  { key: "ueber-uns",   label: "Team" },
  { key: "kontakt",     label: "Kontakt" },
];

export const SECTION_COUNT = SECTIONS.length;
