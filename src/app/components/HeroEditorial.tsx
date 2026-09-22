import { useEffect, useState } from "react";

import { sans, serif } from "../tokens";
import type { ImageId } from "../../assets/generated";
import { ResponsiveImage } from "./ResponsiveImage";
import { useSectionEntered } from "./SectionEntry";
import { usePrefersReducedMotion } from "./usePrefersReducedMotion";
import { Aufgang, Kapitelmarke } from "./MobilSektion";

/* ═══════════════════════════════════════════════════════════
   HERO «EDITORIAL A2» — geteilt

   EINE Komponente für beide Hero-Stationen (Hauptseite 01 und
   Solutions S1), konfiguriert über Props — kein Duplikat pro Seite.

   STRUKTUR (Briefing 07.09; der Mock hero_alt_A2_editorial.html lag
   nicht im Repo — Masse nach der schriftlichen Spezifikation):
   — Zweispalter: Hauptseite 50/50, Solutions 42/58; links
     Textzone auf Archive White, rechts das
     Bildpanel RANDLOS an Ober-, Unter- und rechter Stationskante,
     volle Stationshöhe, object-fit cover mit Fokuspunkt.
   — Textgruppe vertikal zentriert: [Eyebrow →] Titel (Lustria,
     clamp(54px, 4.9vw, 80px)) → Hairline (1px, Mushroom 50 %, 44px
     unter dem Titel, 36px über dem Text) → Fliesstext (Inter 15px,
     1.75, Ink), einspaltig.
   — Das Bildpanel trägt data-tellian-bildzone: Kopfzeile und
     Stationsleiste zeichnen darüber ihre ON-IMAGE-Schicht (Archive
     White, Portal-Scrim) — die Zuordnung folgt der Spaltenkante und
     jedem Resize (useBandTon misst die Panels je Frame).
   — MOBILE: Kopfzeile auf Archive White (Standard-Schicht, keine
     Bildzone), Textgruppe zuerst, darunter das Bild volle Breite,
     ~56vh, randlos links/rechts.
   — Eintritt: dieselbe gestaffelte Logik wie bisher (Titel → Text →
     Bild); prefers-reduced-motion zeigt alles sofort.
   ═══════════════════════════════════════════════════════════ */

const ARCHIVE_WHITE = "#F4F4F0";

/* Staffelung wie beim bisherigen Hero: Titel sofort, Text nach
   260ms, Bild nach 120ms. */
const STEP = { titel: 0, text: 260, bild: 120 } as const;

interface Props {
  eyebrow?: string;
  /** Der Titel kommt fertig gesetzt (Umbruch/Kursiv beim Aufrufer). */
  titel: React.ReactNode;
  absaetze: readonly string[];
  /** 50/50 statt 42/58 (Hauptseite seit 18.09). Textzone und
      Bildpanel sind dann gleichberechtigt; der Titel nimmt in der
      schmaleren Zone eine Stufe zurück, das Bild lädt die
      passende Stufe. Seit 22.09 tragen BEIDE Einstiege das
      Merkmal — Capital und Solutions stehen gleich. */
  haelften?: boolean;
  imageId: ImageId;
  imageAlt: string;
  /** object-position des Panels, z. B. "center 42%". */
  fokus?: string;
  hairline?: boolean;
  /** Sprachcode für die Silbentrennung des Fliesstexts. */
  lang?: string;
  isVertical?: boolean;
  /** Schmal: erst nach der Lade-Animation eintreten. */
  bereit?: boolean;
  panelRef?: (el: HTMLDivElement | null) => void;
  domId?: string;
  /** Kapitelmarke des schmalen Zweigs (Solutions «01 …»). */
  marke?: { nr: string; name: string };
  /** P1 Variante A: Deckung des oberen Kontrast-Scrims am obersten
      Stop. Solutions liegt bis zur finalen Tonung auf sehr hellem
      Tagespanorama und bekommt den kräftigeren Wert. */
  scrimOben?: number;
}

export function HeroEditorial({
  eyebrow,
  titel,
  absaetze,
  haelften = false,
  imageId,
  imageAlt,
  fokus = "center 50%",
  hairline = true,
  lang,
  isVertical = false,
  bereit = true,
  panelRef,
  domId,
  marke,
  scrimOben = 0.62,
}: Props) {
  const entered = useSectionEntered();
  const reducedMotion = usePrefersReducedMotion();

  /* Schmal läuft der Eintritt beim Laden (nach dem Ladebildschirm),
     breit beim Betreten — dieselbe Logik wie der bisherige Hero. */
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

  const shown = reducedMotion || (isVertical ? gestartet : entered);
  const enter = (delay: number, distance = 18): React.CSSProperties => ({
    opacity: shown ? 1 : 0,
    transform: shown ? "translateY(0)" : `translateY(${distance}px)`,
    transition: reducedMotion
      ? "none"
      : `opacity 700ms ease-out ${delay}ms, transform 700ms cubic-bezier(0.16, 1, 0.3, 1) ${delay}ms`,
  });

  const eyebrowEl = eyebrow ? (
    <p
      style={{
        margin: "0 0 18px",
        fontFamily: sans,
        fontSize: "12px",
        letterSpacing: "var(--tellian-ls-marker)",
        textTransform: "uppercase",
        color: "var(--tellian-purple)",
        ...enter(STEP.titel),
      }}
    >
      {eyebrow}
    </p>
  ) : null;

  const titelEl = (
    <h1
      style={{
        margin: 0,
        fontFamily: serif,
        /* Der A2-Grad gilt dem Desktop; auf dem Telefon wären 54px
           Minimum breiter als die Spalte («Weiterdenken» ~370px bei
           335px Platz) — dort eine eigene, kleinere Treppe. */
        fontSize: isVertical
          ? "clamp(38px, 10.8vw, 54px)"
          : haelften
            ? "var(--tellian-hero-titel-size-halb)"
            : "var(--tellian-hero-titel-size)",
        fontWeight: 400,
        lineHeight: "var(--tellian-titel-lh)" as unknown as number,
        letterSpacing: "var(--tellian-titel-ls)",
        color: "var(--tellian-ink)",
        ...enter(STEP.titel, 24),
      }}
    >
      {titel}
    </h1>
  );

  const hairlineEl = hairline ? (
    <span
      aria-hidden
      style={{
        display: "block",
        /* Referenz 900er Fenster: 44/36 — flachere Fenster geben
           anteilig Luft ab (P4; der EN-Hero brauchte sie unten).
           Schmal (Ein-Screen-Bühne, 14.09) eine kompaktere Stufe. */
        marginTop: isVertical ? "clamp(16px, 2.4vh, 26px)" : "clamp(24px, 4.9vh, 44px)",
        marginBottom: isVertical ? "clamp(14px, 2vh, 22px)" : "clamp(20px, 4vh, 36px)",
        width: "100%",
        height: "1px",
        backgroundColor: "rgba(184, 174, 163, 0.5)",
        ...enter(STEP.text, 0),
      }}
    />
  ) : (
    /* Ohne Linie trennt allein der Abstand. Er kommt aus der
       Abstandsskala (Titel → Fliesstext, 32-48px) plus dem
       Blockmass für die Hälften-Aufteilung: gemessen rund 56px auf
       einem 900er Fenster, wie beauftragt. */
    <span
      aria-hidden
      style={{
        display: "block",
        /* Titel → Fliesstext: die Summe aus Titelabstand und
           Absatzabstand der Skala ergibt auf einem 900er Fenster
           gemessene 56px — der beauftragte Wert, ohne eine neue
           Einzelzahl einzuführen. */
        height: haelften && !isVertical
          ? "calc(var(--tellian-abstand-titel) + var(--tellian-abstand-absatz))"
          : "var(--tellian-abstand-titel)",
      }}
    />
  );

  /* Fliesstext einspaltig (18.09). Zwei Spalten waren bei 42/58
     noch vertretbar; bei halber Stationsbreite blieben unter 35
     Zeichen je Zeile — das erzeugt zerrissene Umbrüche.

     LESEBREITE: Der Auftrag nennt 62ch. Die ch-Einheit misst die
     Breite der Null, und die ist in Inter deutlich breiter als das
     Durchschnittszeichen — 62ch ergäben gemessen bis zu 78 Zeichen
     je Zeile. Bindend ist die Prüfgrösse des Auftrags: 55-70
     Zeichen. Der Deckel steht deshalb bei 52ch.

     NACHGEMESSEN (wortgenau, 1440px): DE 62-68, EN 61-71 Zeichen je
     voller Zeile. Die eine EN-Zeile mit 71 ist bewusst in Kauf
     genommen: bei 49ch läge sie bei 67, dafür bräche die DEUTSCHE
     Fassung dann mit «und FINMA-lizenziert.» allein auf der
     Schlusszeile — genau der Umbruch, den der Auftrag ausschliesst.
     Eine Breite kann nicht beide Sprachen optimal brechen; die
     Waisenzeile wiegt schwerer als ein Zeichen Überlänge.

     text-wrap: pretty verhindert die Waisenzeile — in der EN-Fassung
     stand «manager.» allein am Absatzende. Browser ohne Unterstützung
     ignorieren die Angabe; der Umbruch bleibt dort wie bisher. */
  const textEl = (breit: boolean) => (
    <div
      lang={lang}
      style={{
        display: "block",
        maxWidth: breit && haelften ? "52ch" : undefined,
        ...enter(STEP.text),
      }}
    >
      {absaetze.map((a, i) => (
        <p
          key={a.slice(0, 24)}
          style={{
            margin: i === 0 ? 0 : breit && haelften ? "22px 0 0" : "1em 0 0",
            fontFamily: sans,
            fontSize: "var(--tellian-lauf-size)",
            lineHeight: "var(--tellian-lauf-lh)" as unknown as number,
            color: "var(--tellian-ink)",
            ...(breit && haelften
              ? ({ textWrap: "pretty" } as React.CSSProperties)
              : null),
          }}
        >
          {a}
        </p>
      ))}
    </div>
  );

  /* ── SCHMAL: Kopfzeile auf Archive White, Text zuerst, Bild
     darunter volle Breite (~56vh), randlos links/rechts. ── */
  if (isVertical) {
    /* EINE BÜHNE (Kundenwunsch 14.09): der Hero endet mit dem
       sichtbaren Viewport. Der Textblock steht oben (kompaktere
       Lüfte als zuvor), das Bild nimmt den RESTRAUM der Bühne ein
       — vorher stand es fix auf 56vh unter dem Ergebnistext und
       brach zwangsläufig an der Falz. minHeight statt fester
       Bildhöhe: läuft der Text auf kleinen Geräten oder in der
       EN-Fassung länger, wächst die Bühne und scrollt normal,
       statt das Bild auf einen Streifen zu quetschen. */
    return (
      <section
        id={domId}
        className="tellian-hero-schmal"
        style={{ backgroundColor: ARCHIVE_WHITE }}
      >
        <div
          style={{
            flexShrink: 0,
            paddingTop: "calc(var(--tellian-kopfzeile-schmal) + clamp(16px, 2.4vh, 28px))",
            paddingBottom: "clamp(18px, 2.6vh, 32px)",
            paddingLeft: "var(--tellian-rand-schmal)",
            paddingRight: "var(--tellian-rand-schmal)",
          }}
        >
          {marke && (
            <div style={{ marginBottom: "clamp(18px, 2.6vh, 32px)" }}>
              <Kapitelmarke nr={marke.nr} name={marke.name} />
            </div>
          )}
          <Aufgang>
            {eyebrowEl}
            {titelEl}
            {hairlineEl}
            {textEl(false)}
          </Aufgang>
        </div>
        <div
          style={{
            flex: "1 1 auto",
            minHeight: "200px",
            overflow: "hidden",
            /* Das Bild liegt ABSOLUT im Restraum: die Bühne hat nur
               min-height, damit gilt die Flex-Höhe für Prozent-
               Kinder als unbestimmt — ein height:100% lief auf die
               intrinsische Bildhöhe hinaus und liess die Falz offen. */
            position: "relative",
          }}
        >
          <ResponsiveImage
            id={imageId}
            alt={imageAlt}
            sizes="100vw"
            priority
            objectPosition={fokus}
            style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
          />
        </div>
      </section>
    );
  }

  /* ── BREIT: 50/50 (Hauptseite) bzw. 42/58 (Solutions), Bild
     randlos an drei Kanten. ── */
  return (
    <div
      ref={panelRef}
      className="flex-shrink-0 h-screen relative"
      style={{ width: "100vw", backgroundColor: ARCHIVE_WHITE }}
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns: haelften ? "50fr 50fr" : "42fr 58fr",
          height: "100%",
        }}
      >
        {/* ══ Textzone — Gruppe vertikal zentriert ══ */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            paddingLeft: "clamp(48px, 6.7vw, 96px)",
            paddingRight: "clamp(40px, 5.6vw, 80px)",
            paddingTop: "var(--tellian-kopf-height)",
            paddingBottom: "var(--tellian-station-height)",
            boxSizing: "border-box",
            minWidth: 0,
          }}
        >
          <div style={{ minWidth: 0, width: "100%" }}>
            {eyebrowEl}
            {titelEl}
            {hairlineEl}
            {textEl(true)}
          </div>
        </div>

        {/* ══ Bildpanel — randlos oben, unten, rechts; volle
            Stationshöhe. data-tellian-bildzone schaltet die Bänder
            darüber auf die ON-IMAGE-Schicht. ══ */}
        <div
          data-tellian-bildzone
          style={{ position: "relative", height: "100%", overflow: "hidden", ...enter(STEP.bild, 0) }}
        >
          <ResponsiveImage
            id={imageId}
            alt={imageAlt}
            sizes={haelften ? "50vw" : "58vw"}
            priority
            objectPosition={fokus}
            className="w-full h-full"
            style={{ display: "block", width: "100%", height: "100%" }}
          />
          {/* ── LESBARKEITS-SCRIM ──
              Kopfzeile und Stationsleiste schreiben über dem Bild in
              Archive White. Auf hellen Motiven (Solutions-Panorama,
              der helle Vorplatz unter dem Opernhaus) verschwand die
              Schrift darin. Zwei Verläufe an Ober- und Unterkante
              tragen sie — sie beginnen transparent und liegen NUR in
              den Bandhöhen; das Motiv selbst bleibt unangetastet
              (keine Tonung, TODO-BILD-TONUNG davon unberührt). */}
          <span
            aria-hidden
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              top: 0,
              height: "130px",
              background:
                `linear-gradient(to bottom, rgba(40, 31, 51, ${scrimOben}) 0%,` +
                ` rgba(40, 31, 51, ${(scrimOben * 0.45).toFixed(3)}) 45%,` +
                " rgba(40, 31, 51, 0) 100%)",
              pointerEvents: "none",
            }}
          />
          <span
            aria-hidden
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              bottom: 0,
              height: "calc(var(--tellian-station-height) + 88px)",
              background:
                "linear-gradient(to top, rgba(40, 31, 51, 0.94) 0%," +
                " rgba(40, 31, 51, 0.82) 38%, rgba(40, 31, 51, 0) 100%)",
              pointerEvents: "none",
            }}
          />
        </div>
      </div>
    </div>
  );
}
