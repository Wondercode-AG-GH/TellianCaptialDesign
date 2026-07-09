import { useState, useEffect, useRef } from "react";
import { C, serif, sans } from "../tokens";
import { EASE } from "../../styles/motion";
import { useLanguage } from "../context/LanguageContext";
import type { Locale } from "../content";

/* Logo: Solutions-SVG pending — Platzhalter. Ein-Zeilen-Tausch später. */
import logoHorizontal from "../../assets/logo/Tellian__Imperial purple logo.svg";

const BAR_W = 48;
const PANEL_W = 300;
const LOCALES: Locale[] = ["de", "en", "fr"];

const NAV_ITEMS = [
  { num: "01", label: "Start",            sub: "Einführung",           target: 0.000 },
  { num: "02", label: "Dienstleistungen", sub: "Was wir tun",         target: 0.333 },
  { num: "03", label: "Team",             sub: "Wer dahinter steht",  target: 0.667 },
  { num: "04", label: "Kontakt",          sub: "Gespräch vereinbaren", target: 1.000 },
];

function getActiveIndex(progress: number): number {
  const thresholds = [0, 0.17, 0.50, 0.83];
  let active = 0;
  for (let i = 1; i < thresholds.length; i++) {
    if (progress >= thresholds[i]) active = i;
  }
  return active;
}

/* ═══════ ICONS ═══════ */

function ExternalLinkIcon({ size = 16, color = C.dark }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
      <polyline points="15 3 21 3 21 9" />
      <line x1="10" y1="14" x2="21" y2="3" />
    </svg>
  );
}

/* ═══════ PROPS ═══════ */

interface NavigationProps {
  scrollProgress: number;
  scrollDirection: "forward" | "backward" | "idle";
  onNavigate: (target: number) => void;
  introComplete: boolean;
}

/* ═══════════════════════════════════════════════════════════════
   NAVIGATION — Left sidebar, mirrors the main site exactly.
   Collapsed: 48px vertical bar (wordmark, hamburger, lang, link).
   Expanded: 300px panel with numbered section list.
   ══════════════════════════════════════════════════════════════ */
export function Navigation({
  scrollProgress,
  scrollDirection,
  onNavigate,
  introComplete,
}: NavigationProps) {
  const [expanded, setExpanded] = useState(false);
  const [visible, setVisible] = useState(true);
  const { lang, setLang } = useLanguage();
  const [linkHover, setLinkHover] = useState(false);
  const activeIndex = getActiveIndex(scrollProgress);
  const hideTimer = useRef<number>(0);

  /* Show/hide bar based on scroll direction */
  useEffect(() => {
    if (!introComplete || expanded) return;
    if (scrollDirection === "backward") {
      clearTimeout(hideTimer.current);
      setVisible(true);
    } else if (scrollDirection === "forward") {
      clearTimeout(hideTimer.current);
      hideTimer.current = window.setTimeout(() => setVisible(false), 120);
    }
    return () => clearTimeout(hideTimer.current);
  }, [scrollDirection, introComplete, expanded]);

  useEffect(() => {
    if (scrollProgress < 0.01) setVisible(true);
  }, [scrollProgress]);

  useEffect(() => {
    if (scrollDirection === "forward" && expanded) setExpanded(false);
  }, [scrollDirection, expanded]);

  const handleNavigate = (index: number) => {
    onNavigate(NAV_ITEMS[index].target);
    setExpanded(false);
  };

  return (
    <>
      {/* ══════════════════════════════════════════════════════════
          COLLAPSED VERTICAL BAR (48px)
          ══════════════════════════════════════════════════════════ */}
      <div
        className="fixed top-0 left-0 h-screen z-50 flex flex-col items-center"
        style={{
          width: BAR_W,
          paddingTop: 40,
          paddingBottom: 20,
          opacity: introComplete ? 1 : 0,
          transform: visible ? "translateX(0)" : "translateX(-16px)",
          filter: visible ? "opacity(1)" : "opacity(0)",
          transition: `transform 0.9s ${EASE.nav}, filter 0.7s ${EASE.nav}, opacity 0.6s ${EASE.nav}`,
          pointerEvents: visible ? "auto" : "none",
        }}
      >
        {/* TOP: Wordmark rotated -90° */}
        <button
          onClick={() => onNavigate(0)}
          style={{
            outline: "none", cursor: "pointer", border: "none", background: "transparent", padding: 0,
            position: "relative", width: BAR_W, height: 140, flexShrink: 0,
          }}
          aria-label="Zurück zum Anfang"
        >
          <div style={{
            position: "absolute", top: "50%", left: "50%",
            transform: "translate(-50%, -50%) rotate(-90deg)",
            lineHeight: 0,
          }}>
            {/* Inline TELLIAN wordmark SVG — same as main site */}
            <svg viewBox="96 126 370 78" width={140} height={32} xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Tellian" style={{ display: "block" }}>
              <path fill="#2a1f34" d="M106.58,142.6h6.59c1.17,0,1.71.59,1.71,1.87v44.03c0,.87-.3,1.54-.92,2.04-.64.52-1.44.83-2.37.93l-2.89.16c-.77,0-1.2.45-1.2,1.27,0,.39.15.72.44.97.28.25.59.38.92.38h0l9.72-.31,8.88.31c.33,0,.63-.13.91-.38.29-.26.44-.59.44-.97,0-.82-.43-1.27-1.18-1.27h0l-2.27-.15c-.94-.1-1.74-.41-2.38-.93-.62-.5-.93-1.17-.93-2.04v-44.03c0-1.27.54-1.87,1.71-1.87h6.59c2.43,0,4.36.66,5.75,1.97,1.4,1.33,2.58,3.38,3.51,6.11.36.89.87,1.34,1.53,1.34.62,0,1.09-.16,1.4-.47.32-.32.45-.73.39-1.22l-.79-9.74c-.15-1.75-1.2-2.12-2.06-2.12h-43.49c-1.18,0-1.86.59-1.98,1.73l-.63,10.11c-.06.44.06.84.38,1.19.31.34.79.51,1.4.51.66,0,1.18-.45,1.54-1.36.82-2.67,1.96-4.71,3.39-6.05,1.41-1.33,3.39-2.01,5.87-2.01Z"/>
              <path fill="#2a1f34" d="M189.31,193.93c1,0,1.87-.33,2.57-.97.7-.64,1.11-1.45,1.22-2.39l1.26-8.17c.06-.44-.05-.83-.33-1.18-.29-.35-.77-.53-1.45-.53-.72,0-1.24.48-1.54,1.44-.76,2.49-2.12,4.41-4.02,5.71-1.91,1.3-4.23,1.96-6.88,1.96h-12.95c-1.09,0-1.95-.3-2.61-.91-.66-.61-.98-1.41-.98-2.44v-18.21c0-.74.35-.84.69-.84h14.68c1.55,0,2.52,1.26,2.97,3.87l.23,1.41c.12.74.6,1.15,1.38,1.15h0c.81-.12,1.23-.62,1.23-1.44l-.31-6.33.31-6.69c0-1.18-.75-1.35-1.2-1.35-.75,0-1.24.39-1.42,1.12l-.31,1.02c-.26.82-.45,1.4-.58,1.71-.12.28-.37.59-.76.93-.37.33-.88.49-1.56.49h-14.6c-.54,0-.77-.23-.77-.77v-16.48c0-1.07.33-1.92.98-2.52.67-.61,1.52-.91,2.61-.91h12.32c2.71,0,4.85.52,6.37,1.53,1.51,1.01,2.67,2.76,3.43,5.2.29.94.96,1.44,1.93,1.44.49,0,.85-.14,1.09-.4.26-.29.36-.72.29-1.3l-1.1-7.21c-.11-.95-.51-1.75-1.18-2.39-.67-.64-1.55-.97-2.61-.97h-27.86l-8.88-.32c-.87,0-1.35.47-1.35,1.31,0,1.14.69,1.31,1.09,1.31h0l2.28.24c2.27.2,3.38,1.14,3.38,2.89v44.58c0,.87-.3,1.54-.93,2.04-.64.52-1.46.83-2.45.93l-2.26.16c-.42,0-1.12.17-1.12,1.31,0,.85.48,1.31,1.36,1.31l8.86-.31h29.44Z"/>
              <path fill="#2a1f34" d="M246.01,192.96c.67-.64,1.06-1.45,1.17-2.38l1.26-8.17c.06-.57-.04-1.01-.3-1.3-.23-.26-.59-.39-1.06-.39-.94,0-1.59.5-1.89,1.44-.71,2.49-2.05,4.41-3.98,5.71-1.94,1.3-4.29,1.96-7,1.96h-11.38c-1.09,0-1.95-.3-2.62-.91-.66-.61-.98-1.41-.98-2.44v-42.54c0-1.6.96-2.55,2.93-2.89l1.31-.23c.81-.07,1.25-.57,1.25-1.43,0-.45-.19-1.2-1.44-1.2l-7.75.32-8.88-.32c-.87,0-1.35.48-1.35,1.35,0,.71.37,1.15,1.09,1.27l2.28.24c2.28.2,3.38,1.14,3.38,2.89v44.58c0,.87-.3,1.54-.93,2.04-.64.52-1.46.83-2.45.93l-2.26.16c-.42,0-1.12.17-1.12,1.31,0,.85.48,1.31,1.36,1.31l8.86-.31h27.87c1.06,0,1.93-.33,2.61-.97Z"/>
              <path fill="#2a1f34" d="M301.36,182.4c.06-.57-.04-1.01-.3-1.3-.23-.26-.59-.39-1.06-.39-.94,0-1.59.5-1.89,1.44-.71,2.49-2.05,4.41-3.98,5.71-1.94,1.3-4.29,1.96-7,1.96h-11.38c-1.09,0-1.95-.3-2.61-.91-.66-.61-.98-1.41-.98-2.44v-42.54c0-1.6.96-2.55,2.93-2.89l1.31-.23c.81-.07,1.25-.57,1.25-1.43,0-.45-.19-1.2-1.44-1.2l-7.75.32-8.88-.32c-.87,0-1.35.48-1.35,1.35,0,.71.37,1.15,1.09,1.27l2.28.24c2.27.2,3.38,1.14,3.38,2.89v44.58c0,.87-.3,1.54-.93,2.04-.64.52-1.46.83-2.45.93l-2.26.16c-.42,0-1.12.17-1.12,1.31,0,.85.48,1.31,1.36,1.31l8.86-.31h27.87c1.06,0,1.93-.33,2.61-.97.67-.64,1.06-1.45,1.17-2.38l1.26-8.17Z"/>
              <path fill="#2a1f34" d="M311.45,140.79l2.28.24c2.28.2,3.38,1.14,3.38,2.89v44.58c0,1.75-.98,2.72-3,2.97l-1.35.16c-.49.09-1.07.4-1.07,1.39,0,.8.48,1.23,1.35,1.23h0l7.75-.31,8.88.31c.33,0,.63-.13.91-.38.29-.26.44-.59.44-.98,0-.82-.42-1.27-1.18-1.27h0l-2.27-.15c-.94-.1-1.74-.41-2.38-.93-.62-.5-.93-1.17-.93-2.04v-44.58c0-1.6.96-2.55,2.93-2.89l1.31-.23c.81-.07,1.25-.57,1.25-1.43,0-.45-.19-1.2-1.44-1.2l-7.75.32-8.88-.32c-.87,0-1.35.48-1.35,1.35,0,.71.37,1.15,1.09,1.27Z"/>
              <path fill="#2a1f34" d="M339.37,194.25h0l7.12-.31,6.84.31c.92,0,1.43-.48,1.43-1.35,0-.49-.22-1.11-1.25-1.27l-1.73-.16c-.67-.05-1.18-.29-1.55-.73-.38-.45-.57-.84-.57-1.17,0-.36.05-.69.14-.98l4.63-12c.17-.43.49-.62,1.02-.62h20.33c.75,0,.93.34,1.02.62l4.64,12.03c.14.28.21.61.21.99,0,.35-.2.74-.6,1.16-.4.42-.91.66-1.52.71l-1.81.16c-.76.07-1.18.57-1.18,1.43,0,.45.18,1.2,1.36,1.2l8.07-.31,9.03.31c.87,0,1.35-.51,1.35-1.43,0-.27-.1-.53-.29-.78-.26-.34-.55-.41-.72-.41h0l-1.65-.16c-2.22-.2-3.61-1.2-4.26-3.06l-20.1-49.69c-.3-.73-1.03-1.1-2.16-1.1s-1.84.38-2.08,1.1l-20.17,49.68c-.75,1.81-2.18,2.81-4.35,3.06l-1.46.15c-.42,0-1.12.17-1.12,1.31,0,.85.48,1.31,1.36,1.31ZM356.47,171.73c-.04-.06-.04-.19,0-.34l9.1-23.56,9.1,23.4c.08.24.09.43.03.51-.05.06-.17.1-.34.1h-17.51c-.2,0-.34-.04-.39-.1Z"/>
              <path fill="#2a1f34" d="M419.05,192.97c0-.53-.21-1.19-1.23-1.35l-1.33-.24c-1.97-.34-2.93-1.29-2.93-2.89v-37.52c0-.41.07-.52.06-.53.13,0,.23.03.27.06l33.04,42.31c.99,1.32,2.19,1.98,3.58,1.98h1.02c.72,0,1.12-.43,1.12-1.2v-49.69c0-1.6.96-2.55,2.93-2.89l1.33-.24c1.02-.16,1.23-.82,1.23-1.35,0-.45-.19-1.19-1.44-1.19l-6.1.24-7.62-.24c-1.18,0-1.35.75-1.35,1.19,0,.76.37,1.23,1.09,1.35l2.27.24c2.22.25,3.31,1.19,3.31,2.89v38.07c0,.17-.04.21-.06.22-.14,0-.26-.05-.35-.14l-32.74-42c-.83-.99-2.05-1.53-3.64-1.58l-6.29-.24c-1.25,0-1.43.77-1.43,1.23,0,.78.4,1.26,1.17,1.39l1.41.16c1.96.24,2.92,1.19,2.92,2.89v44.58c0,1.69-1.11,2.64-3.39,2.89l-2.29.24c-.7.13-1.07.6-1.07,1.35,0,.45.18,1.19,1.36,1.19l7.6-.23,6.13.23c1.24,0,1.43-.75,1.43-1.19Z"/>
            </svg>
          </div>
        </button>

        <div style={{ flex: 1 }} />

        {/* MIDDLE: Hamburger */}
        <button
          onClick={() => setExpanded(!expanded)}
          style={{
            outline: "none", cursor: "pointer", border: "none",
            background: "transparent", padding: 8,
            display: "flex", flexDirection: "column", alignItems: "center",
          }}
          aria-label={expanded ? "Menü schliessen" : "Menü öffnen"}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
            {[0, 1, 2].map((n) => (
              <div key={n} style={{ width: 20, height: 1.5, backgroundColor: C.dark }} />
            ))}
          </div>
        </button>

        <div style={{ flex: 1 }} />

        {/* BOTTOM: Language (DE/EN/FR) + Tellian Capital link */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 24 }}>
          {/* Language selector — 3 stacked buttons */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
            {LOCALES.map((l) => {
              const isActive = lang === l;
              return (
                <button
                  key={l}
                  onClick={() => setLang(l)}
                  style={{
                    width: 32, height: 20,
                    backgroundColor: isActive ? C.button : "transparent",
                    color: isActive ? "#ffffff" : "#999",
                    fontFamily: sans, fontSize: 10, fontWeight: 700,
                    letterSpacing: "0.08em", textTransform: "uppercase",
                    border: "none", borderRadius: 0, cursor: "pointer",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    transition: `background-color 0.25s ${EASE.nav}, color 0.25s ${EASE.nav}`,
                    outline: "none",
                  }}
                >
                  {l.toUpperCase()}
                </button>
              );
            })}
          </div>

          {/* Link to main site (replaces Login on main site) */}
          <a
            href="https://telliancapital.ch"
            target="_blank"
            rel="noopener noreferrer"
            onMouseEnter={() => setLinkHover(true)}
            onMouseLeave={() => setLinkHover(false)}
            style={{
              display: "flex", flexDirection: "column", alignItems: "center",
              gap: 5, padding: 0, textDecoration: "none",
              transition: `color 0.25s ${EASE.nav}`,
            }}
          >
            <ExternalLinkIcon size={16} color={linkHover ? C.button : C.dark} />
            <span style={{
              fontFamily: sans, fontSize: 7, fontWeight: 600,
              letterSpacing: "1px", textTransform: "uppercase",
              color: linkHover ? C.button : C.dark,
              transition: `color 0.25s ${EASE.nav}`, userSelect: "none",
            }}>
              Tellian
            </span>
          </a>
        </div>
      </div>

      {/* Right-edge separator line */}
      <div
        className="fixed top-0 left-0 h-screen z-40 pointer-events-none"
        style={{
          width: BAR_W,
          borderRight: "1px solid #D8D5CF",
          opacity: introComplete && visible && !expanded ? 0.3 : 0,
          transition: `opacity 0.9s ${EASE.nav}`,
        }}
      />

      {/* ══════════════════════════════════════════════════════════
          EXPANDED PANEL (300px) — CSS transition (no Framer Motion)
          ══════════════════════════════════════════════════════════ */}

      {/* Dark overlay */}
      <div
        className="fixed inset-0"
        style={{
          zIndex: 55,
          backgroundColor: "rgba(0,0,0,0.08)",
          opacity: expanded ? 1 : 0,
          pointerEvents: expanded ? "auto" : "none",
          transition: `opacity 0.45s ${EASE.nav}`,
        }}
        onClick={() => setExpanded(false)}
      />

      {/* Panel */}
      <div
        className="fixed top-0 left-0 h-screen z-[60] flex flex-col"
        style={{
          width: PANEL_W,
          backgroundColor: C.bg,
          borderRight: `1px solid ${C.line}`,
          transform: expanded ? "translateX(0)" : `translateX(-${PANEL_W}px)`,
          transition: `transform 0.5s ${EASE.nav}`,
        }}
      >
        {/* Header: Logo + Close */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "24px 24px 16px",
        }}>
          <img src={logoHorizontal} alt="Tellian Capital Solutions" style={{ height: 84 }} />
          <button
            onClick={() => setExpanded(false)}
            style={{
              outline: "none", border: "none", background: "transparent",
              cursor: "pointer", width: 44, height: 44, margin: -10,
              display: "flex", alignItems: "center", justifyContent: "center",
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
        <nav style={{ flex: 1, overflowY: "auto", padding: "32px 32px" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
            {NAV_ITEMS.map((item, i) => {
              const isActive = activeIndex === i;
              return (
                <button
                  key={item.num}
                  onClick={() => handleNavigate(i)}
                  style={{
                    outline: "none", border: "none", background: "transparent",
                    cursor: "pointer", textAlign: "left", position: "relative",
                    paddingLeft: 16,
                    opacity: expanded ? 1 : 0,
                    transform: expanded ? "translateY(0)" : "translateY(12px)",
                    transition: `opacity 0.35s ${EASE.nav} ${0.05 + i * 0.04}s, transform 0.35s ${EASE.nav} ${0.05 + i * 0.04}s`,
                  }}
                >
                  {isActive && (
                    <div style={{
                      position: "absolute", left: 0, top: "50%",
                      transform: "translateY(-50%)",
                      width: 2, height: 28, backgroundColor: C.button,
                    }} />
                  )}
                  <span style={{
                    fontFamily: sans, fontSize: 11,
                    color: isActive ? C.purple : "#bbb",
                    display: "block", marginBottom: 3,
                  }}>
                    {item.num}
                  </span>
                  <span style={{
                    fontFamily: serif, fontSize: 20, color: C.dark,
                    display: "block", lineHeight: 1.2,
                  }}>
                    {item.label}
                  </span>
                  <span style={{
                    fontFamily: sans, fontSize: 12, color: "#999",
                    display: "block", marginTop: 3,
                  }}>
                    {item.sub}
                  </span>
                </button>
              );
            })}
          </div>
        </nav>

        {/* Bottom — two levels: Secondary (main-site link) → Tertiary (Lang + LinkedIn) */}
        <div style={{ padding: "24px 32px", borderTop: "1px solid #ddd", display: "flex", flexDirection: "column" }}>
          {/* SEKUNDÄR: Main-site text link with arrow — pixelgleich to Hauptseite Solutions-Link */}
          <a
            href="https://telliancapital.ch"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "inline-flex", alignItems: "center", gap: 6,
              fontFamily: sans, fontSize: 12, fontWeight: 500, letterSpacing: "0.06em",
              color: C.stone, textDecoration: "none",
              transition: `color 0.25s ${EASE.nav}`,
            }}
            onMouseEnter={(e) => { e.currentTarget.style.color = C.dark; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = C.stone; }}
          >
            <span>Tellian Capital</span>
            <span aria-hidden style={{ fontSize: 11 }}>→</span>
          </a>

          {/* TERTIÄR: Language DE/EN/FR + LinkedIn — utility row */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 20 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            {LOCALES.map((l, idx) => (
              <span key={l} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                {idx > 0 && (
                  <span style={{ color: "#ddd", fontSize: 11, fontFamily: sans }}>/</span>
                )}
                <button
                  onClick={() => setLang(l)}
                  style={{
                    outline: "none", border: "none", background: "transparent",
                    cursor: "pointer", fontFamily: sans, fontSize: 11,
                    fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase",
                    color: lang === l ? C.dark : "#bbb", padding: 0,
                  }}
                >
                  {l.toUpperCase()}
                </button>
              </span>
            ))}
            </div>
            {/* LinkedIn */}
            <a
              href="https://www.linkedin.com/company/tellian-capital"
              target="_blank"
              rel="noopener noreferrer"
              style={{ lineHeight: 0 }}
              aria-label="LinkedIn"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-4 0v7H10v-7a6 6 0 0 1 6-6z" stroke="#999" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <rect x="2" y="9" width="4" height="12" stroke="#999" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <circle cx="4" cy="4" r="2" stroke="#999" strokeWidth="1.5"/>
              </svg>
            </a>
          </div>
        </div>
      </div>
    </>
  );
}
