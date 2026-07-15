import { useState, useCallback } from "react";
import { C, serif, sans } from "../tokens";
import { DURATION } from "../../styles/motion";
import { useLanguage } from "../context/LanguageContext";
import { ADMIN } from "../adminContent";
import { DEMO_USERS } from "../data/demoUsers";
import { STATUS_LABELS, ROLE_LABELS, type User, type UserRole, type UserStatus } from "../types";
import type { Locale } from "../content";
import { useBreakpoint } from "./useBreakpoint";
import { ConfirmDialog } from "./ConfirmDialog";
import { CreateUserModal } from "./CreateUserModal";
import logo from "../../assets/logo/Tellian__Imperial purple logo.svg";

/* ═══════════════════════════════════════════════════════════
   ADMIN PAGE — Benutzerverwaltung
   UI-PROTOTYP: Alle Admin-Aktionen sind SIMULIERTE Frontend-
   Zustände, keine echte Sicherheit. Nicht für ein funktionierendes
   Admin-Panel halten.
   ═══════════════════════════════════════════════════════════ */

const LOCALES: Locale[] = ["de", "en"];
const ROLES: UserRole[] = ["admin", "client", "employee"];

/* PENDING: temporäres Passwort im echten System serverseitig generieren
   (kryptografisch sicher), nicht im Frontend. Prototyp-Generierung ist Platzhalter. */
function generateTempPassword(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$%";
  let pw = "";
  const arr = new Uint8Array(14);
  crypto.getRandomValues(arr);
  for (let i = 0; i < 14; i++) pw += chars[arr[i] % chars.length];
  return pw;
}

interface Props {
  adminId?: string;
  adminName: string;
  onLogout: () => void;
  onImpersonate: (userId: string) => void;
}

type ConfirmAction =
  | { type: "deactivate"; user: User }
  | { type: "activate"; user: User }
  | { type: "resetPassword"; user: User }
  | { type: "impersonate"; user: User };

type TableState = "loaded" | "loading" | "error" | "empty";

export function AdminPage({ adminId = "ADMIN-001", adminName, onLogout, onImpersonate }: Props) {
  const { lang, setLang } = useLanguage();
  const { isMobile, isVertical } = useBreakpoint();
  const [users, setUsers] = useState<User[]>(DEMO_USERS);
  const [search, setSearch] = useState("");
  const [confirm, setConfirm] = useState<ConfirmAction | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  /* Generated password shown after PW reset — dialog with copy button */
  const [resetPwResult, setResetPwResult] = useState<{ userId: string; tempPw: string } | null>(null);
  const [resetPwCopied, setResetPwCopied] = useState(false);
  /* Table state — "loaded" is default with demo data.
     Toggle via Dev Tools or future API integration. */
  const [tableState] = useState<TableState>("loaded");

  const t = ADMIN;
  const reducedMotion = typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ── Search filter ── */
  const filtered = search.trim()
    ? users.filter((u) => {
        const q = search.toLowerCase();
        return (
          u.id.toLowerCase().includes(q) ||
          u.profile.firstName.toLowerCase().includes(q) ||
          u.profile.lastName.toLowerCase().includes(q) ||
          u.profile.email.toLowerCase().includes(q)
        );
      })
    : users;

  /* ── Feedback flash ── */
  const showFeedback = useCallback((msg: string) => {
    setFeedback(msg);
    setTimeout(() => setFeedback(null), 3000);
  }, []);

  /* ── Mutate user helper ── */
  const updateUser = useCallback((id: string, patch: Partial<User>) => {
    setUsers((prev) => prev.map((u) => u.id === id ? { ...u, ...patch } : u));
  }, []);

  /* ── Confirm handlers ── */
  const handleConfirm = useCallback(() => {
    if (!confirm) return;
    const { type, user } = confirm;

    if (type === "deactivate") {
      updateUser(user.id, { status: "inactive" as UserStatus });
      showFeedback(lang === "de" ? `${user.id} deaktiviert.` : `${user.id} deactivated.`);
    } else if (type === "activate") {
      /* Reaktivieren: Konto wird active. mustChangePassword bleibt unverändert. */
      updateUser(user.id, { status: "active" as UserStatus });
      showFeedback(lang === "de" ? `${user.id} aktiviert.` : `${user.id} activated.`);
    } else if (type === "resetPassword") {
      /* PW-Reset: mustChangePassword = true, status bleibt unverändert.
         Verbindet zum SetPassword-Flow beim nächsten Login.
         Generiertes PW wird dem Admin einmalig angezeigt (nicht persistiert). */
      updateUser(user.id, { mustChangePassword: true });
      const tempPw = generateTempPassword();
      setResetPwResult({ userId: user.id, tempPw });
      setResetPwCopied(false);
    } else if (type === "impersonate") {
      /* PENDING: Echte Impersonation braucht serverseitiges Audit-Log
         (wer/wann/wen) + evtl. Einwilligung/Zeitlimit — Compliance,
         nicht Frontend. */
      onImpersonate(user.id);
    }

    setConfirm(null);
  }, [confirm, updateUser, showFeedback, lang, onImpersonate]);

  /* ── Role change ── */
  const handleRoleChange = useCallback((userId: string, newRole: UserRole) => {
    updateUser(userId, { role: newRole });
    showFeedback(
      lang === "de"
        ? `Rolle für ${userId} geändert: ${ROLE_LABELS[newRole].de}`
        : `Role for ${userId} changed: ${ROLE_LABELS[newRole].en}`
    );
  }, [updateUser, showFeedback, lang]);

  /* ── MFA toggle ── */
  const handleMfaToggle = useCallback((user: User) => {
    updateUser(user.id, { mfaEnabled: !user.mfaEnabled });
    showFeedback(
      lang === "de"
        ? `MFA für ${user.id} ${user.mfaEnabled ? "deaktiviert" : "aktiviert"}.`
        : `MFA for ${user.id} ${user.mfaEnabled ? "disabled" : "enabled"}.`
    );
  }, [updateUser, showFeedback, lang]);

  /* ── Can impersonate? Disabled for own row + admin rows ── */
  const canImpersonate = (user: User) =>
    user.id !== adminId && user.role !== "admin";

  /* ── Confirm dialog content ── */
  const confirmTitle = confirm
    ? confirm.type === "deactivate" ? t.confirm.deactivateTitle[lang]
    : confirm.type === "activate" ? (lang === "de" ? "Benutzer aktivieren" : "Activate user")
    : confirm.type === "resetPassword" ? t.confirm.resetTitle[lang]
    : t.confirm.impersonateTitle[lang]
    : "";
  const confirmBody = confirm
    ? confirm.type === "deactivate" ? t.confirm.deactivateBody[lang](confirm.user.id)
    : confirm.type === "activate" ? (lang === "de" ? `Möchten Sie das Konto ${confirm.user.id} reaktivieren?` : `Do you want to reactivate account ${confirm.user.id}?`)
    : confirm.type === "resetPassword" ? t.confirm.resetBody[lang](confirm.user.id)
    : t.confirm.impersonateBody[lang](confirm.user.id)
    : "";
  const confirmDestructive = confirm?.type === "deactivate";

  /* ── Action button style ── */
  const actionBtnStyle = (disabled = false): React.CSSProperties => ({
    fontFamily: sans, fontSize: 11, letterSpacing: "0.06em",
    color: disabled ? C.line : C.stone,
    background: "transparent", border: "none",
    cursor: disabled ? "not-allowed" : "pointer",
    padding: "6px 8px", outline: "none",
    whiteSpace: "nowrap", minHeight: 32,
    transition: reducedMotion ? "none" : `color ${DURATION.fast}ms ease`,
    opacity: disabled ? 0.5 : 1,
  });

  return (
    <div style={{ minHeight: "100vh", backgroundColor: C.bg }}>
      {/* ════════════════════════════════════════════════════════
          HEADER
          ════════════════════════════════════════════════════════ */}
      <header style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: isMobile ? "16px 20px" : "16px clamp(32px, 4vw, 64px)",
        borderBottom: `1px solid ${C.line}`,
        backgroundColor: C.bg, position: "sticky", top: 0, zIndex: 100,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: isMobile ? 16 : 24 }}>
          <img src={logo} alt="Tellian Capital" style={{ height: isMobile ? 32 : 40 }} />
          <span style={{
            fontFamily: sans, fontSize: 10, fontWeight: 500,
            letterSpacing: "0.22em", textTransform: "uppercase", color: C.stone,
          }}>
            {t.nav.userManagement[lang]}
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: isMobile ? 12 : 20 }}>
          {!isMobile && (
            <span style={{ fontFamily: sans, fontSize: 12, color: C.stone }}>
              {adminName}
            </span>
          )}
          <button onClick={onLogout} style={{
            fontFamily: sans, fontSize: 11, letterSpacing: "0.1em",
            textTransform: "uppercase", color: C.stone,
            background: "transparent", border: "none", cursor: "pointer",
            padding: "8px 0", outline: "none",
          }}>
            {t.nav.logout[lang]}
          </button>
          <div style={{ width: 1, height: 16, backgroundColor: C.line }} />
          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
            {LOCALES.map((l, i) => (
              <span key={l} style={{ display: "flex", alignItems: "center", gap: 4 }}>
                {i > 0 && <span style={{ fontFamily: sans, fontSize: 11, color: C.line }}>|</span>}
                <button onClick={() => setLang(l)} style={{
                  fontFamily: sans, fontSize: 11, fontWeight: lang === l ? 700 : 400,
                  letterSpacing: "0.08em", textTransform: "uppercase",
                  color: lang === l ? C.dark : C.stone,
                  background: "transparent", border: "none", cursor: "pointer",
                  padding: "8px 4px", outline: "none", minHeight: 36,
                }}>
                  {l.toUpperCase()}
                </button>
              </span>
            ))}
          </div>
        </div>
      </header>

      {/* ════════════════════════════════════════════════════════
          FEEDBACK TOAST (aria-live)
          ════════════════════════════════════════════════════════ */}
      <div
        aria-live="polite"
        aria-atomic="true"
        style={{
          position: "fixed", bottom: 24, left: "50%", transform: "translateX(-50%)",
          zIndex: 200, pointerEvents: "none",
        }}
      >
        {feedback && (
          <div style={{
            fontFamily: sans, fontSize: 13, fontWeight: 500, color: C.dark,
            backgroundColor: C.successBg, border: `1px solid ${C.success}`,
            borderRadius: 6, padding: "12px 24px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
          }}>
            {feedback}
          </div>
        )}
      </div>

      {/* ════════════════════════════════════════════════════════
          TITLE AREA
          ════════════════════════════════════════════════════════ */}
      <div style={{
        padding: isMobile ? "32px 20px 24px" : "48px clamp(32px, 4vw, 64px) 32px",
        display: "flex", alignItems: isMobile ? "flex-start" : "flex-end",
        justifyContent: "space-between", flexWrap: "wrap", gap: 16,
      }}>
        <div>
          <h1 style={{
            fontFamily: serif,
            fontSize: isMobile ? "clamp(24px, 7vw, 32px)" : "clamp(32px, 3vw, 40px)",
            lineHeight: 1.1, color: C.dark, letterSpacing: "-0.02em",
            fontWeight: 400, margin: 0,
          }}>
            <em style={{ fontStyle: "italic", fontWeight: 400 }}>{t.title.headline[lang]}</em>
          </h1>
          <p style={{
            fontFamily: sans, fontSize: 14, color: C.stone,
            margin: "8px 0 0 0", lineHeight: 1.5,
          }}>
            {t.title.subtitle[lang]}
          </p>
        </div>
        <button
          onClick={() => setCreateModalOpen(true)}
          style={{
            fontFamily: sans, fontSize: 11, fontWeight: 500,
            letterSpacing: "0.18em", textTransform: "uppercase",
            color: C.dark, backgroundColor: C.button,
            border: `1px solid ${C.button}`, borderRadius: 0,
            padding: "14px 24px", cursor: "pointer",
            display: "inline-flex", alignItems: "center", gap: 8,
            minHeight: 48, outline: "none", flexShrink: 0,
            transition: reducedMotion ? "none" : `background-color ${DURATION.fast}ms ease`,
          }}
          onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = C.buttonHover; }}
          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = C.button; }}
        >
          <span aria-hidden>+</span>
          <span>{t.title.createButton[lang]}</span>
        </button>
      </div>

      {/* ════════════════════════════════════════════════════════
          SEARCH
          ════════════════════════════════════════════════════════ */}
      <div style={{ padding: isMobile ? "0 20px 24px" : "0 clamp(32px, 4vw, 64px) 24px" }}>
        <div style={{ position: "relative", maxWidth: 400 }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
            style={{ position: "absolute", left: 0, top: "50%", transform: "translateY(-50%)", color: C.stone }}>
            <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="1.5"/>
            <path d="M21 21l-4.35-4.35" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
          <input
            type="search" value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t.search.placeholder[lang]}
            aria-label={t.search.placeholder[lang]}
            style={{
              fontFamily: sans, fontSize: 14, color: C.dark,
              backgroundColor: "transparent",
              border: "none", borderBottom: `1.5px solid ${C.line}`,
              borderRadius: 0, padding: "10px 0 10px 28px",
              outline: "none", width: "100%",
              transition: `border-color ${DURATION.fast}ms ease`,
            }}
            onFocus={(e) => { e.currentTarget.style.borderBottomColor = C.dark; }}
            onBlur={(e) => { e.currentTarget.style.borderBottomColor = C.line; }}
          />
        </div>
      </div>

      {/* ════════════════════════════════════════════════════════
          TABLE / CARDS — 4 states: loaded, loading, error, empty
          Mobile (<1024): card layout. Desktop: table.
          ════════════════════════════════════════════════════════ */}
      <div style={{
        padding: isVertical ? "0 20px 48px" : "0 clamp(32px, 4vw, 64px) 48px",
      }}>
        {/* Loading state */}
        {tableState === "loading" && (
          <div style={{ padding: "64px 0", textAlign: "center" }}>
            <span style={{ fontFamily: sans, fontSize: 14, color: C.stone, fontStyle: "italic" }}>
              {t.table.loading[lang]}
            </span>
          </div>
        )}

        {/* Error state */}
        {tableState === "error" && (
          <div style={{
            padding: "48px 24px", textAlign: "center",
            backgroundColor: C.errorBg, border: `1px solid ${C.error}`,
            borderRadius: 4,
          }}>
            <span style={{ fontFamily: sans, fontSize: 14, color: C.error }}>
              {t.table.error[lang]}
            </span>
          </div>
        )}

        {/* Loaded: empty or filled */}
        {tableState === "loaded" && filtered.length === 0 && (
          <div style={{ padding: "64px 0", textAlign: "center" }}>
            <span style={{ fontFamily: sans, fontSize: 14, color: C.stone, fontStyle: "italic" }}>
              {t.table.empty[lang]}
            </span>
          </div>
        )}

        {tableState === "loaded" && filtered.length > 0 && (
          isVertical ? (
            /* ── MOBILE: Card layout ── */
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {filtered.map((user) => (
                <div
                  key={user.id}
                  style={{
                    border: `1px solid ${C.line}`, borderRadius: 6,
                    padding: 20, backgroundColor: C.bg,
                  }}
                >
                  {/* Header: ID + Name */}
                  <div style={{ marginBottom: 12 }}>
                    <span style={{ fontFamily: sans, fontSize: 14, fontWeight: 600, color: C.dark, display: "block" }}>
                      {user.id}
                    </span>
                    <span style={{ fontFamily: sans, fontSize: 13, color: C.stone, display: "block", marginTop: 2 }}>
                      {user.profile.firstName} {user.profile.lastName}
                    </span>
                  </div>

                  {/* Meta row */}
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "8px 20px", marginBottom: 16 }}>
                    {/* Role */}
                    <div>
                      <span style={{ fontFamily: sans, fontSize: 10, letterSpacing: "0.16em", textTransform: "uppercase", color: C.stone, display: "block", marginBottom: 4 }}>
                        {t.table.colRole[lang]}
                      </span>
                      <select
                        value={user.role}
                        onChange={(e) => handleRoleChange(user.id, e.target.value as UserRole)}
                        aria-label={`${t.table.colRole[lang]}: ${user.id}`}
                        style={{
                          fontFamily: sans, fontSize: 13, color: C.dark,
                          backgroundColor: "transparent",
                          border: `1px solid ${C.line}`, borderRadius: 2,
                          padding: "6px 28px 6px 8px", cursor: "pointer",
                          outline: "none", appearance: "none", minHeight: 36,
                          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%238A857C' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`,
                          backgroundRepeat: "no-repeat", backgroundPosition: "right 8px center",
                        }}
                      >
                        {ROLES.map((r) => <option key={r} value={r}>{ROLE_LABELS[r][lang]}</option>)}
                      </select>
                    </div>

                    {/* Status */}
                    <div>
                      <span style={{ fontFamily: sans, fontSize: 10, letterSpacing: "0.16em", textTransform: "uppercase", color: C.stone, display: "block", marginBottom: 4 }}>
                        {t.table.colStatus[lang]}
                      </span>
                      <StatusBadge user={user} lang={lang} />
                    </div>

                    {/* MFA */}
                    <div>
                      <span style={{ fontFamily: sans, fontSize: 10, letterSpacing: "0.16em", textTransform: "uppercase", color: C.stone, display: "block", marginBottom: 4 }}>
                        {t.table.colMfa[lang]}
                      </span>
                      <MfaBadge user={user} lang={lang} />
                    </div>
                  </div>

                  {/* Actions — wrap for touch */}
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8, borderTop: `1px solid ${C.line}`, paddingTop: 12 }}>
                    <ActionButtons user={user} adminId={adminId} lang={lang} t={t}
                      canImpersonate={canImpersonate(user)}
                      onDeactivate={() => setConfirm({ type: user.status === "inactive" ? "activate" : "deactivate", user })}
                      onMfaToggle={() => handleMfaToggle(user)}
                      onResetPw={() => setConfirm({ type: "resetPassword", user })}
                      onImpersonate={() => setConfirm({ type: "impersonate", user })}
                      actionBtnStyle={actionBtnStyle}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* ── DESKTOP: Table layout ── */
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 800 }}>
                <thead>
                  <tr style={{ borderBottom: `1.5px solid ${C.dark}` }}>
                    {[t.table.colId, t.table.colRole, t.table.colStatus, t.table.colMfa, t.table.colActions].map((col, i) => (
                      <th key={i} scope="col" style={{
                        fontFamily: sans, fontSize: 10, fontWeight: 600,
                        letterSpacing: "0.2em", textTransform: "uppercase",
                        color: C.stone, textAlign: "left",
                        padding: "12px 16px 12px 0", whiteSpace: "nowrap",
                      }}>
                        {col[lang]}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((user) => (
                    <tr key={user.id} style={{ borderBottom: `1px solid ${C.line}` }}>
                      <td style={{ padding: "14px 16px 14px 0" }}>
                        <span style={{ fontFamily: sans, fontSize: 13, fontWeight: 500, color: C.dark, display: "block" }}>
                          {user.id}
                        </span>
                        <span style={{ fontFamily: sans, fontSize: 12, color: C.stone, display: "block", marginTop: 2 }}>
                          {user.profile.firstName} {user.profile.lastName}
                        </span>
                      </td>
                      <td style={{ padding: "14px 16px 14px 0" }}>
                        <select
                          value={user.role}
                          onChange={(e) => handleRoleChange(user.id, e.target.value as UserRole)}
                          aria-label={`${t.table.colRole[lang]}: ${user.id}`}
                          style={{
                            fontFamily: sans, fontSize: 13, color: C.dark,
                            backgroundColor: "transparent",
                            border: `1px solid ${C.line}`, borderRadius: 2,
                            padding: "6px 28px 6px 8px", cursor: "pointer",
                            outline: "none", appearance: "none", minHeight: 36,
                            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%238A857C' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`,
                            backgroundRepeat: "no-repeat", backgroundPosition: "right 8px center",
                          }}
                        >
                          {ROLES.map((r) => <option key={r} value={r}>{ROLE_LABELS[r][lang]}</option>)}
                        </select>
                      </td>
                      <td style={{ padding: "14px 16px 14px 0" }}>
                        <StatusBadge user={user} lang={lang} />
                      </td>
                      <td style={{ padding: "14px 16px 14px 0" }}>
                        <MfaBadge user={user} lang={lang} />
                      </td>
                      <td style={{ padding: "14px 0" }}>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                          <ActionButtons user={user} adminId={adminId} lang={lang} t={t}
                            canImpersonate={canImpersonate(user)}
                            onDeactivate={() => setConfirm({ type: user.status === "inactive" ? "activate" : "deactivate", user })}
                            onMfaToggle={() => handleMfaToggle(user)}
                            onResetPw={() => setConfirm({ type: "resetPassword", user })}
                            onImpersonate={() => setConfirm({ type: "impersonate", user })}
                            actionBtnStyle={actionBtnStyle}
                          />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        )}
      </div>

      {/* ════════════════════════════════════════════════════════
          CONFIRM DIALOG
          ════════════════════════════════════════════════════════ */}
      <ConfirmDialog
        open={confirm !== null}
        title={confirmTitle}
        body={confirmBody}
        destructive={confirmDestructive}
        onConfirm={handleConfirm}
        onCancel={() => setConfirm(null)}
      />

      {/* ════════════════════════════════════════════════════════
          CREATE USER MODAL
          ════════════════════════════════════════════════════════ */}
      <CreateUserModal
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        existingIds={users.map((u) => u.id)}
        onCreate={(newUser) => {
          setUsers((prev) => [newUser, ...prev]);
          setCreateModalOpen(false);
          showFeedback(ADMIN.createModal.successMsg[lang](newUser.id));
        }}
      />

      {/* ════════════════════════════════════════════════════════
          PASSWORD RESET RESULT — shows generated temp PW with copy button.
          Shown once after admin resets a user's password.
          PW lives only in this dialog state — dismissed = gone.
          ════════════════════════════════════════════════════════ */}
      {resetPwResult && (
        <>
          <div
            onClick={() => setResetPwResult(null)}
            style={{ position: "fixed", inset: 0, zIndex: 10000, backgroundColor: "rgba(0,0,0,0.25)" }}
          />
          <div
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="reset-pw-title"
            style={{
              position: "fixed", top: "50%", left: "50%",
              transform: "translate(-50%, -50%)", zIndex: 10001,
              backgroundColor: C.bg, border: `1px solid ${C.line}`,
              borderRadius: 8, padding: 32,
              width: "min(440px, calc(100vw - 48px))",
              boxShadow: "0 20px 60px rgba(0,0,0,0.12)",
            }}
          >
            <h2 id="reset-pw-title" style={{
              fontFamily: serif, fontSize: 22, fontWeight: 400,
              fontStyle: "italic", color: C.dark, margin: 0, lineHeight: 1.2,
            }}>
              {lang === "de" ? "Neues temporäres Passwort" : "New temporary password"}
            </h2>
            <p style={{
              fontFamily: sans, fontSize: 14, color: C.charcoal,
              lineHeight: 1.6, margin: "12px 0 0 0",
            }}>
              {lang === "de"
                ? `Das temporäre Passwort für ${resetPwResult.userId} wurde erstellt. Senden Sie es dem Mandanten über einen sicheren Kanal. Es wird nach dem Schliessen dieses Dialogs nicht mehr angezeigt.`
                : `The temporary password for ${resetPwResult.userId} has been created. Send it to the client through a secure channel. It will not be shown again after closing this dialog.`}
            </p>

            {/* Generated PW display + copy */}
            <div style={{
              display: "flex", alignItems: "center", gap: 8,
              marginTop: 20, padding: "12px 16px",
              backgroundColor: C.bgSecondary,
              border: `1px solid ${C.line}`, borderRadius: 4,
            }}>
              <code style={{
                fontFamily: "monospace", fontSize: 16, fontWeight: 500,
                color: C.dark, flex: 1, letterSpacing: "0.06em",
                userSelect: "all",
              }}>
                {resetPwResult.tempPw}
              </code>
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(resetPwResult.tempPw).then(() => {
                    setResetPwCopied(true);
                    setTimeout(() => setResetPwCopied(false), 2000);
                  });
                }}
                style={{
                  fontFamily: sans, fontSize: 11, letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  color: resetPwCopied ? C.success : C.stone,
                  background: "transparent", border: "none",
                  cursor: "pointer", padding: "8px 10px", outline: "none",
                  whiteSpace: "nowrap", minHeight: 36,
                }}
              >
                {resetPwCopied
                  ? (lang === "de" ? "Kopiert" : "Copied")
                  : (lang === "de" ? "Kopieren" : "Copy")}
              </button>
            </div>

            {/* Close */}
            <div style={{ marginTop: 24, display: "flex", justifyContent: "flex-end" }}>
              <button
                onClick={() => setResetPwResult(null)}
                autoFocus
                style={{
                  fontFamily: sans, fontSize: 11, fontWeight: 500,
                  letterSpacing: "0.16em", textTransform: "uppercase",
                  color: C.dark, backgroundColor: C.button,
                  border: `1px solid ${C.button}`, borderRadius: 0,
                  padding: "12px 24px", cursor: "pointer",
                  outline: "none", minHeight: 44,
                }}
              >
                {lang === "de" ? "Schliessen" : "Close"}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   EXTRACTED BADGE + ACTION COMPONENTS (shared desktop/mobile)
   ═══════════════════════════════════════════════════════════ */

function StatusBadge({ user, lang }: { user: User; lang: Locale }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
      {user.status === "active" ? (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden style={{ flexShrink: 0, color: C.success }}>
          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5"/>
          <path d="M8 12l3 3 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ) : user.status === "pending" ? (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden style={{ flexShrink: 0, color: C.warning }}>
          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5"/>
          <path d="M12 6v6l4 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
      ) : (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden style={{ flexShrink: 0, color: C.error }}>
          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5"/>
          <path d="M15 9l-6 6M9 9l6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
      )}
      <span style={{ fontFamily: sans, fontSize: 13, color: C.dark }}>
        {STATUS_LABELS[user.status][lang]}
      </span>
      {user.mustChangePassword && user.status !== "inactive" && (
        <span style={{ fontFamily: sans, fontSize: 10, color: C.warning, fontWeight: 500, marginLeft: 4 }}>
          (PW)
        </span>
      )}
    </span>
  );
}

function MfaBadge({ user, lang }: { user: User; lang: Locale }) {
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 6,
      fontFamily: sans, fontSize: 13,
      color: user.mfaEnabled ? C.success : C.stone,
    }}>
      {user.mfaEnabled ? (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
          <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ) : (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
        </svg>
      )}
      <span>{user.mfaEnabled ? ADMIN.mfa.on[lang] : ADMIN.mfa.off[lang]}</span>
    </span>
  );
}

function ActionButtons({
  user, adminId, lang, t, canImpersonate,
  onDeactivate, onMfaToggle, onResetPw, onImpersonate, actionBtnStyle,
}: {
  user: User; adminId: string; lang: Locale; t: typeof ADMIN;
  canImpersonate: boolean;
  onDeactivate: () => void; onMfaToggle: () => void;
  onResetPw: () => void; onImpersonate: () => void;
  actionBtnStyle: (disabled?: boolean) => React.CSSProperties;
}) {
  return (
    <>
      {user.status === "inactive" ? (
        <button onClick={onDeactivate} style={actionBtnStyle()}
          aria-label={`${t.actions.activate[lang]}: ${user.id}`}>
          {t.actions.activate[lang]}
        </button>
      ) : (
        <button onClick={onDeactivate} style={actionBtnStyle(user.id === adminId)}
          disabled={user.id === adminId}
          aria-label={`${t.actions.deactivate[lang]}: ${user.id}`}>
          {t.actions.deactivate[lang]}
        </button>
      )}
      <button onClick={onMfaToggle} style={actionBtnStyle()}
        aria-label={`${user.mfaEnabled ? t.actions.disableMfa[lang] : t.actions.enableMfa[lang]}: ${user.id}`}>
        {user.mfaEnabled ? t.actions.disableMfa[lang] : t.actions.enableMfa[lang]}
      </button>
      <button onClick={onResetPw} style={actionBtnStyle(user.status === "inactive")}
        disabled={user.status === "inactive"}
        aria-label={`${t.actions.resetPassword[lang]}: ${user.id}`}>
        {t.actions.resetPassword[lang]}
      </button>
      <button onClick={() => { if (canImpersonate) onImpersonate(); }}
        style={actionBtnStyle(!canImpersonate)} disabled={!canImpersonate}
        aria-label={`${t.actions.impersonate[lang]}: ${user.id}`}>
        {t.actions.impersonate[lang]}
      </button>
    </>
  );
}
