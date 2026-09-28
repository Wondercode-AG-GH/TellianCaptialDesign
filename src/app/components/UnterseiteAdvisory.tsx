import { SubpageMandatAdvisory } from "./SubpageMandatAdvisory";

/* ═══════════════════════════════════════════════════════════
   UNTERSEITE — ADVISORY (nur Inhalt)

   Aufbau, Verhalten und Gestaltung stellt SubpageMandatAdvisory —
   dieselbe Hülle trägt das Mandat. Hier stehen ausschliesslich die
   Texte.

   KEINE Eyebrows mehr (28.09): «Mandat» bzw. «Advisory» über der
   Überschrift und «Vorgehen» über den Schritten standen
   kurzzeitig hier und sind wieder entfernt.

   KEIN Panel «Auf einen Blick» mehr: es stand kurzzeitig im Hero
   und ist auf Wunsch wieder entfernt.

   KEIN Titel über den Schritten: die Seite führte nie einen. Ein
   sichtbarer Platzhalter stand hier kurzzeitig und ist wieder
   entfernt — eine Lücke im Text ist schlechter als keine.

   FR entfällt: die Seite wird nur aus dem Capital-Zweig geöffnet,
   der DE und EN führt. Die frühere FR-Fassung war toter Code.
   ═══════════════════════════════════════════════════════════ */

interface Inhalt {
  titel: readonly [string, string];
  lead: readonly string[];
  knopf: string;
  schritte: readonly { titel: string; zeile: string }[];
}

const INHALT: Readonly<Record<"DE" | "EN", Inhalt>> = {
  DE: {
    titel: ["Sie entscheiden.", "Wir liefern die Grundlage."],
    lead: [
      "Advisory ist die Alternative zum Mandat. Sie erteilen keine Verwaltungsvollmacht, die finale Entscheidung über jede Anlage liegt bei Ihnen. Tellian Capital arbeitet als unabhängiger Partner: Wir analysieren, wir empfehlen, wir helfen beim Feinschliff Ihres Portfolios. Ausgeführt wird nichts ohne Ihre Zustimmung.",
    ],
    knopf: "Gespräch vereinbaren",
    schritte: [
      { titel: "Analyse", zeile: "Wir analysieren Ihr Portfolio im Kontext Ihrer Ziele, Ihres Risikoprofils und des aktuellen Marktumfelds." },
      { titel: "Empfehlung", zeile: "Auf dieser Grundlage entwickeln wir konkrete Anlageempfehlungen und erläutern Ihnen Chancen, Risiken und Auswirkungen auf Ihr Portfolio." },
      { titel: "Ihre Entscheidung", zeile: "Sie entscheiden über jede einzelne Anlage. Umgesetzt wird ausschliesslich, was Sie freigeben." },
    ],
  },
  EN: {
    titel: ["You decide.", "We provide the foundation."],
    lead: [
      "Advisory is the alternative to a discretionary mandate. You retain full control, with the final decision on every investment remaining with you. Tellian Capital acts as your independent investment partner: we analyse, advise and help you refine your portfolio. Nothing is implemented without your approval.",
    ],
    /* UI-LABEL-REVIEW: englische Fassung vorgeschlagen 18.09. */
    knopf: "Arrange a meeting",
    schritte: [
      { titel: "Analysis", zeile: "We assess your portfolio in the context of your objectives, risk profile and the current market environment." },
      { titel: "Recommendation", zeile: "Based on this analysis, we provide specific investment recommendations and explain the opportunities, risks and potential impact on your portfolio." },
      { titel: "Your Decision", zeile: "You remain in control of every investment decision. We only proceed with transactions that you have explicitly approved." },
    ],
  },
};

interface Props {
  isMobile?: boolean;
  aktiv?: boolean;
  sprache?: "DE" | "EN";
  onContactClick?: () => void;
  /** Weg zur Mandat-Unterseite (Spaltenkopf der Vergleichstabelle). */
  onAndereSeite?: () => void;
}

export function UnterseiteAdvisory({
  isMobile = false,
  aktiv = true,
  sprache = "DE",
  onContactClick,
  onAndereSeite,
}: Props) {
  const inhalt = INHALT[sprache];
  return (
    <SubpageMandatAdvisory
      seite="advisory"
      titel={inhalt.titel}
      lead={inhalt.lead}
      knopf={inhalt.knopf}
      schritte={inhalt.schritte}
      isMobile={isMobile}
      aktiv={aktiv}
      sprache={sprache}
      onContactClick={onContactClick}
      onAndereSeite={onAndereSeite}
    />
  );
}
