import { SubpageMethode } from "./SubpageMethode";

/* ═══════════════════════════════════════════════════════════
   UNTERSEITE — ADVISORY

   Die Gegenseite zum Mandat. Was die Karte in Station 3 in drei
   Zeilen sagt, steht hier ausführlich.

   WARUM DER TITEL DIE AUSSAGE TRÄGT
   "Sie entscheiden." und "Wir liefern die Grundlage." sind zwei
   Sätze, nicht ein umbrochener. Sie stehen deshalb auf zwei Zeilen,
   die zweite kursiv — dieselbe Form wie die Titel der Stationen.

   WARUM DIE DREI SCHRITTE WIE AUF DER ANLAGEPROZESS-SEITE STEHEN
   Beide Unterseiten erzählen einen Ablauf. Dieselbe Form — Ziffer
   auf einer Linie, darunter Titel und eine Zeile — macht sie als
   Paar erkennbar, statt zwei Gestaltungen für dieselbe Sache zu
   führen.

   WARUM DER UNTERSCHIED ZUM MANDAT EIGENS DASTEHT
   Advisory ist nur im Gegensatz zu verstehen. Der letzte Block
   nennt ihn ausdrücklich, statt ihn den Lesenden zu überlassen.
   ═══════════════════════════════════════════════════════════ */

/* ── INHALTE, WÖRTLICH AUS DEM REDESIGN-BRIEFING ── */
interface Schritt {
  titel: string;
  zeile: string;
}

interface Block {
  titel: string;
  text: string;
}

interface AdvisoryInhalt {
  titel: readonly [string, string];
  lead: string;
  schritte: readonly Schritt[];
  bloecke: readonly Block[];
  knopf: string;
}

const INHALT: Readonly<Record<"DE" | "EN" | "FR", AdvisoryInhalt>> = {
  DE: {
    titel: ["Sie entscheiden.", "Wir liefern die Grundlage."],
    lead: "Advisory ist die Alternative zum Mandat. Sie erteilen keine Verwaltungsvollmacht, die finale Entscheidung über jede Anlage liegt bei Ihnen. Tellian Capital arbeitet als unabhängiger Partner: Wir analysieren, wir empfehlen, wir helfen beim Feinschliff Ihres Portfolios. Ausgeführt wird nichts ohne Ihre Zustimmung.",
    schritte: [
      { titel: "Analyse", zeile: "Wir analysieren Ihr Portfolio im Kontext Ihrer Ziele, Ihres Risikoprofils und des aktuellen Marktumfelds." },
      { titel: "Empfehlung", zeile: "Auf dieser Grundlage entwickeln wir konkrete Anlageempfehlungen und erläutern Ihnen Chancen, Risiken und Auswirkungen auf Ihr Portfolio." },
      { titel: "Ihre Entscheidung", zeile: "Sie entscheiden über jede einzelne Anlage. Umgesetzt wird ausschliesslich, was Sie freigeben." },
    ],
    bloecke: [
      {
        titel: "Für wen Advisory gedacht ist",
        text: "Für Anleger, die aktiv bleiben und die Verantwortung für ihre Anlageentscheide behalten möchten.",
      },
      {
        titel: "Der Unterschied zum Mandat",
        text: "Beim Mandat erteilen Sie eine Verwaltungsvollmacht, und der Anlageausschuss entscheidet. Bei Advisory gibt es keine Vollmacht. Sie entscheiden.",
      },
    ],
    knopf: "Gespräch vereinbaren",
  },
  EN: {
    titel: ["You decide.", "We provide the foundation."],
    lead: "Advisory is the alternative to a discretionary mandate. You retain full control, with the final decision on every investment remaining with you. Tellian Capital acts as your independent investment partner: we analyse, advise and help you refine your portfolio. Nothing is implemented without your approval.",
    schritte: [
      { titel: "Analysis", zeile: "We assess your portfolio in the context of your objectives, risk profile and the current market environment." },
      { titel: "Recommendation", zeile: "Based on this analysis, we provide specific investment recommendations and explain the opportunities, risks and potential impact on your portfolio." },
      { titel: "Your Decision", zeile: "You remain in control of every investment decision. We only proceed with transactions that you have explicitly approved." },
    ],
    bloecke: [
      {
        titel: "Who is Advisory for?",
        text: "For investors who want to remain actively involved and retain control over their investment decisions.",
      },
      {
        titel: "The difference from a Mandate",
        text: "With a discretionary mandate, you grant Tellian Capital the authority to manage your portfolio and make investment decisions within the agreed framework. With Advisory, you retain that authority and make the final decision yourself.",
      },
    ],
    /* TODO-EN-BUTTON: Es existiert kein englisches Pendant des
       Knopfs «Gespräch vereinbaren» — bis zur Klärung steht der
       deutsche Text. */
    knopf: "Gespräch vereinbaren",
  },
  /* TODO-FR: Übersetzung folgt — DE-Text als Platzhalter. */
  FR: {
    titel: ["Sie entscheiden.", "Wir liefern die Grundlage."],
    lead: "Advisory ist die Alternative zum Mandat. Sie erteilen keine Verwaltungsvollmacht, die finale Entscheidung über jede Anlage liegt bei Ihnen. Tellian Capital arbeitet als unabhängiger Partner: Wir analysieren, wir empfehlen, wir helfen beim Feinschliff Ihres Portfolios. Ausgeführt wird nichts ohne Ihre Zustimmung.",
    schritte: [
      { titel: "Analyse", zeile: "Wir analysieren Ihr Portfolio im Kontext Ihrer Ziele, Ihres Risikoprofils und des aktuellen Marktumfelds." },
      { titel: "Empfehlung", zeile: "Auf dieser Grundlage entwickeln wir konkrete Anlageempfehlungen und erläutern Ihnen Chancen, Risiken und Auswirkungen auf Ihr Portfolio." },
      { titel: "Ihre Entscheidung", zeile: "Sie entscheiden über jede einzelne Anlage. Umgesetzt wird ausschliesslich, was Sie freigeben." },
    ],
    bloecke: [
      {
        titel: "Für wen Advisory gedacht ist",
        text: "Für Anleger, die aktiv bleiben und die Verantwortung für ihre Anlageentscheide behalten möchten.",
      },
      {
        titel: "Der Unterschied zum Mandat",
        text: "Beim Mandat erteilen Sie eine Verwaltungsvollmacht, und der Anlageausschuss entscheidet. Bei Advisory gibt es keine Vollmacht. Sie entscheiden.",
      },
    ],
    knopf: "Gespräch vereinbaren",
  },
};

const ziffer = (i: number) => String(i + 1).padStart(2, "0");

/* ── Eintritt ──
   Dieselbe Staffelung wie auf der Anlageprozess-Seite: die Schritte
   kommen nacheinander, die Linie zeichnet sich mit. */
const STUFE_MS = 260;
const DAUER_MS = 520;
const VORLAUF_MS = 200;
const SCHRITT_ABSTAND = "clamp(26px, 5vh, 48px)";

interface Props {
  isMobile?: boolean;
  aktiv?: boolean;
  sprache?: "DE" | "EN";
  onContactClick?: () => void;
}

/* Wie die Mandat-Seite nur noch Inhalt — Layout stellt die
   geteilte SubpageMethode. Advisory führt drei Schritte und hat im
   Bestand KEINEN Zwischentitel; es wird auch keiner erfunden. */
export function UnterseiteAdvisory({
  isMobile = false,
  aktiv = true,
  sprache = "DE",
  onContactClick,
}: Props) {
  const inhalt = INHALT[sprache];
  return (
    <SubpageMethode
      titel={inhalt.titel}
      lead={[inhalt.lead]}
      schritte={inhalt.schritte}
      bloecke={inhalt.bloecke}
      knopf={inhalt.knopf}
      /* Drei Schritte: Block 1 über Spalte 1, Block 2 über 2–3. */
      blockSpalten={["1 / 2", "2 / -1"]}
      isMobile={isMobile}
      aktiv={aktiv}
      sprache={sprache}
      onContactClick={onContactClick}
    />
  );
}
