import { useRef, useEffect, useLayoutEffect, useCallback, useState } from "react";

import { SECTIONS, type SectionDef } from "../sections";
import { EASE } from "../../styles/motion";
import { usePrefersReducedMotion } from "./usePrefersReducedMotion";

/* ═══════════════════════════════════════════════════════════
   HORIZONTALER SCRUB — der Seiten-Scroll treibt den Track

   Umbau 12.09: vorher war der Track ein horizontaler Overflow-
   Container, dessen scrollLeft wir aus abgefangenen Wheel-/Touch-/
   Tastatur-Ereignissen selbst schrieben. Das funktionierte, hiess
   aber: jede Eingabeart musste nachgebaut werden (Trackpad-Momentum
   kam aus dem Event-Strom, Touch-Ausrollen war eine eigene Reibungs-
   simulation, ein Scrollbalken existierte nicht).

   Jetzt scrollt die SEITE — vertikal, nativ, mit ihrem eigenen
   Balken. Drei Bausteine:

     SPACER      ein Element im Fluss, dessen Höhe die Scrollstrecke
                 erzeugt: Fensterhöhe + (Trackbreite − Fensterbreite).
                 Ein vertikales Pixel entspricht damit exakt einem
                 horizontalen — auch Station 04 (breiter als der
                 Viewport) fliesst korrekt ein, weil die STRECKE aus
                 der gemessenen Gesamtbreite kommt, nicht aus
                 Anzahl × 100vw.
     VIEWPORT    position:sticky, 100vh, overflow:hidden — bleibt
                 stehen, während der Spacer unter ihm durchscrollt.
     TRACK       die Stationen in einer Reihe, verschoben per
                 transform:translate3d(−x). Nur transform, nie
                 left/margin — die Bewegung bleibt beim Kompositor.

   Der Gewinn: Mausrad, Trackpad samt Momentum, Scrollbalken-Ziehen,
   Tastatur und Touch sind NATIVES Seitenscrollen — nichts wird
   abgefangen oder nachgebaut. Wir lesen nur window.scrollY und
   ziehen den Track mit kurzer Zeitkonstante nach.

   KEIN Einrasten, keine Rastpunkte, keine Commit-Schwellen: die
   Position folgt der Eingabe, und wo die Bewegung ausläuft, bleibt
   sie stehen — auch mitten zwischen zwei Stationen. Animiert wird
   nur, was ein BEFEHL ist (Stationsleiste, Deep-Link): eine
   zeitlich begrenzte Fahrt des Scrollwerts, jederzeit durch neue
   Eingabe unterbrechbar.
   ═══════════════════════════════════════════════════════════ */

/* ═══════════════════════════════════════════════════════════
   ABSTIMMUNG AM GERÄT
   ═══════════════════════════════════════════════════════════ */

/**
 * Zeitkonstante der Glättung, in ms.
 *
 * Der Track holt je Frame rund 53 % seines Rückstands auf den
 * Scrollwert auf. Bei zusammenhängender Trackpad-Eingabe hinkt er
 * damit weniger als eine Framebewegung nach — unsichtbar, kein
 * «Sirup». Ein Mausrad-Rastpunkt von ~100px gleitet über etwa fünf
 * Frames hinein, statt zu springen. Am Gerät justiert (22 → weich,
 * ohne spürbare Abkopplung); 0 wäre exakt 1:1 und bei Rad-Stufen
 * ruckelig, deutlich mehr fühlte sich nach Nachlauf an.
 */
const SMOOTH_TAU_MS = 22;

/** Dauer eines befohlenen Sprungs (Stationsleiste, Direktsprung). */
const JUMP_MS = 600;

/** Kurve dafür — s. EASE.snap in motion.ts. */
const JUMP_EASE = EASE.snapArr;

/**
 * Tiefe während der Bewegung: Bildflächen laufen langsamer als die
 * Textebene. Der Versatz hängt an der GESCHWINDIGKEIT — null im
 * Stillstand, und beim Ausrollen verschwindet er von selbst.
 */
const LAYER_SPEED = 0.88;

/** Sicherheitszuschlag auf den Überstand der Ebenen. */
const LAYER_OVERSCAN_MARGIN = 1.15;

/** Geschwindigkeit in px/ms, ab der der Versatz seinen Scheitel hält. */
const LAYER_FULL_VELOCITY = 3.5;

/**
 * Überdeckung, ab der eine Sektion als betreten gilt — 0.75 heisst:
 * ein Viertel muss im Bild sein. Treibt die Eintrittsanimationen;
 * deren Latch (in App) sorgt dafür, dass beim Vor- und Zurück-
 * scrubben nichts erneut animiert.
 */
const ENTER_FRACTION = 0.75;

/** Entprellung für Neumessungen nach Resize / Layoutwechsel. */
const REMEASURE_DEBOUNCE_MS = 100;

/* ═══════════════════════════════════════════════════════════
   CSS-VARIABLEN
   ═══════════════════════════════════════════════════════════ */

/** Versatz der zurückgesetzten Ebenen — Stil statt React-State,
 *  damit kein Render pro Frame anfällt. */
const LAG_VAR = "--tellian-tween-lag";

/** Überstand, den eine zurückgesetzte Ebene über ihren Ausschnitt
 *  hinaus braucht. */
const OVERSCAN_VAR = "--tellian-tween-overscan";

/* ═══════════════════════════════════════════════════════════
   EASING
   ═══════════════════════════════════════════════════════════ */

function cubicBezier(x1: number, y1: number, x2: number, y2: number) {
  const cx = 3 * x1;
  const bx = 3 * (x2 - x1) - cx;
  const ax = 1 - cx - bx;
  const cy = 3 * y1;
  const by = 3 * (y2 - y1) - cy;
  const ay = 1 - cy - by;

  const sampleX = (t: number) => ((ax * t + bx) * t + cx) * t;
  const sampleY = (t: number) => ((ay * t + by) * t + cy) * t;
  const slopeX = (t: number) => (3 * ax * t + 2 * bx) * t + cx;

  return (x: number): number => {
    if (x <= 0) return 0;
    if (x >= 1) return 1;
    let t = x;
    for (let i = 0; i < 8; i++) {
      const diff = sampleX(t) - x;
      if (Math.abs(diff) < 1e-5) return sampleY(t);
      const slope = slopeX(t);
      if (Math.abs(slope) < 1e-6) break;
      t -= diff / slope;
    }
    let lo = 0;
    let hi = 1;
    t = x;
    for (let i = 0; i < 20; i++) {
      const value = sampleX(t);
      if (Math.abs(value - x) < 1e-5) break;
      if (value < x) lo = t;
      else hi = t;
      t = (lo + hi) / 2;
    }
    return sampleY(t);
  };
}

const easeJump = cubicBezier(...JUMP_EASE);

/* ═══════════════════════════════════════════════════════════
   TYPEN
   ═══════════════════════════════════════════════════════════ */

export interface MeasuredSection {
  index: number;
  offset: number;
  width: number;
  end: number;
  /** Auf den Scrollbereich geklemmter Offset — Ziel für Sprünge. */
  snap: number;
}

/** Befohlene Fahrt des Scrollwerts. Freies Scrubben erzeugt keine. */
interface Jump {
  from: number;
  to: number;
  start: number;
  duration: number;
}

type ScrollDirection = "forward" | "backward" | "idle";

/** Momentaufnahme für das Debug-Overlay. */
export interface ScrollDebugInfo {
  events: number;
  delta: number;
  gap: number;
  velocity: number;
  lagPx: number;
  position: number;
  progressPct: number;
  index: number;
  commanded: boolean;
}

function createDebugInfo(): ScrollDebugInfo {
  return {
    events: 0, delta: 0, gap: 0, velocity: 0, lagPx: 0,
    position: 0, progressPct: 0, index: 0, commanded: false,
  };
}

interface UseHorizontalScrollOptions {
  /** When true the hook becomes a no-op (vertical mode) */
  disabled?: boolean;
  /** Eigene Stationenliste (Solutions). Muss referenzstabil sein. */
  sektionen?: readonly SectionDef[];
  /**
   * Sperrt den Seiten-Scroll, ohne den Hook abzubauen — für offene
   * Overlays und die Intro-Phase. Umgesetzt als overflow:hidden am
   * Wurzelelement: der Scrollwert bleibt exakt stehen, nach dem
   * Schliessen ist die Scrub-Position unverändert.
   */
  locked?: boolean;
  /** Sektion, die beim ersten Aufbau eingenommen wird — ohne Animation. */
  initialIndex?: number;
}

/* ═══════════════════════════════════════════════════════════
   HOOK
   ═══════════════════════════════════════════════════════════ */

export function useHorizontalScroll(opts?: UseHorizontalScrollOptions) {
  const disabled = opts?.disabled ?? false;
  const locked = opts?.locked ?? false;
  const sektionen = opts?.sektionen ?? SECTIONS;
  const anzahl = sektionen.length;
  const initialIndex = Math.max(0, Math.min(anzahl - 1, opts?.initialIndex ?? 0));
  const reducedMotion = usePrefersReducedMotion();

  /** Der Track — die Stationsreihe, verschoben per transform. */
  const containerRef = useRef<HTMLDivElement>(null);
  /** Der Spacer im Fluss — seine Höhe ist die Scrollstrecke. */
  const spacerRef = useRef<HTMLDivElement>(null);
  /** Der sticky-Ausschnitt über dem Track. */
  const viewportRef = useRef<HTMLDivElement>(null);

  /* ── Registry ── */
  const panelsRef = useRef<(HTMLDivElement | null)[]>([]);
  const measuredRef = useRef<MeasuredSection[]>([]);
  const maxScrollRef = useRef(0);
  const peakLagRef = useRef(0);

  /* ── Position ──
     `target` ist der native Scrollwert, `pos` zieht mit kurzer
     Zeitkonstante nach. Mehr Zustand gibt es nicht. */
  const targetRef = useRef(0);
  const posRef = useRef(0);
  const velocityRef = useRef(0);
  const rafRef = useRef(0);
  const lastFrameRef = useRef(0);
  const initialisedRef = useRef(false);
  const jumpRef = useRef<Jump | null>(null);
  const jumpRafRef = useRef(0);

  const debugRef = useRef<ScrollDebugInfo>(createDebugInfo());
  const lastEventTsRef = useRef(0);

  const [activeIndex, setActiveIndex] = useState(initialIndex);
  const [visibleRange, setVisibleRange] = useState<[number, number]>([initialIndex, initialIndex]);
  const [scrollDirection, setScrollDirection] = useState<ScrollDirection>("idle");

  const lockedRef = useRef(locked);
  const reducedMotionRef = useRef(reducedMotion);
  useLayoutEffect(() => {
    lockedRef.current = locked;
    reducedMotionRef.current = reducedMotion;
  });

  /* ═══════════════════════════════════════════════════════
     REGISTRY
     ═══════════════════════════════════════════════════════ */

  const panelSettersRef = useRef<Array<(el: HTMLDivElement | null) => void> | null>(null);
  if (!panelSettersRef.current) {
    panelSettersRef.current = sektionen.map(
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

  const measure = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;

    /* Trackbreite gegen Fensterbreite — der Track ist kein Overflow-
       Container mehr, aber scrollWidth liefert weiterhin die volle
       Inhaltsbreite (transform geht nicht in die Messung ein). */
    const viewportW = window.innerWidth;
    const max = Math.max(0, container.scrollWidth - viewportW);
    maxScrollRef.current = max;

    /* Die Scrollstrecke der Seite: Fensterhöhe + horizontale Strecke.
       Damit entspricht ein vertikales Pixel exakt einem horizontalen
       und der native Balken bildet den Fortschritt 1:1 ab. */
    if (spacerRef.current) {
      spacerRef.current.style.height = `${window.innerHeight + max}px`;
    }

    peakLagRef.current = viewportW * (1 - LAYER_SPEED) * 0.25;
    container.style.setProperty(
      OVERSCAN_VAR,
      `${(peakLagRef.current * LAYER_OVERSCAN_MARGIN).toFixed(2)}px`
    );

    measuredRef.current = sektionen.map((_, i) => {
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
  }, []);

  const getSections = useCallback(() => measuredRef.current, []);

  /** Sektion unter der Mitte des sichtbaren Ausschnitts. */
  const indexAt = useCallback((pos: number) => {
    const sections = measuredRef.current;
    if (!sections.length) return 0;
    const centre = pos + window.innerWidth / 2;
    for (let i = sections.length - 1; i >= 0; i--) {
      if (centre >= sections[i].offset) return i;
    }
    return 0;
  }, []);

  /* ═══════════════════════════════════════════════════════
     BEWEGUNG
     ═══════════════════════════════════════════════════════ */

  const clamp = useCallback(
    (v: number) => Math.max(0, Math.min(v, maxScrollRef.current)),
    []
  );

  /** Schreibt die Trackposition — NUR transform, Compositor-Ebene. */
  const write = useCallback((pos: number, velocity: number) => {
    const container = containerRef.current;
    if (!container) return;
    container.style.transform = `translate3d(${(-pos).toFixed(2)}px, 0, 0)`;

    const lag = reducedMotionRef.current
      ? 0
      : Math.max(-1, Math.min(1, velocity / LAYER_FULL_VELOCITY)) * peakLagRef.current;
    container.style.setProperty(LAG_VAR, `${lag.toFixed(2)}px`);
  }, []);

  /** Meldet die Sektion unter der Bildmitte nach aussen. */
  const syncIndex = useCallback(() => {
    const idx = indexAt(posRef.current);
    if (idx !== debugRef.current.index) {
      debugRef.current.index = idx;
      setActiveIndex(idx);
    }

    const sections = measuredRef.current;
    const viewport = window.innerWidth;
    const left = posRef.current;
    const right = left + viewport;
    let from = -1;
    let to = -1;
    for (const sec of sections) {
      const overlap = Math.min(sec.end, right) - Math.max(sec.offset, left);
      if (overlap >= Math.min(viewport, sec.width) * (1 - ENTER_FRACTION)) {
        if (from < 0) from = sec.index;
        to = sec.index;
      }
    }
    if (from >= 0) {
      setVisibleRange((prev) =>
        prev[0] === from && prev[1] === to ? prev : [from, to]
      );
    }
  }, [indexAt]);

  /** Nachzieh-Schleife: lerpt den Track zum Scrollwert. Läuft nur,
   *  solange Rückstand besteht — im Stillstand kein rAF. */
  const tick = useCallback(() => {
    const now = performance.now();
    const dt = Math.max(1, Math.min(64, now - (lastFrameRef.current || now - 16)));
    lastFrameRef.current = now;

    let moving = false;
    const residual = targetRef.current - posRef.current;
    if (Math.abs(residual) > 0.05) {
      const step = residual * (1 - Math.exp(-dt / SMOOTH_TAU_MS));
      velocityRef.current = step / dt;
      posRef.current += step;
      moving = true;
    } else {
      posRef.current = targetRef.current;
      velocityRef.current = 0;
      setScrollDirection("idle");
    }

    write(posRef.current, velocityRef.current);

    const dbg = debugRef.current;
    dbg.position = Math.round(posRef.current);
    dbg.velocity = +velocityRef.current.toFixed(2);
    dbg.lagPx = Math.round(targetRef.current - posRef.current);
    dbg.progressPct = maxScrollRef.current
      ? Math.round((posRef.current / maxScrollRef.current) * 100)
      : 0;
    dbg.commanded = !!jumpRef.current;

    syncIndex();

    rafRef.current = moving ? requestAnimationFrame(tick) : 0;
    if (!moving) lastFrameRef.current = 0;
  }, [write, syncIndex]);

  const startRaf = useCallback(() => {
    if (!rafRef.current) {
      lastFrameRef.current = 0;
      rafRef.current = requestAnimationFrame(tick);
    }
  }, [tick]);

  /** Nimmt den nativen Scrollwert auf — der ganze Scroll-Pfad. */
  const follow = useCallback(() => {
    const before = targetRef.current;
    const next = clamp(window.scrollY);
    if (next === before) return;
    targetRef.current = next;
    setScrollDirection(next > before ? "forward" : "backward");

    const now = performance.now();
    const dbg = debugRef.current;
    dbg.events++;
    dbg.delta = Math.round(next - before);
    dbg.gap = Math.round(now - lastEventTsRef.current);
    lastEventTsRef.current = now;

    if (reducedMotionRef.current) {
      /* Bewegung DIREKT an den Scroll gekoppelt — keine Glättung,
         keine Animation obendrauf. */
      posRef.current = next;
      velocityRef.current = 0;
      write(next, 0);
      syncIndex();
      return;
    }
    startRaf();
  }, [clamp, startRaf, write, syncIndex]);

  /** Bricht eine befohlene Fahrt ab — jede echte Eingabe darf das. */
  const cancelJump = useCallback(() => {
    jumpRef.current = null;
    if (jumpRafRef.current) {
      cancelAnimationFrame(jumpRafRef.current);
      jumpRafRef.current = 0;
    }
  }, []);

  /**
   * Befohlene Fahrt zu einer Sektion (Stationsleiste, Deep-Link).
   *
   * Animiert wird der SCROLLWERT — der Track folgt über denselben
   * Pfad wie bei jeder Eingabe, und der native Balken fährt mit.
   * Kein Fixieren: die Fahrt ist jederzeit unterbrechbar, danach
   * ist frei weiterscrubben.
   */
  const jumpToIndex = useCallback(
    (next: number) => {
      const sections = measuredRef.current;
      if (!sections.length) return;

      const index = Math.max(0, Math.min(anzahl - 1, next));
      const to = clamp(sections[index].snap);

      setActiveIndex(index);
      debugRef.current.index = index;

      if (reducedMotionRef.current || Math.abs(to - window.scrollY) < 0.5) {
        cancelJump();
        window.scrollTo(0, to);
        return;
      }

      setScrollDirection(to > posRef.current ? "forward" : "backward");
      cancelJump();
      const jump: Jump = {
        from: window.scrollY,
        to,
        start: performance.now(),
        duration: JUMP_MS,
      };
      jumpRef.current = jump;

      const fahrt = () => {
        if (jumpRef.current !== jump) return;
        const t = Math.min(1, (performance.now() - jump.start) / jump.duration);
        window.scrollTo(0, jump.from + (jump.to - jump.from) * easeJump(t));
        if (t >= 1) {
          jumpRef.current = null;
          jumpRafRef.current = 0;
          return;
        }
        jumpRafRef.current = requestAnimationFrame(fahrt);
      };
      jumpRafRef.current = requestAnimationFrame(fahrt);
    },
    [clamp, cancelJump]
  );

  /** Direktsprung über einen Fortschrittswert 0–1 (Alt-Signatur). */
  const scrollTo = useCallback(
    (progress: number) => {
      const sections = measuredRef.current;
      const max = maxScrollRef.current;
      if (!sections.length || max <= 0) return;
      const targetPx = progress * max;
      let best = 0;
      let bestDist = Infinity;
      for (const section of sections) {
        const dist = Math.abs(section.snap - targetPx);
        if (dist < bestDist) {
          bestDist = dist;
          best = section.index;
        }
      }
      jumpToIndex(best);
    },
    [jumpToIndex]
  );

  /** Zurück an den Anfang, ohne Animation — Sprach-/Weltenwechsel. */
  const resetToStart = useCallback(() => {
    cancelJump();
    window.scrollTo(0, 0);
    posRef.current = 0;
    targetRef.current = 0;
    velocityRef.current = 0;
    write(0, 0);
    syncIndex();
    setScrollDirection("idle");
  }, [cancelJump, write, syncIndex]);

  /* ═══════════════════════════════════════════════════════
     SPERRE — Overlays und Intro halten den Seiten-Scroll an.
     Der Scrollwert bleibt dabei stehen; nach dem Schliessen ist
     die Scrub-Position exakt unverändert.
     ═══════════════════════════════════════════════════════ */

  useEffect(() => {
    if (disabled) return;
    /* Die Sperre liegt am BODY, nicht am Wurzelelement: overflow
       hidden am html setzt in Chrome den Scrollwert sofort auf 0 —
       die Scrub-Position wäre nach jedem Overlay verloren. Am body
       propagiert die Sperre nur die Scrollbarkeit ins Viewport:
       Eingaben sind blockiert, der Scrollwert bleibt exakt stehen,
       und programmatische Sprünge (Deep-Link während des Intros)
       greifen weiterhin. */
    const body = document.body;
    if (locked) {
      const prev = body.style.overflow;
      body.style.overflow = "hidden";
      return () => {
        body.style.overflow = prev;
      };
    }
  }, [disabled, locked]);

  /* ═══════════════════════════════════════════════════════
     MESSUNG
     ═══════════════════════════════════════════════════════ */

  useLayoutEffect(() => {
    if (disabled) return;
    const container = containerRef.current;
    if (!container) return;

    /* Der Browser darf beim Neuladen/Weltenwechsel keine alte
       Scrollposition wiederherstellen — der Startpunkt gehört der
       Registry (Deep-Link oder Anfang). */
    const prevRestoration = window.history.scrollRestoration;
    try { window.history.scrollRestoration = "manual"; } catch { /* alte Browser */ }

    measure();

    if (!initialisedRef.current) {
      initialisedRef.current = true;
      const start = measuredRef.current[initialIndex];
      const startPos = start ? start.snap : 0;
      window.scrollTo(0, startPos);
      posRef.current = startPos;
      targetRef.current = startPos;
      debugRef.current.index = initialIndex;
      write(startPos, 0);
      syncIndex();
    }

    let timer = 0;
    const remeasure = () => {
      /* Anker halten: dieselbe Sektion, derselbe Anteil in ihr —
         bei Fenster- oder Zoomänderung springt der Track nicht. */
      const idx = indexAt(posRef.current);
      const alt = measuredRef.current[idx];
      const frac = alt && alt.width > 0
        ? (posRef.current - alt.offset) / alt.width
        : 0;
      measure();
      const neu = measuredRef.current[idx];
      const next = clamp(neu ? neu.offset + frac * neu.width : posRef.current);
      cancelJump();
      window.scrollTo(0, next);
      posRef.current = next;
      targetRef.current = next;
      write(next, 0);
      syncIndex();
    };
    const scheduleRemeasure = () => {
      clearTimeout(timer);
      timer = window.setTimeout(remeasure, REMEASURE_DEBOUNCE_MS);
    };

    /* `resize` allein reicht nicht: nachgeladene Schriften und Bilder
       verschieben die Trackbreite, ohne dass das Fenster sich ändert. */
    const observer = new ResizeObserver(scheduleRemeasure);
    observer.observe(container);
    window.addEventListener("resize", scheduleRemeasure);

    return () => {
      clearTimeout(timer);
      observer.disconnect();
      window.removeEventListener("resize", scheduleRemeasure);
      try { window.history.scrollRestoration = prevRestoration; } catch { /* — */ }
    };
  }, [disabled, measure, write, clamp, indexAt, syncIndex, cancelJump, initialIndex]);

  /* ═══════════════════════════════════════════════════════
     EINGABE — fast nichts: der Browser scrollt selbst.
     ═══════════════════════════════════════════════════════ */

  useEffect(() => {
    if (disabled) return;

    /** Der ganze Scroll-Pfad: Scrollwert lesen, Track nachziehen. */
    const handleScroll = () => {
      /* Während einer befohlenen Fahrt schreibt die Fahrt selbst den
         Scrollwert — folgen ja, aber nicht als «Eingabe» werten. */
      follow();
    };

    /** Jede ECHTE Eingabe bricht eine laufende Fahrt ab (2.2). */
    const handleInput = () => {
      if (jumpRef.current) cancelJump();
    };

    /**
     * Waagrechte Trackpad-Gesten bleiben nutzbar: dominantes deltaX
     * wird auf den Seiten-Scroll gelegt. Alles andere fasst dieser
     * Handler nicht an — senkrechtes Scrollen läuft nativ.
     */
    const handleWheel = (e: WheelEvent) => {
      if (lockedRef.current) return;
      if (Math.abs(e.deltaX) <= Math.abs(e.deltaY)) return;
      e.preventDefault();
      if (jumpRef.current) cancelJump();
      window.scrollBy(0, e.deltaX);
    };

    /**
     * Tastaturfokus ausserhalb des Ausschnitts: der Browser scrollt
     * dafür den sticky-Ausschnitt (programmatisch geht das trotz
     * overflow:hidden). Wir übersetzen diesen Versatz in Seiten-
     * Scroll und setzen den Ausschnitt zurück — der Fokus wird
     * sichtbar, ohne dass zwei Scrollquellen entstehen.
     */
    const viewport = viewportRef.current;
    const handleViewportScroll = () => {
      if (!viewport) return;
      const sl = viewport.scrollLeft;
      const st = viewport.scrollTop;
      if (sl === 0 && st === 0) return;
      viewport.scrollLeft = 0;
      viewport.scrollTop = 0;
      cancelJump();
      window.scrollBy(0, sl + st);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("wheel", handleWheel, { passive: false });
    window.addEventListener("touchstart", handleInput, { passive: true });
    window.addEventListener("keydown", handleInput);
    viewport?.addEventListener("scroll", handleViewportScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("wheel", handleWheel);
      window.removeEventListener("touchstart", handleInput);
      window.removeEventListener("keydown", handleInput);
      viewport?.removeEventListener("scroll", handleViewportScroll);
      cancelAnimationFrame(rafRef.current);
      rafRef.current = 0;
      cancelJump();
    };
  }, [disabled, follow, cancelJump]);

  return {
    containerRef,
    spacerRef,
    viewportRef,
    panelRef,
    getSections,
    scrollTo,
    jumpToIndex,
    resetToStart,
    activeIndex,
    visibleRange,
    scrollDirection,
    debugRef,
    disabled,
  };
}

/** Abstimmungswerte für die Anzeige im Debug-Overlay. */
export const SCROLL_TUNING = {
  SMOOTH_TAU_MS,
  JUMP_MS,
  LAYER_SPEED,
  LAYER_FULL_VELOCITY,
} as const;

/**
 * CSS-Variable mit dem Ebenen-Versatz, gesetzt am Track.
 *
 *   transform: translate3d(var(--tellian-tween-lag, 0px), 0, 0)
 */
export const TWEEN_LAG_VAR = LAG_VAR;

/** Überstand, den eine versetzte Ebene je Seite braucht. */
export const TWEEN_OVERSCAN_VAR = OVERSCAN_VAR;
