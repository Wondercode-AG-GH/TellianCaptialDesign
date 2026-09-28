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

  const titelStil: React.CSSProperties = {
    margin: 0,
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

  /* ── SCHMAL: ein Block je Kriterium ──
     Die erste Fassung wiederholte «Mandat» und «Advisory» als
     Serifen-Zwischentitel in jedem der vier Blöcke — achtmal
     dasselbe Wort, und zwar grösser gesetzt als das Kriterium,
     um das es ging. Die Gliederung stand damit auf dem Kopf.

     Jetzt führt das KRITERIUM den Block als Überschrift; die
     Seitenmarken stehen klein und in Versalien daneben, wie die
     Eyebrows der Seite. Die eigene Seite trägt einen Balken an
     der linken Kante statt einer ganzflächigen Tönung — auf
     390px liest sich eine Fläche als Kasten, eine Kante als
     Hervorhebung.

     Ab 620px stehen die beiden Antworten nebeneinander: dort ist
     Platz für den direkten Vergleich, und die Liste wird nur halb
     so lang. */
  if (isMobile) {
    return (
      <section>
        <h2 style={titelStil}>{inhalt.titel}</h2>
        <div style={{ marginTop: "clamp(22px, 3.6vh, 32px)" }}>
          {inhalt.zeilen.map((z) => (
            <div
              key={z.label}
              className="tellian-vgl-block"
              style={{ borderTop: `1px solid ${HAARLINIE}` }}
            >
              <h3
                style={{
                  margin: "0 0 14px",
                  fontFamily: serif,
                  fontSize: "19px",
                  fontWeight: 400,
                  color: C.ink,
                }}
              >
                {z.label}
              </h3>
              <div className="tellian-vgl-paar">
                {(["mandat", "advisory"] as const).map((pfad) => (
                  <div
                    key={pfad}
                    className={pfad === seite ? "tellian-vgl-seite tellian-vgl-aktiv" : "tellian-vgl-seite"}
                  >
                    <p
                      style={{
                        margin: 0,
                        fontFamily: sans,
                        fontSize: "10px",
                        letterSpacing: "0.14em",
                        textTransform: "uppercase",
                        color: pfad === seite ? C.ink : C.accent,
                      }}
                    >
                      {inhalt.spalten[pfad]}
                    </p>
                    <p style={{ ...zellStil, margin: "6px 0 0" }}>{z[pfad]}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
        {/* Der Weg zur anderen Seite steht schmal unter der Liste —
            im Blockkopf wäre er viermal zu sehen. */}
        <div style={{ marginTop: "26px" }}>{kopf(andere)}</div>
        {stil}
      </section>
    );
  }

  /* ── BREIT: Tabelle, Kriterium links, zwei Spalten rechts ── */
  const spalten = "minmax(120px, 0.8fr) 1.6fr 1.6fr";
  return (
    <section>
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
    .tellian-vgl-block { padding: 20px 0 22px; }
    .tellian-vgl-paar { display: grid; gap: 16px; }
    .tellian-vgl-seite { padding-left: 14px; border-left: 2px solid transparent; }
    .tellian-vgl-aktiv {
      border-left-color: ${C.muted};
      background-color: rgba(184, 174, 163, 0.12);
      padding-top: 10px;
      padding-bottom: 10px;
      margin-top: -10px;
    }
    /* Ab 620px nebeneinander: der Vergleich wird direkt lesbar
       und die Liste halb so lang. */
    @media (min-width: 620px) {
      .tellian-vgl-paar { grid-template-columns: 1fr 1fr; gap: 24px; }
    }
    .tellian-vergleich-weg { text-decoration: none; }
    .tellian-vergleich-weg:hover { text-decoration: underline; text-underline-offset: 4px; }
    .tellian-vergleich-weg:focus-visible {
      outline: 2px solid var(--tellian-accent);
      outline-offset: 4px;
    }
  `}</style>
);
