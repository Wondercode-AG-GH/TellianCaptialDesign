import { useEffect, useState } from "react";

import { C, sans, serif } from "../tokens";
import { SECTION_WIDTH } from "../sections";
import { useSectionEntered } from "./SectionEntry";
import { usePrefersReducedMotion } from "./usePrefersReducedMotion";
import { ResponsiveImage } from "./ResponsiveImage";
import type { ImageId } from "../../assets/generated";

/* ═══════════════════════════════════════════════════════════
   STATION 1 — EINSTIEG

   Bühne zwischen Schiene und Stationsleiste: links die Textspalte,
   rechts ein Bildpanel im Format 4:5.

   Das Panel wird NICHT im Browser beschnitten. Der Ausschnitt entsteht
   in der Bildaufbereitung (scripts/optimize-images.mjs); hier wird die
   Fläche nur im richtigen Verhältnis aufgespannt und das fertige Motiv
   hineingelegt. Ein zweiter Beschnitt über object-fit würde den
   abgenommenen Bildausschnitt wieder verändern.

   Die Fläche ist von Anfang an in Mushroom reserviert. Fehlt das
   Motiv, bleibt sie stehen und die Station ist vollständig lesbar —
   kein Layoutsprung, kein Loch.
   ═══════════════════════════════════════════════════════════ */

/* ── INHALTE, WÖRTLICH AUS DEM REDESIGN-BRIEFING ──
   Es gibt kein zentrales i18n-System: der DE/EN-Schalter in der
   Kopfzeile ist ein useState in App.tsx, den bisher kein Inhalt las.
   Diese Struktur hängt Station 1 an genau diesen Schalter. Wächst
   die Mehrsprachigkeit über den Hero hinaus, gehört sie in ein
   eigenes Modul — nicht in jede Station einzeln. */
interface HeroInhalt {
  /** Zwei Zeilen; die zweite steht kursiv, wie im bisherigen Satz. */
  titel: readonly [string, string];
  lead: readonly string[];
}

const INHALT: Readonly<Record<"DE" | "EN" | "FR", HeroInhalt>> = {
  DE: {
    titel: ["Weiterdenken", "mit Erfahrung"],
    lead: [
      "Tellian Capital AG begleitet Privatpersonen, Unternehmerfamilien und Stiftungen bei der langfristigen Entwicklung ihres Vermögens. Wir sind seit 1996 in Zürich verwurzelt, unabhängig und FINMA-lizenziert.",
      "Wir verbinden 30 Jahre fundierte Markterfahrung mit einer zukunftsorientierten Ausrichtung. Wir stehen für eine moderne und transparente Vermögensverwaltung, die Tradition und neue Impulse nahtlos miteinander vereint.",
    ],
  },
  EN: {
    titel: ["Looking Ahead.", "Built on Experience."],
    lead: [
      "Tellian Capital AG provides independent wealth management for private clients, entrepreneurial families and foundations. With deep roots in Zurich since 1996, we are an independent, FINMA-licensed asset manager.",
      "With 30 years of investment experience, we support our clients in preserving, developing and successfully positioning their wealth for the long term. Our approach combines proven investment principles with a forward-looking perspective on markets and opportunities. Personal service, transparency and sound decision-making are at the heart of everything we do.",
    ],
  },
  /* TODO-FR: Übersetzung folgt — bis dahin steht der DE-Text als
     Platzhalter, damit die Struktur den dritten Schlüssel schon
     trägt und beim Nachliefern nur Text getauscht wird. */
  FR: {
    titel: ["Weiterdenken", "mit Erfahrung"],
    lead: [
      "Tellian Capital AG begleitet Privatpersonen, Unternehmerfamilien und Stiftungen bei der langfristigen Entwicklung ihres Vermögens. Wir sind seit 1996 in Zürich verwurzelt, unabhängig und FINMA-lizenziert.",
      "Wir verbinden 30 Jahre fundierte Markterfahrung mit einer zukunftsorientierten Ausrichtung. Wir stehen für eine moderne und transparente Vermögensverwaltung, die Tradition und neue Impulse nahtlos miteinander vereint.",
    ],
  },
};

/* Staffelung des Eintritts. Zusammen unter 650ms, damit die Station
   steht, bevor jemand weiterscrollt. */
const STEP = { title: 0, lead: 260, panel: 120 } as const;
const DURATION = 460;

interface Props {
  panelRef?: (el: HTMLDivElement | null) => void;
  /** Schmaler Zweig: dieselben Bausteine, gestapelt. */
  isVertical?: boolean;
  /** Schmal: erst wenn der Ladebildschirm weg ist, läuft der
   *  Eintritt — sonst spielt er dahinter und ist vorbei. */
  bereit?: boolean;
  /** Sprache aus dem Schalter der Kopfzeile. */
  sprache?: "DE" | "EN";
  /**
   * Motiv für das Bildpanel. Fehlt es, bleibt die reservierte Fläche
   * stehen — die Station bleibt vollständig.
   */
  imageId?: ImageId;
  imageAlt?: string;
  /**
   * Schmaler Zweig: flacher Bandausschnitt desselben Motivs. Der
   * 4:5-Ausschnitt wäre über die volle Fensterbreite 488px hoch und
   * schöbe den Titel unter den Falz. Fehlt er, nimmt der schmale
   * Zweig das hohe Motiv.
   */
  bandImageId?: ImageId;
}

export function Station1Einstieg({
  panelRef,
  isVertical = false,
  bereit = true,
  sprache = "DE",
  imageId,
  imageAlt = "",
  bandImageId,
}: Props) {
  const entered = useSectionEntered();
  const reducedMotion = usePrefersReducedMotion();
  /* SCHMAL LÄUFT DER EINTRITT BEIM LADEN, NICHT BEIM BETRETEN
     Im vertikalen Zweig gibt es keinen SectionEnteredProvider —
     `entered` bliebe dauerhaft false. Der Hero ist dort aber das
     Erste, was man sieht; er braucht kein Betreten, sondern den
     Moment, in dem der Ladebildschirm weggefahren ist.

     Zwei Frames Abstand, aus demselben Grund wie auf der Unterseite:
     ein CSS-Übergang braucht einen Ausgangszustand, der vorher im
     DOM stand. Ohne das steht alles sofort da. */
  const [gestartet, setGestartet] = useState(false);
  useEffect(() => {
    if (!isVertical || !bereit) {
      setGestartet(false);
      return;
    }
    let zweiter = 0;
    const erster = requestAnimationFrame(() => {
      zweiter = requestAnimationFrame(() => setGestartet(true));
    });
    return () => {
      cancelAnimationFrame(erster);
      cancelAnimationFrame(zweiter);
    };
  }, [isVertical, bereit]);

  const shown = isVertical ? gestartet || reducedMotion : entered || reducedMotion;

  /** Eintritt eines Elements — bei reduzierter Bewegung sofort. */
  const enter = (delay: number, distance = 18) => ({
    opacity: shown ? 1 : 0,
    transform: shown ? "translateY(0)" : `translateY(${distance}px)`,
    transition: reducedMotion
      ? "none"
      : `opacity ${DURATION}ms ease-out ${delay}ms,` +
        ` transform ${DURATION}ms cubic-bezier(0.16,1,0.3,1) ${delay}ms`,
  });


  /* ── Bausteine ──
     Beide Zweige benutzen dieselben Stücke. Der schmale unterschied
     sich vorher in EINER eigenen Komponente (HeroVertical) mit
     anderem Titel, anderem Text, anderem Bild und anderer Schrift —
     das war kein Umbruch, sondern eine zweite Seite. */

  const inhalt = INHALT[sprache];

  const titel = (
    <h1
      style={{
        margin: 0,
        /* Lustria — Titelschrift der Marke. Die übrigen Stationen
           bleiben bis zu ihrem Redesign bei Cormorant. */
        fontFamily: serif,
        fontSize: "var(--tellian-s1-title-size)",
        fontWeight: "var(--tellian-s1-title-weight)" as unknown as number,
        lineHeight: "var(--tellian-s1-title-leading)" as unknown as number,
        letterSpacing: "var(--tellian-s1-title-tracking)",
        color: C.ink,
        ...enter(STEP.title, 24),
      }}
    >
      {inhalt.titel[0]}
      <br />
      <em style={{ fontStyle: "italic", fontWeight: "inherit" }}>
        {inhalt.titel[1]}
      </em>
    </h1>
  );


  /* Standfirst — zwei Spalten.
     Kein CSS-columns: die beiden Absätze sind gesetzt, nicht
     umbrochen. Bei 200 % Zoom oder im Französischen, wo der Text
     rund 40 % länger wird, bricht das Raster auf eine Spalte um,
     statt das Zeilenmass zu unterschreiten. Auf dem Telefon greift
     genau derselbe Umbruch — deshalb braucht der schmale Zweig hier
     keine eigene Regel. */
  const flieSStext = (schmal: boolean) => (
    <div
      style={{
        /* Einfacher Abstand — die Haarlinie, deren Platz der doppelte
           Wert freihielt, ist seit dem Redesign weg. */
        marginTop: "var(--tellian-abstand-titel)",
        /* Schrift MUSS hier gesetzt sein: `ch` löst gegen die Schrift
           des Elements auf, an dem es steht. Ohne das rechnet der
           Container mit der geerbten Schrift und das Zeilenmass fällt
           rund 15 % zu breit aus — die zweite Spalte passt dann nicht
           mehr und das Raster klappt um. */
        fontFamily: sans,
        fontSize: "var(--tellian-s1-lead-size)",
        display: "grid",
        gridTemplateColumns:
          "repeat(auto-fit, minmax(min(var(--tellian-s1-lead-measure), 100%), 1fr))",
        gap: "var(--tellian-s1-lead-gap)",
        maxWidth: "calc(var(--tellian-s1-lead-measure) * 2 + var(--tellian-s1-lead-gap))",
        ...enter(STEP.lead),
      }}
    >
      {inhalt.lead.map((text, i) => (
        <p
          key={i}
          style={{
            margin: 0,
            fontFamily: sans,
            fontSize: "var(--tellian-s1-lead-size)",
            lineHeight: "var(--tellian-s1-lead-leading)" as unknown as number,
            color: C.accent,
            /* KEIN eigener Deckel je Absatz mehr. Er stammte aus der
               Zeit, in der die Rasterspalte breiter werden konnte als
               das Zeilenmass. Heute deckelt das Raster selbst
               (maxWidth = 2×Mass+Gap); einspaltig — unter rund 1430px
               Fensterbreite — ist die Spalte 470 bis 590px breit,
               also 63 bis 79 Zeichen. Der alte Deckel halbierte sie
               dort auf 18em, der Text stapelte sich hoch und lief
               oben in die Kopfzeile und unten in die Stationsleiste
               (gemessen −28 bis −31px bei 1024 und 1280, EN). */
          }}
        >
          {text}
        </p>
      ))}
    </div>
  );

  /* DER KNOPF IST WEG — REDESIGN.
     "Gespräch vereinbaren" entfällt auf Station 1 ersatzlos; der Weg
     zum Kontakt läuft über die Stationsleiste und Station 6. Der
     Text existiert weiter in CtaButton und auf den Unterseiten —
     dort ist er nicht Teil dieses Auftrags. */

  /* ══ Bildpanel — exakt 3:2 ══
     Das Panel wird NICHT im Browser beschnitten; der Ausschnitt kommt
     aus der Bildaufbereitung. Die Fläche steht in Mushroom, bevor das
     Motiv da ist, und bleibt stehen, wenn es fehlt. */
  const bildpanel = (breit: boolean) => {
    const motiv = breit ? imageId : (bandImageId ?? imageId);
    /* Aus dem Token, nicht doppelt gepflegt — hier stand "3 / 2"
       fest, während theme.css schon einen eigenen Wert führte. */
    const verhaeltnis =
      breit || !bandImageId ? "var(--tellian-s1-panel-ratio)" : "9 / 5";
    return (
      <div
        style={{
          width: "100%",
          aspectRatio: verhaeltnis,
          maxHeight: breit ? "100%" : undefined,
          backgroundColor: "var(--tellian-s1-panel-placeholder)",
          overflow: "hidden",
          ...enter(STEP.panel, 20),
        }}
      >
        {motiv && (
          <ResponsiveImage
            id={motiv}
            alt={imageAlt}
            /* Breit misst das Panel gemessen 33 bis 35 % der
               Fensterbreite, schmal die volle. */
            sizes={breit ? "34vw" : "100vw"}
            priority
            className="w-full h-full"
            style={{ display: "block" }}
          />
        )}
      </div>
    );
  };

  /* ── SCHMAL (Tablet / Telefon) ──
     Reihenfolge wie in der alten Fassung, die strukturell besser
     stand: erst das Bild als Band über die volle Breite, dann der
     Textblock. Der Falz zeigt damit Bild, Titel und Standfirst
     zusammen, statt einen Text, dem ein hohes Bild hinterherhängt. */
  if (isVertical) {
    return (
      <section id="section-hero" style={{ backgroundColor: C.bg }}>
        {/* Randlos: das Band reicht von Kante zu Kante, wie die
            Purpurfläche in Station 2. Ein Bild mit Aussenabstand auf
            drei Seiten liest sich als hineingelegter Kasten. */}
        <div style={{ paddingTop: "var(--tellian-kopfzeile-schmal)" }}>
          {bildpanel(false)}
        </div>

        <div
          style={{
            paddingTop: "var(--tellian-abschnitt-luft-schmal)",
            paddingBottom: "var(--tellian-abschnitt-luft-schmal)",
            /* 6vw ergab bei 768px Fenster 46px je Seite. Damit blieben
               676px übrig — vier weniger, als die zweispaltige
               Lead-Grid braucht (2 × 22em + 24px = 684px). Sie klappte
               auf eine Spalte um, der Text stand 330px breit neben
               einem 676px breiten Knopf. */
            paddingLeft: "clamp(20px, 4vw, 40px)",
            paddingRight: "clamp(20px, 4vw, 40px)",
          }}
        >
          {titel}
          {flieSStext(true)}
        </div>
      </section>
    );
  }

  return (
    <div
      ref={panelRef}
      className="flex-shrink-0 h-screen relative"
      style={{ width: SECTION_WIDTH, backgroundColor: C.bg }}
    >
      {/* Bühne — zwischen den beiden festen Bändern, senkrecht zentriert */}
      <div
        style={{
          /* Nur die TEXTBÜHNE weicht den beiden Bändern aus. */
          position: "absolute",
          top: "var(--tellian-kopf-height)",
          bottom: "var(--tellian-station-height)",
          left: 0,
          right: 0,
          paddingTop: "var(--tellian-s1-stage-pad)",
          paddingBottom: "var(--tellian-s1-stage-pad)",
          /* Die Schiene liegt fixed über dem Track und nimmt keinen
             Platz im Fluss. Ihre Breite muss die Bühne selbst
             freihalten, sonst beginnt der Titel unter ihr. */
          paddingLeft: "calc(var(--tellian-rail-width) + var(--tellian-station-pad-x))",
          paddingRight: "var(--tellian-station-pad-x)",
          display: "flex",
          alignItems: "center",
          gap: "clamp(32px, 5vw, 96px)",
          boxSizing: "border-box",
        }}
      >
        {/* ══ Textspalte ══ */}
        <div style={{ flex: "1 1 0", minWidth: 0 }}>
          {titel}
          {flieSStext(false)}
        </div>

        {/* Die Panelbreite ist gedeckelt: rund ein Drittel der
            Station, und nie mehr, als die Resthöhe im Verhältnis 4:5
            zulässt. Ohne den zweiten Deckel nimmt das Panel auf hohen
            Fenstern so viel Breite, dass der Standfirst seine zweite
            Spalte verliert. */}
        <div
          style={{
            flex: "0 0 var(--tellian-s1-panel-width)",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-end",
          }}
        >
          {bildpanel(true)}
        </div>
      </div>
    </div>
  );
}
