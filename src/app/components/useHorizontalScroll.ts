import { useRef, useEffect, useLayoutEffect, useCallback, useState } from "react";

import { SECTIONS, SECTION_COUNT, type SectionScroll } from "../sections";
import { EASE } from "../../styles/motion";
import { usePrefersReducedMotion } from "./usePrefersReducedMotion";

/* ═══════════════════════════════════════════════════════════
   RASTUNG — Abstimmungswerte

   Eine Wheel-Geste oder ein Swipe entspricht genau einem Sprung
   zur Nachbarsektion. Kein freies Scrollen dazwischen.

   Die Gesten-Werte sind empirisch und geräteabhängig: Magic
   Trackpad, Logitech-Rad und Windows-Precision-Touchpad liefern
   sehr unterschiedliche Event-Ströme. Zum Justieren das Debug-
   Overlay benutzen (?scrolldebug).
   ═══════════════════════════════════════════════════════════ */

/* ═══════════════════════════════════════════════════════════
   ABSTIMMUNG AM GERÄT
   Dauer und Kurve der Rastung. Beide hier oben, damit sie ohne
   Suche im Code verändert werden können.
   ═══════════════════════════════════════════════════════════ */

/** Dauer eines Sprungs. */
const SNAP_MS = 600;

/** Kurve des Sprungs — s. EASE.snap in motion.ts. */
const SNAP_EASE = EASE.snapArr;

/**
 * Geschwindigkeit der zurückgesetzten Ebenen, als Anteil der
 * Sektionsbewegung. 0.88 = Bildflächen laufen 12% langsamer als die
 * Textebene.
 *
 * Der Versatz ist eine Parabel über dem Fortschritt: null am Anfang,
 * null am Ende, maximal in der Mitte der Bewegung. Anders als eine
 * durchgehend langsamere Ebene lässt das keine Restverschiebung
 * zurück — im Ruhezustand steht alles auf seiner Sollposition.
 *
 * Der Scheitel bemisst sich an der VIEWPORTBREITE, nicht an der
 * Sprungdistanz. Tiefe ist eine Eigenschaft des Bildschirms, nicht
 * davon, wie weit gesprungen wird — und an die Distanz gebunden
 * würde ein Direktsprung von Start nach Kontakt (rund 570vw) einen
 * Versatz von über 240px erzeugen, den keine Ebene mehr abdecken
 * kann. So ist er beschränkt und vorhersagbar:
 *
 *   Scheitel = Viewportbreite × (1 − LAYER_SPEED) × 0.25
 *
 * bei 1440px also rund 43px, unabhängig von der Sprungweite.
 */
const LAYER_SPEED = 0.88;

/** Sicherheitszuschlag auf den Überstand der Ebenen. */
const LAYER_OVERSCAN_MARGIN = 1.15;

/**
 * CSS-Variable, über die der Versatz an die Ebenen geht.
 *
 * Bewusst eine Stil-Eigenschaft am Container statt React-State: ein
 * State-Update pro Frame würde den Baum neu rendern und genau die
 * Frame-Zeiten kosten, die diese Bewegung braucht. So bleibt der Tween
 * frei von React-Arbeit, und die Ebenen werden vom Kompositor bewegt.
 */
const LAG_VAR = "--tellian-tween-lag";

/**
 * Überstand, den eine zurückgesetzte Ebene über ihren Ausschnitt
 * hinaus braucht, damit der Versatz an der nachlaufenden Kante nichts
 * freilegt. Wird beim Messen aus dem Scheitel abgeleitet, damit
 * Ebene und Bewegung nicht auseinanderlaufen können.
 */
const OVERSCAN_VAR = "--tellian-tween-overscan";

/** Aufsummiertes Delta, ab dem eine Geste auslöst. */
const WHEEL_THRESHOLD = 40;

/**
 * Lücke im Event-Strom, die eine Geste beendet.
 *
 * Bewusst gross. Naheliegend wären ~120ms — Trackpad-Nachlauf hat
 * Abstände von 8–16ms, wer die Finger hebt, braucht ≥100ms. Gemessen
 * reisst der Event-Strom aber mitten im Nachlauf regelmässig für
 * ~180ms ab, und zwar systematisch direkt nach einem ausgelösten
 * Sprung: React rendert dann den kompletten Baum neu und der Tween
 * startet. Ein zu kleiner Wert deutet genau diesen Aussetzer als neue
 * Geste und springt zwei Sektionen weit.
 *
 * Die Wanduhr ist an dieser Stelle also kein verlässliches Signal.
 * Sie taugt nur noch für echte Pausen; die bewusste Zweitgeste
 * innerhalb einer laufenden Geste erkennt die Hüllkurve unten.
 */
const QUIET_MS = 400;

/**
 * Halbwertszeit der Hüllkurve.
 *
 * Zeitbasiert statt pro Event: bei den üblichen ~16ms Abstand fällt sie
 * um 4% je Event und bleibt damit über dem Nachlauf, der um 10–15%
 * fällt. Ein 180ms-Aussetzer drückt sie auf 61% — immer noch weit über
 * dem nächsten Nachlauf-Delta, also kein Fehlalarm. Nach einer echten
 * Pause ist sie so weit gefallen, dass auch ein sanfter neuer Schub
 * darüber liegt.
 */
const ENVELOPE_HALFLIFE_MS = 250;

/** Faktor, um den ein Delta die Hüllkurve überschreiten muss, damit
 *  es als bewusster zweiter Schub statt als Nachlauf gilt. */
const RISE_FACTOR = 1.6;

/** Rauschfilter für Wiederbeschleunigung und Richtungsumkehr. */
const RISE_MIN_ABS = 12;

/* ── Mausrad-Erkennung ──
   Schnelles Drehen am klassischen Mausrad liefert Rastpunkte mit gleich
   grossen Deltas. Die Ruhephase greift dabei nicht, und gleich grosse
   Deltas erzeugen auch keine Wiederbeschleunigung — ohne eigenes Signal
   bewegt kräftiges Drehen deshalb nur eine Sektion.

   Der erste Ansatz stützte sich auf Betrag und Zerfallsform. Gemessen
   trägt das nicht: die Momentum-Phase eines kräftigen Trackpad-Wischs
   beginnt mit grossen Deltas und zerfällt so langsam, dass sie als
   Mausrad durchging — der Wisch sprang vier bis fünf Sektionen weit.
   Betrag und Verhältnis können das prinzipiell nicht trennen, denn ein
   gleichmässig schneller Zwei-Finger-Zug erzeugt dasselbe Muster.

   Tragend ist stattdessen die EREIGNISRATE. Ein Trackpad liefert seine
   Events im Takt der Bildwiederholung, also alle 8–16ms; ein Mausrad
   hängt an der Hand und schafft selbst bei kräftigem Drehen keine
   40 Rastpunkte pro Sekunde. Diese Grenze ist physikalisch, nicht
   heuristisch.

   Alle vier Bedingungen müssen zutreffen. Jede einzelne fällt in die
   sichere Richtung aus: greift sie zu Unrecht nicht, bewegt ein Mausrad
   nur eine Sektion — ärgerlich, aber kein Fehler. Ein übersprungener
   Abschnitt wäre einer. */

/** Mindestabstand zwischen zwei Rastpunkten. Schliesst alles aus, was
 *  im Takt der Bildwiederholung kommt — das tragende Signal. */
const WHEEL_DEVICE_MIN_GAP_MS = 25;

/** Betragsschwelle: darunter ist es kein Mausrad, sondern ein Zug. */
const WHEEL_DEVICE_MIN_ABS = 120;

/** Anzahl aufeinanderfolgender Events ohne Abfall. */
const WHEEL_DEVICE_RUN = 5;

/** Zulässiger Abfall gegenüber dem Beginn des Laufs. Verglichen wird
 *  gegen den Laufanfang, nicht gegen das Vorgänger-Event: ein langsam
 *  zerfallender Nachlauf bleibt von Paar zu Paar unter der Schwelle,
 *  summiert sich über fünf Events aber auf. */
const WHEEL_DEVICE_MIN_RATIO = 0.99;

/**
 * Mausrad-Deltas sind quantisiert — Chrome liefert je Rastpunkt ein
 * Vielfaches einer festen Tick-Grösse. Trackpad-Deltas folgen der
 * Fingerbewegung und sind beliebig.
 *
 * Die Toleranz fängt Fliesskomma-Rauschen aus Chromes interner
 * Skalierung ab (100.00000149…), verwirft aber echte Bruchteile.
 * Sollte Chrome auf einer Plattform auch für Trackpads ganzzahlige
 * Werte liefern, ist diese Bedingung wirkungslos — sie schwächt die
 * übrigen drei aber nicht.
 */
const WHEEL_DEVICE_QUANT_EPS = 0.01;

/** Harte Untergrenze zwischen zwei Auslösungen. Wächst mit SNAP_MS mit
 *  (rund ein Drittel davon), bleibt aber deutlich darunter — sonst
 *  könnte die Zweitgeste eine laufende Transition nicht mehr
 *  abbrechen. */
const MIN_FIRE_INTERVAL_MS = 225;

/** Wischdistanz, ab der Touch auslöst. */
const TOUCH_THRESHOLD = 60;

/** Entprellung für Neumessungen nach Resize / Layoutwechsel. */
const REMEASURE_DEBOUNCE_MS = 100;

/* ═══════════════════════════════════════════════════════════
   EASING
   ═══════════════════════════════════════════════════════════ */

/**
 * Cubic-Bezier-Solver, damit die Rastung dieselbe Kurve fährt wie
 * der Rest des Projekts. CSS-Transitions können hier nicht helfen:
 * bewegt wird `scrollLeft`, keine animierbare CSS-Eigenschaft.
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

    /* Newton-Raphson — konvergiert für diese Kurven in 2–4 Schritten. */
    let t = x;
    for (let i = 0; i < 8; i++) {
      const diff = sampleX(t) - x;
      if (Math.abs(diff) < 1e-5) return sampleY(t);
      const slope = slopeX(t);
      if (Math.abs(slope) < 1e-6) break;
      t -= diff / slope;
    }

    /* Bisektion als Rückfall, falls die Ableitung zu flach war. */
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

const easeSnap = cubicBezier(...SNAP_EASE);

/* ═══════════════════════════════════════════════════════════
   TYPEN
   ═══════════════════════════════════════════════════════════ */

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
  scroll: SectionScroll;
}

interface Tween {
  from: number;
  to: number;
  start: number;
  duration: number;
}

/** Warum die Gestenerkennung wieder scharf gestellt hat. */
export type ArmReason = "quiet" | "rise" | "reverse" | "wheel" | "tail" | "—";

/**
 * Momentaufnahme der Gestenerkennung für das Debug-Overlay.
 *
 * Wird als Ref durchgereicht und in place beschrieben, nicht als State:
 * ein setState pro Wheel-Event würde bei 60–120 Events/s den ganzen
 * Baum neu rendern und damit genau die Zeitverhältnisse verschieben,
 * die hier gemessen werden sollen.
 */
export interface ScrollDebugInfo {
  events: number;
  delta: number;
  gap: number;
  /** Hüllkurve, auf den Zeitpunkt des Events fortgeschrieben. */
  envelope: number;
  /** Schwelle, ab der ein Delta als bewusster zweiter Schub gilt. */
  riseThreshold: number;
  armed: boolean;
  reason: ArmReason;
  accum: number;
  /** Länge des laufenden Mausrad-Musters (gleich grosse Deltas). */
  steadyRun: number;
  index: number;
  mode: SectionScroll;
  fired: number;
  lastFiredIndex: number;
  /** Letzte Beträge, ältestes zuerst — zeigt die Zerfallsform. */
  recent: number[];
}

const RECENT_LEN = 32;

function createDebugInfo(): ScrollDebugInfo {
  return {
    events: 0,
    delta: 0,
    gap: 0,
    envelope: 0,
    riseThreshold: 0,
    armed: true,
    reason: "—",
    accum: 0,
    steadyRun: 0,
    index: 0,
    mode: "snap",
    fired: 0,
    lastFiredIndex: 0,
    recent: [],
  };
}

type ScrollDirection = "forward" | "backward" | "idle";

interface UseHorizontalScrollOptions {
  /** When true the hook becomes a no-op (vertical mode) */
  disabled?: boolean;
  /**
   * Sperrt jede Eingabe, ohne den Hook abzubauen. Gedacht für offene
   * Overlays und die Intro-Phase: der Wheel-Handler ist dort schon
   * durch `pointer-events: none` blockiert, `keydown` hängt aber am
   * Fenster und würde den Track hinter dem Overlay bewegen.
   */
  locked?: boolean;
  /**
   * Sektion, die beim ersten Aufbau eingenommen wird — ohne Animation.
   * Kommt aus der URL: Hash der zuletzt besuchten Sektion, oder die
   * Sektion, zu der eine per Deep-Link geöffnete Unterseite gehört.
   */
  initialIndex?: number;
}

/* ═══════════════════════════════════════════════════════════
   HOOK
   ═══════════════════════════════════════════════════════════ */

export function useHorizontalScroll(opts?: UseHorizontalScrollOptions) {
  const disabled = opts?.disabled ?? false;
  const locked = opts?.locked ?? false;
  const initialIndex = Math.max(0, Math.min(SECTION_COUNT - 1, opts?.initialIndex ?? 0));
  const reducedMotion = usePrefersReducedMotion();

  const containerRef = useRef<HTMLDivElement>(null);

  /* ── Registry ── */
  const panelsRef = useRef<(HTMLDivElement | null)[]>([]);
  const measuredRef = useRef<MeasuredSection[]>([]);
  const maxScrollRef = useRef(0);
  /** Scheitel des Ebenen-Versatzes in px, aus der Viewportbreite. */
  const peakLagRef = useRef(0);

  /* ── Position und laufende Transition ── */
  const posRef = useRef(0);
  /** Ziel-Sektion, nicht die sichtbare. Eine Zweitgeste während einer
   *  Transition rechnet von hier aus weiter, nicht von der Stelle, an
   *  der das Bild gerade steht. */
  const indexRef = useRef(initialIndex);
  /** Ob die Startsektion schon eingenommen wurde. */
  const initialisedRef = useRef(false);
  const tweenRef = useRef<Tween | null>(null);
  const rafRef = useRef(0);
  /** TEMPORARY — Position innerhalb der freien Sektion. Entfällt mit
   *  dem Umbau von Sektion 5. */
  const freeTargetRef = useRef(0);

  /* ── Gestenerkennung ── */
  const accumRef = useRef(0);
  const lastEventTsRef = useRef(0);
  const envelopeRef = useRef(0);
  const armedRef = useRef(true);
  const lastFireTsRef = useRef(0);
  const firedDirRef = useRef(0);
  /** Lauf gleich grosser Deltas — Mausrad-Erkennung. */
  const steadyRunRef = useRef(0);
  const steadyStartAbsRef = useRef(0);

  /** Instrumentierung fürs Debug-Overlay (?scrolldebug). */
  const debugRef = useRef<ScrollDebugInfo>(createDebugInfo());

  /* ── Touch ── */
  const touchLastXRef = useRef(0);
  const touchAccumRef = useRef(0);
  const touchArmedRef = useRef(true);

  const [activeIndex, setActiveIndex] = useState(initialIndex);
  const [scrollDirection, setScrollDirection] = useState<ScrollDirection>("idle");

  /* Spiegel für Werte, die die einmalig registrierten Listener lesen.
     useLayoutEffect ohne Dependencies läuft nach jedem Render vor dem
     Paint — damit kann kein Event zwischen Zustandswechsel und Spiegel
     durchschlüpfen. */
  const lockedRef = useRef(locked);
  const reducedMotionRef = useRef(reducedMotion);
  useLayoutEffect(() => {
    lockedRef.current = locked;
    reducedMotionRef.current = reducedMotion;
  });

  /* ═══════════════════════════════════════════════════════
     REGISTRY
     ═══════════════════════════════════════════════════════ */

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

    const max = Math.max(0, container.scrollWidth - container.clientWidth);
    maxScrollRef.current = max;

    /* Scheitel des Versatzes und der daraus abgeleitete Überstand.
       Beide hier, damit sie bei jedem Resize zusammen nachgeführt
       werden und nicht auseinanderlaufen können. */
    peakLagRef.current = container.clientWidth * (1 - LAYER_SPEED) * 0.25;
    container.style.setProperty(
      OVERSCAN_VAR,
      `${(peakLagRef.current * LAYER_OVERSCAN_MARGIN).toFixed(2)}px`
    );

    measuredRef.current = SECTIONS.map((def, i) => {
      const el = panelsRef.current[i];
      const offset = el?.offsetLeft ?? 0;
      const width = el?.offsetWidth ?? 0;
      return {
        index: i,
        offset,
        width,
        end: offset + width,
        snap: Math.max(0, Math.min(offset, max)),
        scroll: def.scroll,
      };
    });
  }, []);

  /**
   * TEMPORARY — Grenzen des freien Scrollens innerhalb einer Sektion.
   * `max` ist die Position, an der ihr rechter Rand am Viewport anliegt.
   * Entfällt mit dem Umbau von Sektion 5.
   */
  const freeBounds = useCallback((section: MeasuredSection) => {
    const viewport = containerRef.current?.clientWidth ?? 0;
    const min = section.snap;
    const max = Math.max(min, Math.min(section.end - viewport, maxScrollRef.current));
    return { min, max };
  }, []);

  /** Aktuelle Messung — Lesezugriff für Navigation und Debug. */
  const getSections = useCallback(() => measuredRef.current, []);

  /* ═══════════════════════════════════════════════════════
     BEWEGUNG
     ═══════════════════════════════════════════════════════ */

  /**
   * Schreibt die Position in den Container.
   *
   * Bewusst ohne State: früher wurden hier `scrollX` und
   * `scrollProgress` pro Frame gesetzt, was während jeder Bewegung
   * einen Re-Render des halben Baums auslöste. Seit die Animationen am
   * Eintritts-Latch hängen und beide Navigationen den Sektionsindex
   * lesen, braucht das niemand mehr — der Tween läuft jetzt ganz ohne
   * React-Arbeit.
   */
  const publish = useCallback((pos: number, lag = 0) => {
    const container = containerRef.current;
    if (!container) return;
    container.scrollLeft = pos;
    container.style.setProperty(LAG_VAR, `${lag.toFixed(2)}px`);
  }, []);

  /* Der RAF-Loop läuft nur während einer Transition, nicht dauerhaft
     wie der frühere Lerp. Im Ruhezustand rendert die Anwendung gar nicht. */
  const tick = useCallback(() => {
    const tween = tweenRef.current;
    if (!tween) {
      rafRef.current = 0;
      return;
    }

    const elapsed = performance.now() - tween.start;
    const t = tween.duration <= 0 ? 1 : Math.min(1, elapsed / tween.duration);
    const eased = easeSnap(t);
    const distance = tween.to - tween.from;
    posRef.current = tween.from + distance * eased;

    /* Versatz der zurückgesetzten Ebenen. Parabel über dem Fortschritt,
       auf 1 normiert: null an beiden Enden, Scheitel in der Mitte der
       Bewegung. Das Vorzeichen folgt der Fahrtrichtung, die Ebene
       bleibt also zurück. Existiert ausschliesslich während der
       Bewegung — der Betrag hängt an der Viewportbreite, nicht an der
       Sprungweite. */
    const lag = reducedMotionRef.current
      ? 0
      : Math.sign(distance) * peakLagRef.current * 4 * eased * (1 - eased);

    if (t >= 1) {
      posRef.current = tween.to;
      tweenRef.current = null;
      setScrollDirection("idle");
    }

    publish(posRef.current, tweenRef.current ? lag : 0);
    rafRef.current = tweenRef.current ? requestAnimationFrame(tick) : 0;
  }, [publish]);

  const startRaf = useCallback(() => {
    if (!rafRef.current) rafRef.current = requestAnimationFrame(tick);
  }, [tick]);

  /**
   * Der einzige Weg, den Track zu bewegen. Geste, Tastatur und
   * Direktsprung von aussen münden alle hier.
   */
  const jumpToIndex = useCallback(
    (next: number, align: "start" | "end" = "start") => {
      const sections = measuredRef.current;
      if (!sections.length) return;

      const index = Math.max(0, Math.min(SECTION_COUNT - 1, next));
      const section = sections[index];

      /* TEMPORARY — Rückwärtssprung in die freie Sektion landet an ihrem
         rechten Ende. Die Regel dahinter: Scrollen setzt die Reise fort,
         ein Navigationsklick ist ein Ortswechsel. Entfällt mit dem Umbau
         von Sektion 5. */
      const to =
        align === "end" && section.scroll === "free"
          ? freeBounds(section).max
          : section.snap;

      indexRef.current = index;
      freeTargetRef.current = to;
      setActiveIndex(index);

      /* Läuft bereits eine Transition auf dasselbe Ziel — nicht neu
         starten, das würde sie um die volle Dauer verlängern. */
      if (tweenRef.current && Math.abs(tweenRef.current.to - to) < 0.5) return;

      if (Math.abs(to - posRef.current) < 0.5) {
        tweenRef.current = null;
        setScrollDirection("idle");
        return;
      }

      setScrollDirection(to > posRef.current ? "forward" : "backward");

      if (reducedMotionRef.current) {
        tweenRef.current = null;
        posRef.current = to;
        publish(to);
        setScrollDirection("idle");
        return;
      }

      /* `from` ist die aktuelle Position, nicht das alte Ziel — dadurch
         bricht eine Zweitgeste die laufende Transition ohne Ruck ab. */
      tweenRef.current = {
        from: posRef.current,
        to,
        start: performance.now(),
        duration: SNAP_MS,
      };
      startRaf();
    },
    [publish, startRaf, freeBounds]
  );

  const jumpRelative = useCallback(
    (dir: number) => {
      const next = Math.max(0, Math.min(SECTION_COUNT - 1, indexRef.current + dir));
      /* TEMPORARY — s. jumpToIndex. */
      const align =
        dir < 0 && measuredRef.current[next]?.scroll === "free" ? "end" : "start";
      jumpToIndex(next, align);
    },
    [jumpToIndex]
  );

  /**
   * TEMPORARY — ein Scrollschritt innerhalb der freien Sektion.
   *
   * "moved"   — verschoben, Event verbraucht
   * "clamped" — an die Kante gestossen, Event verbraucht, Geste endet hier
   * "blocked" — steht schon an der Kante; der Aufrufer behandelt den Ausstieg
   *
   * Positioniert direkt statt über einen Tween: innerhalb der Sektion
   * soll die Bewegung dem Eingabegerät folgen, nicht rasten.
   * Entfällt mit dem Umbau von Sektion 5.
   */
  const freeScrollStep = useCallback(
    (delta: number): "moved" | "clamped" | "blocked" => {
      const section = measuredRef.current[indexRef.current];
      if (!section || section.scroll !== "free") return "blocked";

      const { min, max } = freeBounds(section);
      const current = freeTargetRef.current;

      if (delta < 0 && current <= min + 1) return "blocked";
      if (delta > 0 && current >= max - 1) return "blocked";

      const next = current + delta;
      const clamped = Math.max(min, Math.min(next, max));

      tweenRef.current = null;
      freeTargetRef.current = clamped;
      posRef.current = clamped;
      publish(clamped);

      return clamped !== next ? "clamped" : "moved";
    },
    [freeBounds, publish]
  );

  /**
   * Direktsprung über einen Fortschrittswert 0–1.
   *
   * Signatur bleibt für Navigation.tsx und DotNavigation.tsx erhalten,
   * die ihre Zielwerte noch hartcodiert mitbringen. Statt auf den
   * Pixelwert wird auf den nächstgelegenen Rastpunkt abgebildet — die
   * Ungenauigkeit dieser Werte fällt dadurch nicht mehr ins Gewicht.
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
     MESSUNG: Mount, Resize, Layoutwechsel
     ═══════════════════════════════════════════════════════ */

  useLayoutEffect(() => {
    if (disabled) return;
    const container = containerRef.current;
    if (!container) return;

    measure();

    /* Startsektion einnehmen — ohne Animation, das ist keine Bewegung
       des Nutzers, sondern der Ausgangszustand. */
    if (!initialisedRef.current) {
      initialisedRef.current = true;
      const start = measuredRef.current[initialIndex];
      if (start) {
        indexRef.current = start.index;
        posRef.current = start.snap;
        freeTargetRef.current = start.snap;
        publish(start.snap);
      }
    }

    let timer = 0;
    const remeasure = () => {
      measure();
      /* Aktuelle Sektion auf ihrem neuen Offset festhalten, ohne
         Animation — sonst wandert die Rastung beim Resize weg. */
      const section = measuredRef.current[indexRef.current];
      if (!section) return;
      tweenRef.current = null;
      /* TEMPORARY — in der freien Sektion die Position innerhalb der
         neuen Grenzen halten, statt an den Anfang zu springen. */
      const pos =
        section.scroll === "free"
          ? Math.max(freeBounds(section).min, Math.min(posRef.current, freeBounds(section).max))
          : section.snap;
      posRef.current = pos;
      freeTargetRef.current = pos;
      publish(pos);
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
  }, [disabled, measure, publish, freeBounds, initialIndex]);

  /* ═══════════════════════════════════════════════════════
     EINGABE
     ═══════════════════════════════════════════════════════ */

  useEffect(() => {
    /* ── Vertical mode: no horizontal hijack ── */
    if (disabled) return;

    const container = containerRef.current;
    if (!container) return;

    /**
     * Nach einem ausgelösten Sprung wird entschärft. Drei unabhängige
     * Signale stellen wieder scharf — der Nachlauf eines Trackpad-
     * Swipes (30–50 Events über bis zu 800ms) darf keines davon
     * auslösen, ein bewusster zweiter Schub jedes einzelne.
     */
    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      if (lockedRef.current) return;

      const now = performance.now();
      const delta =
        Math.abs(e.deltaY) > Math.abs(e.deltaX) ? e.deltaY : e.deltaX;
      const absDelta = Math.abs(delta);
      const gap = now - lastEventTsRef.current;

      /* Hüllkurve auf den Zeitpunkt dieses Events fortschreiben, bevor
         sie als Vergleichsmass dient. */
      const decayed =
        envelopeRef.current * Math.pow(0.5, gap / ENVELOPE_HALFLIFE_MS);

      let reason: ArmReason = armedRef.current ? "—" : "tail";

      /* Lauf gleich grosser Mausrad-Ticks fortschreiben.
         Rate und Quantisierung entscheiden pro Event, ob es überhaupt
         als Tick in Frage kommt; das Verhältnis vergleicht gegen den
         Laufanfang, nicht gegen das Vorgänger-Event. */
      const tickLike =
        absDelta >= WHEEL_DEVICE_MIN_ABS &&
        gap >= WHEEL_DEVICE_MIN_GAP_MS &&
        Math.abs(absDelta - Math.round(absDelta)) < WHEEL_DEVICE_QUANT_EPS;

      if (!tickLike) {
        steadyRunRef.current = 0;
        steadyStartAbsRef.current = 0;
      } else if (
        steadyRunRef.current > 0 &&
        absDelta >= steadyStartAbsRef.current * WHEEL_DEVICE_MIN_RATIO
      ) {
        steadyRunRef.current++;
      } else {
        steadyRunRef.current = 1;
        steadyStartAbsRef.current = absDelta;
      }

      if (gap > QUIET_MS) {
        /* 1) Echte Pause — die vorige Geste ist beendet. */
        armedRef.current = true;
        accumRef.current = 0;
        envelopeRef.current = 0;
        steadyRunRef.current = 0;
        steadyStartAbsRef.current = 0;
        reason = "quiet";
      } else if (
        !armedRef.current &&
        steadyRunRef.current >= WHEEL_DEVICE_RUN
      ) {
        /* 4) Klassisches Mausrad: gleich grosse, grosse Deltas ohne
              Abfall. Bei schnellem Drehen greifen weder Ruhephase noch
              Wiederbeschleunigung; ohne dieses Signal bewegt kräftiges
              Drehen nur eine einzige Sektion. Der Mindestabstand von
              MIN_FIRE_INTERVAL_MS begrenzt weiterhin die Strecke. */
        armedRef.current = true;
        accumRef.current = 0;
        steadyRunRef.current = 0;
        reason = "wheel";
      } else if (
        !armedRef.current &&
        absDelta > decayed * RISE_FACTOR &&
        absDelta > RISE_MIN_ABS
      ) {
        /* 2) Wiederbeschleunigung — das tragende Signal. Der Nachlauf
              zerfällt monoton, ein bewusster zweiter Schub springt über
              die Hüllkurve. Verglichen wird gegen die Hüllkurve statt
              gegen das Vorgänger-Delta, weil letzteres am Ende des
              Nachlaufs viel zu empfindlich ist — dort reissen schon
              15 gegen 9 den Faktor.

              Anders als die Wanduhr ist dieses Signal unempfindlich
              gegen Aussetzer im Event-Strom: ein blockierter Hauptthread
              verändert die Zerfallsform nicht. */
        armedRef.current = true;
        accumRef.current = 0;
        reason = "rise";
      } else if (
        !armedRef.current &&
        Math.sign(delta) !== firedDirRef.current &&
        absDelta > RISE_MIN_ABS
      ) {
        /* 3) Richtungsumkehr — niemand wischt versehentlich zurück. */
        armedRef.current = true;
        accumRef.current = 0;
        reason = "reverse";
      }

      lastEventTsRef.current = now;
      envelopeRef.current = Math.max(absDelta, decayed);

      const dbg = debugRef.current;
      dbg.events++;
      dbg.delta = delta;
      dbg.gap = gap;
      dbg.envelope = decayed;
      dbg.riseThreshold = decayed * RISE_FACTOR;
      dbg.reason = reason;
      dbg.steadyRun = steadyRunRef.current;
      dbg.recent.push(absDelta);
      if (dbg.recent.length > RECENT_LEN) dbg.recent.shift();

      dbg.armed = armedRef.current;
      dbg.accum = accumRef.current;
      dbg.index = indexRef.current;
      dbg.mode = measuredRef.current[indexRef.current]?.scroll ?? "snap";

      if (!armedRef.current) return;

      /* TEMPORARY — innerhalb der freien Sektion wird gescrollt statt
         gerastet. Erst an ihrer Kante fällt das Event in den
         Akkumulator und löst den Ausstieg aus. */
      if (!tweenRef.current) {
        const result = freeScrollStep(delta);
        if (result !== "blocked") {
          if (result === "clamped") {
            /* Kante erreicht: diese Geste endet hier. Der Ausstieg
               braucht eine bewusste neue Geste, sonst schiebt der
               Nachlauf desselben Swipes direkt weiter. */
            armedRef.current = false;
            firedDirRef.current = Math.sign(delta);
            accumRef.current = 0;
          }
          return;
        }
      }

      accumRef.current += delta;
      dbg.accum = accumRef.current;
      if (Math.abs(accumRef.current) < WHEEL_THRESHOLD) return;
      if (now - lastFireTsRef.current < MIN_FIRE_INTERVAL_MS) return;

      const dir = Math.sign(accumRef.current);
      armedRef.current = false;
      accumRef.current = 0;
      /* Lauf zurücksetzen, sonst stellt das Mausrad-Signal sofort im
         nächsten Event wieder scharf. */
      steadyRunRef.current = 0;
      firedDirRef.current = dir;
      lastFireTsRef.current = now;
      jumpRelative(dir);

      dbg.armed = false;
      dbg.accum = 0;
      dbg.fired++;
      dbg.lastFiredIndex = indexRef.current;
      dbg.index = indexRef.current;
    };

    /* Touch braucht die Heuristik nicht: `touchend` beendet die Geste
       eindeutig. Ausgelöst wird an der Schwelle, der Finger zieht die
       Sektion nicht live mit. */
    const handleTouchStart = (e: TouchEvent) => {
      touchLastXRef.current = e.touches[0].clientX;
      touchAccumRef.current = 0;
      touchArmedRef.current = true;
    };

    const handleTouchMove = (e: TouchEvent) => {
      e.preventDefault();
      if (lockedRef.current) return;

      const x = e.touches[0].clientX;
      const step = touchLastXRef.current - x; // > 0 = nach links wischen = vorwärts
      touchLastXRef.current = x;

      if (!touchArmedRef.current) return;

      /* TEMPORARY — s. handleWheel. */
      if (!tweenRef.current && freeScrollStep(step) !== "blocked") {
        touchAccumRef.current = 0;
        return;
      }

      touchAccumRef.current += step;
      if (Math.abs(touchAccumRef.current) < TOUCH_THRESHOLD) return;

      const dir = Math.sign(touchAccumRef.current);
      touchArmedRef.current = false;
      touchAccumRef.current = 0;
      jumpRelative(dir);
    };

    const handleTouchEnd = () => {
      touchArmedRef.current = true;
      touchAccumRef.current = 0;
    };

    const isTypingTarget = (target: EventTarget | null): boolean => {
      const el = target as HTMLElement | null;
      if (!el || typeof el.tagName !== "string") return false;
      return el.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName);
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (lockedRef.current) return;
      /* Ohne diesen Guard ist das Kontaktformular in Sektion 6 mit den
         Pfeiltasten nicht bedienbar. */
      if (isTypingTarget(e.target)) return;

      let dir = 0;
      if (e.key === "ArrowRight" || e.key === "ArrowDown" || e.key === "PageDown") dir = 1;
      else if (e.key === "ArrowLeft" || e.key === "ArrowUp" || e.key === "PageUp") dir = -1;
      else return;

      e.preventDefault();
      jumpRelative(dir);
    };

    /* Der Container ist weiterhin ein echter Overflow-Container.
       Fokuswechsel per Tab oder .focus() lassen den Browser scrollLeft
       eigenmächtig verschieben; der frühere Dauer-RAF hat das jeden
       Frame überschrieben, der Tween läuft aber nur während eines
       Sprungs. Deshalb im Ruhezustand explizit zurückholen. */
    const handleScroll = () => {
      if (tweenRef.current) return;
      const el = containerRef.current;
      if (!el) return;
      if (Math.abs(el.scrollLeft - posRef.current) < 1) return;
      el.scrollLeft = posRef.current;
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
      rafRef.current = 0;
    };
  }, [disabled, jumpRelative, freeScrollStep]);

  return {
    containerRef,
    panelRef,
    getSections,
    scrollTo,
    jumpToIndex,
    activeIndex,
    scrollDirection,
    debugRef,
    disabled,
  };
}

/** Abstimmungswerte für die Anzeige im Debug-Overlay. */
export const SCROLL_TUNING = {
  SNAP_MS,
  WHEEL_THRESHOLD,
  QUIET_MS,
  ENVELOPE_HALFLIFE_MS,
  RISE_FACTOR,
  RISE_MIN_ABS,
  MIN_FIRE_INTERVAL_MS,
  TOUCH_THRESHOLD,
  WHEEL_DEVICE_MIN_ABS,
  WHEEL_DEVICE_RUN,
  WHEEL_DEVICE_MIN_RATIO,
  WHEEL_DEVICE_MIN_GAP_MS,
  LAYER_SPEED,
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
