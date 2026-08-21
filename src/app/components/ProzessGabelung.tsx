import { C, cormorant, sans } from "../tokens";

/* ═══════════════════════════════════════════════════════════
   PROZESSGABELUNG — Stamm, Gabelung, Zusammenlauf

   Fünf Teile von oben nach unten: Band, Verbindung, zwei Karten,
   Verbindung, Band.

   EINE Grafik für beide Karten, nicht eine je Karte. Die Bänder
   umschliessen die Gabelung, und genau das ist die Aussage: derselbe
   Prozess vorher wie nachher, nur der Entscheid gabelt sich. Zwei
   getrennte Grafiken würden zwei Prozesse behaupten.

   WARUM DIE VERBINDUNGEN SVG SIND
   Als Rahmen aus border-Kanten wären die Rundungen an jeder Breite
   andere. Das SVG behält sein Seitenverhältnis (preserveAspectRatio
   in der Voreinstellung) und skaliert gleichmässig — die Rundung
   bleibt eine Rundung.

   WARUM DER KARTENABSTAND IN PROZENT STEHT
   Die Linien enden bei 24 % und 76 % der Breite, weil dort bei
   4 % Abstand die Kartenmitten liegen: (100 − 4) / 4 = 24. Ein
   fester Pixelabstand würde die Mitten mit der Breite wandern
   lassen und die Linien danebenlaufen.
   ═══════════════════════════════════════════════════════════ */

const BAND_OBEN = "Analyse und Vorschlag";
const BAND_UNTEN = "Umsetzung und Überwachung";
const BAND_SUB = "TELLIAN CAPITAL";

const KARTEN = [
  {
    id: "mandat",
    punkt: "purple" as const,
    eyebrow: "TELLIAN ENTSCHEIDET",
    name: "Mandat",
    text: "Sie erteilen die Verwaltungsvollmacht. Tellian Capital trifft die Anlageentscheide auf Basis Ihres Risikoprofils.",
    verweis: "Anlageausschuss und Strategien",
  },
  {
    id: "advisory",
    punkt: "muted" as const,
    eyebrow: "SIE ENTSCHEIDEN",
    name: "Advisory",
    text: "Sie bleiben aktiver Investor. Wir liefern Analyse und Empfehlung, die finale Entscheidung treffen Sie.",
    verweis: "Mehr zu Advisory",
  },
] as const;

/* Gabelung nach unten: Stamm aus der Bandmitte, dann zwei Äste auf
   die Kartenmitten bei x 96 und 304 von 400. */
const GABEL_AB =
  "M200 0 V18 a10 10 0 0 1 -10 10 H106 a10 10 0 0 0 -10 10 V56 " +
  "M200 18 a10 10 0 0 0 10 10 H294 a10 10 0 0 1 10 10 V56";

/* Zusammenlauf nach unten: gespiegelt, aus den Kartenmitten in die
   Bandmitte. */
const GABEL_ZU =
  "M96 0 V18 a10 10 0 0 0 10 10 H190 a10 10 0 0 1 10 10 V56 " +
  "M304 0 V18 a10 10 0 0 1 -10 10 H210 a10 10 0 0 0 -10 10 V56";

function Band({ titel }: { titel: string }) {
  return (
    <div
      style={{
        border: `1px solid var(--tellian-pm-line)`,
        borderRadius: "var(--tellian-pm-radius)",
        paddingTop: "var(--tellian-pm-band-pad-y)",
        paddingBottom: "var(--tellian-pm-band-pad-y)",
        paddingLeft: "16px",
        paddingRight: "16px",
        textAlign: "center",
      }}
    >
      <div
        style={{
          fontFamily: sans,
          fontSize: "var(--tellian-pm-band-title-size)",
          fontWeight: 600,
          color: C.ink,
          lineHeight: 1.3,
        }}
      >
        {titel}
      </div>
      <div
        style={{
          marginTop: "5px",
          fontFamily: sans,
          fontSize: "var(--tellian-pm-band-sub-size)",
          letterSpacing: "var(--tellian-pm-caps-tracking)",
          color: C.accent,
          lineHeight: 1.3,
        }}
      >
        {BAND_SUB}
      </div>
    </div>
  );
}

/** Rein dekorativ — die Reihenfolge steht schon im Text der Bänder. */
function Verbindung({ d }: { d: string }) {
  return (
    <svg
      viewBox="0 0 400 56"
      aria-hidden
      focusable="false"
      style={{ display: "block", width: "100%", height: "auto" }}
    >
      <path
        d={d}
        fill="none"
        stroke="var(--tellian-pm-connector)"
        strokeWidth={1}
        vectorEffect="non-scaling-stroke"
        strokeLinecap="round"
      />
    </svg>
  );
}

interface Props {
  /** Karten untereinander, Verbindungen entfallen. */
  gestapelt?: boolean;
  onMandat?: () => void;
  onAdvisory?: () => void;
}

export function ProzessGabelung({
  gestapelt = false,
  onMandat,
  onAdvisory,
}: Props) {
  const handler = { mandat: onMandat, advisory: onAdvisory } as const;

  return (
    <div
      style={{
        width: "100%",
        maxWidth: "var(--tellian-pm-graphic-max)",
        margin: "0 auto",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Band titel={BAND_OBEN} />

      {gestapelt ? (
        <div style={{ height: "20px" }} />
      ) : (
        <Verbindung d={GABEL_AB} />
      )}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: gestapelt ? "1fr" : "1fr 1fr",
          gap: gestapelt ? "16px" : "var(--tellian-pm-card-gap)",
        }}
      >
        {KARTEN.map((k) => (
          <button
            key={k.id}
            type="button"
            onClick={handler[k.id]}
            className="tellian-pm-karte"
            style={{
              display: "block",
              width: "100%",
              textAlign: "left",
              font: "inherit",
              cursor: "pointer",
              /* Fläche und Hover-Fläche stehen als eigene
                 Eigenschaften an der Karte; die Fläche selbst setzt
                 die Regel unten. Inline gesetzt schlüge sie jede
                 :hover-Regel — genau daran ist der Hover der Karten
                 vorher wirkungslos geblieben. */
              ["--flaeche" as string]: `var(--tellian-pm-card-${k.id})`,
              ["--flaeche-hover" as string]: `var(--tellian-pm-card-${k.id}-hover)`,
              border: `1px solid var(--tellian-pm-line)`,
              borderRadius: "var(--tellian-pm-radius)",
              padding: "var(--tellian-pm-card-pad)",
            }}
          >
            <span
              style={{
                display: "flex",
                alignItems: "center",
                gap: "7px",
                fontFamily: sans,
                fontSize: "var(--tellian-pm-card-eyebrow-size)",
                letterSpacing: "var(--tellian-pm-caps-tracking)",
                color: C.accent,
              }}
            >
              <span
                aria-hidden
                style={{
                  flex: "0 0 auto",
                  width: "6px",
                  height: "6px",
                  borderRadius: "50%",
                  backgroundColor:
                    k.punkt === "purple" ? C.purple : C.muted,
                }}
              />
              {k.eyebrow}
            </span>

            <span
              style={{
                display: "block",
                marginTop: "10px",
                fontFamily: cormorant,
                fontSize: "var(--tellian-pm-card-name-size)",
                fontWeight: 300,
                lineHeight: 1.1,
                color: C.ink,
              }}
            >
              {k.name}
            </span>

            <span
              style={{
                display: "block",
                marginTop: "9px",
                fontFamily: sans,
                fontSize: "var(--tellian-pm-card-text-size)",
                lineHeight: 1.55,
                color: C.accent,
              }}
            >
              {k.text}
            </span>

            <span
              style={{
                display: "block",
                marginTop: "13px",
                fontFamily: sans,
                fontSize: "var(--tellian-pm-card-link-size)",
                letterSpacing: "0.04em",
                color: C.ink,
              }}
            >
              {k.verweis} <span aria-hidden>→</span>
            </span>
          </button>
        ))}
      </div>

      {gestapelt ? (
        <div style={{ height: "20px" }} />
      ) : (
        <Verbindung d={GABEL_ZU} />
      )}

      <Band titel={BAND_UNTEN} />

      {/* Zustände als Regel statt als Ereignis: onMouseEnter/Leave
          würde die Tastatur nicht bedienen, und :focus-visible lässt
          sich inline gar nicht ausdrücken. */}
      <style>{`
        .tellian-pm-karte {
          background-color: var(--flaeche);
          transition: border-color 200ms ease, background-color 200ms ease;
        }
        .tellian-pm-karte:hover,
        .tellian-pm-karte:focus-visible {
          border-color: var(--tellian-pm-line-active);
          background-color: var(--flaeche-hover);
        }
        .tellian-pm-karte:focus-visible {
          outline: 2px solid var(--tellian-pm-focus-ring);
          outline-offset: 2px;
        }
        @media (prefers-reduced-motion: reduce) {
          .tellian-pm-karte { transition: none; }
        }
      `}</style>
    </div>
  );
}
