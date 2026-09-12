import { C, sans, serif } from "../tokens";
import { SECTION_WIDTH } from "../sections";
import { useSectionEntered } from "./SectionEntry";
import { usePrefersReducedMotion } from "./usePrefersReducedMotion";
import { DreiecksBeziehung } from "./DreiecksBeziehung";
import { Aufgang, Kapitelmarke } from "./MobilSektion";

/* ═══════════════════════════════════════════════════════════
   STATION 03 — DREIECKSBEZIEHUNG (hell)

   Redesign: links die Textzone (H1 + drei Absätze, einspaltig,
   52ch), rechts die Dreiecksgrafik als visueller Anker — deutlich
   grösser als zuvor, sie füllt die rechte Zone. Beide Gruppen
   vertikal zentriert (G1).

   Entfallen sind: die zwei alten Textspalten, der Knopf «Mehr zur
   Vermögensverwaltung» (die Vermögensverwaltung ist seit dem
   Redesign Station 02; die alte Unterseite hängt nur noch an
   Station 6 als Rechtsweg — gemeldet), und das frühere
   ParteiDreieck mit seinen Zeige-Texten (G5: alles ohne
   Interaktion sichtbar).
   ═══════════════════════════════════════════════════════════ */

interface StationInhalt {
  titel: readonly [string, string];
  absaetze: readonly string[];
}

const INHALT: Readonly<Record<"DE" | "EN" | "FR", StationInhalt>> = {
  DE: {
    titel: ["Bewährte", "Geschäftsbeziehungen"],
    absaetze: [
      "Tellian Capital ist Partner und Bindeglied zwischen Ihnen und den Depotbanken. Wir setzen die gemeinsam definierte Anlagestrategie um, steuern Ihr Portfolio aktiv und vertreten Ihre Interessen gegenüber den Depotbanken. Ihr Vermögen bleibt dabei jederzeit in Ihrem Eigentum.",
      "Unsere Zusammenarbeit mit ausgewählten Depotbanken ermöglicht vorteilhafte Konditionen und den Zugang zu ergänzenden Bankdienstleistungen. Die Verwahrung der Vermögenswerte erfolgt bei der jeweiligen Bank. Bei Bedarf kann Ihr Vermögen auf mehrere Institute und Standorte verteilt werden.",
      "So bleiben die Rollen klar getrennt: Die Bank verwahrt Ihr Vermögen, Tellian Capital verwaltet es und Sie stehen im Mittelpunkt.",
    ],
  },
  EN: {
    titel: ["Established", "Banking Relationships"],
    absaetze: [
      "Tellian Capital acts as your partner and liaison with the custodian banks. We implement the investment strategy defined together with you, actively manage your portfolio and represent your interests in dealings with the custodian banks. Your assets remain in your ownership at all times.",
      "Our relationships with selected custodian banks provide access to preferential terms and additional banking services. Your assets are held with the respective custodian bank and, where appropriate, can be diversified across multiple institutions and locations.",
      "This ensures a clear separation of roles: the bank safeguards your assets, Tellian Capital manages them, and you remain at the centre of every decision.",
    ],
  },
  /* TODO-FR: Übersetzung folgt — DE-Text als Platzhalter. */
  FR: {
    titel: ["Bewährte", "Geschäftsbeziehungen"],
    absaetze: [
      "Tellian Capital ist Partner und Bindeglied zwischen Ihnen und den Depotbanken. Wir setzen die gemeinsam definierte Anlagestrategie um, steuern Ihr Portfolio aktiv und vertreten Ihre Interessen gegenüber den Depotbanken. Ihr Vermögen bleibt dabei jederzeit in Ihrem Eigentum.",
      "Unsere Zusammenarbeit mit ausgewählten Depotbanken ermöglicht vorteilhafte Konditionen und den Zugang zu ergänzenden Bankdienstleistungen. Die Verwahrung der Vermögenswerte erfolgt bei der jeweiligen Bank. Bei Bedarf kann Ihr Vermögen auf mehrere Institute und Standorte verteilt werden.",
      "So bleiben die Rollen klar getrennt: Die Bank verwahrt Ihr Vermögen, Tellian Capital verwaltet es und Sie stehen im Mittelpunkt.",
    ],
  },
};

const STEP = { title: 0, body: 200, grafik: 120 } as const;
const DURATION = 460;

interface Props {
  panelRef?: (el: HTMLDivElement | null) => void;
  /** Schmale Fassung für Tablet und Telefon. */
  isVertical?: boolean;
  sprache?: "DE" | "EN";
  /** P7: Tellian-Knoten der Grafik → Unterseite Mandat. */
  onMandat?: () => void;
}

export function Station2WealthManagement({
  panelRef,
  isVertical = false,
  sprache = "DE",
  onMandat,
}: Props) {
  const entered = useSectionEntered();
  const reducedMotion = usePrefersReducedMotion();
  const shown = entered || reducedMotion || isVertical;
  const inhalt = INHALT[sprache];

  const enter = (delay: number, distance = 18) => ({
    opacity: shown ? 1 : 0,
    transform: shown ? "translateY(0)" : `translateY(${distance}px)`,
    transition: reducedMotion
      ? "none"
      : `opacity ${DURATION}ms ease-out ${delay}ms,` +
        ` transform ${DURATION}ms cubic-bezier(0.16,1,0.3,1) ${delay}ms`,
  });

  const titel = (
    <h2
      style={{
        margin: 0,
        fontFamily: serif,
        fontSize: "var(--tellian-s2-title-size)",
        fontWeight: 400,
        lineHeight: "var(--tellian-titel-lh)" as unknown as number,
        letterSpacing: "var(--tellian-titel-ls)",
        color: "var(--tellian-s2-ink)",
        /* «Geschäftsbeziehungen» misst bei 320px 314px und ragte
           aus dem Bild — anywhere bricht das Wort notfalls auch
           ohne Trennstelle. */
        hyphens: "auto",
        overflowWrap: "anywhere",
      }}
      lang={sprache === "EN" ? "en" : "de"}
    >
      {inhalt.titel[0]}
      <br />
      <em style={{ fontStyle: "italic", fontWeight: "inherit" }}>
        {inhalt.titel[1]}
      </em>
    </h2>
  );

  const absaetze = (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "var(--tellian-abstand-absatz)",
      }}
    >
      {inhalt.absaetze.map((text, i) => (
        <p
          key={i}
          style={{
            margin: 0,
            fontFamily: sans,
            fontSize: "var(--tellian-lauf-size)",
            lineHeight: "var(--tellian-lauf-lh)" as unknown as number,
            color: "var(--tellian-s2-dim)",
            maxWidth: "52ch",
          }}
        >
          {text}
        </p>
      ))}
    </div>
  );

  /* ── SCHMAL ──
     Titel, drei Absätze, dann die Grafik in voller Breite. */
  if (isVertical) {
    return (
      <section
        id="section-anlagephilosophie"
        style={{
          backgroundColor: "var(--tellian-s2-bg)",
          scrollMarginTop: "var(--tellian-kopf-height)",
        }}
      >
        <div
          style={{
            paddingTop: "var(--tellian-abschnitt-luft-schmal)",
            paddingBottom: "var(--tellian-abschnitt-luft-schmal)",
            paddingLeft: "var(--tellian-rand-schmal)",
            paddingRight: "var(--tellian-rand-schmal)",
            display: "flex",
            flexDirection: "column",
            gap: "var(--tellian-stapel-schmal)",
          }}
        >
          <Kapitelmarke nr="03" name="Wealth Management" />
          <Aufgang>{titel}</Aufgang>
          <Aufgang stufe={1}>{absaetze}</Aufgang>
          <Aufgang stufe={1}>
            <DreiecksBeziehung sprache={sprache} onMandat={onMandat} kompakt />
          </Aufgang>
        </div>
      </section>
    );
  }

  /* ── BREIT — 5/7, beide Gruppen vertikal zentriert (G1) ── */
  return (
    <div
      ref={panelRef}
      className="flex-shrink-0 h-screen relative"
      style={{ width: SECTION_WIDTH, backgroundColor: "var(--tellian-s2-bg)" }}
    >
      <div
        style={{
          position: "absolute",
          top: "var(--tellian-kopf-height)",
          bottom: "var(--tellian-station-height)",
          left: 0,
          right: 0,
          display: "grid",
          gridTemplateColumns: "5fr 7fr",
          alignItems: "center",
          columnGap: "clamp(48px, 6.7vw, 96px)",
          paddingLeft:
            "calc(var(--tellian-rail-width) + var(--tellian-station-pad-x))",
          paddingRight: "var(--tellian-station-pad-x)",
          paddingTop: "var(--tellian-s1-stage-pad)",
          paddingBottom: "var(--tellian-s1-stage-pad)",
          boxSizing: "border-box",
        }}
      >
        {/* ══ Textzone links ══ */}
        <div
          style={{
            minWidth: 0,
            display: "flex",
            flexDirection: "column",
            gap: "var(--tellian-abstand-titel)",
          }}
        >
          <div style={enter(STEP.title, 24)}>{titel}</div>
          <div style={enter(STEP.body)}>{absaetze}</div>
        </div>

        {/* ══ Grafik rechts — der visuelle Anker der Station.
            Die Höhe deckelt sie, damit sie auf flachen Fenstern
            nicht in die Bänder wächst: Breite = Höhe × (640/560). */}
        <div
          style={{
            minWidth: 0,
            display: "flex",
            justifyContent: "center",
            ...enter(STEP.grafik, 20),
          }}
        >
          <div
            style={{
              width: "100%",
              /* P1.6: Zielhöhe 70–80 % der Stationshöhe; P2.2:
                 0.87 (≈ 0.76 × 640/560) statt 0.91, damit unter der
                 fest reservierten Lesezone bei jeder Fenstergrösse
                 min. 48px Luft zur Stationsleiste bleiben. */
              maxWidth:
                "min(100%, calc((100vh - var(--tellian-kopf-height) - var(--tellian-station-height)) * 0.87))",
            }}
          >
            <DreiecksBeziehung sprache={sprache} onMandat={onMandat} />
          </div>
        </div>
      </div>
    </div>
  );
}
