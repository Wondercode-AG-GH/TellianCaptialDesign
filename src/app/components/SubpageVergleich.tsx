import { C, sans, serif } from "../tokens";
import { VERGLEICH, type Pfad } from "../data/mandatAdvisory";

/* ═══════════════════════════════════════════════════════════
   EINORDNUNG — Mandat und Advisory im Vergleich

   Steht auf BEIDEN Unterseiten, immer in derselben Ordnung:
   Mandat links, Advisory rechts. Die Spalte der Seite, auf der
   man steht, ist getönt und trägt oben eine Akzentlinie; der Kopf
   der anderen Spalte ist der Weg dorthin.

   Der Inhalt kommt aus data/mandatAdvisory.ts — eine Aussage,
   ein Wortlaut, zwei Seiten.

   SCHMAL wird aus der Tabelle eine Folge von Blöcken, einer je
   Kriterium, mit beiden Antworten untereinander. Eine Tabelle mit
   drei Spalten ist auf 390px nicht lesbar, und seitliches Scrollen
   ist ausgeschlossen.
   ═══════════════════════════════════════════════════════════ */

/* Tönung der aktiven Spalte: Archive White eine Spur wärmer —
   dieselbe Rolle wie --tellian-bg-secondary, hier direkt als
   Fläche über dem Seitengrund. */
const TOENUNG = "rgba(184, 174, 163, 0.14)";
const HAARLINIE = "rgba(184, 174, 163, 0.5)";

interface Props {
  /** Welche Seite zeigt die Tabelle — diese Spalte ist hervorgehoben. */
  seite: Pfad;
  sprache?: "DE" | "EN";
  isMobile?: boolean;
  /** Weg zur jeweils anderen Unterseite. */
  onAndereSeite?: () => void;
}

export function SubpageVergleich({
  seite,
  sprache = "DE",
  isMobile = false,
  onAndereSeite,
}: Props) {
  const inhalt = VERGLEICH[sprache];
  const andere: Pfad = seite === "mandat" ? "advisory" : "mandat";

  const eyebrowStil: React.CSSProperties = {
    margin: 0,
    fontFamily: sans,
    fontSize: "11px",
    letterSpacing: "0.14em",
    textTransform: "uppercase",
    color: C.accent,
  };
  const titelStil: React.CSSProperties = {
    margin: "clamp(10px, 1.4vh, 16px) 0 0",
    fontFamily: serif,
    fontSize: isMobile ? "26px" : "clamp(28px, 2.6vw, 38px)",
    fontWeight: 400,
    lineHeight: 1.18,
    color: C.ink,
  };
  const zellStil: React.CSSProperties = {
    fontFamily: sans,
    fontSize: isMobile ? "14px" : "14px",
    lineHeight: 1.55,
    color: C.accent,
  };
  const labelStil: React.CSSProperties = {
    fontFamily: sans,
    fontSize: "11px",
    letterSpacing: "0.12em",
    textTransform: "uppercase",
    color: C.accent,
  };

  /* Spaltenkopf: der eigene steht, der andere führt weiter. */
  const kopf = (pfad: Pfad) => {
    const name = inhalt.spalten[pfad];
    if (pfad === seite) {
      return (
        <span
          style={{
            fontFamily: serif,
            fontSize: isMobile ? "18px" : "clamp(18px, 1.5vw, 22px)",
            color: C.ink,
          }}
        >
          {name}
        </span>
      );
    }
    return (
      <button
        type="button"
        onClick={() => onAndereSeite?.()}
        className="tellian-vergleich-weg"
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "8px",
          padding: 0,
          border: "none",
          background: "none",
          cursor: "pointer",
          fontFamily: serif,
          fontSize: isMobile ? "18px" : "clamp(18px, 1.5vw, 22px)",
          color: C.ink,
        }}
      >
        {name}
        <span aria-hidden>→</span>
      </button>
    );
  };

  /* ── SCHMAL: ein Block je Kriterium ── */
  if (isMobile) {
    return (
      <section>
        <p style={eyebrowStil}>{inhalt.eyebrow}</p>
        <h2 style={titelStil}>{inhalt.titel}</h2>
        <div style={{ marginTop: "clamp(24px, 4vh, 36px)" }}>
          {inhalt.zeilen.map((z) => (
            <div
              key={z.label}
              style={{
                borderTop: `1px solid ${HAARLINIE}`,
                padding: "20px 0 4px",
              }}
            >
              <p style={{ ...labelStil, margin: 0 }}>{z.label}</p>
              {(["mandat", "advisory"] as const).map((pfad) => (
                <div
                  key={pfad}
                  style={{
                    marginTop: "14px",
                    padding: "12px 14px",
                    backgroundColor: pfad === seite ? TOENUNG : "transparent",
                    borderTop:
                      pfad === seite ? `2px solid ${C.muted}` : "2px solid transparent",
                  }}
                >
                  <p
                    style={{
                      margin: 0,
                      fontFamily: serif,
                      fontSize: "15px",
                      color: C.ink,
                    }}
                  >
                    {inhalt.spalten[pfad]}
                  </p>
                  <p style={{ ...zellStil, margin: "6px 0 0" }}>{z[pfad]}</p>
                </div>
              ))}
            </div>
          ))}
        </div>
        {/* Der Weg zur anderen Seite steht schmal unter der Liste —
            im Blockkopf wäre er zweimal zu sehen. */}
        <div style={{ marginTop: "26px" }}>{kopf(andere)}</div>
        {stil}
      </section>
    );
  }

  /* ── BREIT: Tabelle, Kriterium links, zwei Spalten rechts ── */
  const spalten = "minmax(120px, 0.8fr) 1.6fr 1.6fr";
  return (
    <section>
      <p style={eyebrowStil}>{inhalt.eyebrow}</p>
      <h2 style={titelStil}>{inhalt.titel}</h2>

      <div
        role="table"
        style={{
          marginTop: "clamp(26px, 4vh, 44px)",
          display: "grid",
          gridTemplateColumns: spalten,
        }}
      >
        {/* Kopfzeile */}
        <div role="row" style={{ display: "contents" }}>
          <div role="columnheader" style={{ borderTop: `1px solid ${HAARLINIE}` }} />
          {(["mandat", "advisory"] as const).map((pfad) => (
            <div
              key={pfad}
              role="columnheader"
              style={{
                padding: "18px 22px",
                borderTop:
                  pfad === seite ? `2px solid ${C.muted}` : `1px solid ${HAARLINIE}`,
                backgroundColor: pfad === seite ? TOENUNG : "transparent",
              }}
            >
              {kopf(pfad)}
            </div>
          ))}
        </div>

        {/* Kriterienzeilen */}
        {inhalt.zeilen.map((z) => (
          <div key={z.label} role="row" style={{ display: "contents" }}>
            <div
              role="rowheader"
              style={{
                padding: "20px 22px 20px 0",
                borderTop: `1px solid ${HAARLINIE}`,
                ...labelStil,
              }}
            >
              {z.label}
            </div>
            {(["mandat", "advisory"] as const).map((pfad) => (
              <div
                key={pfad}
                role="cell"
                style={{
                  padding: "20px 22px",
                  borderTop: `1px solid ${HAARLINIE}`,
                  backgroundColor: pfad === seite ? TOENUNG : "transparent",
                  ...zellStil,
                }}
              >
                {z[pfad]}
              </div>
            ))}
          </div>
        ))}

        {/* Abschlusslinie unter der Tabelle */}
        <div style={{ gridColumn: "1 / -1", borderTop: `1px solid ${HAARLINIE}` }} />
      </div>
      {stil}
    </section>
  );
}

const stil = (
  <style>{`
    .tellian-vergleich-weg { text-decoration: none; }
    .tellian-vergleich-weg:hover { text-decoration: underline; text-underline-offset: 4px; }
    .tellian-vergleich-weg:focus-visible {
      outline: 2px solid var(--tellian-accent);
      outline-offset: 4px;
    }
  `}</style>
);
