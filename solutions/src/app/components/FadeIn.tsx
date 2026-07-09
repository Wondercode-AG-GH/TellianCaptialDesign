import { useRef, useState, useEffect, type ReactNode, type CSSProperties } from "react";
import { EASE } from "../../styles/motion";

/* ═══════════════════════════════════════════════════════════
   FADE IN — one-shot IntersectionObserver reveal.
   Replaces ScrollFade for Solutions: NO scroll-coupled opacity.
   Once entered → opacity:1 forever. Never fades back.

   rootMargin "0px 200px" triggers 200px BEFORE the element
   enters the viewport horizontally — prevents empty panels
   during horizontal scroll.
   ═══════════════════════════════════════════════════════════ */

interface FadeInProps {
  children: ReactNode;
  yOffset?: number;       // default 16 — translateY slide distance
  delay?: number;         // default 0 — ms delay after entering
  duration?: number;      // default 600 — ms transition duration
  className?: string;
  style?: CSSProperties;
}

export function FadeIn({
  children,
  yOffset = 16,
  delay = 0,
  duration = 600,
  className,
  style,
}: FadeInProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [entered, setEntered] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setEntered(true);
          obs.disconnect();
        }
      },
      {
        threshold: 0.05,
        /* 200px horizontal margin — triggers BEFORE element
           fully enters viewport during horizontal scroll */
        rootMargin: "0px 200px 0px 200px",
      },
    );

    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: entered ? 1 : 0,
        transform: entered ? "translateY(0)" : `translateY(${yOffset}px)`,
        transition: `opacity ${duration}ms ease-out ${delay}ms, transform ${duration}ms ${EASE.standard} ${delay}ms`,
        willChange: entered ? "auto" : "transform, opacity",
        ...style,
      }}
    >
      {children}
    </div>
  );
}
