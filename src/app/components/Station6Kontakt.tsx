import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";

import { cormorant, sans } from "../tokens";
import { SECTION_WIDTH_LAST } from "../sections";
import { MapOverlay } from "./Section6Kontakt";
import { kontaktSenden, ZIEL_KONFIGURIERT } from "../kontaktZiel";
import type { LegalPath } from "./LegalOverlay";

/* ═══════════════════════════════════════════════════════════
   STATION 6 — KONTAKT

   BREIT: zwei Spalten, links die Angaben, rechts das Formular,
   darunter das Fussband. Beide Spalten enden auf einer gemeinsamen
   Kante — der Adressblock wird dafür an den unteren Rand der linken
   Spalte geschoben. Vorher kippte die linke Spalte nach oben und
   liess unten ein leeres Feld stehen.

   Die Eyebrow "Kontakt" mit Haarlinie ist weg: sie sagte nichts, was
   die Stationsleiste nicht schon sagt. Der Rahmen um das Formular ist
   ebenfalls weg — er umschloss vor allem Luft, und die Feldrahmen
   schwammen als zweite Ebene darin.

   SCHMAL: Telefon und E-Mail stehen als zwei grosse Bedienflächen VOR
   dem Formular. Für die ältere Klientel ist der Anruf der wichtigste
   Weg auf der ganzen Seite; als blosse Textzeile ist er nicht als
   Bedienelement erkennbar und zwingt zum Abtippen.
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

/* ── Prüfung ──────────────────────────────────────────────────

   GROSSZÜGIG, NICHT STRENG
   Eine strenge Adressregel weist gültige Adressen mit Pluszeichen,
   Apostroph oder neuer Endung ab. Hier wird nur verlangt: etwas, ein
   @, etwas, ein Punkt, etwas. Bei der Nummer ist die Schwelle noch
   tiefer — das Feld ist optional, und eine gültige Nummer abzulehnen
   ist schlimmer, als eine unsaubere durchzulassen.
   ══════════════════════════════════════════════════════════ */

type Feldname = "name" | "email" | "telefon" | "nachricht";
type Felder = Record<Feldname, string>;
type Fehlerliste = Partial<Record<Feldname, string>>;

const LEER: Felder = { name: "", email: "", telefon: "", nachricht: "" };

const MAIL_VOLLSTAENDIG = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
/* Trennzeichen, die in geschriebenen Nummern üblich sind. */
const TEL_TRENNER = /[\s.\-/()]/g;
/* +41, 0041 oder 0-Vorwahl, danach 7 bis 15 Ziffern. */
const TEL_KERN = /^(?:\+|00)?\d{7,15}$/;

/** Meldung für ein Feld, oder undefined wenn es stimmt. */
function pruefeFeld(k: Feldname, f: Felder): string | undefined {
  const v = f[k].trim();

  if (k === "name") {
    if (!v) return "Bitte tragen Sie Ihren Namen ein.";
    return undefined;
  }

  if (k === "email") {
    if (!v) return "Bitte tragen Sie Ihre E-Mail-Adresse ein, damit wir antworten können.";
    if (!v.includes("@")) return "Es fehlt noch das @, zum Beispiel name@beispiel.ch";
    if (!MAIL_VOLLSTAENDIG.test(v))
      return "Nach dem @ fehlt noch die Domain, zum Beispiel beispiel.ch";
    return undefined;
  }

  if (k === "telefon") {
    /* Leer ist immer gültig. */
    if (!v) return undefined;
    if (!TEL_KERN.test(v.replace(TEL_TRENNER, "")))
      return "Die Nummer scheint unvollständig. Sie können das Feld auch leer lassen.";
    return undefined;
  }

  if (!v) return "Bitte schreiben Sie uns kurz, worum es geht.";
  return undefined;
}

const REIHENFOLGE: readonly Feldname[] = ["name", "email", "telefon", "nachricht"];

function pruefeAlles(f: Felder): Fehlerliste {
  const raus: Fehlerliste = {};
  for (const k of REIHENFOLGE) {
    const m = pruefeFeld(k, f);
    if (m) raus[k] = m;
  }
  return raus;
}

/* ── Zeichen am Fehler ────────────────────────────────────────
   Fehler dürfen nie nur an der Farbe hängen: wer Rot nicht von Grau
   unterscheidet, sieht sonst gar nichts. Deshalb zusätzlich dieses
   Zeichen, ein Text und eine kräftigere Feldkontur. */
function FehlerZeichen() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 14 14"
      aria-hidden
      focusable="false"
      style={{ flexShrink: 0, marginTop: "2px" }}
    >
      <circle cx="7" cy="7" r="6.25" fill="none" stroke="currentColor" strokeWidth="1.25" />
      <path d="M7 3.7v4.2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="7" cy="10.4" r="0.85" fill="currentColor" />
    </svg>
  );
}

/* ── Ein Feld ─────────────────────────────────────────────────

   FESTE BESCHRIFTUNG ÜBER DEM FELD
   Vorher wanderte das Etikett beim Tippen in die obere Kante des
   Feldes. Das spart Platz und kostet Verlässlichkeit: sobald etwas
   drinsteht, muss man sich merken, was wo hingehört. Jetzt steht die
   Beschriftung fest darüber und bewegt sich nie.
   ══════════════════════════════════════════════════════════ */

interface FeldProps {
  name: Feldname;
  beschriftung: string;
  /** Wird als "— optional" hinter die Beschriftung gesetzt. */
  optional?: boolean;
  wert: string;
  onWert: (v: string) => void;
  onVerlassen: () => void;
  fehler?: string;
  mehrzeilig?: boolean;
  zeilen?: number;
  type?: string;
  autoComplete?: string;
  inputMode?: "text" | "email" | "tel";
  autoCapitalize?: string;
}

function KontaktFeld({
  name,
  beschriftung,
  optional = false,
  wert,
  onWert,
  onVerlassen,
  fehler,
  mehrzeilig = false,
  zeilen = 5,
  type = "text",
  autoComplete,
  inputMode,
  autoCapitalize,
}: FeldProps) {
  const id = useId();
  const fehlerId = `${id}-meldung`;

  const kontur = fehler
    ? "var(--tellian-field-error)"
    : "var(--tellian-field-line)";

  const feldStil: React.CSSProperties = {
    fontFamily: sans,
    /* Mindestens 16px — darunter zoomt iOS beim Antippen. */
    fontSize: "var(--tellian-field-size)",
    lineHeight: 1.5,
    color: "var(--tellian-field-ink)",
    /* Im Fehler zusätzlich dicker, damit der Zustand nicht allein an
       der Farbe hängt. */
    border: `${fehler ? "2px" : "1px"} solid ${kontur}`,
    borderRadius: 0,
    backgroundColor: "var(--tellian-field-bg)",
    padding: fehler ? "11px 13px" : "12px 14px",
    width: "100%",
    boxSizing: "border-box",
    appearance: "none",
    resize: "none",
  };

  const geteilt = {
    id,
    name,
    value: wert,
    onBlur: onVerlassen,
    autoComplete,
    inputMode,
    autoCapitalize,
    "aria-invalid": fehler ? (true as const) : undefined,
    "aria-describedby": fehler ? fehlerId : undefined,
    className: "tellian-k6-feld",
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "7px" }}>
      <label
        htmlFor={id}
        style={{
          fontFamily: sans,
          fontSize: "var(--tellian-field-label-size)",
          lineHeight: 1.3,
          color: "var(--tellian-k6-ink)",
        }}
      >
        {beschriftung}
        {optional && (
          /* KEINE STERNCHEN.
             Gekennzeichnet wird nur, was weggelassen werden darf —
             das ist die kürzere und die freundlichere Liste. */
          <span style={{ color: "var(--tellian-k6-dim)" }}> — optional</span>
        )}
      </label>

      {mehrzeilig ? (
        <textarea
          {...geteilt}
          rows={zeilen}
          onChange={(e) => onWert(e.target.value)}
          style={{ ...feldStil, minHeight: `${zeilen * 26}px` }}
        />
      ) : (
        <input
          {...geteilt}
          type={type}
          spellCheck={type === "email" ? false : undefined}
          onChange={(e) => onWert(e.target.value)}
          style={{ ...feldStil, height: "50px" }}
        />
      )}

      {fehler && (
        <span
          id={fehlerId}
          role="alert"
          style={{
            display: "flex",
            alignItems: "flex-start",
            gap: "7px",
            marginTop: "1px",
            fontFamily: sans,
            fontSize: "13px",
            lineHeight: 1.45,
            color: "var(--tellian-field-error)",
          }}
        >
          <FehlerZeichen />
          <span>{fehler}</span>
        </span>
      )}
    </div>
  );
}

/* ── Formular ─────────────────────────────────────────────── */

type Zustand = "bereit" | "sendet" | "fertig" | "fehler";

/* Unter dieser Zeit zwischen Aufbau und Absenden war es kein Mensch.
   Zusammen mit dem verborgenen Feld ersetzt das ein Captcha — die
   Hürde, an der ältere Nutzer am häufigsten aufgeben. */
const MENSCHENZEIT_MS = 3000;

function Formular({ gestapelt = false }: { gestapelt?: boolean }) {
  const [felder, setFelder] = useState<Felder>(LEER);
  const [fehler, setFehler] = useState<Fehlerliste>({});
  const [zustand, setZustand] = useState<Zustand>("bereit");
  /* Verborgenes Zusatzfeld — nur Bots füllen es aus. */
  const [honigtopf, setHonigtopf] = useState("");
  const honigId = useId();

  const formRef = useRef<HTMLFormElement | null>(null);
  const aufgebaut = useRef(Date.now());
  const [springen, setSpringen] = useState(false);

  /* Der Sprung zum ersten fehlerhaften Feld muss WARTEN, bis React
     gerendert hat: unmittelbar nach setFehler trägt noch kein Element
     aria-invalid, und die Suche liefe ins Leere. */
  useEffect(() => {
    if (!springen) return;
    setSpringen(false);
    const erstes = formRef.current?.querySelector<HTMLElement>("[aria-invalid='true']");
    if (!erstes) return;
    /* preventScroll, weil der eingebaute Sprung im breiten Zweig den
       waagrechten Track anfassen würde. Gescrollt wird nur, wenn das
       Feld wirklich ausserhalb des Bildes liegt — und nur senkrecht. */
    erstes.focus({ preventScroll: true });
    const r = erstes.getBoundingClientRect();
    const oben = 0;
    const unten = window.innerHeight;
    if (r.top < oben + 8 || r.bottom > unten - 8) {
      erstes.scrollIntoView({ behavior: "smooth", block: "center", inline: "nearest" });
    }
  }, [springen]);

  const setzen = (k: Feldname) => (v: string) => {
    setFelder((alt) => {
      const neu = { ...alt, [k]: v };
      /* Ist das Feld einmal im Fehler, wird ab jetzt bei JEDER
         Eingabe neu geprüft — die Meldung soll verschwinden, sobald
         es stimmt, nicht erst beim Verlassen. */
      setFehler((f) => (f[k] ? { ...f, [k]: pruefeFeld(k, neu) } : f));
      return neu;
    });
  };

  /* Geprüft wird beim VERLASSEN, nicht beim Tippen. Wer mitten im
     Wort gerügt wird, tippt gegen die Meldung an. */
  const verlassen = (k: Feldname) => () => {
    setFehler((alt) => ({ ...alt, [k]: pruefeFeld(k, felder) }));
  };

  const absenden = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();

      /* SPAM: verborgenes Feld ausgefüllt oder unrealistisch schnell
         abgeschickt. Beides endet still im Erfolgszustand — wer
         einem Bot sagt, woran er gescheitert ist, hilft ihm. */
      const verdacht =
        honigtopf.trim().length > 0 ||
        Date.now() - aufgebaut.current < MENSCHENZEIT_MS;

      const gefunden = pruefeAlles(felder);
      setFehler(gefunden);
      if (Object.keys(gefunden).length) {
        /* Der Knopf ist nie gesperrt: man darf drücken und erfährt
           dann, was fehlt. */
        setSpringen(true);
        return;
      }

      if (verdacht) {
        setZustand("fertig");
        return;
      }

      setZustand("sendet");
      try {
        await kontaktSenden({
          name: felder.name.trim(),
          email: felder.email.trim(),
          telefon: felder.telefon.trim(),
          nachricht: felder.nachricht.trim(),
          sprache: document.documentElement.lang || "de",
        });
        setZustand("fertig");
      } catch {
        /* Die Eingaben bleiben vollständig stehen — nichts ist
           ärgerlicher, als eine lange Nachricht neu zu tippen. */
        setZustand("fehler");
      }
    },
    [felder, honigtopf],
  );

  /* Die Erfolgsmeldung ERSETZT das Formular an Ort und Stelle. Ein
     Einblender verschwindet, bevor man ihn gelesen hat, und danach
     weiss niemand, ob die Anfrage draussen ist.

     Von einer Bestätigungs-E-Mail steht hier bewusst nichts — es ist
     nicht festgelegt, dass es sie gibt. */
  if (zustand === "fertig") {
    return (
      <div role="status" aria-live="polite" style={{ padding: "4px 0" }}>
        <span
          style={{
            display: "block",
            fontFamily: cormorant,
            fontSize: "clamp(28px, 2.6vw, 38px)",
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
            marginTop: "14px",
            maxWidth: "34em",
            fontFamily: sans,
            fontSize: "15px",
            lineHeight: 1.65,
            color: "var(--tellian-k6-dim)",
          }}
        >
          Ihre Anfrage ist bei uns. Wir melden uns bei Ihnen, in der Regel
          innerhalb eines Arbeitstages.
        </span>
        <span
          style={{
            display: "block",
            marginTop: "20px",
            fontFamily: sans,
            fontSize: "15px",
            lineHeight: 1.65,
            color: "var(--tellian-k6-dim)",
          }}
        >
          Wenn es eilt, erreichen Sie uns direkt unter{" "}
          <a
            href={TELEFON_LINK}
            className="tellian-k6-tel"
            style={{
              color: "var(--tellian-k6-ink)",
              textDecoration: "underline",
              textUnderlineOffset: "4px",
            }}
          >
            {TELEFON_ANZEIGE}
          </a>
          . {OEFFNUNG}.
        </span>
      </div>
    );
  }

  const paar: React.CSSProperties = gestapelt
    ? { display: "flex", flexDirection: "column", gap: "18px" }
    : { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "18px" };

  const sendet = zustand === "sendet";

  return (
    <form
      ref={formRef}
      onSubmit={absenden}
      noValidate
      style={{ display: "flex", flexDirection: "column", gap: "18px" }}
    >
      {/* Für Menschen verborgen, für Bots verlockend. Nicht
          display:none — das überspringen viele Bots gezielt. */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          left: "-9999px",
          width: "1px",
          height: "1px",
          overflow: "hidden",
        }}
      >
        <label htmlFor={honigId}>Bitte dieses Feld leer lassen</label>
        <input
          id={honigId}
          name="webseite"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          value={honigtopf}
          onChange={(e) => setHonigtopf(e.target.value)}
        />
      </div>

      <div style={paar}>
        <KontaktFeld
          name="name"
          beschriftung="Name"
          wert={felder.name}
          onWert={setzen("name")}
          onVerlassen={verlassen("name")}
          fehler={fehler.name}
          autoComplete="name"
          autoCapitalize="words"
        />
        <KontaktFeld
          name="email"
          beschriftung="E-Mail"
          type="email"
          wert={felder.email}
          onWert={setzen("email")}
          onVerlassen={verlassen("email")}
          fehler={fehler.email}
          autoComplete="email"
          inputMode="email"
          autoCapitalize="none"
        />
      </div>

      <KontaktFeld
        name="telefon"
        beschriftung="Telefon"
        optional
        type="tel"
        wert={felder.telefon}
        onWert={setzen("telefon")}
        onVerlassen={verlassen("telefon")}
        fehler={fehler.telefon}
        autoComplete="tel"
        inputMode="tel"
      />

      <KontaktFeld
        name="nachricht"
        beschriftung="Ihre Nachricht"
        mehrzeilig
        zeilen={5}
        wert={felder.nachricht}
        onWert={setzen("nachricht")}
        onVerlassen={verlassen("nachricht")}
        fehler={fehler.nachricht}
        autoComplete="off"
        autoCapitalize="sentences"
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
            padding: "14px 16px",
            border: "2px solid var(--tellian-field-error)",
            display: "flex",
            alignItems: "flex-start",
            gap: "10px",
            fontFamily: sans,
            fontSize: "14px",
            lineHeight: 1.6,
            color: "var(--tellian-k6-ink)",
          }}
        >
          <span style={{ color: "var(--tellian-field-error)", display: "flex" }}>
            <FehlerZeichen />
          </span>
          <span>
            Das Absenden hat nicht geklappt. Ihre Eingaben sind erhalten —
            versuchen Sie es nochmals, oder erreichen Sie uns direkt unter{" "}
            <a
              href={TELEFON_LINK}
              className="tellian-k6-tel"
              style={{
                color: "inherit",
                textDecoration: "underline",
                textUnderlineOffset: "3px",
              }}
            >
              {TELEFON_ANZEIGE}
            </a>{" "}
            oder{" "}
            <a
              href={`mailto:${MAIL}`}
              className="tellian-k6-tel"
              style={{
                color: "inherit",
                textDecoration: "underline",
                textUnderlineOffset: "3px",
              }}
            >
              {MAIL}
            </a>
            .
          </span>
        </p>
      )}

      {/* Nie gesperrt, ausser während des Sendens. Ein von vornherein
          toter Knopf sagt nicht, was fehlt — er lässt einen suchen. */}
      <button
        type="submit"
        disabled={sendet}
        aria-busy={sendet}
        className="tellian-k6-primaer"
        style={{
          fontFamily: sans,
          fontSize: "13px",
          fontWeight: 500,
          letterSpacing: "0.16em",
          textTransform: "uppercase",
          /* Dunkel auf Mushroom — 8.17 : 1. Hell auf Mushroom wären
             1.6 : 1 gewesen. */
          color: "var(--tellian-dark)",
          backgroundColor: "var(--tellian-button)",
          border: "none",
          borderRadius: 0,
          padding: "17px 26px",
          minHeight: "var(--tellian-tippziel)",
          cursor: sendet ? "progress" : "pointer",
          width: gestapelt ? "100%" : "fit-content",
          alignSelf: gestapelt ? "stretch" : "flex-start",
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "12px",
          transition: "background-color 200ms ease",
        }}
      >
        {sendet ? (
          <>
            <span aria-hidden className="tellian-k6-kreisel" />
            Wird gesendet …
          </>
        ) : (
          <>
            Anfrage senden
            <span aria-hidden>→</span>
          </>
        )}
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

  const lead = (zweizeilig: boolean) => (
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
      {zweizeilig && (
        <>
          <br />
          {LEAD[1]}
        </>
      )}
    </p>
  );

  /* ── BREIT: Telefon und E-Mail als Verweise im Textfluss ── */

  const telefon = (
    <a
      href={TELEFON_LINK}
      className="tellian-k6-tel"
      style={{
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

  /* Dauerhaft unterstrichen. Ohne Strich liest sich eine Adresse wie
     Fliesstext, und niemand versucht, sie anzutippen. */
  const mail = (
    <a
      href={`mailto:${MAIL}`}
      className="tellian-k6-tel"
      style={{
        marginTop: "clamp(14px, 2vh, 24px)",
        fontFamily: sans,
        fontSize: "var(--tellian-k6-mail-size)",
        color: "var(--tellian-k6-ink)",
        textDecoration: "underline",
        textDecorationThickness: "1px",
        textUnderlineOffset: "5px",
        textDecorationColor: "var(--tellian-k6-line)",
      }}
    >
      {MAIL}
    </a>
  );

  /* ── SCHMAL: zwei grosse Bedienflächen ── */

  const kachel = (
    href: string,
    zeichen: ReactNode,
    ueberschrift: string,
    wert: string,
    zusatz?: string,
  ) => (
    <a
      href={href}
      className="tellian-k6-kachel"
      style={{
        display: "flex",
        alignItems: "flex-start",
        gap: "14px",
        padding: "var(--tellian-k6-kachel-pad)",
        border: "1px solid var(--tellian-k6-kachel-line)",
        backgroundColor: "var(--tellian-k6-kachel-bg)",
        textDecoration: "none",
        minHeight: "var(--tellian-tippziel)",
        boxSizing: "border-box",
        transition: "background-color 200ms ease, border-color 200ms ease",
      }}
    >
      <span
        aria-hidden
        style={{
          display: "flex",
          flexShrink: 0,
          marginTop: "3px",
          color: "var(--tellian-k6-ink)",
        }}
      >
        {zeichen}
      </span>
      <span style={{ display: "flex", flexDirection: "column", minWidth: 0 }}>
        <span
          style={{
            fontFamily: sans,
            fontSize: "13px",
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            color: "var(--tellian-k6-dim)",
          }}
        >
          {ueberschrift}
        </span>
        <span
          style={{
            marginTop: "6px",
            fontFamily: cormorant,
            fontSize: "clamp(24px, 6.4vw, 32px)",
            fontWeight: 300,
            lineHeight: 1.1,
            color: "var(--tellian-k6-ink)",
            wordBreak: "break-word",
          }}
        >
          {wert}
        </span>
        {zusatz && (
          <span
            style={{
              marginTop: "8px",
              fontFamily: sans,
              fontSize: "13px",
              lineHeight: 1.45,
              color: "var(--tellian-k6-dim)",
            }}
          >
            {zusatz}
          </span>
        )}
      </span>
    </a>
  );

  const zeichenTelefon = (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden focusable="false">
      <path
        d="M6.3 2.8 8 6.1l-1.7 1.6c.9 2 2.3 3.4 4.3 4.3l1.6-1.7 3.3 1.7-.6 3c-.2.7-.8 1.1-1.5 1C8.1 15.3 4.7 11.9 3.2 5.9c-.1-.7.3-1.3 1-1.5l2.1-.6z"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinejoin="round"
      />
    </svg>
  );

  const zeichenMail = (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden focusable="false">
      <rect x="2.2" y="4.4" width="15.6" height="11.2" stroke="currentColor" strokeWidth="1.3" />
      <path d="M2.6 5.1 10 10.7l7.4-5.6" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
    </svg>
  );

  const trennzeile = (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "14px",
      }}
    >
      <span aria-hidden style={{ flex: 1, height: "1px", backgroundColor: "var(--tellian-k6-line)" }} />
      <span
        style={{
          fontFamily: sans,
          fontSize: "13px",
          letterSpacing: "0.08em",
          color: "var(--tellian-k6-dim)",
          whiteSpace: "nowrap",
        }}
      >
        Oder schreiben Sie uns
      </span>
      <span aria-hidden style={{ flex: 1, height: "1px", backgroundColor: "var(--tellian-k6-line)" }} />
    </div>
  );

  const firma = (
    <div>
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
          marginTop: "10px",
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
        /* Die Trenner standen beim Umbruch als führendes Zeichen am
           Zeilenanfang — auf dem Telefon brach die Liste immer um.
           Statt Trennern ein klarer Abstand. */
        style={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          columnGap: "clamp(16px, 4vw, 28px)",
          rowGap: "0px",
        }}
      >
        {FUSS_RECHTS.map((v) => (
          <span key={v.text} style={{ display: "flex", alignItems: "center" }}>
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
      /* TREFFERFLÄCHEN
         Gemessen waren die Fussverweise 18px hoch, Telefon 29,
         E-Mail 24. Der Zuwachs kommt aus dem Innenabstand und wird
         mit negativem Aussenabstand ausgeglichen — das Schriftbild
         und der Umbruch bleiben, wie sie sind. */
      .tellian-k6-still,
      .tellian-k6-tel {
        display: inline-flex;
        align-items: center;
        min-height: var(--tellian-tippziel);
        padding-top: 12px;
        padding-bottom: 12px;
        margin-top: -12px;
        margin-bottom: -12px;
      }
      .tellian-k6-primaer:hover:not(:disabled) { background-color: var(--tellian-button-hover); }
      .tellian-k6-primaer:disabled { opacity: 0.8; }
      .tellian-k6-kachel:hover {
        background-color: var(--tellian-k6-kachel-bg-hover);
        border-color: var(--tellian-k6-kachel-line-hover);
      }
      .tellian-k6-feld { outline: none; }
      .tellian-k6-feld::placeholder { color: transparent; }
      .tellian-k6-feld:focus {
        border-color: var(--tellian-field-focus);
      }
      /* SICHTBARER FOKUSRING
         Diese Regel stand vorher mit einem Komma am Ende und ohne
         Block da — damit war der GANZE Block ungültig und Station 6
         hatte auf keinem Element einen Ring. */
      .tellian-k6-tel:focus-visible,
      .tellian-k6-still:focus-visible,
      .tellian-k6-primaer:focus-visible,
      .tellian-k6-kachel:focus-visible,
      .tellian-k6-feld:focus-visible {
        outline: 2px solid var(--tellian-k6-focus);
        outline-offset: 3px;
      }
      .tellian-k6-kreisel {
        width: 14px;
        height: 14px;
        border-radius: 50%;
        border: 2px solid currentColor;
        border-top-color: transparent;
        display: inline-block;
        animation: tellian-k6-dreh 800ms linear infinite;
      }
      @keyframes tellian-k6-dreh { to { transform: rotate(360deg); } }
      @media (prefers-reduced-motion: reduce) {
        .tellian-k6-kreisel { animation-duration: 2400ms; }
      }
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
     Titel, ein Satz, die beiden Bedienflächen, Trennzeile, Formular,
     Adressblock, Fussband. */
  if (isVertical) {
    return (
      <section
        id={domId}
        style={{
          backgroundColor: "var(--tellian-k6-bg)",
          backgroundImage: "var(--tellian-flaeche-dunkel-schmal)",
          /* Sprünge aus Menü, Stationsleiste und Adresszeile setzen
             die Oberkante der Station auf die Fensteroberkante — also
             hinter die feste Kopfzeile, die jetzt deckt. Ohne diese
             Reserve stand "Sprechen wir." zur Hälfte darunter.
             Freies Scrollen bleibt davon unberührt. */
          scrollMarginTop: "var(--tellian-kopf-height)",
        }}
      >
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
          {lead(false)}

          <div
            style={{
              marginTop: "clamp(26px, 3.4vh, 40px)",
              display: "flex",
              flexDirection: "column",
              gap: "14px",
            }}
          >
            {kachel(TELEFON_LINK, zeichenTelefon, "Anrufen", TELEFON_ANZEIGE, OEFFNUNG)}
            {kachel(`mailto:${MAIL}`, zeichenMail, "E-Mail", MAIL)}
          </div>

          <div style={{ marginTop: "clamp(30px, 4vh, 46px)" }}>{trennzeile}</div>

          <div style={{ marginTop: "clamp(22px, 3vh, 32px)" }}>
            <Formular gestapelt />
          </div>

          <div style={{ marginTop: "clamp(30px, 4vh, 46px)" }}>{firma}</div>
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
      style={{
        width: SECTION_WIDTH_LAST,
        backgroundColor: "var(--tellian-k6-bg)",
        backgroundImage: "var(--tellian-flaeche-dunkel)",
      }}
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
            flexDirection: "column",
            justifyContent: "center",
          }}
        >
          {/* GEMEINSAME UNTERKANTE
              Die Zeile ist so hoch wie ihre höhere Spalte, und beide
              Spalten werden auf diese Höhe gezogen (align: stretch).
              Der Adressblock steht mit marginTop:auto am Boden seiner
              Spalte — damit enden Angaben und Formular auf derselben
              Linie, statt dass links unten ein leeres Feld bleibt. */}
          <div
            style={{
              display: "flex",
              alignItems: "stretch",
              gap: "clamp(40px, 5vw, 110px)",
            }}
          >
            {/* ══ Angaben ══ */}
            <div
              style={{
                flex: "1 1 0",
                minWidth: 0,
                display: "flex",
                flexDirection: "column",
              }}
            >
              {titel}
              {lead(true)}
              <div style={{ marginTop: "clamp(22px, 3vh, 40px)" }}>{telefon}</div>
              {oeffnung}
              <div style={{ display: "flex" }}>{mail}</div>
              <div style={{ marginTop: "auto", paddingTop: "clamp(24px, 3vh, 44px)" }}>
                {firma}
              </div>
            </div>

            {/* ══ Formular — ohne Rahmen und ohne eigene Fläche ══ */}
            <div style={{ flex: "0 0 clamp(380px, 38%, 560px)" }}>
              <Formular />
            </div>
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
