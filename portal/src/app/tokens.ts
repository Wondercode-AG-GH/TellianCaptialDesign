// SYNC: These values MUST match the --tellian-* properties in theme.css (main site).
// Brand Guidelines 2026 — Tellian Capital

export const C = {
  bg:           "#F4F4F0",   // Archive White
  bgSecondary:  "#ECEAE5",   // Archive White darkened
  dark:         "#191718",   // Iron Veil
  charcoal:     "#191718",   // Iron Veil
  stone:        "#8A857C",
  /* Kleine Schrift (Labels, Metazeilen) auf Archive White: #8A857C
     erreicht nur 3.3:1, dieser Ton 5.4:1 (bzw. 5.0:1 auf bgSecondary). */
  stoneText:    "#68635A",
  muted:        "#B8AEA3",   // Mushroom
  line:         "#D8D5CF",
  subtle:       "#E8E6E1",
  button:       "#B8AEA3",   // Mushroom
  buttonHover:  "#A69D93",   // Mushroom darkened
  purple:       "#281F33",   // Imperial Purple
  // Form/status states
  error:        "#B5453A",
  errorBg:      "#FDF2F1",
  warning:      "#A68B3C",
  warningBg:    "#FBF7EE",
  success:      "#3D7B5F",
  successBg:    "#F0F7F3",
} as const;

export const serif = "'Lustria', serif";
export const sans  = "'Inter', sans-serif";
