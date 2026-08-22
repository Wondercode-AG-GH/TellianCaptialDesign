import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

import { C, serif, sans } from "../tokens";
import { EASE } from "../../styles/motion";

const PORTALS = [
  {
    label: "Kunde",
    subtitle: "Portfolio, Reporting, Dokumente",
    href: "https://kunde.telliancapital.ch",
  },
  {
    label: "Partner",
    subtitle: "Beraterbereich und Referral",
    href: "https://partner.telliancapital.ch",
  },
  {
    label: "Mitarbeiter",
    subtitle: "Internes Backoffice",
    href: "https://intern.telliancapital.ch",
  },
] as const;

interface LoginOverlayProps {
  open: boolean;
  onClose: () => void;
  onSupportClick: () => void;
}

export function LoginOverlay({ open, onClose, onSupportClick }: LoginOverlayProps) {
  const closeBtnRef = useRef<HTMLButtonElement>(null);
  const triggerRef = useRef<HTMLElement | null>(null);
  const wasOpenRef = useRef(false);

  useEffect(() => {
    if (open) {
      triggerRef.current = document.activeElement as HTMLElement | null;
      wasOpenRef.current = true;
      const t = window.setTimeout(() => closeBtnRef.current?.focus(), 500);
      return () => window.clearTimeout(t);
    }
    if (wasOpenRef.current) {
      triggerRef.current?.focus?.({ preventScroll: true });
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  if (typeof document === "undefined") return null;

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="login-overlay-title"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 1000,
        pointerEvents: open ? "auto" : "none",
      }}
    >
      <div
        onClick={onClose}
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          backgroundColor: "rgba(0, 0, 0, 0.35)",
          opacity: open ? 1 : 0,
          transition: open
            ? "opacity 350ms ease-out"
            : "opacity 250ms ease-out 100ms",
        }}
      />

      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: open
            ? "translate(-50%, -50%) scale(1)"
            : "translate(-50%, -50%) scale(0.92)",
          opacity: open ? 1 : 0,
          transition: open
            ? `transform 450ms ${EASE.standard} 50ms, opacity 450ms ${EASE.standard} 50ms`
            : `transform 300ms ${EASE.in}, opacity 300ms ${EASE.in}`,
          width: "440px",
          maxWidth: "calc(100vw - 32px)",
          maxHeight: "calc(100vh - 32px)",
          overflowY: "auto",
          backgroundColor: C.bg,
          borderRadius: "16px",
          padding: "clamp(36px, 5vw, 56px) clamp(28px, 4vw, 52px)",
          boxShadow: "0 20px 60px rgba(0, 0, 0, 0.12)",
        }}
      >
        <button
          ref={closeBtnRef}
          onClick={onClose}
          aria-label="Overlay schliessen"
          style={{
            position: "absolute",
            top: "16px",
            right: "16px",
            width: "36px",
            height: "36px",
            borderRadius: "50%",
            border: "0.5px solid rgba(0, 0, 0, 0.08)",
            background: "#FFFFFF",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 0,
            color: C.charcoal,
            fontFamily: sans,
            fontSize: "20px",
            fontWeight: 300,
            lineHeight: 1,
          }}
        >
          ×
        </button>

        <h2
          id="login-overlay-title"
          style={{
            fontFamily: serif,
            fontSize: "clamp(36px, 5vw, 52px)",
            lineHeight: 1.05,
            color: C.dark,
            letterSpacing: "-0.02em",
            fontWeight: 400,
            margin: 0,
            marginBottom: "clamp(28px, 3.5vw, 40px)",
          }}
        >
          Ihr Zugang,
          <br />
          <em style={{ fontStyle: "italic", fontWeight: 400 }}>persönlich</em>
        </h2>

        <div style={{ display: "flex", flexDirection: "column" }}>
          {PORTALS.map((p) => (
            <PortalRow key={p.label} portal={p} />
          ))}
        </div>

        <p
          style={{
            fontFamily: sans,
            fontSize: "12px",
            color: C.muted,
            marginTop: "20px",
            marginBottom: 0,
            lineHeight: 1.5,
            letterSpacing: "0.02em",
          }}
        >
          Der Klick öffnet das Portal in einem neuen Tab.
        </p>

        <div
          style={{
            height: "0.5px",
            backgroundColor: C.line,
            marginTop: "clamp(24px, 3vw, 32px)",
            marginBottom: "clamp(18px, 2.5vw, 24px)",
          }}
        />

        <SupportLink
          onClick={() => {
            onClose();
            onSupportClick();
          }}
        />
      </div>
    </div>,
    document.body
  );
}

function PortalRow({ portal }: { portal: (typeof PORTALS)[number] }) {
  const [hover, setHover] = useState(false);
  return (
    <a
      href={portal.href}
      target="_blank"
      rel="noopener noreferrer"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onFocus={() => setHover(true)}
      onBlur={() => setHover(false)}
      style={{
        display: "flex",
        alignItems: "center",
        gap: "16px",
        padding: "18px 0",
        borderBottom: `0.5px solid ${C.line}`,
        textDecoration: "none",
        color: "inherit",
        outline: "none",
      }}
    >
      <span
        aria-hidden
        style={{
          display: "inline-block",
          width: hover ? "24px" : "14px",
          height: "0.5px",
          backgroundColor: hover ? C.dark : C.stone,
          transition: `width 300ms ${EASE.standard}, background-color 300ms ${EASE.standard}`,
          flexShrink: 0,
        }}
      />

      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontFamily: sans,
            fontSize: "12px",
            fontWeight: 600,
            letterSpacing: "0.16em",
            textTransform: "uppercase",
            color: hover ? C.warm : C.dark,
            transition: `color 300ms ${EASE.standard}`,
          }}
        >
          {portal.label}
        </div>
        <div
          style={{
            fontFamily: sans,
            fontSize: "12px",
            color: C.stone,
            marginTop: "4px",
            lineHeight: 1.4,
          }}
        >
          {portal.subtitle}
        </div>
      </div>

      <span
        aria-hidden
        style={{
          fontFamily: sans,
          fontSize: "14px",
          color: hover ? C.dark : C.muted,
          transition: `color 300ms ${EASE.standard}, transform 300ms ${EASE.standard}`,
          transform: hover ? "translate(2px, -2px)" : "translate(0, 0)",
          flexShrink: 0,
        }}
      >
        ↗
      </span>
    </a>
  );
}

function SupportLink({ onClick }: { onClick: () => void }) {
  const [hover, setHover] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onFocus={() => setHover(true)}
      onBlur={() => setHover(false)}
      style={{
        background: "transparent",
        border: "none",
        padding: 0,
        cursor: "pointer",
        fontFamily: sans,
        fontSize: "12px",
        color: C.stone,
        letterSpacing: "0.02em",
        textAlign: "left",
        display: "inline-flex",
        alignItems: "center",
        gap: "10px",
        outline: "none",
      }}
    >
      <span
        aria-hidden
        style={{
          display: "inline-block",
          width: hover ? "24px" : "14px",
          height: "0.5px",
          backgroundColor: hover ? C.dark : C.stone,
          transition: `width 300ms ${EASE.standard}, background-color 300ms ${EASE.standard}`,
        }}
      />
      <span>
        Probleme beim Anmelden?{" "}
        <span
          style={{
            color: hover ? C.dark : C.charcoal,
            transition: `color 300ms ${EASE.standard}`,
          }}
        >
          Support kontaktieren
        </span>
      </span>
    </button>
  );
}
