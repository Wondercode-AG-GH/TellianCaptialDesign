import { C, sans, serif } from "../tokens";

/* ═══════════════════════════════════════════════════════════
   ABSCHLUSSBAND — Satz links, Weg ins Gespräch rechts

   Auf Imperial Purple, über die volle Breite der Unterseite. Der
   Satz ist die erste Zeile der Überschrift: die Seite endet mit
   dem Versprechen, mit dem sie begonnen hat.
   ═══════════════════════════════════════════════════════════ */

interface Props {
  satz: string;
  knopf: string;
  isMobile?: boolean;
  onContactClick?: () => void;
}

export function SubpageAbschlussband({
  satz,
  knopf,
  isMobile = false,
  onContactClick,
}: Props) {
  return (
    <section
      style={{
        backgroundColor: C.purple,
        marginTop: "clamp(56px, 9vh, 112px)",
        /* Randlos über die Seitenbreite: der Inhalt der Unterseite
           steht in einer Spalte mit Rand, das Band nicht. */
        marginLeft: "calc(-1 * var(--tellian-subpage-rand))",
        marginRight: "calc(-1 * var(--tellian-subpage-rand))",
        padding: isMobile
          ? "clamp(40px, 7vh, 64px) var(--tellian-subpage-rand)"
          : "clamp(56px, 9vh, 96px) var(--tellian-subpage-rand)",
        display: "flex",
        flexDirection: isMobile ? "column" : "row",
        alignItems: isMobile ? "flex-start" : "center",
        justifyContent: "space-between",
        gap: "clamp(22px, 3vw, 48px)",
      }}
    >
      <p
        style={{
          margin: 0,
          fontFamily: serif,
          fontSize: isMobile ? "26px" : "clamp(28px, 2.8vw, 40px)",
          fontWeight: 400,
          lineHeight: 1.2,
          color: C.bg,
        }}
      >
        {satz}
      </p>
      <button
        type="button"
        onClick={() => onContactClick?.()}
        className="tellian-cta-primaer tellian-subpage-knopf"
        style={{
          flexShrink: 0,
          border: "none",
          borderRadius: 0,
          padding: "14px 26px",
          minHeight: "var(--tellian-tippziel)",
          fontFamily: sans,
          fontSize: "13px",
          letterSpacing: "var(--tellian-ls-cta-klein)",
          cursor: "pointer",
        }}
      >
        {knopf}
      </button>
    </section>
  );
}
