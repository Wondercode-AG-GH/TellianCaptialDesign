import { useCallback, useEffect, useMemo, useState } from "react";

import { Kopfzeile } from "../components/Kopfzeile";
import { DotNavigation } from "../components/DotNavigation";
import { MobilMenue } from "../components/MobilMenue";
import { LoginOverlay } from "../components/LoginOverlay";
import { LegalPage, useLegalRoute } from "../components/LegalPage";
import { SectionEnteredProvider } from "../components/SectionEntry";
import { Station6Kontakt } from "../components/Station6Kontakt";
import { useBreakpoint } from "../components/useBreakpoint";
import { useHorizontalScroll } from "../components/useHorizontalScroll";
import { useVerticalSectionIndex } from "../components/useVerticalSectionIndex";
import { useBandZonen } from "../components/useBandTon";
import { SOLUTIONS_SEKTIONEN, solutionsLeisteSektionen } from "./inhalt";
import { SolutionsEinstieg } from "./SolutionsEinstieg";
import { SolutionsWasWirTun } from "./SolutionsWasWirTun";
import { SolutionsVorgehen } from "./SolutionsVorgehen";

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
  const [sprache, setSprache] = useState<"DE" | "EN">("DE");
  const [loginOpen, setLoginOpen] = useState(false);
  const [menueOffen, setMenueOffen] = useState(false);
  const legal = useLegalRoute();

  const {
    containerRef,
    panelRef: panelRefRoh,
    jumpToIndex,
    activeIndex: horizontalIndex,
    visibleRange,
  } = useHorizontalScroll({
    disabled: isVertical,
    locked: loginOpen || menueOffen || !!legal.activePath,
    sektionen: SOLUTIONS_SEKTIONEN,
  });

  const verticalIndex = useVerticalSectionIndex(isVertical, SOLUTIONS_SEKTIONEN);
  const activeIndex = isVertical ? verticalIndex : horizontalIndex;
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

  const zurHauptseite = useCallback(() => {
    window.location.href = "/";
  }, []);

  const kopf = (
    <Kopfzeile
      zonen={bandZonen}
      sprache={sprache}
      onSprache={setSprache}
      onPortal={() => setLoginOpen(true)}
      onLogo={zurHauptseite}
      zusatz="Solutions"
      logoHref="/"
      logoLabel="Tellian Capital — zurück zur Hauptseite"
      isVertical={isVertical}
      menueOffen={menueOffen}
      onMenue={() => setMenueOffen((o) => !o)}
    />
  );

  /* ── SCHMAL: vertikale Sektionen wie die Hauptseite ── */
  if (isVertical) {
    return (
      <div style={{ backgroundColor: "var(--tellian-bg)" }}>
        {kopf}
        <MobilMenue
          offen={menueOffen}
          onSchliessen={() => setMenueOffen(false)}
          activeIndex={activeIndex}
          onNavigate={navigateToSection}
          onOpenLegal={legal.open}
          sektionen={leisteSektionen}
        />

        <SolutionsEinstieg isVertical sprache={sprache} />
        <SolutionsWasWirTun isVertical sprache={sprache} />
        <SolutionsVorgehen isVertical sprache={sprache} />
        {/* TODO-SOLUTIONS-FIRMA: der Kontaktblock zeigt Firmenname
            und Absender der HAUPTSEITE — die Bestätigung des Namens
            für den Solutions-Kontaktblock steht aus. */}
        <Station6Kontakt
          isVertical
          domId="solutions-kontakt"
          onOpenLegal={legal.open}
          markeNr="04"
          markeName={leisteSektionen[3].label}
        />

        <LoginOverlay open={loginOpen} onClose={() => setLoginOpen(false)} onSupportClick={() => navigateToSection(3)} />
        <LegalPage activePath={legal.activePath} onClose={legal.close} />
      </div>
    );
  }

  /* ── BREIT: der Filmstrip ── */
  return (
    <div style={{ backgroundColor: "var(--tellian-bg)" }}>
      <div
        ref={containerRef}
        className="flex h-screen overflow-x-scroll overflow-y-hidden"
        style={{
          position: "relative",
          scrollbarWidth: "none",
          msOverflowStyle: "none",
        }}
      >
        <SectionEnteredProvider value={entered[0]}>
          <SolutionsEinstieg panelRef={panelRef(0)} sprache={sprache} />
        </SectionEnteredProvider>
        <SectionEnteredProvider value={entered[1]}>
          <SolutionsWasWirTun panelRef={panelRef(1)} sprache={sprache} />
        </SectionEnteredProvider>
        <SectionEnteredProvider value={entered[2]}>
          <SolutionsVorgehen panelRef={panelRef(2)} sprache={sprache} />
        </SectionEnteredProvider>
        {/* TODO-SOLUTIONS-FIRMA: der Kontaktblock zeigt Firmenname
            und Absender der HAUPTSEITE — die Bestätigung des Namens
            für den Solutions-Kontaktblock steht aus. KEIN eigener
            Name erfunden. */}
        <SectionEnteredProvider value={entered[3]}>
          <Station6Kontakt panelRef={panelRef(3)} domId="solutions-kontakt" onOpenLegal={legal.open} />
        </SectionEnteredProvider>
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
