import { useEffect, useState } from "react";

import { C, sans, serif } from "../tokens";
import { SchritteRaster } from "../components/SchritteRaster";
import { Aufgang, Kapitelmarke } from "../components/MobilSektion";
import { useSectionEntered } from "../components/SectionEntry";
import { usePrefersReducedMotion } from "../components/usePrefersReducedMotion";
import { SOLUTIONS_INHALT, SOLUTIONS_LEISTE } from "./inhalt";

/* ═══════════════════════════════════════════════════════════
   SOLUTIONS S3 — VORGEHEN (hell)

   Die drei Schritte im GETEILTEN Schritte-Raster der Mandat-
   Unterseite (Nummern, Titel, Texte fluchten zeilengenau).
   Solutions-Fassung: Lustria-Nummern in Mushroom, Haarlinie UNTER
   der Nummernzeile; Text in Ink-Tönen (helle Station). Das Briefing
   gibt dieser Station keinen Titel — es steht nur der Weg.
   ═══════════════════════════════════════════════════════════ */

interface Props {
  panelRef?: (el: HTMLDivElement | null) => void;
  isVertical?: boolean;
  sprache: "DE" | "EN";
}

const MUSHROOM = "#B8AEA3";

export function SolutionsVorgehen({ panelRef, isVertical = false, sprache }: Props) {
  const schritte = SOLUTIONS_INHALT[sprache].vorgehen.schritte;
  const reducedMotion = usePrefersReducedMotion();
  const entered = useSectionEntered();

  /* Eintritt wie auf den Unterseiten: erst nach dem ersten Frame,
     damit der Übergang einen Ausgangszustand im DOM hat. */
  const [gestartet, setGestartet] = useState(false);
  useEffect(() => {
    if (!entered && !isVertical) return;
    let zweiter = 0;
    const erster = requestAnimationFrame(() => {
      zweiter = requestAnimationFrame(() => setGestartet(true));
    });
    return () => {
      cancelAnimationFrame(erster);
      cancelAnimationFrame(zweiter);
    };
  }, [entered, isVertical]);

  const gezeigt = gestartet || reducedMotion;

  if (isVertical) {
    /* Schmal: derselbe Weg untereinander — die drei Spalten des
       Rasters wären auf Telefonbreite schmaler als ihre Wörter. */
    return (
      <section
        id="solutions-vorgehen"
        style={{ backgroundColor: C.bg, scrollMarginTop: "var(--tellian-kopf-height)" }}
      >
        <div
          style={{
            paddingTop: "var(--tellian-abschnitt-luft-schmal)",
            paddingBottom: "var(--tellian-abschnitt-luft-schmal)",
            paddingLeft: "clamp(20px, 6vw, 48px)",
            paddingRight: "clamp(20px, 6vw, 48px)",
          }}
        >
          <div style={{ marginBottom: "clamp(28px, 4vh, 44px)" }}>
            <Kapitelmarke nr="03" name={SOLUTIONS_LEISTE[sprache][2]} />
          </div>
          <ol
            style={{
              listStyle: "none",
              margin: 0,
              padding: 0,
              display: "flex",
              flexDirection: "column",
              gap: "clamp(28px, 4.5vh, 44px)",
            }}
          >
            {schritte.map((s, i) => (
              <li
                key={s.titel}
                style={{
                  borderTop: i === 0 ? "none" : `1px solid ${C.line}`,
                  paddingTop: i === 0 ? 0 : "clamp(28px, 4.5vh, 44px)",
                }}
              >
                <Aufgang stufe={i}>
                  <span
                    style={{
                      display: "block",
                      fontFamily: serif,
                      fontSize: "var(--tellian-adv-num-size)",
                      fontWeight: 300,
                      lineHeight: 1,
                      letterSpacing: "0.04em",
                      color: MUSHROOM,
                    }}
                  >
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span
                    style={{
                      display: "block",
                      marginTop: "12px",
                      fontFamily: serif,
                      fontSize: "var(--tellian-adv-step-title-size)",
                      color: C.ink,
                      lineHeight: 1.15,
                    }}
                  >
                    {s.titel}
                  </span>
                  <span
                    style={{
                      display: "block",
                      marginTop: "10px",
                      fontFamily: sans,
                      fontSize: "var(--tellian-adv-step-text-size)",
                      lineHeight: 1.55,
                      color: C.accent,
                    }}
                  >
                    {s.zeile}
                  </span>
                </Aufgang>
              </li>
            ))}
          </ol>
        </div>
      </section>
    );
  }

  return (
    <div
      ref={panelRef}
      className="flex-shrink-0 h-screen relative"
      style={{ width: "100vw", backgroundColor: C.bg }}
    >
      <div
        style={{
          position: "absolute",
          top: "var(--tellian-kopf-height)",
          bottom: "var(--tellian-station-height)",
          left: 0,
          right: 0,
          paddingLeft: "calc(var(--tellian-rail-width) + var(--tellian-station-pad-x))",
          paddingRight: "var(--tellian-station-pad-x)",
          display: "flex",
          alignItems: "center",
          boxSizing: "border-box",
        }}
      >
        <SchritteRaster
          schritte={schritte}
          gezeigt={gezeigt}
          reducedMotion={reducedMotion}
          maxWidth="min(100%, 1180px)"
          nummerFont={serif}
          nummerFarbe={MUSHROOM}
          liniePos="unter"
        />
      </div>
    </div>
  );
}
