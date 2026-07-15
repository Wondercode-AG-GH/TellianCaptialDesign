/* ═══════════════════════════════════════════════════════════
   DEMO-DOKUMENTE — offensichtliche Platzhalter.
   PENDING: echte Dokumente/Reporting von Tellian.
   Keine erfundenen echten Titel verwenden.
   ═══════════════════════════════════════════════════════════ */

export interface Document {
  id: string;
  title: string;
  date: string;       // ISO date
  type: string;       // e.g. "PDF"
  sizeKb: number;
}

export const DEMO_DOCUMENTS: Document[] = [
  {
    id: "doc-001",
    title: "Muster-Quartalsbericht Q1 2026",
    date: "2026-04-15",
    type: "PDF",
    sizeKb: 2400,
  },
  {
    id: "doc-002",
    title: "Muster-Quartalsbericht Q4 2025",
    date: "2026-01-20",
    type: "PDF",
    sizeKb: 2100,
  },
  {
    id: "doc-003",
    title: "Muster-Steuerunterlagen 2025",
    date: "2026-03-01",
    type: "PDF",
    sizeKb: 890,
  },
  {
    id: "doc-004",
    title: "Muster-Jahresbericht 2025",
    date: "2026-02-10",
    type: "PDF",
    sizeKb: 4200,
  },
  {
    id: "doc-005",
    title: "Muster-Quartalsbericht Q3 2025",
    date: "2025-10-18",
    type: "PDF",
    sizeKb: 1950,
  },
  {
    id: "doc-006",
    title: "Muster-Quartalsbericht Q2 2025",
    date: "2025-07-14",
    type: "PDF",
    sizeKb: 2050,
  },
  {
    id: "doc-007",
    title: "Muster-Steuerunterlagen 2024",
    date: "2025-03-05",
    type: "PDF",
    sizeKb: 780,
  },
];
