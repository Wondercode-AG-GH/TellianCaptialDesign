/* ═══════════════════════════════════════════════════════════
   ANLAGESTRATEGIEN — Content shared between:
   • Section4Anlagestrategien overview (main page)
   • /anlagestrategien sub-page (detail view)
   ═══════════════════════════════════════════════════════════ */

export interface AnlagestrategienSection {
  /** Key used as layoutId for the FLIP anchor */
  key: "topdown" | "bottomup";
  /** Short title (the word that FLIPs — e.g. "Top-Down") */
  title: string;
  /** Eyebrow on the detail page */
  detailEyebrow: string;
  /** Sub-line that sits beneath the FLIP'd title on the detail page */
  detailSubline: string;
  /** Paragraphs rendered in the body of the detail page */
  detailBody: string[];
  /** Bullet list (em-dash prefixed) */
  detailBullets: string[];
  /** Optional closing paragraph */
  detailClosing?: string;
}

export const ANLAGESTRATEGIEN_SECTIONS: AnlagestrategienSection[] = [
  {
    key: "topdown",
    title: "Top-Down",
    detailEyebrow: "Globale Perspektive",
    detailSubline: "Makroanalyse mit Horizont 3–5 Jahre",
    detailBody: [
      "Die Top-Down-Analyse beginnt mit dem grossen Ganzen. Wir betrachten globale Konjunkturzyklen, geldpolitische Rahmenbedingungen und die systematische Bewertung einzelner Anlageklassen.",
      "Auf dieser Basis entsteht die strategische Vermögensallokation — die langfristige Zielgewichtung Ihres Portfolios nach Anlageklassen. Diese Allokation ist der Kern jeder Anlageentscheidung.",
      "Wir fragen:",
    ],
    detailBullets: [
      "In welchem Regime befinden sich die Märkte?",
      "Welche Anlageklassen sind fundamental attraktiv bewertet?",
      "Wie korrelieren sie miteinander in unterschiedlichen Marktphasen?",
      "Welche Diversifikation über Regionen, Sektoren und Trends trägt das Portfolio?",
    ],
    detailClosing:
      "Die Antworten definieren Ihren strategischen Anker. Er ändert sich selten — weil die Grundlagen sich selten ändern.",
  },
  {
    key: "bottomup",
    title: "Bottom-Up",
    detailEyebrow: "Einzeltitel-Perspektive",
    detailSubline: "Quantitative Selektion und taktische Positionen",
    detailBody: [
      "Die Bottom-Up-Analyse wählt die konkreten Positionen aus, die den strategischen Rahmen füllen. Hier arbeiten unsere quantitativen Modelle: Screening über Aktien, Anleihen und alternative Anlagen — basierend auf fundamentalen Kennzahlen, technischen Signalen und Marktpsychologie.",
      "Zusätzlich nutzen wir taktische Allokation, um kurzfristige Marktchancen zu ergreifen oder Risiken zu reduzieren. Das Anlagekomitee entscheidet monatlich über Abweichungen vom strategischen Kern.",
      "Unser Prozess:",
    ],
    detailBullets: [
      "Screening über das gesamte Investmentuniversum",
      "Bewertungsmodelle basierend auf fundamentalen und technischen Faktoren",
      "Integration von Marktpsychologie und Trendanalyse",
      "Taktische Über- und Untergewichtung innerhalb der strategischen Bandbreiten",
    ],
    detailClosing:
      "So verbinden sich Stabilität und Opportunität: der strategische Kern trägt das Portfolio, die taktischen Positionen nutzen den Moment.",
  },
];
