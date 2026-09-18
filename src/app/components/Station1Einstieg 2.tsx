import { HeroEditorial } from "./HeroEditorial";
import type { ImageId } from "../../assets/generated";

/* ═══════════════════════════════════════════════════════════
   STATION 1 — EINSTIEG (Editorial A2)

   Seit dem A2-Umbau (07.09) ist die Station ein dünner Träger um
   die GETEILTE HeroEditorial-Komponente: 42/58-Zweispalter, Bild
   randlos an drei Kanten über die volle Stationshöhe, ON-IMAGE-
   Schicht der Bänder über dem Foto. Der Ausschnitt entsteht über
   object-fit/Fokuspunkt im Panel — der Beschnitt zum Panelformat
   ist Teil des Layouts, die Pipeline liefert das ganze Motiv. */

/* ── INHALTE, WÖRTLICH AUS DEM REDESIGN-BRIEFING ──
   Es gibt kein zentrales i18n-System: der DE/EN-Schalter in der
   Kopfzeile ist ein useState in App.tsx, den bisher kein Inhalt las.
   Diese Struktur hängt Station 1 an genau diesen Schalter. Wächst
   die Mehrsprachigkeit über den Hero hinaus, gehört sie in ein
   eigenes Modul — nicht in jede Station einzeln. */
interface HeroInhalt {
  /** Zwei Zeilen; die zweite steht kursiv, wie im bisherigen Satz. */
  titel: readonly [string, string];
  lead: readonly string[];
}

const INHALT: Readonly<Record<"DE" | "EN" | "FR", HeroInhalt>> = {
  DE: {
    titel: ["Weiterdenken", "mit Erfahrung"],
    lead: [
      "Tellian Capital AG begleitet Privatpersonen, Unternehmerfamilien und Stiftungen bei der langfristigen Entwicklung ihres Vermögens. Wir sind seit 1996 in Zürich verwurzelt, unabhängig und FINMA-lizenziert.",
      "Wir verbinden 30 Jahre fundierte Markterfahrung mit einer zukunftsorientierten Ausrichtung. Wir stehen für eine moderne und transparente Vermögensverwaltung, die Tradition und neue Impulse nahtlos miteinander vereint.",
    ],
  },
  EN: {
    titel: ["Looking Ahead.", "Built on Experience."],
    lead: [
      "Tellian Capital AG provides independent wealth management for private clients, entrepreneurial families and foundations. With deep roots in Zurich since 1996, we are an independent, FINMA-licensed asset manager.",
      "With 30 years of investment experience, we support our clients in preserving, developing and successfully positioning their wealth for the long term. Our approach combines proven investment principles with a forward-looking perspective on markets and opportunities. Personal service, transparency and sound decision-making are at the heart of everything we do.",
    ],
  },
  /* TODO-FR: Übersetzung folgt — bis dahin steht der DE-Text als
     Platzhalter, damit die Struktur den dritten Schlüssel schon
     trägt und beim Nachliefern nur Text getauscht wird. */
  FR: {
    titel: ["Weiterdenken", "mit Erfahrung"],
    lead: [
      "Tellian Capital AG begleitet Privatpersonen, Unternehmerfamilien und Stiftungen bei der langfristigen Entwicklung ihres Vermögens. Wir sind seit 1996 in Zürich verwurzelt, unabhängig und FINMA-lizenziert.",
      "Wir verbinden 30 Jahre fundierte Markterfahrung mit einer zukunftsorientierten Ausrichtung. Wir stehen für eine moderne und transparente Vermögensverwaltung, die Tradition und neue Impulse nahtlos miteinander vereint.",
    ],
  },
};

interface Props {
  panelRef?: (el: HTMLDivElement | null) => void;
  /** Schmaler Zweig: dieselben Bausteine, gestapelt. */
  isVertical?: boolean;
  /** Schmal: erst wenn der Ladebildschirm weg ist, läuft der
   *  Eintritt — sonst spielt er dahinter und ist vorbei. */
  bereit?: boolean;
  /** Sprache aus dem Schalter der Kopfzeile. */
  sprache?: "DE" | "EN";
  /**
   * Motiv für das Bildpanel. Fehlt es, bleibt die reservierte Fläche
   * stehen — die Station bleibt vollständig.
   */
  imageId?: ImageId;
  imageAlt?: string;
  /**
   * Schmaler Zweig: flacher Bandausschnitt desselben Motivs. Der
   * 4:5-Ausschnitt wäre über die volle Fensterbreite 488px hoch und
   * schöbe den Titel unter den Falz. Fehlt er, nimmt der schmale
   * Zweig das hohe Motiv.
   */
  bandImageId?: ImageId;
}

export function Station1Einstieg({
  panelRef,
  isVertical = false,
  bereit = true,
  sprache = "DE",
  imageId,
  imageAlt = "",
}: Props) {
  const inhalt = INHALT[sprache];

  /* Titelzeilen wie im Satz definiert: Umbruch nach der ersten,
     zweite kursiv. Gilt auch für EN («Looking Ahead.» / kursiv
     «Built on Experience.») — die Kursive trägt dort dieselbe
     Rollenverteilung wie im Deutschen; Entscheidung im
     Abschlussbericht ausgewiesen. */
  const titel = (
    <>
      {/* Zeile 1 bleibt ganz — «Looking Ahead.» misst bei 70px rund
          470px und darf in den 80px-Abstand laufen (gemessen ~41px),
          statt nach «Looking» zu brechen. */}
      <span className="tellian-hero-zeile1">{inhalt.titel[0]}</span>
      <br />
      {/* DE/FR: die Kursivzeile «mit Erfahrung» ist EINE Zeile
          (nowrap; Überlänge liefe in den 80px-Abstand, nie ins
          Bild — gemessen 53–101px Luft). EN: «Built on Experience.»
          ist dafür zu lang (liefe 120px+ ins Bild) — dort bricht
          die Kursivphrase natürlich um; die Kursive funktioniert
          über beide Zeilen und bleibt. Entscheidung im
          Abschlussbericht ausgewiesen. */}
      <em
        style={{
          fontStyle: "italic",
          fontWeight: "inherit",
          whiteSpace: sprache === "EN" ? undefined : "nowrap",
        }}
        className="tellian-hero-zeile2"
      >
        {inhalt.titel[1]}
      </em>
      {/* Der nowrap hält die Zeilen auf normalen Schirmen zusammen;
          bei sehr schmalen (320px) ist «mit Erfahrung» breiter als
          das Fenster und erzeugte einen waagrechten Überlauf —
          dort darf er brechen. */}
      <style>{`
        /* Basisregel: Zeile 1 bleibt zusammen (früher inline
           gesetzt — beim Umbau auf die Klasse ging sie verloren). */
        .tellian-hero-zeile1 { white-space: nowrap; }
        @media (max-width: 359px) {
          .tellian-hero-zeile1, .tellian-hero-zeile2 {
            white-space: normal !important;
          }
        }
      `}</style>
    </>
  );

  return (
    <HeroEditorial
      titel={titel}
      absaetze={inhalt.lead}
      zweispaltig
      imageId={imageId ?? "hero-tellian"}
      imageAlt={imageAlt}
      /* Fokus auf der Fassade des Opernhauses. */
      fokus="center 42%"
      lang={sprache === "EN" ? "en" : "de"}
      isVertical={isVertical}
      bereit={bereit}
      panelRef={panelRef}
      domId="section-hero"
    />
  );
}
