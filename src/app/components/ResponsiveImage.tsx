import type { CSSProperties } from "react";

import { IMAGES, type ImageId, type ImageSource } from "../../assets/generated";

/* ═══════════════════════════════════════════════════════════
   BILD MIT FORMATWAHL UND GRÖSSENSTUFEN

   Rendert <picture> mit AVIF, WebP und JPEG. Der Browser nimmt das
   erste Format, das er kann, und wählt daraus über srcset/sizes die
   Stufe, die zu Anzeigeraum und Pixeldichte passt.

   Die Stufen tragen w-Deskriptoren statt 1x/2x. Das deckt beides ab:
   die Pixeldichte rechnet der Browser selbst ein, und zusätzlich
   trifft er die richtige Wahl zwischen einem 1440er und einem 2560er
   Schirm — was ein festes Paar aus 1x und 2x nicht kann, weil es die
   Viewportbreite nicht kennt.

   width und height stehen als Attribute am <img>, mit den Massen des
   Originals. Der Browser leitet daraus das Seitenverhältnis ab und
   hält den Platz frei, bevor das Bild da ist — kein Layoutsprung.
   Die tatsächliche Grösse bestimmt weiterhin das CSS.
   ═══════════════════════════════════════════════════════════ */

const srcSet = (sources: readonly ImageSource[]) =>
  sources.map((s) => `${s.url} ${s.w}w`).join(", ");

interface Props {
  id: ImageId;
  alt: string;
  /**
   * Beschreibt den Anzeigeraum, damit der Browser die Stufe wählen
   * kann, bevor er das Layout kennt. Ohne diese Angabe nimmt er 100vw
   * an und lädt regelmässig eine Stufe zu gross.
   */
  sizes: string;
  className?: string;
  style?: CSSProperties;
  objectPosition?: string;
  /**
   * Nur für das Bild, das beim Aufbau sichtbar ist. Lädt sofort statt
   * verzögert und meldet dem Browser hohe Priorität. Höchstens ein
   * Bild je Seite — sonst hat "hoch" keine Bedeutung mehr.
   */
  priority?: boolean;
}

export function ResponsiveImage({
  id,
  alt,
  sizes,
  className = "",
  style,
  objectPosition,
  priority = false,
}: Props) {
  const image = IMAGES[id];
  /* Letzte JPEG-Stufe als Rückfall für alles, was kein srcset kann. */
  const fallback = image.jpg[image.jpg.length - 1];

  return (
    <picture>
      <source type="image/avif" srcSet={srcSet(image.avif)} sizes={sizes} />
      <source type="image/webp" srcSet={srcSet(image.webp)} sizes={sizes} />
      <img
        src={fallback.url}
        srcSet={srcSet(image.jpg)}
        sizes={sizes}
        alt={alt}
        width={image.nativeWidth}
        height={image.nativeHeight}
        decoding="async"
        loading={priority ? "eager" : "lazy"}
        fetchPriority={priority ? "high" : undefined}
        className={className}
        style={{ objectFit: "cover", objectPosition, ...style }}
      />
    </picture>
  );
}

/**
 * Lädt die Bilder einer Sektion im Voraus.
 *
 * Bewusst über ein Image-Objekt statt <link rel="preload">: die
 * Formatwahl hat der Browser für die sichtbaren Bilder schon
 * getroffen, und wir wollen hier nur den Cache füllen, ohne die
 * Priorität laufender Anfragen zu stören.
 */
export function prefetchImages(ids: readonly ImageId[]) {
  if (typeof window === "undefined") return;
  for (const id of ids) {
    const image = IMAGES[id];
    const list = image.avif.length ? image.avif : image.jpg;
    /* Mittlere Stufe genügt zum Vorwärmen; die exakte Wahl trifft der
       Browser beim Rendern ohnehin selbst. */
    const pick = list[Math.min(list.length - 1, Math.max(0, list.length - 2))];
    const el = new Image();
    el.decoding = "async";
    el.src = pick.url;
  }
}
