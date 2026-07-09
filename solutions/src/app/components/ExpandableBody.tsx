import { useState, useRef, useEffect } from "react";
import { C, sans } from "../tokens";

interface ExpandableBodyProps {
  /** All paragraphs to display. */
  paragraphs: string[];
  /** Number of paragraphs visible when collapsed (default 1). */
  visibleCount?: number;
  /** Font size applied to each paragraph (default "14px"). */
  fontSize?: string;
  /** Line height applied to each paragraph (default 1.7). */
  lineHeight?: number;
  /** Gap between paragraphs (default "14px"). */
  gap?: string;
  /** Label of the expand toggle (default "Mehr erfahren"). */
  expandLabel?: string;
  /** Label of the collapse toggle (default "Weniger anzeigen"). */
  collapseLabel?: string;
  /** Max width in px (e.g. "520px"). */
  maxWidth?: string;
}

/**
 * Mobile-friendly text block.
 * Shows the first `visibleCount` paragraphs. Remaining paragraphs are hidden
 * behind a smooth expand / collapse toggle. Used in vertical (mobile/tablet)
 * layout only — desktop renders the full body inline.
 */
export function ExpandableBody({
  paragraphs,
  visibleCount = 1,
  fontSize = "14px",
  lineHeight = 1.7,
  gap = "14px",
  expandLabel = "Mehr erfahren",
  collapseLabel = "Weniger anzeigen",
  maxWidth,
}: ExpandableBodyProps) {
  const [expanded, setExpanded] = useState(false);
  const hiddenRef = useRef<HTMLDivElement>(null);
  const [hiddenHeight, setHiddenHeight] = useState(0);

  const visible = paragraphs.slice(0, visibleCount);
  const hidden = paragraphs.slice(visibleCount);

  /* Measure the collapsed content block so we can animate max-height. */
  useEffect(() => {
    if (!hiddenRef.current) return;
    const ro = new ResizeObserver(() => {
      setHiddenHeight(hiddenRef.current?.scrollHeight ?? 0);
    });
    ro.observe(hiddenRef.current);
    setHiddenHeight(hiddenRef.current.scrollHeight);
    return () => ro.disconnect();
  }, []);

  /* If there's nothing to hide, just render everything. */
  if (hidden.length === 0) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap, maxWidth }}>
        {visible.map((text, i) => (
          <p
            key={i}
            style={{
              fontFamily: sans,
              fontSize,
              color: C.charcoal,
              lineHeight,
              margin: 0,
            }}
          >
            {text}
          </p>
        ))}
      </div>
    );
  }

  return (
    <div style={{ maxWidth }}>
      {/* Visible paragraphs */}
      <div style={{ display: "flex", flexDirection: "column", gap }}>
        {visible.map((text, i) => (
          <p
            key={i}
            style={{
              fontFamily: sans,
              fontSize,
              color: C.charcoal,
              lineHeight,
              margin: 0,
            }}
          >
            {text}
          </p>
        ))}
      </div>

      {/* Hidden paragraphs — collapsed with max-height transition */}
      <div
        aria-hidden={!expanded}
        style={{
          maxHeight: expanded ? `${hiddenHeight + 40}px` : "0px",
          opacity: expanded ? 1 : 0,
          overflow: "hidden",
          transition:
            "max-height 500ms cubic-bezier(0.4, 0, 0.2, 1), opacity 400ms ease-out",
          willChange: "max-height, opacity",
        }}
      >
        <div
          ref={hiddenRef}
          style={{
            display: "flex",
            flexDirection: "column",
            gap,
            paddingTop: gap,
          }}
        >
          {hidden.map((text, i) => (
            <p
              key={i}
              style={{
                fontFamily: sans,
                fontSize,
                color: C.charcoal,
                lineHeight,
                margin: 0,
              }}
            >
              {text}
            </p>
          ))}
        </div>
      </div>

      {/* Toggle */}
      <button
        onClick={() => setExpanded((e) => !e)}
        aria-expanded={expanded}
        style={{
          marginTop: "16px",
          display: "inline-flex",
          alignItems: "center",
          gap: "8px",
          background: "transparent",
          border: "none",
          cursor: "pointer",
          padding: "10px 4px",
          minHeight: "44px",
          fontFamily: sans,
          fontSize: "10px",
          letterSpacing: "0.18em",
          textTransform: "uppercase",
          color: C.stone,
          transition: "color 0.3s ease",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.color = C.dark)}
        onMouseLeave={(e) => (e.currentTarget.style.color = C.stone)}
      >
        <span>{expanded ? collapseLabel : expandLabel}</span>
        <span
          aria-hidden
          style={{
            display: "inline-block",
            transform: expanded ? "rotate(180deg)" : "none",
            transition: "transform 300ms ease-out",
            fontSize: "10px",
            lineHeight: 1,
          }}
        >
          ↓
        </span>
      </button>
    </div>
  );
}
