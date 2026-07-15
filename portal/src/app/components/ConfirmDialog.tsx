import { useEffect, useRef, useCallback } from "react";
import { C, serif, sans } from "../tokens";
import { EASE, DURATION } from "../../styles/motion";
import { useLanguage } from "../context/LanguageContext";
import { ADMIN } from "../adminContent";

/* ═══════════════════════════════════════════════════════════
   CONFIRM DIALOG — Modal mit Fokusfalle + Escape.
   Für destruktive/heikle Aktionen (Deaktivieren, PW-Reset,
   Impersonation). Barrierefrei: focus trap, aria-modal,
   role="alertdialog", Escape-Close.
   ═══════════════════════════════════════════════════════════ */

interface Props {
  open: boolean;
  title: string;
  body: string;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  open,
  title,
  body,
  confirmLabel,
  cancelLabel,
  destructive = false,
  onConfirm,
  onCancel,
}: Props) {
  const { lang } = useLanguage();
  const dialogRef = useRef<HTMLDivElement>(null);
  const confirmRef = useRef<HTMLButtonElement>(null);

  const reducedMotion = typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* Focus trap — focus confirm button on open */
  useEffect(() => {
    if (open && confirmRef.current) {
      confirmRef.current.focus();
    }
  }, [open]);

  /* Escape to close */
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      e.stopPropagation();
      onCancel();
    }
    /* Focus trap — Tab cycles within dialog */
    if (e.key === "Tab" && dialogRef.current) {
      const focusable = dialogRef.current.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
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
  }, [onCancel]);

  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onCancel}
        style={{
          position: "fixed", inset: 0, zIndex: 10000,
          backgroundColor: "rgba(0,0,0,0.25)",
          opacity: open ? 1 : 0,
          transition: reducedMotion ? "none" : `opacity ${DURATION.normal}ms ease`,
        }}
      />

      {/* Dialog */}
      <div
        ref={dialogRef}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-title"
        aria-describedby="confirm-body"
        onKeyDown={handleKeyDown}
        style={{
          position: "fixed",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          zIndex: 10001,
          backgroundColor: C.bg,
          border: `1px solid ${C.line}`,
          borderRadius: 8,
          padding: "32px",
          width: "min(420px, calc(100vw - 48px))",
          boxShadow: "0 20px 60px rgba(0,0,0,0.12)",
        }}
      >
        {/* Title */}
        <h2
          id="confirm-title"
          style={{
            fontFamily: serif,
            fontSize: 22,
            lineHeight: 1.2,
            color: C.dark,
            fontWeight: 400,
            fontStyle: "italic",
            margin: 0,
          }}
        >
          {title}
        </h2>

        {/* Body */}
        <p
          id="confirm-body"
          style={{
            fontFamily: sans,
            fontSize: 14,
            color: C.charcoal,
            lineHeight: 1.6,
            margin: "16px 0 0 0",
          }}
        >
          {body}
        </p>

        {/* Actions */}
        <div style={{
          display: "flex",
          gap: 12,
          marginTop: 28,
          justifyContent: "flex-end",
        }}>
          {/* Cancel */}
          <button
            onClick={onCancel}
            style={{
              fontFamily: sans, fontSize: 11, fontWeight: 500,
              letterSpacing: "0.16em", textTransform: "uppercase",
              color: C.stone, backgroundColor: "transparent",
              border: `1px solid ${C.line}`, borderRadius: 0,
              padding: "12px 20px", cursor: "pointer",
              outline: "none", minHeight: 44,
              transition: reducedMotion ? "none" : `border-color ${DURATION.fast}ms ease`,
            }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = C.dark; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = C.line; }}
          >
            {cancelLabel || ADMIN.confirm.cancel[lang]}
          </button>

          {/* Confirm */}
          <button
            ref={confirmRef}
            onClick={onConfirm}
            style={{
              fontFamily: sans, fontSize: 11, fontWeight: 500,
              letterSpacing: "0.16em", textTransform: "uppercase",
              color: destructive ? "#ffffff" : C.dark,
              backgroundColor: destructive ? C.error : C.button,
              border: `1px solid ${destructive ? C.error : C.button}`,
              borderRadius: 0, padding: "12px 20px",
              cursor: "pointer", outline: "none", minHeight: 44,
              transition: reducedMotion ? "none" : `background-color ${DURATION.fast}ms ease`,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = destructive ? "#9A3A30" : C.buttonHover;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = destructive ? C.error : C.button;
            }}
          >
            {confirmLabel || ADMIN.confirm.confirm[lang]}
          </button>
        </div>
      </div>
    </>
  );
}
