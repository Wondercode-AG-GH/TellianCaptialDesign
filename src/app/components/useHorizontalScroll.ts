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

   Servo-Verhalten: die Fläche folgt zuerst der Hand, ab einer
   Schwelle übernimmt der Antrieb.

     idle → tracking → settling → idle

   Alle Werte hier oben, damit sie ohne Suche im Code verändert
   werden können.
   ═══════════════════════════════════════════════════════════ */

/** Obergrenze der Vollendung — gilt für eine ganze Sektionsbreite. */
const SETTLE_MS_MAX = 600;

/**
 * Untergrenze der Vollendung.
 *
 * Die Dauer richtet sich nach der RESTSTRECKE, nicht nach der ganzen
 * Sektion. Wer schon 70% gezogen hat, darf für die letzten 30% nicht
 * so lange brauchen wie für alles. Das ist der Kern des
 * Servo-Gefühls; mit fester Dauer kippt es sofort in "automatische
 * Schiebetür" zurück.
 */
const SETTLE_MS_MIN = 180;

/** Kurve für Tastatur und Direktsprung — s. EASE.snap in motion.ts.
 *  Zuggesten benutzen sie nicht; dort läuft die Feder. */
const SNAP_EASE = EASE.snapArr;

/* ── Feder für die Vollendung nach einer Zuggeste ──
   Ein zeitbasierter Tween beginnt zwangsläufig mit Geschwindigkeit
   null — eine Ease-Kurve kann gar nicht anders. Nach einer Zuggeste
   ist das die spürbare Schwelle: die Fläche folgt, bleibt stehen,
   dann fährt der Antrieb an. Gemessen fiel die Geschwindigkeit am Ende
   der Handphase auf 2 px/Frame und stieg danach wieder auf 18.

   Die Feder übernimmt die Handgeschwindigkeit exakt. Kritisch
   gedämpft, in geschlossener Form gelöst — kein Integrieren, damit
   das Ergebnis nicht von der Frame-Taktung abhängt:

     x(t) = (x₀ + (v₀ + ω·x₀)·t)·e^(−ω·t)
     v(t) = (v₀ − ω·(v₀ + ω·x₀)·t)·e^(−ω·t)

   mit x = Position − Ziel. Bei t=0 ist v = v₀. */

/** Grundsteifigkeit in rad/s. 14 entspricht rund 470ms Einschwingzeit. */
const SPRING_OMEGA_BASE = 14;

/**
 * Obergrenze der Steifigkeit.
 *
 * ω wird bei hoher Handgeschwindigkeit und kurzer Reststrecke
 * angehoben (s. unten). Ohne Deckel würde die Feder dort so steif,
 * dass es als hartes Einrasten wirkt; mit Deckel nehmen wir lieber ein
 * minimales Überschwingen in Kauf.
 */
const SPRING_OMEGA_MAX = 40;

/** Harter Riegel. Danach wird auf das Ziel gesetzt, unabhängig von allem. */
const SPRING_MAX_MS = 700;

/** Ruhebedingung: beides muss unterschritten sein. */
const SPRING_REST_PX = 0.4;
const SPRING_REST_V = 0.03;

/* ── Folgen (tracking) ── */

/** Bis zu diesem Anteil der Strecke folgt die Fläche 1:1. */
const FOLLOW_LINEAR = 0.40;

/**
 * Dämpfung jenseits von FOLLOW_LINEAR.
 *
 * Die Kurve nähert sich der vollen Strecke asymptotisch und erreicht
 * sie nie: nach einer vollen Sektionsbreite Zugstrecke steht man bei
 * 80%, nach zwei bei 97%. Dadurch kann man weder in die übernächste
 * Sektion ziehen noch über das Ziel hinausschiessen — ein
 * Zurückfedern, das wie eine zweite Bewegung aussähe, kann gar nicht
 * erst entstehen.
 */
const FOLLOW_DAMP = 0.55;

/** Nachgiebigkeit am Track-Anfang und -Ende, wo keine Nachbarsektion
 *  existiert. Anteil der Viewportbreite, asymptotisch. */
const EDGE_RESISTANCE = 0.12;

/** Ruhe im Event-Strom, nach der eine Zuggeste als beendet gilt. */
const TRACK_IDLE_MS = 90;

/* ── Entscheiden (settling) ── */

/** Ab diesem Anteil der Strecke wird zur Nachbarsektion vollendet. */
const COMMIT_FRACTION = 0.28;

/** Alternativ: Geschwindigkeit beim Loslassen, in px/ms. */
const COMMIT_VELOCITY = 1.6;

/* ── Nachlauf-Erkennung ──
   Die Rate-Bedingung der Mausrad-Erkennung taugt hier NICHT: Finger-
   und Momentum-Phase eines Trackpads kommen beide im Takt der
   Bildwiederholung, 8–16ms. Unterscheidbar sind sie an der Form —
   Momentum zerfällt monoton unterhalb des Gestenmaximums, eine
   ziehende Hand beschleunigt, hält und schwankt.

   Ein Fehlalarm ist billig: der Antrieb übernimmt ein paar Frames zu
   früh, und wer weiterzieht, stellt über die Wiederbeschleunigung
   ohnehin eine neue Geste scharf. Ein VERPASSTER Nachlauf wäre teuer
   — die Fläche würde nach dem Loslassen weiterwandern. Deshalb eher
   empfindlich eingestellt. */

/**
 * Aufeinanderfolgende Events ohne Anstieg.
 *
 * Bewusst empfindlich. Die Übergabe muss am Geschwindigkeitsmaximum
 * stattfinden — dort heben die Finger ab und dort beginnt Momentum.
 * Zu spät erkannt, folgt die Fläche dem abklingenden Nachlauf, die
 * Geschwindigkeit fällt auf fast null, und der Antrieb muss von vorn
 * anfahren: genau die gemessene Delle.
 *
 * Empfindlich ist erst seit der Feder ungefährlich. Mit
 * geschwindigkeitsstetiger Übergabe kostet eine zu frühe Entscheidung
 * nichts Sichtbares — die Bewegung läuft mit derselben Geschwindigkeit
 * weiter. Wer doch weiterschiebt, stellt über die Wiederbeschleunigung
 * neu scharf. Empfindlichkeit des Detektors und Stetigkeit der
 * Übergabe hängen zusammen.
 */
const MOMENTUM_FALL_RUN = 2;

/** Zusätzlich muss der Betrag unter diesen Anteil des Maximums fallen.
 *  Nahe 1 heisst: "sobald es nicht mehr steigt, ist die Hand fertig". */
const MOMENTUM_PEAK_FRACTION = 0.98;

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

/**
 * Nachgeben am Track-Anfang und -Ende.
 *
 * Muss über eine eigene Variable laufen: `scrollLeft` ist auf
 * [0, maxScroll] geklemmt und kann am Anschlag gar nicht weiter. Der
 * Widerstand wird deshalb als Verschiebung des ganzen Tracks
 * ausgedrückt — nur `transform`, damit die Bewegung beim Kompositor
 * bleibt.
 */
const EDGE_VAR = "--tellian-edge-pull";

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

/**
 * Betragsschwelle für einen Rad-Rastpunkt.
 *
 * Lag früher bei 120, als sie den Nachlauf allein abwehren musste. Seit
 * die RATE das trägt (ein Trackpad kommt nie über 25ms Abstand), kann
 * sie herunter — und muss es auch: Räder mit 100er-Rastpunkten sind
 * verbreitet, und bei 120 fielen sie in den Servo-Zweig, wo ein
 * einzelner Klick unter der Commit-Schwelle bleibt und zurückfedert.
 * Das Rad wäre damit unbrauchbar gewesen.
 *
 * 40 entspricht der Auslöseschwelle des diskreten Zweigs: gross genug,
 * um etwas zu bedeuten, klein genug für jedes reale Rad.
 */
const WHEEL_DEVICE_MIN_ABS = 40;

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

/**
 * Harte Untergrenze zwischen zwei Auslösungen im diskreten Zweig.
 *
 * Deutlich unter SETTLE_MS_MAX, damit eine Zweitgeste eine laufende
 * Vollendung abbrechen kann. 160 statt 225, weil ein bedächtig
 * gedrehtes Rad sonst jeden zweiten Rastpunkt verschluckt: bei rund
 * 250ms Abstand lag die alte Schwelle zu nah an der Taktung.
 */
const MIN_FIRE_INTERVAL_MS = 160;

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
   FOLGEKURVE
   ═══════════════════════════════════════════════════════════ */

/**
 * Zugstrecke → sichtbarer Versatz.
 *
 * Bis FOLLOW_LINEAR eins zu eins, danach asymptotisch gegen die volle
 * Strecke. Erreicht sie nie, kann also nicht überschiessen.
 */
function follow(drag: number, width: number): number {
  if (width <= 0) return 0;
  const u = Math.abs(drag) / width;
  if (u <= FOLLOW_LINEAR) return drag;
  const extra = 1 - FOLLOW_LINEAR;
  const damped = FOLLOW_LINEAR + extra * (1 - Math.exp(-(u - FOLLOW_LINEAR) / FOLLOW_DAMP));
  return Math.sign(drag) * width * damped;
}

/**
 * Umkehrung von `follow`.
 *
 * Gebraucht, wenn eine laufende Vollendung angefasst wird: die
 * Zugstrecke wird aus dem aktuellen Versatz zurückgerechnet, damit die
 * Fläche im Moment des Anfassens stehen bleibt, statt auf den
 * Rastpunkt zu springen.
 */
function unfollow(offset: number, width: number): number {
  if (width <= 0) return 0;
  const o = Math.abs(offset) / width;
  if (o <= FOLLOW_LINEAR) return offset;
  const extra = 1 - FOLLOW_LINEAR;
  const inner = 1 - (o - FOLLOW_LINEAR) / extra;
  /* Praktisch am Anschlag — weiter zurückzurechnen bringt nichts. */
  if (inner <= 1e-4) return Math.sign(offset) * width * 4;
  return Math.sign(offset) * width * (FOLLOW_LINEAR - FOLLOW_DAMP * Math.log(inner));
}

/** Nachgiebigkeit dort, wo es nichts mehr zu erreichen gibt. */
function followEdge(drag: number, viewport: number): number {
  const limit = viewport * EDGE_RESISTANCE;
  if (limit <= 0) return 0;
  return Math.sign(drag) * limit * (1 - Math.exp(-Math.abs(drag) / limit));
}

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

/**
 * Kritisch gedämpfte Feder, geschlossen gelöst.
 *
 * `omega` wird so gewählt, dass kein Nulldurchgang entsteht: ein
 * Überschwingen träte genau dann auf, wenn |v₀| > ω·|x₀|. Statt v₀ zu
 * beschneiden — das würde die Stetigkeit zerstören, die der ganze
 * Zweck ist — wird ω angehoben. Die Feder behält die
 * Handgeschwindigkeit UND nähert sich monoton; die Geschwindigkeit hat
 * damit genau ein Maximum und fällt danach.
 */
interface Spring {
  target: number;
  /** Anfangsauslenkung, Position − Ziel. */
  x0: number;
  /** Anfangsgeschwindigkeit in px/ms, vorzeichenbehaftet. */
  v0: number;
  omega: number;
  start: number;
  /** Bezugsspanne für den Ebenen-Versatz, wie beim Tween. */
  spanFrom: number;
  spanWidth: number;
}

interface Tween {
  from: number;
  to: number;
  start: number;
  duration: number;
  /**
   * Bezugsspanne für den Ebenen-Versatz. Beim Vollenden einer Zuggeste
   * ist das die volle Strecke zwischen den Rastpunkten, nicht die
   * Reststrecke — sonst spränge der Versatz an der Übergabe.
   */
  spanFrom?: number;
  spanWidth?: number;
}

/** Warum die Gestenerkennung wieder scharf gestellt hat. */
export type ArmReason = "quiet" | "rise" | "reverse" | "wheel" | "tail" | "—";

/** Zustand des Servo-Automaten. */
export type ScrollPhase = "idle" | "tracking" | "settling";

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
  phase: ScrollPhase;
  /** Gezogener Anteil der Strecke, in Prozent. */
  dragPct: number;
  /** Nachlauf erkannt — ab hier wird nicht mehr gefolgt. */
  momentum: boolean;
  /** Länge des monotonen Abfalls. */
  fallRun: number;
  /** Zuletzt berechnete Vollendungsdauer in ms. */
  settleMs: number;
  /** Zuggesten-Zyklen. Eine physische Geste darf genau einen erzeugen —
   *  mehr bedeutet, dass sie sich mitten in sich selbst neu scharf
   *  gestellt hat (Defekte A/B). */
  cycles: number;
  /** Eingabeart des laufenden Vorgangs. */
  device: "servo" | "wheel" | "touch" | "—";
  /** Was die Vollendung ausgelöst hat, und bei welcher Zugstrecke. */
  settleReason: "momentum" | "idle" | "touchend" | "—";
  settleAtPct: number;
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
    phase: "idle",
    dragPct: 0,
    momentum: false,
    fallRun: 0,
    settleMs: 0,
    cycles: 0,
    device: "—",
    settleReason: "—",
    settleAtPct: 0,
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
  const springRef = useRef<Spring | null>(null);
  const rafRef = useRef(0);
  /** TEMPORARY — Position innerhalb der freien Sektion. Entfällt mit
   *  dem Umbau von Sektion 5. */
  const freeTargetRef = useRef(0);

  /* ── Servo-Automat ── */
  const phaseRef = useRef<ScrollPhase>("idle");
  /** Sektion, von der aus gezogen wird. */
  const trackFromIndexRef = useRef(0);
  /** Rastpunkt dieser Sektion — Bezugspunkt für Versatz und Schwelle. */
  const trackFromPosRef = useRef(0);
  /** Zielposition der Nachbarsektion, oder null an der Kante. */
  const trackToPosRef = useRef<number | null>(null);
  const trackToIndexRef = useRef(0);
  /** Strecke zwischen Ausgangs- und Zielrastpunkt. */
  const trackWidthRef = useRef(0);
  /** Aufsummierte rohe Zugstrecke. */
  const dragRef = useRef(0);
  /** Ungeschriebene Zugstrecke — wird im RAF-Takt angewandt. */
  const dragDirtyRef = useRef(false);
  /** Eingabegeschwindigkeit in px/ms, geglättet. Entscheidet über den
   *  Commit — dort zählt, wie kräftig die Hand geschoben hat. */
  const velocityRef = useRef(0);
  /**
   * SICHTBARE Geschwindigkeit der Fläche in px/ms.
   *
   * Nicht dasselbe wie die Eingabegeschwindigkeit: jenseits von
   * FOLLOW_LINEAR staucht die Dämpfungskurve die Bewegung, die Fläche
   * wird also langsamer, während die Hand gleich schnell bleibt. Die
   * Feder muss die sichtbare Bewegung fortsetzen — mit der
   * Eingabegeschwindigkeit initialisiert, beschleunigte sie an der
   * Übergabe sichtbar (gemessen 75 → 123 px/Frame).
   */
  const posVelocityRef = useRef(0);
  const lastPosSampleRef = useRef({ pos: 0, t: 0 });
  /** Timer, der eine stehengebliebene Zuggeste beendet. */
  const trackIdleTimerRef = useRef(0);
  /** Nachgeben am Anschlag, in px. Getrennt von der Position, weil
   *  scrollLeft dort nicht weiter kann. */
  const edgePullRef = useRef(0);
  const edgeReleaseRef = useRef<{ from: number; start: number; duration: number } | null>(null);

  /** Richtung der laufenden Zuggeste. Rückfall für firedDirRef, wenn
   *  die Zugstrecke beim Entscheiden noch null ist — DEFEKT A: der
   *  frühere Rückfall auf +1 liess jede Rückwärtsgeste über die
   *  Richtungsumkehr-Regel im eigenen Nachlauf neu scharf werden. */
  const trackDirRef = useRef(1);

  /* Nachlauf-Erkennung */
  const gesturePeakRef = useRef(0);
  const fallRunRef = useRef(0);
  const lastAbsRef = useRef(0);

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
  /**
   * Erkanntes Eingabegerät. Bleibt über Gesten hinweg stehen — Geräte
   * wechseln selten, und ein einziges schnelles Event stellt sofort
   * zurück auf "servo".
   *
   * Entscheidend ist die RATE: eine zusammenhängende Zuggeste liefert
   * alle 8–16ms, ein Rad kommt nie unter 25ms. Ohne diese Bindung
   * hätte ein Rad mit kleinen Rastpunkten gar keine Chance — jeder
   * einzelne Klick bliebe unter der Commit-Schwelle und federte
   * zurück, das Rad wäre unbrauchbar.
   */
  const deviceRef = useRef<"servo" | "wheel">("servo");
  /** Aufeinanderfolgende langsame, quantisierte Events. */
  const wheelHintRef = useRef(0);

  /** Instrumentierung fürs Debug-Overlay (?scrolldebug). */
  const debugRef = useRef<ScrollDebugInfo>(createDebugInfo());

  /* ── Touch ── */
  const touchLastXRef = useRef(0);
  const touchAccumRef = useRef(0);
  const touchArmedRef = useRef(true);
  const lastTouchTsRef = useRef(0);

  const [activeIndex, setActiveIndex] = useState(initialIndex);
  /** Dauer der laufenden Vollendung. Wird einmal je Vollendung gesetzt,
   *  nicht je Frame — die Stationsleiste gleitet damit exakt so lange
   *  wie die Fläche fährt, auch bei Teilstrecken. */
  const [settleMs, setSettleMs] = useState(SETTLE_MS_MAX);
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
  const publish = useCallback((pos: number, lag = 0, edge = 0) => {
    const container = containerRef.current;
    if (!container) return;
    container.scrollLeft = pos;
    container.style.setProperty(LAG_VAR, `${lag.toFixed(2)}px`);
    container.style.setProperty(EDGE_VAR, `${edge.toFixed(2)}px`);
  }, []);

  /**
   * Ebenen-Versatz aus dem normierten Fortschritt.
   *
   * Dieselbe Formel in beiden Phasen — beim Folgen wie beim Vollenden.
   * Nur so ist der Versatz an der Übergabe stetig; würde er je Phase
   * anders gerechnet, sähe man dort einen Sprung.
   */
  const lagFor = useCallback((p: number, direction: number) => {
    if (reducedMotionRef.current) return 0;
    const clamped = Math.max(0, Math.min(1, p));
    return Math.sign(direction) * peakLagRef.current * 4 * clamped * (1 - clamped);
  }, []);

  /**
   * Wendet die offene Zugstrecke auf die Position an.
   *
   * Wird im RAF-Takt gerufen — ein Trackpad liefert bis zu 120 Events
   * pro Sekunde, auf einem 60-Hz-Schirm wäre das die doppelte Zahl an
   * Layout-Schreibvorgängen. Zusätzlich ruft `settleTracking` sie, damit
   * das Delta, das die Entscheidung auslöst, nicht verlorengeht.
   */
  const applyTracking = useCallback(() => {
    if (!dragDirtyRef.current) return;
    dragDirtyRef.current = false;

    const width = trackWidthRef.current;
    const hasTarget = trackToPosRef.current !== null;

    if (hasTarget) {
      const offset = follow(dragRef.current, width);
      const next = trackFromPosRef.current + offset;

      /* Sichtbare Geschwindigkeit mitschreiben — sie geht an die Feder. */
      const now = performance.now();
      const sample = lastPosSampleRef.current;
      if (sample.t > 0) {
        const dt = Math.max(4, now - sample.t);
        /* Kaum geglättet. Gegen Ende der Handphase staucht die
           Dämpfungskurve die Bewegung Frame für Frame; ein träger
           Mittelwert übergäbe der Feder die frühere, höhere
           Geschwindigkeit — gemessen ein Sprung von 134 auf 180
           px/Frame an der Übergabe. Ein Rest Glättung bleibt, damit ein
           einzelner Ausreisser nicht durchschlägt. */
        posVelocityRef.current =
          posVelocityRef.current * 0.25 + ((next - sample.pos) / dt) * 0.75;
      }
      lastPosSampleRef.current = { pos: next, t: now };

      posRef.current = next;
      edgePullRef.current = 0;
      publish(posRef.current, lagFor(offset / width, offset), 0);
    } else {
      /* Anschlag: die Position kann nicht weiter, also gibt der ganze
         Track nach. Kein Ebenen-Versatz — dort wird nichts erreicht,
         es gibt keine Tiefe zu zeigen. */
      edgePullRef.current = -followEdge(
        dragRef.current,
        containerRef.current?.clientWidth ?? 0
      );
      publish(posRef.current, 0, edgePullRef.current);
    }
  }, [publish, lagFor]);

  /* Der RAF-Loop läuft, solange gefolgt oder vollendet wird — nie
     dauerhaft. Im Ruhezustand rendert die Anwendung gar nicht.

     Beim Folgen werden die Deltas hier gebündelt angewandt, nicht je
     Event: ein Trackpad liefert bis zu 120 Events pro Sekunde, auf
     einem 60-Hz-Schirm wäre das die doppelte Zahl an
     Layout-Schreibvorgängen. */
  const tick = useCallback(() => {
    const spring = springRef.current;

    if (spring) {
      const t = (performance.now() - spring.start) / 1000;
      const e = Math.exp(-spring.omega * t);
      const b = spring.v0 * 1000 + spring.omega * spring.x0;
      const x = (spring.x0 + b * t) * e;
      const v = (spring.v0 * 1000 - spring.omega * b * t) * e;

      const done =
        (Math.abs(x) < SPRING_REST_PX && Math.abs(v) / 1000 < SPRING_REST_V) ||
        t * 1000 >= SPRING_MAX_MS;

      posRef.current = done ? spring.target : spring.target + x;

      const lag = lagFor(
        spring.spanWidth === 0 ? 0 : (posRef.current - spring.spanFrom) / spring.spanWidth,
        spring.spanWidth
      );

      if (done) {
        springRef.current = null;
        phaseRef.current = "idle";
        setScrollDirection("idle");
      }

      publish(posRef.current, springRef.current ? lag : 0);
      rafRef.current = springRef.current ? requestAnimationFrame(tick) : 0;
      return;
    }

    const tween = tweenRef.current;

    if (tween) {
      const elapsed = performance.now() - tween.start;
      const t = tween.duration <= 0 ? 1 : Math.min(1, elapsed / tween.duration);
      const eased = easeSnap(t);
      const distance = tween.to - tween.from;
      posRef.current = tween.from + distance * eased;

      const lag = lagFor(
        tween.spanFrom === undefined || tween.spanWidth === undefined || tween.spanWidth === 0
          ? eased
          : (posRef.current - tween.spanFrom) / tween.spanWidth,
        tween.spanWidth ? Math.sign(tween.spanWidth) : distance
      );

      if (t >= 1) {
        posRef.current = tween.to;
        tweenRef.current = null;
        phaseRef.current = "idle";
        setScrollDirection("idle");
      }

      publish(posRef.current, tweenRef.current ? lag : 0);
      rafRef.current = tweenRef.current ? requestAnimationFrame(tick) : 0;
      return;
    }

    if (phaseRef.current === "tracking") {
      applyTracking();
      rafRef.current = requestAnimationFrame(tick);
      return;
    }

    /* Feder am Anschlag zurück. */
    const release = edgeReleaseRef.current;
    if (release) {
      const t = Math.min(1, (performance.now() - release.start) / release.duration);
      edgePullRef.current = release.from * (1 - easeSnap(t));
      if (t >= 1) {
        edgeReleaseRef.current = null;
        edgePullRef.current = 0;
        phaseRef.current = "idle";
        setScrollDirection("idle");
      }
      publish(posRef.current, 0, edgePullRef.current);
      rafRef.current = edgeReleaseRef.current ? requestAnimationFrame(tick) : 0;
      return;
    }

    rafRef.current = 0;
  }, [publish, lagFor, applyTracking]);

  const startRaf = useCallback(() => {
    if (!rafRef.current) rafRef.current = requestAnimationFrame(tick);
  }, [tick]);

  /**
   * Vollendungsdauer aus der RESTSTRECKE.
   *
   * `span` ist die Bezugsstrecke — eine Sektionsbreite bei einer
   * Zuggeste, die volle Sprungweite bei Tastatur und Direktsprung.
   * Wer schon 70% gezogen hat, bekommt für die letzten 30% rund ein
   * Drittel der Zeit. Ohne das fühlt sich die Übergabe an, als hätte
   * das Ziehen nichts gebracht.
   */
  const settleDuration = useCallback((remaining: number, span: number) => {
    /* DEFEKT E — die Abbruchbedingung war `span <= 0`. Gemeint war eine
       entartete Spanne von null; getroffen hat sie JEDE Rückwärts-
       bewegung, denn dort ist `span = toPos - fromPos` negativ. Jede
       Geste nach links bekam damit stumpf SETTLE_MS_MAX, unabhängig von
       der Reststrecke — gemessen 600ms statt 180ms bei identischen 77%
       Zugstrecke. Das war die Richtungsabhängigkeit der Dauer. */
    if (Math.abs(span) < 1) return SETTLE_MS_MAX;
    const raw = (Math.abs(remaining) / Math.abs(span)) * SETTLE_MS_MAX;
    return Math.max(SETTLE_MS_MIN, Math.min(SETTLE_MS_MAX, raw));
  }, []);

  /**
   * Vollendet eine Zuggeste mit der Feder — mit der Geschwindigkeit,
   * die die Hand hinterlassen hat.
   */
  const startSpring = useCallback(
    (target: number, velocity: number, span: { from: number; width: number }) => {
      const x0 = posRef.current - target;

      if (reducedMotionRef.current || Math.abs(x0) < SPRING_REST_PX) {
        springRef.current = null;
        tweenRef.current = null;
        phaseRef.current = "idle";
        posRef.current = target;
        publish(target, 0);
        setScrollDirection("idle");
        return;
      }

      /* ω so hoch, dass |v₀| ≤ ω·|x₀| — dann gibt es keinen
         Nulldurchgang und damit kein Überschwingen. Gedeckelt, damit es
         bei kurzer Reststrecke nicht zum harten Einrasten wird. */
      const needed = Math.abs(velocity * 1000) / Math.max(1, Math.abs(x0));
      const omega = Math.min(SPRING_OMEGA_MAX, Math.max(SPRING_OMEGA_BASE, needed));

      tweenRef.current = null;
      phaseRef.current = "settling";
      setScrollDirection(target > posRef.current ? "forward" : "backward");

      springRef.current = {
        target,
        x0,
        v0: velocity,
        omega,
        start: performance.now(),
        spanFrom: span.from,
        spanWidth: span.width,
      };

      /* Anzeige: Zeit bis zur Ruhe, aus der Steifigkeit. */
      const estimate = Math.min(SPRING_MAX_MS, Math.round((6.6 / omega) * 1000));
      debugRef.current.settleMs = estimate;
      setSettleMs(estimate);

      startRaf();
    },
    [publish, startRaf]
  );

  /** Startet die Vollendung. Einziger Ort, an dem ein Tween entsteht. */
  const startTween = useCallback(
    (to: number, span: { from: number; width: number } | null) => {
      const from = posRef.current;
      const distance = to - from;

      if (reducedMotionRef.current) {
        tweenRef.current = null;
        springRef.current = null;
        phaseRef.current = "idle";
        posRef.current = to;
        publish(to, 0);
        setScrollDirection("idle");
        return;
      }

      if (Math.abs(distance) < 0.5) {
        tweenRef.current = null;
        phaseRef.current = "idle";
        posRef.current = to;
        publish(to, 0);
        setScrollDirection("idle");
        return;
      }

      const duration = settleDuration(distance, span ? span.width : distance);
      debugRef.current.settleMs = Math.round(duration);
      setSettleMs(Math.round(duration));

      setScrollDirection(distance > 0 ? "forward" : "backward");
      phaseRef.current = "settling";
      springRef.current = null;
      tweenRef.current = {
        from,
        to,
        start: performance.now(),
        duration,
        spanFrom: span?.from,
        spanWidth: span?.width,
      };
      startRaf();
    },
    [publish, startRaf, settleDuration]
  );

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

      /* Tastatur und Direktsprung: volle Dauer, Bezug ist die ganze
         Sprungweite. Die Klemmung deckelt sie bei SETTLE_MS_MAX, auch
         wenn mehrere Sektionen übersprungen werden. */
      startTween(to, { from: posRef.current, width: to - posRef.current });
    },
    [startTween, freeBounds]
  );

  /* ═══════════════════════════════════════════════════════
     SERVO — Folgen und Vollenden
     ═══════════════════════════════════════════════════════ */

  /**
   * Beginnt eine Zuggeste.
   *
   * Bezugspunkt ist der Rastpunkt der aktuellen Sektion, nicht die
   * aktuelle Position: daran wird die Commit-Schwelle gemessen. Läuft
   * gerade eine Vollendung, wird die Zugstrecke aus dem vorhandenen
   * Versatz zurückgerechnet — sonst spränge die Fläche im Moment des
   * Anfassens auf den Rastpunkt.
   */
  /**
   * Setzt die Nachlauf-Erkennung auf den Anfang einer Geste zurück.
   *
   * DEFEKT B: das geschah früher nur bei einer Pause über QUIET_MS.
   * Eine Geste, die innerhalb von 400ms auf die vorige folgte — also
   * der Normalfall beim zügigen Durchscrollen —, erbte deren hohen
   * fallRun und alten peak. `momentum` war damit schon beim ersten
   * Event wahr, die Geste endete, bevor sie begann, und die Zugstrecke
   * blieb null. Genau daraus entstand die Kette mit Defekt A.
   */
  const resetGestureShape = useCallback(() => {
    gesturePeakRef.current = 0;
    fallRunRef.current = 0;
    lastAbsRef.current = 0;
  }, []);

  const beginTracking = useCallback(
    (dir: number) => {
      const sections = measuredRef.current;
      if (!sections.length) return;

      const fromIndex = indexRef.current;
      const fromSection = sections[fromIndex];
      if (!fromSection) return;

      /* TEMPORARY — in der freien Sektion ist der Bezugspunkt die
         Kante, an der man steht, nicht ihr Rastpunkt. Entfällt mit dem
         Umbau von Sektion 5 auf 94vw. */
      let fromPos = fromSection.snap;
      if (fromSection.scroll === "free") {
        const { min, max } = freeBounds(fromSection);
        fromPos = dir > 0 ? max : min;
      }

      const toIndex = Math.max(0, Math.min(SECTION_COUNT - 1, fromIndex + dir));
      let toPos: number | null = null;
      if (toIndex !== fromIndex) {
        const target = sections[toIndex];
        /* Rückwärts in die freie Sektion: an ihr rechtes Ende. */
        toPos =
          dir < 0 && target.scroll === "free" ? freeBounds(target).max : target.snap;
      }

      const width = toPos === null ? 0 : Math.abs(toPos - fromPos);

      trackFromIndexRef.current = fromIndex;
      trackFromPosRef.current = fromPos;
      trackToIndexRef.current = toIndex;
      trackToPosRef.current = toPos;
      trackWidthRef.current = width;

      /* Nahtlos anknüpfen: vorhandenen Versatz in Zugstrecke umrechnen. */
      const offset = posRef.current - fromPos;
      dragRef.current =
        toPos === null || width === 0 ? offset : unfollow(offset, width);

      trackDirRef.current = dir || 1;
      posVelocityRef.current = 0;
      lastPosSampleRef.current = { pos: posRef.current, t: 0 };
      resetGestureShape();
      tweenRef.current = null;
      springRef.current = null;
      phaseRef.current = "tracking";
      velocityRef.current = 0;
      dragDirtyRef.current = true;
      debugRef.current.cycles++;
      startRaf();
    },
    [freeBounds, startRaf, resetGestureShape]
  );

  /**
   * Beendet eine Zuggeste und übergibt an den Antrieb.
   *
   * Entschieden wird nach zurückgelegtem Anteil ODER Geschwindigkeit.
   * Anschliessend wird entschärft: der Nachlauf, der jetzt noch
   * kommt, darf die Fläche nicht ein zweites Mal bewegen. Wieder scharf
   * stellen nur die drei bekannten Signale (Ruhephase,
   * Wiederbeschleunigung, Richtungsumkehr).
   */
  const settleTracking = useCallback(() => {
    if (phaseRef.current !== "tracking") return;

    clearTimeout(trackIdleTimerRef.current);
    /* DEFEKT C — offene Zugstrecke zuerst anwenden. Sonst entscheidet
       settleTracking auf einer Position, die das auslösende Delta noch
       nicht enthält; bei einer Entscheidung im ersten Event der Geste
       war die Zugstrecke dadurch exakt null. */
    applyTracking();

    const fromPos = trackFromPosRef.current;
    const toPos = trackToPosRef.current;
    const width = trackWidthRef.current;
    const offset = posRef.current - fromPos;

    armedRef.current = false;
    /* DEFEKT A — die Richtung kommt aus der Geste. Der frühere
       Rückfall auf +1 machte jede Rückwärtsgeste zum Selbstläufer:
       ihr eigener Nachlauf hat negative Deltas, die gegen +1 als
       Richtungsumkehr gelesen wurden und mitten in der Geste neu
       scharf stellten. */
    firedDirRef.current = Math.sign(dragRef.current) || trackDirRef.current || 1;
    lastFireTsRef.current = performance.now();
    accumRef.current = 0;

    /* Anschlag — es gibt nichts zu erreichen, also zurückfedern. Die
       Position stand ohnehin still; zurück muss nur das Nachgeben. */
    if (toPos === null || width === 0) {
      phaseRef.current = "settling";
      if (Math.abs(edgePullRef.current) < 0.5 || reducedMotionRef.current) {
        edgePullRef.current = 0;
        edgeReleaseRef.current = null;
        phaseRef.current = "idle";
        publish(posRef.current, 0, 0);
        setScrollDirection("idle");
        return;
      }
      edgeReleaseRef.current = {
        from: edgePullRef.current,
        start: performance.now(),
        duration: SETTLE_MS_MIN,
      };
      debugRef.current.settleMs = SETTLE_MS_MIN;
      startRaf();
      return;
    }

    /* Fortschritt und Geschwindigkeit werden IN RICHTUNG DES ZIELS
       gemessen, nicht als Betrag. Sonst zählt eine Restfahrt in die
       Gegenrichtung fälschlich als Fortschritt — und wer eine laufende
       Vollendung anfasst und weiterschiebt, käme nie über die Schwelle,
       weil er erst die Reststrecke "zurückzahlen" müsste. */
    const dirSign = Math.sign(toPos - fromPos) || 1;
    const progress = (offset * dirSign) / width;
    debugRef.current.settleAtPct = Math.round(progress * 100);
    const fastEnough = velocityRef.current * dirSign >= COMMIT_VELOCITY;
    const commit = progress >= COMMIT_FRACTION || fastEnough;

    const target = commit ? toPos : fromPos;
    if (commit) {
      indexRef.current = trackToIndexRef.current;
      freeTargetRef.current = toPos;
      setActiveIndex(trackToIndexRef.current);
    } else {
      indexRef.current = trackFromIndexRef.current;
      freeTargetRef.current = fromPos;
    }

    /* Bezugsspanne bleibt die volle Strecke — der Ebenen-Versatz läuft
       dadurch stetig weiter, statt an der Übergabe zu springen.
       Vollendet wird mit der Feder, nicht mit dem Tween: nur sie kann
       die Handgeschwindigkeit übernehmen. */
    /* Der Feder wird die SICHTBARE Geschwindigkeit übergeben, nicht die
       der Eingabe — sonst setzt sie nicht die Bewegung fort, die man
       gerade sieht, sondern eine schnellere, und beschleunigt an der
       Übergabe. */
    startSpring(target, posVelocityRef.current, { from: fromPos, width: toPos - fromPos });
  }, [startSpring, publish, startRaf, applyTracking]);

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
        resetGestureShape();
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
        resetGestureShape();
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
        resetGestureShape();
        reason = "rise";
      } else if (
        !armedRef.current &&
        Math.sign(delta) !== firedDirRef.current &&
        absDelta > RISE_MIN_ABS
      ) {
        /* 3) Richtungsumkehr — niemand wischt versehentlich zurück. */
        armedRef.current = true;
        accumRef.current = 0;
        resetGestureShape();
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

      if (!armedRef.current) {
        /* Nachlauf nach einer Entscheidung — vollständig schlucken.
           DAS verhindert, dass eine kräftige Wischgeste die Fläche
           zweimal bewegt: einmal beim Folgen und einmal beim
           Vollenden. Der Nachlauf-Diskriminator entscheidet nur, WANN
           das Folgen endet; dass danach nichts mehr passiert, leistet
           dieses Tor. */
        dbg.phase = phaseRef.current;
        return;
      }

      /* ── Nachlauf-Erkennung ──
         Monotoner Abfall unterhalb des Gestenmaximums. Der Zustand
         wird beim Scharfstellen zurückgesetzt, nicht erst nach einer
         Pause — s. resetGestureShape, Defekt B. */
      gesturePeakRef.current = Math.max(gesturePeakRef.current, absDelta);
      if (lastAbsRef.current > 0 && absDelta <= lastAbsRef.current * 1.02) {
        fallRunRef.current++;
      } else {
        fallRunRef.current = 0;
      }
      lastAbsRef.current = absDelta;
      const momentum =
        fallRunRef.current >= MOMENTUM_FALL_RUN &&
        absDelta < gesturePeakRef.current * MOMENTUM_PEAK_FRACTION;
      dbg.momentum = momentum;
      dbg.fallRun = fallRunRef.current;

      /* TEMPORARY — innerhalb der freien Sektion wird gescrollt statt
         gezogen, und zwar unabhängig vom Eingabegerät: auch ein Rad
         soll dort den Filmstrip durchfahren, statt ihn zu überspringen.
         Erst an ihrer Kante übernimmt die Rastung. Entfällt mit dem
         Umbau von Sektion 5 auf 94vw. */
      if (phaseRef.current !== "tracking" && !tweenRef.current) {
        const result = freeScrollStep(delta);
        if (result !== "blocked") {
          if (result === "clamped") {
            armedRef.current = false;
            firedDirRef.current = Math.sign(delta);
            accumRef.current = 0;
          }
          dbg.phase = phaseRef.current;
          return;
        }
      }

      /* ── Geräte-Erkennung ──
         Ein Event im Bildwiederholungstakt kann nur von einer
         zusammenhängenden Zuggeste kommen und stellt sofort auf Servo.
         Zwei aufeinanderfolgende langsame, quantisierte Events sind ein
         Rad. Zwei statt eines, weil auch das ERSTE Event einer
         Trackpad-Geste einen grossen Abstand zum Vorgänger hat — das
         zweite kommt dann aber im Takt und korrigiert. */
      if (gap < WHEEL_DEVICE_MIN_GAP_MS) {
        wheelHintRef.current = 0;
        deviceRef.current = "servo";
      } else if (
        absDelta >= WHEEL_DEVICE_MIN_ABS &&
        Math.abs(absDelta - Math.round(absDelta)) < WHEEL_DEVICE_QUANT_EPS
      ) {
        wheelHintRef.current++;
        if (wheelHintRef.current >= 2) deviceRef.current = "wheel";
      }

      /* ══ Zweig 1: klassisches Mausrad ══
         Ein Rad ist gerastet und diskret — keine Fläche, die man zieht.
         Es behält deshalb den Sprungbetrieb samt Mehrfach-Strecke. */
      const isWheelDevice = deviceRef.current === "wheel";

      /* Wechsel mitten in einer Zuggeste: die bereits gezogene Strecke
         geht in den Akkumulator, statt zurückzufedern. Der Sprung
         beginnt dann an der aktuellen Position — man sieht keinen
         Rücksetzer. */
      if (isWheelDevice && phaseRef.current === "tracking") {
        clearTimeout(trackIdleTimerRef.current);
        phaseRef.current = "idle";
        accumRef.current += dragRef.current;
        dragRef.current = 0;
        dragDirtyRef.current = false;
      }

      /* ══ Zweig 2: reduzierte Bewegung ══
         Kein Folgen, kein Federn — harter Schnitt. */
      if (isWheelDevice || reducedMotionRef.current) {
        dbg.device = "wheel";
        dbg.phase = phaseRef.current;

        accumRef.current += delta;
        dbg.accum = accumRef.current;
        if (Math.abs(accumRef.current) < WHEEL_THRESHOLD) return;
        if (now - lastFireTsRef.current < MIN_FIRE_INTERVAL_MS) return;

        const dir = Math.sign(accumRef.current);
        armedRef.current = false;
        accumRef.current = 0;
        steadyRunRef.current = 0;
        firedDirRef.current = dir;
        lastFireTsRef.current = now;
        jumpRelative(dir);

        dbg.armed = false;
        dbg.accum = 0;
        dbg.fired++;
        dbg.lastFiredIndex = indexRef.current;
        dbg.index = indexRef.current;
        return;
      }

      /* ══ Zweig 3: Servo ══ */
      dbg.device = "servo";

      if (phaseRef.current !== "tracking") beginTracking(Math.sign(delta) || 1);

      /* DEFEKT C — erst verbuchen, dann entscheiden. Vorher fiel das
         Delta, das die Entscheidung auslöst, unter den Tisch; es ist
         der letzte und grösste Beitrag der Handphase. */
      dragRef.current += delta;
      dragDirtyRef.current = true;

      const dt = Math.max(4, gap);
      velocityRef.current = velocityRef.current * 0.7 + (delta / dt) * 0.3;

      /* Sobald Nachlauf erkannt ist, wird nicht mehr gefolgt:
         entscheiden und vollenden. Sonst zöge der Nachlauf die Fläche
         nach dem Loslassen von selbst weiter. */
      if (momentum) {
        debugRef.current.settleReason = "momentum";
        settleTracking();
        dbg.phase = phaseRef.current;
        dbg.fired++;
        dbg.lastFiredIndex = indexRef.current;
        return;
      }

      /* Bleibt der Strom stehen, ohne dass Nachlauf erkannt wurde —
         etwa bei einem langsamen Zug —, endet die Geste über die Uhr. */
      clearTimeout(trackIdleTimerRef.current);
      trackIdleTimerRef.current = window.setTimeout(() => {
        debugRef.current.settleReason = "idle";
        settleTracking();
      }, TRACK_IDLE_MS);

      startRaf();

      dbg.phase = phaseRef.current;
      dbg.dragPct = trackWidthRef.current
        ? Math.round(((posRef.current - trackFromPosRef.current) / trackWidthRef.current) * 100)
        : 0;
    };

    /* Touch braucht die Heuristik nicht: `touchend` beendet die Geste
       eindeutig. Ausgelöst wird an der Schwelle, der Finger zieht die
       Sektion nicht live mit. */
    /* Touch ist die natürliche Form des Servos: touchmove folgt dem
       Finger, touchend entscheidet. Kein Nachlaufproblem — das Ende
       der Geste ist explizit. */
    const handleTouchStart = (e: TouchEvent) => {
      if (lockedRef.current) return;
      touchLastXRef.current = e.touches[0].clientX;
      touchArmedRef.current = true;
      velocityRef.current = 0;
      lastTouchTsRef.current = performance.now();
    };

    const handleTouchMove = (e: TouchEvent) => {
      e.preventDefault();
      if (lockedRef.current || !touchArmedRef.current) return;

      const x = e.touches[0].clientX;
      const step = touchLastXRef.current - x; // > 0 = nach links wischen = vorwärts
      touchLastXRef.current = x;

      const now = performance.now();
      const dt = Math.max(4, now - lastTouchTsRef.current);
      lastTouchTsRef.current = now;

      if (reducedMotionRef.current) {
        /* Harter Schnitt: erst an der Schwelle springen, kein Folgen. */
        touchAccumRef.current += step;
        if (Math.abs(touchAccumRef.current) < TOUCH_THRESHOLD) return;
        const dir = Math.sign(touchAccumRef.current);
        touchArmedRef.current = false;
        touchAccumRef.current = 0;
        jumpRelative(dir);
        return;
      }

      /* TEMPORARY — freie Sektion, s. handleWheel. Entfällt mit dem
         Umbau von Sektion 5 auf 94vw. */
      if (phaseRef.current !== "tracking" && !tweenRef.current) {
        if (freeScrollStep(step) !== "blocked") return;
      }

      if (phaseRef.current !== "tracking") beginTracking(Math.sign(step) || 1);

      dragRef.current += step;
      dragDirtyRef.current = true;
      velocityRef.current = velocityRef.current * 0.7 + (step / dt) * 0.3;
      startRaf();

      const dbg = debugRef.current;
      dbg.device = "touch";
      dbg.phase = phaseRef.current;
      dbg.dragPct = trackWidthRef.current
        ? Math.round(((posRef.current - trackFromPosRef.current) / trackWidthRef.current) * 100)
        : 0;
    };

    const handleTouchEnd = () => {
      touchAccumRef.current = 0;
      if (phaseRef.current === "tracking") {
        debugRef.current.settleReason = "touchend";
        settleTracking();
        /* Anders als beim Wheel gibt es hier keinen Nachlauf, der
           geschluckt werden müsste — sofort wieder aufnahmebereit. */
        armedRef.current = true;
      }
      touchArmedRef.current = true;
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
      clearTimeout(trackIdleTimerRef.current);
      springRef.current = null;
      phaseRef.current = "idle";
    };
  }, [disabled, jumpRelative, freeScrollStep, beginTracking, settleTracking, startRaf, resetGestureShape]);

  return {
    containerRef,
    panelRef,
    getSections,
    scrollTo,
    jumpToIndex,
    activeIndex,
    settleMs,
    scrollDirection,
    debugRef,
    disabled,
  };
}

/** Abstimmungswerte für die Anzeige im Debug-Overlay. */
export const SCROLL_TUNING = {
  SETTLE_MS_MIN,
  SETTLE_MS_MAX,
  FOLLOW_LINEAR,
  FOLLOW_DAMP,
  COMMIT_FRACTION,
  COMMIT_VELOCITY,
  MOMENTUM_FALL_RUN,
  MOMENTUM_PEAK_FRACTION,
  SPRING_OMEGA_BASE,
  SPRING_OMEGA_MAX,
  SPRING_MAX_MS,
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

/** Nachgeben am Anschlag — als transform auf den Track anzuwenden. */
export const TRACK_EDGE_VAR = EDGE_VAR;
