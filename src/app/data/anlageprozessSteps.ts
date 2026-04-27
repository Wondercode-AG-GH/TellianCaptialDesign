/* ═══════════════════════════════════════════════════════════
   ANLAGEPROZESS — 5-Step sequence shared between:
   • Vermögensverwaltung section on the main page (overview)
   • /vermoegensverwaltung sub-page (detail view)
   ═══════════════════════════════════════════════════════════ */

export interface AnlageprozessStep {
  /** Ordinal "01" .. "05" */
  num: string;
  /** Short title — used in the side navigation + stepper */
  title: string;
  /** Short description — used on the main-page timeline */
  desc: string;
  /** Accent = "Tellian Capital takes over" (steps 03-05) */
  accent: boolean;
  /** Single-word label for the detail-page stepper */
  shortLabel: string;
  /** Eyebrow on the detail page (may include the "übernimmt" note) */
  detailEyebrow: string;
  /** H1 on the detail page */
  detailHeadline: string;
  /** Subline under headline on the detail page */
  detailSubline: string;
  /** Body paragraphs (each rendered as <p>) */
  detailBody: string[];
  /** Bullet list (em-dash prefixed) */
  detailBullets: string[];
  /** Closing paragraph shown after the bullet list */
  detailClosing?: string;
  /** Whether this step shows a "Gespräch vereinbaren" CTA at the end */
  showCta: boolean;
}

export const ANLAGEPROZESS_STEPS: AnlageprozessStep[] = [
  {
    num: "01",
    title: "Ihre Ziele definieren",
    desc: "Anlageziele, Zeithorizont und Erwartungen klären",
    accent: false,
    shortLabel: "Ziele",
    detailEyebrow: "Schritt 01",
    detailHeadline: "Ihre Ziele definieren",
    detailSubline: "Anlageziele, Zeithorizont und Erwartungen klären",
    detailBody: [
      "Am Anfang steht das Gespräch. Wir wollen verstehen, was Sie mit Ihrem Vermögen erreichen möchten.",
      "Dabei klären wir drei Fragen:",
    ],
    detailBullets: [
      "Was ist Ihr Anlageziel? (Vermögenserhalt, Wachstum, Einkommen)",
      "Wie lange ist Ihr Anlagehorizont?",
      "Welche Erwartungen haben Sie an Rendite und Risiko?",
    ],
    detailClosing:
      "Diese Grundlagen bestimmen alles, was danach kommt.",
    showCta: true,
  },
  {
    num: "02",
    title: "Risikotoleranz & Eignung",
    desc: "Finanzielle Gesamtsituation und Anlegerprofil prüfen",
    accent: false,
    shortLabel: "Risiko",
    detailEyebrow: "Schritt 02",
    detailHeadline: "Risikotoleranz & Eignung",
    detailSubline: "Finanzielle Gesamtsituation und Anlegerprofil prüfen",
    detailBody: [
      "Bevor wir investieren, prüfen wir Ihre finanzielle Gesamtsituation. Sie ist die Basis für jede spätere Entscheidung.",
      "Wir analysieren:",
    ],
    detailBullets: [
      "Ihre Einkommens- und Vermögenssituation",
      "Bestehende Verpflichtungen und Liquiditätsbedarf",
      "Ihre Erfahrung mit Finanzanlagen",
      "Ihre persönliche Risikofähigkeit und Risikobereitschaft",
    ],
    detailClosing:
      "Das Ergebnis ist Ihr individuelles Anlegerprofil. Es definiert den Rahmen, innerhalb dessen wir für Sie arbeiten.",
    showCta: false,
  },
  {
    num: "03",
    title: "Investmentuniversum filtern",
    desc: "Quantitative Modelle und systematische Selektion",
    accent: true,
    shortLabel: "Universum",
    detailEyebrow: "Schritt 03 — Tellian Capital übernimmt",
    detailHeadline: "Investmentuniversum filtern",
    detailSubline: "Quantitative Modelle und systematische Selektion",
    detailBody: [
      "Ab hier arbeiten unsere Modelle. Wir filtern das globale Investmentuniversum systematisch nach quantitativen Kriterien.",
      "Unser Prozess:",
    ],
    detailBullets: [
      "Analyse der globalen Finanzmärkte und Makroindikatoren",
      "Screening über alle Anlageklassen (Aktien, Anleihen, Alternative)",
      "Quantitative und qualitative Bewertung der Anlagen",
      "Ausschluss von Positionen, die unsere Risikokriterien nicht erfüllen",
    ],
    detailClosing:
      "Das Ergebnis: ein reduziertes, qualitätsgeprüftes Universum, aus dem wir Ihr Portfolio zusammenstellen.",
    showCta: false,
  },
  {
    num: "04",
    title: "Vermögensallokation",
    desc: "Strategische und taktische Verteilung über Anlageklassen",
    accent: true,
    shortLabel: "Allokation",
    detailEyebrow: "Schritt 04",
    detailHeadline: "Vermögensallokation",
    detailSubline: "Strategische und taktische Verteilung über Anlageklassen",
    detailBody: [
      "Die strategische Allokation ist die wichtigste Entscheidung im Anlageprozess. Sie bestimmt, wie Ihr Vermögen über Anlageklassen, Regionen und Sektoren verteilt wird.",
      "Zwei Ebenen:",
    ],
    detailBullets: [
      "Strategische Allokation: langfristige Zielgewichtung nach Anlageklassen, basierend auf Ihrem Profil. Anlagehorizont: 3–5 Jahre.",
      "Taktische Allokation: kurzfristige Anpassungen basierend auf Marktchancen und Risikoeinschätzung. Entschieden vom Anlagekomitee.",
    ],
    detailClosing:
      "Die Gewichtung zwischen strategischem Kern und taktischen Positionen wird laufend vom Komitee gesteuert.",
    showCta: false,
  },
  {
    num: "05",
    title: "Portfolio aktiv verwalten",
    desc: "Laufende Überwachung, Risikokontrolle, Reporting",
    accent: true,
    shortLabel: "Portfolio",
    detailEyebrow: "Schritt 05",
    detailHeadline: "Portfolio aktiv verwalten",
    detailSubline: "Laufende Überwachung, Risikokontrolle, Reporting",
    detailBody: [
      "Ihr Portfolio wird laufend überwacht. Wir handeln, wenn die Daten es erfordern.",
      "Was wir täglich tun:",
    ],
    detailBullets: [
      "Risikokennzahlen und Verlustschwellen überwachen",
      "Passive und aktive Verletzungen des Anlegerprofils prüfen",
      "Rebalancing bei Abweichungen von der Zielallokation",
    ],
    detailClosing:
      "Was Sie erhalten: Vierteljährliche Berichterstattung, automatisch und konsolidiert. Zugang zum Kundenportal mit Echtzeit-Überblick. Persönliche Besprechung auf Wunsch.",
    showCta: true,
  },
];
