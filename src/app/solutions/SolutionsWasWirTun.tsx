import { cormorant, sans, serif } from "../tokens";
import { useSectionEntered } from "../components/SectionEntry";
import { usePrefersReducedMotion } from "../components/usePrefersReducedMotion";
import { Aufgang, Kapitelmarke } from "../components/MobilSektion";
import { SOLUTIONS_INHALT, SOLUTIONS_LEISTE } from "./inhalt";

/* ═══════════════════════════════════════════════════════════
   SOLUTIONS S2 — WAS WIR TUN + VORGEHEN (dunkel, kombiniert)

   Korrektur 06.09: beide Blöcke in EINER Station. Das Raster der
   Seite bleibt G1 — links Text, rechts Darstellung: links der
   Statement-Block (Kicker Mushroom, Statement Lustria, Absatz,
   Credo in editorialer Kursive), rechts der nummerierte Weg als
   gestapelte Spalte — Lustria-Ziffern in Mushroom, Haarlinien
   zwischen den Schritten, Texte in den hellen Tönen der dunklen
   Stationen. Beide Gruppen vertikal zentriert.
   ═══════════════════════════════════════════════════════════ */

interface Props {
  panelRef?: (el: HTMLDivElement | null) => void;
  isVertical?: boolean;
  sprache: "DE" | "EN" | "FR";
}

const ARCHIVE_WHITE = "#F4F4F0";
const MUSHROOM = "#B8AEA3";
const SILBER = "rgba(249, 249, 247, 0.78)";
const HAARLINIE = "rgba(249, 249, 247, 0.16)";

/* Eintritts-Grammatik der Hauptseiten-Stationen (Station 02):
   gestaffeltes Erscheinen beim Betreten, Reduced Motion sofort.
   Links läuft der Statement-Block, rechts zieht der Weg Schritt
   für Schritt nach. */
const DAUER = 460;
const STEP = { kicker: 0, statement: 80, absatz: 220, credo: 340, weg: 160 } as const;

export function SolutionsWasWirTun({ panelRef, isVertical = false, sprache }: Props) {
  const inhalt = SOLUTIONS_INHALT[sprache].wasWirTun;
  const schritte = SOLUTIONS_INHALT[sprache].vorgehen.schritte;
  const entered = useSectionEntered();
  const reducedMotion = usePrefersReducedMotion();
  const shown = entered || reducedMotion || isVertical;
  const enter = (delay: number, distance = 18): React.CSSProperties => ({
    opacity: shown ? 1 : 0,
    transform: shown ? "translateY(0)" : `translateY(${distance}px)`,
    transition: reducedMotion
      ? "none"
      : `opacity ${DAUER}ms ease-out ${delay}ms,` +
        ` transform ${DAUER}ms cubic-bezier(0.16,1,0.3,1) ${delay}ms`,
  });

  const kicker = (
    <p
      style={{
        margin: 0,
        fontFamily: sans,
        fontSize: "12px",
        letterSpacing: "0.22em",
        textTransform: "uppercase",
        color: MUSHROOM,
      }}
    >
      {inhalt.kicker}
    </p>
  );

  const statement = (
    <h2
      style={{
        margin: "clamp(18px, 2.4vh, 28px) 0 0",
        maxWidth: "14em",
        fontFamily: serif,
        fontSize: "clamp(30px, 3vw, 48px)",
        fontWeight: 400,
        lineHeight: 1.12,
        letterSpacing: "-0.01em",
        color: ARCHIVE_WHITE,
      }}
    >
      {inhalt.statement}
    </h2>
  );

  const absatz = (
    <p
      lang={sprache === "EN" ? "en" : sprache === "FR" ? "fr" : "de"}
      style={{
        margin: "clamp(24px, 3.2vh, 40px) 0 0",
        maxWidth: "46ch",
        fontFamily: sans,
        fontSize: "16px",
        lineHeight: "var(--tellian-lauf-lh, 1.75)",
        color: SILBER,
      }}
    >
      {inhalt.absatz}
    </p>
  );

  const credo = (
    <p
      style={{
        margin: "clamp(28px, 3.8vh, 48px) 0 0",
        fontFamily: cormorant,
        fontStyle: "italic",
        fontSize: "clamp(19px, 1.8vw, 24px)",
        lineHeight: 1.4,
        color: ARCHIVE_WHITE,
      }}
    >
      {inhalt.credo}
    </p>
  );

  /* Der Weg — gestapelt, mit Haarlinien im dunklen Vokabular. */
  const weg = (mitAufgang: boolean) => (
    <ol
      style={{
        listStyle: "none",
        margin: 0,
        padding: 0,
        display: "flex",
        flexDirection: "column",
        gap: "clamp(22px, 3.2vh, 36px)",
      }}
    >
      {schritte.map((s, i) => {
        const eintrag = (
          <>
            <span
              style={{
                display: "block",
                fontFamily: serif,
                fontSize: "clamp(18px, 1.5vw, 22px)",
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
                marginTop: "10px",
                fontFamily: serif,
                fontSize: "clamp(20px, 1.7vw, 26px)",
                lineHeight: 1.15,
                color: ARCHIVE_WHITE,
              }}
            >
              {s.titel}
            </span>
            <span
              style={{
                display: "block",
                marginTop: "8px",
                maxWidth: "52ch",
                fontFamily: sans,
                fontSize: "var(--tellian-adv-step-text-size)",
                lineHeight: 1.55,
                color: SILBER,
              }}
            >
              {s.zeile}
            </span>
          </>
        );
        return (
          <li
            key={s.titel}
            style={{
              borderTop: i === 0 ? "none" : `1px solid ${HAARLINIE}`,
              paddingTop: i === 0 ? 0 : "clamp(22px, 3.2vh, 36px)",
            }}
          >
            {mitAufgang ? (
              <Aufgang stufe={i + 1}>{eintrag}</Aufgang>
            ) : (
              <div style={enter(STEP.weg + i * 140)}>{eintrag}</div>
            )}
          </li>
        );
      })}
    </ol>
  );

  if (isVertical) {
    return (
      <section
        id="solutions-was-wir-tun"
        style={{
          backgroundColor: "var(--tellian-purple)",
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
          }}
        >
          <div style={{ marginBottom: "clamp(28px, 4vh, 44px)" }}>
            <Kapitelmarke nr="02" name={SOLUTIONS_LEISTE[sprache][1]} hell />
          </div>
          <Aufgang>
            {kicker}
            {statement}
            {absatz}
            {credo}
          </Aufgang>
          <div style={{ marginTop: "clamp(40px, 6vh, 64px)" }}>{weg(true)}</div>
        </div>
      </section>
    );
  }

  return (
    <div
      ref={panelRef}
      className="flex-shrink-0 h-screen relative"
      style={{
        width: "100vw",
        backgroundColor: "var(--tellian-purple)",
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
          paddingTop: "var(--tellian-s1-stage-pad)",
          paddingBottom: "var(--tellian-s1-stage-pad)",
          paddingLeft: "calc(var(--tellian-rail-width) + var(--tellian-station-pad-x))",
          paddingRight: "var(--tellian-station-pad-x)",
          display: "grid",
          gridTemplateColumns: "5fr 6fr",
          columnGap: "clamp(48px, 6vw, 112px)",
          alignItems: "center",
          boxSizing: "border-box",
        }}
      >
        {/* ══ Links: Statement-Block, gestaffelt ══ */}
        <div style={{ minWidth: 0 }}>
          <div style={enter(STEP.kicker)}>{kicker}</div>
          <div style={enter(STEP.statement, 24)}>{statement}</div>
          <div style={enter(STEP.absatz)}>{absatz}</div>
          <div style={enter(STEP.credo)}>{credo}</div>
        </div>

        {/* ══ Rechts: der Weg — zieht Schritt für Schritt nach ══ */}
        <div style={{ minWidth: 0 }}>{weg(false)}</div>
      </div>
    </div>
  );
}
