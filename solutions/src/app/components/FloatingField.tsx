import { useState, useId } from "react";
import { C, sans } from "../tokens";

/* ═══════════════════════════════════════════════════════════
   FLOATING FIELD — exact mirror of main site's FloatingField.
   Label floats above when focused or filled. Shows "(optional)"
   for non-required fields, " *" for required.
   ═══════════════════════════════════════════════════════════ */

interface Props {
  label: string;
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
  type?: string;
  multiline?: boolean;
  rows?: number;
}

export function FloatingField({
  label,
  value,
  onChange,
  required = false,
  type = "text",
  multiline = false,
  rows = 5,
}: Props) {
  const [focused, setFocused] = useState(false);
  const id = useId();
  const floated = focused || value.length > 0;

  const displayLabel = required ? `${label} *` : `${label} (optional)`;

  const labelStyle: React.CSSProperties = {
    position: "absolute",
    left: 12,
    top: floated ? 6 : multiline ? 12 : "50%",
    transform: floated ? "none" : multiline ? "none" : "translateY(-50%)",
    fontFamily: sans,
    fontSize: floated ? 11 : 13,
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
    fontSize: 14,
    color: C.dark,
    backgroundColor: "transparent",
    border: `1px solid ${focused ? C.dark : C.line}`,
    borderRadius: 2,
    padding: floated ? "22px 12px 8px" : "14px 12px",
    outline: "none",
    width: "100%",
    boxSizing: "border-box",
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
    <div style={{ position: "relative", width: "100%" }}>
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
          style={{ ...fieldBase, height: 48 }}
        />
      )}
    </div>
  );
}
