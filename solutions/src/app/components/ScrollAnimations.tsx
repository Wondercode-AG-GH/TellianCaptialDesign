import { useRef, useEffect, useState } from "react";

import { EASE } from "../../styles/motion";

const T_FAST = `0.35s ${EASE.nav}`;
const T_MEDIUM = `0.55s ${EASE.nav}`;
const T_SLOW = `0.8s ${EASE.nav}`;
const T_CINEMATIC = `1.8s ${EASE.standard}`;

/* ═══════════════════════════════════════════════════════════
   VERTICAL SCROLL PROGRESS (IntersectionObserver-based)
   Used by all animation components when isVertical=true.
   Returns 0→1 as element scrolls through viewport.
   ═══════════════════════════════════════════════════════════ */
function useVerticalProgress(ref: React.RefObject<HTMLElement | null>) {
  const [progress, setProgress] = useState(0);
  const [hasEntered, setHasEntered] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const onScroll = () => {
      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight;
      // 0 = element bottom at viewport bottom, 1 = element top at viewport top
      const p = 1 - (rect.top / vh);
      setProgress(Math.max(0, Math.min(1.5, p)));
      if (p > 0.1) setHasEntered(true);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll(); // initial
    return () => window.removeEventListener("scroll", onScroll);
  }, [ref]);

  return { progress, hasEntered };
}

/**
 * Returns a progress value for how far an element has scrolled
 * through the viewport horizontally.
 * ~0 = entering from right, ~0.5 = centered, ~1 = exiting left.
 */
function useElementProgress(
  ref: React.RefObject<HTMLElement | null>,
  scrollX: number
) {
  if (!ref.current) return 0.5;
  const rect = ref.current.getBoundingClientRect();
  const vw = window.innerWidth;
  if (!vw) return 0.5;
  const center = rect.left + rect.width / 2;
  const progress = 1 - center / vw;
  if (!isFinite(progress)) return 0.5;
  return Math.max(-0.5, Math.min(1.5, progress));
}

function useScrollMotion(scrollX: number) {
  const ref = useRef<HTMLDivElement>(null);
  const progress = useElementProgress(ref, scrollX);
  return { ref, progress };
}

/* ═══════════════════════════════════════════════════════════
   SCROLL IMAGE
   ═══════════════════════════════════════════════════════════ */
interface ScrollImageProps {
  src: string;
  alt?: string;
  className?: string;
  scrollX: number;
  overlayOpacity?: number;
  lightOverlay?: boolean;
  isVertical?: boolean;
}

export function ScrollImage({
  src,
  alt = "",
  className = "",
  scrollX,
  overlayOpacity = 0.18,
  lightOverlay = false,
  isVertical = false,
}: ScrollImageProps) {
  const ref = useRef<HTMLDivElement>(null);

  // Vertical mode: simple scale settle on enter
  const { progress: vProgress, hasEntered } = useVerticalProgress(ref);

  let scale: number;
  let clipRight: string;
  let overlayAlpha: number;

  if (isVertical) {
    scale = hasEntered ? 1.0 : 1.06;
    clipRight = "0%";
    overlayAlpha = overlayOpacity;
  } else {
    const progress = useElementProgress(ref, scrollX);
    scale =
      progress < 0.5
        ? 1.06 - progress * 0.12
        : 1.0 + (progress - 0.5) * 0.03;
    const clipProgress = Math.max(0, Math.min(1, (progress + 0.3) * 1.2));
    clipRight = `${(1 - clipProgress) * 100}%`;
    overlayAlpha =
      progress < 0.5
        ? overlayOpacity + (0.5 - progress) * 0.15
        : overlayOpacity + (progress - 0.5) * 0.15;
  }

  return (
    <div ref={ref} className={`relative overflow-hidden ${className}`}>
      <div
        className="absolute inset-0 will-change-transform"
        style={{
          transform: `scale(${scale})`,
          clipPath: isVertical ? undefined : `inset(0 ${clipRight} 0 0)`,
          transition: isVertical
            ? `transform 1.2s ${EASE.standard}`
            : `transform ${T_MEDIUM}, clip-path ${T_MEDIUM}`,
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
   HERO EXPANDING IMAGE
   ═══════════════════════════════════════════════════════════ */
interface HeroExpandingImageProps {
  src: string;
  scrollX: number;
  className?: string;
  isVertical?: boolean;
}

export function HeroExpandingImage({
  src,
  scrollX,
  className = "",
  isVertical = false,
}: HeroExpandingImageProps) {
  const ref = useRef<HTMLDivElement>(null);

  let scale: number;

  if (isVertical) {
    // On vertical: image is always full size, no scroll-linked expansion
    scale = 1.0;
  } else {
    const vw = (typeof window !== "undefined" && window.innerWidth) ? window.innerWidth : 1920;
    const progress = Math.max(0, Math.min(1, scrollX / (vw * 0.28)));
    scale = 0.65 + 0.35 * progress;
  }

  return (
    <div ref={ref} className={`relative overflow-hidden ${className}`}>
      <div
        className="absolute inset-0 will-change-transform"
        style={{
          transform: `scale(${scale})`,
          transformOrigin: isVertical ? "center center" : "top right",
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
   PARALLAX TEXT
   ═══════════════════════════════════════════════════════════ */
interface ParallaxTextProps {
  children: React.ReactNode;
  scrollX: number;
  speed?: number;
  className?: string;
  style?: React.CSSProperties;
  noFade?: boolean;
  isVertical?: boolean;
}

export function ParallaxText({
  children,
  scrollX,
  speed = 0.04,
  className = "",
  style,
  noFade = false,
  isVertical = false,
}: ParallaxTextProps) {
  const ref = useRef<HTMLDivElement>(null);

  let offset: number;
  let opacity: number;

  if (isVertical) {
    // Vertical: simple fade-in-up on enter
    const { hasEntered } = useVerticalProgress(ref);
    offset = hasEntered ? 0 : 24;
    opacity = hasEntered ? 1 : 0;
  } else {
    const progress = useElementProgress(ref, scrollX);
    const vw = (typeof window !== "undefined" && window.innerWidth) ? window.innerWidth : 1920;
    offset = (progress - 0.5) * speed * vw;
    const distFromCenter = Math.abs(progress - 0.5);
    opacity = noFade ? 1 : Math.max(0, Math.min(1, 1 - distFromCenter * 2.2));
  }

  return (
    <div
      ref={ref}
      className={`will-change-transform ${className}`}
      style={{
        transform: isVertical
          ? `translate3d(0, ${offset}px, 0)`
          : `translate3d(${offset}px, 0, 0)`,
        opacity,
        transition: isVertical
          ? `transform 0.8s ${EASE.standard}, opacity 0.8s ${EASE.nav}`
          : `transform ${T_FAST}, opacity ${T_SLOW}`,
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
  scrollX: number;
  className?: string;
  style?: React.CSSProperties;
  fadeDistance?: number;
  yOffset?: number;
  noFade?: boolean;
  isVertical?: boolean;
}

export function ScrollFade({
  children,
  scrollX,
  className = "",
  style,
  fadeDistance = 2.5,
  yOffset = 18,
  noFade = false,
  isVertical = false,
}: ScrollFadeProps) {
  const ref = useRef<HTMLDivElement>(null);

  let opacity: number;
  let y: number;

  if (isVertical) {
    const { hasEntered } = useVerticalProgress(ref);
    opacity = hasEntered ? 1 : 0;
    y = hasEntered ? 0 : yOffset;
  } else {
    const progress = useElementProgress(ref, scrollX);
    const distFromCenter = Math.abs(progress - 0.5);
    opacity = noFade ? 1 : Math.max(0, Math.min(1, 1 - distFromCenter * fadeDistance));
    y = noFade ? 0 : (1 - opacity) * yOffset * (progress < 0.5 ? 1 : -1);
  }

  return (
    <div
      ref={ref}
      className={`will-change-transform ${className}`}
      style={{
        transform: `translate3d(0, ${y}px, 0)`,
        opacity,
        transition: isVertical
          ? `transform 0.7s ${EASE.standard}, opacity 0.7s ${EASE.nav}`
          : `transform ${T_FAST}, opacity ${T_SLOW}`,
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
  scrollX: number;
  className?: string;
  direction?: "horizontal" | "vertical";
  dark?: boolean;
  isVertical?: boolean;
}

export function RevealLine({
  scrollX,
  className = "",
  direction = "horizontal",
  dark = false,
  isVertical: isVerticalMode = false,
}: RevealLineProps) {
  const ref = useRef<HTMLDivElement>(null);

  let scale: number;

  if (isVerticalMode) {
    const { hasEntered } = useVerticalProgress(ref);
    scale = hasEntered ? 1 : 0;
  } else {
    const progress = useElementProgress(ref, scrollX);
    scale = Math.max(0, Math.min(1, (progress + 0.2) * 1.5));
  }

  return (
    <div
      ref={ref}
      className={`${
        direction === "horizontal" ? "h-[1px]" : "w-[1px]"
      } ${className}`}
      style={{
        backgroundColor: dark
          ? "rgba(30, 28, 25, 0.12)"
          : "rgba(181, 175, 166, 0.25)",
        transform:
          direction === "horizontal"
            ? `scaleX(${scale})`
            : `scaleY(${scale})`,
        transformOrigin: "left center",
        transition: isVerticalMode
          ? `transform 0.8s ${EASE.standard}`
          : `transform ${T_MEDIUM}`,
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
  scrollX: number;
  overlayOpacity?: number;
  objectPosition?: string;
  isVertical?: boolean;
}

export function CinematicPanelImage({
  src,
  alt = "",
  className = "",
  scrollX,
  overlayOpacity = 0.06,
  objectPosition = "center center",
  isVertical: isVerticalMode = false,
}: CinematicPanelImageProps) {
  const ref = useRef<HTMLDivElement>(null);

  let scale: number;
  let shiftY: number;
  let overlayAlpha: number;

  if (isVerticalMode) {
    const { hasEntered } = useVerticalProgress(ref);
    scale = hasEntered ? 1.0 : 1.015;
    shiftY = hasEntered ? 0 : 3;
    overlayAlpha = overlayOpacity;
  } else {
    const { progress } = useScrollMotion(scrollX);
    const t = Math.max(0, Math.min(1, (progress + 0.3) * 0.7));
    const eased = t * t * (3 - 2 * t);
    scale = 1.015 - eased * 0.015;
    shiftY = (1 - eased) * 3;
    const distFromCenter = Math.abs(progress - 0.5);
    overlayAlpha = overlayOpacity + distFromCenter * 0.02;
  }

  return (
    <div ref={ref} className={`relative overflow-hidden ${className}`}>
      <div
        className="absolute inset-0 will-change-transform"
        style={{
          transform: `scale(${scale}) translate3d(0, ${shiftY}px, 0)`,
          transition: isVerticalMode
            ? `transform 1.2s ${EASE.standard}`
            : `transform 2.4s ${EASE.standard}`,
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
          background: `linear-gradient(180deg, rgba(249,249,247,${overlayAlpha * 0.3}) 0%, rgba(26,25,22,${overlayAlpha}) 70%, rgba(26,25,22,${overlayAlpha * 1.2}) 100%)`,
          transition: `background ${T_CINEMATIC}`,
        }}
      />
    </div>
  );
}
