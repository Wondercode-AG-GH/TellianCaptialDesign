import { createContext, useContext } from "react";

/* ═══════════════════════════════════════════════════════════
   EINTRITTS-LATCH

   Sagt dem Inhalt einer Sektion, ob sie in dieser Sitzung schon
   betreten wurde. Einmal true, bleibt true — Eintrittsanimationen
   laufen genau einmal und nie rückwärts.

   Auf Desktop wird der Latch beim *Absprung* gesetzt, nicht bei der
   Ankunft: activeIndex steht schon fest, bevor der 400ms-Tween
   startet. Die Einblendung läuft dadurch während der Flugzeit und
   ist beim Eintreffen fertig, statt erst dann zu beginnen.

   Auf dem vertikalen Zweig liefert useVerticalProgress denselben
   Wert. Beide Pfade haben damit dieselbe Semantik, und die
   Animationskomponenten brauchen keinen isVertical-Zweig mehr.
   ═══════════════════════════════════════════════════════════ */

const SectionEnteredContext = createContext(false);

export const SectionEnteredProvider = SectionEnteredContext.Provider;

/** true, sobald die umgebende Sektion einmal betreten wurde. */
export function useSectionEntered(): boolean {
  return useContext(SectionEnteredContext);
}
