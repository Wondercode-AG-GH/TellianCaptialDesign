/**
 * Motion tokens — easing curves and durations.
 *
 * CSS strings for inline style={{ transition: `... ${EASE.standard}` }}.
 * Framer Motion arrays for <motion.div transition={{ ease: EASE.standardArr }}>.
 */

export const EASE = {
  /** Primary easing — ~80% of all animations (accent-lines, overlays, fades). */
  standard: "cubic-bezier(0.16, 1, 0.3, 1)",
  standardArr: [0.16, 1, 0.3, 1] as [number, number, number, number],

  /** Closing/collapsing — overlays, accordions. */
  in: "cubic-bezier(0.4, 0, 0.2, 1)",
  inArr: [0.4, 0, 0.2, 1] as [number, number, number, number],

  /** Navigation panel slide. */
  nav: "cubic-bezier(0.25, 0.1, 0.25, 1)",
  navArr: [0.25, 0.1, 0.25, 1] as [number, number, number, number],
} as const;

export const DURATION = {
  fast: 200,
  normal: 300,
  medium: 400,
  slow: 600,
  cinematic: 800,
  valueCycle: 3000,       // LeistungsethikStage auto-cycle interval
  valueCyclePause: 6000,  // Resume delay after interaction
} as const;

/** Scroll-driven zoom animation tokens for ParteiDreieck (scroll-lock section).
 *  Apple-style: zoom into scene, parallax depth layers, progressive reveal. */
export const SCROLL = {
  /** Section width in vw (110 = normal, extra = scroll-lock distance) */
  sectionWidthVw: 180,
  /** Scene zoom range (scale) */
  zoomFrom: 0.72,
  zoomTo: 1.10,
  /** Party icon reveal stagger (fraction 0→1) — Kunde / Tellian / Banken */
  partyRevealStart: [0.08, 0.0, 0.16] as readonly [number, number, number],
  /** Reveal span per party */
  partyRevealSpan: 0.20,
  /** Feature cards reveal start */
  featureRevealStart: 0.38,
  /** Stagger between individual features */
  featureStagger: 0.04,
  /** Feature reveal span per item */
  featureRevealSpan: 0.12,
  /** Keynote text reveal — settle phase after zoom completes (~0.77) */
  keynoteStart: 0.82,
  keynoteSpan: 0.16,
  /** Parallax depth (px vertical shift over full progress) */
  parallaxFg: 24,    // foreground: icons
  parallaxMg: 12,    // midground: features
  parallaxBg: 4,     // background: keynote / structure
  /** Hexagon pop-in/out animation */
  hexPopInMs: 300,
  hexPopInStagger: 70,
  hexPopOutMs: 250,
  hexScaleIn: 0.5,
  hexScaleOut: 0.85,
  /** Hexagon idle float */
  hexFloatPx: 3,
  hexFloatMs: 3000,
} as const;
