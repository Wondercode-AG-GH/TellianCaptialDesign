import { useCallback, useEffect, useRef, useState, type FormEvent } from "react";

import { C, cormorant, sans } from "../tokens";
import { SECTION_WIDTH_LAST } from "../sections";
import { FloatingField } from "./FloatingField";
import { MapOverlay } from "./Section6Kontakt";
import type { LegalPath } from "./LegalOverlay";

/* ═══════════════════════════════════════════════════════════
   STATION 6 — KONTAKT

   Links die Angaben, rechts das Formular, darunter ein Fussband
   über die volle Breite.

   TELEFON UND E-MAIL SIND VERWEISE, KEIN TEXT
   Für alle, die lieber anrufen als tippen, ist die Nummer der
   wichtigste Weg auf der ganzen Seite. Als blosser Text zwingt sie
   auf dem Telefon zum Abtippen.

   DAS FORMULAR SPRICHT DIE SPRACHE DER SEITE
   Vorher 16px Radius und eine eigene Füllung — das einzige so
   gebaute Element weit und breit. Jetzt scharfe Kanten und eine
   Haarlinie; die Füllung bleibt als sehr leichter warmer Ton, damit
   der Eingabebereich als Fläche lesbar bleibt.
   ═══════════════════════════════════════════════════════════ */

const TELEFON_ANZEIGE = "+41 44 224 40 24";
const TELEFON_LINK = "tel:+41442244024";
const MAIL = "info@telliancapital.ch";
const OEFFNUNG = "Montag bis Freitag, 8 bis 18 Uhr";

const TITEL = ["Sprechen", "wir."] as const;
const LEAD = [
  "Ein erstes Gespräch ist unverbindlich.",
  "Persönlich an der Löwenstrasse, oder digital.",
] as const;

/* Der frühere Firmenname steht bewusst hier und nirgends sonst auf
   der Seite. */
const FIRMA = [
  "Vermögensverwaltung Zürich AG, vormals Dr. Blumer & Partner",
  "Löwenstrasse 1, CH-8001 Zürich",
] as const;

const FUSS_LINKS = "Tellian Capital Solutions · FINMA-lizenziert · © 2026";

interface FussVerweis {
  text: string;
  href?: string;
  legal?: LegalPath;
}

/* Die FAQ wird nur verlinkt, nicht ausgeklappt. */
const FUSS_RECHTS: readonly FussVerweis[] = [
  { text: "FAQ", href: "/faq" },
  { text: "Solutions", href: "https://solutions.telliancapital.ch" },
  { text: "Datenschutz", legal: "/datenschutz" },
  { text: "Kundeninformation", legal: "/kundeninformation" },
  { text: "Impressum", legal: "/impressum" },
];

/* ── Formular ─────────────────────────────────────────────── */

type Zustand = "bereit" | "sendet" | "fertig" | "fehler";

interface Felder {
  vorname: string;
  nachname: string;
  email: string;
  telefon: string;
  nachricht: string;
}

const LEER: Felder = {
  vorname: "",
  nachname: "",
  email: "",
  telefon: "",
  nachricht: "",
};

/* Absichtlich grosszügig: eine strengere Prüfung weist gültige
   Adressen ab, und der Server prüft ohnehin. Hier geht es nur darum,
   Tippfehler vor dem Absenden zu bemerken. */
const MAIL_MUSTER = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function pruefen(f: Felder): Partial<Record<keyof Felder, string>> {
  const fehler: Partial<Record<keyof Felder, string>> = {};
  if (!f.vorname.trim()) fehler.vorname = "Bitte ausfüllen.";
  if (!f.nachname.trim()) fehler.nachname = "Bitte ausfüllen.";
  if (!f.email.trim()) fehler.email = "Bitte ausfüllen.";
  else if (!MAIL_MUSTER.test(f.email.trim()))
    fehler.email = "Diese Adresse sieht nicht vollständig aus.";
  if (!f.nachricht.trim()) fehler.nachricht = "Bitte ausfüllen.";
  return fehler;
}

function Formular({ gestapelt = false }: { gestapelt?: boolean }) {
  const [felder, setFelder] = useState<Felder>(LEER);
  const [fehler, setFehler] = useState<Partial<Record<keyof Felder, string>>>({});
  const [zustand, setZustand] = useState<Zustand>("bereit");
  /* Erst nach dem ersten Absendeversuch meldet das Formular beim
     Verlassen eines Feldes. Vorher wäre es eine Rüge dafür, dass man
     noch nicht fertig ist. */
  const versucht = useRef(false);
  const [springen, setSpringen] = useState(false);

  useEffect(() => {
    if (!springen) return;
    setSpringen(false);
    const erstes = formRef.current?.querySelector<HTMLElement>(
      "[aria-invalid='true']",
    );
    erstes?.focus();
  }, [springen]);

  const formRef = useRef<HTMLFormElement | null>(null);

  const setzen = (k: keyof Felder) => (v: string) => {
    setFelder((alt) => ({ ...alt, [k]: v }));
    if (versucht.current) {
      setFehler((alt) => {
        const neu = { ...alt };
        delete neu[k];
        return neu;
      });
    }
  };

  const feldPruefen = (k: keyof Felder) => () => {
    if (!versucht.current) return;
    const alle = pruefen(felder);
    setFehler((alt) => ({ ...alt, [k]: alle[k] }));
  };

  const absenden = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();
      versucht.current = true;
      const gefunden = pruefen(felder);
      setFehler(gefunden);
      if (Object.keys(gefunden).length) {
        /* Der Sprung zum ersten fehlerhaften Feld muss WARTEN, bis
           React gerendert hat: unmittelbar nach setFehler trägt noch
           kein Element aria-invalid, und die Suche liefe ins Leere.
           Deshalb über einen Merker und einen Effekt. */
        setSpringen(true);
        return;
      }
      setZustand("sendet");
      try {
        // TODO: echte Übermittlung. Bis dahin nur die Zustände.
        await new Promise((r) => setTimeout(r, 900));
        setZustand("fertig");
      } catch {
        /* Die Eingaben bleiben vollständig stehen — nichts ist
           ärgerlicher, als eine lange Nachricht neu zu tippen. */
        setZustand("fehler");
      }
    },
    [felder],
  );

  /* Die Erfolgsmeldung ERSETZT das Formular an Ort und Stelle. Ein
     Toast verschwindet, bevor man ihn gelesen hat, und danach weiss
     niemand, ob die Anfrage draussen ist. */
  if (zustand === "fertig") {
    return (
      <div role="status" aria-live="polite" style={{ padding: "8px 0" }}>
        <span
          style={{
            display: "block",
            fontFamily: cormorant,
            fontSize: "clamp(26px, 2.4vw, 34px)",
            fontWeight: 300,
            lineHeight: 1.15,
            color: "var(--tellian-k6-ink)",
          }}
        >
          Vielen Dank.
        </span>
        <span
          style={{
            display: "block",
            marginTop: "12px",
            fontFamily: sans,
            fontSize: "14px",
            lineHeight: 1.65,
            color: "var(--tellian-k6-dim)",
          }}
        >
          Ihre Anfrage ist bei uns. Wir melden uns bei Ihnen.
        </span>
      </div>
    );
  }

  const paar: React.CSSProperties = gestapelt
    ? { display: "flex", flexDirection: "column", gap: "16px" }
    : { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" };

  const sendet = zustand === "sendet";

  return (
    <form
      ref={formRef}
      onSubmit={absenden}
      noValidate
      style={{ display: "flex", flexDirection: "column", gap: "16px" }}
    >
      <div style={paar}>
        <FloatingField
          label="Vorname" required value={felder.vorname}
          onChange={setzen("vorname")} onBlurPruefen={feldPruefen("vorname")}
          fehler={fehler.vorname}
        />
        <FloatingField
          label="Nachname" required value={felder.nachname}
          onChange={setzen("nachname")} onBlurPruefen={feldPruefen("nachname")}
          fehler={fehler.nachname}
        />
      </div>
      <div style={paar}>
        <FloatingField
          label="E-Mail" type="email" required value={felder.email}
          onChange={setzen("email")} onBlurPruefen={feldPruefen("email")}
          fehler={fehler.email}
        />
        <FloatingField
          label="Telefon" type="tel" value={felder.telefon}
          onChange={setzen("telefon")}
        />
      </div>
      <FloatingField
        label="Nachricht" required multiline rows={5} value={felder.nachricht}
        onChange={setzen("nachricht")} onBlurPruefen={feldPruefen("nachricht")}
        fehler={fehler.nachricht}
      />

      <p
        style={{
          margin: 0,
          fontFamily: sans,
          fontSize: "12px",
          lineHeight: 1.5,
          color: "var(--tellian-k6-dim)",
        }}
      >
        Mit dem Absenden stimmen Sie unseren Datenschutzbestimmungen zu.
      </p>

      {zustand === "fehler" && (
        <p
          role="alert"
          style={{
            margin: 0,
            padding: "12px 14px",
            border: "1px solid var(--tellian-error-dunkel)",
            fontFamily: sans,
            fontSize: "13px",
            lineHeight: 1.6,
            color: "var(--tellian-k6-ink)",
          }}
        >
          Das Absenden hat nicht geklappt. Ihre Eingaben sind erhalten —
          versuchen Sie es nochmals, oder erreichen Sie uns direkt unter{" "}
          <a href={TELEFON_LINK} style={{ color: "inherit" }}>
            {TELEFON_ANZEIGE}
          </a>{" "}
          und{" "}
          <a href={`mailto:${MAIL}`} style={{ color: "inherit" }}>
            {MAIL}
          </a>
          .
        </p>
      )}

      {/* Ein primärer Knopf. Karte, FAQ und Solutions bleiben
          zurückhaltend — sonst konkurrieren vier Wege um dieselbe
          Aufmerksamkeit. */}
      <button
        type="submit"
        disabled={sendet}
        aria-busy={sendet}
        className="tellian-k6-primaer"
        style={{
          fontFamily: sans,
          fontSize: "12px",
          fontWeight: 500,
          letterSpacing: "0.16em",
          textTransform: "uppercase",
          /* Dunkel auf Mushroom — 8.17 : 1. Hell auf Mushroom wären
             1.6 : 1 gewesen. */
          color: "var(--tellian-dark)",
          backgroundColor: "var(--tellian-button)",
          border: "none",
          borderRadius: 0,
          padding: "16px 24px",
          cursor: sendet ? "progress" : "pointer",
          opacity: sendet ? 0.7 : 1,
          width: gestapelt ? "100%" : "fit-content",
          alignSelf: gestapelt ? "stretch" : "flex-start",
          display: "inline-flex",
          alignItems: "center",
          gap: "10px",
          transition: "background-color 200ms ease, opacity 200ms ease",
        }}
      >
        {sendet ? "Wird gesendet …" : "Anfrage senden"}
        {!sendet && <span aria-hidden>→</span>}
      </button>
    </form>
  );
}

/* ── Station ──────────────────────────────────────────────── */

interface Props {
  panelRef?: (el: HTMLDivElement | null) => void;
  isVertical?: boolean;
  domId?: string;
  onOpenLegal?: (path: LegalPath) => void;
}

export function Station6Kontakt({
  panelRef,
  isVertical = false,
  domId,
  onOpenLegal,
}: Props) {
  const [karteOffen, setKarteOffen] = useState(false);
  const karteBtn = useRef<HTMLButtonElement | null>(null);

  const titel = (
    <h2
      style={{
        margin: 0,
        fontFamily: cormorant,
        fontSize: "var(--tellian-k6-title-size)",
        fontWeight: "var(--tellian-k6-title-weight)" as unknown as number,
        lineHeight: "var(--tellian-k6-title-leading)" as unknown as number,
        color: "var(--tellian-k6-ink)",
      }}
    >
      {TITEL[0]}{" "}
      <em style={{ fontStyle: "italic", fontWeight: "inherit" }}>{TITEL[1]}</em>
    </h2>
  );

  const lead = (
    <p
      style={{
        margin: 0,
        marginTop: "clamp(14px, 2vh, 22px)",
        fontFamily: sans,
        fontSize: "var(--tellian-k6-lead-size)",
        lineHeight: "var(--tellian-k6-lead-leading)" as unknown as number,
        color: "var(--tellian-k6-dim)",
      }}
    >
      {LEAD[0]}
      <br />
      {LEAD[1]}
    </p>
  );

  const telefon = (
    <a
      href={TELEFON_LINK}
      className="tellian-k6-tel"
      style={{
        display: "inline-block",
        fontFamily: cormorant,
        fontSize: "var(--tellian-k6-phone-size)",
        fontWeight: 300,
        lineHeight: 1.1,
        color: "var(--tellian-k6-ink)",
        textDecoration: "none",
      }}
    >
      {TELEFON_ANZEIGE}
    </a>
  );

  const oeffnung = (
    <p
      style={{
        margin: 0,
        marginTop: "8px",
        fontFamily: sans,
        fontSize: "var(--tellian-k6-meta-size)",
        color: "var(--tellian-k6-dim)",
      }}
    >
      {OEFFNUNG}
    </p>
  );

  const mail = (
    <a
      href={`mailto:${MAIL}`}
      className="tellian-k6-tel"
      style={{
        display: "inline-block",
        marginTop: "clamp(16px, 2vh, 26px)",
        fontFamily: sans,
        fontSize: "var(--tellian-k6-mail-size)",
        color: "var(--tellian-k6-ink)",
        textDecoration: "none",
      }}
    >
      {MAIL}
    </a>
  );

  const firma = (
    <div style={{ marginTop: "clamp(24px, 3vh, 40px)" }}>
      <span
        style={{
          display: "block",
          fontFamily: sans,
          fontSize: "var(--tellian-k6-firm-size)",
          fontWeight: 500,
          color: "var(--tellian-k6-ink)",
        }}
      >
        Tellian Capital
      </span>
      {FIRMA.map((zeile) => (
        <span
          key={zeile}
          style={{
            display: "block",
            marginTop: "3px",
            fontFamily: sans,
            fontSize: "var(--tellian-k6-firm-size)",
            lineHeight: 1.5,
            color: "var(--tellian-k6-dim)",
          }}
        >
          {zeile}
        </span>
      ))}
      <button
        ref={karteBtn}
        type="button"
        onClick={() => setKarteOffen(true)}
        className="tellian-k6-still"
        style={{
          marginTop: "12px",
          background: "transparent",
          border: "none",
          padding: 0,
          cursor: "pointer",
          fontFamily: sans,
          fontSize: "var(--tellian-k6-meta-size)",
          color: "var(--tellian-k6-ink)",
        }}
      >
        Auf Karte anzeigen <span aria-hidden>→</span>
      </button>
    </div>
  );

  const formularflaeche = (
    <div
      style={{
        border: `1px solid var(--tellian-k6-form-line)`,
        backgroundColor: "var(--tellian-k6-form-bg)",
        borderRadius: 0,
        padding: "var(--tellian-k6-form-pad)",
      }}
    >
      <span
        style={{
          display: "block",
          fontFamily: sans,
          fontSize: "10px",
          letterSpacing: "0.22em",
          textTransform: "uppercase",
          color: "var(--tellian-k6-meta)",
        }}
      >
        Schreiben Sie uns
      </span>
      <div
        aria-hidden
        style={{
          width: "28px",
          height: "1px",
          backgroundColor: "var(--tellian-k6-line)",
          marginTop: "12px",
          marginBottom: "24px",
        }}
      />
      <Formular gestapelt={isVertical} />
    </div>
  );

  const fussband = (
    <div
      style={{
        borderTop: "1px solid var(--tellian-k6-line)",
        paddingTop: "clamp(14px, 1.8vh, 22px)",
        display: "flex",
        flexWrap: "wrap",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "12px 24px",
      }}
    >
      <span
        style={{
          fontFamily: sans,
          fontSize: "var(--tellian-k6-foot-size)",
          color: "var(--tellian-k6-foot-color)",
        }}
      >
        {FUSS_LINKS}
      </span>

      <nav
        aria-label="Rechtliches und weitere Seiten"
        style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "10px" }}
      >
        {FUSS_RECHTS.map((v, i) => (
          <span key={v.text} style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            {i > 0 && (
              <span aria-hidden style={{ color: "var(--tellian-k6-line)", fontSize: "10px" }}>
                ·
              </span>
            )}
            {v.legal ? (
              <button
                type="button"
                onClick={() => onOpenLegal?.(v.legal!)}
                className="tellian-k6-still"
                style={{
                  background: "transparent",
                  border: "none",
                  padding: 0,
                  cursor: "pointer",
                  fontFamily: sans,
                  fontSize: "var(--tellian-k6-foot-size)",
                  letterSpacing: "var(--tellian-k6-foot-tracking)",
                  textTransform: "uppercase",
                  color: "var(--tellian-k6-foot-color)",
                }}
              >
                {v.text}
              </button>
            ) : (
              <a
                href={v.href}
                className="tellian-k6-still"
                style={{
                  fontFamily: sans,
                  fontSize: "var(--tellian-k6-foot-size)",
                  letterSpacing: "var(--tellian-k6-foot-tracking)",
                  textTransform: "uppercase",
                  color: "var(--tellian-k6-foot-color)",
                  textDecoration: "none",
                }}
              >
                {v.text}
              </a>
            )}
          </span>
        ))}
      </nav>
    </div>
  );

  const stil = (
    <style>{`
      .tellian-k6-tel:hover,
      .tellian-k6-still:hover { text-decoration: underline; text-underline-offset: 4px; }
      .tellian-k6-primaer:hover:not(:disabled) { background-color: var(--tellian-button-hover); }
      .tellian-k6-tel:focus-visible,
      .tellian-k6-still:focus-visible,
      .tellian-k6-primaer:focus-visible,
    `}</style>
  );

  const karte = (
    <MapOverlay
      open={karteOffen}
      onClose={() => setKarteOffen(false)}
      returnFocusRef={karteBtn}
    />
  );

  /* ── SCHMAL ──
     Reihenfolge: Titel, Zeile, Telefon, Öffnungszeiten, E-Mail,
     Formular, Firmenblock, Fussband. Telefon steht bewusst vor dem
     Formular. */
  if (isVertical) {
    return (
      <section id={domId} style={{ backgroundColor: "var(--tellian-k6-bg)" }}>
        <div
          style={{
            paddingTop: "var(--tellian-abschnitt-luft-schmal)",
            paddingBottom: "var(--tellian-abschnitt-luft-schmal)",
            paddingLeft: "clamp(20px, 6vw, 48px)",
            paddingRight: "clamp(20px, 6vw, 48px)",
            display: "flex",
            flexDirection: "column",
          }}
        >
          {titel}
          {lead}
          <div style={{ marginTop: "clamp(24px, 3vh, 40px)" }}>{telefon}</div>
          {oeffnung}
          {mail}
          <div style={{ marginTop: "clamp(28px, 4vh, 44px)" }}>
            {formularflaeche}
          </div>
          {firma}
          <div style={{ marginTop: "clamp(28px, 4vh, 44px)" }}>{fussband}</div>
        </div>
        {karte}
        {stil}
      </section>
    );
  }

  /* ── BREIT ── */
  return (
    <div
      ref={panelRef}
      className="flex-shrink-0 h-screen relative"
      style={{ width: SECTION_WIDTH_LAST, backgroundColor: "var(--tellian-k6-bg)" }}
    >
      <div
        style={{
          /* Nur die TEXTBÜHNE weicht den beiden Bändern aus.
             Flächen und Bilder laufen darunter durch. */
          position: "absolute",
          top: "var(--tellian-kopf-height)",
          bottom: "var(--tellian-station-height)",
          left: 0,
          right: 0,
          display: "flex",
          flexDirection: "column",
          /* Die Schiene liegt fixed und nimmt keinen Platz im Fluss. */
          paddingLeft:
            "calc(var(--tellian-rail-width) + clamp(28px, 3.4vw, 64px))",
          paddingRight: "clamp(28px, 3.4vw, 64px)",
          paddingTop: "var(--tellian-s1-stage-pad)",
          paddingBottom: "clamp(16px, 2vh, 28px)",
          boxSizing: "border-box",
        }}
      >
        <div
          style={{
            flex: 1,
            minHeight: 0,
            display: "flex",
            alignItems: "center",
            gap: "clamp(40px, 5vw, 110px)",
          }}
        >
          {/* ══ Angaben ══ */}
          <div style={{ flex: "1 1 0", minWidth: 0 }}>
            <span
              style={{
                display: "block",
                fontFamily: sans,
                fontSize: "10px",
                letterSpacing: "0.22em",
                textTransform: "uppercase",
                color: "var(--tellian-k6-meta)",
              }}
            >
              Kontakt
            </span>
            <div
              aria-hidden
              style={{
                width: "28px",
                height: "1px",
                backgroundColor: "var(--tellian-k6-line)",
                marginTop: "14px",
                marginBottom: "clamp(18px, 2.4vh, 30px)",
              }}
            />
            {titel}
            {lead}
            <div style={{ marginTop: "clamp(22px, 3vh, 40px)" }}>{telefon}</div>
            {oeffnung}
            {mail}
            {firma}
          </div>

          {/* ══ Formular ══ */}
          <div style={{ flex: "0 0 clamp(380px, 38%, 560px)" }}>
            {formularflaeche}
          </div>
        </div>

        {/* ══ Fussband über die volle Breite ══ */}
        <div style={{ marginTop: "clamp(16px, 2vh, 28px)" }}>{fussband}</div>
      </div>

      {karte}
      {stil}
    </div>
  );
}
