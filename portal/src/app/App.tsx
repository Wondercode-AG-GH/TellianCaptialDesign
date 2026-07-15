import { useState, useCallback } from "react";
import { LanguageProvider, useLanguage } from "./context/LanguageContext";
import { LoginPage } from "./components/LoginPage";
import { SetPasswordPage } from "./components/SetPasswordPage";
import { AdminPage } from "./components/AdminPage";
import { ClientDashboard } from "./components/ClientDashboard";
import { ADMIN } from "./adminContent";
import { DEMO_USERS } from "./data/demoUsers";
import type { User } from "./types";
import { C, serif, sans } from "./tokens";

/* ═══════════════════════════════════════════════════════════
   STATE ROUTER — login | set-password | portal | admin
   UI-Prototyp: simulierter View-Router, keine echte Auth.
   Erzwingung (mustChangePassword vor Portalzugriff, Rollentrennung)
   muss im echten System serverseitig passieren.
   ═══════════════════════════════════════════════════════════ */
type View = "login" | "set-password" | "portal" | "admin";

/* PENDING: Echte Impersonation braucht serverseitiges Audit-Log
   (wer/wann/wen) + evtl. Einwilligung/Zeitlimit — Compliance,
   nicht Frontend. */
interface ImpersonationState {
  active: boolean;
  userId: string;
}

function AppInner() {
  const { lang } = useLanguage();
  const [view, setView] = useState<View>("login");
  /* PENDING/SECURITY: currentUser im Prototyp aus Demo-Liste per userId.
     Echt: User NUR aus serverseitigem Session-Token nach Auth, nie
     clientseitiger Lookup — sonst könnte jede userId untergeschoben werden. */
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [impersonation, setImpersonation] = useState<ImpersonationState>({
    active: false,
    userId: "",
  });

  /* PENDING/SECURITY: Rolle im Prototyp aus ID-Prefix simuliert. Im echten
     System kommt die Rolle AUSSCHLIESSLICH aus dem serverseitigen
     Token/Session — NIE aus der Client-Eingabe. Prefix-Logik darf nie in
     echte Autorisierung übernommen werden. */
  const handleLoginSuccess = useCallback(
    (result: { mustChangePassword: boolean; role?: string; userId?: string }) => {
      /* Lookup user from demo data */
      const user = DEMO_USERS.find((u) => u.id === result.userId) || null;
      setCurrentUser(user);

      if (result.mustChangePassword) {
        setView("set-password");
      } else if (result.role === "admin" || result.role === "employee") {
        setView("admin");
      } else {
        setView("portal");
      }
    },
    []
  );

  const handleSetPasswordSuccess = useCallback(() => {
    setView("portal");
  }, []);

  const handleLogout = useCallback(() => {
    setCurrentUser(null);
    setImpersonation({ active: false, userId: "" });
    setView("login");
  }, []);

  const handleImpersonate = useCallback((userId: string) => {
    const user = DEMO_USERS.find((u) => u.id === userId) || null;
    setCurrentUser(user);
    setImpersonation({ active: true, userId });
    setView("portal");
  }, []);

  const handleEndImpersonation = useCallback(() => {
    setImpersonation({ active: false, userId: "" });
    setView("admin");
  }, []);

  /* ── Login ── */
  if (view === "login") {
    return <LoginPage onSuccess={handleLoginSuccess} />;
  }

  /* ── Set Password ── */
  if (view === "set-password") {
    return <SetPasswordPage onSuccess={handleSetPasswordSuccess} />;
  }

  /* ── Admin ── */
  if (view === "admin") {
    return (
      <AdminPage
        adminName="Admin Platzhalter"
        onLogout={handleLogout}
        onImpersonate={handleImpersonate}
      />
    );
  }

  /* ── Portal (Mandant oder Impersonation) ── */
  return (
    <ClientDashboard
      user={currentUser}
      impersonation={impersonation}
      onEndImpersonation={handleEndImpersonation}
      onLogout={handleLogout}
    />
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <AppInner />
    </LanguageProvider>
  );
}
