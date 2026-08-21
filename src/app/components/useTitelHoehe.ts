import { useLayoutEffect, useRef, useState } from "react";

/* ═══════════════════════════════════════════════════════════
   TITELHÖHE DER NACHBARSTATION

   Station 3 zentriert ihre ganze Spalte — Titel, Haarlinie,
   Fliesstext — und der Titel sitzt oben darin. Wer nur seinen
   eigenen Titel zentriert, landet auf Höhe des Fliesstextes.

   Die Spaltenhöhe hängt am Textumbruch (gemessen 530px bei 1024,
   376px bei 1512, 360px bei 2560) und ist in CSS nicht ausdrückbar.
   Deshalb wird sie gemessen. Gelesen wird ausschliesslich — an der
   Referenzstation ändert sich nichts.
   ═══════════════════════════════════════════════════════════ */

/* Lage im LAYOUT, nicht auf dem Schirm: offsetTop ignoriert
   transform. Station 3 blendet ihren Titel mit einem translateY
   ein — getBoundingClientRect hätte diese 24px mitgemessen. */
function obenIn(el: HTMLElement, wurzel: HTMLElement): number | null {
  let y = 0;
  let n: HTMLElement | null = el;
  while (n && n !== wurzel) {
    y += n.offsetTop;
    n = n.offsetParent as HTMLElement | null;
  }
  return n === wurzel ? y : null;
}

/** Steht der Titel im Fluss — oder ist er selbst absolut gesetzt? */
function imFluss(el: HTMLElement, wurzel: HTMLElement): boolean {
  let n: HTMLElement | null = el;
  while (n && n !== wurzel) {
    if (getComputedStyle(n).position === "absolute") return false;
    n = n.parentElement;
  }
  return true;
}

/**
 * Sucht rückwärts die nächste Station, deren Titel im Fluss steht,
 * und liefert dessen Oberkante. Stationen, die ihren Titel selbst
 * absolut setzen (also schon von hier abhängen), werden übersprungen
 * — sonst hinge eine Kette aneinander und die erste Messung wäre
 * dauerhaft falsch.
 */
export function useTitelHoehe(aktiv: boolean) {
  const wurzelRef = useRef<HTMLDivElement | null>(null);
  const [oben, setOben] = useState<number | null>(null);

  useLayoutEffect(() => {
    if (!aktiv) return;

    const referenz = () => {
      let n = wurzelRef.current?.previousElementSibling as HTMLElement | null;
      while (n) {
        const h2 = n.querySelector("h2") as HTMLElement | null;
        if (h2 && imFluss(h2, n)) return { station: n, h2 };
        n = n.previousElementSibling as HTMLElement | null;
      }
      return null;
    };

    const messen = () => {
      const r = referenz();
      if (!r) return;
      const y = obenIn(r.h2, r.station);
      if (y !== null) setOben(y);
    };

    messen();

    /* Die Stationswurzel ist h-screen und ändert ihre Grösse NIE.
       Beobachtet wird deshalb die Textspalte: sie wächst, wenn
       Cormorant nachlädt und der Umbruch sich ändert. Ohne das stand
       der Titel gemessene 12px (bei 1024 sogar 26px) zu tief, weil
       noch die Ersatzschrift vermessen worden war. */
    const beobachter = new ResizeObserver(messen);
    const r = referenz();
    if (r) {
      const spalte = r.h2.closest("div")?.parentElement ?? null;
      for (const ziel of [r.h2, spalte, r.station]) if (ziel) beobachter.observe(ziel);
    }
    document.fonts?.ready.then(messen).catch(() => {});
    window.addEventListener("resize", messen);

    return () => {
      beobachter.disconnect();
      window.removeEventListener("resize", messen);
    };
  }, [aktiv]);

  return { wurzelRef, oben };
}
