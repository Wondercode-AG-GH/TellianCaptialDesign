/* AUTOMATISCH ERZEUGT — nicht von Hand bearbeiten.
   Quelle: scripts/optimize-images.mjs · Aufruf: npm run images */

import i0 from "./sardona/sardona-420.avif";
import i1 from "./sardona/sardona-720.avif";
import i2 from "./sardona/sardona-1080.avif";
import i3 from "./sardona/sardona-1440.avif";
import i4 from "./sardona/sardona-420.webp";
import i5 from "./sardona/sardona-720.webp";
import i6 from "./sardona/sardona-420.jpg";
import i7 from "./sardona/sardona-720.jpg";
import i8 from "./olivier-bill/olivier-bill-340.avif";
import i9 from "./olivier-bill/olivier-bill-620.avif";
import i10 from "./olivier-bill/olivier-bill-1080.avif";
import i11 from "./olivier-bill/olivier-bill-340.webp";
import i12 from "./olivier-bill/olivier-bill-620.webp";
import i13 from "./olivier-bill/olivier-bill-1080.webp";
import i14 from "./olivier-bill/olivier-bill-340.jpg";
import i15 from "./olivier-bill/olivier-bill-620.jpg";
import i16 from "./olivier-bill/olivier-bill-1080.jpg";
import i17 from "./marco-ludescher/marco-ludescher-340.avif";
import i18 from "./marco-ludescher/marco-ludescher-620.avif";
import i19 from "./marco-ludescher/marco-ludescher-1080.avif";
import i20 from "./marco-ludescher/marco-ludescher-340.webp";
import i21 from "./marco-ludescher/marco-ludescher-620.webp";
import i22 from "./marco-ludescher/marco-ludescher-1080.webp";
import i23 from "./marco-ludescher/marco-ludescher-340.jpg";
import i24 from "./marco-ludescher/marco-ludescher-620.jpg";
import i25 from "./marco-ludescher/marco-ludescher-1080.jpg";
import i26 from "./rolf-schneider/rolf-schneider-340.avif";
import i27 from "./rolf-schneider/rolf-schneider-620.avif";
import i28 from "./rolf-schneider/rolf-schneider-1080.avif";
import i29 from "./rolf-schneider/rolf-schneider-340.webp";
import i30 from "./rolf-schneider/rolf-schneider-620.webp";
import i31 from "./rolf-schneider/rolf-schneider-1080.webp";
import i32 from "./rolf-schneider/rolf-schneider-340.jpg";
import i33 from "./rolf-schneider/rolf-schneider-620.jpg";
import i34 from "./rolf-schneider/rolf-schneider-1080.jpg";
import i35 from "./bryan-honegger/bryan-honegger-340.avif";
import i36 from "./bryan-honegger/bryan-honegger-620.avif";
import i37 from "./bryan-honegger/bryan-honegger-340.webp";
import i38 from "./bryan-honegger/bryan-honegger-620.webp";
import i39 from "./bryan-honegger/bryan-honegger-340.jpg";
import i40 from "./bryan-honegger/bryan-honegger-620.jpg";
import i41 from "./andreas-truempler/andreas-truempler-340.avif";
import i42 from "./andreas-truempler/andreas-truempler-620.avif";
import i43 from "./andreas-truempler/andreas-truempler-1080.avif";
import i44 from "./andreas-truempler/andreas-truempler-340.webp";
import i45 from "./andreas-truempler/andreas-truempler-620.webp";
import i46 from "./andreas-truempler/andreas-truempler-1080.webp";
import i47 from "./andreas-truempler/andreas-truempler-340.jpg";
import i48 from "./andreas-truempler/andreas-truempler-620.jpg";
import i49 from "./andreas-truempler/andreas-truempler-1080.jpg";
import i50 from "./jasmina-rukavina/jasmina-rukavina-340.avif";
import i51 from "./jasmina-rukavina/jasmina-rukavina-620.avif";
import i52 from "./jasmina-rukavina/jasmina-rukavina-1080.avif";
import i53 from "./jasmina-rukavina/jasmina-rukavina-340.webp";
import i54 from "./jasmina-rukavina/jasmina-rukavina-620.webp";
import i55 from "./jasmina-rukavina/jasmina-rukavina-1080.webp";
import i56 from "./jasmina-rukavina/jasmina-rukavina-340.jpg";
import i57 from "./jasmina-rukavina/jasmina-rukavina-620.jpg";
import i58 from "./jasmina-rukavina/jasmina-rukavina-1080.jpg";

export interface ImageSource {
  /** Breite in Pixeln — Wert des w-Deskriptors im srcset. */
  w: number;
  h: number;
  url: string;
}

export interface GeneratedImage {
  nativeWidth: number;
  nativeHeight: number;
  avif: ImageSource[];
  webp: ImageSource[];
  jpg: ImageSource[];
}

export const IMAGES = {
  "hero-zuerich": {
    nativeWidth: 3618,
    nativeHeight: 5427,
    avif: [
      { w: 480, h: 720, url: "/img/hero-zuerich/hero-zuerich-480.avif" },
      { w: 840, h: 1260, url: "/img/hero-zuerich/hero-zuerich-840.avif" },
      { w: 1280, h: 1920, url: "/img/hero-zuerich/hero-zuerich-1280.avif" },
      { w: 1680, h: 2520, url: "/img/hero-zuerich/hero-zuerich-1680.avif" },
    ],
    webp: [
      { w: 480, h: 720, url: "/img/hero-zuerich/hero-zuerich-480.webp" },
      { w: 840, h: 1260, url: "/img/hero-zuerich/hero-zuerich-840.webp" },
      { w: 1280, h: 1920, url: "/img/hero-zuerich/hero-zuerich-1280.webp" },
    ],
    jpg: [
      { w: 480, h: 720, url: "/img/hero-zuerich/hero-zuerich-480.jpg" },
      { w: 840, h: 1260, url: "/img/hero-zuerich/hero-zuerich-840.jpg" },
    ],
  },
  "sardona": {
    nativeWidth: 3024,
    nativeHeight: 4032,
    avif: [
      { w: 420, h: 560, url: i0 },
      { w: 720, h: 960, url: i1 },
      { w: 1080, h: 1440, url: i2 },
      { w: 1440, h: 1920, url: i3 },
    ],
    webp: [
      { w: 420, h: 560, url: i4 },
      { w: 720, h: 960, url: i5 },
    ],
    jpg: [
      { w: 420, h: 560, url: i6 },
      { w: 720, h: 960, url: i7 },
    ],
  },
  "olivier-bill": {
    nativeWidth: 4672,
    nativeHeight: 7008,
    avif: [
      { w: 340, h: 510, url: i8 },
      { w: 620, h: 930, url: i9 },
      { w: 1080, h: 1620, url: i10 },
    ],
    webp: [
      { w: 340, h: 510, url: i11 },
      { w: 620, h: 930, url: i12 },
      { w: 1080, h: 1620, url: i13 },
    ],
    jpg: [
      { w: 340, h: 510, url: i14 },
      { w: 620, h: 930, url: i15 },
      { w: 1080, h: 1620, url: i16 },
    ],
  },
  "marco-ludescher": {
    nativeWidth: 4672,
    nativeHeight: 7008,
    avif: [
      { w: 340, h: 510, url: i17 },
      { w: 620, h: 930, url: i18 },
      { w: 1080, h: 1620, url: i19 },
    ],
    webp: [
      { w: 340, h: 510, url: i20 },
      { w: 620, h: 930, url: i21 },
      { w: 1080, h: 1620, url: i22 },
    ],
    jpg: [
      { w: 340, h: 510, url: i23 },
      { w: 620, h: 930, url: i24 },
      { w: 1080, h: 1620, url: i25 },
    ],
  },
  "rolf-schneider": {
    nativeWidth: 4672,
    nativeHeight: 7008,
    avif: [
      { w: 340, h: 510, url: i26 },
      { w: 620, h: 930, url: i27 },
      { w: 1080, h: 1620, url: i28 },
    ],
    webp: [
      { w: 340, h: 510, url: i29 },
      { w: 620, h: 930, url: i30 },
      { w: 1080, h: 1620, url: i31 },
    ],
    jpg: [
      { w: 340, h: 510, url: i32 },
      { w: 620, h: 930, url: i33 },
      { w: 1080, h: 1620, url: i34 },
    ],
  },
  "bryan-honegger": {
    nativeWidth: 1023,
    nativeHeight: 1537,
    avif: [
      { w: 340, h: 511, url: i35 },
      { w: 620, h: 932, url: i36 },
    ],
    webp: [
      { w: 340, h: 511, url: i37 },
      { w: 620, h: 932, url: i38 },
    ],
    jpg: [
      { w: 340, h: 511, url: i39 },
      { w: 620, h: 932, url: i40 },
    ],
  },
  "andreas-truempler": {
    nativeWidth: 4672,
    nativeHeight: 7008,
    avif: [
      { w: 340, h: 510, url: i41 },
      { w: 620, h: 930, url: i42 },
      { w: 1080, h: 1620, url: i43 },
    ],
    webp: [
      { w: 340, h: 510, url: i44 },
      { w: 620, h: 930, url: i45 },
      { w: 1080, h: 1620, url: i46 },
    ],
    jpg: [
      { w: 340, h: 510, url: i47 },
      { w: 620, h: 930, url: i48 },
      { w: 1080, h: 1620, url: i49 },
    ],
  },
  "jasmina-rukavina": {
    nativeWidth: 4672,
    nativeHeight: 7008,
    avif: [
      { w: 340, h: 510, url: i50 },
      { w: 620, h: 930, url: i51 },
      { w: 1080, h: 1620, url: i52 },
    ],
    webp: [
      { w: 340, h: 510, url: i53 },
      { w: 620, h: 930, url: i54 },
      { w: 1080, h: 1620, url: i55 },
    ],
    jpg: [
      { w: 340, h: 510, url: i56 },
      { w: 620, h: 930, url: i57 },
      { w: 1080, h: 1620, url: i58 },
    ],
  },
} as const satisfies Record<string, GeneratedImage>;

export type ImageId = keyof typeof IMAGES;
