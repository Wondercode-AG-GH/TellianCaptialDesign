import { useState, useRef, useLayoutEffect, useEffect } from "react";

import { sans } from "../tokens";
import { SECTIONS, sectionOrdinal, type SectionDef } from "../sections";
import { EASE } from "../../styles/motion";
import { SCROLL_TUNING } from "./useHorizontalScroll";
import { zonenMaske, hatZone, type Zone } from "./useBandTon";

/** Masse der gleitenden Markierung. */
const MARKER_W = 12;
const MARKER_H = 1.5;
/** Höhe der Punktzeile — konstant, damit nichts springt. */
const DOT_ROW_H = 4;

/* Ziele und Beschriftungen kommen aus der Registry. Vorher lag hier
   eine zweite, von Hand gepflegte Tabelle mit Progress-Werten, die von
   einer Gesamtbreite von 764vw ausging — die es nie gab. */

interface DotNavigationProps {
  /** Aktive Sektion, direkt aus der Registry — keine Schwellenwerte. */
  activeIndex: number;
  onNavigate: (index: number) => void;
  /** Sichtbare Stationsbereiche — siehe useBandZonen. */
  zonen: Zone[];
  /** Eigene Einträge (Solutions). Ohne Angabe: Registry der
      Hauptseite — Optik und Verhalten identisch. */
  sektionen?: readonly SectionDef[];
}

export function DotNavigation({ activeIndex, onNavigate, zonen, sektionen = SECTIONS }: DotNavigationProps) {
  /* KURZNAMEN STATT KLEINERER SCHRIFT
     Die Untergrenze von 12px gilt auch hier. Wird die Leiste zu eng,
     werden die Namen gekürzt — gemessen wird der tatsächliche
     Platzbedarf, nicht ein geratener Schwellenwert. */
  const [kurz, setKurz] = useState(false);
  /* Die Markierung wandert über dieselbe Dauer wie ein befohlener
     Sprung. Beim freien Scrollen wechselt sie, sobald eine andere
     Sektion die Bildmitte überdeckt — dann ist das Gleiten eine
     Zustandsänderung, keine Begleitung einer Fahrt. */
  const durationMs = SCROLL_TUNING.JUMP_MS;
  const navRef = useRef<HTMLElement>(null);
  const buttonsRef = useRef<(HTMLButtonElement | null)[]>([]);
  /** Waagrechte Mitten der Punktzeilen, relativ zur Leiste. */
  const [centers, setCenters] = useState<number[]>([]);
  const [dotTop, setDotTop] = useState(0);

  /* Positionen messen statt rechnen: die Abstände sind clamp()-basiert
     und hängen an der Viewportbreite. */
  useLayoutEffect(() => {
    const measure = () => {
      const buttons = buttonsRef.current;
      if (!buttons[0]) return;
      setCenters(buttons.map((b) => (b ? b.offsetLeft + b.offsetWidth / 2 : 0)));
      setDotTop(buttons[0].offsetTop + (DOT_ROW_H - MARKER_H) / 2);
    };

    measure();
    const observer = new ResizeObserver(measure);
    if (navRef.current) observer.observe(navRef.current);
    window.addEventListener("resize", measure);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, []);

  /* Passen die vollen Namen noch nebeneinander? Gemessen an der
     Summe der Knopfbreiten plus Zwischenräume. */
  useEffect(() => {
    const pruefen = () => {
      const nav = navRef.current;
      const knoepfe = buttonsRef.current.filter(Boolean) as HTMLButtonElement[];
      if (!nav || knoepfe.length !== sektionen.length) return;
      const stil = getComputedStyle(nav);
      const platz =
        nav.clientWidth -
        parseFloat(stil.paddingLeft) -
        parseFloat(stil.paddingRight);
      const luecke = parseFloat(stil.columnGap || "0") * (knoepfe.length - 1);
      const gebraucht = knoepfe.reduce((a, b) => a + b.scrollWidth, 0) + luecke;
      /* Hysterese: ohne sie kippt es an der Grenze bei jedem Pixel
         hin und her, weil die Kurzform wieder Platz schafft. */
      setKurz((vorher) => (vorher ? gebraucht > platz - 24 : gebraucht > platz));
    };
    pruefen();
    const beobachter = new ResizeObserver(pruefen);
    if (navRef.current) beobachter.observe(navRef.current);
    window.addEventListener("resize", pruefen);
    return () => {
      beobachter.disconnect();
      window.removeEventListener("resize", pruefen);
    };
  }, [kurz]);

  const center = centers[activeIndex];
  const marker = {
    ready: center !== undefined,
    x: (center ?? 0) - MARKER_W / 2,
    top: dotTop,
  };

  /* Drei Schichten wie in der Kopfzeile: dunkle Schrift maskiert auf
     die hellen Stationsbereiche, helle auf die dunklen, dazu eine
     unsichtbare Griffschicht für Knöpfe, Tastatur und Fokusring.
     Ein einzelner Ton fürs ganze Band wäre an der Farbgrenze — die
     ständig irgendwo durch die Leiste läuft — auf einer Seite
     zwangsläufig falsch. */
  type Schicht = "hell" | "dunkel" | "griff";

  const reihe = (schicht: Schicht) => {
    const griff = schicht === "griff";
    const aufDunkel = schicht === "dunkel";
    const ziffer = griff
      ? "transparent"
      : aufDunkel
        ? "var(--tellian-band-dim-dunkel)"
        : "var(--tellian-station-numeral)";
    const aktivFarbe = griff
      ? "transparent"
      : aufDunkel
        ? "var(--tellian-band-ink-dunkel)"
        : "var(--tellian-station-label)";
    const ruheFarbe = griff
      ? "transparent"
      : aufDunkel
        ? "var(--tellian-band-dim-dunkel)"
        : "var(--tellian-station-inactive)";

    return sektionen.map((section, i) => {
      const isActive = activeIndex === i;
      return (
        <button
          key={section.key}
          ref={griff ? (el) => { buttonsRef.current[i] = el; } : undefined}
          onClick={() => griff && onNavigate(i)}
          aria-current={griff && isActive ? "page" : undefined}
          aria-hidden={!griff}
          tabIndex={griff ? undefined : -1}
          className="tellian-station-ziel"
          style={{
            display: "flex",
            alignItems: "baseline",
            gap: "10px",
            padding: 0,
            border: "none",
            background: "transparent",
            cursor: griff ? "pointer" : "default",
            outline: "none",
            whiteSpace: "nowrap",
            minWidth: 0,
          }}
        >
          {/* Ziffer — Mushroom, auch im aktiven Zustand. Sie zählt,
              sie hebt nicht hervor. */}
          <span
            aria-hidden
            style={{
              fontFamily: sans,
              fontSize: "var(--tellian-station-size)",
              color: ziffer,
              fontVariantNumeric: "tabular-nums",
              flexShrink: 0,
            }}
          >
            {sectionOrdinal(i)}
          </span>

          <span
            style={{
              fontFamily: sans,
              fontSize: "var(--tellian-station-size)",
              letterSpacing: "0.01em",
              lineHeight: 1.2,
              userSelect: "none",
              overflow: "hidden",
              textOverflow: "ellipsis",
              color: isActive ? aktivFarbe : ruheFarbe,
              transition: `color ${durationMs}ms ${EASE.snap}`,
            }}
          >
            {kurz ? section.labelKurz : section.label}
          </span>
        </button>
      );
    });
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
      gap: "clamp(12px, 2vw, 32px)",
      pointerEvents: schicht === "griff" ? "auto" : "none",
      ...(maske ? { WebkitMaskImage: maske, maskImage: maske } : null),
    };
  };

  return (
    <nav
      ref={navRef}
      aria-label="Sektion-Navigation"
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 150,
        height: "var(--tellian-station-height)",
        /* Keine eigene Fläche, keine Trennlinie. */
        background: "transparent",
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
            {reihe(schicht)}
          </div>
        ) : null,
      )}
      <div style={schichtStil("griff")}>{reihe("griff")}</div>

      <style>{`
        .tellian-station-ziel:focus-visible {
          outline: 2px solid var(--tellian-muted);
          outline-offset: 4px;
        }
        @media (prefers-reduced-motion: reduce) {
          nav[aria-label="Sektion-Navigation"],
          nav[aria-label="Sektion-Navigation"] * { transition: none !important; }
        }
      `}</style>
    </nav>
  );
}
