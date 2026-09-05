import { C, sans } from "../tokens";
import { PersonenIcon, BankIcon } from "./DreieckIcons";
import monogramm from "../../assets/logo/tellian-monogramm-hell.svg";

/* ═══════════════════════════════════════════════════════════
   DREIECKSBEZIEHUNG — Sie · Tellian Capital · Depotbank

   Redesign von Station 03. Ersetzt das frühere ParteiDreieck, das
   seine Erklärtexte nur beim Zeigen hergab — für die Zielgruppe 65+
   muss alles ohne Interaktion sichtbar sein. Dieses Bauteil ist
   reine Darstellung: drei Knoten, drei Linien, drei Verbindungs-
   wörter. Keine Zeiger, keine Zustände.

   GEOMETRIE
   Ein festes Koordinatensystem (640×560); die Linien liegen als SVG
   mit demselben viewBox darunter, die Beschriftungen als HTML in
   Prozent derselben Koordinaten darüber. Beides skaliert linear mit
   der Breite — die Schriften NICHT: sie stehen in festen Pixeln,
   damit sie auf dem Telefon nicht unter die 12px fallen.

   Die Verbindungswörter liegen WAAGRECHT auf den Linienmitten, mit
   der Stationsfarbe als Teller — die Linie läuft optisch durch das
   Wort hindurch, ohne es zu durchstreichen. Vorher waren sie den
   Diagonalen entlang rotiert; Lesbarkeit vor Effekt.
   ═══════════════════════════════════════════════════════════ */

/* Knotenzentren im 640×560-Raster. */
const K = {
  sie: { x: 320, y: 128 },
  tellian: { x: 150, y: 420 },
  bank: { x: 490, y: 420 },
} as const;
const R = 78;

interface Inhalt {
  sie: string;
  tellian: string;
  bank: string;
  /** Sie↔Tellian · Sie↔Depotbank · Tellian↔Depotbank */
  kanten: readonly [string, string, string];
}

const INHALT: Readonly<Record<"DE" | "EN" | "FR", Inhalt>> = {
  DE: {
    sie: "Sie",
    tellian: "Tellian Capital",
    bank: "Depotbank",
    kanten: [
      "Vermögensverwaltungsauftrag",
      "Depot- / Kontobeziehung",
      "Vermögensverwaltungsvollmacht",
    ],
  },
  EN: {
    sie: "You",
    tellian: "Tellian Capital",
    bank: "Custodian Bank",
    /* Bestehende EN-Strings aus der früheren Grafik übernommen —
       nichts neu übersetzt. */
    kanten: [
      "Asset management mandate",
      "Custody/account relationship",
      "Asset management authority",
    ],
  },
  /* TODO-FR: Übersetzung folgt — DE-Text als Platzhalter. */
  FR: {
    sie: "Sie",
    tellian: "Tellian Capital",
    bank: "Depotbank",
    kanten: [
      "Vermögensverwaltungsauftrag",
      "Depot- / Kontobeziehung",
      "Vermögensverwaltungsvollmacht",
    ],
  },
};

const pz = (v: number, ganz: number) => `${((v / ganz) * 100).toFixed(2)}%`;

interface Props {
  sprache?: "DE" | "EN";
}

export function DreiecksBeziehung({ sprache = "DE" }: Props) {
  const inhalt = INHALT[sprache];

  /* Beschriftungspunkte. Die Seitenwörter sitzen bei 62 % des Wegs
     von «Sie» abwärts — auf halber Höhe berührten sich die beiden
     Teller in der Dreiecksmitte. Das untere Wort steht UNTER seiner
     Linie: es ist breiter als die Lücke zwischen den Kreisen und
     überlappte auf der Linie den Tellian-Kreis. */
  const entlang = (a: { x: number; y: number }, b: { x: number; y: number }, t: number) => ({
    x: a.x + (b.x - a.x) * t,
    y: a.y + (b.y - a.y) * t,
  });
  const m1 = entlang(K.sie, K.tellian, 0.62);
  const m2 = entlang(K.sie, K.bank, 0.62);
  const m3 = { x: (K.tellian.x + K.bank.x) / 2, y: 472 };

  const knoten = (
    zentrum: { x: number; y: number },
    fuellung: string,
    kontur: string | null,
    kind: React.ReactNode,
    beschriftung: string,
  ) => (
    <>
      <div
        aria-hidden
        style={{
          position: "absolute",
          left: pz(zentrum.x, 640),
          top: pz(zentrum.y, 560),
          width: pz(2 * R, 640),
          aspectRatio: "1",
          transform: "translate(-50%, -50%)",
          borderRadius: "50%",
          backgroundColor: fuellung,
          border: kontur ? `1.5px solid ${kontur}` : "none",
          boxSizing: "border-box",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {kind}
      </div>
      <span
        style={{
          position: "absolute",
          left: pz(zentrum.x, 640),
          top: pz(zentrum.y + R + 26, 560),
          transform: "translate(-50%, -50%)",
          fontFamily: sans,
          fontSize: "13px",
          letterSpacing: "0.14em",
          textTransform: "uppercase",
          whiteSpace: "nowrap",
          color: C.ink,
        }}
      >
        {beschriftung}
      </span>
    </>
  );

  const wort = (zentrum: { x: number; y: number }, text: string) => (
    <span
      style={{
        position: "absolute",
        left: pz(zentrum.x, 640),
        top: pz(zentrum.y, 560),
        transform: "translate(-50%, -50%)",
        fontFamily: sans,
        fontSize: "12px",
        letterSpacing: "0.04em",
        whiteSpace: "nowrap",
        color: C.accent,
        /* Teller in der Stationsfarbe: die Linie läuft durch das
           Wort, ohne es zu durchstreichen. */
        backgroundColor: C.bg,
        padding: "4px 10px",
      }}
    >
      {text}
    </span>
  );

  return (
    <div
      role="img"
      aria-label={
        `${inhalt.sie} — ${inhalt.tellian}: ${inhalt.kanten[0]}. ` +
        `${inhalt.sie} — ${inhalt.bank}: ${inhalt.kanten[1]}. ` +
        `${inhalt.tellian} — ${inhalt.bank}: ${inhalt.kanten[2]}.`
      }
      style={{
        position: "relative",
        width: "100%",
        aspectRatio: "640 / 560",
      }}
    >
      {/* Linien — Imperial Purple, 1px, nicht mitskalierend. */}
      <svg
        viewBox="0 0 640 560"
        preserveAspectRatio="xMidYMid meet"
        aria-hidden
        focusable="false"
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
      >
        {[
          [K.sie, K.tellian],
          [K.sie, K.bank],
          [K.tellian, K.bank],
        ].map(([a, b], i) => (
          <line
            key={i}
            x1={a.x}
            y1={a.y}
            x2={b.x}
            y2={b.y}
            stroke={C.purple}
            strokeWidth={1}
            vectorEffect="non-scaling-stroke"
          />
        ))}
      </svg>

      {/* Knoten. «Sie» in Mushroom mit Personen-Icon —
          TODO-ASSET-SIE: das Icon wird später durch ein finales
          Asset ersetzt (in Arbeit); bis dahin das bestehende. */}
      {knoten(
        K.sie,
        C.muted,
        null,
        <span style={{ width: "46%", aspectRatio: "512 / 335.09", display: "flex" }}>
          <PersonenIcon w="100%" h="100%" color={C.purple} />
        </span>,
        inhalt.sie,
      )}
      {knoten(
        K.tellian,
        C.purple,
        null,
        <img
          src={monogramm}
          alt=""
          aria-hidden
          style={{ width: "42%", height: "auto", display: "block" }}
        />,
        inhalt.tellian,
      )}
      {knoten(
        K.bank,
        C.bg,
        C.purple,
        <span style={{ width: "38%", aspectRatio: "1", display: "flex" }}>
          <BankIcon w="100%" h="100%" color={C.purple} />
        </span>,
        inhalt.bank,
      )}

      {/* Verbindungswörter — waagrecht auf den Linienmitten. */}
      {wort(m1, inhalt.kanten[0])}
      {wort(m2, inhalt.kanten[1])}
      {wort(m3, inhalt.kanten[2])}
    </div>
  );
}
