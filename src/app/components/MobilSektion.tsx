import { useEffect, useRef, useState } from "react";

import { C, cormorant, sans } from "../tokens";
import { usePrefersReducedMotion } from "./usePrefersReducedMotion";

/* ═══════════════════════════════════════════════════════════
   MOBIL-BAUSTEINE — Kapitelmarke und Aufgang

   Der Desktop erzählt die Seite als sechs nummerierte Stationen:
   die Leiste unten führt («01 Einstieg … 06 Kontakt»), jede Station
   betritt das Bild mit einer Staffelung. Dem senkrechten Lauf fehlte
   beides — die Sektionen waren nackte Stapel.

   KAPITELMARKE übersetzt die Stationsleiste in den senkrechten Lauf:
   Nummer in Cormorant, Name gesperrt, eine Haarlinie läuft bis zur
   Kante. Dieselben Namen wie in der Leiste (sections.ts), damit
   beide Fassungen dieselbe Landkarte zeigen.

   AUFGANG ist die mobile Fassung des Stationseintritts: der Block
   steht 16px tief und blendet auf, sobald er ins Bild kommt —
   einmalig, mit IntersectionObserver, ohne Scroll-Kopplung.
   Reduced Motion zeigt alles sofort.
   ═══════════════════════════════════════════════════════════ */

interface MarkeProps {
  nr: string;
  name: string;
  /** Auf dunkler Fläche (Purpur) helle Schrift. */
  hell?: boolean;
}

export function Kapitelmarke({ nr, name, hell = false }: MarkeProps) {
  const schrift = hell ? "rgba(249, 249, 247, 0.62)" : C.stone;
  const linie = hell ? "rgba(249, 249, 247, 0.22)" : C.line;
  return (
    <div
      aria-hidden
      style={{
        display: "flex",
        alignItems: "baseline",
        gap: "12px",
      }}
    >
      <span
        style={{
          fontFamily: cormorant,
          fontSize: "16px",
          fontWeight: 300,
          letterSpacing: "0.08em",
          color: schrift,
        }}
      >
        {nr}
      </span>
      <span
        style={{
          fontFamily: sans,
          fontSize: "12px",
          letterSpacing: "var(--tellian-ls-eyebrow)",
          textTransform: "uppercase",
          color: schrift,
          whiteSpace: "nowrap",
        }}
      >
        {name}
      </span>
      <span
        style={{
          flex: 1,
          height: "1px",
          backgroundColor: linie,
          transform: "translateY(-4px)",
        }}
      />
    </div>
  );
}

interface AufgangProps {
  children: React.ReactNode;
  /** Staffelung innerhalb einer Sektion: 0, 1, 2 … je 90ms später. */
  stufe?: number;
}

export function Aufgang({ children, stufe = 0 }: AufgangProps) {
  const reduced = usePrefersReducedMotion();
  const ref = useRef<HTMLDivElement | null>(null);
  const [da, setDa] = useState(false);

  useEffect(() => {
    if (reduced) {
      setDa(true);
      return;
    }
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (eintraege) => {
        if (eintraege.some((e) => e.isIntersecting)) {
          setDa(true);
          io.disconnect();
        }
      },
      /* Früh genug, dass nichts «aufpoppt», spät genug, dass man den
         Aufgang sieht. */
      { rootMargin: "0px 0px -10% 0px", threshold: 0.05 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [reduced]);

  return (
    <div
      ref={ref}
      style={{
        opacity: da ? 1 : 0,
        transform: da ? "translateY(0)" : "translateY(16px)",
        transition: reduced
          ? "none"
          : `opacity 640ms ease-out ${stufe * 90}ms, transform 640ms cubic-bezier(0.16, 1, 0.3, 1) ${stufe * 90}ms`,
      }}
    >
      {children}
    </div>
  );
}
