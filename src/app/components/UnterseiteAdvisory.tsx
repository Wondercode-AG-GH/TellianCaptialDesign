import { SubpageMandatAdvisory } from "./SubpageMandatAdvisory";

/* ═══════════════════════════════════════════════════════════
   UNTERSEITE — ADVISORY (nur Inhalt)

   Aufbau, Verhalten und Gestaltung stellt SubpageMandatAdvisory —
   dieselbe Hülle trägt das Mandat. Hier stehen ausschliesslich die
   Texte.

   PENDING – Freigabe (Lieferung 28.09): Panel «Auf einen Blick»
   samt Titel, Labels und Werten, der Eyebrow «Vorgehen» und der
   TITEL DES VORGEHENS — für ihn liegt noch kein Wortlaut vor, der
   Platzhalter steht deshalb sichtbar auf der Seite.

   FR entfällt: die Seite wird nur aus dem Capital-Zweig geöffnet,
   der DE und EN führt. Die frühere FR-Fassung war toter Code.
   ═══════════════════════════════════════════════════════════ */

interface Inhalt {
  eyebrow: string;
  titel: readonly [string, string];
  lead: readonly string[];
  knopf: string;
  panelTitel: string;
  panelZeilen: readonly { label: string; wert: string }[];
  vorgehenEyebrow: string;
  vorgehenTitel: string;
  schritte: readonly { titel: string; zeile: string }[];
  abschlussSatz: string;
}

const INHALT: Readonly<Record<"DE" | "EN", Inhalt>> = {
  DE: {
    eyebrow: "Advisory",
    titel: ["Sie entscheiden.", "Wir liefern die Grundlage."],
    lead: [
      "Advisory ist die Alternative zum Mandat. Sie erteilen keine Verwaltungsvollmacht, die finale Entscheidung über jede Anlage liegt bei Ihnen. Tellian Capital arbeitet als unabhängiger Partner: Wir analysieren, wir empfehlen, wir helfen beim Feinschliff Ihres Portfolios. Ausgeführt wird nichts ohne Ihre Zustimmung.",
    ],
    knopf: "Gespräch vereinbaren",
    /* PENDING – Freigabe: Titel, Labels und Werte des Panels. */
    panelTitel: "Auf einen Blick",
    panelZeilen: [
      { label: "Verwaltungsvollmacht", wert: "Keine" },
      { label: "Anlageentscheid", wert: "Liegt bei Ihnen" },
      { label: "Umsetzung", wert: "Nur mit Ihrer Zustimmung" },
    ],
    /* PENDING – Freigabe */
    vorgehenEyebrow: "Vorgehen",
    /* PENDING – Wortlaut offen. Der Platzhalter bleibt sichtbar;
       ein erfundener Titel waere schlechter als eine sichtbare
       Luecke. */
    vorgehenTitel: "[Titel Vorgehen – Wording offen]",
    schritte: [
      { titel: "Analyse", zeile: "Wir analysieren Ihr Portfolio im Kontext Ihrer Ziele, Ihres Risikoprofils und des aktuellen Marktumfelds." },
      { titel: "Empfehlung", zeile: "Auf dieser Grundlage entwickeln wir konkrete Anlageempfehlungen und erläutern Ihnen Chancen, Risiken und Auswirkungen auf Ihr Portfolio." },
      { titel: "Ihre Entscheidung", zeile: "Sie entscheiden über jede einzelne Anlage. Umgesetzt wird ausschliesslich, was Sie freigeben." },
    ],
    abschlussSatz: "Sie entscheiden.",
  },
  EN: {
    eyebrow: "Advisory",
    titel: ["You decide.", "We provide the foundation."],
    lead: [
      "Advisory is the alternative to a discretionary mandate. You retain full control, with the final decision on every investment remaining with you. Tellian Capital acts as your independent investment partner: we analyse, advise and help you refine your portfolio. Nothing is implemented without your approval.",
    ],
    /* UI-LABEL-REVIEW: englische Fassung vorgeschlagen 18.09. */
    knopf: "Arrange a meeting",
    /* UI-LABEL-REVIEW: Panel vollständig neu formuliert. */
    panelTitel: "At a glance",
    panelZeilen: [
      { label: "Discretionary authority", wert: "None" },
      { label: "Investment decision", wert: "Remains with you" },
      { label: "Implementation", wert: "Only with your approval" },
    ],
    /* UI-LABEL-REVIEW: Eyebrow neu. */
    vorgehenEyebrow: "Approach",
    /* PENDING – Wortlaut offen, wie in der deutschen Fassung. */
    vorgehenTitel: "[Approach title – wording pending]",
    schritte: [
      { titel: "Analysis", zeile: "We assess your portfolio in the context of your objectives, risk profile and the current market environment." },
      { titel: "Recommendation", zeile: "Based on this analysis, we provide specific investment recommendations and explain the opportunities, risks and potential impact on your portfolio." },
      { titel: "Your Decision", zeile: "You remain in control of every investment decision. We only proceed with transactions that you have explicitly approved." },
    ],
    abschlussSatz: "You decide.",
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
      eyebrow={inhalt.eyebrow}
      titel={inhalt.titel}
      lead={inhalt.lead}
      knopf={inhalt.knopf}
      panelTitel={inhalt.panelTitel}
      panelZeilen={inhalt.panelZeilen}
      vorgehenEyebrow={inhalt.vorgehenEyebrow}
      vorgehenTitel={inhalt.vorgehenTitel}
      schritte={inhalt.schritte}
      abschlussSatz={inhalt.abschlussSatz}
      isMobile={isMobile}
      aktiv={aktiv}
      sprache={sprache}
      onContactClick={onContactClick}
      onAndereSeite={onAndereSeite}
    />
  );
}
