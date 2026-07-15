import { useState, useEffect, useRef, useCallback } from "react";
import { C, serif, sans } from "../tokens";
import { EASE, DURATION } from "../../styles/motion";
import { useLanguage } from "../context/LanguageContext";
import { ADMIN } from "../adminContent";
import { DEMO_RMS } from "../data/demoRms";
import { ROLE_LABELS, type User, type UserRole, type RelationshipManager } from "../types";
import { FloatingField } from "./FloatingField";
import type { Locale } from "../content";

/* ═══════════════════════════════════════════════════════════
   CREATE USER MODAL
   UI-PROTOTYP: Simulierte Erstellung, kein echtes Backend.
   Temporäres Passwort wird im Frontend generiert (Platzhalter).
   ═══════════════════════════════════════════════════════════ */

const ROLES: UserRole[] = ["client", "employee", "admin"];

/* PENDING: temporäres Passwort im echten System serverseitig generieren
   (kryptografisch sicher), nicht im Frontend. Prototyp-Generierung ist
   Platzhalter. Kein temp. PW im Klartext in State/Log/URL persistieren. */
function generateTempPassword(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$%";
  let pw = "";
  const arr = new Uint8Array(14);
  crypto.getRandomValues(arr);
  for (let i = 0; i < 14; i++) {
    pw += chars[arr[i] % chars.length];
  }
  return pw;
}

interface Props {
  open: boolean;
  onClose: () => void;
  onCreate: (user: User) => void;
  existingIds: string[];
}

export function CreateUserModal({ open, onClose, onCreate, existingIds }: Props) {
  const { lang } = useLanguage();
  const modalRef = useRef<HTMLDivElement>(null);
  const t = ADMIN.createModal;

  const reducedMotion = typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ── Form state ── */
  const [role, setRole] = useState<UserRole>("client");
  const [clientId, setClientId] = useState("");
  const [tempPw, setTempPw] = useState(() => generateTempPassword());
  const [copied, setCopied] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [zip, setZip] = useState("");
  const [city, setCity] = useState("");
  const [rmId, setRmId] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  /* ── Reset on open ── */
  useEffect(() => {
    if (open) {
      setRole("client");
      setClientId("");
      setTempPw(generateTempPassword());
      setCopied(false);
      setFirstName("");
      setLastName("");
      setEmail("");
      setPhone("");
      setAddress("");
      setZip("");
      setCity("");
      setRmId("");
      setSubmitted(false);
      setLoading(false);
    }
  }, [open]);

  /* ── Focus trap ── */
  useEffect(() => {
    if (open && modalRef.current) {
      const first = modalRef.current.querySelector<HTMLElement>("select, input, button");
      first?.focus();
    }
  }, [open]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      e.stopPropagation();
      onClose();
    }
    if (e.key === "Tab" && modalRef.current) {
      const focusable = modalRef.current.querySelectorAll<HTMLElement>(
        'button, input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  }, [onClose]);

  /* ── Copy temp PW ── */
  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(tempPw).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [tempPw]);

  /* ── Validation ── */
  const idDuplicate = clientId.trim() !== "" && existingIds.some(
    (id) => id.toLowerCase() === clientId.trim().toUpperCase().toLowerCase()
  );
  const rmRequired = role === "client" && !rmId;

  const errors = {
    clientId: submitted && !clientId,
    clientIdDuplicate: submitted && idDuplicate,
    firstName: submitted && !firstName,
    lastName: submitted && !lastName,
    email: submitted && !email,
    rm: submitted && rmRequired,
  };

  /* ── Submit ── */
  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    if (!clientId || !firstName || !lastName || !email) return;
    if (idDuplicate || rmRequired) return;

    setLoading(true);
    await new Promise((r) => setTimeout(r, 800));
    setLoading(false);

    const selectedRm = DEMO_RMS.find((rm) => rm.id === rmId);

    const newUser: User = {
      id: clientId.toUpperCase(),
      role,
      status: "pending",
      mfaEnabled: false,
      mustChangePassword: true,
      profile: {
        firstName,
        lastName,
        email,
        phone: phone || undefined,
        address: address || undefined,
        zip: zip || undefined,
        city: city || undefined,
      },
      assignedRm: selectedRm || undefined,
      createdAt: new Date().toISOString(),
    };

    /* Temp PW is NOT stored on the user object — it would be sent
       via secure channel (e.g. encrypted email). No persistence in
       State/Log/URL. The user.mustChangePassword flag is what matters. */
    onCreate(newUser);
  }, [clientId, role, firstName, lastName, email, phone, address, zip, city, rmId, tempPw, onCreate, idDuplicate, rmRequired]);

  if (!open) return null;

  const errMsg = lang === "de" ? "Pflichtfeld" : "Required";
  const errDuplicate = lang === "de" ? "Diese ID ist bereits vergeben." : "This ID is already taken.";
  const errRm = lang === "de" ? "Mandanten benötigen einen zugeordneten RM." : "Clients require an assigned RM.";

  const labelStyle: React.CSSProperties = {
    fontFamily: sans, fontSize: 11, fontWeight: 500,
    letterSpacing: "0.12em", textTransform: "uppercase",
    color: C.stone, display: "block", marginBottom: 6,
  };

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: "fixed", inset: 0, zIndex: 10000,
          backgroundColor: "rgba(0,0,0,0.25)",
        }}
      />

      {/* Modal */}
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="create-title"
        onKeyDown={handleKeyDown}
        style={{
          position: "fixed",
          top: "50%", left: "50%",
          transform: "translate(-50%, -50%)",
          zIndex: 10001,
          backgroundColor: C.bg,
          border: `1px solid ${C.line}`,
          borderRadius: 8,
          width: "min(560px, calc(100vw - 32px))",
          maxHeight: "calc(100vh - 48px)",
          overflowY: "auto",
          boxShadow: "0 20px 60px rgba(0,0,0,0.12)",
        }}
      >
        {/* Header */}
        <div style={{
          padding: "28px 32px 0",
          display: "flex", justifyContent: "space-between", alignItems: "flex-start",
        }}>
          <div>
            <h2 id="create-title" style={{
              fontFamily: serif, fontSize: 24, fontWeight: 400,
              fontStyle: "italic", color: C.dark, margin: 0, lineHeight: 1.2,
            }}>
              {t.title[lang]}
            </h2>
            <p style={{
              fontFamily: sans, fontSize: 13, color: C.stone,
              margin: "8px 0 0 0", lineHeight: 1.5,
            }}>
              {t.subtitle[lang]}
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label={t.cancelBtn[lang]}
            style={{
              background: "transparent", border: "none", cursor: "pointer",
              padding: 8, outline: "none", lineHeight: 0, flexShrink: 0,
              marginTop: -4, marginRight: -8,
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M18 6L6 18M6 6l12 12" stroke={C.dark} strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} noValidate style={{ padding: "24px 32px 32px" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

            {/* Role */}
            <div>
              <label style={labelStyle}>{t.roleLabel[lang]} *</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as UserRole)}
                style={{
                  fontFamily: sans, fontSize: 14, color: C.dark,
                  backgroundColor: "transparent",
                  border: `1px solid ${C.line}`, borderRadius: 2,
                  padding: "10px 32px 10px 12px", width: "100%",
                  outline: "none", appearance: "none", cursor: "pointer",
                  height: 48,
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%238A857C' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`,
                  backgroundRepeat: "no-repeat",
                  backgroundPosition: "right 12px center",
                }}
              >
                {ROLES.map((r) => (
                  <option key={r} value={r}>{ROLE_LABELS[r][lang]}</option>
                ))}
              </select>
            </div>

            {/* Client ID */}
            <FloatingField
              label={t.clientIdLabel[lang]}
              value={clientId}
              onChange={setClientId}
              placeholder={t.clientIdPlaceholder[lang]}
              required
              error={errors.clientIdDuplicate ? errDuplicate : errors.clientId ? errMsg : undefined}
              disabled={loading}
            />

            {/* Temporary Password — generated, not typed */}
            <div>
              <label style={labelStyle}>{t.tempPwLabel[lang]}</label>
              <div style={{
                display: "flex", alignItems: "center", gap: 8,
                border: `1px solid ${C.line}`, borderRadius: 2,
                padding: "0 8px 0 12px", height: 48,
                backgroundColor: C.bgSecondary,
              }}>
                <code style={{
                  fontFamily: "monospace", fontSize: 14, color: C.dark,
                  flex: 1, letterSpacing: "0.05em", userSelect: "all",
                }}>
                  {tempPw}
                </code>
                {/* Copy */}
                <button
                  type="button"
                  onClick={handleCopy}
                  aria-label={copied ? t.copiedLabel[lang] : t.copyLabel[lang]}
                  style={{
                    fontFamily: sans, fontSize: 10, letterSpacing: "0.1em",
                    textTransform: "uppercase", color: copied ? C.success : C.stone,
                    background: "transparent", border: "none",
                    cursor: "pointer", padding: "8px 6px", outline: "none",
                    minHeight: 32, whiteSpace: "nowrap",
                  }}
                >
                  {copied ? t.copiedLabel[lang] : t.copyLabel[lang]}
                </button>
                {/* Regenerate */}
                <button
                  type="button"
                  onClick={() => { setTempPw(generateTempPassword()); setCopied(false); }}
                  aria-label={t.generateLabel[lang]}
                  style={{
                    background: "transparent", border: "none",
                    cursor: "pointer", padding: 6, outline: "none",
                    lineHeight: 0, color: C.stone,
                  }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M23 4v6h-6M1 20v-6h6"/>
                    <path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15"/>
                  </svg>
                </button>
              </div>
            </div>

            {/* Name row */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <FloatingField
                label={t.firstNameLabel[lang]} value={firstName} onChange={setFirstName}
                required error={errors.firstName ? errMsg : undefined} disabled={loading}
              />
              <FloatingField
                label={t.lastNameLabel[lang]} value={lastName} onChange={setLastName}
                required error={errors.lastName ? errMsg : undefined} disabled={loading}
              />
            </div>

            {/* Email + Phone */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <FloatingField
                label={t.emailLabel[lang]} value={email} onChange={setEmail}
                type="email" required error={errors.email ? errMsg : undefined} disabled={loading}
              />
              <FloatingField
                label={t.phoneLabel[lang]} value={phone} onChange={setPhone}
                type="tel" disabled={loading}
              />
            </div>

            {/* Address */}
            <FloatingField
              label={t.addressLabel[lang]} value={address} onChange={setAddress}
              disabled={loading}
            />

            {/* ZIP + City */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: 16 }}>
              <FloatingField
                label={t.zipLabel[lang]} value={zip} onChange={setZip}
                disabled={loading}
              />
              <FloatingField
                label={t.cityLabel[lang]} value={city} onChange={setCity}
                disabled={loading}
              />
            </div>

            {/* Assigned RM */}
            <div>
              <label style={labelStyle}>
                {t.rmLabel[lang]}{role === "client" ? " *" : ""}
              </label>
              {/* PENDING: echte Mitarbeiter-/RM-Liste von Tellian */}
              <select
                value={rmId}
                onChange={(e) => setRmId(e.target.value)}
                style={{
                  fontFamily: sans, fontSize: 14, color: C.dark,
                  backgroundColor: "transparent",
                  border: `1px solid ${errors.rm ? C.error : C.line}`, borderRadius: 2,
                  padding: "10px 32px 10px 12px", width: "100%",
                  outline: "none", appearance: "none", cursor: "pointer",
                  height: 48,
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%238A857C' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`,
                  backgroundRepeat: "no-repeat",
                  backgroundPosition: "right 12px center",
                }}
              >
                <option value="">{t.rmNone[lang]}</option>
                {DEMO_RMS.map((rm) => (
                  <option key={rm.id} value={rm.id}>
                    {rm.firstName} {rm.lastName}
                  </option>
                ))}
              </select>
              {errors.rm && (
                <span role="alert" style={{
                  fontFamily: sans, fontSize: 12, color: C.error,
                  display: "block", marginTop: 6,
                }}>
                  {errRm}
                </span>
              )}
            </div>
          </div>

          {/* Actions */}
          <div style={{
            display: "flex", gap: 12, marginTop: 32,
            justifyContent: "flex-end",
          }}>
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              style={{
                fontFamily: sans, fontSize: 11, fontWeight: 500,
                letterSpacing: "0.16em", textTransform: "uppercase",
                color: C.stone, backgroundColor: "transparent",
                border: `1px solid ${C.line}`, borderRadius: 0,
                padding: "12px 20px", cursor: "pointer",
                outline: "none", minHeight: 44,
              }}
            >
              {t.cancelBtn[lang]}
            </button>
            <button
              type="submit"
              disabled={loading}
              style={{
                fontFamily: sans, fontSize: 11, fontWeight: 500,
                letterSpacing: "0.16em", textTransform: "uppercase",
                color: C.dark, backgroundColor: loading ? C.line : C.button,
                border: `1px solid ${loading ? C.line : C.button}`,
                borderRadius: 0, padding: "12px 20px",
                cursor: loading ? "not-allowed" : "pointer",
                outline: "none", minHeight: 44,
                display: "flex", alignItems: "center", gap: 8,
                transition: reducedMotion ? "none" : `background-color ${DURATION.fast}ms ease`,
              }}
              onMouseEnter={(e) => { if (!loading) e.currentTarget.style.backgroundColor = C.buttonHover; }}
              onMouseLeave={(e) => { if (!loading) e.currentTarget.style.backgroundColor = C.button; }}
            >
              {loading ? t.creatingBtn[lang] : t.createBtn[lang]}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
