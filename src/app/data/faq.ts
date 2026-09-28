/* ═══════════════════════════════════════════════════════════
   HÄUFIGE FRAGEN — Inhalte (Lieferung 28.09)

   Acht Fragen, deutsch und englisch wörtlich geliefert. Sie ersetzen
   die zehn Fragen der Lieferung vom 18.09 vollständig.

   MITENTFALLEN sind damit deren offene Punkte: die Kostensätze, die
   Mindestanlage, die Namen von Aufsichtsorganisation und
   Ombudsstelle sowie die Frage nach namentlich genannten
   Depotbanken. Sie standen hier als TODO, weil sie ohne Freigabe
   nicht auf die Seite durften — die neue Lieferung stellt diese
   Fragen nicht mehr.

   Die Struktur der Antworten bleibt: erster Satz beantwortet die
   Frage, danach folgt die Begründung. Das ist die Form, die Such-
   und Antwortmaschinen aufgreifen, und sie trägt das FAQPage-Schema.

   Die Felder schritte und schluss bleiben in der Schnittstelle,
   werden aber von keiner der acht Antworten gebraucht; die
   Lieferung vom 18.09 hatte eine Abfolge darin.
   ═══════════════════════════════════════════════════════════ */

export interface FaqEintrag {
  frage: string;
  /** Absätze der Antwort. */
  absaetze: readonly string[];
  /** Nummerierte Schritte, falls die Antwort eine Abfolge zeigt. */
  schritte?: readonly string[];
  /** Absatz nach den Schritten. */
  schluss?: string;
}

export const FAQ: Readonly<Record<"DE" | "EN", readonly FaqEintrag[]>> = {
  DE: [
    {
      frage:
        "Was ist ein unabhängiger Vermögensverwalter und worin unterscheidet er sich von einer Bank?",
      absaetze: [
        "Ihr Vermögen bleibt auf Ihrem eigenen Konto und Depot bei einer ausgewählten Depotbank. Wir verwalten Ihr Portfolio, ohne dass Ihr Vermögen an uns übertragen wird. Dabei handeln wir vollkommen unabhängig und frei von Interessenkonflikten. Unsere Anlageentscheidungen richten sich konsequent an Ihren Zielen und Interessen aus. Die Bank verwahrt Ihr Vermögen, wir verwalten es.",
      ],
    },
    {
      frage:
        "Wie sicher ist mein Vermögen bei einer Schweizer Vermögensverwaltung?",
      absaetze: [
        "Ihr Vermögen wird nicht an uns übertragen, sondern bleibt auf Ihrem Konto und Depot bei der jeweiligen Depotbank. Wertschriften im Kundendepot bleiben Ihr Eigentum; für Bankguthaben gelten die jeweiligen gesetzlichen Sicherungssysteme.",
      ],
    },
    {
      frage: "Wer beaufsichtigt Tellian Capital?",
      absaetze: [
        "Wir sind ein von der FINMA (Eidgenössische Finanzmarktaufsicht) bewilligter Schweizer Vermögensverwalter.",
      ],
    },
    {
      frage:
        "Wie werde ich über die Entwicklung meines Vermögens informiert?",
      absaetze: [
        "Sie haben jederzeit Zugriff auf Ihr Vermögen – über das Online-Banking Ihrer Depotbank, Ihren persönlichen Kundenberater sowie unsere personalisierte App. Zusätzlich erhalten Sie quartalsweise einen Bericht über die Entwicklung Ihres Portfolios sowie auf Wunsch individuelle oder konsolidierte Auswertungen.",
      ],
    },
    {
      frage:
        "Kann mein Vermögen auf mehrere Banken oder Standorte verteilt werden?",
      absaetze: [
        "Ja. Bei Bedarf kann Ihr Vermögen auf mehrere Depotbanken oder Standorte verteilt werden. Wir arbeiten mit ausgewählten Banken in der Schweiz und in Liechtenstein zusammen und können Ihre Vermögenswerte bankübergreifend koordinieren.",
      ],
    },
    {
      frage:
        "Kann ich jederzeit auf mein Vermögen zugreifen oder die Zusammenarbeit beenden?",
      absaetze: [
        "Ja. Ihr Konto und Depot bleiben auf Ihren Namen geführt und Sie behalten die Verfügung über Ihr Vermögen. Bei uns bestehen keine Kündigungsfristen für das Vermögensverwaltungsmandat.",
      ],
    },
    {
      frage:
        "Kann ich mit Wohnsitz ausserhalb der Schweiz ein Konto in der Schweiz eröffnen?",
      absaetze: [
        "Ja. Wir betreuen auch internationale Kunden mit Wohnsitz im Ausland. Welche Möglichkeiten bestehen, hängt insbesondere von Ihrem Wohnsitzland, Ihrer persönlichen Situation und dem Anlagevermögen ab.",
      ],
    },
    {
      frage:
        "Warum entscheiden sich internationale Kunden für eine Vermögensverwaltung in der Schweiz?",
      absaetze: [
        "Die Schweiz zählt zu den weltweit führenden Standorten für internationale Vermögensverwaltung. Rechtssicherheit, politische und wirtschaftliche Stabilität sowie der Schweizer Franken als eine der solidesten und historisch wertstabilsten Währungen der Welt machen den Finanzplatz besonders attraktiv.",
      ],
    },
  ],
  EN: [
    {
      frage:
        "What is an independent wealth manager, and how does it differ from a bank?",
      absaetze: [
        "Your wealth remains in your own account and custody account with a selected custodian bank. We manage your portfolio without your assets ever being transferred to us. We act with complete independence and free from conflicts of interest, with every investment decision guided by your objectives and interests. The bank safeguards your assets; we manage them.",
      ],
    },
    {
      frage: "How secure are my assets with a Swiss wealth manager?",
      absaetze: [
        "Your assets are never transferred to us. They remain in your account and custody account with the respective custodian bank. Securities held in your custody account remain your property, while cash deposits are subject to the applicable statutory deposit protection arrangements.",
      ],
    },
    {
      frage: "Who regulates Tellian Capital?",
      absaetze: [
        "Tellian Capital is a Swiss wealth manager licensed by the Swiss Financial Market Supervisory Authority (FINMA).",
      ],
    },
    {
      frage:
        "How will I be kept informed about the performance of my wealth?",
      absaetze: [
        "You have access to your assets at all times through your custodian bank’s online banking, your personal relationship manager and our dedicated app. In addition, you receive a quarterly report on the development of your portfolio, as well as individual or consolidated reporting upon request.",
      ],
    },
    {
      frage: "Can my assets be held across several banks or locations?",
      absaetze: [
        "Yes. Where appropriate, your assets can be held with several custodian banks or across different locations. We work with selected banks in Switzerland and Liechtenstein and can coordinate your assets across multiple banking relationships.",
      ],
    },
    {
      frage: "Can I access my assets or end the relationship at any time?",
      absaetze: [
        "Yes. Your account and custody account remain under your control at all times, giving you continued access to your assets. Our discretionary wealth management mandates are not subject to notice periods.",
      ],
    },
    {
      frage: "Can I open a Swiss bank account if I live outside Switzerland?",
      absaetze: [
        "Yes. We also serve international clients residing outside Switzerland. The options available depend primarily on your country of residence, your individual circumstances and the amount of assets to be invested.",
      ],
    },
    {
      frage:
        "Why do international clients choose Switzerland for wealth management?",
      absaetze: [
        "Switzerland is one of the world’s leading centres for international wealth management. Its strong legal framework, political and economic stability, and the Swiss franc’s longstanding reputation as a stable and resilient currency contribute to the enduring appeal of the Swiss financial centre.",
      ],
    },
  ],
};

/** Fliesstext einer Antwort — für das FAQPage-Schema, das nur
    einen Text je Frage kennt. */
export function antwortText(e: FaqEintrag): string {
  const teile = [...e.absaetze];
  if (e.schritte) teile.push(e.schritte.map((s, i) => `${i + 1}. ${s}`).join(" "));
  if (e.schluss) teile.push(e.schluss);
  return teile.join(" ");
}
