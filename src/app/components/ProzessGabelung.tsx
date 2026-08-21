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
    knopf: "Mehr zum Mandat",
  },
  {
    id: "advisory",
    punkt: "muted" as const,
    eyebrow: "SIE ENTSCHEIDEN",
    name: "Advisory",
    text: "Sie bleiben aktiver Investor. Wir liefern Analyse und Empfehlung, die finale Entscheidung treffen Sie.",
    knopf: "Mehr zu Advisory",
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

/* Reiner Text auf der Fläche — keine Kontur, keine Füllung.
   Vorher standen vier ähnliche Rechtecke im Bild, zwei davon
   klickbar und zwei nicht. Jetzt sind es zwei, und beide sind es. */
function Band({ titel }: { titel: string }) {
  return (
    <div
      style={{
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
          alignItems: "stretch",
        }}
      >
        {KARTEN.map((k) => (
          <button
            key={k.id}
            type="button"
            onClick={handler[k.id]}
            className="tellian-pm-karte"
            /* EIN Bedienelement je Karte. Der Knopf darunter ist ein
               span, kein zweiter Knopf — die ganze Karte ist die
               Klickfläche, ein Tastaturschritt, eine Ansage. */
            style={{
              /* Flex, damit der Knopf unten sitzt, auch wenn die
                 beiden Karten unterschiedlich lange Texte tragen. */
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-start",
              height: "100%",
              width: "100%",
              textAlign: "left",
              font: "inherit",
              cursor: "pointer",
              /* Kontur und Füllung stehen in der Regel unten, NICHT
                 hier: inline gesetzt schlagen sie jede :hover-Regel,
                 und der Zustand bliebe wirkungslos. */
              borderStyle: "solid",
              borderWidth: "1px",
              borderRadius: "var(--tellian-pm-radius)",
              padding: "var(--tellian-pm-card-pad)",
            }}
          >
            <span
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: "7px",
                fontFamily: sans,
                fontSize: "var(--tellian-pm-card-eyebrow-size)",
                letterSpacing: "var(--tellian-pm-card-eyebrow-tracking)",
                lineHeight: "var(--tellian-pm-card-eyebrow-leading)",
                /* Zwei Zeilen fest: die eine Zeile bricht um, die
                   andere nicht — ohne Reserve stünden die Namen der
                   beiden Karten auf verschiedenen Linien. */
                minHeight: "calc(2 * var(--tellian-pm-card-eyebrow-size) * var(--tellian-pm-card-eyebrow-leading))",
                color: C.accent,
              }}
            >
              <span
                aria-hidden
                style={{
                  flex: "0 0 auto",
                  width: "6px",
                  height: "6px",
                  /* Auf die Mittellinie der ersten Zeile. */
                  marginTop: "calc((var(--tellian-pm-card-eyebrow-size) * var(--tellian-pm-card-eyebrow-leading) - 6px) / 2)",
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

            {/* Sieht aus wie ein Knopf, ist aber Teil der Karte.
                Ein echtes <button> hier ergäbe ein zweites Klickziel,
                einen zweiten Tastaturschritt und eine zweite Ansage. */}
            <span
              className="tellian-pm-knopf"
              style={{
                display: "inline-block",
                marginTop: "auto",
                paddingTop: "var(--tellian-pm-card-pad)",
                fontFamily: sans,
                fontSize: "var(--tellian-pm-card-link-size)",
                letterSpacing: "0.06em",
              }}
            >
              <span
                style={{
                  display: "inline-block",
                  color: "var(--tellian-pm-knopf-ink)",
                  padding: "var(--tellian-pm-knopf-pad)",
                  borderRadius: "2px",
                  whiteSpace: "nowrap",
                }}
              >
                {k.knopf} <span aria-hidden>→</span>
              </span>
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
          border-color: var(--tellian-pm-line);
          background-color: var(--tellian-pm-card-bg);
          transform: translateY(0);
          box-shadow: none;
          transition:
            border-color var(--tellian-pm-card-ms) ease,
            background-color var(--tellian-pm-card-ms) ease,
            transform var(--tellian-pm-card-ms) ease,
            box-shadow var(--tellian-pm-card-ms) ease;
        }
        .tellian-pm-karte:hover,
        .tellian-pm-karte:focus-visible {
          border-color: var(--tellian-pm-line-active);
          background-color: var(--tellian-pm-card-bg-aktiv);
          transform: translateY(var(--tellian-pm-card-hub));
          box-shadow: var(--tellian-pm-card-schatten);
        }
        /* Der Knopf dunkelt mit der Karte nach — er ist Teil von ihr,
           kein eigenes Ziel, also hat er auch keinen eigenen Hover. */
        .tellian-pm-knopf > span {
          background-color: var(--tellian-pm-knopf-bg);
          transition: background-color var(--tellian-pm-card-ms) ease;
        }
        .tellian-pm-karte:hover .tellian-pm-knopf > span,
        .tellian-pm-karte:focus-visible .tellian-pm-knopf > span {
          background-color: var(--tellian-pm-knopf-bg-aktiv);
        }
        .tellian-pm-karte:focus-visible {
          outline: 2px solid var(--tellian-pm-focus-ring);
          outline-offset: 3px;
        }
        @media (prefers-reduced-motion: reduce) {
          .tellian-pm-karte,
          .tellian-pm-karte * { transition: none !important; }
          .tellian-pm-karte:hover,
          .tellian-pm-karte:focus-visible { transform: none; }
        }
      `}</style>
    </div>
  );
}
