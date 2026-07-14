import { useRef, useState, useEffect, type ReactNode, type CSSProperties } from "react";
import { EASE } from "../../styles/motion";

/* ═══════════════════════════════════════════════════════════
   FADE IN — one-shot reveal for horizontal scroll layouts.

   Uses the scroll container as IntersectionObserver root
   (not the viewport) so elements only reveal when they
   actually scroll into the visible area of the container.

   Falls back to a simple delay-based reveal if no scroll
   container is found (e.g., on mount before ref is set).
   ═══════════════════════════════════════════════════════════ */

interface FadeInProps {
  children: ReactNode;
  yOffset?: number;
  delay?: number;
  duration?: number;
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

    /* Find the scroll container (horizontal or vertical) */
    let scrollRoot: Element | null = null;
    let isHorizontalScroll = false;
    let parent = el.parentElement;
    while (parent) {
      const style = getComputedStyle(parent);
      if (style.overflowX === "scroll" || style.overflowX === "auto") {
        scrollRoot = parent;
        isHorizontalScroll = true;
        break;
      }
      if (style.overflowY === "scroll" || style.overflowY === "auto") {
        scrollRoot = parent;
        break;
      }
      parent = parent.parentElement;
    }

    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setEntered(true);
          obs.disconnect();
        }
      },
      {
        root: scrollRoot,
        threshold: 0.05,
        rootMargin: isHorizontalScroll ? "0px 200px 0px 200px" : "200px 0px 200px 0px",
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
