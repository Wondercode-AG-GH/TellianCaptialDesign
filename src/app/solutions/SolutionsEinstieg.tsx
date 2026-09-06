import { C, sans, serif } from "../tokens";
import { HeroBildPanel } from "../components/Station1Einstieg";
import { Aufgang, Kapitelmarke } from "../components/MobilSektion";
import { SOLUTIONS_INHALT, SOLUTIONS_LEISTE } from "./inhalt";

/* ═══════════════════════════════════════════════════════════
   SOLUTIONS S1 — EINSTIEG (hell)

   Layout wie Station 01 der Hauptseite: links die Textgruppe
   vertikal zentriert, rechts das Solutions-Bild als randloses
   Panel — GETEILTE Komponente HeroBildPanel, identische Behandlung
   (Platzhalterton, sizes, priority).

   TODO-BILD-TONUNG: die finale dunkle Tonung des Bilds folgt von
   der Brand-Designerin; bis dahin läuft die Quelle unverändert,
   KEINE CSS-Filter-Tonung im Produktivcode.
   ═══════════════════════════════════════════════════════════ */

interface Props {
  panelRef?: (el: HTMLDivElement | null) => void;
  isVertical?: boolean;
  sprache: "DE" | "EN";
}

/* Das Solutions-Motiv ist 46:25 (~1.84) — das Panel übernimmt das
   Quellverhältnis, damit «unverändert einsetzen» auch fürs Layout
   gilt; Behandlung und Breitenlogik bleiben die des Haupt-Heros. */
const VERHAELTNIS = "46 / 25";

export function SolutionsEinstieg({ panelRef, isVertical = false, sprache }: Props) {
  const inhalt = SOLUTIONS_INHALT[sprache].einstieg;

  const eyebrow = (
    <p
      style={{
        margin: 0,
        fontFamily: sans,
        fontSize: "12px",
        letterSpacing: "0.22em",
        textTransform: "uppercase",
        /* G2: Kicker auf heller Station in Imperial. */
        color: C.purple,
      }}
    >
      {inhalt.eyebrow}
    </p>
  );

  const titel = (
    <h1
      style={{
        margin: "18px 0 0",
        fontFamily: serif,
        fontSize: "var(--tellian-s1-title-size)",
        fontWeight: "var(--tellian-s1-title-weight)" as unknown as number,
        lineHeight: "var(--tellian-s1-title-leading)" as unknown as number,
        letterSpacing: "var(--tellian-s1-title-tracking)",
        color: C.ink,
      }}
    >
      {inhalt.titel}
    </h1>
  );

  /* Hairline unter dem Titel — Mushroom, 40 % (Briefing S1). */
  const linie = (
    <span
      aria-hidden
      style={{
        display: "block",
        marginTop: "clamp(20px, 2.6vh, 32px)",
        width: "100%",
        maxWidth: "38em",
        height: "1px",
        backgroundColor: "rgba(184, 174, 163, 0.4)",
      }}
    />
  );

  const text = (
    <p
      lang={sprache === "EN" ? "en" : "de"}
      style={{
        margin: "clamp(20px, 2.6vh, 32px) 0 0",
        maxWidth: "52ch",
        fontFamily: sans,
        fontSize: "var(--tellian-s2-body-size, 16px)",
        lineHeight: "var(--tellian-lauf-lh, 1.75)",
        color: C.accent,
      }}
    >
      {inhalt.text}
    </p>
  );

  if (isVertical) {
    return (
      <section id="solutions-einstieg" style={{ backgroundColor: C.bg }}>
        <div style={{ paddingTop: "var(--tellian-kopfzeile-schmal)" }}>
          <HeroBildPanel
            imageId="hero-solutions"
            alt="Zürich an der Limmat"
            breit={false}
            verhaeltnis={VERHAELTNIS}
          />
        </div>
        <div
          style={{
            paddingTop: "var(--tellian-abschnitt-luft-schmal)",
            paddingBottom: "var(--tellian-abschnitt-luft-schmal)",
            paddingLeft: "clamp(20px, 6vw, 48px)",
            paddingRight: "clamp(20px, 6vw, 48px)",
          }}
        >
          <div style={{ marginBottom: "clamp(28px, 4vh, 44px)" }}>
            <Kapitelmarke nr="01" name={SOLUTIONS_LEISTE[sprache][0]} />
          </div>
          <Aufgang>
            {eyebrow}
            {titel}
            {linie}
            {text}
          </Aufgang>
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
          paddingTop: "var(--tellian-s1-stage-pad)",
          paddingBottom: "var(--tellian-s1-stage-pad)",
          paddingLeft: "calc(var(--tellian-rail-width) + var(--tellian-station-pad-x))",
          paddingRight: "var(--tellian-station-pad-x)",
          display: "flex",
          alignItems: "center",
          gap: "clamp(32px, 5vw, 96px)",
          boxSizing: "border-box",
        }}
      >
        {/* ══ Textgruppe, vertikal zentriert (G1) ══ */}
        <div style={{ flex: "1 1 0", minWidth: 0 }}>
          {eyebrow}
          {titel}
          {linie}
          {text}
        </div>

        {/* ══ Randloses Bildpanel — geteilte Hero-Behandlung ══ */}
        <div
          style={{
            flex: "0 0 min(46vw, calc(var(--tellian-s1-stage-height) * 1.84))",
            height: "100%",
            display: "flex",
            alignItems: "center",
            minWidth: 0,
          }}
        >
          <HeroBildPanel
            imageId="hero-solutions"
            alt="Zürich an der Limmat"
            breit
            verhaeltnis={VERHAELTNIS}
          />
        </div>
      </div>
    </div>
  );
}
