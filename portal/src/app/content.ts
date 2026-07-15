export type Locale = "de" | "en";
export type L = Record<Locale, string>;

/* PENDING: Passwort-Policy — echte Regeln vom Backend/Tellian bestätigen.
   Aktuelle Regeln sind Prototyp-Annahme. Struktur ist bewusst konfigurierbar:
   Regeln hinzufügen/entfernen/ändern = nur dieses Array anpassen. */
export interface PasswordRule {
  id: string;
  label: L;
  test: (pw: string) => boolean;
}

export const PASSWORD_RULES: PasswordRule[] = [
  {
    id: "length",
    label: { de: "Mindestens 8 Zeichen", en: "At least 8 characters" },
    test: (pw) => pw.length >= 8,
  },
  {
    id: "uppercase",
    label: { de: "Mindestens ein Grossbuchstabe", en: "At least one uppercase letter" },
    test: (pw) => /[A-Z]/.test(pw),
  },
  {
    id: "lowercase",
    label: { de: "Mindestens ein Kleinbuchstabe", en: "At least one lowercase letter" },
    test: (pw) => /[a-z]/.test(pw),
  },
  {
    id: "digit",
    label: { de: "Mindestens eine Zahl", en: "At least one number" },
    test: (pw) => /\d/.test(pw),
  },
  {
    id: "special",
    label: { de: "Mindestens ein Sonderzeichen", en: "At least one special character" },
    test: (pw) => /[^A-Za-z0-9]/.test(pw),
  },
];

export const CONTENT = {
  backLink: { de: "Zurück zur Hauptseite", en: "Back to main site" } as L,

  client: {
    eyebrow:   { de: "Mandanten-Portal", en: "Client Portal" } as L,
    headline:  { de: "Willkommen zurück.", en: "Welcome back." } as L,
    intro:     {
      de: "Melden Sie sich an, um Ihr Portfolio, Berichte und Dokumente einzusehen.",
      en: "Sign in to view your portfolio, reports and documents.",
    } as L,
    idLabel:   { de: "Kunden-ID", en: "Client ID" } as L,
    /* PENDING: echtes Kunden-ID-Format von Tellian bestätigen —
       evtl. erfundenes Beispiel (CUST-12345). */
    idPlaceholder: { de: "z.\u00A0B. CUST-12345", en: "e.g. CUST-12345" } as L,
    switchLink: { de: "Mitarbeiter-Login", en: "Employee login" } as L,
  },

  employee: {
    eyebrow:   { de: "Mitarbeiter-Portal", en: "Employee Portal" } as L,
    headline:  { de: "Willkommen zurück.", en: "Welcome back." } as L,
    intro:     {
      de: "Melden Sie sich mit Ihrer Firmen-E-Mail an.",
      en: "Sign in with your company email.",
    } as L,
    emailLabel: { de: "E-Mail", en: "Email" } as L,
    emailPlaceholder: { de: "name@telliancapital.ch", en: "name@telliancapital.ch" } as L,
    switchLink: { de: "Kunden-Login", en: "Client login" } as L,
  },

  shared: {
    passwordLabel: { de: "Passwort", en: "Password" } as L,
    submit:        { de: "Anmelden", en: "Sign in" } as L,
    loading:       { de: "Wird angemeldet\u2026", en: "Signing in\u2026" } as L,
    trust:         { de: "FINMA-lizenziert \u00B7 Zürich", en: "FINMA-licensed \u00B7 Zurich" } as L,
  },

  setPassword: {
    eyebrow:  { de: "Mandanten-Portal", en: "Client Portal" } as L,
    headline: { de: "Passwort festlegen.", en: "Set your password." } as L,
    intro:    {
      de: "Legen Sie ein persönliches Passwort für Ihr Konto fest. Das temporäre Passwort verliert danach seine Gültigkeit.",
      en: "Set a personal password for your account. The temporary password will expire afterwards.",
    } as L,
    newPasswordLabel:     { de: "Neues Passwort", en: "New password" } as L,
    confirmPasswordLabel: { de: "Passwort wiederholen", en: "Confirm password" } as L,
    submit:  { de: "Passwort speichern", en: "Save password" } as L,
    loading: { de: "Wird gespeichert\u2026", en: "Saving\u2026" } as L,
    requirementsLabel: { de: "Anforderungen", en: "Requirements" } as L,
    /* Fortschritts-Label (NICHT "Stärke" — siehe Diagnose Punkt 2a).
       PENDING: Für echte Stärkemessung später zxcvbn evaluieren. */
    progressLabel: {
      de: (n: number, total: number) => `${n} von ${total} erfüllt`,
      en: (n: number, total: number) => `${n} of ${total} met`,
    },
    mismatch: {
      de: "Die Passwörter stimmen nicht überein.",
      en: "Passwords do not match.",
    } as L,
    successHeadline: { de: "Passwort gespeichert.", en: "Password saved." } as L,
    successIntro: {
      de: "Ihr persönliches Passwort wurde festgelegt. Sie werden jetzt zum Portal weitergeleitet.",
      en: "Your personal password has been set. You will now be redirected to the portal.",
    } as L,
  },

  errors: {
    required:       { de: "Pflichtfeld", en: "Required" } as L,
    invalidEmail:   { de: "Ungültige E-Mail-Adresse", en: "Invalid email address" } as L,
    invalidCredentials: {
      de: "Kunden-ID oder Passwort ist ungültig.",
      en: "Client ID or password is invalid.",
    } as L,
    invalidCredentialsEmployee: {
      de: "E-Mail oder Passwort ist ungültig.",
      en: "Email or password is invalid.",
    } as L,
  },
} as const;
