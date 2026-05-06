import type { CSSProperties } from "react";
import { useBreakpoint } from "./useBreakpoint";

import { C, sans } from "../tokens";

interface CtaButtonProps {
  href: string;
  children: React.ReactNode;
  /** Arrow indicator (default true) */
  arrow?: boolean;
  /** Visual style override.
   *  "auto" (default): solid on mobile + tablet, ghost on desktop.
   *  "ghost": always ghost.
   *  "solid": always solid (full-width black). */
  variant?: "auto" | "ghost" | "solid";
  /** Force full width (default true for solid, false for ghost) */
  fullWidth?: boolean;
  className?: string;
  style?: CSSProperties;
  onClick?: (e: React.MouseEvent<HTMLAnchorElement>) => void;
}

/**
 * Swiss-luxury CTA button.
 * Default behavior — auto-switches between two visual styles:
 *  • Desktop (≥1024px): refined ghost button (border, hover-fill).
 *  • Mobile + Tablet (<1024px): solid black, full width, white text.
 * Override with variant prop when needed.
 */
export function CtaButton({
  href,
  children,
  arrow = true,
  variant = "auto",
  fullWidth,
  className = "",
  style,
  onClick,
}: CtaButtonProps) {
  const { isDesktop } = useBreakpoint();

  const isSolid =
    variant === "solid" ||
    (variant === "auto" && !isDesktop);

  const widthFull = fullWidth ?? isSolid;

  const handleClick = onClick ?? ((e: React.MouseEvent<HTMLAnchorElement>) => { e.preventDefault(); });

  if (isSolid) {
    return (
      <a
        href={href}
        onClick={handleClick}
        className={`
          inline-flex items-center justify-center gap-3
          uppercase
          rounded-none
          transition-colors duration-300 ease-out
          active:scale-[0.98]
          px-6 py-4
          text-[11px]
          hover:bg-tellian-button-hover
          ${widthFull ? "w-full" : ""}
          ${className}
        `}
        style={{
          fontFamily: sans,
          color: C.dark,
          backgroundColor: C.button,
          letterSpacing: "0.18em",
          lineHeight: 1,
          textAlign: "center",
          ...style,
        }}
      >
        <span>{children}</span>
        {arrow && (
          <span aria-hidden style={{ display: "inline-block" }}>→</span>
        )}
      </a>
    );
  }

  /* Ghost variant (default desktop) — always button color bg + dark text */
  return (
    <a
      href={href}
      onClick={handleClick}
      className={`
        group inline-flex items-center gap-3
        uppercase tracking-[0.16em]
        rounded-none
        hover:bg-tellian-button-hover
        active:scale-[0.98]
        px-6 py-3 md:px-8 md:py-4
        text-[10px] md:text-[11px]
        ${widthFull ? "w-full justify-center" : ""}
        ${className}
      `}
      style={{
        fontFamily: sans,
        color: C.dark,
        backgroundColor: C.button,
        border: `1px solid ${C.button}`,
        letterSpacing: "0.16em",
        lineHeight: 1,
        transition: "background-color 400ms cubic-bezier(0.16,1,0.3,1)",
        ...style,
      }}
    >
      <span>{children}</span>
      {arrow && (
        <span
          className="inline-block transition-transform duration-[400ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-1.5"
          aria-hidden
        >
          →
        </span>
      )}
    </a>
  );
}
