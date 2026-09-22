import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

import { C, sans, serif } from "../tokens";
import { ResponsiveImage } from "./ResponsiveImage";
import type { ImageId } from "../../assets/generated";

/* ═══════════════════════════════════════════════════════════
   TEAM — PERSONEN-DETAILANSICHT

   BREIT: links das Foto, gross und stehend; rechts Name, Rolle und
   der Text. Der lange Text scrollt in der RECHTEN SPALTE.

   SCHMAL: ein kompaktes Porträt neben Name und Rolle, darunter der
   Text — und das Ganze scrollt als EINE Fläche. Vorher deckte das
   Bild 55% des Schirms und der Text rollte in einem 380px-Fenster
   darin: gemessen 202-383px Scrollweg in einem Fenster im Fenster.
   Jetzt passen ab 844px Schirmhöhe alle Porträts auf einen Schirm.
   Antippen des Bildes zeigt es in voller Grösse.

   Bewusst einfach (Zielgruppe 65+): kein Blättern zwischen
   Personen, kein Autoplay. Schliessen über den beschrifteten Knopf
   oben rechts, über Escape und über den abgedunkelten Grund. Der
   Fokus wandert beim Öffnen hinein, ist im Overlay gefangen und
   kehrt beim Schliessen auf die Karte zurück (macht der Aufrufer
   über returnFocusRef).
   ═══════════════════════════════════════════════════════════ */

const UI = {
  DE: { schliessen: "Schliessen", vergroessern: "Porträt vergrössern" },
  EN: { schliessen: "Close", vergroessern: "Enlarge portrait" },
  /* TODO-FR: Übersetzung folgt — DE-Text als Platzhalter. */
  FR: { schliessen: "Schliessen", vergroessern: "Porträt vergrössern" },
} as const;

interface Props {
  offen: boolean;
  name: string;
  rolle: string;
  bild?: ImageId;
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
        top: isMobile ? "calc(12px + env(safe-area-inset-top, 0px))" : "20px",
        right: isMobile ? "12px" : "20px",
        zIndex: 3,
        display: isMobile && bildGross ? "none" : "inline-flex",
        width: "44px",
        height: "44px",
        alignItems: "center",
        justifyContent: "center",
        padding: 0,
        borderRadius: "50%",
        cursor: "pointer",
        color: C.ink,
        backgroundColor: "rgba(249, 249, 247, 0.85)",
        border: `1px solid ${C.line}`,
        backdropFilter: "blur(6px)",
        WebkitBackdropFilter: "blur(6px)",
      }}
    >
      <svg width="16" height="16" viewBox="0 0 14 14" aria-hidden focusable="false">
        <path d="M1.5 1.5 12.5 12.5 M12.5 1.5 1.5 12.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      </svg>
    </button>
  );

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

  /* ── SCHMAL: Kopfzeile aus kompaktem Porträt, Name und Rolle ──
     Das Bild ist so hoch bemessen, dass der längste Text (Bryan,
     677px bei 15px/1.5) zusammen mit ihm auf einen 844px-Schirm
     passt: gemessen blieben dafür 167px Bildhöhe, davon zahlt das
     Bild nur die Differenz zur Namenshöhe. Es steht NEBEN dem
     Namen, nicht darüber — das spart die Höhe, die der Name ohnehin
     belegt. Verhältnis 2:3 wie die Datei, also kein Beschnitt. */
  const kopfSchmal = (
    <div
      style={{
        display: "flex",
        gap: "clamp(14px, 4vw, 20px)",
        alignItems: "flex-start",
      }}
    >
      <button
        type="button"
        onClick={() => setBildGross(true)}
        aria-label={UI[sprache].vergroessern}
        style={{
          padding: 0,
          border: "none",
          background: "none",
          cursor: "zoom-in",
          flexShrink: 0,
          display: "block",
        }}
      >
        <span
          className="tellian-t5-bild"
          style={{
            display: "block",
            height: "clamp(132px, 19vh, 176px)",
            aspectRatio: "2 / 3",
            overflow: "hidden",
            backgroundColor: "var(--tellian-t5-placeholder-bg)",
          }}
        >
          {bild && (
            <ResponsiveImage
              id={bild}
              alt=""
              sizes="120px"
              objectPosition="50% 0%"
              className="w-full h-full"
              style={{ display: "block" }}
            />
          )}
        </span>
      </button>
      <div style={{ minWidth: 0 }}>
        <h2
          style={{
            margin: 0,
            fontFamily: serif,
            fontSize: "clamp(24px, 6.4vw, 30px)",
            fontWeight: 400,
            lineHeight: "var(--tellian-zwischen-lh)" as unknown as number,
            color: C.ink,
            textWrap: "pretty" as React.CSSProperties["textWrap"],
          }}
        >
          {/* Nur die Zeilen neben dem Schliessen-Knopf weichen aus,
              nicht die ganze Spalte: mit durchgehender Reserve brach
              «Bryan Anthony Honegger» dreizeilig. */}
          <span
            aria-hidden
            style={{ float: "right", width: "52px", height: "30px" }}
          />
          {name}
        </h2>
        <p
          style={{
            margin: "8px 0 0",
            fontFamily: sans,
            fontSize: "14px",
            letterSpacing: "0.04em",
            color: C.accent,
          }}
        >
          {rolle}
        </p>
      </div>
    </div>
  );

  /* ── SCHMAL: der Inhalt als EINE Scrollfläche ── */
  const inhaltSchmal = (
    <div
      style={{
        padding: "calc(clamp(20px, 5vw, 32px) + env(safe-area-inset-top, 0px)) clamp(20px, 5vw, 32px) calc(clamp(28px, 6vw, 40px) + env(safe-area-inset-bottom, 0px))",
        boxSizing: "border-box",
      }}
    >
      {kopfSchmal}
      <div
        style={{
          marginTop: "clamp(18px, 2.6vh, 26px)",
          display: "flex",
          flexDirection: "column",
          /* 0.6em statt 0.8em und 15px/1.5 statt 16px/1.62: das
             straffere Mass spart beim längsten Text 86px und ist
             der Unterschied zwischen einem Schirm und zweien. */
          gap: "0.6em",
        }}
      >
        {absaetze.map((absatz) => (
          <p
            key={absatz.slice(0, 24)}
            style={{
              margin: 0,
              fontFamily: sans,
              fontSize: "15px",
              lineHeight: 1.5,
              color: C.accent,
            }}
          >
            {absatz}
          </p>
        ))}
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
                width: "min(1060px, calc(100vw - 64px))",
                height: "min(680px, calc(100vh - 96px))",
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
