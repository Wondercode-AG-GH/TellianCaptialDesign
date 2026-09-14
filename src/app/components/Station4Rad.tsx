import { useCallback, useEffect, useRef, useState } from "react";

import { C, cormorant, sans, serif } from "../tokens";
import { Aufgang, Kapitelmarke } from "./MobilSektion";
import { useSectionEntered } from "./SectionEntry";
import { useTitelHoehe } from "./useTitelHoehe";

/* ═══════════════════════════════════════════════════════════
   STATION 03 — IHRE VORTEILE (hell)

   TAUSCH 14.09: mit Wealth Management getauscht, steht neu an
   Position 03 auf HELLER Fläche — die Farbwerte hängen zentral an
   den r4-Tokens (theme.css), die Akzentspur an der tiefen
   Goldstufe.

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
   Eine Farbänderung allein trägt zu wenig. Die
   Fläche ist der Unterschied, den man aus dem Augenwinkel sieht.
   ═══════════════════════════════════════════════════════════ */

interface Punkt {
  titel: string;
  text: string;
}

interface StationInhalt {
  titel: readonly [string, string];
  untertitel: string;
  punkte: readonly Punkt[];
}

/* Vier Punkte statt acht — die Texte sind die bereits final
   eingepflegten aus dem Redesign (P1: i18n-Keys weiterverwendet). */
const INHALT: Readonly<Record<"DE" | "EN" | "FR", StationInhalt>> = {
  DE: {
    titel: ["Tellian", "Ihre Vorteile"],
    untertitel: "Was Sie von uns erwarten dürfen.",
    punkte: [
      { titel: "Expertise", text: "Unsere Erfahrung und ein klarer Investmentprozess helfen uns, komplexe Märkte einzuordnen und Ihr Vermögen gezielt über Anlageklassen und Kapitalmärkte hinweg auszurichten. Diese Expertise bringen wir seit vielen Jahren auch als Jurymitglied der Swiss ETF Awards ein." },
      { titel: "Unabhängigkeit", text: "Wir sind weder an eigene Produkte noch an eine bestimmte Depotbank gebunden. So wählen wir Anlagen und Lösungen frei, objektiv und ausschliesslich in Ihrem Interesse." },
      { titel: "Transparenz", text: "Sie behalten jederzeit den Überblick über Ihr Vermögen. Klare Portfoliostrukturen und transparent ausgewiesene Gebühren sorgen für Nachvollziehbarkeit. Eine eigens entwickelte App steht Ihnen für den laufenden Überblick über Ihre Anlagen zur Verfügung. Zum Jahresende erhalten Sie zusätzlich einen auf Ihr Steuerdomizil abgestimmten Steuerauszug." },
      { titel: "Flexibilität", text: "Ihre Bedürfnisse geben die Richtung vor. Individuelle Lösungen, liquide Anlagen und jederzeitige Bezugsmöglichkeiten geben Ihnen die nötige Flexibilität. Ohne Kündigungsfristen bewahren Sie jederzeit Ihre Freiheit." },
    ],
  },
  EN: {
    titel: ["Tellian.", "Your Advantages."],
    untertitel: "What you can expect from us.",
    punkte: [
      { titel: "Expertise", text: "Our experience and disciplined investment process help us navigate complex markets and position your wealth across asset classes and global markets. For many years, we have also contributed this expertise as a member of the Swiss ETF Awards jury." },
      { titel: "Independence", text: "We are not tied to proprietary products or any particular custodian bank. This gives us the freedom to select investments and solutions objectively, with your interests at the centre of every decision." },
      { titel: "Transparency", text: "You retain a clear view of your portfolio, its performance and all associated fees. Our proprietary app provides secure access to your portfolio information whenever required. At year-end, you receive tax documentation tailored to your individual tax domicile." },
      { titel: "Flexibility", text: "Your needs set the direction. Tailored solutions, liquid investments and ready access to your assets provide the flexibility you require. With no notice periods, you retain the freedom to act at any time." },
    ],
  },
  /* TODO-FR: Übersetzung folgt — DE-Text als Platzhalter. */
  FR: {
    titel: ["Tellian", "Ihre Vorteile"],
    untertitel: "Was Sie von uns erwarten dürfen.",
    punkte: [
      { titel: "Expertise", text: "Unsere Erfahrung und ein klarer Investmentprozess helfen uns, komplexe Märkte einzuordnen und Ihr Vermögen gezielt über Anlageklassen und Kapitalmärkte hinweg auszurichten. Diese Expertise bringen wir seit vielen Jahren auch als Jurymitglied der Swiss ETF Awards ein." },
      { titel: "Unabhängigkeit", text: "Wir sind weder an eigene Produkte noch an eine bestimmte Depotbank gebunden. So wählen wir Anlagen und Lösungen frei, objektiv und ausschliesslich in Ihrem Interesse." },
      { titel: "Transparenz", text: "Sie behalten jederzeit den Überblick über Ihr Vermögen. Klare Portfoliostrukturen und transparent ausgewiesene Gebühren sorgen für Nachvollziehbarkeit. Eine eigens entwickelte App steht Ihnen für den laufenden Überblick über Ihre Anlagen zur Verfügung. Zum Jahresende erhalten Sie zusätzlich einen auf Ihr Steuerdomizil abgestimmten Steuerauszug." },
      { titel: "Flexibilität", text: "Ihre Bedürfnisse geben die Richtung vor. Individuelle Lösungen, liquide Anlagen und jederzeitige Bezugsmöglichkeiten geben Ihnen die nötige Flexibilität. Ohne Kündigungsfristen bewahren Sie jederzeit Ihre Freiheit." },
    ],
  },
};

const N = 4;

const ziffer = (i: number) => String(i + 1).padStart(2, "0");


/* ── Geometrie ──
   Segment i liegt bei -90° + i·45°, also 01 oben, dann im
   Uhrzeigersinn. Damit stehen 02–04 rechts, 05 unten, 06–08 links —
   drei, eins, drei, eins, wie gefordert. */
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

/* Das frühere zeitgesteuerte Einzeichnen (Staffel + Session-Latch)
   ist durch das Scrub-Zeichnen ersetzt — s. Effekt im Bauteil. */

interface Props {
  panelRef?: (el: HTMLDivElement | null) => void;
  isVertical?: boolean;
  domId?: string;
  sprache?: "DE" | "EN";
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
  sprache = "DE",
  istAktiv = false,
}: Props) {
  const inhalt = INHALT[sprache];
  const PUNKTE = inhalt.punkte;
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

  /* ── SCRUB-ZEICHNEN (Kundenwunsch 13.09) ──
     Der Ring hängt am SCROLL statt an der Uhr: beim Hineinscrollen
     zeichnet er sich im Uhrzeigersinn zu, beim Zurückscrollen
     öffnet er sich wieder — ein durchlaufender Zug durch die vier
     Segmente (Segment i zeichnet in P ∈ [i/4, (i+1)/4]).

     Die frühere einmalige Keyframe-Staffel (Session-Latch) ist
     damit im breiten Zweig abgelöst: eine Scrub-Kopplung ist per
     Definition umkehrbar und kennt kein «erneut abspielen» — die
     Position IST der Zustand.

     Mechanik ohne React-Arbeit pro Frame: die Segmente tragen
     pathLength=1, geschrieben wird nur ihr stroke-dashoffset über
     Refs. Ein IntersectionObserver (±50 % Fensterbreite) startet
     und stoppt die rAF-Schleife — abseits der Station läuft
     nichts, schmal (isVertical) gar nichts. prefers-reduced-motion
     zeigt den Ring sofort vollständig. */
  const ringRef = useRef<SVGSVGElement | null>(null);
  const zeichenRefs = useRef<(SVGPathElement | null)[]>([]);
  const scrubRafRef = useRef(0);
  const scrubPRef = useRef(-1);

  useEffect(() => {
    if (isVertical) return;
    const svg = ringRef.current;
    if (!svg) return;

    const schreibe = (P: number) => {
      if (Math.abs(P - scrubPRef.current) < 0.0005) return;
      scrubPRef.current = P;
      for (let i = 0; i < N; i++) {
        const el = zeichenRefs.current[i];
        if (!el) continue;
        const p = Math.max(0, Math.min(1, P * N - i));
        el.style.strokeDashoffset = String(1 - p);
      }
    };

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      schreibe(1);
      return;
    }

    let laeuft = false;
    const tick = () => {
      if (!laeuft) return;
      const r = svg.getBoundingClientRect();
      /* 0, wenn der Ring rechts ins Bild tritt; 1, wenn er ganz im
         Bild steht plus einem kurzen Nachlauf (15 % seiner Breite) —
         der Schluss des Kreises fällt so mit dem Ankommen der
         Station zusammen. */
      const P = Math.max(0, Math.min(1, (window.innerWidth - r.left) / (r.width * 1.15)));
      schreibe(P);
      scrubRafRef.current = requestAnimationFrame(tick);
    };
    const io = new IntersectionObserver(
      (eintraege) => {
        const nah = eintraege.some((e) => e.isIntersecting);
        if (nah && !laeuft) {
          laeuft = true;
          scrubRafRef.current = requestAnimationFrame(tick);
        } else if (!nah && laeuft) {
          laeuft = false;
          cancelAnimationFrame(scrubRafRef.current);
        }
      },
      { rootMargin: "0px 50% 0px 50%" },
    );
    io.observe(svg);
    return () => {
      io.disconnect();
      cancelAnimationFrame(scrubRafRef.current);
      laeuft = false;
    };
  }, [isVertical]);

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
        /* P2.3: eckig, 1px-Hairline im Mushroom-Ton — das
           Formenvokabular der Seite, keine weiche Rundung. */
        border: "1px solid rgba(184, 174, 163, 0.35)",
        borderRadius: 0,
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
              lineHeight: "var(--tellian-zwischen-lh)" as unknown as number,
              /* P1: der Name des aktiven Punkts in Gold — das dritte
                 Glied der Akzentspur. Auf hellem Grund die TIEFE
                 Goldstufe (4.78:1 auf Archive White, AA). */
              color: "var(--tellian-gold-tief)",
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
    <div>
      <h2
        style={{
          margin: 0,
          fontFamily: serif,
          fontSize: "var(--tellian-r4-heading-size)",
          fontWeight: 400,
          lineHeight: "var(--tellian-r4-heading-leading)" as unknown as number,
          letterSpacing: "var(--tellian-r4-heading-tracking)",
          color: "var(--tellian-r4-ink)",
        }}
      >
        {inhalt.titel[0]}
        <br />
        <em style={{ fontStyle: "italic", fontWeight: "inherit" }}>
          {inhalt.titel[1]}
        </em>
      </h2>
      {/* Untertitel — Zwischentitel-Stufe. P1 (12.09): Gold statt
          Mushroom — er eröffnet die Akzentspur der Station (Bogen,
          Untertitel, Boxtitel). Seit dem Tausch auf hellem Grund
          die TIEFE Goldstufe; der Haupttitel bleibt Tinte. */}
      <p
        style={{
          margin: "12px 0 0",
          fontFamily: serif,
          fontSize: "var(--tellian-r4-unter-size)",
          lineHeight: 1.3,
          color: "var(--tellian-gold-tief)",
        }}
      >
        {inhalt.untertitel}
      </p>
    </div>
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
          paddingTop: "var(--tellian-abschnitt-luft-schmal)",
          paddingBottom: "var(--tellian-abschnitt-luft-schmal)",
          paddingLeft: "clamp(20px, 6vw, 48px)",
          paddingRight: "clamp(20px, 6vw, 48px)",
        }}
      >
        <div style={{ marginBottom: "clamp(28px, 4vh, 44px)" }}>
          <Kapitelmarke nr="03" name="Ihre Vorteile" />
        </div>
        <Aufgang>{kopf}</Aufgang>

        <ol
          style={{
            listStyle: "none",
            margin: "clamp(28px, 4vh, 44px) 0 0",
            padding: 0,
            display: "flex",
            flexDirection: "column",
            gap: "clamp(26px, 3.6vh, 40px)",
          }}
        >
          {PUNKTE.map((p, i) => (
            <li
              key={p.titel}
              style={{
                borderTop: i === 0 ? "none" : "1px solid rgba(25, 23, 24, 0.12)",
                paddingTop: i === 0 ? 0 : "clamp(26px, 3.6vh, 40px)",
              }}
            >
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
                  lineHeight: "var(--tellian-zwischen-lh)" as unknown as number,
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
  const ANKER = 0.505;   /* Anteil der Radbreite, gemessen vom Zentrum */

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
      {/* ══ Die Stationsfläche ══
          Läuft über die VOLLE Stationshöhe, auch hinter beiden
          Bändern — die Station soll randlos wirken. Seit dem Tausch
          (14.09) HELL und flach: der Glanzverlauf gehört den
          dunklen Stationen. */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          backgroundColor: "var(--tellian-r4-bg)",
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
            top: "calc(50% - var(--tellian-r4-mitte-versatz))",
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
            ref={ringRef}
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
                  ref={(el) => {
                    zeichenRefs.current[i] = el;
                  }}
                  className="tellian-r4-seg"
                  d={bogen(i, luecke)}
                  fill="none"
                  strokeLinecap="butt"
                  pointerEvents="none"
                  /* Scrub-Zeichnen: pathLength normiert den Bogen auf
                     1 — der Effekt schreibt nur den dashoffset
                     (1 = leer, 0 = voll). Startwert leer; die
                     Kopplung setzt beim ersten Frame den zur
                     Scroll-Lage passenden Stand. */
                  pathLength={1}
                  strokeDasharray="1"
                  strokeDashoffset={1}
                  stroke={
                    an
                      ? "var(--tellian-r4-arc-active-color)"
                      : "var(--tellian-r4-arc-idle-color)"
                  }
                  strokeWidth={
                    an ? "var(--tellian-r4-arc-active)" : "var(--tellian-r4-arc-idle)"
                  }
                  style={{
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
            top: "calc(50% - var(--tellian-r4-mitte-versatz) + var(--tellian-r4-wheel) / 2 + var(--tellian-r4-label-row) + var(--tellian-r4-box-gap))",
            width: "var(--tellian-r4-box-width)",
            maxWidth: "100%",
          }}
        >
          {erklaerung}
        </div>
      </div>

      {stil}
    </div>
  );
}
