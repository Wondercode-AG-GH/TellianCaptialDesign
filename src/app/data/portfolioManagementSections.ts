/* ═══════════════════════════════════════════════════════════
   PORTFOLIO MANAGEMENT — Section data for the subpage.
   Verbatim from verified firm documents (Swiss German, kein ß).
   EN: pending — Übersetzung folgt.
   ═══════════════════════════════════════════════════════════ */

/* ─── Hero ─── */
export const PM_HERO = {
  eyebrow: "Portfolio Management",
  /* EN: pending */
  headline: {
    before: "Wie wir Ihr Portfolio",
    italic: "führen.",
  },
  intro: [
    "Bei Tellian Capital wird jedes Portfolio einzeln zusammengestellt und aktiv verwaltet, abgestimmt auf die mit Ihnen vereinbarten Anlagekriterien. Käufe und Verkäufe richten sich nach der erwarteten Marktentwicklung. Betreut wird Ihr Portfolio von einem persönlich zuständigen Relationship Manager.",
    "Der Anlageprozess ist mehrstufig und systematisch aufgebaut. Er verbindet die Top-Down-Analyse der globalen Märkte mit der Bottom-Up-Auswahl einzelner Anlagen. Die Portfolios werden nach einem Core-Satellite-Ansatz geführt, den das Anlagekomitee einstimmig festlegt.",
  ],
} as const;

/* ─── Stepper labels (01–04) ─── */
export const PM_STEPPER_LABELS = [
  "Prozess",
  "Komitee",
  "Strategien",
  "Universum",
] as const;

/* ═══════════════════════════════════════════════════════════
   Sektion 1: Anlageprozess (PROZESS) — 8 Stufen
   ═══════════════════════════════════════════════════════════ */

export interface ProcessStage {
  name: string;
  bullets: string[];
}

export const PM_PROCESS_STAGES: ProcessStage[] = [
  {
    name: "Leitprinzipien",
    bullets: [
      "Unabhängigkeit und Objektivität",
      "Quantitative und qualitative Analyse",
      "Individuelles und innovatives Portfolio Management über alle Anlageklassen mit Best-in-Class-Selektion",
      "Kostentransparenz",
    ],
  },
  {
    name: "Investment-Philosophie",
    bullets: [
      "Erhalt der Kaufkraft des Vermögens",
      "Geografische und sektorale Diversifikation der Anlageklassen",
      "Aktive Risikokontrolle",
    ],
  },
  {
    name: "Anlegerprofil des Kunden",
    bullets: [
      "Anlageziel definieren und Risikotoleranz klären",
      "Eignung gemäss Ihrer finanziellen Gesamtsituation",
      /* PENDING VERIFICATION — die drei folgenden Merkmale: */
      "Innovatives Portfolio-Management",
      "Zugang zu einzigartigen Investmentmöglichkeiten",
      "Inhouse-Expertise und internationales Netzwerk",
    ],
  },
  {
    name: "Strategische Asset Allocation",
    bullets: [
      "Analyse der globalen Finanzmärkte anhand von Makroindikatoren",
      "Core-Investment mit drei bis fünf Jahren Anlagehorizont",
      "Optimale Kombination der Anlageklassen",
    ],
  },
  {
    name: "Taktische Asset Allocation",
    bullets: [
      "Kurzfristige Trends",
      "Marktpsychologie",
      "Technische Analyse",
    ],
  },
  {
    name: "Individuelle Portfolio-Konstruktion",
    bullets: [],
  },
  {
    name: "Überwachung",
    bullets: [
      "Kontrolle der Verlustschwellen",
      "Überwachung passiver und aktiver Abweichungen vom Anlegerprofil",
      "Gewinnmitnahme",
    ],
  },
  {
    name: "Reporting",
    bullets: [
      "Automatische Quartalsberichte",
      "Kundenspezifisches Zusatz-Reporting",
      "Konsolidierte Darstellung",
    ],
  },
];

export const PM_PROCESS_BODY =
  "Diversifiziert wird auf allen Ebenen: über Regionen, Sektoren, Trends und kurzfristige Marktchancen.";

/* ═══════════════════════════════════════════════════════════
   Sektion 3: Strategien — 7 Strategien (Option A: gestapelte Zeilen)
   ═══════════════════════════════════════════════════════════ */

export interface Strategy {
  name: string;
  tag: string;
  goal: string;
  volatility: string;
  allocation: string;
  allocationLegend?: string;
  focus?: string;
}

/* PENDING VERIFICATION — Allokationsprozente */
export const PM_STRATEGIES: Strategy[] = [
  {
    name: "Einkommen",
    tag: "konservativ",
    goal: "Vermögenserhalt und Fokus auf Zinserträge.",
    volatility: "Kleine Kursschwankungen.",
    allocation: "12 / 18 / 70",
    allocationLegend: "Aktien / Alternativ / Obligationen",
  },
  {
    name: "Ausgewogen",
    tag: "liberal",
    goal: "Langfristig realer Vermögenszuwachs durch Kapitalgewinne sowie Zins- und Dividendenerträge.",
    volatility: "Mittlere Kursschwankungen.",
    allocation: "38 / 22 / 40",
    allocationLegend: "Aktien / Alternativ / Obligationen",
  },
  {
    name: "Wachstum",
    tag: "dynamisch",
    goal: "Langfristig bedeutender realer Vermögenszuwachs durch Kapitalgewinne sowie Zins- und Dividendenerträge.",
    volatility: "Grössere Kursschwankungen.",
    allocation: "62 / 23 / 15",
    allocationLegend: "Aktien / Alternativ / Obligationen",
  },
  {
    name: "Aktien",
    tag: "offensiv",
    goal: "Langfristig grosser realer Vermögenszuwachs, insbesondere durch Kapitalgewinne und Devisenbewegungen.",
    volatility: "Grosse Kursschwankungen.",
    allocation: "100 % Aktien",
  },
  {
    name: "Individuell",
    tag: "persönlich",
    goal: "Nach Ihren persönlichen Präferenzen.",
    volatility: "",
    allocation: "",
  },
  {
    name: "Swiss Tresor",
    tag: "liquid und physisch",
    goal: "Langfristiger Vermögensaufbau durch Kapitalgewinne.",
    volatility: "Grössere Kursschwankungen.",
    allocation: "50 / 50",
    allocationLegend: "Aktien / Alternativ",
    focus: "Fokus auf Edelmetalle, Metall- und Minenaktien, Rohstoffe und Nahrungsmittel, Energie-Produzenten sowie Marktführer mit soliden Bilanzen.",
  },
  {
    name: "Generationenbindung",
    tag: "nachhaltig",
    goal: "Bedeutender langfristiger Vermögenszuwachs durch Kapitalgewinne.",
    volatility: "Grosse Kursschwankungen.",
    allocation: "75 / 25",
    allocationLegend: "Aktien / Alternativ",
    focus: "Fokus auf generationsübergreifende Anlagethemen wie effiziente Wasserversorgung, Biodiversität, Telemedizin und Kybernetik.",
  },
];

/* ═══════════════════════════════════════════════════════════
   Sektionen 2 + 4 (standard text blocks)
   ═══════════════════════════════════════════════════════════ */

export interface PMSection {
  id: string;
  eyebrow: string;
  headlineBefore: string;
  headlineItalic: string;
  paragraphs: string[];
}

export const PM_TEXT_SECTIONS: PMSection[] = [
  {
    id: "komitee",
    eyebrow: "Anlagekomitee",
    /* EN: pending */
    headlineBefore: "Wer die Entscheide",
    headlineItalic: "trägt.",
    paragraphs: [
      "Über die Anlageentscheide befindet ein unabhängiges Anlagekomitee, unterstützt durch den Quant-Ansatz. Es tagt monatlich, überprüft die bestehende Asset Allocation, passt sie bei Bedarf an die aktuellen Umstände an und identifiziert die Faktoren hinter den Markttrends. Bei aussergewöhnlichen Marktentwicklungen kommt es auch kurzfristig zusammen.",
      "Dem Komitee gehören die Geschäftsleitung, der Chief Investment Strategist, Partner-Vermögensverwalter aus dem Ausland und Marktexperten für alternative Anlageklassen an. Wir arbeiten mit einem grossen Informationsnetzwerk und stehen im laufenden Austausch mit Branchenexperten, Unternehmensanalysten und unabhängigen Research-Teams.",
    ],
  },
  {
    id: "universum",
    eyebrow: "Anlageuniversum",
    /* EN: pending */
    headlineBefore: "Über alle",
    headlineItalic: "Anlageklassen.",
    paragraphs: [
      "Tellian Capital investiert über alle Anlageklassen und sucht in jeder Klasse die beste verfügbare Lösung. Das Universum umfasst Fremdwährungen, Obligationen, Aktien, aktive Fonds und ETFs, strukturierte Produkte, Derivate, Rohstoffe, Edelmetalle — auch physisch —, Krypto und Private-Equity-Fonds. Umgesetzt wird überwiegend mit aktiv gemanagten Fonds und ETFs.",
    ],
  },
];
