import { C, sans } from "../tokens";

interface SectionDividerProps {
  label: string;
  compact?: boolean;
  color?: string;
}

/**
 * Reusable divider with short line + uppercase label.
 * Used in timeline (above step 01, between step 02/03)
 * and other sections for structural separation.
 */
export function SectionDivider({ label, compact = false, color = C.dark }: SectionDividerProps) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: compact ? "10px" : "14px",
      }}
    >
      <div
        style={{
          width: "28px",
          height: "1px",
          backgroundColor: color,
          flexShrink: 0,
        }}
      />
      <span
        style={{
          fontFamily: sans,
          fontSize: compact ? "10px" : "13px",
          letterSpacing: "0.2em",
          color,
          textTransform: "uppercase",
          whiteSpace: "nowrap",
        }}
      >
        {label}
      </span>
    </div>
  );
}
