/* ═══════════════════════════════════════════════════════════
   PORTFOLIO MANAGEMENT — Section data for the subpage.
   Verbatim from verified firm documents (Swiss German, kein ß).
   EN: pending — Übersetzung folgt.
   ═══════════════════════════════════════════════════════════ */

/* ─── Hero ─── */
export const PM_HERO = {
  eyebrow: "Portfolio Management",
  headline: {
    before: "Wie wir Ihr Portfolio",
    italic: "führen.",
  },
  intro: [
    "Bei Tellian Capital wird jedes Portfolio einzeln zusammengestellt und aktiv verwaltet. Massgebend sind die Anlagekriterien, die wir mit Ihnen vereinbaren. Käufe und Verkäufe richten sich nach der erwarteten Marktentwicklung. Für Ihr Portfolio ist ein fester Ansprechpartner zuständig, der es durchgehend betreut.",
    "Der Anlageprozess ist mehrstufig. Er verbindet die Top-Down-Analyse der globalen Märkte mit der Bottom-Up-Auswahl einzelner Anlagen. Geführt werden die Portfolios nach einem Core-Satellite-Ansatz: ein stabiler Kern aus strategischen Positionen, ergänzt um taktische Positionen für kurzfristige Chancen. Die Aufteilung legt das Anlagekomitee gemeinsam fest.",
  ],
} as const;

/* ─── Stepper labels ─── */
export const PM_STEPPER_LABELS = [
  "Prozess",
  "Komitee",
  "Strategien",
  "Universum",
  "Verwahrung",
] as const;

/* ─── Sektion 1: Anlageprozess (PROZESS) ─── */

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
    bullets: [
      "Das Ergebnis aus strategischer und taktischer Allokation, zugeschnitten auf Ihr Profil",
    ],
  },
  {
    name: "Überwachung",
    bullets: [
      "Kontrolle der Verlustschwellen",
      "Überwachung passiver und aktiver Abweichungen vom Anlegerprofil",
      "Systematische Gewinnmitnahme",
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
  "Strategische und taktische Allokation greifen ineinander. Die strategische Allokation bildet den Kern und trägt das Portfolio über drei bis fünf Jahre. Die taktische Allokation nutzt kurzfristige Marktchancen und steuert die Gewichtung mit flexibler Streuung. Diversifiziert wird auf allen Ebenen: über Regionen, Sektoren, Trends und kurzfristige Marktchancen.";

/* ─── Sektion 3: Strategien ─── */

export interface Strategy {
  name: string;
  tag: string;        // e.g. "konservativ", "liberal"
  goal: string;
  volatility: string;
  /** Allocation string, e.g. "12 / 18 / 70" or "100 % Aktien" */
  allocation: string;
  /** Optional allocation legend, e.g. "Aktien / Alternativ / Obligationen" */
  allocationLegend?: string;
  /** Optional focus lines */
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

/* ─── Sektionen 2, 4, 5 (standard text blocks) ─── */

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
    headlineBefore: "Wer die Entscheide",
    headlineItalic: "trägt.",
    paragraphs: [
      "Über die Anlageentscheide befindet ein unabhängiges Anlagekomitee, unterstützt durch den Quant-Ansatz. Es tagt monatlich. Dabei überprüft es die bestehende Allokation und passt sie an, wenn die Umstände es verlangen. Bei aussergewöhnlichen Marktentwicklungen kommt es auch kurzfristig zusammen.",
      "Dem Komitee gehören die Geschäftsleitung, der Chief Investment Strategist, Partner-Vermögensverwalter aus dem Ausland und Marktexperten für alternative Anlageklassen an. Wir arbeiten mit einem grossen Informationsnetzwerk und stehen im laufenden Austausch mit Branchenexperten, Unternehmensanalysten und unabhängigen Research-Teams.",
    ],
  },
  {
    id: "universum",
    eyebrow: "Anlageuniversum",
    headlineBefore: "Über alle",
    headlineItalic: "Anlageklassen.",
    paragraphs: [
      "Tellian Capital investiert über alle Anlageklassen und sucht in jeder Klasse die beste verfügbare Lösung. Das Universum reicht von Fremdwährungen, Obligationen und Aktien über aktive Fonds, ETFs, strukturierte Produkte und Derivate bis zu Rohstoffen, Edelmetallen — auch physisch —, Krypto und Private-Equity-Fonds. Umgesetzt wird überwiegend mit aktiv gemanagten Fonds und ETFs.",
    ],
  },
  {
    id: "verwahrung",
    eyebrow: "Verwahrung",
    headlineBefore: "Wo Ihr Vermögen",
    headlineItalic: "liegt.",
    paragraphs: [
      "Ihr Vermögen liegt bei ausgewählten Kooperationsbanken in der Schweiz und in Liechtenstein, zu besten Konditionen und stets auf Ihren Namen. Beide Finanzplätze tragen ein AAA-Rating von Standard & Poor's und Moody's. Sie stehen für politische Stabilität, tiefe Staatsverschuldung und den Schweizer Franken als stabile Währung. Die Schweiz zählt weltweit zu den führenden Standorten für die Verwaltung ausländischer Vermögen. Liechtenstein ist EWR-Mitglied und über einen Zollvertrag eng mit der Schweiz verbunden.",
    ],
  },
];
