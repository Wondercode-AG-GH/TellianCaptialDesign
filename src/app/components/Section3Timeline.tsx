import React, { useRef, useState, useEffect } from "react";
import { RotateCcw } from "lucide-react";
import { LAYOUT } from "../layout";
import { AnlageprozessStepOrdinal, ORDINAL_FONT_SIZE } from "./AnlageprozessStepOrdinal";
import { usePrefersReducedMotion } from "./usePrefersReducedMotion";

import { C, serif, sans } from "../tokens";
import { SectionDivider } from "./SectionDivider";

/* ─── Step definitions ─── */
const STEPS = [
  {
    num:    "01",
    title:  "Ihre Ziele definieren",
    desc:   "Anlageziele, Zeithorizont und Erwartungen klären",
    accent: false,
  },
  {
    num:    "02",
    title:  "Risikotoleranz & Eignung",
    desc:   "Finanzielle Gesamtsituation und Anlegerprofil prüfen",
    accent: false,
  },
  {
    num:    "03",
    title:  "Investmentuniversum filtern",
    desc:   "Quantitative Modelle und systematische Selektion",
    accent: true,
  },
  {
    num:    "04",
    title:  "Vermögensallokation",
    desc:   "Strategische und taktische Verteilung über Anlageklassen",
    accent: true,
  },
  {
    num:    "05",
    title:  "Portfolio aktiv verwalten",
    desc:   "Laufende Überwachung, Risikokontrolle, Reporting",
    accent: true,
  },
] as const;

/* ─── Animation helpers ───────────────────────────────────────────────
   Trigger: the moment the timeline container's left edge enters the
   viewport (rect.left < window.innerWidth).
   "scrolledPast" = pixel distance scrolled past that trigger point.
   Each step is delayed by ~staggerPx (~200ms at moderate scroll speed).
   ─────────────────────────────────────────────────────────────────── */
function easeOut(t: number): number {
  return 1 - (1 - t) * (1 - t);
}

function getItemP(
  scrolledPast: number,
  index: number,
  staggerPx: number,
  windowPx: number
): number {
  if (windowPx <= 0) return 0;
  const startPx = index * staggerPx;
  const t = Math.max(0, Math.min(1, (scrolledPast - startPx) / windowPx));
  return easeOut(t);
}

interface Props {
  /** Passed from parent to drive re-renders on every scroll frame. */
  scrollX: number;
  isVertical?: boolean;
  /** When true, step ordinals unmount so the detail-view overlay can own the FLIP targets */
  isDetailMode?: boolean;
}

export function Section3Timeline({ scrollX, isVertical = false, isDetailMode = false }: Props) {
  const descriptionsFading = isDetailMode;
  const descriptionsHidden = isDetailMode;

  const reducedMotion = usePrefersReducedMotion();
  /* FLIP runs only on desktop (horizontal) + when reduced-motion is OFF.
     The main-page step ordinals use layoutId; when the user triggers detail,
     they UNMOUNT (conditional rendering), and the overlay's ordinals mount
     with matching layoutIds — Framer Motion animates the positional change. */
  const canFlip = !isVertical && !reducedMotion;
  const enableFlip = canFlip;
  // scrollX is intentionally referenced so prop-change triggers re-renders
  void scrollX;

  const containerRef = useRef<HTMLDivElement>(null);

  /* ── Desktop: scrolledPast based on horizontal scroll position ── */
  let scrolledPast = 0;
  if (!isVertical && containerRef.current && typeof window !== "undefined") {
    const rect = containerRef.current.getBoundingClientRect();
    const vw   = window.innerWidth;
    if (rect.left < vw) {
      scrolledPast = vw - rect.left;
    }
  }

  const vwInner   = typeof window !== "undefined" && window.innerWidth > 0 ? window.innerWidth : 1440;
  const staggerPx = vwInner * 0.115;
  const windowPx  = vwInner * 0.10;
  const totalRange = (STEPS.length - 1) * staggerPx + windowPx;
  const stripScale = isVertical
    ? 1   // no scroll-driven strip animation in vertical (we use per-step IO)
    : (totalRange > 0 ? Math.max(0, Math.min(1, scrolledPast / totalRange)) : 0);

  /* ── Vertical: per-step IntersectionObserver ──
     stepInView[i] = true once step has entered the viewport.
     Tracks which step is currently the "active" (most centered) step. */
  const [stepInView, setStepInView] = useState<boolean[]>(() => STEPS.map(() => false));
  const [activeStep, setActiveStep] = useState<number>(0);
  const stepRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    if (!isVertical) return;

    const observers: IntersectionObserver[] = [];

    // (a) Reveal observer — once visible enough, mark stepInView[i] = true
    const revealObs = new IntersectionObserver(
      (entries) => {
        setStepInView((prev) => {
          const next = [...prev];
          let changed = false;
          for (const e of entries) {
            const idx = stepRefs.current.findIndex((r) => r === e.target);
            if (idx >= 0 && e.isIntersecting && !next[idx]) {
              next[idx] = true;
              changed = true;
            }
          }
          return changed ? next : prev;
        });
      },
      { threshold: 0.2 }
    );
    stepRefs.current.forEach((el) => { if (el) revealObs.observe(el); });
    observers.push(revealObs);

    // (b) Active observer — pick step whose center is closest to viewport center
    const activeObs = new IntersectionObserver(
      () => {
        const vh = window.innerHeight;
        const center = vh / 2;
        let bestIdx = activeStep;
        let bestDist = Infinity;
        stepRefs.current.forEach((el, i) => {
          if (!el) return;
          const r = el.getBoundingClientRect();
          if (r.bottom < 0 || r.top > vh) return;
          const elCenter = r.top + r.height / 2;
          const d = Math.abs(elCenter - center);
          if (d < bestDist) { bestDist = d; bestIdx = i; }
        });
        setActiveStep(bestIdx);
      },
      { threshold: [0, 0.25, 0.5, 0.75, 1] }
    );
    stepRefs.current.forEach((el) => { if (el) activeObs.observe(el); });
    observers.push(activeObs);

    return () => observers.forEach((o) => o.disconnect());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isVertical]);

  return (
    <div
      ref={containerRef}
      className={isVertical ? "" : "absolute z-0"}
      style={isVertical ? {
        width:          "100%",
        height:         "100%",
        display:        "flex",
        alignItems:     "center",
        justifyContent: "center",
        overflow:       "hidden",
        backgroundColor: C.purple,
        paddingTop:     "clamp(32px, 6vh, 56px)",
        paddingBottom:  "clamp(32px, 6vh, 56px)",
      } : {
        top:            0,
        bottom:         0,
        left:           LAYOUT.imageLeft,
        right:          0,
        display:        "flex",
        alignItems:     "center",
        justifyContent: "center",
        overflow:       "hidden",
        backgroundColor: C.purple,
      }}
    >
      {/* ── Inner wrapper: strip + content ── */}
      <div
        style={{
          display:       "flex",
          flexDirection: "row",
          alignItems:    "stretch",
          width:         isVertical ? "100%" : "clamp(460px, 50vw, 760px)",
          maxWidth:      isVertical ? "760px" : undefined,
        }}
      >
        {/* ════════════════════════════════════════════
            Vertical colour strip — Desktop only.
            Mobile uses per-number borderRight instead.
            ════════════════════════════════════════════ */}
        {!isVertical && (
          <div
            style={{
              width:           "1px",
              flexShrink:      0,
              overflow:        "hidden",
              transform:       `scaleY(${stripScale.toFixed(4)})`,
              transformOrigin: "top",
              willChange:      "transform",
              marginRight:     "36px",
              backgroundColor: "#f4f4f0",
              opacity:         0.3,
            }}
          />
        )}

        {/* ════════════════════════════════════════════
            Step list
            ════════════════════════════════════════════ */}
        <div
          style={{
            flex:          1,
            display:       "flex",
            flexDirection: "column",
            gap:           isVertical ? "clamp(24px, 4vh, 36px)" : "clamp(8px, 1.4vh, 20px)",
          }}
        >
          {/* Upper label — structural symmetry with "TELLIAN CAPITAL ÜBERNIMMT" */}
          <div style={{ marginBottom: isVertical ? "clamp(4px, 1vh, 8px)" : "clamp(8px, 1.4vh, 16px)" }}>
            <SectionDivider label="Ihre Ausgangslage" compact={isVertical} color="#f4f4f0" />
          </div>

          {STEPS.map((step, i) => {
            // Desktop uses scroll-driven progress; vertical uses IO state
            const sp = isVertical
              ? (stepInView[i] ? 1 : 0)
              : getItemP(scrolledPast, i, staggerPx, windowPx);

            const isActive  = isVertical && activeStep === i;
            const numColor  = "#f4f4f0";
            const descColor = "#f4f4f0";

            // Ordinal opacity boost when active in vertical mode
            const numOpacity = isVertical
              ? (isActive ? 1 : 0.5)
              : 1;

            return (
              <React.Fragment key={step.num}>

                {/* ── Section separator before step 03 (both modes) ── */}
                {i === 2 && (
                  <div
                    style={{
                      opacity: descriptionsFading || descriptionsHidden
                        ? 0
                        : (isVertical
                          ? (stepInView[i] ? 1 : 0)
                          : getItemP(scrolledPast, 1.6, staggerPx, windowPx)),
                      maxHeight: descriptionsFading || descriptionsHidden ? "0" : "100px",
                      marginTop: descriptionsFading || descriptionsHidden ? "0" : undefined,
                      marginBottom: descriptionsFading || descriptionsHidden ? "0" : undefined,
                      display:       "flex",
                      flexDirection: "row",
                      alignItems:    "center",
                      gap:           "14px",
                      paddingTop:    descriptionsFading || descriptionsHidden ? "0" : (isVertical ? "clamp(4px, 1vh, 8px)" : "clamp(10px, 1.6vh, 22px)"),
                      paddingBottom: descriptionsFading || descriptionsHidden ? "0" : (isVertical ? "clamp(4px, 1vh, 8px)" : "clamp(10px, 1.6vh, 22px)"),
                      overflow:      "hidden",
                      willChange:    "opacity, max-height",
                      transition:    descriptionsFading || descriptionsHidden
                        ? "opacity 400ms cubic-bezier(0.4, 0, 0.2, 1), max-height 500ms cubic-bezier(0.4, 0, 0.2, 1), padding 500ms cubic-bezier(0.4, 0, 0.2, 1)"
                        : (isVertical ? "opacity 600ms ease-out" : undefined),
                    }}
                  >
                    <SectionDivider label="Tellian Capital übernimmt" compact={isVertical} color="#f4f4f0" />
                  </div>
                )}

                {/* ── Step row ── */}
                <div
                  ref={(el) => { stepRefs.current[i] = el; }}
                  style={{
                    opacity:         sp,
                    transform:       isVertical
                      ? `translateY(${(1 - sp) * 30}px)`
                      : `scale(${(0.92 + 0.08 * sp).toFixed(4)})`,
                    transformOrigin: "left center",
                    willChange:      "opacity, transform",
                    display:         "flex",
                    flexDirection:   "row",
                    alignItems:      "flex-start",
                    gap:             isVertical ? "16px" : "20px",
                    transition:      isVertical
                      ? "opacity 600ms cubic-bezier(0.16, 1, 0.3, 1), transform 600ms cubic-bezier(0.16, 1, 0.3, 1)"
                      : undefined,
                  }}
                >
                  {/* Ordinal number — shared FLIP target on desktop;
                      on mobile: dedicated column with borderRight axis */}
                  {isVertical ? (
                    <div
                      style={{
                        width:       "56px",
                        flexShrink:  0,
                        display:     "flex",
                        alignItems:  "flex-start",
                        justifyContent: "center",
                        borderRight: `1px solid rgba(244,244,240,${isActive ? "0.5" : "0.15"})`,
                        paddingRight: "16px",
                        transition:  "border-color 350ms ease-out",
                      }}
                    >
                      <span
                        style={{
                          fontFamily: serif,
                          fontSize:   "clamp(36px, 10vw, 48px)",
                          fontWeight: 400,
                          color:      numColor,
                          opacity:    numOpacity,
                          lineHeight: 1,
                          display:    "block",
                          transition: "opacity 350ms ease-out",
                        }}
                      >
                        {step.num}
                      </span>
                    </div>
                  ) : (
                    <div
                      style={{
                        flexShrink: 0,
                        minWidth: `${ORDINAL_FONT_SIZE + 40}px`,
                        minHeight: `${ORDINAL_FONT_SIZE}px`,
                      }}
                    >
                      {!isDetailMode && (
                        <AnlageprozessStepOrdinal
                          num={step.num}
                          color={numColor}
                          opacity={numOpacity}
                          enableFlip={enableFlip}
                        />
                      )}
                    </div>
                  )}

                  {/* Title + description */}
                  <div style={{ paddingTop: isVertical ? "4px" : "12px", minWidth: 0, flex: isVertical ? 1 : undefined, width: isVertical ? undefined : undefined }}>
                    <span
                      style={{
                        fontFamily: serif,
                        fontSize:   isVertical ? "clamp(18px, 4.5vw, 22px)" : "28px",
                        color:      numColor,
                        display:    "block",
                        lineHeight: 1.2,
                      }}
                    >
                      {step.title}
                    </span>
                    <span
                      style={{
                        fontFamily: sans,
                        fontSize:   isVertical ? "13px" : "14px",
                        fontWeight: 400,
                        color:      descColor,
                        display:    "block",
                        marginTop:  isVertical ? "8px" : "10px",
                        lineHeight: 1.5,
                        opacity: descriptionsHidden ? 0 : descriptionsFading ? 0 : 0.65,
                        transform: descriptionsFading ? "translateY(4px)" : "translateY(0)",
                        transition: "opacity 500ms cubic-bezier(0.4, 0, 0.2, 1), transform 500ms cubic-bezier(0.4, 0, 0.2, 1)",
                      }}
                    >
                      {step.desc}
                    </span>
                  </div>
                </div>

              </React.Fragment>
            );
          })}

        </div>
      </div>
    </div>
  );
}