// SYNC: These values MUST match the --tellian-* properties in theme.css.
// Single source of truth is theme.css. This file exists only because
// inline style={{ }} objects need JS values, not CSS var() references.
// When a color changes: update theme.css first, then this file.

export const C = {
  bg:           "#F8F6F2",
  bgSecondary:  "#F2F1EC",
  dark:         "#1A1916",
  charcoal:     "#3A3835",
  stone:        "#8A857C",
  muted:        "#B0ACA5",
  line:         "#D8D5CF",
  warm:         "#989071",
  subtle:       "#E8E6E1",
  accent:       "#6B665E",
  dotInactive:  "#C8C5BB",
  dotActive:    "#8A8575",
} as const;

/* REBRAND: pending — update here AND in theme.css when final typeface is licensed */
export const serif = "'Cormorant Garamond', serif";
export const sans  = "'Inter', sans-serif";
