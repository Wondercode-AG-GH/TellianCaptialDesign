import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import React from "react";
import type { Breakpoint } from "./useBreakpoint";
import { C, serif, sans } from "../tokens";
import tellianLogo from "../../assets/Tellian-logo.png";
import { EASE } from "../../styles/motion";

const BAR_W   = 48;
const PANEL_W = 300;

function TellianWordmark({ width = "120px" }: { width?: string }) {
  return (
    <svg viewBox="170 220 580 100" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Tellian" style={{ width, height: "auto", display: "block" }}>
      <path fill="#441f2a" d="M188.23,231.7h10.67c1.89,0,2.76.91,2.76,2.87v67.75c0,1.34-.49,2.37-1.5,3.14-1.04.79-2.33,1.27-3.83,1.42l-4.68.24c-1.25,0-1.94.7-1.94,1.96,0,.6.24,1.1.71,1.5.45.39.95.58,1.49.58h0l15.72-.48,14.36.48c.53,0,1.03-.2,1.48-.58.47-.4.71-.9.71-1.5,0-1.26-.69-1.96-1.91-1.96h0l-3.67-.24c-1.52-.15-2.82-.63-3.85-1.43-1.01-.77-1.5-1.8-1.5-3.14v-67.75c0-1.96.88-2.87,2.76-2.87h10.67c3.93,0,7.06,1.02,9.31,3.03,2.27,2.04,4.18,5.2,5.68,9.4.58,1.37,1.41,2.06,2.48,2.06,1,0,1.76-.24,2.26-.72.51-.49.72-1.13.63-1.88l-1.27-14.98c-.24-2.69-1.94-3.25-3.33-3.25h-70.36c-1.9,0-3.01.92-3.2,2.66l-1.01,15.55c-.1.68.1,1.29.61,1.83.51.52,1.27.79,2.27.79,1.07,0,1.9-.69,2.49-2.09,1.33-4.11,3.17-7.24,5.48-9.31,2.28-2.05,5.48-3.09,9.49-3.09Z" />
      <path fill="#441f2a" d="M322.08,310.69c1.62,0,3.02-.5,4.15-1.49,1.13-.98,1.79-2.22,1.97-3.67l2.03-12.57c.1-.68-.08-1.28-.54-1.81-.46-.54-1.25-.81-2.35-.81-1.17,0-2.01.74-2.49,2.21-1.23,3.83-3.42,6.79-6.51,8.79-3.09,2-6.84,3.01-11.13,3.01h-20.95c-1.77,0-3.15-.46-4.23-1.41-1.06-.94-1.58-2.17-1.58-3.76v-28.02c0-1.14.56-1.3,1.11-1.3h23.75c2.5,0,4.07,1.95,4.8,5.95l.38,2.17c.2,1.14.97,1.78,2.23,1.78h.01c1.31-.19,2-.95,2-2.22l-.51-9.74.51-10.29c0-1.81-1.21-2.08-1.94-2.08-1.21,0-2,.6-2.29,1.73l-.51,1.57c-.42,1.26-.73,2.15-.94,2.63-.19.43-.6.91-1.22,1.42-.6.51-1.43.75-2.52.75h-23.62c-.87,0-1.24-.35-1.24-1.18v-25.36c0-1.65.53-2.96,1.58-3.88,1.08-.95,2.46-1.41,4.23-1.41h19.94c4.38,0,7.85.79,10.31,2.35,2.45,1.55,4.32,4.24,5.55,8,.47,1.45,1.55,2.21,3.12,2.21.79,0,1.38-.21,1.77-.62.42-.45.58-1.11.48-2l-1.78-11.1c-.18-1.45-.82-2.69-1.9-3.68-1.09-.99-2.51-1.49-4.22-1.49h-45.07l-14.36-.48c-1.41,0-2.19.72-2.19,2.02,0,1.75,1.12,2.02,1.76,2.02h0l3.69.37c3.68.3,5.47,1.75,5.47,4.44v68.6c0,1.34-.49,2.36-1.5,3.14-1.03.79-2.37,1.27-3.96,1.42l-3.65.24c-.68,0-1.81.26-1.81,2.02,0,1.31.78,2.02,2.2,2.02l14.33-.48h47.62Z" />
      <path fill="#441f2a" d="M413.81,309.2c1.08-.99,1.72-2.22,1.9-3.67l2.04-12.58c.1-.88-.06-1.55-.48-2-.38-.4-.96-.61-1.71-.61-1.52,0-2.58.77-3.06,2.22-1.15,3.83-3.32,6.79-6.44,8.78-3.13,2-6.95,3.01-11.33,3.01h-18.41c-1.77,0-3.16-.46-4.23-1.41-1.06-.94-1.58-2.17-1.58-3.76v-65.46c0-2.46,1.55-3.92,4.74-4.45l2.12-.36c1.31-.1,2.03-.88,2.03-2.2,0-.69-.3-1.84-2.33-1.84l-12.54.48-14.36-.48c-1.41,0-2.19.74-2.19,2.08,0,1.09.6,1.76,1.76,1.96l3.69.37c3.68.3,5.47,1.75,5.47,4.44v68.6c0,1.34-.49,2.36-1.5,3.14-1.03.79-2.37,1.27-3.96,1.42l-3.65.24c-.68,0-1.81.26-1.81,2.02,0,1.31.78,2.02,2.2,2.02l14.33-.48h45.09c1.71,0,3.13-.5,4.22-1.49Z" />
      <path fill="#441f2a" d="M503.36,292.95c.1-.88-.06-1.56-.48-2-.38-.4-.95-.61-1.71-.61-1.52,0-2.58.77-3.06,2.22-1.15,3.83-3.32,6.79-6.43,8.78-3.13,2-6.95,3.01-11.33,3.01h-18.41c-1.77,0-3.15-.46-4.23-1.41-1.06-.94-1.58-2.17-1.58-3.76v-65.46c0-2.46,1.55-3.92,4.74-4.45l2.12-.36c1.31-.1,2.03-.88,2.03-2.2,0-.69-.3-1.84-2.33-1.84l-12.54.48-14.36-.48c-1.41,0-2.19.74-2.19,2.08,0,1.09.6,1.76,1.77,1.96l3.69.37c3.68.3,5.47,1.75,5.47,4.44v68.6c0,1.34-.49,2.36-1.5,3.14-1.03.79-2.37,1.27-3.96,1.42l-3.65.24c-.68,0-1.81.26-1.81,2.02,0,1.31.78,2.02,2.2,2.02l14.34-.48h45.08c1.71,0,3.13-.5,4.22-1.49,1.08-.99,1.72-2.22,1.9-3.67l2.04-12.58Z" />
      <path fill="#441f2a" d="M519.69,228.92l3.69.37c3.68.3,5.47,1.75,5.47,4.44v68.6c0,2.69-1.59,4.19-4.85,4.57l-2.19.24c-.79.14-1.73.62-1.73,2.14,0,1.23.78,1.9,2.19,1.9h.02l12.54-.48,14.37.48c.53,0,1.02-.2,1.47-.58.47-.4.71-.9.71-1.5,0-1.26-.69-1.96-1.9-1.96h0l-3.67-.24c-1.52-.15-2.82-.63-3.85-1.43-1.01-.77-1.5-1.8-1.5-3.14v-68.6c0-2.46,1.55-3.92,4.74-4.45l2.12-.36c1.31-.1,2.03-.88,2.03-2.2,0-.69-.3-1.84-2.33-1.84l-12.54.48-14.36-.48c-1.41,0-2.19.74-2.19,2.08,0,1.09.6,1.76,1.76,1.96Z" />
      <path fill="#441f2a" d="M564.86,311.18h0l11.52-.48,11.07.48c1.49,0,2.32-.74,2.32-2.08,0-.76-.35-1.71-2.03-1.96l-2.8-.24c-1.08-.07-1.9-.44-2.51-1.13-.61-.69-.92-1.3-.92-1.8,0-.56.08-1.06.23-1.5l7.49-18.46c.28-.66.8-.96,1.65-.96h32.89c1.21,0,1.51.53,1.65.95l7.51,18.51c.22.43.34.94.34,1.52,0,.54-.33,1.14-.97,1.78-.65.65-1.48,1.02-2.47,1.09l-2.92.24c-1.23.1-1.9.88-1.9,2.2,0,.69.29,1.84,2.2,1.84l13.05-.48,14.61.48c1.41,0,2.19-.78,2.19-2.2,0-.41-.16-.81-.46-1.2-.42-.52-.89-.63-1.17-.63h0l-2.67-.24c-3.59-.31-5.84-1.85-6.9-4.71l-32.51-76.45c-.49-1.12-1.67-1.69-3.49-1.69s-2.97.58-3.37,1.7l-32.63,76.45c-1.22,2.78-3.52,4.32-7.03,4.72l-2.37.24c-.68,0-1.81.26-1.81,2.02,0,1.3.78,2.02,2.2,2.02ZM592.52,276.54c-.07-.09-.07-.29,0-.52l14.73-36.26,14.72,36c.13.37.15.66.05.78-.07.1-.27.15-.55.15h-28.32c-.32,0-.56-.06-.63-.16Z" />
      <path fill="#441f2a" d="M693.78,309.22c0-.81-.35-1.83-1.99-2.08l-2.16-.36c-3.19-.53-4.74-1.98-4.74-4.45v-57.73c0-.63.11-.8.1-.82.22,0,.38.04.43.09l53.46,65.09c1.6,2.03,3.55,3.05,5.79,3.05h1.65c1.17,0,1.81-.66,1.81-1.84v-76.45c0-2.46,1.55-3.92,4.74-4.45l2.15-.36c1.65-.24,2-1.27,2-2.08,0-.69-.3-1.84-2.33-1.84l-9.88.36-12.33-.36c-1.9,0-2.19,1.15-2.19,1.84,0,1.17.6,1.88,1.77,2.08l3.68.36c3.6.38,5.35,1.83,5.35,4.44v58.58c0,.27-.06.33-.1.33-.23,0-.42-.08-.56-.21l-52.97-64.63c-1.34-1.53-3.32-2.35-5.88-2.43l-10.18-.36c-2.02,0-2.32,1.19-2.32,1.9,0,1.2.64,1.94,1.89,2.14l2.28.24c3.18.38,4.72,1.83,4.72,4.44v68.6c0,2.61-1.79,4.06-5.48,4.44l-3.71.37c-1.13.2-1.73.92-1.73,2.08,0,.69.28,1.84,2.2,1.84l12.29-.36,9.92.36c2.01,0,2.31-1.15,2.31-1.84Z" />
    </svg>
  );
}

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
              <TellianWordmark width="100px" />
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
                  <TellianWordmark width="100px" />
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
        {/* ── TOP: Tellian logo SVG, vertical ── */}
        <button
          onClick={() => onNavigate(0)}
          style={{ outline: "none", cursor: "pointer", border: "none", background: "transparent", padding: 0 }}
          aria-label="Zurück zum Anfang"
        >
          {/* Wrapper has post-rotation dimensions so layout is correct.
              SVG is absolutely centered and rotated inside. */}
          <div style={{ width: "16px", height: "14vh", position: "relative" }}>
            <svg
              viewBox="170 220 580 100"
              xmlns="http://www.w3.org/2000/svg"
              role="img"
              aria-label="Tellian"
              style={{
                width: "14vh",
                height: "auto",
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%) rotate(-90deg)",
              }}
            >
            <path fill="#441f2a" d="M188.23,231.7h10.67c1.89,0,2.76.91,2.76,2.87v67.75c0,1.34-.49,2.37-1.5,3.14-1.04.79-2.33,1.27-3.83,1.42l-4.68.24c-1.25,0-1.94.7-1.94,1.96,0,.6.24,1.1.71,1.5.45.39.95.58,1.49.58h0l15.72-.48,14.36.48c.53,0,1.03-.2,1.48-.58.47-.4.71-.9.71-1.5,0-1.26-.69-1.96-1.91-1.96h0l-3.67-.24c-1.52-.15-2.82-.63-3.85-1.43-1.01-.77-1.5-1.8-1.5-3.14v-67.75c0-1.96.88-2.87,2.76-2.87h10.67c3.93,0,7.06,1.02,9.31,3.03,2.27,2.04,4.18,5.2,5.68,9.4.58,1.37,1.41,2.06,2.48,2.06,1,0,1.76-.24,2.26-.72.51-.49.72-1.13.63-1.88l-1.27-14.98c-.24-2.69-1.94-3.25-3.33-3.25h-70.36c-1.9,0-3.01.92-3.2,2.66l-1.01,15.55c-.1.68.1,1.29.61,1.83.51.52,1.27.79,2.27.79,1.07,0,1.9-.69,2.49-2.09,1.33-4.11,3.17-7.24,5.48-9.31,2.28-2.05,5.48-3.09,9.49-3.09Z" />
            <path fill="#441f2a" d="M322.08,310.69c1.62,0,3.02-.5,4.15-1.49,1.13-.98,1.79-2.22,1.97-3.67l2.03-12.57c.1-.68-.08-1.28-.54-1.81-.46-.54-1.25-.81-2.35-.81-1.17,0-2.01.74-2.49,2.21-1.23,3.83-3.42,6.79-6.51,8.79-3.09,2-6.84,3.01-11.13,3.01h-20.95c-1.77,0-3.15-.46-4.23-1.41-1.06-.94-1.58-2.17-1.58-3.76v-28.02c0-1.14.56-1.3,1.11-1.3h23.75c2.5,0,4.07,1.95,4.8,5.95l.38,2.17c.2,1.14.97,1.78,2.23,1.78h.01c1.31-.19,2-.95,2-2.22l-.51-9.74.51-10.29c0-1.81-1.21-2.08-1.94-2.08-1.21,0-2,.6-2.29,1.73l-.51,1.57c-.42,1.26-.73,2.15-.94,2.63-.19.43-.6.91-1.22,1.42-.6.51-1.43.75-2.52.75h-23.62c-.87,0-1.24-.35-1.24-1.18v-25.36c0-1.65.53-2.96,1.58-3.88,1.08-.95,2.46-1.41,4.23-1.41h19.94c4.38,0,7.85.79,10.31,2.35,2.45,1.55,4.32,4.24,5.55,8,.47,1.45,1.55,2.21,3.12,2.21.79,0,1.38-.21,1.77-.62.42-.45.58-1.11.48-2l-1.78-11.1c-.18-1.45-.82-2.69-1.9-3.68-1.09-.99-2.51-1.49-4.22-1.49h-45.07l-14.36-.48c-1.41,0-2.19.72-2.19,2.02,0,1.75,1.12,2.02,1.76,2.02h0l3.69.37c3.68.3,5.47,1.75,5.47,4.44v68.6c0,1.34-.49,2.36-1.5,3.14-1.03.79-2.37,1.27-3.96,1.42l-3.65.24c-.68,0-1.81.26-1.81,2.02,0,1.31.78,2.02,2.2,2.02l14.33-.48h47.62Z" />
            <path fill="#441f2a" d="M413.81,309.2c1.08-.99,1.72-2.22,1.9-3.67l2.04-12.58c.1-.88-.06-1.55-.48-2-.38-.4-.96-.61-1.71-.61-1.52,0-2.58.77-3.06,2.22-1.15,3.83-3.32,6.79-6.44,8.78-3.13,2-6.95,3.01-11.33,3.01h-18.41c-1.77,0-3.16-.46-4.23-1.41-1.06-.94-1.58-2.17-1.58-3.76v-65.46c0-2.46,1.55-3.92,4.74-4.45l2.12-.36c1.31-.1,2.03-.88,2.03-2.2,0-.69-.3-1.84-2.33-1.84l-12.54.48-14.36-.48c-1.41,0-2.19.74-2.19,2.08,0,1.09.6,1.76,1.76,1.96l3.69.37c3.68.3,5.47,1.75,5.47,4.44v68.6c0,1.34-.49,2.36-1.5,3.14-1.03.79-2.37,1.27-3.96,1.42l-3.65.24c-.68,0-1.81.26-1.81,2.02,0,1.31.78,2.02,2.2,2.02l14.33-.48h45.09c1.71,0,3.13-.5,4.22-1.49Z" />
            <path fill="#441f2a" d="M503.36,292.95c.1-.88-.06-1.56-.48-2-.38-.4-.95-.61-1.71-.61-1.52,0-2.58.77-3.06,2.22-1.15,3.83-3.32,6.79-6.43,8.78-3.13,2-6.95,3.01-11.33,3.01h-18.41c-1.77,0-3.15-.46-4.23-1.41-1.06-.94-1.58-2.17-1.58-3.76v-65.46c0-2.46,1.55-3.92,4.74-4.45l2.12-.36c1.31-.1,2.03-.88,2.03-2.2,0-.69-.3-1.84-2.33-1.84l-12.54.48-14.36-.48c-1.41,0-2.19.74-2.19,2.08,0,1.09.6,1.76,1.77,1.96l3.69.37c3.68.3,5.47,1.75,5.47,4.44v68.6c0,1.34-.49,2.36-1.5,3.14-1.03.79-2.37,1.27-3.96,1.42l-3.65.24c-.68,0-1.81.26-1.81,2.02,0,1.31.78,2.02,2.2,2.02l14.34-.48h45.08c1.71,0,3.13-.5,4.22-1.49,1.08-.99,1.72-2.22,1.9-3.67l2.04-12.58Z" />
            <path fill="#441f2a" d="M519.69,228.92l3.69.37c3.68.3,5.47,1.75,5.47,4.44v68.6c0,2.69-1.59,4.19-4.85,4.57l-2.19.24c-.79.14-1.73.62-1.73,2.14,0,1.23.78,1.9,2.19,1.9h.02l12.54-.48,14.37.48c.53,0,1.02-.2,1.47-.58.47-.4.71-.9.71-1.5,0-1.26-.69-1.96-1.9-1.96h0l-3.67-.24c-1.52-.15-2.82-.63-3.85-1.43-1.01-.77-1.5-1.8-1.5-3.14v-68.6c0-2.46,1.55-3.92,4.74-4.45l2.12-.36c1.31-.1,2.03-.88,2.03-2.2,0-.69-.3-1.84-2.33-1.84l-12.54.48-14.36-.48c-1.41,0-2.19.74-2.19,2.08,0,1.09.6,1.76,1.76,1.96Z" />
            <path fill="#441f2a" d="M564.86,311.18h0l11.52-.48,11.07.48c1.49,0,2.32-.74,2.32-2.08,0-.76-.35-1.71-2.03-1.96l-2.8-.24c-1.08-.07-1.9-.44-2.51-1.13-.61-.69-.92-1.3-.92-1.8,0-.56.08-1.06.23-1.5l7.49-18.46c.28-.66.8-.96,1.65-.96h32.89c1.21,0,1.51.53,1.65.95l7.51,18.51c.22.43.34.94.34,1.52,0,.54-.33,1.14-.97,1.78-.65.65-1.48,1.02-2.47,1.09l-2.92.24c-1.23.1-1.9.88-1.9,2.2,0,.69.29,1.84,2.2,1.84l13.05-.48,14.61.48c1.41,0,2.19-.78,2.19-2.2,0-.41-.16-.81-.46-1.2-.42-.52-.89-.63-1.17-.63h0l-2.67-.24c-3.59-.31-5.84-1.85-6.9-4.71l-32.51-76.45c-.49-1.12-1.67-1.69-3.49-1.69s-2.97.58-3.37,1.7l-32.63,76.45c-1.22,2.78-3.52,4.32-7.03,4.72l-2.37.24c-.68,0-1.81.26-1.81,2.02,0,1.3.78,2.02,2.2,2.02ZM592.52,276.54c-.07-.09-.07-.29,0-.52l14.73-36.26,14.72,36c.13.37.15.66.05.78-.07.1-.27.15-.55.15h-28.32c-.32,0-.56-.06-.63-.16Z" />
            <path fill="#441f2a" d="M693.78,309.22c0-.81-.35-1.83-1.99-2.08l-2.16-.36c-3.19-.53-4.74-1.98-4.74-4.45v-57.73c0-.63.11-.8.1-.82.22,0,.38.04.43.09l53.46,65.09c1.6,2.03,3.55,3.05,5.79,3.05h1.65c1.17,0,1.81-.66,1.81-1.84v-76.45c0-2.46,1.55-3.92,4.74-4.45l2.15-.36c1.65-.24,2-1.27,2-2.08,0-.69-.3-1.84-2.33-1.84l-9.88.36-12.33-.36c-1.9,0-2.19,1.15-2.19,1.84,0,1.17.6,1.88,1.77,2.08l3.68.36c3.6.38,5.35,1.83,5.35,4.44v58.58c0,.27-.06.33-.1.33-.23,0-.42-.08-.56-.21l-52.97-64.63c-1.34-1.53-3.32-2.35-5.88-2.43l-10.18-.36c-2.02,0-2.32,1.19-2.32,1.9,0,1.2.64,1.94,1.89,2.14l2.28.24c3.18.38,4.72,1.83,4.72,4.44v68.6c0,2.61-1.79,4.06-5.48,4.44l-3.71.37c-1.13.2-1.73.92-1.73,2.08,0,.69.28,1.84,2.2,1.84l12.29-.36,9.92.36c2.01,0,2.31-1.15,2.31-1.84Z" />
          </svg>
          </div>
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
                  >
                    <TellianWordmark width="120px" />
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
