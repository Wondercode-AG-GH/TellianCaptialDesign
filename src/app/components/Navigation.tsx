import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import React from "react";
import type { Breakpoint } from "./useBreakpoint";
import { C, serif, sans } from "../tokens";
import { EASE } from "../../styles/motion";

const BAR_W   = 48;
const PANEL_W = 300;

/* ─── Six sections — targets & thresholds match DotNavigation.tsx.
      Scrollable width = 764vw. targets = sectionStart / 764. ─── */
const NAV_ITEMS = [
  { num: "01", label: "Vermögen mit Methode", sub: "Einführung",           progress: 0.000 },
  { num: "02", label: "Haltung",              sub: "Anlagephilosophie",    progress: 0.154 },
  { num: "03", label: "Vermögensverwaltung",  sub: "Mandat & Prozess",     progress: 0.309 },
  { num: "04", label: "Anlagestrategien",     sub: "Wie wir investieren",  progress: 0.463 },
  { num: "05", label: "Über uns",             sub: "Team & Geschichte",    progress: 0.618 },
  { num: "06", label: "Kontakt",              sub: "Gespräch vereinbaren", progress: 1.000 },
];

/* Vertical-mode section IDs for scrollIntoView */
const SECTION_IDS = [
  "section-hero",
  "section-anlagephilosophie",
  "section-vermoegensverwaltung",
  "section-anlagestrategien",
  "section-ueber-uns",
  "section-kontakt",
];

function getActiveIndex(progress: number): number {
  const thresholds = [0, 0.08, 0.23, 0.39, 0.54, 0.94];
  let active = 0;
  for (let i = 1; i < thresholds.length; i++) {
    if (progress >= thresholds[i]) active = i;
  }
  return active;
}

/* ═══════ ICONS ═══════ */

function LockIcon({ size = 18, color = C.dark, strokeWidth = 1.5 }: { size?: number; color?: string; strokeWidth?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="4" y="11" width="16" height="11" stroke={color} strokeWidth={strokeWidth} strokeLinejoin="round" />
      <path d="M8 11V7a4 4 0 0 1 8 0v4" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
      <circle cx="12" cy="16.5" r="1.25" fill={color} />
    </svg>
  );
}

function LinkedInIcon({ color = "#999" }: { color?: string }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-4 0v7H10v-7a6 6 0 0 1 6-6z"
        stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
      />
      <rect x="2" y="9" width="4" height="12" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="4" cy="4" r="2" stroke={color} strokeWidth="1.5" />
    </svg>
  );
}

/* ═══════ PROPS ═══════ */

interface NavigationProps {
  scrollProgress: number;
  scrollDirection: "forward" | "backward" | "idle";
  onNavigate: (progress: number) => void;
  introComplete: boolean;
  breakpoint: Breakpoint;
  isVertical: boolean;
  onLoginClick: () => void;
}

/* ═══════════════════════════════════════════════════════════════
   NAVIGATION COMPONENT
   Desktop: vertical sidebar (48px collapsed, 300px expanded)
   Tablet/Mobile: top bar with hamburger, fullscreen overlay menu
   ══════════════════════════════════════════════════════════════ */
export function Navigation({
  scrollProgress,
  scrollDirection,
  onNavigate,
  introComplete,
  breakpoint,
  isVertical,
  onLoginClick,
}: NavigationProps) {
  const [expanded,    setExpanded]    = useState(false);
  const [visible,     setVisible]     = useState(true);
  const [lang,        setLang]        = useState<"DE" | "EN">("DE");
  const [loginHover,  setLoginHover]  = useState(false);
  const [portalHover, setPortalHover] = useState(false);
  const [liHover,     setLiHover]     = useState(false);
  const activeIndex = getActiveIndex(scrollProgress);
  const hideTimer   = useRef<number>(0);

  /* Show / hide bar based on scroll direction */
  useEffect(() => {
    if (!introComplete) return;
    if (expanded) return;

    if (isVertical) {
      // Vertical: hide top bar on scroll down, show on scroll up
      let lastScrollY = window.scrollY;
      const onScroll = () => {
        const y = window.scrollY;
        if (y > lastScrollY && y > 60) setVisible(false);
        else setVisible(true);
        lastScrollY = y;
      };
      window.addEventListener("scroll", onScroll, { passive: true });
      return () => window.removeEventListener("scroll", onScroll);
    }

    // Horizontal mode
    if (scrollDirection === "backward") {
      clearTimeout(hideTimer.current);
      setVisible(true);
    } else if (scrollDirection === "forward") {
      clearTimeout(hideTimer.current);
      hideTimer.current = window.setTimeout(() => setVisible(false), 120);
    }
    return () => clearTimeout(hideTimer.current);
  }, [scrollDirection, introComplete, expanded, isVertical]);

  useEffect(() => {
    if (scrollProgress < 0.01) setVisible(true);
  }, [scrollProgress]);

  useEffect(() => {
    if (!isVertical && scrollDirection === "forward" && expanded) setExpanded(false);
  }, [scrollDirection, expanded, isVertical]);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (isVertical && expanded) {
      document.body.style.overflow = "hidden";
      return () => { document.body.style.overflow = ""; };
    }
  }, [isVertical, expanded]);

  const handleNavigate = (index: number) => {
    if (isVertical) {
      const el = document.getElementById(SECTION_IDS[index]);
      if (el) el.scrollIntoView({ behavior: "smooth" });
    } else {
      onNavigate(NAV_ITEMS[index].progress);
    }
    setExpanded(false);
  };

  /* ── TABLET / MOBILE ── */
  if (isVertical) {
    return (
      <>
        {/* Top bar */}
        <div
          className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between"
          style={{
            height: 56,
            paddingLeft: breakpoint === "mobile" ? 16 : 24,
            paddingRight: breakpoint === "mobile" ? 16 : 24,
            backgroundColor: "rgba(249,249,247,0.92)",
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
            borderBottom: "1px solid rgba(216,213,207,0.4)",
            opacity: introComplete ? 1 : 0,
            transform: visible ? "translateY(0)" : "translateY(-100%)",
            transition: `transform 0.4s ${EASE.nav}, opacity 0.4s ${EASE.nav}`,
          }}
        >
          {/* Logo */}
          <button
            onClick={() => handleNavigate(0)}
            style={{ outline: "none", cursor: "pointer", border: "none", background: "transparent", padding: 0 }}
          >
            <span
              style={{
                fontFamily: sans,
                fontSize: "13px",
                fontWeight: 700,
                letterSpacing: "2.5px",
                color: C.dark,
                textTransform: "uppercase",
                userSelect: "none",
              }}
            >
              TELLIAN
              <span style={{ fontWeight: 400 }}>{"\u00A0"}CAPITAL</span>
            </span>
          </button>

          {/* Hamburger — 44×44 touch target per Apple HIG */}
          <button
            onClick={() => setExpanded(!expanded)}
            style={{
              outline: "none",
              cursor: "pointer",
              border: "none",
              background: "transparent",
              width: 44,
              height: 44,
              margin: -10, // absorb the extra space so visual position stays the same
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 5,
            }}
            aria-label={expanded ? "Menü schliessen" : "Menü öffnen"}
          >
            <div
              style={{
                width: 22, height: 1.5, backgroundColor: C.dark,
                transform: expanded ? "rotate(45deg) translate(2px, 2px)" : "none",
                transition: `transform 0.3s ${EASE.nav}`,
              }}
            />
            <div
              style={{
                width: 22, height: 1.5, backgroundColor: C.dark,
                opacity: expanded ? 0 : 1,
                transition: `opacity 0.2s ${EASE.nav}`,
              }}
            />
            <div
              style={{
                width: 22, height: 1.5, backgroundColor: C.dark,
                transform: expanded ? "rotate(-45deg) translate(2px, -2px)" : "none",
                transition: `transform 0.3s ${EASE.nav}`,
              }}
            />
          </button>
        </div>

        {/* Fullscreen menu overlay */}
        <AnimatePresence>
          {expanded && (
            <motion.div
              className="fixed inset-0 z-[60] flex flex-col"
              style={{ backgroundColor: C.bgSecondary }}
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4, ease: EASE.navArr }}
            >
              {/* Header with close */}
              <div
                style={{
                  height: 56,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  paddingLeft: breakpoint === "mobile" ? 16 : 24,
                  paddingRight: breakpoint === "mobile" ? 16 : 24,
                  borderBottom: "1px solid #ddd",
                }}
              >
                <span
                  style={{
                    fontFamily: sans,
                    fontSize: "13px",
                    fontWeight: 700,
                    letterSpacing: "2.5px",
                    color: C.dark,
                    textTransform: "uppercase",
                    userSelect: "none",
                  }}
                >
                  TELLIAN<span style={{ fontWeight: 400 }}>{"\u00A0"}CAPITAL</span>
                </span>
                <button
                  onClick={() => setExpanded(false)}
                  style={{
                    outline: "none",
                    border: "none",
                    background: "transparent",
                    cursor: "pointer",
                    width: 44,
                    height: 44,
                    margin: -10,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                  aria-label="Menü schliessen"
                >
                  <svg width="18" height="18" viewBox="0 0 16 16" fill="none">
                    <line x1="1.5" y1="1.5" x2="14.5" y2="14.5" stroke={C.dark} strokeWidth="1.25" strokeLinecap="round" />
                    <line x1="14.5" y1="1.5" x2="1.5" y2="14.5" stroke={C.dark} strokeWidth="1.25" strokeLinecap="round" />
                  </svg>
                </button>
              </div>

              {/* Nav items */}
              <nav style={{ flex: 1, overflowY: "auto", padding: breakpoint === "mobile" ? "32px 20px" : "32px 32px" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: breakpoint === "mobile" ? 24 : 28 }}>
                  {NAV_ITEMS.map((item, i) => {
                    const isActive = activeIndex === i;
                    return (
                      <motion.button
                        key={item.num}
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.35, delay: 0.05 + i * 0.04, ease: EASE.navArr }}
                        onClick={() => handleNavigate(i)}
                        style={{
                          outline: "none",
                          border: "none",
                          background: "transparent",
                          cursor: "pointer",
                          textAlign: "left",
                          position: "relative",
                          paddingLeft: 16,
                        }}
                      >
                        {isActive && (
                          <div
                            style={{
                              position: "absolute",
                              left: 0,
                              top: "50%",
                              transform: "translateY(-50%)",
                              width: 2,
                              height: 28,
                              backgroundColor: C.button,
                            }}
                          />
                        )}
                        <span
                          style={{
                            fontFamily: sans,
                            fontSize: "11px",
                            color: isActive ? C.button : "#bbb",
                            display: "block",
                            marginBottom: 3,
                          }}
                        >
                          {item.num}
                        </span>
                        <span
                          style={{
                            fontFamily: serif,
                            fontSize: breakpoint === "mobile" ? "18px" : "20px",
                            color: C.dark,
                            display: "block",
                            lineHeight: 1.2,
                          }}
                        >
                          {item.label}
                        </span>
                        <span
                          style={{
                            fontFamily: sans,
                            fontSize: "12px",
                            color: "#999",
                            display: "block",
                            marginTop: 3,
                          }}
                        >
                          {item.sub}
                        </span>
                      </motion.button>
                    );
                  })}
                </div>
              </nav>

              {/* Bottom section */}
              <div
                style={{
                  padding: breakpoint === "mobile" ? "20px" : "24px 32px",
                  borderTop: "1px solid #ddd",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  {/* Language */}
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    {(["DE", "EN"] as const).map((l, idx) => (
                      <React.Fragment key={l}>
                        {idx > 0 && (
                          <span style={{ color: "#ddd", fontSize: "11px", fontFamily: sans }}>/</span>
                        )}
                        <button
                          onClick={() => setLang(l)}
                          style={{
                            outline: "none", border: "none", background: "transparent", cursor: "pointer",
                            fontFamily: sans, fontSize: "11px", fontWeight: 700, letterSpacing: "0.08em",
                            textTransform: "uppercase", color: lang === l ? C.dark : "#bbb", padding: 0,
                          }}
                        >
                          {l}
                        </button>
                      </React.Fragment>
                    ))}
                  </div>

                  {/* Login */}
                  <button
                    onClick={(e) => {
                      (e.currentTarget as HTMLElement).focus();
                      setExpanded(false);
                      onLoginClick();
                    }}
                    aria-haspopup="dialog"
                    style={{
                      display: "flex", alignItems: "center", gap: 8,
                      backgroundColor: C.button, color: C.dark,
                      fontFamily: sans, fontSize: "11px", fontWeight: 700,
                      letterSpacing: "1.5px", textTransform: "uppercase",
                      padding: "10px 16px", border: "none", cursor: "pointer",
                    }}
                  >
                    <LockIcon size={14} color={C.bgSecondary} strokeWidth={1.5} />
                    Login
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </>
    );
  }

  /* ── DESKTOP (original sidebar) ── */
  return (
    <>
      {/* ══════════════════════════════════════════════════════════
          COLLAPSED VERTICAL BAR  (48px)
          ══════════════════════════════════════════════════════════ */}
      <div
        className="fixed top-0 left-0 h-screen z-50 flex flex-col items-center"
        style={{
          width:         BAR_W,
          paddingTop:    40,
          paddingBottom: 20,
          opacity:       introComplete ? 1 : 0,
          transform:     visible ? "translateX(0)" : "translateX(-16px)",
          filter:        visible ? "opacity(1)" : "opacity(0)",
          transition:    `transform 0.9s ${EASE.nav}, filter 0.7s ${EASE.nav}, opacity 0.6s ${EASE.nav}`,
          pointerEvents: visible ? "auto" : "none",
        }}
      >
        {/* ── TOP: "TELLIAN" bottom → top ── */}
        <button
          onClick={() => onNavigate(0)}
          style={{ outline: "none", cursor: "pointer", border: "none", background: "transparent", padding: 0 }}
          aria-label="Zurück zum Anfang"
        >
          <span
            style={{
              fontFamily:    sans,
              fontSize:      "15px",
              fontWeight:    700,
              letterSpacing: "4px",
              color:         C.dark,
              textTransform: "uppercase",
              writingMode:   "vertical-rl",
              transform:     "rotate(180deg)",
              display:       "block",
              userSelect:    "none",
            }}
          >
            TELLIAN
          </span>
        </button>

        {/* Spacer pushes hamburger to vertical center */}
        <div style={{ flex: 1 }} />

        {/* ── MIDDLE: Hamburger ── */}
        <button
          onClick={() => setExpanded(!expanded)}
          style={{
            outline:    "none",
            cursor:     "pointer",
            border:     "none",
            background: "transparent",
            padding:    "8px",
            display:    "flex",
            flexDirection: "column",
            alignItems: "center",
            gap:        0,
          }}
          aria-label={expanded ? "Menü schliessen" : "Menü öffnen"}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
            {[0, 1, 2].map((n) => (
              <div
                key={n}
                style={{ width: 20, height: 1.5, backgroundColor: C.dark }}
              />
            ))}
          </div>
        </button>

        {/* Spacer between hamburger and bottom block */}
        <div style={{ flex: 1 }} />

        {/* ── BOTTOM: Language + Login ── */}
        <div
          style={{
            display:       "flex",
            flexDirection: "column",
            alignItems:    "center",
            gap:           "24px",
          }}
        >
          {/* Language selector */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "2px" }}>
            {(["DE", "EN"] as const).map((l) => {
              const isActive = lang === l;
              return (
                <button
                  key={l}
                  onClick={() => setLang(l)}
                  style={{
                    width:           32,
                    height:          20,
                    backgroundColor: isActive ? C.button : "transparent",
                    color:           isActive ? "#ffffff" : "#999",
                    fontFamily:      sans,
                    fontSize:        "10px",
                    fontWeight:      700,
                    letterSpacing:   "0.08em",
                    textTransform:   "uppercase",
                    border:          "none",
                    borderRadius:    0,
                    cursor:          "pointer",
                    display:         "flex",
                    alignItems:      "center",
                    justifyContent:  "center",
                    transition:      `background-color 0.25s ${EASE.nav}, color 0.25s ${EASE.nav}`,
                    outline:         "none",
                  }}
                >
                  {l}
                </button>
              );
            })}
          </div>

          {/* Login */}
          <button
            onMouseEnter={() => setLoginHover(true)}
            onMouseLeave={() => setLoginHover(false)}
            onClick={(e) => {
              (e.currentTarget as HTMLElement).focus();
              onLoginClick();
            }}
            aria-haspopup="dialog"
            style={{
              outline:       "none",
              border:        "none",
              background:    "transparent",
              cursor:        "pointer",
              display:       "flex",
              flexDirection: "column",
              alignItems:    "center",
              gap:           "5px",
              padding:       0,
              transition:    `color 0.25s ${EASE.nav}`,
            }}
          >
            <LockIcon
              size={18}
              color={loginHover ? C.button : C.dark}
              strokeWidth={1.5}
            />
            <span
              style={{
                fontFamily:    sans,
                fontSize:      "9px",
                fontWeight:    600,
                letterSpacing: "1.5px",
                textTransform: "uppercase",
                color:         loginHover ? C.button : C.dark,
                transition:    `color 0.25s ${EASE.nav}`,
                userSelect:    "none",
              }}
            >
              Login
            </span>
          </button>
        </div>
      </div>

      {/* ── Right-edge separator line (collapsed) ── */}
      <div
        className="fixed top-0 left-0 h-screen z-40 pointer-events-none"
        style={{
          width:       BAR_W,
          borderRight: "1px solid #D8D5CF",
          opacity:     introComplete && visible && !expanded ? 0.3 : 0,
          transition:  `opacity 0.9s ${EASE.nav}`,
        }}
      />

      {/* ══════════════════════════════════════════════════════════
          EXPANDED PANEL  (300px)
          ══════════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {expanded && (
          <>
            {/* Dark overlay */}
            <motion.div
              className="fixed inset-0 z-[55]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.45, ease: EASE.navArr }}
              style={{ backgroundColor: "rgba(0,0,0,0.08)" }}
              onClick={() => setExpanded(false)}
            />

            {/* Panel */}
            <motion.div
              className="fixed top-0 left-0 h-screen z-[60] flex flex-col"
              style={{ width: PANEL_W, backgroundColor: C.bgSecondary }}
              initial={{ x: -PANEL_W + BAR_W, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -PANEL_W + BAR_W, opacity: 0 }}
              transition={{ duration: 0.6, ease: EASE.navArr }}
            >
              {/* Header */}
              <div
                style={{
                  display:        "flex",
                  alignItems:     "center",
                  justifyContent: "space-between",
                  padding:        "32px 28px 20px 28px",
                }}
              >
                <button
                  onClick={() => { onNavigate(0); setExpanded(false); }}
                  style={{ outline: "none", border: "none", background: "transparent", cursor: "pointer", padding: 0 }}
                >
                  <span
                    style={{
                      fontFamily:    sans,
                      fontSize:      "12px",
                      letterSpacing: "2px",
                      color:         C.dark,
                      textTransform: "uppercase",
                      userSelect:    "none",
                    }}
                  >
                    <span style={{ fontWeight: 700 }}>TELLIAN</span>
                    {"\u00A0"}
                    <span style={{ fontWeight: 400 }}>CAPITAL</span>
                  </span>
                </button>

                <button
                  onClick={() => setExpanded(false)}
                  style={{ outline: "none", border: "none", background: "transparent", cursor: "pointer", padding: 4, lineHeight: 0 }}
                  aria-label="Menü schliessen"
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <line x1="1.5" y1="1.5" x2="14.5" y2="14.5" stroke={C.dark} strokeWidth="1.25" strokeLinecap="round" />
                    <line x1="14.5" y1="1.5" x2="1.5"  y2="14.5" stroke={C.dark} strokeWidth="1.25" strokeLinecap="round" />
                  </svg>
                </button>
              </div>

              <div style={{ height: "0.5px", backgroundColor: "#ddd" }} />
              <div style={{ height: 24 }} />

              {/* Nav items */}
              <nav style={{ flex: 1, overflowY: "auto", padding: "0 28px" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "28px" }}>
                  {NAV_ITEMS.map((item, i) => {
                    const isActive = activeIndex === i;
                    return (
                      <motion.button
                        key={item.num}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -8 }}
                        transition={{ duration: 0.4, delay: 0.06 + i * 0.04, ease: EASE.navArr }}
                        onClick={() => { onNavigate(item.progress); setExpanded(false); }}
                        style={{
                          outline:       "none",
                          border:        "none",
                          background:    "transparent",
                          cursor:        "pointer",
                          textAlign:     "left",
                          position:      "relative",
                          paddingLeft:   "16px",
                          paddingRight:  0,
                          paddingTop:    0,
                          paddingBottom: 0,
                        }}
                      >
                        <AnimatePresence>
                          {isActive && (
                            <motion.div
                              key="accent"
                              layoutId="nav-accent"
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              exit={{ opacity: 0 }}
                              style={{
                                position:        "absolute",
                                left:            0,
                                top:             "50%",
                                transform:       "translateY(-50%)",
                                width:           2,
                                height:          32,
                                backgroundColor: C.button,
                              }}
                              transition={{ duration: 0.35, ease: EASE.navArr }}
                            />
                          )}
                        </AnimatePresence>

                        <span
                          style={{
                            fontFamily:   sans,
                            fontSize:     "11px",
                            color:        isActive ? C.button : "#bbb",
                            display:      "block",
                            marginBottom: "3px",
                            transition:   `color 0.35s ${EASE.nav}`,
                          }}
                        >
                          {item.num}
                        </span>
                        <span
                          style={{
                            fontFamily: serif,
                            fontSize:   "16px",
                            color:      C.dark,
                            display:    "block",
                            lineHeight: 1.2,
                          }}
                        >
                          {item.label}
                        </span>
                        <span
                          style={{
                            fontFamily: sans,
                            fontSize:   "12px",
                            color:      "#999",
                            display:    "block",
                            marginTop:  "3px",
                          }}
                        >
                          {item.sub}
                        </span>
                      </motion.button>
                    );
                  })}
                </div>
              </nav>

              {/* Bottom section */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.38, duration: 0.5 }}
                style={{ padding: "0 28px 28px 28px" }}
              >
                <div style={{ height: 24 }} />
                <div style={{ height: "0.5px", backgroundColor: "#ddd" }} />
                <div style={{ height: 24 }} />

                <div
                  style={{
                    display:        "flex",
                    alignItems:     "flex-start",
                    justifyContent: "space-between",
                    gap:            "12px",
                  }}
                >
                  {/* Language */}
                  <div style={{ display: "flex", alignItems: "center", gap: "6px", paddingTop: "14px" }}>
                    {(["DE", "EN"] as const).map((l, idx) => (
                      <React.Fragment key={l}>
                        {idx > 0 && (
                          <span style={{ color: "#ddd", fontSize: "11px", fontFamily: sans, userSelect: "none" }}>/</span>
                        )}
                        <button
                          onClick={() => setLang(l)}
                          style={{
                            outline: "none", border: "none", background: "transparent", cursor: "pointer",
                            fontFamily: sans, fontSize: "11px", fontWeight: 700, letterSpacing: "0.08em",
                            textTransform: "uppercase", color: lang === l ? C.dark : "#bbb", padding: 0,
                            transition: `color 0.25s ${EASE.nav}`,
                          }}
                        >
                          {l}
                        </button>
                      </React.Fragment>
                    ))}
                  </div>

                  {/* Kundenportal */}
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end" }}>
                    <button
                      onMouseEnter={() => setPortalHover(true)}
                      onMouseLeave={() => setPortalHover(false)}
                      style={{
                        display: "flex", alignItems: "center", gap: "8px",
                        backgroundColor: portalHover ? C.buttonHover : C.button, color: C.dark,
                        fontFamily: sans, fontSize: "11px", fontWeight: 700, letterSpacing: "1.5px",
                        textTransform: "uppercase", padding: "12px 20px", border: "none",
                        borderRadius: 0, cursor: "pointer",
                        transition: `background-color 0.25s ${EASE.nav}`, outline: "none", whiteSpace: "nowrap",
                      }}
                    >
                      <LockIcon size={14} color={C.bgSecondary} strokeWidth={1.5} />
                      Kundenportal
                    </button>
                    <span
                      style={{
                        fontFamily: sans, fontSize: "10px", color: "#999",
                        marginTop: "6px", textAlign: "right", userSelect: "none",
                      }}
                    >
                      Zugang für bestehende Kunden
                    </span>
                  </div>
                </div>

                {/* LinkedIn */}
                <div style={{ marginTop: "16px" }}>
                  <button
                    onMouseEnter={() => setLiHover(true)}
                    onMouseLeave={() => setLiHover(false)}
                    style={{
                      outline: "none", border: "none", background: "transparent",
                      cursor: "pointer", padding: 0, lineHeight: 0,
                      transition: `opacity 0.2s`,
                    }}
                    aria-label="LinkedIn"
                  >
                    <LinkedInIcon color={liHover ? C.dark : "#999"} />
                  </button>
                </div>
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
