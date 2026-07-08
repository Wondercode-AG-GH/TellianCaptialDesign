export const LEGAL_PATHS = [
  "/datenschutz",
  "/kundeninformation",
] as const;

export type LegalPath = (typeof LEGAL_PATHS)[number];

export interface LegalSection {
  heading: string;
  paragraphs?: string[];
  list?: string[];
}

export interface LegalPageContent {
  title: string;
  updated?: string;
  sections: LegalSection[];
}

export const LEGAL_PAGES: Record<LegalPath, LegalPageContent> = {
  "/datenschutz": {
    title: "Datenschutzerklärung der Tellian Capital AG",
    sections: [
      {
        heading: "1. Allgemeines",
        paragraphs: [
          "In dieser Datenschutzerklärung erläutern wir, die Tellian Capital AG (nachfolgend Tellian), wie wir Personendaten erheben und sonst bearbeiten. Das ist keine abschliessende Beschreibung; allenfalls regeln andere Datenschutzerklärungen [oder allgemeine Geschäftsbedingungen, Teilnahmebedingungen und ähnliche Dokumente] spezifische Sachverhalte.",
          "Unter Personendaten werden alle Angaben verstanden, die sich auf eine bestimmte oder bestimmbare Person beziehen.",
          "Wenn Sie uns Personendaten anderer Personen (z.B. Familienmitglieder, Daten von Arbeitskollegen) zur Verfügung stellen, stellen Sie bitte sicher, dass diese Personen die vorliegende Datenschutzerklärung kennen und teilen Sie uns deren Personendaten nur mit, wenn Sie dies dürfen und wenn diese Personendaten korrekt sind.",
          "Diese Datenschutzerklärung ist auf die Anforderungen der EU-Datenschutz-Grundverordnung (\"DSGVO\"), das Schweizer Datenschutzgesetz (\"DSG\") und das revidierte Schweizer Datenschutzgesetz (\"revDSG\") ausgelegt. Ob und inwieweit diese Gesetze anwendbar sind, hängt jedoch vom Einzelfall ab.",
        ],
      },
      {
        heading: "2. Verantwortlicher und Kontakt",
        paragraphs: [
          "Für die Bearbeitung Ihrer Personaldaten ist die Tellian Capital AG verantwortlich. Sie können sich für datenschutzrechtliche Anliegen an uns wenden:",
          "Tellian Capital AG\nLöwenstr. 1\nCH-8001 Zürich\n+41 (0) 44 224 40 24\ninfo@telliancapital.ch",
        ],
      },
      {
        heading: "3. Erhebung und Bearbeitung von Personendaten",
        paragraphs: [
          "Wir bearbeiten in erster Linie die Personendaten, die im Rahmen unserer Geschäftsbeziehung mit unseren Kunden und anderen Geschäftspartnern von diesen und weiteren daran beteiligten Personen erhalten oder die wir beim Betrieb unserer Websites, und weiteren Anwendungen von deren Nutzern erheben.",
          "Darunter fallen z.B. Daten bei der Eröffnung von Geschäftsbeziehungen, im Rahmen der Abwicklung von Verträgen, der Inanspruchnahme von Produkten und Dienstleistungen oder auf Webseiten oder weiteren Anwendungen. Wir bearbeiten zudem Personendaten, die im Rahmen der Inanspruchnahme von Produkten oder Dienstleistungen anfallen und die uns übermittelt werden. Wir können, soweit dies erlaubt ist, Personendaten bei öffentlich zugänglichen Quellen, von Behörden oder bei sonstigen Dritten beschaffen.",
        ],
      },
      {
        heading: "4. Kategorien von Personendaten",
        paragraphs: [
          "Wir bearbeiten verschiedene Kategorien von Personendaten. Die wichtigsten Kategorien sind die nachfolgenden:",
        ],
        list: [
          "Stamm- und Bestandsdaten: Hierzu gehören Informationen wie Name, Adresse, Nationalität, Geburtsdatum, Angaben zu Konten, Depots, abgeschlossenen Geschäften und Verträgen sowie Informationen über Dritte, die im Rahmen der Datenverarbeitung betroffen sind, wie Ehepartner, Bevollmächtigte und Berater.",
          "Technische Daten: Diese umfassen Geschäftsnummern, IP-Adressen, interne und externe Kennungen sowie Aufzeichnungen von Zugriffen.",
          "Transaktions- und Auftragsdaten sowie Risikomanagementdaten: Hierzu gehören Informationen über Zahlungsempfänger, deren Bank, Überweisungsbeträge und Details zu Anlageprodukten.",
          "Finanzdaten: In dieser Kategorie finden sich Bonitätsinformationen, Angaben zu Vermögenswerten, Schulden sowie Risiko- und Anlageprofile.",
          "Besucher- und Interessentendaten: Diese umfassen Informationen über Nutzer von Partnerwebsites.",
          "Marketingdaten: Hierzu gehören Vorlieben und Bedürfnisse der betroffenen Personen.",
          "Kommunikationsdaten: Dazu gehören Kontaktinformationen wie E-Mail-Adressen und Telefonnummern.",
          "Sonstige Daten: Diese Kategorie beinhaltet Video- oder Tonaufnahmen sowie Zugangsdaten.",
        ],
      },
      {
        heading: "5. Zwecke der Datenbearbeitung und Rechtsgrundlagen",
        paragraphs: [
          "Wir verwenden die von uns erhobenen Personendaten in erster Linie, um unsere Verträge mit unseren Kunden und Geschäftspartnern abzuschliessen und abzuwickeln, so insbesondere im Rahmen der Vermögensverwaltung mit unseren Kunden und den Einkauf von Produkten und Dienstleistungen von Geschäftspartnern, sowie um unseren gesetzlichen Pflichten im In- und Ausland nachzukommen. Im Rahmen der Dienstleistungen in den Bereichen Legal, Compliance & Risk, Fiduciary & Accounting, sowie IT Administration. Wenn Sie für einen solchen Kunden oder Geschäftspartner tätig sind, können Sie in dieser Funktion mit Ihren Personendaten natürlich ebenfalls davon betroffen sein.",
          "Darüber hinaus bearbeiten wir Personendaten von Ihnen und weiteren Personen, soweit erlaubt und es uns als angezeigt erscheint, auch für folgende Zwecke, an denen wir (und zuweilen auch Dritte) ein dem Zweck entsprechendes berechtigtes Interesse haben:",
        ],
        list: [
          "Abschluss und Erfüllen von Verträgen, Durchführung, Abwicklung und Verwaltung von Produkten und Dienstleistungen (z.B. Rechnungen, Zahlungen, Finanzplanung, Anlagen, Vorsorge, Versicherung).",
          "Überwachung und Steuerung von Risiken (z.B. Anlageprofile, Geldwäschereibekämpfung, Limiten, Ausnützungsziffern, Marktrisiken).",
          "Planung, Geschäftsentscheide (z.B. Entwicklung von neuen oder Beurteilung bestehender Dienstleistungen und Produkte).",
          "Marketing, Kommunikation, Information über das Dienstleistungsangebot und Überprüfung desselben (z.B. Werbung im Print- und online Bereich, Kunden-, Interessenten- oder andere Anlässe, Ermittlung künftiger Kundenbedürfnisse, Beurteilung eines Kunden-, Markt- oder Produktpotentials).",
          "Erfüllung gesetzlicher oder regulatorischer Auskunfts-, Informations- oder Meldepflichten an Gerichte und Behörden, Erfüllung behördlicher Anordnungen (z.B. Meldepflichten gegenüber der FINMA und ausländischen Aufsichtsbehörden, automatischer Informationsaustausch mit ausländischen Steuerbehörden, Anordnungen von Staatsanwaltschaften im Zusammenhang mit Geldwäscherei und Terrorismusfinanzierung).",
          "Verhinderung und Aufklärung von Straftaten oder anderem Fehlverhalten (z.B. durch interne Untersuchungen).",
          "Wahrung der Interessen und Sicherung der Ansprüche der Tellian Capital AG z.B. im Falle von Forderungen gegenüber der Tellian Capital AG bzw. Forderungen der Tellian Capital AG gegenüber Dritten.",
          "Gewährleistung des Betriebs, insbesondere der IT, der Website sowie weiterer Plattformen.",
          "Vorbereitung und Abwicklung von Transaktionen in Bezug auf den Kauf oder Verkauf von Gesellschaften oder Teilen von Gesellschaften oder weitere gesellschaftsrechtliche Transaktionen.",
        ],
      },
      {
        heading: "6. Cookies / Tracking und andere Technologien im Zusammenhang mit der Nutzung unserer Website",
        paragraphs: [
          "Wenn erforderlich, verwenden wir auf unseren Websites in der Regel \"Cookies\" und ähnliche Technologien, die dazu dienen, Ihren Browser oder Ihr Gerät zu identifizieren. Ein Cookie ist eine kleine Datei, die automatisch von Ihrem Webbrowser auf Ihrem Computer oder mobilen Gerät gespeichert wird, wenn Sie unsere Website besuchen. Diese Cookies sind kleine Datensätze, die auf dem Computer des Besuchers gespeichert werden, um den Besuch auf der Website zu verfolgen, die Navigation zwischen verschiedenen Seiten zu erleichtern und Einstellungen zu speichern (z.B. ausgewählte Sprache). Cookies werden verwendet, um statistische Daten über die Häufigkeit und Dauer der Besuche auf bestimmten Bereichen der Website zu sammeln und dazu beizutragen, massgeschneiderte, nützliche und benutzerfreundliche Websites zu gestalten. Sie haben jederzeit die Möglichkeit, die Verwendung von Cookies abzulehnen, indem Sie die auf der Website gesetzten Cookies über die Einstellungen Ihres Internetbrowsers löschen.",
          "Gelegentlich verwenden wir auch Drittanbieter-Komponenten (wie Plugins), um die Benutzererfahrung und Online-Werbekampagnen zu verbessern. Diese Komponenten können ebenfalls Cookies für ähnliche Zwecke verwenden. Weder diese Drittanbieter noch wir haben Zugriff auf die Daten, die jeweils von der anderen Partei durch Cookies gesammelt werden. Unsere Partner verwenden auch Cookies im Rahmen von Werbeanzeigen auf Websites von Dritten, mit denen wir Marketingbeziehungen unterhalten. Wenn Drittanbieter anonymisierte Informationen über die Nutzung unserer Website und anderer Websites sammeln, kann unser Partner diese anonymisierten Daten verwenden, um die Effektivität der Werbung zu verbessern.",
          "Diese Datenschutzerklärung gilt ausschliesslich für Daten, die wir durch die Nutzung unserer Website erhalten. Sie ist nicht auf Websites von Drittanbietern anwendbar, selbst wenn Sie über Links auf unserer Website auf diese gelangen. Wir haben Einfluss auf den Inhalt und die Datenschutzpraktiken von Websites von Dritten und können keine Verantwortung für diese übernehmen.",
          "Wenn jemand unsere Website besucht, erfasst der Webserver automatisch Informationen über den Besuch, wie die Website, von der aus der Besuch erfolgt, die IP-Adresse des Besuchers, die aufgerufenen Inhalte der Website sowie das Datum und die Dauer des Besuchs. Diese Tracking-Daten dienen der Optimierung der besuchten Websites und liefern Informationen darüber, wie sich der Besucher über Produkte, Dienstleistungen und Angebote informiert und diese nutzt. In der Regel ermöglichen diese Daten jedoch keine Identifizierung des Besuchers, und es werden keine personenbezogenen Daten verarbeitet. Wenn der Besucher jedoch personenbezogene Daten zur Verfügung stellt, beispielsweise durch Ausfüllen eines Registrierungsformulars oder eines Newsletter-Anmeldeformulars, können wir diese Daten zusätzlich zu den in Abschnitt 5 genannten Zwecken verwenden:",
        ],
        list: [
          "zur Verwaltung von Kunden- und Nutzerkonten;",
          "zur Bereitstellung von Informationen über Dienstleistungen und Produkte;",
          "zu Marketingzwecken, wie dem Versenden von Newslettern;",
          "zur technischen Bereitstellung (Hosting) und Weiterentwicklung unserer Websites.",
        ],
      },
      {
        heading: "7. Datenweitergabe und Datenübermittlung ins Ausland",
        paragraphs: [
          "Wir geben im Rahmen unserer geschäftlichen Aktivitäten und der Zwecke gemäss Ziff. 5, soweit erlaubt und es uns als angezeigt erscheint, auch Dritten bekannt, sei es, weil sie diese für uns bearbeiten, sei es, weil sie sie für ihre eigenen Zwecke verwenden wollen. Dabei geht es insbesondere um folgende Stellen:",
        ],
        list: [
          "Dienstleister von uns (wie z.B. Banken, Versicherungen), einschliesslich Auftragsbearbeitern (wie z.B. IT-Provider);",
          "Zur Auftragsausführung, d.h. bei Inanspruchnahme von Produkten oder Dienstleistungen.",
          "Aufgrund gesetzlicher Verpflichtungen, gesetzlicher Rechtfertigungsgründe oder behördlicher Anordnungen, z.B. an Gerichte, Aufsichtsbehörden, Steuerbehörden oder andere Dritte.",
          "Für Auslagerungen gemäss Ziff. 8 und zum Zweck der Kundenbetreuung an andere Dienstleister.",
          "Mit der Einwilligung der Betroffenen an sonstige Dritte.",
          "In- und ausländische Behörden, Amtsstellen oder Gerichten.",
        ],
      },
      {
        heading: "8. Auslagerung von Geschäftsbereichen oder Dienstleistungen",
        paragraphs: [
          "Wir beauftragen externe Dienstleister, um bestimmte Geschäftsbereiche und Dienstleistungen ganz oder teilweise in unserem Auftrag zu erbringen. Diese Dienstleister verarbeiten personenbezogene Daten im Namen von Tellian Capital AG und werden daher als \"Auftragsverarbeiter\" bezeichnet. Bei der Auswahl dieser Auftragsverarbeiter legen wir grossen Wert auf Sorgfalt.",
          "Wo immer möglich, bevorzugen wir Auftragsverarbeiter mit Sitz in der Schweiz, die als gemeinsame Verantwortliche agieren. Diese Auftragsverarbeiter können unter Umständen selbst bestimmte Dienstleistungen von Dritten erbringen.",
          "Die Auftragsverarbeiter dürfen die ihnen übermittelten personenbezogenen Daten nur gemäss den Anweisungen von Tellian Capital AG verarbeiten. Sie sind vertraglich verpflichtet, die Vertraulichkeit und Sicherheit dieser Daten zu gewährleisten.",
        ],
      },
      {
        heading: "9. Dauer der Aufbewahrung von Personendaten",
        paragraphs: [
          "Wir verarbeiten und speichern Ihre Personendaten, solange es für die Erfüllung unserer vertraglichen und gesetzlichen Pflichten oder sonst die mit der Bearbeitung verfolgten Zwecke erforderlich ist, d.h. also zum Beispiel für die Dauer der gesamten Geschäftsbeziehung (von der Anbahnung, Abwicklung bis zur Beendigung eines Vertrags) sowie darüber hinaus gemäss den gesetzlichen Aufbewahrungs- und Dokumentationspflichten. Dabei ist es möglich, dass Personendaten für die Zeit aufbewahrt werden, in der Ansprüche gegen unser Unternehmen geltend gemacht werden können und soweit wir anderweitig gesetzlich dazu verpflichtet sind oder berechtigte Geschäftsinteressen dies erfordern (z.B. für Beweis- und Dokumentationszwecke). Sobald Ihre Personendaten für die oben genannten Zwecke nicht mehr erforderlich sind, werden sie grundsätzlich und soweit möglich gelöscht oder anonymisiert. Für betriebliche Daten (z.B. Systemprotokolle, Logs), gelten grundsätzliche kürzere Aufbewahrungsfristen von zwölf Monaten oder weniger.",
        ],
      },
      {
        heading: "10. Datensicherheit",
        paragraphs: [
          "Wir treffen angemessene technische und organisatorische Sicherheitsvorkehrungen zum Schutz Ihrer Personendaten vor unberechtigtem Zugriff und Missbrauch. Der Schutz der Personendaten umfasst angemessene technische und organisatorische Sicherheitsmassnahmen (z.B. Zugangsbeschränkungen, Firewalls, personifizierte Passwörter sowie Verschlüsselungs- und Authentifizierungstechnologien, Schulung von Mitarbeitern etc.).",
        ],
      },
      {
        heading: "11. Pflicht zur Bereitstellung von Personendaten",
        paragraphs: [
          "Im Rahmen unserer Geschäftsbeziehung müssen Sie diejenigen Personendaten bereitstellen, die für die Aufnahme und Durchführung einer Geschäftsbeziehung und der Erfüllung der damit verbundenen vertraglichen Pflichten erforderlich sind (eine gesetzliche Pflicht, uns Daten bereitzustellen, haben Sie in der Regel nicht). Ohne diese Daten werden wir in der Regel nicht in der Lage sein, einen Vertrag mit Ihnen (oder der Stelle oder Person, die Sie vertreten) zu schliessen oder diesen abzuwickeln. Auch die Website kann nicht genutzt werden, wenn gewisse Angaben zur Sicherstellung des Datenverkehrs (wie z.B. IP-Adresse) nicht offengelegt wird.",
        ],
      },
      {
        heading: "12. Profiling und automatisierte Entscheidfindung",
        paragraphs: [
          "Wir nutzen Ihre personenbezogenen Daten teilweise für automatisierte Verarbeitungszwecke, um bestimmte individuelle Merkmale (Profiling) zu bewerten. Unser Hauptziel bei der Anwendung des Profilings besteht darin, Sie gezielt über unsere Produkte zu informieren und Sie entsprechend zu beraten. Hierbei setzen wir Analyseinstrumente ein, die es uns ermöglichen, eine massgeschneiderte Kommunikation und Werbung sowie Marktforschungs- und Meinungsumfragen durchzuführen.",
          "Es ist wichtig zu beachten, dass wir grundsätzlich keine vollautomatisierten Entscheidungsfindungsverfahren anwenden, wie sie in Artikel 22 der Datenschutz-Grundverordnung (DSGVO) beschrieben sind, um die Geschäftsbeziehung zu begründen oder durchzuführen. Sollten wir in Einzelfällen solche Verfahren einsetzen, werden wir Sie darüber separat informieren, sofern dies gesetzlich vorgeschrieben ist, und Sie über die damit verbundenen Rechte aufklären.",
        ],
      },
      {
        heading: "13. Rechte der betroffenen Person",
        paragraphs: [
          "Jede Person hat das Recht, von Tellian Capital AG Informationen darüber anzufordern, ob ihre persönlichen Daten verarbeitet werden. Es besteht die Möglichkeit, Widerspruch einzulegen, die Verarbeitung einzuschränken und, falls zutreffend, das Recht auf Datenübertragbarkeit auszuüben. Sollten falsche Informationen vorliegen, können diese korrigiert werden. Darüber hinaus besteht die Möglichkeit, die Löschung der persönlichen Daten zu beantragen, sofern keine gesetzlichen oder regulatorischen Anforderungen (z.B. gesetzliche Aufbewahrungspflichten für geschäftsrelevante Daten) oder technische Hindernisse dies verhindern. Bitte beachten Sie, dass die Löschung von Daten dazu führen kann, dass bestimmte Dienstleistungen nicht mehr erbracht werden können. Wenn relevant, steht Ihnen auch das Recht zu, sich bei einer zuständigen Behörde zu beschweren.",
          "Falls Tellian Capital AG Ihre persönlichen Daten aufgrund einer Einwilligung verarbeitet, können Sie diese Einwilligung jederzeit widerrufen. Es ist jedoch zu beachten, dass Tellian Capital AG das Recht hat, gesetzlich vorgesehene Beschränkungen geltend zu machen, insbesondere wenn sie zur Aufbewahrung oder Verarbeitung bestimmter Daten verpflichtet sind, ein überwiegendes Interesse haben (soweit dies zulässig ist) oder die Daten für die Durchsetzung von Ansprüchen benötigen.",
          "Um Tellian Capital AG bei der Bearbeitung Ihrer Anfrage zu unterstützen, bitten wir um eine klare und verständliche Mitteilung. Wir werden Ihr Anliegen in angemessener Zeit prüfen und beantworten.",
          "Zusätzlich hat jede betroffene Person das Recht, ihre Ansprüche vor Gericht durchzusetzen oder bei der zuständigen Datenschutzbehörde eine Beschwerde einzureichen. Die zuständige Datenschutzbehörde in der Schweiz ist der Eidgenössische Datenschutz- und Öffentlichkeitsbeauftragte (http://www.edoeb.admin.ch).",
        ],
      },
      {
        heading: "14. Änderungen",
        paragraphs: [
          "Wir können diese Datenschutzerklärung jederzeit ohne Vorankündigung anpassen. Es gilt die jeweils aktuelle, auf unserer Website publizierte Fassung. Soweit die Datenschutzerklärung Teil einer Vereinbarung mit Ihnen ist, werden wir Sie im Falle einer Aktualisierung über die Änderung per E-Mail oder auf andere geeignete Weise informieren.",
        ],
      },
    ],
  },

  "/kundeninformation": {
    title: "Kundeninformation",
    sections: [
      {
        heading: "1. Informationen über Finanzinstrumente",
        paragraphs: [
          "Vermögensverwaltungsgesellschaften sind gesetzlich verpflichtet, ihren Kunden und potenziellen Kunden angemessene Informationen über Finanzinstrumente zur Verfügung zu stellen. Diese Informationen haben eine ausreichend detaillierte allgemeine Beschreibung der Art und der Risiken der Finanzinstrumente zu enthalten, damit der Kunde seine Anlageentscheidungen auf genügend fundierter Grundlage treffen kann.",
          "Sämtliche relevanten Informationen finden Sie in der Broschüre der Schweizerischen Bankiervereinigung über «Risiken im Handel mit Finanzinstrumenten», welche ein Anhang zum Vermögensverwaltungsvertrag ist.",
        ],
      },
      {
        heading: "2. Kundenkommunikation und allgemeine Informationen",
        paragraphs: [
          "Die Tellian Capital AG (nachstehend «Tellian»), Löwenstrasse 1, CH-8001 Zürich, ist ein Vermögensverwalter nach Art. 17 Abs. 1 Finanzinstitutsgesetz. Sie erreichen uns unter:",
          "Telefonnummer: +41 44 22 44 024\nTelefaxnummer: +41 44 22 44 034\nE-Mail: info@telliancapital.ch\nHandelsregisternummer: CHE-108.439.825\nMWST-Nummer: CHE-108.439.825 MWST\nLEI-Nummer: 967600KF42JJULZA0S73",
          "Sie können mit uns jederzeit in Deutsch oder Englisch kommunizieren und werden die entsprechenden Dokumente unserer Vermögensverwaltungsgesellschaft stets in deutscher Sprache erhalten.",
          "Die weitere Kommunikation zwischen der Tellian Capital AG und Ihnen als Kunden wird im Vermögensverwaltungsauftrag geregelt. Wir möchten Sie aber darauf hinweisen, dass die allfällige Verwendung von E-Mails in Bezug auf die Vertraulichkeit gewisse Risiken beinhaltet.",
        ],
      },
      {
        heading: "3a. Kundensegmentierung durch den Vermögensverwalter und Opting-in bzw. Opting-out Erklärung durch den Kunden",
        paragraphs: [
          "Als Vermögensverwalter ist Tellian Capital AG gesetzlich verpflichtet, den Kunden einem Kundensegment zuzuordnen. Tellian Capital AG hat den Kunden unter Berücksichtigung der gesetzlichen Bestimmungen dem untenstehenden Kundensegment zugeordnet.",
          "Entgegen der Kundensegmentierung durch die Tellian Capital AG kann der Kunde – soweit gesetzlich möglich und sofern er die gesetzlichen Voraussetzungen erfüllt – freiwillig die Zuordnung zu einem anderen Kundensegment erklären. Durch den Wechsel in ein anderes Kundensegment unterstellt sich der Kunde einem höheren Schutz (Opting-in) oder einem weniger weitgreifenden Schutz (Opting-out).",
        ],
        list: [
          "Privatkunde: Opting-out zum professionellen Kunden möglich, wenn der Privatkunde aufgrund der persönlichen Ausbildung und der beruflichen Erfahrung oder aufgrund einer vergleichbaren Erfahrung im Finanzsektor über die Kenntnisse verfügt, die notwendig sind, um die Risiken der Anlagen zu verstehen, und über ein Vermögen von mindestens 500'000 Franken verfügt und somit als vermögender Privatkunde gilt.",
          "Privatkunde: Opting-out zum professionellen Kunden möglich, wenn der Privatkunde über ein Vermögen von mindestens 2 Millionen Franken verfügt und somit als vermögender Privatkunde gilt.",
          "Privatkunde: Opting-out zum professionellen Kunden für eine private Anlagestruktur, welche für vermögende Privatkunden errichtet wurde.",
          "Professioneller Kunde: Opting-in zum Privatkunden grundsätzlich möglich.",
          "Professioneller Kunde: Opting-out zum institutionellen Kunden für eine Vorsorgeeinrichtung oder eine Einrichtung, die nach ihrem Zweck der beruflichen Vorsorge dient, mit professioneller Tresorerie.",
          "Professioneller Kunde: Opting-out zum institutionellen Kunden für ein Unternehmen mit professioneller Tresorerie.",
          "Institutioneller Kunde: Opting-in zum professionellen Kunden.",
        ],
      },
      {
        heading: "Verzichtserklärung für professionelle Kunden",
        paragraphs: [
          "Ordnet der Vermögensverwalter den Kunden dem Segment «professionelle Kunden» zu oder hat der Kunde mittels Opting-in oder Opting-out erklärt, dass er als professioneller Kunde gelten will, verzichtet der Kunde ausdrücklich darauf, dass der Vermögensverwalter die Verhaltensregeln nach Art. 8 FIDLEG (Inhalt und Form der Informationen), Art. 9 FIDLEG (Zeitpunkt und Form der Informationen), Art. 15 FIDLEG (Dokumentation) und Art. 16 FIDLEG (Rechenschaft) anwendet.",
        ],
      },
      {
        heading: "Änderungen",
        paragraphs: [
          "Eine Änderung zum Opting-in bzw. Opting-out hat in Schriftform oder in anderer durch Text nachweisbarer Form zu erfolgen. Sollte der Vermögensverwalter feststellen, dass der Kunde die Voraussetzungen für das betreffende Kundensegment nicht erfüllt, darf er einseitig einen Wechsel in ein Kundensegment mit einem höheren Schutz vornehmen.",
        ],
      },
      {
        heading: "3b. Klassifizierung gemäss dem KAG",
        paragraphs: [
          "Zusätzlich zu der Kundesegmentierung des FIDLEG, differenziert das Bundesgesetz über die kollektiven Kapitalanlagen vom 23. Juni 2006 (KAG, SR 951.31) zwischen qualifizierten und nicht qualifizierten Anlegern. Die FINMA kann kollektive Kapitalanlagen ganz oder teilweise von bestimmten Vorschriften befreien, sofern sie ausschliesslich qualifizierten Anlegern offenstehen, was zu mehr Flexibilität bei der Anlagestrategie, den Anlagetechniken oder Zugang zu weiteren Anteilsklassen führen kann. Ebenso ist es möglich, qualifizierten Anlegern ausländische kollektive Kapitalanlagen anzubieten, deren Angebot nicht durch die FINMA genehmigt wurde. Folglich geniessen die qualifizierten Anleger nicht dasselbe Mass an Anlegerschutz.",
          "Soweit der Kunde einen auf Dauer angelegten Vermögensverwaltungsvertrag abgeschlossen hat, gilt der Kunde gemäss Gesetz als qualifizierter Anleger im Sinne von Art. 10 Abs. 3ter KAG. Der Kunde kann darauf verzichten, als qualifizierter Anleger zu gelten.",
        ],
      },
      {
        heading: "4. Aufsichtsbehörde",
        paragraphs: [
          "Wir sind ein von der Eidgenössischen Finanzmarktaufsichtsbehörde (FINMA) bewilligter Vermögensverwalter nach Art. 17 Abs. 1 Schweizer Finanzinstitutsgesetz und unterstehen den Verhaltensregeln des Schweizer Finanzdienstleistungsgesetzes.",
          "Als Vermögensverwalter werden wir durch eine gemäss Finanzmarktaufsichtsgesetz bewilligte Aufsichtsorganisation beaufsichtigt und bedürfen für die Ausübung unserer Tätigkeit einer Bewilligung der FINMA.",
          "Unsere Aufsichtsorganisation ist die AOOS:\nAOOS\nClausiusstrasse 50\n8006 Zürich\nTelefon: +41 44 215 98 98\nE-Mail: info@aoos.ch\nWebsite: www.aoos.ch",
          "Die Bewilligung wurde erteilt von:\nEidgenössische Finanzmarktaufsicht (FINMA)\nLaupenstrasse 27\nCH-3003 Bern\nTelefon: +41 31 327 91 00\nE-Mail: info@finma.ch\nWebsite: www.finma.ch",
        ],
      },
      {
        heading: "5. Berichterstattung und Rechnungslegung",
        paragraphs: [
          "Die Details zur Berichterstattung und Rechnungslegung sind dem Vermögensverwaltungsauftrag zu entnehmen.",
        ],
      },
      {
        heading: "6. Massnahmen zum Schutz des anvertrauten Kundenvermögens",
        paragraphs: [
          "Die Tellian Capital AG erbringt lediglich Vermögensverwaltungsdienstleistungen. Sie verwahrt selbst keine Finanzinstrumente der Kunden.",
        ],
      },
      {
        heading: "7. Umgang mit Interessenkonflikten",
        paragraphs: [
          "Die Grundsätze zum Umgang mit Interessenkonflikten sind dem Anhang 5 zum Vermögensverwaltungsauftrag zu entnehmen.",
        ],
      },
      {
        heading: "8. Benchmark",
        paragraphs: [
          "Um die Leistungen der Vermögensverwaltung (Portfoliomanagement) im Rahmen der definierten Anlageziele vergleichbar zu machen, verwenden wir als Bewertungsmethode eine sogenannte Benchmark. Die Benchmark unterscheidet sich für die jeweiligen Kundenportfolios und wird je nach Anlageziel und -strategie festgelegt. Bei individuell zusammengestellten Depots und speziellen Wünschen des Kunden für die Anlagestrategie wird die Benchmark jeweils individuell mit dem Kunden vereinbart oder auf eine Benchmark verzichtet.",
        ],
      },
      {
        heading: "9. Anlageziele / Art der zulässigen Anlagen",
        paragraphs: [
          "Die Anlageziele im Rahmen der Vermögensverwaltung (Portfoliomanagement) werden im Kundenprofil (bzw. Anlegerprofil) definiert, welches Teil des Vermögensverwaltungsauftrages ist. Die Art der zulässigen Anlagen ergibt sich ebenfalls aus dem Vermögensverwaltungsvertrag.",
        ],
      },
      {
        heading: "10. Bewertung von Finanzinstrumenten",
        paragraphs: [
          "Die Tellian Capital AG verwendet für die Bewertung der im Kundenportfolio gehaltenen Finanzinstrumente folgende Bewertungskriterien:",
        ],
        list: [
          "Investmentfonds werden stets zu den von der jeweiligen Fondsgesellschaft veröffentlichten Anteilspreisen bewertet.",
          "Börsennotierte Wertpapiere werden jeweils zu den Kursen des Ausführungsplatzes/liquidesten Marktes in diesen Titeln ermittelt.",
          "Wenn für Finanzinstrumente kein Börsenkurs gestellt wird, wird die Tellian Capital AG den Verkehrswert unter Anwendung allgemeiner Bewertungsmassstäbe ermitteln.",
        ],
      },
      {
        heading: "11. Ausführung von Aufträgen",
        paragraphs: [
          "Die Grundsätze zur Ausführung von Aufträgen sind dem Anhang 4 zum Vermögensverwaltungsauftrag zu entnehmen («Execution Policy»).",
        ],
      },
      {
        heading: "12. Kosten",
        paragraphs: [
          "Die Kosten sind im Vermögensverwaltungsauftrag geregelt und können dort entnommen werden.",
          "Es besteht die Möglichkeit, dass den Kunden aus der Vermögensverwaltung im Zusammenhang mit den für sie angeschafften Finanzinstrumenten und Wertpapierdienstleistungen noch weitere Kosten und Steuern entstehen können, die nicht vom Gesamtentgelt umfasst sind und ihm in Rechnung gestellt werden können.",
        ],
      },
      {
        heading: "13. Beschwerdeverfahren / Ombudsstelle",
        paragraphs: [
          "Zur Einreichung einer Beschwerde ist grundsätzlich das Formular gemäss Anhang zu verwenden. Die Beschwerde ist nach Möglichkeit elektronisch an die obgenannte E-Mail-Adresse der Tellian Capital AG einzureichen. Die Tellian Capital AG wird sich bemühen, sämtliche relevanten Beweismittel und Informationen bezüglich der Beschwerde zusammenzutragen und zu prüfen. Der Beschwerdeführer wird innerhalb von 20 Tagen eine Stellungnahme zu seiner Beschwerde erhalten.",
          "Der Beschwerdeführer hat die Möglichkeit zur Einleitung von Vermittlungsverfahren vor einer anerkannten Ombudsstelle. Die Tellian Capital AG ist folgender Ombudsstelle angeschlossen:",
          "Ombud Finance Switzerland (OFS)\nRue du Conseil Général 10\n1205 Genf\nTelefon: +41 22 808 04 51\nE-Mail: contact@ombudfinance.ch\nWebsite: www.ombudfinance.ch",
          "Die Ombudsstelle ist weder ein Gericht noch verfügt sie über Rechtsprechungsbefugnis. Sie fördert vielmehr das Gespräch zwischen den involvierten Parteien und unterbreitet ihnen eine Verhandlungslösung. Da die Parteien an den Vorschlag der Ombudsstelle nicht gebunden sind, steht es ihnen frei, diesen anzunehmen oder andere, zum Beispiel rechtliche Massnahmen zu ergreifen.",
        ],
      },
      {
        heading: "14. Einlagensicherung (esisuisse)",
        paragraphs: [
          "Esisuisse, die Einlagensicherung, sichert Kundengelder bei Banken und Effektenhändler in der Schweiz. Sollten die Kundeneinlagen infolge eines Konkurses nicht mehr verfügbar sein, erhält jeder Kunde sein Geld bis zu einem Maximum von CHF 100'000 vom Liquidator ausbezahlt. Das gilt pro Kunde und Institut.",
        ],
      },
    ],
  },
};

export const LEGAL_LINK_LABELS: Record<LegalPath, string> = {
  "/datenschutz": "Datenschutz",
  "/kundeninformation": "Kundeninformation",
};
