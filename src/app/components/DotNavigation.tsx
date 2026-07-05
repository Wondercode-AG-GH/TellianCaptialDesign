import { sans } from "../tokens";

const SECTIONS = [
  { label: "Start",       target: 0.000, threshold: 0.00 },
  { label: "Philosophie", target: 0.154, threshold: 0.08 },
  { label: "Mandat",      target: 0.309, threshold: 0.23 },
  { label: "Portfolio",   target: 0.463, threshold: 0.39 },
  { label: "Team",        target: 0.618, threshold: 0.54 },
  { label: "Kontakt",     target: 1.000, threshold: 0.94 },
];

const V = {
  bg: "var(--tellian-nav-bg)",
  text: "var(--tellian-nav-text)",
  textInactive: "var(--tellian-nav-text-inactive)",
  indicator: "var(--tellian-nav-indicator)",
  indicatorInactive: "var(--tellian-nav-indicator-inactive)",
  border: "var(--tellian-nav-border)",
};

function getActiveIndex(progress: number): number {
  let active = 0;
  for (let i = 1; i < SECTIONS.length; i++) {
    if (progress >= SECTIONS[i].threshold) active = i;
  }
  return active;
}

interface DotNavigationProps {
  scrollProgress: number;
  onNavigate: (target: number) => void;
}

export function DotNavigation({ scrollProgress, onNavigate }: DotNavigationProps) {
  const activeIndex = getActiveIndex(scrollProgress);

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
            key={i}
            onClick={() => onNavigate(section.target)}
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
