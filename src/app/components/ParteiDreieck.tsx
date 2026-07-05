import { useState, useCallback, useRef, useEffect } from "react";
import { C, sans, serif } from "../tokens";
import { EASE } from "../../styles/motion";
import { usePrefersReducedMotion } from "./usePrefersReducedMotion";

/* ═══════════════════════════════════════════════════════════════
   PARTEI-DREIECK — Dark-panel relationship graph
   Sie · Tellian Capital · Banken
   Separated circles (gap 30px) · connection lines · outer labels
   ═══════════════════════════════════════════════════════════════ */

/* ─── Tellian Monogram SVG ─── */
const MONO_VB = "0 0 546.08 342.3";
const MONO_D = "M352.83,133.25l-2.6-16.84c-.25-2.16-1.15-3.99-2.68-5.45-1.56-1.49-3.56-2.24-5.97-2.24h-141.21c-2.41,0-4.41.76-5.97,2.24-1.53,1.46-2.43,3.29-2.67,5.4l-2.61,16.95c-.16,1.43.12,2.55.82,3.33.65.72,1.59,1.09,2.8,1.09,2.31,0,3.98-1.26,4.71-3.58,1.44-5.03,4.02-8.74,7.9-11.35,3.87-2.6,8.59-3.91,14.02-3.91h23.55c2.05,0,3.63.55,4.85,1.67,1.18,1.09,1.75,2.55,1.75,4.45v114.51c0,1.81-.55,4.32-5.38,5.16l-2.63.47c-2.1.16-3.36,1.58-3.36,3.79,0,.78.28,3.3,3.84,3.3l15.98-.65h7.09V121.92l5.73-4.84,5.88,4.84v129.68h7.2l16.13.65c3.51,0,3.79-2.53,3.79-3.3,0-2.21-1.25-3.62-3.23-3.77l-2.76-.49c-4.82-.84-5.38-3.35-5.38-5.16v-114.51c0-1.9.58-3.35,1.75-4.45,1.22-1.13,2.8-1.67,4.85-1.67h23.55c5.43,0,10.15,1.32,14.02,3.91,3.88,2.6,6.46,6.32,7.91,11.39.72,2.29,2.39,3.55,4.7,3.55,1.21,0,2.15-.37,2.8-1.09.7-.78.98-1.9.81-3.39Z";

/* ─── Party data ─── */
const PARTIES = [
  {
    id: "kunde",
    label: { de: "Sie", en: "You" },
    color: C.partyKunde,           // Mushroom #B8AEA3
    prosa: {
      de: "Sie haben einen persönlichen Ansprechpartner und jederzeit vollständige Transparenz. Ihr Portfolio wird laufend überwacht, und Sie werden regelmässig darüber informiert.",
      en: "You have a personal point of contact and full transparency at all times. Your portfolio is continuously monitored, and you are kept regularly informed.",
    },
  },
  {
    id: "tellian",
    label: { de: "Tellian Capital", en: "Tellian Capital" },
    /* Tellian = Silver Mist NUR auf dem dunklen MANDAT-Panel;
       auf der Unterseite Imperial Purple — bewusste Abweichung, nicht angleichen. */
    color: C.silverMist,           // Silver Mist #BFBFBF
    prosa: {
      de: "Unsere Leistungen für Sie\u00A0→",
      en: "Our services for you\u00A0→",
    },
    isCta: true as const,
  },
  {
    id: "banken",
    label: { de: "Banken", en: "Banks" },
    color: C.bg,                   // Archive White #F4F4F0
    prosa: {
      de: "Ihr Vermögen liegt bei ausgewählten Kooperationsbanken in der Schweiz und in Liechtenstein — zu besten Konditionen.",
      en: "Your assets are held at selected partner banks in Switzerland and Liechtenstein — on the best terms.",
    },
  },
] as const;

/* ─── Relationship edge labels ─── */
const EDGE_LABELS = [
  { de: "Vermögensverwaltungsauftrag", en: "Asset management mandate" },
  { de: "Depot-/Kontobeziehung", en: "Custody/account relationship" },
  { de: "Vermögensverwaltungsvollmacht", en: "Asset management authority" },
] as const;

/* ═══════════════════════════════════════════════════════════════
   GEOMETRY — separated circles, R=80, gap=30px, c2c=190
   ═══════════════════════════════════════════════════════════════ */
const R = 80;
const C2C = 190; // center-to-center (gap = C2C - 2R = 30px)

/** Circle centres — equilateral triangle */
const VENN = [
  { dx:   0, dy: -110 },   // Kunde (Sie) — top
  { dx: -95, dy:   55 },   // Tellian — bottom-left
  { dx:  95, dy:   55 },   // Banken — bottom-right
];

/** Icon bounding-box sizes (centred in each circle) */
const ICON_SIZES = [
  { w: 50, h: 50 },   /* ICON: pending — custom SVG von Brand, Bounding-Box 50×50px */
  { w: 180, h: 112 },  // Tellian monogram (1.6:1 landscape) — 2× gross + prominent
  { w: 50, h: 50 },   /* ICON: pending — custom SVG von Brand, Bounding-Box 50×50px */
];

const CW = 380;
const CH = 560;

/* ─── Edge geometry helpers ─── */
function edgeEndpoints(a: number, b: number) {
  const ax = VENN[a].dx, ay = VENN[a].dy;
  const bx = VENN[b].dx, by = VENN[b].dy;
  const len = Math.hypot(bx - ax, by - ay);
  const nx = (bx - ax) / len, ny = (by - ay) / len;
  return {
    x1: ax + R * nx, y1: ay + R * ny,   // exit from circle A
    x2: bx - R * nx, y2: by - R * ny,   // entry to circle B
    mx: (ax + bx) / 2, my: (ay + by) / 2, // midpoint (for arrow)
    angle: Math.atan2(by - ay, bx - ax) * 180 / Math.PI,
  };
}
const EDGE_PAIRS: [number, number][] = [[0, 1], [0, 2], [1, 2]];

/** Outer label positions — +38px outward from original, HTML rotated spans */
const LABEL_POS = [
  { x: -137, y: -80, rot: -60 },   // K↔T upper-left (+38px outward)
  { x:  137, y: -80, rot:  60 },   // K↔B upper-right (+38px outward)
  { x:    0, y: 188, rot:   0 },   // T↔B below (+38px downward)
];

/** Fixed reading zone — ONE position for ALL hover texts, below cluster.
    52px below "Vollmacht" label (y=188), 70px above nav-pill at 1024px. */
const READING_ZONE_Y = 240;

/* ═══════════════════════════════════════════════════════════════
   ICONS
   ═══════════════════════════════════════════════════════════════ */
function PlaceholderIcon({ w, h, color }: { w: number; h: number; color: string }) {
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} fill="none" aria-hidden>
      <rect x={0.5} y={0.5} width={w - 1} height={h - 1} stroke={color} strokeWidth={1} strokeDasharray="4 3" opacity={0.4} />
    </svg>
  );
}
function TellianLogo({ w, h, color }: { w: number; h: number; color: string }) {
  return <svg width={w} height={h} viewBox={MONO_VB} aria-hidden><path d={MONO_D} fill={color} /></svg>;
}

/* ═══════════════════════════════════════════════════════════════
   COMPONENT
   ═══════════════════════════════════════════════════════════════ */
interface Props { compact?: boolean; onNavigate?: () => void; }

export function ParteiDreieck({ compact = false, onNavigate }: Props) {
  const [hovered, setHovered] = useState<number | null>(null);
  const rm = usePrefersReducedMotion();

  const onKey = useCallback((e: React.KeyboardEvent, i: number) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      if (i === 1 && onNavigate) onNavigate(); // Tellian = CTA
      else setHovered(prev => prev === i ? null : i);
    }
  }, [onNavigate]);

  const sr = "Sie: Persönlicher Ansprechpartner, vollständige Transparenz, laufende Überwachung. "
    + "Tellian Capital: Unsere Leistungen für Sie. "
    + "Banken: Ausgewählte Kooperationsbanken in der Schweiz und Liechtenstein, beste Konditionen.";

  /* ════════════════ MOBILE ════════════════ */
  if (compact) {
    return (
      <div style={{ backgroundColor: C.purple, padding: "32px 20px" }}>
        <p className="sr-only" style={{ position: "absolute", width: 1, height: 1, padding: 0, margin: -1, overflow: "hidden", clip: "rect(0,0,0,0)", whiteSpace: "nowrap", border: 0 }}>{sr}</p>
        {PARTIES.map((party, i) => {
          const act = hovered === i;
          return (
            <div key={party.id} style={{ marginTop: i === 0 ? 0 : 24 }}>
              <div role="button" tabIndex={0} aria-label={party.label.de}
                onClick={() => { if (i === 1 && onNavigate) onNavigate(); else setHovered(hovered === i ? null : i); }}
                onKeyDown={e => onKey(e, i)}
                style={{ display: "flex", alignItems: "center", gap: 14, cursor: "pointer", outline: "none" }}>
                <div style={{ width: 10, height: 10, borderRadius: "50%", backgroundColor: party.color, flexShrink: 0 }} />
                <span style={{ fontFamily: sans, fontSize: 12, letterSpacing: "0.16em", textTransform: "uppercase", color: act ? C.bg : "rgba(244,244,240,0.7)", fontWeight: act ? 600 : 400 }}>{party.label.de}</span>
              </div>
              {act && (
                <p style={{ fontFamily: serif, fontSize: 14, color: "rgba(244,244,240,0.9)", lineHeight: 1.5, margin: "12px 0 0 24px" }} lang="de">{party.prosa.de}</p>
              )}
            </div>
          );
        })}
      </div>
    );
  }

  /* ════════════════ DESKTOP — Dark Panel ════════════════ */
  const clusterRef = useRef<HTMLDivElement>(null);
  const [entered, setEntered] = useState(rm);

  useEffect(() => {
    if (rm || entered) return;
    const el = clusterRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setEntered(true); obs.disconnect(); } },
      { threshold: 0.3 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [rm, entered]);

  /* Nearest-centre hover */
  const handleMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const mx = e.clientX - rect.left - CW / 2;
    const my = e.clientY - rect.top - CH / 2;
    let nearest = -1, minDist = Infinity;
    VENN.forEach((v, i) => {
      const d = Math.hypot(mx - v.dx, my - v.dy);
      if (d <= R && d < minDist) { nearest = i; minDist = d; }
    });
    setHovered(nearest >= 0 ? nearest : null);
  }, []);
  const handleLeave = useCallback(() => setHovered(null), []);

  const anyHover = hovered !== null;
  const trans = rm ? "none" : `all 260ms ${EASE.standard}`;
  const diagramOp = entered ? (anyHover ? 0 : 1) : 0;
  const lineOp = entered ? (anyHover ? 0.08 : 1) : 0;

  /* Light-on-dark color helpers */
  const W = C.bg;
  const W90 = "rgba(244,244,240,0.90)";
  const W75 = "rgba(244,244,240,0.75)";
  const W55 = "rgba(244,244,240,0.55)";
  const W35 = "rgba(244,244,240,0.35)";

  return (
    <div style={{
      position: "absolute", top: 0, bottom: 0, left: "44vw", right: 0,
      display: "flex", alignItems: "center", justifyContent: "center",
      backgroundColor: C.purple,
      overflow: "visible", zIndex: 0,
    }}>
      <p className="sr-only" style={{ position: "absolute", width: 1, height: 1, padding: 0, margin: -1, overflow: "hidden", clip: "rect(0,0,0,0)", whiteSpace: "nowrap", border: 0 }}>{sr}</p>

      {/* ── Title at eyebrow height (panel-level, not cluster-level) ── */}
      <span style={{
        position: "absolute",
        top: "calc(50% - 280px)",
        left: "50%", transform: "translateX(-50%)",
        fontFamily: sans, fontSize: 11, letterSpacing: "0.18em",
        textTransform: "uppercase", color: W55,
        whiteSpace: "nowrap", userSelect: "none", pointerEvents: "none",
        opacity: diagramOp,
        transition: rm ? "none" : `opacity 300ms ${EASE.standard}`,
      }}>
        Die Struktur bewährter Geschäftsbeziehungen
      </span>

      <div
        ref={clusterRef}
        onMouseMove={handleMove}
        onMouseLeave={handleLeave}
        style={{ position: "relative", width: CW, height: CH }}
      >

        {/* ── SVG: connection lines + arrows ── */}
        <svg
          style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", pointerEvents: "none", overflow: "visible" }}
          viewBox={`0 0 ${CW} ${CH}`} fill="none" aria-hidden
        >
          <g opacity={lineOp} style={{ transition: rm ? "none" : `opacity 300ms ${EASE.standard}` }}>
            {EDGE_PAIRS.map(([a, b], i) => {
              const ep = edgeEndpoints(a, b);
              const cx = CW / 2, cy = CH / 2;
              return (
                <g key={`edge-${i}`}>
                  {/* Dashed line in the gap */}
                  <line
                    x1={cx + ep.x1} y1={cy + ep.y1}
                    x2={cx + ep.x2} y2={cy + ep.y2}
                    stroke={W35} strokeWidth={0.5} strokeDasharray="3 4"
                  />
                  {/* Double arrow at midpoint */}
                  <g transform={`translate(${cx + ep.mx},${cy + ep.my}) rotate(${ep.angle})`}>
                    <path d="M-4,-3 L0,0 L-4,3" stroke={W35} strokeWidth={0.8} fill="none" />
                    <path d="M4,-3 L0,0 L4,3" stroke={W35} strokeWidth={0.8} fill="none" />
                  </g>
                </g>
              );
            })}
          </g>
        </svg>

        {/* ── Outer edge labels (HTML with CSS rotate) ── */}
        {LABEL_POS.map((lp, i) => (
          <span key={`elabel-${i}`} style={{
            position: "absolute",
            left: `calc(50% + ${lp.x}px)`,
            top: `calc(50% + ${lp.y}px)`,
            transform: `translate(-50%, -50%) rotate(${lp.rot}deg)`,
            fontFamily: sans, fontSize: 9, letterSpacing: "0.06em",
            textTransform: "uppercase", color: W55,
            whiteSpace: "nowrap", pointerEvents: "none", userSelect: "none",
            opacity: diagramOp,
            transition: rm ? "none" : `opacity 300ms ${EASE.standard}`,
          }}>
            {EDGE_LABELS[i].de}
          </span>
        ))}

        {/* ── Three circles + icons + labels ── */}
        {PARTIES.map((party, i) => {
          const v = VENN[i];
          const isz = ICON_SIZES[i];
          const act = hovered === i;
          const faded = anyHover && !act;
          const isCta = i === 1;
          const delay = i * 100;

          return (
            <div key={party.id}>
              {/* Circle — filled with party color */}
              <div
                role={isCta ? "link" : "button"}
                tabIndex={0}
                aria-label={isCta
                  ? "Unsere Leistungen für Sie — mehr zur Vermögensverwaltung"
                  : `${party.label.de} — Details anzeigen`}
                onClick={() => { if (isCta && onNavigate) onNavigate(); }}
                onKeyDown={e => onKey(e, i)}
                style={{
                  position: "absolute",
                  left: `calc(50% + ${v.dx}px)`,
                  top: `calc(50% + ${v.dy}px)`,
                  transform: `translate(-50%, -50%) scale(${entered ? (act ? 1.04 : 1) : 0.92})`,
                  width: R * 2, height: R * 2, borderRadius: "50%",
                  backgroundColor: party.color,
                  border: act ? "2px solid rgba(255,255,255,0.45)" : "none",
                  cursor: "pointer", outline: "none",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  opacity: entered ? (faded ? 0.25 : 1) : 0,
                  zIndex: act ? 2 : 1,
                  transition: entered
                    ? trans
                    : (rm ? "none" : `opacity 500ms ${EASE.standard} ${delay}ms, transform 500ms ${EASE.standard} ${delay}ms`),
                }}
              >
                {/* Icon/Logo — centred in circle */}
                {i === 1
                  ? <TellianLogo w={isz.w} h={isz.h} color={C.purple} />
                  : <PlaceholderIcon w={isz.w} h={isz.h} color={C.purple} />
                }
              </div>

              {/* Party label — outside circle */}
              <span style={{
                position: "absolute",
                left: `calc(50% + ${v.dx}px)`,
                ...(i === 0
                  ? { top: `calc(50% + ${v.dy}px - ${R + 10}px)`, transform: "translateX(-50%) translateY(-100%)" }
                  : { top: `calc(50% + ${v.dy}px + ${R + 10}px)`, transform: "translateX(-50%)" }
                ),
                fontFamily: sans, fontSize: 9, letterSpacing: "0.18em",
                textTransform: "uppercase",
                color: act ? W : W75,
                fontWeight: act ? 600 : 400,
                whiteSpace: "nowrap", userSelect: "none", pointerEvents: "none",
                opacity: entered ? (faded ? 0.25 : 1) : 0,
                zIndex: act ? 2 : 1,
                transition: entered ? trans : (rm ? "none" : `opacity 500ms ${EASE.standard} ${delay}ms`),
              }}>
                {party.label.de}
              </span>
            </div>
          );
        })}

        {/* ── Fixed reading zone — ONE position for all hover texts ── */}
        {hovered !== null && (() => {
          const party = PARTIES[hovered];
          const isCta = hovered === 1;
          return (
            <div style={{
              position: "absolute",
              left: "50%",
              top: `calc(50% + ${READING_ZONE_Y}px)`,
              transform: "translateX(-50%)",
              textAlign: "center",
              maxWidth: 220,
              pointerEvents: isCta ? "auto" : "none",
              zIndex: 3,
            }}>
              {/* Party-color dot + micro-header for attribution */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginBottom: 10 }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", backgroundColor: party.color, flexShrink: 0 }} />
                <span style={{
                  fontFamily: sans, fontSize: 8, letterSpacing: "0.16em",
                  textTransform: "uppercase", color: W75,
                }}>
                  {party.label.de}
                </span>
              </div>
              {/* Prosa text or CTA */}
              {isCta ? (
                <a
                  href="#vermoegensverwaltung"
                  onClick={(e) => { e.preventDefault(); onNavigate?.(); }}
                  style={{
                    fontFamily: serif, fontSize: 14, color: W,
                    lineHeight: 1.5, textDecoration: "none", display: "block",
                    cursor: "pointer",
                    animation: rm ? "none" : `vennFade 240ms ${EASE.standard} both`,
                  }}
                >
                  {party.prosa.de}
                </a>
              ) : (
                <p style={{
                  fontFamily: serif, fontSize: 13.5, color: W90,
                  lineHeight: 1.5, margin: 0,
                  animation: rm ? "none" : `vennFade 280ms ${EASE.standard} both`,
                }} lang="de">
                  {party.prosa.de}
                </p>
              )}
            </div>
          );
        })()}
      </div>

      {/* ── Reduced-motion: all prosa permanently visible in the reading zone ── */}
      {rm && (
        <div style={{
          position: "absolute",
          top: `calc(50% + ${READING_ZONE_Y}px)`,
          left: "50%", transform: "translateX(-50%)",
          maxWidth: 240, textAlign: "center",
        }}>
          {PARTIES.map((party, pi) => (
            <div key={`rm-${party.id}`} style={{ marginTop: pi === 0 ? 0 : 18 }}>
              <span style={{
                fontFamily: sans, fontSize: 9, letterSpacing: "0.16em",
                textTransform: "uppercase", color: party.color,
                fontWeight: 600, display: "block", marginBottom: 4,
              }}>
                {party.label.de}
              </span>
              <p style={{
                fontFamily: serif, fontSize: 12.5, color: W90,
                lineHeight: 1.5, margin: 0,
              }} lang="de">
                {party.prosa.de}
              </p>
            </div>
          ))}
        </div>
      )}

      <style>{`
        @keyframes vennFade {
          from { opacity: 0; transform: translateY(5px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
