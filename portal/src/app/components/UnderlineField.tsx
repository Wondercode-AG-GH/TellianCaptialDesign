import { useState, useId } from "react";
import { C, sans } from "../tokens";
import { EASE, DURATION } from "../../styles/motion";

interface Props {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
  error?: string;
  disabled?: boolean;
  autoComplete?: string;
}

export function UnderlineField({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
  error,
  disabled = false,
  autoComplete,
}: Props) {
  const [focused, setFocused] = useState(false);
  const id = useId();
  const errorId = `${id}-error`;
  const hasValue = value.length > 0;
  const showError = !!error && !focused;

  return (
    <div style={{ position: "relative", width: "100%" }}>
      {/* Label — always above the field */}
      <label
        htmlFor={id}
        style={{
          fontFamily: sans,
          fontSize: 11,
          fontWeight: 500,
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          color: showError ? C.error : focused ? C.dark : C.stone,
          display: "block",
          marginBottom: 8,
          transition: `color ${DURATION.fast}ms ease`,
          cursor: "pointer",
        }}
      >
        {label}
      </label>

      {/* Input */}
      <input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        disabled={disabled}
        placeholder={placeholder}
        autoComplete={autoComplete}
        aria-invalid={showError || undefined}
        aria-describedby={showError ? errorId : undefined}
        aria-required
        style={{
          fontFamily: sans,
          fontSize: 16,
          fontWeight: 400,
          color: disabled ? C.stone : C.dark,
          backgroundColor: "transparent",
          border: "none",
          borderBottom: `1.5px solid ${showError ? C.error : focused ? C.dark : hasValue ? C.stone : C.line}`,
          borderRadius: 0,
          padding: "10px 0",
          outline: "none",
          width: "100%",
          boxSizing: "border-box",
          transition: `border-color ${DURATION.fast}ms ${EASE.standard}`,
          appearance: "none",
          cursor: disabled ? "not-allowed" : "text",
          opacity: disabled ? 0.5 : 1,
        }}
      />

      {/* Error message */}
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
