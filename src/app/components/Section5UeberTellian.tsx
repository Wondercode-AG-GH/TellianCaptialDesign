import { useRef, useEffect, useState } from "react";
import { LAYOUT, getLayout, getTextColumnStyle, SPACING } from "../layout";
import { CtaButton } from "./CtaButton";
import { ScrollFade } from "./ScrollAnimations";
import { ExpandableBody } from "./ExpandableBody";
import type { Breakpoint } from "./useBreakpoint";

/* ═══════════════════════════════════════════════════════════
   SECTION 5 — ÜBER TELLIAN CAPITAL
   Desktop: Teil 1 (110vw, text + first portrait as static image)
            followed by Teil 2 (filmstrip of 7 remaining portraits,
            each 28vw wide, 24px gaps, static — revealed by natural
            horizontal page scroll).
   Tablet/Mobile: stacked text + 1- or 2-column team grid.
   ═══════════════════════════════════════════════════════════ */

import { C, serif, sans, EYEBROW } from "../tokens";

/* ── Team data ── */
interface TeamMember {
  name: string;
  role: string;
  bio: string;
  img: string;
}

const TEAM: TeamMember[] = [
  {
    name: "Dr. Thomas Keller",
    role: "Geschäftsleitung & Gründer",
    bio: "Über 30 Jahre Erfahrung in quantitativer Vermögensverwaltung.",
    img: "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=800&q=80",
  },
  {
    name: "Claudia Meier",
    role: "Chef Anlagestrategie",
    bio: "Leiterin des Anlagekomitees und verantwortlich für die Makroanalyse.",
    img: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=800&q=80",
  },
  {
    name: "Martin Huber",
    role: "Relationship Manager",
    bio: "Persönliche Mandatsführung für private Anleger seit 2008.",
    img: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=800&q=80",
  },
  {
    name: "Elena Brunner",
    role: "Compliance & Operations",
    bio: "Verantwortlich für regulatorische Anforderungen und Kundenprozesse.",
    img: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=800&q=80",
  },
  {
    name: "Lukas Widmer",
    role: "Quantitative Analyse",
    bio: "Entwicklung und Pflege der proprietären Anlagemodelle.",
    img: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=80",
  },
  {
    name: "Sarah Roth",
    role: "Relationship Managerin",
    bio: "Betreuung institutioneller Mandate und Stiftungsportfolios.",
    img: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=800&q=80",
  },
  {
    name: "Peter Frei",
    role: "Partner Asset Management",
    bio: "Internationale Anlagestrategien und alternative Anlageklassen.",
    img: "https://images.unsplash.com/photo-1556157382-97eda2d62296?auto=format&fit=crop&w=800&q=80",
  },
  {
    name: "Anna Zürcher",
    role: "Kundenberatung & Reporting",
    bio: "Konsolidierte Berichterstattung und direkter Kundenkontakt.",
    img: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&w=800&q=80",
  },
];

const BODY = [
  "Tellian Capital ist eine unabhängige Vermögensverwaltung mit Sitz in Zürich. Das Team ist bewusst klein. Jeder Kunde hat einen persönlichen Ansprechpartner, der sein Portfolio kennt und seine Anlageziele versteht. Wer bei uns anruft, erreicht die Menschen, die sein Vermögen verwalten.",
  "Die Firma wurde 1996 gegründet — als eine der ersten Schweizer Vermögensverwaltungen mit einem quantitativen Investmentansatz. Was uns seither getragen hat, ist die Verbindung aus methodischer Arbeit und persönlicher Verbindlichkeit. Anlageentscheide entstehen im Anlagekomitee, nicht aus einer einzelnen Sichtweise. Kundenbeziehungen sind auf lange Sicht angelegt, nicht auf das nächste Quartal.",
];

/* ═══════════════════════════════════════════════════════════
   Build `vorname.nachname@telliancapital.ch` from a display name.
   Strips titles (Dr., Prof.), replaces umlauts, lowercases.
   ═══════════════════════════════════════════════════════════ */
function teamEmail(name: string): string {
  const cleaned = name
    .replace(/^(Dr\.|Prof\.)\s+/i, "")
    .toLowerCase()
    .replace(/ä/g, "ae")
    .replace(/ö/g, "oe")
    .replace(/ü/g, "ue")
    .replace(/ß/g, "ss");
  const parts = cleaned.split(/\s+/);
  if (parts.length < 2) return `${parts[0]}@telliancapital.ch`;
  const first = parts[0];
  const last = parts[parts.length - 1];
  return `${first}.${last}@telliancapital.ch`;
}

/* ═══════════════════════════════════════════════════════════
   SEND MESSAGE LINK — accent-line + label, mailto: action
   ═══════════════════════════════════════════════════════════ */
function SendMessageLink({ email }: { email: string }) {
  const [hover, setHover] = useState(false);
  const color = hover ? C.dark : C.stone;
  return (
    <a
      href={`mailto:${email}`}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "8px",
        textDecoration: "none",
        cursor: "pointer",
      }}
    >
      <span
        style={{
          fontFamily: sans,
          fontSize: "13px",
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          color,
          transition: "color 200ms ease",
        }}
      >
        Nachricht senden
      </span>
      <span
        aria-hidden
        style={{
          color,
          fontSize: "13px",
          transition: "color 200ms ease",
        }}
      >
        →
      </span>
    </a>
  );
}

/* ═══════════════════════════════════════════════════════════
   PORTRAIT CARD — used in filmstrip (desktop) & grid (vertical)
   ═══════════════════════════════════════════════════════════ */
function PortraitCard({
  member,
  width,
  nameSize = "18px",
  roleSize = "14px",
  nameWeight = 600,
}: {
  member: TeamMember;
  width: string;
  nameSize?: string;
  roleSize?: string;
  nameWeight?: number;
}) {
  return (
    <div style={{ width, flexShrink: 0 }}>
      {/* Photo — 4:5 aspect, head in upper third */}
      <div
        className="w-full relative overflow-hidden"
        style={{ paddingBottom: "125%" }}
      >
        <div
          className="absolute inset-0 bg-cover bg-no-repeat"
          style={{
            backgroundImage: `url(${member.img})`,
            backgroundPosition: "center top",
            filter: "saturate(0.2) contrast(1.06) brightness(1.02)",
          }}
        />
      </div>

      {/* Caption */}
      <div style={{ marginTop: "24px" }}>
        <span
          style={{
            fontFamily: sans,
            fontSize: nameSize,
            fontWeight: nameWeight,
            color: C.dark,
            display: "block",
            lineHeight: 1.2,
          }}
        >
          {member.name}
        </span>
        <span
          style={{
            fontFamily: sans,
            fontSize: roleSize,
            fontWeight: 400,
            color: C.stone,
            display: "block",
            marginTop: "5px",
            lineHeight: 1.3,
          }}
        >
          {member.role}
        </span>

        {/* Action link */}
        <div style={{ marginTop: "18px" }}>
          <SendMessageLink email={teamEmail(member.name)} />
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   STAGGERED PORTRAIT — IntersectionObserver-driven reveal
   for use in vertical (mobile/tablet) grid.
   ═══════════════════════════════════════════════════════════ */
function StaggeredPortrait({
  member,
  aspectPct,
  nameSize,
  roleSize,
  delayMs,
}: {
  member: TeamMember;
  aspectPct: string;
  nameSize: string;
  roleSize: string;
  delayMs: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setRevealed(true);
          obs.disconnect();
        }
      },
      { threshold: 0.15 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      style={{
        opacity: revealed ? 1 : 0,
        transform: revealed ? "translateY(0)" : "translateY(20px)",
        transition: `opacity 500ms cubic-bezier(0.16, 1, 0.3, 1) ${delayMs}ms, transform 500ms cubic-bezier(0.16, 1, 0.3, 1) ${delayMs}ms`,
        willChange: "opacity, transform",
      }}
    >
      <PortraitCard
        member={member}
        width="100%"
        nameSize={nameSize}
        roleSize={roleSize}
        aspectPct={aspectPct}
        nameWeight={500}
      />
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   MAIN EXPORT
   ═══════════════════════════════════════════════════════════ */
export function Section5UeberTellian({
  scrollX,
  isVertical = false,
  breakpoint = "desktop",
  onContactClick,
}: {
  scrollX?: number;
  isVertical?: boolean;
  onContactClick?: () => void;
  breakpoint?: Breakpoint;
}) {
  // scrollX is kept as optional prop for API compatibility but unused
  void scrollX;

  const layout = getLayout(breakpoint);
  const textColStyle = getTextColumnStyle(breakpoint);

  /* ═══ VERTICAL MODE ═══ */
  if (isVertical) {
    return (
      <section
        id="section-ueber-uns"
        style={{ backgroundColor: C.bg }}
      >
        <div style={{ ...textColStyle }}>
          <ScrollFade scrollX={0} isVertical yOffset={16}>
            <span
              style={{
                fontFamily: sans,
                fontSize: EYEBROW.mobile,
                letterSpacing: "0.22em",
                color: C.stone,
                display: "block",
                textTransform: "uppercase",
              }}
            >
              Über Tellian Capital
            </span>

            <div
              style={{
                width: "32px",
                height: "1.5px",
                backgroundColor: C.dark,
                marginTop: SPACING.eyebrowToAccent,
              }}
            />
          </ScrollFade>

          <ScrollFade scrollX={0} isVertical yOffset={24}>
            <h2
              style={{
                fontFamily: serif,
                fontSize: breakpoint === "mobile" ? "clamp(36px, 10vw, 48px)" : "clamp(48px, 6vw, 68px)",
                lineHeight: 0.94,
                color: C.dark,
                letterSpacing: "-0.03em",
                marginTop: SPACING.accentToHeadline,
              }}
            >
              Wer hinter den
              <br />
              <em>Entscheiden steht</em>
            </h2>
          </ScrollFade>

          <ScrollFade scrollX={0} isVertical yOffset={20}>
            <div style={{ marginTop: SPACING.headlineToBody }}>
              <ExpandableBody
                paragraphs={[...BODY]}
                visibleCount={1}
                fontSize={breakpoint === "mobile" ? "14px" : "13px"}
                lineHeight={1.7}
                gap="14px"
                maxWidth={layout.bodyMaxWidth}
              />
            </div>
          </ScrollFade>

          <ScrollFade scrollX={0} isVertical yOffset={16}>
            <div style={{ marginTop: SPACING.bodyToCta }}>
              <CtaButton href="#contact" onClick={(e) => { e.preventDefault(); onContactClick?.(); }}>
                Gespräch vereinbaren
              </CtaButton>
            </div>
          </ScrollFade>
        </div>

        {/* Team grid — responsive, each card fades in individually */}
        {(() => {
          // Mobile: 2 cols, Tablet: 3 cols
          const cols = breakpoint === "mobile" ? 2 : 3;
          const aspectPct = "125%"; // 4:5 ratio (height/width)
          return (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: `repeat(${cols}, 1fr)`,
                gap: breakpoint === "mobile" ? "16px" : "20px",
                padding: breakpoint === "mobile"
                  ? "32px 20px 48px"
                  : "32px clamp(32px, 6vw, 80px) 48px",
              }}
            >
              {TEAM.map((member, i) => (
                <StaggeredPortrait
                  key={member.name}
                  member={member}
                  aspectPct={aspectPct}
                  nameSize={breakpoint === "mobile" ? "13px" : "14px"}
                  roleSize={breakpoint === "mobile" ? "11px" : "12px"}
                  delayMs={(i % cols) * 100}
                />
              ))}
            </div>
          );
        })()}
      </section>
    );
  }

  /* ═══ DESKTOP MODE ═══
     Single container: text column (absolute, 56vw) + filmstrip of all 8
     portraits (flex row, 28vw each, 24px gaps). Text sits on top of the
     first ~56vw of the filmstrip via matching bg color.
     Layout width: paddingLeft(60vw) + 8×28vw + 7×24px ≈ 284vw + 168px.
  ══════════════════════════════════════════════════════════ */
  return (
    <div
      className="flex-shrink-0 h-screen relative flex items-center"
      style={{
        paddingLeft: "calc(56vw + 4vw)",
        gap: "24px",
        backgroundColor: C.bg,
      }}
    >
      {/* Text column — absolute, covers leftmost 56vw, vertically centered */}
      <div
        className="absolute z-10 top-0 left-0 h-full flex flex-col justify-center"
        style={{
          width:         LAYOUT.columnWidth,
          paddingLeft:   LAYOUT.paddingLeft,
          paddingRight:  LAYOUT.paddingRight,
          backgroundColor: C.bg,
        }}
      >
        <span
          style={{
            fontFamily: sans,
            fontSize: EYEBROW.desktop,
            letterSpacing: "0.22em",
            color: C.stone,
            display: "block",
          }}
          className="uppercase"
        >
          Über Tellian Capital
        </span>

        <div
          style={{
            width: "28px",
            height: "1.5px",
            backgroundColor: C.dark,
            marginTop: SPACING.eyebrowToAccent,
          }}
        />

        <h2
          style={{
            fontFamily: serif,
            fontSize: "clamp(48px, 7vh, 80px)",
            lineHeight: 0.94,
            color: C.dark,
            letterSpacing: "-0.03em",
            marginTop: SPACING.accentToHeadline,
          }}
        >
          Wer hinter den
          <br />
          <em>Entscheiden steht</em>
        </h2>

        <div
          style={{
            marginTop: SPACING.headlineToBody,
            maxWidth: LAYOUT.bodyMaxWidth,
            display: "flex",
            flexDirection: "column",
            gap: SPACING.bodyParagraphGap,
          }}
        >
          {BODY.map((text, i) => (
            <p
              key={i}
              style={{
                fontFamily: sans,
                fontSize: "clamp(10.5px, 1.3vh, 12px)",
                color: C.charcoal,
                lineHeight: 1.75,
                margin: 0,
              }}
            >
              {text}
            </p>
          ))}

          {/* CTA — inline with body text, left-aligned */}
          <a
            href="#contact"
            onClick={(e) => { e.preventDefault(); onContactClick?.(); }}
            className="inline-flex items-center gap-3 uppercase"
            style={{
              marginTop: "56px",
              padding: "16px 24px",
              border: `1px solid ${C.button}`,
              borderRadius: 0,
              backgroundColor: C.button,
              fontFamily: sans,
              fontSize: "11px",
              fontWeight: 500,
              letterSpacing: "0.18em",
              color: C.dark,
              textDecoration: "none",
              lineHeight: 1,
              alignSelf: "flex-start",
              transition: "background-color 250ms ease-out",
            }}
          >
            <span>Gespräch vereinbaren</span>
            <span aria-hidden>→</span>
          </a>
        </div>
      </div>

      {/* Filmstrip — all 8 portraits, equal spacing */}
      {TEAM.map((member) => (
        <PortraitCard
          key={member.name}
          member={member}
          width="28vw"
        />
      ))}
    </div>
  );
}
