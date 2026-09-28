import { useState, useEffect, useCallback } from "react";

/* ═══════════════════════════════════════════════════════════
   Generic subpage mode hook — shared by all detail views.
   No React Router, no unmount. URL is synced via pushState so
   browser back/forward work, but the underlying DOM never
   re-mounts — FLIP transitions stay intact.
   ═══════════════════════════════════════════════════════════ */

export type SubpageMode = "overview" | "detail";

const ROOT_PATH = "/";

export interface SubpageModeApi {
  mode: SubpageMode;
  isDetail: boolean;
  openDetail: () => void;
  closeDetail: () => void;
  /**
   * Schliesst die Ansicht OHNE Eintrag im Verlauf — für den
   * direkten Wechsel von einer Unterseite zur anderen. Sonst
   * schöbe das Schliessen erst «/» und das Öffnen danach den
   * neuen Pfad: zwei Einträge, und der Rückweg landete auf der
   * Startseite statt bei der Seite, von der man kam.
   */
  closeSilently: () => void;
}

/**
 * Controls a single subpage's detail mode.
 * Pass the path that identifies the detail view (e.g. "/vermoegensverwaltung").
 */
export function useSubpageMode(path: string): SubpageModeApi {
  const getInitialMode = (): SubpageMode => {
    if (typeof window === "undefined") return "overview";
    return window.location.pathname === path ? "detail" : "overview";
  };

  const [mode, setMode] = useState<SubpageMode>(getInitialMode);

  /* Sync mode when user navigates via browser back/forward */
  useEffect(() => {
    const onPop = () => {
      setMode(window.location.pathname === path ? "detail" : "overview");
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, [path]);

  const openDetail = useCallback(() => {
    if (mode === "detail") return;
    window.history.pushState({}, "", path);
    setMode("detail");
  }, [mode, path]);

  const closeDetail = useCallback(() => {
    if (mode === "overview") return;
    window.history.pushState({}, "", ROOT_PATH);
    setMode("overview");
  }, [mode]);

  const closeSilently = useCallback(() => setMode("overview"), []);

  return { mode, isDetail: mode === "detail", openDetail, closeDetail, closeSilently };
}
