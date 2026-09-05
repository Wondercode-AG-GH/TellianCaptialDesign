import { useState } from "react";

import { C, cormorant, sans } from "../tokens";
import { BankIcon } from "./DreieckIcons";
/* TODO-ASSET-SIE-SVG: finales Vektor-Icon der Brand-Designerin
   ausstehend. Bis dahin die nachgeschärfte PNG-Fassung (384px,
   Striche verdichtet), damit es neben den Vektor-Icons besteht. */
import gruppeIcon from "../../assets/gruppe-scharf.png";
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
const R = 78;

interface Inhalt {
  sie: string;
  tellian: string;
  bank: string;
  /** Sie↔Tellian · Sie↔Depotbank · Tellian↔Depotbank */
  kanten: readonly [string, string, string];
  /** Erklärtexte. Die Depotbank trägt KEINEN Text mehr: die Zeile
      «Ihr Vermögen liegt bei ausgewählten Kooperationsbanken …»
      stammte nicht aus dem Quelldokument und ist ersatzlos
      gelöscht (Review 05.09, P1.1). */
  prosa: Readonly<Record<"sie" | "tellian", string>>;
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
    prosa: {
      sie: "Sie haben einen persönlichen Ansprechpartner und jederzeit vollständige Transparenz. Ihr Portfolio wird laufend überwacht, und Sie werden regelmässig darüber informiert.",
      tellian: "Unsere Leistungen für Sie\u00A0→",
    },
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
    prosa: {
      sie: "You have a personal point of contact and full transparency at all times. Your portfolio is continuously monitored, and you are kept regularly informed.",
      tellian: "Our services for you\u00A0→",
    },
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
    prosa: {
      sie: "Sie haben einen persönlichen Ansprechpartner und jederzeit vollständige Transparenz. Ihr Portfolio wird laufend überwacht, und Sie werden regelmässig darüber informiert.",
      tellian: "Unsere Leistungen für Sie\u00A0→",
    },
  },
};

const pz = (v: number, ganz: number) => `${((v / ganz) * 100).toFixed(2)}%`;

interface Props {
  sprache?: "DE" | "EN";
  /** P7: Klick/Enter auf den Tellian-Knoten führt zur Mandat-
      Unterseite. */
  onMandat?: () => void;
  /** Vertikales Layout (<1024px): die Grafik ist dort so klein,
      dass das untere Linienwort nicht zwischen die Kreise passt —
      es weicht unter die Kreise aus, die Knotennamen eine Stufe
      tiefer. */
  kompakt?: boolean;
}

type KnotenId = "sie" | "tellian" | "bank";

export function DreiecksBeziehung({ sprache = "DE", onMandat, kompakt = false }: Props) {
  const inhalt = INHALT[sprache];
  /* GEOMETRIE, layoutabhängig (Review 05.09 abends, P1):
     — Breit: Basis auf 124/516 gezogen, damit das Wort «Vermögens-
       verwaltungsvollmacht» DIREKT unter seiner Linie zwischen die
       Kreise passt; Feld 640×560.
     — Kompakt: die Schrift skaliert nicht mit, bei ~330px Breite
       ist das Wort breiter als die ganze Kreislücke. Schmale Basis
       (die Knotennamen liefen sonst seitlich hinaus), das untere
       Wort unter den Kreisen, die Knotennamen eine Ebene tiefer,
       und ein höheres Feld (640×640), damit sich die Zeilen nicht
       stapeln. Die Seitenwörter sitzen GESTAFFELT (45 %/64 % des
       Wegs): auf gleicher Höhe sind beide zusammen breiter als die
       ganze Grafik. */
  const K = kompakt
    ? ({ sie: { x: 320, y: 128 }, tellian: { x: 150, y: 420 }, bank: { x: 490, y: 420 } } as const)
    : ({ sie: { x: 320, y: 128 }, tellian: { x: 124, y: 420 }, bank: { x: 516, y: 420 } } as const);
  const VH = kompakt ? 640 : 560;
  /* P7: Zeigen/Fokus/Tap hebt einen Knoten hervor und zeigt seinen
     Erklärtext in der Lesezone unter der Grafik. Auf Touch gilt:
     erster Tap zeigt den Text, zweiter Tap auf «T» navigiert —
     dieselbe Regel trägt auch den Mausklick (Zeigen aktiviert
     bereits, der Klick löst dann aus). */
  const [aktiv, setAktiv] = useState<KnotenId | null>(null);

  /* Beschriftungspunkte. Die Seitenwörter sitzen bei 62 % des Wegs
     von «Sie» abwärts — auf halber Höhe berührten sich die beiden
     Teller in der Dreiecksmitte. Das untere Wort steht UNTER seiner
     Linie: es ist breiter als die Lücke zwischen den Kreisen und
     überlappte auf der Linie den Tellian-Kreis. */
  const entlang = (a: { x: number; y: number }, b: { x: number; y: number }, t: number) => ({
    x: a.x + (b.x - a.x) * t,
    y: a.y + (b.y - a.y) * t,
  });
  /* EINE Regel für alle drei Linienwörter: mittig zur Linie, auf
     der vom Dreieck abgewandten Seite, mit kleinem festem Abstand
     zur Linie. Keine Farbteller mehr: nichts kreuzt mehr eine
     Linie, und der Teller war es, der die Ecke aus dem T-Kreis
     schnitt.

     Das untere Wort hängt mit der OBERKANTE 9 Einheiten unter der
     Linie T↔Depotbank, mittig zwischen den Kreisen — dafür ist die
     Basis breit genug gezogen. Nur im kompakten Layout (Telefon)
     weicht es unter die Kreise aus: die Grafik skaliert, die
     Schrift nicht, und bei ~330px Breite ist das Wort breiter als
     die ganze Kreislücke. */
  const m1 = entlang(K.sie, K.tellian, kompakt ? 0.45 : 0.62);
  const m2 = entlang(K.sie, K.bank, kompakt ? 0.64 : 0.62);
  const m3 = kompakt
    ? { x: 320, y: K.tellian.y + R + 24 }
    : { x: 320, y: K.tellian.y + 9 };

  const knoten = (
    id: KnotenId,
    zentrum: { x: number; y: number },
    fuellung: string,
    kontur: string | null,
    kind: React.ReactNode,
    beschriftung: string,
  ) => {
    const istCta = id === "tellian";
    return (
    <>
      <button
        type="button"
        onMouseEnter={() => setAktiv(id)}
        onMouseLeave={() => setAktiv((a) => (a === id ? null : a))}
        onFocus={() => setAktiv(id)}
        onBlur={() => setAktiv((a) => (a === id ? null : a))}
        onClick={() => {
          if (istCta && aktiv === id) {
            onMandat?.();
            return;
          }
          setAktiv(id);
        }}
        aria-label={
          id === "bank"
            ? beschriftung
            : istCta
              ? `${beschriftung} — ${inhalt.prosa[id].replace("\u00A0→", "")}`
              : `${beschriftung} — ${inhalt.prosa[id]}`
        }
        className="tellian-dreieck-knoten"
        style={{
          position: "absolute",
          left: pz(zentrum.x, 640),
          top: pz(zentrum.y, VH),
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
          padding: 0,
          cursor: "pointer",
          font: "inherit",
        }}
      >
        {kind}
      </button>
      <span
        style={{
          position: "absolute",
          left: pz(zentrum.x, 640),
          /* Kompakt steht «Sie» ÜBER seinem Kreis: unterhalb kreuzen
             die gestaffelten Seitenwörter. Die unteren Namen rücken
             eine Ebene unter das Vollmacht-Wort (+80). */
          top: pz(
            kompakt && id === "sie"
              ? zentrum.y - R - 26
              : zentrum.y + R + (kompakt ? 80 : 26),
            VH,
          ),
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
  };

  const wort = (
    zentrum: { x: number; y: number },
    text: string,
    anker: "oben" | "mitte",
  ) => (
    <span
      style={{
        position: "absolute",
        left: pz(zentrum.x, 640),
        top: pz(zentrum.y, VH),
        transform:
          anker === "oben"
            ? "translate(-50%, 0)"
            : "translate(-50%, -50%)",
        fontFamily: sans,
        fontSize: "12px",
        letterSpacing: "0.04em",
        whiteSpace: "nowrap",
        color: C.accent,
      }}
    >
      {text}
    </span>
  );

  return (
    <div style={{ width: "100%" }}>
    <div
      role="group"
      aria-label={
        `${inhalt.sie} — ${inhalt.tellian}: ${inhalt.kanten[0]}. ` +
        `${inhalt.sie} — ${inhalt.bank}: ${inhalt.kanten[1]}. ` +
        `${inhalt.tellian} — ${inhalt.bank}: ${inhalt.kanten[2]}.`
      }
      style={{
        position: "relative",
        width: "100%",
        aspectRatio: `640 / ${VH}`,
      }}
    >
      {/* Linien — Imperial Purple, 1px, nicht mitskalierend. */}
      <svg
        viewBox={`0 0 640 ${VH}`}
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

      {/* Knoten. «Sie» mit dem finalen Gruppen-Asset (P6) — 512px
          Quelle bei ~150px Darstellung, scharf auch auf 3x-Dichte.
          Strichzeichnung in Schwarz auf Mushroom: 4.1 : 1. */}
      {knoten(
        "sie",
        K.sie,
        C.muted,
        null,
        <img
          src={gruppeIcon}
          alt=""
          aria-hidden
          style={{ width: "48%", height: "auto", display: "block" }}
        />,
        inhalt.sie,
      )}
      {knoten(
        "tellian",
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
        "bank",
        K.bank,
        C.bg,
        C.purple,
        <span style={{ width: "38%", aspectRatio: "1", display: "flex" }}>
          <BankIcon w="100%" h="100%" color={C.purple} />
        </span>,
        inhalt.bank,
      )}

      {/* Verbindungswörter — zentriert an einem Punkt mit festem
          seitlichem Versatz von der Linienmitte, abgewandt vom
          Dreieck. Kantengeankert liefen die englischen Wörter auf
          dem Telefon rechts aus dem Bild (Schrift steht in festen
          px, die Grafik skaliert). */}
      {wort({ x: m1.x - 12, y: m1.y }, inhalt.kanten[0], "mitte")}
      {wort({ x: m2.x + 12, y: m2.y }, inhalt.kanten[1], "mitte")}
      {wort(m3, inhalt.kanten[2], kompakt ? "mitte" : "oben")}
    </div>

    {/* ── P7: Lesezone — EIN Platz für alle drei Erklärtexte.
        Feste Höhe über das unsichtbare Stapeln aller Texte, damit
        beim Zeigen nichts springt. aria-live liest den Wechsel vor. */}
    <div
      aria-live="polite"
      style={{ position: "relative", marginTop: "10px", display: "grid" }}
    >
      {(["sie", "tellian"] as const).map((id) => (
        <p
          key={id}
          lang={sprache === "EN" ? "en" : "de"}
          style={{
            gridArea: "1 / 1",
            margin: 0,
            textAlign: "center",
            fontFamily: cormorant,
            fontStyle: "italic",
            fontSize: "16px",
            lineHeight: 1.5,
            color: C.ink,
            maxWidth: "34em",
            justifySelf: "center",
            visibility: aktiv === id ? "visible" : "hidden",
          }}
        >
          {inhalt.prosa[id]}
        </p>
      ))}
    </div>

    <style>{`
      .tellian-dreieck-knoten { outline: none; }
      .tellian-dreieck-knoten:focus-visible {
        outline: 2px solid var(--tellian-accent);
        outline-offset: 4px;
      }
      .tellian-dreieck-knoten:hover { filter: brightness(0.97); }
    `}</style>
    </div>
  );
}
