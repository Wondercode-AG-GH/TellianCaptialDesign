import { useEffect, useState } from "react";

import { sans } from "../tokens";
import { SECTIONS } from "../sections";
import { zonenMaske, hatZone, type Zone } from "./useBandTon";
import logoDunkel from "../../assets/logo/tellian-logo-dunkel.svg";
import logoHell from "../../assets/logo/tellian-logo-hell.svg";

/* ═══════════════════════════════════════════════════════════
   KOPFZEILE

   Eines von genau zwei Navigationselementen. Links das Logo, rechts
   die Sprachwahl und das Kundenportal. Sonst nichts.

   KEINE EIGENE FLÄCHE, KEIN KASTEN
   Die Kopfzeile ist durchsichtig und liegt über dem, was gerade
   darunter ist. Weder Logo noch Sprachwahl noch Kundenportal tragen
   einen Rahmen.

   DREI SCHICHTEN STATT EINER FARBE
   Weil immer ein Streifen der Nachbarstation im Fenster steht, läuft
   ständig eine Farbgrenze durch die Kopfzeile — gemessen auch mitten
   durch das Logo. Ein einzelner Ton fürs ganze Band ist dort
   zwangsläufig auf einer der beiden Seiten falsch.

   Deshalb wird derselbe Inhalt dreimal gezeichnet:
     1. in dunkler Schrift, maskiert auf die HELLEN Bereiche,
     2. in heller Schrift, maskiert auf die DUNKLEN,
     3. unsichtbar und unmaskiert als Griff — sie trägt die Knöpfe,
        den Tastaturweg und den Fokusring.
   Die ersten beiden sind reine Farbe (aria-hidden, keine Zeiger).
   Der Wechsel ist dadurch von selbst stetig: die Maske wandert mit
   dem Track, ohne dass irgendwo umgeschaltet würde.

   WARUM ZWEI LOGODATEIEN UND KEINE EINFÄRBUNG
   Die Markenassets führen dieselbe Sperrung zweimal: "Imperial
   purple and white" für helle Stationen, "Silver Mist" für dunkle.
   Beide werden als Datei genommen; eingefärbt wird nichts. Nur die
   Leinwand ist enger beschnitten, damit sich das Logo nach seiner
   echten Höhe bemessen lässt.
   ═══════════════════════════════════════════════════════════ */

const SPRACHEN = ["DE", "EN"] as const;
export type Sprache = (typeof SPRACHEN)[number];

type Schicht = "hell" | "dunkel" | "griff";

interface Props {
  /** Sichtbare Stationsbereiche — siehe useBandZonen. */
  zonen: Zone[];
  sprache: Sprache;
  onSprache: (s: Sprache) => void;
  onPortal: () => void;
  /** Sprung auf Station 1 — das Logo ist der Weg zurück. */
  onLogo: () => void;
  /** Schmaler Zweig: zusätzlich der Menüknopf. */
  isVertical?: boolean;
  menueOffen?: boolean;
  onMenue?: () => void;
}

export function Kopfzeile({
  zonen,
  sprache,
  onSprache,
  onPortal,
  onLogo,
  isVertical = false,
  menueOffen = false,
  onMenue,
}: Props) {
  /* ── DECKENDE FLÄCHE, NUR IM SCHMALEN ZWEIG ──
     Dort scrollt die Seite senkrecht unter der festen Kopfzeile
     durch. Ohne Fläche lief der Inhalt sichtbar hindurch — gemeldet
     war das Logo, das im Kontaktformular stand.

     Erst AB DEM SCROLLEN, nicht von Anfang an: am Anfang der Seite
     steht der Hero, und ein deckender Balken würde ihm oben ein
     Stück abschneiden.

     Der Ton folgt der Fläche darunter, also derselben Quelle, aus
     der auch die Schrift ihre Fassung zieht. Im schmalen Zweig
     liefert useBandZonen genau eine Zone — die der aktiven Station.

     Auf Desktop bleibt die Kopfzeile durchsichtig: dort läuft der
     Track waagrecht, die Farbgrenze wandert durch das Band, und eine
     Fläche wäre genau die, die es nicht geben soll. */
  const [gescrollt, setGescrollt] = useState(false);
  useEffect(() => {
    if (!isVertical) return;
    const auf = () => setGescrollt(window.scrollY > 4);
    auf();
    window.addEventListener("scroll", auf, { passive: true });
    return () => window.removeEventListener("scroll", auf);
  }, [isVertical]);

  const grundDunkel = zonen[0]?.dunkel ?? false;
  const flaeche =
    isVertical && gescrollt
      ? grundDunkel
        ? "var(--tellian-kopf-flaeche-dunkel)"
        : "var(--tellian-kopf-flaeche-hell)"
      : "transparent";

  const inhalt = (schicht: Schicht) => {
    const griff = schicht === "griff";
    const aufDunkel = schicht === "dunkel";
    const ink = griff
      ? "transparent"
      : aufDunkel
        ? "var(--tellian-band-ink-dunkel)"
        : "var(--tellian-band-ink-hell)";
    const dim = griff
      ? "transparent"
      : aufDunkel
        ? "var(--tellian-band-dim-dunkel)"
        : "var(--tellian-band-dim-hell)";

    const klein: React.CSSProperties = {
      fontFamily: sans,
      fontSize: "var(--tellian-kopf-size)",
      letterSpacing: "var(--tellian-kopf-tracking)",
      textTransform: "uppercase",
      lineHeight: 1,
      background: "transparent",
      border: "none",
      /* Trefferfläche über den Innenabstand, nicht über die Schrift.
         Nur die Griffschicht braucht sie — die Farbschichten malen
         nur und würden durch den Abstand verschoben. */
      padding: griff ? "0 8px" : 0,
      margin: griff ? "0 -8px" : 0,
      minHeight: griff ? "var(--tellian-tippziel)" : undefined,
      display: "inline-flex",
      alignItems: "center",
      cursor: griff ? "pointer" : "default",
    };

    return (
      <>
        <a
          href={`#${SECTIONS[0].key}`}
          onClick={(e) => {
            e.preventDefault();
            if (griff) onLogo();
          }}
          className="tellian-kopf-ziel"
          aria-label={`Tellian Capital — zurück zu ${SECTIONS[0].label}`}
          aria-hidden={!griff}
          tabIndex={griff ? undefined : -1}
          style={{ display: "flex", alignItems: "center", flexShrink: 0 }}
        >
          <span
            style={{
              display: "block",
              height: "var(--tellian-kopf-logo-h)",
              aspectRatio: "3.274",
            }}
          >
            {!griff && (
              <img
                src={aufDunkel ? logoHell : logoDunkel}
                alt=""
                style={{ width: "100%", height: "100%", display: "block" }}
              />
            )}
          </span>
        </a>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "var(--tellian-kopf-gap)",
            flexShrink: 0,
          }}
        >
          <div
            role={griff ? "group" : undefined}
            aria-label={griff ? "Sprache" : undefined}
            aria-hidden={!griff}
            style={{ display: "flex", alignItems: "center", gap: "8px" }}
          >
            {SPRACHEN.map((s, i) => (
              <span key={s} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                {i > 0 && (
                  <span aria-hidden style={{ ...klein, color: dim, cursor: "default" }}>
                    ·
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => griff && onSprache(s)}
                  aria-pressed={sprache === s}
                  tabIndex={griff ? undefined : -1}
                  className="tellian-kopf-ziel"
                  style={{ ...klein, color: sprache === s ? ink : dim }}
                >
                  {s}
                </button>
              </span>
            ))}
          </div>

          <button
            type="button"
            onClick={() => griff && onPortal()}
            tabIndex={griff ? undefined : -1}
            aria-hidden={!griff}
            className="tellian-kopf-ziel"
            style={{ ...klein, color: ink, whiteSpace: "nowrap" }}
          >
            Kundenportal
          </button>

          {isVertical && onMenue && (
            <button
              type="button"
              onClick={() => griff && onMenue()}
              aria-expanded={menueOffen}
              aria-label={menueOffen ? "Menü schliessen" : "Menü öffnen"}
              aria-hidden={!griff}
              tabIndex={griff ? undefined : -1}
              className="tellian-kopf-ziel"
              style={{
                ...klein,
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                gap: "5px",
                width: "24px",
                height: "24px",
                padding: 0,
              }}
            >
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  aria-hidden
                  style={{
                    display: "block",
                    width: "22px",
                    height: "1.5px",
                    backgroundColor: griff ? "transparent" : ink,
                    transformOrigin: "center",
                    transform: menueOffen
                      ? i === 0
                        ? "translateY(6.5px) rotate(45deg)"
                        : i === 1
                          ? "scaleX(0)"
                          : "translateY(-6.5px) rotate(-45deg)"
                      : "none",
                    transition: "transform 260ms ease",
                  }}
                />
              ))}
            </button>
          )}
        </div>
      </>
    );
  };

  const schichtStil = (schicht: Schicht): React.CSSProperties => {
    const maske =
      schicht === "griff" ? undefined : zonenMaske(zonen, schicht === "dunkel");
    return {
      position: "absolute",
      inset: 0,
      paddingLeft: "var(--tellian-band-pad-x)",
      paddingRight: "var(--tellian-band-pad-x)",
      boxSizing: "border-box",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: "var(--tellian-kopf-gap)",
      pointerEvents: schicht === "griff" ? "auto" : "none",
      ...(maske ? { WebkitMaskImage: maske, maskImage: maske } : null),
    };
  };

  return (
    <header
      className="tellian-kopfzeile"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 160,
        height: "var(--tellian-kopf-height)",
        /* Breit: keine eigene Fläche, keine Trennlinie.
           Schmal: ab dem Scrollen deckend — siehe oben. */
        backgroundColor: flaeche,
        transition: "background-color 220ms ease",
        border: "none",
        pointerEvents: "none",
      }}
    >
      {/* ACHTUNG BEIM SUCHEN IM DOM: durch die drei Schichten liegt
          jeder Knopf DREIMAL im Dokument. Nur die letzte — die
          Griffschicht ohne aria-hidden — nimmt Zeiger und Tastatur
          an; die beiden Farbschichten sind reine Malerei. Wer
          querySelectorAll("button")[n] schreibt, trifft mit hoher
          Wahrscheinlichkeit eine tote Kopie. */}
      {(["hell", "dunkel"] as const).map((schicht) =>
        hatZone(zonen, schicht === "dunkel") ? (
          <div key={schicht} aria-hidden style={schichtStil(schicht)}>
            {inhalt(schicht)}
          </div>
        ) : null,
      )}
      <div style={schichtStil("griff")}>{inhalt("griff")}</div>

      <style>{`
        .tellian-kopf-ziel { text-decoration: none; outline: none; }
        .tellian-kopf-ziel:focus-visible {
          outline: 2px solid var(--tellian-muted);
          outline-offset: 3px;
        }
        @media (prefers-reduced-motion: reduce) {
          .tellian-kopfzeile * { transition: none !important; }
        }
      `}</style>
    </header>
  );
}
