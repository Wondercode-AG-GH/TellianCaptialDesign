/* ═══════════════════════════════════════════════════════════
   BENUTZER-MODELL — speist Admin-Tabelle UND Kunden-Ansicht.
   PENDING: echte Mitarbeiter-/RM-Liste + reale Benutzer von Tellian.
   ═══════════════════════════════════════════════════════════ */

import type { L } from "./content";

/** Systemrolle — technische Keys. Anzeige-Labels in adminContent.ts */
export type UserRole = "admin" | "client" | "employee";

/** Konto-Lebenszyklus (NICHT doppelt mit mustChangePassword):
 *  - pending:  Konto angelegt, temporäres PW versandt, noch nie eingeloggt
 *  - active:   aktiv genutzt
 *  - inactive: deaktiviert (durch Admin)
 *  mustChangePassword ist orthogonal: ein aktives Konto kann
 *  mustChangePassword=true haben (Admin hat PW zurückgesetzt). */
export type UserStatus = "pending" | "active" | "inactive";

/** Relationship Manager — erweitert für spätere Kunden-Ansicht
 *  (Foto + Kontaktmöglichkeit "Ihren Berater erreichen"). */
export interface RelationshipManager {
  id: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  photo?: string;
}

export interface User {
  /** Eindeutige ID (z.B. CUST-10001, EMP-001, ADMIN-001) */
  id: string;

  /** Systemrolle */
  role: UserRole;

  /** Konto-Lebenszyklus */
  status: UserStatus;

  /** MFA aktiviert */
  mfaEnabled: boolean;

  /** Muss Passwort bei nächstem Login ändern
   *  (temporäres PW oder Admin-Reset). Orthogonal zu status. */
  mustChangePassword: boolean;

  /** Profil — speist auch Kunden-Ansicht */
  profile: {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    address?: string;
    zip?: string;
    city?: string;
  };

  /** Zugeordneter Relationship Manager (für Mandanten) */
  assignedRm?: RelationshipManager;

  /** Timestamps (ISO 8601) */
  createdAt: string;
  lastLogin?: string;
}

/** Rollen-Labels DE/EN (lokalisiert, nicht technische Keys als Anzeigetext) */
export const ROLE_LABELS: Record<UserRole, L> = {
  admin:    { de: "Administrator", en: "Administrator" },
  client:   { de: "Mandant", en: "Client" },
  employee: { de: "Interner Mitarbeiter", en: "Internal Employee" },
};

/** Status-Labels DE/EN */
export const STATUS_LABELS: Record<UserStatus, L> = {
  pending:  { de: "Ausstehend", en: "Pending" },
  active:   { de: "Aktiv", en: "Active" },
  inactive: { de: "Inaktiv", en: "Inactive" },
};
