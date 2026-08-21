"use client";

import { useState, useId } from "react";
import { C, sans } from "../tokens";

interface FloatingFieldProps {
  label: string;
  type?: string;
  required?: boolean;
  value: string;
  onChange: (value: string) => void;
  multiline?: boolean;
  rows?: number;
  /** Meldung direkt am Feld. Gesetzt heisst: Feld ist im Fehlerzustand. */
  fehler?: string;
  onBlurPruefen?: () => void;
}

/**
 * Eingabefeld mit wanderndem Etikett.
 *
 * Eckig und mit Haarlinie, wie der Rest der Seite. Der frühere Radius
 * von 2px war das einzige gerundete Element weit und breit.
 *
 * Die Fehlermeldung steht AM FELD, nicht als Sammelmeldung über dem
 * Formular: eine Liste oben zwingt zum Hin- und Herspringen zwischen
 * Meldung und Feld, und auf dem Telefon steht sie ausserhalb des
 * Bildes.
 */
export function FloatingField({
  label,
  type = "text",
  required = false,
  value,
  onChange,
  multiline = false,
  rows = 5,
  fehler,
  onBlurPruefen,
}: FloatingFieldProps) {
  const [focused, setFocused] = useState(false);
  const id = useId();
  const fehlerId = `${id}-fehler`;
  const floated = focused || value.length > 0;

  const displayLabel = required
    ? `${label} *`
    : `${label} (optional)`;

  const containerStyle: React.CSSProperties = {
    position: "relative",
    width: "100%",
  };

  const labelStyle: React.CSSProperties = {
    position: "absolute",
    left: "12px",
    top: floated ? "6px" : multiline ? "12px" : "50%",
    transform: floated ? "none" : multiline ? "none" : "translateY(-50%)",
    fontFamily: sans,
    /* 11px unterschritt die Untergrenze von 12px. */
    fontSize: floated ? "12px" : "13px",
    fontWeight: floated ? 500 : 400,
    letterSpacing: floated ? "0.1em" : "0.02em",
    textTransform: floated ? "uppercase" : "none",
    color: fehler
      ? "var(--tellian-field-error)"
      : focused
        ? "var(--tellian-field-focus)"
        : "var(--tellian-field-label)",
    pointerEvents: "none",
    transition: "all 200ms ease",
    lineHeight: 1,
  };

  const fieldBase: React.CSSProperties = {
    fontFamily: sans,
    fontSize: "14px",
    color: "var(--tellian-field-ink)",
    border: `1px solid ${
      fehler
        ? "var(--tellian-field-error)"
        : focused
          ? "var(--tellian-field-focus)"
          : "var(--tellian-field-line)"
    }`,
    borderRadius: 0,
    backgroundColor: "var(--tellian-field-bg)",
    padding: floated ? "22px 12px 8px" : "14px 12px",
    outline: "none",
    width: "100%",
    transition: "border-color 200ms ease, padding 200ms ease",
    appearance: "none",
    resize: "none",
  };

  const sharedProps = {
    id,
    value,
    onFocus: () => setFocused(true),
    onBlur: () => {
      setFocused(false);
      onBlurPruefen?.();
    },
    "aria-required": required || undefined,
    "aria-invalid": fehler ? (true as const) : undefined,
    "aria-describedby": fehler ? fehlerId : undefined,
  };

  return (
    <div style={containerStyle}>
      <label htmlFor={id} style={labelStyle}>
        {displayLabel}
      </label>
      {multiline ? (
        <textarea
          {...sharedProps}
          rows={rows}
          required={required}
          onChange={(e) => onChange(e.target.value)}
          style={{ ...fieldBase, minHeight: `${rows * 24}px` }}
        />
      ) : (
        <input
          {...sharedProps}
          type={type}
          required={required}
          onChange={(e) => onChange(e.target.value)}
          style={{ ...fieldBase, height: "48px" }}
        />
      )}
      {fehler && (
        <span
          id={fehlerId}
          style={{
            display: "block",
            marginTop: "6px",
            fontFamily: sans,
            fontSize: "12px",
            lineHeight: 1.4,
            color: "var(--tellian-field-error)",
          }}
        >
          {fehler}
        </span>
      )}
    </div>
  );
}
