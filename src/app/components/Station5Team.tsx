import { useRef, useState } from "react";

import { C, sans, serif } from "../tokens";
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
  bild?: ImageId;
}

const PERSONEN: readonly Person[] = [
  /* TODO-TEXT-WILHELM-TELL: kein persönlicher Text geliefert. */
  { id: "wilhelm", name: "Wilhelm Tell", rolle: "Namensgeber", bild: "wilhelm-tell" },
  { id: "olivier", name: "Olivier M. Bill", rolle: "CEO", bild: "olivier-bill" },
  { id: "marco", name: "Marco Ludescher", rolle: "Head of Portfolio Management", bild: "marco-ludescher" },
  { id: "rolf", name: "Rolf Schneider", rolle: "Relationship Manager", bild: "rolf-schneider" },
  /* TODO-TEXT-BRYAN: kein persönlicher Text geliefert. */
  { id: "bryan", name: "Bryan Anthony Honegger", rolle: "Relationship Manager", bild: "bryan-honegger" },
  { id: "andreas", name: "Andreas Trümpler", rolle: "Risk Management", bild: "andreas-truempler" },
  { id: "jasmina", name: "Jasmina Rukavina", rolle: "Back-Office / Office Management", bild: "jasmina-rukavina" },
  /* TODO-TEXT-JOERG-BODE: kein persönlicher Text geliefert. */
  { id: "joerg", name: "Jörg Bode", rolle: "Rolle offen" },
  /* TODO-TEXT-THIBAUT: kein persönlicher Text geliefert.
     TODO-KONTAKT-THIBAUT: Vorname/Nachname/Tag ausstehend. */
  { id: "thibaut", name: "Thibaut", rolle: "Rolle offen" },
  /* TODO-TEXT-STEFAN-MUELLER: kein persönlicher Text geliefert. */
  { id: "stefan", name: "Stefan Müller", rolle: "Rolle offen" },
];

/* ── PERSONENTEXTE — wörtlich aus dem Briefing, Absatzstruktur
      exakt (2 bzw. 3 Absätze), ohne Auszeichnungen. ── */
type L = "DE" | "EN" | "FR";

const TEXTE: Readonly<Record<string, Readonly<Record<L, readonly string[]>>>> = {
  rolf: {
    DE: [
      "Bei Tellian Capital konzentriere ich mich auf zwei Bereiche, die mir seit jeher besonders am Herzen liegen: den persönlichen Austausch mit unseren Kunden und das quantitative Portfoliomanagement. Als Gründungspartner habe ich das Fundament der heutigen Tellian Capital – vormals Blumer & Partner – mitgelegt und das Unternehmen seit der Jahrtausendwende durch ganz unterschiedliche Marktphasen geführt. Heute schätze ich es besonders, diese Erfahrung weiterzugeben und gleichzeitig nah am täglichen Geschehen zu bleiben.",
      "Neben meiner Arbeit ist meine Familie mein wichtigster Anker. Eine Leidenschaft begleitet mich schon fast mein ganzes Leben: der Rennsport. Ob auf Asphalt, Schnee oder Eis – ich bin viele Jahre selbst Rennen gefahren. Besonders die Nordschleife des Nürburgrings kenne ich dabei Kurve für Kurve.",
    ],
    EN: [
      "At Tellian Capital, I focus on two areas that have always been particularly close to me: personal relationships with our clients and quantitative portfolio management. As a founding partner, I helped lay the foundations of today's Tellian Capital – formerly Blumer & Partner – and have guided the firm through very different market environments since the turn of the millennium. Today, I particularly value the opportunity to pass on this experience while remaining closely involved in the day-to-day business.",
      "Outside of work, my family is my most important anchor. Another passion has been with me for almost my entire life: motor racing. Whether on asphalt, snow or ice, I spent many years racing myself. And when it comes to the Nürburgring's Nordschleife, I know every corner.",
    ],
    /* TODO-FR: Übersetzung folgt — DE-Text als Platzhalter. */
    FR: [
      "Bei Tellian Capital konzentriere ich mich auf zwei Bereiche, die mir seit jeher besonders am Herzen liegen: den persönlichen Austausch mit unseren Kunden und das quantitative Portfoliomanagement. Als Gründungspartner habe ich das Fundament der heutigen Tellian Capital – vormals Blumer & Partner – mitgelegt und das Unternehmen seit der Jahrtausendwende durch ganz unterschiedliche Marktphasen geführt. Heute schätze ich es besonders, diese Erfahrung weiterzugeben und gleichzeitig nah am täglichen Geschehen zu bleiben.",
      "Neben meiner Arbeit ist meine Familie mein wichtigster Anker. Eine Leidenschaft begleitet mich schon fast mein ganzes Leben: der Rennsport. Ob auf Asphalt, Schnee oder Eis – ich bin viele Jahre selbst Rennen gefahren. Besonders die Nordschleife des Nürburgrings kenne ich dabei Kurve für Kurve.",
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
      "My passion for strategy extends well beyond the office. For many years, I served as President of the Schachgesellschaft Zürich, the world's oldest chess club, where I had the privilege of organising a tournament with former World Chess Champions to mark its 200th anniversary.",
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
      "Die Finanzwelt ist oft komplex und laut. Meine persönliche Motivation als CEO ist es, für unsere Kunden Ruhe, Struktur und langfristige Sicherheit zu schaffen. Ich verstehe uns als unabhängige Lotsen, die Ihr Vermögen mit der gleichen Sorgfalt und Hingabe betreuen wie das eigene.",
      "Dieses Vertrauen beginnt bei uns im Haus: Ein offenes, unkompliziertes Verhältnis im Team und kurze Wege sind mir genauso wichtig wie das ehrliche Gespräch mit Ihnen über Ihre Lebenspläne.",
      "Meine Energie und den Fokus hole ich mir beim Sport, mit der Familie und auf Reisen.",
    ],
    EN: [
      "The financial world can often feel complex and noisy. As CEO, my personal motivation is to bring clarity, structure and long-term confidence to our clients. I see our role as an independent guide, looking after your wealth with the same care and commitment we would apply to our own.",
      "For me, trust starts within our firm. An open and straightforward relationship within the team, short decision-making paths and direct communication are just as important as an honest conversation with you about your plans and ambitions.",
      "I find my energy and focus through sport, time with my family and travelling.",
    ],
    /* TODO-FR: Übersetzung folgt — DE-Text als Platzhalter. */
    FR: [
      "Die Finanzwelt ist oft komplex und laut. Meine persönliche Motivation als CEO ist es, für unsere Kunden Ruhe, Struktur und langfristige Sicherheit zu schaffen. Ich verstehe uns als unabhängige Lotsen, die Ihr Vermögen mit der gleichen Sorgfalt und Hingabe betreuen wie das eigene.",
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

const TITEL = ["Das", "Team."] as const;

const initialen = (name: string) =>
  name.split(/\s+/).slice(0, 2).map((t) => t[0]).join("");

interface Props {
  panelRef?: (el: HTMLDivElement | null) => void;
  isVertical?: boolean;
  domId?: string;
  sprache?: "DE" | "EN";
  /** Meldet der App, dass das Overlay offen ist — sie sperrt damit
      die Tastatur des waagrechten Tracks. */
  onDetailToggle?: (offen: boolean) => void;
}

export function Station5Team({
  panelRef,
  isVertical = false,
  domId,
  sprache = "DE",
  onDetailToggle,
}: Props) {
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
    const innen = (
      <>
        <span
          className="tellian-t5-bild"
          style={{
            display: "flex",
            width: "100%",
            ...(breit
              ? { flex: 1, minHeight: 0 }
              : { aspectRatio: "var(--tellian-t5-tile-ratio)" }),
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
            height: "var(--tellian-t5-label-row)",
            overflow: "hidden",
          }}
        >
          <span
            style={{
              display: "block",
              fontFamily: sans,
              fontSize: "var(--tellian-t5-name-size)",
              lineHeight: "var(--tellian-t5-name-leading)" as unknown as number,
              color: C.ink,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {person.name}
          </span>
          <span
            style={{
              display: "block",
              marginTop: "3px",
              fontFamily: sans,
              fontSize: "var(--tellian-t5-role-size)",
              lineHeight: "var(--tellian-t5-role-leading)",
              color: C.accent,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {person.rolle}
          </span>
          {hatText && (
            <span
              className="tellian-t5-mehr"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                marginTop: "7px",
                fontFamily: sans,
                fontSize: "12px",
                letterSpacing: "0.06em",
                color: C.ink,
              }}
            >
              {UI[sprache].mehr} <span aria-hidden>→</span>
            </span>
          )}
        </span>
      </>
    );

    if (!hatText) {
      return (
        <div style={{ display: "flex", flexDirection: "column", width: "100%", height: "100%" }}>
          {innen}
        </div>
      );
    }
    return (
      <button
        type="button"
        ref={(el) => {
          kachelRefs.current[person.id] = el;
        }}
        onClick={() => oeffnen(person)}
        aria-haspopup="dialog"
        aria-label={`${person.name}, ${person.rolle} — ${UI[sprache].mehr}`}
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
      .tellian-t5-kachel:hover .tellian-t5-mehr { text-decoration: underline; text-underline-offset: 4px; }
      .tellian-t5-bild picture { display: block; width: 100%; height: 100%; }
      .tellian-t5-bild img { width: 100%; height: 100%; object-fit: cover; }
    `}</style>
  );

  const detail = offenPerson && (
    <TeamDetail
      offen
      name={offenPerson.name}
      rolle={offenPerson.rolle}
      bild={offenPerson.bild}
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
            paddingLeft: "clamp(20px, 6vw, 48px)",
            paddingRight: "clamp(20px, 6vw, 48px)",
          }}
        >
          {kopf}
          <div
            style={{
              marginTop: "clamp(28px, 4vh, 44px)",
              display: "grid",
              gridTemplateColumns: "repeat(var(--tellian-t5-cols-schmal), minmax(0, 1fr))",
              gap: "clamp(16px, 3.6vw, 24px)",
            }}
          >
            {PERSONEN.map((person) => (
              <div key={person.id}>{karte(person, false)}</div>
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
      style={{ width: "var(--tellian-t5-section-width)", backgroundColor: C.bg }}
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
            "calc(var(--tellian-rail-width) + clamp(28px, 3.4vw, 56px))",
          paddingRight: "clamp(28px, 3.4vw, 56px)",
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
            flex: "0 0 var(--tellian-t5-row-w)",
            minWidth: 0,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
          }}
        >
          {[0, 1].map((reihe) => (
            <ul
              key={reihe}
              style={{
                listStyle: "none",
                margin: reihe === 0 ? "0" : "var(--tellian-t5-row-gap) 0 0",
                padding: 0,
                display: "flex",
                gap: "var(--tellian-t5-gap)",
                height:
                  "calc(var(--tellian-t5-row-h) + var(--tellian-t5-label-row)" +
                  " + var(--tellian-t5-label-gap))",
              }}
            >
              {PERSONEN.slice(reihe * 5, reihe * 5 + 5).map((person) => (
                <li
                  key={person.id}
                  style={{
                    flex: "1 1 0",
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
