// SYNC: These values MUST match the --tellian-* properties in theme.css.
// Single source of truth is theme.css. This file exists only because
// inline style={{ }} objects need JS values, not CSS var() references.
// When a color changes: update theme.css first, then this file.
//
// Brand Guidelines 2026 — Tellian Capital
// Imperial Purple #281F33 | Mushroom #B8AEA3 | Silver Mist #BFBFBF
// Archive White #F4F4F0  | Iron Veil #191718

export const C = {
  bg:           "#F4F4F0",   // Archive White
  bgSecondary:  "#ECEAE5",   // Archive White darkened
  dark:         "#191718",   // Iron Veil
  charcoal:     "#191718",   // Iron Veil
  stone:        "#8A857C",
  muted:        "#B8AEA3",   // Mushroom
  line:         "#D8D5CF",
  warm:         "#989071",
  subtle:       "#E8E6E1",
  accent:       "#6B665E",
  button:       "#B8AEA3",   // Mushroom
  buttonHover:  "#A69D93",   // Mushroom darkened
  dotInactive:  "#C8C5BB",
  dotActive:    "#8A8575",
  purple:       "#281F33",   // Imperial Purple
  silverMist:   "#BFBFBF",   // Silver Mist
  ink:          "#191718",   // Semantic: active typography (= Iron Veil)
  greigeSoft:   "#C8C3BA",   // Warm greige for inactive/subdued type
  partyKunde:   "#B8AEA3",   // Mushroom — Kunde block
  partyTellian: "#281F33",   // Imperial Purple — Tellian block
  partyBanken:  "#BFBFBF",   // Silver Mist — Banken block
} as const;

export const serif     = "'Lustria', serif";
export const sans      = "'Inter', sans-serif";
export const cormorant = "'Cormorant Garamond', serif";

// SYNC: These values MUST match --tellian-eyebrow-size-* in theme.css.
export const EYEBROW = {
  desktop: "10px",
  mobile:  "11px",
} as const;
