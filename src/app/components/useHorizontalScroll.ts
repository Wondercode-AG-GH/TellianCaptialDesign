import { useRef, useEffect, useLayoutEffect, useCallback, useState } from "react";

import { SECTIONS } from "../sections";

// Organic cubic-bezier feel via lerp factor
const LERP_FACTOR = 0.065;
const WHEEL_MULTIPLIER = 1.0;

/** Entprellung für Neumessungen nach Resize / Layoutwechsel. */
const REMEASURE_DEBOUNCE_MS = 100;

/**
 * Eine zur Laufzeit vermessene Sektion.
 *
 * Die Offsets werden per `offsetLeft` am echten DOM-Knoten abgegriffen,
 * nicht aus den vw-Werten zurückgerechnet. Genau dieser Rückrechen-Fehler
 * steckt heute in Navigation.tsx und DotNavigation.tsx, deren Zielwerte
 * von einer Gesamtbreite ausgehen, die es nie gab.
 */
export interface MeasuredSection {
  index: number;
  /** Linker Rand, containerrelativ, px. */
  offset: number;
  width: number;
  /** offset + width */
  end: number;
  /** Rastziel — offset, auf den Scrollbereich geklemmt. */
  snap: number;
}

interface UseHorizontalScrollOptions {
  /** When true the hook becomes a no-op (vertical mode) */
  disabled?: boolean;
}

export function useHorizontalScroll(opts?: UseHorizontalScrollOptions) {
  const disabled = opts?.disabled ?? false;

  const containerRef = useRef<HTMLDivElement>(null);
  const targetScroll = useRef(0);
  const currentScroll = useRef(0);
  const rafId = useRef<number>(0);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [scrollX, setScrollX] = useState(0);
  const maxScroll = useRef(0);
  const touchStartX = useRef(0);
  const touchStartScroll = useRef(0);
  const [scrollDirection, setScrollDirection] = useState<"forward" | "backward" | "idle">("idle");
  const prevScroll = useRef(0);
  const directionTimer = useRef<number>(0);

  // Scroll-lock: when true, wheel/touch/key events skip updating targetScroll.
  const scrollLockRef = useRef(false);

  /* ═══════════════════════════════════════════════════════════
     SEKTIONS-REGISTRY
     Sechs Panel-Refs, Offsets zur Laufzeit am DOM gemessen.
     ═══════════════════════════════════════════════════════════ */
  const panelsRef = useRef<(HTMLDivElement | null)[]>([]);
  const measuredRef = useRef<MeasuredSection[]>([]);

  /* Ref-Callbacks einmalig anlegen — als Inline-Lambda würde React sie
     bei jedem Render mit null und dann erneut mit dem Knoten aufrufen. */
  const panelSettersRef = useRef<Array<(el: HTMLDivElement | null) => void> | null>(null);
  if (!panelSettersRef.current) {
    panelSettersRef.current = SECTIONS.map(
      (_, i) => (el: HTMLDivElement | null) => {
        panelsRef.current[i] = el;
      }
    );
  }

  /** Ref-Callback für das Panel an Position `index`. */
  const panelRef = useCallback(
    (index: number) => panelSettersRef.current![index],
    []
  );

  const updateMaxScroll = useCallback(() => {
    if (!containerRef.current) return;
    maxScroll.current =
      containerRef.current.scrollWidth - containerRef.current.clientWidth;
  }, []);

  /**
   * Misst Scrollbereich und alle Sektions-Offsets neu.
   *
   * `offsetLeft` ist relativ zum `offsetParent`; der Track trägt dafür
   * `position: relative`, damit die Werte per Definition containerrelativ
   * sind und nicht davon abhängen, welcher Vorfahre gerade positioniert ist.
   */
  const measure = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;

    updateMaxScroll();
    const max = maxScroll.current;

    measuredRef.current = SECTIONS.map((_, i) => {
      const el = panelsRef.current[i];
      const offset = el?.offsetLeft ?? 0;
      const width = el?.offsetWidth ?? 0;
      return {
        index: i,
        offset,
        width,
        end: offset + width,
        snap: Math.max(0, Math.min(offset, max)),
      };
    });
  }, [updateMaxScroll]);

  /** Aktuelle Messung — Lesezugriff für Navigation und Debug. */
  const getSections = useCallback(() => measuredRef.current, []);

  /* Messen nach Mount und bei jeder Layoutänderung.
     `resize` allein reicht nicht: nachgeladene Schriften und Bilder
     verschieben die Breite des Filmstrips in Sektion 5, ohne dass das
     Fenster seine Grösse ändert. Dafür der ResizeObserver auf dem Track. */
  useLayoutEffect(() => {
    if (disabled) return;
    const container = containerRef.current;
    if (!container) return;

    measure();

    let timer = 0;
    const scheduleRemeasure = () => {
      clearTimeout(timer);
      timer = window.setTimeout(measure, REMEASURE_DEBOUNCE_MS);
    };

    const observer = new ResizeObserver(scheduleRemeasure);
    observer.observe(container);
    window.addEventListener("resize", scheduleRemeasure);

    return () => {
      clearTimeout(timer);
      observer.disconnect();
      window.removeEventListener("resize", scheduleRemeasure);
    };
  }, [disabled, measure]);

  const clampTarget = useCallback(() => {
    targetScroll.current = Math.max(
      0,
      Math.min(targetScroll.current, maxScroll.current)
    );
  }, []);

  // Smooth animation loop using lerp
  const animate = useCallback(() => {
    const diff = targetScroll.current - currentScroll.current;

    // Only update if the difference is meaningful
    if (Math.abs(diff) > 0.5) {
      currentScroll.current += diff * LERP_FACTOR;
    } else {
      currentScroll.current = targetScroll.current;
    }

    if (containerRef.current) {
      containerRef.current.scrollLeft = currentScroll.current;
    }

    // Update progress
    if (maxScroll.current > 0) {
      setScrollProgress(currentScroll.current / maxScroll.current);
      setScrollX(currentScroll.current);

      // Track scroll direction with a small threshold to avoid jitter
      const delta = currentScroll.current - prevScroll.current;
      if (Math.abs(delta) > 0.3) {
        const dir = delta > 0 ? "forward" : "backward";
        setScrollDirection(dir);
        clearTimeout(directionTimer.current);
        directionTimer.current = window.setTimeout(() => setScrollDirection("idle"), 400);
      }
      prevScroll.current = currentScroll.current;
    }

    rafId.current = requestAnimationFrame(animate);
  }, []);

  // Navigate to a specific progress (0-1)
  const scrollTo = useCallback(
    (progress: number) => {
      updateMaxScroll();
      targetScroll.current = progress * maxScroll.current;
      clampTarget();
    },
    [updateMaxScroll, clampTarget]
  );

  useEffect(() => {
    /* ── Vertical mode: no horizontal hijack ── */
    if (disabled) return;

    const container = containerRef.current;
    if (!container) return;

    updateMaxScroll();

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      if (scrollLockRef.current) return;
      updateMaxScroll();
      const delta =
        Math.abs(e.deltaY) > Math.abs(e.deltaX) ? e.deltaY : e.deltaX;
      targetScroll.current += delta * WHEEL_MULTIPLIER;
      clampTarget();
    };

    const handleTouchStart = (e: TouchEvent) => {
      touchStartX.current = e.touches[0].clientX;
      touchStartScroll.current = targetScroll.current;
    };

    const handleTouchMove = (e: TouchEvent) => {
      e.preventDefault();
      if (scrollLockRef.current) return;
      const diff = touchStartX.current - e.touches[0].clientX;
      targetScroll.current = touchStartScroll.current + diff * 1.5;
      clampTarget();
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (scrollLockRef.current) return;
      updateMaxScroll();
      if (e.key === "ArrowRight" || e.key === "ArrowDown") {
        targetScroll.current += window.innerWidth * 0.6;
        clampTarget();
      } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
        targetScroll.current -= window.innerWidth * 0.6;
        clampTarget();
      }
    };

    const handleResize = () => {
      updateMaxScroll();
      clampTarget();
    };

    container.addEventListener("wheel", handleWheel, { passive: false });
    container.addEventListener("touchstart", handleTouchStart, {
      passive: true,
    });
    container.addEventListener("touchmove", handleTouchMove, {
      passive: false,
    });
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("resize", handleResize);

    // Start animation loop
    rafId.current = requestAnimationFrame(animate);

    return () => {
      container.removeEventListener("wheel", handleWheel);
      container.removeEventListener("touchstart", handleTouchStart);
      container.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(rafId.current);
    };
  }, [disabled, animate, updateMaxScroll, clampTarget]);

  return { containerRef, panelRef, getSections, scrollProgress, scrollX, scrollTo, scrollDirection, scrollLockRef, targetScroll, currentScroll, disabled };
}
