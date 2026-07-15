import type { L } from "./content";

/* ═══════════════════════════════════════════════════════════
   ADMIN-STRINGS — DE/EN, zentral.
   Schweizer Rechtschreibung: kein ß.
   ═══════════════════════════════════════════════════════════ */

export const ADMIN = {
  nav: {
    userManagement: { de: "Benutzerverwaltung", en: "User Management" } as L,
    logout:         { de: "Abmelden", en: "Sign out" } as L,
  },

  title: {
    headline: { de: "Benutzerverwaltung.", en: "User Management." } as L,
    subtitle: {
      de: "Mandanten, Mitarbeitende und Administratoren verwalten.",
      en: "Manage clients, employees and administrators.",
    } as L,
    createButton: { de: "Benutzer erstellen", en: "Create user" } as L,
  },

  search: {
    placeholder: { de: "Suchen nach ID, Name, E-Mail\u2026", en: "Search by ID, name, email\u2026" } as L,
  },

  table: {
    colId:      { de: "Kunden-ID", en: "Client ID" } as L,
    colRole:    { de: "Rolle", en: "Role" } as L,
    colStatus:  { de: "Status", en: "Status" } as L,
    colMfa:     { de: "MFA", en: "MFA" } as L,
    colActions: { de: "Aktionen", en: "Actions" } as L,
    empty:      { de: "Keine Benutzer gefunden.", en: "No users found." } as L,
    loading:    { de: "Wird geladen\u2026", en: "Loading\u2026" } as L,
    error:      { de: "Fehler beim Laden der Benutzer.", en: "Error loading users." } as L,
  },

  mfa: {
    on:  { de: "Ein", en: "On" } as L,
    off: { de: "Aus", en: "Off" } as L,
  },

  actions: {
    deactivate:     { de: "Deaktivieren", en: "Deactivate" } as L,
    activate:       { de: "Aktivieren", en: "Activate" } as L,
    enableMfa:      { de: "MFA aktivieren", en: "Enable MFA" } as L,
    disableMfa:     { de: "MFA deaktivieren", en: "Disable MFA" } as L,
    resetPassword:  { de: "Passwort zurücksetzen", en: "Reset password" } as L,
    impersonate:    { de: "Als Benutzer anmelden", en: "Sign in as user" } as L,
  },

  confirm: {
    deactivateTitle:   { de: "Benutzer deaktivieren", en: "Deactivate user" } as L,
    deactivateBody:    {
      de: (id: string) => `Möchten Sie das Konto ${id} wirklich deaktivieren?`,
      en: (id: string) => `Do you really want to deactivate account ${id}?`,
    },
    resetTitle:        { de: "Passwort zurücksetzen", en: "Reset password" } as L,
    resetBody:         {
      de: (id: string) => `Ein neues temporäres Passwort wird für ${id} erstellt. Der Mandant muss beim nächsten Login ein neues Passwort festlegen.`,
      en: (id: string) => `A new temporary password will be created for ${id}. The client must set a new password on next login.`,
    },
    impersonateTitle:  { de: "Als Benutzer anmelden", en: "Sign in as user" } as L,
    impersonateBody:   {
      de: (id: string) => `Sie werden das Portal als ${id} sehen. Alle Aktionen werden protokolliert.`,
      en: (id: string) => `You will see the portal as ${id}. All actions will be logged.`,
    },
    cancel:  { de: "Abbrechen", en: "Cancel" } as L,
    confirm: { de: "Bestätigen", en: "Confirm" } as L,
  },

  impersonation: {
    banner: {
      de: (id: string) => `Sie sehen das Portal als ${id}`,
      en: (id: string) => `You are viewing the portal as ${id}`,
    },
    end: { de: "Impersonation beenden", en: "End impersonation" } as L,
  },

  createModal: {
    title:    { de: "Neuen Benutzer erstellen", en: "Create new user" } as L,
    subtitle: { de: "Alle Pflichtfelder ausfüllen. Das temporäre Passwort wird automatisch generiert.", en: "Fill in all required fields. The temporary password is generated automatically." } as L,
    roleLabel:      { de: "Rolle", en: "Role" } as L,
    clientIdLabel:  { de: "Kunden-ID", en: "Client ID" } as L,
    /* PENDING: echtes Kunden-ID-Format von Tellian bestätigen. */
    clientIdPlaceholder: { de: "z.\u00A0B. CUST-20001", en: "e.g. CUST-20001" } as L,
    tempPwLabel:    { de: "Temporäres Passwort", en: "Temporary password" } as L,
    generateLabel:  { de: "Neu generieren", en: "Regenerate" } as L,
    copyLabel:      { de: "Kopieren", en: "Copy" } as L,
    copiedLabel:    { de: "Kopiert", en: "Copied" } as L,
    firstNameLabel: { de: "Vorname", en: "First name" } as L,
    lastNameLabel:  { de: "Nachname", en: "Last name" } as L,
    emailLabel:     { de: "E-Mail", en: "Email" } as L,
    phoneLabel:     { de: "Telefon", en: "Phone" } as L,
    addressLabel:   { de: "Adresse", en: "Address" } as L,
    zipLabel:       { de: "PLZ", en: "ZIP" } as L,
    cityLabel:      { de: "Ort", en: "City" } as L,
    rmLabel:        { de: "Zugeordneter RM", en: "Assigned RM" } as L,
    rmNone:         { de: "Keinen RM zuordnen", en: "No RM assigned" } as L,
    cancelBtn:      { de: "Abbrechen", en: "Cancel" } as L,
    createBtn:      { de: "Erstellen", en: "Create" } as L,
    creatingBtn:    { de: "Wird erstellt\u2026", en: "Creating\u2026" } as L,
    successMsg:     {
      de: (id: string) => `Benutzer ${id} wurde erstellt.`,
      en: (id: string) => `User ${id} has been created.`,
    },
  },
} as const;
