import { C, cormorant, sans } from "../tokens";
import { SECTION_WIDTH } from "../sections";
import { useSectionEntered } from "./SectionEntry";
import { usePrefersReducedMotion } from "./usePrefersReducedMotion";
import { ParteiDreieck } from "./ParteiDreieck";

/* ═══════════════════════════════════════════════════════════
   STATION 2 — WEALTH MANAGEMENT

   Zwei Spalten: links der Text, rechts die Grafik auf Imperial
   Purple bis an den rechten Rand der Station.

   Die Grafik ist der Beleg für die Überschrift, nicht Schmuck.
   Deshalb steht sie in der schmalen Fassung VOR dem Knopf und
   nicht dahinter: wer bis zum Knopf gelesen hat, soll den Beleg
   schon gesehen haben.
   ═══════════════════════════════════════════════════════════ */

const TITLE_LINES = ["Ihr Vermögen bleibt", "auf Ihrem Konto."] as const;

const BODY = [
  "Massgeschneidertes Wealth Management – transparent, unabhängig und frei von Interessenskonflikten. Wir begleiten Sie beim nachhaltigen Erhalt Ihres Vermögens über Generationen hinweg, geprägt von Integrität und höchstem Anspruch.",
  "Vermögen ist für uns bei Tellian Capital mehr als reine Zahlen. Es steht für Ihre Ziele, Ihre Werte und Ihr Lebenswerk. Im persönlichen Austausch auf Augenhöhe entwickeln wir individuelle Strategien, die exakt zu Ihrer Lebensrealität passen.",
] as const;

const CTA = "Mehr zur Vermögensverwaltung";

/* Staffelung wie in Station 1, damit die Stationen im Takt bleiben. */
const STEP = { title: 0, body: 260, cta: 380, panel: 120 } as const;
const DURATION = 460;

interface Props {
  panelRef?: (el: HTMLDivElement | null) => void;
  /** Schmale Fassung für Tablet und Telefon. */
  isVertical?: boolean;
  onCtaClick?: () => void;
}

export function Station2WealthManagement({
  panelRef,
  isVertical = false,
  onCtaClick,
}: Props) {
  const entered = useSectionEntered();
  const reducedMotion = usePrefersReducedMotion();
  /* In der schmalen Fassung trägt der vertikale Scroll den Eintritt;
     der Latch gilt nur im waagrechten Track. */
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
      style={{
        margin: 0,
        fontFamily: cormorant,
        fontSize: "var(--tellian-s2-title-size)",
        fontWeight: "var(--tellian-s2-title-weight)" as unknown as number,
        lineHeight: "var(--tellian-s2-title-leading)" as unknown as number,
        letterSpacing: "var(--tellian-s2-title-tracking)",
        color: "var(--tellian-s2-ink)",
      }}
    >
      {TITLE_LINES[0]}
      <br />
      <em style={{ fontStyle: "italic", fontWeight: "inherit" }}>
        {TITLE_LINES[1]}
      </em>
    </h2>
  );


  /* Fliesstext in zwei Spalten. Kein CSS-columns: die beiden Absätze
     sind gesetzt, nicht umbrochen. Bei 200 % Zoom oder im
     Französischen bricht das Raster auf eine Spalte um, statt das
     Zeilenmass zu unterschreiten. */
  const flieSStext = (
    <div
      style={{
        /* Die Schrift MUSS hier stehen: relative Masse im Raster
           lösen gegen die Schrift des Elements auf, an dem sie
           gesetzt sind, nicht gegen die geerbte. */
        fontFamily: sans,
        fontSize: "var(--tellian-s2-body-size)",
        display: "grid",
        gridTemplateColumns:
          "repeat(auto-fit, minmax(min(var(--tellian-s2-body-measure), 100%), 1fr))",
        gap: "var(--tellian-s2-body-gap)",
        maxWidth:
          "calc(var(--tellian-s2-body-measure) * 2 + var(--tellian-s2-body-gap))",
      }}
    >
      {BODY.map((text, i) => (
        <p
          key={i}
          style={{
            margin: 0,
            fontFamily: sans,
            fontSize: "var(--tellian-s2-body-size)",
            lineHeight: "var(--tellian-s2-body-leading)" as unknown as number,
            color: "var(--tellian-s2-dim)",
            maxWidth: "var(--tellian-s2-body-measure)",
          }}
        >
          {text}
        </p>
      ))}
    </div>
  );

  const knopf = (
    <button
      onClick={onCtaClick}
      style={{
        fontFamily: sans,
        fontSize: "13px",
        letterSpacing: "0.08em",
        /* Mushroom gefüllt wie der Knopf in Station 6 und in
           CtaButton — die Schrift bleibt dunkel, weil Mushroom auf
           Archive White nur 1.9:1 trägt und als Schriftfarbe
           unlesbar wäre. Gefüllt sind es 8.6:1. */
        color: C.dark,
        backgroundColor: C.button,
        border: `1px solid ${C.button}`,
        borderRadius: "2px",
        padding: "13px 26px",
        cursor: "pointer",
        outline: "none",
        transition: "background-color 220ms ease, border-color 220ms ease",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = C.buttonHover;
        e.currentTarget.style.borderColor = C.buttonHover;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = C.button;
        e.currentTarget.style.borderColor = C.button;
      }}
    >
      {CTA}
    </button>
  );

  /* ── SCHMAL (Tablet / Telefon) ──
     Reihenfolge: Titel, Haarlinie, Text, Grafik, Knopf. */
  if (isVertical) {
    return (
      <section id="section-anlagephilosophie" style={{ backgroundColor: "var(--tellian-s2-bg)" }}>
        <div
          style={{
            paddingTop: "var(--tellian-abschnitt-luft-schmal)",
            paddingBottom: "var(--tellian-abschnitt-luft-schmal)",
            paddingLeft: "clamp(20px, 6vw, 48px)",
            paddingRight: "clamp(20px, 6vw, 48px)",
            display: "flex",
            flexDirection: "column",
            /* Summe der beiden alten Abstände: dazwischen stand die
               Haarlinie. Ohne die Anpassung wäre der Titel hier auf
               25px an den Text gerückt, während er in Station 1 auf
               52px steht. */
            gap: "calc(clamp(24px, 3.4vh, 44px) + clamp(20px, 2.8vh, 36px))",
            alignItems: "flex-start",
          }}
        >
          {titel}
          {flieSStext}
        </div>

        {/* Grafik über die volle Breite — die Purpurfläche ist hier
            das Band, das die Station teilt. */}
        <div
          style={{
            paddingTop: "clamp(36px, 6vh, 56px)",
            paddingBottom: "clamp(36px, 6vh, 56px)",
            paddingLeft: "clamp(20px, 6vw, 48px)",
            paddingRight: "clamp(20px, 6vw, 48px)",
          }}
        >
          <ParteiDreieck compact embedded onNavigate={onCtaClick} />
        </div>

        <div
          style={{
            paddingTop: "clamp(28px, 5vh, 44px)",
            paddingBottom: "var(--tellian-abschnitt-luft-schmal)",
            paddingLeft: "clamp(20px, 6vw, 48px)",
            paddingRight: "clamp(20px, 6vw, 48px)",
          }}
        >
          {knopf}
        </div>
      </section>
    );
  }

  /* ── BREIT (waagrechter Track) ── */
  return (
    <div
      ref={panelRef}
      className="flex-shrink-0 h-screen relative"
      /* Die GANZE Station trägt jetzt die Farbe, die vorher nur der
         Kasten um die Grafik hatte. Sie läuft über die volle Höhe,
         auch hinter beiden Bändern — die sind durchsichtig und
         schreiben darüber in ihrer hellen Fassung. */
      style={{ width: SECTION_WIDTH, backgroundColor: "var(--tellian-s2-bg)" }}
    >
      <div
        style={{
          /* Nur die TEXTBÜHNE weicht den beiden Bändern aus.
             Flächen und Bilder laufen darunter durch. */
          position: "absolute",
          top: "var(--tellian-kopf-height)",
          bottom: "var(--tellian-station-height)",
          left: 0,
          right: 0,
          display: "flex",
          alignItems: "stretch",
        }}
      >
        {/* ══ Textspalte ══ */}
        <div
          style={{
            flex: "1 1 0",
            minWidth: 0,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            /* Die Schiene liegt fixed und nimmt keinen Platz im Fluss;
               die Station hält ihren Streifen selbst frei. */
            paddingLeft: "var(--tellian-titel-links)",
            paddingRight: "var(--tellian-s2-body-pad-right)",
            paddingTop: "var(--tellian-s1-stage-pad)",
            paddingBottom: "var(--tellian-s1-stage-pad)",
            boxSizing: "border-box",
          }}
        >
          <div style={enter(STEP.title, 24)}>{titel}</div>

          <div
            style={{
              /* Summe der beiden alten Abstände: dazwischen stand
                 die Haarlinie, der Rhythmus bleibt derselbe. */
              marginTop: "calc(clamp(24px, 3.4vh, 44px) + clamp(20px, 2.8vh, 36px))",
              ...enter(STEP.body),
            }}
          >
            {flieSStext}
          </div>

          <div
            style={{
              marginTop: "clamp(28px, 4vh, 52px)",
              ...enter(STEP.cta, 14),
            }}
          >
            {knopf}
          </div>
        </div>

        {/* ══ Grafik ══
            Kein eigener Kasten mehr — sie steht offen auf der Fläche
            der Station, die seine Farbe übernommen hat. */}
        <div
          style={{
            flex: "0 0 var(--tellian-s2-panel-width)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            paddingLeft: "var(--tellian-s2-panel-pad)",
            paddingRight: "var(--tellian-s2-panel-pad)",
            boxSizing: "border-box",
            ...enter(STEP.panel, 20),
          }}
        >
          <ParteiDreieck embedded onNavigate={onCtaClick} />
        </div>
      </div>
    </div>
  );
}
