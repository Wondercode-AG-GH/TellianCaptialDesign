import { useState } from "react";

import { C, cormorant, sans } from "../tokens";
import { usePrefersReducedMotion } from "./usePrefersReducedMotion";
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
  /** Erklärtexte. Die Depotbank-Zeile ist vom Kunden am 09.09 in
      dieser gekürzten Fassung geliefert worden (ohne den früheren
      Zusatz «— zu besten Konditionen»); TODO-HOVER-DEPOTBANK ist
      damit erledigt. Chronik: 05.09 gelöscht, 06.09 auf Anweisung
      zurück, 08.09 erneut gelöscht, 09.09 in dieser Fassung
      endgültig gesetzt. */
  prosa: Readonly<Record<"sie" | "tellian" | "bank", string>>;
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
      bank: "Ihr Vermögen liegt bei ausgewählten Kooperationsbanken in der Schweiz und in Liechtenstein.",
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
      /* Gekürzt aus der historischen EN-Fassung derselben Zeile —
         der Zusatz «on the best terms» entfällt mit dem deutschen
         Pendant. Nicht neu übersetzt. */
      bank: "Your assets are held at selected partner banks in Switzerland and Liechtenstein.",
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
      bank: "Ihr Vermögen liegt bei ausgewählten Kooperationsbanken in der Schweiz und in Liechtenstein.",
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
  /* P3 (Review 08.09): kompakt ist das Dreieck HÖHER gestreckt
     (sie 118, Basis 460, Feld 640×700) — die Diagonalen tragen so
     die gestaffelten Linienwörter mit Luft, und unter der Basis ist
     Platz für Namen DIREKT am Kreis plus das Vollmacht-Wort. */
  const K = kompakt
    ? ({ sie: { x: 320, y: 118 }, tellian: { x: 150, y: 460 }, bank: { x: 490, y: 460 } } as const)
    : ({ sie: { x: 320, y: 128 }, tellian: { x: 124, y: 420 }, bank: { x: 516, y: 420 } } as const);
  const VH = kompakt ? 700 : 560;
  /* P7: Zeigen/Fokus/Tap hebt einen Knoten hervor und zeigt seinen
     Erklärtext in der Lesezone unter der Grafik. Auf Touch gilt:
     erster Tap zeigt den Text, zweiter Tap auf «T» navigiert —
     dieselbe Regel trägt auch den Mausklick (Zeigen aktiviert
     bereits, der Klick löst dann aus). */
  const [aktiv, setAktiv] = useState<KnotenId | null>(null);
  const reducedMotion = usePrefersReducedMotion();

  /* Beschriftungspunkte. Die Seitenwörter sitzen bei 62 % des Wegs
     von «Sie» abwärts — auf halber Höhe berührten sich die beiden
     Teller in der Dreiecksmitte. Das untere Wort steht UNTER seiner
     Linie: es ist breiter als die Lücke zwischen den Kreisen und
     überlappte auf der Linie den Tellian-Kreis. */
  const entlang = (a: { x: number; y: number }, b: { x: number; y: number }, t: number) => ({
    x: a.x + (b.x - a.x) * t,
    y: a.y + (b.y - a.y) * t,
  });
  /* LINIENWÖRTER (P2, Review 08.09) — kein Wort berührt seine
     Linie:
     BREIT: Versatz-Lösung für alle drei. Die Seitenwörter hängen
     KANTENgeankert auf der Aussenseite ihrer Diagonale, senkrecht
     um 17 Einheiten versetzt — die zugewandte Textkante hält damit
     bei jeder Fensterbreite ~10–12px Luft zur Linie (Schrift steht
     in festen px, der Versatz skaliert mit). Das Vollmacht-Wort
     hängt mit der Oberkante 12 Einheiten unter der Basislinie.
     KOMPAKT: Unterbrechungs-Lösung für die Diagonalen — das Wort
     sitzt mittig AUF der Linie, ein Teller in Stationsfarbe
     unterbricht sie optisch (die Lücke wächst mit dem Text, was
     eine SVG-Lücke nicht könnte). Das Vollmacht-Wort passt bei
     ~330px nirgends an seine Linie (breiter als die ganze
     Kreislücke) und steht zentriert unter den Knotennamen. */
  const NORMAL_1 = { x: -0.83, y: -0.557 };   /* Aussenseite Sie↔Tellian */
  const NORMAL_2 = { x: 0.83, y: -0.557 };    /* Aussenseite Sie↔Depotbank */
  const m1roh = entlang(K.sie, K.tellian, kompakt ? 0.5 : 0.62);
  const m2roh = entlang(K.sie, K.bank, kompakt ? 0.64 : 0.62);
  const m1 = kompakt
    ? m1roh
    : { x: m1roh.x + 17 * NORMAL_1.x, y: m1roh.y + 17 * NORMAL_1.y };
  const m2 = kompakt
    ? m2roh
    : { x: m2roh.x + 17 * NORMAL_2.x, y: m2roh.y + 17 * NORMAL_2.y };
  const m3 = kompakt
    ? { x: 320, y: K.tellian.y + R + 68 }
    : { x: 320, y: K.tellian.y + 12 };

  const knoten = (
    id: KnotenId,
    zentrum: { x: number; y: number },
    fuellung: string,
    kontur: string | null,
    kind: React.ReactNode,
    beschriftung: string,
  ) => {
    const istCta = id === "tellian";
    /* HERVORHEBUNG (wie im Bestand vor dem Redesign): zeigt man auf
       einen Knoten, treten die beiden anderen samt ihren Namen
       zurück und der gewählte kommt eine Spur nach vorn. Nur im
       breiten Zweig — kompakt gibt es kein Zeigen, dort stehen alle
       Texte ohnehin untereinander. */
    const gedimmt = !kompakt && aktiv !== null && aktiv !== id;
    const hervor = !kompakt && aktiv === id;
    const uebergang = reducedMotion
      ? undefined
      : "opacity 260ms cubic-bezier(0.22,0.61,0.36,1), transform 260ms cubic-bezier(0.22,0.61,0.36,1)";
    /* Kompakt gibt es kein Zeigen: die Erklärtexte stehen statisch
       unter der Grafik (Zielgruppe 65+). Nur «T» bleibt dort
       Schaltfläche (führt zum Mandat). */
    const istPassiv = kompakt && !istCta;
    const kreisStil: React.CSSProperties = {
      position: "absolute",
      left: pz(zentrum.x, 640),
      top: pz(zentrum.y, VH),
      width: pz(2 * R, 640),
      aspectRatio: "1",
      borderRadius: "50%",
      backgroundColor: fuellung,
      border: kontur ? `1.5px solid ${kontur}` : "none",
      boxSizing: "border-box",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: 0,
      opacity: gedimmt ? 0.25 : 1,
      transform: `translate(-50%, -50%) scale(${hervor ? 1.03 : 1})`,
      transition: uebergang,
      zIndex: hervor ? 2 : 1,
    };
    return (
    <>
      {istPassiv ? (
        <div aria-hidden style={kreisStil}>
          {kind}
        </div>
      ) : (
      <button
        type="button"
        onMouseEnter={kompakt ? undefined : () => setAktiv(id)}
        onMouseLeave={kompakt ? undefined : () => setAktiv((a) => (a === id ? null : a))}
        onFocus={kompakt ? undefined : () => setAktiv(id)}
        onBlur={kompakt ? undefined : () => setAktiv((a) => (a === id ? null : a))}
        onClick={() => {
          if (kompakt) {
            onMandat?.();
            return;
          }
          if (istCta && aktiv === id) {
            onMandat?.();
            return;
          }
          setAktiv(id);
        }}
        aria-label={
          istCta
            ? `${beschriftung} — ${inhalt.prosa.tellian.replace("\u00A0→", "")}`
            : `${beschriftung} — ${inhalt.prosa[id as "sie" | "bank"]}`
        }
        className="tellian-dreieck-knoten"
        style={{ ...kreisStil, cursor: "pointer", font: "inherit" }}
      >
        {kind}
      </button>
      )}
      <span
        style={{
          position: "absolute",
          left: pz(zentrum.x, 640),
          /* P3.2: jeder Name DIREKT unter seinem Kreis, einheitlich
             +20 (kompakt) bzw. +26 (breit) — das Vollmacht-Wort
             steht kompakt eine Ebene TIEFER, nicht dazwischen. */
          top: pz(zentrum.y + R + (kompakt ? 20 : 26), VH),
          transform: "translate(-50%, -50%)",
          fontFamily: sans,
          fontSize: "13px",
          letterSpacing: "0.14em",
          textTransform: "uppercase",
          whiteSpace: "nowrap",
          color: C.ink,
          opacity: gedimmt ? 0.25 : 1,
          transition: uebergang,
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
    anker: "oben" | "mitte" | "links" | "rechts",
    teller = false,
  ) => (
    <span
      style={{
        position: "absolute",
        left: pz(zentrum.x, 640),
        top: pz(zentrum.y, VH),
        transform:
          anker === "oben"
            ? "translate(-50%, 0)"
            : anker === "links"
              ? "translate(0, -50%)"
              : anker === "rechts"
                ? "translate(-100%, -50%)"
                : "translate(-50%, -50%)",
        fontFamily: sans,
        fontSize: "12px",
        letterSpacing: "0.04em",
        whiteSpace: "nowrap",
        color: C.accent,
        /* Unterbrechungs-Lösung (kompakt): der Teller in Stations-
           farbe öffnet die Linie um das Wort — 10px je Seite. */
        ...(teller
          ? { backgroundColor: "var(--tellian-s2-bg, #F9F9F7)", padding: "2px 10px" }
          : null),
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
      {wort(m1, inhalt.kanten[0], kompakt ? "mitte" : "rechts", kompakt)}
      {wort(m2, inhalt.kanten[1], kompakt ? "mitte" : "links", kompakt)}
      {wort(m3, inhalt.kanten[2], kompakt ? "mitte" : "oben")}
    </div>

    {/* ── Lesezone.
        BREIT: EIN Platz für alle drei Erklärtexte, feste Höhe über
        das unsichtbare Stapeln — beim Zeigen springt nichts,
        aria-live liest den Wechsel vor.
        KOMPAKT: kein Zeigen, keine Reserve — alle drei Texte stehen
        STATISCH untereinander, mit dem Knotennamen als Absender.
        Der Tellian-Eintrag ist der Verweis zur Mandat-Seite. */}
    {kompakt ? (
      <div
        style={{
          marginTop: "22px",
          display: "flex",
          flexDirection: "column",
          gap: "18px",
        }}
      >
        {(["sie", "bank"] as const).map((id) => (
          <p
            key={id}
            lang={sprache === "EN" ? "en" : "de"}
            style={{ margin: 0 }}
          >
            <span
              style={{
                display: "block",
                marginBottom: "4px",
                fontFamily: sans,
                fontSize: "12px",
                letterSpacing: "0.16em",
                textTransform: "uppercase",
                color: C.stone,
              }}
            >
              {inhalt[id]}
            </span>
            <span
              style={{
                fontFamily: sans,
                fontSize: "14px",
                lineHeight: 1.65,
                color: C.accent,
              }}
            >
              {inhalt.prosa[id]}
            </span>
          </p>
        ))}
        {/* UI-LABEL-REVIEW: «Unsere Leistungen für Sie →» stammt aus
            der früheren Live-Implementierung (ParteiDreieck,
            cf1f30c) — Herkunft verifiziert, bleibt. */}
        <button
          type="button"
          onClick={() => onMandat?.()}
          className="tellian-dreieck-mandat"
          style={{
            alignSelf: "flex-start",
            margin: 0,
            padding: "10px 0",
            background: "transparent",
            border: "none",
            borderBottom: `1px solid ${C.purple}`,
            fontFamily: sans,
            fontSize: "13px",
            letterSpacing: "0.08em",
            color: C.ink,
            cursor: "pointer",
          }}
        >
          {inhalt.prosa.tellian}
        </button>
      </div>
    ) : (
    <div
      aria-live="polite"
      style={{ position: "relative", marginTop: "10px", display: "grid" }}
    >
      {(["sie", "tellian", "bank"] as const).map((id) => (
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
    )}

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
