/* ═══════════════════════════════════════════════════════════
   ZWEI-ZEILEN-REGEL (12.10.)

   Überschriften (h1, h2) stehen auf höchstens zwei Zeilen — auf
   jeder Seite, in jeder Sprache, in jeder Fenstergrösse. Bricht eine
   Überschrift auf drei oder mehr Zeilen um, wird ihre Schrift
   schrittweise verkleinert, bis sie wieder auf zwei passt (höchstens
   bis 60 % der gestalteten Grösse und nie unter 18px).

   Gilt automatisch für alle Überschriften, auch für künftige. Wer
   eine Ausnahme braucht, setzt data-zeilen-frei auf das Element.

   Die gestaltete Grösse kommt weiter aus CSS (clamp, Tokens); hier
   wird nur nach unten korrigiert und bei jeder Grössenänderung neu
   gemessen.
   ═══════════════════════════════════════════════════════════ */

const MAX_ZEILEN = 2;
const MIN_FAKTOR = 0.6;
/* Nie kleiner als 18px: eine Überschrift darf nicht unter die Grösse
   des Fliesstexts fallen. Sehr lange Titel (Rechtstexte auf dem Handy)
   bleiben dann ausnahmsweise dreizeilig. */
const MIN_PX = 18;
const SCHRITT = 0.03;

/** Zeilen anhand der tatsächlichen Textzeilen zählen (robust auch bei
    gemischten Schriften und <br>). */
function zeilen(el: HTMLElement): number {
  const tops: number[] = [];
  const lh = parseFloat(getComputedStyle(el).fontSize) * 0.5;
  const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
  const range = document.createRange();
  while (walker.nextNode()) {
    const n = walker.currentNode;
    if (!n.textContent || !n.textContent.trim()) continue;
    range.selectNodeContents(n);
    for (const r of range.getClientRects()) {
      if (r.width < 1) continue;
      if (!tops.some((t) => Math.abs(t - r.top) < lh)) tops.push(r.top);
    }
  }
  return tops.length;
}

function anpassen(el: HTMLElement) {
  if (el.hasAttribute("data-zeilen-frei") || el.offsetParent === null) return;
  // Ausgangslage: gestaltete Grösse aus CSS/Inline-Stil wiederherstellen
  const original = el.dataset.zzOriginal ?? el.style.fontSize;
  el.dataset.zzOriginal = original;
  el.style.fontSize = original;
  if (zeilen(el) <= MAX_ZEILEN) return;
  const basis = parseFloat(getComputedStyle(el).fontSize);
  const minF = Math.max(MIN_FAKTOR, Math.min(1, MIN_PX / basis));
  let f = 1;
  while (f > minF) {
    f = Math.max(minF, f - SCHRITT);
    el.style.fontSize = `${(basis * f).toFixed(2)}px`;
    if (zeilen(el) <= MAX_ZEILEN) break;
  }
}

export function zweiZeilenRegel() {
  const beobachtet = new WeakSet<Element>();
  let geplant = 0;
  const alle = () => {
    cancelAnimationFrame(geplant);
    geplant = requestAnimationFrame(() => {
      document.querySelectorAll<HTMLElement>("h1, h2").forEach((el) => {
        if (!beobachtet.has(el)) { beobachtet.add(el); ro.observe(el); }
        anpassen(el);
      });
    });
  };
  // Breite einer Überschrift ändert sich → neu messen
  const ro = new ResizeObserver((eintraege) => {
    for (const e of eintraege) anpassen(e.target as HTMLElement);
  });
  // neue Überschriften (Seitenwechsel, Overlays, Sprache)
  new MutationObserver(alle).observe(document.body, { childList: true, subtree: true, characterData: true });
  window.addEventListener("resize", alle);
  document.fonts?.ready.then(alle);
  alle();
}
