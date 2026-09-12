import { useEffect, useId, useState } from "react";
import { C, serif, sans } from "../tokens";
import { EASE } from "../../styles/motion";

export interface FaqItem {
  question: string;
  answer: string;
}

interface FaqAccordionProps {
  items: readonly FaqItem[];
  /** Unique identifier used on the injected JSON-LD script tag — avoids
      collisions if multiple FAQ blocks are ever mounted at once. */
  schemaId: string;
}

export function FaqAccordion({ items, schemaId }: FaqAccordionProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(0);

  /* FAQPage JSON-LD — enables rich snippets in Google + AI search citations.
     One script per FaqAccordion instance, keyed by schemaId. */
  useEffect(() => {
    const schema = {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: items.map((item) => ({
        "@type": "Question",
        name: item.question,
        acceptedAnswer: { "@type": "Answer", text: item.answer },
      })),
    };
    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.setAttribute("data-faq-schema", schemaId);
    script.textContent = JSON.stringify(schema);
    document.head.appendChild(script);
    return () => {
      if (script.parentNode) script.parentNode.removeChild(script);
    };
  }, [items, schemaId]);

  return (
    <section aria-labelledby={`faq-heading-${schemaId}`}>
      {/* Label — accent line + uppercase meta label */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "12px",
          marginBottom: "20px",
        }}
      >
        <span
          aria-hidden
          style={{
            display: "inline-block",
            width: "16px",
            height: "1px",
            backgroundColor: C.muted,
            flexShrink: 0,
          }}
        />
        <span
          id={`faq-heading-${schemaId}`}
          style={{
            fontFamily: sans,
            fontSize: "12px",
            letterSpacing: "var(--tellian-ls-marker)",
            color: C.stone,
            textTransform: "uppercase",
          }}
        >
          Häufige Fragen
        </span>
      </div>

      {/* Accordion list */}
      <div>
        {items.map((item, i) => (
          <FaqRow
            key={i}
            question={item.question}
            answer={item.answer}
            open={activeIndex === i}
            onToggle={() => setActiveIndex(activeIndex === i ? null : i)}
            isFirst={i === 0}
          />
        ))}
      </div>
    </section>
  );
}

function FaqRow({
  question,
  answer,
  open,
  onToggle,
  isFirst,
}: {
  question: string;
  answer: string;
  open: boolean;
  onToggle: () => void;
  isFirst: boolean;
}) {
  const id = useId();
  const btnId = `faq-btn-${id}`;
  const panelId = `faq-panel-${id}`;

  return (
    <div
      style={{
        borderTop: isFirst ? `0.5px solid ${C.line}` : "none",
        borderBottom: `0.5px solid ${C.line}`,
      }}
    >
      <button
        id={btnId}
        onClick={onToggle}
        aria-expanded={open}
        aria-controls={panelId}
        style={{
          display: "flex",
          width: "100%",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: "16px",
          background: "transparent",
          border: "none",
          cursor: "pointer",
          padding: "18px 0",
          minHeight: "44px",
          textAlign: "left",
          outline: "none",
        }}
      >
        <span
          style={{
            fontFamily: serif,
            fontSize: "17px",
            color: C.dark,
            lineHeight: 1.4,
            fontWeight: 400,
            flex: 1,
          }}
        >
          {question}
        </span>

        {/* + at rest, rotates 45° to × when open */}
        <span
          aria-hidden
          style={{
            position: "relative",
            width: "14px",
            height: "14px",
            flexShrink: 0,
            marginTop: "6px",
            color: C.stone,
            transform: open ? "rotate(45deg)" : "rotate(0deg)",
            transition: `transform 300ms ${EASE.standard}`,
          }}
        >
          <span
            style={{
              position: "absolute",
              top: "50%",
              left: 0,
              right: 0,
              height: "1px",
              backgroundColor: "currentColor",
              transform: "translateY(-50%)",
            }}
          />
          <span
            style={{
              position: "absolute",
              top: 0,
              bottom: 0,
              left: "50%",
              width: "1px",
              backgroundColor: "currentColor",
              transform: "translateX(-50%)",
            }}
          />
        </span>
      </button>

      {/* Answer panel — grid-rows trick for smooth height animation */}
      <div
        id={panelId}
        role="region"
        aria-labelledby={btnId}
        style={{
          display: "grid",
          gridTemplateRows: open ? "1fr" : "0fr",
          transition: `grid-template-rows 350ms ${EASE.standard}`,
        }}
      >
        <div style={{ overflow: "hidden" }}>
          <p
            style={{
              fontFamily: sans,
              fontSize: "14px",
              color: C.charcoal,
              lineHeight: 1.7,
              fontWeight: 300,
              margin: 0,
              paddingBottom: "20px",
              maxWidth: "600px",
            }}
          >
            {answer}
          </p>
        </div>
      </div>
    </div>
  );
}
