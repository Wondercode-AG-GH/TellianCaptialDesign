import { useEffect, useState } from "react";

import { C, cormorant, sans, serif } from "../tokens";
import { SchritteRaster } from "./SchritteRaster";
import { usePrefersReducedMotion } from "./usePrefersReducedMotion";

/* ═══════════════════════════════════════════════════════════
   UNTERSEITE — MANDAT

   1:1 die Struktur der Advisory-Unterseite, mit FÜNF Schritten
   statt drei und einem Zwischentitel vor dem Weg. Beide Seiten
   erzählen einen Ablauf; dieselbe Form macht sie als Paar
   erkennbar.

   Bis zum Redesign zeigte «Mehr zum Mandat» auf die
   Anlagestrategien-Unterseite — ein seit langem gemeldeter
   Platzhalter. Diese Seite löst ihn ab.
   ═══════════════════════════════════════════════════════════ */

interface Schritt {
  titel: string;
  zeile: string;
}

interface Block {
  titel: string;
  text: string;
}

interface MandatInhalt {
  titel: readonly [string, string];
  lead: readonly string[];
  zwischentitel: string;
  schritte: readonly Schritt[];
  bloecke: readonly Block[];
  knopf: string;
}

const INHALT: Readonly<Record<"DE" | "EN" | "FR", MandatInhalt>> = {
  DE: {
    titel: ["Sie geben den Rahmen.", "Wir übernehmen die Verantwortung."],
    lead: [
      "Mit einem Vermögensverwaltungsmandat übertragen Sie Tellian Capital die Verwaltung Ihres Portfolios innerhalb der gemeinsam definierten Anlagestrategie. Sie erteilen uns eine Verwaltungsvollmacht – wir treffen die Anlageentscheide und setzen diese für Sie um.",
      "Ihre persönlichen Ziele, Ihre Risikobereitschaft und Ihre finanzielle Situation bilden dabei den verbindlichen Rahmen.",
    ],
    zwischentitel: "Mit Methode gemeinsam zum Ziel.",
    schritte: [
      { titel: "Ziele", zeile: "Wir definieren Ihre Anlageziele, Bedürfnisse und den passenden Anlagehorizont." },
      { titel: "Risikoprofil", zeile: "Wir bestimmen Ihr Risikoprofil als Grundlage für Ihre persönliche Anlagestrategie." },
      { titel: "Selektion", zeile: "Unsere Modelle und Investmentexpertise identifizieren passende Anlagen aus den globalen Märkten." },
      { titel: "Allokation", zeile: "Wir strukturieren Ihr Portfolio nach Risikoprofil und Anlageausrichtung und passen es laufend an." },
      { titel: "Verwaltung", zeile: "Wir überwachen und steuern Ihr Portfolio kontinuierlich und informieren Sie transparent über die Entwicklung." },
    ],
    bloecke: [
      {
        titel: "Für wen das Mandat gedacht ist",
        text: "Für Anleger, die ihre täglichen Anlageentscheide in erfahrene Hände geben möchten und Wert auf eine professionelle, kontinuierliche Betreuung ihres Vermögens legen.",
      },
      {
        titel: "Der Unterschied zu Advisory",
        text: "Beim Mandat erteilen Sie Tellian Capital eine Verwaltungsvollmacht. Wir treffen und setzen die Anlageentscheide innerhalb des vereinbarten Rahmens für Sie um. Bei Advisory behalten Sie die Entscheidungsgewalt über jede einzelne Transaktion.",
      },
    ],
    knopf: "Gespräch vereinbaren",
  },
  EN: {
    titel: ["You set the framework.", "We take responsibility."],
    lead: [
      "With a discretionary wealth management mandate, you entrust Tellian Capital with the management of your portfolio within the investment strategy we define together. You grant us discretionary authority to make and implement investment decisions on your behalf.",
      "Your personal objectives, risk tolerance and financial situation provide the clear framework for every decision we make.",
    ],
    zwischentitel: "A structured approach. A shared goal.",
    schritte: [
      { titel: "Objectives", zeile: "We define your investment objectives, individual needs and appropriate investment horizon." },
      { titel: "Risk Profile", zeile: "We establish your risk profile as the foundation for your individual investment strategy." },
      { titel: "Selection", zeile: "Our models and investment expertise identify suitable opportunities across global markets." },
      { titel: "Allocation", zeile: "We structure your portfolio in line with your risk profile and investment strategy and adjust it as markets evolve." },
      { titel: "Management", zeile: "We continuously monitor and manage your portfolio and keep you transparently informed of its development." },
    ],
    bloecke: [
      {
        titel: "Who is the mandate for?",
        text: "For investors who prefer to entrust day-to-day investment decisions to experienced professionals while benefiting from continuous and professional portfolio management.",
      },
      {
        titel: "The difference from Advisory",
        text: "With a discretionary mandate, you grant Tellian Capital the authority to make and implement investment decisions within the agreed framework. With Advisory, you retain the final decision on each individual transaction.",
      },
    ],
    /* TODO-EN-BUTTON: Es existiert kein englisches Pendant des
       Knopfs «Gespräch vereinbaren» — bis zur Klärung steht der
       deutsche Text. */
    knopf: "Gespräch vereinbaren",
  },
  /* TODO-FR: Übersetzung folgt — DE-Text als Platzhalter. */
  FR: {
    titel: ["Sie geben den Rahmen.", "Wir übernehmen die Verantwortung."],
    lead: [
      "Mit einem Vermögensverwaltungsmandat übertragen Sie Tellian Capital die Verwaltung Ihres Portfolios innerhalb der gemeinsam definierten Anlagestrategie. Sie erteilen uns eine Verwaltungsvollmacht – wir treffen die Anlageentscheide und setzen diese für Sie um.",
      "Ihre persönlichen Ziele, Ihre Risikobereitschaft und Ihre finanzielle Situation bilden dabei den verbindlichen Rahmen.",
    ],
    zwischentitel: "Mit Methode gemeinsam zum Ziel.",
    schritte: [
      { titel: "Ziele", zeile: "Wir definieren Ihre Anlageziele, Bedürfnisse und den passenden Anlagehorizont." },
      { titel: "Risikoprofil", zeile: "Wir bestimmen Ihr Risikoprofil als Grundlage für Ihre persönliche Anlagestrategie." },
      { titel: "Selektion", zeile: "Unsere Modelle und Investmentexpertise identifizieren passende Anlagen aus den globalen Märkten." },
      { titel: "Allokation", zeile: "Wir strukturieren Ihr Portfolio nach Risikoprofil und Anlageausrichtung und passen es laufend an." },
      { titel: "Verwaltung", zeile: "Wir überwachen und steuern Ihr Portfolio kontinuierlich und informieren Sie transparent über die Entwicklung." },
    ],
    bloecke: [
      {
        titel: "Für wen das Mandat gedacht ist",
        text: "Für Anleger, die ihre täglichen Anlageentscheide in erfahrene Hände geben möchten und Wert auf eine professionelle, kontinuierliche Betreuung ihres Vermögens legen.",
      },
      {
        titel: "Der Unterschied zu Advisory",
        text: "Beim Mandat erteilen Sie Tellian Capital eine Verwaltungsvollmacht. Wir treffen und setzen die Anlageentscheide innerhalb des vereinbarten Rahmens für Sie um. Bei Advisory behalten Sie die Entscheidungsgewalt über jede einzelne Transaktion.",
      },
    ],
    knopf: "Gespräch vereinbaren",
  },
};

const ziffer = (i: number) => String(i + 1).padStart(2, "0");

/* Dieselbe Staffelung wie auf der Advisory-Seite. */
const STUFE_MS = 260;
const DAUER_MS = 520;
const VORLAUF_MS = 200;
const SCHRITT_ABSTAND = "clamp(26px, 5vh, 48px)";

interface Props {
  isMobile?: boolean;
  /** true, sobald die Unterseite offen ist. */
  aktiv?: boolean;
  sprache?: "DE" | "EN";
  onContactClick?: () => void;
}

export function UnterseiteMandat({
  isMobile = false,
  aktiv = true,
  sprache = "DE",
  onContactClick,
}: Props) {
  const reducedMotion = usePrefersReducedMotion();
  const inhalt = INHALT[sprache];
  const SCHRITTE = inhalt.schritte;
  const LINIE_MS = (SCHRITTE.length - 1) * STUFE_MS + DAUER_MS;

  /* Nicht direkt an `aktiv` hängen: beim Neuladen auf /mandat ist es
     schon im ersten Render true, und ein CSS-Übergang braucht einen
     Ausgangszustand, der vorher im DOM stand. */
  const [gestartet, setGestartet] = useState(false);
  useEffect(() => {
    if (!aktiv) {
      setGestartet(false);
      return;
    }
    let zweiter = 0;
    const erster = requestAnimationFrame(() => {
      zweiter = requestAnimationFrame(() => setGestartet(true));
    });
    return () => {
      cancelAnimationFrame(erster);
      cancelAnimationFrame(zweiter);
    };
  }, [aktiv]);

  const gezeigt = gestartet || reducedMotion;

  const stufe = (i: number): React.CSSProperties => ({
    opacity: gezeigt ? 1 : 0,
    transform: gezeigt ? "translateY(0)" : "translateY(10px)",
    transition: reducedMotion
      ? "none"
      : `opacity ${DAUER_MS}ms ease-out ${VORLAUF_MS + i * STUFE_MS}ms,` +
        ` transform ${DAUER_MS}ms cubic-bezier(0.16,1,0.3,1) ${VORLAUF_MS + i * STUFE_MS}ms`,
  });

  const titel = (
    <h1
      style={{
        margin: 0,
        fontFamily: serif,
        fontSize: "var(--tellian-adv-title-size)",
        fontWeight: 400,
        lineHeight: "var(--tellian-adv-title-leading)" as unknown as number,
        letterSpacing: "-0.015em",
        color: C.ink,
      }}
    >
      {inhalt.titel[0]}
      <br />
      <em style={{ fontStyle: "italic", fontWeight: "inherit" }}>{inhalt.titel[1]}</em>
    </h1>
  );

  const lead = (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "1em",
        maxWidth: "var(--tellian-adv-lead-measure)",
      }}
    >
      {inhalt.lead.map((absatz) => (
        <p
          key={absatz.slice(0, 24)}
          style={{
            margin: 0,
            fontFamily: sans,
            fontSize: "var(--tellian-adv-lead-size)",
            lineHeight: "var(--tellian-adv-lead-leading)" as unknown as number,
            color: C.accent,
          }}
        >
          {absatz}
        </p>
      ))}
    </div>
  );

  const zwischentitel = (
    <h2
      style={{
        margin: 0,
        fontFamily: serif,
        fontSize: "var(--tellian-pm-wege-size)",
        fontWeight: 400,
        lineHeight: 1.2,
        color: C.ink,
      }}
    >
      {inhalt.zwischentitel}
    </h2>
  );

  const zifferStil: React.CSSProperties = {
    fontFamily: cormorant,
    fontSize: "var(--tellian-adv-num-size)",
    fontWeight: 300,
    lineHeight: 1,
    letterSpacing: "0.04em",
    color: "var(--tellian-adv-num-color)",
    /* Trägt den Hintergrund mit, damit die Linie nicht durch die
       Ziffer läuft. */
    backgroundColor: C.bg,
    position: "relative",
    display: "inline-block",
  };

  const schrittTitel = (t: string) => (
    <span
      style={{
        display: "block",
        fontFamily: serif,
        fontSize: "var(--tellian-adv-step-title-size)",
        fontWeight: 400,
        lineHeight: 1.15,
        color: C.ink,
      }}
    >
      {t}
    </span>
  );

  const schrittZeile = (z: string) => (
    <span
      style={{
        display: "block",
        fontFamily: sans,
        fontSize: "var(--tellian-adv-step-text-size)",
        lineHeight: 1.55,
        color: C.accent,
      }}
    >
      {z}
    </span>
  );

  const bloecke = (
    <div
      style={{
        display: "grid",
        /* P3: zwei gleichwertige Spalten statt gestapelt. */
        gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
        gap: "clamp(24px, 3vw, 56px)",
        fontFamily: sans,
        fontSize: "var(--tellian-adv-lead-size)",
        maxWidth: isMobile
          ? "none"
          : "calc(var(--tellian-adv-block-measure) * 2 + clamp(24px, 3vw, 56px))",
        ...stufe(SCHRITTE.length),
      }}
    >
      {inhalt.bloecke.map((b) => (
        <div key={b.titel}>
          <span
            style={{
              display: "block",
              fontFamily: sans,
              fontSize: "var(--tellian-adv-block-title-size)",
              fontWeight: 500,
              letterSpacing: "0.02em",
              color: C.ink,
            }}
          >
            {b.titel}
          </span>
          <span
            style={{
              display: "block",
              marginTop: "8px",
              fontFamily: sans,
              fontSize: "var(--tellian-adv-block-text-size)",
              lineHeight: 1.6,
              color: C.accent,
            }}
          >
            {b.text}
          </span>
        </div>
      ))}
    </div>
  );

  const knopf = (
    <div style={{ ...stufe(SCHRITTE.length + 1) }}>
      <button
        type="button"
        onClick={onContactClick}
        className="tellian-adv-cta"
        style={{
          fontFamily: sans,
          fontSize: "13px",
          letterSpacing: "0.08em",
          color: C.dark,
          backgroundColor: "var(--tellian-button)",
          border: "none",
          borderRadius: "2px",
          padding: "13px 26px",
          minHeight: "var(--tellian-tippziel)",
          cursor: "pointer",
          width: isMobile ? "100%" : undefined,
        }}
      >
        {inhalt.knopf}
      </button>
    </div>
  );

  /* ── SCHMAL ── */
  if (isMobile) {
    return (
      <div
        style={{
          paddingTop: "var(--tellian-abschnitt-luft-schmal)",
          paddingBottom: "clamp(48px, 8vh, 88px)",
          paddingLeft: "clamp(20px, 6vw, 48px)",
          paddingRight: "clamp(20px, 6vw, 48px)",
          display: "flex",
          flexDirection: "column",
          gap: "clamp(26px, 4.5vh, 44px)",
        }}
      >
        {titel}
        {lead}
        {zwischentitel}

        <ol style={{ listStyle: "none", margin: 0, padding: 0 }}>
          {SCHRITTE.map((s, i) => (
            <li
              key={s.titel}
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: "clamp(16px, 4vw, 28px)",
                marginTop: i === 0 ? 0 : SCHRITT_ABSTAND,
                position: "relative",
                ...stufe(i),
              }}
            >
              {i < SCHRITTE.length - 1 && (
                <span
                  aria-hidden
                  style={{
                    position: "absolute",
                    left: "calc(var(--tellian-adv-num-size) / 2)",
                    top: "calc(var(--tellian-adv-num-size) / 2 + 4px)",
                    bottom: `calc(-1 * (${SCHRITT_ABSTAND} + var(--tellian-adv-num-size) / 2 + 4px))`,
                    width: "1px",
                    backgroundColor: "var(--tellian-adv-line)",
                    transformOrigin: "center top",
                    transform: gezeigt ? "scaleY(1)" : "scaleY(0)",
                    transition: reducedMotion
                      ? "none"
                      : `transform ${STUFE_MS + DAUER_MS}ms cubic-bezier(0.22,0.61,0.36,1) ${VORLAUF_MS + i * STUFE_MS}ms`,
                  }}
                />
              )}
              <span
                style={{
                  ...zifferStil,
                  flex: "0 0 var(--tellian-adv-num-size)",
                  textAlign: "center",
                  paddingTop: "4px",
                  paddingBottom: "4px",
                }}
              >
                {ziffer(i)}
              </span>
              <span style={{ paddingTop: "4px" }}>
                {schrittTitel(s.titel)}
                <span style={{ display: "block", marginTop: "4px" }}>
                  {schrittZeile(s.zeile)}
                </span>
              </span>
            </li>
          ))}
        </ol>

        {bloecke}
        {knopf}
        {stil}
      </div>
    );
  }

  /* ── BREIT ──
     P4 (Review 05.09 abends): Struktur statt Falz-Zwang. Die Seite
     DARF scrollen, mit klarer Dramaturgie: Szene 1 füllt den ersten
     Viewport (Titel, Intro, CTA — ruhig zentriert, Abstände aus dem
     Spacing-System der Stationen); darunter folgen Zwischentitel,
     das Schritte-Raster, die zwei gleichwertigen Spalten und der
     abschliessende CTA im Blockrhythmus. */
  return (
    <div
      style={{
        paddingLeft: "var(--tellian-adv-pad-x)",
        paddingRight: "var(--tellian-adv-pad-x)",
        boxSizing: "border-box",
      }}
    >
      <section
        style={{
          /* 56px = Sticky-Leiste des Overlays; die Szene füllt den
             Rest des ersten Viewports und zentriert ihren Stapel. */
          minHeight: "calc(100vh - 56px)",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          gap: "var(--tellian-abstand-titel)",
          paddingTop: "clamp(24px, 4vh, 56px)",
          paddingBottom: "clamp(24px, 4vh, 56px)",
          boxSizing: "border-box",
        }}
      >
        {titel}
        {lead}
        {knopf}
      </section>

      <section
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "var(--tellian-abstand-block)",
          paddingBottom: "clamp(64px, 8vh, 96px)",
        }}
      >
      {zwischentitel}

      {/* Der nummerierte Weg — geteiltes Raster (SchritteRaster),
          zeilengenau wie zuvor inline. */}
      <SchritteRaster
        schritte={SCHRITTE}
        gezeigt={gezeigt}
        reducedMotion={reducedMotion}
        maxWidth="var(--tellian-mandat-weg-max)"
      />

      {bloecke}
      {knopf}
      </section>
      {stil}
    </div>
  );
}

const stil = (
  <style>{`
    .tellian-adv-cta {
      outline: none;
      transition: background-color 220ms ease;
    }
    .tellian-adv-cta:hover {
      background-color: var(--tellian-button-hover);
    }
    .tellian-adv-cta:focus-visible {
      outline: 2px solid var(--tellian-muted);
      outline-offset: 3px;
    }
  `}</style>
);
