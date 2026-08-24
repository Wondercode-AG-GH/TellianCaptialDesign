import { useCallback, useEffect, useRef, useState } from "react";

import { C, cormorant, sans } from "../tokens";
import { useSectionEntered } from "./SectionEntry";
import { useTitelHoehe } from "./useTitelHoehe";

/* ═══════════════════════════════════════════════════════════
   STATION 4 — IHRE VORTEILE

   Acht Punkte auf einem Ring um das Monogramm.

   WARUM KEINE SPEICHEN
   Linien vom Zentrum zu den Beschriftungen würden acht Strahlen
   erzeugen und das Monogramm zum Nabe eines Rads machen. Die
   Zuordnung entsteht über Position und Ziffer — das genügt und
   lässt die Mitte ruhig.

   WARUM DIE BESCHRIFTUNGEN IN ZWEI SPALTEN STEHEN
   Dem Bogen folgend müsste der Text mitkippen, und gekippter Text
   liest sich schlecht. Zwei senkrechte Fluchten halten ihn waagrecht
   und geben dem Rad zugleich einen Rahmen.

   WARUM DIE SEGMENTE IN DER STÄRKE WACHSEN
   Auf dunklem Grund trägt eine Farbänderung allein zu wenig. Die
   Fläche ist der Unterschied, den man aus dem Augenwinkel sieht.
   ═══════════════════════════════════════════════════════════ */

interface Punkt {
  titel: string;
  text: string;
}

const PUNKTE: readonly Punkt[] = [
  {
    titel: "Know-how",
    text: "Aktive und strategische Ausrichtung Ihrer Anlagen unter Einbezug modernster Anlage- und Absicherungsinstrumente.",
  },
  {
    titel: "Unabhängigkeit",
    text: "Dank Trennung von Depotbank und Vermögensverwaltung können Interessenskonflikte vermieden werden.",
  },
  {
    titel: "Transparenz",
    text: "Die Umsetzung der gemeinsam definierten Anlagestrategie in Direktanlagen und Einzelwerten garantiert jederzeitige Übersicht.",
  },
  {
    titel: "Steuern",
    text: "Per Ende Kalenderjahr wird je nach Steuerdomizil ein entsprechender Steuerauszug erstellt — für Kunden von Tellian Capital kostenlos.",
  },
  {
    titel: "Finanz-Boutique und Flexibilität",
    text: "Ihre Bedürfnisse und Wünsche stehen im Vordergrund — die Investments sind auf Sie persönlich abgestimmt.",
  },
  {
    titel: "Diversifikation",
    text: "Diversifizierung nicht nur in den Anlagekategorien, sondern auch in den Standorten der Depotbanken.",
  },
  {
    titel: "Gebühren",
    text: "Klar definierte Basisgebühren, kombiniert mit Erfolgshonorar.",
  },
  {
    titel: "Kündigung",
    text: "Jederzeit, ohne Kündigungsfristen — weder in den Anlageinstrumenten noch im Verwaltungsauftrag. Sie können innert 48 Stunden über Ihr Geld verfügen.",
  },
];

/* Zwei Zeilen, die zweite kursiv — die Form von "Portfolio /
   Management" in Station 3. "Woran Sie uns messen können" war für
   diese Grösse zu lang: bei 64px hätte es die halbe Station
   eingenommen und wäre dem Rad in die Beschriftungen gelaufen. */
const TITEL = ["Tellian", "Vorteile"] as const;

const ziffer = (i: number) => String(i + 1).padStart(2, "0");


/* ── Geometrie ──
   Segment i liegt bei -90° + i·45°, also 01 oben, dann im
   Uhrzeigersinn. Damit stehen 02–04 rechts, 05 unten, 06–08 links —
   drei, eins, drei, eins, wie gefordert. */
const N = PUNKTE.length;
const SCHRITT = 360 / N;
const VB = 200;                 /* viewBox des Rades */
const MITTE = VB / 2;
/* 88 statt 78 von 200: der Ring nutzt den quadratischen Kasten
   besser aus. Bei 78 blieben aussen 11 % ungenutzt, und das Rad
   wirkte kleiner, als der Platz hergab. */
const RADIUS = 88;              /* Mittellinie des Rings */

const winkel = (i: number) => -90 + i * SCHRITT;
const rad = (g: number) => (g * Math.PI) / 180;
const punktAuf = (r: number, g: number) => ({
  x: MITTE + r * Math.cos(rad(g)),
  y: MITTE + r * Math.sin(rad(g)),
});

/** Bogen eines Segments, Lücke schon abgezogen. */
function bogen(i: number, luecke: number) {
  const halb = SCHRITT / 2 - luecke / 2;
  const a = punktAuf(RADIUS, winkel(i) - halb);
  const b = punktAuf(RADIUS, winkel(i) + halb);
  return `M ${a.x.toFixed(2)} ${a.y.toFixed(2)} A ${RADIUS} ${RADIUS} 0 0 1 ${b.x.toFixed(2)} ${b.y.toFixed(2)}`;
}

/* Eintritt: acht Segmente versetzt einzeichnen, zusammen unter einer
   Sekunde. 7 × 95 + 250 = 915 ms. */
const STAFFEL_MS = 95;
const ZEICHNEN_MS = 250;
const SESSION_KEY = "tellian:rad-eintritt";

function schonGelaufen() {
  try {
    return sessionStorage.getItem(SESSION_KEY) === "1";
  } catch {
    /* Privater Modus: dann läuft es einmal je Seitenaufruf. Das ist
       der harmlosere der beiden Fehler. */
    return false;
  }
}

interface Props {
  panelRef?: (el: HTMLDivElement | null) => void;
  isVertical?: boolean;
  domId?: string;
  /** Steht die Station gerade im Bild? Beim Eintreten fällt das Rad
      auf den Ruhepunkt zurück. */
  istAktiv?: boolean;
}

/* RUHEPUNKT
   Beim Eintreten und nach jedem Verlassen des Rades steht der erste
   Punkt. Vorher war der Ruhezustand "nichts gewählt": der
   Erklärbehälter blieb leer, und wer die Station nur ansah, ohne mit
   dem Zeiger hineinzufahren, bekam nie zu lesen, wovon sie handelt. */
const RUHE = 0;

export function Station4Rad({
  panelRef,
  isVertical = false,
  domId,
  istAktiv = false,
}: Props) {
  /* Welcher Punkt den Tabstopp trägt. Ohne Auswahl der erste — sonst
     stünde die ganze Gruppe auf tabIndex -1 und wäre mit der
     Tabulatortaste überhaupt nicht zu erreichen. Genau das war der
     Fall, nachdem der Ruhepunkt entfallen ist. */
  const [aktiv, setAktiv] = useState<number>(RUHE);
  const knopfRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const segRefs = useRef<(SVGPathElement | null)[]>([]);

  /* Die Sequenz läuft beim BETRETEN der Station, nicht beim Aufbau
     der Seite. Alle sechs Stationen hängen von Anfang an im Track —
     ohne den Latch wäre sie längst vorbei, bevor jemand hier ist.
     Genau das ist zuerst passiert.

     Ob sie überhaupt läuft, wird einmal beim Einhängen entschieden
     und festgehalten. `schonGelaufen()` liest sessionStorage, und die
     Sequenz schreibt beim Start hinein — als Abhängigkeit eines
     Effekts kippte der Wert mitten im Lauf. */
  const betreten = useSectionEntered();
  const [darfZeichnen] = useState(() => {
    if (typeof window === "undefined" || isVertical) return false;
    const rm = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    return !rm && !schonGelaufen();
  });
  /* warten: unsichtbar, noch nicht betreten · laeuft: zeichnet ein ·
     fertig: fester Strich */
  const [phase, setPhase] = useState<"warten" | "laeuft" | "fertig">(
    darfZeichnen ? "warten" : "fertig",
  );
  const gestartet = useRef(false);

  useEffect(() => {
    if (!darfZeichnen || !betreten || gestartet.current) return;
    gestartet.current = true;
    try {
      sessionStorage.setItem(SESSION_KEY, "1");
    } catch {
      /* siehe schonGelaufen() */
    }
    setPhase("laeuft");
    const t = window.setTimeout(
      () => setPhase("fertig"),
      (N - 1) * STAFFEL_MS + ZEICHNEN_MS + 60,
    );
    return () => clearTimeout(t);
  }, [darfZeichnen, betreten]);

  /* Jedes Mal, wenn die Station ins Bild kommt, steht wieder der
     erste Punkt — nicht der, auf dem der Zeiger beim letzten Besuch
     zufällig liegen geblieben ist. Nur auf der steigenden Flanke,
     damit ein Klick innerhalb der Station nicht zurückgesetzt wird. */
  useEffect(() => {
    if (istAktiv) setAktiv(RUHE);
  }, [istAktiv]);

  /* Pfeiltasten wandern durch die Punkte — ein Tabstopp für alle acht
     statt acht einzelner. Das ist das übliche Muster für eine Gruppe
     gleichrangiger Schalter. */
  const beiTaste = useCallback((
    e: React.KeyboardEvent,
    i: number,
    liste: React.RefObject<(HTMLElement | SVGElement | null)[]>,
  ) => {
    const schritte: Record<string, number> = {
      ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1,
    };
    if (e.key === "Home" || e.key === "End") {
      e.preventDefault();
      const ziel = e.key === "Home" ? 0 : N - 1;
      setAktiv(ziel);
      (liste.current[ziel] as HTMLElement | undefined)?.focus();
      return;
    }
    const d = schritte[e.key];
    if (d === undefined) return;
    e.preventDefault();
    const ziel = (i + d + N) % N;
    setAktiv(ziel);
    (liste.current[ziel] as HTMLElement | undefined)?.focus();
  }, []);


  /* Wer den Tabstopp trägt. Ohne Auswahl der erste Punkt — sonst
     stünde die ganze Gruppe auf tabIndex -1 und wäre mit der
     Tabulatortaste überhaupt nicht erreichbar. Genau das war der
     Fall, nachdem der voreingestellte Ruhepunkt entfallen ist. */
  const tabPunkt = aktiv;

  /* ── Erklärbehälter ──
     Erscheint beim Zeigen auf einen Punkt und liegt ABSOLUT unter dem
     Rad. Damit verschiebt er beim Auf- und Zugehen nichts: das Rad
     bleibt auf der Stationsmitte stehen.

     Alle acht Texte liegen im selben Rasterfeld übereinander, nur der
     gewählte ist sichtbar. Die Höhe bemisst sich dadurch am längsten
     Text statt an einer geratenen Zahl. */
  const erklaerung = (
    <div
      aria-live="polite"
      style={{
        width: "var(--tellian-r4-box-width)",
        maxWidth: "100%",
        backgroundColor: "var(--tellian-r4-box-bg)",
        border: "1px solid var(--tellian-r4-box-line)",
        borderRadius: "var(--tellian-r4-box-radius)",
        padding: "var(--tellian-r4-box-pad-y) var(--tellian-r4-box-pad-x)",
        boxSizing: "border-box",
        display: "grid",
        textAlign: "center",
      }}
    >
      {PUNKTE.map((p, i) => (
        <div
          key={p.titel}
          style={{
            gridArea: "1 / 1",
            visibility: i === aktiv ? "visible" : "hidden",
          }}
        >
          <span
            style={{
              display: "block",
              fontFamily: cormorant,
              fontSize: "var(--tellian-r4-title-size)",
              fontWeight: 300,
              lineHeight: 1.15,
              color: "var(--tellian-r4-ink)",
            }}
          >
            {p.titel}
          </span>
          <span
            style={{
              display: "block",
              marginTop: "8px",
              fontFamily: sans,
              fontSize: "var(--tellian-r4-body-size)",
              lineHeight: "var(--tellian-r4-body-leading)",
              color: "var(--tellian-r4-accent)",
            }}
          >
            {p.text}
          </span>
        </div>
      ))}
    </div>
  );

  /* Titel auf Höhe des Titels der Nachbarstation — siehe
     useTitelHoehe. Ohne Referenz bleibt es beim mittigen Titel. */
  const { wurzelRef, oben: kopfOben } = useTitelHoehe(!isVertical);

  const kopf = (
    <h2
      style={{
        margin: 0,
        fontFamily: cormorant,
        fontSize: "var(--tellian-r4-heading-size)",
        fontWeight: "var(--tellian-r4-heading-weight)" as unknown as number,
        lineHeight: "var(--tellian-r4-heading-leading)" as unknown as number,
        letterSpacing: "var(--tellian-r4-heading-tracking)",
        color: "var(--tellian-r4-ink)",
      }}
    >
      {TITEL[0]}
      <br />
      <em style={{ fontStyle: "italic", fontWeight: "inherit" }}>
        {TITEL[1]}
      </em>
    </h2>
  );


  const stil = (
    <style>{`
      .tellian-r4-punkt:focus-visible,
      .tellian-r4-treffer:focus-visible {
        outline: 2px solid var(--tellian-r4-focus);
        outline-offset: 4px;
      }
      /* Ein durchsichtiger Bogen zeigt keinen Ring — beim Fokus wird
         er kurz sichtbar, damit die Tastatur nicht ins Leere führt. */
      .tellian-r4-treffer:focus-visible { stroke: var(--tellian-r4-focus); stroke-opacity: 0.35; }
      .tellian-r4-treffer { cursor: pointer; pointer-events: stroke; }
      @media (prefers-reduced-motion: reduce) {
        .tellian-r4-seg, .tellian-r4-punkt { transition: none !important; }
      }
    `}</style>
  );

  /* ── SCHMAL ──
     Kein Rad: auf schmalen Bildschirmen wäre es nur lesbar zu
     bekommen, indem man die Beschriftungen dreht. Stattdessen alle
     acht Punkte vollständig untereinander — nichts versteckt, kein
     Hover. */
  if (isVertical) {
    return (
      <section
        id={domId}
        style={{
          backgroundColor: "var(--tellian-r4-bg)",
          backgroundImage:
            "var(--tellian-flaeche-dunkel-schmal)",
          paddingTop: "var(--tellian-abschnitt-luft-schmal)",
          paddingBottom: "var(--tellian-abschnitt-luft-schmal)",
          paddingLeft: "clamp(20px, 6vw, 48px)",
          paddingRight: "clamp(20px, 6vw, 48px)",
        }}
      >
        {kopf}

        <ol
          style={{
            listStyle: "none",
            margin: "clamp(28px, 4vh, 44px) 0 0",
            padding: 0,
            display: "flex",
            flexDirection: "column",
            gap: "clamp(22px, 3vh, 34px)",
          }}
        >
          {PUNKTE.map((p, i) => (
            <li key={p.titel}>
              <span
                style={{
                  display: "block",
                  fontFamily: cormorant,
                  fontSize: "var(--tellian-r4-numeral-size)",
                  color: "var(--tellian-r4-accent)",
                  letterSpacing: "0.08em",
                }}
              >
                {ziffer(i)}
              </span>
              <span
                style={{
                  display: "block",
                  marginTop: "4px",
                  fontFamily: cormorant,
                  fontSize: "var(--tellian-r4-title-size)",
                  fontWeight: 300,
                  lineHeight: 1.15,
                  color: "var(--tellian-r4-ink)",
                }}
              >
                {p.titel}
              </span>
              <span
                style={{
                  display: "block",
                  marginTop: "8px",
                  fontFamily: sans,
                  fontSize: "var(--tellian-r4-body-size)",
                  lineHeight: "var(--tellian-r4-body-leading)",
                  color: "var(--tellian-r4-accent)",
                }}
              >
                {p.text}
              </span>
            </li>
          ))}
        </ol>
        {stil}
      </section>
    );
  }

  /* ── BREIT ── */
  const luecke = 7; /* Grad; deckt sich mit --tellian-r4-arc-gap */
  const bogenlaenge = (RADIUS * rad(SCHRITT - luecke)).toFixed(2);

  /* Beschriftungen auf EINEM Radius statt in zwei festen Spalten.

     Vorher standen sie auf zwei senkrechten Fluchten am Rand des
     Kastens. Dadurch war der Punkt bei 0° dicht am Ring und der bei
     45° weit davon entfernt — die Abstände schwankten sichtbar. Auf
     gemeinsamem Radius liegen alle acht Ankerpunkte auf einem Kreis;
     der Text läuft von dort nach aussen und bleibt waagrecht. */
  const ANKER = 0.53;   /* Anteil der Radbreite, gemessen vom Zentrum */

  const platz = (i: number) => {
    const g = winkel(i);
    const oben = i === 0;
    const unten = i === N / 2;
    return {
      oben,
      unten,
      rechts: !oben && !unten && Math.cos(rad(g)) > 0,
      dx: ANKER * Math.cos(rad(g)),
      dy: ANKER * Math.sin(rad(g)),
    };
  };

  return (
    <div
      ref={(el) => {
        wurzelRef.current = el;
        panelRef?.(el);
      }}
      className="flex-shrink-0 h-screen relative"
      style={{ width: "var(--tellian-r4-section-width)", backgroundColor: C.bg }}
    >
      {/* ══ Die dunkle Fläche ══
          Läuft über die VOLLE Stationshöhe, auch hinter beiden
          Bändern — die Station soll randlos wirken. Vorher endete sie
          an der Oberkante der Leiste, weil die damals ein deckendes
          Band war; heute ist sie ein Verlauf und trägt die Schrift
          selbst. */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          backgroundColor: "var(--tellian-r4-bg)",
          backgroundImage:
            "var(--tellian-flaeche-dunkel)",
        }}
      />

      {/* ══ Die Bühne ══
          Nur der Text weicht den Bändern aus. Absolut statt Fluss:
          nur so hängt die Radmitte an der Bühnenmitte, unabhängig
          davon, ob der Erklärbehälter offen ist. */}
      <div
        style={{
          position: "absolute",
          top: "var(--tellian-kopf-height)",
          bottom: "var(--tellian-station-height)",
          left: 0,
          right: 0,
          paddingLeft: "var(--tellian-r4-pad-left)",
          paddingRight: "clamp(24px, 3vw, 56px)",
          boxSizing: "border-box",
        }}
      >
        {/* Linke Textkante und Oberkante wie der Titel in Station 3.
            Absolut, damit das Rad weiter an der Stationsmitte hängt
            und nicht vom Titel nach unten gedrückt wird. */}
        <div
          style={{
            position: "absolute",
            left: "var(--tellian-r4-heading-left)",
            ...(kopfOben === null
              ? { top: "50%", transform: "translateY(-50%)" }
              : { top: `${kopfOben}px` }),
          }}
        >
          {kopf}
        </div>

        {/* ══ Rad mit Beschriftungen ══ */}
        <div
          /* Zumachen, sobald der Zeiger das Rad verlässt — ausser
             der Fokus steht noch darin. Sonst risse ein weggezogener
             Zeiger dem Tastaturnutzer den Text weg. */
          onMouseLeave={(e) => {
            if (!e.currentTarget.contains(document.activeElement)) setAktiv(RUHE);
          }}
          style={{
            position: "absolute",
            left: "var(--tellian-r4-block-center)",
            top: "50%",
            transform: "translate(-50%, -50%)",
            width: "var(--tellian-r4-block)",
            /* Bänder oben und unten für die beiden mittigen
               Beschriftungen — sonst ragen sie aus dem Kasten und
               kollidieren mit Kopfzeile und Erklärtext. */
            height:
              "calc(var(--tellian-r4-wheel) + 2 * var(--tellian-r4-label-row))",
            flexShrink: 0,
          }}
        >
          {/* Ring und Nabe */}
          <svg
            viewBox={`0 0 ${VB} ${VB}`}
            aria-hidden
            focusable="false"
            style={{
              position: "absolute",
              left: "50%",
              top: "var(--tellian-r4-label-row)",
              transform: "translateX(-50%)",
              width: "var(--tellian-r4-wheel)",
              height: "var(--tellian-r4-wheel)",
              overflow: "visible",
              /* Nur die Trefferbögen nehmen Zeiger an; die Fläche
                 dazwischen bleibt durchlässig. */
              pointerEvents: "none",
            }}
          >
            {PUNKTE.map((p, i) => {
              const an = i === aktiv;
              return (
                <path
                  key={p.titel}
                  className="tellian-r4-seg"
                  d={bogen(i, luecke)}
                  fill="none"
                  strokeLinecap="butt"
                  pointerEvents="none"
                  stroke={
                    an
                      ? "var(--tellian-r4-arc-active-color)"
                      : "var(--tellian-r4-arc-idle-color)"
                  }
                  strokeWidth={
                    an ? "var(--tellian-r4-arc-active)" : "var(--tellian-r4-arc-idle)"
                  }
                  style={{
                    /* Eintritt: jedes Segment zeichnet sich versetzt
                       ein. Nach dem Lauf steht der Strich fest, damit
                       das Muster nicht bei jedem Wechsel neu läuft. */
                    strokeDasharray: phase === "fertig" ? undefined : bogenlaenge,
                    strokeDashoffset: phase === "fertig" ? undefined : bogenlaenge,
                    animation:
                      phase === "laeuft"
                        ? `tellianR4Zeichnen ${ZEICHNEN_MS}ms ease-out ${i * STAFFEL_MS}ms both`
                        : undefined,
                    transition: "stroke 220ms ease, stroke-width 220ms ease",
                  }}
                />
              );
            })}

            {/* Trefferbögen. Der sichtbare Strich ist im Ruhezustand
                1.5px breit — mit der Maus praktisch nicht zu treffen,
                und das SVG selbst fing die Zeiger ab. Diese Bögen sind
                durchsichtig, breit und liegen obenauf. */}
            {PUNKTE.map((p, i) => (
              <path
                key={`treffer-${p.titel}`}
                ref={(el) => {
                  segRefs.current[i] = el;
                }}
                className="tellian-r4-treffer"
                d={bogen(i, 0)}
                fill="none"
                stroke="transparent"
                strokeWidth={24}
                pointerEvents="stroke"
                role="tab"
                aria-selected={i === aktiv}
                aria-label={`${ziffer(i)} ${p.titel}`}
                /* Gleichwertig zur Beschriftung fokussierbar. Rollend
                   wie dort: ein Tabstopp für den Ring, Pfeiltasten
                   wandern darin. Acht einzelne Stopps je Darstellung
                   wären sechzehn für acht Punkte. */
                tabIndex={i === tabPunkt ? 0 : -1}
                onKeyDown={(e) => beiTaste(e, i, segRefs)}
                onFocus={() => setAktiv(i)}
                onMouseEnter={() => setAktiv(i)}
                onClick={() => setAktiv(i)}
              />
            ))}
          </svg>

          {/* Monogramm */}

          {/* Beschriftungen — alle waagrecht, in zwei Fluchten */}
          {PUNKTE.map((p, i) => {
            const s = platz(i);
            const an = i === aktiv;
            const gemeinsam: React.CSSProperties = {
              position: "absolute",
              background: "transparent",
              border: "none",
              padding: "4px 2px",
              cursor: "pointer",
              fontFamily: sans,
              fontSize: "var(--tellian-r4-label-size)",
              lineHeight: 1.3,
              color: an ? "var(--tellian-r4-ink)" : "var(--tellian-r4-ink-dim)",
              transition: "color 200ms ease",
              whiteSpace: "normal",
            };

            const x = `calc(50% + ${s.dx.toFixed(4)} * var(--tellian-r4-wheel))`;
            const y = `calc(50% + ${s.dy.toFixed(4)} * var(--tellian-r4-wheel))`;

            const lage: React.CSSProperties = s.oben
              ? {
                  left: x,
                  top: y,
                  /* Über den Ankerpunkt gesetzt, damit die Zeile nicht
                     auf den Ring fällt. */
                  transform: "translate(-50%, -100%)",
                  textAlign: "center",
                  maxWidth: "var(--tellian-r4-label-col)",
                }
              : s.unten
                ? {
                    left: x,
                    top: y,
                    transform: "translate(-50%, 0)",
                    textAlign: "center",
                    maxWidth: "var(--tellian-r4-label-col)",
                  }
                : s.rechts
                  ? {
                      left: x,
                      top: y,
                      transform: "translate(0, -50%)",
                      textAlign: "left",
                      maxWidth: "var(--tellian-r4-label-col)",
                    }
                  : {
                      left: x,
                      top: y,
                      transform: "translate(-100%, -50%)",
                      textAlign: "right",
                      maxWidth: "var(--tellian-r4-label-col)",
                    };

            return (
              <button
                key={p.titel}
                ref={(el) => {
                  knopfRefs.current[i] = el;
                }}
                type="button"
                role="tab"
                aria-selected={an}
                /* Ein Tabstopp für die ganze Gruppe; Pfeiltasten
                   wandern darin. Acht einzelne Stopps wären für ein
                   Auswahlrad die falsche Bedienung. */
                tabIndex={i === tabPunkt ? 0 : -1}
                onKeyDown={(e) => beiTaste(e, i, knopfRefs)}
                onMouseEnter={() => setAktiv(i)}
                onFocus={() => setAktiv(i)}
                onClick={() => setAktiv(i)}
                className="tellian-r4-punkt"
                style={{ ...gemeinsam, ...lage }}
              >
                <span
                  style={{
                    fontFamily: cormorant,
                    fontSize: "var(--tellian-r4-numeral-size)",
                    color: "var(--tellian-r4-accent)",
                    letterSpacing: "0.08em",
                    marginRight: "8px",
                  }}
                >
                  {ziffer(i)}
                </span>
                {p.titel}
              </button>
            );
          })}
        </div>

        {/* ══ Erklärung ══ */}
        <div
          style={{
            position: "absolute",
            left: "var(--tellian-r4-block-center)",
            transform: "translateX(-50%)",
            top: "calc(50% + var(--tellian-r4-wheel) / 2 + var(--tellian-r4-label-row) + var(--tellian-r4-box-gap))",
            width: "var(--tellian-r4-box-width)",
            maxWidth: "100%",
          }}
        >
          {erklaerung}
        </div>
      </div>

      <style>{`
        @keyframes tellianR4Zeichnen {
          from { stroke-dashoffset: ${bogenlaenge}; }
          to   { stroke-dashoffset: 0; }
        }
      `}</style>
      {stil}
    </div>
  );
}
