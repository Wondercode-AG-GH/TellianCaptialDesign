/* ═══════════════════════════════════════════════════════════
   TELLIAN CAPITAL SOLUTIONS — Localized content.
   Structured as { de, en, fr } per field to match a future
   Sanity localeString/localeText pattern. Components read
   field[lang] where lang comes from LanguageContext.
   ═══════════════════════════════════════════════════════════ */

export type Locale = "de" | "en" | "fr";
export type LocaleString = Record<Locale, string>;

export interface SolutionsContent {
  hero: {
    tagline: LocaleString;
    /** Tagline split into controlled line breaks (one sentence per line) */
    taglineLines: Record<Locale, string[]>;
    leadSentence: LocaleString;
    closingLine: LocaleString;
    /** Prototyp: Hero rendert tagline + leadSentence + closingLine.
        Volltext hier vorgehalten für späteren Gebrauch/Umschalten. */
    fullParagraphs: LocaleString[];
  };
  services: {
    eyebrow: LocaleString;
    headline: LocaleString;
    intro: LocaleString;
    columns: { title: LocaleString; body: LocaleString }[];
  };
  team: {
    eyebrow: LocaleString;
    headline: LocaleString;
    /* TEAM: Platzhalter — finale Auswahl pending */
    members: { name: string; role: LocaleString; photo: string }[];
  };
  contact: {
    eyebrow: LocaleString;
    headline: LocaleString;
    intro: LocaleString;
    hours: LocaleString;
    formEyebrow: LocaleString;
    submitLabel: LocaleString;
    responseHint: LocaleString;
    privacyNotice: LocaleString;
    mapLink: LocaleString;
    thankYou: LocaleString;
    thankYouSub: LocaleString;
    fieldLabels: {
      firstName: LocaleString;
      lastName: LocaleString;
      email: LocaleString;
      phone: LocaleString;
      message: LocaleString;
    };
    /* KONTAKT: gespiegelt von Hauptseite (Section6Kontakt.tsx) — bitte gegenprüfen */
    phone: string;
    emailAddr: string;
    /* PENDING: Firmenname auf Solutions — mit Tellian bestätigen, ob volle
       AG-Bezeichnung hier korrekt ist trotz Solutions-Wordmark. */
    companyName: string;
    companySubtitle: string;
    addressLine: LocaleString;
  };
}

export const CONTENT: SolutionsContent = {
  hero: {
    tagline: {
      de: "Die richtige Gelegenheit. Der richtige Emittent. Der richtige Zeitpunkt.",
      en: "The right opportunity. The right issuer. The right timing.",
      fr: "La bonne opportunité. Le bon émetteur. Le bon moment.",
    },
    taglineLines: {
      de: ["Die richtige Gelegenheit.", "Der richtige Emittent.", "Der richtige Zeitpunkt."],
      en: ["The right opportunity.", "The right issuer.", "The right timing."],
      fr: ["La bonne opportunité.", "Le bon émetteur.", "Le bon moment."],
    },
    leadSentence: {
      de: "Unabhängig aus Prinzip, verschaffen wir Zugang zu Anlagelösungen auf Aktien, Zinsen, Credit, Währungen, Rohstoffe und Fonds.",
      en: "Independent by design, we provide access to investment solutions on equities, rates, credit, FX, commodities and mutual funds.",
      fr: "Indépendants par principe, nous donnons accès à des solutions d'investissement sur les actions, les taux, le crédit, les devises, les matières premières et les fonds.",
    },
    closingLine: {
      de: "Wir beschaffen Gelegenheiten, keine Produkte.",
      en: "We source opportunities, not products.",
      fr: "Nous recherchons des opportunités, pas des produits.",
    },
    fullParagraphs: [],
  },

  services: {
    eyebrow: {
      de: "Dienstleistungen",
      en: "Services",
      fr: "Services",
    },
    headline: {
      de: "Was wir tun.",
      en: "What we do.",
      fr: "Ce que nous faisons.",
    },
    intro: {
      de: "Tellian Capital Solutions beschafft Anlagelösungen über alle Anlageklassen: Aktien, Zinsen, Credit, Währungen, Rohstoffe und Fonds. Wir sind unabhängig und stellen keine eigenen Produkte her. Über ein globales Netzwerk von Investmentbanken vergleichen wir die Angebote verschiedener Emittenten und wählen allein nach den Zielen unserer Kunden aus.",
      en: "Tellian Capital Solutions sources investment solutions across all asset classes: equities, rates, credit, currencies, commodities and funds. We are independent and do not manufacture our own products. Through a global network of investment banks, we compare the offerings of different issuers and select solely according to our clients' objectives.",
      fr: "Tellian Capital Solutions recherche des solutions d'investissement sur toutes les classes d'actifs : actions, taux, crédit, devises, matières premières et fonds. Nous sommes indépendants et ne produisons pas nos propres produits. Grâce à un réseau mondial de banques d'investissement, nous comparons les offres de différents émetteurs et sélectionnons uniquement en fonction des objectifs de nos clients.",
    },
    columns: [
      {
        title: { de: "Beratung", en: "Advisory", fr: "Conseil" },
        body: {
          de: "Wir analysieren die Anlageziele und die Marktsituation und bestimmen die passende Struktur, den passenden Emittenten und den passenden Zeitpunkt. Jede Lösung entsteht aus der Anlagesicht des Kunden, nicht aus einem vorgegebenen Produktkatalog.",
          en: "We analyse the investment objectives and the market situation and determine the right structure, the right issuer and the right timing. Every solution stems from the client's investment view, not from a predefined product catalogue.",
          fr: "Nous analysons les objectifs d'investissement et la situation de marché, puis déterminons la structure, l'émetteur et le moment appropriés. Chaque solution découle de la vue d'investissement du client, et non d'un catalogue de produits prédéfini.",
        },
      },
      {
        title: { de: "Best Execution", en: "Best Execution", fr: "Best Execution" },
        body: {
          de: "Für jede Lösung holen wir Angebote mehrerer Emittenten ein und vergleichen Struktur, Preis und Ausführung. Weil wir keine eigenen Produkte vertreiben, ist die Auswahl frei von Interessenkonflikten und richtet sich nach den besten am Markt verfügbaren Konditionen.",
          en: "For every solution, we obtain quotes from several issuers and compare structure, price and execution. Because we do not distribute our own products, the selection is free from conflicts of interest and follows the best conditions available on the market.",
          fr: "Pour chaque solution, nous sollicitons les offres de plusieurs émetteurs et comparons la structure, le prix et l'exécution. Comme nous ne distribuons pas nos propres produits, la sélection est exempte de conflits d'intérêts et repose sur les meilleures conditions disponibles sur le marché.",
        },
      },
      {
        title: { de: "Lifecycle Management", en: "Lifecycle Management", fr: "Lifecycle Management" },
        body: {
          de: "Wir begleiten jede Lösung über ihre gesamte Laufzeit. Verändern sich die Marktbedingungen oder die Aufnahmebereitschaft der Emittenten, prüfen wir laufend, welche Strukturen, Preise und Ausführungswege der Anlagesicht und den Portfoliozielen am besten entsprechen.",
          en: "We accompany every solution throughout its entire life cycle. As market conditions or issuers' appetite change, we continuously assess which structures, prices and execution routes best match the investment view and the portfolio objectives.",
          fr: "Nous accompagnons chaque solution tout au long de sa durée de vie. Lorsque les conditions de marché ou l'appétit des émetteurs évoluent, nous évaluons en continu les structures, les prix et les modalités d'exécution qui correspondent le mieux à la vue d'investissement et aux objectifs de portefeuille.",
        },
      },
    ],
  },

  team: {
    eyebrow: { de: "Team", en: "Team", fr: "Équipe" },
    headline: { de: "Wer dahinter steht.", en: "Who's behind it.", fr: "Qui est derrière." },
    /* TEAM: Platzhalter — finale Auswahl pending */
    members: [
      {
        name: "Dr. Thomas Keller",
        role: {
          de: "Geschäftsleitung & Gründer",
          en: "Managing Director & Founder",
          fr: "Direction générale & fondateur",
        },
        photo: "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=800&q=80",
      },
      {
        name: "Claudia Meier",
        role: {
          de: "Chef Anlagestrategie",
          en: "Chief Investment Strategist",
          fr: "Responsable stratégie d'investissement",
        },
        photo: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=800&q=80",
      },
    ],
  },

  contact: {
    eyebrow: { de: "Kontakt", en: "Contact", fr: "Contact" },
    headline: { de: "Sprechen wir.", en: "Let's talk.", fr: "Parlons-en." },
    intro: {
      de: "Ein erstes Gespräch ist unverbindlich. Persönlich an der Löwenstrasse, oder digital.",
      en: "A first meeting is non-binding. In person at Löwenstrasse, or digitally.",
      fr: "Un premier entretien est sans engagement. En personne à la Löwenstrasse, ou en ligne.", /* FR: pending — Vorschlag, bitte gegenprüfen */
    },
    hours: {
      de: "Montag bis Freitag, 8 bis 18 Uhr",
      en: "Monday to Friday, 8 am to 6 pm",
      fr: "Lundi au vendredi, 8h à 18h", /* FR: pending */
    },
    formEyebrow: {
      de: "Schreiben Sie uns",
      en: "Write to us",
      fr: "Écrivez-nous", /* FR: pending */
    },
    submitLabel: { de: "Anfrage senden", en: "Send enquiry", fr: "Envoyer" },
    responseHint: {
      de: "Antwort innert 24h",
      en: "Response within 24h",
      fr: "Réponse sous 24h", /* FR: pending */
    },
    privacyNotice: {
      de: "Mit dem Absenden stimmen Sie unseren Datenschutzbestimmungen zu.",
      en: "By submitting you agree to our privacy policy.",
      fr: "En soumettant, vous acceptez notre politique de confidentialité.", /* FR: pending */
    },
    mapLink: {
      de: "Auf Karte anzeigen",
      en: "Show on map",
      fr: "Afficher sur la carte", /* FR: pending */
    },
    /* Gespiegelt von Hauptseite Section6Kontakt.tsx Zeilen 371-376 */
    thankYou: {
      de: "Vielen Dank.",
      en: "Thank you.",
      fr: "Merci.", /* FR: pending */
    },
    thankYouSub: {
      de: "Wir melden uns innert 24 Stunden.",
      en: "We will get back to you within 24 hours.",
      fr: "Nous vous répondrons dans les 24 heures.", /* FR: pending */
    },
    fieldLabels: {
      firstName: { de: "Vorname", en: "First name", fr: "Prénom" },
      lastName: { de: "Nachname", en: "Last name", fr: "Nom" },
      email: { de: "E-Mail", en: "Email", fr: "E-mail" },
      phone: { de: "Telefon", en: "Phone", fr: "Téléphone" },
      message: { de: "Nachricht", en: "Message", fr: "Message" },
    },
    /* KONTAKT: gespiegelt von Hauptseite (Section6Kontakt.tsx) — bitte gegenprüfen */
    phone: "+41 44 224 40 24",
    emailAddr: "info@telliancapital.ch",
    /* PENDING: Firmenname auf Solutions — mit Tellian bestätigen, ob volle
       AG-Bezeichnung hier korrekt ist trotz Solutions-Wordmark. */
    companyName: "Tellian Capital",
    companySubtitle: "Vermögensverwaltung Zürich AG (vormals Dr. Blumer & Partner)",
    addressLine: {
      de: "Löwenstrasse 1, CH-8001 Zürich",
      en: "Löwenstrasse 1, CH-8001 Zurich",
      fr: "Löwenstrasse 1, CH-8001 Zurich",
    },
  },
};
