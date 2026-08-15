/* ═══════════════════════════════════════════════════════════
   TELLIAN CAPITAL — SEKTIONS-REGISTRY (Desktop, horizontaler Track)
   Single source of truth für Anzahl, Reihenfolge und Breite der
   Sektionen. Vorher lagen die Breiten an fünf hartcodierten
   Stellen im JSX verstreut; beide Navigationen rechneten mit
   einer Gesamtbreite, die es nicht gab.
   ═══════════════════════════════════════════════════════════ */

import type { ImageId } from "../assets/generated";

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
  /** Stabiler Schlüssel, unabhängig von Position und Beschriftung.
   *  Wird auch als Hash-Fragment in der URL geführt. */
  key: string;
  /** Beschriftung in der Stationsleiste.
   *  Weicht bewusst von navLabel ab: die Leiste benennt Stationen,
   *  das Menü benennt Inhalte. */
  label: string;
  /** Langform — Menü-Overlay. */
  navLabel: string;
  /** Unterzeile im Menü-Overlay. */
  navSub: string;
  /** id des Abschnitts im vertikalen Zweig, für scrollIntoView. */
  domId: string;
  /**
   * Bilder, die diese Sektion zeigt. Grundlage fürs Vorladen der
   * Nachbarsektion — leer, wenn sie ohne Bilder auskommt.
   */
  imageIds: readonly ImageId[];
}

/**
 * Reihenfolge im Track. Der Index ist die Sektionsnummer,
 * auf die sich Rastung und Navigation beziehen.
 */
export const SECTIONS: readonly SectionDef[] = [
  {
    key: "hero", label: "Einstieg",
    navLabel: "Start", navSub: "Einführung",
    domId: "section-hero",
    imageIds: ["hero-zuerich"],
  },
  {
    key: "philosophie", label: "Wealth Management",
    navLabel: "Philosophie", navSub: "Anlagephilosophie",
    domId: "section-anlagephilosophie",
    imageIds: ["sardona"],
  },
  {
    key: "vermoegen", label: "Portfolio",
    navLabel: "Vermögensverwaltung", navSub: "Mandat & Prozess",
    domId: "section-vermoegensverwaltung",
    imageIds: [],
  },
  {
    key: "strategien", label: "Ihre Vorteile",
    navLabel: "Portfolio Management", navSub: "Wie wir investieren",
    domId: "section-anlagestrategien",
    imageIds: [],
  },
  /* Team-Filmstrip, inhaltsabgeleitet ~194vw breit (60vw Padding +
     6 × 21vw + 5 × 24px) und damit die einzige Sektion, die breiter
     als der Viewport ist.

     Das brauchte früher eine Sonderbehandlung: bei Rastung wäre rund
     die Hälfte der Porträts unerreichbar gewesen, also gab es hier
     freies Scrollen als Ausnahme. Seit der Scroll durchgehend frei
     ist, ist die Ausnahme gegenstandslos — die Sektion verhält sich
     wie jede andere, sie ist nur länger.

     Im Redesign verliert sie den Filmstrip und schrumpft auf
     SECTION_WIDTH. Dann ändert sich hier nichts ausser der Breite. */
  {
    key: "ueber-uns", label: "Team",
    navLabel: "Über uns", navSub: "Team & Geschichte",
    domId: "section-ueber-uns",
    imageIds: [
      "olivier-bill", "marco-ludescher", "rolf-schneider",
      "bryan-honegger", "andreas-truempler", "jasmina-rukavina",
    ],
  },
  {
    key: "kontakt", label: "Kontakt",
    navLabel: "Kontakt", navSub: "Gespräch vereinbaren",
    domId: "section-kontakt",
    imageIds: [],
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
