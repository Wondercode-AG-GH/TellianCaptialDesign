import { useEffect, useRef, useState } from "react";

import { SCROLL_TUNING, type ScrollDebugInfo } from "./useHorizontalScroll";
import { SECTIONS } from "../sections";

/* ═══════════════════════════════════════════════════════════
   DEBUG-OVERLAY FÜR DEN HORIZONTALEN SCROLL

   Hinter dem Flag ?scrolldebug.

   Es zeigt jetzt deutlich weniger als früher, weil es weniger zu
   zeigen gibt: keine Gestenerkennung, keine Scharfstell-Signale,
   keine Phasen, keine Commit-Schwelle. Der Scroll hat nur noch
   Position, Geschwindigkeit und einen Rückstand der Glättung.

   Die eine Zahl, auf die es beim Abstimmen ankommt, ist RÜCKSTAND:
   wie weit die sichtbare Position der Eingabe hinterherhinkt. Bleibt
   er klein gegenüber der Bewegung je Frame, fühlt es sich direkt an;
   wächst er, wirkt es träge. Gestellt wird er über SMOOTH_TAU_MS.
   ═══════════════════════════════════════════════════════════ */

/** true, wenn die URL ?scrolldebug enthält. */
export function isScrollDebugEnabled(): boolean {
  if (typeof window === "undefined") return false;
  return new URLSearchParams(window.location.search).has("scrolldebug");
}

interface Props {
  debugRef: React.RefObject<ScrollDebugInfo>;
}

export function ScrollDebugOverlay({ debugRef }: Props) {
  /* Eigener RAF-Loop statt State-Updates im Hook: so kostet die
     Instrumentierung keinen Re-Render pro Event und verschiebt die
     gemessenen Zeitverhältnisse nicht. */
  const [, forceRender] = useState(0);
  const frame = useRef(0);
  const trace = useRef<number[]>([]);

  useEffect(() => {
    const loop = () => {
      const d = debugRef.current;
      if (d) {
        trace.current.push(Math.abs(d.velocity));
        if (trace.current.length > 48) trace.current.shift();
      }
      forceRender((n) => (n + 1) % 1000);
      frame.current = requestAnimationFrame(loop);
    };
    frame.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(frame.current);
  }, [debugRef]);

  const d = debugRef.current;
  if (!d) return null;

  const peak = Math.max(0.5, ...trace.current);

  return (
    <div
      style={{
        position: "fixed",
        top: 12,
        left: 12,
        zIndex: 9999,
        pointerEvents: "none",
        fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
        fontSize: 11,
        lineHeight: 1.5,
        color: "#e4e4e7",
        background: "rgba(9, 9, 11, 0.88)",
        border: "1px solid rgba(255,255,255,0.14)",
        borderRadius: 8,
        padding: "10px 12px",
        minWidth: 300,
        backdropFilter: "blur(8px)",
      }}
    >
      <div style={{ color: "#a1a1aa", marginBottom: 6, letterSpacing: "0.08em" }}>
        SCROLL · ?scrolldebug
      </div>

      <Row label="Sektion">
        <span style={{ color: "#fff" }}>
          {d.index} · {SECTIONS[d.index]?.label ?? "?"}
        </span>
        <span style={{ color: "#71717a", marginLeft: 8 }}>
          unter der Bildmitte
        </span>
      </Row>

      <Row label="Position">
        <span style={{ color: "#fff" }}>{String(d.position).padStart(6)}px</span>
        <span style={{ color: "#71717a", marginLeft: 8 }}>{d.progressPct}% der Strecke</span>
      </Row>

      <Row label="Bewegung">
        <span style={{ color: d.commanded ? "#7dd3fc" : "#86efac" }}>
          {d.commanded ? "befohlen" : Math.abs(d.velocity) > 0.02 ? "frei" : "ruht"}
        </span>
        <span style={{ color: "#71717a", marginLeft: 8 }}>
          {Math.abs(d.velocity).toFixed(2)} px/ms
        </span>
      </Row>

      {/* Die Zahl zum Abstimmen. Klein gegenüber der Bewegung je Frame
          heisst direkt; wächst sie, wirkt es träge. */}
      <Row label="Rückstand">
        <span style={{ color: Math.abs(d.lagPx) > 40 ? "#fcd34d" : "#fff" }}>
          {String(d.lagPx).padStart(6)}px
        </span>
        <span style={{ color: "#71717a", marginLeft: 8 }}>
          Zeitkonstante {SCROLL_TUNING.SMOOTH_TAU_MS}ms
        </span>
      </Row>

      <Row label="Eingabe">
        <span style={{ color: "#fff" }}>{String(d.delta).padStart(6)}</span>
        <span style={{ color: "#71717a", marginLeft: 8 }}>
          Abstand {d.gap > 9999 ? "—" : `${d.gap}ms`} · {d.events} Events
        </span>
      </Row>

      {/* Geschwindigkeitsverlauf. Ein flüssiger Scroll zeigt hier eine
          einzige Welle, die ausläuft — keine Treppe und keine Delle. */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-end",
          gap: 1,
          height: 34,
          marginTop: 8,
          paddingTop: 2,
          borderTop: "1px solid rgba(255,255,255,0.1)",
        }}
      >
        {trace.current.map((v, i) => (
          <div
            key={i}
            style={{
              width: 5,
              height: `${Math.max(1, (v / peak) * 32)}px`,
              background: i === trace.current.length - 1 ? "#86efac" : "#52525b",
            }}
          />
        ))}
      </div>

      <div style={{ color: "#52525b", marginTop: 6, fontSize: 10 }}>
        Sprung {SCROLL_TUNING.JUMP_MS}ms · Taste {SCROLL_TUNING.KEY_MS}ms ·{" "}
        {Math.round(SCROLL_TUNING.KEY_STEP_FRACTION * 100)}% Bildbreite
      </div>
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ display: "flex" }}>
      <span style={{ color: "#71717a", width: 88, flexShrink: 0 }}>{label}</span>
      <span>{children}</span>
    </div>
  );
}
