import { useEffect, useState } from "react";

import { C, cormorant, sans } from "../tokens";
import { usePrefersReducedMotion } from "./usePrefersReducedMotion";

/* ═══════════════════════════════════════════════════════════
   UNTERSEITE — ADVISORY

   Die Gegenseite zum Mandat. Was die Karte in Station 3 in drei
   Zeilen sagt, steht hier ausführlich.

   WARUM DER TITEL DIE AUSSAGE TRÄGT
   "Sie entscheiden." und "Wir liefern die Grundlage." sind zwei
   Sätze, nicht ein umbrochener. Sie stehen deshalb auf zwei Zeilen,
   die zweite kursiv — dieselbe Form wie die Titel der Stationen.

   WARUM DIE DREI SCHRITTE WIE AUF DER ANLAGEPROZESS-SEITE STEHEN
   Beide Unterseiten erzählen einen Ablauf. Dieselbe Form — Ziffer
   auf einer Linie, darunter Titel und eine Zeile — macht sie als
   Paar erkennbar, statt zwei Gestaltungen für dieselbe Sache zu
   führen.

   WARUM DER UNTERSCHIED ZUM MANDAT EIGENS DASTEHT
   Advisory ist nur im Gegensatz zu verstehen. Der letzte Block
   nennt ihn ausdrücklich, statt ihn den Lesenden zu überlassen.
   ═══════════════════════════════════════════════════════════ */

const TITEL = ["Sie entscheiden.", "Wir liefern die Grundlage."] as const;

const LEAD =
  "Advisory ist die Alternative zum Mandat. Sie erteilen keine " +
  "Verwaltungsvollmacht — die finale Entscheidung über jede Anlage liegt " +
  "bei Ihnen. Tellian Capital arbeitet als unabhängiger Partner: Wir " +
  "analysieren, wir empfehlen, wir helfen beim Feinschliff Ihres " +
  "Portfolios. Ausgeführt wird nichts ohne Ihre Zustimmung.";

interface Schritt {
  titel: string;
  zeile: string;
}

const SCHRITTE: readonly Schritt[] = [
  {
    titel: "Analyse",
    zeile: "Dieselbe quantitative Grundlage wie im Mandat. Daten und Modelle, laufend geprüft.",
  },
  {
    titel: "Empfehlung",
    zeile: "Konkrete Vorschläge für Ihr Portfolio, jeder mit Begründung.",
  },
  {
    titel: "Ihre Entscheidung",
    zeile: "Sie geben frei, was umgesetzt wird. Und was nicht.",
  },
];

const BLOECKE = [
  {
    titel: "Für wen Advisory gedacht ist",
    text:
      "Für Anleger, die aktiv bleiben und die Verantwortung für ihre " +
      "Anlageentscheide behalten möchten.",
  },
  {
    titel: "Der Unterschied zum Mandat",
    text:
      "Beim Mandat erteilen Sie eine Verwaltungsvollmacht, und der " +
      "Anlageausschuss entscheidet. Bei Advisory gibt es keine Vollmacht — " +
      "Sie entscheiden.",
  },
] as const;

const ziffer = (i: number) => String(i + 1).padStart(2, "0");

/* ── Eintritt ──
   Dieselbe Staffelung wie auf der Anlageprozess-Seite: die Schritte
   kommen nacheinander, die Linie zeichnet sich mit. */
const STUFE_MS = 260;
const DAUER_MS = 520;
const VORLAUF_MS = 200;
const LINIE_MS = (SCHRITTE.length - 1) * STUFE_MS + DAUER_MS;
const SCHRITT_ABSTAND = "clamp(26px, 5vh, 48px)";

interface Props {
  isMobile?: boolean;
  /** true, sobald die Unterseite offen ist. */
  aktiv?: boolean;
  onContactClick?: () => void;
}

export function UnterseiteAdvisory({
  isMobile = false,
  aktiv = true,
  onContactClick,
}: Props) {
  const reducedMotion = usePrefersReducedMotion();

  /* Nicht direkt an `aktiv` hängen: beim Neuladen auf /advisory ist
     es schon im ersten Render true, und ein CSS-Übergang braucht
     einen Ausgangszustand, der vorher im DOM stand. */
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
        fontFamily: cormorant,
        fontSize: "var(--tellian-adv-title-size)",
        fontWeight: 300,
        lineHeight: "var(--tellian-adv-title-leading)" as unknown as number,
        letterSpacing: "-0.015em",
        color: C.ink,
      }}
    >
      {TITEL[0]}
      <br />
      <em style={{ fontStyle: "italic", fontWeight: "inherit" }}>{TITEL[1]}</em>
    </h1>
  );

  const lead = (
    <p
      style={{
        margin: 0,
        fontFamily: sans,
        fontSize: "var(--tellian-adv-lead-size)",
        lineHeight: "var(--tellian-adv-lead-leading)" as unknown as number,
        color: C.accent,
        maxWidth: "var(--tellian-adv-lead-measure)",
      }}
    >
      {LEAD}
    </p>
  );

  const zifferStil: React.CSSProperties = {
    fontFamily: cormorant,
    fontSize: "var(--tellian-adv-num-size)",
    fontWeight: 300,
    lineHeight: 1,
    letterSpacing: "0.04em",
    color: "var(--tellian-adv-num-color)",
    /* Trägt den Hintergrund mit, damit die Linie nicht durch die
       Ziffer läuft — sie soll frei darauf stehen. */
    backgroundColor: C.bg,
    position: "relative",
    display: "inline-block",
  };

  const schrittTitel = (t: string) => (
    <span
      style={{
        display: "block",
        fontFamily: cormorant,
        fontSize: "var(--tellian-adv-step-title-size)",
        fontWeight: 300,
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
        gridTemplateColumns: isMobile
          ? "1fr"
          : "repeat(auto-fit, minmax(min(var(--tellian-adv-block-measure), 100%), 1fr))",
        gap: "clamp(24px, 3vw, 56px)",
        fontFamily: sans,
        fontSize: "var(--tellian-adv-lead-size)",
        maxWidth: isMobile
          ? "none"
          : "calc(var(--tellian-adv-block-measure) * 2 + clamp(24px, 3vw, 56px))",
        ...stufe(SCHRITTE.length),
      }}
    >
      {BLOECKE.map((b) => (
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
          /* Mushroom gefüllt mit dunkler Schrift — dasselbe
             Klicksignal wie in Station 1 und 3. */
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
        Gespräch vereinbaren
      </button>
    </div>
  );

  /* ── SCHMAL ──
     Der Weg steht senkrecht: die Linie links, die Ziffern darauf. */
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
              {/* Verbindung zur nächsten Ziffer — als Segment je
                  Schritt, damit sie unter der letzten nicht ins Leere
                  läuft und mit dem Schritt mitwächst. */}
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

  /* ── BREIT ── */
  return (
    <div
      style={{
        flex: 1,
        minHeight: 0,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        paddingLeft: "var(--tellian-adv-pad-x)",
        paddingRight: "var(--tellian-adv-pad-x)",
        paddingTop: "clamp(24px, 4vh, 56px)",
        paddingBottom: "clamp(24px, 4vh, 56px)",
        boxSizing: "border-box",
        gap: "clamp(24px, 4vh, 52px)",
      }}
    >
      {titel}
      {lead}

      <ol
        style={{
          listStyle: "none",
          margin: 0,
          padding: 0,
          display: "grid",
          gridTemplateColumns: `repeat(${SCHRITTE.length}, minmax(0, 1fr))`,
          columnGap: "var(--tellian-adv-col-gap)",
          position: "relative",
          maxWidth: "var(--tellian-adv-weg-max)",
        }}
      >
        {/* Die durchgehende Haarlinie auf halber Zifferhöhe. Sie
            beginnt in der MITTE der ersten und endet in der Mitte der
            letzten Spalte — über die volle Rasterbreite ragte sie
            links vor 01 und rechts nach 03 ins Leere. Bei drei
            gleichen Spalten ist eine halbe Spaltenbreite
            (100 % − 2 Zwischenräume) / 6. */}
        <span
          aria-hidden
          style={{
            position: "absolute",
            left: "calc((100% - 2 * var(--tellian-adv-col-gap)) / 6)",
            right: "calc((100% - 2 * var(--tellian-adv-col-gap)) / 6)",
            top: "calc(var(--tellian-adv-num-size) / 2)",
            height: "1px",
            backgroundColor: "var(--tellian-adv-line)",
            transformOrigin: "left center",
            transform: gezeigt ? "scaleX(1)" : "scaleX(0)",
            transition: reducedMotion
              ? "none"
              : `transform ${LINIE_MS}ms cubic-bezier(0.22,0.61,0.36,1) ${VORLAUF_MS}ms`,
          }}
        />

        {SCHRITTE.map((s, i) => (
          <li key={s.titel} style={{ position: "relative", ...stufe(i) }}>
            <span
              style={{
                ...zifferStil,
                paddingRight: "var(--tellian-adv-num-gap)",
              }}
            >
              {ziffer(i)}
            </span>
            <span style={{ display: "block", marginTop: "clamp(14px, 2.2vh, 26px)" }}>
              {schrittTitel(s.titel)}
            </span>
            <span style={{ display: "block", marginTop: "clamp(8px, 1.2vh, 14px)" }}>
              {schrittZeile(s.zeile)}
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
