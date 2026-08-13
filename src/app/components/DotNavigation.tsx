import { useState, useRef, useLayoutEffect } from "react";

import { sans } from "../tokens";
import { SECTIONS } from "../sections";
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
        bottom: "clamp(16px, 2.5vh, 24px)",
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 150,
        height: "36px",
        padding: "0 20px",
        borderRadius: "18px",
        background: V.bg,
        backdropFilter: "blur(16px) saturate(120%)",
        WebkitBackdropFilter: "blur(16px) saturate(120%)",
        border: `0.5px solid ${V.border}`,
        display: "flex",
        alignItems: "center",
        gap: "clamp(16px, 2.5vw, 24px)",
        pointerEvents: "auto",
      }}
    >
      {/* Gleitende Markierung — ein einziges Element, das über dieselbe
          Dauer und Kurve wandert wie die Sektionsbewegung. Ein Element,
          das sich durchgehend bewegt, trägt die Kontinuität; sechs, die
          nacheinander umschalten, zerlegen sie in Sprünge. */}
      <span
        aria-hidden
        style={{
          position: "absolute",
          left: 0,
          top: marker.top,
          width: MARKER_W,
          height: MARKER_H,
          borderRadius: "1px",
          backgroundColor: V.indicator,
          transform: `translateX(${marker.x}px)`,
          opacity: marker.ready ? 1 : 0,
          transition: marker.ready
            ? `transform ${SCROLL_TUNING.SNAP_MS}ms ${EASE.snap}, opacity 200ms ease`
            : "none",
          pointerEvents: "none",
        }}
      />

      {SECTIONS.map((section, i) => {
        const isActive = activeIndex === i;
        return (
          <button
            key={section.key}
            ref={(el) => { buttonsRef.current[i] = el; }}
            onClick={() => onNavigate(i)}
            aria-label={section.label}
            aria-current={isActive ? "page" : undefined}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "4px",
              padding: 0,
              border: "none",
              background: "transparent",
              cursor: "pointer",
              outline: "none",
            }}
          >
            {/* Ruhender Punkt. Feste Höhe für alle Zustände, damit das
                Umschalten die Beschriftungen nicht verschiebt — die
                aktive Markierung liegt darüber und gleitet. */}
            <span
              aria-hidden
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                height: DOT_ROW_H,
                width: MARKER_W,
              }}
            >
              <span
                style={{
                  display: "block",
                  width: "4px",
                  height: "4px",
                  borderRadius: "50%",
                  backgroundColor: V.indicatorInactive,
                  opacity: isActive ? 0 : 1,
                  transition: `opacity ${SCROLL_TUNING.SNAP_MS}ms ${EASE.snap}`,
                }}
              />
            </span>

            {/* Label */}
            <span
              className="hidden sm:block"
              style={{
                fontFamily: sans,
                fontSize: "8px",
                letterSpacing: "0.16em",
                textTransform: "uppercase",
                lineHeight: 1,
                userSelect: "none",
                color: isActive ? V.text : V.textInactive,
                fontWeight: isActive ? 500 : 400,
                transition: `color ${SCROLL_TUNING.SNAP_MS}ms ${EASE.snap}`,
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
