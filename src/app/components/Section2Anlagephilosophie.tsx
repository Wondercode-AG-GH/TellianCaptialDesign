import { useState, useEffect, useRef, useCallback } from "react";
import { HeroExpandingImage, ScrollFade } from "./ScrollAnimations";
import { ExpandableBody } from "./ExpandableBody";
import sardonaImg from "../../assets/sardona-1.jpg";
import { LAYOUT, getLayout, getTextColumnStyle, SPACING } from "../layout";
import type { Breakpoint } from "./useBreakpoint";
import { usePrefersReducedMotion } from "./usePrefersReducedMotion";

import { C, serif, sans, cormorant, EYEBROW } from "../tokens";
import { EASE, DURATION } from "../../styles/motion";

/* ─── Section geometry ──────────────────────────────────────── */
const SECTION_START_VW = 118;
const SECTION_WIDTH_VW = 110;

interface Props {
  scrollX: number;
  isVertical?: boolean;
  breakpoint?: Breakpoint;
}

/* ─── Content ─── */
const BODY_PARAGRAPHS = [
  "Tellian Capital verwaltet Vermögen nach einem quantitativen Prozess. Was wir kaufen oder verkaufen, ergibt sich aus Daten und Modellen, die wir laufend prüfen. Die Stimmung an den Märkten oder die Schlagzeile der Woche ändert daran nichts.",
];
/* EN: "Tellian Capital manages wealth through a quantitative process. What we buy or sell follows from data and models that we test continuously. The mood of the markets, or the headline of the week, doesn't change that." */

/* ─── Leistungsethik values ─────────────────────────────────── */
const VALUES = [
  {
    de: "Ehrlichkeit",          en: "Integrity",
    readoutDe: "Wir benennen Chancen und Risiken so, wie sie sind.",
    readoutEn: "We name opportunities and risks as they are.",
    inactiveSize: "32px",       mobileSize: "28px",
    offset: "0%",               mobileOffset: "0px",
  },
  {
    de: "Disziplin",            en: "Discipline",
    readoutDe: "Wir halten uns an den Prozess, auch wenn es unbequem wird.",
    readoutEn: "We stick to the process, even when it gets uncomfortable.",
    inactiveSize: "26px",       mobileSize: "24px",
    offset: "8%",               mobileOffset: "12px",
  },
  {
    de: "Respekt",              en: "Respect",
    readoutDe: "Jedes Mandat zählt gleich viel, unabhängig von seiner Grösse.",
    readoutEn: "Every mandate counts the same, whatever its size.",
    inactiveSize: "28px",       mobileSize: "26px",
    offset: "18%",              mobileOffset: "24px",
  },
  {
    de: "Leistungsbereitschaft", en: "Commitment",
    readoutDe: "Wir arbeiten am Portfolio weiter, nicht nur zum Quartalsende.",
    readoutEn: "We keep working on the portfolio, not just at quarter-end.",
    inactiveSize: "24px",       mobileSize: "22px",
    offset: "5%",               mobileOffset: "6px",
  },
  {
    de: "Unabhängigkeit",       en: "Independence",
    readoutDe: "Unsere Analyse ist unsere eigene, ohne fremde Interessen.",
    readoutEn: "Our analysis is our own, free of outside interests.",
    inactiveSize: "30px",       mobileSize: "26px",
    offset: "28%",              mobileOffset: "20px",
  },
  {
    de: "Entschlossenheit",     en: "Resolve",
    readoutDe: "Tragen die Daten eine Position, dann halten wir sie.",
    readoutEn: "When the data backs a position, we hold it.",
    inactiveSize: "26px",       mobileSize: "24px",
    offset: "14%",              mobileOffset: "10px",
  },
];

/* ═══════════════════════════════════════════════════════════════
   LEISTUNGSETHIK STAGE — Typographic composition
   ═══════════════════════════════════════════════════════════════ */
const ROW_H = 48;

interface StageProps {
  compact?: boolean;
}

function LeistungsethikStage({ compact = false }: StageProps) {
  const [active, setActive] = useState(0);
  const reducedMotion = usePrefersReducedMotion();
  const pauseTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const cycleTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useRef(true);

  /* ── Viewport observer — pause cycle off-screen ── */
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { isInView.current = entry.isIntersecting; },
      { threshold: 0.15 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  /* ── Auto-cycle ── */
  const startCycle = useCallback(() => {
    if (reducedMotion) return;
    if (cycleTimer.current) clearInterval(cycleTimer.current);
    cycleTimer.current = setInterval(() => {
      if (!isInView.current) return;
      setActive((p) => (p + 1) % VALUES.length);
    }, DURATION.valueCycle);
  }, [reducedMotion]);

  const stopCycle = useCallback(() => {
    if (cycleTimer.current) {
      clearInterval(cycleTimer.current);
      cycleTimer.current = null;
    }
  }, []);

  const handleInteract = useCallback(
    (i: number) => {
      setActive(i);
      stopCycle();
      if (pauseTimer.current) clearTimeout(pauseTimer.current);
      pauseTimer.current = setTimeout(() => startCycle(), DURATION.valueCyclePause);
    },
    [stopCycle, startCycle],
  );

  useEffect(() => {
    if (!reducedMotion) startCycle();
    return () => {
      stopCycle();
      if (pauseTimer.current) clearTimeout(pauseTimer.current);
    };
  }, [reducedMotion, startCycle, stopCycle]);

  /* ── Keyboard ── */
  const handleKeyDown = (e: React.KeyboardEvent) => {
    let next = active;
    if (e.key === "ArrowRight" || e.key === "ArrowDown") {
      next = (active + 1) % VALUES.length;
      e.preventDefault();
    } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
      next = (active - 1 + VALUES.length) % VALUES.length;
      e.preventDefault();
    }
    if (next !== active) handleInteract(next);
  };

  const transition = reducedMotion
    ? "none"
    : `font-size ${DURATION.medium}ms ${EASE.standard}, color ${DURATION.medium}ms ${EASE.standard}`;

  const activeSize = compact
    ? "clamp(32px, 8vw, 48px)"
    : "clamp(40px, 5vw, 72px)";

  return (
    <div ref={containerRef}>
      {/* Micro-label eyebrow */}
      <div style={{ width: "28px", height: "1.5px", backgroundColor: C.dark }} />
      <span
        style={{
          fontFamily: sans,
          fontSize: compact ? EYEBROW.mobile : EYEBROW.desktop,
          letterSpacing: "0.22em",
          color: C.stone,
          textTransform: "uppercase",
          display: "block",
          marginTop: "16px",
        }}
      >
        Unsere Leistungsethik
      </span>
      {/* EN: "Our Guiding Principles" */}

      {/* Values composition */}
      <div
        role="listbox"
        aria-label="Unsere Leistungsethik"
        tabIndex={0}
        onKeyDown={handleKeyDown}
        style={{
          marginTop: compact ? "20px" : "28px",
          outline: "none",
          display: "flex",
          flexDirection: "column",
          gap: compact ? "4px" : "2px",
        }}
      >
        {VALUES.map((v, i) => {
          const isAct = active === i;
          return (
            <div
              key={i}
              role="option"
              aria-selected={isAct}
              tabIndex={-1}
              onMouseEnter={() => { if (!compact) handleInteract(i); }}
              onFocus={() => handleInteract(i)}
              onClick={() => handleInteract(i)}
              style={{
                height: `${ROW_H}px`,
                paddingLeft: compact ? v.mobileOffset : v.offset,
                display: "flex",
                alignItems: "center",
                overflow: "visible",
                position: "relative",
                zIndex: isAct ? 1 : 0,
                cursor: "pointer",
              }}
            >
              <span
                style={{
                  fontFamily: cormorant,
                  fontSize: isAct ? activeSize : (compact ? v.mobileSize : v.inactiveSize),
                  fontWeight: isAct ? 500 : 300,
                  color: isAct ? C.ink : C.greigeSoft,
                  lineHeight: 1.1,
                  transition,
                  userSelect: "none",
                  whiteSpace: compact ? "normal" : "nowrap",
                  wordBreak: compact ? "normal" : undefined,
                  hyphens: compact ? "auto" : undefined,
                }}
                lang="de"
              >
                {v.de}
              </span>
            </div>
          );
        })}
      </div>

      {/* Readout / companion line */}
      <div
        aria-live="polite"
        style={{
          minHeight: compact ? "48px" : "40px",
          marginTop: compact ? "16px" : "14px",
        }}
      >
        <p
          key={active}
          style={{
            fontFamily: sans,
            fontSize: compact ? "13px" : "12px",
            fontStyle: "italic",
            color: C.charcoal,
            lineHeight: 1.5,
            margin: 0,
            animation: reducedMotion
              ? "none"
              : `stageReadoutFade ${DURATION.normal}ms ${EASE.standard}`,
          }}
        >
          {VALUES[active].readoutDe}
        </p>
      </div>

      <style>{`
        @keyframes stageReadoutFade {
          from { opacity: 0; transform: translateY(4px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   SECTION 2 — ANLAGEPHILOSOPHIE
   ═══════════════════════════════════════════════════════════════ */
export function Section2Anlagephilosophie({
  scrollX,
  isVertical = false,
  breakpoint = "desktop",
}: Props) {
  const layout = getLayout(breakpoint);
  const textColStyle = getTextColumnStyle(breakpoint);

  /* ── VERTICAL (Tablet / Mobile) ── */
  if (isVertical) {
    return (
      <section
        id="section-anlagephilosophie"
        style={{ backgroundColor: C.bg }}
      >
        <div style={{ ...textColStyle }}>
          <ScrollFade scrollX={0} isVertical yOffset={16}>
            <span
              style={{
                fontFamily: sans,
                fontSize: EYEBROW.mobile,
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
                fontSize:
                  breakpoint === "mobile"
                    ? "clamp(36px, 10vw, 48px)"
                    : "clamp(48px, 6vw, 68px)",
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
            <div style={{ marginTop: SPACING.headlineToBody }}>
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

          {/* Leistungsethik Stage */}
          <ScrollFade scrollX={0} isVertical yOffset={16}>
            <div style={{ marginTop: "36px", paddingBottom: "24px" }}>
              <LeistungsethikStage compact />
            </div>
          </ScrollFade>
        </div>

        {/* Image */}
        <div
          style={{
            width: "100%",
            height: breakpoint === "mobile" ? "60vh" : "55vh",
            overflow: "hidden",
          }}
        >
          <img
            src={sardonaImg}
            alt="Tektonikarena Sardona — UNESCO-Welterbe im Kanton Glarus."
            className="w-full h-full"
            style={{ objectFit: "cover", objectPosition: "center" }}
          />
        </div>
      </section>
    );
  }

  /* ── DESKTOP (horizontal) ── */
  return (
    <div
      className="flex-shrink-0 h-screen relative"
      style={{ width: "110vw", backgroundColor: C.bg }}
    >
      {/* Image — right side */}
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
      </div>

      {/* Left column */}
      <div
        className="relative z-10 h-full flex flex-col justify-center"
        style={{
          width: LAYOUT.columnWidth,
          paddingLeft: "clamp(36px, 8vw, 120px)",
          paddingRight: "clamp(36px, 5vw, 80px)",
          maxWidth: "calc(460px + clamp(36px, 5vw, 120px) + 4vw)",
        }}
      >
        {/* Eyebrow */}
        <span
          style={{
            fontFamily: sans,
            fontSize: "14px",
            letterSpacing: "0.15em",
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
            marginTop: "16px",
          }}
        />

        {/* Headline */}
        <h2
          style={{
            fontFamily: serif,
            fontSize: "clamp(48px, 7vh, 80px)",
            lineHeight: 0.94,
            color: C.dark,
            letterSpacing: "-0.03em",
            marginTop: "32px",
          }}
        >
          Analyse entscheidet.
          <br />
          <em>Nicht Stimmung.</em>
        </h2>

        {/* Body */}
        <div
          style={{
            marginTop: "32px",
            maxWidth: "480px",
            display: "flex",
            flexDirection: "column",
            gap: "16px",
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

        {/* Leistungsethik Stage */}
        <div style={{ marginTop: "40px" }}>
          <LeistungsethikStage />
        </div>
      </div>
    </div>
  );
}
