import { HeroEditorial } from "../components/HeroEditorial";
import { SOLUTIONS_INHALT } from "./inhalt";

/* ═══════════════════════════════════════════════════════════
   SOLUTIONS S1 — EINSTIEG (Editorial A2, hell)

   Dünner Träger um die GETEILTE HeroEditorial-Komponente (siehe
   dort): Eyebrow «TELLIAN CAPITAL SOLUTIONS», Titel einzeilig ohne
   Kursivzeile, Hairline, Fliesstext einspaltig; rechts das Zürich-
   Panorama mit Fokus auf Skyline/Kirchtürmen — der Beschnitt des
   Panoramas zum Hochformat-Panel ist gewollt.

   TODO-BILD-TONUNG: die finale dunkle Tonung des Bilds folgt von
   der Brand-Designerin; bis dahin läuft die Quelle unverändert,
   KEINE CSS-Filter-Tonung im Produktivcode. Bis dahin liegt die
   On-Image-Schicht der Bänder auf hellem Tageshimmel — die
   Kopfzeile erhält deshalb von SolutionsApp den stärkeren
   Portal-Scrim und den Textschatten (Kontrast-Sonderfall).
   ═══════════════════════════════════════════════════════════ */

interface Props {
  panelRef?: (el: HTMLDivElement | null) => void;
  isVertical?: boolean;
  bereit?: boolean;
  sprache: "DE" | "EN" | "FR";
}

export function SolutionsEinstieg({ panelRef, isVertical = false, bereit = true, sprache }: Props) {
  const inhalt = SOLUTIONS_INHALT[sprache].einstieg;

  return (
    <HeroEditorial
      eyebrow={inhalt.eyebrow}
      titel={inhalt.titel}
      absaetze={[inhalt.text]}
      imageId="hero-solutions"
      imageAlt="Zürich an der Limmat"
      /* Fokus Skyline/Kirchtürme. */
      fokus="center 52%"
      lang={sprache === "EN" ? "en" : sprache === "FR" ? "fr" : "de"}
      isVertical={isVertical}
      bereit={bereit}
      panelRef={panelRef}
      domId="solutions-einstieg"
    />
  );
}
