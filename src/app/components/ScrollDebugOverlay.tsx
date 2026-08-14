import { useEffect, useRef, useState } from "react";

import {
  SCROLL_TUNING,
  type ScrollDebugInfo,
  type ArmReason,
  type ScrollPhase,
} from "./useHorizontalScroll";
import { SECTIONS } from "../sections";

/* ═══════════════════════════════════════════════════════════
   DEBUG-OVERLAY FÜR DIE SEKTIONS-RASTUNG

   Hinter dem Flag ?scrolldebug. Zeigt Delta, Hüllkurve,
   Scharfschaltung und ausgelösten Index in Echtzeit.

   Ohne dieses Fenster ist das Abstimmen der Gestenerkennung
   Blindflug: Trackpad, Mausrad und Precision-Touchpad liefern
   sehr unterschiedliche Event-Ströme, und der Unterschied
   zwischen Nachlauf und bewusster Zweitgeste ist an den
   Rohwerten nicht zu erraten.

   Bleibt bis zum Go-live drin.
   ═══════════════════════════════════════════════════════════ */

/** true, wenn die URL ?scrolldebug enthält. */
export function isScrollDebugEnabled(): boolean {
  if (typeof window === "undefined") return false;
  return new URLSearchParams(window.location.search).has("scrolldebug");
}

const REASON_LABEL: Record<ArmReason, string> = {
  quiet: "Ruhephase",
  rise: "Wiederbeschleunigung",
  reverse: "Richtungsumkehr",
  wheel: "Mausrad (konstant)",
  tail: "Nachlauf (verworfen)",
  "—": "—",
};

const REASON_COLOR: Record<ArmReason, string> = {
  quiet: "#7dd3fc",
  rise: "#86efac",
  reverse: "#fcd34d",
  wheel: "#c4b5fd",
  tail: "#71717a",
  "—": "#71717a",
};

const PHASE_LABEL: Record<ScrollPhase, string> = {
  idle: "ruht",
  tracking: "folgt der Hand",
  settling: "Antrieb vollendet",
};

const PHASE_COLOR: Record<ScrollPhase, string> = {
  idle: "#71717a",
  tracking: "#86efac",
  settling: "#7dd3fc",
};

interface Props {
  debugRef: React.RefObject<ScrollDebugInfo>;
}

export function ScrollDebugOverlay({ debugRef }: Props) {
  /* Eigener RAF-Loop statt State-Updates im Hook: so kostet die
     Instrumentierung keinen Re-Render pro Wheel-Event und verschiebt
     die gemessenen Zeitabstände nicht. */
  const [, forceRender] = useState(0);
  const frame = useRef(0);

  useEffect(() => {
    const loop = () => {
      forceRender((n) => (n + 1) % 1000);
      frame.current = requestAnimationFrame(loop);
    };
    frame.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(frame.current);
  }, []);

  const d = debugRef.current;
  if (!d) return null;

  const peak = Math.max(1, ...d.recent, d.envelope);
  const fired = d.reason !== "tail" && d.reason !== "—";

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
        SCROLL-RASTUNG · ?scrolldebug
      </div>

      <Row label="Sektion">
        <span style={{ color: "#fff" }}>
          {d.index} · {SECTIONS[d.index]?.label ?? "?"}
        </span>
        <span style={{ color: d.mode === "free" ? "#fcd34d" : "#71717a", marginLeft: 8 }}>
          {d.mode === "free" ? "FREI (temporär)" : "snap"}
        </span>
      </Row>

      <Row label="Phase">
        <span style={{ color: PHASE_COLOR[d.phase] }}>{PHASE_LABEL[d.phase]}</span>
        <span style={{ color: "#71717a", marginLeft: 8 }}>
          {d.device === "servo" ? "Servo" : d.device === "wheel" ? "Rad (diskret)" : d.device === "touch" ? "Touch" : "—"}
        </span>
      </Row>

      <Row label="Zug">
        <span
          style={{
            color:
              Math.abs(d.dragPct) >= SCROLL_TUNING.COMMIT_FRACTION * 100
                ? "#86efac"
                : "#fff",
          }}
        >
          {`${d.dragPct}%`.padStart(5)}
        </span>
        <span style={{ color: "#71717a", marginLeft: 8 }}>
          Schwelle {Math.round(SCROLL_TUNING.COMMIT_FRACTION * 100)}% · 1:1 bis{" "}
          {Math.round(SCROLL_TUNING.FOLLOW_LINEAR * 100)}%
        </span>
      </Row>

      <Row label="Nachlauf">
        <span style={{ color: d.momentum ? "#fb923c" : "#71717a" }}>
          {d.momentum ? "erkannt" : "nein"}
        </span>
        <span style={{ color: "#71717a", marginLeft: 8 }}>
          Abfall {d.fallRun}/{SCROLL_TUNING.MOMENTUM_FALL_RUN} · unter{" "}
          {Math.round(SCROLL_TUNING.MOMENTUM_PEAK_FRACTION * 100)}% des Maximums
        </span>
      </Row>

      <Row label="Vollendung">
        <span style={{ color: "#fff" }}>{`${d.settleMs}ms`.padStart(6)}</span>
        <span style={{ color: "#71717a", marginLeft: 8 }}>
          {SCROLL_TUNING.SETTLE_MS_MIN}–{SCROLL_TUNING.SETTLE_MS_MAX}ms, nach Reststrecke
        </span>
      </Row>

      <Row label="Scharf">
        <span style={{ color: d.armed ? "#86efac" : "#f87171" }}>
          {d.armed ? "ja" : "nein"}
        </span>
        <span style={{ color: REASON_COLOR[d.reason], marginLeft: 8 }}>
          {REASON_LABEL[d.reason]}
        </span>
      </Row>

      <Row label="Delta">
        <span style={{ color: "#fff" }}>{d.delta.toFixed(0).padStart(5)}</span>
        <span style={{ color: "#71717a", marginLeft: 8 }}>
          Abstand {d.gap > 9999 ? "—" : `${d.gap.toFixed(0)}ms`}
        </span>
      </Row>

      <Row label="Hüllkurve">
        <span style={{ color: "#fff" }}>{d.envelope.toFixed(0).padStart(5)}</span>
        <span style={{ color: "#71717a", marginLeft: 8 }}>
          Schwelle {d.riseThreshold.toFixed(0)}
        </span>
      </Row>

      <Row label="Akkumulator">
        <span style={{ color: Math.abs(d.accum) >= SCROLL_TUNING.WHEEL_THRESHOLD ? "#86efac" : "#fff" }}>
          {d.accum.toFixed(0).padStart(5)}
        </span>
        <span style={{ color: "#71717a", marginLeft: 8 }}>
          / {SCROLL_TUNING.WHEEL_THRESHOLD}
        </span>
      </Row>

      <Row label="Rad-Lauf">
        <span style={{ color: d.steadyRun >= SCROLL_TUNING.WHEEL_DEVICE_RUN ? "#c4b5fd" : "#fff" }}>
          {String(d.steadyRun).padStart(5)}
        </span>
        <span style={{ color: "#71717a", marginLeft: 8 }}>
          / {SCROLL_TUNING.WHEEL_DEVICE_RUN} · ab {SCROLL_TUNING.WHEEL_DEVICE_MIN_ABS}px
          {" · "}Abstand ≥ {SCROLL_TUNING.WHEEL_DEVICE_MIN_GAP_MS}ms
        </span>
      </Row>

      <Row label="Sprünge">
        <span style={{ color: "#fff" }}>{d.fired}</span>
        <span style={{ color: "#71717a", marginLeft: 8 }}>
          zuletzt → {d.lastFiredIndex} · {d.events} Events
        </span>
      </Row>

      {/* Zerfallsform der letzten Events. Ein Nachlauf fällt monoton;
          ein bewusster zweiter Schub ist ein sichtbarer Ausschlag. */}
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
        {d.recent.map((v, i) => (
          <div
            key={i}
            style={{
              width: 6,
              height: `${Math.max(2, (v / peak) * 32)}px`,
              background:
                i === d.recent.length - 1 && fired ? "#86efac" : "#52525b",
            }}
          />
        ))}
      </div>

      <div style={{ color: "#52525b", marginTop: 6, fontSize: 10 }}>
        Ruhe {SCROLL_TUNING.QUIET_MS}ms · HWZ {SCROLL_TUNING.ENVELOPE_HALFLIFE_MS}ms ·
        Faktor {SCROLL_TUNING.RISE_FACTOR} · Sprung {SCROLL_TUNING.SETTLE_MS_MAX}ms
      </div>
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ display: "flex" }}>
      <span style={{ color: "#71717a", width: 96, flexShrink: 0 }}>{label}</span>
      <span>{children}</span>
    </div>
  );
}
