import { C, cormorant, sans, serif } from "../tokens";
import { useSectionEntered } from "./SectionEntry";
import { usePrefersReducedMotion } from "./usePrefersReducedMotion";

/* ═══════════════════════════════════════════════════════════
   STATION 04 — IHRE VORTEILE (dunkel)

   Redesign: vier Punkte statt acht, ALLE ohne Interaktion sichtbar.
   Das frühere Rad zeigte immer nur einen Text — beim Zeigen, für
   die Zielgruppe 65+ das falsche Muster (G5). Die vier Punkte
   stehen als 2×2-Raster in der rechten Zone; links Titel und
   Untertitel (G1).

   ZEILENGENAU (G4): Nummer, Titel und Text sind je Punkt DREI
   direkte Rasterkinder — nicht drei Kinder in einer Zelle. Das
   Raster führt sechs Zeilen (2 Punktreihen × 3), damit fluchten
   Nummern, Titel und Textanfänge beider Spalten exakt, und die
   Spaltenkanten stehen über beide Reihen durch.
   ═══════════════════════════════════════════════════════════ */

interface Punkt {
  titel: string;
  text: string;
}

interface StationInhalt {
  titel: readonly [string, string];
  untertitel: string;
  punkte: readonly Punkt[];
}

const INHALT: Readonly<Record<"DE" | "EN" | "FR", StationInhalt>> = {
  DE: {
    /* «Tellian Ihre Vorteile» — der Umbruch nach «Tellian» ist
       Satz, nicht Text. */
    titel: ["Tellian", "Ihre Vorteile"],
    untertitel: "Was Sie von uns erwarten dürfen.",
    punkte: [
      {
        titel: "Expertise",
        text: "Unsere Erfahrung und ein klarer Investmentprozess helfen uns, komplexe Märkte einzuordnen und Ihr Vermögen gezielt über Anlageklassen und Kapitalmärkte hinweg auszurichten. Diese Expertise bringen wir seit vielen Jahren auch als Jurymitglied der Swiss ETF Awards ein.",
      },
      {
        titel: "Unabhängigkeit",
        text: "Wir sind weder an eigene Produkte noch an eine bestimmte Depotbank gebunden. So wählen wir Anlagen und Lösungen frei, objektiv und ausschliesslich in Ihrem Interesse.",
      },
      {
        titel: "Transparenz",
        text: "Sie behalten jederzeit den Überblick über Ihr Vermögen. Klare Portfoliostrukturen und transparent ausgewiesene Gebühren sorgen für Nachvollziehbarkeit. Eine eigens entwickelte App steht Ihnen für den laufenden Überblick über Ihre Anlagen zur Verfügung. Zum Jahresende erhalten Sie zusätzlich einen auf Ihr Steuerdomizil abgestimmten Steuerauszug.",
      },
      {
        titel: "Flexibilität",
        text: "Ihre Bedürfnisse geben die Richtung vor. Individuelle Lösungen, liquide Anlagen und jederzeitige Bezugsmöglichkeiten geben Ihnen die nötige Flexibilität. Ohne Kündigungsfristen bewahren Sie jederzeit Ihre Freiheit.",
      },
    ],
  },
  EN: {
    titel: ["Tellian.", "Your Advantages."],
    untertitel: "What you can expect from us.",
    punkte: [
      {
        titel: "Expertise",
        text: "Our experience and disciplined investment process help us navigate complex markets and position your wealth across asset classes and global markets. For many years, we have also contributed this expertise as a member of the Swiss ETF Awards jury.",
      },
      {
        titel: "Independence",
        text: "We are not tied to proprietary products or any particular custodian bank. This gives us the freedom to select investments and solutions objectively, with your interests at the centre of every decision.",
      },
      {
        titel: "Transparency",
        text: "You retain a clear view of your portfolio, its performance and all associated fees. Our proprietary app provides secure access to your portfolio information whenever required. At year-end, you receive tax documentation tailored to your individual tax domicile.",
      },
      {
        titel: "Flexibility",
        text: "Your needs set the direction. Tailored solutions, liquid investments and ready access to your assets provide the flexibility you require. With no notice periods, you retain the freedom to act at any time.",
      },
    ],
  },
  /* TODO-FR: Übersetzung folgt — DE-Text als Platzhalter. */
  FR: {
    titel: ["Tellian", "Ihre Vorteile"],
    untertitel: "Was Sie von uns erwarten dürfen.",
    punkte: [
      {
        titel: "Expertise",
        text: "Unsere Erfahrung und ein klarer Investmentprozess helfen uns, komplexe Märkte einzuordnen und Ihr Vermögen gezielt über Anlageklassen und Kapitalmärkte hinweg auszurichten. Diese Expertise bringen wir seit vielen Jahren auch als Jurymitglied der Swiss ETF Awards ein.",
      },
      {
        titel: "Unabhängigkeit",
        text: "Wir sind weder an eigene Produkte noch an eine bestimmte Depotbank gebunden. So wählen wir Anlagen und Lösungen frei, objektiv und ausschliesslich in Ihrem Interesse.",
      },
      {
        titel: "Transparenz",
        text: "Sie behalten jederzeit den Überblick über Ihr Vermögen. Klare Portfoliostrukturen und transparent ausgewiesene Gebühren sorgen für Nachvollziehbarkeit. Eine eigens entwickelte App steht Ihnen für den laufenden Überblick über Ihre Anlagen zur Verfügung. Zum Jahresende erhalten Sie zusätzlich einen auf Ihr Steuerdomizil abgestimmten Steuerauszug.",
      },
      {
        titel: "Flexibilität",
        text: "Ihre Bedürfnisse geben die Richtung vor. Individuelle Lösungen, liquide Anlagen und jederzeitige Bezugsmöglichkeiten geben Ihnen die nötige Flexibilität. Ohne Kündigungsfristen bewahren Sie jederzeit Ihre Freiheit.",
      },
    ],
  },
};

const ziffer = (i: number) => String(i + 1).padStart(2, "0");

const STEP = { title: 0, punkte: 200 } as const;
const DURATION = 460;

interface Props {
  panelRef?: (el: HTMLDivElement | null) => void;
  isVertical?: boolean;
  domId?: string;
  sprache?: "DE" | "EN";
}

export function Station4Rad({
  panelRef,
  isVertical = false,
  domId,
  sprache = "DE",
}: Props) {
  const entered = useSectionEntered();
  const reducedMotion = usePrefersReducedMotion();
  const shown = entered || reducedMotion || isVertical;
  const inhalt = INHALT[sprache];

  const enter = (delay: number, distance = 18) => ({
    opacity: shown ? 1 : 0,
    transform: shown ? "translateY(0)" : `translateY(${distance}px)`,
    transition: reducedMotion
      ? "none"
      : `opacity ${DURATION}ms ease-out ${delay}ms,` +
        ` transform ${DURATION}ms cubic-bezier(0.16,1,0.3,1) ${delay}ms`,
  });

  const titel = (
    <h2
      style={{
        margin: 0,
        fontFamily: serif,
        fontSize: "var(--tellian-r4-titel-size)",
        fontWeight: 400,
        lineHeight: 1.12,
        color: "var(--tellian-r4-ink)",
      }}
    >
      {inhalt.titel[0]}
      <br />
      <em style={{ fontStyle: "italic", fontWeight: "inherit" }}>
        {inhalt.titel[1]}
      </em>
    </h2>
  );

  /* Untertitel — Zwischentitel-Stufe, auf dunkler Station in
     Mushroom (G2). */
  const untertitel = (
    <p
      style={{
        margin: 0,
        fontFamily: serif,
        fontSize: "var(--tellian-r4-unter-size)",
        lineHeight: 1.3,
        color: C.muted,
      }}
    >
      {inhalt.untertitel}
    </p>
  );

  const nummerStil: React.CSSProperties = {
    fontFamily: cormorant,
    fontSize: "var(--tellian-r4-num-size)",
    fontWeight: 300,
    lineHeight: 1,
    letterSpacing: "0.04em",
    color: C.muted,
  };
  const punktTitelStil: React.CSSProperties = {
    fontFamily: serif,
    fontSize: "var(--tellian-r4-punkt-titel-size)",
    fontWeight: 400,
    lineHeight: 1.15,
    color: "var(--tellian-r4-ink)",
  };
  const punktTextStil: React.CSSProperties = {
    fontFamily: sans,
    fontSize: "var(--tellian-r4-punkt-text-size)",
    lineHeight: 1.6,
    color: "var(--tellian-r4-silver)",
  };

  /* ── SCHMAL: vier Punkte untereinander ── */
  if (isVertical) {
    return (
      <section
        id={domId}
        style={{
          backgroundColor: "var(--tellian-r4-bg)",
          backgroundImage: "var(--tellian-flaeche-dunkel-schmal)",
          scrollMarginTop: "var(--tellian-kopf-height)",
        }}
      >
        <div
          style={{
            paddingTop: "var(--tellian-abschnitt-luft-schmal)",
            paddingBottom: "var(--tellian-abschnitt-luft-schmal)",
            paddingLeft: "clamp(20px, 6vw, 48px)",
            paddingRight: "clamp(20px, 6vw, 48px)",
            display: "flex",
            flexDirection: "column",
            gap: "clamp(10px, 1.6vh, 16px)",
          }}
        >
          {titel}
          {untertitel}
          <ol style={{ listStyle: "none", margin: "clamp(14px, 2.4vh, 24px) 0 0", padding: 0 }}>
            {inhalt.punkte.map((p, i) => (
              <li key={p.titel} style={{ marginTop: i === 0 ? 0 : "clamp(24px, 4vh, 40px)" }}>
                <span style={{ display: "block", ...nummerStil }}>{ziffer(i)}</span>
                <span style={{ display: "block", marginTop: "8px", ...punktTitelStil }}>
                  {p.titel}
                </span>
                <span style={{ display: "block", marginTop: "8px", ...punktTextStil }}>
                  {p.text}
                </span>
              </li>
            ))}
          </ol>
        </div>
      </section>
    );
  }

  /* ── BREIT — links Titelzone, rechts 2×2-Punkteraster (G1).

       Die zwölf Bausteine (4 × Nummer/Titel/Text) sind DIREKTE
       Kinder EINES Rasters mit sechs Zeilen. Zeile 1–3 trägt Punkt
       01 und 02, Zeile 4–6 Punkt 03 und 04 — Nummern, Titel und
       Textanfänge fluchten dadurch zeilengenau (G4), ohne Subgrid
       und ohne Messcode. */
  const punktZelle = (i: number) => {
    const reihe = Math.floor(i / 2) * 3;
    const spalte = (i % 2) + 1;
    const p = inhalt.punkte[i];
    return (
      <li key={p.titel} style={{ display: "contents" }}>
        <span
          style={{
            gridColumn: spalte,
            gridRow: reihe + 1,
            paddingBottom: "10px",
            ...(reihe > 0 ? { paddingTop: "clamp(18px, 3.2vh, 44px)" } : null),
            ...nummerStil,
          }}
        >
          {ziffer(i)}
        </span>
        <span
          style={{ gridColumn: spalte, gridRow: reihe + 2, paddingBottom: "10px", ...punktTitelStil }}
        >
          {p.titel}
        </span>
        <span style={{ gridColumn: spalte, gridRow: reihe + 3, ...punktTextStil }}>
          {p.text}
        </span>
      </li>
    );
  };

  return (
    <div
      ref={panelRef}
      className="flex-shrink-0 h-screen relative"
      style={{
        width: "var(--tellian-r4-section-width)",
        backgroundColor: "var(--tellian-r4-bg)",
        backgroundImage: "var(--tellian-flaeche-dunkel)",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: "var(--tellian-kopf-height)",
          bottom: "var(--tellian-station-height)",
          left: 0,
          right: 0,
          display: "grid",
          /* 4/8 statt 5/7: die Titelzone links ist kurz, die vier
             Texte rechts brauchen die Breite — sonst lief der lange
             Transparenz-Absatz auf flachen Fenstern (gemessen +87px
             bei 1366×768) unten in die Stationsleiste. */
          gridTemplateColumns: "4fr 8fr",
          alignItems: "center",
          columnGap: "clamp(44px, 5.6vw, 88px)",
          paddingLeft:
            "calc(var(--tellian-rail-width) + clamp(28px, 3.4vw, 56px))",
          paddingRight: "clamp(28px, 3.4vw, 56px)",
          paddingTop: "var(--tellian-s1-stage-pad)",
          paddingBottom: "var(--tellian-s1-stage-pad)",
          boxSizing: "border-box",
        }}
      >
        {/* ══ Titelzone links ══ */}
        <div
          style={{
            minWidth: 0,
            display: "flex",
            flexDirection: "column",
            gap: "clamp(12px, 2vh, 20px)",
          }}
        >
          <div style={enter(STEP.title, 24)}>{titel}</div>
          <div style={enter(STEP.title + 120)}>{untertitel}</div>
        </div>

        {/* ══ Vier Punkte rechts ══ */}
        <ol
          style={{
            listStyle: "none",
            margin: 0,
            padding: 0,
            minWidth: 0,
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gridTemplateRows: "auto auto auto auto auto auto",
            columnGap: "clamp(32px, 3.6vw, 64px)",
            ...enter(STEP.punkte),
          }}
        >
          {inhalt.punkte.map((_, i) => punktZelle(i))}
        </ol>
      </div>
    </div>
  );
}
