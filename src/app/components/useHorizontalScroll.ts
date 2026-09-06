import { useRef, useEffect, useLayoutEffect, useCallback, useState } from "react";

import { SECTIONS, type SectionDef } from "../sections";
import { EASE } from "../../styles/motion";
import { usePrefersReducedMotion } from "./usePrefersReducedMotion";

/* ═══════════════════════════════════════════════════════════
   HORIZONTALER SCROLL — FREI

   Die Seite scrollt. Sie wechselt keine Abschnitte.

   Vorher stand hier ein Automat, der entschied, wo die Fläche
   stehenbleibt: Rastpunkte, Commit-Schwelle, Nachlauf-Erkennung,
   Feder, Gestenerkennung mit vier Scharfstell-Signalen. Jede Runde
   hat die Mechanik verfeinert und das Grundgefühl nicht verändert —
   solange die Maschine das Ziel bestimmt, wirkt es wie Automatik,
   egal wie weich die Kurve ist.

   Jetzt gilt: die Position folgt der Eingabe, sonst nichts. Wo die
   Bewegung ausläuft, bleibt sie stehen — auch mitten zwischen zwei
   Sektionen. Das ist erlaubt und der ganze Punkt.

   Das Ausrollen bauen wir NICHT nach. Ein Trackpad liefert seine
   Momentum-Phase bereits im Event-Strom mit; wir müssen sie nur nicht
   mehr abfangen und umdeuten. Der frühere freie Scroll fühlte sich
   träge an, weil jede Eingabe durch einen Lerp mit Faktor 0.065 lief
   — rund 550ms Nachlauf. Das ist kein Scrollen, das ist Sirup.

   Animiert wird nur noch, was ein BEFEHL ist: Navigation und
   Direktsprung. Ein Klick auf "Kontakt" darf fahren; ein Wisch nicht.
   ═══════════════════════════════════════════════════════════ */

/* ═══════════════════════════════════════════════════════════
   ABSTIMMUNG AM GERÄT
   ═══════════════════════════════════════════════════════════ */

/**
 * Zeitkonstante der Glättung, in ms.
 *
 * Klein genug, um bei zusammenhängender Eingabe nicht als Verzögerung
 * wahrgenommen zu werden, gross genug, um die Stufen eines Mausrads zu
 * verschleifen. Bei 22ms holt die Position je Frame rund 53% des
 * Rückstands auf: ein Trackpad-Delta von 15px hinkt im Beharrungs-
 * zustand um etwa 13px nach — weniger als ein Frame Bewegung, also
 * unsichtbar. Ein Rad-Rastpunkt von 100px gleitet über rund fünf
 * Frames hinein, statt zu springen.
 *
 * Auf 0 gesetzt wäre die Bewegung exakt 1:1 und ein Mausrad ruckelig.
 * Deutlich höher gesetzt fühlt es sich an wie das "smooth scrolling"
 * mancher Browser, also träge.
 */
const SMOOTH_TAU_MS = 22;

/** Dauer eines befohlenen Sprungs (Navigation, Direktsprung). */
const JUMP_MS = 600;

/** Kurve dafür — s. EASE.snap in motion.ts. */
const JUMP_EASE = EASE.snapArr;

/** Strecke, die Pfeiltasten und Bild auf/ab zurücklegen, als Anteil
 *  der Bildbreite. Wer mit den Pfeilen liest, will weiterlesen. */
const KEY_STEP_FRACTION = 0.9;

/** Dauer einer Tastaturbewegung. Kürzer als ein Sprung — es ist eine
 *  kleinere Strecke und soll sich wie Blättern anfühlen. */
const KEY_MS = 420;

/**
 * Tiefe während der Bewegung.
 *
 * Bildflächen laufen langsamer als die Textebene. Der Versatz hängt
 * jetzt an der GESCHWINDIGKEIT statt an einem Tween-Fortschritt: null
 * im Stillstand, wachsend mit der Bewegung, und beim Ausrollen
 * verschwindet er von selbst. Damit braucht er weder Anfang noch Ende
 * einer Transition zu kennen — es gibt keine mehr.
 */
const LAYER_SPEED = 0.88;

/** Sicherheitszuschlag auf den Überstand der Ebenen. */
const LAYER_OVERSCAN_MARGIN = 1.15;

/** Geschwindigkeit in px/ms, ab der der Versatz seinen Scheitel hält. */
const LAYER_FULL_VELOCITY = 3.5;

/**
 * Überdeckung, ab der eine Sektion als betreten gilt — als Anteil
 * gelesen: 0.75 bedeutet, ein Viertel muss im Bild sein.
 *
 * Getrennt von `activeIndex`, der an der Bildmitte hängt. Für die
 * Navigation ist die Mitte richtig — dort steht man "in" einer
 * Sektion. Für die Eintrittsanimation wäre sie zu spät: beim freien
 * Scrollen sieht man eine Sektion lange, bevor sie die Mitte erreicht,
 * und ihr Inhalt würde vor den Augen des Betrachters aufblenden.
 * Bei 0.75 beginnt der Eintritt, wenn ein Viertel der Sektion im Bild
 * ist.
 */
const ENTER_FRACTION = 0.75;

/** Entprellung für Neumessungen nach Resize / Layoutwechsel. */
const REMEASURE_DEBOUNCE_MS = 100;

/* ═══════════════════════════════════════════════════════════
   CSS-VARIABLEN
   ═══════════════════════════════════════════════════════════ */

/**
 * Versatz der zurückgesetzten Ebenen.
 *
 * Bewusst eine Stil-Eigenschaft am Container statt React-State: ein
 * State-Update pro Frame würde den Baum neu rendern und genau die
 * Frame-Zeiten kosten, die flüssiges Scrollen braucht. So bleibt die
 * Bewegung frei von React-Arbeit und die Ebenen werden vom Kompositor
 * verschoben.
 */
const LAG_VAR = "--tellian-tween-lag";

/**
 * Überstand, den eine zurückgesetzte Ebene über ihren Ausschnitt
 * hinaus braucht, damit der Versatz an der nachlaufenden Kante nichts
 * freilegt. Wird beim Messen aus dem Scheitel abgeleitet.
 */
const OVERSCAN_VAR = "--tellian-tween-overscan";

/* ═══════════════════════════════════════════════════════════
   EASING
   ═══════════════════════════════════════════════════════════ */

/**
 * Cubic-Bezier-Solver für befohlene Sprünge. CSS-Transitions helfen
 * hier nicht: bewegt wird `scrollLeft`, keine animierbare Eigenschaft.
 */
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

/**
 * Eine zur Laufzeit vermessene Sektion.
 *
 * Die Offsets werden per `offsetLeft` am echten DOM-Knoten abgegriffen,
 * nicht aus den vw-Werten zurückgerechnet. Gebraucht werden sie für
 * Navigation, URL und den Eintritts-Latch — nicht mehr, um die
 * Bewegung zu steuern.
 */
export interface MeasuredSection {
  index: number;
  offset: number;
  width: number;
  end: number;
  /** Auf den Scrollbereich geklemmter Offset — Ziel für Sprünge. */
  snap: number;
}

/** Befohlene Bewegung. Freies Scrollen erzeugt keine. */
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
  /** Aktuelle Geschwindigkeit in px/ms. */
  velocity: number;
  /** Rückstand der geglätteten Position auf die Eingabe, in px. */
  lagPx: number;
  position: number;
  progressPct: number;
  index: number;
  /** true, solange eine befohlene Bewegung läuft. */
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
  /** Eigene Stationenliste (Solutions). Ohne Angabe: die Registry
      der Hauptseite. Muss referenzstabil sein. */
  sektionen?: readonly SectionDef[];
  /**
   * Sperrt jede Eingabe, ohne den Hook abzubauen. Für offene Overlays
   * und die Intro-Phase: der Wheel-Handler ist dort schon durch
   * `pointer-events: none` blockiert, `keydown` hängt aber am Fenster.
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
  /* Solutions: dieselbe Engine faehrt eine zweite Stationenliste.
     Ohne Angabe gilt die Registry der Hauptseite — Verhalten dort
     unveraendert. Die Liste muss referenzstabil sein (Modul-
     konstante), sie haengt in Mess-Effekten. */
  const sektionen = opts?.sektionen ?? SECTIONS;
  const anzahl = sektionen.length;
  const initialIndex = Math.max(0, Math.min(anzahl - 1, opts?.initialIndex ?? 0));
  const reducedMotion = usePrefersReducedMotion();

  const containerRef = useRef<HTMLDivElement>(null);

  /* ── Registry ── */
  const panelsRef = useRef<(HTMLDivElement | null)[]>([]);
  const measuredRef = useRef<MeasuredSection[]>([]);
  const maxScrollRef = useRef(0);
  const peakLagRef = useRef(0);

  /* ── Position ──
     `target` nimmt die Eingabe 1:1 auf, `pos` zieht mit kurzer
     Zeitkonstante nach. Mehr Zustand gibt es nicht. */
  const targetRef = useRef(0);
  const posRef = useRef(0);
  const velocityRef = useRef(0);
  const rafRef = useRef(0);
  const lastFrameRef = useRef(0);
  const initialisedRef = useRef(false);
  const jumpRef = useRef<Jump | null>(null);

  /* ── Touch ── */
  const touchLastXRef = useRef(0);
  const touchVelocityRef = useRef(0);
  const touchLastTsRef = useRef(0);
  const glideRef = useRef(0);

  const debugRef = useRef<ScrollDebugInfo>(createDebugInfo());
  const lastEventTsRef = useRef(0);

  const [activeIndex, setActiveIndex] = useState(initialIndex);
  /** Bereich der Sektionen, die weit genug im Bild sind, um als
   *  betreten zu gelten. Treibt die Eintrittsanimationen. */
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

    const max = Math.max(0, container.scrollWidth - container.clientWidth);
    maxScrollRef.current = max;

    peakLagRef.current = container.clientWidth * (1 - LAYER_SPEED) * 0.25;
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

  /**
   * Sektion unter der Mitte des sichtbaren Ausschnitts.
   *
   * Nicht "nächstgelegener Rastpunkt": beim freien Scrollen steht man
   * ständig zwischen zwei Sektionen, und der nächstgelegene Offset
   * würde auf halber Strecke hin- und herspringen. Die Sektion, die
   * die Bildmitte überdeckt, wechselt dagegen genau einmal.
   */
  const indexAt = useCallback((pos: number) => {
    const sections = measuredRef.current;
    if (!sections.length) return 0;
    const centre = pos + (containerRef.current?.clientWidth ?? 0) / 2;
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

  const write = useCallback((pos: number, velocity: number) => {
    const container = containerRef.current;
    if (!container) return;
    container.scrollLeft = pos;

    /* Tiefe aus der Geschwindigkeit: null im Stillstand, Scheitel bei
       zügiger Fahrt, und beim Ausrollen verschwindet sie von selbst.
       Kein Anfang, kein Ende, keine Restverschiebung. */
    const lag = reducedMotionRef.current
      ? 0
      : Math.max(-1, Math.min(1, velocity / LAYER_FULL_VELOCITY)) * peakLagRef.current;
    container.style.setProperty(LAG_VAR, `${lag.toFixed(2)}px`);
  }, []);

  /**
   * Meldet die Sektion unter der Bildmitte nach aussen.
   *
   * Die URL schreibt App, nicht der Hook: dort ist bekannt, ob gerade
   * eine Unterseite offen ist, deren Pfad nicht überschrieben werden
   * darf. Der Hook liefert nur den Index.
   */
  const syncIndex = useCallback(() => {
    const idx = indexAt(posRef.current);
    if (idx !== debugRef.current.index) {
      debugRef.current.index = idx;
      setActiveIndex(idx);
    }

    /* Betreten = weit genug im Bild, unabhängig von der Bildmitte.
       Als BEREICH, nicht als höchster Index: beim Zurückscrollen
       kommt die neue Sektion von links, ihr Index ist kleiner. Ein
       monoton steigender Wert würde sie nie erfassen. */
    const sections = measuredRef.current;
    const viewport = containerRef.current?.clientWidth ?? 0;
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

  const tick = useCallback(() => {
    const now = performance.now();
    const dt = Math.max(1, Math.min(64, now - (lastFrameRef.current || now - 16)));
    lastFrameRef.current = now;

    const jump = jumpRef.current;
    let moving = false;

    if (jump) {
      /* Befohlene Bewegung — der einzige Fall, in dem ein Ziel
         durchgesetzt wird. */
      const t = jump.duration <= 0 ? 1 : Math.min(1, (now - jump.start) / jump.duration);
      const next = jump.from + (jump.to - jump.from) * easeJump(t);
      velocityRef.current = (next - posRef.current) / dt;
      posRef.current = next;
      targetRef.current = next;
      if (t >= 1) {
        jumpRef.current = null;
        velocityRef.current = 0;
        setScrollDirection("idle");
      } else {
        moving = true;
      }
    } else {
      /* Freies Scrollen: die Position zieht mit kurzer Zeitkonstante
         zum Ziel nach. Kein Filter mit langem Nachlauf — das Ausrollen
         steckt im Event-Strom, nicht in einer Glättung. */
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

  /** Nimmt Eingabe entgegen. Das ist der ganze Scroll-Pfad. */
  const push = useCallback(
    (delta: number) => {
      jumpRef.current = null;
      const before = targetRef.current;
      targetRef.current = clamp(targetRef.current + delta);
      if (targetRef.current !== before) {
        setScrollDirection(delta > 0 ? "forward" : "backward");
      }
      startRaf();
    },
    [clamp, startRaf]
  );

  /**
   * Befohlene Bewegung zu einer Sektion.
   *
   * Navigation und Direktsprung — das darf fahren, weil es ein Befehl
   * ist und keine Scrollbewegung.
   */
  const jumpToIndex = useCallback(
    (next: number) => {
      const sections = measuredRef.current;
      if (!sections.length) return;

      const index = Math.max(0, Math.min(anzahl - 1, next));
      const to = clamp(sections[index].snap);

      cancelAnimationFrame(glideRef.current);
      glideRef.current = 0;

      setActiveIndex(index);
      debugRef.current.index = index;

      if (Math.abs(to - posRef.current) < 0.5) {
        jumpRef.current = null;
        targetRef.current = to;
        return;
      }

      if (reducedMotionRef.current) {
        jumpRef.current = null;
        posRef.current = to;
        targetRef.current = to;
        write(to, 0);
        setScrollDirection("idle");
        return;
      }

      setScrollDirection(to > posRef.current ? "forward" : "backward");
      jumpRef.current = {
        from: posRef.current,
        to,
        start: performance.now(),
        duration: JUMP_MS,
      };
      startRaf();
    },
    [clamp, startRaf, write]
  );

  /**
   * Direktsprung über einen Fortschrittswert 0–1.
   *
   * Signatur bleibt für Navigation.tsx und DotNavigation.tsx erhalten;
   * abgebildet wird auf die nächstgelegene Sektion.
   */
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

  /* ═══════════════════════════════════════════════════════
     MESSUNG
     ═══════════════════════════════════════════════════════ */

  useLayoutEffect(() => {
    if (disabled) return;
    const container = containerRef.current;
    if (!container) return;

    measure();

    if (!initialisedRef.current) {
      initialisedRef.current = true;
      const start = measuredRef.current[initialIndex];
      if (start) {
        posRef.current = start.snap;
        targetRef.current = start.snap;
        debugRef.current.index = initialIndex;
        write(start.snap, 0);
      }
    }

    let timer = 0;
    const remeasure = () => {
      const index = indexAt(posRef.current);
      measure();
      /* Beim Resize wird die Position nur geklemmt, nicht auf einen
         Rastpunkt gezogen — es gibt keinen Zwang mehr, irgendwo zu
         stehen. Nur wenn sie aus dem Bereich fällt, wird der Anfang
         der zuletzt sichtbaren Sektion eingenommen. */
      const section = measuredRef.current[index];
      const next =
        posRef.current > maxScrollRef.current && section
          ? clamp(section.snap)
          : clamp(posRef.current);
      posRef.current = next;
      targetRef.current = next;
      jumpRef.current = null;
      write(next, 0);
    };
    const scheduleRemeasure = () => {
      clearTimeout(timer);
      timer = window.setTimeout(remeasure, REMEASURE_DEBOUNCE_MS);
    };

    /* `resize` allein reicht nicht: nachgeladene Schriften und Bilder
       verschieben die Breite des Filmstrips in Sektion 5, ohne dass das
       Fenster seine Grösse ändert. */
    const observer = new ResizeObserver(scheduleRemeasure);
    observer.observe(container);
    window.addEventListener("resize", scheduleRemeasure);

    return () => {
      clearTimeout(timer);
      observer.disconnect();
      window.removeEventListener("resize", scheduleRemeasure);
    };
  }, [disabled, measure, write, clamp, indexAt, initialIndex]);

  /* ═══════════════════════════════════════════════════════
     EINGABE
     ═══════════════════════════════════════════════════════ */

  useEffect(() => {
    if (disabled) return;

    const container = containerRef.current;
    if (!container) return;

    /**
     * Wheel — der ganze Handler.
     *
     * Kein Akkumulator, keine Schwelle, keine Gestenerkennung, keine
     * Nachlauf-Unterscheidung, keine Geräteverzweigung. Das Delta geht
     * direkt in die Position. Die Momentum-Phase eines Trackpads ist
     * Teil des Stroms und wird einfach mitgescrollt — genau wie in
     * jedem nativen Scrollbereich.
     */
    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      if (lockedRef.current) return;

      const delta =
        Math.abs(e.deltaY) > Math.abs(e.deltaX) ? e.deltaY : e.deltaX;
      if (delta === 0) return;

      const now = performance.now();
      const dbg = debugRef.current;
      dbg.events++;
      dbg.delta = Math.round(delta);
      dbg.gap = Math.round(now - lastEventTsRef.current);
      lastEventTsRef.current = now;

      cancelAnimationFrame(glideRef.current);
      glideRef.current = 0;
      push(delta);
    };

    const handleTouchStart = (e: TouchEvent) => {
      if (lockedRef.current) return;
      cancelAnimationFrame(glideRef.current);
      glideRef.current = 0;
      touchLastXRef.current = e.touches[0].clientX;
      touchLastTsRef.current = performance.now();
      touchVelocityRef.current = 0;
      jumpRef.current = null;
    };

    const handleTouchMove = (e: TouchEvent) => {
      e.preventDefault();
      if (lockedRef.current) return;

      const x = e.touches[0].clientX;
      const step = touchLastXRef.current - x;
      touchLastXRef.current = x;

      const now = performance.now();
      const dt = Math.max(4, now - touchLastTsRef.current);
      touchLastTsRef.current = now;
      touchVelocityRef.current = touchVelocityRef.current * 0.7 + (step / dt) * 0.3;

      push(step);
    };

    /**
     * Beim Loslassen rollt die Bewegung aus.
     *
     * Anders als beim Trackpad liefert der Browser hier keine
     * Momentum-Phase, also erzeugen wir sie — mit Reibung und ohne
     * Ziel. Sie endet, wo sie endet.
     */
    const handleTouchEnd = () => {
      if (lockedRef.current) return;
      let v = touchVelocityRef.current;
      if (Math.abs(v) < 0.08) return;

      const glide = () => {
        v *= 0.94;
        if (Math.abs(v) < 0.02) {
          glideRef.current = 0;
          return;
        }
        push(v * 16);
        glideRef.current = requestAnimationFrame(glide);
      };
      glideRef.current = requestAnimationFrame(glide);
    };

    const isTypingTarget = (target: EventTarget | null): boolean => {
      const el = target as HTMLElement | null;
      if (!el || typeof el.tagName !== "string") return false;
      return el.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName);
    };

    /**
     * Tastatur bewegt um knapp eine Bildbreite, nicht zu einer Sektion.
     * Wer mit den Pfeiltasten liest, will weiterlesen — nicht springen.
     * Pos1 und Ende gehen an den Anfang und ans Ende.
     */
    const handleKeyDown = (e: KeyboardEvent) => {
      if (lockedRef.current) return;
      /* Ohne diesen Guard ist das Kontaktformular in Sektion 6 mit den
         Pfeiltasten nicht bedienbar. */
      if (isTypingTarget(e.target)) return;

      if (e.key === "Home") { e.preventDefault(); jumpToIndex(0); return; }
      if (e.key === "End") { e.preventDefault(); jumpToIndex(anzahl - 1); return; }

      const stepPx = (containerRef.current?.clientWidth ?? 0) * KEY_STEP_FRACTION;
      let step = 0;
      if (e.key === "ArrowRight" || e.key === "ArrowDown" || e.key === "PageDown") step = stepPx;
      else if (e.key === "ArrowLeft" || e.key === "ArrowUp" || e.key === "PageUp") step = -stepPx;
      else return;

      e.preventDefault();
      const to = clamp(posRef.current + step);

      if (reducedMotionRef.current) {
        jumpRef.current = null;
        posRef.current = to;
        targetRef.current = to;
        write(to, 0);
        syncIndex();
        return;
      }

      setScrollDirection(step > 0 ? "forward" : "backward");
      jumpRef.current = {
        from: posRef.current,
        to,
        start: performance.now(),
        duration: KEY_MS,
      };
      startRaf();
    };

    /* Der Container ist ein echter Overflow-Container. Fokuswechsel per
       Tab lassen den Browser scrollLeft eigenmächtig verschieben; im
       Ruhezustand wird die eigene Position daran angeglichen, statt
       dagegen zu arbeiten. */
    const handleScroll = () => {
      if (rafRef.current) return;
      const el = containerRef.current;
      if (!el) return;
      if (Math.abs(el.scrollLeft - posRef.current) < 1) return;
      posRef.current = clamp(el.scrollLeft);
      targetRef.current = posRef.current;
      syncIndex();
    };

    container.addEventListener("wheel", handleWheel, { passive: false });
    container.addEventListener("touchstart", handleTouchStart, { passive: true });
    container.addEventListener("touchmove", handleTouchMove, { passive: false });
    container.addEventListener("touchend", handleTouchEnd, { passive: true });
    container.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      container.removeEventListener("wheel", handleWheel);
      container.removeEventListener("touchstart", handleTouchStart);
      container.removeEventListener("touchmove", handleTouchMove);
      container.removeEventListener("touchend", handleTouchEnd);
      container.removeEventListener("scroll", handleScroll);
      window.removeEventListener("keydown", handleKeyDown);
      cancelAnimationFrame(rafRef.current);
      cancelAnimationFrame(glideRef.current);
      rafRef.current = 0;
      glideRef.current = 0;
    };
  }, [disabled, push, jumpToIndex, clamp, startRaf, write, syncIndex]);

  return {
    containerRef,
    panelRef,
    getSections,
    scrollTo,
    jumpToIndex,
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
  KEY_MS,
  KEY_STEP_FRACTION,
  LAYER_SPEED,
  LAYER_FULL_VELOCITY,
} as const;

/**
 * CSS-Variable mit dem Ebenen-Versatz, gesetzt am Track.
 *
 * Verwendung an einer zurückgesetzten Ebene — nur `transform`, nie
 * `left`/`top`, damit die Bewegung beim Kompositor bleibt:
 *
 *   transform: translate3d(var(--tellian-tween-lag, 0px), 0, 0)
 *
 * Die Ebene muss ihren Ausschnitt überragen, sonst legt der Versatz an
 * der nachlaufenden Kante etwas frei.
 */
export const TWEEN_LAG_VAR = LAG_VAR;

/** Überstand, den eine versetzte Ebene je Seite braucht. */
export const TWEEN_OVERSCAN_VAR = OVERSCAN_VAR;
