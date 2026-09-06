import { useEffect, useState } from "react";

import { SECTIONS, type SectionDef } from "../sections";

/**
 * Aktive Sektion im vertikalen Zweig (Tablet + Mobile).
 *
 * Dort ist der Scroll-Hook abgeschaltet, `scrollProgress` blieb also
 * konstant 0 — und weil das Menü seinen aktiven Eintrag ausschliesslich
 * daraus ableitete, stand er dauerhaft auf "Start", egal wo man war.
 *
 * Der rootMargin schneidet den Viewport auf eine waagrechte Linie in
 * seiner Mitte zusammen. Damit schneidet immer genau der Abschnitt, der
 * diese Mitte überdeckt — kein Schwellenwertraten, keine Mehrdeutigkeit
 * bei unterschiedlich hohen Abschnitten.
 */
export function useVerticalSectionIndex(
  enabled: boolean,
  sektionen: readonly SectionDef[] = SECTIONS,
): number {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (!enabled) return;

    const elements = sektionen.map((s) => document.getElementById(s.domId));

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const i = elements.indexOf(entry.target as HTMLElement);
          if (i >= 0) setIndex(i);
        }
      },
      { rootMargin: "-50% 0px -50% 0px", threshold: 0 }
    );

    elements.forEach((el) => el && observer.observe(el));
    return () => observer.disconnect();
  }, [enabled]);

  return index;
}
