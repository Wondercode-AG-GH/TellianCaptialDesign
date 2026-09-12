import { useEffect, useState } from "react";

import { C, sans, serif } from "../tokens";
import { usePrefersReducedMotion } from "./usePrefersReducedMotion";

/* ═══════════════════════════════════════════════════════════
   SUBPAGE «METHODE» — geteilt von Mandat und Advisory

   Layout Mock B (Briefing 08.09): auf Desktop steht der ganze
   Inhalt auf EINER Ansicht, ohne Scrollen. EINE Komponente für
   beide Pfade — Titel, Intro, Schrittliste (variabler Länge), die
   zwei Abschlussblöcke und der CTA kommen als Props.

   AUFBAU (Desktop)
   — Obere Zone, zweispaltig 44/56: links H1 (zweite Zeile kursiv)
     und der EINE CTA, rechts die Intro-Absätze; die Gruppe ist
     vertikal zentriert.
   — Methode-Zone über die volle Breite: optionaler H2, darunter
     die Schritte als gleichbreite Spalten. Nummern, Hairlines,
     Titel und Textanfänge fluchten über echtes CSS-Subgrid — jede
     Spalte erbt die vier Zeilen des Rasters, unabhängig davon, wie
     lang ihr Text ist.
   — Abschluss: Hairline über die volle Breite, darunter die zwei
     Blöcke, am Spaltenraster ausgerichtet.

   SICHERHEITSNETZ
   Unter 760px Höhe oder 1200px Breite fällt die Seite ins
   Scrollen. Die Schriftgrade bleiben dabei, wie sie sind —
   Lesbarkeit vor dem Zwang zur einen Ansicht.

   MOBIL ist ein eigener Entwurf (kein gestauchter Desktop):
   Schritte untereinander mit angehobenen Graden, Hairline
   zwischen ihnen, und ein zweiter CTA am Seitenende, weil die
   Seite dort lang wird.
   ═══════════════════════════════════════════════════════════ */

export interface Schritt {
  titel: string;
  zeile: string;
}

export interface Block {
  titel: string;
  text: string;
}

interface Props {
  titel: readonly [string, string];
  lead: readonly string[];
  /** Optionaler H2 über den Schritten (Advisory hat keinen). */
  zwischentitel?: string;
  schritte: readonly Schritt[];
  bloecke: readonly Block[];
  knopf: string;
  /** Spaltenspanne der beiden Abschlussblöcke im Schrittraster. */
  blockSpalten?: readonly [string, string];
  isMobile?: boolean;
  aktiv?: boolean;
  sprache?: "DE" | "EN" | "FR";
  onContactClick?: () => void;
}

const MUSHROOM = "#B8AEA3";
const HAIRLINE = "rgba(184, 174, 163, 0.5)";

/* Eintritt wie bisher auf den Unterseiten: gestaffelt, Reduced
   Motion zeigt sofort. */
const STUFE_MS = 90;
const DAUER_MS = 520;
const VORLAUF_MS = 160;

export function SubpageMethode({
  titel,
  lead,
  zwischentitel,
  schritte,
  bloecke,
  knopf,
  blockSpalten,
  isMobile = false,
  aktiv = true,
  sprache = "DE",
  onContactClick,
}: Props) {
  const reducedMotion = usePrefersReducedMotion();
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

  const lang = sprache === "EN" ? "en" : sprache === "FR" ? "fr" : "de";
  const n = schritte.length;
  const spalten =
    blockSpalten ??
    (n >= 5 ? (["1 / 3", "3 / -1"] as const) : (["1 / 2", "2 / -1"] as const));

  const h1 = (
    <h1
      style={{
        margin: 0,
        fontFamily: serif,
        fontSize: isMobile ? "clamp(30px, 8vw, 40px)" : "clamp(32px, 3.1vw, 48px)",
        fontWeight: 400,
        lineHeight: "var(--tellian-titel-lh)" as unknown as number,
        letterSpacing: "var(--tellian-titel-ls)",
        color: C.ink,
      }}
    >
      {titel[0]}
      <br />
      <em style={{ fontStyle: "italic", fontWeight: "inherit" }}>{titel[1]}</em>
    </h1>
  );

  const cta = (
    <button
      type="button"
      onClick={onContactClick}
      className="tellian-adv-cta tellian-cta-primaer"
      style={{
        fontFamily: sans,
        fontSize: "13px",
        letterSpacing: "var(--tellian-ls-cta-klein)",
        border: "none",
        borderRadius: 0,
        padding: "13px 26px",
        minHeight: "var(--tellian-tippziel)",
        cursor: "pointer",
        width: isMobile ? "100%" : undefined,
      }}
    >
      {knopf}
    </button>
  );

  const intro = (
    <div
      lang={lang}
      style={{ display: "flex", flexDirection: "column", gap: "1em" }}
    >
      {lead.map((absatz) => (
        <p
          key={absatz.slice(0, 24)}
          style={{
            margin: 0,
            fontFamily: sans,
            fontSize: isMobile ? "15px" : "14.5px",
            lineHeight: 1.72,
            color: C.accent,
          }}
        >
          {absatz}
        </p>
      ))}
    </div>
  );

  const h2 = zwischentitel ? (
    <h2
      style={{
        margin: 0,
        fontFamily: serif,
        fontSize: isMobile ? "clamp(20px, 5.4vw, 26px)" : "clamp(21px, 1.8vw, 28px)",
        fontWeight: 400,
        lineHeight: "var(--tellian-zwischen-lh)" as unknown as number,
        color: C.ink,
      }}
    >
      {zwischentitel}
    </h2>
  ) : null;

  /* ── SCHMAL ── */
  if (isMobile) {
    return (
      <div
        style={{
          paddingLeft: "24px",
          paddingRight: "24px",
          paddingBottom: "clamp(40px, 6vh, 64px)",
          boxSizing: "border-box",
        }}
      >
        <div style={{ paddingTop: "clamp(28px, 5vh, 44px)", ...stufe(0) }}>{h1}</div>
        <div style={{ marginTop: "clamp(22px, 3.4vh, 32px)", ...stufe(1) }}>{intro}</div>
        <div style={{ marginTop: "clamp(26px, 4vh, 36px)", ...stufe(2) }}>{cta}</div>

        {h2 && (
          <div style={{ marginTop: "clamp(44px, 7vh, 68px)", ...stufe(3) }}>{h2}</div>
        )}

        <ol
          style={{
            listStyle: "none",
            margin: h2 ? "clamp(24px, 3.6vh, 34px) 0 0" : "clamp(44px, 7vh, 68px) 0 0",
            padding: 0,
          }}
        >
          {schritte.map((s, i) => (
            <li
              key={s.titel}
              style={{
                borderTop: i === 0 ? "none" : `1px solid ${HAIRLINE}`,
                paddingTop: i === 0 ? 0 : "clamp(20px, 3vh, 28px)",
                marginTop: i === 0 ? 0 : "clamp(20px, 3vh, 28px)",
                ...stufe(4 + i),
              }}
            >
              {/* Nummer und Titel in EINER Zeile. */}
              <span style={{ display: "flex", alignItems: "baseline", gap: "12px" }}>
                <span
                  style={{
                    fontFamily: serif,
                    fontSize: "20px",
                    fontWeight: "var(--tellian-ziffer-weight)" as unknown as number,
                    lineHeight: "var(--tellian-ziffer-lh)" as unknown as number,
                    letterSpacing: "var(--tellian-ziffer-ls)",
                    color: MUSHROOM,
                  }}
                >
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span
                  style={{
                    fontFamily: serif,
                    fontSize: "19px",
                    lineHeight: "var(--tellian-zwischen-lh)" as unknown as number,
                    color: C.ink,
                  }}
                >
                  {s.titel}
                </span>
              </span>
              <span
                lang={lang}
                style={{
                  display: "block",
                  marginTop: "10px",
                  fontFamily: sans,
                  fontSize: "14.5px",
                  lineHeight: 1.6,
                  color: C.accent,
                }}
              >
                {s.zeile}
              </span>
            </li>
          ))}
        </ol>

        <span
          aria-hidden
          style={{
            display: "block",
            height: "1px",
            backgroundColor: HAIRLINE,
            margin: "clamp(34px, 5vh, 48px) 0 clamp(26px, 4vh, 36px)",
          }}
        />

        <div style={{ display: "flex", flexDirection: "column", gap: "clamp(24px, 3.6vh, 34px)" }}>
          {bloecke.map((b, i) => (
            <div key={b.titel} style={stufe(4 + n + i)}>
              <span
                style={{
                  display: "block",
                  fontFamily: sans,
                  fontSize: "14.5px",
                  fontWeight: 500,
                  letterSpacing: "0.02em",
                  color: C.ink,
                }}
              >
                {b.titel}
              </span>
              <span
                lang={lang}
                style={{
                  display: "block",
                  marginTop: "8px",
                  fontFamily: sans,
                  fontSize: "14.5px",
                  lineHeight: 1.6,
                  color: C.accent,
                }}
              >
                {b.text}
              </span>
            </div>
          ))}
        </div>

        {/* 2.5: zweiter, identischer CTA am Seitenende — die Seite
            wird mobil lang; kein Sticky-Element. */}
        <div style={{ marginTop: "clamp(34px, 5vh, 48px)" }}>{cta}</div>
      </div>
    );
  }

  /* ── BREIT: Mock B, eine Ansicht ── */
  return (
    <div className="tellian-mb-seite">
      <div className="tellian-mb-innen">
        {/* ══ Obere Zone — 44/56, vertikal zentriert ══ */}
        <section className="tellian-mb-oben">
          <div style={stufe(0)}>
            {h1}
            <div style={{ marginTop: "clamp(24px, 3vh, 36px)" }}>{cta}</div>
          </div>
          <div style={stufe(1)}>{intro}</div>
        </section>

        {/* ══ Methode-Zone ══ */}
        <section>
          {h2 && <div style={{ marginBottom: "clamp(16px, 2.2vh, 26px)", ...stufe(2) }}>{h2}</div>}
          <ol
            className="tellian-mb-schritte"
            style={{ gridTemplateColumns: `repeat(${n}, minmax(0, 1fr))` }}
          >
            {schritte.map((s, i) => (
              <li key={s.titel} className="tellian-mb-schritt" style={stufe(3 + i)}>
                <span
                  style={{
                    fontFamily: serif,
                    fontSize: "clamp(24px, 2.1vw, 30px)",
                    fontWeight: "var(--tellian-ziffer-weight)" as unknown as number,
                    lineHeight: "var(--tellian-ziffer-lh)" as unknown as number,
                    letterSpacing: "var(--tellian-ziffer-ls)",
                    color: MUSHROOM,
                  }}
                >
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span aria-hidden className="tellian-mb-linie" />
                <span
                  style={{
                    fontFamily: serif,
                    fontSize: "20px",
                    lineHeight: "var(--tellian-zwischen-lh)" as unknown as number,
                    color: C.ink,
                  }}
                >
                  {s.titel}
                </span>
                <span
                  lang={lang}
                  style={{
                    fontFamily: sans,
                    fontSize: "13px",
                    lineHeight: 1.62,
                    color: C.accent,
                  }}
                >
                  {s.zeile}
                </span>
              </li>
            ))}
          </ol>
        </section>

        {/* ══ Abschluss ══ */}
        <section>
          <span aria-hidden className="tellian-mb-trenner" />
          <div
            className="tellian-mb-bloecke"
            style={{ gridTemplateColumns: `repeat(${n}, minmax(0, 1fr))` }}
          >
            {bloecke.map((b, i) => (
              <div
                key={b.titel}
                style={{ gridColumn: spalten[i] ?? "auto", ...stufe(3 + n + i) }}
              >
                <span
                  style={{
                    display: "block",
                    fontFamily: sans,
                    fontSize: "12.5px",
                    fontWeight: 600,
                    letterSpacing: "0.02em",
                    color: C.ink,
                  }}
                >
                  {b.titel}
                </span>
                <span
                  lang={lang}
                  style={{
                    display: "block",
                    marginTop: "7px",
                    maxWidth: "62ch",
                    fontFamily: sans,
                    fontSize: "12.5px",
                    lineHeight: 1.6,
                    color: C.accent,
                  }}
                >
                  {b.text}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* Fussraum: nimmt einen Teil der Restfläche auf, damit der
            Weg nicht ganz unten klebt. Wirkt vor allem auf der
            Advisory-Seite, die mit drei Schritten mehr Rest hat
            (gemessen 190px Luft unter dem CTA gegenüber 161px bei
            Mandat). Gedeckelt, damit auf hohen Schirmen keine
            Lücke entsteht; im Scroll-Modus ohne Wirkung. */}
        <span aria-hidden className="tellian-mb-fussraum" />
      </div>

      <style>{`
        .tellian-mb-seite {
          /* 56px = Kopfleiste des Overlays. Die Seite füllt exakt
             den Rest der Ansicht — kein Scrollen. */
          height: calc(100vh - 56px);
          box-sizing: border-box;
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }
        .tellian-mb-innen {
          flex: 1;
          min-height: 0;
          display: flex;
          flex-direction: column;
          gap: clamp(20px, 3.2vh, 40px);
          padding: clamp(20px, 3vh, 38px) var(--tellian-adv-pad-x)
                   clamp(20px, 3vh, 36px);
          box-sizing: border-box;
        }
        .tellian-mb-oben {
          flex: 1;
          min-height: 0;
          display: grid;
          grid-template-columns: 44fr 56fr;
          column-gap: clamp(48px, 5.6vw, 80px);
          align-items: center;
        }
        .tellian-mb-schritte {
          list-style: none;
          margin: 0;
          padding: 0;
          display: grid;
          /* Vier gemeinsame Zeilen: Nummer, Hairline, Titel, Text. */
          grid-template-rows: auto auto auto auto;
          column-gap: clamp(20px, 2.4vw, 40px);
        }
        .tellian-mb-schritt {
          /* Echtes Subgrid: jede Spalte erbt die vier Zeilen des
             Rasters — Nummern, Linien, Titel und Textanfänge
             fluchten unabhängig von der Textlänge. */
          display: grid;
          grid-template-rows: subgrid;
          grid-row: 1 / -1;
          row-gap: 0;
        }
        .tellian-mb-linie {
          display: block;
          height: 1px;
          background-color: ${HAIRLINE};
          margin: clamp(9px, 1.4vh, 14px) 0 clamp(11px, 1.6vh, 16px);
        }
        .tellian-mb-schritt > span:nth-child(4) {
          margin-top: clamp(7px, 1vh, 11px);
        }
        .tellian-mb-fussraum {
          display: block;
          flex: 0.3 1 0;
          max-height: 52px;
        }
        .tellian-mb-trenner {
          display: block;
          height: 1px;
          background-color: ${HAIRLINE};
          margin-bottom: clamp(14px, 2vh, 22px);
        }
        .tellian-mb-bloecke {
          display: grid;
          column-gap: clamp(20px, 2.4vw, 40px);
        }
        /* Browser ohne Subgrid: dieselbe Flucht über gleiche
           Mindesthöhen je Zeile — sichtbar identisch, solange kein
           Titel umbricht. */
        @supports not (grid-template-rows: subgrid) {
          .tellian-mb-schritt { display: block; }
        }
        /* SICHERHEITSNETZ: zu flach oder zu schmal für eine Ansicht
           — die Seite scrollt, die Grade bleiben. */
        @media (max-height: 759px), (max-width: 1199px) {
          .tellian-mb-seite {
            height: auto;
            overflow: visible;
          }
          .tellian-mb-oben { align-items: start; }
          .tellian-mb-fussraum { display: none; }
        }
      `}</style>
    </div>
  );
}
