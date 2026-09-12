import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { Kopfzeile } from "../components/Kopfzeile";
import { DotNavigation } from "../components/DotNavigation";
import { MobilMenue } from "../components/MobilMenue";
import { LoginOverlay } from "../components/LoginOverlay";
import { PreloadScreen } from "../components/PreloadScreen";
import { LegalPage, useLegalRoute } from "../components/LegalPage";
import { SectionEnteredProvider } from "../components/SectionEntry";
import { Station5Team } from "../components/Station5Team";
import { Station6Kontakt } from "../components/Station6Kontakt";
import { useBreakpoint } from "../components/useBreakpoint";
import { useHorizontalScroll } from "../components/useHorizontalScroll";
import { useVerticalSectionIndex } from "../components/useVerticalSectionIndex";
import { useBandZonen } from "../components/useBandTon";
import { SOLUTIONS_SEKTIONEN, solutionsLeisteSektionen } from "./inhalt";
import { NEBEN_VERWEISE } from "../sections";
import { SolutionsEinstieg } from "./SolutionsEinstieg";
import { SolutionsWasWirTun } from "./SolutionsWasWirTun";

/* ═══════════════════════════════════════════════════════════
   TELLIAN CAPITAL SOLUTIONS — zweite Stationen-Erfahrung

   Route /solutions in derselben App. Vier Stationen im Hell/Dunkel-
   Rhythmus der Hauptseite (hell·dunkel·hell·dunkel), gefahren von
   DERSELBEN Scroll-Engine, derselben Kopfzeile (Zusatz «SOLUTIONS»
   in Mushroom, Logo führt zur Hauptseite zurück), derselben
   Stationsleiste mit eigenen Einträgen und derselben Kontakt-
   Station. Keine Kopien — die geteilten Bausteine sind über die
   Sektionsliste parametrisiert.
   ═══════════════════════════════════════════════════════════ */

export function SolutionsApp() {
  const { isVertical } = useBreakpoint();
  /* Solutions ist vollständig dreisprachig; der Toggle zeigt hier
     DE/EN/FR (Hauptseite unverändert DE/EN). FALLBACK: der Rückweg
     zur Hauptseite ist eine volle Navigation (location.href) — die
     Haupt-App startet frisch mit DE. FR kann dort nie ankommen,
     ein Mischzustand mit Platzhaltern ist ausgeschlossen. */
  const [sprache, setSprache] = useState<"DE" | "EN" | "FR">("DE");
  const [loginOpen, setLoginOpen] = useState(false);
  const [menueOffen, setMenueOffen] = useState(false);
  /* Dieselbe Lade-Animation wie die Hauptseite; bis sie ausläuft,
     ist der Filmstrip gesperrt. */
  const [introComplete, setIntroComplete] = useState(false);
  /* VOR dem Scroll-Hook deklariert (TDZ) — offenes Teamporträt
     sperrt den Filmstrip, wie auf der Hauptseite. */
  const [teamDetailOffen, setTeamDetailOffen] = useState(false);
  const legal = useLegalRoute();

  const {
    containerRef,
    spacerRef,
    viewportRef,
    panelRef: panelRefRoh,
    jumpToIndex,
    resetToStart,
    activeIndex: horizontalIndex,
    visibleRange,
  } = useHorizontalScroll({
    disabled: isVertical,
    locked: loginOpen || menueOffen || teamDetailOffen || !introComplete || !!legal.activePath,
    sektionen: SOLUTIONS_SEKTIONEN,
  });

  const verticalIndex = useVerticalSectionIndex(isVertical, SOLUTIONS_SEKTIONEN);
  const activeIndex = isVertical ? verticalIndex : horizontalIndex;

  /* Sprachwechsel setzt die Scrub-Position an den Anfang (2.4) —
     ohne Fahrt; nicht beim ersten Aufbau. */
  const spracheInitial = useRef(true);
  useEffect(() => {
    if (spracheInitial.current) {
      spracheInitial.current = false;
      return;
    }
    if (!isVertical) resetToStart();
  }, [sprache, isVertical, resetToStart]);
  const bandZonen = useBandZonen(!isVertical, activeIndex, SOLUTIONS_SEKTIONEN);

  /* Betretene Stationen — einmal betreten bleibt betreten, wie auf
     der Hauptseite (Eintrittsanimationen laufen genau einmal). */
  const [entered, setEntered] = useState<boolean[]>(() =>
    SOLUTIONS_SEKTIONEN.map((_, i) => i === 0),
  );
  useEffect(() => {
    if (isVertical) return;
    setEntered((prev) => {
      let geaendert = false;
      const next = [...prev];
      for (let i = visibleRange[0]; i <= visibleRange[1]; i++) {
        if (!next[i]) {
          next[i] = true;
          geaendert = true;
        }
      }
      return geaendert ? next : prev;
    });
  }, [isVertical, visibleRange]);

  const panelRef = useCallback(
    (index: number) => (el: HTMLDivElement | null) => {
      if (el) el.dataset.tellianStation = String(index);
      panelRefRoh(index)(el);
    },
    [panelRefRoh],
  );

  const navigateToSection = useCallback(
    (index: number) => {
      if (isVertical) {
        const ziel = document.getElementById(SOLUTIONS_SEKTIONEN[index]?.domId ?? "");
        ziel?.scrollIntoView({ behavior: "smooth" });
      } else {
        jumpToIndex(index);
      }
      setMenueOffen(false);
    },
    [isVertical, jumpToIndex],
  );

  /* Leiste und Menü sprechen die gewählte Sprache; die Engine fährt
     die referenzstabile Registry. */
  const leisteSektionen = useMemo(() => solutionsLeisteSektionen(sprache), [sprache]);

  /* Weltenwechsel und Logo-Klick: der Wechsel ist eine volle
     Navigation — die Zielwelt startet damit auf ihrer ERSTEN
     Station mit zurückgesetztem Scroll, und FR kann nicht auf die
     Hauptseite lecken (dort beginnt DE). Das Logo führt INNERHALB
     der eigenen Welt zur ersten Station. */
  const zurHauptseite = useCallback(() => {
    window.location.href = "/";
  }, []);

  const kopf = (
    <Kopfzeile
      zonen={bandZonen}
      sprache={sprache}
      onSprache={setSprache}
      onPortal={() => setLoginOpen(true)}
      onLogo={() => navigateToSection(0)}
      logoHref={`#${SOLUTIONS_SEKTIONEN[0].key}`}
      logoLabel={
        sprache === "FR"
          ? "Tellian Capital Solutions — retour à la première station"
          : "Tellian Capital Solutions — zurück zur ersten Station"
      }
      welt="solutions"
      onWelt={(ziel) => ziel === "capital" && zurHauptseite()}
      sprachen={["DE", "EN", "FR"]}
      /* Der Kontrast-Scrim (P1) trägt den grössten Teil; die
         Hinterlegung des Portalfelds bleibt dezent bestehen — ohne
         sie fiel das Feld auf dem hellen Panorama auf 3.97:1. */
      bildScrim="rgba(40, 31, 51, 0.32)"
      /* KONTRAST-SONDERFALL (A2): das Solutions-Panorama ist bis zur
         finalen Tonung ein helles Tagesbild — Portal-Scrim
         verstärkt, Schrift mit dezentem Schatten (WCAG AA am
         echten Bild geprüft). */
      /* UI-LABEL-REVIEW: «Portail Client» für den Kundenportal-
         Knopf im Solutions-Kontext (FR ohne Quelle). */
      portalLabel={sprache === "FR" ? "Portail Client" : "Kundenportal"}
      isVertical={isVertical}
      menueOffen={menueOffen}
      onMenue={() => setMenueOffen((o) => !o)}
    />
  );

  /* ── SCHMAL: vertikale Sektionen wie die Hauptseite ── */
  if (isVertical) {
    return (
      <div style={{ backgroundColor: "var(--tellian-bg)" }}>
        {!introComplete && <PreloadScreen onComplete={() => setIntroComplete(true)} />}
        {kopf}
        <MobilMenue
          offen={menueOffen}
          onSchliessen={() => setMenueOffen(false)}
          activeIndex={activeIndex}
          onNavigate={navigateToSection}
          onOpenLegal={legal.open}
          sektionen={leisteSektionen}
          /* Der Verweis «Solutions» zeigte auf diese Seite selbst
             (alte Subdomain) — im eigenen Menü ausgeblendet. */
          nebenVerweise={NEBEN_VERWEISE.filter((v) => v.text !== "Solutions")}
          welt="solutions"
          onWelt={(ziel) => ziel === "capital" && zurHauptseite()}
        />

        <SolutionsEinstieg isVertical bereit={introComplete} sprache={sprache} />
        <SolutionsWasWirTun isVertical sprache={sprache} />
        <Station5Team
          isVertical
          domId="solutions-team"
          sprache={sprache}
          onDetailToggle={setTeamDetailOffen}
          personenIds={["olivier", "thibaut"]}
          markeNr={null}
        />
        {/* TODO-SOLUTIONS-FIRMA: der Kontaktblock zeigt Firmenname
            und Absender der HAUPTSEITE — die Bestätigung des Namens
            für den Solutions-Kontaktblock steht aus. */}
        <Station6Kontakt
          isVertical
          sprache={sprache}
          domId="solutions-kontakt"
          onOpenLegal={legal.open}
          markeNr={null}
        />

        <LoginOverlay open={loginOpen} onClose={() => setLoginOpen(false)} onSupportClick={() => navigateToSection(3)} />
        <LegalPage activePath={legal.activePath} onClose={legal.close} />
      </div>
    );
  }

  /* ── BREIT: der Filmstrip ── */
  return (
    <div style={{ backgroundColor: "var(--tellian-bg)" }}>
      {!introComplete && <PreloadScreen onComplete={() => setIntroComplete(true)} />}
      {/* Scrub-Gerüst wie auf der Hauptseite: Spacer → Sticky-
          Ausschnitt → Track (transform), siehe useHorizontalScroll. */}
      <div ref={spacerRef}>
      <div
        ref={viewportRef}
        style={{ position: "sticky", top: 0, height: "100vh", overflow: "hidden" }}
      >
      <div
        ref={containerRef}
        className="flex h-screen"
        style={{
          position: "relative",
          width: "max-content",
          willChange: "transform",
        }}
      >
        <SectionEnteredProvider value={entered[0]}>
          <SolutionsEinstieg panelRef={panelRef(0)} sprache={sprache} />
        </SectionEnteredProvider>
        <SectionEnteredProvider value={entered[1]}>
          <SolutionsWasWirTun panelRef={panelRef(1)} sprache={sprache} />
        </SectionEnteredProvider>
        {/* TODO-SOLUTIONS-FIRMA: der Kontaktblock zeigt Firmenname
            und Absender der HAUPTSEITE — die Bestätigung des Namens
            für den Solutions-Kontaktblock steht aus. KEIN eigener
            Name erfunden. */}
        <SectionEnteredProvider value={entered[2]}>
          <Station5Team
            panelRef={panelRef(2)}
            domId="solutions-team"
            sprache={sprache}
            onDetailToggle={setTeamDetailOffen}
            personenIds={["olivier", "thibaut"]}
          />
        </SectionEnteredProvider>
        <SectionEnteredProvider value={entered[3]}>
          <Station6Kontakt panelRef={panelRef(3)} sprache={sprache} domId="solutions-kontakt" onOpenLegal={legal.open} />
        </SectionEnteredProvider>
      </div>
      </div>
      </div>

      {kopf}
      <DotNavigation
        activeIndex={activeIndex}
        onNavigate={navigateToSection}
        zonen={bandZonen}
        sektionen={leisteSektionen}
      />

      <LoginOverlay open={loginOpen} onClose={() => setLoginOpen(false)} onSupportClick={() => navigateToSection(3)} />
      <LegalPage activePath={legal.activePath} onClose={legal.close} />
    </div>
  );
}
