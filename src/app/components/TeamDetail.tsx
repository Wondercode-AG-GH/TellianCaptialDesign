import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";

import { C, sans, serif } from "../tokens";
import { ResponsiveImage } from "./ResponsiveImage";
import type { ImageId } from "../../assets/generated";

/* ═══════════════════════════════════════════════════════════
   TEAM — PERSONEN-DETAILANSICHT

   Ein Modal über der Station: links das Foto, gross und stehend;
   rechts Name, Rolle und der persönliche Text in Absätzen. Der
   lange Text scrollt in der RECHTEN SPALTE — das Bild bleibt.

   Bewusst einfach (Zielgruppe 65+): kein Blättern zwischen
   Personen, kein Autoplay. Schliessen über den beschrifteten Knopf
   oben rechts, über Escape und über den abgedunkelten Grund. Der
   Fokus wandert beim Öffnen hinein, ist im Overlay gefangen und
   kehrt beim Schliessen auf die Karte zurück (macht der Aufrufer
   über returnFocusRef).
   ═══════════════════════════════════════════════════════════ */

const UI = {
  DE: { schliessen: "Schliessen", mail: "E-Mail schreiben" },
  EN: { schliessen: "Close", mail: "Write an e-mail" },
  /* TODO-FR: Übersetzung folgt — DE-Text als Platzhalter. */
  FR: { schliessen: "Schliessen", mail: "E-Mail schreiben" },
} as const;

interface Props {
  offen: boolean;
  name: string;
  rolle: string;
  bild?: ImageId;
  /** Absätze — Struktur exakt wie geliefert (2 bzw. 3). */
  absaetze: readonly string[];
  /** mailto-Ziel der Person; fehlt es, steht kein Verweis. */
  mailto?: string;
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
  mailto,
  sprache = "DE",
  isMobile = false,
  onClose,
  returnFocusRef,
}: Props) {
  const panelRef = useRef<HTMLDivElement | null>(null);
  const schliessenRef = useRef<HTMLButtonElement | null>(null);

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
        onClose();
        return;
      }
      if (e.key !== "Tab") return;
      const panel = panelRef.current;
      if (!panel) return;
      const ziele = panel.querySelectorAll<HTMLElement>("a[href], button:not([disabled])");
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
  }, [offen, onClose]);

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

  /* Runder Glas-Knopf statt des beschrifteten Kastens: über dem
     grossen Porträt (mobil) ein dunkler Scrim mit Weichzeichner —
     lesbar auf jedem Bild; über der hellen Textspalte (breit) die
     helle Ghost-Fassung. Die Beschriftung wandert ins aria-label,
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
        position: "absolute",
        top: isMobile ? "calc(12px + env(safe-area-inset-top, 0px))" : "20px",
        right: isMobile ? "12px" : "20px",
        zIndex: 2,
        width: "44px",
        height: "44px",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 0,
        borderRadius: "50%",
        cursor: "pointer",
        ...(isMobile
          ? {
              color: "#F9F9F7",
              backgroundColor: "rgba(26, 23, 32, 0.44)",
              border: "1px solid rgba(249, 249, 247, 0.30)",
              backdropFilter: "blur(10px)",
              WebkitBackdropFilter: "blur(10px)",
            }
          : {
              color: C.ink,
              backgroundColor: "rgba(249, 249, 247, 0.85)",
              border: `1px solid ${C.line}`,
              backdropFilter: "blur(6px)",
              WebkitBackdropFilter: "blur(6px)",
            }),
      }}
    >
      <svg width="16" height="16" viewBox="0 0 14 14" aria-hidden focusable="false">
        <path d="M1.5 1.5 12.5 12.5 M12.5 1.5 1.5 12.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      </svg>
    </button>
  );

  const textSpalte = (
    <div
      style={{
        flex: 1,
        minHeight: 0,
        minWidth: 0,
        /* Der lange Text scrollt HIER — das Bild bleibt stehen. */
        overflowY: "auto",
        WebkitOverflowScrolling: "touch",
        padding: isMobile
          ? "clamp(20px, 5vw, 32px)"
          : "clamp(36px, 4vw, 64px) clamp(32px, 3.6vw, 60px)",
        boxSizing: "border-box",
      }}
    >
      <h2
        style={{
          margin: 0,
          /* Platz für den Schliessen-Knopf oben rechts. */
          paddingRight: isMobile ? 0 : "72px",
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
      {/* Kontaktweg im geöffneten Porträt (Auftrag 17.09): öffnet
          das Mailprogramm mit der Person als Empfängerin. Steht
          unter der Rolle — wer den Text gelesen hat, will von hier
          aus schreiben. */}
      {mailto && (
        <a
          href={mailto}
          className="tellian-td-mail"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            marginTop: "12px",
            fontFamily: sans,
            fontSize: "13px",
            letterSpacing: "var(--tellian-ls-cta-klein)",
            color: C.ink,
            textDecoration: "none",
          }}
        >
          <svg
            width="15"
            height="15"
            viewBox="0 0 24 24"
            aria-hidden
            focusable="false"
            style={{ flexShrink: 0 }}
          >
            <rect
              x="2.1"
              y="4.6"
              width="19.8"
              height="14.8"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.9"
            />
            <path
              d="M2.9 5.4 12 12.6l9.1-7.2"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.9"
              strokeLinejoin="round"
            />
          </svg>
          {UI[sprache].mail}
        </a>
      )}
      <div
        style={{
          marginTop: "clamp(20px, 3vh, 32px)",
          display: "flex",
          flexDirection: "column",
          gap: "1em",
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
              lineHeight: "var(--tellian-lauf-lh)" as unknown as number,
              color: C.accent,
            }}
          >
            {absatz}
          </p>
        ))}
      </div>
    </div>
  );

  const bildFlaeche = (
    <div
      style={{
        ...(isMobile
          ? { height: "40vh", width: "100%" }
          : { flex: "0 0 38%", height: "100%" }),
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
          sizes={isMobile ? "100vw" : "38vw"}
          /* Oben ankern wie die Kacheln (14.09): die mobile
             40vh-Fläche beschneidet ~11 % der Bildhöhe — mittig
             geankert fiel genau der Kopfraum weg und der Scheitel
             war angeschnitten. Breit schneidet die Fläche kaum
             (≈1 %), der Anker ändert dort nichts Sichtbares. */
          objectPosition="50% 0%"
          className="w-full h-full"
          style={{ display: "block" }}
        />
      )}
    </div>
  );

  return createPortal(
    <div
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
            ? { inset: 0, display: "flex", flexDirection: "column" }
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
                height: "min(620px, calc(100vh - 96px))",
                display: "flex",
              }),
          backgroundColor: C.bg,
          /* Die einzige erlaubte Abhebung: dezent, kein Zierschatten. */
          boxShadow: "0 24px 80px rgba(25, 23, 24, 0.35)",
          overflow: "hidden",
        }}
      >
        {schliessenKnopf}
        {bildFlaeche}
        {textSpalte}
      </div>

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
        .tellian-td-mail { transition: color 180ms ease; }
        .tellian-td-mail:hover {
          text-decoration: underline;
          text-underline-offset: 4px;
          text-decoration-color: var(--tellian-muted);
        }
        .tellian-td-mail:focus-visible {
          outline: 2px solid var(--tellian-muted);
          outline-offset: 3px;
        }
        @media (prefers-reduced-motion: reduce) {
          .tellian-team-schliessen, .tellian-team-schliessen svg { transition: none; }
          .tellian-team-schliessen:hover svg { transform: none; }
          .tellian-td-mail { transition: none; }
        }
      `}</style>
    </div>,
    document.body,
  );
}
