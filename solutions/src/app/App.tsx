import { useState, useCallback, useEffect } from "react";
import { C, serif, sans } from "./tokens";
import { EASE } from "../styles/motion";
import { getLayout, getTextColumnStyle, SPACING } from "./layout";
import { useHorizontalScroll } from "./components/useHorizontalScroll";
import { useBreakpoint } from "./components/useBreakpoint";
import { HeroExpandingImage } from "./components/ScrollAnimations";
import { FadeIn } from "./components/FadeIn";
import { FloatingField } from "./components/FloatingField";
import { LanguageProvider, useLanguage } from "./context/LanguageContext";
import { Navigation } from "./components/Navigation";
import { DotNavigation } from "./components/DotNavigation";
import { PreloadScreen } from "./components/PreloadScreen";
import { CONTENT, type Locale } from "./content";
import heroImg from "../assets/zh-3.jpg";

/* ═══════════════════════════════════════════════════════════
   SCROLL ARROW — bottom center, bounce, fades on scroll.
   Only shown on vertical (mobile/tablet) layouts.
   ═══════════════════════════════════════════════════════════ */
function ScrollArrow({ visible }: { visible: boolean }) {
  const [arrowVisible, setArrowVisible] = useState(true);

  useEffect(() => {
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }
    window.scrollTo(0, 0);

    const onScroll = () => {
      if (window.scrollY > 60) setArrowVisible(false);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div
      aria-hidden
      style={{
        position: "fixed",
        bottom: 24,
        left: "50%",
        transform: "translateX(-50%)",
        opacity: visible && arrowVisible ? 1 : 0,
        transition: `opacity 400ms ease-out ${visible && arrowVisible ? 1900 : 0}ms`,
        pointerEvents: "none",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 6,
        zIndex: 40,
        padding: "8px 12px",
        backgroundColor: "rgba(249, 249, 247, 0.85)",
        backdropFilter: "blur(6px)",
        WebkitBackdropFilter: "blur(6px)",
        borderRadius: 16,
      }}
    >
      <span style={{
        fontFamily: sans, fontSize: 9, letterSpacing: "0.22em",
        textTransform: "uppercase", color: C.dark, fontWeight: 500,
      }}>
        Scrollen
      </span>
      <svg
        width="16" height="22" viewBox="0 0 14 20" fill="none"
        style={{ animation: "tellian-bounce 2s ease-in-out infinite", color: C.dark }}
      >
        <path d="M7 2 L7 17 M2 12 L7 17 L12 12" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      </svg>
      <style>{`
        @keyframes tellian-bounce {
          0%, 100% { transform: translateY(0); }
          50%      { transform: translateY(4px); }
        }
      `}</style>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   TELLIAN CAPITAL SOLUTIONS
   Mirrors the main Tellian Capital site pixel-for-pixel:
   same scroll engine, same section chrome, same animations.
   Desktop: horizontal scroll. Tablet/Mobile: vertical scroll.
   ═══════════════════════════════════════════════════════════ */

function AppInner() {
  const { breakpoint, isMobile, isVertical } = useBreakpoint();
  const { containerRef, scrollProgress, scrollX, scrollTo, scrollDirection } = useHorizontalScroll({ disabled: isVertical });
  const [introComplete, setIntroComplete] = useState(false);
  const [heroAnimate, setHeroAnimate] = useState(false);
  const heroArrowHidden = scrollX > 30;
  const { lang } = useLanguage();

  const layout = getLayout(breakpoint);
  const textColStyle = getTextColumnStyle(breakpoint);

  /* Force scroll to start position on mount */
  useEffect(() => {
    if (containerRef.current && !isVertical) {
      containerRef.current.scrollLeft = 0;
    }
  }, [containerRef, isVertical]);

  const handleIntroComplete = useCallback(() => {
    setIntroComplete(true);
    setTimeout(() => setHeroAnimate(true), 80);
  }, []);

  const h = CONTENT.hero;
  const s = CONTENT.services;
  const t = CONTENT.team;
  const c = CONTENT.contact;

  /* ═══════════════════════════════════════════════════════════
     VERTICAL MODE (Tablet + Mobile)
     ═══════════════════════════════════════════════════════════ */
  if (isVertical) {
    return (
      <div
        className="min-h-screen w-full cursor-default"
        style={{ backgroundColor: C.bg }}
      >
        {!introComplete && <PreloadScreen onComplete={handleIntroComplete} />}

        {/* Navigation — fixed */}
        <div style={{
          opacity: introComplete ? 1 : 0,
          pointerEvents: introComplete ? "auto" : "none",
          transition: "opacity 600ms ease-out 200ms",
        }}>
          <Navigation
            scrollProgress={0}
            scrollDirection="idle"
            onNavigate={() => {}}
            introComplete={introComplete}
            isVertical
          />
        </div>

        {/* ═══ SECTION 1 — HERO (vertical) ═══
            Image stacked above text (like main site HeroVertical).
            clip-path reveal animation on the image. */}
        <section
          id="section-hero"
          className="relative"
          style={{
            minHeight: "100vh",
            backgroundColor: C.bg,
            paddingTop: 56,
          }}
        >
          {/* Image — full width, stacked above text, clip-path reveal */}
          <div style={{
            width: "100%",
            height: isMobile ? "clamp(220px, 55vw, 320px)" : "clamp(280px, 40vw, 400px)",
            overflow: "hidden",
            backgroundColor: C.bg,
          }}>
            <div style={{
              width: "100%",
              height: "100%",
              backgroundImage: `url(${heroImg})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              clipPath: heroAnimate ? "inset(0 0 0 0)" : "inset(100% 0 0 0)",
              transition: `clip-path 1000ms ${EASE.standard} 200ms`,
            }} />
          </div>

          {/* Text — below image */}
          <div style={{
            padding: isMobile ? "32px 20px 96px" : "clamp(28px, 5vw, 48px) clamp(24px, 6vw, 56px) 96px",
          }}>
            {/* Eyebrow */}
            <span style={{
              fontFamily: sans, fontSize: isMobile ? 10 : 11, fontWeight: 400,
              letterSpacing: "0.18em", textTransform: "uppercase",
              color: C.stone, display: "block",
              opacity: heroAnimate ? 1 : 0,
              transition: "opacity 600ms ease-out 700ms",
            }}>
              Tellian Capital Solutions
            </span>

            {/* Accent line */}
            <div style={{
              height: 1.5,
              backgroundColor: C.dark,
              marginTop: 16,
              width: heroAnimate ? 24 : 0,
              transition: `width 400ms ${EASE.standard} 900ms`,
            }} />

            {/* Headline — slightly smaller on mobile to fit CTA above fold */}
            <h1 style={{
              fontFamily: serif,
              fontSize: isMobile ? "clamp(30px, 9vw, 42px)" : "clamp(40px, 6vw, 64px)",
              lineHeight: 1.08,
              color: C.dark,
              letterSpacing: "-0.025em",
              fontWeight: 400,
              margin: "20px 0 0 0",
            }}>
              <span style={{
                display: "block",
                opacity: heroAnimate ? 1 : 0,
                transform: heroAnimate ? "translateY(0)" : "translateY(24px)",
                transition: `opacity 600ms ease-out 1000ms, transform 600ms ${EASE.standard} 1000ms`,
              }}>
                <em style={{ fontStyle: "italic", fontWeight: 400 }}>
                  {h.taglineLines[lang].map((line, i) => (
                    <span key={i}>{line}{i < h.taglineLines[lang].length - 1 && <br />}</span>
                  ))}
                </em>
              </span>
            </h1>

            {/* Lead sentence */}
            <p style={{
              fontFamily: sans,
              fontSize: isMobile ? 14 : 13,
              color: C.charcoal,
              lineHeight: 1.6,
              maxWidth: 420,
              marginTop: 20,
              opacity: heroAnimate ? 1 : 0,
              transform: heroAnimate ? "translateY(0)" : "translateY(24px)",
              transition: `opacity 500ms ease-out 1350ms, transform 500ms ${EASE.standard} 1350ms`,
            }}>
              {h.leadSentence[lang]}
            </p>

            {/* Closing line */}
            <p style={{
              fontFamily: serif,
              fontSize: isMobile ? 15 : 18,
              fontStyle: "italic",
              color: C.dark,
              lineHeight: 1.4,
              maxWidth: 400,
              fontWeight: 400,
              marginTop: 16,
              opacity: heroAnimate ? 1 : 0,
              transform: heroAnimate ? "translateY(0)" : "translateY(14px)",
              transition: `opacity 600ms ${EASE.standard} 1550ms, transform 600ms ${EASE.standard} 1550ms`,
            }}>
              {h.closingLine[lang]}
            </p>

            {/* CTA */}
            <div style={{
              marginTop: 24,
              opacity: heroAnimate ? 1 : 0,
              transform: heroAnimate ? "translateX(0)" : "translateX(-16px)",
              transition: `opacity 450ms ease-out 1700ms, transform 450ms ${EASE.standard} 1700ms`,
            }}>
              <a
                href="#section-contact"
                style={{
                  display: "inline-flex", alignItems: "center", gap: 10,
                  padding: "14px 24px",
                  backgroundColor: C.button, border: `1px solid ${C.button}`,
                  borderRadius: 0,
                  fontFamily: sans, fontSize: 11, fontWeight: 500,
                  letterSpacing: "0.18em", textTransform: "uppercase",
                  color: C.dark, textDecoration: "none", lineHeight: 1,
                }}
              >
                <span>{t.ctaLabel[lang]}</span>
                <span aria-hidden>→</span>
              </a>
            </div>
          </div>

          {/* Scroll arrow — fixed bottom center, fades on scroll */}
          <ScrollArrow visible={heroAnimate} />
        </section>

        {/* ═══ SECTION 2 — DIENSTLEISTUNGEN (vertical) ═══ */}
        <section id="section-services" style={{ backgroundColor: C.bg }}>
          {/* Text block */}
          <div style={{ ...textColStyle }}>
            <FadeIn yOffset={16}>
              <span style={{
                fontFamily: sans, fontSize: isMobile ? 11 : 10, letterSpacing: "0.22em",
                textTransform: "uppercase", color: C.stone, display: "block",
              }}>
                {s.eyebrow[lang]}
              </span>
              <div style={{ width: 28, height: 1.5, backgroundColor: C.dark, marginTop: SPACING.eyebrowToAccent }} />
            </FadeIn>

            <FadeIn yOffset={24}>
              <h2 style={{
                fontFamily: serif,
                fontSize: isMobile ? "clamp(36px, 10vw, 48px)" : "clamp(48px, 7vh, 80px)",
                lineHeight: 0.94, color: C.dark, letterSpacing: "-0.03em",
                fontWeight: 400, marginTop: SPACING.accentToHeadline,
              }}>
                Was wir
                <br />
                <em style={{ fontStyle: "italic", fontWeight: 400 }}>
                  {lang === "fr" ? "faisons." : lang === "en" ? "do." : "tun."}
                </em>
              </h2>
            </FadeIn>

            <FadeIn yOffset={18}>
              <p style={{
                fontFamily: sans, fontSize: isMobile ? 14 : "clamp(10.5px, 1.3vh, 12.5px)",
                color: C.charcoal, lineHeight: 1.75,
                marginTop: SPACING.headlineToBody,
                maxWidth: isMobile ? "100%" : layout.bodyMaxWidth,
              }}>
                {s.intro[lang]}
              </p>
            </FadeIn>
          </div>

          {/* Purple panel — full width on mobile */}
          <div style={{
            backgroundColor: C.purple,
            padding: isMobile
              ? "40px 20px"
              : "clamp(40px, 6vh, 80px) clamp(32px, 6vw, 80px)",
          }}>
            <div style={{ display: "flex", flexDirection: "column", width: "100%", maxWidth: 640 }}>
              {s.columns.map((col, i) => (
                <FadeIn key={i} yOffset={14} delay={i * 100}>
                  <div>
                    {i > 0 && (
                      <div style={{
                        width: "100%", height: 1,
                        backgroundColor: "rgba(244,244,240,0.20)",
                        margin: isMobile ? "24px 0" : "clamp(16px, 2vh, 24px) 0",
                      }} />
                    )}
                    <div style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
                      <span style={{
                        fontFamily: serif,
                        fontSize: isMobile ? 24 : "clamp(20px, 2.5vh, 28px)",
                        lineHeight: 1,
                        color: "rgba(244,244,240,0.50)",
                        flexShrink: 0,
                        minWidth: 40,
                        userSelect: "none",
                      }}>
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <div style={{ flex: 1 }}>
                        <span style={{
                          fontFamily: serif, fontSize: isMobile ? 16 : 15, color: C.bg,
                          lineHeight: 1.3, display: "block",
                        }}>
                          {col.title[lang]}
                        </span>
                        <p style={{
                          fontFamily: sans,
                          fontSize: isMobile ? 13 : "clamp(11px, 1.2vh, 12px)",
                          color: C.bg,
                          lineHeight: 1.65,
                          margin: "10px 0 0 0",
                          overflowWrap: "break-word",
                        }}>
                          {col.body[lang]}
                        </p>
                      </div>
                    </div>
                  </div>
                </FadeIn>
              ))}
            </div>
          </div>
        </section>

        {/* ═══ SECTION 3 — TEAM (vertical) ═══ */}
        <section id="section-team" style={{ backgroundColor: C.bg }}>
          <div style={{ ...textColStyle }}>
            <FadeIn yOffset={16}>
              <span style={{
                fontFamily: sans, fontSize: isMobile ? 11 : 10, letterSpacing: "0.22em",
                textTransform: "uppercase", color: C.stone, display: "block",
              }}>
                {t.eyebrow[lang]}
              </span>
              <div style={{ width: 28, height: 1.5, backgroundColor: C.dark, marginTop: SPACING.eyebrowToAccent }} />
            </FadeIn>

            <FadeIn yOffset={24}>
              <h2 style={{
                fontFamily: serif,
                fontSize: isMobile ? "clamp(36px, 10vw, 48px)" : "clamp(48px, 7vh, 80px)",
                lineHeight: 0.94, color: C.dark, letterSpacing: "-0.03em",
                fontWeight: 400, marginTop: SPACING.accentToHeadline,
              }}>
                {t.headline[lang].replace(/\.$/, "").split(" ").slice(0, -1).join(" ")}{" "}
                <br />
                <em style={{ fontStyle: "italic", fontWeight: 400 }}>
                  {t.headline[lang].split(" ").pop()}
                </em>
              </h2>
            </FadeIn>
          </div>

          {/* Portraits — grid */}
          <div style={{
            display: "grid",
            gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
            gap: isMobile ? 32 : 40,
            padding: isMobile ? "32px 20px" : "40px clamp(32px, 6vw, 80px)",
          }}>
            {t.members.map((m, i) => (
              <FadeIn key={i} yOffset={16} delay={i * 120}>
                <div style={{ maxWidth: isMobile ? "100%" : 320 }}>
                  <img src={m.photo} alt={m.name} style={{
                    width: "100%", aspectRatio: "3 / 4", objectFit: "cover", display: "block",
                  }} />
                  <div style={{ marginTop: 16 }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <span style={{
                        fontFamily: sans, fontSize: isMobile ? 16 : 18, fontWeight: 600, color: C.dark,
                        lineHeight: 1.3,
                      }}>
                        {m.name}
                      </span>
                      {m.linkedin && (
                        <a
                          href={m.linkedin}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={`${m.name} LinkedIn`}
                          style={{ lineHeight: 0, flexShrink: 0, padding: 8 }}
                        >
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                            <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-4 0v7H10v-7a6 6 0 0 1 6-6z" stroke={C.stone} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                            <rect x="2" y="9" width="4" height="12" stroke={C.stone} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                            <circle cx="4" cy="4" r="2" stroke={C.stone} strokeWidth="1.5"/>
                          </svg>
                        </a>
                      )}
                    </div>
                    <span style={{
                      fontFamily: sans, fontSize: 14, color: C.stone,
                      display: "block", marginTop: 4,
                    }}>
                      {m.role[lang]}
                    </span>

                    <a
                      href={`mailto:${m.email}`}
                      style={{
                        display: "inline-flex", alignItems: "center", gap: 8,
                        marginTop: 12, padding: "8px 0",
                        fontFamily: sans, fontSize: 13, letterSpacing: "0.1em",
                        textTransform: "uppercase", color: C.stone, textDecoration: "none",
                      }}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden style={{ flexShrink: 0 }}>
                        <rect x="2" y="4" width="20" height="16" rx="2" stroke="currentColor" strokeWidth="1.5"/>
                        <path d="M2 7l10 7 10-7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      <span>{t.sendMessage[lang]}</span>
                    </a>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>

          {/* CTA */}
          <div style={{ padding: isMobile ? "0 20px 48px" : "0 clamp(32px, 6vw, 80px) 64px" }}>
            <FadeIn yOffset={14}>
              <a
                href="#section-contact"
                className="inline-flex items-center gap-3 uppercase"
                style={{
                  padding: "16px 24px",
                  border: `1px solid ${C.button}`, borderRadius: 0,
                  backgroundColor: C.button, fontFamily: sans,
                  fontSize: 11, fontWeight: 500, letterSpacing: "0.18em",
                  color: C.dark, textDecoration: "none", lineHeight: 1,
                }}
              >
                <span>{t.ctaLabel[lang]}</span>
                <span aria-hidden>→</span>
              </a>
            </FadeIn>
          </div>
        </section>

        {/* ═══ SECTION 4 — KONTAKT (vertical) ═══ */}
        <ContactSection lang={lang} c={c} isVertical isMobile={isMobile} />

        <style>{`
          @keyframes arrowPulse {
            0%, 100% { transform: translateX(0); }
            50%      { transform: translateX(10px); }
          }
        `}</style>
      </div>
    );
  }

  /* ═══════════════════════════════════════════════════════════
     DESKTOP MODE — horizontal scroll
     ═══════════════════════════════════════════════════════════ */
  return (
    <div
      className="h-screen w-screen overflow-hidden cursor-default"
      style={{ backgroundColor: C.bg }}
    >
      {!introComplete && <PreloadScreen onComplete={handleIntroComplete} />}

      {/* Navigation + DotNav — fixed, outside scroll container */}
      <div style={{
        opacity: introComplete ? 1 : 0,
        pointerEvents: introComplete ? "auto" : "none",
        transition: "opacity 600ms ease-out 200ms",
      }}>
        <Navigation
          scrollProgress={scrollProgress}
          scrollDirection={scrollDirection}
          onNavigate={scrollTo}
          introComplete={introComplete}
        />
        {introComplete && (
          <DotNavigation scrollProgress={scrollProgress} onNavigate={scrollTo} />
        )}
      </div>

      {/* ── Horizontal Scroll Strip ── */}
      <div
        ref={containerRef}
        className="flex h-screen overflow-x-scroll overflow-y-hidden"
        style={{
          scrollbarWidth: "none",
          msOverflowStyle: "none",
          pointerEvents: introComplete ? "auto" : "none",
        }}
      >

        {/* ═══════════════════════════════════════════════════════
            SECTION 1 — HERO
            ═══════════════════════════════════════════════════════ */}
        <div
          className="flex-shrink-0 h-screen relative"
          style={{ width: layout.heroWidth, backgroundColor: C.bg }}
        >
          {/* Image — right side, absolute, scales 0.65→1.0 */}
          <div
            className="absolute z-0"
            style={{ top: 0, bottom: 0, left: layout.imageLeft, right: 0 }}
          >
            <HeroExpandingImage
              src={heroImg}
              scrollX={scrollX}
              className="w-full h-full"
            />
          </div>

          {/* Text column — vertically centered */}
          <div
            className="relative z-10 h-full flex flex-col justify-center"
            style={{ ...textColStyle }}
          >
            {/* Eyebrow */}
            <span style={{
              fontFamily: sans, fontSize: 11, fontWeight: 400,
              letterSpacing: "0.22em", textTransform: "uppercase",
              color: C.stone,
              opacity: heroAnimate ? 1 : 0,
              transition: "opacity 600ms ease-out 200ms",
            }}>
              Tellian Capital Solutions
            </span>

            {/* Headline */}
            <h1 style={{
              fontFamily: serif,
              fontSize: "clamp(40px, 6vh, 64px)",
              lineHeight: 1.1,
              color: C.dark,
              letterSpacing: "-0.03em",
              maxWidth: 520,
              fontWeight: 400,
              margin: 0,
              marginTop: 28,
              opacity: heroAnimate ? 1 : 0,
              transform: heroAnimate ? "translateY(0)" : "translateY(24px)",
              transition: `opacity 800ms ease-out 400ms, transform 800ms ${EASE.standard} 400ms`,
            }}>
              <em style={{ fontStyle: "italic", fontWeight: 400 }}>
                {h.taglineLines[lang].map((line, i) => (
                  <span key={i}>{line}{i < h.taglineLines[lang].length - 1 && <br />}</span>
                ))}
              </em>
            </h1>

            {/* Lead sentence */}
            <p style={{
              fontFamily: sans,
              fontSize: "clamp(12px, 1.4vh, 14px)",
              color: C.charcoal,
              lineHeight: 1.7,
              margin: 0,
              marginTop: 32,
              maxWidth: layout.bodyMaxWidth,
              opacity: heroAnimate ? 1 : 0,
              transform: heroAnimate ? "translateY(0)" : "translateY(18px)",
              transition: `opacity 700ms ${EASE.standard} 700ms, transform 700ms ${EASE.standard} 700ms`,
            }}>
              {h.leadSentence[lang]}
            </p>

            {/* Closing line */}
            <p style={{
              fontFamily: serif,
              fontSize: "clamp(14px, 1.6vh, 18px)",
              fontStyle: "italic",
              color: C.dark,
              lineHeight: 1.4,
              margin: 0,
              marginTop: 24,
              maxWidth: 400,
              fontWeight: 400,
              opacity: heroAnimate ? 1 : 0,
              transform: heroAnimate ? "translateY(0)" : "translateY(14px)",
              transition: `opacity 600ms ${EASE.standard} 900ms, transform 600ms ${EASE.standard} 900ms`,
            }}>
              {h.closingLine[lang]}
            </p>
          </div>

          {/* Scroll arrow — bottom right, pulses */}
          <div
            aria-hidden
            style={{
              position: "absolute",
              bottom: 56,
              right: "calc(10vw + 56px)",
              zIndex: 5,
              color: C.purple,
              opacity: heroAnimate && !heroArrowHidden ? 1 : 0,
              transform: heroArrowHidden ? "translateX(16px) scale(0.6)" : "scale(1)",
              transition: heroArrowHidden
                ? "opacity 600ms cubic-bezier(0.4,0,0.2,1), transform 600ms cubic-bezier(0.4,0,0.2,1)"
                : "opacity 700ms ease-out 600ms",
              pointerEvents: "none",
            }}
          >
            <div style={{
              animation: heroAnimate && !heroArrowHidden ? "arrowPulse 2s ease-in-out infinite" : "none",
            }}>
              <svg width="96" height="24" viewBox="0 0 32 8" fill="currentColor" style={{ display: "block" }}>
                <polygon points="2 2 28 2 30 4 28 6 2 6" />
              </svg>
            </div>
          </div>
        </div>

        {/* Breathing */}
        <div className="flex-shrink-0 h-screen" style={{ width: layout.breathingSpace, backgroundColor: C.bg }} />

        {/* ═══════════════════════════════════════════════════════
            SECTION 2 — DIENSTLEISTUNGEN
            ═══════════════════════════════════════════════════════ */}
        <div
          className="flex-shrink-0 h-screen relative"
          style={{ width: "100vw", backgroundColor: C.bg }}
        >
          {/* Purple panel — right side */}
          <div style={{
            position: "absolute", top: 0, bottom: 0, left: "44vw", right: 0,
            backgroundColor: C.purple,
            display: "flex", alignItems: "center",
            padding: "clamp(24px, 3vh, 48px) clamp(32px, 4vw, 56px)",
          }}>
            <div style={{
              display: "flex", flexDirection: "column",
              width: "100%",
            }}>
              {s.columns.map((col, i) => (
                <FadeIn key={i} yOffset={14} delay={i * 100}>
                  <div>
                    {i > 0 && (
                      <div style={{
                        width: "100%", height: 1,
                        backgroundColor: "rgba(244,244,240,0.20)",
                        margin: "clamp(16px, 2vh, 24px) 0",
                      }} />
                    )}
                    <div style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
                      <span style={{
                        fontFamily: serif,
                        fontSize: "clamp(20px, 2.5vh, 28px)",
                        lineHeight: 1,
                        color: "rgba(244,244,240,0.50)",
                        flexShrink: 0,
                        minWidth: 40,
                        userSelect: "none",
                      }}>
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <div style={{ flex: 1 }}>
                        <span style={{
                          fontFamily: serif, fontSize: 15, color: C.bg,
                          lineHeight: 1.3, display: "block",
                        }}>
                          {col.title[lang]}
                        </span>
                        <p style={{
                          fontFamily: sans,
                          fontSize: "clamp(11px, 1.2vh, 12px)",
                          color: C.bg,
                          lineHeight: 1.6,
                          margin: "8px 0 0 0",
                          overflowWrap: "break-word",
                        }}>
                          {col.body[lang]}
                        </p>
                      </div>
                    </div>
                  </div>
                </FadeIn>
              ))}
            </div>
          </div>

          {/* Text — left (white bg) */}
          <div
            className="relative z-10 h-full flex flex-col justify-center"
            style={{
              ...textColStyle,
              width: "44vw",
              backgroundColor: C.bg,
              maxWidth: "calc(460px + clamp(36px, 5vw, 120px) + 4vw)",
            }}
          >
            <FadeIn yOffset={16}>
              <span style={{
                fontFamily: sans, fontSize: 10, letterSpacing: "0.22em",
                textTransform: "uppercase", color: C.stone, display: "block",
              }}>
                {s.eyebrow[lang]}
              </span>
              <div style={{ width: 28, height: 1.5, backgroundColor: C.dark, marginTop: SPACING.eyebrowToAccent }} />
            </FadeIn>

            <FadeIn yOffset={24}>
              <h2 style={{
                fontFamily: serif,
                fontSize: "clamp(48px, 7vh, 80px)",
                lineHeight: 0.94, color: C.dark, letterSpacing: "-0.03em",
                fontWeight: 400, marginTop: SPACING.accentToHeadline,
              }}>
                Was wir
                <br />
                <em style={{ fontStyle: "italic", fontWeight: 400 }}>
                  {lang === "fr" ? "faisons." : lang === "en" ? "do." : "tun."}
                </em>
              </h2>
            </FadeIn>

            <FadeIn yOffset={18}>
              <p style={{
                fontFamily: sans, fontSize: "clamp(10.5px, 1.3vh, 12.5px)",
                color: C.charcoal, lineHeight: 1.75,
                marginTop: SPACING.headlineToBody,
                maxWidth: layout.bodyMaxWidth,
              }}>
                {s.intro[lang]}
              </p>
            </FadeIn>
          </div>
        </div>

        <div className="flex-shrink-0 h-screen" style={{ width: layout.breathingSpace, backgroundColor: C.bg }} />

        {/* ═══════════════════════════════════════════════════════
            SECTION 3 — TEAM
            ═══════════════════════════════════════════════════════ */}
        <div
          className="flex-shrink-0 h-screen relative"
          style={{ width: "100vw", backgroundColor: C.bg }}
        >
          {/* Text column — left */}
          <div
            className="absolute z-10 top-0 left-0 h-full flex flex-col justify-center"
            style={{
              width: "44vw",
              paddingLeft: layout.paddingLeft,
              paddingRight: layout.paddingRight,
              backgroundColor: C.bg,
            }}
          >
            <FadeIn yOffset={16}>
              <span style={{
                fontFamily: sans, fontSize: 10, letterSpacing: "0.22em",
                textTransform: "uppercase", color: C.stone, display: "block",
              }}>
                {t.eyebrow[lang]}
              </span>
              <div style={{ width: 28, height: 1.5, backgroundColor: C.dark, marginTop: SPACING.eyebrowToAccent }} />
            </FadeIn>

            <FadeIn yOffset={24}>
              <h2 style={{
                fontFamily: serif,
                fontSize: "clamp(48px, 7vh, 80px)",
                lineHeight: 0.94, color: C.dark, letterSpacing: "-0.03em",
                fontWeight: 400, marginTop: SPACING.accentToHeadline,
              }}>
                {t.headline[lang].replace(/\.$/, "").split(" ").slice(0, -1).join(" ")}{" "}
                <br />
                <em style={{ fontStyle: "italic", fontWeight: 400 }}>
                  {t.headline[lang].split(" ").pop()}
                </em>
              </h2>
            </FadeIn>

            {/* CTA */}
            <FadeIn yOffset={14} delay={200}>
              <a
                href="#contact"
                onClick={(e) => { e.preventDefault(); scrollTo(1.0); }}
                className="inline-flex items-center gap-3 uppercase"
                style={{
                  marginTop: 56, padding: "16px 24px",
                  border: `1px solid ${C.button}`, borderRadius: 0,
                  backgroundColor: C.button, fontFamily: sans,
                  fontSize: 11, fontWeight: 500, letterSpacing: "0.18em",
                  color: C.dark, textDecoration: "none", lineHeight: 1,
                  alignSelf: "flex-start",
                  transition: "background-color 250ms ease-out",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = C.buttonHover; }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = C.button; }}
              >
                <span>{t.ctaLabel[lang]}</span>
                <span aria-hidden>→</span>
              </a>
            </FadeIn>
          </div>

          {/* Portrait cards — right side */}
          <div style={{
            position: "absolute", top: 0, bottom: 0, left: 0, right: 0,
            display: "flex", alignItems: "center",
            justifyContent: "flex-end",
            gap: "clamp(16px, 2vw, 32px)",
            paddingRight: "clamp(24px, 3vw, 48px)",
          }}>
            {t.members.map((m, i) => (
              <FadeIn key={i} yOffset={16} delay={i * 120}>
                <div style={{ width: "21vw", maxWidth: 285 }}>
                  <img src={m.photo} alt={m.name} style={{
                    width: "100%", aspectRatio: "3 / 4", objectFit: "cover", display: "block",
                  }} />
                  <div style={{ marginTop: 16 }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <span style={{
                        fontFamily: sans, fontSize: 18, fontWeight: 600, color: C.dark,
                        lineHeight: 1.3,
                      }}>
                        {m.name}
                      </span>
                      {m.linkedin && (
                        <a
                          href={m.linkedin}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={`${m.name} LinkedIn`}
                          style={{ lineHeight: 0, flexShrink: 0, transition: "opacity 200ms ease" }}
                          onMouseEnter={(e) => { e.currentTarget.style.opacity = "0.6"; }}
                          onMouseLeave={(e) => { e.currentTarget.style.opacity = "1"; }}
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                            <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-4 0v7H10v-7a6 6 0 0 1 6-6z" stroke={C.stone} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                            <rect x="2" y="9" width="4" height="12" stroke={C.stone} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                            <circle cx="4" cy="4" r="2" stroke={C.stone} strokeWidth="1.5"/>
                          </svg>
                        </a>
                      )}
                    </div>
                    <span style={{
                      fontFamily: sans, fontSize: 14, color: C.stone,
                      display: "block", marginTop: 4,
                    }}>
                      {m.role[lang]}
                    </span>

                    <a
                      href={`mailto:${m.email}`}
                      style={{
                        display: "inline-flex", alignItems: "center", gap: 8,
                        marginTop: 12,
                        fontFamily: sans, fontSize: 13, letterSpacing: "0.1em",
                        textTransform: "uppercase", color: C.stone, textDecoration: "none",
                        transition: "color 200ms ease",
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.color = C.dark; }}
                      onMouseLeave={(e) => { e.currentTarget.style.color = C.stone; }}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden style={{ flexShrink: 0 }}>
                        <rect x="2" y="4" width="20" height="16" rx="2" stroke="currentColor" strokeWidth="1.5"/>
                        <path d="M2 7l10 7 10-7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      <span>{t.sendMessage[lang]}</span>
                    </a>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>

        <div className="flex-shrink-0 h-screen" style={{ width: layout.breathingSpace, backgroundColor: C.bg }} />

        {/* ═══════════════════════════════════════════════════════
            SECTION 4 — KONTAKT
            ═══════════════════════════════════════════════════════ */}
        <ContactSection lang={lang} c={c} />
      </div>

      <style>{`
        @keyframes arrowPulse {
          0%, 100% { transform: translateX(0); }
          50%      { transform: translateX(10px); }
        }
      `}</style>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   CONTACT SECTION — exact mirror of Section6Kontakt.
   Supports both desktop (horizontal) and vertical (mobile) modes.
   ═══════════════════════════════════════════════════════════ */
function ContactSection({
  lang,
  c,
  isVertical = false,
  isMobile = false,
}: {
  lang: Locale;
  c: typeof CONTENT.contact;
  isVertical?: boolean;
  isMobile?: boolean;
}) {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ firstName: "", lastName: "", email: "", phone: "", message: "" });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1000));
    setLoading(false);
    setSubmitted(true);
  };

  const fl = c.fieldLabels;

  /* ═══ Form card (shared between desktop and mobile) ═══ */
  const formCard = (
    <FadeIn yOffset={16}>
      <div style={{
        width: "100%", maxWidth: 480, backgroundColor: C.bg,
        border: `0.5px solid ${C.line}`, borderRadius: 12, padding: isMobile ? 24 : 32,
      }}>
        {/* Form eyebrow */}
        <span style={{
          fontFamily: sans, fontSize: 10, letterSpacing: "0.2em",
          color: C.stone, display: "block", textTransform: "uppercase",
        }}>
          {c.formEyebrow[lang]}
        </span>
        <div style={{ width: 28, height: 1.5, backgroundColor: C.dark, marginTop: 12, marginBottom: 24 }} />

        {submitted ? (
          <div style={{ padding: "20px 0" }} role="status" aria-live="polite">
            <span style={{ fontFamily: serif, fontSize: 24, color: C.dark, display: "block", lineHeight: 1.15 }}>
              {c.thankYou[lang]}
            </span>
            <span style={{ fontFamily: sans, fontSize: 13, color: C.charcoal, display: "block", marginTop: 12, lineHeight: 1.6 }}>
              {c.thankYouSub[lang]}
            </span>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 16 }}>
              <FloatingField label={fl.firstName[lang]} required value={form.firstName} onChange={(v) => setForm({ ...form, firstName: v })} />
              <FloatingField label={fl.lastName[lang]} required value={form.lastName} onChange={(v) => setForm({ ...form, lastName: v })} />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 16 }}>
              <FloatingField label={fl.email[lang]} type="email" required value={form.email} onChange={(v) => setForm({ ...form, email: v })} />
              <FloatingField label={fl.phone[lang]} type="tel" value={form.phone} onChange={(v) => setForm({ ...form, phone: v })} />
            </div>
            <FloatingField label={fl.message[lang]} required multiline rows={5} value={form.message} onChange={(v) => setForm({ ...form, message: v })} />

            <p style={{ fontFamily: sans, fontSize: 12, color: C.charcoal, opacity: 0.65, lineHeight: 1.5, margin: 0 }}>
              {c.privacyNotice[lang].replace("Datenschutzbestimmungen", "").replace("privacy policy", "").replace("politique de confidentialité", "").trim()}{" "}
              <a href="https://telliancapital.ch/datenschutz" target="_blank" rel="noopener noreferrer"
                style={{ color: "inherit", textDecoration: "none" }}
                onMouseEnter={(e) => { e.currentTarget.style.textDecoration = "underline"; }}
                onMouseLeave={(e) => { e.currentTarget.style.textDecoration = "none"; }}>
                {lang === "fr" ? "politique de confidentialité" : lang === "en" ? "privacy policy" : "Datenschutzbestimmungen"}
              </a>{lang === "de" ? " zu." : "."}
            </p>

            <button
              type="submit"
              disabled={loading}
              style={{
                fontFamily: sans, fontSize: 11, fontWeight: 500,
                letterSpacing: "0.18em", textTransform: "uppercase",
                color: C.dark, backgroundColor: C.button,
                border: "none", borderRadius: 0, padding: "16px 24px",
                cursor: loading ? "not-allowed" : "pointer",
                opacity: loading ? 0.8 : 1,
                transition: "background-color 200ms ease, opacity 200ms ease",
                display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 10,
                minHeight: 48,
              }}
              onMouseEnter={(e) => { if (!loading) e.currentTarget.style.backgroundColor = C.buttonHover; }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = C.button; }}
            >
              {loading ? "..." : c.submitLabel[lang]}
              {!loading && <span aria-hidden>→</span>}
            </button>

            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ display: "inline-block", width: 12, height: 1, backgroundColor: C.stone, opacity: 0.5 }} aria-hidden />
              <span style={{ fontFamily: sans, fontSize: 12, letterSpacing: "0.1em", textTransform: "uppercase", color: C.stone, opacity: 0.65 }}>
                {c.responseHint[lang]}
              </span>
            </div>
          </form>
        )}
      </div>
    </FadeIn>
  );

  /* ═══ VERTICAL (mobile/tablet) ═══ */
  if (isVertical) {
    return (
      <section id="section-contact" style={{ backgroundColor: C.bg }}>
        {/* Editorial */}
        <div style={{
          padding: isMobile ? "48px 20px 32px" : "64px clamp(32px, 6vw, 80px) 40px",
        }}>
          <FadeIn yOffset={16}>
            <span style={{
              fontFamily: sans, fontSize: isMobile ? 11 : 10, letterSpacing: "0.22em",
              textTransform: "uppercase", color: C.stone, display: "block",
            }}>
              {c.eyebrow[lang]}
            </span>
            <div style={{ width: 28, height: 1.5, backgroundColor: C.dark, marginTop: 16 }} />
          </FadeIn>

          <FadeIn yOffset={24}>
            <h2 style={{
              fontFamily: serif,
              fontSize: isMobile ? "clamp(36px, 10vw, 48px)" : "clamp(48px, 7vh, 80px)",
              lineHeight: 0.94, color: C.dark, letterSpacing: "-0.03em",
              margin: 0, marginTop: 32, fontWeight: 400,
            }}>
              Sprechen <em style={{ fontStyle: "italic", fontWeight: 400 }}>wir.</em>
            </h2>
          </FadeIn>

          <FadeIn yOffset={18}>
            <p style={{
              fontFamily: sans, fontSize: 14, color: C.charcoal,
              lineHeight: 1.6, maxWidth: 400, margin: 0, marginTop: 24,
            }}>
              {c.intro[lang]}
            </p>
          </FadeIn>

          {/* Phone */}
          <FadeIn yOffset={14} delay={100}>
            <div style={{ marginTop: 32 }}>
              <a href={`tel:${c.phone.replace(/\s/g, "")}`} style={{
                fontFamily: serif, fontSize: isMobile ? 22 : 28, fontWeight: 400,
                color: C.dark, textDecoration: "none", letterSpacing: "-0.01em",
                display: "block", lineHeight: 1.2,
              }}>
                {c.phone}
              </a>
              <span style={{
                fontFamily: sans, fontSize: 14, color: C.charcoal,
                opacity: 0.7, display: "block", marginTop: 8,
              }}>
                {c.hours[lang]}
              </span>
            </div>
          </FadeIn>

          {/* Email */}
          <FadeIn yOffset={14} delay={150}>
            <a href={`mailto:${c.emailAddr}`} style={{
              fontFamily: sans, fontSize: 13, color: C.charcoal,
              textDecoration: "none", display: "inline-block", marginTop: 24,
            }}>
              {c.emailAddr}
            </a>
          </FadeIn>

          {/* Address */}
          <FadeIn yOffset={14} delay={200}>
            <div style={{ marginTop: 40 }}>
              <span style={{ fontFamily: sans, fontSize: 13, fontWeight: 500, color: C.dark, display: "block" }}>
                {c.companyName}
              </span>
              <span style={{ fontFamily: sans, fontSize: 11, color: C.stone, display: "block", marginTop: 4 }}>
                {c.companySubtitle}
              </span>
              <span style={{ fontFamily: sans, fontSize: 11, color: C.stone, display: "block", marginTop: 4 }}>
                {c.addressLine[lang]}
              </span>
              <a
                href="https://maps.google.com/?q=L%C3%B6wenstrasse+1+8001+Z%C3%BCrich"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: "inline-flex", alignItems: "center", gap: 8,
                  marginTop: 16, padding: "8px 0",
                  fontFamily: sans, fontSize: 13,
                  letterSpacing: "0.1em", textTransform: "uppercase",
                  color: C.stone, textDecoration: "none",
                }}
              >
                <span>{c.mapLink[lang]}</span>
                <span aria-hidden>→</span>
              </a>
            </div>
          </FadeIn>
        </div>

        {/* Form — full width on secondary bg */}
        <div style={{
          backgroundColor: C.bgSecondary,
          padding: isMobile ? "40px 20px" : "64px clamp(32px, 6vw, 80px)",
          display: "flex", flexDirection: "column", alignItems: "center",
        }}>
          {formCard}
        </div>

        {/* Footer */}
        <div style={{
          padding: isMobile ? "32px 20px" : "32px clamp(32px, 6vw, 80px)",
          backgroundColor: C.bg,
        }}>
          <div style={{ width: "100%", height: 1, backgroundColor: C.dark, opacity: 0.25, marginBottom: 24 }} />
          <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
            <a href="https://telliancapital.ch/datenschutz" target="_blank" rel="noopener noreferrer"
              style={{ fontFamily: sans, fontSize: 11, letterSpacing: "0.12em", textTransform: "uppercase", color: C.stone, textDecoration: "none", opacity: 0.7 }}>
              Datenschutz
            </a>
            <a href="https://telliancapital.ch/kundeninformation" target="_blank" rel="noopener noreferrer"
              style={{ fontFamily: sans, fontSize: 11, letterSpacing: "0.12em", textTransform: "uppercase", color: C.stone, textDecoration: "none", opacity: 0.7 }}>
              Kundeninformation
            </a>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 16 }}>
            <div style={{ width: 16, height: 1, backgroundColor: C.line }} />
            <span style={{ fontFamily: sans, fontSize: 8, letterSpacing: "0.16em", color: C.muted, opacity: 0.6, textTransform: "uppercase" }}>
              Tellian Capital AG &mdash; Est. 1996 &mdash; Zürich
            </span>
          </div>
        </div>
      </section>
    );
  }

  /* ═══ DESKTOP (horizontal scroll) ═══ */
  return (
    <div
      className="flex-shrink-0 h-screen flex"
      style={{ width: "100vw", backgroundColor: C.bg }}
    >
      {/* COLUMN 1 — Editorial */}
      <div style={{
        width: "36vw", minWidth: 380, flexShrink: 0,
        padding: "clamp(36px, 5vh, 80px) clamp(36px, 5vw, 80px) clamp(24px, 3vh, 56px)",
        display: "flex", flexDirection: "column", justifyContent: "space-between",
        backgroundColor: C.bg,
      }}>
        <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center" }}>
          <FadeIn yOffset={16}>
            <span style={{
              fontFamily: sans, fontSize: 10, letterSpacing: "0.22em",
              textTransform: "uppercase", color: C.stone, display: "block",
            }}>
              {c.eyebrow[lang]}
            </span>
            <div style={{ width: 28, height: 1.5, backgroundColor: C.dark, marginTop: 16 }} />
          </FadeIn>

          <FadeIn yOffset={24}>
            <h2 style={{
              fontFamily: serif, fontSize: "clamp(48px, 7vh, 80px)",
              lineHeight: 0.94, color: C.dark, letterSpacing: "-0.03em",
              margin: 0, marginTop: 32, fontWeight: 400,
            }}>
              Sprechen <em style={{ fontStyle: "italic", fontWeight: 400 }}>wir.</em>
            </h2>
          </FadeIn>

          <FadeIn yOffset={18}>
            <p style={{
              fontFamily: sans, fontSize: 14, color: C.charcoal,
              lineHeight: 1.6, maxWidth: 320, margin: 0, marginTop: 24,
            }}>
              {c.intro[lang]}
            </p>
          </FadeIn>

          <FadeIn yOffset={14} delay={100}>
            <div style={{ marginTop: 48 }}>
              <a href={`tel:${c.phone.replace(/\s/g, "")}`} style={{
                fontFamily: serif, fontSize: 28, fontWeight: 400,
                color: C.dark, textDecoration: "none", letterSpacing: "-0.01em",
                display: "block", lineHeight: 1.2,
              }}>
                {c.phone}
              </a>
              <span style={{
                fontFamily: sans, fontSize: 14, color: C.charcoal,
                opacity: 0.7, display: "block", marginTop: 8,
              }}>
                {c.hours[lang]}
              </span>
            </div>
          </FadeIn>

          <FadeIn yOffset={14} delay={150}>
            <a href={`mailto:${c.emailAddr}`} style={{
              fontFamily: sans, fontSize: 13, color: C.charcoal,
              textDecoration: "none", display: "inline-block", marginTop: 32,
            }}>
              {c.emailAddr}
            </a>
          </FadeIn>

          <FadeIn yOffset={14} delay={200}>
            <div style={{ marginTop: 64 }}>
              <span style={{ fontFamily: sans, fontSize: 13, fontWeight: 500, color: C.dark, display: "block" }}>
                {c.companyName}
              </span>
              <span style={{ fontFamily: sans, fontSize: 11, color: C.stone, display: "block", marginTop: 4 }}>
                {c.companySubtitle}
              </span>
              <span style={{ fontFamily: sans, fontSize: 11, color: C.stone, display: "block", marginTop: 4 }}>
                {c.addressLine[lang]}
              </span>
              <a
                href="https://maps.google.com/?q=L%C3%B6wenstrasse+1+8001+Z%C3%BCrich"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: "inline-flex", alignItems: "center", gap: 8,
                  marginTop: 16, fontFamily: sans, fontSize: 13,
                  letterSpacing: "0.1em", textTransform: "uppercase",
                  color: C.stone, textDecoration: "none", transition: "color 200ms ease",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.color = C.dark; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = C.stone; }}
              >
                <span>{c.mapLink[lang]}</span>
                <span aria-hidden>→</span>
              </a>
            </div>
          </FadeIn>
        </div>

        {/* Footer */}
        <div style={{ paddingTop: 32 }}>
          <div style={{ width: "100%", height: 1, backgroundColor: C.dark, opacity: 0.25, marginBottom: 24 }} />
          <div style={{ display: "flex", gap: 16 }}>
            <a href="https://telliancapital.ch/datenschutz" target="_blank" rel="noopener noreferrer"
              style={{ fontFamily: sans, fontSize: 11, letterSpacing: "0.12em", textTransform: "uppercase", color: C.stone, textDecoration: "none", opacity: 0.7 }}>
              Datenschutz
            </a>
            <a href="https://telliancapital.ch/kundeninformation" target="_blank" rel="noopener noreferrer"
              style={{ fontFamily: sans, fontSize: 11, letterSpacing: "0.12em", textTransform: "uppercase", color: C.stone, textDecoration: "none", opacity: 0.7 }}>
              Kundeninformation
            </a>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 16 }}>
            <div style={{ width: 16, height: 1, backgroundColor: C.line }} />
            <span style={{ fontFamily: sans, fontSize: 8, letterSpacing: "0.16em", color: C.muted, opacity: 0.6, textTransform: "uppercase" }}>
              Tellian Capital AG &mdash; Est. 1996 &mdash; Zürich
            </span>
          </div>
        </div>
      </div>

      {/* COLUMN 2 — Form */}
      <div style={{
        flex: 1, minWidth: 460, backgroundColor: C.bgSecondary,
        padding: "clamp(36px, 5vh, 80px) clamp(36px, 4vw, 64px) clamp(24px, 3vh, 56px)",
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      }}>
        {formCard}
      </div>
    </div>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <AppInner />
    </LanguageProvider>
  );
}
