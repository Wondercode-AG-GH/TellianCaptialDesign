import { useRef, useEffect, useState } from "react";

import { EASE } from "../../styles/motion";
import { useSectionEntered } from "./SectionEntry";
import { usePrefersReducedMotion } from "./usePrefersReducedMotion";

/* ═══════════════════════════════════════════════════════════
   ANIMATIONSPOLITIK

   Eintrittsanimationen laufen genau einmal pro Sektion und Sitzung
   und nie rückwärts. Vorher waren alle Werte reine Funktionen der
   Scrollposition: sie liefen bei jedem Betreten neu und beim
   Zurückscrollen rückwärts, und sie wurden nur deshalb neu
   berechnet, weil scrollX als State jeden Frame ein Re-Render des
   halben Baums auslöste.

   Mit der Sektions-Rastung trägt eine positionsgebundene Animation
   keine Information mehr — zwischen zwei Rastpunkten liegen 400ms
   Flug, keine Nutzerbewegung. Deshalb:

   • Kein scrollX mehr. Ausgelöst wird über den Eintritts-Latch
     (SectionEntry), gesetzt beim Absprung.
   • Keine Parallaxe auf Desktop.
   • Kein scrollgebundener Hero-Zoom.
   • Eintritte dauern zusammen höchstens ~650ms, damit sie innerhalb
     der 400ms Flugzeit weitgehend durch sind.
   • prefers-reduced-motion: kein Eintritt, Endzustand sofort.

   Die scrollX-Props bleiben in den Signaturen, damit die rund
   dreissig Aufrufstellen unverändert bleiben. Sie werden nicht mehr
   gelesen und verschwinden mit dem inhaltlichen Neubau der Sektionen.
   ═══════════════════════════════════════════════════════════ */

/* T_FAST (0.35s) ist entfallen — er gehörte zur positionsgebundenen
   Parallaxe, die es nicht mehr gibt. */
const T_MEDIUM = `0.55s ${EASE.nav}`;
const T_SLOW = `0.6s ${EASE.nav}`;
const T_CINEMATIC = `1.8s ${EASE.standard}`;

/* ═══════════════════════════════════════════════════════════
   EINTRITTS-ERKENNUNG
   ═══════════════════════════════════════════════════════════ */

/**
 * Vertikaler Zweig: rastet, sobald das Element weit genug im
 * Viewport steht. Der Latch fällt nie zurück.
 */
function useVerticalEntered(
  ref: React.RefObject<HTMLElement | null>,
  enabled: boolean
) {
  const [entered, setEntered] = useState(false);

  useEffect(() => {
    if (!enabled) return;
    const el = ref.current;
    if (!el) return;

    const check = () => {
      const rect = el.getBoundingClientRect();
      if (1 - rect.top / window.innerHeight > 0.1) setEntered(true);
    };

    window.addEventListener("scroll", check, { passive: true });
    check();
    return () => window.removeEventListener("scroll", check);
  }, [ref, enabled]);

  return entered;
}

/**
 * Einheitlicher Eintrittszustand für beide Pfade.
 *
 * Beide Hooks werden immer aufgerufen. Vorher lag `useVerticalProgress`
 * innerhalb eines `if (isVertical)`-Zweigs — ein Verstoss gegen die
 * Hook-Regeln, der beim Überqueren der 1024px-Grenze durch
 * Fenstergrössenänderung mit "rendered more hooks than during the
 * previous render" abstürzt.
 */
function useEntered(
  ref: React.RefObject<HTMLElement | null>,
  isVertical: boolean
): { entered: boolean; still: boolean } {
  const sectionEntered = useSectionEntered();
  const verticalEntered = useVerticalEntered(ref, isVertical);
  const reducedMotion = usePrefersReducedMotion();

  if (reducedMotion) return { entered: true, still: true };
  return { entered: isVertical ? verticalEntered : sectionEntered, still: false };
}

/** Transition-String oder "none" bei reduzierter Bewegung. */
const t = (still: boolean, value: string) => (still ? "none" : value);

/* ═══════════════════════════════════════════════════════════
   SCROLL IMAGE
   ═══════════════════════════════════════════════════════════ */
interface ScrollImageProps {
  src: string;
  alt?: string;
  className?: string;
  /** @deprecated Wird nicht mehr gelesen. */
  scrollX?: number;
  overlayOpacity?: number;
  lightOverlay?: boolean;
  isVertical?: boolean;
}

export function ScrollImage({
  src,
  className = "",
  isVertical = false,
}: ScrollImageProps) {
  const ref = useRef<HTMLDivElement>(null);
  const { entered, still } = useEntered(ref, isVertical);

  return (
    <div ref={ref} className={`relative overflow-hidden ${className}`}>
      <div
        className="absolute inset-0 will-change-transform"
        style={{
          transform: `scale(${entered ? 1 : 1.06})`,
          /* Wisch von links beim Eintritt — nur horizontal; der
             vertikale Zweig hatte nie einen Clip. */
          clipPath: isVertical
            ? undefined
            : `inset(0 ${entered ? 0 : 100}% 0 0)`,
          transition: t(still, `transform ${T_MEDIUM}, clip-path ${T_MEDIUM}`),
        }}
      >
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${src})` }}
        />
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   HERO IMAGE

   HIESS "HeroExpandingImage" UND EXPANDIERT NICHTS MEHR.
   Der scrollgebundene Zoom (scale 0.65 + 0.35 × progress) ist
   ersatzlos gelöscht: mit der Rastung gäbe es dafür keine
   Nutzerbewegung mehr, an die er sich binden könnte.

   Übrig ist ein Bildhalter ohne eigenes Verhalten. Er bleibt nur
   erhalten, damit die beiden Aufrufstellen unverändert bleiben, und
   entfällt ersatzlos beim inhaltlichen Neubau von Hero und
   Sektion 2 — dort genügt ein gewöhnliches Bild.
   ═══════════════════════════════════════════════════════════ */
interface HeroExpandingImageProps {
  src: string;
  /** @deprecated Wird nicht mehr gelesen. */
  scrollX?: number;
  className?: string;
  alt?: string;
  isVertical?: boolean;
}

export function HeroExpandingImage({ src, className = "" }: HeroExpandingImageProps) {
  return (
    <div className={`relative overflow-hidden ${className}`}>
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${src})` }}
      />
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   PARALLAX TEXT

   MACHT AUF DESKTOP KEINE PARALLAXE MEHR.
   Während einer 400ms-Tween trägt ein Versatz keine Information —
   er ist Bewegung ohne Aussage. Übrig bleibt dieselbe Einblendung
   wie bei ScrollFade.

   Die Komponente bleibt nur erhalten, damit die rund zwölf
   Aufrufstellen unverändert bleiben; sie entfällt ersatzlos beim
   inhaltlichen Neubau der jeweiligen Sektion. Neue Aufrufe bitte
   direkt mit ScrollFade.
   ═══════════════════════════════════════════════════════════ */
interface ParallaxTextProps {
  children: React.ReactNode;
  /** @deprecated Wird nicht mehr gelesen. */
  scrollX?: number;
  /** @deprecated Ohne Wirkung — keine Parallaxe mehr. */
  speed?: number;
  className?: string;
  style?: React.CSSProperties;
  noFade?: boolean;
  isVertical?: boolean;
}

export function ParallaxText({
  children,
  className = "",
  style,
  noFade = false,
  isVertical = false,
}: ParallaxTextProps) {
  const ref = useRef<HTMLDivElement>(null);
  const { entered, still } = useEntered(ref, isVertical);
  const shown = entered || noFade;

  return (
    <div
      ref={ref}
      className={`will-change-transform ${className}`}
      style={{
        transform: `translate3d(0, ${shown ? 0 : 24}px, 0)`,
        opacity: shown ? 1 : 0,
        transition: t(still, `transform ${T_SLOW}, opacity ${T_SLOW}`),
        ...style,
      }}
    >
      {children}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   SCROLL FADE
   ═══════════════════════════════════════════════════════════ */
interface ScrollFadeProps {
  children: React.ReactNode;
  /** @deprecated Wird nicht mehr gelesen. */
  scrollX?: number;
  className?: string;
  style?: React.CSSProperties;
  /** @deprecated Ohne Wirkung — Eintritt statt Positionsbindung. */
  fadeDistance?: number;
  yOffset?: number;
  noFade?: boolean;
  isVertical?: boolean;
}

export function ScrollFade({
  children,
  className = "",
  style,
  yOffset = 18,
  noFade = false,
  isVertical = false,
}: ScrollFadeProps) {
  const ref = useRef<HTMLDivElement>(null);
  const { entered, still } = useEntered(ref, isVertical);
  const shown = entered || noFade;

  return (
    <div
      ref={ref}
      className={`will-change-transform ${className}`}
      style={{
        transform: `translate3d(0, ${shown ? 0 : yOffset}px, 0)`,
        opacity: shown ? 1 : 0,
        transition: t(still, `transform ${T_MEDIUM}, opacity ${T_SLOW}`),
        ...style,
      }}
    >
      {children}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   REVEAL LINE
   ═══════════════════════════════════════════════════════════ */
interface RevealLineProps {
  /** @deprecated Wird nicht mehr gelesen. */
  scrollX?: number;
  className?: string;
  direction?: "horizontal" | "vertical";
  dark?: boolean;
  isVertical?: boolean;
}

export function RevealLine({
  className = "",
  direction = "horizontal",
  dark = false,
  isVertical: isVerticalMode = false,
}: RevealLineProps) {
  const ref = useRef<HTMLDivElement>(null);
  const { entered, still } = useEntered(ref, isVerticalMode);
  const scale = entered ? 1 : 0;

  return (
    <div
      ref={ref}
      className={`${direction === "horizontal" ? "h-[1px]" : "w-[1px]"} ${className}`}
      style={{
        backgroundColor: dark
          ? "rgba(30, 28, 25, 0.12)"
          : "rgba(181, 175, 166, 0.25)",
        transform:
          direction === "horizontal" ? `scaleX(${scale})` : `scaleY(${scale})`,
        transformOrigin: "left center",
        transition: t(still, `transform ${T_MEDIUM}`),
      }}
    />
  );
}

/* ═══════════════════════════════════════════════════════════
   CINEMATIC PANEL IMAGE
   ═══════════════════════════════════════════════════════════ */
interface CinematicPanelImageProps {
  src: string;
  alt?: string;
  className?: string;
  /** @deprecated Wird nicht mehr gelesen. */
  scrollX?: number;
  overlayOpacity?: number;
  objectPosition?: string;
  isVertical?: boolean;
}

export function CinematicPanelImage({
  src,
  alt = "",
  className = "",
  overlayOpacity = 0.06,
  objectPosition = "center center",
  isVertical: isVerticalMode = false,
}: CinematicPanelImageProps) {
  const ref = useRef<HTMLDivElement>(null);
  const { entered, still } = useEntered(ref, isVerticalMode);

  return (
    <div ref={ref} className={`relative overflow-hidden ${className}`}>
      <div
        className="absolute inset-0 will-change-transform"
        style={{
          transform: `scale(${entered ? 1 : 1.015}) translate3d(0, ${entered ? 0 : 3}px, 0)`,
          transition: t(still, `transform ${T_SLOW}`),
        }}
      >
        <img
          src={src}
          alt={alt}
          className="absolute inset-0 w-full h-full object-cover"
          style={{ objectPosition }}
        />
      </div>
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `linear-gradient(180deg, rgba(249,249,247,${overlayOpacity * 0.3}) 0%, rgba(26,25,22,${overlayOpacity}) 70%, rgba(26,25,22,${overlayOpacity * 1.2}) 100%)`,
          transition: t(still, `background ${T_CINEMATIC}`),
        }}
      />
    </div>
  );
}
