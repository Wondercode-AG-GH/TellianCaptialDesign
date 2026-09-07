import { useEffect, useState } from "react";
import { motion } from "motion/react";

import { C } from "../tokens";
/* Vertikales Lockup (Monogramm oben, Wortzug darunter), Silver Mist
   auf Imperial Purple. Leinwand auf das Motiv beschnitten, Inhalt
   unverändert. */
import preloadLogo from "../../assets/logo/tellian-logo-vertikal-hell.svg";

/* ═══════════════════════════════════════════════════════════
   PRELOAD SCREEN — die Lade-Animation der Marke

   Herausgelöst aus App.tsx (P8), GETEILT: Hauptseite und
   /solutions zeigen beim Laden dieselbe Szene — Imperial-Purple-
   Fläche, das vertikale Logo blendet auf, die Fläche schiebt nach
   oben aus dem Bild. Zeiten unverändert (500/2700/3500ms).
   ═══════════════════════════════════════════════════════════ */

export function PreloadScreen({ onComplete }: { onComplete: () => void }) {
  const [textVisible, setTextVisible] = useState(false);
  const [sliding, setSliding] = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => setTextVisible(true), 500);
    const t2 = setTimeout(() => setSliding(true), 2700);
    const t3 = setTimeout(() => onComplete(), 3500);
    return () => [t1, t2, t3].forEach(clearTimeout);
  }, [onComplete]);

  return (
    <motion.div
      className="fixed inset-0 z-[200] flex items-center justify-center"
      style={{ backgroundColor: C.purple }}
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
          /* Hochformat (0.710): bemessen wird die HÖHE, nicht die
             Breite — die alte Breitenregel galt dem horizontalen
             Logo und ergäbe hier ein bildschirmfüllendes Monogramm.
             Der Breitendeckel greift nur auf sehr schmalen Fenstern. */
          height: "clamp(220px, 38vh, 380px)",
          width: "auto",
          maxWidth: "72vw",
          opacity: textVisible ? 1 : 0,
          transition: textVisible ? "opacity 0.6s ease-out" : "none",
          userSelect: "none",
          pointerEvents: "none",
        }}
      />
    </motion.div>
  );
}
