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
  /** Name der Station. EINZIGE Quelle — Stationsleiste und mobiles
   *  Menü lesen beide daraus. Vorher standen hier zusätzlich
   *  navLabel und navSub mit einer veralteten Gliederung
   *  (Philosophie, Vermögensverwaltung, Über uns); das Menü zeigte
   *  dadurch Stationen an, die es nicht mehr gibt. */
  label: string;
  /** Kurzform für schmale Fenster. Die Leiste kürzt den Namen,
   *  bevor sie die Schrift verkleinert — 12px ist die Untergrenze. */
  labelKurz: string;
  /** true, wenn die Station GANZ dunkel ist. Jede Station ist
   *  entweder ganz hell oder ganz dunkel — dunkle Panels innerhalb
   *  einer hellen Station gibt es nicht mehr. Kopfzeile und
   *  Stationsleiste mischen ihre Schriftfarbe daraus. */
  dunkel: boolean;
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
    key: "hero", label: "Einstieg", labelKurz: "Einstieg", dunkel: false,
    domId: "section-hero",
    imageIds: ["hero-zuerich"],
  },
  {
    key: "philosophie", label: "Wealth Management", labelKurz: "Wealth", dunkel: true,
    domId: "section-anlagephilosophie",
    imageIds: ["sardona"],
  },
  {
    key: "vermoegen", label: "Portfolio", labelKurz: "Portfolio", dunkel: false,
    domId: "section-vermoegensverwaltung",
    imageIds: [],
  },
  {
    key: "strategien", label: "Ihre Vorteile", labelKurz: "Vorteile", dunkel: true,
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
    key: "ueber-uns", label: "Team", labelKurz: "Team", dunkel: false,
    domId: "section-ueber-uns",
    imageIds: [
      "olivier-bill", "marco-ludescher", "rolf-schneider",
      "bryan-honegger", "andreas-truempler", "jasmina-rukavina",
    ],
  },
  {
    key: "kontakt", label: "Kontakt", labelKurz: "Kontakt", dunkel: true,
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
/**
 * Verweise, die AUSSERHALB der Stationsleiste stehen: sie gehören
 * ins Fussband von Station 6 und ins mobile Menü, sonst nirgends.
 * Eine Quelle, damit beide dasselbe führen.
 */
export interface NebenVerweis {
  text: string;
  href: string;
  /** true = eigene Rechtsseite, wird als Overlay geöffnet. */
  legal?: boolean;
  extern?: boolean;
}

export const NEBEN_VERWEISE: readonly NebenVerweis[] = [
  { text: "Solutions", href: "https://solutions.telliancapital.ch", extern: true },
  { text: "LinkedIn", href: "https://www.linkedin.com/company/tellian-capital", extern: true },
  { text: "FAQ", href: "/faq" },
  { text: "Datenschutz", href: "/datenschutz", legal: true },
  { text: "Kundeninformation", href: "/kundeninformation", legal: true },
  { text: "Impressum", href: "/impressum", legal: true },
];

export const SUBPAGE_SECTION_KEY: Readonly<Record<string, string>> = {
  "/vermoegensverwaltung": "vermoegen",
  "/advisory": "vermoegen",
  "/anlagestrategien": "strategien",
  "/portfolio-management": "strategien",
};
