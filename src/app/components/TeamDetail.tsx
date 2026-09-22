import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

import { C, sans, serif } from "../tokens";
import { ResponsiveImage } from "./ResponsiveImage";
import { LinkedInGlyph, MailGlyph } from "./KontaktGlyphen";
import type { ImageId } from "../../assets/generated";

/* ═══════════════════════════════════════════════════════════
   TEAM — PERSONEN-DETAILANSICHT

   BREIT: links das Foto, gross und stehend; rechts Name, Rolle und
   der Text. Der lange Text scrollt in der RECHTEN SPALTE.

   SCHMAL: nach dem Vorbild von laframboiseavocats.com/equipe —
   randloses Bildband oben, das mitscrollt, darunter Rolle als
   Versalmarke, grosser Name, Haarlinie, Abschnittsmarke und ein
   ruhig gesetzter Fliesstext. Das Ganze scrollt als EINE Fläche;
   die verschachtelte Textspalte von früher (380px-Fenster mit
   202-383px Scrollweg darin) ist fort. Antippen des Bildes zeigt
   das Porträt vollständig und unbeschnitten.

   Bewusst einfach (Zielgruppe 65+): kein Blättern zwischen
   Personen, kein Autoplay. Schliessen über den beschrifteten Knopf
   oben rechts, über Escape und über den abgedunkelten Grund. Der
   Fokus wandert beim Öffnen hinein, ist im Overlay gefangen und
   kehrt beim Schliessen auf die Karte zurück (macht der Aufrufer
   über returnFocusRef).
   ═══════════════════════════════════════════════════════════ */

const UI = {
  DE: {
    mail: "E-Mail",
    linkedin: "LinkedIn",
    schliessen: "Schliessen",
    vergroessern: "Porträt vergrössern",
    zurueck: "Zurück",
    biografie: "Biografie",
    nachOben: "Nach oben",
  },
  EN: {
    mail: "E-mail",
    linkedin: "LinkedIn",
    schliessen: "Close",
    vergroessern: "Enlarge portrait",
    zurueck: "Back",
    biografie: "Biography",
    nachOben: "Back to top",
  },
  /* TODO-FR: Übersetzung folgt — DE-Text als Platzhalter. */
  FR: {
    mail: "E-Mail",
    linkedin: "LinkedIn",
    schliessen: "Schliessen",
    vergroessern: "Porträt vergrössern",
    zurueck: "Zurück",
    biografie: "Biografie",
    nachOben: "Nach oben",
  },
} as const;

/* ── KOPFHÖHE IM BILDBAND ──
   Das Band zeigt einen Ausschnitt (Verhältnis 0.87) aus einer
   2:3-Aufnahme. Ohne Ausgleich sitzt der Kopf bei jeder Person
   anders hoch, weil die Augenlinie in jeder Quelle woanders liegt.

   Gerechnet wird in BANDBREITEN: die Aufnahme ist 1.5 Bandbreiten
   hoch, ein Augenlinien-Unterschied von e entspricht also dem Weg
   1.5 × e. Bezug ist Bryan Anthony Honegger mit der höchsten
   Augenlinie — er braucht keine Verschiebung, alle anderen rücken
   nach oben.

   Als LÄNGE in vw, nicht in Prozent: Prozentwerte von
   object-position beziehen sich auf den Überhang, und der ändert
   sich mit der gedeckelten Bandhöhe (56vh) — auf kurzen Geräten
   wären die Linien wieder auseinandergelaufen. */
const AUGENLINIE_BEZUG = 0.17;

function bandFokus(augenlinie?: number) {
  if (augenlinie === undefined) return "50% 0%";
  /* Nie nach unten schieben: das risse oben eine Lücke auf. */
  const weg = Math.max(0, 1.5 * (augenlinie - AUGENLINIE_BEZUG));
  return `50% ${(-weg * 100).toFixed(2)}vw`;
}

interface Props {
  offen: boolean;
  name: string;
  rolle: string;
  bild?: ImageId;
  /** Fertiger mailto-Verweis; fehlt bei Personen ohne Adresse. */
  mail?: string;
  linkedin?: string;
  /** Augenlinie als Anteil der Bildhöhe — richtet die Kopfhöhe im
      Bildband aus. Fehlt sie, bleibt das Band oben geankert. */
  augenlinie?: number;
  /** Absätze — Struktur exakt wie geliefert (2 bzw. 3). */
  absaetze: readonly string[];
  sprache?: "DE" | "EN" | "FR";
  isMobile?: boolean;
  onClose: () => void;
  returnFocusRef?: React.RefObject<HTMLElement | null>;
}

export function TeamDetail({
  offen,
  name,
  rolle,
  bild,
  mail,
  linkedin,
  augenlinie,
  absaetze,
  sprache = "DE",
  isMobile = false,
  onClose,
  returnFocusRef,
}: Props) {
  const panelRef = useRef<HTMLDivElement | null>(null);
  /* Der Tabfang sitzt an der WURZEL, nicht am Panel: schmal hängen
     Schliessen-Knopf und Vollansicht ausserhalb des Panels. */
  const wurzelRef = useRef<HTMLDivElement | null>(null);
  const schliessenRef = useRef<HTMLButtonElement | null>(null);
  /* Vollansicht des Porträts (nur schmal erreichbar). */
  const [bildGross, setBildGross] = useState(false);

  /* Jede Person beginnt oben — schmal ist das Panel selbst die
     Scrollfläche, sonst stünde die zweite Person mitten im Text. */
  useEffect(() => {
    if (!offen) return;
    setBildGross(false);
    panelRef.current?.scrollTo({ top: 0 });
  }, [offen, name]);

  /* Hintergrund-Scroll sperren, solange das Overlay offen ist. */
  useEffect(() => {
    if (!offen) return;
    const vorher = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = vorher;
    };
  }, [offen]);

  /* Escape schliesst; Tab bleibt im Overlay gefangen. */
  useEffect(() => {
    if (!offen) return;
    const auf = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        /* Erst die Vollansicht zurücknehmen, sonst verliert man mit
           einem Druck beides. */
        if (bildGross) setBildGross(false);
        else onClose();
        return;
      }
      if (e.key !== "Tab") return;
      const wurzel = wurzelRef.current;
      if (!wurzel) return;
      const ziele = wurzel.querySelectorAll<HTMLElement>("a[href], button:not([disabled])");
      if (!ziele.length) return;
      const erster = ziele[0];
      const letzter = ziele[ziele.length - 1];
      if (e.shiftKey && document.activeElement === erster) {
        e.preventDefault();
        letzter.focus();
      } else if (!e.shiftKey && document.activeElement === letzter) {
        e.preventDefault();
        erster.focus();
      }
    };
    document.addEventListener("keydown", auf, true);
    return () => document.removeEventListener("keydown", auf, true);
  }, [offen, onClose, bildGross]);

  /* Fokus beim Öffnen hinein, beim Schliessen zurück zur Karte. */
  const warOffen = useRef(false);
  useEffect(() => {
    if (offen) {
      warOffen.current = true;
      const id = window.setTimeout(() => schliessenRef.current?.focus(), 60);
      return () => window.clearTimeout(id);
    }
    if (warOffen.current) {
      warOffen.current = false;
      returnFocusRef?.current?.focus({ preventScroll: true });
    }
  }, [offen, returnFocusRef]);

  if (!offen) return null;

  /* Runder Glas-Knopf statt des beschrifteten Kastens, in heller
     Ghost-Fassung über dem hellen Grund. Schmal hing er früher als
     dunkler Scrim über dem grossen Porträt; seit das Porträt
     kompakt neben dem Namen steht, liegt er über der Seitenfarbe
     und bleibt am Schirm stehen, während der Inhalt scrollt. Die Beschriftung wandert ins aria-label,
     das Zeichen dreht sich beim Zeigen. Escape und Rückweg über den
     Hintergrund bleiben. */
  const schliessenKnopf = (
    <button
      ref={schliessenRef}
      type="button"
      onClick={onClose}
      aria-label={UI[sprache].schliessen}
      title={UI[sprache].schliessen}
      className="tellian-team-schliessen"
      style={{
        /* Immer absolut — schmal zur Dialogwurzel, die fest am
           Schirm liegt, breit zum Panel. Ein «fixed» innerhalb der
           scrollenden Fläche ist auf iOS unzuverlässig. */
        position: "absolute",
        /* 13/13 statt 20/20: der Knopf traegt schmal 7px
           unsichtbare Luft, damit die Trefferflaeche 44px behaelt.
           Die sichtbare Marke steht dadurch genau im Seitenrand
           von 20px, wie in der Referenz. */
        top: isMobile ? "calc(13px + env(safe-area-inset-top, 0px))" : "20px",
        right: isMobile ? "13px" : "20px",
        zIndex: 3,
        display: isMobile && bildGross ? "none" : "inline-flex",
        ...(isMobile
          ? {
              padding: "7px",
              background: "none",
              border: "none",
              borderRadius: "999px",
            }
          : {
              width: "44px",
              height: "44px",
              padding: 0,
              borderRadius: "50%",
              backgroundColor: "rgba(249, 249, 247, 0.85)",
              border: `1px solid ${C.line}`,
              backdropFilter: "blur(6px)",
              WebkitBackdropFilter: "blur(6px)",
            }),
        alignItems: "center",
        justifyContent: "center",
        cursor: "pointer",
        color: C.ink,
      }}
    >
      {isMobile ? (
        /* Die Wortmarke der Referenz («RETOUR [ X ]»), leicht
           gesetzt: kein Rahmen, nur ein Hauch Glas. Anders als dort
           scrollt sie NICHT weg — im Overlay waere man sonst mitten
           im Text ohne sichtbaren Rueckweg. Der Glasgrund haelt sie
           ueber Bild UND Text lesbar, ohne wie ein Schalter zu
           wirken. */
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "7px",
            height: "30px",
            padding: "0 11px",
            borderRadius: "999px",
            fontFamily: sans,
            fontSize: "12px",
            letterSpacing: "0.06em",
            textTransform: "uppercase",
            /* Deckend, nicht durchscheinend: beim Scrollen liegt die
               Marke ueber dem Fliesstext, und durch Glas las man die
               Zeilen hindurch. Auf Weichzeichner ist kein Verlass —
               er faellt je nach Geraet aus. */
            backgroundColor: C.bg,
            /* Haarlinie, damit der Chip ueber dem Fliesstext als
               eigenes Element lesbar bleibt: deckend allein
               verschmolz er mit der Seitenfarbe und die Zeilen
               liefen scheinbar durch die Marke. */
            border: `1px solid ${C.line}`,
          }}
        >
          {UI[sprache].zurueck}
          <svg width="10" height="10" viewBox="0 0 14 14" aria-hidden focusable="false">
            <path d="M1.5 1.5 12.5 12.5 M12.5 1.5 1.5 12.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </span>
      ) : (
        <svg width="16" height="16" viewBox="0 0 14 14" aria-hidden focusable="false">
          <path d="M1.5 1.5 12.5 12.5 M12.5 1.5 1.5 12.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
        </svg>
      )}
    </button>
  );

  /* ── KONTAKTWEGE ──
     Seit 22.09 stehen sie HIER statt auf der Teamkachel: dort
     führte die Kachel zu zwei Zielen gleichzeitig, jetzt zu einem.
     Wortmarken in der Setzung der Abschnittsmarken, damit sie sich
     als Angabe lesen und nicht als Schalterreihe. */
  const kontakt =
    mail || linkedin ? (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "clamp(18px, 2vw, 28px)",
          fontFamily: sans,
          fontSize: "12px",
          lineHeight: 1.3,
          letterSpacing: "0.06em",
          textTransform: "uppercase",
        }}
      >
        {mail && (
          <a
            href={mail}
            className="tellian-team-kontakt"
            aria-label={
              sprache === "EN"
                ? `Write an e-mail to ${name}`
                : `${name} eine E-Mail schreiben`
            }
          >
            <MailGlyph farbe="currentColor" />
            {UI[sprache].mail}
          </a>
        )}
        {linkedin && (
          <a
            href={linkedin}
            target="_blank"
            rel="noopener noreferrer"
            className="tellian-team-kontakt"
            aria-label={
              sprache === "EN" ? `${name} on LinkedIn` : `${name} auf LinkedIn`
            }
          >
            <LinkedInGlyph farbe="currentColor" />
            {UI[sprache].linkedin}
          </a>
        )}
      </div>
    ) : null;

  /* Nur noch im BREITEN Band: schmal übernimmt inhaltSchmal. */
  const textSpalte = (
    <div
      style={{
        flex: 1,
        minHeight: 0,
        minWidth: 0,
        /* Der lange Text scrollt HIER — das Bild bleibt stehen. */
        overflowY: "auto",
        WebkitOverflowScrolling: "touch",
        /* Oben und unten knapper (18.09): auf grossen Fenstern
           standen 64px Luft über und unter dem Text, während Bryans
           vier Absätze über die Panelhöhe hinausliefen. 44px reichen
           für die Ruhe und geben 40px an den Text zurück — das Bild
           bleibt unangetastet. */
        padding: "clamp(32px, 3.2vw, 44px) clamp(32px, 3.6vw, 60px)",
        boxSizing: "border-box",
      }}
    >
      <h2
        style={{
          margin: 0,
          /* Platz für den Schliessen-Knopf oben rechts. */
          paddingRight: "72px",
          fontFamily: serif,
          fontSize: "clamp(28px, 2.8vw, 42px)",
          fontWeight: 400,
          lineHeight: "var(--tellian-zwischen-lh)" as unknown as number,
          color: C.ink,
        }}
      >
        {name}
      </h2>
      <p
        style={{
          margin: "10px 0 0",
          fontFamily: sans,
          fontSize: "14px",
          letterSpacing: "0.04em",
          color: C.accent,
        }}
      >
        {rolle}
      </p>
      {kontakt && <div style={{ marginTop: "18px" }}>{kontakt}</div>}
      {/* KEIN Mailverweis mehr (18.09): Bryans Text lief über die
          Panelhöhe hinaus und verlangte Scrollen. Der Verweis kostete
          32px — zu wenig allein, aber er ist der entbehrlichste Teil:
          das Mail-Zeichen steht weiter auf jeder Teamkachel. */}
      <div
        style={{
          marginTop: "clamp(20px, 3vh, 32px)",
          display: "flex",
          flexDirection: "column",
          /* 0.8em statt 1em: bei vier Absätzen spart das rund 12px,
             ohne dass die Absätze zusammenrücken. */
          gap: "0.8em",
          maxWidth: "60ch",
        }}
      >
        {absaetze.map((absatz) => (
          <p
            key={absatz.slice(0, 24)}
            style={{
              margin: 0,
              fontFamily: sans,
              fontSize: "var(--tellian-lauf-size)",
              /* 1.62 statt 1.75: im Porträt stehen bis zu 24 Zeilen,
                 das spart rund 50px und bleibt bequem lesbar. */
              lineHeight: 1.62,
              color: C.accent,
            }}
          >
            {absatz}
          </p>
        ))}
      </div>
    </div>
  );

  /* Nur noch im BREITEN Band: schmal trägt kopfSchmal das Porträt. */
  const bildFlaeche = (
    <div
      style={{
        flex: "0 0 38%",
        height: "100%",
        flexShrink: 0,
        overflow: "hidden",
        backgroundColor: "var(--tellian-t5-placeholder-bg)",
      }}
      className="tellian-t5-bild"
    >
      {bild && (
        <ResponsiveImage
          id={bild}
          alt=""
          sizes="38vw"
          /* Die Fläche schneidet 11 % der Breite; oben geankert
             bleibt der Kopfraum erhalten. */
          objectPosition="50% 0%"
          className="w-full h-full"
          style={{ display: "block" }}
        />
      )}
    </div>
  );

  /* ── SCHMAL: der Inhalt als EINE Scrollfläche ──
     Masse nach der Referenz, bei 390px nachgemessen: Bildband über
     die ganze Breite im Verhältnis 0.87, Seitenrand 20px, Rolle als
     12px-Versalmarke ÜBER dem Namen, Name gross mit engem
     Zeilenabstand, Haarlinie, Abschnittsmarke, Fliesstext bei rund
     20px mit Zeilenabstand 1.3. */
  const inhaltSchmal = (
    <div>
      {/* Bildband — randlos, scrollt mit. Das Verhältnis 0.87 ist
          das der Referenz; unsere Dateien sind 2:3, das Band
          schneidet also unten ab. Oben geankert bleibt der Kopf
          stehen, und ein Tipp zeigt die Aufnahme vollständig. */}
      <button
        type="button"
        onClick={() => setBildGross(true)}
        aria-label={UI[sprache].vergroessern}
        style={{
          display: "block",
          width: "100%",
          padding: 0,
          border: "none",
          background: "none",
          cursor: "zoom-in",
        }}
      >
        <span
          className="tellian-t5-bild"
          style={{
            display: "block",
            width: "100%",
            aspectRatio: "0.87",
            /* Auf kurzen Geräten deckeln: bei 320x568 nähme das
               Verhältnis sonst 65% des Schirms statt der 53%, die
               die Referenz bei 390x844 hält. */
            maxHeight: "56vh",
            overflow: "hidden",
            backgroundColor: "var(--tellian-t5-placeholder-bg)",
          }}
        >
          {bild && (
            <ResponsiveImage
              id={bild}
              alt=""
              sizes="100vw"
              objectPosition={bandFokus(augenlinie)}
              className="w-full h-full"
              style={{ display: "block" }}
            />
          )}
        </span>
      </button>

      <div
        style={{
          padding: "clamp(18px, 5.1vw, 26px) clamp(20px, 5.1vw, 28px) calc(clamp(40px, 9vw, 56px) + env(safe-area-inset-bottom, 0px))",
          boxSizing: "border-box",
        }}
      >
        {rolle !== "" && (
          <p
            style={{
              margin: 0,
              fontFamily: sans,
              fontSize: "12px",
              lineHeight: 1.3,
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              color: C.accent,
            }}
          >
            {rolle}
          </p>
        )}
        <h2
          style={{
            /* Enger Zeilenabstand wie in der Referenz (dort 0.95):
               der Name steht als Block, nicht als Fliesstext. */
            margin: "clamp(10px, 2.4vw, 14px) 0 0",
            fontFamily: serif,
            fontSize: "clamp(30px, 8.6vw, 38px)",
            fontWeight: 400,
            lineHeight: 1.02,
            color: C.ink,
            textWrap: "pretty" as React.CSSProperties["textWrap"],
          }}
        >
          {name}
        </h2>

        {kontakt && (
          <div style={{ marginTop: "clamp(18px, 2.4vw, 24px)" }}>{kontakt}</div>
        )}

        {/* Haarlinie und Abschnittsmarke — der Rhythmus, der die
            Referenz trotz 3.5 Schirmen ruhig wirken lässt. */}
        <hr
          style={{
            margin: "clamp(34px, 8vw, 48px) 0 0",
            border: "none",
            borderTop: `1px solid ${C.line}`,
          }}
        />
        <p
          style={{
            margin: "clamp(20px, 5vw, 28px) 0 0",
            fontFamily: sans,
            fontSize: "12px",
            lineHeight: 1.3,
            letterSpacing: "0.06em",
            textTransform: "uppercase",
            color: C.accent,
          }}
        >
          {UI[sprache].biografie}
        </p>
        <div
          style={{
            marginTop: "clamp(18px, 4.4vw, 26px)",
            display: "flex",
            flexDirection: "column",
            gap: "0.9em",
          }}
        >
          {absaetze.map((absatz) => (
            <p
              key={absatz.slice(0, 24)}
              style={{
                margin: 0,
                fontFamily: sans,
                /* Referenz: 20.3px auf 1.30. Unsere Schrift läuft
                   etwas breiter, deshalb 19px auf 1.38. */
                fontSize: "clamp(17px, 4.9vw, 19px)",
                lineHeight: 1.38,
                color: C.ink,
              }}
            >
              {absatz}
            </p>
          ))}
        </div>

        {/* Runder Pfeil zurück nach oben, wie am Ende der Referenz. */}
        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "clamp(30px, 7vw, 44px)" }}>
          <button
            type="button"
            onClick={() => panelRef.current?.scrollTo({ top: 0, behavior: "smooth" })}
            aria-label={UI[sprache].nachOben}
            title={UI[sprache].nachOben}
            className="tellian-team-schliessen"
            style={{
              width: "44px",
              height: "44px",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              padding: 0,
              borderRadius: "50%",
              cursor: "pointer",
              color: C.ink,
              backgroundColor: "transparent",
              border: `1px solid ${C.line}`,
            }}
          >
            <svg width="15" height="15" viewBox="0 0 14 14" aria-hidden focusable="false">
              <path d="M7 12.5 V2 M2.5 6.5 7 2 11.5 6.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );

  /* ── SCHMAL: Porträt in voller Grösse ──
     Liegt im Panel, damit der Tabfang ihn mitnimmt. Tippen irgendwo
     schliesst; Escape nimmt erst diese Ebene zurück. */
  const bildVollansicht = (
    <div
      onClick={() => setBildGross(false)}
      style={{
        position: "absolute",
        inset: 0,
        zIndex: 4,
        backgroundColor: "rgba(26, 23, 32, 0.96)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "env(safe-area-inset-top, 0px) 0 env(safe-area-inset-bottom, 0px)",
      }}
    >
      <button
        type="button"
        onClick={() => setBildGross(false)}
        aria-label={UI[sprache].schliessen}
        title={UI[sprache].schliessen}
        className="tellian-team-schliessen"
        style={{
          position: "absolute",
          top: "calc(12px + env(safe-area-inset-top, 0px))",
          right: "12px",
          zIndex: 1,
          width: "44px",
          height: "44px",
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 0,
          borderRadius: "50%",
          cursor: "pointer",
          color: "#F9F9F7",
          backgroundColor: "rgba(26, 23, 32, 0.44)",
          border: "1px solid rgba(249, 249, 247, 0.30)",
          backdropFilter: "blur(10px)",
          WebkitBackdropFilter: "blur(10px)",
        }}
      >
        <svg width="16" height="16" viewBox="0 0 14 14" aria-hidden focusable="false">
          <path d="M1.5 1.5 12.5 12.5 M12.5 1.5 1.5 12.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
        </svg>
      </button>
      {bild && (
        <ResponsiveImage
          id={bild}
          alt={name}
          sizes="100vw"
          /* Volle Fläche mit contain: das picture-Element füllt den
             Schirm, das Bild steht darin mittig und vollständig.
             Mit auto-Breite hing es stattdessen am oberen Rand. */
          style={{ display: "block", width: "100%", height: "100%", objectFit: "contain" }}
        />
      )}
    </div>
  );

  return createPortal(
    <div
      ref={wurzelRef}
      role="dialog"
      aria-modal="true"
      aria-label={`${name} — ${rolle}`}
      style={{ position: "fixed", inset: 0, zIndex: 220 }}
    >
      {/* Abgedunkelter Grund — Imperial Purple mit Transparenz;
          Klick schliesst. */}
      <div
        onClick={onClose}
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          backgroundColor: "rgba(40, 31, 51, 0.62)",
        }}
      />
      <div
        ref={panelRef}
        style={{
          position: "absolute",
          ...(isMobile
            ? {
                inset: 0,
                /* EINE Fläche: vorher scrollte der Text in einem
                   380px-Fenster innerhalb des Schirms. */
                overflowY: "auto" as const,
                WebkitOverflowScrolling: "touch" as const,
                overscrollBehavior: "contain" as const,
              }
            : {
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                /* Etwas kompakter (18.09): Die Bildfläche wuchs
                   mit dem Panel, die Quellauflösung der Porträts
                   aber nicht — bei 680px Rahmenhöhe fehlte einem
                   690px hohen Bild die Hälfte der Punkte für
                   doppelte Dichte. 620px Höhe und ein Bildanteil
                   von 38 % bringen Rahmen und Bild zur Deckung. */
                /* 1100 statt 1060: mit dem höheren Rahmen wurde die
                   Bildspalte im Verhältnis schmaler und cover schnitt
                   15 statt 11 % der Breite weg. Etwas mehr Panelbreite
                   gibt beiden Spalten zurück, was die Höhe genommen
                   hat. */
                width: "min(1100px, calc(100vw - 64px))",
                /* 712 statt 680 (22.09): die Kontaktzeile kostet den
                   Text 19 bis 28px, und Bryans Absätze liefen damit
                   über den Rahmen. Die Quelle trägt es — 1530px
                   Bilddatei auf 712px Rahmen sind 107 % für doppelte
                   Dichte, weiterhin über der vollen Deckung. */
                height: "min(712px, calc(100vh - 96px))",
                display: "flex",
              }),
          backgroundColor: C.bg,
          /* Die einzige erlaubte Abhebung: dezent, kein Zierschatten. */
          boxShadow: "0 24px 80px rgba(25, 23, 24, 0.35)",
          ...(isMobile ? null : { overflow: "hidden" }),
        }}
      >
        {isMobile ? (
          inhaltSchmal
        ) : (
          <>
            {schliessenKnopf}
            {bildFlaeche}
            {textSpalte}
          </>
        )}
      </div>
      {isMobile && schliessenKnopf}
      {isMobile && bildGross && bildVollansicht}

      <style>{`
        .tellian-team-schliessen {
          transition: border-color 200ms ease, background-color 200ms ease,
            transform 200ms ease;
        }
        .tellian-team-schliessen svg {
          transition: transform 280ms cubic-bezier(0.16, 1, 0.3, 1);
        }
        .tellian-team-schliessen:hover { border-color: ${C.accent}; transform: scale(1.06); }
        .tellian-team-schliessen:hover svg { transform: rotate(90deg); }
        .tellian-team-schliessen:active { transform: scale(0.96); }
        .tellian-team-kontakt {
          display: inline-flex;
          align-items: center;
          /* Zeichen und Wort gehören zusammen; der Abstand ist
             kleiner als die Lücke zwischen den beiden Wegen. */
          gap: 8px;
          color: ${C.accent};
          text-decoration: none;
          /* Polster nach aussen ausgeglichen: die Trefferfläche
             wächst auf 37px — die Zeile misst nur 19px und wäre auf
             dem Telefon kaum zu treffen —, die Setzung bleibt
             davon unberührt. */
          padding: 9px 4px;
          margin: -9px -4px;
          transition: color 180ms ease;
        }
        .tellian-team-kontakt:hover {
          color: ${C.ink};
          text-decoration: underline;
          text-underline-offset: 4px;
        }
        .tellian-team-kontakt:focus-visible {
          outline: 2px solid var(--tellian-muted);
          outline-offset: 3px;
        }
        .tellian-team-schliessen:focus-visible {
          outline: 2px solid var(--tellian-muted);
          outline-offset: 3px;
        }
        @media (prefers-reduced-motion: reduce) {
          .tellian-team-schliessen, .tellian-team-schliessen svg { transition: none; }
          .tellian-team-schliessen:hover svg { transform: none; }
        }
      `}</style>
    </div>,
    document.body,
  );
}
