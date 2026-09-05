import { C, cormorant, sans, serif } from "../tokens";

/* ═══════════════════════════════════════════════════════════
   ZWEI WEGE — Auswahlbereich der Station Vermögensverwaltung

   Ein Titel über zwei gleichrangigen Karten. Die frühere Grafik
   (Band «Analyse und Datengrundlage», Gabelungslinien) ist mit dem
   Redesign entfallen — was sie erzählte, steht jetzt im dritten
   Absatz des Stationstexts.

   EIN Bedienelement je Karte: die ganze Karte ist die Klickfläche,
   ein Tastaturschritt, eine Ansage. Der «Knopf» unten ist ein span.
   ═══════════════════════════════════════════════════════════ */

/* ── INHALTE, WÖRTLICH AUS DEM REDESIGN-BRIEFING ──
   Band («Analyse und Datengrundlage») und Einstiegssatz des schmalen
   Zweigs sind entfallen; an ihrer Stelle steht der Titel des
   Auswahlbereichs. Die Verbindungsgrafik entfällt mit dem Band. */

interface Karte {
  id: "mandat" | "advisory";
  punkt: "purple" | "muted";
  eyebrow: string;
  name: string;
  text: string;
  fuer: string;
  knopf: string;
}

interface GabelungInhalt {
  wegeTitel: string;
  karten: readonly [Karte, Karte];
}

const INHALT: Readonly<Record<"DE" | "EN" | "FR", GabelungInhalt>> = {
  DE: {
    wegeTitel: "Zwei Wege, ein Anspruch",
    karten: [
      {
        id: "mandat",
        punkt: "purple",
        eyebrow: "Wir verwalten",
        name: "Mandat",
        text: "Sie übertragen uns die Verwaltung Ihres Portfolios. Wir treffen die Anlageentscheide innerhalb Ihrer definierten Strategie und Ihres Risikoprofils.",
        fuer: "Für Kunden, die ihre Anlageentscheide in professionelle Hände geben möchten.",
        knopf: "Mehr zum Mandat",
      },
      {
        id: "advisory",
        punkt: "muted",
        eyebrow: "Sie entscheiden",
        name: "Advisory",
        text: "Wir analysieren Ihr Portfolio auf Basis Ihrer Ziele und Ihres Risikoprofils und beraten Sie unter Berücksichtigung des aktuellen Marktumfelds.",
        fuer: "Für Kunden, die ihre Anlageentscheide selbst treffen und dabei auf professionelle Beratung setzen möchten.",
        knopf: "Mehr zu Advisory",
      },
    ],
  },
  EN: {
    /* TODO-EN-TITEL: Ein englischer Titel für den Auswahlbereich
       liegt nicht vor; bis dahin steht der bestehende deutsche. */
    wegeTitel: "Zwei Wege, ein Anspruch",
    karten: [
      {
        id: "mandat",
        punkt: "purple",
        eyebrow: "We manage",
        name: "Discretionary Mandate",
        text: "You entrust us with the management of your portfolio. We make investment decisions within your agreed strategy and risk profile.",
        fuer: "For clients who wish to place their investment decisions in professional hands.",
        knopf: "Learn more about our mandate",
      },
      {
        id: "advisory",
        punkt: "muted",
        eyebrow: "You decide",
        name: "Advisory",
        text: "We analyse your portfolio in the context of your objectives, risk profile and the current market environment, and translate this into specific investment recommendations.",
        fuer: "For clients who wish to make their own investment decisions while benefiting from professional advice.",
        knopf: "Learn more about Advisory",
      },
    ],
  },
  /* TODO-FR: Übersetzung folgt — DE-Text als Platzhalter. */
  FR: {
    wegeTitel: "Zwei Wege, ein Anspruch",
    karten: [
      {
        id: "mandat",
        punkt: "purple",
        eyebrow: "Wir verwalten",
        name: "Mandat",
        text: "Sie übertragen uns die Verwaltung Ihres Portfolios. Wir treffen die Anlageentscheide innerhalb Ihrer definierten Strategie und Ihres Risikoprofils.",
        fuer: "Für Kunden, die ihre Anlageentscheide in professionelle Hände geben möchten.",
        knopf: "Mehr zum Mandat",
      },
      {
        id: "advisory",
        punkt: "muted",
        eyebrow: "Sie entscheiden",
        name: "Advisory",
        text: "Wir analysieren Ihr Portfolio auf Basis Ihrer Ziele und Ihres Risikoprofils und beraten Sie unter Berücksichtigung des aktuellen Marktumfelds.",
        fuer: "Für Kunden, die ihre Anlageentscheide selbst treffen und dabei auf professionelle Beratung setzen möchten.",
        knopf: "Mehr zu Advisory",
      },
    ],
  },
};

interface Props {
  /** Karten untereinander. */
  gestapelt?: boolean;
  /** Station liegt auf Imperial Purple: Titel hell, Fokusring hell.
      Die Karten selbst bleiben helle Flächen — auf dunklem Grund
      grenzen sie sich damit von selbst ab, und ihre Innen-Typografie
      behält die Kontraste des Hell-Schemas. */
  aufDunkel?: boolean;
  /** Lead-Text zwischen Titel und Karten — Absatz 3 der Station:
      er leitet inhaltlich auf die beiden Wege über und gehört
      deshalb IN den Auswahlbereich, nicht in die Textzone links. */
  lead?: string;
  sprache?: "DE" | "EN";
  onMandat?: () => void;
  onAdvisory?: () => void;
}

export function ProzessGabelung({
  gestapelt = false,
  aufDunkel = false,
  lead,
  sprache = "DE",
  onMandat,
  onAdvisory,
}: Props) {
  const handler = { mandat: onMandat, advisory: onAdvisory } as const;
  const inhalt = INHALT[sprache];

  return (
    <div
      style={{
        width: "100%",
        /* Schmal keine Deckelung: gemessen sass die Grafik dadurch
           22px eingerückt gegenüber dem Fliesstext daneben — zwei
           Blöcke, die nicht auf einer Kante standen. */
        /* In der dunklen, gestapelten Spur läuft der Bereich mit der
           vollen Spurbreite; die alte Deckelung galt dem schmalen
           Grafikfeld rechts neben dem Text. */
        maxWidth: gestapelt || aufDunkel ? "none" : "var(--tellian-pm-graphic-max)",
        margin: aufDunkel ? "0" : "0 auto",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Titel des Auswahlbereichs — Lustria, wie die Titel des
          Redesigns. Breit zentriert über den Karten, schmal links
          auf der Kante der Spalte. */}
      <h3
        style={{
          margin: "0 0 clamp(18px, 3vh, 30px)",
          fontFamily: serif,
          fontSize: "var(--tellian-pm-wege-size)",
          fontWeight: 400,
          lineHeight: 1.2,
          color: aufDunkel ? "var(--tellian-pm-wege-color)" : C.ink,
          /* In der gestapelten Spur steht der Titel auf der linken
             Kante wie alles andere — zentriert war er nur über dem
             alten, freistehenden Grafikfeld. */
          textAlign: gestapelt || aufDunkel ? "left" : "center",
        }}
      >
        {inhalt.wegeTitel}
      </h3>

      {lead && (
        <p
          style={{
            /* v5: 15.5px, rund 66ch, 40px Abstand zu den Karten. */
            margin: "0 0 40px",
            fontFamily: sans,
            fontSize: "15.5px",
            lineHeight: 1.65,
            maxWidth: "66ch",
            color: aufDunkel ? "var(--tellian-pm-dunkel-dim)" : C.accent,
          }}
        >
          {lead}
        </p>
      )}

      {/* ── DIPTYCHON (v5) ──
          Zwei Karten als EIN Block: 2px Fuge innen, 1px Hairline
          aussen, beides Mushroom mit 35 % Deckung — gelöst über
          columnGap und padding des Rahmens, dessen Fläche in der
          Fugenfarbe durchscheint. Kein Schatten, keine Radien.

          ZEILENGENAU ÜBER BEIDE KARTEN: der Rahmen definiert fünf
          Zeilen (Kopf / Titel / Beschreibung / Kursivzeile / CTA),
          jede Karte erbt sie mit grid-template-rows: subgrid. Die
          Kursivzeile ist die 1fr-Zeile — sie federt, damit beide
          CTAs am Kartenfuss auf derselben Höhe stehen.

          Gestapelt (Telefon) entfallen Fuge und Subgrid; jede Karte
          trägt ihre eigene 1px-Hairline als Kontur. */}
      <div
        style={
          gestapelt
            ? {
                display: "flex",
                flexDirection: "column",
                gap: "clamp(18px, 3vh, 28px)",
              }
            : {
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gridTemplateRows: "auto auto auto 1fr auto",
                columnGap: "2px",
                padding: "1px",
                backgroundColor: "var(--tellian-pm-fuge)",
              }
        }
      >
        {inhalt.karten.map((k) => {
          const zeile = (inhaltZeile: React.ReactNode, stil: React.CSSProperties) =>
            gestapelt ? (
              <span style={{ display: "block", ...stil }}>{inhaltZeile}</span>
            ) : (
              <span style={{ display: "block", minWidth: 0, ...stil }}>{inhaltZeile}</span>
            );
          return (
          <button
            key={k.id}
            type="button"
            onClick={handler[k.id]}
            className={aufDunkel ? "tellian-pm-karte tellian-pm-karte--aufdunkel" : "tellian-pm-karte"}
            /* EIN Bedienelement je Karte: die ganze Karte ist die
               Klickfläche. Der «Knopf» unten ist ein span. */
            style={{
              textAlign: "left",
              font: "inherit",
              cursor: "pointer",
              border: gestapelt ? "1px solid var(--tellian-pm-fuge)" : "none",
              borderRadius: 0,
              padding: 0,
              ...(gestapelt
                ? { display: "flex", flexDirection: "column", alignItems: "stretch" }
                : {
                    display: "grid",
                    gridTemplateRows: "subgrid",
                    gridRow: "1 / -1",
                    alignItems: "start",
                  }),
            }}
          >
            {/* Zeile 1 — Kopf: Eyebrow mit Farbpunkt, darunter die
                Hairline über die VOLLE Kartenbreite (randlos). */}
            {zeile(
              <span
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  fontFamily: sans,
                  fontSize: "var(--tellian-pm-card-eyebrow-size)",
                  letterSpacing: "var(--tellian-pm-card-eyebrow-tracking)",
                  lineHeight: "var(--tellian-pm-card-eyebrow-leading)",
                  color: C.accent,
                }}
              >
                <span
                  aria-hidden
                  style={{
                    flex: "0 0 auto",
                    width: "7px",
                    height: "7px",
                    borderRadius: "50%",
                    backgroundColor: k.punkt === "purple" ? C.purple : C.muted,
                  }}
                />
                {k.eyebrow}
              </span>,
              {
                padding: "22px var(--tellian-pm-dip-pad-x) 14px",
                borderBottom: "1px solid var(--tellian-pm-fuge)",
              },
            )}

            {/* Zeile 2 — Kartentitel */}
            {zeile(
              <span
                style={{
                  fontFamily: serif,
                  fontSize: "var(--tellian-pm-card-name-size)",
                  fontWeight: 400,
                  lineHeight: 1.15,
                  color: C.ink,
                }}
              >
                {k.name}
              </span>,
              { padding: "22px var(--tellian-pm-dip-pad-x) 0" },
            )}

            {/* Zeile 3 — Beschreibung */}
            {zeile(
              <span
                style={{
                  fontFamily: sans,
                  fontSize: "var(--tellian-pm-card-text-size)",
                  lineHeight: 1.6,
                  color: C.accent,
                }}
              >
                {k.text}
              </span>,
              { padding: "12px var(--tellian-pm-dip-pad-x) 0" },
            )}

            {/* Zeile 4 — Hairline (innerhalb des Innenabstands) und
                Kursivzeile. Die 1fr-Zeile: sie federt die
                unterschiedlich langen Zeilen ab. */}
            {zeile(
              <>
                <span
                  aria-hidden
                  style={{
                    display: "block",
                    height: "1px",
                    backgroundColor: "var(--tellian-pm-fuge)",
                  }}
                />
                <span
                  style={{
                    display: "block",
                    marginTop: "14px",
                    fontFamily: cormorant,
                    fontStyle: "italic",
                    fontSize: "var(--tellian-pm-card-fuer-size)",
                    lineHeight: 1.45,
                    color: "var(--tellian-pm-card-fuer-color)",
                  }}
                >
                  {k.fuer}
                </span>
              </>,
              { padding: "18px var(--tellian-pm-dip-pad-x) 0" },
            )}

            {/* Zeile 5 — CTA am Kartenfuss */}
            {zeile(
              <span
                className="tellian-pm-knopf"
                style={{
                  display: "inline-block",
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
                    borderRadius: 0,
                    whiteSpace: "nowrap",
                  }}
                >
                  {k.knopf} <span aria-hidden>→</span>
                </span>
              </span>,
              {
                padding:
                  "22px var(--tellian-pm-dip-pad-x) var(--tellian-pm-dip-pad-unten)",
                ...(gestapelt ? { marginTop: "auto" } : { alignSelf: "end" }),
              },
            )}
          </button>
          );
        })}
      </div>


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
        /* Auf Imperial Purple wäre der purpurne Ring unsichtbar. */
        .tellian-pm-karte--aufdunkel:focus-visible {
          outline-color: var(--tellian-pm-focus-ring-dunkel);
        }
        /* Auf dem dunklen Grund tragen die Karten Archive White als
           Fläche (Briefing); der leichte Tint des Hell-Schemas wäre
           hier ununterscheidbar vom Weiss. Rahmen entfällt — die
           Fläche grenzt sich selbst ab. */
        .tellian-pm-karte--aufdunkel {
          background-color: var(--tellian-bg);
          /* v5: kein Schatten, keine Hebung — der Block steht ruhig. */
          transform: none;
          box-shadow: none;
        }
        .tellian-pm-karte--aufdunkel:hover,
        .tellian-pm-karte--aufdunkel:focus-visible {
          background-color: var(--tellian-pm-card-bg-aktiv);
          transform: none;
          box-shadow: none;
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
