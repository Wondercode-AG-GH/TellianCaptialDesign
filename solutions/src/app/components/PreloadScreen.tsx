import { useState, useEffect } from "react";
import { C } from "../tokens";
import logoWhite from "../../assets/logo/Tellian__archive white logo horizontal.svg";

/* ═══════════════════════════════════════════════════════════
   PRELOAD SCREEN — Branded intro, mirrored from main site.
   Timeline: 500ms logo fade-in → 2200ms hold → 800ms slide-up → onComplete
   ═══════════════════════════════════════════════════════════ */

interface Props { onComplete: () => void; }

export function PreloadScreen({ onComplete }: Props) {
  const [phase, setPhase] = useState<"logo-in" | "hold" | "exit">("logo-in");

  useEffect(() => {
    const t1 = setTimeout(() => setPhase("hold"), 500);
    const t2 = setTimeout(() => setPhase("exit"), 2700);
    const t3 = setTimeout(() => onComplete(), 3500);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [onComplete]);

  return (
    <div style={{
      position: "fixed",
      inset: 0,
      zIndex: 200,
      backgroundColor: C.purple,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      transform: phase === "exit" ? "translateY(-100%)" : "translateY(0)",
      transition: phase === "exit"
        ? "transform 0.8s cubic-bezier(0.76, 0, 0.24, 1)"
        : "none",
    }}>
      <img
        src={logoWhite}
        alt="Tellian Capital Solutions"
        style={{
          width: "clamp(360px, 60vw, 680px)",
          opacity: phase === "logo-in" ? 0 : 1,
          transition: "opacity 0.6s ease-out",
        }}
      />
    </div>
  );
}
