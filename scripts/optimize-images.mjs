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
  {
    id: "opernhaus",
    src: "src/assets/opernhaus3.jpg",
    /* Ausschnitt aus der Frontalaufnahme, 4591×3061.

       left stammt NICHT aus der ursprünglichen Abnahme (0.404). Jene
       Zahlen galten für eine 8000×5333-Aufnahme mit anderem
       Bildausschnitt; hier treffen sie eine andere Stelle. Gemessen
       liegt die Symmetrieachse der Fassade bei 47.7 % der Bildbreite,
       0.404 hätte den Ausschnitt um 215px daneben gesetzt — ein
       Fünftel seiner eigenen Breite. left ist deshalb aus der Achse
       abgeleitet: 0.477 − 0.24/2 = 0.357.

       top ist gegenüber der Abnahme (0.315) angehoben, damit die
       beiden Giebelfiguren ganz im Bild stehen statt angeschnitten.
       Sie gehörten laut Abnahme ausdrücklich dazu.

       Verhältnis und Tonung sind unverändert übernommen. */
    crop: {
      left: 0.357,
      top: 0.235,
      width: 0.24,
      ratio: 0.8,          /* Breite / Höhe = 4:5 */
      saturation: 0.78,
      contrast: 1.04,
    },
    /* Der Ausschnitt misst 1104×1380. Das Panel braucht 402px (1×) bis
       rund 1540px auf einem 2560er Schirm bei doppelter Pixeldichte —
       die Leiter endet deshalb dort, wo die Quelle aufhört. Auf sehr
       grossen Schirmen bleibt ein Rest Weichheit; alles Grössere wäre
       hochgerechnet und damit nur scheinbar schärfer.
       Alle Stufen durch 4 teilbar, also ohne Rundungsrest. */
    widths: [420, 620, 820, 1104],
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

/**
 * Verhältnis als ganzzahliger Bruch. 0.8 → 4/5.
 *
 * Der Nenner ist das, worauf es ankommt: nur wenn die Höhe ein
 * Vielfaches von 5 ist, geht 4:5 in ganzen Pixeln auf.
 */
function ratioTerms(ratio) {
  for (let den = 1; den <= 64; den++) {
    const num = ratio * den;
    if (Math.abs(num - Math.round(num)) < 1e-9) return { num: Math.round(num), den };
  }
  throw new Error(`Verhältnis ${ratio} lässt sich nicht ganzzahlig darstellen`);
}

/**
 * Nächstliegender Kasten, der `ratio` in ganzen Pixeln exakt trifft.
 *
 * Warum das nötig ist: `resize({ width })` lässt die Höhe ableiten und
 * rundet sie. Bei 4:5 und Breite 198 kommt 248 heraus — 0.7984 statt
 * 0.8. Das Panel im Layout ist exakt 4:5, also beschneidet object-fit
 * die Differenz weg, und der abgenommene Ausschnitt stimmt nicht mehr.
 * Getrennt gerundete Masse lösen das nicht; beide müssen aus demselben
 * Schritt kommen.
 *
 * 198 → 200×250, 140 → 140×175 (traf schon vorher).
 */
function exactBox(targetWidth, ratio) {
  const { num, den } = ratioTerms(ratio);
  const steps = Math.max(1, Math.round(targetWidth / num));
  return { width: num * steps, height: den * steps };
}

/**
 * Ausschnitt und Anmutung, in Anteilen des Originals.
 *
 * Bewusst hier und nicht im Browser: ein Beschnitt über object-fit
 * würde den abgenommenen Bildausschnitt bei jeder Fenstergrösse
 * anders setzen. Hier entsteht er einmal, im Original, und alle
 * Grössenstufen zeigen exakt dasselbe Motiv.
 *
 * Regel dahinter, die auch fürs Layout gilt: object-fit: cover ist ein
 * Sicherheitsnetz gegen Abweichungen, nie das Werkzeug für den
 * Bildausschnitt. Der Ausschnitt wird hier abgenommen.
 */
function applyCrop(pipe, meta, crop, box) {
  if (!crop) return pipe;
  const { width: w, height: h } = box;
  const left = Math.round(meta.width * crop.left);
  const top = Math.round(meta.height * crop.top);
  if (left + w > meta.width || top + h > meta.height) {
    throw new Error(
      `Ausschnitt liegt ausserhalb des Originals: ${left}+${w} / ${top}+${h} ` +
      `bei ${meta.width}×${meta.height}`
    );
  }
  let out = pipe.extract({ left, top, width: w, height: h });
  if (crop.saturation !== undefined) out = out.modulate({ saturation: crop.saturation });
  if (crop.contrast !== undefined) {
    /* linear(a, b) mit b so, dass Mittelgrau auf sich selbst abbildet. */
    out = out.linear(crop.contrast, -(128 * (crop.contrast - 1)));
  }
  return out;
}

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
    let ratio = nativeH / nativeW;
    let cropW = nativeW;
    let cropH = nativeH;
    /* Ausschnittkasten einmal bestimmt und überall derselbe: Extraktion,
       Grössenstufen und Manifest. */
    let cropBox = null;
    if (source.crop) {
      cropBox = exactBox(Math.round(nativeW * source.crop.width), source.crop.ratio);
      cropW = cropBox.width;
      cropH = cropBox.height;
      ratio = 1 / source.crop.ratio;
    }

    const dir = source.publicAsset
      ? join(PUBLIC_DIR, source.id)
      : join(OUT_DIR, source.id);
    await mkdir(dir, { recursive: true });
    console.log(`\n${source.id}  (${nativeW}×${nativeH}, ${kb(inBytes)} kB)`);

    const formats = { avif: [], webp: [], jpg: [] };

    for (const ext of ["avif", "webp", "jpg"]) {
      const quality = source.quality?.[ext];
      const row = [];
      for (const rawWidth of widthsFor(source, ext)) {
        /* Bei festem Verhältnis werden beide Masse vorgegeben, statt die
           Höhe von sharp ableiten und runden zu lassen. */
        const box = cropBox ? exactBox(rawWidth, source.crop.ratio) : null;
        const width = box ? box.width : rawWidth;
        if (width > cropW) {
          row.push(`${width}px übersprungen (> Ausschnitt)`);
          continue;
        }
        const name = `${source.id}-${width}.${ext}`;
        const info = await ENCODERS[ext](
          applyCrop(sharp(absSrc).rotate(), { width: nativeW, height: nativeH }, source.crop, cropBox)
            .resize(box ?? { width, withoutEnlargement: true }),
          quality
        ).toFile(join(dir, name));

        formats[ext].push({
          width,
          height: box ? box.height : Math.round(width * ratio),
          name, bytes: info.size,
        });
        totalOut += info.size;
        row.push(`${width}:${kb(info.size)}kB`);
        if (kb(info.size) > SIZE_BUDGET_KB) {
          oversized.push({ id: source.id, ext, width, kb: kb(info.size) });
        }
      }
      console.log(`  ${pad(ext, 6)}${quality !== undefined ? `q${quality} ` : "    "} ${row.join("  ")}`);
    }

    manifest.push({
      id: source.id,
      nativeW: cropW,
      nativeH: cropH,
      ratio, formats, publicAsset: !!source.publicAsset,
    });
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
