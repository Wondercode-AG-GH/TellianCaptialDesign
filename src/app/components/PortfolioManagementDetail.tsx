import { CtaButton } from "./CtaButton";
import { C, serif, sans } from "../tokens";
import {
  PM_HERO,
  PM_PROCESS_STAGES,
  PM_PROCESS_BODY,
  PM_STRATEGIES,
  PM_TEXT_SECTIONS,
} from "../data/portfolioManagementSections";

/* ═══════════════════════════════════════════════════════════
   PORTFOLIO MANAGEMENT — Subpage detail body.
   4 Sektionen: Prozess → Komitee → Strategien → Universum.
   Keine Verwahrung (MANDAT deckt das ab). Kein FAQ (pending).
   EN: pending — Übersetzung folgt.
   ═══════════════════════════════════════════════════════════ */

interface Props {
  isMobile: boolean;
  onContactClick: () => void;
}

export function PortfolioManagementDetail({ isMobile, onContactClick }: Props) {
  const sectionPad = { paddingTop: isMobile ? "48px" : "72px", paddingBottom: isMobile ? "48px" : "72px" };
  const hSize = isMobile ? "clamp(28px, 7vw, 36px)" : "32px";

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
      {/* ═══ Intro (below SubpageOverlay hero) ═══ */}
      <section style={{ paddingBottom: isMobile ? "48px" : "72px" }}>
        <div style={{ maxWidth: "600px", display: "flex", flexDirection: "column", gap: "16px" }}>
          {PM_HERO.intro.map((text, i) => (
            <p key={i} style={{ fontFamily: sans, fontSize: "14px", color: C.charcoal, lineHeight: 1.7, margin: 0 }}>
              {text}
            </p>
          ))}
        </div>
      </section>

      {/* ═══ Sektion 1 — Anlageprozess (PROZESS) ═══ */}
      <section style={{ ...sectionPad, borderTop: `1px solid ${C.line}` }}>
        <div style={{ maxWidth: "600px" }}>
          <span style={{ fontFamily: sans, fontSize: "10px", letterSpacing: "0.22em", textTransform: "uppercase", color: C.stone, display: "block" }}>
            Anlageprozess
          </span>
          <h2 style={{ fontFamily: serif, fontSize: hSize, lineHeight: 1.12, color: C.dark, letterSpacing: "-0.02em", fontWeight: 400, margin: "16px 0 0 0" }}>
            Der Weg zum <em style={{ fontStyle: "italic", fontWeight: 400 }}>Portfolio.</em>
          </h2>

          {/* 8 process stages */}
          <div style={{ marginTop: "32px", display: "flex", flexDirection: "column", gap: 0 }}>
            {PM_PROCESS_STAGES.map((stage, si) => (
              <div key={si} style={{
                paddingTop: si === 0 ? 0 : "24px",
                paddingBottom: "24px",
                borderTop: si === 0 ? "none" : `1px solid ${C.line}`,
              }}>
                <span style={{ fontFamily: serif, fontSize: "15px", color: C.dark, lineHeight: 1.3, display: "block" }}>
                  {stage.name}
                </span>
                {stage.bullets.length > 0 && (
                  <ul style={{ listStyle: "none", padding: 0, margin: "10px 0 0 0", display: "flex", flexDirection: "column", gap: "6px" }}>
                    {stage.bullets.map((b, bi) => (
                      <li key={bi} style={{ fontFamily: sans, fontSize: "13px", color: C.charcoal, lineHeight: 1.6, display: "flex", gap: "10px" }}>
                        <span aria-hidden style={{ color: C.stone, flexShrink: 0 }}>—</span>
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>

          {/* Begleitsatz */}
          <p style={{ fontFamily: sans, fontSize: "14px", color: C.charcoal, lineHeight: 1.7, margin: "8px 0 0 0", fontStyle: "italic" }}>
            {PM_PROCESS_BODY}
          </p>
        </div>
      </section>

      {/* ═══ Sektion 2 — Anlagekomitee (KOMITEE) ═══ */}
      <section style={{ ...sectionPad, borderTop: `1px solid ${C.line}` }}>
        <div style={{ maxWidth: "600px" }}>
          <span style={{ fontFamily: sans, fontSize: "10px", letterSpacing: "0.22em", textTransform: "uppercase", color: C.stone, display: "block" }}>
            {PM_TEXT_SECTIONS[0].eyebrow}
          </span>
          <h2 style={{ fontFamily: serif, fontSize: hSize, lineHeight: 1.12, color: C.dark, letterSpacing: "-0.02em", fontWeight: 400, margin: "16px 0 0 0" }}>
            {PM_TEXT_SECTIONS[0].headlineBefore} <em style={{ fontStyle: "italic", fontWeight: 400 }}>{PM_TEXT_SECTIONS[0].headlineItalic}</em>
          </h2>
          <div style={{ marginTop: "24px", display: "flex", flexDirection: "column", gap: "20px" }}>
            {PM_TEXT_SECTIONS[0].paragraphs.map((text, i) => (
              <p key={i} style={{ fontFamily: sans, fontSize: "14px", color: C.charcoal, lineHeight: 1.7, margin: 0 }}>
                {text}
              </p>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ Sektion 3 — Anlagestrategien (STRATEGIEN, Option A: Zeilen) ═══ */}
      <section style={{ ...sectionPad, borderTop: `1px solid ${C.line}` }}>
        <div style={{ maxWidth: "600px" }}>
          <span style={{ fontFamily: sans, fontSize: "10px", letterSpacing: "0.22em", textTransform: "uppercase", color: C.stone, display: "block" }}>
            Anlagestrategien
          </span>
          <h2 style={{ fontFamily: serif, fontSize: hSize, lineHeight: 1.12, color: C.dark, letterSpacing: "-0.02em", fontWeight: 400, margin: "16px 0 0 0" }}>
            Sieben Strategien, <em style={{ fontStyle: "italic", fontWeight: 400 }}>frei kombinierbar.</em>
          </h2>
          <p style={{ fontFamily: sans, fontSize: isMobile ? "13px" : "14px", color: C.stone, lineHeight: 1.5, margin: "8px 0 32px 0" }}>
            Sie legen eine oder mehrere Strategien für Ihr Portfolio fest und bestimmen die Gewichtung selbst. Die angegebene Zielallokation ist eine Richtgrösse; im Rahmen der vertraglich vereinbarten Bandbreiten darf davon abgewichen werden.
          </p>

          {/* PENDING VERIFICATION — Allokationsprozente */}
          <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
            {PM_STRATEGIES.map((s, si) => (
              <div key={si} style={{
                paddingTop: si === 0 ? 0 : "20px",
                paddingBottom: "20px",
                borderTop: si === 0 ? "none" : `1px solid ${C.line}`,
              }}>
                <div style={{ display: "flex", alignItems: "baseline", gap: "10px", flexWrap: "wrap" }}>
                  <span style={{ fontFamily: serif, fontSize: "15px", color: C.dark, lineHeight: 1.3 }}>
                    {s.name}
                  </span>
                  <span style={{ fontFamily: sans, fontSize: "11px", color: C.stone, letterSpacing: "0.08em" }}>
                    ({s.tag})
                  </span>
                </div>
                <p style={{ fontFamily: sans, fontSize: "13px", color: C.charcoal, lineHeight: 1.6, margin: "6px 0 0 0" }}>
                  {s.goal}
                </p>
                {s.volatility && (
                  <p style={{ fontFamily: sans, fontSize: "12px", color: C.stone, lineHeight: 1.5, margin: "4px 0 0 0" }}>
                    {s.volatility}
                  </p>
                )}
                {s.allocation && (
                  <p style={{ fontFamily: sans, fontSize: "12px", color: C.stone, lineHeight: 1.5, margin: "4px 0 0 0" }}>
                    {s.allocation}{s.allocationLegend ? ` (${s.allocationLegend})` : ""}
                  </p>
                )}
                {s.focus && (
                  <p style={{ fontFamily: sans, fontSize: "13px", color: C.charcoal, lineHeight: 1.6, margin: "8px 0 0 0", fontStyle: "italic" }}>
                    {s.focus}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ Sektion 4 — Anlageuniversum (UNIVERSUM) ═══ */}
      <section style={{ ...sectionPad, borderTop: `1px solid ${C.line}` }}>
        <div style={{ maxWidth: "600px" }}>
          <span style={{ fontFamily: sans, fontSize: "10px", letterSpacing: "0.22em", textTransform: "uppercase", color: C.stone, display: "block" }}>
            {PM_TEXT_SECTIONS[1].eyebrow}
          </span>
          <h2 style={{ fontFamily: serif, fontSize: hSize, lineHeight: 1.12, color: C.dark, letterSpacing: "-0.02em", fontWeight: 400, margin: "16px 0 0 0" }}>
            {PM_TEXT_SECTIONS[1].headlineBefore} <em style={{ fontStyle: "italic", fontWeight: 400 }}>{PM_TEXT_SECTIONS[1].headlineItalic}</em>
          </h2>
          <div style={{ marginTop: "24px", display: "flex", flexDirection: "column", gap: "20px" }}>
            {PM_TEXT_SECTIONS[1].paragraphs.map((text, i) => (
              <p key={i} style={{ fontFamily: sans, fontSize: "14px", color: C.charcoal, lineHeight: 1.7, margin: 0 }}>
                {text}
              </p>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ: pending — Inhalte folgen */}

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
        <span style={{ fontFamily: sans, fontSize: "10px", letterSpacing: "0.22em", textTransform: "uppercase", color: C.stone }}>
          Nächster Schritt
        </span>
        <h3 style={{
          fontFamily: serif, fontSize: isMobile ? "clamp(26px, 6vw, 32px)" : "32px",
          lineHeight: 1.12, letterSpacing: "-0.02em", fontWeight: 400, margin: 0, color: C.dark,
        }}>
          Ein Gespräch ist <em style={{ fontStyle: "italic", fontWeight: 400 }}>der Anfang.</em>
        </h3>
        <p style={{ fontFamily: sans, fontSize: "14px", color: C.charcoal, lineHeight: 1.7, maxWidth: "500px", margin: 0 }}>
          Wenn Sie unseren Prozess bis hierher verfolgt haben — sprechen wir über Ihren. Ein erstes Gespräch ist unverbindlich, persönlich und vertraulich.
        </p>
        <CtaButton href="/#contact" onClick={(e) => { e.preventDefault(); onContactClick(); }}>
          Gespräch vereinbaren
        </CtaButton>
      </div>

      {/* ═══ Footer ═══ */}
      <div style={{
        marginTop: "48px", padding: "32px 0 24px",
        display: "flex", flexDirection: "column", alignItems: "center", gap: "10px",
        borderTop: `1px solid ${C.line}`,
      }}>
        <div style={{ width: "16px", height: "1px", backgroundColor: C.line }} />
        <span style={{
          fontFamily: sans, fontSize: "8px", letterSpacing: "0.16em",
          color: C.muted, opacity: 0.6, textTransform: "uppercase", textAlign: "center",
        }}>
          Tellian Capital AG &mdash; Est. 1996 &mdash; Zürich
        </span>
      </div>
    </div>
  );
}
