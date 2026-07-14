import { useState, useEffect, useMemo } from "react";

export type Breakpoint = "mobile" | "tablet" | "desktop";

const BREAKPOINTS = { tablet: 768, desktop: 1024 } as const;

function getBreakpoint(width: number): Breakpoint {
  if (width >= BREAKPOINTS.desktop) return "desktop";
  if (width >= BREAKPOINTS.tablet) return "tablet";
  return "mobile";
}

export function useBreakpoint() {
  const [bp, setBp] = useState<Breakpoint>(() =>
    typeof window !== "undefined" ? getBreakpoint(window.innerWidth) : "desktop"
  );

  useEffect(() => {
    const onResize = () => setBp(getBreakpoint(window.innerWidth));
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  return useMemo(
    () => ({
      breakpoint: bp,
      isMobile: bp === "mobile",
      isTablet: bp === "tablet",
      isDesktop: bp === "desktop",
      isVertical: bp !== "desktop", // tablet + mobile use vertical scroll
    }),
    [bp]
  );
}
