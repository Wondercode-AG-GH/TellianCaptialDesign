import { useEffect } from "react";

import { BASIS_URL, VORSCHAU_BILD, seitenDaten, sprachKennung } from "./seo";

/* ═══════════════════════════════════════════════════════════
   KOPFDATEN SETZEN (18.09)

   Schreibt Titel, Beschreibung, Sprachkennung, kanonische Adresse
   und die Vorschau-Angaben in den Dokumentkopf — bei jedem Wechsel
   von Adresse oder Sprache. Der statische Bestand in index.html
   bleibt die Grundlage für Dienste ohne JavaScript; hier wird er
   zur aktuellen Ansicht nachgeführt.
   ═══════════════════════════════════════════════════════════ */

function setzeMeta(wahl: string, wert: string, attribut: "name" | "property") {
  if (!wert) return;
  let el = document.head.querySelector<HTMLMetaElement>(`meta[${attribut}="${wahl}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attribut, wahl);
    document.head.appendChild(el);
  }
  el.setAttribute("content", wert);
}

function setzeVerweis(rel: string, href: string) {
  let el = document.head.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`);
  if (!el) {
    el = document.createElement("link");
    el.setAttribute("rel", rel);
    document.head.appendChild(el);
  }
  el.setAttribute("href", href);
}

/**
 * @param pfad    Aktuelle Adresse, z. B. "/mandat".
 * @param sprache "DE" | "EN" | "FR".
 */
export function useSeo(pfad: string, sprache: string) {
  useEffect(() => {
    if (typeof document === "undefined") return;
    const { titel, beschreibung } = seitenDaten(pfad, sprache);
    const { lang, locale } = sprachKennung(sprache);
    const url = `${BASIS_URL}${pfad === "/" ? "" : pfad}`;

    document.title = titel;
    document.documentElement.setAttribute("lang", lang);

    setzeMeta("description", beschreibung, "name");
    setzeVerweis("canonical", url);

    setzeMeta("og:title", titel, "property");
    setzeMeta("og:description", beschreibung, "property");
    setzeMeta("og:url", url, "property");
    setzeMeta("og:locale", locale, "property");
    setzeMeta("og:image", VORSCHAU_BILD, "property");
    setzeMeta("og:type", "website", "property");
    setzeMeta("og:site_name", "Tellian Capital", "property");

    setzeMeta("twitter:card", "summary_large_image", "name");
    setzeMeta("twitter:title", titel, "name");
    setzeMeta("twitter:description", beschreibung, "name");
    setzeMeta("twitter:image", VORSCHAU_BILD, "name");
  }, [pfad, sprache]);
}
