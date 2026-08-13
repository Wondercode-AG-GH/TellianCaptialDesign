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
  /** Stabiler Schlüssel, unabhängig von Position und Beschriftung.
   *  Wird auch als Hash-Fragment in der URL geführt. */
  key: string;
  /** Kurzform — untere Leiste und Debug-Ausgabe. */
  label: string;
  /** Langform — Menü-Overlay. */
  navLabel: string;
  /** Unterzeile im Menü-Overlay. */
  navSub: string;
  /** id des Abschnitts im vertikalen Zweig, für scrollIntoView. */
  domId: string;
  scroll: SectionScroll;
}

/**
 * Reihenfolge im Track. Der Index ist die Sektionsnummer,
 * auf die sich Rastung und Navigation beziehen.
 */
export const SECTIONS: readonly SectionDef[] = [
  {
    key: "hero", label: "Start",
    navLabel: "Start", navSub: "Einführung",
    domId: "section-hero", scroll: "snap",
  },
  {
    key: "philosophie", label: "Philosophie",
    navLabel: "Philosophie", navSub: "Anlagephilosophie",
    domId: "section-anlagephilosophie", scroll: "snap",
  },
  {
    key: "vermoegen", label: "Mandat",
    navLabel: "Vermögensverwaltung", navSub: "Mandat & Prozess",
    domId: "section-vermoegensverwaltung", scroll: "snap",
  },
  {
    key: "strategien", label: "Portfolio",
    navLabel: "Portfolio Management", navSub: "Wie wir investieren",
    domId: "section-anlagestrategien", scroll: "snap",
  },
  /* TEMPORARY — Team-Filmstrip, inhaltsabgeleitet ~194vw breit
     (60vw Padding + 6 × 21vw + 5 × 24px). Als einzelner Rastpunkt wäre
     rund die Hälfte der Porträts unerreichbar, deshalb freies Scrollen
     innerhalb der Sektion.

     ENTFÄLLT, sobald Sektion 5 im Redesign den Filmstrip verliert und
     auf SECTION_WIDTH (94vw) schrumpft. Dann wird scroll hier "snap",
     und damit verschwinden auch der Free-Scroll-Zweig in
     useHorizontalScroll.ts (freeScrollStep, freeBounds, freeTargetRef,
     die align-Option von jumpToIndex) sowie der Sonderfall im
     Debug-Overlay. Solange der Filmstrip steht, bleibt die Ausnahme
     nötig — die Sektion ist dann breiter als der Viewport. */
  {
    key: "ueber-uns", label: "Team",
    navLabel: "Über uns", navSub: "Team & Geschichte",
    domId: "section-ueber-uns", scroll: "free",
  },
  {
    key: "kontakt", label: "Kontakt",
    navLabel: "Kontakt", navSub: "Gespräch vereinbaren",
    domId: "section-kontakt", scroll: "snap",
  },
];

export const SECTION_COUNT = SECTIONS.length;

/** Laufende Nummer für die Anzeige — "01" … "06". */
export function sectionOrdinal(index: number): string {
  return String(index + 1).padStart(2, "0");
}

/** Index zu einem Schlüssel, -1 wenn unbekannt. */
export function indexOfSection(key: string | null | undefined): number {
  if (!key) return -1;
  return SECTIONS.findIndex((s) => s.key === key);
}

/**
 * Unterseiten und die Sektion, zu der sie gehören.
 *
 * Wird gebraucht, damit das Schliessen einer Unterseite an der richtigen
 * Stelle landet — auch dann, wenn sie per Deep-Link geöffnet wurde und
 * der Track vorher nie dort war.
 */
export const SUBPAGE_SECTION_KEY: Readonly<Record<string, string>> = {
  "/vermoegensverwaltung": "vermoegen",
  "/anlagestrategien": "strategien",
  "/portfolio-management": "strategien",
};
