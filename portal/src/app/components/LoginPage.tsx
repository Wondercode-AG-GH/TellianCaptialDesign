import { useState, useCallback } from "react";
import { C, serif, sans } from "../tokens";
import { EASE, DURATION } from "../../styles/motion";
import { useLanguage } from "../context/LanguageContext";
import { CONTENT, type Locale } from "../content";
import { useBreakpoint } from "./useBreakpoint";
import { FloatingField } from "./FloatingField";
import loginImg from "../../assets/sardona-1.jpg";
import logo from "../../assets/logo/Tellian__Imperial purple logo.svg";

/* PENDING: Wenn Hauptseite einen Eyebrow-Token bekommt, Portal aus
   gemeinsamer Quelle lesen, nicht aus eigener Kopie — sonst Drift. */
const EYEBROW_SIZE = "10px";

type LoginMode = "client" | "employee";

const LOCALES: Locale[] = ["de", "en"];

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

interface LoginPageProps {
  onSuccess: (result: { mustChangePassword: boolean; role?: string; userId?: string }) => void;
}

export function LoginPage({ onSuccess }: LoginPageProps) {
  const { lang, setLang } = useLanguage();
  const { isMobile, isVertical } = useBreakpoint();

  const [mode, setMode] = useState<LoginMode>("client");
  const [identity, setIdentity] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [serverError, setServerError] = useState(false);

  const t = mode === "client" ? CONTENT.client : CONTENT.employee;
  const s = CONTENT.shared;
  const e = CONTENT.errors;

  const identityError = submitted && !identity ? e.required[lang] :
    submitted && mode === "employee" && identity && !isValidEmail(identity) ? e.invalidEmail[lang] : "";
  const passwordError = submitted && !password ? e.required[lang] : "";

  const handleSubmit = useCallback(async (ev: React.FormEvent) => {
    ev.preventDefault();
    setSubmitted(true);
    setServerError(false);

    if (!identity || !password) return;
    if (mode === "employee" && !isValidEmail(identity)) return;

    setLoading(true);
    /* Simulated auth — no password in persistent state/URL.
       Real implementation: POST to backend, receive session token + flags.
       UI-Prototyp: simulierter State-Übergang, keine echte Zugangskontrolle. */
    await new Promise((r) => setTimeout(r, 1200));
    setLoading(false);

    /* PENDING/SECURITY: Rolle im Prototyp aus ID-Prefix simuliert. Im echten
       System kommt die Rolle AUSSCHLIESSLICH aus dem serverseitigen
       Token/Session — NIE aus der Client-Eingabe. Prefix-Logik darf nie in
       echte Autorisierung übernommen werden. */
    const id = identity.toUpperCase();
    if (id.startsWith("CUST")) {
      /* Demo: use CUST-10001 as default demo mandant for dashboard */
      const userId = id === "CUST-10001" ? "CUST-10001" : "CUST-10001";
      onSuccess({ mustChangePassword: true, role: "client", userId });
    } else if (id.startsWith("ADMIN") || mode === "employee") {
      onSuccess({ mustChangePassword: false, role: "admin", userId: "ADMIN-001" });
    } else {
      setServerError(true);
    }
  }, [identity, password, mode, onSuccess]);

  /* PENDING: Gehört Mitarbeiter-Login auf die Kunden-Login-Seite?
     Mit Tellian klären. Vorerst belassen, aber in Fusszeile abgesetzt. */
  const handleSwitch = () => {
    setMode(mode === "client" ? "employee" : "client");
    setIdentity("");
    setPassword("");
    setSubmitted(false);
    setServerError(false);
  };

  const reducedMotion = typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const tr = reducedMotion ? "none" : `all ${DURATION.normal}ms ${EASE.standard}`;

  /* ════════════════════════════════════════════════════════════
     ZONE 1 — KOPFZEILE (Utility, eine Zeile)
     ════════════════════════════════════════════════════════════ */
  const headerZone = (
    <div style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      flexShrink: 0,
      padding: isMobile ? "20px 0" : "28px 0",
    }}>
      {/* Back link */}
      <a
        href="https://telliancapital.ch"
        style={{
          fontFamily: sans,
          fontSize: 11,
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          color: C.stone,
          textDecoration: "none",
          display: "inline-flex",
          alignItems: "center",
          gap: 6,
          transition: tr,
          padding: "8px 0",
        }}
        onMouseEnter={(e) => { e.currentTarget.style.color = C.dark; }}
        onMouseLeave={(e) => { e.currentTarget.style.color = C.stone; }}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }}>
          <path d="M19 12H5M12 19l-7-7 7-7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        <span>{CONTENT.backLink[lang]}</span>
      </a>

      {/* Language toggle */}
      <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
        {LOCALES.map((l, i) => (
          <span key={l} style={{ display: "flex", alignItems: "center", gap: 4 }}>
            {i > 0 && (
              <span style={{ fontFamily: sans, fontSize: 11, color: C.line }}>|</span>
            )}
            <button
              onClick={() => setLang(l)}
              style={{
                fontFamily: sans,
                fontSize: 11,
                fontWeight: lang === l ? 700 : 400,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                color: lang === l ? C.dark : C.stone,
                background: "transparent",
                border: "none",
                cursor: "pointer",
                padding: "8px 4px",
                outline: "none",
                transition: tr,
                minWidth: 28,
                minHeight: 36,
              }}
            >
              {l.toUpperCase()}
            </button>
          </span>
        ))}
      </div>
    </div>
  );

  /* ════════════════════════════════════════════════════════════
     ZONE 2 — KERN-BLOCK (Logo → Eyebrow → Headline → Form)
     ════════════════════════════════════════════════════════════ */
  const coreZone = (
    <div style={{
      flex: 1,
      display: "flex",
      flexDirection: "column",
      justifyContent: "flex-start",
      paddingTop: isMobile ? 8 : 12,
      maxWidth: 420,
    }}>
      {/* Logo — central brand element, opens the block */}
      <img
        src={logo}
        alt="Tellian Capital"
        style={{
          height: isMobile ? 80 : 120,
          width: "auto",
          objectFit: "contain",
          objectPosition: "left",
          marginBottom: isMobile ? 28 : 40,
        }}
      />

      {/* Eyebrow */}
      <span style={{
        fontFamily: sans,
        fontSize: EYEBROW_SIZE,
        fontWeight: 500,
        letterSpacing: "0.22em",
        textTransform: "uppercase",
        color: C.stone,
        display: "block",
      }}>
        {t.eyebrow[lang]}
      </span>

      {/* Accent line — matches main site section pattern */}
      <div style={{
        width: 28,
        height: 1.5,
        backgroundColor: C.dark,
        marginTop: 16,
      }} />

      {/* Headline */}
      <h1 style={{
        fontFamily: serif,
        fontSize: isMobile ? "clamp(28px, 8vw, 36px)" : "clamp(36px, 4vw, 48px)",
        lineHeight: 1.05,
        color: C.dark,
        letterSpacing: "-0.025em",
        fontWeight: 400,
        margin: "16px 0 0 0",
      }}>
        <em style={{ fontStyle: "italic", fontWeight: 400 }}>
          {t.headline[lang]}
        </em>
      </h1>

      {/* Intro */}
      <p style={{
        fontFamily: sans,
        fontSize: 15,
        color: C.charcoal,
        lineHeight: 1.6,
        margin: "16px 0 0 0",
        maxWidth: 360,
      }}>
        {t.intro[lang]}
      </p>

      {/* Server error banner */}
      {serverError && (
        <div
          role="alert"
          aria-live="assertive"
          style={{
            marginTop: 24,
            padding: "12px 16px",
            backgroundColor: C.errorBg,
            border: `1px solid ${C.error}`,
            borderRadius: 4,
            fontFamily: sans,
            fontSize: 13,
            color: C.error,
            lineHeight: 1.5,
          }}
        >
          {mode === "client" ? e.invalidCredentials[lang] : e.invalidCredentialsEmployee[lang]}
        </div>
      )}

      {/* Form */}
      <form
        onSubmit={handleSubmit}
        noValidate
        style={{
          marginTop: 28,
          display: "flex",
          flexDirection: "column",
          gap: 20,
        }}
      >
        {/* Identity field — Client ID or Email */}
        {/* PENDING: echtes Kunden-ID-Format von Tellian bestätigen —
            evtl. erfundenes Beispiel (CUST-12345). */}
        <FloatingField
          label={mode === "client" ? t.idLabel[lang] : t.emailLabel[lang]}
          value={identity}
          onChange={(v) => { setIdentity(v); setServerError(false); }}
          type={mode === "employee" ? "email" : "text"}
          placeholder={mode === "client" ? t.idPlaceholder[lang] : t.emailPlaceholder[lang]}
          error={identityError}
          disabled={loading}
          required
          autoComplete={mode === "employee" ? "email" : "username"}
        />

        {/* Password */}
        <FloatingField
          label={s.passwordLabel[lang]}
          value={password}
          onChange={(v) => { setPassword(v); setServerError(false); }}
          type="password"
          error={passwordError}
          disabled={loading}
          required
          autoComplete="current-password"
        />

        {/* Submit button — C.button (Mushroom), matches main site CTA */}
        <button
          type="submit"
          disabled={loading}
          style={{
            fontFamily: sans,
            fontSize: 11,
            fontWeight: 500,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            color: C.dark,
            backgroundColor: loading ? C.line : C.button,
            border: `1px solid ${loading ? C.line : C.button}`,
            borderRadius: 0,
            padding: "16px 32px",
            cursor: loading ? "not-allowed" : "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 10,
            minHeight: 52,
            width: "100%",
            transition: reducedMotion ? "none" : `background-color ${DURATION.fast}ms ease`,
            outline: "none",
            marginTop: 8,
          }}
          onMouseEnter={(e) => { if (!loading) e.currentTarget.style.backgroundColor = C.buttonHover; }}
          onMouseLeave={(e) => { if (!loading) e.currentTarget.style.backgroundColor = C.button; }}
        >
          {loading ? (
            <>
              <span style={{
                width: 14, height: 14,
                border: `2px solid ${C.stone}`,
                borderTopColor: C.dark,
                borderRadius: "50%",
                animation: reducedMotion ? "none" : "portal-spin 0.8s linear infinite",
                flexShrink: 0,
              }} />
              <span>{s.loading[lang]}</span>
            </>
          ) : (
            <>
              <span>{s.submit[lang]}</span>
              <span aria-hidden>→</span>
            </>
          )}
        </button>
      </form>
    </div>
  );

  /* ════════════════════════════════════════════════════════════
     ZONE 3 — FUSSZEILE (sekundär, unten verankert)
     ════════════════════════════════════════════════════════════ */
  const footerZone = (
    <div style={{
      flexShrink: 0,
      paddingTop: 24,
      paddingBottom: isMobile ? 20 : 8,
      borderTop: `1px solid ${C.line}`,
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      flexWrap: "wrap",
      gap: 16,
    }}>
      {/* PENDING: Gehört Mitarbeiter-Login auf die Kunden-Login-Seite?
          Mit Tellian klären. Vorerst belassen, abgesetzt vom Kern-Flow. */}
      <button
        onClick={handleSwitch}
        disabled={loading}
        style={{
          fontFamily: sans,
          fontSize: 11,
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          color: C.stone,
          background: "transparent",
          border: "none",
          cursor: loading ? "not-allowed" : "pointer",
          padding: "8px 0",
          textAlign: "left",
          transition: tr,
          outline: "none",
        }}
        onMouseEnter={(e) => { if (!loading) e.currentTarget.style.color = C.dark; }}
        onMouseLeave={(e) => { e.currentTarget.style.color = C.stone; }}
      >
        {t.switchLink[lang]} →
      </button>

      {/* Trust line */}
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{ width: 16, height: 1, backgroundColor: C.line }} />
        <span style={{
          fontFamily: sans,
          fontSize: 9,
          fontWeight: 500,
          letterSpacing: "0.18em",
          textTransform: "uppercase",
          color: C.stone,
        }}>
          {s.trust[lang]}
        </span>
      </div>
    </div>
  );

  /* ════════════════════════════════════════════════════════════
     LAYOUT — MOBILE (vertical, image hidden)
     ════════════════════════════════════════════════════════════ */
  if (isVertical) {
    return (
      <div style={{
        minHeight: "100vh",
        backgroundColor: C.bg,
        display: "flex",
        flexDirection: "column",
        padding: isMobile ? "0 24px" : "0 clamp(40px, 8vw, 80px)",
      }}>
        {headerZone}
        {coreZone}
        {footerZone}

        <style>{`
          @keyframes portal-spin { to { transform: rotate(360deg); } }
        `}</style>
      </div>
    );
  }

  /* ════════════════════════════════════════════════════════════
     LAYOUT — DESKTOP (split-screen)
     ════════════════════════════════════════════════════════════ */
  return (
    <div style={{
      display: "flex",
      height: "100vh",
      backgroundColor: C.bg,
    }}>
      {/* Left — Image (hard edge, toned) */}
      <div style={{
        width: "50vw",
        height: "100vh",
        flexShrink: 0,
        overflow: "hidden",
      }}>
        <img
          src={loginImg}
          alt=""
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            objectPosition: "center 40%",
            display: "block",
            filter: "saturate(0.7) contrast(1.02)",
          }}
        />
      </div>

      {/* Right — Form (3-zone column) */}
      <div style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        padding: "0 clamp(48px, 5vw, 96px)",
        overflow: "auto",
      }}>
        {headerZone}
        {coreZone}
        {footerZone}
      </div>

      <style>{`
        @keyframes portal-spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
