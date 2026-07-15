import { useState, useCallback } from "react";
import { C, serif, sans } from "../tokens";
import { EASE, DURATION } from "../../styles/motion";
import { useLanguage } from "../context/LanguageContext";
import { CONTENT, PASSWORD_RULES, type Locale } from "../content";
import { useBreakpoint } from "./useBreakpoint";
import { PasswordField } from "./PasswordField";
import loginImg from "../../assets/sardona-1.jpg";
import logo from "../../assets/logo/Tellian__Imperial purple logo.svg";

/* PENDING: Wenn Hauptseite einen Eyebrow-Token bekommt, Portal aus
   gemeinsamer Quelle lesen, nicht aus eigener Kopie — sonst Drift. */
const EYEBROW_SIZE = "10px";

const LOCALES: Locale[] = ["de", "en"];

interface Props {
  onSuccess: () => void;
}

export function SetPasswordPage({ onSuccess }: Props) {
  const { lang, setLang } = useLanguage();
  const { isMobile, isVertical } = useBreakpoint();

  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [success, setSuccess] = useState(false);

  const t = CONTENT.setPassword;
  const e = CONTENT.errors;

  /* ── Rule evaluation ── */
  const ruleResults = PASSWORD_RULES.map((r) => ({
    ...r,
    passed: r.test(newPw),
  }));
  const passedCount = ruleResults.filter((r) => r.passed).length;
  const allPassed = passedCount === PASSWORD_RULES.length;
  const passwordsMatch = newPw.length > 0 && newPw === confirmPw;
  const showMismatch = submitted && confirmPw.length > 0 && !passwordsMatch;

  /* ── Validation errors ── */
  const newPwError = submitted && !newPw ? e.required[lang] :
    submitted && !allPassed ? "" : ""; // Rules list handles feedback
  const confirmError = submitted && !confirmPw ? e.required[lang] :
    showMismatch ? t.mismatch[lang] : "";

  const handleSubmit = useCallback(async (ev: React.FormEvent) => {
    ev.preventDefault();
    setSubmitted(true);

    if (!newPw || !confirmPw || !allPassed || !passwordsMatch) return;

    setLoading(true);
    /* Simulated API call — no password in persistent state/URL.
       Real implementation: POST to backend, backend validates + hashes.
       UI-Prototyp: Das ist kein echter Auth-Flow, sondern ein simulierter
       State-Übergang. Erzwingung muss serverseitig passieren. */
    await new Promise((r) => setTimeout(r, 1000));
    setLoading(false);
    setSuccess(true);

    // Redirect nach kurzer Bestätigung
    setTimeout(() => onSuccess(), 2200);
  }, [newPw, confirmPw, allPassed, passwordsMatch, onSuccess]);

  const reducedMotion = typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const tr = reducedMotion ? "none" : `all ${DURATION.normal}ms ${EASE.standard}`;

  /* ── Progress bar color ── */
  const progressFraction = PASSWORD_RULES.length > 0 ? passedCount / PASSWORD_RULES.length : 0;
  const progressColor = progressFraction < 0.4 ? C.error
    : progressFraction < 0.8 ? C.warning
    : C.success;

  /* ════════════════════════════════════════════════════════════
     ZONE 1 — KOPFZEILE
     ════════════════════════════════════════════════════════════ */
  const headerZone = (
    <div style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      flexShrink: 0,
      padding: isMobile ? "20px 0" : "28px 0",
    }}>
      <a
        href="https://telliancapital.ch"
        style={{
          fontFamily: sans, fontSize: 11, letterSpacing: "0.1em",
          textTransform: "uppercase", color: C.stone, textDecoration: "none",
          display: "inline-flex", alignItems: "center", gap: 6,
          transition: tr, padding: "8px 0",
        }}
        onMouseEnter={(e) => { e.currentTarget.style.color = C.dark; }}
        onMouseLeave={(e) => { e.currentTarget.style.color = C.stone; }}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }}>
          <path d="M19 12H5M12 19l-7-7 7-7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        <span>{CONTENT.backLink[lang]}</span>
      </a>

      <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
        {LOCALES.map((l, i) => (
          <span key={l} style={{ display: "flex", alignItems: "center", gap: 4 }}>
            {i > 0 && <span style={{ fontFamily: sans, fontSize: 11, color: C.line }}>|</span>}
            <button
              onClick={() => setLang(l)}
              style={{
                fontFamily: sans, fontSize: 11, fontWeight: lang === l ? 700 : 400,
                letterSpacing: "0.08em", textTransform: "uppercase",
                color: lang === l ? C.dark : C.stone,
                background: "transparent", border: "none", cursor: "pointer",
                padding: "8px 4px", outline: "none", transition: tr,
                minWidth: 28, minHeight: 36,
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
     ZONE 2 — KERN-BLOCK
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
      {/* Logo */}
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
        fontFamily: sans, fontSize: EYEBROW_SIZE, fontWeight: 500,
        letterSpacing: "0.22em", textTransform: "uppercase",
        color: C.stone, display: "block",
      }}>
        {t.eyebrow[lang]}
      </span>

      {/* Accent line */}
      <div style={{ width: 28, height: 1.5, backgroundColor: C.dark, marginTop: 16 }} />

      {success ? (
        /* ── Success state ── */
        <div style={{ marginTop: 16 }}>
          <h1 style={{
            fontFamily: serif,
            fontSize: isMobile ? "clamp(28px, 8vw, 36px)" : "clamp(36px, 4vw, 48px)",
            lineHeight: 1.05, color: C.dark, letterSpacing: "-0.025em",
            fontWeight: 400, margin: 0,
          }}>
            <em style={{ fontStyle: "italic", fontWeight: 400 }}>
              {t.successHeadline[lang]}
            </em>
          </h1>
          <p style={{
            fontFamily: sans, fontSize: 15, color: C.charcoal,
            lineHeight: 1.6, margin: "16px 0 0 0", maxWidth: 360,
          }}>
            {t.successIntro[lang]}
          </p>

          {/* Success checkmark */}
          <div style={{
            marginTop: 32,
            display: "flex", alignItems: "center", gap: 12,
          }}>
            <div style={{
              width: 40, height: 40, borderRadius: "50%",
              backgroundColor: C.successBg, display: "flex",
              alignItems: "center", justifyContent: "center",
            }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M5 12l5 5L20 7" stroke={C.success} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <span style={{
              fontFamily: sans, fontSize: 13, color: C.success,
              fontWeight: 500, letterSpacing: "0.05em",
            }}>
              {lang === "de" ? "Gespeichert" : "Saved"}
            </span>
          </div>
        </div>
      ) : (
        /* ── Form state ── */
        <>
          {/* Headline */}
          <h1 style={{
            fontFamily: serif,
            fontSize: isMobile ? "clamp(28px, 8vw, 36px)" : "clamp(36px, 4vw, 48px)",
            lineHeight: 1.05, color: C.dark, letterSpacing: "-0.025em",
            fontWeight: 400, margin: "16px 0 0 0",
          }}>
            <em style={{ fontStyle: "italic", fontWeight: 400 }}>
              {t.headline[lang]}
            </em>
          </h1>

          {/* Intro */}
          <p style={{
            fontFamily: sans, fontSize: 15, color: C.charcoal,
            lineHeight: 1.6, margin: "16px 0 0 0", maxWidth: 360,
          }}>
            {t.intro[lang]}
          </p>

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
            {/* New password */}
            <PasswordField
              label={t.newPasswordLabel[lang]}
              value={newPw}
              onChange={setNewPw}
              error={newPwError}
              disabled={loading}
              autoComplete="new-password"
            />

            {/* Confirm password */}
            <PasswordField
              label={t.confirmPasswordLabel[lang]}
              value={confirmPw}
              onChange={setConfirmPw}
              error={confirmError}
              disabled={loading}
              autoComplete="new-password"
            />

            {/* Requirements checklist */}
            <div role="group" aria-label={t.requirementsLabel[lang]}>
              <span style={{
                fontFamily: sans, fontSize: 10, fontWeight: 500,
                letterSpacing: "0.18em", textTransform: "uppercase",
                color: C.stone, display: "block", marginBottom: 10,
              }}>
                {t.requirementsLabel[lang]}
              </span>

              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {ruleResults.map((r) => (
                  <div
                    key={r.id}
                    style={{
                      display: "flex", alignItems: "center", gap: 8,
                    }}
                  >
                    {/* Check / X icon */}
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }}>
                      {r.passed ? (
                        <path d="M5 12l5 5L20 7" stroke={C.success} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      ) : (
                        <path d="M18 6L6 18M6 6l12 12" stroke={newPw.length > 0 ? C.error : C.line} strokeWidth="1.5" strokeLinecap="round"/>
                      )}
                    </svg>
                    <span style={{
                      fontFamily: sans, fontSize: 12,
                      color: r.passed ? C.success : newPw.length > 0 ? C.dark : C.stone,
                      transition: "color 200ms ease",
                    }}>
                      {r.label[lang]}
                    </span>
                  </div>
                ))}
              </div>

              {/* Progress bar — "Anforderungen erfüllt", NOT "Stärke"
                  PENDING: Für echte Stärkemessung später zxcvbn evaluieren. */}
              <div style={{ marginTop: 12 }}>
                <div style={{
                  width: "100%", height: 3, backgroundColor: C.subtle,
                  borderRadius: 2, overflow: "hidden",
                }}>
                  <div
                    role="progressbar"
                    aria-valuenow={passedCount}
                    aria-valuemin={0}
                    aria-valuemax={PASSWORD_RULES.length}
                    aria-label={t.progressLabel[lang](passedCount, PASSWORD_RULES.length)}
                    style={{
                      width: `${progressFraction * 100}%`,
                      height: "100%",
                      backgroundColor: newPw.length > 0 ? progressColor : "transparent",
                      borderRadius: 2,
                      transition: reducedMotion ? "none" : `width ${DURATION.normal}ms ${EASE.standard}, background-color ${DURATION.normal}ms ease`,
                    }}
                  />
                </div>
                <span
                  aria-live="polite"
                  style={{
                    fontFamily: sans, fontSize: 11, color: C.stone,
                    display: "block", marginTop: 6,
                  }}
                >
                  {newPw.length > 0 && t.progressLabel[lang](passedCount, PASSWORD_RULES.length)}
                </span>
              </div>
            </div>

            {/* Submit button — C.button (Mushroom), matches main site */}
            <button
              type="submit"
              disabled={loading}
              style={{
                fontFamily: sans, fontSize: 11, fontWeight: 500,
                letterSpacing: "0.18em", textTransform: "uppercase",
                color: C.dark, backgroundColor: loading ? C.line : C.button,
                border: `1px solid ${loading ? C.line : C.button}`,
                borderRadius: 0, padding: "16px 32px",
                cursor: loading ? "not-allowed" : "pointer",
                display: "flex", alignItems: "center", justifyContent: "center",
                gap: 10, minHeight: 52, width: "100%",
                transition: reducedMotion ? "none" : `background-color ${DURATION.fast}ms ease`,
                outline: "none", marginTop: 4,
              }}
              onMouseEnter={(e) => { if (!loading) e.currentTarget.style.backgroundColor = C.buttonHover; }}
              onMouseLeave={(e) => { if (!loading) e.currentTarget.style.backgroundColor = C.button; }}
            >
              {loading ? (
                <>
                  <span style={{
                    width: 14, height: 14,
                    border: `2px solid ${C.stone}`, borderTopColor: C.dark,
                    borderRadius: "50%",
                    animation: reducedMotion ? "none" : "portal-spin 0.8s linear infinite",
                    flexShrink: 0,
                  }} />
                  <span>{t.loading[lang]}</span>
                </>
              ) : (
                <>
                  <span>{t.submit[lang]}</span>
                  <span aria-hidden>→</span>
                </>
              )}
            </button>
          </form>
        </>
      )}
    </div>
  );

  /* ════════════════════════════════════════════════════════════
     ZONE 3 — FUSSZEILE
     ════════════════════════════════════════════════════════════ */
  const footerZone = (
    <div style={{
      flexShrink: 0,
      paddingTop: 24,
      paddingBottom: isMobile ? 20 : 8,
      borderTop: `1px solid ${C.line}`,
      display: "flex",
      alignItems: "center",
      justifyContent: "flex-end",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{ width: 16, height: 1, backgroundColor: C.line }} />
        <span style={{
          fontFamily: sans, fontSize: 9, fontWeight: 500,
          letterSpacing: "0.18em", textTransform: "uppercase", color: C.stone,
        }}>
          {CONTENT.shared.trust[lang]}
        </span>
      </div>
    </div>
  );

  /* ════════════════════════════════════════════════════════════
     LAYOUT — MOBILE
     ════════════════════════════════════════════════════════════ */
  if (isVertical) {
    return (
      <div style={{
        minHeight: "100vh", backgroundColor: C.bg,
        display: "flex", flexDirection: "column",
        padding: isMobile ? "0 24px" : "0 clamp(40px, 8vw, 80px)",
      }}>
        {headerZone}
        {coreZone}
        {footerZone}
        <style>{`@keyframes portal-spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  /* ════════════════════════════════════════════════════════════
     LAYOUT — DESKTOP
     ════════════════════════════════════════════════════════════ */
  return (
    <div style={{ display: "flex", height: "100vh", backgroundColor: C.bg }}>
      {/* Left — Image (hard edge, toned) */}
      <div style={{ width: "50vw", height: "100vh", flexShrink: 0, overflow: "hidden" }}>
        <img
          src={loginImg}
          alt=""
          style={{
            width: "100%", height: "100%",
            objectFit: "cover", objectPosition: "center 40%",
            display: "block", filter: "saturate(0.7) contrast(1.02)",
          }}
        />
      </div>

      {/* Right — Form (3-zone column) */}
      <div style={{
        flex: 1, display: "flex", flexDirection: "column",
        padding: "0 clamp(48px, 5vw, 96px)", overflow: "auto",
      }}>
        {headerZone}
        {coreZone}
        {footerZone}
      </div>

      <style>{`@keyframes portal-spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
