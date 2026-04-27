import { ANLAGEPROZESS_STEPS } from "../data/anlageprozessSteps";
import { CtaButton } from "./CtaButton";
import { FaqAccordion, type FaqItem } from "./FaqAccordion";

const VERMOEGENSVERWALTUNG_FAQ: readonly FaqItem[] = [
  {
    question: "Wie funktioniert die Vermögensverwaltung auf Mandatsbasis?",
    answer:
      "Sie erteilen uns eine Verwaltungsvollmacht. Ihr Vermögen bleibt auf Ihrem eigenen Depot bei einer Kooperationsbank. Wir treffen die Anlageentscheide — Sie behalten die Kontrolle über Ihre Bankbeziehung.",
  },
  {
    question: "Wer entscheidet über Anlagen in meinem Portfolio?",
    answer:
      "Die Entscheidungen trifft unser Anlagekomitee. Es tagt monatlich und vereint Geschäftsleitung, Chef Anlagestrategie, internationale Partner Asset Manager und Experten für alternative Anlageklassen. Bei ausserordentlichen Marktentwicklungen tagt das Komitee kurzfristig.",
  },
  {
    question: "Wie oft erhalte ich ein Reporting?",
    answer:
      "Vierteljährlich, automatisch und konsolidiert. Auf Wunsch mit kundenspezifischen Zusatzauswertungen. Zusätzlich haben Sie jederzeit Einblick in Ihr Kundenportal.",
  },
];

import { C, serif, sans } from "../tokens";

interface AnlageprozessDetailProps {
  isMobile: boolean;
  /** Called when the user clicks the "Gespräch vereinbaren" CTA — should close detail mode. */
  onContactClick: () => void;
}

/**
 * The detail body shown below the horizontal step-stepper when the
 * Vermögensverwaltung detail view is active.
 *
 * Does NOT include: header-bar, back-link, stepper (those live in the
 * overlay shell so the steps can share DOM with Section3Timeline).
 */
export function AnlageprozessDetail({ isMobile, onContactClick }: AnlageprozessDetailProps) {
  return (
    <div
      style={{
        maxWidth: "900px",
        margin: "0 auto",
        padding: isMobile ? "16px 20px 40px" : "24px 48px 56px",
        fontFamily: sans,
        color: C.dark,
      }}
    >
      {ANLAGEPROZESS_STEPS.map((step, i) => (
        <section
          key={step.num}
          style={{
            paddingTop: i === 0 ? "0" : isMobile ? "48px" : "72px",
            paddingBottom: isMobile ? "48px" : "72px",
            borderTop: i === 0 ? "none" : `1px solid ${C.line}`,
          }}
        >
          <div style={{ maxWidth: "600px" }}>
            <span
              style={{
                fontFamily: sans,
                fontSize: "10px",
                letterSpacing: "0.22em",
                textTransform: "uppercase",
                color: C.stone,
                display: "block",
              }}
            >
              {step.detailEyebrow}
            </span>

            <h2
              style={{
                fontFamily: serif,
                fontSize: isMobile ? "clamp(28px, 7vw, 36px)" : "32px",
                lineHeight: 1.12,
                color: C.dark,
                letterSpacing: "-0.02em",
                fontWeight: 400,
                margin: "16px 0 0 0",
              }}
            >
              {step.detailHeadline}
            </h2>

            <p
              style={{
                fontFamily: sans,
                fontSize: isMobile ? "13px" : "14px",
                color: C.stone,
                lineHeight: 1.5,
                margin: "8px 0 32px 0",
              }}
            >
              {step.detailSubline}
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              {step.detailBody.map((text, j) => (
                <p
                  key={j}
                  style={{
                    fontFamily: sans,
                    fontSize: "14px",
                    color: C.charcoal,
                    lineHeight: 1.7,
                    margin: 0,
                  }}
                >
                  {text}
                </p>
              ))}
            </div>

            <ul
              style={{
                listStyle: "none",
                padding: 0,
                margin: "16px 0 0 0",
                display: "flex",
                flexDirection: "column",
                gap: "10px",
              }}
            >
              {step.detailBullets.map((bullet, j) => (
                <li
                  key={j}
                  style={{
                    fontFamily: sans,
                    fontSize: "14px",
                    color: C.charcoal,
                    lineHeight: 1.7,
                    display: "flex",
                    gap: "12px",
                  }}
                >
                  <span aria-hidden style={{ color: C.stone, flexShrink: 0 }}>—</span>
                  <span>{bullet}</span>
                </li>
              ))}
            </ul>

            {step.detailClosing && (
              <p
                style={{
                  fontFamily: sans,
                  fontSize: "14px",
                  color: C.charcoal,
                  lineHeight: 1.7,
                  margin: "24px 0 0 0",
                }}
              >
                {step.detailClosing}
              </p>
            )}
          </div>
        </section>
      ))}

      {/* ═══ FAQ — thematic questions about the Mandat & process ═══ */}
      <div
        style={{
          borderTop: `1px solid ${C.line}`,
          paddingTop: isMobile ? "48px" : "72px",
          paddingBottom: isMobile ? "8px" : "16px",
        }}
      >
        <FaqAccordion items={VERMOEGENSVERWALTUNG_FAQ} schemaId="vermoegensverwaltung" />
      </div>

      {/* ═══ Final CTA ═══ */}
      <div
        style={{
          borderTop: `1px solid ${C.line}`,
          paddingTop: isMobile ? "48px" : "72px",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          gap: "20px",
        }}
      >
        <span
          style={{
            fontFamily: sans,
            fontSize: "10px",
            letterSpacing: "0.22em",
            textTransform: "uppercase",
            color: C.stone,
          }}
        >
          Nächster Schritt
        </span>
        <h3
          style={{
            fontFamily: serif,
            fontSize: isMobile ? "clamp(26px, 6vw, 32px)" : "32px",
            lineHeight: 1.12,
            letterSpacing: "-0.02em",
            fontWeight: 400,
            margin: 0,
            color: C.dark,
          }}
        >
          Ein Gespräch ist <em style={{ fontStyle: "italic", fontWeight: 400 }}>der Anfang.</em>
        </h3>
        <p
          style={{
            fontFamily: sans,
            fontSize: "14px",
            color: C.charcoal,
            lineHeight: 1.7,
            maxWidth: "500px",
            margin: 0,
          }}
        >
          Wenn Sie unseren Prozess bis hierher verfolgt haben — sprechen wir über Ihren. Ein erstes Gespräch ist unverbindlich, persönlich und vertraulich.
        </p>
        <CtaButton
          href="/#contact"
          onClick={(e) => { e.preventDefault(); onContactClick(); }}
        >
          Gespräch vereinbaren
        </CtaButton>
      </div>

      {/* ═══ Footer ═══ */}
      <div
        style={{
          marginTop: "48px",
          padding: "32px 0 24px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "10px",
          borderTop: `1px solid ${C.line}`,
        }}
      >
        <div style={{ width: "16px", height: "1px", backgroundColor: C.line }} />
        <span
          style={{
            fontFamily: sans,
            fontSize: "8px",
            letterSpacing: "0.16em",
            color: C.muted,
            opacity: 0.6,
            textTransform: "uppercase",
            textAlign: "center",
          }}
        >
          Tellian Capital AG &mdash; Est. 1996 &mdash; Zürich
        </span>
      </div>
    </div>
  );
}
