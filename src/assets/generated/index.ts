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
import i8 from "./opernhaus/opernhaus-140.avif";
import i9 from "./opernhaus/opernhaus-200.avif";
import i10 from "./opernhaus/opernhaus-140.webp";
import i11 from "./opernhaus/opernhaus-200.webp";
import i12 from "./opernhaus/opernhaus-140.jpg";
import i13 from "./opernhaus/opernhaus-200.jpg";
import i14 from "./olivier-bill/olivier-bill-340.avif";
import i15 from "./olivier-bill/olivier-bill-620.avif";
import i16 from "./olivier-bill/olivier-bill-1080.avif";
import i17 from "./olivier-bill/olivier-bill-340.webp";
import i18 from "./olivier-bill/olivier-bill-620.webp";
import i19 from "./olivier-bill/olivier-bill-1080.webp";
import i20 from "./olivier-bill/olivier-bill-340.jpg";
import i21 from "./olivier-bill/olivier-bill-620.jpg";
import i22 from "./olivier-bill/olivier-bill-1080.jpg";
import i23 from "./marco-ludescher/marco-ludescher-340.avif";
import i24 from "./marco-ludescher/marco-ludescher-620.avif";
import i25 from "./marco-ludescher/marco-ludescher-1080.avif";
import i26 from "./marco-ludescher/marco-ludescher-340.webp";
import i27 from "./marco-ludescher/marco-ludescher-620.webp";
import i28 from "./marco-ludescher/marco-ludescher-1080.webp";
import i29 from "./marco-ludescher/marco-ludescher-340.jpg";
import i30 from "./marco-ludescher/marco-ludescher-620.jpg";
import i31 from "./marco-ludescher/marco-ludescher-1080.jpg";
import i32 from "./rolf-schneider/rolf-schneider-340.avif";
import i33 from "./rolf-schneider/rolf-schneider-620.avif";
import i34 from "./rolf-schneider/rolf-schneider-1080.avif";
import i35 from "./rolf-schneider/rolf-schneider-340.webp";
import i36 from "./rolf-schneider/rolf-schneider-620.webp";
import i37 from "./rolf-schneider/rolf-schneider-1080.webp";
import i38 from "./rolf-schneider/rolf-schneider-340.jpg";
import i39 from "./rolf-schneider/rolf-schneider-620.jpg";
import i40 from "./rolf-schneider/rolf-schneider-1080.jpg";
import i41 from "./bryan-honegger/bryan-honegger-340.avif";
import i42 from "./bryan-honegger/bryan-honegger-620.avif";
import i43 from "./bryan-honegger/bryan-honegger-340.webp";
import i44 from "./bryan-honegger/bryan-honegger-620.webp";
import i45 from "./bryan-honegger/bryan-honegger-340.jpg";
import i46 from "./bryan-honegger/bryan-honegger-620.jpg";
import i47 from "./andreas-truempler/andreas-truempler-340.avif";
import i48 from "./andreas-truempler/andreas-truempler-620.avif";
import i49 from "./andreas-truempler/andreas-truempler-1080.avif";
import i50 from "./andreas-truempler/andreas-truempler-340.webp";
import i51 from "./andreas-truempler/andreas-truempler-620.webp";
import i52 from "./andreas-truempler/andreas-truempler-1080.webp";
import i53 from "./andreas-truempler/andreas-truempler-340.jpg";
import i54 from "./andreas-truempler/andreas-truempler-620.jpg";
import i55 from "./andreas-truempler/andreas-truempler-1080.jpg";
import i56 from "./jasmina-rukavina/jasmina-rukavina-340.avif";
import i57 from "./jasmina-rukavina/jasmina-rukavina-620.avif";
import i58 from "./jasmina-rukavina/jasmina-rukavina-1080.avif";
import i59 from "./jasmina-rukavina/jasmina-rukavina-340.webp";
import i60 from "./jasmina-rukavina/jasmina-rukavina-620.webp";
import i61 from "./jasmina-rukavina/jasmina-rukavina-1080.webp";
import i62 from "./jasmina-rukavina/jasmina-rukavina-340.jpg";
import i63 from "./jasmina-rukavina/jasmina-rukavina-620.jpg";
import i64 from "./jasmina-rukavina/jasmina-rukavina-1080.jpg";

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
  "opernhaus": {
    nativeWidth: 200,
    nativeHeight: 250,
    avif: [
      { w: 140, h: 175, url: i8 },
      { w: 200, h: 250, url: i9 },
    ],
    webp: [
      { w: 140, h: 175, url: i10 },
      { w: 200, h: 250, url: i11 },
    ],
    jpg: [
      { w: 140, h: 175, url: i12 },
      { w: 200, h: 250, url: i13 },
    ],
  },
  "olivier-bill": {
    nativeWidth: 4672,
    nativeHeight: 7008,
    avif: [
      { w: 340, h: 510, url: i14 },
      { w: 620, h: 930, url: i15 },
      { w: 1080, h: 1620, url: i16 },
    ],
    webp: [
      { w: 340, h: 510, url: i17 },
      { w: 620, h: 930, url: i18 },
      { w: 1080, h: 1620, url: i19 },
    ],
    jpg: [
      { w: 340, h: 510, url: i20 },
      { w: 620, h: 930, url: i21 },
      { w: 1080, h: 1620, url: i22 },
    ],
  },
  "marco-ludescher": {
    nativeWidth: 4672,
    nativeHeight: 7008,
    avif: [
      { w: 340, h: 510, url: i23 },
      { w: 620, h: 930, url: i24 },
      { w: 1080, h: 1620, url: i25 },
    ],
    webp: [
      { w: 340, h: 510, url: i26 },
      { w: 620, h: 930, url: i27 },
      { w: 1080, h: 1620, url: i28 },
    ],
    jpg: [
      { w: 340, h: 510, url: i29 },
      { w: 620, h: 930, url: i30 },
      { w: 1080, h: 1620, url: i31 },
    ],
  },
  "rolf-schneider": {
    nativeWidth: 4672,
    nativeHeight: 7008,
    avif: [
      { w: 340, h: 510, url: i32 },
      { w: 620, h: 930, url: i33 },
      { w: 1080, h: 1620, url: i34 },
    ],
    webp: [
      { w: 340, h: 510, url: i35 },
      { w: 620, h: 930, url: i36 },
      { w: 1080, h: 1620, url: i37 },
    ],
    jpg: [
      { w: 340, h: 510, url: i38 },
      { w: 620, h: 930, url: i39 },
      { w: 1080, h: 1620, url: i40 },
    ],
  },
  "bryan-honegger": {
    nativeWidth: 1023,
    nativeHeight: 1537,
    avif: [
      { w: 340, h: 511, url: i41 },
      { w: 620, h: 932, url: i42 },
    ],
    webp: [
      { w: 340, h: 511, url: i43 },
      { w: 620, h: 932, url: i44 },
    ],
    jpg: [
      { w: 340, h: 511, url: i45 },
      { w: 620, h: 932, url: i46 },
    ],
  },
  "andreas-truempler": {
    nativeWidth: 4672,
    nativeHeight: 7008,
    avif: [
      { w: 340, h: 510, url: i47 },
      { w: 620, h: 930, url: i48 },
      { w: 1080, h: 1620, url: i49 },
    ],
    webp: [
      { w: 340, h: 510, url: i50 },
      { w: 620, h: 930, url: i51 },
      { w: 1080, h: 1620, url: i52 },
    ],
    jpg: [
      { w: 340, h: 510, url: i53 },
      { w: 620, h: 930, url: i54 },
      { w: 1080, h: 1620, url: i55 },
    ],
  },
  "jasmina-rukavina": {
    nativeWidth: 4672,
    nativeHeight: 7008,
    avif: [
      { w: 340, h: 510, url: i56 },
      { w: 620, h: 930, url: i57 },
      { w: 1080, h: 1620, url: i58 },
    ],
    webp: [
      { w: 340, h: 510, url: i59 },
      { w: 620, h: 930, url: i60 },
      { w: 1080, h: 1620, url: i61 },
    ],
    jpg: [
      { w: 340, h: 510, url: i62 },
      { w: 620, h: 930, url: i63 },
      { w: 1080, h: 1620, url: i64 },
    ],
  },
} as const satisfies Record<string, GeneratedImage>;

export type ImageId = keyof typeof IMAGES;
