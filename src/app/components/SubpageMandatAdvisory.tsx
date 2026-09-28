import { useEffect, useState } from "react";

import { C, sans, serif } from "../tokens";
import { usePrefersReducedMotion } from "./usePrefersReducedMotion";
import { SubpageZeitstrahl, type Schritt } from "./SubpageZeitstrahl";
import { SubpageVergleich } from "./SubpageVergleich";
import type { Pfad } from "../data/mandatAdvisory";

/* ═══════════════════════════════════════════════════════════
   UNTERSEITEN MANDAT UND ADVISORY — gemeinsame Hülle

   Vier Abschnitte in fester Folge, auf beiden Seiten dieselbe
   Ordnung und dieselben Bauteile:

     1  Hero — Eyebrow, Überschrift, Einleitung, Weg ins Gespräch.
     2  Vorgehen — Zeitstrahl, fünf Schritte beim Mandat, drei
        bei Advisory.
     3  Einordnung — die gemeinsame Vergleichstabelle.

   ABLÖSUNG von SubpageMethode (08.09): dort stand alles auf EINER
   Ansicht ohne Scrollen, dafür ohne Panel, ohne Linie und mit zwei
   Fliesstextblöcken statt der Tabelle. Die Seite SCROLLT jetzt —
   der Hero ist bewusst knapp gehalten, damit Trennlinie und Titel
   des Vorgehens schon angeschnitten sichtbar sind und zum Weiter-
   lesen einladen.
   ═══════════════════════════════════════════════════════════ */

/* Seitenrand der Unterseite. Das Abschlussband zieht ihn ins
   Negative, um randlos über die volle Breite zu laufen. */
const RAND_BREIT = "clamp(40px, 5.6vw, 96px)";
const RAND_SCHMAL = "24px";

/* Trennlinie über «Vorgehen» und «Einordnung»: sie gliedert die
   Seite in ihre Abschnitte und ist bei 1440x800 der erste
   Hinweis, dass unter dem Hero noch etwas kommt. */
const TRENNER: React.CSSProperties = {
  borderTop: "1px solid rgba(184, 174, 163, 0.5)",
  marginTop: "clamp(40px, 6.5vh, 76px)",
  paddingTop: "clamp(26px, 4vh, 44px)",
};

/* Eintritt wie auf den übrigen Unterseiten: gestaffelt, mit
   Reduced Motion sofort sichtbar. */
const STUFE_MS = 90;
const DAUER_MS = 520;

interface Props {
  seite: Pfad;
  eyebrow: string;
  titel: readonly [string, string];
  lead: readonly string[];
  knopf: string;
  vorgehenEyebrow: string;
  vorgehenTitel?: string;
  schritte: readonly Schritt[];
  isMobile?: boolean;
  aktiv?: boolean;
  sprache?: "DE" | "EN";
  onContactClick?: () => void;
  /** Weg zur jeweils anderen Unterseite (Spaltenkopf der Tabelle). */
  onAndereSeite?: () => void;
}

export function SubpageMandatAdvisory({
  seite,
  eyebrow,
  titel,
  lead,
  knopf,
  vorgehenEyebrow,
  vorgehenTitel,
  schritte,
  isMobile = false,
  aktiv = true,
  sprache = "DE",
  onContactClick,
  onAndereSeite,
}: Props) {
  const reduced = usePrefersReducedMotion();
  const [eingetreten, setEingetreten] = useState(false);
  useEffect(() => {
    if (!aktiv) {
      setEingetreten(false);
      return;
    }
    const id = window.setTimeout(() => setEingetreten(true), 40);
    return () => window.clearTimeout(id);
  }, [aktiv]);

  const stufe = (i: number): React.CSSProperties =>
    reduced
      ? {}
      : {
          opacity: eingetreten ? 1 : 0,
          transform: eingetreten ? "translateY(0)" : "translateY(10px)",
          transition: `opacity ${DAUER_MS}ms ease-out ${i * STUFE_MS}ms, transform ${DAUER_MS}ms ease-out ${i * STUFE_MS}ms`,
        };

  const rand = isMobile ? RAND_SCHMAL : RAND_BREIT;

  return (
    <div
      style={
        {
          "--tellian-subpage-rand": rand,
          backgroundColor: C.bg,
          paddingLeft: rand,
          paddingRight: rand,
          paddingTop: isMobile ? "clamp(26px, 4vh, 40px)" : "clamp(30px, 4.6vh, 56px)",
          paddingBottom: "clamp(48px, 8vh, 96px)",
          boxSizing: "border-box",
        } as React.CSSProperties
      }
    >
      {/* ══ 1 · HERO ══ */}
      <section>
        <div style={stufe(0)}>
          <p
            style={{
              margin: 0,
              fontFamily: sans,
              fontSize: "11px",
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              color: C.accent,
            }}
          >
            {eyebrow}
          </p>
          <h1
            style={{
              margin: "clamp(12px, 1.8vh, 20px) 0 0",
              fontFamily: serif,
              fontSize: isMobile ? "clamp(30px, 8.4vw, 38px)" : "clamp(34px, 3.4vw, 50px)",
              fontWeight: 400,
              lineHeight: 1.16,
              color: C.ink,
            }}
          >
            {titel[0]}
            <br />
            <em style={{ fontStyle: "italic", color: C.purple }}>{titel[1]}</em>
          </h1>
          <div style={{ marginTop: "clamp(18px, 2.6vh, 28px)", maxWidth: "58ch" }}>
            {lead.map((absatz, i) => (
              <p
                key={absatz.slice(0, 24)}
                style={{
                  margin: i === 0 ? 0 : "1em 0 0",
                  fontFamily: sans,
                  fontSize: isMobile ? "15px" : "14px",
                  lineHeight: 1.65,
                  color: C.accent,
                }}
              >
                {absatz}
              </p>
            ))}
          </div>
          <button
            type="button"
            onClick={() => onContactClick?.()}
            className="tellian-cta-primaer tellian-subpage-knopf"
            style={{
              marginTop: "clamp(20px, 3vh, 32px)",
              border: "none",
              borderRadius: 0,
              padding: "14px 26px",
              minHeight: "var(--tellian-tippziel)",
              fontFamily: sans,
              fontSize: "13px",
              letterSpacing: "var(--tellian-ls-cta-klein)",
              cursor: "pointer",
            }}
          >
            {knopf}
          </button>
        </div>
      </section>

      {/* ══ 2 · VORGEHEN ══ */}
      <div style={{ ...TRENNER, ...stufe(1) }}>
        <SubpageZeitstrahl
          eyebrow={vorgehenEyebrow}
          titel={vorgehenTitel}
          schritte={schritte}
          isMobile={isMobile}
        />
      </div>

      {/* ══ 3 · EINORDNUNG ══ */}
      <div style={{ ...TRENNER, ...stufe(2) }}>
        <SubpageVergleich
          seite={seite}
          sprache={sprache}
          isMobile={isMobile}
          onAndereSeite={onAndereSeite}
        />
      </div>

      {/* KEIN Abschlussband mehr (28.09): der Weg ins Gespräch steht
          im Hero, ein zweites Mal am Seitenfuss war eine Zutat. */}

      <style>{`
        .tellian-subpage-knopf:focus-visible {
          outline: 2px solid var(--tellian-accent);
          outline-offset: 3px;
        }
      `}</style>
    </div>
  );
}
