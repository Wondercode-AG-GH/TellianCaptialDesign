import { useEffect, useState } from "react";
import { CtaButton } from "./CtaButton";
import type { Breakpoint } from "./useBreakpoint";
import { ResponsiveImage } from "./ResponsiveImage";
import type { ImageId } from "../../assets/generated";

import { C, serif, sans } from "../tokens";
import { EASE } from "../../styles/motion";

const EASE_FADE = "ease-out";

interface HeroVerticalProps {
  /** Schlüssel im erzeugten Bildverzeichnis. */
  imageId: ImageId;
  introComplete: boolean;
  breakpoint: Breakpoint;
  onCtaClick: () => void;
}

/**
 * Hero — vertical layout for tablet and mobile.
 *
 * • Image: full-width, height = 55vw (clamped 220-320px)
 * • Body: 1 sentence on mobile, 2 sentences on tablet
 * • CTA: solid black, full width
 * • Tablet-only: 2-column grid (headline ║ body+CTA)
 * • Page-load stagger animation triggered after introComplete
 * • Animated scroll arrow that fades on first scroll
 */
export function HeroVertical({
  imageId,
  introComplete,
  breakpoint,
  onCtaClick,
}: HeroVerticalProps) {
  const isMobile = breakpoint === "mobile";
  const isTablet = breakpoint === "tablet";

  /* ── Animation trigger: starts shortly after introComplete ── */
  const [animate, setAnimate] = useState(false);
  useEffect(() => {
    if (!introComplete) return;
    const t = setTimeout(() => setAnimate(true), 50);
    return () => clearTimeout(t);
  }, [introComplete]);

  /* ── Scroll arrow visibility ──
     Visible on initial load; fades out once user has scrolled significantly. */
  const [arrowVisible, setArrowVisible] = useState(true);
  useEffect(() => {
    // Force scroll to top on mount so arrow is always visible initially
    // (prevents Chrome's scroll-restoration from hiding it on reload)
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }
    window.scrollTo(0, 0);

    const onScroll = () => {
      if (window.scrollY > 60) setArrowVisible(false);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /* ── Per-element transition factory ──
     Stagger delays match spec: 0.2/0.7/0.9/1.0/1.15/1.35/1.55/1.7 s */
  const fadeUp = (delayMs: number, durationMs = 600, distance = 24) => ({
    opacity: animate ? 1 : 0,
    transform: animate ? "translateY(0)" : `translateY(${distance}px)`,
    transition: `opacity ${durationMs}ms ${EASE_FADE} ${delayMs}ms, transform ${durationMs}ms ${EASE.standard} ${delayMs}ms`,
  });

  const fade = (delayMs: number, durationMs = 600) => ({
    opacity: animate ? 1 : 0,
    transition: `opacity ${durationMs}ms ${EASE_FADE} ${delayMs}ms`,
  });

  const slideX = (delayMs: number, durationMs = 450, distance = -16) => ({
    opacity: animate ? 1 : 0,
    transform: animate ? "translateX(0)" : `translateX(${distance}px)`,
    transition: `opacity ${durationMs}ms ${EASE_FADE} ${delayMs}ms, transform ${durationMs}ms ${EASE.standard} ${delayMs}ms`,
  });

  /* ── Spec timeline ── */
  const T = {
    image:    200,   // 0.2s — clip-path reveal
    eyebrow:  700,   // 0.7s
    accent:   900,   // 0.9s — width 0 → 24px
    line1:    1000,  // 1.0s — "Vermögen"
    line2:    1150,  // 1.15s — "mit Methode"
    body:     1350,  // 1.35s
    cta:      1550,  // 1.55s — slide-X
    trust:    1700,  // 1.7s
    arrow:    1900,  // 1.9s — bounce reveal slightly later
  } as const;

  /* ── Content text variants ── */
  const bodyText = isMobile
    ? "Quantitativ gestützt, unabhängig von Bankprodukten."
    : "Quantitativ gestützt, unabhängig von Bankprodukten. FINMA-lizenzierte Vermögensverwaltung mit Sitz in Zürich, seit 1996.";

  /* ── Tablet 2-column grid for text section ── */
  const textWrapperStyle: React.CSSProperties = isTablet
    ? {
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: "clamp(32px, 5vw, 64px)",
        alignItems: "start",
        padding: "clamp(28px, 5vw, 48px) clamp(24px, 6vw, 56px) 96px",
      }
    : {
        padding: "32px 20px 96px",
      };

  return (
    <section
      id="section-hero"
      className="relative"
      style={{
        minHeight: "100vh",
        backgroundColor: C.bg,
        paddingTop: 56, // below fixed nav
      }}
    >
      {/* ═══ IMAGE — clip-path reveal from bottom ═══ */}
      <div
        style={{
          width: "100%",
          height: "clamp(220px, 55vw, 320px)",
          overflow: "hidden",
          backgroundColor: C.bg,
        }}
      >
        <div
          style={{
            width: "100%",
            height: "100%",
            clipPath: animate ? "inset(0 0 0 0)" : "inset(100% 0 0 0)",
            transition: `clip-path 1000ms ${EASE.standard} ${T.image}ms`,
          }}
        >
          <ResponsiveImage
            id={imageId}
            alt="Zürich"
            sizes="100vw"
            priority
            className="w-full h-full"
            objectPosition="center"
          />
        </div>
      </div>

      {/* ═══ TEXT ═══ */}
      <div style={textWrapperStyle}>
        {/* Tablet: left column = eyebrow + accent + headline.
            Mobile: single column, stacked. */}
        <div>
          {/* Eyebrow */}
          <span
            style={{
              fontFamily: sans,
              fontSize: isMobile ? "10px" : "11px",
              letterSpacing: "0.18em",
              color: C.stone,
              display: "block",
              textTransform: "uppercase",
              ...fade(T.eyebrow, 600),
            }}
          >
            UNABHÄNGIGE VERMÖGENSVERWALTUNG · ZÜRICH · SEIT 1996
          </span>

          {/* Accent line — width 0 → 24px */}
          <div
            style={{
              height: "1.5px",
              backgroundColor: C.dark,
              marginTop: "16px",
              width: animate ? "24px" : "0px",
              transition: `width 400ms ${EASE.standard} ${T.accent}ms`,
            }}
          />

          {/* Headline — 2 lines, separately animated */}
          <h1
            style={{
              fontFamily: serif,
              fontSize: isMobile ? "clamp(36px, 11vw, 48px)" : "clamp(40px, 6vw, 64px)",
              lineHeight: 1.05,
              color: C.dark,
              letterSpacing: "-0.025em",
              marginTop: "20px",
              fontWeight: 400,
              margin: "20px 0 0 0",
            }}
          >
            <span style={{ display: "block", ...fadeUp(T.line1, 600, 24) }}>
              Vermögen
            </span>
            <span
              style={{
                display: "block",
                fontStyle: "italic",
                fontWeight: 400,
                ...fadeUp(T.line2, 600, 24),
              }}
            >
              mit Methode
            </span>
          </h1>
        </div>

        {/* Right column on tablet, continues stack on mobile */}
        <div>
          {/* Body */}
          <p
            style={{
              fontFamily: sans,
              fontSize: isMobile ? "14px" : "13px",
              color: C.charcoal,
              lineHeight: 1.6,
              maxWidth: "420px",
              marginTop: isTablet ? "0" : "24px",
              ...fadeUp(T.body, 500, 24),
            }}
          >
            {bodyText}
          </p>

          {/* CTA — solid, full width */}
          <div
            style={{
              marginTop: "24px",
              ...slideX(T.cta, 450, -16),
            }}
          >
            <CtaButton
              href="#contact"
              variant="solid"
              fullWidth
              onClick={(e) => { e.preventDefault(); onCtaClick(); }}
            >
              Gespräch vereinbaren
            </CtaButton>
          </div>

          {/* Trust line */}
          <div
            className="flex items-center gap-3"
            style={{
              marginTop: "16px",
              ...fade(T.trust, 400),
            }}
          >
            <div style={{ width: "16px", height: "1px", backgroundColor: C.muted }} />
            <span
              style={{
                fontFamily: sans,
                fontSize: "10px",
                letterSpacing: "0.16em",
                color: C.stone,
                textTransform: "uppercase",
              }}
            >
              FINMA-LIZENZIERT · ZÜRICH
            </span>
          </div>
        </div>
      </div>

      {/* ═══ Scroll arrow — bottom center, bounce, fades on scroll ═══ */}
      <div
        style={{
          position: "fixed",
          bottom: "24px",
          left: "50%",
          transform: "translateX(-50%)",
          opacity: animate && arrowVisible ? 1 : 0,
          transition: `opacity 400ms ${EASE_FADE} ${animate && arrowVisible ? T.arrow : 0}ms`,
          pointerEvents: "none",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "6px",
          zIndex: 40,
          padding: "8px 12px",
          backgroundColor: "rgba(249, 249, 247, 0.85)",
          backdropFilter: "blur(6px)",
          WebkitBackdropFilter: "blur(6px)",
          borderRadius: "16px",
        }}
        aria-hidden
      >
        <span
          style={{
            fontFamily: sans,
            fontSize: "9px",
            letterSpacing: "0.22em",
            textTransform: "uppercase",
            color: C.dark,
            fontWeight: 500,
          }}
        >
          Scrollen
        </span>
        <svg
          width="16"
          height="22"
          viewBox="0 0 14 20"
          fill="none"
          style={{
            animation: "tellian-bounce 2s ease-in-out infinite",
            color: C.dark,
          }}
        >
          <path
            d="M7 2 L7 17 M2 12 L7 17 L12 12"
            stroke="currentColor"
            strokeWidth="1.4"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
        </svg>
        <style>{`
          @keyframes tellian-bounce {
            0%, 100% { transform: translateY(0); }
            50%      { transform: translateY(4px); }
          }
        `}</style>
      </div>
    </section>
  );
}
