import { Section4CoreSatellite } from "./components/Section4CoreSatellite";
import { Section4TopDownBottomUp } from "./components/Section4TopDownBottomUp";
import { useEffect, useState, useCallback, useRef, FormEvent } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence, LayoutGroup } from "motion/react";
import { useSubpageMode } from "./components/useSubpageMode";
import { SubpageOverlay } from "./components/SubpageOverlay";
import { AnlageprozessDetail } from "./components/AnlageprozessDetail";
import { AnlagestrategienDetail } from "./components/AnlagestrategienDetail";
import { ANLAGEPROZESS_STEPS } from "./data/anlageprozessSteps";
import { AnlageprozessStepOrdinal, ORDINAL_FONT_SIZE } from "./components/AnlageprozessStepOrdinal";
import { usePrefersReducedMotion } from "./components/usePrefersReducedMotion";
import { Navigation } from "./components/Navigation";
import { LoginOverlay } from "./components/LoginOverlay";
import { LegalPage, useLegalRoute } from "./components/LegalPage";
import { C, serif, sans } from "./tokens";
import { EASE } from "../styles/motion";
import { useHorizontalScroll } from "./components/useHorizontalScroll";
import { useBreakpoint } from "./components/useBreakpoint";
import {
  ScrollImage,
  HeroExpandingImage,
  ParallaxText,
  ScrollFade,
} from "./components/ScrollAnimations";
import { DotNavigation } from "./components/DotNavigation";
import { CtaButton } from "./components/CtaButton";
import { Section5UeberTellian } from "./components/Section5UeberTellian";
import { Section6Kontakt } from "./components/Section6Kontakt";
import { HeroVertical } from "./components/HeroVertical";
import { ExpandableBody } from "./components/ExpandableBody";
import { Section2Anlagephilosophie } from "./components/Section2Anlagephilosophie";
import { Section3Timeline } from "./components/Section3Timeline";
import { LAYOUT, TEXT_COLUMN_STYLE, getLayout, getTextColumnStyle, SPACING } from "./layout";
import heroImg from "figma:asset/f68e696a94d5501be4f500478f5085490ea6351a.png";
import heroDesktopImg from "../assets/zh-3.jpg";
import preloadLogo from "../assets/TellianCapital-Logo.png";
import strategyImg from "figma:asset/868d6afdf0335422ce32d497da0c82ae30b6012c.png";
import notebookImg from "figma:asset/29fb6897d14923649548800503cc773b55cb5083.png";
import teamPhotoImg from "figma:asset/b4ed6cb147950f15472091157e857a2d7f1ce0e8.png";
import philosophyImg from "figma:asset/a44e63e47eecf6c5811f4525d593bd929e31be63.png";

/* Tokens: C, serif, sans from ./tokens.ts; EASE from ../styles/motion.ts */

/* ═══════════════════════════════════════════════════════════
   SWISS IMAGERY
   ═══════════════════════════════════════════════════════════ */
const IMG = {
  hero: heroImg,
  alps: "https://images.unsplash.com/photo-1588231055738-da5e3a717644?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzd2lzcyUyMGFscHMlMjBtb3VudGFpbiUyMGZvZyUyMGRhd24lMjBjaW5lbWF0aWN8ZW58MXx8fHwxNzczNjk2OTU2fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
  forest:
    "https://images.unsplash.com/photo-1627314827715-204d1002dde5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzd2lzcyUyMGZvcmVzdCUyMG1pc3R5JTIwbW9ybmluZyUyMHBpbmUlMjB0cmVlc3xlbnwxfHx8fDE3NzM2NTc0ODd8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
  lake: "https://images.unsplash.com/photo-1682244097336-673f4db39c13?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjYWxtJTIwc3dpc3MlMjBsYWtlJTIwcmVmbGVjdGlvbiUyMG1vdW50YWlucyUyMG1pc3R8ZW58MXx8fHwxNzczNjU3NDg4fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
  zurich:
    "https://images.unsplash.com/photo-1661506743970-79ff97200aa1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx6dXJpY2glMjBvbGQlMjB0b3duJTIwc3RvbmUlMjBhcmNoaXRlY3R1cmUlMjBtb3JuaW5nfGVufDF8fHx8MTc3MzY1NzQ4OHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
  bridge: strategyImg,
  teamPhoto: teamPhotoImg,
  alpine:
    "https://images.unsplash.com/photo-1706997185842-d45feced14d2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzd2lzcyUyMG1vdW50YWluJTIwcGFub3JhbWElMjBjYWxtJTIwbW9ybmluZyUyMGxpZ2h0fGVufDF8fHx8MTc3MzY3NjI2OXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
  strategy:
    "https://images.unsplash.com/photo-1716124095942-c6ff3ad0541c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBTd2lzcyUyMGFyY2hpdGVjdHVyZSUyMHN0b25lJTIwZ2xhc3MlMjBtaW5pbWFsJTIwYnVpbGRpbmd8ZW58MXx8fHwxNzczNzMzODU5fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
  notebook: notebookImg,
};

/* ═════════════════════════════════════════════════════════
   PRELOAD SCREEN
   ═══════════════════════════════════════════════════════════ */
function PreloadScreen({ onComplete }: { onComplete: () => void }) {
  const [textVisible, setTextVisible] = useState(false);
  const [sliding,     setSliding]     = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => setTextVisible(true), 500);
    const t2 = setTimeout(() => setSliding(true),     2700);
    const t3 = setTimeout(() => onComplete(),         3500);
    return () => [t1, t2, t3].forEach(clearTimeout);
  }, [onComplete]);

  return (
    <motion.div
      className="fixed inset-0 z-[200] flex items-center justify-center"
      style={{ backgroundColor: "#3f212a" }}
      animate={{ y: sliding ? "-100%" : "0%" }}
      transition={
        sliding
          ? { duration: 0.8, ease: [0.76, 0, 0.24, 1] }
          : { duration: 0 }
      }
    >
      <img
        src={preloadLogo}
        alt="Tellian Capital"
        style={{
          width: "clamp(560px, 80vw, 920px)",
          height: "auto",
          opacity: textVisible ? 1 : 0,
          transition: textVisible ? "opacity 0.6s ease-out" : "none",
          userSelect: "none",
          pointerEvents: "none",
        }}
      />
    </motion.div>
  );
}

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
      eyebrow="Anlageprozess"
      headline={
        <>
          Die Methode hinter
          <br />
          <em style={{ fontStyle: "italic", fontWeight: 400 }}>jedem Entscheid.</em>
        </>
      }
    >
      <AnlageprozessDetail isMobile={true} onContactClick={onContactClick} />
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
  scrollX: number;
  isVertical?: boolean;
  breakpoint?: "mobile" | "tablet" | "desktop";
  viewMode?: "overview" | "detail";
  onOpenDetail?: () => void;
  onCloseDetail?: () => void;
  onContactClick?: () => void;
}

function Section3Vermoegensverwaltung({
  scrollX,
  isVertical = false,
  breakpoint = "desktop" as const,
  viewMode = "overview",
  onOpenDetail,
  onCloseDetail,
  onContactClick,
}: Section3Props) {
  const layout = getLayout(breakpoint);
  const textColStyle = getTextColumnStyle(breakpoint);
  const reducedMotion = usePrefersReducedMotion();

  const isDetail = viewMode === "detail";

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
                fontSize: "11px",
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

          <ScrollFade scrollX={0} isVertical yOffset={16}>
            <div style={{ marginTop: SPACING.bodyToCta, paddingBottom: "32px" }}>
              <CtaButton href="/vermoegensverwaltung" onClick={handleAnlageprozess}>
                Mehr zur Vermögensverwaltung
              </CtaButton>
            </div>
          </ScrollFade>
        </div>

        {/* Timeline visual — comes AFTER text on mobile/tablet */}
        <div style={{
          width: "100%",
          height: breakpoint === "mobile" ? "auto" : "60vh",
          padding: breakpoint === "mobile" ? "32px 16px" : undefined,
          position: "relative",
        }}>
          <Section3Timeline scrollX={0} isVertical />
        </div>
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
      className="flex-shrink-0 h-screen relative"
      style={{ width: layout.sectionWidth, backgroundColor: C.bg }}
    >
      <Section3Timeline scrollX={scrollX} isDetailMode={isDetail} />

      <div
        className="relative z-10 h-full flex flex-col justify-center"
        style={{
          ...textColStyle,
          maxWidth: "calc(460px + clamp(36px, 5vw, 120px) + 4vw)",
          opacity: isDetail ? 0 : 1,
          transform: isDetail ? "translateX(-50px)" : "translateX(0)",
          transition: `opacity 500ms ${EASE.standard}, transform 500ms ${EASE.standard}`,
          pointerEvents: isDetail ? "none" : "auto",
        }}
      >
        <span
          style={{
            fontFamily: sans, fontSize: "10px", letterSpacing: "0.22em",
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
                fontFamily: sans, fontSize: "clamp(10.5px, 1.3vh, 12.5px)",
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
  );

  /* ── DETAIL overlay (rendered via Portal to body) ── */
  const detailOverlay = typeof document !== "undefined" && createPortal(
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 90,
        backgroundColor: C.bg,
        overflowY: "auto",
        WebkitOverflowScrolling: "touch",
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
        <span
          style={{
            fontFamily: sans, fontSize: "13px", fontWeight: 700, letterSpacing: "2.5px",
            color: C.dark, textTransform: "uppercase",
          }}
        >
          Tellian
        </span>
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

      {/* ═══ Hero title ═══ */}
      <div
        style={{
          textAlign: "center",
          padding: "80px 48px 40px",
          opacity: isDetail ? 1 : 0,
          transform: isDetail ? "translateY(0)" : "translateY(-12px)",
          transition: `opacity 600ms ease-out ${isDetail ? "500ms" : "0ms"}, transform 600ms ${EASE.standard} ${isDetail ? "500ms" : "0ms"}`,
        }}
      >
        <span
          style={{
            fontFamily: sans, fontSize: "10px", letterSpacing: "0.28em",
            color: C.stone, textTransform: "uppercase", display: "block",
          }}
        >
          Anlageprozess
        </span>
        <h1
          style={{
            fontFamily: serif,
            fontSize: "clamp(40px, 4.5vw, 56px)",
            lineHeight: 1.05, color: C.dark, letterSpacing: "-0.02em",
            margin: "20px 0 0 0", fontWeight: 400,
          }}
        >
          Die Methode hinter
          <br />
          <em style={{ fontStyle: "italic", fontWeight: 400 }}>jedem Entscheid.</em>
        </h1>
      </div>

      {/* ═══ Horizontal Stepper ═══ Container is always opaque — only labels
             and connector lines fade in. Step ordinals are FLIP targets and
             need stable parent opacity for Framer Motion's layoutId to work. */}
      <div
        style={{
          padding: "40px 48px 56px",
          overflowX: "auto",
          WebkitOverflowScrolling: "touch",
          scrollbarWidth: "none",
        }}
      >
        <div
          style={{
            display: "flex", flexDirection: "row", alignItems: "flex-start",
            justifyContent: "center",
            gap: "clamp(24px, 3vw, 48px)",
            maxWidth: "1100px", margin: "0 auto",
          }}
        >
          {ANLAGEPROZESS_STEPS.map((step, i) => (
            <div
              key={step.num}
              style={{
                display: "flex", flexDirection: "row", alignItems: "flex-start",
                gap: "clamp(24px, 3vw, 48px)", flexShrink: 0,
              }}
            >
              <div
                style={{
                  padding: "8px 4px",
                  display: "flex", flexDirection: "column",
                  alignItems: "center", gap: "8px",
                  textAlign: "center", minWidth: "80px",
                }}
              >
                {/* Step ordinal — FLIP target. Framer Motion animates from
                    the previous position (in Section3Timeline) to this one
                    via shared layoutId within LayoutGroup. */}
                {isDetail && (
                  <AnlageprozessStepOrdinal
                    num={step.num}
                    color={C.dark}
                    opacity={0.2}
                    enableFlip={!reducedMotion}
                    layoutDelay={i * 0.08}
                  />
                )}
                <span
                  style={{
                    fontFamily: sans, fontSize: "11px",
                    letterSpacing: "0.16em", textTransform: "uppercase",
                    color: C.stone, whiteSpace: "nowrap",
                    opacity: isDetail ? 1 : 0,
                    transform: isDetail ? "translateY(0)" : "translateY(6px)",
                    transition: `opacity 400ms ease-out ${isDetail ? `${500 + i * 80}ms` : "0ms"}, transform 400ms ${EASE.standard} ${isDetail ? `${500 + i * 80}ms` : "0ms"}`,
                  }}
                >
                  {step.shortLabel}
                </span>
              </div>

              {/* Connector line — grows AFTER the FLIP completes.
                  Last FLIP ends at ~1.1s (4 steps × 80ms delay + 800ms duration).
                  Lines start at 1100ms with 80ms stagger. */}
              {i < ANLAGEPROZESS_STEPS.length - 1 && (
                <div
                  aria-hidden
                  style={{
                    width: "clamp(32px, 4vw, 64px)",
                    height: "0.5px",
                    backgroundColor: C.line,
                    marginTop: "48px",
                    flexShrink: 0,
                    transformOrigin: "left center",
                    transform: isDetail ? "scaleX(1)" : "scaleX(0)",
                    transition: `transform 450ms ${EASE.standard} ${isDetail ? `${1100 + i * 80}ms` : "0ms"}`,
                  }}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* ═══ Detail body ═══ */}
      <div
        style={{
          opacity: isDetail ? 1 : 0,
          transform: isDetail ? "translateY(0)" : "translateY(16px)",
          transition: `opacity 500ms ease-out ${isDetail ? "900ms" : "0ms"}, transform 500ms ${EASE.standard} ${isDetail ? "900ms" : "0ms"}`,
        }}
      >
        <AnlageprozessDetail isMobile={false} onContactClick={handleContactClick} />
      </div>
    </div>,
    document.body
  );

  /* LayoutGroup enables Framer Motion's layoutId matching across React portals.
     Without it, the ordinal in Section3Timeline and the ordinal in the Portal
     overlay cannot be recognized as the same element → no FLIP. */
  return (
    <LayoutGroup>
      {overviewMarkup}
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
}

function Section4Anlagestrategien({
  scrollX,
  isVertical = false,
  breakpoint = "desktop" as const,
  viewMode = "overview",
  onOpenDetail,
  onCloseDetail,
  onContactClick,
}: Section4Props) {
  const layout = getLayout(breakpoint);
  const textColStyle = getTextColumnStyle(breakpoint);
  const reducedMotion = usePrefersReducedMotion();

  const isDetail = viewMode === "detail";

  const handleOpenDetail = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    onOpenDetail?.();
  };

  const bodyParagraphs = [
    "Der Investmentansatz von Tellian Capital verbindet zwei Perspektiven: eine Top-Down-Betrachtung der globalen Finanzmärkte und eine Bottom-Up-Selektion einzelner Anlagen. Beide stützen sich auf quantitative Modelle und eigene Datenanalyse.",
    "Die strategische Allokation bildet den Kern und trägt das Portfolio über drei bis fünf Jahre. Die taktische Allokation ergänzt diesen Kern und nutzt kurzfristige Marktchancen. Die Gewichtung zwischen beiden steuert das Anlagekomitee.",
  ];

  if (isVertical) {
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
                fontSize: "11px",
                letterSpacing: "0.22em",
                color: C.stone,
                display: "block",
              }}
              className="uppercase"
            >
              Anlagestrategien
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
              Strategie statt
              <br />
              <em>Spekulation.</em>
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

          <ScrollFade scrollX={0} isVertical yOffset={16}>
            <div style={{ marginTop: SPACING.bodyToCta, paddingBottom: "32px" }}>
              <CtaButton href="/anlagestrategien" onClick={handleOpenDetail}>
                Strategien im Detail
              </CtaButton>
            </div>
          </ScrollFade>
        </div>

        {/* Top-Down / Bottom-Up visual — comes AFTER text on mobile/tablet */}
        <div style={{
          width: "100%",
          height: breakpoint === "mobile" ? "auto" : "60vh",
          padding: breakpoint === "mobile" ? "32px 16px" : undefined,
          position: "relative",
        }}>
          <Section4TopDownBottomUp scrollX={0} isVertical />
        </div>
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
  const overviewMarkup = (
    <div
      className="flex-shrink-0 h-screen relative"
      style={{ width: layout.sectionWidth, backgroundColor: C.bg }}
    >
      <Section4TopDownBottomUp scrollX={scrollX} isDetailMode={isDetail} />

      <div
        className="relative z-10 h-full flex flex-col justify-center"
        style={{
          ...textColStyle,
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
            fontSize: "10px",
            letterSpacing: "0.22em",
            color: C.stone,
            display: "block",
          }}
          className="uppercase"
        >
          Anlagestrategien
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
          Strategie statt
          <br />
          <em>Spekulation.</em>
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
                fontSize: "clamp(10.5px, 1.3vh, 12.5px)",
                color: C.charcoal,
                lineHeight: 1.75,
                margin: 0,
              }}
            >
              {text}
            </p>
          ))}

          {/* CTA — inline with body text, left-aligned */}
          <a
            href="/anlagestrategien"
            onClick={handleOpenDetail}
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
            <span>Strategien im Detail</span>
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
      {overviewMarkup}
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

/* ═══════════════════════════════════════════════════════════
   MAIN APPLICATION
   ═══════════════════════════════════════════════════════════ */
export default function App() {
  const { breakpoint, isMobile, isTablet, isDesktop, isVertical } = useBreakpoint();
  const layout = getLayout(breakpoint);
  const textColStyle = getTextColumnStyle(breakpoint);

  const { containerRef, scrollProgress, scrollX, scrollTo, scrollDirection, scrollLockRef, targetScroll, currentScroll } =
    useHorizontalScroll({ disabled: isVertical });
  const [introComplete, setIntroComplete] = useState(false);

  /* ── Hero entry-animation trigger (desktop) ── */
  const [heroAnimate, setHeroAnimate] = useState(false);
  useEffect(() => {
    if (!introComplete) return;
    const t = setTimeout(() => setHeroAnimate(true), 80);
    return () => clearTimeout(t);
  }, [introComplete]);

  /* ── Hero scroll-arrow: shown whenever the hero is in view.
        Reactive to scrollX — reappears when user scrolls back. ── */
  const heroArrowHidden = scrollX > 20;

  /* ═══ Subpage detail views (no route, no unmount) ═══ */
  const vvw = useSubpageMode("/vermoegensverwaltung");
  const ast = useSubpageMode("/anlagestrategien");
  /* Detail mode is active when any subpage is open */
  const isDetailMode = vvw.isDetail || ast.isDetail;

  const handleIntroComplete = useCallback(() => {
    setIntroComplete(true);
  }, []);

  /* ── Login overlay state ── */
  const [loginOpen, setLoginOpen] = useState(false);

  /* ── Legal pages routing (Impressum / Datenschutz / Kundeninformation) ── */
  const legal = useLegalRoute();

  const navigateToContact = useCallback(() => {
    if (isDetailMode) {
      vvw.closeDetail();
      ast.closeDetail();
    }
    if (isVertical) {
      const el = document.getElementById("section-kontakt");
      if (el) el.scrollIntoView({ behavior: "smooth" });
    } else {
      scrollTo(1.0);
    }
  }, [isVertical, scrollTo, isDetailMode, vvw, ast]);

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

        <Navigation
          scrollProgress={scrollProgress}
          scrollDirection={scrollDirection}
          onNavigate={scrollTo}
          introComplete={introComplete}
          breakpoint={breakpoint}
          isVertical
          onLoginClick={() => setLoginOpen(true)}
        />

        {/* ── HERO (mobile/tablet — page-load stagger animation) ── */}
        <HeroVertical
          imageSrc={heroDesktopImg}
          introComplete={introComplete}
          breakpoint={breakpoint}
          onCtaClick={navigateToContact}
        />

        {/* ── ANLAGEPHILOSOPHIE ── */}
        <Section2Anlagephilosophie scrollX={0} isVertical breakpoint={breakpoint} />

        {/* ── VERMÖGENSVERWALTUNG ── */}
        <Section3Vermoegensverwaltung
          scrollX={0}
          isVertical
          breakpoint={breakpoint}
          viewMode={vvw.mode}
          onOpenDetail={vvw.openDetail}
          onCloseDetail={vvw.closeDetail}
          onContactClick={navigateToContact}
        />

        {/* ── ANLAGESTRATEGIEN ── */}
        <Section4Anlagestrategien
          scrollX={0}
          isVertical
          breakpoint={breakpoint}
          viewMode={ast.mode}
          onOpenDetail={ast.openDetail}
          onCloseDetail={ast.closeDetail}
          onContactClick={navigateToContact}
        />

        {/* ── ÜBER TELLIAN ── */}
        <Section5UeberTellian
          isVertical
          breakpoint={breakpoint}
          onContactClick={navigateToContact}
        />

        {/* ── KONTAKT (mobile/tablet — 5-field form, MapOverlay trigger) ── */}
        <Section6Kontakt isVertical breakpoint={breakpoint} onOpenLegal={legal.open} />

        <LoginOverlay
          open={loginOpen}
          onClose={() => setLoginOpen(false)}
          onSupportClick={navigateToContact}
        />

        <LegalPage activePath={legal.activePath} onClose={legal.close} />
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

      {/* Navigation + DotNavigation — hidden during detail mode to avoid overlap */}
      <div
        style={{
          opacity: isDetailMode ? 0 : 1,
          pointerEvents: isDetailMode ? "none" : "auto",
          transition: "opacity 400ms ease-out",
        }}
      >
        <Navigation
          scrollProgress={scrollProgress}
          scrollDirection={scrollDirection}
          onNavigate={scrollTo}
          introComplete={introComplete}
          breakpoint={breakpoint}
          isVertical={false}
          onLoginClick={() => setLoginOpen(true)}
        />

        {introComplete && (
          <DotNavigation
            scrollProgress={scrollProgress}
            onNavigate={scrollTo}
          />
        )}
      </div>

      {/* ── Horizontal Scroll Strip ──
           Fade-out starts after a 150ms delay so Framer Motion can measure
           the source position of FLIP ordinals before the parent becomes
           invisible. */}
      <div
        ref={containerRef}
        className="flex h-screen overflow-x-scroll overflow-y-hidden"
        style={{
          scrollbarWidth: "none",
          msOverflowStyle: "none",
          pointerEvents: introComplete && !isDetailMode ? "auto" : "none",
          opacity: isDetailMode ? 0 : 1,
          transition: isDetailMode
            ? "opacity 600ms ease-out 150ms"
            : "opacity 400ms ease-out",
        }}
      >
        {/* CHAPTER 1 — HERO (desktop — headline + trust + ghost CTA) */}
        <div
          className="flex-shrink-0 h-screen relative"
          style={{ width: layout.heroWidth, backgroundColor: C.bg }}
        >
          {/* Image — right */}
          <div
            className="absolute z-0"
            style={{ top: 0, bottom: 0, left: layout.imageLeft, right: 0 }}
          >
            <HeroExpandingImage
              src={heroDesktopImg}
              scrollX={scrollX}
              className="w-full h-full"
            />
          </div>

          {/* Text column — eyebrow + headline + CTA, vertically centered */}
          <div
            className="relative z-10 h-full flex flex-col justify-center"
            style={{ ...textColStyle }}
          >
            {/* Eyebrow — above headline */}
            <span
              style={{
                fontFamily: sans,
                fontSize: "11px",
                fontWeight: 400,
                letterSpacing: "0.22em",
                textTransform: "uppercase",
                color: C.stone,
                opacity: heroAnimate ? 1 : 0,
                transition: "opacity 600ms ease-out 200ms",
              }}
            >
              FINMA-lizenziert · Unabhängig · Zürich · Seit 1996
            </span>

            {/* Headline */}
            <h1
              style={{
                fontFamily: serif,
                fontSize: "clamp(88px, 12vh, 140px)",
                lineHeight: 1.0,
                color: C.dark,
                letterSpacing: "-0.03em",
                maxWidth: "520px",
                fontWeight: 400,
                margin: 0,
                marginTop: "28px",
                opacity: heroAnimate ? 1 : 0,
                transform: heroAnimate ? "translateY(0)" : "translateY(24px)",
                transition: "opacity 800ms ease-out 400ms, transform 800ms cubic-bezier(0.16,1,0.3,1) 400ms",
              }}
            >
              Vermögen
              <br />
              <em style={{ fontStyle: "italic", fontWeight: 400 }}>mit Methode</em>
            </h1>

            {/* CTA — ghost button */}
            <div
              style={{
                marginTop: "64px",
                opacity: heroAnimate ? 1 : 0,
                transform: heroAnimate ? "translateX(0)" : "translateX(-16px)",
                transition: "opacity 500ms ease-out 900ms, transform 500ms cubic-bezier(0.16,1,0.3,1) 900ms",
              }}
            >
              <CtaButton
                href="#contact"
                variant="ghost"
                fullWidth={false}
                onClick={(e) => { e.preventDefault(); navigateToContact(); }}
              >
                Gespräch vereinbaren
              </CtaButton>
            </div>
          </div>

          {/* Horizontal scroll-arrow — bottom right, pulses, fades on first scroll.
              Hero is 110vw wide → we use `right: calc(10vw + 56px)` so the arrow's
              right edge sits 56px from the *viewport* right, not the Hero right. */}
          <div
            aria-hidden
            style={{
              position: "absolute",
              bottom: "56px",
              right: "calc(10vw + 56px)",
              zIndex: 5,
              color: C.charcoal,
              opacity: heroAnimate && !heroArrowHidden ? 1 : 0,
              transform: heroArrowHidden
                ? "translateX(16px) scale(0.6)"
                : "scale(1)",
              transition: heroArrowHidden
                ? "opacity 600ms cubic-bezier(0.4,0,0.2,1), transform 600ms cubic-bezier(0.4,0,0.2,1)"
                : "opacity 700ms ease-out 600ms",
              pointerEvents: "none",
            }}
          >
            <div
              style={{
                animation: heroAnimate && !heroArrowHidden
                  ? "tellianHeroArrowPulse 2s ease-in-out infinite"
                  : "none",
              }}
            >
              <svg
                width="140"
                height="75"
                viewBox="0 0 195 105"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                strokeMiterlimit="10"
                style={{ display: "block" }}
              >
                <path d="M0 52.6367L190.169 52.6367" />
                <path d="M195.001 52.4033C166.054 52.4033 142.561 28.9266 142.561 0" />
                <path d="M195.001 52.3516C166.054 52.3516 142.561 75.8282 142.561 104.755" />
              </svg>
            </div>
          </div>
          <style>{`
            @keyframes tellianHeroArrowPulse {
              0%, 100% { transform: translateX(0); }
              50%      { transform: translateX(10px); }
            }
          `}</style>
        </div>

        {/* Breathing after Hero */}
        <div
          className="flex-shrink-0 h-screen"
          style={{ width: layout.breathingSpace, backgroundColor: C.bg }}
        />

        {/* CHAPTER 2 — ANLAGEPHILOSOPHIE */}
        <Section2Anlagephilosophie scrollX={scrollX} />

        <div
          className="flex-shrink-0 h-screen"
          style={{ width: layout.breathingSpace, backgroundColor: C.bg }}
        />

        {/* CHAPTER 3 — VERMÖGENSVERWALTUNG */}
        <Section3Vermoegensverwaltung
          scrollX={scrollX}
          breakpoint={breakpoint}
          viewMode={vvw.mode}
          onOpenDetail={vvw.openDetail}
          onCloseDetail={vvw.closeDetail}
          onContactClick={navigateToContact}
        />

        <div
          className="flex-shrink-0 h-screen"
          style={{ width: layout.breathingSpace, backgroundColor: C.bg }}
        />

        {/* CHAPTER 4 — ANLAGESTRATEGIEN */}
        <Section4Anlagestrategien
          scrollX={scrollX}
          breakpoint={breakpoint}
          viewMode={ast.mode}
          onOpenDetail={ast.openDetail}
          onCloseDetail={ast.closeDetail}
          onContactClick={navigateToContact}
        />

        <div
          className="flex-shrink-0 h-screen"
          style={{ width: layout.breathingSpace, backgroundColor: C.bg }}
        />

        {/* CHAPTER 5 — ÜBER TELLIAN (Teil 1 + Filmstrip als Fragment) */}
        <Section5UeberTellian onContactClick={navigateToContact} />

        <div
          className="flex-shrink-0 h-screen"
          style={{ width: layout.breathingSpace, backgroundColor: C.bg }}
        />

        {/* CHAPTER 6 — KONTAKT (map rendered via overlay, no layout impact) */}
        <Section6Kontakt onOpenLegal={legal.open} />
      </div>

      <LoginOverlay
        open={loginOpen}
        onClose={() => setLoginOpen(false)}
        onSupportClick={navigateToContact}
      />

      <LegalPage activePath={legal.activePath} onClose={legal.close} />
    </div>
  );
}
