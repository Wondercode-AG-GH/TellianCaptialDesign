import { useCallback, useEffect, useRef, useState } from "react";

import { C, cormorant, sans } from "../tokens";
import { ResponsiveImage } from "./ResponsiveImage";
import { useTitelHoehe } from "./useTitelHoehe";
import type { ImageId } from "../../assets/generated";

/* ═══════════════════════════════════════════════════════════
   STATION 5 — TEAM

   Eine Reihe aus zehn Porträtstreifen. Wer gezeigt wird, öffnet
   sich; die übrigen weichen zusammen.

   WARUM IN DIE BREITE UND NICHT IN DIE HÖHE
   Das frühere Raster aus fünf Spalten hatte bei 1512px Fenster
   Kacheln von 167×208. Eine Story von 30 Wörtern brauchte gemessene
   216px und passte erst ab rund 1900px Fensterbreite hinein. Wächst
   der Streifen dagegen in die BREITE, bleibt die Reihenhöhe stehen
   und der Text bekommt Platz, ohne dass irgendetwas wandert.

   Nebeneffekt, der die Sache trägt: geschlossen ist ein Streifen
   schmal und hoch, geöffnet nähert er sich dem Format der Porträts
   selbst (2:3). Das Bild wird beim Öffnen also nicht beschnitten,
   sondern vollständiger.

   WARUM DER TITEL LINKS STEHT UND DIE STATION ÜBERSTEHT
   Der Titel sitzt auf der Höhe des Titels von Station 3 (siehe
   useTitelHoehe). Die Reihen rücken dafür um eine Titelspalte nach
   rechts, und die Station wird um genau diese Spalte breiter — sie
   ist damit 106 bis 113vw breit, und die letzte Spalte Porträts
   kommt erst beim Weiterscrollen herein. Die Reihenbreite steht
   fest (--tellian-t5-row-w), damit die Kacheln GENAU ihre bisherige
   Grösse behalten.

   WARUM DER VOLLE NAME UNTER DER KACHEL STEHT
   Um die Personen geht es hier, nicht um die Kacheln. Der Name
   bekommt deshalb zwei fest reservierte Zeilen: die langen brechen
   um, die kurzen lassen die zweite Zeile leer — so bleibt die
   untere Reihe auf ihrer Linie stehen.
   ═══════════════════════════════════════════════════════════ */

const STORY_PLATZHALTER =
  "Platzhalter. Hier steht die persönliche Story — zwei bis drei Sätze, " +
  "maximal rund 30 Wörter. Noch nicht von Tellian geliefert.";

interface Person {
  name: string;
  rolle: string;
  bild?: ImageId;
  story?: string;
}

const PERSONEN: readonly Person[] = [
  { name: "Wilhelm Tell", rolle: "Namensgeber", bild: "wilhelm-tell" },
  { name: "Olivier M. Bill", rolle: "CEO", bild: "olivier-bill" },
  { name: "Marco Ludescher", rolle: "Head of Portfolio Management", bild: "marco-ludescher" },
  { name: "Rolf Schneider", rolle: "Relationship Manager", bild: "rolf-schneider" },
  { name: "Bryan Anthony Honegger", rolle: "Relationship Manager", bild: "bryan-honegger" },
  { name: "Andreas Trümpler", rolle: "Risk Management", bild: "andreas-truempler" },
  { name: "Jasmina Rukavina", rolle: "Back-Office / Office Management", bild: "jasmina-rukavina" },
  { name: "Jörg Bode", rolle: "Rolle offen" },
  { name: "Thibaut", rolle: "Rolle offen" },
  { name: "Stefan Müller", rolle: "Rolle offen" },
];

/* Ein Etikett, kein Satz — wie "Portfolio / Management" in
   Station 3. Zwei Zeilen, die zweite kursiv. */
const TITEL = ["Das", "Team."] as const;

const initialen = (name: string) =>
  name.split(/\s+/).slice(0, 2).map((t) => t[0]).join("");

const LINKEDIN = "https://www.linkedin.com/company/tellian-capital";

/* Gemessen: beim Weg aus der Reihe streift der Zeiger bis zu drei
   fremde Kacheln. Ohne Verzug zog jede davon auf. */
const OEFFNEN_VERZUG = 70;
const SCHLIESSEN_VERZUG = 90;

interface Props {
  panelRef?: (el: HTMLDivElement | null) => void;
  isVertical?: boolean;
  domId?: string;
  onContactClick?: () => void;
}

export function Station5Team({
  panelRef,
  isVertical = false,
  domId,
  onContactClick,
}: Props) {
  /* ZWEI ZUSTÄNDE STATT EINEM
     `schwebt` ist flüchtig und folgt dem Zeiger, `fixiert` bleibt
     stehen. Wer eine Person anklickt, kann die Maus wegnehmen und
     lesen; wer nur darüberfährt, verliert die Story wieder.
     Vorrang hat der Zeiger — sonst müsste man erst abwählen, um
     jemand anderen anzusehen. */
  const [schwebt, setSchwebt] = useState<number | null>(null);
  const [fixiert, setFixiert] = useState<number | null>(null);
  const aktiv = schwebt ?? fixiert;

  const kachelRefs = useRef<(HTMLButtonElement | null)[]>([]);
  /* Ohne Ref läse `zeigen` beim schnellen Überstreichen einen
     veralteten Wert und verzögerte auch das Umschalten. */
  const aktivRef = useRef<number | null>(null);
  aktivRef.current = aktiv;
  const fixiertRef = useRef<number | null>(null);
  fixiertRef.current = fixiert;
  const uhr = useRef<number | null>(null);

  const stoppen = useCallback(() => {
    if (uhr.current !== null) window.clearTimeout(uhr.current);
    uhr.current = null;
  }, []);

  /* Beim Überstreichen der Reihe soll nicht jede gestreifte Kachel
     aufziehen — erst wer kurz stehen bleibt, öffnet. Ist schon eine
     Story offen, wechselt sie ohne Verzögerung. */
  const zeigen = useCallback(
    (i: number) => {
      stoppen();
      if (aktivRef.current === null) {
        uhr.current = window.setTimeout(() => {
          uhr.current = null;
          setSchwebt(i);
        }, OEFFNEN_VERZUG);
      } else {
        setSchwebt(i);
      }
    },
    [stoppen],
  );

  /* Kurzer Verzug, damit der Spalt zwischen zwei Kacheln die Story
     nicht zum Flackern bringt: die nächste Kachel hebt ihn auf. */
  const verbergen = useCallback(() => {
    stoppen();
    uhr.current = window.setTimeout(() => {
      uhr.current = null;
      setSchwebt(null);
    }, SCHLIESSEN_VERZUG);
  }, [stoppen]);

  useEffect(() => stoppen, [stoppen]);

  /* Schmal gibt es kein Verlassen des Zeigers — dort MUSS der zweite
     Tipp beide Zustände räumen, sonst liesse sich eine Story nie
     wieder schliessen. */
  const waehlen = useCallback((i: number) => {
    stoppen();
    const zu = fixiertRef.current === i;
    setFixiert(zu ? null : i);
    setSchwebt(zu ? null : i);
  }, [stoppen]);

  const schliessen = useCallback(() => {
    stoppen();
    const zurueck = aktivRef.current;
    setSchwebt(null);
    setFixiert(null);
    if (zurueck !== null) kachelRefs.current[zurueck]?.focus();
  }, [stoppen]);

  useEffect(() => {
    if (aktiv === null) return;
    const auf = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        schliessen();
      }
    };
    document.addEventListener("keydown", auf);
    return () => document.removeEventListener("keydown", auf);
  }, [aktiv, schliessen]);

  /* Titel auf Höhe des Titels der Nachbarstation — siehe
     useTitelHoehe. Ohne Referenz bleibt es beim mittigen Titel. */
  const { wurzelRef, oben: kopfOben } = useTitelHoehe(!isVertical);

  /* Hin und zurück verschieden lang — siehe theme.css. */
  const takt = (eigenschaft: string, auf: boolean) =>
    `${eigenschaft} var(--tellian-t5-panel-ms${auf ? "" : "-zu"})` +
    " var(--tellian-t5-panel-ease)";

  /* Nur der Titel, ohne Zusatzzeile rechts — damit steht der Kopf
     wie in den Stationen 1 bis 3. */
  const kopf = (
    <h2
      style={{
        margin: 0,
        fontFamily: cormorant,
        fontSize: "var(--tellian-t5-heading-size)",
        fontWeight: "var(--tellian-t5-heading-weight)" as unknown as number,
        lineHeight: "var(--tellian-t5-heading-leading)" as unknown as number,
        letterSpacing: "var(--tellian-t5-heading-tracking)",
        color: C.ink,
      }}
    >
      {TITEL[0]}
      <br />
      <em style={{ fontStyle: "italic", fontWeight: "inherit" }}>
        {TITEL[1]}
      </em>
    </h2>
  );

  /* KEIN object-position MEHR
     Die Kopfhöhe steckt jetzt im Bild selbst: jede Quelle ist in der
     Bildaufbereitung auf 4:5 beschnitten, Kopfoberkante auf 6 % der
     Ausschnitthöhe, Kopfhöhe auf 29 % — siehe scripts/optimize-images.mjs.

     Vorher stand hier für alle derselbe Versatz "50% 26%". Das kann
     nicht aufgehen, weil die Köpfe in den Quellen zwischen 9.5 % und
     23.0 % der Bildhöhe sitzen: derselbe Versatz setzte Rolf oben an
     und liess über Marco eine Handbreit Luft.

     4:5 ist schmaler als jede Kachelform (gemessen 0.80 bis 1.03, beim
     Auswählen breiter). object-fit: cover beschneidet dadurch nur noch
     links und rechts — die Kopfhöhe steht auf jeder Fensterbreite und
     in jedem Zustand fest. Genau die Rolle, die cover haben soll:
     Sicherheitsnetz, nicht Werkzeug für den Ausschnitt. */
  const portraet = (person: Person) =>
    person.bild ? (
      <ResponsiveImage
        id={person.bild}
        alt=""
        sizes={isVertical ? "46vw" : "26vw"}
        className="w-full h-full"
        style={{ display: "block" }}
      />
    ) : (
      <span
        aria-hidden
        style={{
          fontFamily: cormorant,
          fontSize: "var(--tellian-t5-initial-size)",
          fontWeight: 300,
          letterSpacing: "0.06em",
          color: "var(--tellian-t5-placeholder-ink)",
        }}
      >
        {initialen(person.name)}
      </span>
    );

  const panelInhalt = (person: Person) => (
    <>
      <span
        style={{
          display: "block",
          fontFamily: cormorant,
          fontSize: "var(--tellian-t5-full-name-size)",
          fontWeight: 300,
          lineHeight: 1.1,
          color: "var(--tellian-t5-panel-ink)",
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
          color: "var(--tellian-t5-panel-dim)",
        }}
      >
        {person.rolle}
      </span>
      <span
        style={{
          display: "block",
          marginTop: "10px",
          fontFamily: sans,
          fontSize: "var(--tellian-t5-story-size)",
          lineHeight: "var(--tellian-t5-story-leading)",
          color: "var(--tellian-t5-panel-dim)",
        }}
      >
        {person.story ?? STORY_PLATZHALTER}
      </span>
      <span
        style={{
          display: "flex",
          alignItems: "center",
          gap: "12px",
          marginTop: "12px",
          fontFamily: sans,
          fontSize: "var(--tellian-t5-link-size)",
        }}
      >
        <button
          type="button"
          onClick={onContactClick}
          className="tellian-t5-verweis"
          style={{
            background: "transparent", border: "none", padding: 0,
            cursor: "pointer", fontFamily: sans,
            fontSize: "var(--tellian-t5-link-size)",
            color: "var(--tellian-t5-panel-ink)",
          }}
        >
          Nachricht
        </button>
        <span aria-hidden style={{ color: "var(--tellian-t5-panel-dim)" }}>·</span>
        <a
          href={LINKEDIN}
          target="_blank"
          rel="noopener noreferrer"
          className="tellian-t5-verweis"
          style={{ color: "var(--tellian-t5-panel-ink)", textDecoration: "none" }}
        >
          LinkedIn
        </a>
      </span>
    </>
  );

  const stil = (
    <style>{`
      .tellian-t5-kachel:focus-visible,
      .tellian-t5-verweis:focus-visible {
        outline: 2px solid var(--tellian-t5-focus);
        outline-offset: 3px;
      }
      /* <picture> ist von Haus aus inline und nimmt die Grösse des
         Bildes an — der Kasten blieb dadurch bei schmalen Streifen
         zur Hälfte leer. Erst display:block dehnt es. */
      .tellian-t5-bild picture { display: block; width: 100%; height: 100%; }
      .tellian-t5-bild img { width: 100%; height: 100%; object-fit: cover; }
      .tellian-t5-verweis {
        text-underline-offset: 4px;
        /* Trefferfläche, ohne die Schrift zu ändern. */
        display: inline-flex;
        align-items: center;
        min-height: var(--tellian-tippziel);
        padding: 12px 0;
        margin: -12px 0;
      }
      .tellian-t5-verweis:hover { text-decoration: underline; }
      @media (prefers-reduced-motion: reduce) {
        .tellian-t5-streifen, .tellian-t5-panel, .tellian-t5-name,
        .tellian-t5-kachel img { transition: none !important; }
      }
    `}</style>
  );

  /* ── SCHMAL ──
     Kein Aufziehen: zwei Spalten, und die Story klappt unter der
     REIHE auf, nicht am Seitenende. */
  if (isVertical) {
    const reihen: Person[][] = [];
    for (let i = 0; i < PERSONEN.length; i += 2) reihen.push(PERSONEN.slice(i, i + 2));

    return (
      <section id={domId} style={{ backgroundColor: C.bg }}>
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
              gap: "clamp(12px, 3vw, 20px)",
            }}
          >
            {reihen.map((reihe, r) => {
              const inReihe = aktiv !== null && Math.floor(aktiv / 2) === r ? aktiv : null;
              return (
                <div key={r} style={{ display: "contents" }}>
                  {reihe.map((person, s) => {
                    const i = r * 2 + s;
                    const gewaehlt = aktiv === i;
                    return (
                      <button
                        key={person.name}
                        ref={(el) => { kachelRefs.current[i] = el; }}
                        type="button"
                        onClick={() => waehlen(i)}
                        aria-expanded={gewaehlt}
                        aria-label={`${person.name}, ${person.rolle}`}
                        className="tellian-t5-kachel"
                        style={{
                          display: "block", width: "100%", textAlign: "left",
                          background: "transparent", border: "none", padding: 0,
                          cursor: "pointer",
                          opacity: aktiv !== null && !gewaehlt ? "var(--tellian-t5-dim)" : 1,
                          transition: "opacity 220ms ease",
                        }}
                      >
                        <span
                          className="tellian-t5-bild"
                          style={{
                            display: "flex", width: "100%",
                            aspectRatio: "var(--tellian-t5-tile-ratio)",
                            overflow: "hidden", alignItems: "center",
                            justifyContent: "center",
                            backgroundColor: "var(--tellian-t5-placeholder-bg)",
                          }}
                        >
                          {portraet(person)}
                        </span>
                        <span
                          style={{
                            display: "block", marginTop: "8px",
                            height: "var(--tellian-t5-label-height-schmal)",
                            overflow: "hidden",
                          }}
                        >
                          <span
                            style={{
                              display: "block", fontFamily: sans,
                              fontSize: "var(--tellian-t5-name-size-schmal)",
                              lineHeight: "var(--tellian-t5-name-leading)" as unknown as number,
                              color: C.ink,
                            }}
                          >
                            {person.name}
                          </span>
                          <span
                            style={{
                              display: "block", marginTop: "3px", fontFamily: sans,
                              fontSize: "var(--tellian-t5-role-size)",
                              lineHeight: "var(--tellian-t5-role-leading)",
                              color: C.accent,
                            }}
                          >
                            {person.rolle}
                          </span>
                        </span>
                      </button>
                    );
                  })}

                  <div
                    style={{
                      gridColumn: "1 / -1",
                      display: "grid",
                      gridTemplateRows: inReihe !== null ? "1fr" : "0fr",
                      transition:
                        "grid-template-rows var(--tellian-t5-panel-ms) var(--tellian-t5-panel-ease)",
                    }}
                  >
                    <div style={{ overflow: "hidden", minHeight: 0 }}>
                      <div
                        style={{
                          backgroundColor: "var(--tellian-t5-panel-bg)",
                          padding: "clamp(16px, 4vw, 24px)",
                        }}
                      >
                        {panelInhalt(PERSONEN[inReihe ?? r * 2])}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        {stil}
      </section>
    );
  }

  /* ── BREIT ── */
  return (
    <div
      ref={(el) => {
        wurzelRef.current = el;
        panelRef?.(el);
      }}
      className="flex-shrink-0 h-screen relative"
      style={{
        width: "var(--tellian-t5-section-width)",
        backgroundColor: C.bg,
      }}
    >
      <div
        onMouseLeave={verbergen}
        style={{
          /* Nur die TEXTBÜHNE weicht den beiden Bändern aus.
             Flächen und Bilder laufen darunter durch. */
          position: "absolute",
          top: "var(--tellian-kopf-height)",
          bottom: "var(--tellian-station-height)",
          left: 0,
          right: 0,
          display: "flex",
          alignItems: "stretch",
          paddingLeft: "var(--tellian-titel-links)",
          paddingRight: "clamp(24px, 2.8vw, 48px)",
          paddingTop: "var(--tellian-s1-stage-pad)",
          paddingBottom: "var(--tellian-s1-stage-pad)",
          boxSizing: "border-box",
        }}
      >
        {/* ══ Titelspalte ══
            Nur Platzhalter für die Breite; der Titel selbst hängt
            absolut auf der gemessenen Höhe der Nachbarstation. */}
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
              /* Der Kasten der Station beginnt hinter dem oberen
                 Innenabstand — die gemessene Höhe zählt aber ab der
                 Stationsoberkante. */
              ...(kopfOben === null
                ? { top: "50%", transform: "translateY(-50%)" }
                : { top: `calc(${kopfOben}px - var(--tellian-s1-stage-pad))` }),
              width: "max-content",
            }}
          >
            {kopf}
          </div>
        </div>

        {/* ══ Kachelreihen ══
            Feste Breite: die Kacheln teilen sie zu fünft und behalten
            damit genau ihre bisherige Grösse. */}
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
              margin:
                reihe === 0
                  ? "0"
                  : "var(--tellian-t5-row-gap) 0 0",
              padding: 0,
              display: "flex",
              gap: "var(--tellian-t5-gap)",
              height:
                "calc(var(--tellian-t5-row-h) + var(--tellian-t5-label-row)" +
                " + var(--tellian-t5-label-gap))",
            }}
          >
            {PERSONEN.slice(reihe * 5, reihe * 5 + 5).map((person, s) => {
              const i = reihe * 5 + s;
              const gewaehlt = aktiv === i;
              const gedimmt = aktiv !== null && !gewaehlt;
              return (
                <li
                  key={person.name}
                  className="tellian-t5-streifen"
                  onMouseEnter={() => zeigen(i)}
                  onMouseLeave={verbergen}
                  style={{
                    /* Der offene Streifen wächst, die übrigen weichen.
                       Über flex-grow statt über Breite: so bleibt die
                       Summe exakt die Reihenbreite, ohne Rundungsreste. */
                    flexGrow: gewaehlt
                      ? ("var(--tellian-t5-grow)" as unknown as number)
                      : 1,
                    flexBasis: 0,
                    minWidth: 0,
                    display: "flex",
                    flexDirection: "column",
                    transition: takt("flex-grow", gewaehlt),
                  }}
                >
                  <div
                    style={{
                      position: "relative",
                      flex: 1,
                      minHeight: 0,
                      overflow: "hidden",
                      backgroundColor: "var(--tellian-t5-placeholder-bg)",
                      opacity: gedimmt ? "var(--tellian-t5-dim)" : 1,
                      transition: "opacity 260ms ease",
                    }}
                  >
                    <span
                      aria-hidden
                      className="tellian-t5-bild"
                      style={{
                        position: "absolute",
                        top: 0,
                        bottom: 0,
                        left: 0,
                        /* Beim Öffnen zieht sich das Bild auf die
                           linke Hälfte zurück, statt unter dem Panel
                           zu verschwinden — so bleibt die Person
                           während des Lesens ganz zu sehen. */
                        right: gewaehlt ? "var(--tellian-t5-panel-share)" : 0,
                        overflow: "hidden",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        transition: takt("right", gewaehlt),
                      }}
                    >
                      {portraet(person)}
                    </span>

                    <button
                      ref={(el) => {
                        kachelRefs.current[i] = el;
                      }}
                      type="button"
                      onClick={() => waehlen(i)}
                      onFocus={() => {
                        stoppen();
                        setSchwebt(i);
                      }}
                      onBlur={verbergen}
                      aria-expanded={gewaehlt}
                      aria-label={`${person.name}, ${person.rolle}`}
                      className="tellian-t5-kachel"
                      style={{
                        position: "absolute",
                        inset: 0,
                        width: "100%",
                        height: "100%",
                        background: "transparent",
                        border: "none",
                        padding: 0,
                        cursor: "pointer",
                      }}
                    />

                    <div
                      className="tellian-t5-panel"
                      aria-hidden={!gewaehlt}
                      style={{
                        position: "absolute",
                        top: 0,
                        bottom: 0,
                        right: 0,
                        width: "var(--tellian-t5-panel-share)",
                        backgroundColor: "var(--tellian-t5-panel-bg)",
                        padding: "var(--tellian-t5-panel-pad)",
                        boxSizing: "border-box",
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "center",
                        transform: gewaehlt ? "translateX(0)" : "translateX(101%)",
                        visibility: gewaehlt ? "visible" : "hidden",
                        transition:
                          takt("transform", gewaehlt) +
                          `, visibility var(--tellian-t5-panel-ms${gewaehlt ? "" : "-zu"})`,
                      }}
                    >
                      {panelInhalt(person)}
                    </div>
                  </div>

                  {/* Vollständiger Name — um die Personen geht es hier.
                      Feste Höhe für zwei Zeilen: "Bryan Anthony
                      Honegger" bricht auf schmalen Kacheln um, und
                      ohne feste Höhe stünde die zweite Reihe versetzt. */}
                  <span
                    className="tellian-t5-name"
                    style={{
                      display: "block",
                      height: "var(--tellian-t5-label-row)",
                      marginTop: "var(--tellian-t5-label-gap)",
                      fontFamily: sans,
                      fontSize: "var(--tellian-t5-name-size)",
                      lineHeight: "var(--tellian-t5-name-leading)",
                      color: gewaehlt ? C.ink : C.accent,
                      opacity: gedimmt ? 0.5 : 1,
                      overflow: "hidden",
                      transition: "color 220ms ease, opacity 220ms ease",
                    }}
                  >
                    {person.name}
                  </span>
                </li>
              );
            })}
          </ul>
        ))}
        </div>
      </div>
      {stil}
    </div>
  );
}
