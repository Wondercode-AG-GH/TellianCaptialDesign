/* ═══════════════════════════════════════════════════════════
   SEITENDATEN FÜR SUCHMASCHINEN UND GETEILTE LINKS (18.09)

   Bis hierher trug die Seite EINEN Titel («Tellian Capital»),
   keine Beschreibung und keine Vorschaubilder: geteilte Links
   zeigten eine nackte Adresse, und `<html lang>` stand auf
   Englisch, obwohl die Seite deutsch spricht.

   Eine Einzelseiten-Anwendung hat keinen Serverdurchlauf, der das
   je Adresse ausliefern könnte — die Angaben werden deshalb beim
   Wechsel in den Kopf geschrieben. Der Grundbestand steht
   zusätzlich statisch in index.html, damit Dienste, die kein
   JavaScript ausführen (LinkedIn, WhatsApp, Mailvorschauen),
   wenigstens Titel, Beschreibung und Bild finden.

   UI-LABEL-REVIEW: Titel und Beschreibungen sind Vorschläge und
   brauchen die Freigabe von Tellian.
   ═══════════════════════════════════════════════════════════ */

/** Zielsdomäne. Bis sie verbunden ist, zeigt die Vorschau auf die
    Adresse, unter der die Seite später steht — geteilte Links
    sollen nicht auf eine Vorschauadresse verweisen. */
export const BASIS_URL = "https://telliancapital.ch";

/** Vorschaubild für geteilte Links (Hero, 1536px, absolut). */
export const VORSCHAU_BILD = `${BASIS_URL}/img/hero-tellian/hero-tellian-1536.jpg`;

export interface SeitenDaten {
  titel: string;
  beschreibung: string;
}

type Sprache = "DE" | "EN" | "FR";

const MARKE = "Tellian Capital AG";

/* Je Adresse ein eigener Titel — der Titel ist das stärkste
   einzelne Rangmerkmal und zugleich die Zeile, die im Suchergebnis
   angeklickt wird. Aufbau: Inhalt der Seite, dann die Marke. */
const SEITEN: Readonly<Record<string, Readonly<Record<Sprache, SeitenDaten>>>> = {
  "/": {
    DE: {
      titel: `Unabhängige Vermögensverwaltung in Zürich | ${MARKE}`,
      beschreibung:
        "Tellian Capital AG begleitet Privatpersonen, Unternehmerfamilien und Stiftungen bei der langfristigen Entwicklung ihres Vermögens. Unabhängig, FINMA-lizenziert und seit 1996 in Zürich verwurzelt.",
    },
    EN: {
      titel: `Independent Wealth Management in Zurich | ${MARKE}`,
      beschreibung:
        "Tellian Capital AG provides independent wealth management for private clients, entrepreneurial families and foundations. FINMA-licensed, with deep roots in Zurich since 1996.",
    },
    FR: {
      titel: `Unabhängige Vermögensverwaltung in Zürich | ${MARKE}`,
      beschreibung:
        "Tellian Capital AG begleitet Privatpersonen, Unternehmerfamilien und Stiftungen bei der langfristigen Entwicklung ihres Vermögens. Unabhängig, FINMA-lizenziert und seit 1996 in Zürich verwurzelt.",
    },
  },
  "/mandat": {
    DE: {
      titel: `Vermögensverwaltungsmandat | ${MARKE}`,
      beschreibung:
        "Mit einem Mandat übertragen Sie uns die Verwaltung Ihres Portfolios innerhalb der gemeinsam definierten Anlagestrategie. Ihr Vermögen bleibt auf Ihrem eigenen Depot.",
    },
    EN: {
      titel: `Discretionary Mandate | ${MARKE}`,
      beschreibung:
        "With a discretionary mandate you entrust us with the management of your portfolio within the strategy we define together. Your assets remain in your own custody account.",
    },
    FR: {
      titel: `Vermögensverwaltungsmandat | ${MARKE}`,
      beschreibung:
        "Mit einem Mandat übertragen Sie uns die Verwaltung Ihres Portfolios innerhalb der gemeinsam definierten Anlagestrategie.",
    },
  },
  "/advisory": {
    DE: {
      titel: `Advisory — Beratung mit eigener Entscheidung | ${MARKE}`,
      beschreibung:
        "Wir analysieren Ihr Portfolio, ordnen das Marktumfeld ein und beraten Sie — die Anlageentscheide treffen Sie selbst.",
    },
    EN: {
      titel: `Advisory — advice, your decision | ${MARKE}`,
      beschreibung:
        "We analyse your portfolio, assess the market environment and advise you — while you make the investment decisions yourself.",
    },
    FR: {
      titel: `Advisory | ${MARKE}`,
      beschreibung:
        "Wir analysieren Ihr Portfolio, ordnen das Marktumfeld ein und beraten Sie — die Anlageentscheide treffen Sie selbst.",
    },
  },
  "/vermoegensverwaltung": {
    DE: {
      titel: `Vermögensverwaltung | ${MARKE}`,
      beschreibung:
        "Unabhängiges Portfoliomanagement ohne Interessenkonflikte: hauseigene Investmentexpertise, internationales Netzwerk und Anlagestrategien, abgestimmt auf Ihre Ziele.",
    },
    EN: {
      titel: `Wealth Management | ${MARKE}`,
      beschreibung:
        "Independent portfolio management free from conflicts of interest: in-house expertise, an international network and strategies aligned with your objectives.",
    },
    FR: {
      titel: `Vermögensverwaltung | ${MARKE}`,
      beschreibung:
        "Unabhängiges Portfoliomanagement ohne Interessenkonflikte, abgestimmt auf Ihre Ziele.",
    },
  },
  "/anlagestrategien": {
    DE: {
      titel: `Anlagestrategien | ${MARKE}`,
      beschreibung:
        "Zwei Perspektiven, ein Portfolio: wie wir Anlagestrategien aufbauen, gewichten und laufend an Ihr Risikoprofil anpassen.",
    },
    EN: {
      titel: `Investment Strategies | ${MARKE}`,
      beschreibung:
        "Two perspectives, one portfolio: how we build, weight and continuously adjust investment strategies to your risk profile.",
    },
    FR: {
      titel: `Anlagestrategien | ${MARKE}`,
      beschreibung:
        "Zwei Perspektiven, ein Portfolio: wie wir Anlagestrategien aufbauen und laufend anpassen.",
    },
  },
  "/portfolio-management": {
    DE: {
      titel: `Portfolio Management — unser Anlageprozess | ${MARKE}`,
      beschreibung:
        "Wie wir Ihr Portfolio führen: Ziele, Risikoprofil, Selektion, Allokation und laufende Überwachung in einem nachvollziehbaren Prozess.",
    },
    EN: {
      titel: `Portfolio Management — our investment process | ${MARKE}`,
      beschreibung:
        "How we manage your portfolio: objectives, risk profile, selection, allocation and continuous monitoring in a transparent process.",
    },
    FR: {
      titel: `Portfolio Management | ${MARKE}`,
      beschreibung:
        "Wie wir Ihr Portfolio führen — von den Zielen bis zur laufenden Überwachung.",
    },
  },
  "/solutions": {
    DE: {
      titel: "Investmentlösungen für Finanzintermediäre | Tellian Capital Solutions",
      beschreibung:
        "Tellian Capital Solutions bietet Privatbanken, Family Offices und unabhängigen Vermögensverwaltern in der Schweiz Zugang zu Anlagelösungen über Aktien, Rohstoffe, Zinsen, Kredit, Währungen und Fonds.",
    },
    EN: {
      titel: "Investment solutions for financial intermediaries | Tellian Capital Solutions",
      beschreibung:
        "Tellian Capital Solutions gives private banks, family offices and independent asset managers in Switzerland access to investment solutions across equities, commodities, rates, credit, FX and funds.",
    },
    FR: {
      titel: "Solutions d’investissement pour intermédiaires financiers | Tellian Capital Solutions",
      beschreibung:
        "Tellian Capital Solutions propose aux banques privées, family offices et gérants de fortune indépendants en Suisse des solutions d’investissement sur les actions, les matières premières, les taux, le crédit, le change et les fonds.",
    },
  },
};

/* Rechtsseiten: eigener Titel, aber bewusst ohne Beschreibung —
   sie sollen nicht als Einstieg ranken.

   ACHTUNG: /impressum und /faq sind im Fussband verlinkt, es gibt
   sie aber NICHT — die Adresse wechselt, und es öffnet sich nichts
   (gemessen 18.09). Nur /datenschutz und /kundeninformation sind
   umgesetzt (LEGAL_PATHS). Die Titel hier stehen bereit, sobald die
   Seiten da sind; in der Sitemap sind sie bewusst nicht gelistet. */
const RECHTSSEITEN: Readonly<Record<string, string>> = {
  "/impressum": "Impressum",
  "/datenschutz": "Datenschutz",
  "/kundeninformation": "Kundeninformation",
  "/faq": "Häufige Fragen",
};

export function seitenDaten(pfad: string, sprache: string): SeitenDaten {
  const spr: Sprache =
    sprache === "EN" || sprache === "FR" ? (sprache as Sprache) : "DE";
  const rechts = RECHTSSEITEN[pfad];
  if (rechts) {
    return { titel: `${rechts} | ${MARKE}`, beschreibung: "" };
  }
  const eintrag = SEITEN[pfad] ?? SEITEN["/"];
  return eintrag[spr];
}

/** Sprachkennung für `<html lang>` und `og:locale`. */
export function sprachKennung(sprache: string): { lang: string; locale: string } {
  if (sprache === "EN") return { lang: "en", locale: "en_GB" };
  if (sprache === "FR") return { lang: "fr", locale: "fr_CH" };
  return { lang: "de", locale: "de_CH" };
}
