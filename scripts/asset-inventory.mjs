import { readFileSync, statSync } from "node:fs";
import { execSync } from "node:child_process";
import { basename, extname } from "node:path";
import sharp from "sharp";

const sh = (c) => execSync(c, { encoding: "utf8", maxBuffer: 64 << 20 }).trim();

const files = sh(`find src/assets -type f -not -path "*/generated/*"`).split("\n").sort();

/* Durchsuchter Raum: alles, was in den Build eingeht. Bewusst ohne die
   Unterprojekte portal/ und solutions/ — die haben eigene assets-Ordner
   und können den Haupt-Ordner nicht importieren. */
const HAYSTACK = sh(
  `find src public index.html scripts -type f ` +
  `\\( -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" ` +
  `-o -name "*.mjs" -o -name "*.css" -o -name "*.html" -o -name "*.json" \\) ` +
  `-not -path "src/assets/generated/index.ts"`
).split("\n");

const CORPUS = HAYSTACK.map((f) => ({ f, text: readFileSync(f, "utf8") }));

/* Die Bildpipeline ist eine indirekte Referenz: die Datei erscheint nicht
   im JSX, sondern als Quelle in optimize-images.mjs. */
const PIPELINE = readFileSync("scripts/optimize-images.mjs", "utf8");

const rows = [];
for (const path of files) {
  const name = basename(path);
  const bytes = statSync(path).size;
  let dim = "";
  if (/\.(jpe?g|png|webp|avif|tiff?)$/i.test(name)) {
    try {
      const m = await sharp(path).metadata();
      dim = `${m.width}×${m.height}`;
    } catch { dim = "unlesbar"; }
  } else if (extname(name) === ".svg") {
    const m = readFileSync(path, "utf8").match(/viewBox="[\d.\s-]*?([\d.]+)\s+([\d.]+)"/);
    dim = m ? `${Math.round(+m[1])}×${Math.round(+m[2])}` : "vektor";
  }

  const inPipeline = PIPELINE.includes(path) || PIPELINE.includes(name);
  const hits = CORPUS.filter(({ f, text }) => f !== "scripts/optimize-images.mjs" && text.includes(name))
    .map(({ f }) => f);

  rows.push({ path, name, bytes, dim, inPipeline, hits });
}

const kb = (b) => b >= 1048576 ? (b / 1048576).toFixed(1) + " MB" : Math.round(b / 1024) + " kB";

const used = rows.filter((r) => r.inPipeline || r.hits.length);
const dead = rows.filter((r) => !r.inPipeline && !r.hits.length);

console.log("## Referenziert\n");
console.log("| Datei | Masse | Grösse | Weg |");
console.log("|---|---|---|---|");
for (const r of used) {
  const via = r.inPipeline
    ? "Bildpipeline" + (r.hits.length ? ` + ${r.hits.length} direkt` : "")
    : r.hits.map((h) => h.replace("src/", "")).join(", ");
  console.log(`| ${r.path.replace("src/assets/", "")} | ${r.dim} | ${kb(r.bytes)} | ${via} |`);
}

console.log(`\n## Nicht referenziert (${dead.length} Dateien, ${kb(dead.reduce((s, r) => s + r.bytes, 0))})\n`);
console.log("| Datei | Masse | Grösse |");
console.log("|---|---|---|");
for (const r of dead.sort((a, b) => b.bytes - a.bytes)) {
  console.log(`| ${r.path.replace("src/assets/", "")} | ${r.dim} | ${kb(r.bytes)} |`);
}

console.log(`\nSUMME referenziert: ${kb(used.reduce((s, r) => s + r.bytes, 0))} (${used.length})`);
console.log(`SUMME tot:          ${kb(dead.reduce((s, r) => s + r.bytes, 0))} (${dead.length})`);
