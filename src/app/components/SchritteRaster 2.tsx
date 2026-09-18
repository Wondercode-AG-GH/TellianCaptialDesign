import { C, cormorant, sans, serif } from "../tokens";

/* ═══════════════════════════════════════════════════════════
   SCHRITTE-RASTER — der nummerierte Weg, zeilengenau

   Herausgelöst aus der Mandat-Unterseite (P3 dort): Ziffer, Titel
   und Zeile sind DIREKTE Rasterkinder in drei gemeinsamen Zeilen —
   Titel und Textanfänge fluchten dadurch über alle Spalten, auch
   wenn ein Titel umbricht. Die Haarlinie läuft von der Mitte der
   ersten bis zur Mitte der letzten Spalte; bei n gleichen Spalten
   ist eine halbe Spaltenbreite (100 % − (n−1) Zwischenräume) / 2n.

   Mandat (5 Schritte) und Advisory (3) nutzen die Standardfassung —
   Markup und Werte sind der frühere Inline-Block, unverändert.
   Solutions stellt über die optionalen Props seine Fassung ein
   (Lustria-Ziffern in Mushroom, Linie UNTER der Nummernzeile).
   ═══════════════════════════════════════════════════════════ */

/* Dieselbe Eintritts-Grammatik wie auf den Unterseiten: Stufen zu
   260ms, 520ms Dauer, 200ms Vorlauf. Die Werte gehören dem Raster,
   nicht dem Aufrufer — beide Unterseiten führten identische Kopien. */
const STUFE_MS = 260;
const DAUER_MS = 520;
const VORLAUF_MS = 200;

export interface Schritt {
  titel: string;
  zeile: string;
}

interface Props {
  schritte: readonly Schritt[];
  /** Eintritt gestartet (Aufrufer-Logik; Reduced Motion zeigt sofort). */
  gezeigt: boolean;
  reducedMotion: boolean;
  maxWidth?: string;
  /** Ziffern-Schrift — Standard Cormorant (Unterseiten). */
  nummerFont?: string;
  /** Ziffern-Farbe — Standard var(--tellian-adv-num-color). */
  nummerFarbe?: string;
  /** Teller hinter der Ziffer, damit die Linie nicht durch sie
      läuft — Standard Seitengrund. Bei liniePos "unter" ohne
      Belang, aber unschädlich. */
  tellerFarbe?: string;
  /** Lage der Haarlinie: auf halber Zifferhöhe (Unterseiten) oder
      UNTER der Nummernzeile (Solutions-Vorgehen). */
  liniePos?: "mitte" | "unter";
}

const ziffer = (i: number) => String(i + 1).padStart(2, "0");

export function SchritteRaster({
  schritte,
  gezeigt,
  reducedMotion,
  maxWidth,
  nummerFont = cormorant,
  nummerFarbe = "var(--tellian-adv-num-color)",
  tellerFarbe = C.bg,
  liniePos = "mitte",
}: Props) {
  const n = schritte.length;
  const LINIE_MS = (n - 1) * STUFE_MS + DAUER_MS;

  const stufe = (i: number): React.CSSProperties => ({
    opacity: gezeigt ? 1 : 0,
    transform: gezeigt ? "translateY(0)" : "translateY(10px)",
    transition: reducedMotion
      ? "none"
      : `opacity ${DAUER_MS}ms ease-out ${VORLAUF_MS + i * STUFE_MS}ms,` +
        ` transform ${DAUER_MS}ms cubic-bezier(0.16,1,0.3,1) ${VORLAUF_MS + i * STUFE_MS}ms`,
  });

  const zifferStil: React.CSSProperties = {
    fontFamily: nummerFont,
    fontSize: "var(--tellian-adv-num-size)",
    fontWeight: 300,
    lineHeight: 1,
    letterSpacing: "0.04em",
    color: nummerFarbe,
    backgroundColor: liniePos === "mitte" ? tellerFarbe : "transparent",
    position: "relative",
    display: "inline-block",
  };

  const halbeSpalte = `calc((100% - ${n - 1} * var(--tellian-adv-col-gap)) / ${2 * n})`;

  return (
    <ol
      style={{
        listStyle: "none",
        margin: 0,
        padding: 0,
        display: "grid",
        gridTemplateColumns: `repeat(${n}, minmax(0, 1fr))`,
        gridTemplateRows: "auto auto auto",
        columnGap: "var(--tellian-adv-col-gap)",
        position: "relative",
        maxWidth,
      }}
    >
      <span
        aria-hidden
        style={{
          position: "absolute",
          left: liniePos === "mitte" ? halbeSpalte : 0,
          right: liniePos === "mitte" ? halbeSpalte : 0,
          top:
            liniePos === "mitte"
              ? "calc(var(--tellian-adv-num-size) / 2)"
              : "calc(var(--tellian-adv-num-size) + 10px)",
          height: "1px",
          backgroundColor: "var(--tellian-adv-line)",
          transformOrigin: "left center",
          transform: gezeigt ? "scaleX(1)" : "scaleX(0)",
          transition: reducedMotion
            ? "none"
            : `transform ${LINIE_MS}ms cubic-bezier(0.22,0.61,0.36,1) ${VORLAUF_MS}ms`,
        }}
      />

      {schritte.map((s, i) => (
        <li key={s.titel} style={{ display: "contents" }}>
          <span
            style={{
              gridColumn: i + 1,
              gridRow: 1,
              position: "relative",
              ...zifferStil,
              paddingRight: "var(--tellian-adv-num-gap)",
              ...stufe(i),
            }}
          >
            {ziffer(i)}
          </span>
          <span
            style={{
              gridColumn: i + 1,
              gridRow: 2,
              paddingTop: "clamp(14px, 2.2vh, 26px)",
              ...stufe(i),
            }}
          >
            <span
              style={{
                display: "block",
                fontFamily: serif,
                fontSize: "var(--tellian-adv-step-title-size)",
                fontWeight: 400,
                lineHeight: 1.15,
                color: C.ink,
              }}
            >
              {s.titel}
            </span>
          </span>
          <span
            style={{
              gridColumn: i + 1,
              gridRow: 3,
              paddingTop: "clamp(8px, 1.2vh, 14px)",
              ...stufe(i),
            }}
          >
            <span
              style={{
                display: "block",
                fontFamily: sans,
                fontSize: "var(--tellian-adv-step-text-size)",
                lineHeight: 1.55,
                color: C.accent,
              }}
            >
              {s.zeile}
            </span>
          </span>
        </li>
      ))}
    </ol>
  );
}
