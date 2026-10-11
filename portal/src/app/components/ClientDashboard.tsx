import { useState, useMemo, useEffect, useRef } from "react";
import { C, serif, sans } from "../tokens";
import { DURATION } from "../../styles/motion";
import { useLanguage } from "../context/LanguageContext";
import { DASHBOARD } from "../dashboardContent";
import { ADMIN } from "../adminContent";
import { DEMO_DOCUMENTS, type Document } from "../data/demoDocuments";
import type { User } from "../types";
import type { Locale } from "../content";
import { useBreakpoint } from "./useBreakpoint";
/* Dieselbe Wortmarke wie in der Kopfzeile der Hauptseite (35 px hoch,
   schmal 26 px) — die quadratische Leinwand des alten Logos liess es
   auf rund 50 px Breite schrumpfen. */
import logo from "../../assets/logo/tellian-logo-dunkel.svg";

/* ═══════════════════════════════════════════════════════════
   CLIENT DASHBOARD — "Ihre Dokumente"
   UI-PROTOTYP: Downloads und Profildaten sind simuliert.
   PENDING: echter Download über serverseitig signierte,
   kurzlebige URLs — Backend.
   ═══════════════════════════════════════════════════════════ */

const LOCALES: Locale[] = ["de", "en"];

type SortKey = "newest" | "oldest" | "titleAsc" | "titleDesc";
type ListState = "loaded" | "loading" | "error" | "empty";

interface Props {
  user: User | null;
  impersonation: { active: boolean; userId: string };
  onEndImpersonation: () => void;
  onLogout: () => void;
}

function formatDate(iso: string, lang: Locale): string {
  const d = new Date(iso);
  return d.toLocaleDateString(lang === "de" ? "de-CH" : "en-GB", {
    day: "2-digit", month: "2-digit", year: "numeric",
  });
}

function formatDateTime(iso: string, lang: Locale): string {
  return new Date(iso).toLocaleString(lang === "de" ? "de-CH" : "en-GB", {
    day: "2-digit", month: "2-digit", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

/* Gemeinsame Masse der kleinen Versal-Labels — nie unter 12 px. */
const LABEL = {
  fontFamily: sans, fontSize: 12, fontWeight: 500,
  letterSpacing: "0.14em", textTransform: "uppercase" as const,
  color: C.stoneText,
};

function DownloadIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
      <polyline points="7 10 12 15 17 10"/>
      <line x1="12" y1="15" x2="12" y2="3"/>
    </svg>
  );
}

function formatSize(kb: number): string {
  if (kb >= 1000) return `${(kb / 1000).toFixed(1)} MB`;
  return `${kb} KB`;
}

export function ClientDashboard({ user, impersonation, onEndImpersonation, onLogout }: Props) {
  const { lang, setLang } = useLanguage();
  const { isMobile, isVertical } = useBreakpoint();
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<SortKey>("newest");
  /* PENDING: Listenzustand kommt mit dem Backend (loading/error/empty).
     Im Prototyp fest "loaded". */
  const [listState] = useState<ListState>("loaded");
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    const onDown = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    };
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setMenuOpen(false); };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [menuOpen]);

  const t = DASHBOARD;
  const reducedMotion = typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const firstName = user?.profile.firstName || "—";
  const lastName = user?.profile.lastName || "";
  const userId = user?.id || "—";
  const rm = user?.assignedRm;

  /* ── Filter + Sort ── */
  const documents = useMemo(() => {
    if (listState !== "loaded") return [];
    let docs = [...DEMO_DOCUMENTS];
    if (search.trim()) {
      const q = search.toLowerCase();
      docs = docs.filter((d) => d.title.toLowerCase().includes(q));
    }
    docs.sort((a, b) => {
      if (sort === "newest") return b.date.localeCompare(a.date);
      if (sort === "oldest") return a.date.localeCompare(b.date);
      if (sort === "titleAsc") return a.title.localeCompare(b.title);
      return b.title.localeCompare(a.title);
    });
    return docs;
  }, [search, sort, listState]);

  /* ── Download: real file download (dummy PDF) ──
     PENDING: echter Download über serverseitig signierte, kurzlebige URLs — Backend.
     Prototyp lädt ein statisches Platzhalter-PDF. */
  const handleDownload = (doc: Document) => {
    const a = document.createElement("a");
    a.href = "/muster-dokument.pdf";
    a.download = `${doc.title.replace(/\s+/g, "-")}.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div style={{ minHeight: "100vh", backgroundColor: C.bg }}>
      {/* ════════════════════════════════════════════════════════
          IMPERSONATION BANNER (reused)
          ════════════════════════════════════════════════════════ */}
      {/* Banner und Kopfzeile kleben gemeinsam oben. Vorher lag das
          Banner fixiert ÜBER der Seite und die Kopfzeile klebte bei
          top: 48 — das Banner ist aber rund 58 px hoch und verdeckte
          den oberen Innenabstand des Inhalts. */}
      <div style={{ position: "sticky", top: 0, zIndex: 100 }}>
      {impersonation.active && (
        <div
          role="alert"
          aria-live="assertive"
          style={{
            backgroundColor: C.warning, color: "#ffffff",
            fontFamily: sans, fontSize: 13, fontWeight: 500,
            display: "flex", alignItems: "center", justifyContent: "center",
            gap: 16, padding: "12px 24px", letterSpacing: "0.03em",
            flexWrap: "wrap",
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden style={{ flexShrink: 0 }}>
            <path d="M12 9v4M12 17h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
          </svg>
          <span>{ADMIN.impersonation.banner[lang](impersonation.userId)}</span>
          <button
            onClick={onEndImpersonation}
            style={{
              fontFamily: sans, fontSize: 11, fontWeight: 600,
              letterSpacing: "0.12em", textTransform: "uppercase",
              color: "#ffffff", backgroundColor: "rgba(255,255,255,0.2)",
              border: "1px solid rgba(255,255,255,0.4)",
              borderRadius: 0, padding: "8px 16px",
              cursor: "pointer", outline: "none", minHeight: 36,
            }}
          >
            {ADMIN.impersonation.end[lang]}
          </button>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════
          HEADER — Inhalt auf dieselbe Spalte (1200) wie der Hauptteil
          ════════════════════════════════════════════════════════ */}
      <header style={{
        borderBottom: `1px solid ${C.line}`, backgroundColor: C.bg,
      }}>
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          maxWidth: 1200, margin: "0 auto", boxSizing: "border-box",
          padding: isMobile ? "14px 20px" : "18px clamp(32px, 4vw, 64px)",
        }}>
          <img src={logo} alt="Tellian Capital" style={{ height: isMobile ? 26 : 35, width: "auto", display: "block" }} />
          <div style={{ display: "flex", alignItems: "center", gap: isMobile ? 8 : 16 }}>
            {/* Konto-Menü: Name sichtbar, ID und Abmelden dahinter */}
            <div ref={menuRef} style={{ position: "relative" }}>
              <button
                onClick={() => setMenuOpen((o) => !o)}
                aria-haspopup="menu"
                aria-expanded={menuOpen}
                aria-label={t.nav.account[lang]}
                className="tellian-portal-konto"
                style={{
                  fontFamily: sans, fontSize: 13, color: C.dark,
                  background: "transparent", border: "none", cursor: "pointer",
                  display: "flex", alignItems: "center", gap: 8,
                  padding: "8px 4px", minHeight: 44,
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
                  <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
                  <circle cx="12" cy="7" r="4"/>
                </svg>
                {!isMobile && <span>{firstName} {lastName}</span>}
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden
                  style={{ transform: menuOpen ? "rotate(180deg)" : "none", transition: reducedMotion ? "none" : `transform ${DURATION.fast}ms ease` }}>
                  <path d="M6 9l6 6 6-6"/>
                </svg>
              </button>
              {menuOpen && (
                <div role="menu" style={{
                  position: "absolute", right: 0, top: "calc(100% + 8px)",
                  minWidth: 240, backgroundColor: C.bg,
                  border: `1px solid ${C.line}`, borderRadius: 4,
                  boxShadow: "0 12px 32px rgba(25, 23, 24, 0.10)",
                  padding: 8, zIndex: 200,
                }}>
                  <div style={{ padding: "10px 12px 12px", borderBottom: `1px solid ${C.line}` }}>
                    <span style={{ fontFamily: sans, fontSize: 14, fontWeight: 600, color: C.dark, display: "block" }}>
                      {firstName} {lastName}
                    </span>
                    <span style={{ fontFamily: sans, fontSize: 12, color: C.stoneText, display: "block", marginTop: 4 }}>
                      {t.nav.clientId[lang]} {userId}
                    </span>
                  </div>
                  {!impersonation.active && (
                    <button
                      role="menuitem"
                      onClick={() => { setMenuOpen(false); onLogout(); }}
                      className="tellian-portal-menupunkt"
                      style={{
                        fontFamily: sans, fontSize: 13, color: C.dark,
                        background: "transparent", border: "none", cursor: "pointer",
                        width: "100%", textAlign: "left", padding: "12px",
                        marginTop: 4, borderRadius: 2,
                        display: "flex", alignItems: "center", gap: 10,
                      }}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                        <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/>
                        <polyline points="16 17 21 12 16 7"/>
                        <line x1="21" y1="12" x2="9" y2="12"/>
                      </svg>
                      {t.nav.logout[lang]}
                    </button>
                  )}
                </div>
              )}
            </div>
            <div style={{ width: 1, height: 16, backgroundColor: C.line }} />
            <div style={{ display: "flex", alignItems: "center", gap: 2 }}>
              {LOCALES.map((l, i) => (
                <span key={l} style={{ display: "flex", alignItems: "center", gap: 2 }}>
                  {i > 0 && <span aria-hidden style={{ fontFamily: sans, fontSize: 12, color: C.line }}>|</span>}
                  <button onClick={() => setLang(l)} aria-pressed={lang === l} style={{
                    fontFamily: sans, fontSize: 12, fontWeight: lang === l ? 700 : 400,
                    letterSpacing: "0.08em", textTransform: "uppercase",
                    color: lang === l ? C.dark : C.stoneText,
                    background: "transparent", border: "none", cursor: "pointer",
                    padding: "8px 6px", minHeight: 44,
                  }}>
                    {l.toUpperCase()}
                  </button>
                </span>
              ))}
            </div>
          </div>
        </div>
      </header>
      </div>

      {/* ════════════════════════════════════════════════════════
          CONTENT — zentriert
          ════════════════════════════════════════════════════════ */}
      <div style={{
        padding: isMobile ? "32px 20px 48px" : "48px clamp(32px, 4vw, 64px) 64px",
        display: isVertical ? "flex" : "grid",
        flexDirection: isVertical ? "column" : undefined,
        gridTemplateColumns: isVertical ? undefined : "minmax(0, 1fr) 320px",
        gap: isVertical ? 40 : "clamp(32px, 4vw, 64px)",
        maxWidth: 1200, margin: "0 auto", boxSizing: "border-box",
      }}>
        {/* ── LEFT: Dokumente ── */}
        <div style={{ minWidth: 0 }}>
          {/* Headline + eine Metazeile (Anzahl · letzte Anmeldung) */}
          <h1 style={{
            fontFamily: serif,
            fontSize: isMobile ? "clamp(28px, 8vw, 34px)" : "clamp(32px, 3vw, 40px)",
            lineHeight: 1.1, color: C.dark, letterSpacing: "-0.02em",
            fontWeight: 400, margin: 0,
          }}>
            <em style={{ fontStyle: "italic", fontWeight: 400 }}>
              {t.reports.headline[lang]}
            </em>
          </h1>
          {listState === "loaded" && (
            <p style={{
              fontFamily: sans, fontSize: 13, color: C.stoneText,
              margin: "10px 0 0 0", lineHeight: 1.5,
            }}>
              {t.reports.count[lang](DEMO_DOCUMENTS.length)}
              {user?.lastLogin && (isMobile ? (
                <span style={{ display: "block" }}>
                  {t.greeting.lastLogin[lang](formatDateTime(user.lastLogin, lang))}
                </span>
              ) : (
                <>
                  <span aria-hidden style={{ margin: "0 8px", color: C.line }}>·</span>
                  {t.greeting.lastLogin[lang](formatDateTime(user.lastLogin, lang))}
                </>
              ))}
            </p>
          )}

          {/* Search + Sort row */}
          <div style={{
            display: "flex", gap: 16, marginTop: 32,
            flexWrap: isMobile ? "wrap" : "nowrap",
            alignItems: "flex-end",
          }}>
            <div style={{ position: "relative", flex: 1, minWidth: 180 }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                style={{ position: "absolute", left: 0, top: "50%", transform: "translateY(-50%)", color: C.stoneText }}>
                <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="1.5"/>
                <path d="M21 21l-4.35-4.35" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
              <input
                type="search" value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={t.reports.search[lang]}
                aria-label={t.reports.search[lang]}
                style={{
                  fontFamily: sans, fontSize: 14, color: C.dark,
                  backgroundColor: "transparent",
                  border: "none", borderBottom: `1.5px solid ${C.line}`,
                  borderRadius: 0, padding: "10px 0 10px 28px",
                  outline: "none", width: "100%",
                  transition: `border-color ${DURATION.fast}ms ease`,
                }}
                onFocus={(e) => { e.currentTarget.style.borderBottomColor = C.dark; }}
                onBlur={(e) => { e.currentTarget.style.borderBottomColor = C.line; }}
              />
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
              <label htmlFor="sort-select" style={{ ...LABEL, whiteSpace: "nowrap" }}>
                {t.reports.sortLabel[lang]}
              </label>
              <select
                id="sort-select"
                value={sort}
                onChange={(e) => setSort(e.target.value as SortKey)}
                style={{
                  fontFamily: sans, fontSize: 13, color: C.dark,
                  backgroundColor: "transparent",
                  border: `1px solid ${C.line}`, borderRadius: 2,
                  padding: "6px 28px 6px 8px", cursor: "pointer",
                  outline: "none", appearance: "none", minHeight: 40,
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2368635A' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`,
                  backgroundRepeat: "no-repeat", backgroundPosition: "right 8px center",
                }}
              >
                <option value="newest">{t.reports.sortNewest[lang]}</option>
                <option value="oldest">{t.reports.sortOldest[lang]}</option>
                <option value="titleAsc">{t.reports.sortTitleAsc[lang]}</option>
                <option value="titleDesc">{t.reports.sortTitleDesc[lang]}</option>
              </select>
            </div>
          </div>

          {/* ════════════════════════════════════════════════════
              DOCUMENT LIST — 4 states
              ════════════════════════════════════════════════════ */}
          <div style={{ marginTop: 24 }} aria-live="polite">
            {/* Loading skeleton */}
            {listState === "loading" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 16, padding: "24px 0" }}>
                {[0, 1, 2, 3].map((i) => (
                  <div key={i} style={{
                    height: 56, borderRadius: 4,
                    background: `linear-gradient(90deg, ${C.subtle} 25%, ${C.line} 50%, ${C.subtle} 75%)`,
                    backgroundSize: "200% 100%",
                    animation: reducedMotion ? "none" : "skeleton-shimmer 1.5s ease infinite",
                  }} />
                ))}
                <style>{`
                  @keyframes skeleton-shimmer {
                    0% { background-position: 200% 0; }
                    100% { background-position: -200% 0; }
                  }
                `}</style>
              </div>
            )}

            {/* Error */}
            {listState === "error" && (
              <div style={{
                padding: "32px 24px", textAlign: "center",
                backgroundColor: C.errorBg, border: `1px solid ${C.error}`,
                borderRadius: 4, marginTop: 8,
              }}>
                <span style={{ fontFamily: sans, fontSize: 14, color: C.error }}>
                  {t.reports.error[lang]}
                </span>
              </div>
            )}

            {/* Empty */}
            {(listState === "empty" || (listState === "loaded" && documents.length === 0)) && (
              <p style={{
                fontFamily: sans, fontSize: 14, color: C.stoneText,
                fontStyle: "italic", padding: "48px 0", textAlign: "center",
              }}>
                {t.reports.empty[lang]}
              </p>
            )}

            {/* Loaded + documents — jede Zeile ist als Ganzes klickbar */}
            {listState === "loaded" && documents.length > 0 && (
              <div style={{ display: "flex", flexDirection: "column" }}>
                {!isVertical && (
                  <div style={{
                    display: "grid", gridTemplateColumns: "minmax(0, 1fr) 120px 44px",
                    gap: 16, padding: "12px 0",
                    borderBottom: `1.5px solid ${C.dark}`,
                  }}>
                    <span style={LABEL}>{lang === "de" ? "Titel" : "Title"}</span>
                    <span style={LABEL}>{lang === "de" ? "Datum" : "Date"}</span>
                    <span />
                  </div>
                )}

                {documents.map((doc) => {
                  const meta = isVertical
                    ? `${formatDate(doc.date, lang)} · ${doc.type} · ${formatSize(doc.sizeKb)}`
                    : `${doc.type} · ${formatSize(doc.sizeKb)}`;
                  return (
                    <button
                      key={doc.id}
                      onClick={() => handleDownload(doc)}
                      aria-label={`${t.reports.download[lang]}: ${doc.title}`}
                      className="tellian-portal-dokument"
                      style={{
                        display: "grid",
                        gridTemplateColumns: isVertical ? "minmax(0, 1fr) 44px" : "minmax(0, 1fr) 120px 44px",
                        gap: isVertical ? 12 : 16, alignItems: "center",
                        padding: "16px 0",
                        border: "none", borderBottom: `1px solid ${C.line}`,
                        background: "transparent", cursor: "pointer",
                        textAlign: "left", width: "100%", color: C.dark,
                      }}
                    >
                      <span style={{ minWidth: 0 }}>
                        <span style={{ fontFamily: sans, fontSize: 15, fontWeight: 500, color: C.dark, display: "block" }}>
                          {doc.title}
                        </span>
                        <span style={{ fontFamily: sans, fontSize: 12, color: C.stoneText, display: "block", marginTop: 4 }}>
                          {meta}
                        </span>
                      </span>
                      {!isVertical && (
                        <span style={{ fontFamily: sans, fontSize: 13, color: C.stoneText }}>
                          {formatDate(doc.date, lang)}
                        </span>
                      )}
                      <span className="tellian-portal-dokument-icon" style={{
                        width: 44, height: 44, display: "flex",
                        alignItems: "center", justifyContent: "center",
                        color: C.stoneText, borderRadius: "50%",
                      }}>
                        <DownloadIcon size={18} />
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* ── RIGHT SIDEBAR: RM ── */}
        <aside>
          {/* Relationship Manager */}
          <div style={{
            padding: 24, backgroundColor: C.bgSecondary,
            borderRadius: 8,
          }}>
            <span style={{ ...LABEL, display: "block", marginBottom: 16 }}>
              {t.rm.headline[lang]}
            </span>

            {rm ? (
              <>
                <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
                  {rm.photo ? (
                    <img
                      src={rm.photo}
                      alt={`${rm.firstName} ${rm.lastName}`}
                      style={{
                        width: 56, height: 56, borderRadius: "50%",
                        objectFit: "cover", flexShrink: 0,
                      }}
                    />
                  ) : (
                    <div
                      aria-label={t.rm.fallbackInitials[lang]}
                      style={{
                        width: 56, height: 56, borderRadius: "50%",
                        backgroundColor: C.purple, color: C.bg,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontFamily: sans, fontSize: 18, fontWeight: 500,
                        flexShrink: 0, letterSpacing: "0.05em",
                      }}
                    >
                      {rm.firstName[0]}{rm.lastName[0]}
                    </div>
                  )}
                  <span style={{
                    fontFamily: sans, fontSize: 15, fontWeight: 600,
                    color: C.dark, display: "block",
                  }}>
                    {rm.firstName} {rm.lastName}
                  </span>
                </div>

                {(rm.email || rm.phone) && (
                  <div style={{ marginTop: 18, display: "flex", flexDirection: "column", gap: 2 }}>
                    {rm.email && (
                      <a href={`mailto:${rm.email}`} className="tellian-portal-kontakt">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                          <rect x="3" y="5" width="18" height="14" rx="1.5"/>
                          <path d="M3.5 6l8.5 7 8.5-7"/>
                        </svg>
                        <span>{rm.email}</span>
                      </a>
                    )}
                    {rm.phone && (
                      <a href={`tel:${rm.phone.replace(/\s/g, "")}`} className="tellian-portal-kontakt">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                          <path d="M22 16.92v3a2 2 0 01-2.18 2 19.8 19.8 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.8 19.8 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.13.96.36 1.9.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0122 16.92z"/>
                        </svg>
                        <span>{rm.phone}</span>
                      </a>
                    )}
                  </div>
                )}

                {rm.email && (
                  <a
                    href={`mailto:${rm.email}`}
                    className="tellian-portal-cta"
                    style={{
                      marginTop: 18, display: "flex", alignItems: "center",
                      justifyContent: "center", gap: 10, minHeight: 48,
                      fontFamily: sans, fontSize: 12, fontWeight: 600,
                      letterSpacing: "0.14em", textTransform: "uppercase",
                      color: C.bg, backgroundColor: C.purple,
                      textDecoration: "none", borderRadius: 0,
                    }}
                  >
                    {t.rm.contact[lang]}
                    <span aria-hidden>→</span>
                  </a>
                )}
              </>
            ) : (
              /* No RM assigned — clean empty state, no broken initials circle */
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{
                  width: 40, height: 40, borderRadius: "50%",
                  backgroundColor: C.subtle,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  flexShrink: 0,
                }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={C.stoneText} strokeWidth="1.5" aria-hidden>
                    <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
                    <circle cx="12" cy="7" r="4"/>
                  </svg>
                </div>
                <span style={{
                  fontFamily: sans, fontSize: 13, color: C.stoneText, fontStyle: "italic",
                }}>
                  {t.rm.noRm[lang]}
                </span>
              </div>
            )}
          </div>

        </aside>
      </div>

      <style>{`
        .tellian-portal-dokument-icon { transition: background-color ${DURATION.fast}ms ease, color ${DURATION.fast}ms ease; }
        .tellian-portal-dokument:hover .tellian-portal-dokument-icon { color: ${C.dark}; background-color: ${C.bgSecondary}; }
        .tellian-portal-dokument:focus-visible,
        .tellian-portal-konto:focus-visible,
        .tellian-portal-menupunkt:focus-visible,
        .tellian-portal-kontakt:focus-visible,
        .tellian-portal-cta:focus-visible { outline: 2px solid ${C.purple}; outline-offset: 2px; }
        .tellian-portal-menupunkt:hover { background-color: ${C.bgSecondary}; }
        .tellian-portal-kontakt {
          display: flex; align-items: center; gap: 10px; min-height: 36px;
          font-family: ${sans}; font-size: 14px; color: ${C.dark};
          text-decoration: none;
        }
        .tellian-portal-kontakt svg { color: ${C.stoneText}; flex-shrink: 0; }
        .tellian-portal-kontakt:hover span { text-decoration: underline; text-underline-offset: 3px; }
        .tellian-portal-cta { transition: background-color ${DURATION.fast}ms ease; }
        .tellian-portal-cta:hover { background-color: #3A2F47 !important; }
      `}</style>
    </div>
  );
}
