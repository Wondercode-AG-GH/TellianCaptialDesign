import { SubpageMethode } from "./SubpageMethode";

/* ═══════════════════════════════════════════════════════════
   UNTERSEITE — MANDAT

   1:1 die Struktur der Advisory-Unterseite, mit FÜNF Schritten
   statt drei und einem Zwischentitel vor dem Weg. Beide Seiten
   erzählen einen Ablauf; dieselbe Form macht sie als Paar
   erkennbar.

   Bis zum Redesign zeigte «Mehr zum Mandat» auf die
   Anlagestrategien-Unterseite — ein seit langem gemeldeter
   Platzhalter. Diese Seite löst ihn ab.
   ═══════════════════════════════════════════════════════════ */

interface Schritt {
  titel: string;
  zeile: string;
}

interface Block {
  titel: string;
  text: string;
}

interface MandatInhalt {
  titel: readonly [string, string];
  lead: readonly string[];
  zwischentitel: string;
  schritte: readonly Schritt[];
  bloecke: readonly Block[];
  knopf: string;
}

const INHALT: Readonly<Record<"DE" | "EN" | "FR", MandatInhalt>> = {
  DE: {
    titel: ["Sie geben den Rahmen.", "Wir übernehmen die Verantwortung."],
    lead: [
      "Mit einem Vermögensverwaltungsmandat übertragen Sie Tellian Capital die Verwaltung Ihres Portfolios innerhalb der gemeinsam definierten Anlagestrategie. Sie erteilen uns eine Verwaltungsvollmacht – wir treffen die Anlageentscheide und setzen diese für Sie um.",
      "Ihre persönlichen Ziele, Ihre Risikobereitschaft und Ihre finanzielle Situation bilden dabei den verbindlichen Rahmen.",
    ],
    zwischentitel: "Mit Methode gemeinsam zum Ziel.",
    schritte: [
      { titel: "Ziele", zeile: "Wir definieren Ihre Anlageziele, Bedürfnisse und den passenden Anlagehorizont." },
      { titel: "Risikoprofil", zeile: "Wir bestimmen Ihr Risikoprofil als Grundlage für Ihre persönliche Anlagestrategie." },
      { titel: "Selektion", zeile: "Unsere Modelle und Investmentexpertise identifizieren passende Anlagen aus den globalen Märkten." },
      { titel: "Allokation", zeile: "Wir strukturieren Ihr Portfolio nach Risikoprofil und Anlageausrichtung und passen es laufend an." },
      { titel: "Verwaltung", zeile: "Wir überwachen und steuern Ihr Portfolio kontinuierlich und informieren Sie transparent über die Entwicklung." },
    ],
    bloecke: [
      {
        titel: "Für wen das Mandat gedacht ist",
        text: "Für Anleger, die ihre täglichen Anlageentscheide in erfahrene Hände geben möchten und Wert auf eine professionelle, kontinuierliche Betreuung ihres Vermögens legen.",
      },
      {
        titel: "Der Unterschied zu Advisory",
        text: "Beim Mandat erteilen Sie Tellian Capital eine Verwaltungsvollmacht. Wir treffen und setzen die Anlageentscheide innerhalb des vereinbarten Rahmens für Sie um. Bei Advisory behalten Sie die Entscheidungsgewalt über jede einzelne Transaktion.",
      },
    ],
    knopf: "Gespräch vereinbaren",
  },
  EN: {
    titel: ["You set the framework.", "We take responsibility."],
    lead: [
      "With a discretionary wealth management mandate, you entrust Tellian Capital with the management of your portfolio within the investment strategy we define together. You grant us discretionary authority to make and implement investment decisions on your behalf.",
      "Your personal objectives, risk tolerance and financial situation provide the clear framework for every decision we make.",
    ],
    zwischentitel: "A structured approach. A shared goal.",
    schritte: [
      { titel: "Objectives", zeile: "We define your investment objectives, individual needs and appropriate investment horizon." },
      { titel: "Risk Profile", zeile: "We establish your risk profile as the foundation for your individual investment strategy." },
      { titel: "Selection", zeile: "Our models and investment expertise identify suitable opportunities across global markets." },
      { titel: "Allocation", zeile: "We structure your portfolio in line with your risk profile and investment strategy and adjust it as markets evolve." },
      { titel: "Management", zeile: "We continuously monitor and manage your portfolio and keep you transparently informed of its development." },
    ],
    bloecke: [
      {
        titel: "Who is the mandate for?",
        text: "For investors who prefer to entrust day-to-day investment decisions to experienced professionals while benefiting from continuous and professional portfolio management.",
      },
      {
        titel: "The difference from Advisory",
        text: "With a discretionary mandate, you grant Tellian Capital the authority to make and implement investment decisions within the agreed framework. With Advisory, you retain the final decision on each individual transaction.",
      },
    ],
    /* TODO-EN-BUTTON: Es existiert kein englisches Pendant des
       Knopfs «Gespräch vereinbaren» — bis zur Klärung steht der
       deutsche Text. */
    knopf: "Gespräch vereinbaren",
  },
  /* TODO-FR: Übersetzung folgt — DE-Text als Platzhalter. */
  FR: {
    titel: ["Sie geben den Rahmen.", "Wir übernehmen die Verantwortung."],
    lead: [
      "Mit einem Vermögensverwaltungsmandat übertragen Sie Tellian Capital die Verwaltung Ihres Portfolios innerhalb der gemeinsam definierten Anlagestrategie. Sie erteilen uns eine Verwaltungsvollmacht – wir treffen die Anlageentscheide und setzen diese für Sie um.",
      "Ihre persönlichen Ziele, Ihre Risikobereitschaft und Ihre finanzielle Situation bilden dabei den verbindlichen Rahmen.",
    ],
    zwischentitel: "Mit Methode gemeinsam zum Ziel.",
    schritte: [
      { titel: "Ziele", zeile: "Wir definieren Ihre Anlageziele, Bedürfnisse und den passenden Anlagehorizont." },
      { titel: "Risikoprofil", zeile: "Wir bestimmen Ihr Risikoprofil als Grundlage für Ihre persönliche Anlagestrategie." },
      { titel: "Selektion", zeile: "Unsere Modelle und Investmentexpertise identifizieren passende Anlagen aus den globalen Märkten." },
      { titel: "Allokation", zeile: "Wir strukturieren Ihr Portfolio nach Risikoprofil und Anlageausrichtung und passen es laufend an." },
      { titel: "Verwaltung", zeile: "Wir überwachen und steuern Ihr Portfolio kontinuierlich und informieren Sie transparent über die Entwicklung." },
    ],
    bloecke: [
      {
        titel: "Für wen das Mandat gedacht ist",
        text: "Für Anleger, die ihre täglichen Anlageentscheide in erfahrene Hände geben möchten und Wert auf eine professionelle, kontinuierliche Betreuung ihres Vermögens legen.",
      },
      {
        titel: "Der Unterschied zu Advisory",
        text: "Beim Mandat erteilen Sie Tellian Capital eine Verwaltungsvollmacht. Wir treffen und setzen die Anlageentscheide innerhalb des vereinbarten Rahmens für Sie um. Bei Advisory behalten Sie die Entscheidungsgewalt über jede einzelne Transaktion.",
      },
    ],
    knopf: "Gespräch vereinbaren",
  },
};

const ziffer = (i: number) => String(i + 1).padStart(2, "0");

/* Dieselbe Staffelung wie auf der Advisory-Seite. */
const STUFE_MS = 260;
const DAUER_MS = 520;
const VORLAUF_MS = 200;
const SCHRITT_ABSTAND = "clamp(26px, 5vh, 48px)";

interface Props {
  isMobile?: boolean;
  /** true, sobald die Unterseite offen ist. */
  aktiv?: boolean;
  sprache?: "DE" | "EN";
  onContactClick?: () => void;
}

/* Seit dem Mock-B-Umbau (08.09) ist diese Datei nur noch der
   Inhalt: Layout und Verhalten stellt die GETEILTE Komponente
   SubpageMethode — dieselbe, die auch Advisory trägt. */
export function UnterseiteMandat({
  isMobile = false,
  aktiv = true,
  sprache = "DE",
  onContactClick,
}: Props) {
  const inhalt = INHALT[sprache];
  return (
    <SubpageMethode
      titel={inhalt.titel}
      lead={inhalt.lead}
      zwischentitel={inhalt.zwischentitel}
      schritte={inhalt.schritte}
      bloecke={inhalt.bloecke}
      knopf={inhalt.knopf}
      /* Fünf Schritte: Block 1 über Spalten 1–2, Block 2 über 3–5. */
      blockSpalten={["1 / 3", "3 / -1"]}
      isMobile={isMobile}
      aktiv={aktiv}
      sprache={sprache}
      onContactClick={onContactClick}
    />
  );
}
