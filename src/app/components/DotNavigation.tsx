import { sans } from "../tokens";
import { SECTIONS } from "../sections";

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
  return (
    <nav
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
      {SECTIONS.map((section, i) => {
        const isActive = activeIndex === i;
        return (
          <button
            key={section.key}
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
            {/* Indicator */}
            <span
              aria-hidden
              style={{
                display: "block",
                width: isActive ? "12px" : "4px",
                height: isActive ? "1.5px" : "4px",
                borderRadius: isActive ? "1px" : "50%",
                backgroundColor: isActive ? V.indicator : V.indicatorInactive,
                transition: "all 200ms ease",
              }}
            />

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
                transition: "color 200ms ease",
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
