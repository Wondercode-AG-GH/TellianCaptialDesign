import { useState, useId } from "react";
import { C, sans } from "../tokens";

interface Props {
  label: string;
  type?: string;
  required?: boolean;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  error?: string;
  disabled?: boolean;
  autoComplete?: string;
}

/**
 * Input with floating label pattern — mirrors main site FloatingField.
 * Added: error state, disabled state, placeholder, autoComplete.
 */
export function FloatingField({
  label,
  type = "text",
  required = false,
  value,
  onChange,
  placeholder,
  error,
  disabled = false,
  autoComplete,
}: Props) {
  const [focused, setFocused] = useState(false);
  const id = useId();
  const errorId = `${id}-error`;
  const floated = focused || value.length > 0;
  const showError = !!error && !focused;

  const displayLabel = required ? `${label} *` : `${label}`;

  return (
    <div style={{ position: "relative", width: "100%" }}>
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
        }}
      >
        {displayLabel}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        required={required}
        disabled={disabled}
        placeholder={floated ? placeholder : undefined}
        autoComplete={autoComplete}
        aria-invalid={showError || undefined}
        aria-describedby={showError ? errorId : undefined}
        aria-required={required || undefined}
        style={{
          fontFamily: sans,
          fontSize: 14,
          color: disabled ? C.stone : C.dark,
          backgroundColor: "transparent",
          border: `1px solid ${showError ? C.error : focused ? C.dark : C.line}`,
          borderRadius: 2,
          padding: floated ? "22px 12px 8px" : "14px 12px",
          outline: "none",
          width: "100%",
          height: 48,
          boxSizing: "border-box",
          transition: "border-color 200ms ease, padding 200ms ease",
          appearance: "none",
          resize: "none",
          cursor: disabled ? "not-allowed" : "text",
          opacity: disabled ? 0.5 : 1,
        }}
      />
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
