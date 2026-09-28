import { C, sans, serif } from "../tokens";

/* ═══════════════════════════════════════════════════════════
   «AUF EINEN BLICK» — Panel im Hero beider Unterseiten

   Drei Zeilen aus Label und Wert auf Imperial Purple. Es
   beantwortet die drei Fragen, die den Unterschied zwischen
   Mandat und Advisory ausmachen, bevor man den Fliesstext liest:
   Wer hat die Vollmacht, wer entscheidet, wer setzt um.

   Mushroom auf Imperial Purple ist erlaubt und trägt hier die
   Labels; die Werte stehen in Archive White.
   ═══════════════════════════════════════════════════════════ */

export interface BlickZeile {
  label: string;
  wert: string;
}

interface Props {
  titel: string;
  zeilen: readonly BlickZeile[];
  isMobile?: boolean;
}

export function SubpageAufEinenBlick({ titel, zeilen, isMobile = false }: Props) {
  return (
    <aside
      style={{
        backgroundColor: C.purple,
        padding: isMobile ? "26px 24px" : "clamp(28px, 2.6vw, 40px)",
        alignSelf: "start",
      }}
    >
      <p
        style={{
          margin: 0,
          fontFamily: sans,
          fontSize: "10px",
          letterSpacing: "0.16em",
          textTransform: "uppercase",
          color: C.muted,
        }}
      >
        {titel}
      </p>
      <dl style={{ margin: 0 }}>
        {zeilen.map((z, i) => (
          <div
            key={z.label}
            style={{
              marginTop: i === 0 ? "clamp(18px, 2.4vh, 26px)" : 0,
              paddingTop: i === 0 ? 0 : "clamp(14px, 1.8vh, 20px)",
              paddingBottom: "clamp(14px, 1.8vh, 20px)",
              borderTop:
                i === 0 ? "none" : "1px solid rgba(184, 174, 163, 0.28)",
            }}
          >
            <dt
              style={{
                fontFamily: sans,
                fontSize: "11px",
                letterSpacing: "0.1em",
                color: C.muted,
              }}
            >
              {z.label}
            </dt>
            <dd
              style={{
                margin: "6px 0 0",
                fontFamily: serif,
                fontSize: isMobile ? "19px" : "clamp(18px, 1.5vw, 22px)",
                lineHeight: 1.25,
                color: C.bg,
              }}
            >
              {z.wert}
            </dd>
          </div>
        ))}
      </dl>
    </aside>
  );
}
