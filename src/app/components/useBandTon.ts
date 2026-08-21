import { useEffect, useRef, useState } from "react";

import { SECTIONS } from "../sections";

/* ═══════════════════════════════════════════════════════════
   TON DER BEIDEN BÄNDER

   Kopfzeile und Stationsleiste haben keine eigene Fläche. Ihre
   Schriftfarbe muss sich deshalb nach dem richten, was gerade unter
   ihnen liegt.

   WARUM NICHT EIN TON FÜRS GANZE BAND
   Erster Versuch war ein Mischwert aus der Flächendeckung: hell,
   solange überwiegend eine helle Station im Fenster steht, dunkel
   sonst. Gemessen scheitert das genau da, wo es zählt. Hält man
   zwischen Station 3 und 4 an, sodass die Farbgrenze bei x = 91
   steht, dann liegt das Logo (48…134) zur Hälfte auf hell und zur
   Hälfte auf dunkel, und die Bedienelemente rechts (1346…1464)
   liegen auf dem hellen Streifen von Station 5, während das Band
   längst hell schreibt. Beides ist unlesbar. Ein Schleier, der das
   auffängt, wird an der Stelle zwangsläufig sichtbar — und damit zu
   der Fläche, die es nicht geben soll.

   WAS STATTDESSEN
   Der Bandinhalt wird ZWEIMAL gezeichnet: einmal in der dunklen
   Schrift, einmal in der hellen. Jede Schicht wird auf die Bereiche
   maskiert, in denen ihr Grund liegt. Über hellen Stationen steht
   also die dunkle Fassung, über dunklen die helle — auch mitten im
   Wort. Es braucht keinen Schleier und keine Fläche, und der Wechsel
   ist von selbst stetig, weil die Maske mit dem Track wandert.
   ═══════════════════════════════════════════════════════════ */

export interface Zone {
  /** Linke und rechte Kante im Fenster, in px. */
  von: number;
  bis: number;
  dunkel: boolean;
}

/** Weiche Kante der Maske, damit die Grenze nicht als Treppe liest. */
const FEDER = 1.5;

/**
 * Sichtbare Stationsbereiche im Fenster, links nach rechts.
 * Im schmalen Zweig eine einzige Zone — dort gibt es keinen Track.
 */
export function useBandZonen(aktiv: boolean, activeIndex: number): Zone[] {
  const [zonen, setZonen] = useState<Zone[]>(() => [
    { von: 0, bis: 10000, dunkel: SECTIONS[0]?.dunkel ?? false },
  ]);
  const letzte = useRef("");

  useEffect(() => {
    if (!aktiv) {
      const z = [
        { von: 0, bis: 10000, dunkel: SECTIONS[activeIndex]?.dunkel ?? false },
      ];
      letzte.current = JSON.stringify(z);
      setZonen(z);
      return;
    }

    let laeuft = true;

    const messen = () => {
      const breite = window.innerWidth;
      const panels = document.querySelectorAll<HTMLElement>("[data-tellian-station]");
      if (!panels.length) return;

      const roh: Zone[] = [];
      panels.forEach((el) => {
        const s = SECTIONS[Number(el.dataset.tellianStation)];
        if (!s) return;
        const r = el.getBoundingClientRect();
        const von = Math.max(0, r.left);
        const bis = Math.min(breite, r.right);
        if (bis - von <= 0.5) return;
        roh.push({ von, bis, dunkel: s.dunkel });
      });
      if (!roh.length) return;
      roh.sort((a, b) => a.von - b.von);

      /* Nachbarn gleicher Farbe zusammenfassen — sonst entstünde in
         der Maske eine Naht zwischen zwei gleichfarbigen Stationen. */
      const zus: Zone[] = [];
      for (const z of roh) {
        const v = zus[zus.length - 1];
        if (v && v.dunkel === z.dunkel && z.von - v.bis < 1.5) v.bis = z.bis;
        else zus.push({ ...z });
      }
      /* Ränder aufziehen, damit ein Rundungsrest am Fensterrand keine
         unmaskierte Haarlinie stehen lässt. */
      zus[0].von = 0;
      zus[zus.length - 1].bis = breite;

      const schluessel = zus
        .map((z) => `${Math.round(z.von)}:${Math.round(z.bis)}:${z.dunkel ? 1 : 0}`)
        .join("|");
      if (schluessel !== letzte.current) {
        letzte.current = schluessel;
        setZonen(zus);
      }
    };

    const schleife = () => {
      if (!laeuft) return;
      messen();
      requestAnimationFrame(schleife);
    };
    const id = requestAnimationFrame(schleife);
    return () => {
      laeuft = false;
      cancelAnimationFrame(id);
    };
  }, [aktiv, activeIndex]);

  return zonen;
}

/**
 * Maske für eine der beiden Schichten: sichtbar dort, wo der Grund
 * die gewünschte Färbung hat.
 */
export function zonenMaske(zonen: Zone[], dunkel: boolean): string {
  const stopps: string[] = [];
  for (const z of zonen) {
    const an = z.dunkel === dunkel;
    const farbe = an ? "#000" : "transparent";
    stopps.push(`${farbe} ${z.von.toFixed(1)}px`);
    stopps.push(`${farbe} ${Math.max(z.von, z.bis - FEDER).toFixed(1)}px`);
  }
  return `linear-gradient(to right, ${stopps.join(", ")})`;
}

/** Trägt eine der Zonen überhaupt diese Färbung? */
export function hatZone(zonen: Zone[], dunkel: boolean): boolean {
  return zonen.some((z) => z.dunkel === dunkel && z.bis - z.von > 0.5);
}
