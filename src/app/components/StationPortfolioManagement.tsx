import { C, sans, serif } from "../tokens";
import { SECTION_WIDTH } from "../sections";
import { useSectionEntered } from "./SectionEntry";
import { usePrefersReducedMotion } from "./usePrefersReducedMotion";
import { ProzessGabelung } from "./ProzessGabelung";

/* ═══════════════════════════════════════════════════════════
   STATION 02 — VERMÖGENSVERWALTUNG (dunkel)

   KORREKTUR-SESSION: Der Abschnitt war fälschlich als helle Station
   03 gebaut — eine überlange linke Spalte, die Karten rechts
   angehängt. Jetzt Position 02 auf Imperial Purple, neu gegliedert
   in EINE Lesespur von oben nach unten:

     Titel → Absatz 1 | Absatz 2 (zwei gleichrangige Spalten)
           → Absatz 3 als Intro auf den Auswahlbereich
           → «Zwei Wege, ein Anspruch» mit den beiden Karten.

   Die Texte selbst sind unverändert (Briefing der Vorsession).
   Die Karten bleiben helle Flächen — auf dem dunklen Grund grenzen
   sie sich damit von selbst ab, und ihre gesamte Innen-Typografie
   behält die geprüften Kontraste des Hell-Schemas.
   ═══════════════════════════════════════════════════════════ */

/* ── INHALTE, WÖRTLICH AUS DEM REDESIGN-BRIEFING ── */
interface StationInhalt {
  titel: readonly string[];
  absaetze: readonly string[];
}

const INHALT: Readonly<Record<"DE" | "EN" | "FR", StationInhalt>> = {
  DE: {
    titel: ["Vermögensverwaltung"],
    absaetze: [
      "Unser Portfoliomanagement ist unabhängig und frei von Interessenkonflikten. Hauseigene Investmentexpertise, ein internationales Netzwerk sowie der Zugang zu einzigartigen Investmentmöglichkeiten bilden die Grundlage unserer Vermögensverwaltung. Dabei verbinden wir unsere bewährten Anlagestrategien mit individuellen Lösungen, abgestimmt auf Ihre persönlichen Ziele und Bedürfnisse.",
      "Vermögen ist für uns mehr als eine Zahl. Es steht für das, was Sie aufgebaut haben, für Ihre Pläne und für die Menschen, die Ihnen wichtig sind. Deshalb betrachten wir Ihre persönliche und finanzielle Situation als Ganzes und richten unsere Vermögensverwaltung konsequent an Ihre Prioritäten und Ihrem Anlagehorizont aus.",
      "Im Mittelpunkt steht unser Vermögensverwaltungsmandat: Wir übernehmen die Anlageentscheide innerhalb der gemeinsam definierten Strategie. Mit Advisory bleiben die Anlageentscheide bei Ihnen, begleitet durch unsere Beratung.",
    ],
  },
  EN: {
    /* Eine Zeile wie im Deutschen: der Umbruch auf zwei Zeilen war
       Satz, nicht Text — und kostete auf flachen Fenstern genau die
       55px, um die der englische Stapel unten überlief. */
    titel: ["Wealth Management"],
    absaetze: [
      "Our portfolio management is independent and free from conflicts of interest. In-house investment expertise, an international network and access to distinctive investment opportunities form the foundation of our approach to wealth management. We combine our proven investment strategies with tailored solutions designed around your individual objectives and needs.",
      "To us, wealth is more than a number. It represents what you have built, the plans you have for the future and the people who matter to you. That is why we take a holistic view of your personal and financial circumstances and align our wealth management approach with your priorities and investment horizon.",
      "At the core of our offering is our discretionary wealth management mandate, where we make investment decisions on your behalf within the strategy defined together with you. With our advisory service, investment decisions remain in your hands, supported by our expertise and personal guidance.",
    ],
  },
  /* TODO-FR: Übersetzung folgt — DE-Text als Platzhalter. */
  FR: {
    titel: ["Vermögensverwaltung"],
    absaetze: [
      "Unser Portfoliomanagement ist unabhängig und frei von Interessenkonflikten. Hauseigene Investmentexpertise, ein internationales Netzwerk sowie der Zugang zu einzigartigen Investmentmöglichkeiten bilden die Grundlage unserer Vermögensverwaltung. Dabei verbinden wir unsere bewährten Anlagestrategien mit individuellen Lösungen, abgestimmt auf Ihre persönlichen Ziele und Bedürfnisse.",
      "Vermögen ist für uns mehr als eine Zahl. Es steht für das, was Sie aufgebaut haben, für Ihre Pläne und für die Menschen, die Ihnen wichtig sind. Deshalb betrachten wir Ihre persönliche und finanzielle Situation als Ganzes und richten unsere Vermögensverwaltung konsequent an Ihre Prioritäten und Ihrem Anlagehorizont aus.",
      "Im Mittelpunkt steht unser Vermögensverwaltungsmandat: Wir übernehmen die Anlageentscheide innerhalb der gemeinsam definierten Strategie. Mit Advisory bleiben die Anlageentscheide bei Ihnen, begleitet durch unsere Beratung.",
    ],
  },
};

/* Staffelung wie in den Stationen 1 und 2, damit der Takt hält. */
const STEP = { title: 0, body: 260, grafik: 120 } as const;
const DURATION = 460;

interface Props {
  panelRef?: (el: HTMLDivElement | null) => void;
  /** Karten untereinander. */
  isVertical?: boolean;
  domId?: string;
  sprache?: "DE" | "EN";
  onMandat?: () => void;
  onAdvisory?: () => void;
}

export function StationPortfolioManagement({
  panelRef,
  isVertical = false,
  domId,
  sprache = "DE",
  onMandat,
  onAdvisory,
}: Props) {
  const inhalt = INHALT[sprache];
  const entered = useSectionEntered();
  const reducedMotion = usePrefersReducedMotion();
  const shown = entered || reducedMotion || isVertical;

  const enter = (delay: number, distance = 18) => ({
    opacity: shown ? 1 : 0,
    transform: shown ? "translateY(0)" : `translateY(${distance}px)`,
    transition: reducedMotion
      ? "none"
      : `opacity ${DURATION}ms ease-out ${delay}ms,` +
        ` transform ${DURATION}ms cubic-bezier(0.16,1,0.3,1) ${delay}ms`,
  });

  const titel = (
    <h2
      /* «Vermögensverwaltung» misst bei 38px gemessene 392px und lief
         auf dem Telefon rechts hinaus — Silbentrennung statt
         kleinerer Schrift. hyphens braucht die Sprache des Texts. */
      lang={sprache === "EN" ? "en" : "de"}
      style={{
        margin: 0,
        hyphens: "manual",
        overflowWrap: "break-word",
        fontFamily: serif,
        fontSize: "var(--tellian-pm-titel-dunkel-size)",
        fontWeight: 400,
        lineHeight: "var(--tellian-pm-title-leading)" as unknown as number,
        letterSpacing: "var(--tellian-pm-title-tracking)",
        color: "var(--tellian-pm-dunkel-ink)",
      }}
    >
      {/* v5: weiches Trennzeichen statt automatischer Trennung —
          der Umbruch fällt damit immer zwischen «Vermögens» und
          «verwaltung», nie mitten in eine Silbe. Für den Text
          unsichtbar; die Prüfsonde filtert das Zeichen heraus. */}
      {inhalt.titel[0].replace("Vermögensverwaltung", "Vermögens\u00ADverwaltung")}
      {inhalt.titel[1] && (
        <>
          <br />
          <em style={{ fontStyle: "italic", fontWeight: "inherit" }}>
            {inhalt.titel[1]}
          </em>
        </>
      )}
    </h2>
  );

  /* Absatz 1 und 2 — die TEXTZONE links, untereinander mit festem
     Zeilenmass. Absatz 3 steht NICHT hier: er ist der Lead des
     Auswahlbereichs rechts und wandert in die Gabelung. */
  const textzone = (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "clamp(14px, 2.2vh, 24px)",
      }}
    >
      {inhalt.absaetze.slice(0, 2).map((text, i) => (
        <p
          key={i}
          style={{
            margin: 0,
            fontFamily: sans,
            fontSize: "var(--tellian-pm-body-size)",
            lineHeight: "var(--tellian-pm-body-leading)" as unknown as number,
            color: "var(--tellian-pm-dunkel-dim)",
            /* v5: 16px, Zeilenabstand 1.75 — flache Fenster enger,
               siehe --tellian-lauf-lh. */
            fontSize: "16px",
            lineHeight: "var(--tellian-lauf-lh)" as unknown as number,
            maxWidth: "50ch",
          }}
        >
          {text}
        </p>
      ))}
    </div>
  );

  /* ── SCHMAL ── */
  if (isVertical) {
    return (
      <section
        id={domId}
        style={{
          backgroundColor: "var(--tellian-purple)",
          backgroundImage: "var(--tellian-flaeche-dunkel-schmal)",
          scrollMarginTop: "var(--tellian-kopf-height)",
        }}
      >
        <div
          style={{
            paddingTop: "var(--tellian-abschnitt-luft-schmal)",
            paddingBottom: "var(--tellian-abschnitt-luft-schmal)",
            paddingLeft: "clamp(20px, 6vw, 48px)",
            paddingRight: "clamp(20px, 6vw, 48px)",
            display: "flex",
            flexDirection: "column",
            gap: "clamp(24px, 3.6vh, 40px)",
            alignItems: "flex-start",
          }}
        >
          {titel}
          {textzone}
          <ProzessGabelung
            gestapelt
            aufDunkel
            lead={inhalt.absaetze[2]}
            sprache={sprache}
            onMandat={onMandat}
            onAdvisory={onAdvisory}
          />
        </div>
      </section>
    );
  }

  /* ── BREIT ──
     Das Raster der Seite: links die Textzone, rechts die
     «Darstellung» der Station — hier der Auswahlbereich mit dem
     Lead (Absatz 3) und den beiden Karten. 5/7-Teilung wie im
     Briefing; der volle Stapel über die Stationsbreite brach das
     Muster der übrigen Stationen. */
  return (
    <div
      ref={panelRef}
      className="flex-shrink-0 h-screen relative"
      style={{
        width: SECTION_WIDTH,
        backgroundColor: "var(--tellian-purple)",
        backgroundImage: "var(--tellian-flaeche-dunkel)",
      }}
    >
      <div
        style={{
          /* Nur die TEXTBÜHNE weicht den beiden Bändern aus. */
          position: "absolute",
          top: "var(--tellian-kopf-height)",
          bottom: "var(--tellian-station-height)",
          left: 0,
          right: 0,
          display: "grid",
          gridTemplateColumns: "5fr 7fr",
          alignItems: "center",
          columnGap: "clamp(48px, 6.7vw, 96px)",
          paddingLeft:
            "calc(var(--tellian-rail-width) + var(--tellian-station-pad-x))",
          paddingRight: "var(--tellian-station-pad-x)",
          paddingTop: "var(--tellian-s1-stage-pad)",
          paddingBottom: "var(--tellian-s1-stage-pad)",
          boxSizing: "border-box",
        }}
      >
        {/* ══ Textzone links ══ */}
        <div
          style={{
            minWidth: 0,
            display: "flex",
            flexDirection: "column",
            gap: "var(--tellian-abstand-titel)",
          }}
        >
          <div style={enter(STEP.title, 24)}>{titel}</div>
          <div style={enter(STEP.body)}>{textzone}</div>
        </div>

        {/* ══ Darstellung rechts: Zwei Wege ══ */}
        <div style={{ minWidth: 0, ...enter(STEP.grafik + 140) }}>
          <ProzessGabelung
            aufDunkel
            lead={inhalt.absaetze[2]}
            sprache={sprache}
            onMandat={onMandat}
            onAdvisory={onAdvisory}
          />
        </div>
      </div>
    </div>
  );
}
