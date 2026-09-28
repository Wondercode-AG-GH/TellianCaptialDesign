import { SubpageMandatAdvisory } from "./SubpageMandatAdvisory";

/* ═══════════════════════════════════════════════════════════
   UNTERSEITE — MANDAT (nur Inhalt)

   Aufbau, Verhalten und Gestaltung stellt SubpageMandatAdvisory —
   dieselbe Hülle trägt Advisory. Hier stehen ausschliesslich die
   Texte.

   KEINE Eyebrows mehr (28.09): «Mandat» bzw. «Advisory» über der
   Überschrift und «Vorgehen» über den Schritten standen
   kurzzeitig hier und sind wieder entfernt.

   KEIN Panel «Auf einen Blick» mehr: es stand kurzzeitig im Hero
   und ist auf Wunsch wieder entfernt.

   FR entfällt: die Seite wird nur aus dem Capital-Zweig geöffnet,
   der DE und EN führt. Die frühere FR-Fassung war toter Code.
   ═══════════════════════════════════════════════════════════ */

interface Inhalt {
  titel: readonly [string, string];
  lead: readonly string[];
  knopf: string;
  vorgehenTitel: string;
  schritte: readonly { titel: string; zeile: string }[];
}

const INHALT: Readonly<Record<"DE" | "EN", Inhalt>> = {
  DE: {
    titel: ["Sie geben den Rahmen.", "Wir übernehmen die Verantwortung."],
    lead: [
      "Mit einem Vermögensverwaltungsmandat übertragen Sie Tellian Capital die Verwaltung Ihres Portfolios innerhalb der gemeinsam definierten Anlagestrategie. Sie erteilen uns eine Verwaltungsvollmacht, wir treffen die Anlageentscheide und setzen diese für Sie um.",
      "Ihre persönlichen Ziele, Ihre Risikobereitschaft und Ihre finanzielle Situation bilden dabei den verbindlichen Rahmen.",
    ],
    knopf: "Gespräch vereinbaren",
    vorgehenTitel: "Mit Methode gemeinsam zum Ziel.",
    schritte: [
      { titel: "Ziele", zeile: "Wir definieren Ihre Anlageziele, Bedürfnisse und den passenden Anlagehorizont." },
      { titel: "Risikoprofil", zeile: "Wir bestimmen Ihr Risikoprofil als Grundlage für Ihre persönliche Anlagestrategie." },
      { titel: "Selektion", zeile: "Unser Anlageausschuss identifiziert auf Basis hauseigener Anlagemodelle gezielte Investmentmöglichkeiten an den globalen Kapitalmärkten." },
      { titel: "Allokation", zeile: "Wir strukturieren Ihr Portfolio nach Risikoprofil und Anlageausrichtung und passen es laufend an." },
      { titel: "Verwaltung", zeile: "Wir überwachen und steuern Ihr Portfolio kontinuierlich und informieren Sie transparent über die Entwicklung." },
    ],
  },
  EN: {
    titel: ["You set the framework.", "We take responsibility."],
    lead: [
      "With a discretionary wealth management mandate, you entrust Tellian Capital with the management of your portfolio within the investment strategy we define together. You grant us discretionary authority to make and implement investment decisions on your behalf.",
      "Your personal objectives, risk tolerance and financial situation provide the clear framework for every decision we make.",
    ],
    /* UI-LABEL-REVIEW: englische Fassung vorgeschlagen 18.09. */
    knopf: "Arrange a meeting",
    vorgehenTitel: "A structured approach. A shared goal.",
    schritte: [
      { titel: "Objectives", zeile: "We define your investment objectives, individual needs and appropriate investment horizon." },
      { titel: "Risk Profile", zeile: "We establish your risk profile as the foundation for your individual investment strategy." },
      { titel: "Selection", zeile: "Our investment committee identifies targeted investment opportunities in global capital markets based on proprietary investment models." },
      { titel: "Allocation", zeile: "We structure your portfolio in line with your risk profile and investment strategy and adjust it as markets evolve." },
      { titel: "Management", zeile: "We continuously monitor and manage your portfolio and keep you transparently informed of its development." },
    ],
  },
};

interface Props {
  isMobile?: boolean;
  aktiv?: boolean;
  sprache?: "DE" | "EN";
  onContactClick?: () => void;
  /** Weg zur Advisory-Unterseite (Spaltenkopf der Vergleichstabelle). */
  onAndereSeite?: () => void;
}

export function UnterseiteMandat({
  isMobile = false,
  aktiv = true,
  sprache = "DE",
  onContactClick,
  onAndereSeite,
}: Props) {
  const inhalt = INHALT[sprache];
  return (
    <SubpageMandatAdvisory
      seite="mandat"
      titel={inhalt.titel}
      lead={inhalt.lead}
      knopf={inhalt.knopf}
      vorgehenTitel={inhalt.vorgehenTitel}
      schritte={inhalt.schritte}
      isMobile={isMobile}
      aktiv={aktiv}
      sprache={sprache}
      onContactClick={onContactClick}
      onAndereSeite={onAndereSeite}
    />
  );
}
