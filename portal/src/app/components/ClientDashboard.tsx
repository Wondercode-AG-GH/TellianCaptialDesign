import { useState, useMemo } from "react";
import { C, serif, sans } from "../tokens";
import { DURATION } from "../../styles/motion";
import { useLanguage } from "../context/LanguageContext";
import { DASHBOARD } from "../dashboardContent";
import { ADMIN } from "../adminContent";
import { DEMO_DOCUMENTS, type Document } from "../data/demoDocuments";
import type { User } from "../types";
import type { Locale } from "../content";
import { useBreakpoint } from "./useBreakpoint";
import logo from "../../assets/logo/Tellian__Imperial purple logo.svg";

/* ═══════════════════════════════════════════════════════════
   CLIENT DASHBOARD — "Ihre Berichte"
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

function formatSize(kb: number): string {
  if (kb >= 1000) return `${(kb / 1000).toFixed(1)} MB`;
  return `${kb} KB`;
}

export function ClientDashboard({ user, impersonation, onEndImpersonation, onLogout }: Props) {
  const { lang, setLang } = useLanguage();
  const { isMobile, isVertical } = useBreakpoint();
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<SortKey>("newest");
  /* List state — toggle via the small debug buttons (bottom of page).
     Default "loaded" with demo data. */
  const [listState, setListState] = useState<ListState>("loaded");

  const t = DASHBOARD;
  const reducedMotion = typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const firstName = user?.profile.firstName || "—";
  const lastName = user?.profile.lastName || "";
  const userId = user?.id || "—";
  const rm = user?.assignedRm;
  const profile = user?.profile;

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
      {impersonation.active && (
        <div
          role="alert"
          aria-live="assertive"
          style={{
            position: "fixed", top: 0, left: 0, right: 0, zIndex: 9999,
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
          HEADER
          ════════════════════════════════════════════════════════ */}
      <header style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: isMobile ? "16px 20px" : "16px clamp(32px, 4vw, 64px)",
        borderBottom: `1px solid ${C.line}`, backgroundColor: C.bg,
        position: "sticky", top: impersonation.active ? 48 : 0, zIndex: 100,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: isMobile ? 16 : 24 }}>
          <img src={logo} alt="Tellian Capital" style={{ height: isMobile ? 32 : 40 }} />
          {!isMobile && (
            <span style={{
              fontFamily: sans, fontSize: 10, fontWeight: 500,
              letterSpacing: "0.22em", textTransform: "uppercase", color: C.stone,
            }}>
              {t.nav.reports[lang]}
            </span>
          )}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: isMobile ? 12 : 20 }}>
          {!isMobile && (
            <span style={{ fontFamily: sans, fontSize: 12, color: C.stone }}>
              {firstName} {lastName} · {userId}
            </span>
          )}
          {!impersonation.active && (
            <button onClick={onLogout} style={{
              fontFamily: sans, fontSize: 11, letterSpacing: "0.1em",
              textTransform: "uppercase", color: C.stone,
              background: "transparent", border: "none", cursor: "pointer",
              padding: "8px 0", outline: "none",
            }}>
              {t.nav.logout[lang]}
            </button>
          )}
          <div style={{ width: 1, height: 16, backgroundColor: C.line }} />
          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
            {LOCALES.map((l, i) => (
              <span key={l} style={{ display: "flex", alignItems: "center", gap: 4 }}>
                {i > 0 && <span style={{ fontFamily: sans, fontSize: 11, color: C.line }}>|</span>}
                <button onClick={() => setLang(l)} style={{
                  fontFamily: sans, fontSize: 11, fontWeight: lang === l ? 700 : 400,
                  letterSpacing: "0.08em", textTransform: "uppercase",
                  color: lang === l ? C.dark : C.stone,
                  background: "transparent", border: "none", cursor: "pointer",
                  padding: "8px 4px", outline: "none", minHeight: 36,
                }}>
                  {l.toUpperCase()}
                </button>
              </span>
            ))}
          </div>
        </div>
      </header>

      {/* ════════════════════════════════════════════════════════
          CONTENT
          ════════════════════════════════════════════════════════ */}
      <div style={{
        padding: isMobile ? "32px 20px 48px" : "48px clamp(32px, 4vw, 64px) 48px",
        display: isVertical ? "flex" : "grid",
        flexDirection: isVertical ? "column" : undefined,
        gridTemplateColumns: isVertical ? undefined : "1fr 320px",
        gap: isVertical ? 40 : "clamp(32px, 4vw, 64px)",
        maxWidth: 1200,
      }}>
        {/* ── LEFT: Reports ── */}
        <div>
          {/* Greeting */}
          <p style={{
            fontFamily: sans, fontSize: 14, color: C.stone,
            margin: "0 0 8px 0",
          }}>
            {t.greeting.welcome[lang](firstName)}
          </p>

          {/* Headline + count */}
          <h1 style={{
            fontFamily: serif,
            fontSize: isMobile ? "clamp(24px, 7vw, 32px)" : "clamp(32px, 3vw, 40px)",
            lineHeight: 1.1, color: C.dark, letterSpacing: "-0.02em",
            fontWeight: 400, margin: 0,
          }}>
            <em style={{ fontStyle: "italic", fontWeight: 400 }}>
              {t.reports.headline[lang]}
            </em>
          </h1>
          {listState === "loaded" && (
            <p style={{
              fontFamily: sans, fontSize: 13, color: C.stone,
              margin: "8px 0 0 0",
            }}>
              {t.reports.count[lang](documents.length)}
            </p>
          )}

          {/* Search + Sort row */}
          <div style={{
            display: "flex", gap: 16, marginTop: 28,
            flexWrap: isMobile ? "wrap" : "nowrap",
            alignItems: "flex-end",
          }}>
            <div style={{ position: "relative", flex: 1, minWidth: 180 }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                style={{ position: "absolute", left: 0, top: "50%", transform: "translateY(-50%)", color: C.stone }}>
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
            <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
              <label htmlFor="sort-select" style={{
                fontFamily: sans, fontSize: 10, fontWeight: 500,
                letterSpacing: "0.16em", textTransform: "uppercase",
                color: C.stone, whiteSpace: "nowrap",
              }}>
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
                  outline: "none", appearance: "none", minHeight: 36,
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%238A857C' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`,
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
                fontFamily: sans, fontSize: 14, color: C.stone,
                fontStyle: "italic", padding: "48px 0", textAlign: "center",
              }}>
                {t.reports.empty[lang]}
              </p>
            )}

            {/* Loaded + documents */}
            {listState === "loaded" && documents.length > 0 && (
              <div style={{ display: "flex", flexDirection: "column" }}>
                {!isVertical && (
                  <div style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 120px 120px 140px",
                    gap: 16, padding: "12px 0",
                    borderBottom: `1.5px solid ${C.dark}`,
                  }}>
                    {[
                      lang === "de" ? "Titel" : "Title",
                      lang === "de" ? "Datum" : "Date",
                      lang === "de" ? "Format" : "Format",
                      "",
                    ].map((h, i) => (
                      <span key={i} style={{
                        fontFamily: sans, fontSize: 10, fontWeight: 600,
                        letterSpacing: "0.2em", textTransform: "uppercase",
                        color: C.stone,
                      }}>
                        {h}
                      </span>
                    ))}
                  </div>
                )}

                {documents.map((doc) => (
                  isVertical ? (
                    <div key={doc.id} style={{
                      padding: "16px 0", borderBottom: `1px solid ${C.line}`,
                      display: "flex", justifyContent: "space-between",
                      alignItems: "flex-start", gap: 12,
                    }}>
                      <div style={{ flex: 1 }}>
                        <span style={{
                          fontFamily: sans, fontSize: 14, fontWeight: 500,
                          color: C.dark, display: "block",
                        }}>
                          {doc.title}
                        </span>
                        <span style={{
                          fontFamily: sans, fontSize: 12, color: C.stone,
                          display: "block", marginTop: 4,
                        }}>
                          {formatDate(doc.date, lang)} · {doc.type} · {formatSize(doc.sizeKb)}
                        </span>
                      </div>
                      <button
                        onClick={() => handleDownload(doc)}
                        aria-label={`${t.reports.download[lang]}: ${doc.title}`}
                        style={{
                          fontFamily: sans, fontSize: 11, letterSpacing: "0.1em",
                          textTransform: "uppercase", color: C.stone,
                          background: "transparent", border: "none",
                          cursor: "pointer", padding: 8, outline: "none",
                          whiteSpace: "nowrap", minHeight: 44, minWidth: 44,
                          display: "flex", alignItems: "center", gap: 6,
                        }}
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                          <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
                          <polyline points="7 10 12 15 17 10"/>
                          <line x1="12" y1="15" x2="12" y2="3"/>
                        </svg>
                      </button>
                    </div>
                  ) : (
                    <div key={doc.id} style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 120px 120px 140px",
                      gap: 16, padding: "14px 0",
                      borderBottom: `1px solid ${C.line}`,
                      alignItems: "center",
                    }}>
                      <span style={{ fontFamily: sans, fontSize: 14, fontWeight: 500, color: C.dark }}>
                        {doc.title}
                      </span>
                      <span style={{ fontFamily: sans, fontSize: 13, color: C.stone }}>
                        {formatDate(doc.date, lang)}
                      </span>
                      <span style={{ fontFamily: sans, fontSize: 13, color: C.stone }}>
                        {doc.type} · {formatSize(doc.sizeKb)}
                      </span>
                      <button
                        onClick={() => handleDownload(doc)}
                        aria-label={`${t.reports.download[lang]}: ${doc.title}`}
                        style={{
                          fontFamily: sans, fontSize: 11, letterSpacing: "0.1em",
                          textTransform: "uppercase", color: C.stone,
                          background: "transparent", border: "none",
                          cursor: "pointer", padding: "8px 0", outline: "none",
                          display: "inline-flex", alignItems: "center", gap: 6,
                          minHeight: 44,
                        }}
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                          <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
                          <polyline points="7 10 12 15 17 10"/>
                          <line x1="12" y1="15" x2="12" y2="3"/>
                        </svg>
                        <span>{t.reports.download[lang]}</span>
                      </button>
                    </div>
                  )
                ))}
              </div>
            )}
          </div>

          {/* ═══ DEBUG: List state toggles (Prototyp) ═══ */}
          <div style={{
            marginTop: 48, paddingTop: 24, borderTop: `1px solid ${C.line}`,
          }}>
            <span style={{
              fontFamily: sans, fontSize: 9, letterSpacing: "0.16em",
              textTransform: "uppercase", color: C.stone, display: "block",
              marginBottom: 8,
            }}>
              Prototyp — Listenzustand
            </span>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {(["loaded", "empty", "loading", "error"] as ListState[]).map((s) => (
                <button
                  key={s}
                  onClick={() => setListState(s)}
                  style={{
                    fontFamily: sans, fontSize: 11,
                    color: listState === s ? C.dark : C.stone,
                    fontWeight: listState === s ? 600 : 400,
                    backgroundColor: listState === s ? C.subtle : "transparent",
                    border: `1px solid ${listState === s ? C.dark : C.line}`,
                    borderRadius: 2, padding: "6px 12px",
                    cursor: "pointer", outline: "none", minHeight: 32,
                  }}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ── RIGHT SIDEBAR: RM + Profile ── */}
        <aside>
          {/* Relationship Manager */}
          <div style={{
            padding: 24, backgroundColor: C.bgSecondary,
            borderRadius: 8, marginBottom: 24,
          }}>
            <span style={{
              fontFamily: sans, fontSize: 10, fontWeight: 500,
              letterSpacing: "0.2em", textTransform: "uppercase",
              color: C.stone, display: "block", marginBottom: 16,
            }}>
              {t.rm.headline[lang]}
            </span>

            {rm ? (
              <div style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
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
                <div>
                  <span style={{
                    fontFamily: sans, fontSize: 15, fontWeight: 600,
                    color: C.dark, display: "block",
                  }}>
                    {rm.firstName} {rm.lastName}
                  </span>
                  {rm.email && (
                    <a href={`mailto:${rm.email}`} style={{
                      fontFamily: sans, fontSize: 13, color: C.stone,
                      textDecoration: "none", display: "block", marginTop: 4,
                    }}>
                      {rm.email}
                    </a>
                  )}
                  {rm.phone && (
                    <a href={`tel:${rm.phone.replace(/\s/g, "")}`} style={{
                      fontFamily: sans, fontSize: 13, color: C.stone,
                      textDecoration: "none", display: "block", marginTop: 2,
                    }}>
                      {rm.phone}
                    </a>
                  )}
                </div>
              </div>
            ) : (
              /* No RM assigned — clean empty state, no broken initials circle */
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{
                  width: 40, height: 40, borderRadius: "50%",
                  backgroundColor: C.subtle,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  flexShrink: 0,
                }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={C.stone} strokeWidth="1.5" aria-hidden>
                    <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
                    <circle cx="12" cy="7" r="4"/>
                  </svg>
                </div>
                <span style={{
                  fontFamily: sans, fontSize: 13, color: C.stone, fontStyle: "italic",
                }}>
                  {t.rm.noRm[lang]}
                </span>
              </div>
            )}
          </div>

          {/* Profile — dezent, nur wenn Adresse vorhanden.
              E-Mail/Telefon des Kunden selbst sind redundant (er kennt sie),
              daher nur Adresse anzeigen, als Referenz. */}
          {profile && (profile.address || profile.zip || profile.city) && (
            <div style={{
              padding: "16px 24px",
              borderLeft: `2px solid ${C.line}`,
            }}>
              <span style={{
                fontFamily: sans, fontSize: 10, fontWeight: 500,
                letterSpacing: "0.2em", textTransform: "uppercase",
                color: C.stone, display: "block", marginBottom: 10,
              }}>
                {t.profile.address[lang]}
              </span>
              <div style={{ fontFamily: sans, fontSize: 13, color: C.dark, lineHeight: 1.5 }}>
                {profile.address && <span style={{ display: "block" }}>{profile.address}</span>}
                {(profile.zip || profile.city) && (
                  <span style={{ display: "block" }}>
                    {[profile.zip, profile.city].filter(Boolean).join(" ")}
                  </span>
                )}
              </div>
            </div>
          )}

          {/* FINMA footer */}
          <div style={{
            display: "flex", alignItems: "center", gap: 10,
            marginTop: 32,
          }}>
            <div style={{ width: 16, height: 1, backgroundColor: C.line }} />
            <span style={{
              fontFamily: sans, fontSize: 9, fontWeight: 500,
              letterSpacing: "0.18em", textTransform: "uppercase", color: C.stone,
            }}>
              {t.trust[lang]}
            </span>
          </div>
        </aside>
      </div>
    </div>
  );
}
