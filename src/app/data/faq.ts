/* ═══════════════════════════════════════════════════════════
   HÄUFIGE FRAGEN — Inhalte (Lieferung 18.09)

   Zehn Fragen, deutsch geliefert, englisch übersetzt. Die Antworten
   sind so geschnitten, dass sie auch einzeln zitierbar sind: erster
   Satz beantwortet die Frage, danach folgt die Begründung. Das ist
   die Form, die Suchmaschinen und Antwortmaschinen aufgreifen.

   NICHT VERÖFFENTLICHT sind die internen Klammern der Lieferung —
   sie stehen als TODO hier im Code:

   TODO-FAQ-AUFSICHT (Frage 3): Name der Aufsichtsorganisation und
     der Ombudsstelle fehlen; ebenso die Freigabe für den Zusatz
     «vormals Dr. Blumer & Partner Vermögensverwaltung Zürich AG».
   TODO-FAQ-KOSTEN (Frage 4): die konkreten Sätze (keine Eintritts-
     und Transaktionsgebühren, Management-Fee 1.0 % p.a.,
     Performance-Fee 10 % über High-Watermark, Bank-All-in-Fee
     0.30 %) sind NUR mit Freigabe zu veröffentlichen und stehen
     deshalb noch nicht auf der Seite.
   TODO-FAQ-MINDESTANLAGE (Frage 5): eine konkrete Zahl fehlt. Sie
     ist laut Briefing der stärkste Hebel für Zitate durch
     Antwortmaschinen — sobald sie vorliegt, gehört sie in den
     ersten Satz.
   TODO-FAQ-DEPOTBANKEN (Frage 8): Depotbanken in der Schweiz und
     in Liechtenstein bestätigen; offen, ob Partnerbanken namentlich
     genannt werden und ob eine bestehende Bankbeziehung
     übernommen werden kann.

   ANGEGLICHEN: Schritt 3 der Zusammenarbeit trug in der Lieferung
   noch die alte Formulierung («Unsere Modelle und
   Investmentexpertise …»). Auf der Mandat-Seite ist sie am 17.09
   ersetzt worden; hier steht deshalb die neue Fassung — ein
   Prozess, ein Wortlaut.
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
        "Ein unabhängiger Vermögensverwalter verwaltet Ihr Vermögen, verwahrt es aber nicht selbst: Die Vermögenswerte liegen bei einer Depotbank. Tellian Capital ist weder an eigene Produkte noch an eine bestimmte Depotbank gebunden. So wählen wir Anlagen und Lösungen frei, objektiv und ausschliesslich in Ihrem Interesse.",
        "Die Rollen bleiben klar getrennt: Die Bank verwahrt Ihr Vermögen, Tellian Capital verwaltet es und Sie stehen im Mittelpunkt.",
      ],
    },
    {
      frage:
        "Wie sicher ist mein Vermögen, wenn die Bank oder der Vermögensverwalter in Konkurs geht?",
      absaetze: [
        "Ihr Vermögen bleibt jederzeit in Ihrem Eigentum und liegt bei der Depotbank, nicht bei Tellian Capital. Wir verwalten es über eine Vermögensverwaltungsvollmacht.",
        "Wertschriften im Depot fallen bei einem Bankkonkurs nicht in die Konkursmasse, sondern werden ausgesondert. Kontoguthaben sind über die Einlagensicherung esisuisse bis CHF 100'000 pro Kunde und Bank gesichert. Bei Bedarf kann Ihr Vermögen auf mehrere Institute und Standorte verteilt werden.",
      ],
    },
    {
      frage: "Wer beaufsichtigt Tellian Capital?",
      absaetze: [
        "Tellian Capital AG ist seit 1996 in Zürich tätig und ein von der FINMA bewilligter Vermögensverwalter.",
        "Seit dem 1. Januar 2020 brauchen Vermögensverwalter eine Bewilligung der FINMA und werden laufend von einer Aufsichtsorganisation beaufsichtigt. Die FINMA führt auf finma.ch eine regelmässig aktualisierte Liste der bewilligten Vermögensverwalter.",
      ],
    },
    {
      frage: "Was kostet eine Vermögensverwaltung in der Schweiz?",
      absaetze: [
        "Die Gesamtkosten setzen sich aus der Verwaltungsgebühr, den Gebühren der Depotbank sowie Produkt-, Börsen- und Steuerkosten zusammen. Entscheidend ist deshalb die Gesamtbelastung, nicht eine einzelne Gebühr.",
        "Laut der moneyland-Studie 2026 erheben vor allem traditionelle Banken meist Pauschalgebühren von über 1 %. Bei Tellian Capital sorgen klare Portfoliostrukturen und transparent ausgewiesene Gebühren für Nachvollziehbarkeit.",
      ],
    },
    {
      frage: "Ab welchem Vermögen lohnt sich eine Vermögensverwaltung?",
      absaetze: [
        "Das hängt von Ihren Zielen, Ihrem Anlagehorizont und der Komplexität Ihres Vermögens ab. Grundsätzlich gilt: Je kleiner der Anlagebetrag, desto höher die relativen Kosten und desto enger der Anlagespielraum.",
        "Tellian Capital begleitet Privatpersonen, Unternehmerfamilien und Stiftungen bei der langfristigen Entwicklung ihres Vermögens.",
      ],
    },
    {
      frage:
        "Was ist der Unterschied zwischen Vermögensverwaltungsmandat und Anlageberatung?",
      absaetze: [
        "Beim Mandat erteilen Sie Tellian Capital eine Verwaltungsvollmacht. Wir treffen die Anlageentscheide innerhalb des vereinbarten Rahmens und setzen sie für Sie um.",
        "Bei der Anlageberatung (Advisory) behalten Sie die Entscheidungsgewalt über jede einzelne Transaktion: Wir analysieren, wir empfehlen, und ausgeführt wird nichts ohne Ihre Zustimmung.",
        "Das Mandat richtet sich an Anleger, die ihre täglichen Anlageentscheide in erfahrene Hände geben möchten. Advisory richtet sich an Anleger, die aktiv bleiben möchten.",
      ],
    },
    {
      frage:
        "Wie läuft die Zusammenarbeit ab und wie wird meine Anlagestrategie festgelegt?",
      absaetze: ["Das Mandat bei Tellian Capital folgt fünf Schritten:"],
      schritte: [
        "Wir definieren Ihre Anlageziele und den passenden Anlagehorizont.",
        "Wir bestimmen Ihr Risikoprofil als Grundlage Ihrer Strategie.",
        "Unser Anlageausschuss identifiziert auf Basis hauseigener Anlagemodelle gezielte Investmentmöglichkeiten an den globalen Kapitalmärkten.",
        "Wir strukturieren Ihr Portfolio nach Risikoprofil und passen es laufend an.",
        "Wir überwachen es kontinuierlich und informieren Sie transparent über die Entwicklung.",
      ],
      schluss:
        "Die Anlageentscheide trifft ein unabhängiges Anlagekomitee, unterstützt vom Quant-Ansatz.",
    },
    {
      frage: "Bei welcher Bank liegt mein Vermögen?",
      absaetze: [
        "Sie unterhalten die Depot- und Kontobeziehung direkt mit der Bank. Tellian Capital erhält eine Vermögensverwaltungsvollmacht und vertritt Ihre Interessen gegenüber der Bank.",
        "Die Zusammenarbeit mit ausgewählten Depotbanken ermöglicht vorteilhafte Konditionen und Zugang zu ergänzenden Bankdienstleistungen.",
      ],
    },
    {
      frage:
        "Kann ich jederzeit über mein Vermögen verfügen oder das Mandat kündigen?",
      absaetze: [
        "Ja. Liquide Anlagen und jederzeitige Bezugsmöglichkeiten geben Ihnen Flexibilität, und Tellian Capital kennt keine Kündigungsfristen.",
        "Das entspricht dem Schweizer Recht: Nach Art. 404 OR kann jede Partei einen Auftrag jederzeit und ohne Begründung beenden; dieses Recht kann vertraglich nicht ausgeschlossen werden.",
      ],
    },
    {
      frage: "Wie werde ich über mein Portfolio informiert?",
      absaetze: [
        "Eine eigens entwickelte App von Tellian Capital zeigt Ihnen Ihre Anlagen laufend an.",
        "Berichte erhalten Sie automatisch quartalsweise, auf Wunsch ergänzt durch kundenspezifische und konsolidierte Auswertungen. Zum Jahresende erhalten Sie zusätzlich einen auf Ihr Steuerdomizil abgestimmten Steuerauszug.",
      ],
    },
  ],
  EN: [
    {
      frage:
        "What is an independent asset manager, and how does it differ from a bank?",
      absaetze: [
        "An independent asset manager manages your wealth but does not hold it: the assets are kept at a custodian bank. Tellian Capital is tied neither to proprietary products nor to any particular custodian bank. This allows us to select investments and solutions freely, objectively and solely in your interest.",
        "The roles remain clearly separated: the bank safeguards your assets, Tellian Capital manages them, and you remain at the centre.",
      ],
    },
    {
      frage:
        "How safe are my assets if the bank or the asset manager becomes insolvent?",
      absaetze: [
        "Your assets remain your property at all times and are held at the custodian bank, not at Tellian Capital. We manage them under a discretionary management authority.",
        "In the event of a bank insolvency, securities held in custody do not form part of the bankruptcy estate; they are segregated. Cash balances are protected by the Swiss deposit insurance scheme esisuisse up to CHF 100,000 per client and bank. Where appropriate, your assets can be distributed across several institutions and locations.",
      ],
    },
    {
      frage: "Who supervises Tellian Capital?",
      absaetze: [
        "Tellian Capital AG has been active in Zurich since 1996 and is an asset manager licensed by FINMA.",
        "Since 1 January 2020, asset managers have required a FINMA licence and are supervised on an ongoing basis by a supervisory organisation. FINMA maintains a regularly updated list of licensed asset managers on finma.ch.",
      ],
    },
    {
      frage: "What does wealth management cost in Switzerland?",
      absaetze: [
        "The total cost comprises the management fee, the custodian bank’s fees and product, exchange and tax costs. What matters is therefore the overall burden, not any single fee.",
        "According to the moneyland study 2026, traditional banks in particular usually charge flat fees of more than 1 %. At Tellian Capital, clear portfolio structures and transparently disclosed fees keep costs comprehensible.",
      ],
    },
    {
      frage: "From what level of wealth is professional management worthwhile?",
      absaetze: [
        "That depends on your objectives, your investment horizon and the complexity of your wealth. As a rule: the smaller the amount invested, the higher the relative costs and the narrower the investment scope.",
        "Tellian Capital supports private clients, entrepreneurial families and foundations in developing their wealth over the long term.",
      ],
    },
    {
      frage:
        "What is the difference between a discretionary mandate and investment advice?",
      absaetze: [
        "With a mandate, you grant Tellian Capital discretionary authority. We take the investment decisions within the agreed framework and implement them for you.",
        "With investment advice (Advisory), you retain the decision on every single transaction: we analyse, we recommend, and nothing is executed without your consent.",
        "The mandate is for investors who wish to place their day-to-day investment decisions in experienced hands. Advisory is for investors who wish to remain actively involved.",
      ],
    },
    {
      frage:
        "How does the collaboration work, and how is my investment strategy defined?",
      absaetze: ["A mandate at Tellian Capital follows five steps:"],
      schritte: [
        "We define your investment objectives and the appropriate investment horizon.",
        "We establish your risk profile as the basis for your strategy.",
        "Our investment committee identifies targeted investment opportunities in global capital markets based on proprietary investment models.",
        "We structure your portfolio according to your risk profile and adjust it on an ongoing basis.",
        "We monitor it continuously and keep you transparently informed of its development.",
      ],
      schluss:
        "Investment decisions are taken by an independent investment committee, supported by our quantitative approach.",
    },
    {
      frage: "Which bank holds my assets?",
      absaetze: [
        "You maintain the custody and account relationship directly with the bank. Tellian Capital receives a discretionary management authority and represents your interests vis-à-vis the bank.",
        "Our collaboration with selected custodian banks provides preferential terms and access to additional banking services.",
      ],
    },
    {
      frage: "Can I access my assets or terminate the mandate at any time?",
      absaetze: [
        "Yes. Liquid investments and ready access to your assets give you flexibility, and Tellian Capital applies no notice periods.",
        "This reflects Swiss law: under Art. 404 of the Swiss Code of Obligations, either party may terminate a mandate at any time and without giving reasons; this right cannot be excluded by contract.",
      ],
    },
    {
      frage: "How am I kept informed about my portfolio?",
      absaetze: [
        "An app developed in-house by Tellian Capital shows your investments on an ongoing basis.",
        "You receive reports automatically each quarter, supplemented on request by client-specific and consolidated analyses. At year-end, you additionally receive tax documentation aligned with your tax domicile.",
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
