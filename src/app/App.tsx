import { useEffect, useState, useCallback, useRef, FormEvent } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence, LayoutGroup } from "motion/react";
import { useSubpageMode } from "./components/useSubpageMode";
import { SubpageOverlay } from "./components/SubpageOverlay";
import { UnterseiteAnlageprozess } from "./components/UnterseiteAnlageprozess";
import { UnterseiteAdvisory } from "./components/UnterseiteAdvisory";
import { UnterseiteMandat } from "./components/UnterseiteMandat";
import logoHorizontal from "../assets/logo/Tellian__Imperial purple logo.svg";
import { AnlagestrategienDetail } from "./components/AnlagestrategienDetail";
import { PortfolioManagementDetail } from "./components/PortfolioManagementDetail";
import { ANLAGEPROZESS_STEPS } from "./data/anlageprozessSteps";
import { ORDINAL_FONT_SIZE } from "./components/AnlageprozessStepOrdinal";
import { usePrefersReducedMotion } from "./components/usePrefersReducedMotion";
import { Kopfzeile } from "./components/Kopfzeile";
import { MobilMenue } from "./components/MobilMenue";
import { useBandZonen } from "./components/useBandTon";
import { LoginOverlay } from "./components/LoginOverlay";
import { LegalPage, useLegalRoute } from "./components/LegalPage";
import { C, serif, sans, EYEBROW } from "./tokens";
import { EASE } from "../styles/motion";
import { useHorizontalScroll } from "./components/useHorizontalScroll";
import { ScrollDebugOverlay, isScrollDebugEnabled } from "./components/ScrollDebugOverlay";
import { useBreakpoint } from "./components/useBreakpoint";
import {
  ScrollImage,
  HeroExpandingImage,
  ParallaxText,
  ScrollFade,
} from "./components/ScrollAnimations";
import { DotNavigation } from "./components/DotNavigation";
import { CtaButton } from "./components/CtaButton";
import { Station5Team } from "./components/Station5Team";
import { Station6Kontakt } from "./components/Station6Kontakt";
import { ExpandableBody } from "./components/ExpandableBody";
import { Station2WealthManagement } from "./components/Station2WealthManagement";
import { StationPortfolioManagement } from "./components/StationPortfolioManagement";
import { Station4Rad } from "./components/Station4Rad";
import { LAYOUT, TEXT_COLUMN_STYLE, getLayout, getTextColumnStyle, SPACING } from "./layout";
import { SECTION_WIDTH, SECTIONS, SUBPAGE_SECTION_KEY, indexOfSection } from "./sections";
import { SectionEnteredProvider } from "./components/SectionEntry";
import { Station1Einstieg } from "./components/Station1Einstieg";
import { prefetchImages } from "./components/ResponsiveImage";
import { useVerticalSectionIndex } from "./components/useVerticalSectionIndex";
/* Silver Mist statt Archive White. Dieselbe Sperrung — gemessen
   deckungsgleich (Leinwand 3034x1902, Motiv 2354px breit, Versatz
   320,607) —, nur die gelieferte Farbfassung ist eine andere.
   Eingefaerbt wird nichts. */
/* Vertikales Lockup (Monogramm oben, Wortzug darunter), Silver Mist
   auf Imperial Purple. Leinwand auf das Motiv beschnitten, Inhalt
   unverändert — siehe Kommentar in der Datei. */
import { PreloadScreen } from "./components/PreloadScreen";

/* Tokens: C, serif, sans from ./tokens.ts; EASE from ../styles/motion.ts */

/* ══════════════════════════════════════════════════════════
   CONTACT FORM — minimalist line inputs
   ═══════════════════════════════════════════════════════════ */
function ContactForm({ scrollX, isVertical = false }: { scrollX: number; isVertical?: boolean }) {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  const inputStyle: React.CSSProperties = {
    fontFamily: sans,
    color: C.dark,
    backgroundColor: "transparent",
    borderBottom: `1px solid ${C.line}`,
    outline: "none",
    padding: "12px 0 10px 0",
    width: "100%",
    transition: "border-color 0.4s ease",
  };

  return (
    <div className="w-full max-w-[380px]">
      <AnimatePresence mode="wait">
        {!submitted ? (
          <motion.form
            key="form"
            onSubmit={handleSubmit}
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
            className="flex flex-col gap-8"
          >
            <input
              type="text"
              placeholder="Name"
              required
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              style={{
                ...inputStyle,
                fontSize: "12px",
                letterSpacing: "0.04em",
              }}
              className="placeholder:text-tellian-muted focus:border-tellian-stone"
            />
            <input
              type="email"
              placeholder="E-Mail"
              required
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              style={{
                ...inputStyle,
                fontSize: "12px",
                letterSpacing: "0.04em",
              }}
              className="placeholder:text-tellian-muted focus:border-tellian-stone"
            />
            <textarea
              placeholder="Ihre Nachricht"
              required
              rows={3}
              value={formData.message}
              onChange={(e) =>
                setFormData({ ...formData, message: e.target.value })
              }
              style={{
                ...inputStyle,
                fontSize: "12px",
                letterSpacing: "0.04em",
                resize: "none",
              }}
              className="placeholder:text-tellian-muted focus:border-tellian-stone"
            />
            <CtaButton href="#" onClick={(e) => { e.preventDefault(); handleSubmit(e as any); }}>
              Anfrage senden
            </CtaButton>
          </motion.form>
        ) : (
          <motion.div
            key="thanks"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 1.0,
              ease: [0.25, 0.1, 0.25, 1],
              delay: 0.2,
            }}
            className="flex flex-col items-start"
          >
            <span
              style={{
                fontFamily: serif,
                color: C.dark,
                lineHeight: 1.15,
              }}
              className="text-[clamp(1.4rem,2.5vw,2.2rem)] tracking-[-0.015em]"
            >
              Vielen Dank.
            </span>
            <span
              style={{
                fontFamily: sans,
                color: C.charcoal,
                lineHeight: 1.8,
              }}
              className="text-[11px] mt-5 max-w-[300px]"
            >
              Wir melden uns innerhalb von zwei Arbeitstagen bei Ihnen.
              Wenn Sie vorher Fragen haben, erreichen Sie uns unter
              +41 44 224 40 24.
            </span>
            <div
              className="w-8 h-[1px] mt-8"
              style={{ backgroundColor: C.line }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   MOBILE / TABLET SUBPAGE OVERLAYS
   Plain fade (no FLIP) using the shared SubpageOverlay shell.
   ═══════════════════════════════════════════════════════════ */
function VermoegensverwaltungMobileOverlay({
  isOpen,
  onClose,
  onContactClick,
}: {
  isOpen: boolean;
  onClose: () => void;
  onContactClick: () => void;
}) {
  return (
    <SubpageOverlay
      isOpen={isOpen}
      onClose={onClose}
      eyebrow=""
      /* Kein Titel aus der Hülle: das Bauteil bringt ihn selbst mit,
         in beiden Fassungen. Beides zusammen ergab ihn doppelt. */
      headline={null}
    >
      <UnterseiteAnlageprozess isMobile aktiv={isOpen} />
    </SubpageOverlay>
  );
}

function AnlagestrategienMobileOverlay({
  isOpen,
  onClose,
  onContactClick,
}: {
  isOpen: boolean;
  onClose: () => void;
  onContactClick: () => void;
}) {
  return (
    <SubpageOverlay
      isOpen={isOpen}
      onClose={onClose}
      eyebrow="Anlagestrategien"
      headline={
        <>
          Zwei Perspektiven,
          <br />
          <em style={{ fontStyle: "italic", fontWeight: 400 }}>ein Portfolio.</em>
        </>
      }
    >
      <AnlagestrategienDetail
        isMobile={true}
        isDetail={isOpen}
        reducedMotion={true}
        onContactClick={onContactClick}
      />
    </SubpageOverlay>
  );
}

/* ═══════════════════════════════════════════════════════════
   SECTION 3 — VERMÖGENSVERWALTUNG
   Has two view modes:
   • overview (default): standard section with text left + timeline right
   • detail: fixed fullscreen, horizontal stepper, detail content below
   The same DOM is used — only CSS classes change.
   ══════════════════════════════════════════════════════════ */
interface Section3Props {
  scrollX?: number;  // no longer used (scroll-zoom removed), kept for call-site compat
  isVertical?: boolean;
  breakpoint?: "mobile" | "tablet" | "desktop";
  viewMode?: "overview" | "detail";
  onOpenDetail?: () => void;
  onCloseDetail?: () => void;
  onContactClick?: () => void;
  /** Ref-Callback der Sektions-Registry (nur Desktop). */
  panelRef?: (el: HTMLDivElement | null) => void;
  /**
   * Nur die Unterseite rendern, nicht die Station.
   *
   * Die Station im Track ist inzwischen StationPortfolioManagement.
   * Die Unterseite /vermoegensverwaltung liegt aber weiterhin in
   * diesem Bauteil und wird von Station 2 aus verlinkt — ohne diesen
   * Schalter wäre sie mit der alten Station verschwunden.
   */
  nurUnterseite?: boolean;
}

function Section3Vermoegensverwaltung({
  scrollX,
  isVertical = false,
  breakpoint = "desktop" as const,
  viewMode = "overview",
  onOpenDetail,
  onCloseDetail,
  onContactClick,
  nurUnterseite = false,
  panelRef,
}: Section3Props) {
  const layout = getLayout(breakpoint);
  const textColStyle = getTextColumnStyle(breakpoint);
  const reducedMotion = usePrefersReducedMotion();

  const isDetail = viewMode === "detail";

  // Scroll-zoom removed: section uses standard width, no animProgress.
  const sectionWidth = SECTION_WIDTH;

  const handleAnlageprozess = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    onOpenDetail?.();
  };

  const handleContactClick = () => {
    onContactClick?.();
  };

  const handleBackClick = () => {
    onCloseDetail?.();
  };

  const bodyParagraphs = [
    "Tellian Capital verwaltet Vermögen auf Mandatsbasis. Das bedeutet: Sie erteilen uns eine Verwaltungsvollmacht, Ihr Vermögen bleibt auf Ihrem eigenen Depot bei einer Kooperationsbank. Wir treffen die Anlageentscheide — Sie behalten die Kontrolle über Ihre Bankbeziehung.",
    "Jeder Kunde erhält ein eigenes Portfolio. Keine Modellportfolios, keine Standardallokation. Die Zusammenstellung richtet sich nach Ihren Zielen, Ihrer Risikotoleranz und Ihrer finanziellen Gesamtsituation.",
  ];

  if (isVertical) {
    /* Nur die Unterseite: sie liegt im schmalen Zweig als eigenes
       Overlay in DIESEM Bauteil. Gab dieser Zweig null zurück, war
       /vermoegensverwaltung auf dem Telefon nicht mehr erreichbar —
       genau das war seit dem Umbau von Station 3 der Fall. */
    if (nurUnterseite) {
      return (
        <VermoegensverwaltungMobileOverlay
          isOpen={viewMode === "detail"}
          onClose={() => onCloseDetail?.()}
          onContactClick={() => onContactClick?.()}
        />
      );
    }
    return (
      <section
        id="section-vermoegensverwaltung"
        style={{ backgroundColor: C.bg }}
      >
        {/* Text content — comes FIRST on mobile/tablet */}
        <div style={{ ...textColStyle }}>
          <ScrollFade scrollX={0} isVertical yOffset={16}>
            <span
              style={{
                fontFamily: sans,
                fontSize: EYEBROW.mobile,
                letterSpacing: "0.22em",
                color: C.stone,
                display: "block",
              }}
              className="uppercase"
            >
              Vermögensverwaltung
            </span>

            <div
              style={{
                width: "32px",
                height: "1.5px",
                backgroundColor: C.dark,
                marginTop: SPACING.eyebrowToAccent,
              }}
            />
          </ScrollFade>

          <ScrollFade scrollX={0} isVertical yOffset={24}>
            <h2
              style={{
                fontFamily: serif,
                fontSize: breakpoint === "mobile" ? "clamp(36px, 10vw, 48px)" : "clamp(48px, 6vw, 68px)",
                lineHeight: 0.94,
                color: C.dark,
                letterSpacing: "-0.03em",
                marginTop: SPACING.accentToHeadline,
              }}
            >
              Ihr Vermögen.
              <br />
              Ihr Konto.
              <br />
              <em>Unsere Verantwortung.</em>
            </h2>
          </ScrollFade>

          <ScrollFade scrollX={0} isVertical yOffset={20}>
            <div style={{ marginTop: SPACING.headlineToBody }}>
              <ExpandableBody
                paragraphs={bodyParagraphs}
                visibleCount={1}
                fontSize={breakpoint === "mobile" ? "14px" : "13px"}
                lineHeight={1.7}
                gap="14px"
                maxWidth={layout.bodyMaxWidth}
              />
            </div>
          </ScrollFade>

        </div>

        {/* Partei-Dreieck — comes AFTER text on mobile/tablet */}
        <div style={{
          width: "100%",
          padding: breakpoint === "mobile" ? "32px 20px" : "40px 32px",
        }}>
        </div>

        {/* CTA — AFTER the visual element on mobile */}
        <ScrollFade scrollX={0} isVertical yOffset={16}>
          <div style={{ padding: breakpoint === "mobile" ? "0 20px 32px" : "0 32px 32px" }}>
            <CtaButton href="/vermoegensverwaltung" onClick={handleAnlageprozess}>
              Mehr zur Vermögensverwaltung
            </CtaButton>
          </div>
        </ScrollFade>
        {/* Detail overlay for mobile/tablet — plain fade (no FLIP) */}
        <VermoegensverwaltungMobileOverlay
          isOpen={isDetail}
          onClose={() => onCloseDetail?.()}
          onContactClick={() => onContactClick?.()}
        />
      </section>
    );
  }

  /* ═══════════════════════════════════════════════════════════
     DESKTOP — two view modes
     Overview: normal section inside the horizontal scroll strip
     Detail: rendered via Portal to document.body, fixed fullscreen,
             horizontal stepper + detail content below.
     ═══════════════════════════════════════════════════════════ */


  /* ── OVERVIEW section (always rendered inside the scroll strip) ── */
  const overviewMarkup = (
    <div
      ref={panelRef}
      className="flex-shrink-0 h-screen relative"
      style={{ width: sectionWidth, backgroundColor: C.bg }}
    >
      {/* Content wrapper — füllt die Sektion; 100% statt 100vw, sonst
          ragt er 6vw über die Sektion und verdeckt den Streifen der
          Folgesektion. */}
      <div style={{
        position: "relative",
        width: "100%",
        height: "100%",
      }}>

        <div
          className="relative z-10 h-full flex flex-col justify-center"
          style={{
            ...textColStyle,
            width: "44vw",  /* Narrowed from 56vw — aligns with dark panel edge at 44vw */
            backgroundColor: C.bg,  /* Opaque — prevents dark panel bleeding through */
            maxWidth: "calc(460px + clamp(36px, 5vw, 120px) + 4vw)",
            opacity: isDetail ? 0 : 1,
            transform: isDetail ? "translateX(-50px)" : "translateX(0)",
            transition: `opacity 500ms ${EASE.standard}, transform 500ms ${EASE.standard}`,
            pointerEvents: isDetail ? "none" : "auto",
          }}
        >
        <span
          style={{
            fontFamily: sans, fontSize: EYEBROW.desktop, letterSpacing: "0.22em",
            color: C.stone, display: "block",
          }}
          className="uppercase"
        >
          Vermögensverwaltung
        </span>

        <div
          style={{
            width: "28px", height: "1.5px",
            backgroundColor: C.dark, marginTop: SPACING.eyebrowToAccent,
          }}
        />

        <h2
          style={{
            fontFamily: serif, fontSize: "clamp(48px, 7vh, 80px)",
            lineHeight: 0.94, color: C.dark, letterSpacing: "-0.03em",
            marginTop: SPACING.accentToHeadline,
          }}
        >
          Ihr Vermögen.
          <br />
          Ihr Konto.
          <br />
          <em>Unsere Verantwortung.</em>
        </h2>

        <div
          style={{
            marginTop: SPACING.headlineToBody,
            maxWidth: layout.bodyMaxWidth,
            display: "flex", flexDirection: "column",
            gap: SPACING.bodyParagraphGap,
          }}
        >
          {bodyParagraphs.map((text, i) => (
            <p
              key={i}
              style={{
                fontFamily: sans, fontSize: "16px",
                color: C.charcoal, lineHeight: 1.75, margin: 0,
              }}
            >
              {text}
            </p>
          ))}

          {/* CTA — inline with body text, left-aligned */}
          <a
            href="/vermoegensverwaltung"
            onClick={handleAnlageprozess}
            className="inline-flex items-center gap-3 uppercase"
            style={{
              marginTop: "56px",
              padding: "16px 24px",
              border: `1px solid ${C.button}`,
              borderRadius: 0,
              backgroundColor: C.button,
              fontFamily: sans,
              fontSize: "11px",
              fontWeight: 500,
              letterSpacing: "0.18em",
              color: C.dark,
              textDecoration: "none",
              lineHeight: 1,
              alignSelf: "flex-start",
              transition: "background-color 250ms ease-out",
            }}
          >
            <span>Mehr zur Vermögensverwaltung</span>
            <span aria-hidden>→</span>
          </a>
        </div>
      </div>
      </div>
    </div>
  );

  /* ── DETAIL overlay (rendered via Portal to body) ── */
  const detailOverlay = typeof document !== "undefined" && createPortal(
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 90,
        backgroundColor: C.bg,
        /* Die Seite passt auf einen Bildschirm. `auto` bleibt als
           Notausgang für Fenster, die kleiner sind als jedes hier
           geprüfte Format — regulär greift es nie. */
        overflowY: "auto",
        overflowX: "hidden",
        WebkitOverflowScrolling: "touch",
        display: "flex",
        flexDirection: "column",
        opacity: isDetail ? 1 : 0,
        pointerEvents: isDetail ? "auto" : "none",
        visibility: isDetail ? "visible" : "hidden",
        transition: `opacity 400ms ease-out, visibility 0s linear ${isDetail ? "0s" : "800ms"}`,
      }}
    >
      {/* ═══ Top Bar (sticky) ═══ */}
      <div
        style={{
          position: "sticky",
          top: 0,
          zIndex: 10,
          backgroundColor: "rgba(249, 249, 247, 0.92)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          borderBottom: `1px solid ${C.line}`,
          height: 56,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 32px",
          opacity: isDetail ? 1 : 0,
          transition: `opacity 300ms ease-out ${isDetail ? "900ms" : "0ms"}`,
        }}
      >
        {/* Dasselbe Logo wie in der Kopfzeile der Hauptseite. Vorher
            stand hier der Schriftzug „Tellian" in Inter gesperrt —
            weder die Wortmarke noch die richtige Schrift. */}
        <img
          src={logoHorizontal}
          alt="Tellian Capital"
          style={{ width: "120px", height: "auto", display: "block" }}
        />
        <button
          onClick={handleBackClick}
          style={{
            background: "transparent", border: "none", cursor: "pointer",
            padding: "10px 4px", minHeight: "44px",
            display: "inline-flex", alignItems: "center", gap: "6px",
            fontFamily: sans, fontSize: "11px", letterSpacing: "0.15em",
            textTransform: "uppercase", color: C.stone,
            transition: "color 300ms ease-out",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = C.dark)}
          onMouseLeave={(e) => (e.currentTarget.style.color = C.stone)}
        >
          <span aria-hidden>←</span>
          <span>Zurück</span>
        </button>
      </div>

      {/* Der Inhalt der Unterseite. Die Kopfzeile darüber bleibt
          unverändert; ersetzt wird alles darunter — vorher Titel,
          waagrechter Stepper und fünf lange Abschnitte. */}
      <UnterseiteAnlageprozess aktiv={isDetail} />
    </div>,
    document.body
  );

  /* LayoutGroup enables Framer Motion's layoutId matching across React portals.
     Without it, the ordinal in Section3Timeline and the ordinal in the Portal
     overlay cannot be recognized as the same element → no FLIP. */
  return (
    <LayoutGroup>
      {!nurUnterseite && overviewMarkup}
      {detailOverlay}
    </LayoutGroup>
  );
}

/* Reserved: void unused imports if any */
void ORDINAL_FONT_SIZE;

/* ═══════════════════════════════════════════════════════════
   SECTION 4 — ANLAGESTRATEGIEN
   Has two view modes. In detail mode the FLIP'd headlines
   (Top-Down + Bottom-Up) fly from the Section4TopDownBottomUp
   block into the subpage hero.
   ═══════════════════════════════════════════════════════════ */
interface Section4Props {
  scrollX: number;
  isVertical?: boolean;
  breakpoint?: "mobile" | "tablet" | "desktop";
  viewMode?: "overview" | "detail";
  onOpenDetail?: () => void;
  onCloseDetail?: () => void;
  onContactClick?: () => void;
  /** Opens the Vermögensverwaltung detail (CTA "Mehr zum Anlageprozess") */
  onNavigateToProcess?: () => void;
  /** Ref-Callback der Sektions-Registry (nur Desktop). */
  panelRef?: (el: HTMLDivElement | null) => void;
  /**
   * Nur die Unterseite rendern, nicht die Station.
   *
   * Die Station im Track ist inzwischen Station4Rad. Die
   * Unterseite /anlagestrategien liegt aber weiterhin hier und wird
   * von der Mandat-Karte in Station 3 aus verlinkt — ohne diesen
   * Schalter wäre sie mit der alten Station verschwunden.
   */
  nurUnterseite?: boolean;
}

function Section4Anlagestrategien({
  scrollX,
  isVertical = false,
  breakpoint = "desktop" as const,
  viewMode = "overview",
  onOpenDetail,
  onCloseDetail,
  onContactClick,
  onNavigateToProcess,
  panelRef,
  nurUnterseite = false,
}: Section4Props) {
  const layout = getLayout(breakpoint);
  const textColStyle = getTextColumnStyle(breakpoint);
  const reducedMotion = usePrefersReducedMotion();

  const isDetail = viewMode === "detail";

  const bodyParagraphs = [
    "Jede Anlageentscheidung bei Tellian Capital folgt einem klaren, nachvollziehbaren Prozess. Von den Leitprinzipien über Ihr persönliches Anlegerprofil bis zur strategischen und taktischen Allokation — nichts entsteht aus Marktstimmung, alles aus Methode.",
    "Das Ergebnis ist eine individuelle Portfolio-Konstruktion, die laufend überwacht und transparent berichtet wird. So bleibt Ihr Portfolio jederzeit auf Ihre Ziele ausgerichtet.",
  ];

  if (isVertical) {
    /* Wie bei Station 3: die Unterseite liegt im schmalen Zweig als
       eigenes Overlay hier. */
    if (nurUnterseite) {
      return (
        <AnlagestrategienMobileOverlay
          isOpen={viewMode === "detail"}
          onClose={() => onCloseDetail?.()}
          onContactClick={() => onContactClick?.()}
          onNavigateToProcess={() => onNavigateToProcess?.()}
        />
      );
    }
    return (
      <section
        id="section-anlagestrategien"
        style={{ backgroundColor: C.bg }}
      >
        {/* Text content — comes FIRST on mobile/tablet */}
        <div style={{ ...textColStyle }}>
          <ScrollFade scrollX={0} isVertical yOffset={16}>
            <span
              style={{
                fontFamily: sans,
                fontSize: EYEBROW.mobile,
                letterSpacing: "0.22em",
                color: C.stone,
                display: "block",
              }}
              className="uppercase"
            >
              Portfolio Management
            </span>

            <div
              style={{
                width: "32px",
                height: "1.5px",
                backgroundColor: C.dark,
                marginTop: SPACING.eyebrowToAccent,
              }}
            />
          </ScrollFade>

          <ScrollFade scrollX={0} isVertical yOffset={24}>
            <h2
              style={{
                fontFamily: serif,
                fontSize: breakpoint === "mobile" ? "clamp(36px, 10vw, 48px)" : "clamp(48px, 6vw, 68px)",
                lineHeight: 0.94,
                color: C.dark,
                letterSpacing: "-0.03em",
                marginTop: SPACING.accentToHeadline,
              }}
            >
              Methode statt
              <br />
              <em>Zufall.</em>
            </h2>
          </ScrollFade>

          <ScrollFade scrollX={0} isVertical yOffset={20}>
            <div style={{ marginTop: SPACING.headlineToBody }}>
              <ExpandableBody
                paragraphs={bodyParagraphs}
                visibleCount={1}
                fontSize={breakpoint === "mobile" ? "14px" : "13px"}
                lineHeight={1.7}
                gap="14px"
                maxWidth={layout.bodyMaxWidth}
              />
            </div>
          </ScrollFade>

        </div>

        {/* Methodik-Schaubild — comes AFTER text on mobile/tablet */}
        <div style={{ width: "100%", padding: "32px 16px" }}>
          <figure role="img" aria-label="Flussdiagramm: Anlageprozess von Leitprinzipien bis Reporting." style={{ maxWidth: 480, margin: "0 auto", padding: 0 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              {["Leitprinzipien", "Investment-Philosophie"].map(t => (
                <div key={t} style={{ border: `1px solid ${C.line}`, padding: "12px 14px", textAlign: "center" }}>
                  <span style={{ fontFamily: serif, fontSize: 13, color: C.dark, lineHeight: 1.4 }}>{t}</span>
                </div>
              ))}
            </div>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "4px 0" }} aria-hidden>
              <div style={{ width: 0.5, height: 10, borderLeft: `1px dashed ${C.line}` }} />
              <span style={{ fontFamily: sans, fontSize: 7, letterSpacing: "0.12em", textTransform: "uppercase", color: C.stone, padding: "2px 8px" }}>Anlegerprofil des Kunden</span>
              <div style={{ width: 0.5, height: 10, borderLeft: `1px dashed ${C.line}` }} />
            </div>
            {/* CONTENT: pending client verification (alte Kurzprofil-Claims) */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 10 }}>
              {["Innovatives Portfolio-Management", "Zugang zu einzigartigen Investmentmöglichkeiten", "Inhouse-Expertise & internationales Netzwerk"].map(t => (
                <div key={t} style={{ backgroundColor: C.purple, padding: "12px 14px", textAlign: "center" }}>
                  <span style={{ fontFamily: serif, fontSize: 13, color: C.bg, lineHeight: 1.4 }}>{t}</span>
                </div>
              ))}
            </div>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "4px 0" }} aria-hidden>
              <div style={{ width: 0.5, height: 14, borderLeft: `1px dashed ${C.line}` }} />
              <svg width="10" height="7" viewBox="0 0 10 7" fill="none"><path d="M1 1l4 4 4-4" stroke={C.stone} strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              {["Strategische Allokation", "Taktische Allokation"].map(t => (
                <div key={t} style={{ border: `1px solid ${C.line}`, padding: "12px 14px", textAlign: "center" }}>
                  <span style={{ fontFamily: serif, fontSize: 13, color: C.dark, lineHeight: 1.4 }}>{t}</span>
                </div>
              ))}
            </div>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "4px 0" }} aria-hidden>
              <div style={{ width: 0.5, height: 14, borderLeft: `1px dashed ${C.line}` }} />
              <svg width="10" height="7" viewBox="0 0 10 7" fill="none"><path d="M1 1l4 4 4-4" stroke={C.stone} strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </div>
            <div style={{ backgroundColor: C.purple, padding: "14px 18px", textAlign: "center" }}>
              <span style={{ fontFamily: serif, fontSize: 13, color: C.bg, lineHeight: 1.4 }}>Individuelle Portfolio-Konstruktion</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "4px 0" }} aria-hidden>
              <div style={{ width: 0.5, height: 14, borderLeft: `1px dashed ${C.line}` }} />
              <svg width="10" height="7" viewBox="0 0 10 7" fill="none"><path d="M1 1l4 4 4-4" stroke={C.stone} strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              {["Überwachung", "Reporting"].map(t => (
                <div key={t} style={{ border: `1px solid ${C.line}`, padding: "12px 14px", textAlign: "center" }}>
                  <span style={{ fontFamily: serif, fontSize: 13, color: C.dark, lineHeight: 1.4 }}>{t}</span>
                </div>
              ))}
            </div>
          </figure>
        </div>

        {/* CTA — AFTER the visual element on mobile */}
        <ScrollFade scrollX={0} isVertical yOffset={16}>
          <div style={{ padding: breakpoint === "mobile" ? "0 20px 32px" : "0 32px 32px" }}>
            <CtaButton href="/portfolio-management" onClick={(e: React.MouseEvent<HTMLAnchorElement>) => { e.preventDefault(); onNavigateToProcess?.(); }}>
              Mehr zum Anlageprozess
            </CtaButton>
          </div>
        </ScrollFade>

        {/* Detail overlay for mobile/tablet — plain fade (no FLIP) */}
        <AnlagestrategienMobileOverlay
          isOpen={isDetail}
          onClose={() => onCloseDetail?.()}
          onContactClick={() => onContactClick?.()}
        />
      </section>
    );
  }

  /* Desktop */

  /* ─── Overview markup — normal section inside horizontal scroll strip ─── */
  const handleNavigateToProcess = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    onNavigateToProcess?.();
  };

  const overviewMarkup = (
    <div
      ref={panelRef}
      className="flex-shrink-0 h-screen relative"
      style={{ width: SECTION_WIDTH, backgroundColor: C.bg }}
    >
      {/* ── Right column: Methodik-Schaubild ──
           Section4: 40/60 statt 50/50 — bewusst, Schaubild braucht Breite.
           Nicht an andere Sektionen angleichen. */}
      <div style={{
        position: "absolute", top: 0, bottom: 0, left: "38vw", right: 0,
        display: "flex", alignItems: "center", justifyContent: "center",
        overflow: "visible",
      }}>
        <figure
          role="img"
          aria-label="Flussdiagramm: Von Leitprinzipien und Investment-Philosophie über das Anlegerprofil des Kunden zu innovativem Portfolio-Management, strategischer und taktischer Allokation, individueller Portfolio-Konstruktion, Überwachung und Reporting."
          style={{ maxWidth: 560, width: "100%", margin: 0, padding: 0 }}
        >
          {/* Tier 1 */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            {["Leitprinzipien", "Investment-Philosophie"].map(t => (
              <div key={t} style={{ border: `1px solid ${C.line}`, padding: "14px 16px", textAlign: "center" }}>
                <span style={{ fontFamily: serif, fontSize: 13, color: C.dark, lineHeight: 1.4 }}>{t}</span>
              </div>
            ))}
          </div>
          {/* Connector: Anlegerprofil */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "4px 0" }} aria-hidden>
            <div style={{ width: 0.5, height: 12, borderLeft: `1px dashed ${C.line}` }} />
            <span style={{ fontFamily: sans, fontSize: 8, letterSpacing: "0.14em", textTransform: "uppercase", color: C.stone, padding: "3px 10px" }}>
              Anlegerprofil des Kunden
            </span>
            <div style={{ width: 0.5, height: 12, borderLeft: `1px dashed ${C.line}` }} />
          </div>
          {/* CONTENT: pending client verification (alte Kurzprofil-Claims) */}
          {/* Tier 2: three highlighted nodes */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
            {[
              "Innovatives Portfolio-Management",
              "Zugang zu einzigartigen Investmentmöglichkeiten",
              "Inhouse-Expertise & internationales Netzwerk",
            ].map(t => (
              <div key={t} style={{
                backgroundColor: C.purple, padding: "14px 12px", textAlign: "center",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <span style={{ fontFamily: serif, fontSize: 13, color: C.bg, lineHeight: 1.4 }}>{t}</span>
              </div>
            ))}
          </div>
          {/* Chevron */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "4px 0" }} aria-hidden>
            <div style={{ width: 0.5, height: 16, borderLeft: `1px dashed ${C.line}` }} />
            <svg width="10" height="7" viewBox="0 0 10 7" fill="none"><path d="M1 1l4 4 4-4" stroke={C.stone} strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </div>
          {/* Tier 3 */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            {["Strategische Allokation", "Taktische Allokation"].map(t => (
              <div key={t} style={{ border: `1px solid ${C.line}`, padding: "14px 16px", textAlign: "center" }}>
                <span style={{ fontFamily: serif, fontSize: 13, color: C.dark, lineHeight: 1.4 }}>{t}</span>
              </div>
            ))}
          </div>
          {/* Chevron */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "4px 0" }} aria-hidden>
            <div style={{ width: 0.5, height: 16, borderLeft: `1px dashed ${C.line}` }} />
            <svg width="10" height="7" viewBox="0 0 10 7" fill="none"><path d="M1 1l4 4 4-4" stroke={C.stone} strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </div>
          {/* Tier 4 */}
          <div style={{ backgroundColor: C.purple, padding: "16px 20px", textAlign: "center" }}>
            <span style={{ fontFamily: serif, fontSize: 13, color: C.bg, lineHeight: 1.4 }}>Individuelle Portfolio-Konstruktion</span>
          </div>
          {/* Chevron */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "4px 0" }} aria-hidden>
            <div style={{ width: 0.5, height: 16, borderLeft: `1px dashed ${C.line}` }} />
            <svg width="10" height="7" viewBox="0 0 10 7" fill="none"><path d="M1 1l4 4 4-4" stroke={C.stone} strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </div>
          {/* Tier 5 */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            {["Überwachung", "Reporting"].map(t => (
              <div key={t} style={{ border: `1px solid ${C.line}`, padding: "14px 16px", textAlign: "center" }}>
                <span style={{ fontFamily: serif, fontSize: 13, color: C.dark, lineHeight: 1.4 }}>{t}</span>
              </div>
            ))}
          </div>
        </figure>
      </div>

      {/* ── Left column: text (38vw — narrower, 40/60 split for schaubild) ── */}
      <div
        className="relative z-10 h-full flex flex-col justify-center"
        style={{
          ...textColStyle,
          width: "38vw",
          maxWidth: "calc(460px + clamp(36px, 5vw, 120px) + 4vw)",
          opacity: isDetail ? 0 : 1,
          transform: isDetail ? "translateX(-50px)" : "translateX(0)",
          transition: `opacity 500ms ${EASE.in}, transform 500ms ${EASE.in}`,
          pointerEvents: isDetail ? "none" : "auto",
        }}
      >
        <span
          style={{
            fontFamily: sans,
            fontSize: EYEBROW.desktop,
            letterSpacing: "0.22em",
            color: C.stone,
            display: "block",
          }}
          className="uppercase"
        >
          Portfolio Management
        </span>

        <div
          style={{
            width: "28px",
            height: "1.5px",
            backgroundColor: C.dark,
            marginTop: SPACING.eyebrowToAccent,
          }}
        />

        <h2
          style={{
            fontFamily: serif,
            fontSize: "clamp(48px, 7vh, 80px)",
            lineHeight: 0.94,
            color: C.dark,
            letterSpacing: "-0.03em",
            marginTop: SPACING.accentToHeadline,
          }}
        >
          Methode statt
          <br />
          <em>Zufall.</em>
        </h2>

        <div
          style={{
            marginTop: SPACING.headlineToBody,
            maxWidth: layout.bodyMaxWidth,
            display: "flex",
            flexDirection: "column",
            gap: SPACING.bodyParagraphGap,
          }}
        >
          {bodyParagraphs.map((text, i) => (
            <p
              key={i}
              style={{
                fontFamily: sans,
                fontSize: "16px",
                color: C.charcoal,
                lineHeight: 1.75,
                margin: 0,
              }}
            >
              {text}
            </p>
          ))}

          <a
            href="/portfolio-management"
            onClick={handleNavigateToProcess}
            className="inline-flex items-center gap-3 uppercase"
            style={{
              marginTop: "56px",
              padding: "16px 24px",
              border: `1px solid ${C.button}`,
              borderRadius: 0,
              backgroundColor: C.button,
              fontFamily: sans,
              fontSize: "11px",
              fontWeight: 500,
              letterSpacing: "0.18em",
              color: C.dark,
              textDecoration: "none",
              lineHeight: 1,
              alignSelf: "flex-start",
              transition: "background-color 250ms ease-out",
            }}
          >
            <span>Mehr zum Anlageprozess</span>
            <span aria-hidden>→</span>
          </a>
        </div>
      </div>
    </div>
  );

  /* ─── Wrap overview + overlay in a shared LayoutGroup so Framer Motion
         can match headline layoutIds across the React Portal. ─── */
  return (
    <LayoutGroup>
      {!nurUnterseite && overviewMarkup}
      <SubpageOverlay
        isOpen={isDetail}
        onClose={() => onCloseDetail?.()}
        eyebrow="Anlagestrategien"
        headline={
          <>
            Zwei Perspektiven,
            <br />
            <em style={{ fontStyle: "italic", fontWeight: 400 }}>ein Portfolio.</em>
          </>
        }
      >
        <AnlagestrategienDetail
          isMobile={isVertical}
          isDetail={isDetail}
          reducedMotion={reducedMotion}
          onContactClick={() => onContactClick?.()}
        />
      </SubpageOverlay>
    </LayoutGroup>
  );
}

/**
 * Verzögerung der ersten Eintritts-Rastung nach dem Intro.
 * Gibt den Schriften einen Moment, damit die Einblendung nicht auf
 * einem Fallback-Font startet und mitten im Lauf umbricht.
 */
const FIRST_ENTRY_DELAY_MS = 120;

/**
 * Startsektion aus der URL.
 *
 * Zwei Quellen, in dieser Reihenfolge:
 *   1. Der Pfad einer Unterseite — wer /vermoegensverwaltung direkt
 *      öffnet und wieder schliesst, soll bei der zugehörigen Sektion
 *      stehen und nicht im Hero.
 *   2. Der Hash der zuletzt besuchten Sektion, damit ein Reload dort
 *      weitermacht, wo man war.
 */
function readInitialSectionIndex(): number {
  if (typeof window === "undefined") return 0;

  const owner = SUBPAGE_SECTION_KEY[window.location.pathname];
  const fromPath = indexOfSection(owner);
  if (fromPath >= 0) return fromPath;

  const fromHash = indexOfSection(window.location.hash.replace(/^#/, ""));
  return fromHash >= 0 ? fromHash : 0;
}

/* ═══════════════════════════════════════════════════════════
   MAIN APPLICATION
   ═══════════════════════════════════════════════════════════ */
export default function App() {
  const { breakpoint, isMobile, isTablet, isDesktop, isVertical } = useBreakpoint();
  const layout = getLayout(breakpoint);
  const textColStyle = getTextColumnStyle(breakpoint);

  const [introComplete, setIntroComplete] = useState(false);

  /* ═══ Subpage detail views (no route, no unmount) ═══
       Stehen vor dem Scroll-Hook, weil dieser isDetailMode für seine
       locked-Option braucht. */
  const vvw = useSubpageMode("/vermoegensverwaltung");
  /* Advisory hängt an derselben Station wie Mandat — Station 3. */
  const adv = useSubpageMode("/advisory");
  const man = useSubpageMode("/mandat");
  const ast = useSubpageMode("/anlagestrategien");
  const pm  = useSubpageMode("/portfolio-management");
  /* Detail mode is active when any subpage is open */
  const isDetailMode = vvw.isDetail || ast.isDetail || pm.isDetail || adv.isDetail || man.isDetail;

  /* ── Horizontaler Scroll mit Sektions-Rastung (nur Desktop) ──
        `locked` sperrt Eingaben, solange ein Overlay offen ist oder das
        Intro läuft. Der Wheel-Handler ist dabei schon durch
        pointer-events: none blockiert; keydown hängt aber am Fenster. */
  /* Einmal beim Aufbau gelesen — spätere Hash-Änderungen schreiben wir
     selbst und dürfen nicht auf uns selbst zurückwirken. */
  const [initialSectionIndex] = useState(readInitialSectionIndex);

  /* Personen-Detail der Teamstation: sperrt die Tastatur des Tracks. */
  const [teamDetailOffen, setTeamDetailOffen] = useState(false);
  const { containerRef, panelRef: panelRefRoh, jumpToIndex, scrollDirection, activeIndex: horizontalIndex, visibleRange, debugRef } =
    useHorizontalScroll({
      disabled: isVertical,
      locked: isDetailMode || teamDetailOffen || !introComplete,
      initialIndex: initialSectionIndex,
    });

  /* Im vertikalen Zweig ist der Scroll-Hook abgeschaltet; die aktive
     Sektion kommt dort aus einem eigenen Observer. */
  const verticalIndex = useVerticalSectionIndex(isVertical);
  const activeIndex = isVertical ? verticalIndex : horizontalIndex;

  /* Einziger Einstiegspunkt für Direktsprünge aus der Navigation. */
  const navigateToSection = useCallback(
    (index: number) => {
      const section = SECTIONS[Math.max(0, Math.min(SECTIONS.length - 1, index))];
      if (isVertical) {
        document.getElementById(section.domId)?.scrollIntoView({ behavior: "smooth" });
      } else {
        jumpToIndex(index);
      }
    },
    [isVertical, jumpToIndex]
  );

  /* ═══ Eintritts-Latch ═══
       Rastet die aktuelle Sektion und nimmt sie nie zurück. Weil
       activeIndex schon beim Absprung steht, läuft die Einblendung
       während der Flugzeit statt erst bei Ankunft. */
  const [entered, setEntered] = useState<boolean[]>(() => SECTIONS.map(() => false));
  const markEntered = useCallback((i: number) => {
    setEntered((prev) => (prev[i] ? prev : prev.map((v, k) => (k === i ? true : v))));
  }, []);

  /* Die erste Rastung wartet auf das Ende des Intros und einen kurzen
     Moment für die Schriften. Ohne das liefe die Einblendung der
     Startsektion hinter dem Preload-Screen ab und wäre beim Aufdecken
     schon vorbei — genau der erste Eindruck ginge verloren.
     Gerastet wird die dann aktuelle Sektion, nicht pauschal Index 0:
     bei einem Deep-Link steht der Track schon woanders, und der Hero
     soll seine Einblendung behalten, bis er wirklich betreten wird. */
  const firstLatchDone = useRef(false);
  useEffect(() => {
    if (isVertical || !introComplete) return;
    /* Gerastet wird auf visibleIndex, nicht auf activeIndex: beim
       freien Scrollen ist eine Sektion lange sichtbar, bevor sie die
       Bildmitte erreicht. An die Mitte gebunden würde ihr Inhalt vor
       den Augen des Betrachters aufblenden.

       Gerastet wird der sichtbare BEREICH, nicht alles bis dahin: bei
       einem Deep-Link auf Sektion 3 bliebe der Hero sonst abgehakt,
       obwohl er nie zu sehen war. Er soll seine Einblendung behalten,
       bis man wirklich dort ist. */
    const latch = () => {
      for (let i = visibleRange[0]; i <= visibleRange[1]; i++) markEntered(i);
    };
    if (firstLatchDone.current) {
      latch();
      return;
    }
    const t = setTimeout(() => {
      firstLatchDone.current = true;
      latch();
    }, FIRST_ENTRY_DELAY_MS);
    return () => clearTimeout(t);
  }, [isVertical, introComplete, visibleRange, markEntered]);

  /* Debug-Overlay der Rastung — hinter ?scrolldebug, bleibt bis Go-live. */
  const [scrollDebug] = useState(isScrollDebugEnabled);

  /* ── Hero-Eintritt (Desktop) ──
        Läuft jetzt über denselben Latch wie alle anderen Sektionen,
        statt über einen eigenen Timer. Damit gilt auch hier: einmal
        pro Sitzung, kein Rückwärtslaufen beim Zurückkommen.
        Die Staffelung ist von ~1.4s auf ~650ms gekürzt, damit sie
        auch dann trägt, wenn der Hero per Sprung erreicht wird. */
  const heroAnimate = entered[0];

  /* ── Hero scroll-arrow: nur auf der Startsektion sichtbar.
        Hing vorher an scrollX; mit der Rastung genügt der Index. ── */
  const heroArrowHidden = activeIndex > 0;

  const handleIntroComplete = useCallback(() => {
    setIntroComplete(true);
  }, []);

  /* ── Login overlay state ── */
  const [loginOpen, setLoginOpen] = useState(false);

  /* Jedes Panel bekommt seine Nummer als data-Attribut. useBandTon
     misst darüber, wie viel Fläche jede Station gerade im Fenster
     einnimmt — daraus entsteht der stetige Ton der beiden Bänder. */
  const panelRef = useCallback(
    (index: number) => (el: HTMLDivElement | null) => {
      if (el) el.dataset.tellianStation = String(index);
      panelRefRoh(index)(el);
    },
    [panelRefRoh],
  );

  /* Sprache und mobiles Menü lagen bisher in Navigation. Mit dem
     Umbau sind Kopfzeile und Menü zwei Komponenten — der Zustand
     gehört deshalb hierher, wo beide ihn sehen. */
  const [sprache, setSprache] = useState<"DE" | "EN">("DE");
  const [menueOffen, setMenueOffen] = useState(false);

  /* Trägt die aktive Station eine dunkle Fläche? Kopfzeile und
     Stationsleiste wählen danach ihre Fassung — auf Station 4 also
     das helle Logo und helle Schrift. */
  /* Sichtbare Stationsbereiche. Beide Bänder zeichnen ihren Inhalt
     danach zweimal und maskieren jede Fassung auf ihren Grund —
     siehe useBandZonen. */
  const bandZonen = useBandZonen(!isVertical, activeIndex);

  /* ── Legal pages routing (Impressum / Datenschutz / Kundeninformation) ── */
  const legal = useLegalRoute();

  /* ═══ Aktuelle Sektion in der URL halten ═══
       replaceState statt pushState: der Zurück-Button soll Unterseiten
       schliessen, nicht Sektion für Sektion zurückscrollen.
       Nicht schreiben, solange eine Unterseite oder eine Rechtsseite
       offen ist — deren Pfad ist die Wahrheit, nicht die Sektion. */
  useEffect(() => {
    if (!introComplete || isDetailMode || legal.activePath) return;
    const key = SECTIONS[activeIndex]?.key;
    if (!key) return;

    const hash = activeIndex === 0 ? "" : `#${key}`;
    const { pathname, search } = window.location;
    const next = `${pathname}${search}${hash}`;
    if (next !== `${pathname}${search}${window.location.hash}`) {
      window.history.replaceState(window.history.state, "", next);
    }
  }, [activeIndex, introComplete, isDetailMode, legal.activePath]);

  /* ═══ Bilder der Nachbarsektionen vorladen ═══
       Erst wenn die Bewegung steht. Während des Sprungs zu laden würde
       das Problem nur verlagern: die Dekodierung kostet dann genau die
       Frames, die der Sprung braucht. requestIdleCallback wartet
       zusätzlich auf eine ruhige Stelle im Hauptthread. */
  useEffect(() => {
    if (isVertical || !introComplete) return;
    if (scrollDirection !== "idle") return;

    const ids = [activeIndex - 1, activeIndex + 1]
      .filter((i) => i >= 0 && i < SECTIONS.length)
      .flatMap((i) => SECTIONS[i].imageIds);
    if (!ids.length) return;

    const run = () => prefetchImages(ids);
    const idleId = window.requestIdleCallback?.(run, { timeout: 1500 });
    const timerId = idleId === undefined ? window.setTimeout(run, 500) : 0;
    return () => {
      if (idleId !== undefined) window.cancelIdleCallback?.(idleId);
      else clearTimeout(timerId);
    };
  }, [isVertical, introComplete, scrollDirection, activeIndex]);

  /* Vertikaler Zweig: Startsektion einnehmen. Der Scroll-Hook ist dort
     abgeschaltet, initialIndex greift also nicht. Ohne Animation. */
  useEffect(() => {
    if (!isVertical || !introComplete || initialSectionIndex === 0) return;
    const el = document.getElementById(SECTIONS[initialSectionIndex].domId);
    el?.scrollIntoView({ behavior: "auto" });
  }, [isVertical, introComplete, initialSectionIndex]);

  const navigateToContact = useCallback(() => {
    if (isDetailMode) {
      vvw.closeDetail();
      ast.closeDetail();
      pm.closeDetail();
      adv.closeDetail();
      man.closeDetail();
    }
    navigateToSection(SECTIONS.length - 1);
  }, [isDetailMode, vvw, ast, pm, adv, man, navigateToSection]);

  /* ═══════════════════════════════════════════════════════
     VERTICAL LAYOUT (Tablet + Mobile)
     ═══════════════════════════════════════════════════════ */
  if (isVertical) {
    return (
      <div
        className="min-h-screen w-full cursor-default"
        style={{
          backgroundColor: C.bg,
          opacity: isDetailMode ? 0 : 1,
          pointerEvents: isDetailMode ? "none" : "auto",
          transition: "opacity 400ms ease-out",
        }}
      >
        {!introComplete && (
          <PreloadScreen onComplete={handleIntroComplete} />
        )}

        <Kopfzeile
          zonen={bandZonen}
          sprache={sprache}
          onSprache={setSprache}
          onPortal={() => setLoginOpen(true)}
          onLogo={() => navigateToSection(0)}
          welt="capital"
          onWelt={(ziel) => {
            if (ziel === "solutions") window.location.href = "/solutions";
          }}
          isVertical
          menueOffen={menueOffen}
          onMenue={() => setMenueOffen((o) => !o)}
        />
        <MobilMenue
          offen={menueOffen}
          onSchliessen={() => setMenueOffen(false)}
          activeIndex={activeIndex}
          onNavigate={navigateToSection}
          onOpenLegal={legal.open}
          welt="capital"
          onWelt={(ziel) => {
            if (ziel === "solutions") window.location.href = "/solutions";
          }}
        />

        {/* ── HERO ──
            Dieselbe Station wie breit, nur gestapelt. Vorher stand
            hier HeroVertical: eine eigene Komponente mit anderem
            Titel, anderem Text, anderem Bild und anderer Schrift. */}
        <Station1Einstieg
          isVertical
          bereit={introComplete}
          sprache={sprache}
          imageId="hero-tellian"
          imageAlt="Opernhaus Zürich zur blauen Stunde"
        />

        {/* ── VERMÖGENSVERWALTUNG (dunkel) ──
            KORREKTUR: mit Wealth Management getauscht. */}
        <StationPortfolioManagement
          isVertical
          domId="section-vermoegensverwaltung"
          sprache={sprache}
          onMandat={man.openDetail}
          onAdvisory={adv.openDetail}
        />

        {/* ── WEALTH MANAGEMENT (hell, Überarbeitung folgt) ── */}
        <Station2WealthManagement isVertical sprache={sprache} onMandat={man.openDetail} />
        <SubpageOverlay
          isOpen={adv.isDetail}
          onClose={adv.closeDetail}
          eyebrow=""
          headline={null}
        >
          <UnterseiteAdvisory isMobile aktiv={adv.isDetail} sprache={sprache} onContactClick={navigateToContact} />
        </SubpageOverlay>
        {/* Unterseite /mandat — löst den Platzhalter ab, der auf die
            Anlagestrategien-Seite zeigte. */}
        <SubpageOverlay
          isOpen={man.isDetail}
          onClose={man.closeDetail}
          eyebrow=""
          headline={null}
        >
          <UnterseiteMandat isMobile aktiv={man.isDetail} sprache={sprache} onContactClick={navigateToContact} />
        </SubpageOverlay>
        {/* Unterseite /vermoegensverwaltung, schmale Fassung. */}
        <Section3Vermoegensverwaltung
          nurUnterseite
          isVertical
          breakpoint={breakpoint}
          viewMode={vvw.mode}
          onOpenDetail={vvw.openDetail}
          onCloseDetail={vvw.closeDetail}
          onContactClick={navigateToContact}
        />

        {/* ── IHRE VORTEILE ── */}
        <Station4Rad
          isVertical
          domId="section-anlagestrategien"
          sprache={sprache}
          istAktiv={SECTIONS[activeIndex]?.key === "strategien"}
        />
        {/* Unterseite /anlagestrategien, schmale Fassung. */}
        <Section4Anlagestrategien
          nurUnterseite
          scrollX={0}
          isVertical
          breakpoint={breakpoint}
          viewMode={ast.mode}
          onOpenDetail={ast.openDetail}
          onCloseDetail={ast.closeDetail}
          onContactClick={navigateToContact}
          onNavigateToProcess={pm.openDetail}
        />

        {/* ── TEAM ── */}
        <Station5Team
          isVertical
          domId="section-ueber-uns"
          sprache={sprache}
          onDetailToggle={setTeamDetailOffen}
        />

        {/* ── KONTAKT (mobile/tablet — 5-field form, MapOverlay trigger) ── */}
        <Station6Kontakt isVertical domId="section-kontakt" onOpenLegal={legal.open} />

        <LoginOverlay
          open={loginOpen}
          onClose={() => setLoginOpen(false)}
          onSupportClick={navigateToContact}
        />

        <LegalPage activePath={legal.activePath} onClose={legal.close} />

        {/* ═══ Portfolio Management Subpage (mobile) ═══ */}
        <SubpageOverlay
          isOpen={pm.isDetail}
          onClose={() => pm.closeDetail()}
          eyebrow="Portfolio Management"
          headline={
            <>
              Wie wir Ihr Portfolio
              <br />
              <em style={{ fontStyle: "italic", fontWeight: 400 }}>führen.</em>
            </>
          }
        >
          <PortfolioManagementDetail
            isMobile={true}
            onContactClick={navigateToContact}
          />
        </SubpageOverlay>
      </div>
    );
  }

  /* ═══════════════════════════════════════════════════════
     DESKTOP — HORIZONTAL LAYOUT (unchanged logic)
     ═══════════════════════════════════════════════════════ */
  return (
    <div
      className="h-screen w-screen overflow-hidden cursor-default"
      style={{ backgroundColor: C.bg }}
    >
      {!introComplete && (
        <PreloadScreen onComplete={handleIntroComplete} />
      )}

      {/* ── Horizontal Scroll Strip ──
           Fade-out starts after a 150ms delay so Framer Motion can measure
           the source position of FLIP ordinals before the parent becomes
           invisible. */}
      <div
        ref={containerRef}
        className="flex h-screen overflow-x-scroll overflow-y-hidden"
        style={{
          /* Macht den Track zum offsetParent der Panels, damit die
             Registry containerrelative offsetLeft-Werte misst. */
          position: "relative",
          scrollbarWidth: "none",
          msOverflowStyle: "none",
          pointerEvents: introComplete && !isDetailMode ? "auto" : "none",
          opacity: isDetailMode ? 0 : 1,
          transition: isDetailMode
            ? "opacity 600ms ease-out 150ms"
            : "opacity 400ms ease-out",
        }}
      >
        {/* STATION 1 — EINSTIEG */}
        <SectionEnteredProvider value={entered[0]}>
          <Station1Einstieg
            panelRef={panelRef(0)}
            sprache={sprache}
            imageId="hero-tellian"
            imageAlt="Opernhaus Zürich zur blauen Stunde"
          />
        </SectionEnteredProvider>

        {/* CHAPTER 2 — VERMÖGENSVERWALTUNG (dunkel)
            KORREKTUR: mit Wealth Management getauscht; die
            Unterseiten-Overlays wandern mit ihrer Station. */}
        <SectionEnteredProvider value={entered[1]}>
          <StationPortfolioManagement
            panelRef={panelRef(1)}
            sprache={sprache}
            onMandat={man.openDetail}
            onAdvisory={adv.openDetail}
          />
          <SubpageOverlay
            isOpen={adv.isDetail}
            onClose={adv.closeDetail}
            eyebrow=""
            headline={null}
          >
            <UnterseiteAdvisory aktiv={adv.isDetail} sprache={sprache} onContactClick={navigateToContact} />
          </SubpageOverlay>
          <SubpageOverlay
            isOpen={man.isDetail}
            onClose={man.closeDetail}
            eyebrow=""
            headline={null}
          >
            <UnterseiteMandat aktiv={man.isDetail} sprache={sprache} onContactClick={navigateToContact} />
          </SubpageOverlay>
        </SectionEnteredProvider>

        {/* CHAPTER 3 — WEALTH MANAGEMENT (hell, Überarbeitung folgt) */}
        <SectionEnteredProvider value={entered[2]}>
          <Station2WealthManagement
            panelRef={panelRef(2)}
            sprache={sprache}
            onMandat={man.openDetail}
          />
          {/* Die Station ist ersetzt; die Unterseite /vermoegensverwaltung
              liegt weiterhin in diesem Bauteil und wird von Station 2 aus
              verlinkt. Sie bleibt deshalb eingehängt — ohne Station. */}
          <Section3Vermoegensverwaltung
            nurUnterseite
            breakpoint={breakpoint}
            viewMode={vvw.mode}
            onOpenDetail={vvw.openDetail}
            onCloseDetail={vvw.closeDetail}
            onContactClick={navigateToContact}
          />
        </SectionEnteredProvider>

        {/* CHAPTER 4 — IHRE VORTEILE */}
        <SectionEnteredProvider value={entered[3]}>
          <Station4Rad
            panelRef={panelRef(3)}
            sprache={sprache}
            istAktiv={SECTIONS[activeIndex]?.key === "strategien"}
          />
          {/* Die Station ist ersetzt; die Unterseite /anlagestrategien
              liegt weiterhin in diesem Bauteil und wird von der
              Mandat-Karte in Station 3 aus verlinkt. */}
          <Section4Anlagestrategien
            nurUnterseite
            scrollX={0}
            breakpoint={breakpoint}
            viewMode={ast.mode}
            onOpenDetail={ast.openDetail}
            onCloseDetail={ast.closeDetail}
            onContactClick={navigateToContact}
            onNavigateToProcess={pm.openDetail}
          />
        </SectionEnteredProvider>

        {/* CHAPTER 5 — TEAM */}
        <SectionEnteredProvider value={entered[4]}>
          <Station5Team panelRef={panelRef(4)} sprache={sprache} onDetailToggle={setTeamDetailOffen} />
        </SectionEnteredProvider>

        {/* CHAPTER 6 — KONTAKT (map rendered via overlay, no layout impact) */}
        <SectionEnteredProvider value={entered[5]}>
          <Station6Kontakt
            onOpenLegal={legal.open}
            panelRef={panelRef(5)}
          />
        </SectionEnteredProvider>
      </div>

      {/* Schiene und Stationsleiste stehen bewusst NACH dem Track im
          Markup. Die Reihenfolge im Fokus folgt dem Markup, nicht der
          Darstellung: so erreicht die Tabulatortaste zuerst den Knopf
          der Bühne, dann die Schiene, dann die Stationsleiste.

          Die Schiene trägt Wortmarke, Menüzugang und Portalzugang. Sie
          war zwischenzeitlich durch ein Kopfband ersetzt; das ist
          zurückgenommen, weil die Marke sonst zweimal auf dem Schirm
          steht und das Band daneben keine eigene Aufgabe hätte. */}
      <div
        style={{
          opacity: isDetailMode ? 0 : 1,
          pointerEvents: isDetailMode ? "none" : "auto",
          transition: "opacity 400ms ease-out",
        }}
      >
        {/* Genau zwei Navigationselemente: Kopfzeile und
            Stationsleiste. Die senkrechte Schiene am linken Rand und
            das Menü-Overlay entfallen auf Desktop. */}
        <Kopfzeile
          zonen={bandZonen}
          sprache={sprache}
          onSprache={setSprache}
          onPortal={() => setLoginOpen(true)}
          onLogo={() => navigateToSection(0)}
          welt="capital"
          onWelt={(ziel) => {
            /* Volle Navigation: Solutions startet auf seiner ersten
               Station, der Scroll ist zurückgesetzt. */
            if (ziel === "solutions") window.location.href = "/solutions";
          }}
        />

        {introComplete && (
          <DotNavigation
            activeIndex={activeIndex}
            onNavigate={navigateToSection}
            zonen={bandZonen}
          />
        )}
      </div>

      <LoginOverlay
        open={loginOpen}
        onClose={() => setLoginOpen(false)}
        onSupportClick={navigateToContact}
      />

      <LegalPage activePath={legal.activePath} onClose={legal.close} />

      {/* ═══ Portfolio Management Subpage ═══ */}
      <SubpageOverlay
        isOpen={pm.isDetail}
        onClose={() => pm.closeDetail()}
        eyebrow="Portfolio Management"
        headline={
          <>
            Wie wir Ihr Portfolio
            <br />
            <em style={{ fontStyle: "italic", fontWeight: 400 }}>führen.</em>
          </>
        }
      >
        <PortfolioManagementDetail
          isMobile={isVertical}
          onContactClick={navigateToContact}
        />
      </SubpageOverlay>

      {scrollDebug && <ScrollDebugOverlay debugRef={debugRef} />}
    </div>
  );
}
