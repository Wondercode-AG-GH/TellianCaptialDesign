import { C, cormorant, sans } from "../tokens";
import { SECTION_WIDTH } from "../sections";
import { useSectionEntered } from "./SectionEntry";
import { usePrefersReducedMotion } from "./usePrefersReducedMotion";
import { ProzessGabelung } from "./ProzessGabelung";

/* ═══════════════════════════════════════════════════════════
   PORTFOLIO MANAGEMENT

   Zwei Spalten, durchgehend hell — kein farbiges Panel. Links der
   Text, rechts die Gabelung.

   Kein abschliessender Knopf: die beiden Karten SIND die Handlung.
   Ein zusätzlicher Knopf darunter wäre ein dritter Weg neben zwei
   gleichrangigen und würde die Gabelung entwerten.
   ═══════════════════════════════════════════════════════════ */

const TITLE_LINES = ["Portfolio", "Management"] as const;

const BODY = [
  "Die Vermögensverwaltung bei Tellian Capital folgt einem strukturierten, quantitativen Anlageprozess. Unsere Kauf- und Verkaufsentscheide stützen sich auf eine fortlaufende, evidenzbasierte Auswertung von Daten und Modellen – unabhängig von kurzfristigem Marktrauschen oder medialen Trends.",
  "Auf dieser empirischen Datengrundlage trifft der Anlageausschuss sämtliche Allokationsentscheide. Damit gewährleisten wir einen wiederholbaren, objektiven und risikobewussten Investmentansatz über alle Marktzyklen hinweg.",
] as const;

/* Staffelung wie in den Stationen 1 und 2, damit der Takt hält. */
const STEP = { title: 0, body: 260, grafik: 120 } as const;
const DURATION = 460;

interface Props {
  panelRef?: (el: HTMLDivElement | null) => void;
  /** Karten untereinander, Verbindungen entfallen. */
  isVertical?: boolean;
  domId?: string;
  onMandat?: () => void;
  onAdvisory?: () => void;
}

export function StationPortfolioManagement({
  panelRef,
  isVertical = false,
  domId,
  onMandat,
  onAdvisory,
}: Props) {
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
      style={{
        margin: 0,
        fontFamily: cormorant,
        fontSize: "var(--tellian-pm-title-size)",
        fontWeight: "var(--tellian-pm-title-weight)" as unknown as number,
        lineHeight: "var(--tellian-pm-title-leading)" as unknown as number,
        letterSpacing: "var(--tellian-pm-title-tracking)",
        color: C.ink,
      }}
    >
      {TITLE_LINES[0]}
      <br />
      <em style={{ fontStyle: "italic", fontWeight: "inherit" }}>
        {TITLE_LINES[1]}
      </em>
    </h2>
  );


  /* Zwei gesetzte Absätze, kein CSS-columns. Bei 200 % Zoom oder im
     Französischen bricht das Raster auf eine Spalte um, statt das
     Zeilenmass zu unterschreiten. */
  const flieSStext = (
    <div
      style={{
        /* `100%` im min() der Rasterspalte braucht eine BESTIMMTE
           Breite, sonst fällt es auf das Zeilenmass zurück. In der
           schmalen Spalte (align-items: flex-start) ist die Breite
           sonst schrumpfend und damit unbestimmt — gemessen ergab das
           bei 320px Fenster eine 338px breite Spalte in einem 280px
           breiten Kasten. */
        width: "100%",
        /* Schrift MUSS hier stehen: relative Masse im Raster lösen
           gegen die Schrift des Elements auf, an dem sie gesetzt
           sind, nicht gegen die geerbte. */
        fontFamily: sans,
        fontSize: "var(--tellian-pm-body-size)",
        display: "grid",
        gridTemplateColumns:
          "repeat(auto-fit, minmax(min(var(--tellian-pm-body-measure), 100%), 1fr))",
        gap: "var(--tellian-pm-body-gap)",
        maxWidth:
          "calc(var(--tellian-pm-body-measure) * 2 + var(--tellian-pm-body-gap))",
      }}
    >
      {BODY.map((text, i) => (
        <p
          key={i}
          style={{
            margin: 0,
            fontFamily: sans,
            fontSize: "var(--tellian-pm-body-size)",
            lineHeight: "var(--tellian-pm-body-leading)" as unknown as number,
            color: C.accent,
            maxWidth: "var(--tellian-pm-body-measure)",
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
      <section id={domId} style={{ backgroundColor: C.bg }}>
        <div
          style={{
            paddingTop: "var(--tellian-abschnitt-luft-schmal)",
            paddingBottom: "clamp(40px, 6vh, 64px)",
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

        <div
          style={{
            paddingBottom: "var(--tellian-abschnitt-luft-schmal)",
            paddingLeft: "clamp(20px, 6vw, 48px)",
            paddingRight: "clamp(20px, 6vw, 48px)",
          }}
        >
          <ProzessGabelung
            gestapelt
            onMandat={onMandat}
            onAdvisory={onAdvisory}
          />
        </div>
      </section>
    );
  }

  /* ── BREIT ── */
  return (
    <div
      ref={panelRef}
      className="flex-shrink-0 h-screen relative"
      style={{ width: SECTION_WIDTH, backgroundColor: C.bg }}
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
            paddingLeft:
              "calc(var(--tellian-rail-width) + clamp(28px, 3.4vw, 56px))",
            paddingRight: "var(--tellian-pm-body-pad-right)",
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
        </div>

        {/* ══ Grafikfeld — hell, kein Panel ══
            Die Grafik füllt es bewusst nicht aus: Höchstbreite plus
            Innenabstand halten Luft an allen vier Seiten. */}
        <div
          style={{
            flex: "0 0 var(--tellian-pm-field-width)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            paddingLeft: "var(--tellian-pm-graphic-pad)",
            paddingRight: "var(--tellian-pm-graphic-pad)",
            paddingTop: "var(--tellian-pm-graphic-pad)",
            paddingBottom: "var(--tellian-pm-graphic-pad)",
            boxSizing: "border-box",
            ...enter(STEP.grafik, 20),
          }}
        >
          <ProzessGabelung onMandat={onMandat} onAdvisory={onAdvisory} />
        </div>
      </div>
    </div>
  );
}
