import { C, cormorant, sans } from "../tokens";
import { useEffect, useState } from "react";
import { usePrefersReducedMotion } from "./usePrefersReducedMotion";

/* ═══════════════════════════════════════════════════════════
   UNTERSEITE — MIT METHODE GEMEINSAM ZUM ZIEL

   Alles auf einen Blick: die ganze Seite passt auf einen Bildschirm,
   ohne zu scrollen. Deshalb je Schritt genau eine Zeile — die Seite
   trägt über Grösse und Abstand, nicht über Menge.

   WARUM EINE DURCHGEHENDE LINIE
   Fünf Kästchen nebeneinander lesen sich als Aufzählung. Eine Linie,
   auf der die Ziffern sitzen, macht daraus einen Weg. Senkrechte
   Trennlinien fehlen bewusst: mit ihnen wäre es eine Tabelle.

   WARUM DIE TITEL EINWORTIG SIND
   Fünf gleich kurze Titel geben dem Raster Ruhe. Unterschiedlich
   lange Überschriften haben es vorher zerrissen — nicht wieder
   verlängern.
   ═══════════════════════════════════════════════════════════ */

interface Schritt {
  titel: string;
  zeile: string;
}

const SCHRITTE: readonly Schritt[] = [
  { titel: "Ziele", zeile: "Was Ihr Vermögen leisten soll." },
  { titel: "Risikoprofil", zeile: "Wie viel Schwankung tragbar ist." },
  { titel: "Selektion", zeile: "Modelle filtern das Anlageuniversum." },
  { titel: "Allokation", zeile: "Strategisch langfristig, taktisch laufend." },
  { titel: "Verwaltung", zeile: "Überwacht, angepasst, quartalsweise berichtet." },
];

const ziffer = (i: number) => String(i + 1).padStart(2, "0");

/* ── Eintritt ──
   Die fünf Schritte kommen nacheinander, 01 zuerst. Die Linie
   zeichnet sich dabei mit: sie startet zusammen mit 01 und ist fertig,
   wenn 05 steht — dadurch liest man einen Weg, der entsteht, und nicht
   fünf Kästchen, die aufpoppen. */
/* Eingependelt: 130ms lasen sich als EIN Vorgang, 400ms zogen sich.
   Bei 260ms sieht man die fünf Schritte einzeln kommen, ohne auf sie
   zu warten — der ganze Durchlauf dauert rund 1.7 statt 2.4
   Sekunden. */
const STUFE_MS = 260;   /* Abstand zwischen zwei Schritten */
const DAUER_MS = 520;
/* Vorlauf: die Hülle der Unterseite blendet sich selbst über 400ms
   ein. Ohne den Vorlauf liefe 01 währenddessen und ginge verloren. */
const VORLAUF_MS = 200;
/* Steht zweimal: als Abstand zwischen zwei Schritten und als
   Rechengrösse für die Länge der Verbindungslinie. */
const SCHRITT_ABSTAND = "clamp(26px, 5vh, 48px)";
const LINIE_MS = 4 * STUFE_MS + DAUER_MS;

interface Props {
  isMobile?: boolean;
  /** true, sobald die Unterseite offen ist. Die Hülle bleibt im DOM
   *  stehen; ohne dieses Signal liefe die Staffelung beim Laden der
   *  Startseite ab, also unsichtbar, und wäre beim Öffnen vorbei. */
  aktiv?: boolean;
}

export function UnterseiteAnlageprozess({ isMobile = false, aktiv = true }: Props) {
  const reducedMotion = usePrefersReducedMotion();

  /* NICHT direkt an `aktiv` hängen.
     Beim Neuladen auf /vermoegensverwaltung ist `aktiv` schon im
     ersten Render true. Ein CSS-Übergang braucht aber einen
     Ausgangszustand, der vorher im DOM stand — sonst steht alles
     sofort da und es passiert nichts. Zwei Frames Abstand: der erste
     rendert den Ausgangszustand, der zweite löst aus. */
  const [gestartet, setGestartet] = useState(false);
  useEffect(() => {
    if (!aktiv) {
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
  }, [aktiv]);

  const gezeigt = gestartet || reducedMotion;

  /** Eintritt eines Schritts — bei reduzierter Bewegung sofort. */
  const stufe = (i: number): React.CSSProperties => ({
    opacity: gezeigt ? 1 : 0,
    transform: gezeigt ? "translateY(0)" : "translateY(10px)",
    transition: reducedMotion
      ? "none"
      : `opacity ${DAUER_MS}ms ease-out ${VORLAUF_MS + i * STUFE_MS}ms,` +
        ` transform ${DAUER_MS}ms cubic-bezier(0.16,1,0.3,1) ${VORLAUF_MS + i * STUFE_MS}ms`,
  });
  const titel = (
    <h1
      style={{
        margin: 0,
        textAlign: isMobile ? "left" : "center",
        fontFamily: cormorant,
        fontSize: "var(--tellian-u1-title-size)",
        fontWeight: 300,
        lineHeight: "var(--tellian-u1-title-leading)" as unknown as number,
        letterSpacing: "-0.015em",
        color: C.ink,
      }}
    >
      Mit Methode gemeinsam{isMobile ? <br /> : " "}
      <em style={{ fontStyle: "italic", fontWeight: "inherit" }}>zum Ziel.</em>
    </h1>
  );

  const zifferStil: React.CSSProperties = {
    fontFamily: cormorant,
    fontSize: "var(--tellian-u1-num-size)",
    fontWeight: 300,
    lineHeight: 1,
    letterSpacing: "0.04em",
    color: "var(--tellian-u1-num-color)",
    /* Trägt den Hintergrund mit, damit die Linie nicht durch die
       Ziffer läuft — sie soll frei darauf stehen. */
    backgroundColor: C.bg,
    position: "relative",
    display: "inline-block",
  };

  const schrittTitel = (t: string) => (
    <span
      style={{
        display: "block",
        fontFamily: cormorant,
        fontSize: "var(--tellian-u1-step-title-size)",
        fontWeight: 300,
        lineHeight: 1.15,
        color: C.ink,
      }}
    >
      {t}
    </span>
  );

  const schrittZeile = (z: string) => (
    <span
      style={{
        display: "block",
        fontFamily: sans,
        fontSize: "var(--tellian-u1-step-text-size)",
        lineHeight: "var(--tellian-u1-step-text-leading)",
        color: C.accent,
      }}
    >
      {z}
    </span>
  );

  /* ── SCHMAL ──
     Dieselbe Idee des Wegs, um neunzig Grad gedreht: die Linie steht
     links, die Ziffern sitzen darauf. */
  if (isMobile) {
    return (
      <div
        style={{
          /* Waagrecht stand hier 0: die Hülle liefert keinen
             Seitenabstand, der Titel begann damit gemessen bei x=0
             und klebte am Rand. Jetzt derselbe Wert wie in den
             schmalen Zweigen der Stationen. */
          paddingTop: "var(--tellian-abschnitt-luft-schmal)",
          paddingBottom: "clamp(48px, 8vh, 88px)",
          paddingLeft: "clamp(20px, 6vw, 48px)",
          paddingRight: "clamp(20px, 6vw, 48px)",
          boxSizing: "border-box",
          /* Der Inhalt steht OBEN, die Restfläche fällt nach unten.
             Mittig zentriert schob es den Titel gemessene 118px unter
             die Kopfzeile — zu viel Leere zwischen beiden. Der
             Abstand nach oben ist jetzt derselbe wie zwischen zwei
             Abschnitten. */
          minHeight: "calc(100dvh - var(--tellian-kopfzeile-schmal))",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div style={{ marginBottom: "auto" }}>
        {titel}

        <ol
          style={{
            listStyle: "none",
            margin: "clamp(30px, 5vh, 52px) 0 0",
            padding: 0,
            position: "relative",
          }}
        >
          {SCHRITTE.map((s, i) => (
            <li
              key={s.titel}
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: "clamp(16px, 4vw, 28px)",
                marginTop: i === 0 ? 0 : SCHRITT_ABSTAND,
                position: "relative",
                ...stufe(i),
              }}
            >
              {/* Verbindung zur nächsten Ziffer.
                  Vorher lief EINE Linie über die ganze Liste. Ihr
                  unteres Ende hing an der Unterkante des letzten
                  Schritts — und weil dessen Text zweizeilig umbricht,
                  ragte sie unter „05" ins Leere. Als Segment je
                  Schritt endet sie da, wo die letzte Ziffer steht,
                  und wächst ausserdem MIT dem Schritt statt in einem
                  Zug. */}
              {i < SCHRITTE.length - 1 && (
                <span
                  aria-hidden
                  style={{
                    position: "absolute",
                    left: "calc(var(--tellian-u1-num-size) / 2)",
                    top: "calc(var(--tellian-u1-num-size) / 2 + 4px)",
                    bottom: `calc(-1 * (${SCHRITT_ABSTAND} + var(--tellian-u1-num-size) / 2 + 4px))`,
                    width: "1px",
                    backgroundColor: "var(--tellian-u1-line)",
                    transformOrigin: "center top",
                    transform: gezeigt ? "scaleY(1)" : "scaleY(0)",
                    transition: reducedMotion
                      ? "none"
                      : `transform ${STUFE_MS + DAUER_MS}ms` +
                        ` cubic-bezier(0.22,0.61,0.36,1)` +
                        ` ${VORLAUF_MS + i * STUFE_MS}ms`,
                  }}
                />
              )}
              <span
                style={{
                  ...zifferStil,
                  flex: "0 0 var(--tellian-u1-num-size)",
                  textAlign: "center",
                  paddingTop: "4px",
                  paddingBottom: "4px",
                }}
              >
                {ziffer(i)}
              </span>
              <span style={{ paddingTop: "4px" }}>
                {schrittTitel(s.titel)}
                <span style={{ display: "block", marginTop: "4px" }}>
                  {schrittZeile(s.zeile)}
                </span>
              </span>
            </li>
          ))}
        </ol>
        </div>
      </div>
    );
  }

  /* ── BREIT ── */
  return (
    <div
      style={{
        flex: 1,
        minHeight: 0,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        paddingLeft: "var(--tellian-u1-pad-x)",
        paddingRight: "var(--tellian-u1-pad-x)",
        paddingTop: "clamp(20px, 4vh, 56px)",
        paddingBottom: "clamp(20px, 4vh, 56px)",
        boxSizing: "border-box",
      }}
    >
      {titel}

      <ol
        style={{
          listStyle: "none",
          margin: "var(--tellian-u1-gap-title) 0 0",
          padding: 0,
          display: "grid",
          gridTemplateColumns: "repeat(5, minmax(0, 1fr))",
          columnGap: "var(--tellian-u1-col-gap)",
          position: "relative",
        }}
      >
        {/* Die durchgehende Haarlinie auf halber Zifferhöhe. Sie
            verbindet die fünf Schritte zu einem Weg; senkrechte
            Trennlinien gibt es bewusst nicht.

            Sie beginnt in der MITTE der ersten und endet in der Mitte
            der letzten Spalte — über die volle Rasterbreite ragte sie
            links vor 01 und rechts nach 05 ins Leere. Bei fünf
            gleichen Spalten ist eine halbe Spaltenbreite
            (100 % − 4 Zwischenräume) / 10. */}
        <span
          aria-hidden
          style={{
            position: "absolute",
            left: "calc((100% - 4 * var(--tellian-u1-col-gap)) / 10)",
            right: "calc((100% - 4 * var(--tellian-u1-col-gap)) / 10)",
            top: "calc(var(--tellian-u1-num-size) / 2)",
            height: "1px",
            backgroundColor: "var(--tellian-u1-line)",
            transformOrigin: "left center",
            transform: gezeigt ? "scaleX(1)" : "scaleX(0)",
            transition: reducedMotion
              ? "none"
              : `transform ${LINIE_MS}ms cubic-bezier(0.22,0.61,0.36,1) ${VORLAUF_MS}ms`,
          }}
        />

        {SCHRITTE.map((s, i) => (
          <li
            key={s.titel}
            style={{ textAlign: "center", position: "relative", ...stufe(i) }}
          >
            <span
              style={{
                ...zifferStil,
                paddingLeft: "var(--tellian-u1-num-gap)",
                paddingRight: "var(--tellian-u1-num-gap)",
              }}
            >
              {ziffer(i)}
            </span>
            <span style={{ display: "block", marginTop: "var(--tellian-u1-gap-num)" }}>
              {schrittTitel(s.titel)}
            </span>
            <span style={{ display: "block", marginTop: "var(--tellian-u1-gap-text)" }}>
              {schrittZeile(s.zeile)}
            </span>
          </li>
        ))}
      </ol>
    </div>
  );
}
