#!/usr/bin/env node
/* ═══════════════════════════════════════════════════════════
   BILDAUFBEREITUNG

   Erzeugt aus den Originalen in src/assets/ abgeleitete Varianten
   in src/assets/generated/ — AVIF, WebP und JPEG in mehreren
   Breiten — und schreibt dazu ein typisiertes Verzeichnis, das die
   Komponenten einlesen.

   Die Originale bleiben unangetastet. Sie werden nicht mehr
   importiert und landen dadurch auch nicht mehr im Bundle, stehen
   aber für neue Zuschnitte im Redesign weiterhin bereit.

   Aufruf:  npm run images

   Die Breiten sind nicht geschätzt, sondern aus den im Browser
   gemessenen Anzeigeräumen abgeleitet (1440 und 2560 Viewport,
   dazu 390 mobil), jeweils verdoppelt für Geräte mit doppelter
   Pixeldichte. Wer das Layout ändert, misst neu und passt hier an.
   ═══════════════════════════════════════════════════════════ */

import { mkdir, writeFile, readdir, rm, stat } from "node:fs/promises";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

import sharp from "sharp";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const OUT_DIR = join(ROOT, "src/assets/generated");
/* Das Hero-Bild liegt unter stabilen Namen in public/, damit der
   <link rel="preload"> in index.html es auch wirklich trifft. Vite
   hasht alles unter src/, ein Preload liefe dort ins Leere und würde
   das Bild ein zweites Mal laden. */
const PUBLIC_DIR = join(ROOT, "public/img");

/** Zielgrösse je Datei. Überschreitungen werden einzeln gemeldet. */
const SIZE_BUDGET_KB = 250;

/* Kodierung. AVIF trägt die Hauptlast, WebP fängt Safari < 16 und
   ältere Firefox ab, JPEG ist die letzte Stufe. */
const AVIF = { quality: 52, effort: 6, chromaSubsampling: "4:2:0" };
const WEBP = { quality: 74, effort: 5 };
const JPEG = { quality: 78, mozjpeg: true, progressive: true };

/**
 * Gemessene Anzeigeräume (CSS-Pixel):
 *
 *   Hero (zh-3)      819×999 bei 1440 · 1457×1617 bei 2560 · 390×220 mobil
 *   Sardona          704×999 bei 1440 · 1252×1617 bei 2560 · 390×506 mobil
 *   Porträtkacheln   302×378 bei 1440 ·  538×672 bei 2560 · 167×209 mobil
 *
 * Die Breiten decken jeweils 1× und 2× dieser Räume ab.
 */
const SOURCES = [
  {
    id: "hero-zuerich",
    src: "src/assets/zh-3.jpg",
    /* Kasten 819 CSS-px bei 1440, 1457 bei 2560. 1680 deckt 2× bei
       1440 und 1× bei 2560 ab; 2400 wäre nur für 5K-Schirme und
       sprengte mit 368 kB das Budget.

       Die Ausweichformate enden früher: WebP liegt bei 1680 bei
       349 kB, JPEG schon bei 1280 bei 319 kB. Sie decken damit bis
       1280 bzw. 840 CSS-Pixel ab — genug für Browser ohne AVIF. */
    widths: { avif: [480, 840, 1280, 1680], webp: [480, 840, 1280], jpg: [480, 840] },
    /* s. PUBLIC_DIR — wird vorgeladen, braucht stabile Namen. */
    publicAsset: true,
  },
  {
    id: "sardona",
    src: "src/assets/sardona-1.jpg",
    /* PROBLEMMOTIV. Gesteinsschichtung ist durchgehend hochfrequent
       und komprimiert schlecht. AVIF hält das Budget erst bei
       Qualität 30 (230 kB bei 1440). WebP reagiert kaum auf
       Qualität — selbst 48 liegt bei 1080 noch bei 357 kB.
       Deshalb formatweise Leitern: AVIF trägt die volle Schärfe,
       die Ausweichformate enden bei 720px, wo sie unter 250 kB
       bleiben. Betroffen sind nur Browser ohne AVIF. */
    widths: { avif: [420, 720, 1080, 1440], webp: [420, 720], jpg: [420, 720] },
    quality: { avif: 30 },
  },
  ...[
    ["olivier-bill", "Olivier-Bill.JPG"],
    ["marco-ludescher", "Marco-Ludescher.JPG"],
    ["rolf-schneider", "Rolf-Schneider.JPG"],
    ["bryan-honegger", "Bryan-Honegger.png"],
    ["andreas-truempler", "Andreas-Trümpler.JPG"],
    ["jasmina-rukavina", "Jasmina-Rukavina.JPG"],
  ].map(([id, file]) => ({
    id,
    src: `src/assets/team/${file}`,
    /* 167 · 302 · 538 CSS-Pixel, verdoppelt */
    widths: [340, 620, 1080],
  })),
];

/** Breitenliste je Format — einheitlich, wenn nur ein Array angegeben ist. */
const widthsFor = (source, ext) =>
  Array.isArray(source.widths) ? source.widths : source.widths[ext] ?? [];

const kb = (bytes) => Math.round(bytes / 1024);
const pad = (s, n) => String(s).padEnd(n);

const ENCODERS = {
  avif: (p, q) => p.avif({ ...AVIF, ...(q !== undefined ? { quality: q } : {}) }),
  webp: (p, q) => p.webp({ ...WEBP, ...(q !== undefined ? { quality: q } : {}) }),
  jpg: (p, q) => p.jpeg({ ...JPEG, ...(q !== undefined ? { quality: q } : {}) }),
};

async function build() {
  await rm(OUT_DIR, { recursive: true, force: true });
  await rm(PUBLIC_DIR, { recursive: true, force: true });
  await mkdir(OUT_DIR, { recursive: true });
  await mkdir(PUBLIC_DIR, { recursive: true });

  const manifest = [];
  const oversized = [];
  let totalOut = 0;
  let totalIn = 0;

  for (const source of SOURCES) {
    const absSrc = join(ROOT, source.src);
    const inBytes = (await stat(absSrc)).size;
    totalIn += inBytes;

    /* .rotate() ohne Argument wendet die EXIF-Orientierung an — die
       Porträts liegen mit Orientierung 8 auf der Seite. */
    const meta = await sharp(absSrc).rotate().metadata();
    const nativeW = meta.orientation && meta.orientation >= 5 ? meta.height : meta.width;
    const nativeH = meta.orientation && meta.orientation >= 5 ? meta.width : meta.height;
    const ratio = nativeH / nativeW;

    const dir = source.publicAsset
      ? join(PUBLIC_DIR, source.id)
      : join(OUT_DIR, source.id);
    await mkdir(dir, { recursive: true });
    console.log(`\n${source.id}  (${nativeW}×${nativeH}, ${kb(inBytes)} kB)`);

    const formats = { avif: [], webp: [], jpg: [] };

    for (const ext of ["avif", "webp", "jpg"]) {
      const quality = source.quality?.[ext];
      const row = [];
      for (const width of widthsFor(source, ext)) {
        if (width > nativeW) {
          row.push(`${width}px übersprungen (> Original)`);
          continue;
        }
        const name = `${source.id}-${width}.${ext}`;
        const info = await ENCODERS[ext](
          sharp(absSrc).rotate().resize({ width, withoutEnlargement: true }),
          quality
        ).toFile(join(dir, name));

        formats[ext].push({ width, height: Math.round(width * ratio), name, bytes: info.size });
        totalOut += info.size;
        row.push(`${width}:${kb(info.size)}kB`);
        if (kb(info.size) > SIZE_BUDGET_KB) {
          oversized.push({ id: source.id, ext, width, kb: kb(info.size) });
        }
      }
      console.log(`  ${pad(ext, 6)}${quality !== undefined ? `q${quality} ` : "    "} ${row.join("  ")}`);
    }

    manifest.push({ id: source.id, nativeW, nativeH, ratio, formats, publicAsset: !!source.publicAsset });
  }

  await writeIndex(manifest);

  console.log(`\n${"─".repeat(64)}`);
  console.log(`Originale zusammen:  ${(totalIn / 1048576).toFixed(1)} MB`);
  console.log(`Varianten zusammen:  ${(totalOut / 1048576).toFixed(1)} MB (alle Formate und Breiten)`);
  const heaviest = manifest.reduce((a, m) => {
    const list = m.formats.avif;
    return a + (list.length ? list[list.length - 1].bytes : 0);
  }, 0);
  console.log(`grösste AVIF-Stufe je Bild, summiert: ${(heaviest / 1048576).toFixed(2)} MB`);

  if (oversized.length) {
    console.log(`\n⚠ über dem Ziel von ${SIZE_BUDGET_KB} kB:`);
    for (const o of oversized) console.log(`   ${o.id} · ${o.ext} @ ${o.width}px — ${o.kb} kB`);
  } else {
    console.log(`\nAlle Varianten unter ${SIZE_BUDGET_KB} kB.`);
  }
}

/** Schreibt ein typisiertes Verzeichnis mit expliziten Importen. */
async function writeIndex(manifest) {
  const imports = [];
  const entries = [];
  let n = 0;

  for (const m of manifest) {
    const perFormat = [];
    for (const ext of ["avif", "webp", "jpg"]) {
      const items = m.formats[ext].map((f) => {
        if (m.publicAsset) {
          return `      { w: ${f.width}, h: ${f.height}, url: "/img/${m.id}/${f.name}" },`;
        }
        const v = `i${n++}`;
        imports.push(`import ${v} from "./${m.id}/${f.name}";`);
        return `      { w: ${f.width}, h: ${f.height}, url: ${v} },`;
      });
      perFormat.push(`    ${ext}: [\n${items.join("\n")}\n    ],`);
    }
    entries.push(
      `  "${m.id}": {\n` +
      `    nativeWidth: ${m.nativeW},\n` +
      `    nativeHeight: ${m.nativeH},\n` +
      perFormat.join("\n") + `\n` +
      `  },`
    );
  }

  const out = [
    `/* AUTOMATISCH ERZEUGT — nicht von Hand bearbeiten.`,
    `   Quelle: scripts/optimize-images.mjs · Aufruf: npm run images */`,
    ``,
    ...imports,
    ``,
    `export interface ImageSource {`,
    `  /** Breite in Pixeln — Wert des w-Deskriptors im srcset. */`,
    `  w: number;`,
    `  h: number;`,
    `  url: string;`,
    `}`,
    ``,
    `export interface GeneratedImage {`,
    `  nativeWidth: number;`,
    `  nativeHeight: number;`,
    `  avif: ImageSource[];`,
    `  webp: ImageSource[];`,
    `  jpg: ImageSource[];`,
    `}`,
    ``,
    `export const IMAGES = {`,
    ...entries,
    `} as const satisfies Record<string, GeneratedImage>;`,
    ``,
    `export type ImageId = keyof typeof IMAGES;`,
    ``,
  ].join("\n");

  await writeFile(join(OUT_DIR, "index.ts"), out, "utf8");
  console.log(`\nVerzeichnis geschrieben: ${relative(ROOT, join(OUT_DIR, "index.ts"))}`);
}

await build();
