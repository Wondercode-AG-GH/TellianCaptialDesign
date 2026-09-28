/* ═══════════════════════════════════════════════════════════
   MANDAT UND ADVISORY — gemeinsame Vergleichstabelle

   Die Tabelle steht auf BEIDEN Unterseiten und ist dort
   identisch: Mandat links, Advisory rechts. Sie löst die beiden
   früheren Abschlussblöcke («Für wen … gedacht ist», «Der
   Unterschied zu …») ab, die dieselben Aussagen als Fliesstext
   trugen — einmal je Seite, in leicht abweichender Formulierung.

   Deshalb liegt der Inhalt HIER und nicht in den Seiten: eine
   Aussage, ein Wortlaut, zwei Seiten.

   PENDING – Freigabe (Lieferung 28.09): Eyebrow, Titel,
   Zeilenlabels und alle Zellen sind noch nicht freigegeben.

   ENGLISCH: Wo die bisherigen Seiten einen englischen Satz
   führten, steht er wörtlich. Die übrigen Zellen sind neu
   formuliert und als UI-LABEL-REVIEW gekennzeichnet — sie
   stehen im Abschlussbericht.
   ═══════════════════════════════════════════════════════════ */

export type Pfad = "mandat" | "advisory";

export interface VergleichZeile {
  label: string;
  mandat: string;
  advisory: string;
}

export interface VergleichInhalt {
  eyebrow: string;
  titel: string;
  spalten: Readonly<Record<Pfad, string>>;
  zeilen: readonly VergleichZeile[];
}

export const VERGLEICH: Readonly<Record<"DE" | "EN", VergleichInhalt>> = {
  DE: {
    /* PENDING – Freigabe */
    eyebrow: "Einordnung",
    titel: "Mandat und Advisory im Vergleich",
    spalten: { mandat: "Mandat", advisory: "Advisory" },
    zeilen: [
      {
        label: "Verwaltungsvollmacht",
        mandat: "Sie erteilen Tellian Capital eine Verwaltungsvollmacht.",
        advisory: "Sie erteilen keine Verwaltungsvollmacht.",
      },
      {
        label: "Anlageentscheid",
        mandat: "Wir treffen die Anlageentscheide innerhalb des vereinbarten Rahmens.",
        advisory: "Die finale Entscheidung über jede Anlage liegt bei Ihnen.",
      },
      {
        label: "Umsetzung",
        mandat: "Wir setzen die Anlageentscheide für Sie um.",
        advisory: "Umgesetzt wird ausschliesslich, was Sie freigeben.",
      },
      {
        label: "Für wen gedacht",
        mandat:
          "Für Anleger, die ihre täglichen Anlageentscheide in erfahrene Hände geben möchten und Wert auf eine professionelle, kontinuierliche Betreuung ihres Vermögens legen.",
        advisory:
          "Für Anleger, die aktiv bleiben und die Verantwortung für ihre Anlageentscheide behalten möchten.",
      },
    ],
  },
  EN: {
    /* UI-LABEL-REVIEW: Eyebrow und Titel neu formuliert. */
    eyebrow: "Comparison",
    titel: "Mandate and Advisory compared",
    /* Spaltennamen aus der Prozess-Gabelung übernommen. */
    spalten: { mandat: "Discretionary Mandate", advisory: "Advisory" },
    zeilen: [
      {
        /* UI-LABEL-REVIEW: Label und beide Zellen neu formuliert;
           sie fassen den Satz der bisherigen Seiten zusammen. */
        label: "Discretionary authority",
        mandat: "You grant Tellian Capital discretionary authority.",
        advisory: "You grant no discretionary authority.",
      },
      {
        /* UI-LABEL-REVIEW: Label und Mandat-Zelle neu formuliert.
           Die Advisory-Zelle steht woertlich in der bisherigen
           englischen Einleitung der Advisory-Seite. */
        label: "Investment decision",
        mandat: "We make the investment decisions within the agreed framework.",
        advisory: "The final decision on every investment remains with you.",
      },
      {
        /* UI-LABEL-REVIEW: Label und Mandat-Zelle neu formuliert.
           Die Advisory-Zelle steht woertlich in der bisherigen
           englischen Einleitung der Advisory-Seite. */
        label: "Implementation",
        mandat: "We implement the investment decisions for you.",
        advisory: "Nothing is implemented without your approval.",
      },
      {
        /* Beide Zellen woertlich aus den bisherigen Bloecken
           «Who is the mandate for?» und «Who is Advisory for?». */
        /* UI-LABEL-REVIEW: nur das Label ist neu. */
        label: "Who it is for",
        mandat:
          "For investors who prefer to entrust day-to-day investment decisions to experienced professionals while benefiting from continuous and professional portfolio management.",
        advisory:
          "For investors who want to remain actively involved and retain control over their investment decisions.",
      },
    ],
  },
};
