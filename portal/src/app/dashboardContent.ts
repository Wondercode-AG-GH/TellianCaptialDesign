import type { L } from "./content";

/* ═══════════════════════════════════════════════════════════
   KUNDEN-DASHBOARD STRINGS — DE/EN, zentral.
   Schweizer Rechtschreibung: kein ß.
   ═══════════════════════════════════════════════════════════ */

export const DASHBOARD = {
  nav: {
    reports:  { de: "Ihre Berichte", en: "Your Reports" } as L,
    logout:   { de: "Abmelden", en: "Sign out" } as L,
  },

  greeting: {
    welcome: {
      de: (firstName: string) => `Willkommen, ${firstName}.`,
      en: (firstName: string) => `Welcome, ${firstName}.`,
    },
  },

  reports: {
    headline:  { de: "Ihre Berichte.", en: "Your Reports." } as L,
    count: {
      de: (n: number) => `${n} Dokument${n !== 1 ? "e" : ""} verfügbar`,
      en: (n: number) => `${n} document${n !== 1 ? "s" : ""} available`,
    },
    search:    { de: "Berichte suchen\u2026", en: "Search reports\u2026" } as L,
    sortLabel: { de: "Sortieren nach", en: "Sort by" } as L,
    sortNewest:   { de: "Neueste zuerst", en: "Newest first" } as L,
    sortOldest:   { de: "Älteste zuerst", en: "Oldest first" } as L,
    sortTitleAsc: { de: "Titel A\u2013Z", en: "Title A\u2013Z" } as L,
    sortTitleDesc:{ de: "Titel Z\u2013A", en: "Title Z\u2013A" } as L,
    download:  { de: "Herunterladen", en: "Download" } as L,
    empty:     { de: "Noch keine Berichte verfügbar.", en: "No reports available yet." } as L,
    loading:   { de: "Berichte werden geladen\u2026", en: "Loading reports\u2026" } as L,
    error:     { de: "Fehler beim Laden der Berichte.", en: "Error loading reports." } as L,
  },

  rm: {
    headline: { de: "Ihr Relationship Manager", en: "Your Relationship Manager" } as L,
    contact:  { de: "Kontakt aufnehmen", en: "Get in touch" } as L,
    noRm:     { de: "Noch kein RM zugeordnet.", en: "No RM assigned yet." } as L,
    fallbackInitials: {
      de: "Kein Foto verfügbar",
      en: "No photo available",
    } as L,
  },

  profile: {
    headline: { de: "Ihr Profil", en: "Your Profile" } as L,
    address:  { de: "Adresse", en: "Address" } as L,
    email:    { de: "E-Mail", en: "Email" } as L,
    phone:    { de: "Telefon", en: "Phone" } as L,
  },

  trust: { de: "FINMA-lizenziert \u00B7 Zürich", en: "FINMA-licensed \u00B7 Zurich" } as L,
} as const;
