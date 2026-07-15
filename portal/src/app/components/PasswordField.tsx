import { useState, useId } from "react";
import { C, sans } from "../tokens";

interface Props {
  label: string;
  value: string;
  onChange: (v: string) => void;
  error?: string;
  disabled?: boolean;
  autoComplete?: string;
}

/**
 * Password input with floating label + visibility toggle.
 * Mirrors FloatingField bordered-box style from main site.
 */
export function PasswordField({
  label,
  value,
  onChange,
  error,
  disabled = false,
  autoComplete,
}: Props) {
  const [focused, setFocused] = useState(false);
  const [visible, setVisible] = useState(false);
  const id = useId();
  const errorId = `${id}-error`;
  const floated = focused || value.length > 0;
  const showError = !!error && !focused;

  return (
    <div style={{ position: "relative", width: "100%" }}>
      {/* Floating label */}
      <label
        htmlFor={id}
        style={{
          position: "absolute",
          left: 12,
          top: floated ? 6 : "50%",
          transform: floated ? "none" : "translateY(-50%)",
          fontFamily: sans,
          fontSize: floated ? 11 : 13,
          fontWeight: floated ? 500 : 400,
          letterSpacing: floated ? "0.1em" : "0.02em",
          textTransform: floated ? "uppercase" : "none",
          color: showError ? C.error : focused ? C.dark : C.stone,
          pointerEvents: "none",
          transition: "all 200ms ease",
          lineHeight: 1,
          zIndex: 1,
        }}
      >
        {label} *
      </label>

      {/* Input */}
      <input
        id={id}
        type={visible ? "text" : "password"}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        disabled={disabled}
        autoComplete={autoComplete}
        aria-invalid={showError || undefined}
        aria-describedby={showError ? errorId : undefined}
        aria-required
        style={{
          fontFamily: sans,
          fontSize: 14,
          color: disabled ? C.stone : C.dark,
          backgroundColor: "transparent",
          border: `1px solid ${showError ? C.error : focused ? C.dark : C.line}`,
          borderRadius: 2,
          padding: floated ? "22px 44px 8px 12px" : "14px 44px 14px 12px",
          outline: "none",
          width: "100%",
          height: 48,
          boxSizing: "border-box",
          transition: "border-color 200ms ease, padding 200ms ease",
          appearance: "none",
          cursor: disabled ? "not-allowed" : "text",
          opacity: disabled ? 0.5 : 1,
        }}
      />

      {/* Visibility toggle */}
      <button
        type="button"
        tabIndex={-1}
        onClick={() => setVisible(!visible)}
        aria-label={visible ? "Passwort verbergen" : "Passwort anzeigen"}
        style={{
          position: "absolute",
          right: 8,
          top: "50%",
          transform: "translateY(-50%)",
          background: "transparent",
          border: "none",
          cursor: "pointer",
          padding: 8,
          lineHeight: 0,
          color: C.stone,
          outline: "none",
          minWidth: 32,
          minHeight: 32,
        }}
      >
        {visible ? (
          /* Eye-off icon */
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
            <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
            <path d="M14.12 14.12a3 3 0 1 1-4.24-4.24"/>
            <line x1="1" y1="1" x2="23" y2="23"/>
          </svg>
        ) : (
          /* Eye icon */
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
            <circle cx="12" cy="12" r="3"/>
          </svg>
        )}
      </button>

      {/* Error */}
      {showError && (
        <span
          id={errorId}
          role="alert"
          style={{
            fontFamily: sans,
            fontSize: 12,
            color: C.error,
            display: "block",
            marginTop: 6,
          }}
        >
          {error}
        </span>
      )}
    </div>
  );
}
