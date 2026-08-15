import { C, cormorant, sans } from "../tokens";
import { SECTION_WIDTH } from "../sections";
import { useSectionEntered } from "./SectionEntry";
import { usePrefersReducedMotion } from "./usePrefersReducedMotion";
import { ResponsiveImage } from "./ResponsiveImage";
import type { ImageId } from "../../assets/generated";

/* ═══════════════════════════════════════════════════════════
   STATION 1 — EINSTIEG

   Bühne zwischen Kopfzeile und Stationsleiste: links die Textspalte,
   rechts ein Bildpanel im Format 4:5.

   Das Panel wird NICHT im Browser beschnitten. Der Ausschnitt entsteht
   in der Bildaufbereitung (scripts/optimize-images.mjs); hier wird die
   Fläche nur im richtigen Verhältnis aufgespannt und das fertige Motiv
   hineingelegt. Ein zweiter Beschnitt über object-fit würde den
   abgenommenen Bildausschnitt wieder verändern.

   Die Fläche ist von Anfang an in Mushroom reserviert. Fehlt das
   Motiv, bleibt sie stehen und die Station ist vollständig lesbar —
   kein Layoutsprung, kein Loch.
   ═══════════════════════════════════════════════════════════ */

const TITLE_LINES = ["Weiterdenken", "aus Erfahrung."] as const;

const LEAD = [
  "Tellian Capital verwaltet Vermögen für Privatpersonen, Unternehmerfamilien und Stiftungen. Seit 1996, unabhängig und FINMA-lizenziert, von Zürich aus.",
  "Was wir kaufen oder verkaufen, ergibt sich aus Daten und Modellen — nicht aus der Stimmung an den Märkten und nicht aus der Schlagzeile der Woche.",
] as const;

/* Staffelung des Eintritts. Zusammen unter 650ms, damit die Station
   steht, bevor jemand weiterscrollt. */
const STEP = { title: 0, rule: 180, lead: 260, cta: 380, panel: 120 } as const;
const DURATION = 460;

interface Props {
  panelRef?: (el: HTMLDivElement | null) => void;
  onContactClick?: () => void;
  /**
   * Motiv für das Bildpanel. Fehlt es, bleibt die reservierte Fläche
   * stehen — die Station bleibt vollständig.
   */
  imageId?: ImageId;
  imageAlt?: string;
}

export function Station1Einstieg({
  panelRef,
  onContactClick,
  imageId,
  imageAlt = "",
}: Props) {
  const entered = useSectionEntered();
  const reducedMotion = usePrefersReducedMotion();
  const shown = entered || reducedMotion;

  /** Eintritt eines Elements — bei reduzierter Bewegung sofort. */
  const enter = (delay: number, distance = 18) => ({
    opacity: shown ? 1 : 0,
    transform: shown ? "translateY(0)" : `translateY(${distance}px)`,
    transition: reducedMotion
      ? "none"
      : `opacity ${DURATION}ms ease-out ${delay}ms,` +
        ` transform ${DURATION}ms cubic-bezier(0.16,1,0.3,1) ${delay}ms`,
  });

  return (
    <div
      ref={panelRef}
      className="flex-shrink-0 h-screen relative"
      style={{ width: SECTION_WIDTH, backgroundColor: C.bg }}
    >
      {/* Bühne — zwischen den beiden festen Bändern, senkrecht zentriert */}
      <div
        style={{
          height: "100%",
          paddingTop: "calc(var(--tellian-s1-header-height) + var(--tellian-s1-stage-pad))",
          paddingBottom: "calc(var(--tellian-station-height) + var(--tellian-s1-stage-pad))",
          paddingLeft: "clamp(28px, 3.4vw, 56px)",
          paddingRight: "clamp(28px, 3.4vw, 56px)",
          display: "flex",
          alignItems: "center",
          gap: "clamp(32px, 5vw, 96px)",
          boxSizing: "border-box",
        }}
      >
        {/* ══ Textspalte ══ */}
        <div style={{ flex: "1 1 0", minWidth: 0 }}>
          <h1
            style={{
              margin: 0,
              fontFamily: cormorant,
              fontSize: "var(--tellian-s1-title-size)",
              fontWeight: "var(--tellian-s1-title-weight)" as unknown as number,
              lineHeight: "var(--tellian-s1-title-leading)" as unknown as number,
              letterSpacing: "var(--tellian-s1-title-tracking)",
              color: C.ink,
              ...enter(STEP.title, 24),
            }}
          >
            {TITLE_LINES[0]}
            <br />
            <em style={{ fontStyle: "italic", fontWeight: "inherit" }}>
              {TITLE_LINES[1]}
            </em>
          </h1>

          {/* Haarlinie */}
          <div
            aria-hidden
            style={{
              height: "1px",
              width: "100%",
              maxWidth: "calc(var(--tellian-s1-lead-measure) * 2 + var(--tellian-s1-lead-gap))",
              backgroundColor: C.line,
              marginTop: "clamp(24px, 3.4vh, 44px)",
              transformOrigin: "left center",
              opacity: shown ? 1 : 0,
              transform: shown ? "scaleX(1)" : "scaleX(0)",
              transition: reducedMotion
                ? "none"
                : `opacity ${DURATION}ms ease-out ${STEP.rule}ms,` +
                  ` transform ${DURATION}ms cubic-bezier(0.16,1,0.3,1) ${STEP.rule}ms`,
            }}
          />

          {/* Standfirst — zwei Spalten.
              Kein CSS-columns: die beiden Absätze sind gesetzt, nicht
              umbrochen. Bei 200 % Zoom oder im Französischen, wo der
              Text rund 40 % länger wird, bricht das Raster auf eine
              Spalte um, statt das Zeilenmass zu unterschreiten. */}
          <div
            style={{
              marginTop: "clamp(20px, 2.8vh, 36px)",
              /* Schrift MUSS hier gesetzt sein: `ch` löst gegen die
                 Schrift des Elements auf, an dem es steht. Ohne das
                 rechnet der Container mit der geerbten Schrift und das
                 Zeilenmass fällt rund 15 % zu breit aus — die zweite
                 Spalte passt dann nicht mehr und das Raster klappt um. */
              fontFamily: sans,
              fontSize: "var(--tellian-s1-lead-size)",
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit, minmax(min(var(--tellian-s1-lead-measure), 100%), 1fr))",
              gap: "var(--tellian-s1-lead-gap)",
              maxWidth: "calc(var(--tellian-s1-lead-measure) * 2 + var(--tellian-s1-lead-gap))",
              ...enter(STEP.lead),
            }}
          >
            {LEAD.map((text, i) => (
              <p
                key={i}
                style={{
                  margin: 0,
                  fontFamily: sans,
                  fontSize: "var(--tellian-s1-lead-size)",
                  lineHeight: "var(--tellian-s1-lead-leading)" as unknown as number,
                  color: C.accent,
                  maxWidth: "var(--tellian-s1-lead-measure)",
                }}
              >
                {text}
              </p>
            ))}
          </div>

          {/* Knopf — erster Fokus der Station */}
          <div style={{ marginTop: "clamp(28px, 4vh, 52px)", ...enter(STEP.cta, 14) }}>
            <button
              onClick={onContactClick}
              style={{
                fontFamily: sans,
                fontSize: "13px",
                letterSpacing: "0.08em",
                color: C.ink,
                background: "transparent",
                border: `1px solid ${C.ink}`,
                borderRadius: "2px",
                padding: "13px 26px",
                cursor: "pointer",
                outline: "none",
                transition: "background-color 220ms ease, color 220ms ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = C.ink;
                e.currentTarget.style.color = C.bg;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "transparent";
                e.currentTarget.style.color = C.ink;
              }}
            >
              Gespräch vereinbaren
            </button>
          </div>
        </div>

        {/* ══ Bildpanel — exakt 4:5 ══
            Die Breite ist gedeckelt: rund ein Drittel der Station, und
            nie mehr, als die Resthöhe im Verhältnis 4:5 zulässt. Ohne
            den zweiten Deckel nimmt das Panel auf hohen Fenstern so
            viel Breite, dass der Standfirst seine zweite Spalte
            verliert. */}
        <div
          style={{
            flex: "0 0 var(--tellian-s1-panel-width)",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-end",
          }}
        >
          <div
            style={{
              width: "100%",
              aspectRatio: "4 / 5",
              maxHeight: "100%",
              /* Reservierte Fläche. Sie steht, bevor das Motiv da ist,
                 und sie bleibt stehen, wenn es fehlt. */
              backgroundColor: "var(--tellian-s1-panel-placeholder)",
              overflow: "hidden",
              ...enter(STEP.panel, 20),
            }}
          >
            {imageId && (
              <ResponsiveImage
                id={imageId}
                alt={imageAlt}
                /* Panel misst rund ein Drittel der Stationsbreite. */
                sizes="32vw"
                priority
                className="w-full h-full"
                style={{ display: "block" }}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
