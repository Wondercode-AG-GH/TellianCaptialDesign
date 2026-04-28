import { HeroExpandingImage, ScrollFade } from "./ScrollAnimations";
import { ExpandableBody } from "./ExpandableBody";
import philosophyImg from "figma:asset/a44e63e47eecf6c5811f4525d593bd929e31be63.png";
import sardonaImg from "../../assets/sardona-1.jpg";
import { LAYOUT, getLayout, getTextColumnStyle, SPACING } from "../layout";
import type { Breakpoint } from "./useBreakpoint";

import { C, serif, sans } from "../tokens";

/* ─── Section geometry ────────────────────────────────────────
   Layout order: Hero(110) + Breathing(8)
   → Philosophie starts at scrollX = 118vw.
   Section width = 110vw.
   progress = (scrollX - 118vw) / 110vw   clamped [0, 1]
   ──────────────────────────────────────────────────────────── */
const SECTION_START_VW = 118;
const SECTION_WIDTH_VW = 110;

/* ─── Animation mapping (all linear, GPU-friendly) ───────────
   progress 0.0  →  scale 1.00 (32px), quoteOpacity 0.40, overlay 0.00
   progress 0.5  →  scale 1.50 (48px), quoteOpacity 0.70, overlay 0.15
   progress 1.0  →  scale 2.00 (64px), quoteOpacity 1.00, overlay 0.35
   ───────────────────────���──────────────────────────────────── */
function getAnimValues(scrollX: number) {
  const vw    = typeof window !== "undefined" && window.innerWidth > 0
    ? window.innerWidth
    : 1440;
  const start = (SECTION_START_VW * vw) / 100;
  const width = (SECTION_WIDTH_VW  * vw) / 100;

  if (width === 0) return { scale: 1.0, quoteOpacity: 0.7, overlayAlpha: 0.50 };

  const p = Math.max(0, Math.min(1, (scrollX - start) / width));
  const safe = (n: number) => (isFinite(n) ? n : 0);

  // Ease-out curve: fast ramp to ~90% at p=0.35, then slow crawl to 100%
  const eased = 1 - Math.pow(1 - p, 2.5);

  return {
    scale:        safe(1.0 + eased * 0.5),    // 1.00 → 1.50  (48px → 72px)
    quoteOpacity: safe(0.7 + eased * 0.3),    // 0.70 → 1.00
    overlayAlpha: safe(0.10 + eased * 0.30),  // 0.10 → 0.40
  };
}

interface Props {
  scrollX: number;
  isVertical?: boolean;
  breakpoint?: Breakpoint;
}

const BODY_PARAGRAPHS = [
  "Tellian Capital verwaltet Vermögen nach einem quantitativen Prozess. Anlageentscheide entstehen aus Daten, Modellen und systematischer Marktanalyse — nicht aus Prognosen einzelner Personen und nicht aus der Nachrichtenlage einer Woche.",
  "Wir nehmen Positionen ein, wenn unsere Analyse sie stützt. Und wir halten sie, solange die Grundlage trägt. Das erfordert Disziplin — besonders dann, wenn die Märkte nervös werden und der Impuls zum Handeln am grössten ist.",
];

export function Section2Anlagephilosophie({ scrollX, isVertical = false, breakpoint = "desktop" }: Props) {
  const layout = getLayout(breakpoint);
  const textColStyle = getTextColumnStyle(breakpoint);

  /* ── VERTICAL (Tablet / Mobile) ── */
  if (isVertical) {
    return (
      <section
        id="section-anlagephilosophie"
        style={{ backgroundColor: C.bg }}
      >
        {/* Text content — comes FIRST on mobile/tablet */}
        <div style={{ ...textColStyle }}>
          <ScrollFade scrollX={0} isVertical yOffset={16}>
            <span
              style={{
                fontFamily: sans,
                fontSize: "11px",
                letterSpacing: "0.22em",
                color: C.stone,
                display: "block",
                textTransform: "uppercase",
              }}
            >
              Anlagephilosophie
            </span>

            <div
              style={{
                width: "32px",
                height: "1.5px",
                backgroundColor: C.dark,
                marginTop: SPACING.eyebrowToAccent,
              }}
            />
          </ScrollFade>

          <ScrollFade scrollX={0} isVertical yOffset={24}>
            <h2
              style={{
                fontFamily: serif,
                fontSize: breakpoint === "mobile" ? "clamp(36px, 10vw, 48px)" : "clamp(48px, 6vw, 68px)",
                lineHeight: 0.94,
                color: C.dark,
                letterSpacing: "-0.03em",
                marginTop: SPACING.accentToHeadline,
              }}
            >
              Analyse entscheidet.
              <br />
              <em>Nicht Stimmung.</em>
            </h2>
          </ScrollFade>

          <ScrollFade scrollX={0} isVertical yOffset={20}>
            <div style={{ marginTop: SPACING.headlineToBody, paddingBottom: "32px" }}>
              <ExpandableBody
                paragraphs={BODY_PARAGRAPHS}
                visibleCount={1}
                fontSize={breakpoint === "mobile" ? "14px" : "13px"}
                lineHeight={1.7}
                gap="14px"
                maxWidth={layout.bodyMaxWidth}
              />
            </div>
          </ScrollFade>
        </div>

        {/* Image with quote overlay — comes AFTER text on mobile/tablet */}
        <div
          style={{
            width: "100%",
            height: breakpoint === "mobile" ? "50vh" : "55vh",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <img
            src={sardonaImg}
            alt="Tektonikarena Sardona — UNESCO-Welterbe im Kanton Glarus. Sichtbare geologische Schichtung der Glarner Hauptüberschiebung."
            className="w-full h-full"
            style={{ objectFit: "cover", objectPosition: "center" }}
          />
          {/* Gradient overlay for quote readability */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: "linear-gradient(to bottom, transparent 40%, rgba(0,0,0,0.25) 100%)",
              pointerEvents: "none",
              zIndex: 2,
            }}
          />
          {/* Quote — bottom third, compact block */}
          <div
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              bottom: 0,
              display: "flex",
              justifyContent: "center",
              pointerEvents: "none",
              zIndex: 3,
              padding: breakpoint === "mobile" ? "0 24px 32px" : "0 10% 40px",
            }}
          >
            <p
              style={{
                fontFamily: serif,
                fontSize: breakpoint === "mobile" ? "22px" : "28px",
                fontStyle: "italic",
                color: "#FAFAF8",
                lineHeight: 1.35,
                maxWidth: "400px",
                textAlign: "center",
                margin: 0,
                letterSpacing: "-0.01em",
              }}
            >
              {"\u00AB"}Manche Dinge entstehen nicht über Nacht.{"\u00BB"}
            </p>
          </div>
        </div>
      </section>
    );
  }

  /* ── DESKTOP (horizontal) ── */
  const { scale, quoteOpacity, overlayAlpha } = getAnimValues(scrollX);

  return (
    <div
      className="flex-shrink-0 h-screen relative"
      style={{ width: "110vw", backgroundColor: C.bg }}
    >
      <div
        className="absolute z-0"
        style={{ top: 0, bottom: 0, left: LAYOUT.imageLeft, right: 0 }}
      >
        <HeroExpandingImage
          src={sardonaImg}
          scrollX={scrollX}
          className="w-full h-full"
          alt="Tektonikarena Sardona — UNESCO-Welterbe im Kanton Glarus. Sichtbare geologische Schichtung der Glarner Hauptüberschiebung."
        />
        {/* Gradient overlay for quote readability */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: `linear-gradient(to bottom, transparent 40%, rgba(0,0,0,${(overlayAlpha * 0.8).toFixed(4)}) 100%)`,
            pointerEvents: "none",
            zIndex: 2,
          }}
        />
        {/* Quote — bottom third, compact block */}
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            bottom: 0,
            display: "flex",
            justifyContent: "center",
            pointerEvents: "none",
            zIndex: 3,
            padding: "0 10% 56px",
          }}
        >
          <p
            style={{
              fontFamily: serif,
              fontSize: "clamp(28px, 3.5vh, 40px)",
              fontStyle: "italic",
              fontWeight: 400,
              color: "#FAFAF8",
              lineHeight: 1.35,
              maxWidth: "400px",
              textAlign: "center",
              margin: 0,
              letterSpacing: "-0.01em",
              opacity: quoteOpacity,
              willChange: "opacity",
            }}
          >
            {"\u00AB"}Manche Dinge entstehen nicht über Nacht.{"\u00BB"}
          </p>
        </div>
      </div>

      <div
        className="relative z-10 h-full flex flex-col justify-end"
        style={{
          width: LAYOUT.columnWidth,
          paddingLeft: LAYOUT.paddingLeft,
          paddingRight: LAYOUT.paddingRight,
          paddingBottom: "clamp(56px, 8vh, 96px)",
        }}
      >
        <div style={{ marginBottom: "clamp(100px, 18vh, 240px)" }}>
          <span
            style={{
              fontFamily: sans,
              fontSize: "10px",
              letterSpacing: "0.22em",
              color: C.stone,
              display: "block",
              textTransform: "uppercase",
            }}
          >
            Anlagephilosophie
          </span>

          <div
            style={{
              width: "28px",
              height: "1.5px",
              backgroundColor: C.dark,
              marginTop: SPACING.eyebrowToAccent,
            }}
          />

          <h2
            style={{
              fontFamily: serif,
              fontSize: "clamp(48px, 7vh, 80px)",
              lineHeight: 0.94,
              color: C.dark,
              letterSpacing: "-0.03em",
              marginTop: SPACING.accentToHeadline,
            }}
          >
            Analyse entscheidet.
            <br />
            <em>Nicht Stimmung.</em>
          </h2>

          <div
            style={{
              marginTop: SPACING.headlineToBody,
              maxWidth: LAYOUT.bodyMaxWidth,
              display: "flex",
              flexDirection: "column",
              gap: SPACING.bodyParagraphGap,
            }}
          >
            {BODY_PARAGRAPHS.map((text, i) => (
              <p
                key={i}
                style={{
                  fontFamily: sans,
                  fontSize: "clamp(10.5px, 1.3vh, 12px)",
                  color: C.charcoal,
                  lineHeight: 1.75,
                  margin: 0,
                }}
              >
                {text}
              </p>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}