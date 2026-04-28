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
}

/**
 * Input/Textarea with floating label pattern.
 * Label sits inside the field at rest, floats above on focus or when filled.
 */
export function FloatingField({
  label,
  type = "text",
  required = false,
  value,
  onChange,
  multiline = false,
  rows = 5,
}: FloatingFieldProps) {
  const [focused, setFocused] = useState(false);
  const id = useId();
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
    fontSize: floated ? "11px" : "13px",
    fontWeight: floated ? 500 : 400,
    letterSpacing: floated ? "0.1em" : "0.02em",
    textTransform: floated ? "uppercase" : "none",
    color: focused ? C.dark : C.stone,
    pointerEvents: "none",
    transition: "all 200ms ease",
    lineHeight: 1,
  };

  const fieldBase: React.CSSProperties = {
    fontFamily: sans,
    fontSize: "14px",
    color: C.dark,
    backgroundColor: "transparent",
    border: `1px solid ${focused ? C.dark : C.line}`,
    borderRadius: "2px",
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
    onBlur: () => setFocused(false),
    "aria-required": required || undefined,
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
    </div>
  );
}
