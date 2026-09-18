import { useEffect, useId, useState } from "react";

import { C, cormorant, sans, serif } from "../tokens";
import { FAQ, antwortText, type FaqEintrag } from "../data/faq";
import { usePrefersReducedMotion } from "./usePrefersReducedMotion";

/* ═══════════════════════════════════════════════════════════
   UNTERSEITE — HÄUFIGE FRAGEN (18.09)

   Der Verweis «FAQ» stand seit je im Fussband, die Seite dahinter
   gab es nicht: die Adresse wechselte, und es öffnete sich nichts.

   Aufbau wie die übrigen Unterseiten — Titel in der Serife, ein
   führender Satz, dann der Inhalt; die Chrome (Logo, Zurück) kommt
   vom SubpageOverlay. Der Inhalt ist ein Akkordeon: zehn Fragen
   sind als offene Textwüste unlesbar, aufgeklappt zeigt sich immer
   nur eine Antwort. Die erste steht beim Öffnen offen, damit die
   Seite nicht als reine Linkliste beginnt.

   Die Fragen tragen zusätzlich das FAQPage-Schema (s. Effekt) —
   die Form, die Google für erweiterte Treffer und
   Antwortmaschinen für Zitate lesen.
   ═══════════════════════════════════════════════════════════ */

interface Props {
  isMobile?: boolean;
  /** Steht die Seite im Bild? Steuert den gestaffelten Eintritt. */
  aktiv?: boolean;
  sprache?: "DE" | "EN" | "FR";
  onContactClick?: () => void;
}

const HAARLINIE = "rgba(184, 174, 163, 0.5)";
const STUFE_MS = 70;
const DAUER_MS = 520;

const UI = {
  DE: {
    lead: "Antworten auf die Fragen, die uns im ersten Gespräch am häufigsten gestellt werden. Was offen bleibt, klären wir persönlich.",
    rest: "Ihre Frage ist nicht dabei?",
    knopf: "Gespräch vereinbaren",
  },
  EN: {
    lead: "Answers to the questions we are asked most often in a first conversation. Whatever remains open, we clarify in person.",
    rest: "Your question is not among them?",
    knopf: "Arrange a meeting",
  },
} as const;

export function UnterseiteFaq({
  isMobile = false,
  aktiv = true,
  sprache = "DE",
  onContactClick,
}: Props) {
  const spr = sprache === "EN" ? "EN" : "DE";
  const eintraege = FAQ[spr];
  const ui = UI[spr];
  const reduced = usePrefersReducedMotion();
  const gezeigt = aktiv || reduced;

  /* Beim Öffnen steht die erste Frage offen; danach führt der
     Besucher. -1 = alles zu. */
  const [offen, setOffen] = useState(0);

  /* FAQPage-Schema, solange die Seite im Bild ist. Zwei Schemata
     gleichzeitig (etwa mit einer Unterseite darunter) wären ein
     Widerspruch — deshalb hängt es am Zustand. */
  useEffect(() => {
    if (!aktiv) return;
    const schema = {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: eintraege.map((e) => ({
        "@type": "Question",
        name: e.frage,
        acceptedAnswer: { "@type": "Answer", text: antwortText(e) },
      })),
    };
    const el = document.createElement("script");
    el.type = "application/ld+json";
    el.setAttribute("data-faq-schema", "faq-seite");
    el.textContent = JSON.stringify(schema);
    document.head.appendChild(el);
    return () => {
      el.parentNode?.removeChild(el);
    };
  }, [aktiv, eintraege]);

  const stufe = (i: number): React.CSSProperties => ({
    opacity: gezeigt ? 1 : 0,
    transform: gezeigt ? "translateY(0)" : "translateY(14px)",
    transition: reduced
      ? "none"
      : `opacity ${DAUER_MS}ms ease-out ${i * STUFE_MS}ms,` +
        ` transform ${DAUER_MS}ms cubic-bezier(0.16,1,0.3,1) ${i * STUFE_MS}ms`,
  });

  return (
    <div
      style={{
        paddingLeft: isMobile ? "clamp(20px, 6vw, 32px)" : "clamp(32px, 6vw, 96px)",
        paddingRight: isMobile ? "clamp(20px, 6vw, 32px)" : "clamp(32px, 6vw, 96px)",
        paddingBottom: "clamp(48px, 8vh, 96px)",
        /* Die Spalte steht unter dem zentrierten Titel, nicht links
           daneben: links angeschlagen wirkte die Seite auf breiten
           Fenstern halbleer. Lesebreite bleibt gedeckelt. */
        maxWidth: "78ch",
        marginLeft: "auto",
        marginRight: "auto",
      }}
    >
      {/* ══ Führender Satz — der Titel steht in der Chrome des
          Overlays, hier beginnt der Inhalt. ══ */}
      <p
        lang={spr === "EN" ? "en" : "de"}
        style={{
          margin: "0 0 clamp(32px, 5vh, 56px)",
          maxWidth: "46ch",
          fontFamily: sans,
          fontSize: isMobile ? "15px" : "var(--tellian-lauf-size)",
          lineHeight: "var(--tellian-lauf-lh)" as unknown as number,
          color: C.accent,
          ...stufe(0),
        }}
      >
        {ui.lead}
      </p>

      {/* ══ Die Fragen ══ */}
      <div>
        {eintraege.map((e, i) => (
          <FaqZeile
            key={e.frage}
            eintrag={e}
            sprache={spr}
            isMobile={isMobile}
            offen={offen === i}
            nummer={i + 1}
            erste={i === 0}
            onUmschalten={() => setOffen(offen === i ? -1 : i)}
            stil={stufe(1 + i)}
          />
        ))}
      </div>

      {/* ══ Abschluss: der Weg ins Gespräch ══ */}
      <div
        style={{
          marginTop: "clamp(40px, 6vh, 72px)",
          display: "flex",
          flexDirection: isMobile ? "column" : "row",
          alignItems: isMobile ? "flex-start" : "center",
          gap: "clamp(16px, 2.4vw, 28px)",
          ...stufe(1 + eintraege.length),
        }}
      >
        <span
          style={{
            fontFamily: cormorant,
            fontStyle: "italic",
            fontSize: isMobile ? "20px" : "clamp(21px, 1.8vw, 26px)",
            lineHeight: "var(--tellian-kursiv-lh)" as unknown as number,
            color: C.ink,
          }}
        >
          {ui.rest}
        </span>
        <button
          type="button"
          onClick={() => onContactClick?.()}
          className="tellian-cta-primaer tellian-faq-knopf"
          style={{
            border: "none",
            borderRadius: 0,
            padding: "13px 26px",
            minHeight: "var(--tellian-tippziel)",
            fontFamily: sans,
            fontSize: "13px",
            letterSpacing: "var(--tellian-ls-cta-klein)",
            cursor: "pointer",
            flexShrink: 0,
          }}
        >
          {ui.knopf}
        </button>
      </div>

      <style>{`
        .tellian-faq-knopf:focus-visible,
        .tellian-faq-zeile:focus-visible {
          outline: 2px solid var(--tellian-accent);
          outline-offset: 3px;
        }
        .tellian-faq-zeile { outline: none; }
      `}</style>
    </div>
  );
}

/* ── Eine Frage ──
   Die Ziffer führt die Reihe wie auf den übrigen Unterseiten, das
   Zeichen rechts dreht beim Öffnen vom Plus zum Kreuz. Die Antwort
   wächst über grid-template-rows: das animiert die Höhe, ohne dass
   irgendwo eine Zahl geraten werden müsste. */
function FaqZeile({
  eintrag,
  sprache,
  isMobile,
  offen,
  nummer,
  erste,
  onUmschalten,
  stil,
}: {
  eintrag: FaqEintrag;
  sprache: "DE" | "EN";
  isMobile: boolean;
  offen: boolean;
  nummer: number;
  erste: boolean;
  onUmschalten: () => void;
  stil: React.CSSProperties;
}) {
  const id = useId();
  const knopfId = `faq-frage-${id}`;
  const feldId = `faq-antwort-${id}`;

  return (
    <div
      style={{
        borderTop: erste ? `1px solid ${HAARLINIE}` : "none",
        borderBottom: `1px solid ${HAARLINIE}`,
        ...stil,
      }}
    >
      <button
        id={knopfId}
        type="button"
        onClick={onUmschalten}
        aria-expanded={offen}
        aria-controls={feldId}
        className="tellian-faq-zeile"
        style={{
          display: "flex",
          width: "100%",
          alignItems: "flex-start",
          gap: isMobile ? "14px" : "20px",
          background: "transparent",
          border: "none",
          cursor: "pointer",
          padding: isMobile ? "18px 0" : "22px 0",
          minHeight: "var(--tellian-tippziel)",
          textAlign: "left",
        }}
      >
        <span
          aria-hidden
          style={{
            flexShrink: 0,
            fontFamily: serif,
            fontSize: isMobile ? "14px" : "15px",
            fontWeight: "var(--tellian-ziffer-weight)" as unknown as number,
            letterSpacing: "var(--tellian-ziffer-ls)",
            lineHeight: 1.6,
            color: C.muted,
            fontVariantNumeric: "tabular-nums",
            width: "2.2em",
          }}
        >
          {String(nummer).padStart(2, "0")}
        </span>
        <span
          lang={sprache === "EN" ? "en" : "de"}
          style={{
            flex: 1,
            fontFamily: cormorant,
            fontSize: isMobile ? "19px" : "clamp(20px, 1.6vw, 24px)",
            fontWeight: 400,
            lineHeight: "var(--tellian-zwischen-lh)" as unknown as number,
            color: C.ink,
          }}
        >
          {eintrag.frage}
        </span>
        <span
          aria-hidden
          style={{
            position: "relative",
            width: "14px",
            height: "14px",
            flexShrink: 0,
            marginTop: "8px",
            color: C.stone,
            transform: offen ? "rotate(45deg)" : "rotate(0deg)",
            transition: "transform 300ms cubic-bezier(0.16,1,0.3,1)",
          }}
        >
          <span
            style={{
              position: "absolute",
              top: "50%",
              left: 0,
              right: 0,
              height: "1px",
              backgroundColor: "currentColor",
              transform: "translateY(-50%)",
            }}
          />
          <span
            style={{
              position: "absolute",
              top: 0,
              bottom: 0,
              left: "50%",
              width: "1px",
              backgroundColor: "currentColor",
              transform: "translateX(-50%)",
            }}
          />
        </span>
      </button>

      <div
        id={feldId}
        role="region"
        aria-labelledby={knopfId}
        style={{
          display: "grid",
          gridTemplateRows: offen ? "1fr" : "0fr",
          transition: "grid-template-rows 350ms cubic-bezier(0.16,1,0.3,1)",
        }}
      >
        <div style={{ overflow: "hidden" }}>
          <div
            lang={sprache === "EN" ? "en" : "de"}
            style={{
              /* Auf der Flucht der Frage, nicht der Ziffer. */
              paddingLeft: isMobile ? "0" : "calc(2.2em + 20px)",
              paddingBottom: offen ? "clamp(22px, 3vh, 30px)" : 0,
              maxWidth: "62ch",
              display: "flex",
              flexDirection: "column",
              gap: "1em",
            }}
          >
            {eintrag.absaetze.map((a) => (
              <p
                key={a.slice(0, 32)}
                style={{
                  margin: 0,
                  fontFamily: sans,
                  fontSize: isMobile ? "15px" : "var(--tellian-lauf-size)",
                  lineHeight: "var(--tellian-lauf-lh)" as unknown as number,
                  color: C.accent,
                }}
              >
                {a}
              </p>
            ))}

            {eintrag.schritte && (
              <ol
                style={{
                  listStyle: "none",
                  margin: 0,
                  padding: 0,
                  display: "flex",
                  flexDirection: "column",
                  gap: "10px",
                }}
              >
                {eintrag.schritte.map((s, i) => (
                  <li
                    key={s.slice(0, 32)}
                    style={{ display: "flex", alignItems: "baseline", gap: "12px" }}
                  >
                    <span
                      aria-hidden
                      style={{
                        flexShrink: 0,
                        fontFamily: serif,
                        fontSize: "14px",
                        letterSpacing: "var(--tellian-ziffer-ls)",
                        color: C.muted,
                        fontVariantNumeric: "tabular-nums",
                      }}
                    >
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span
                      style={{
                        fontFamily: sans,
                        fontSize: isMobile ? "15px" : "var(--tellian-lauf-size)",
                        lineHeight: "var(--tellian-lauf-lh)" as unknown as number,
                        color: C.accent,
                      }}
                    >
                      {s}
                    </span>
                  </li>
                ))}
              </ol>
            )}

            {eintrag.schluss && (
              <p
                style={{
                  margin: 0,
                  fontFamily: cormorant,
                  fontStyle: "italic",
                  fontSize: isMobile ? "17px" : "18px",
                  lineHeight: "var(--tellian-kursiv-lh)" as unknown as number,
                  color: C.ink,
                }}
              >
                {eintrag.schluss}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
