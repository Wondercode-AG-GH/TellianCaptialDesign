import { cormorant, sans, serif } from "../tokens";
import { Aufgang, Kapitelmarke } from "../components/MobilSektion";
import { SOLUTIONS_INHALT, SOLUTIONS_LEISTE } from "./inhalt";

/* ═══════════════════════════════════════════════════════════
   SOLUTIONS S2 — WAS WIR TUN (dunkel)

   Typografischer Statement-Block: Kicker in Mushroom, Statement in
   Lustria, Absatz, Credo in editorialer Kursive (Archive White).
   Links ausgerichtet in der Textzone, als Gruppe vertikal zentriert
   (G1); Fläche und Verlauf wie die dunklen Stationen der Hauptseite.
   ═══════════════════════════════════════════════════════════ */

interface Props {
  panelRef?: (el: HTMLDivElement | null) => void;
  isVertical?: boolean;
  sprache: "DE" | "EN";
}

const ARCHIVE_WHITE = "#F4F4F0";
const MUSHROOM = "#B8AEA3";

export function SolutionsWasWirTun({ panelRef, isVertical = false, sprache }: Props) {
  const inhalt = SOLUTIONS_INHALT[sprache].wasWirTun;

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
        maxWidth: "18em",
        fontFamily: serif,
        fontSize: "clamp(32px, 3.6vw, 56px)",
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
      lang={sprache === "EN" ? "en" : "de"}
      style={{
        margin: "clamp(24px, 3.2vh, 40px) 0 0",
        maxWidth: "52ch",
        fontFamily: sans,
        fontSize: "16px",
        lineHeight: "var(--tellian-lauf-lh, 1.75)",
        color: "rgba(249, 249, 247, 0.78)",
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
        fontSize: "clamp(19px, 1.8vw, 26px)",
        lineHeight: 1.4,
        color: ARCHIVE_WHITE,
      }}
    >
      {inhalt.credo}
    </p>
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
          display: "flex",
          alignItems: "center",
          boxSizing: "border-box",
        }}
      >
        <div style={{ minWidth: 0 }}>
          {kicker}
          {statement}
          {absatz}
          {credo}
        </div>
      </div>
    </div>
  );
}
