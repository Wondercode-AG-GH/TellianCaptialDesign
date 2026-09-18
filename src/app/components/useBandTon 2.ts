import { useEffect, useRef, useState } from "react";

import { SECTIONS, type SectionDef } from "../sections";

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
  /** ON-IMAGE (Editorial-A2-Hero): der Bereich liegt über einem
      Foto. Schrift wie auf dunklem Grund, aber die Bänder dürfen
      zusätzlich stützen (Portal-Scrim, Textschatten). Markiert wird
      per data-tellian-bildzone am Bildpanel — die Zone wandert
      dadurch mit dem Track und mit jedem Resize. */
  bild?: boolean;
}

/** Sichtbare Schicht eines Bandes. */
export type BandSchicht = "hell" | "dunkel" | "bild";

/** Weiche Kante der Maske, damit die Grenze nicht als Treppe liest. */
const FEDER = 1.5;

/**
 * Sichtbare Stationsbereiche im Fenster, links nach rechts.
 * Im schmalen Zweig eine einzige Zone — dort gibt es keinen Track.
 */
export function useBandZonen(
  aktiv: boolean,
  activeIndex: number,
  sektionen: readonly SectionDef[] = SECTIONS,
): Zone[] {
  const [zonen, setZonen] = useState<Zone[]>(() => [
    { von: 0, bis: 10000, dunkel: sektionen[0]?.dunkel ?? false },
  ]);
  const letzte = useRef("");

  useEffect(() => {
    if (!aktiv) {
      const z = [
        { von: 0, bis: 10000, dunkel: sektionen[activeIndex]?.dunkel ?? false },
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
        const s = sektionen[Number(el.dataset.tellianStation)];
        if (!s) return;
        const r = el.getBoundingClientRect();
        const von = Math.max(0, r.left);
        const bis = Math.min(breite, r.right);
        if (bis - von <= 0.5) return;
        roh.push({ von, bis, dunkel: s.dunkel });
      });
      if (!roh.length) return;
      roh.sort((a, b) => a.von - b.von);

      /* Bildzonen herausschneiden: ein markiertes Bildpanel
         überschreibt den Stationston in seinem Bereich. */
      const bilder: Zone[] = [];
      document
        .querySelectorAll<HTMLElement>("[data-tellian-bildzone]")
        .forEach((el) => {
          const r = el.getBoundingClientRect();
          const von = Math.max(0, r.left);
          const bis = Math.min(breite, r.right);
          if (bis - von > 0.5) bilder.push({ von, bis, dunkel: true, bild: true });
        });
      if (bilder.length) {
        bilder.sort((a, b) => a.von - b.von);
        const geschnitten: Zone[] = [];
        for (const z of roh) {
          let teile: Zone[] = [z];
          for (const b of bilder) {
            teile = teile.flatMap((t) => {
              if (b.bis <= t.von || b.von >= t.bis) return [t];
              const raus: Zone[] = [];
              if (b.von > t.von) raus.push({ ...t, bis: b.von });
              if (b.bis < t.bis) raus.push({ ...t, von: b.bis });
              return raus;
            });
          }
          geschnitten.push(...teile.filter((t) => t.bis - t.von > 0.5));
        }
        geschnitten.push(...bilder);
        roh.length = 0;
        roh.push(...geschnitten);
        roh.sort((a, b) => a.von - b.von);
      }

      /* Nachbarn gleicher Farbe zusammenfassen — sonst entstünde in
         der Maske eine Naht zwischen zwei gleichfarbigen Stationen. */
      const zus: Zone[] = [];
      for (const z of roh) {
        const v = zus[zus.length - 1];
        if (v && v.dunkel === z.dunkel && !!v.bild === !!z.bild && z.von - v.bis < 1.5)
          v.bis = z.bis;
        else zus.push({ ...z });
      }
      /* Ränder aufziehen, damit ein Rundungsrest am Fensterrand keine
         unmaskierte Haarlinie stehen lässt. */
      zus[0].von = 0;
      zus[zus.length - 1].bis = breite;

      const schluessel = zus
        .map((z) => `${Math.round(z.von)}:${Math.round(z.bis)}:${z.dunkel ? 1 : 0}:${z.bild ? 1 : 0}`)
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

function passt(z: Zone, schicht: BandSchicht): boolean {
  if (schicht === "bild") return !!z.bild;
  if (schicht === "dunkel") return z.dunkel && !z.bild;
  return !z.dunkel;
}

/**
 * Maske für eine der Schichten: sichtbar dort, wo der Grund die
 * gewünschte Färbung hat. Drei Schichten seit dem A2-Hero: hell,
 * dunkel und ON-IMAGE (bild).
 */
export function zonenMaske(zonen: Zone[], schicht: BandSchicht): string {
  const stopps: string[] = [];
  for (const z of zonen) {
    const farbe = passt(z, schicht) ? "#000" : "transparent";
    stopps.push(`${farbe} ${z.von.toFixed(1)}px`);
    stopps.push(`${farbe} ${Math.max(z.von, z.bis - FEDER).toFixed(1)}px`);
  }
  return `linear-gradient(to right, ${stopps.join(", ")})`;
}

/** Trägt eine der Zonen überhaupt diese Färbung? */
export function hatZone(zonen: Zone[], schicht: BandSchicht): boolean {
  return zonen.some((z) => passt(z, schicht) && z.bis - z.von > 0.5);
}
