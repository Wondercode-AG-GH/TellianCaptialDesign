import type { User } from "../types";

/* ═══════════════════════════════════════════════════════════
   DEMO-BENUTZER — offensichtliche Platzhalter.
   PENDING: echte Mitarbeiter-/RM-Liste + reale Benutzer von Tellian.
   Keine echten Namen verwenden. "Muster-Mandant", "RM Platzhalter"
   sind bewusst als Prototyp-Daten erkennbar.
   ═══════════════════════════════════════════════════════════ */

export const DEMO_USERS: User[] = [
  {
    id: "ADMIN-001",
    role: "admin",
    status: "active",
    mfaEnabled: true,
    mustChangePassword: false,
    profile: {
      firstName: "Admin",
      lastName: "Platzhalter",
      email: "admin@telliancapital.ch",
    },
    createdAt: "2024-01-15T09:00:00Z",
    lastLogin: "2026-07-14T08:30:00Z",
  },
  {
    id: "CUST-10001",
    role: "client",
    status: "active",
    mfaEnabled: true,
    mustChangePassword: false,
    profile: {
      firstName: "Muster-Mandant",
      lastName: "01",
      email: "mandant01@beispiel.ch",
      phone: "+41 44 000 00 01",
      address: "Musterstrasse 1",
      zip: "8001",
      city: "Zürich",
    },
    assignedRm: {
      id: "RM-A",
      firstName: "RM Platzhalter",
      lastName: "A",
      email: "rm.a@telliancapital.ch",
      phone: "+41 44 224 40 01",
    },
    createdAt: "2024-03-10T10:00:00Z",
    lastLogin: "2026-07-12T14:20:00Z",
  },
  {
    id: "CUST-10002",
    role: "client",
    status: "pending",
    mfaEnabled: false,
    mustChangePassword: true,
    profile: {
      firstName: "Muster-Mandant",
      lastName: "02",
      email: "mandant02@beispiel.ch",
      address: "Beispielweg 7",
      zip: "8002",
      city: "Zürich",
    },
    assignedRm: {
      id: "RM-B",
      firstName: "RM Platzhalter",
      lastName: "B",
      email: "rm.b@telliancapital.ch",
    },
    createdAt: "2026-07-10T11:00:00Z",
  },
  {
    id: "CUST-10003",
    role: "client",
    status: "inactive",
    mfaEnabled: false,
    mustChangePassword: false,
    profile: {
      firstName: "Muster-Mandant",
      lastName: "03 (Inaktiv)",
      email: "mandant03@beispiel.ch",
      zip: "8003",
      city: "Zürich",
    },
    createdAt: "2023-06-01T08:00:00Z",
    lastLogin: "2025-11-30T09:00:00Z",
  },
  {
    id: "EMP-001",
    role: "employee",
    status: "active",
    mfaEnabled: true,
    mustChangePassword: false,
    profile: {
      firstName: "Mitarbeiter",
      lastName: "Platzhalter",
      email: "mitarbeiter@telliancapital.ch",
    },
    createdAt: "2024-02-01T09:00:00Z",
    lastLogin: "2026-07-14T07:45:00Z",
  },
];
