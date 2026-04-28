import { useRef, useState, useEffect } from "react";
import { motion } from "motion/react";
import { usePrefersReducedMotion } from "./usePrefersReducedMotion";
import { C, serif, sans } from "../tokens";

/* ── Card data ── */
const CARDS = [
  {
    key: "topdown",
    eyebrow: "Globale Perspektive",
    title: "Top-Down",
    bullets: [
      "Makroindikatoren und Konjunkturzyklen",
      "Systematische Bewertung der Anlageklassen",
      "Strategischer Horizont: 3–5 Jahre",
    ],
  },
  {
    key: "bottomup",
    eyebrow: "Einzeltitel-Perspektive",
    title: "Bottom-Up",
    bullets: [
      "Quantitative Modelle und Datenanalyse",
      "Technische Analyse und Marktpsychologie",
      "Kurzfristige Trends und Opportunitäten",
    ],
  },
] as const;

/* ── CSS variable references for easy rebrand ── */
const V = {
  cardBg: "var(--tellian-card-bg)",
  cardText: "var(--tellian-card-text)",
  cardBullet: "var(--tellian-card-bullet)",
  cardEyebrow: "var(--tellian-card-eyebrow)",
  goldBg: "var(--tellian-accent-gold)",
  goldText: "var(--tellian-accent-gold-text)",
};

interface Props {
  scrollX: number;
  isVertical?: boolean;
  isDetailMode?: boolean;
}

export function Section4TopDownBottomUp({
  scrollX,
  isVertical = false,
  isDetailMode = false,
}: Props) {
  const reducedMotion = usePrefersReducedMotion();
  const canFlip = !isVertical && !reducedMotion;

  /* ── Viewport entry detection for mobile ── */
  const containerRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!isVertical) return;
    const el = containerRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold: 0.2 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [isVertical]);

  const isMobile = isVertical;
  const cardPad = isMobile ? "32px" : "40px";
  const headlineSize = isMobile ? "clamp(32px, 8vw, 40px)" : "clamp(48px, 5vh, 56px)";
  const bulletDash = isMobile ? "12px" : "14px";

  return (
    <div
      ref={containerRef}
      className={isVertical ? "" : "absolute z-0"}
      style={isVertical ? {
        width: "100%",
        display: "flex",
        justifyContent: "center",
        padding: isMobile ? "32px 16px" : "40px 32px",
      } : {
        top: 0,
        bottom: 0,
        left: "44vw",
        right: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "0 clamp(24px, 3vw, 48px)",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: isMobile ? "600px" : "680px",
          opacity: isDetailMode ? 0 : 1,
          transform: isDetailMode ? "scale(0.96)" : "scale(1)",
          transition: "opacity 400ms ease-out, transform 400ms ease-out",
        }}
      >
        {/* Cards row */}
        <div
          style={{
            display: "flex",
            flexDirection: isMobile ? "column" : "row",
            gap: "20px",
          }}
        >
          {CARDS.map((card) => (
            <div
              key={card.key}
              style={{
                flex: 1,
                background: V.cardBg,
                padding: cardPad,
                display: "flex",
                flexDirection: "column",
              }}
            >
              {/* Eyebrow */}
              <span
                style={{
                  fontFamily: sans,
                  fontSize: "10px",
                  letterSpacing: "0.2em",
                  textTransform: "uppercase",
                  color: V.cardEyebrow,
                }}
              >
                {card.eyebrow}
              </span>

              {/* Headline — FLIP target */}
              {isDetailMode ? null : canFlip ? (
                <motion.h3
                  layoutId={`strategy-${card.key}`}
                  style={{
                    fontFamily: serif,
                    fontSize: headlineSize,
                    lineHeight: 1.02,
                    letterSpacing: "-0.02em",
                    color: V.cardText,
                    fontWeight: 400,
                    margin: "12px 0 0 0",
                  }}
                  transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                >
                  {card.title}
                </motion.h3>
              ) : (
                <h3
                  style={{
                    fontFamily: serif,
                    fontSize: headlineSize,
                    lineHeight: 1.02,
                    letterSpacing: "-0.02em",
                    color: V.cardText,
                    fontWeight: 400,
                    margin: "12px 0 0 0",
                  }}
                >
                  {card.title}
                </h3>
              )}

              {/* Bullets */}
              <ul
                style={{
                  listStyle: "none",
                  padding: 0,
                  margin: "24px 0 0 0",
                  display: "flex",
                  flexDirection: "column",
                  gap: "16px",
                }}
              >
                {card.bullets.map((text, j) => (
                  <li
                    key={j}
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: isMobile ? "12px" : "16px",
                      fontFamily: sans,
                      fontSize: isMobile ? "14px" : "15px",
                      color: V.cardText,
                      lineHeight: 1.5,
                    }}
                  >
                    <span
                      aria-hidden
                      style={{
                        display: "inline-block",
                        width: bulletDash,
                        height: "1px",
                        backgroundColor: V.cardBullet,
                        flexShrink: 0,
                        marginTop: "11px",
                      }}
                    />
                    <span>{text}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Gold bar — connecting sockel under both cards */}
        <div
          style={{
            background: V.goldBg,
            padding: isMobile ? "20px 32px" : "22px 40px",
            marginTop: isMobile ? "20px" : 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <span
            style={{
              fontFamily: sans,
              fontSize: isMobile ? "12px" : "14px",
              fontWeight: 500,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: isMobile ? C.dark : V.goldText,
            }}
          >
            Anlageentscheid
          </span>
          <span
            style={{
              fontFamily: sans,
              fontSize: isMobile ? "12px" : "14px",
              color: isMobile ? C.stone : V.goldText,
              margin: "0 8px",
            }}
          >
            ·
          </span>
          <span
            style={{
              fontFamily: sans,
              fontSize: isMobile ? "12px" : "14px",
              fontWeight: 500,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: isMobile ? C.dark : V.goldText,
            }}
          >
            Anlagekomitee
          </span>
        </div>
      </div>
    </div>
  );
}
