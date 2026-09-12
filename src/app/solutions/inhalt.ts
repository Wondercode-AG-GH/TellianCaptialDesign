import type { SectionDef } from "../sections";

/* ═══════════════════════════════════════════════════════════
   TELLIAN CAPITAL SOLUTIONS — Inhalt (Namespace «solutions»)

   Alle Texte VERBATIM aus dem Briefing vom 06.09; Solutions ist
   vollständig dreisprachig dokumentiert — FR sind ECHTE Texte,
   keine Platzhalter. Der Sprachtoggle bleibt trotzdem DE/EN,
   bis die Hauptseite FR-komplett ist.

   Zwei Quell-Inkonsistenzen sind BEWUSST übernommen (Briefing:
   nicht «korrigieren»):
   — DE sagt «CLNs», wo EN «credit» und FR «le crédit» sagt.
   — Credo-Reihenfolge: EN Opportunity→Timing→Issuer,
     DE/FR Opportunität→Emittent→Timing.
   ═══════════════════════════════════════════════════════════ */

export type SolutionsSprache = "DE" | "EN" | "FR";

interface Schritt {
  titel: string;
  zeile: string;
}

interface SolutionsInhalt {
  einstieg: {
    eyebrow: string;
    titel: string;
    text: string;
  };
  wasWirTun: {
    kicker: string;
    statement: string;
    absatz: string;
    credo: string;
  };
  vorgehen: {
    schritte: readonly Schritt[];
  };
}

export const SOLUTIONS_INHALT: Readonly<Record<SolutionsSprache, SolutionsInhalt>> = {
  DE: {
    einstieg: {
      eyebrow: "Tellian Capital Solutions",
      titel: "Wir denken in Chancen, nicht Produkte.",
      text: "Als unabhängiger Partner bieten wir Schweizer Privatbanken, Family Offices und unabhängigen Vermögensverwaltern Zugang zu Investmentlösungen in den Bereichen Aktien, Rohstoffe, Zinsen, CLNs, Devisen und Fonds.",
    },
    wasWirTun: {
      kicker: "Was wir tun.",
      statement: "Kein Emittent ist in allem und zu jeder Zeit der Beste.",
      absatz:
        "Der Appetit verschiebt sich, Handelsbücher rotieren, und taktische Opportunitäten können überall am Markt entstehen. Über ein globales Netzwerk von Investmentbanken verfolgt Tellian Capital Solutions diese ständige Bewegung und eröffnet ihren Kunden den Zugang.",
      credo: "Die richtige Opportunität. Der richtige Emittent. Das richtige Timing.",
    },
    vorgehen: {
      schritte: [
        {
          titel: "Konzeption",
          zeile:
            "Wir gehen von der Anlagesicht des Kunden und der Marktlage aus und bestimmen daraus die richtige Umsetzung. Nichts kommt von der Stange.",
        },
        {
          titel: "Beschaffung",
          zeile:
            "Für jede Lösung sprechen wir jene Investmentbanken an, deren Expertise und aktuelle Positionierung zum Mandat passen, und vergeben die Struktur an das Haus, das sie am besten umsetzen kann.",
        },
        {
          titel: "Begleitung",
          zeile:
            "Eine Anlagelösung endet nicht mit der Emission. Wir verfolgen Strukturen, Preise und Ausführungswege bis zur Fälligkeit und beurteilen sie neu, wenn sich Bedingungen und Appetit verändern.",
        },
      ],
    },
  },
  EN: {
    einstieg: {
      eyebrow: "Tellian Capital Solutions",
      titel: "We source opportunities, not products.",
      text: "Independent by design, we provide Swiss Private Banks, Family Offices and Independent Asset Managers with investment solutions across equities, commodities, rates, credit, FX and funds.",
    },
    wasWirTun: {
      kicker: "What we do.",
      statement: "No issuer is best at everything, all the time.",
      absatz:
        "Appetites shift, trading books rotate and tactical opportunities might surface anywhere across the market. Through a global network of investment banks, Tellian Capital Solutions tracks that constant motion and gives its clients a way in.",
      credo: "The right opportunity. The right timing. The right issuer.",
    },
    vorgehen: {
      schritte: [
        {
          titel: "Design",
          zeile:
            "We start from the client's investment view and the state of the market, then determine the right implementation. Nothing is taken off the shelf.",
        },
        {
          titel: "Sourcing",
          zeile:
            "For every solution, we approach the investment banks whose expertise and current positioning fit the mandate and match the structure to the house best placed to deliver it.",
        },
        {
          titel: "Monitoring",
          zeile:
            "An investment solution does not end at issuance. We follow structures, prices and execution routes through to maturity, and reassess as conditions and appetites change.",
        },
      ],
    },
  },
  /* Apostrophe der Quelle (gerade ' und ´) typografisch als ’
     gesetzt — Wortlaut unverändert (Briefing 07.09). Quelltreu
     bleibt auch «correspondant» in Schritt 02: QUELLE-FR-GRAMMATIK,
     nicht korrigieren. */
  FR: {
    einstieg: {
      eyebrow: "Tellian Capital Solutions",
      titel: "Nous sourçons des opportunités, pas des produits.",
      text: "Indépendants par nature, nous proposons aux banques privées, family offices et gérants de fortune indépendants en Suisse des solutions d’investissement sur les actions, les matières premières, les taux, le crédit, le change et les fonds.",
    },
    wasWirTun: {
      kicker: "Ce que nous faisons.",
      statement: "Aucun emetteur n’est le meilleur en tout, en permanence.",
      absatz:
        "Les appétits évoluent, les books de trading tournent et des opportunités tactiques peuvent apparaître partout sur le marché. À travers un réseau mondial de banques d’investissement, Tellian Capital Solutions suit ce mouvement permanent et en ouvre la porte à ses clients.",
      credo: "La bonne opportunité. Le bon émetteur. Le bon timing.",
    },
    vorgehen: {
      schritte: [
        {
          titel: "Conception",
          zeile:
            "Nous partons de la vision d’investissement du client et de l’état du marché, puis déterminons la mise en œuvre appropriée. Rien ne sort d’un catalogue.",
        },
        {
          titel: "Sourcing",
          zeile:
            "Pour chaque solution, nous sollicitons les banques d’investissement dont l’expertise et le positionnement du moment correspondant au mandat, et confions la structure à la banque la mieux placée pour la délivrer.",
        },
        {
          titel: "Suivi",
          zeile:
            "Une solution d’investissement ne s’arrête pas à l’émission. Nous suivons les structures, les prix et les canaux d’exécution jusqu’à l’échéance, et réévaluons à mesure que les conditions et les appétits évoluent.",
        },
      ],
    },
  },
};

/* UI-LABEL-REVIEW: Microcopy der Stationsleiste — zur Freigabe
   markiert (Briefing 06.09). Korrektur 06.09: «Was wir tun» und
   «Vorgehen» sind EINE Station — die Leiste führt drei Einträge,
   der Weg steht innerhalb der Station. */
export const SOLUTIONS_LEISTE: Readonly<
  Record<SolutionsSprache, readonly [string, string, string, string]>
> = {
  DE: ["Einstieg", "Was wir tun", "Team", "Kontakt"],
  EN: ["Introduction", "What we do", "Team", "Contact"],
  FR: ["Introduction", "Ce que nous faisons", "Team", "Contact"],
};

/* Referenzstabile Registry für die Scroll-Engine und die Band-
   Hooks — Beschriftungen dort sind die DE-Fassung; die Leiste und
   das mobile Menü erhalten die sprachaufgelöste Liste unten. */
export const SOLUTIONS_SEKTIONEN: readonly SectionDef[] = [
  {
    key: "einstieg",
    label: "Einstieg",
    labelKurz: "Einstieg",
    dunkel: false,
    domId: "solutions-einstieg",
    imageIds: ["hero-solutions"],
  },
  {
    key: "was-wir-tun",
    label: "Was wir tun",
    labelKurz: "Was wir tun",
    dunkel: true,
    domId: "solutions-was-wir-tun",
    imageIds: [],
  },
  {
    /* Team (Olivier, Thibaut) — helle Station wie auf der
       Hauptseite; der Rhythmus läuft wieder hell·dunkel·hell·dunkel. */
    key: "team",
    label: "Team",
    labelKurz: "Team",
    dunkel: false,
    domId: "solutions-team",
    imageIds: ["olivier-bill"],
  },
  {
    key: "kontakt",
    label: "Kontakt",
    labelKurz: "Kontakt",
    dunkel: true,
    domId: "solutions-kontakt",
    imageIds: [],
  },
];

/** Sprachaufgelöste Liste für Stationsleiste und mobiles Menü. */
export function solutionsLeisteSektionen(sprache: SolutionsSprache): readonly SectionDef[] {
  const labels = SOLUTIONS_LEISTE[sprache];
  return SOLUTIONS_SEKTIONEN.map((s, i) => ({
    ...s,
    label: labels[i],
    labelKurz: labels[i],
  }));
}
