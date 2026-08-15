import { useState, useRef, useLayoutEffect } from "react";

import { sans } from "../tokens";
import { SECTIONS, sectionOrdinal } from "../sections";
import { EASE } from "../../styles/motion";
import { SCROLL_TUNING } from "./useHorizontalScroll";

/** Masse der gleitenden Markierung. */
const MARKER_W = 12;
const MARKER_H = 1.5;
/** Höhe der Punktzeile — konstant, damit nichts springt. */
const DOT_ROW_H = 4;

/* Ziele und Beschriftungen kommen aus der Registry. Vorher lag hier
   eine zweite, von Hand gepflegte Tabelle mit Progress-Werten, die von
   einer Gesamtbreite von 764vw ausging — die es nie gab. */

const V = {
  bg: "var(--tellian-nav-bg)",
  text: "var(--tellian-nav-text)",
  textInactive: "var(--tellian-nav-text-inactive)",
  indicator: "var(--tellian-nav-indicator)",
  indicatorInactive: "var(--tellian-nav-indicator-inactive)",
  border: "var(--tellian-nav-border)",
};

interface DotNavigationProps {
  /** Aktive Sektion, direkt aus der Registry — keine Schwellenwerte. */
  activeIndex: number;
  onNavigate: (index: number) => void;
}

export function DotNavigation({ activeIndex, onNavigate }: DotNavigationProps) {
  /* Die Markierung wandert über dieselbe Dauer wie ein befohlener
     Sprung. Beim freien Scrollen wechselt sie, sobald eine andere
     Sektion die Bildmitte überdeckt — dann ist das Gleiten eine
     Zustandsänderung, keine Begleitung einer Fahrt. */
  const durationMs = SCROLL_TUNING.JUMP_MS;
  const navRef = useRef<HTMLElement>(null);
  const buttonsRef = useRef<(HTMLButtonElement | null)[]>([]);
  /** Waagrechte Mitten der Punktzeilen, relativ zur Leiste. */
  const [centers, setCenters] = useState<number[]>([]);
  const [dotTop, setDotTop] = useState(0);

  /* Positionen messen statt rechnen: die Abstände sind clamp()-basiert
     und hängen an der Viewportbreite. */
  useLayoutEffect(() => {
    const measure = () => {
      const buttons = buttonsRef.current;
      if (!buttons[0]) return;
      setCenters(buttons.map((b) => (b ? b.offsetLeft + b.offsetWidth / 2 : 0)));
      setDotTop(buttons[0].offsetTop + (DOT_ROW_H - MARKER_H) / 2);
    };

    measure();
    const observer = new ResizeObserver(measure);
    if (navRef.current) observer.observe(navRef.current);
    window.addEventListener("resize", measure);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, []);

  const center = centers[activeIndex];
  const marker = {
    ready: center !== undefined,
    x: (center ?? 0) - MARKER_W / 2,
    top: dotTop,
  };

  return (
    <nav
      ref={navRef}
      aria-label="Sektion-Navigation"
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 150,
        height: "var(--tellian-station-height)",
        /* Die Leiste liegt über der Schiene (z 150 gegen z 50) und
           würde deren unteres Ende sonst überdecken. Linker Versatz
           deshalb um die Schienenbreite erhöht — derselbe Streifen,
           den auch die Bühne freihält. */
        paddingLeft: "calc(var(--tellian-rail-width) + clamp(28px, 3.4vw, 56px))",
        paddingRight: "clamp(28px, 3.4vw, 56px)",
        borderTop: `1px solid ${V.border}`,
        background: V.bg,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "clamp(12px, 2vw, 32px)",
        pointerEvents: "auto",
      }}
    >
      {SECTIONS.map((section, i) => {
        const isActive = activeIndex === i;
        return (
          <button
            key={section.key}
            ref={(el) => { buttonsRef.current[i] = el; }}
            onClick={() => onNavigate(i)}
            aria-current={isActive ? "page" : undefined}
            style={{
              display: "flex",
              alignItems: "baseline",
              gap: "10px",
              padding: 0,
              border: "none",
              background: "transparent",
              cursor: "pointer",
              outline: "none",
              whiteSpace: "nowrap",
              minWidth: 0,
            }}
          >
            {/* Ziffer — Mushroom, auch im aktiven Zustand. Sie zählt,
                sie hebt nicht hervor. */}
            <span
              aria-hidden
              style={{
                fontFamily: sans,
                fontSize: "var(--tellian-station-size)",
                color: "var(--tellian-station-numeral)",
                fontVariantNumeric: "tabular-nums",
                flexShrink: 0,
              }}
            >
              {sectionOrdinal(i)}
            </span>

            <span
              style={{
                fontFamily: sans,
                fontSize: "var(--tellian-station-size)",
                letterSpacing: "0.01em",
                lineHeight: 1.2,
                userSelect: "none",
                overflow: "hidden",
                textOverflow: "ellipsis",
                color: isActive
                  ? "var(--tellian-station-label)"
                  : "var(--tellian-station-inactive)",
                transition: `color ${durationMs}ms ${EASE.snap}`,
              }}
            >
              {section.label}
            </span>
          </button>
        );
      })}

      {/* Fallback for browsers without backdrop-filter */}
      <style>{`
        @supports not (backdrop-filter: blur(24px)) {
          nav[aria-label="Sektion-Navigation"] {
            background: rgba(255, 255, 255, 0.8) !important;
          }
        }
      `}</style>
    </nav>
  );
}
