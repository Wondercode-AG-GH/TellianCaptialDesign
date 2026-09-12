import { useEffect, useState } from "react";

import { sans } from "../tokens";
import { SECTIONS } from "../sections";
import { zonenMaske, hatZone, type Zone, type BandSchicht } from "./useBandTon";
import logoDunkel from "../../assets/logo/tellian-logo-dunkel.svg";
import logoHell from "../../assets/logo/tellian-logo-hell.svg";
import monoDunkel from "../../assets/logo/tellian-monogramm-dunkel.svg";
import monoHell from "../../assets/logo/tellian-monogramm-hell.svg";

/* ═══════════════════════════════════════════════════════════
   KOPFZEILE

   Links das Logo, rechts Sprachwahl, ein senkrechter Trenner und das
   Kundenportal. Sonst nichts.

   KEINE EIGENE FLÄCHE
   Die Kopfzeile ist durchsichtig und liegt über dem, was gerade
   darunter ist. Nur im schmalen Zweig bekommt sie ab dem Scrollen eine
   deckende Fläche — dort läuft der Inhalt sonst hindurch.

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

   WARUM DER PORTALZUSTAND IM ZUSTAND STEHT UND NICHT IN :hover
   Die beiden Farbschichten nehmen keine Zeiger an — sie bekämen also
   nie ein :hover. Gezeigt wird aber auf der Griffschicht, gefüllt
   werden muss in den Farbschichten. Der Zustand wandert deshalb durch
   React zu allen dreien. Läuft die Farbgrenze durch den Knopf, füllt
   sich seine linke Hälfte in Imperial Purple und seine rechte in
   Mushroom — jede Seite in der Farbe, die auf ihrem Grund trägt.

   EIN KASTEN, UND NUR EINER
   Die Vorgabe "kein Kasten um irgendein Element der Bänder" gilt
   weiter für Logo, Sprachwahl und Stationsleiste. Das Kundenportal ist
   die Ausnahme: es ist die wichtigste Handlung der Seite und sah
   vorher aus wie die Sprachwahl, ein Schalter, den man einmal benutzt.
   ═══════════════════════════════════════════════════════════ */

/* Der TYP kennt alle drei Sprachen; der sichtbare UMFANG des
   Toggles ist pro Seitenkontext konfiguriert (Prop `sprachen`) —
   die Hauptseite bleibt bei DE/EN, Solutions zeigt DE/EN/FR.
   Eine Komponente, kein Fork. */
const ALLE_SPRACHEN = ["DE", "EN", "FR"] as const;
export type Sprache = (typeof ALLE_SPRACHEN)[number];
const SPRACHEN_STANDARD = ["DE", "EN"] as const satisfies readonly Sprache[];

type Schicht = "hell" | "dunkel" | "bild" | "griff";

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
  /** Welt, in der die Kopfzeile steht. «solutions» ergänzt das
      Lockup um die dritte Zeile «SOLUTIONS» und stellt den
      Welten-Umschalter entsprechend. */
  welt?: "capital" | "solutions";
  /** Wechsel in die andere Welt (Ziel: deren erste Station). */
  onWelt?: (ziel: "capital" | "solutions") => void;
  logoHref?: string;
  logoLabel?: string;
  /** Sichtbarer Sprachumfang des Toggles. Standard DE/EN. */
  sprachen?: readonly Sprache[];
  /** ON-IMAGE (A2-Hero): Hinterlegung des Portalfelds über dem
      Foto. Solutions verstärkt sie fürs helle Tagespanorama. */
  bildScrim?: string;
  /** ON-IMAGE: dezenter Schatten unter der Schrift — nur nötig,
      wenn das Foto hell ist (Solutions bis zur finalen Tonung). */
  bildSchatten?: boolean;
  /** Beschriftung des Portal-Felds (Solutions FR: «Portail Client»,
      UI-LABEL-REVIEW). Standard: «Kundenportal». */
  portalLabel?: string;
}

/* Schlosszeichen. Rein dekorativ — der Knopf trägt seinen Namen
   bereits als Text, das Zeichen würde ihn nur doppelt vorlesen. */
function Schloss() {
  return (
    <svg
      width="11"
      height="13"
      viewBox="0 0 11 13"
      fill="none"
      aria-hidden="true"
      focusable="false"
      style={{ flexShrink: 0, display: "block" }}
    >
      <rect x="0.6" y="5.2" width="9.8" height="7.2" rx="1" stroke="currentColor" strokeWidth="1.1" />
      <path d="M2.9 5.2V3.4a2.6 2.6 0 0 1 5.2 0v1.8" stroke="currentColor" strokeWidth="1.1" />
    </svg>
  );
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
  welt = "capital",
  onWelt,
  logoHref,
  logoLabel,
  sprachen = SPRACHEN_STANDARD,
  portalLabel = "Kundenportal",
  bildScrim = "rgba(40, 31, 51, 0.22)",
  bildSchatten = false,
}: Props) {
  /* ── DECKENDE FLÄCHE, NUR IM SCHMALEN ZWEIG ──
     Dort scrollt die Seite senkrecht unter der festen Kopfzeile
     durch. Erst AB DEM SCROLLEN: am Anfang steht der Hero, und ein
     deckender Balken schnitte ihm oben ein Stück ab. */
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

  /* Zeiger ODER Tastaturfokus füllen das Portalfeld. */
  const [portalAn, setPortalAn] = useState(false);
  /* Dasselbe Muster für den Welten-Umschalter: die Griffschicht
     meldet, welcher Eintrag unter dem Zeiger steht — die beiden
     Farbschichten färben danach. Ein reiner CSS-:hover griffe nur
     in der Griffschicht, und die schreibt transparent. */
  const [weltAn, setWeltAn] = useState<"capital" | "solutions" | null>(null);

  const inhalt = (schicht: Schicht) => {
    const griff = schicht === "griff";
    /* Die Bildschicht schreibt wie die dunkle (Archive White) —
       zusätzlich stützt sie das Portalfeld mit einem Scrim. */
    const aufDunkel = schicht === "dunkel" || schicht === "bild";
    const ink = griff
      ? "transparent"
      : aufDunkel
        ? "var(--tellian-band-ink-dunkel)"
        : "var(--tellian-band-ink-hell)";
    const dim = griff
      ? "transparent"
      : schicht === "bild"
        ? "var(--tellian-band-dim-bild)"
        : aufDunkel
          ? "var(--tellian-band-dim-dunkel)"
          : "var(--tellian-band-dim-hell)";
    /* P1.2: der inaktive Welteneintrag ist deutlich stärker
       gedämpft als die übrigen Nebenrollen — der Wert steht in
       theme.css und ist so gewählt, dass er WCAG AA hält
       (s. Kommentar dort). */
    const weltDim = griff
      ? "transparent"
      : schicht === "bild"
        ? "var(--tellian-welt-dim-bild)"
        : aufDunkel
          ? "var(--tellian-welt-dim-dunkel)"
          : "var(--tellian-welt-dim-hell)";
    const trenner = griff
      ? "transparent"
      : aufDunkel
        ? "var(--tellian-kopf-trenner-dunkel)"
        : "var(--tellian-kopf-trenner-hell)";
    const portalLinie = griff
      ? "transparent"
      : aufDunkel
        ? "var(--tellian-kopf-portal-line-dunkel)"
        : "var(--tellian-kopf-portal-line-hell)";
    const portalFuellung = griff
      ? "transparent"
      : aufDunkel
        ? "var(--tellian-kopf-portal-fuell-dunkel)"
        : "var(--tellian-kopf-portal-fuell-hell)";
    const portalInkGefuellt = griff
      ? "transparent"
      : aufDunkel
        ? "var(--tellian-kopf-portal-ink-fuell-dunkel)"
        : "var(--tellian-kopf-portal-ink-fuell-hell)";

    const klein: React.CSSProperties = {
      fontFamily: sans,
      fontSize: "var(--tellian-kopf-size)",
      letterSpacing: "var(--tellian-kopf-tracking)",
      textTransform: "uppercase",
      lineHeight: 1,
      background: "transparent",
      border: "none",
      padding: 0,
      display: "inline-flex",
      alignItems: "center",
      cursor: griff ? "pointer" : "default",
    };

    return (
      <>
        <a
          href={logoHref ?? `#${SECTIONS[0].key}`}
          onClick={(e) => {
            e.preventDefault();
            if (griff) onLogo();
          }}
          className="tellian-kopf-ziel tellian-kopf-logo"
          aria-label={logoLabel ?? `Tellian Capital — zurück zu ${SECTIONS[0].label}`}
          aria-hidden={!griff}
          tabIndex={griff ? undefined : -1}
          style={{
            display: "flex",
            /* Solutions: Lockup und Zusatzzeile stehen gestapelt,
               sonst steht das Lockup allein. */
            flexDirection: welt === "solutions" ? "column" : "row",
            alignItems: welt === "solutions" ? "flex-start" : "center",
            flexShrink: 0,
          }}
        >
          <span style={{ display: "flex", alignItems: "center" }}>
          {/* WENN DER PLATZ NICHT REICHT, GEHT DIE WORTMARKE
              Unter 420px ragte die Kopfzeile rechts hinaus — gemessen
              bei 390px stand die Menükante auf 396. Weg muss dann die
              Wortmarke, nicht das Kundenportal. Umgeschaltet wird über
              eine Medienabfrage und nicht über einen Messwert im
              Zustand: die drei Schichten müssen im selben Bild
              dasselbe zeigen, und ein Zustand käme einen Frame zu
              spät. */}
          <span
            className="tellian-kopf-wortmarke"
            style={{
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
          <span
            className="tellian-kopf-monogramm"
            style={{
              height: "var(--tellian-kopf-logo-h)",
              aspectRatio: "1.139",
            }}
          >
            {!griff && (
              <img
                src={aufDunkel ? monoHell : monoDunkel}
                alt=""
                style={{ width: "100%", height: "100%", display: "block" }}
              />
            )}
          </span>
          </span>
          {/* P3: dritte Lockup-Zeile, nur auf Solutions. Eingerückt
              auf den Wortteil des Lockups (der Kasten endet bei
              30.3 %, «TELLIAN» beginnt bei 35.1 % der Breite) —
              damit steht «SOLUTIONS» unter «CAPITAL». Auf hellem
              Grund ein abgedunkelter Mushroom-Ton; reines Mushroom
              trägt auf Archive White zu wenig. */}
          {welt === "solutions" && (
            <span
              className="tellian-kopf-zusatz"
              style={{
                marginTop: "3px",
                marginLeft: "calc(0.351 * var(--tellian-kopf-logo-h) * 3.274)",
                fontFamily: sans,
                fontSize: "var(--tellian-kopf-zusatz-size)",
                letterSpacing: "0.26em",
                textTransform: "uppercase",
                lineHeight: 1,
                whiteSpace: "nowrap",
                color: griff
                  ? "transparent"
                  : aufDunkel
                    ? "#B8AEA3"
                    : "#8C8479",
              }}
            >
              Solutions
            </span>
          )}
        </a>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "var(--tellian-kopf-gruppe-gap)",
            flexShrink: 0,
          }}
        >
          {/* ── Welten-Umschalter (P2) ──
              CAPITAL │ SOLUTIONS, im Vokabular des Sprachtoggles.
              Die aktive Welt steht in voller Stärke und ist kein
              Ziel (kein Reload); die andere führt zur ERSTEN
              Station der Zielwelt mit zurückgesetztem Scroll.
              UI-LABEL-REVIEW: die Labels «CAPITAL»/«SOLUTIONS»
              stehen in allen Sprachen gleich. */}
          {/* P2: Unter der Breitschwelle steht der Umschalter NICHT
              in der Kopfzeile — er lebt dort ganz oben im Menü
              (MobilMenue), als übergeordnete Navigationsebene. */}
          {!isVertical && (
          <div
            role={griff ? "group" : undefined}
            aria-label={griff ? "Bereich" : undefined}
            aria-hidden={!griff}
            className="tellian-kopf-welten"
            style={{ display: "flex", alignItems: "center", gap: "8px" }}
          >
            {(["capital", "solutions"] as const).map((ziel, i) => {
              const aktiv = welt === ziel;
              return (
                <span key={ziel} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  {i > 0 && (
                    <span
                      aria-hidden
                      style={{
                        display: "block",
                        width: "1px",
                        height: "10px",
                        backgroundColor: trenner,
                      }}
                    />
                  )}
                  <button
                    type="button"
                    onClick={() => griff && !aktiv && onWelt?.(ziel)}
                    onMouseEnter={() => griff && !aktiv && setWeltAn(ziel)}
                    onMouseLeave={() => griff && setWeltAn((w) => (w === ziel ? null : w))}
                    onFocus={() => griff && !aktiv && setWeltAn(ziel)}
                    onBlur={() => griff && setWeltAn((w) => (w === ziel ? null : w))}
                    aria-current={aktiv ? "true" : undefined}
                    aria-disabled={aktiv ? "true" : undefined}
                    tabIndex={griff ? undefined : -1}
                    className={
                      "tellian-kopf-ziel tellian-kopf-welt" +
                      (aktiv ? " tellian-kopf-welt-aktiv" : "")
                    }
                    style={{
                      ...klein,
                      letterSpacing: "var(--tellian-ls-marker)",
                      /* P1 Variante A: der aktive Eintrag steht in
                         voller Textfarbe und eine Gewichtsstufe
                         kräftiger; der inaktive ist deutlich
                         gedimmt. */
                      /* Beim Zeigen hellt der inaktive Eintrag zur
                         vollen Textfarbe auf — die Hairline bleibt
                         dem aktiven vorbehalten (P1.2). */
                      color: aktiv || weltAn === ziel ? ink : weltDim,
                      fontWeight: aktiv ? 500 : 400,
                      cursor: griff && !aktiv ? "pointer" : "default",
                      display: "inline-flex",
                      flexDirection: "column",
                      alignItems: "stretch",
                      gap: "6px",
                    }}
                  >
                    {ziel === "capital" ? "Capital" : "Solutions"}
                    {/* Mushroom-Hairline unter dem aktiven Eintrag.
                        Der inaktive trägt sie transparent in
                        gleicher Höhe — so springt beim Wechsel
                        nichts. Beim Zeigen erscheint sie NICHT
                        (sonst mit dem aktiven Zustand verwechselbar). */}
                    <span
                      aria-hidden
                      style={{
                        display: "block",
                        height: "1px",
                        backgroundColor:
                          aktiv && !griff ? "#B8AEA3" : "transparent",
                      }}
                    />
                  </button>
                </span>
              );
            })}
          </div>
          )}

          {/* ── Senkrechter Trenner zwischen Umschalter und Sprache ──
              Entfällt, sobald der Umschalter in die zweite Zeile
              rückt (dann trennt ihn die Zeile selbst). */}
          {!isVertical && (
          <span
            aria-hidden
            style={{
              display: "block",
              width: "1px",
              height: "var(--tellian-kopf-trenner-h)",
              backgroundColor: trenner,
              flexShrink: 0,
              /* P1.3: der Umschalter liest als eigene Einheit —
                 mehr Luft als zwischen den übrigen Elementen. */
              marginLeft: "var(--tellian-kopf-welt-gap)",
              marginRight: "var(--tellian-kopf-welt-gap)",
            }}
          />
          )}

          {/* ── Sprachwahl ── leiser als das Portal. Ein Schalter,
              keine Handlung: aktive Sprache in voller Stärke, die
              andere gedämpft, dazwischen ein Schrägstrich. */}
          <div
            role={griff ? "group" : undefined}
            aria-label={griff ? "Sprache" : undefined}
            aria-hidden={!griff}
            style={{ display: "flex", alignItems: "center", gap: "var(--tellian-kopf-sprache-gap)" }}
          >
            {sprachen.map((s, i) => (
              <span key={s} style={{ display: "flex", alignItems: "center", gap: "var(--tellian-kopf-sprache-gap)" }}>
                {i > 0 && (
                  <span aria-hidden style={{ ...klein, color: dim, cursor: "default" }}>
                    /
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => griff && onSprache(s)}
                  aria-pressed={sprache === s}
                  tabIndex={griff ? undefined : -1}
                  className="tellian-kopf-ziel tellian-kopf-sprache"
                  style={{ ...klein, color: sprache === s ? ink : dim }}
                >
                  {s}
                </button>
              </span>
            ))}
          </div>

          {/* ── Senkrechter Trenner ──
              Trennt Nebensache von Hauptsache, ohne eine Linie unter
              das ganze Band zu ziehen. */}
          <span
            aria-hidden
            style={{
              display: "block",
              width: "1px",
              height: "var(--tellian-kopf-trenner-h)",
              backgroundColor: trenner,
              flexShrink: 0,
            }}
          />

          {/* ── Kundenportal ── das einzige Feld im Band. */}
          <button
            type="button"
            onClick={() => griff && onPortal()}
            onMouseEnter={() => griff && setPortalAn(true)}
            onMouseLeave={() => griff && setPortalAn(false)}
            onFocus={() => griff && setPortalAn(true)}
            onBlur={() => griff && setPortalAn(false)}
            tabIndex={griff ? undefined : -1}
            aria-hidden={!griff}
            className="tellian-kopf-ziel tellian-kopf-portal"
            style={{
              fontFamily: sans,
              fontSize: "var(--tellian-kopf-portal-size)",
              letterSpacing: "var(--tellian-kopf-tracking)",
              textTransform: "uppercase",
              lineHeight: 1,
              color: portalAn ? portalInkGefuellt : ink,
              backgroundColor: portalAn
                ? portalFuellung
                : schicht === "bild"
                  ? bildScrim
                  : "transparent",
              border: `1px solid ${portalAn ? portalFuellung : portalLinie}`,
              borderRadius: 0,
              height: "var(--tellian-kopf-portal-h)",
              padding: "0 var(--tellian-kopf-portal-pad-x)",
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              whiteSpace: "nowrap",
              cursor: griff ? "pointer" : "default",
              transition: "background-color 180ms ease, border-color 180ms ease, color 180ms ease",
            }}
          >
            <Schloss />
            {portalLabel}
          </button>

          {isVertical && onMenue && (
            <button
              type="button"
              onClick={() => griff && onMenue()}
              aria-expanded={menueOffen}
              aria-label={menueOffen ? "Menü schliessen" : "Menü öffnen"}
              aria-hidden={!griff}
              tabIndex={griff ? undefined : -1}
              className="tellian-kopf-ziel tellian-kopf-menue"
              style={{
                ...klein,
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                gap: "5px",
                width: "24px",
                height: "24px",
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
      schicht === "griff" ? undefined : zonenMaske(zonen, schicht as BandSchicht);
    return {
      position: "absolute",
      inset: 0,
      paddingLeft: "var(--tellian-kopf-pad-x)",
      paddingRight: "var(--tellian-kopf-pad-x)",
      boxSizing: "border-box",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: "var(--tellian-kopf-gap)",
      pointerEvents: schicht === "griff" ? "auto" : "none",
      /* ON-IMAGE auf hellem Foto: ein Hauch Schatten unter der
         Schrift — Solutions bis zur finalen Tonung des Panoramas. */
      ...(schicht === "bild" && bildSchatten
        ? { textShadow: "0 1px 10px rgba(40, 31, 51, 0.45)" }
        : null),
      ...(maske ? { WebkitMaskImage: maske, maskImage: maske } : null),
    };
  };

  return (
    <header
      className={"tellian-kopfzeile" + (welt === "solutions" ? " tellian-kopfzeile-solutions" : "")}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 160,
        height: isVertical
          ? "var(--tellian-kopfzeile-schmal)"
          : "var(--tellian-kopf-height)",
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
      {(["hell", "dunkel", "bild"] as const).map((schicht) =>
        hatZone(zonen, schicht) ? (
          <div key={schicht} aria-hidden style={schichtStil(schicht)}>
            {inhalt(schicht)}
          </div>
        ) : null,
      )}
      <div style={schichtStil("griff")}>{inhalt("griff")}</div>

      <style>{`
        .tellian-kopf-ziel { text-decoration: none; outline: none; position: relative; }
        /* TREFFERFLÄCHEN
           Der Zuwachs kommt aus einer unsichtbaren Auflage, nicht aus
           Innenabstand: die drei Schichten müssen deckungsgleich
           bleiben, sonst sitzt die Farbe neben dem Griff. */
        .tellian-kopf-sprache::after,
        .tellian-kopf-portal::after,
        .tellian-kopf-logo::after,
        .tellian-kopf-menue::after {
          content: "";
          position: absolute;
          left: 0;
          right: 0;
          top: 50%;
          height: var(--tellian-tippziel);
          transform: translateY(-50%);
        }
        .tellian-kopf-sprache::after { left: -6px; right: -6px; }
        .tellian-kopf-menue::after { left: -10px; right: -10px; }
        .tellian-kopf-wortmarke { display: block; }
        .tellian-kopf-monogramm { display: none; }
        @media (max-width: 419px) {
          .tellian-kopf-wortmarke { display: none; }
          .tellian-kopf-monogramm { display: block; }

        }
                /* Die dritte Lockup-Zeile gehört zur Wortmarke und braucht
           deren Platz: unter 560px stehen Logo, Sprache, Portal und
           Menüknopf sonst nicht mehr zusammen im Bild (gemessen bei
           430px). Funktion vor Beischrift — die Welt steht dort im
           Menü. */
        @media (max-width: 559px) {
          .tellian-kopf-zusatz { display: none !important; }
        }
        /* Solutions trägt drei Spracheinträge statt zwei — dort
           weicht die Wortmarke dem Monogramm schon unter 500px,
           sonst schöbe sie den Menüknopf aus dem Bild (gemessen bei
           430px). Die Hauptseite behält ihre 420er-Schwelle. */
        @media (max-width: 499px) {
          .tellian-kopfzeile-solutions .tellian-kopf-wortmarke { display: none; }
          .tellian-kopfzeile-solutions .tellian-kopf-monogramm { display: block; }
        }
        .tellian-kopf-welt { transition: color 180ms ease; }
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
