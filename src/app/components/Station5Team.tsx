import { useRef, useState } from "react";

import { C, sans, serif } from "../tokens";
import { Aufgang, Kapitelmarke } from "./MobilSektion";
import { useTitelHoehe } from "./useTitelHoehe";
import { ResponsiveImage } from "./ResponsiveImage";
import { TeamDetail } from "./TeamDetail";
import type { ImageId } from "../../assets/generated";

/* ═══════════════════════════════════════════════════════════
   STATION 05 — DAS TEAM (hell)

   Redesign: Die Übersicht zeigt je Karte Foto, Name und Rolle —
   keine langen Texte mehr in der Station. Die persönlichen Texte
   leben ausschliesslich in der Detailansicht (TeamDetail), die per
   Klick auf die ganze Karte öffnet. Karten MIT Text tragen das
   Label «Mehr erfahren»; Karten ohne Text sind bewusst keine
   Bedienelemente.

   Die frühere Hover-Mechanik (aufziehende Streifen mit Story im
   Bild) ist entfallen — Inhalte, die erst beim Zeigen erscheinen,
   sind für die Zielgruppe 65+ das falsche Muster.

   TODO-FOTOS: Die Porträts sind die bisherigen Platzhalter-
   Aufnahmen; die finalen Teamfotos stehen aus.
   ═══════════════════════════════════════════════════════════ */

interface Person {
  id: string;
  name: string;
  rolle: string;
  /** Englische Fassung der Rolle, wo sie abweicht — die übrigen
      Rollen sind international gleich geschrieben (CEO, Relationship
      Manager, Risk Management …) und brauchen keine. */
  rolleEn?: string;
  /** Augenlinie im ungeschnittenen Bild, als Anteil der Bildhöhe.
      Zurückgerechnet aus den Kachelzuschnitten in
      scripts/optimize-images.mjs: dort steht oben = Augenlinie
      − 0.22 × Ausschnitthöhe, die Ausschnitthöhe ist 0.7378 der
      Quellhöhe (bei Wilhelm 0.7111, schmalerer Zuschnitt). Das
      geöffnete Porträt richtet daran die Kopfhöhe aus. */
  augenlinie?: number;
  bild?: ImageId;
  /** Ungeschnittene Fassung für das geöffnete Porträt. Die Kachel
      zeigt den 0.9-Zuschnitt (Augenlinien auf einer Höhe), das
      Detail das ganze Foto im Originalverhältnis — sonst sah man
      dort nur rund die Hälfte des Bildes (Analyse 22.09). */
  bildDetail?: ImageId;
  /** Persönliches LinkedIn-Profil. Fehlt es, führt das Icon
      übergangsweise auf die Firmenseite (TODO-LINKEDIN). */
  linkedin?: string;
  /** Persönliche Mailadresse. Fehlt sie, schreibt das Icon an die
      Hausadresse und nennt die Person im Betreff (TODO-MAIL). */
  mail?: string;
}

/* LINKEDIN NUR, WO ES EIN PROFIL GIBT (Entscheid 22.09).
   Persönliche Profile liegen für Olivier M. Bill, Marco Ludescher
   und Bryan Anthony Honegger vor; sie stehen unten bei der Person.
   Alle übrigen tragen KEIN Zeichen mehr.

   Vorher führte es ersatzweise auf die Firmenseite — das versprach
   ein Profil, das es nicht gibt, und liess jede Kachel gleich
   aussehen. Die Firmenseite bleibt dort, wo sie hingehört: im
   Fussband und im mobilen Menü (s. sections.ts). */

/* TODO-MAIL: für KEINE Person liegt bisher eine persönliche
   Mailadresse vor. Das Icon steht trotzdem (Auftrag 17.09) und
   öffnet solange eine Nachricht an die Hausadresse, mit der Person
   im Betreff — so landet die Anfrage bei Tellian und ist der
   Person zugeordnet. Sobald hier eine Adresse eingetragen wird,
   gilt sie für diese Person; sonst ist nichts zu tun. */
const MAIL_FIRMA = "info@telliancapital.ch";

/* Wilhelm Tell ist Namensgeber, keine erreichbare Person — er
   trägt kein Mail-Icon. */
const OHNE_MAIL: readonly string[] = ["wilhelm"];

/** mailto-Ziel einer Person: eigene Adresse, sonst Haus + Betreff. */
function mailZiel(person: Person, sprache: "DE" | "EN" | "FR"): string {
  if (person.mail) return `mailto:${person.mail}`;
  const betreff =
    sprache === "EN"
      ? `Enquiry for ${person.name}`
      : `Anfrage an ${person.name}`;
  return `mailto:${MAIL_FIRMA}?subject=${encodeURIComponent(betreff)}`;
}

/* LinkedIn-Glyph als Vektor: das vorhandene Asset ist ein weisses
   PNG und trägt auf der hellen Kachel nicht. Die Grösse hängt an
   der Namenszeile (1.2em) — das Zeichen wächst und schrumpft mit
   der Beschriftung, nicht mit der Kachel. */
function LinkedInGlyph({ farbe }: { farbe: string }) {
  return (
    <svg width="1.2em" height="1.2em" viewBox="0 0 24 24" aria-hidden focusable="false">
      <path
        fill={farbe}
        d="M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05c.48-.9 1.63-1.85 3.36-1.85 3.6 0 4.27 2.37 4.27 5.45v6.29ZM5.34 7.43a2.06 2.06 0 1 1 0-4.13 2.06 2.06 0 0 1 0 4.13Zm1.78 13.02H3.55V9h3.57v11.45ZM22.22 0H1.77C.79 0 0 .77 0 1.72v20.56C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.72V1.72C24 .77 23.2 0 22.22 0Z"
      />
    </svg>
  );
}

/* Briefumschlag im Mass des LinkedIn-Zeichens. Gezeichnet statt
   gefüllt, dafür mit kräftigerem Strich (1.9 von 24) — bei 17px
   Darstellung trägt er damit dasselbe Gewicht wie der gefüllte
   LinkedIn-Block daneben. */
function MailGlyph({ farbe }: { farbe: string }) {
  return (
    <svg
      width="1.2em"
      height="1.2em"
      viewBox="0 0 24 24"
      aria-hidden
      focusable="false"
    >
      <rect
        x="2.1"
        y="4.6"
        width="19.8"
        height="14.8"
        fill="none"
        stroke={farbe}
        strokeWidth="1.9"
      />
      <path
        d="M2.9 5.4 12 12.6l9.1-7.2"
        fill="none"
        stroke={farbe}
        strokeWidth="1.9"
        strokeLinejoin="round"
      />
    </svg>
  );
}

const PERSONEN: readonly Person[] = [
  {
    id: "wilhelm", name: "Wilhelm Tell", rolle: "Namensgeber", rolleEn: "Namesake",
    bild: "wilhelm-tell", bildDetail: "wilhelm-tell-voll",
    /* Statue, kein Gesicht: der Wert aus der Kacheleichung zeigt
       auf keine Augenlinie. Am Bandkopf gegen die sechs Porträts
       nachgestellt (0.351 stellte die Figur rund 15px zu hoch). */
    augenlinie: 0.325,
  },
  {
    id: "olivier", name: "Olivier M. Bill", rolle: "CEO", bild: "olivier-bill",
    bildDetail: "olivier-bill-voll",
    augenlinie: 0.309,
    linkedin: "https://www.linkedin.com/in/olivier-bill/",
  },
  {
    id: "marco", name: "Marco Ludescher", rolle: "Head of Portfolio Management",
    bild: "marco-ludescher", bildDetail: "marco-ludescher-voll",
    augenlinie: 0.355,
    linkedin: "https://www.linkedin.com/in/marco-ludescher-5807b0344/",
  },
  {
    id: "rolf", name: "Rolf Schneider", rolle: "Relationship Manager",
    bild: "rolf-schneider", bildDetail: "rolf-schneider-voll",
    augenlinie: 0.215,
  },
  {
    id: "bryan", name: "Bryan Anthony Honegger", rolle: "Relationship Manager",
    bild: "bryan-honegger", bildDetail: "bryan-honegger-voll",
    augenlinie: 0.170, /* Bezug */
    linkedin: "https://www.linkedin.com/in/bryan-anthony-honegger-b7b535135/",
  },
  {
    id: "andreas", name: "Andreas Trümpler", rolle: "Risk Management",
    bild: "andreas-truempler", bildDetail: "andreas-truempler-voll",
    augenlinie: 0.210,
  },
  {
    id: "jasmina", name: "Jasmina Rukavina", rolle: "Back-Office / Office Management",
    bild: "jasmina-rukavina", bildDetail: "jasmina-rukavina-voll",
    augenlinie: 0.215,
  },
  /* TODO-TEXT-THIBAUT: kein persönlicher Text geliefert.
     TODO-KONTAKT-THIBAUT: Vorname/Nachname/Tag ausstehend.
     TODO-ROLLE-THIBAUT: Rolle unbestätigt — Zeile bleibt leer. */
  { id: "thibaut", name: "Thibaut", rolle: "" },
];

/* ── PERSONENTEXTE — wörtlich aus dem Briefing, Absatzstruktur
      exakt (2 bzw. 3 Absätze), ohne Auszeichnungen. ── */
type L = "DE" | "EN" | "FR";

const TEXTE: Readonly<Record<string, Readonly<Record<L, readonly string[]>>>> = {
  wilhelm: {
    /* Lieferung 17.09. Der Namensgeber spricht in der ersten Person —
       bewusst, wie im Briefing geliefert */
    DE: [
      "Unabhängigkeit war für mich nie nur eine Frage der Freiheit, sondern immer auch der Verantwortung. Den eigenen Weg zu wählen, sich nicht von äusserem Druck leiten zu lassen und im entscheidenden Moment ruhig zu bleiben – dafür stehe ich bis heute.",
      "Damit passe ich ganz gut zu Tellian Capital – einer Vermögensverwaltung, in deren Namen sich auch meiner wiederfindet. Auch an den Finanzmärkten braucht es einen klaren Blick, eine ruhige Hand und die Überzeugung, nicht jedem Trend folgen zu müssen. Das Ziel sollte man dabei nie aus den Augen verlieren.",
      "Meine Heimat sind die Schweizer Berge. Sie stehen für mich für Beständigkeit, Weitsicht und Bodenhaftung – Werte, die auch nach mehr als 700 Jahren erstaunlich aktuell geblieben sind.",
    ],
    EN: [
      "Independence has never been simply a question of freedom for me, but also one of responsibility. Choosing your own path, not allowing yourself to be swayed by outside pressure, and remaining calm when it matters most – these are values I still stand for today.",
      "That makes me a natural fit for Tellian Capital – a wealth management firm whose name carries an echo of my own. The financial markets, too, call for a clear view, a steady hand and the conviction not to follow every trend. And throughout, one should never lose sight of the goal.",
      "The Swiss mountains are my home. To me, they represent stability, foresight and staying grounded – values that, even after more than 700 years, remain remarkably relevant today.",
    ],
    /* TODO-FR: Übersetzung folgt — DE-Text als Platzhalter. */
    FR: [
      "Unabhängigkeit war für mich nie nur eine Frage der Freiheit, sondern immer auch der Verantwortung. Den eigenen Weg zu wählen, sich nicht von äusserem Druck leiten zu lassen und im entscheidenden Moment ruhig zu bleiben – dafür stehe ich bis heute.",
      "Damit passe ich ganz gut zu Tellian Capital – einer Vermögensverwaltung, in deren Namen sich auch meiner wiederfindet. Auch an den Finanzmärkten braucht es einen klaren Blick, eine ruhige Hand und die Überzeugung, nicht jedem Trend folgen zu müssen. Das Ziel sollte man dabei nie aus den Augen verlieren.",
      "Meine Heimat sind die Schweizer Berge. Sie stehen für mich für Beständigkeit, Weitsicht und Bodenhaftung – Werte, die auch nach mehr als 700 Jahren erstaunlich aktuell geblieben sind.",
    ],
  },
  bryan: {
    /* Lieferung 17.09 */
    DE: [
      "Einen Teil meiner Kindheit habe ich in Uganda, Kolumbien und England verbracht. Dabei habe ich früh erlebt, wie unterschiedlich Menschen leben und was ihnen wichtig ist. Die Neugier auf andere Perspektiven ist mir geblieben und begleitet mich bis heute.",
      "Mein Weg in die Vermögensverwaltung war nicht geradlinig. Genau das hat meinen Blick auf Menschen und Beratung geprägt.",
      "Bei Tellian Capital schätze ich die Verbindung aus Erfahrung und Offenheit für neue Ideen. Bewährtes hat für mich seinen Wert, gleichzeitig hinterfrage ich Bestehendes gerne und bringe neue Perspektiven ein. «Das haben wir immer so gemacht» war für mich noch nie ein überzeugendes Argument.",
      "Privat steht meine junge Familie im Mittelpunkt. Den Kopf bekomme ich am besten auf dem Tennisplatz frei. Auf Reisen probiere ich gerne neue Restaurants und lokale Spezialitäten aus. Über das Essen und die Menschen lerne ich einen Ort oft am besten kennen.",
    ],
    EN: [
      "I spent part of my childhood in Uganda, Colombia and England. From an early age, I experienced how differently people live and what matters to them. That curiosity about different perspectives has stayed with me ever since.",
      "My path into wealth management was not a conventional one. It has shaped the way I understand clients and approach wealth management.",
      "At Tellian Capital, I value the combination of experience and openness to new ideas. I believe in what has proven its worth, while also questioning established approaches and bringing in fresh perspectives. “We’ve always done it this way” has never been a convincing argument to me.",
      "Outside of work, my young family is at the centre of my life. Tennis is where I best clear my head. When travelling, I enjoy discovering new restaurants and local specialities. For me, food and the people behind it are often the best way to get to know a place.",
    ],
    /* TODO-FR: Übersetzung folgt — DE-Text als Platzhalter. */
    FR: [
      "Einen Teil meiner Kindheit habe ich in Uganda, Kolumbien und England verbracht. Dabei habe ich früh erlebt, wie unterschiedlich Menschen leben und was ihnen wichtig ist. Die Neugier auf andere Perspektiven ist mir geblieben und begleitet mich bis heute.",
      "Mein Weg in die Vermögensverwaltung war nicht geradlinig. Genau das hat meinen Blick auf Menschen und Beratung geprägt.",
      "Bei Tellian Capital schätze ich die Verbindung aus Erfahrung und Offenheit für neue Ideen. Bewährtes hat für mich seinen Wert, gleichzeitig hinterfrage ich Bestehendes gerne und bringe neue Perspektiven ein. «Das haben wir immer so gemacht» war für mich noch nie ein überzeugendes Argument.",
      "Privat steht meine junge Familie im Mittelpunkt. Den Kopf bekomme ich am besten auf dem Tennisplatz frei. Auf Reisen probiere ich gerne neue Restaurants und lokale Spezialitäten aus. Über das Essen und die Menschen lerne ich einen Ort oft am besten kennen.",
    ],
  },
  rolf: {
    DE: [
      "Seit der Jahrtausendwende habe ich als Gründungspartner die Entwicklung von Blumer & Partner bis zur heutigen Tellian Capital mitgeprägt. Quantitative Anlagestrategien waren dabei schon immer meine Passion. Die Verbindung von Daten, klaren Modellen und konsequenten Anlageentscheidungen fasziniert mich bis heute. Ebenso wichtig ist mir der persönliche Austausch mit unseren Kunden und das Vertrauen, das daraus gewachsen ist. Mit der nächsten Generation beginnt nun ein neues Kapitel, das ich gerne mit meiner Erfahrung begleite, ohne dabei die Nähe zum Markt und zum täglichen Geschehen zu verlieren.",
      "Was ich beruflich und privat erleben durfte, wäre ohne meine Familie so nicht möglich gewesen. Sie hat meinen Weg nicht nur mitgetragen, sondern viele meiner Leidenschaften mit mir geteilt. Sport und Geschwindigkeit gehören seit jeher dazu, ob auf Asphalt, Schnee oder Eis.",
    ],
    EN: [
      "Since the turn of the millennium, I have helped shape the development of Blumer & Partner through to today’s Tellian Capital as a founding partner. Quantitative investment strategies have always been my passion. The combination of data, clear models and disciplined investment decisions continues to fascinate me to this day.",
      "Equally important to me is the personal dialogue with our clients and the trust that has grown from it over the years. With the next generation, a new chapter is now beginning, one that I am pleased to accompany with my experience, while remaining closely connected to the markets and day-to-day developments.",
      "What I have been fortunate enough to experience, both professionally and personally, would not have been possible without my family. They have not only supported me along the way, but have also shared many of my passions. Sport and speed have always been part of that - whether on asphalt, snow or ice.",
    ],
    /* TODO-FR: Übersetzung folgt — DE-Text als Platzhalter. */
    FR: [
      "Seit der Jahrtausendwende habe ich als Gründungspartner die Entwicklung von Blumer & Partner bis zur heutigen Tellian Capital mitgeprägt. Quantitative Anlagestrategien waren dabei schon immer meine Passion. Die Verbindung von Daten, klaren Modellen und konsequenten Anlageentscheidungen fasziniert mich bis heute. Ebenso wichtig ist mir der persönliche Austausch mit unseren Kunden und das Vertrauen, das daraus gewachsen ist. Mit der nächsten Generation beginnt nun ein neues Kapitel, das ich gerne mit meiner Erfahrung begleite, ohne dabei die Nähe zum Markt und zum täglichen Geschehen zu verlieren.",
      "Was ich beruflich und privat erleben durfte, wäre ohne meine Familie so nicht möglich gewesen. Sie hat meinen Weg nicht nur mitgetragen, sondern viele meiner Leidenschaften mit mir geteilt. Sport und Geschwindigkeit gehören seit jeher dazu, ob auf Asphalt, Schnee oder Eis.",
    ],
  },
  marco: {
    DE: [
      "Mich faszinieren die Kapitalmärkte in all ihren Facetten. Rohstoffe spielen dabei für mich eine besondere Rolle – nicht als kurzfristiger Trend, sondern aus langfristiger Überzeugung. Ich schätze klare Positionen und eine konsequente Umsetzung. Unsere Sicht auf die Märkte bringe ich regelmässig in Analysen auf den Punkt und vertrete sie gerne im Austausch mit Schweizer Börsenmedien.",
      "Abseits der Märkte gehört meine Leidenschaft dem Golf. Ich spiele seit vielen Jahren aktiv und durfte dabei auch den einen oder anderen sportlichen Erfolg feiern. Den Wettbewerb mag ich bis heute – mit Ehrgeiz, Freude am Spiel und der nötigen Gelassenheit. Und nach einer guten Runde darf ein Stück Apfelstrudel nicht fehlen.",
    ],
    EN: [
      "I am fascinated by capital markets in all their facets. Commodities hold a particular place for me – not as a short-term trend, but as a long-term conviction. I value clear views and disciplined execution. I regularly distil our perspective on the markets into concise analysis and enjoy discussing it with Swiss financial media.",
      "Away from the markets, golf is my passion. I have been playing competitively for many years and have enjoyed a few successes along the way. I still appreciate the competitive side of the game – with ambition, enjoyment and the right sense of perspective. And after a good game, a slice of apple strudel is always welcome.",
    ],
    /* TODO-FR: Übersetzung folgt — DE-Text als Platzhalter. */
    FR: [
      "Mich faszinieren die Kapitalmärkte in all ihren Facetten. Rohstoffe spielen dabei für mich eine besondere Rolle – nicht als kurzfristiger Trend, sondern aus langfristiger Überzeugung. Ich schätze klare Positionen und eine konsequente Umsetzung. Unsere Sicht auf die Märkte bringe ich regelmässig in Analysen auf den Punkt und vertrete sie gerne im Austausch mit Schweizer Börsenmedien.",
      "Abseits der Märkte gehört meine Leidenschaft dem Golf. Ich spiele seit vielen Jahren aktiv und durfte dabei auch den einen oder anderen sportlichen Erfolg feiern. Den Wettbewerb mag ich bis heute – mit Ehrgeiz, Freude am Spiel und der nötigen Gelassenheit. Und nach einer guten Runde darf ein Stück Apfelstrudel nicht fehlen.",
    ],
  },
  jasmina: {
    DE: [
      "Meine Arbeit ist sehr vielseitig – und genau das macht sie für mich spannend. Ich mag es, wenn die vielen kleinen Dinge des Büroalltags ineinandergreifen und am Ende alles zusammenfliesst. Besonders schätze ich dabei den Kontakt mit unterschiedlichen Menschen, ihren Geschichten und Persönlichkeiten.",
      "Mir ist wichtig, dass sich Kunden genauso wie meine Kolleginnen und Kollegen bei uns wohlfühlen. Dazu gehören für mich eine gute Organisation, ein offenes Ohr, ein angenehmes Ambiente und ein Blick für die Details. Denn viele gute Gespräche beginnen ganz einfach bei einer Tasse Kaffee.",
      "Inspiration finde ich auch auf Reisen. Neue Orte, Kulturen und Begegnungen geben mir immer wieder neue Eindrücke und Ideen, die ich gerne mit nach Hause und in meinen Alltag einbringe.",
    ],
    EN: [
      "My role is highly varied – and that is exactly what makes it so rewarding. I enjoy seeing the many details of everyday office life come together seamlessly. Above all, I value meeting different people and getting to know their stories and personalities.",
      "It is important to me that our clients and colleagues alike feel welcome and at ease. Good organisation, an open ear, a pleasant atmosphere and attention to detail all play a part. After all, many good conversations simply begin over a cup of coffee.",
      "I also find inspiration through travel. New places, cultures and encounters give me fresh perspectives and ideas that I enjoy bringing back into my everyday life.",
    ],
    /* TODO-FR: Übersetzung folgt — DE-Text als Platzhalter. */
    FR: [
      "Meine Arbeit ist sehr vielseitig – und genau das macht sie für mich spannend. Ich mag es, wenn die vielen kleinen Dinge des Büroalltags ineinandergreifen und am Ende alles zusammenfliesst. Besonders schätze ich dabei den Kontakt mit unterschiedlichen Menschen, ihren Geschichten und Persönlichkeiten.",
      "Mir ist wichtig, dass sich Kunden genauso wie meine Kolleginnen und Kollegen bei uns wohlfühlen. Dazu gehören für mich eine gute Organisation, ein offenes Ohr, ein angenehmes Ambiente und ein Blick für die Details. Denn viele gute Gespräche beginnen ganz einfach bei einer Tasse Kaffee.",
      "Inspiration finde ich auch auf Reisen. Neue Orte, Kulturen und Begegnungen geben mir immer wieder neue Eindrücke und Ideen, die ich gerne mit nach Hause und in meinen Alltag einbringe.",
    ],
  },
  andreas: {
    DE: [
      "Bei Tellian Capital sorge ich im Hintergrund dafür, dass unsere quantitative Analyse reibungslos läuft und unser Portfoliomanagement sowie Trading auf präzise Daten, verlässliche Modelle und eine disziplinierte Umsetzung bauen können. Mich fasziniert es, Ordnung in komplexe Systeme zu bringen und so das Fundament für fundierte Anlageentscheidungen zu schaffen.",
      "Meine Leidenschaft für Strategie lebe ich auch abseits des Schreibtischs – viele Jahre als Präsident der Schachgesellschaft Zürich, des ältesten Schachklubs der Welt, bei dem ich zum 200-jährigen Jubiläum ein Turnier mit ehemaligen Schachweltmeistern organisieren durfte.",
      "Heute lade ich meine Batterien am liebsten beim Golfen und bei der Entdeckung feiner Weine auf.",
    ],
    EN: [
      "At Tellian Capital, I work behind the scenes to ensure that our quantitative analysis runs seamlessly and that our portfolio management and trading are built on precise data, robust models and disciplined execution. I enjoy bringing structure to complex systems and creating a solid foundation for well-informed investment decisions.",
      "My passion for strategy extends well beyond the office. For many years, I served as President of the Schachgesellschaft Zürich, the world’s oldest chess club, where I had the privilege of organising a tournament with former World Chess Champions to mark its 200th anniversary.",
      "Today, I recharge my batteries on the golf course and through discovering fine wines.",
    ],
    /* TODO-FR: Übersetzung folgt — DE-Text als Platzhalter. */
    FR: [
      "Bei Tellian Capital sorge ich im Hintergrund dafür, dass unsere quantitative Analyse reibungslos läuft und unser Portfoliomanagement sowie Trading auf präzise Daten, verlässliche Modelle und eine disziplinierte Umsetzung bauen können. Mich fasziniert es, Ordnung in komplexe Systeme zu bringen und so das Fundament für fundierte Anlageentscheidungen zu schaffen.",
      "Meine Leidenschaft für Strategie lebe ich auch abseits des Schreibtischs – viele Jahre als Präsident der Schachgesellschaft Zürich, des ältesten Schachklubs der Welt, bei dem ich zum 200-jährigen Jubiläum ein Turnier mit ehemaligen Schachweltmeistern organisieren durfte.",
      "Heute lade ich meine Batterien am liebsten beim Golfen und bei der Entdeckung feiner Weine auf.",
    ],
  },
  olivier: {
    DE: [
      "Die Finanzwelt ist oft komplex und laut. Meine persönliche Motivation als CEO ist es, für unsere Kunden Ruhe, Struktur und langfristige Sicherheit zu schaffen. Dabei fliesst meine langjährige Erfahrung im Investment Banking ein, die meinen Blick auf die Märkte über viele Jahre erweitert hat.",
      "Ich verstehe uns als unabhängige Lotsen, die Ihr Vermögen mit der gleichen Sorgfalt und Hingabe betreuen wie das eigene.",
      "Dieses Vertrauen beginnt bei uns im Haus: Ein offenes, unkompliziertes Verhältnis im Team und kurze Wege sind mir genauso wichtig wie das ehrliche Gespräch mit Ihnen über Ihre Lebenspläne.",
      "Meine Energie und den Fokus hole ich mir beim Sport, mit der Familie und auf Reisen.",
    ],
    EN: [
      "The financial world can often feel complex and noisy. As CEO, my personal motivation is to bring clarity, structure and long-term confidence to our clients. In doing so, I also draw on my many years of experience in investment banking, which have broadened my perspective on the markets over time.",
      "I see us as independent guides, looking after your wealth with the same care and dedication as we would our own. This trust starts within our firm: an open, straightforward team culture and short decision-making paths are just as important to me as honest conversations with you about your life plans.",
      "I find my energy and focus through sport, time with my family and travelling.",
    ],
    /* TODO-FR: Übersetzung folgt — DE-Text als Platzhalter. */
    FR: [
      "Die Finanzwelt ist oft komplex und laut. Meine persönliche Motivation als CEO ist es, für unsere Kunden Ruhe, Struktur und langfristige Sicherheit zu schaffen. Dabei fliesst meine langjährige Erfahrung im Investment Banking ein, die meinen Blick auf die Märkte über viele Jahre erweitert hat.",
      "Ich verstehe uns als unabhängige Lotsen, die Ihr Vermögen mit der gleichen Sorgfalt und Hingabe betreuen wie das eigene.",
      "Dieses Vertrauen beginnt bei uns im Haus: Ein offenes, unkompliziertes Verhältnis im Team und kurze Wege sind mir genauso wichtig wie das ehrliche Gespräch mit Ihnen über Ihre Lebenspläne.",
      "Meine Energie und den Fokus hole ich mir beim Sport, mit der Familie und auf Reisen.",
    ],
  },
};

const UI = {
  DE: { mehr: "Mehr erfahren" },
  EN: { mehr: "Learn more" },
  /* TODO-FR: Übersetzung folgt — DE-Text als Platzhalter. */
  FR: { mehr: "Mehr erfahren" },
} as const;

/* Ohne Schlusspunkt (Kundenwunsch 18.09): kein anderer
   Stationstitel trägt einen. */
const TITEL = ["Das", "Team"] as const;

const initialen = (name: string) =>
  name.split(/\s+/).slice(0, 2).map((t) => t[0]).join("");

interface Props {
  panelRef?: (el: HTMLDivElement | null) => void;
  isVertical?: boolean;
  domId?: string;
  sprache?: "DE" | "EN" | "FR";
  /** Meldet der App, dass das Overlay offen ist — sie sperrt damit
      die Tastatur des waagrechten Tracks. */
  onDetailToggle?: (offen: boolean) => void;
  /** Solutions: Teilmenge der Personen (IDs, Reihenfolge zählt).
      Ohne Angabe das ganze Team — Verhalten der Hauptseite. */
  personenIds?: readonly string[];
  /** Kapitelmarke des schmalen Zweigs (Solutions: «03»/Leiste-Label). */
  /** null blendet die Kapitelmarke aus (Solutions). */
  markeNr?: string | null;
  markeName?: string;
}

export function Station5Team({
  panelRef,
  isVertical = false,
  domId,
  sprache = "DE",
  onDetailToggle,
  personenIds,
  markeNr = "05",
  markeName = "Team",
}: Props) {
  /* Teilmenge in der Reihenfolge der IDs (Solutions führt Olivier
     und Thibaut); ohne Angabe das ganze Team. */
  /* Solutions zeigt nur zwei Porträts und hat entsprechend Raum:
     die Kacheln laufen dort 33 % grösser. Breite UND Höhe gehen
     mit — sonst änderte sich das Kachelverhältnis und damit der
     Ausschnitt des Porträts. */
  const GROSS = 1.33;
  const LEUTE = personenIds
    ? (personenIds
        .map((id) => PERSONEN.find((p) => p.id === id))
        .filter(Boolean) as Person[])
    : PERSONEN;
  const [offenId, setOffenId] = useState<string | null>(null);
  const kachelRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const rueckkehrRef = useRef<HTMLElement | null>(null);

  const oeffnen = (p: Person) => {
    rueckkehrRef.current = kachelRefs.current[p.id] ?? null;
    setOffenId(p.id);
    onDetailToggle?.(true);
  };
  const schliessen = () => {
    setOffenId(null);
    onDetailToggle?.(false);
    /* HIER, nicht im Overlay: das Overlay wird beim Schliessen
       unmountet — sein Effekt auf «offen → false» liefe nie. */
    requestAnimationFrame(() => rueckkehrRef.current?.focus({ preventScroll: true }));
  };

  const offenPerson = PERSONEN.find((p) => p.id === offenId) ?? null;

  const kopf = (
    <h2
      style={{
        margin: 0,
        fontFamily: serif,
        fontSize: "var(--tellian-t5-heading-size)",
        fontWeight: 400,
        lineHeight: "var(--tellian-t5-heading-leading)" as unknown as number,
        letterSpacing: "var(--tellian-t5-heading-tracking)",
        color: C.ink,
      }}
    >
      {TITEL[0]}
      <br />
      <em style={{ fontStyle: "italic", fontWeight: "inherit" }}>{TITEL[1]}</em>
    </h2>
  );

  /* TODO-FOTOS: bisherige Platzhalter-Porträts. */
  const portraet = (person: Person) =>
    person.bild ? (
      <ResponsiveImage
        id={person.bild}
        alt=""
        sizes={isVertical ? "46vw" : "26vw"}
        className="w-full h-full"
        objectPosition="50% 0%"
        style={{ display: "block" }}
      />
    ) : (
      <span
        aria-hidden
        style={{
          fontFamily: serif,
          fontSize: "var(--tellian-t5-initial-size)",
          letterSpacing: "0.06em",
          color: "var(--tellian-t5-placeholder-ink)",
        }}
      >
        {initialen(person.name)}
      </span>
    );

  /* Eine Karte. Mit Text: die GANZE Karte ist der Knopf, darunter
     steht «Mehr erfahren». Ohne Text: kein Bedienelement. */
  const karte = (person: Person, breit: boolean) => {
    const hatText = person.id in TEXTE;
    /* «Namensgeber» heisst englisch «Namesake»; die übrigen Rollen
       sind in beiden Sprachen gleich geschrieben. */
    const rolleText =
      sprache === "EN" && person.rolleEn ? person.rolleEn : person.rolle;
    const innen = (
      <>
        <span
          className="tellian-t5-bild"
          style={{
            display: "flex",
            width: "100%",
            /* Breit füllt das Bild die vorgegebene Reihenhöhe; die
               Kachel ist dabei breiter als das Motiv, cover
               beschneidet oben und unten (gemessen 83 % sichtbar).
               Auf Solutions (Teilmenge) bekommt die Kachel das
               FORMAT des Motivs — dort ist Platz, und das Porträt
               steht vollständig. */
            /* SCHMAL: Hochformat (0.72) statt fast quadratisch.
               Vermessen an der Referenz (Moxion/Rejouice, 390x844):
               dort 0.71 — ein Porträt soll als Porträt lesbar sein.
               Die Datei bleibt der 0.9-Zuschnitt mit kalibrierter
               Augenlinie; cover nimmt 20 % von den Seiten, die
               Augenhöhe im Raster bleibt damit erhalten. */
            ...(breit && !personenIds
              ? { flex: 1, minHeight: 0 }
              : {
                  aspectRatio: breit
                    ? "var(--tellian-t5-tile-ratio)"
                    : "var(--tellian-t5-tile-ratio-schmal)",
                }),
            overflow: "hidden",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "var(--tellian-t5-placeholder-bg)",
          }}
        >
          {portraet(person)}
        </span>
        <span
          style={{
            display: "block",
            marginTop: "var(--tellian-t5-label-gap)",
            /* Nur das breite Band braucht die feste Zeilenhöhe für
               die Kachelflucht; schmal dürfen Name und Rolle
               umbrechen — abgeschnittene Namen sind keine Option.

               Schmal steht die Zeichenreihe UNTER den Texten; der
               Streifen dafür ist hier reserviert. Ohne ihn lief der
               Name (gemessen «Olivier M. Bill» bei 375px) unter den
               Briefumschlag. */
            ...(breit
              ? { height: "var(--tellian-t5-label-row)", overflow: "hidden" }
              : null),
          }}
        >
          <span
            style={{
              display: "block",
              fontFamily: sans,
              fontSize: breit
                ? "var(--tellian-t5-name-size)"
                : "var(--tellian-t5-name-size-schmal)",
              fontWeight: breit ? undefined : 500,
              lineHeight: "var(--tellian-t5-name-leading)" as unknown as number,
              color: C.ink,
              ...(breit
                ? { whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }
                : {
                    /* Zwei Zeilen fest — zusammen mit der ebenso
                       gedeckelten Rollenzeile stehen alle Kacheln
                       gleich hoch, egal wie lang der Name ist. */
                    minHeight:
                      "calc(var(--tellian-t5-name-zeilen) * var(--tellian-t5-name-size-schmal) * var(--tellian-t5-name-leading))",
                  }),
            }}
          >
            {/* PLATZHALTER FÜR DIE ZEICHEN, nur in der ERSTEN Zeile.
                Ein Innenabstand hätte jede Zeile verschmälert — bei
                320px blieben dann 66px, und «Bryan Anthony Honegger»
                brauchte drei Zeilen statt zwei (gemessen). Der
                gefloatete Block schiebt nur die erste Zeile zur
                Seite; die zweite nutzt die volle Spaltenbreite. */}
            {!breit && (person.linkedin || !OHNE_MAIL.includes(person.id)) && (
              <span
                aria-hidden
                style={{
                  float: "right",
                  /* So hoch wie der Zeichenblock (33px): ein 1px
                     hoher Platzhalter schob nur die erste Zeile zur
                     Seite, die zweite lief dann unter die Zeichen
                     (gemessen bei «Bryan Anthony Honegger»). */
                  height: "var(--tellian-t5-zeichen-hoehe)",
                  width: person.linkedin
                    ? "var(--tellian-t5-zeichen-reserve-zwei)"
                    : "var(--tellian-t5-zeichen-reserve-eins)",
                }}
              />
            )}
            {person.name}
          </span>
          {/* Schmal steht der Platz auch ohne Rollentext: drei
              Personen haben keine Angabe, ihre Kacheln waren
              sonst 35px kürzer als die Nachbarin in derselben
              Reihe. */}
          {(person.rolle !== "" || !breit) && (
            <span
              style={{
                display: "block",
                marginTop: "3px",
                fontFamily: sans,
                fontSize: "var(--tellian-t5-role-size)",
                lineHeight: "var(--tellian-t5-role-leading)",
                color: C.accent,
                ...(breit
                  ? { whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }
                  : {
                      /* Zwei Zeilen fest: sonst schiebt «Head of
                         Portfolio Management» seine Reihe nach unten
                         und die Kacheln stehen ungleich (gemessen
                         289 gegen 307px). */
                      minHeight: "calc(2 * var(--tellian-t5-role-size) * var(--tellian-t5-role-leading))",
                    }),
              }}
            >
              {rolleText}
            </span>
          )}
          {/* «Mehr erfahren» nur im breiten Band. Schmal ist die
              Kachel selbst das Ziel — so hält es auch die Referenz,
              und die Zeile kostete dort eine von vier. Für Tastatur
              und Screenreader ändert sich nichts: die Kachel bleibt
              ein Schalter mit vollständiger Vorlese-Beschriftung. */}
          {hatText && breit && (
            <span
              className="tellian-t5-mehr"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                marginTop: "7px",
                fontFamily: sans,
                fontSize: "12px",
                letterSpacing: "var(--tellian-ls-cta-klein)",
                color: C.ink,
              }}
            >
              {UI[sprache].mehr} <span aria-hidden>→</span>
            </span>
          )}
        </span>
      </>
    );

    /* Der Verweis steht NEBEN der Kachel, nicht in ihr: die Kachel
       ist ein Knopf (öffnet das Porträt), und ein Link im Knopf
       wäre ungültiges Markup und für Tastatur und Screenreader
       zweideutig. Absolut in der Beschriftungszone unten rechts —
       die Namen stehen links, es gibt keine Kollision. */
    /* Beide Zeichen in EINER Reihe. Der Klickbereich wächst nach
       innen (Padding), nicht über die Kachelkante hinaus; das
       Padding ist von 15 auf 12px gekürzt, damit zwei Zeichen
       nebeneinander nicht in die Namenszeile laufen. */
    const zeichenStil: React.CSSProperties = {
      /* Auf Solutions laufen die Kacheln 33 % grösser — die Zeichen
         gehen mit, sonst wirken sie dort verloren. */
      fontSize: personenIds
        ? `calc(var(--tellian-t5-name-size) * ${GROSS})`
        : "var(--tellian-t5-name-size)",
      /* Schmal 8px statt 12: die Zeichen stehen jetzt auf der
         Namenszeile, und «Ludescher» (gemessen 66px, das längste
         unteilbare Wort) braucht bei 320px Schirmbreite jeden
         Punkt. Trefferfläche damit 33px — über der Mindestgrösse
         von 24px, und die KACHEL selbst bleibt das grosse Ziel. */
      padding: breit ? "12px" : "8px",
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      lineHeight: 0,
    };

    /* WO DIE ZEICHENREIHE STEHT
       Breit: auf Höhe der NAMENSZEILE — am Fuss der Karte stand sie
       zwischen zwei Kacheln und las sich als Zeichen der
       nachbarschaftlichen. Die Beschriftung beginnt bei
       (Kartenhöhe − label-row); klar INNERHALB der eigenen Kachel,
       denn mittig in der Lücke stünde sie gleich weit von beiden
       Nachbarn und liesse offen, zu wem sie gehört.

       Schmal: auf der UNTERSTEN Zeile, neben «Mehr erfahren». Zwei
       Zeichen brauchen rund 80px — auf der 150px-Kachel des
       Telefons lief der Name (gemessen «Olivier M. Bill») sonst
       unter den Briefumschlag. Unten ist der Platz frei. */
    const zeichen = (
      <span
        style={{
          position: "absolute",
          /* Breit: auf Höhe der Namenszeile in der Beschriftungszone.
             Schmal: ebenfalls auf der Namenszeile — die eigene
             Zeile darunter ist entfallen (Referenzvergleich 22.09).
             Der Name hält rechts eine Reserve frei, damit nichts
             kollidiert. */
          ...(breit
            ? { top: `calc(100% - var(--tellian-t5-label-row) - 2px)`, margin: "-12px 0 0 0" }
            : {
                top: "calc(var(--tellian-t5-bildhoehe-schmal) + var(--tellian-t5-label-gap))",
                margin: "-10px 0 0 0",
              }),
          right: 0,
          display: "inline-flex",
          alignItems: "center",
        }}
      >
        {/* Mail zuerst, LinkedIn bleibt an der rechten Kante —
            die gewachsene Reihe wandert nach innen, nicht über
            den Rand. */}
        {!OHNE_MAIL.includes(person.id) && (
          <a
            href={mailZiel(person, sprache)}
            aria-label={
              sprache === "EN"
                ? `Write an e-mail to ${person.name}`
                : `${person.name} eine E-Mail schreiben`
            }
            className="tellian-t5-zeichen tellian-t5-mail"
            style={zeichenStil}
          >
            <MailGlyph farbe={C.accent} />
          </a>
        )}
        {person.linkedin && (
          <a
            href={person.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={
              sprache === "EN"
                ? `${person.name} on LinkedIn`
                : `${person.name} auf LinkedIn`
            }
            className="tellian-t5-zeichen tellian-t5-linkedin"
            style={zeichenStil}
          >
            <LinkedInGlyph farbe={C.accent} />
          </a>
        )}
      </span>
    );

    const huelle = (kind: React.ReactNode) => (
      <div
        style={{
          position: "relative",
          display: "flex",
          flexDirection: "column",
          width: "100%",
          height: "100%",
        }}
      >
        {kind}
        {zeichen}
      </div>
    );

    if (!hatText) {
      return huelle(
        <div style={{ display: "flex", flexDirection: "column", width: "100%", height: "100%" }}>
          {innen}
        </div>
      );
    }
    return huelle(
      <button
        type="button"
        ref={(el) => {
          kachelRefs.current[person.id] = el;
        }}
        onClick={() => oeffnen(person)}
        aria-haspopup="dialog"
        aria-label={`${person.name}${rolleText ? ", " + rolleText : ""} — ${UI[sprache].mehr}`}
        className="tellian-t5-kachel"
        style={{
          display: "flex",
          flexDirection: "column",
          width: "100%",
          height: "100%",
          textAlign: "left",
          background: "transparent",
          border: "none",
          padding: 0,
          cursor: "pointer",
        }}
      >
        {innen}
      </button>
    );
  };

  const stil = (
    <style>{`
      .tellian-t5-kachel { outline: none; }
      .tellian-t5-kachel:focus-visible {
        outline: 2px solid var(--tellian-t5-focus);
        outline-offset: 3px;
      }
      .tellian-t5-kachel:hover ~ span .tellian-t5-zeichen,
      .tellian-t5-kachel:hover .tellian-t5-zeichen { opacity: 0.75; transition: opacity 180ms ease; }
      .tellian-t5-zeichen:hover, .tellian-t5-zeichen:focus-visible { opacity: 1; }
      .tellian-t5-zeichen:focus-visible {
        outline: 2px solid var(--tellian-accent);
        outline-offset: 2px;
      }
      .tellian-t5-mehr { text-decoration: underline; text-underline-offset: 4px; }
      .tellian-t5-bild picture { display: block; width: 100%; height: 100%; }
      .tellian-t5-bild img { width: 100%; height: 100%; object-fit: cover; }
    `}</style>
  );

  const detail = offenPerson && (
    <TeamDetail
      offen
      name={offenPerson.name}
      rolle={
        sprache === "EN" && offenPerson.rolleEn
          ? offenPerson.rolleEn
          : offenPerson.rolle
      }
      bild={offenPerson.bildDetail ?? offenPerson.bild}
      augenlinie={offenPerson.augenlinie}
      absaetze={TEXTE[offenPerson.id][sprache]}
      sprache={sprache}
      isMobile={isVertical}
      onClose={schliessen}
      returnFocusRef={rueckkehrRef}
    />
  );

  /* ── SCHMAL: zwei Spalten ── */
  if (isVertical) {
    return (
      <section
        id={domId}
        style={{ backgroundColor: C.bg, scrollMarginTop: "var(--tellian-kopf-height)" }}
      >
        <div
          style={{
            paddingTop: "var(--tellian-abschnitt-luft-schmal)",
            paddingBottom: "var(--tellian-abschnitt-luft-schmal)",
            paddingLeft: "clamp(18px, 4.6vw, 40px)",
            paddingRight: "clamp(18px, 4.6vw, 40px)",
          }}
        >
          {markeNr !== null && (
            <div style={{ marginBottom: "clamp(28px, 4vh, 44px)" }}>
              <Kapitelmarke nr={markeNr} name={markeName} />
            </div>
          )}
          <Aufgang>{kopf}</Aufgang>
          <div
            style={{
              marginTop: "clamp(28px, 4vh, 44px)",
              display: "grid",
              gridTemplateColumns: "repeat(var(--tellian-t5-cols-schmal), minmax(0, 1fr))",
              /* Mehr senkrechte als waagrechte Luft: die Beschriftung
                 gehört zu IHRER Kachel, nicht zur nächsten Reihe. */
              /* Dichter Kontaktbogen statt getrennter Karten
                 (Referenz: 5px Spalten-, 72px Zeilenabstand). Bei
                 uns 8px — unter den Bildern stehen zwei Textspalten
                 nebeneinander, die brauchen eine erkennbare Fuge. */
              columnGap: "8px",
              rowGap: "clamp(22px, 3vh, 30px)",
            }}
          >
            {LEUTE.map((person, i) => (
              <Aufgang key={person.id} stufe={i % 2}>{karte(person, false)}</Aufgang>
            ))}
          </div>
        </div>
        {detail}
        {stil}
      </section>
    );
  }

  /* ── BREIT: Titelspalte + zwei Reihen à fünf Kacheln ── */
  const { wurzelRef, oben: kopfOben } = useTitelHoehe(!isVertical);

  return (
    <div
      ref={(el) => {
        panelRef?.(el);
        (wurzelRef as React.MutableRefObject<HTMLDivElement | null>).current = el;
      }}
      className="flex-shrink-0 h-screen relative"
      style={{
        width: personenIds ? "100vw" : "var(--tellian-t5-section-width)",
        backgroundColor: C.bg,
      }}
    >
      <div
        style={{
          position: "absolute",
          top: "var(--tellian-kopf-height)",
          bottom: "var(--tellian-station-height)",
          left: 0,
          right: 0,
          display: "flex",
          alignItems: "stretch",
          paddingLeft:
            "calc(var(--tellian-rail-width) + var(--tellian-station-pad-x))",
          paddingRight: "var(--tellian-station-pad-x)",
          paddingTop: "var(--tellian-s1-stage-pad)",
          paddingBottom: "var(--tellian-s1-stage-pad)",
          boxSizing: "border-box",
        }}
      >
        {/* ══ Titelspalte ══ */}
        <div
          style={{
            flex: "0 0 var(--tellian-t5-title-col)",
            marginRight: "var(--tellian-t5-mid-gap)",
            position: "relative",
          }}
        >
          <div
            style={{
              position: "absolute",
              left: 0,
              ...(kopfOben === null
                ? { top: "50%", transform: "translateY(-50%)" }
                : { top: `calc(${kopfOben}px - var(--tellian-s1-stage-pad))` }),
              width: "max-content",
            }}
          >
            {kopf}
          </div>
        </div>

        {/* ══ Kachelreihen ══ */}
        <div
          style={{
            /* Teilmenge (Solutions): die Reihe misst sich an ihren
               Kacheln — die inhaltsbreite Fünferreihe der Hauptseite
               wäre breiter als die 100vw-Station. */
            flex: personenIds ? "1 1 auto" : "0 0 var(--tellian-t5-row-w)",
            minWidth: 0,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
          }}
        >
          {(LEUTE.length > 5 ? [0, 1] : [0]).map((reihe) => (
            <ul
              key={reihe}
              style={{
                listStyle: "none",
                margin: reihe === 0 ? "0" : "var(--tellian-t5-row-gap) 0 0",
                padding: 0,
                display: "flex",
                gap: "var(--tellian-t5-gap)",
                /* Teilmenge: die Hoehe ergibt sich aus dem Bildformat,
                   nicht aus der Reihenvorgabe. */
                height: personenIds
                  ? "auto"
                  : "calc(var(--tellian-t5-row-h) + var(--tellian-t5-label-row)" +
                    " + var(--tellian-t5-label-gap))",
              }}
            >
              {LEUTE.slice(reihe * 5, reihe * 5 + 5).map((person) => (
                <li
                  key={person.id}
                  style={{
                    /* Teilmenge: feste Kachelbreite statt Fünftelung —
                       zwei Kacheln würden sonst die halbe Reihe füllen. */
                    flex: personenIds
                      ? `0 0 clamp(${240 * GROSS}px, ${21 * GROSS}vw, ${320 * GROSS}px)`
                      : "1 1 0",
                    minWidth: 0,
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  {karte(person, true)}
                </li>
              ))}
            </ul>
          ))}
        </div>
      </div>
      {detail}
      {stil}
    </div>
  );
}
