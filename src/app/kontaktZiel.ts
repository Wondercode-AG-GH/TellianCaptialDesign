/* ═══════════════════════════════════════════════════════════
   WOHIN DIE ANFRAGE GEHT

   Genau eine Stelle. Wer das Ziel ändern will, ändert die
   Umgebungsvariable VITE_KONTAKT_ENDPUNKT — nicht das Formular.

   Erwartet wird ein Endpunkt, der POST mit application/json
   entgegennimmt und mit 2xx antwortet. Der Rumpf ist unten als
   KontaktAnfrage beschrieben.

   SOLANGE KEIN ZIEL GESETZT IST
   läuft der Versand als Probelauf: er wartet kurz und meldet Erfolg,
   damit die Zustände des Formulars bedienbar und prüfbar bleiben. Im
   Protokoll steht dann eine Warnung. Das ist ausdrücklich KEIN
   Versand — es geht nichts hinaus.
   ═══════════════════════════════════════════════════════════ */

export interface KontaktAnfrage {
  name: string;
  email: string;
  /** Kann leer sein — das Feld ist optional. */
  telefon: string;
  nachricht: string;
  /** Sprache der Oberfläche zum Zeitpunkt der Absendung. */
  sprache: string;
}

const ENDPUNKT: string =
  (import.meta.env?.VITE_KONTAKT_ENDPUNKT as string | undefined)?.trim() ?? "";

export const ZIEL_KONFIGURIERT = ENDPUNKT.length > 0;

/** Wie lange der Probelauf tut, als ginge etwas hinaus. */
const PROBELAUF_MS = 900;

/**
 * Sendet die Anfrage. Wirft bei jedem Misserfolg — der Aufrufer
 * zeigt daraufhin den technischen Fehler und behält alle Eingaben.
 */
export async function kontaktSenden(daten: KontaktAnfrage): Promise<void> {
  if (!ZIEL_KONFIGURIERT) {
    console.warn(
      "[Kontakt] Kein Ziel gesetzt (VITE_KONTAKT_ENDPUNKT). " +
        "Probelauf — es wurde nichts versendet.",
      daten,
    );
    await new Promise((r) => setTimeout(r, PROBELAUF_MS));
    return;
  }

  const antwort = await fetch(ENDPUNKT, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(daten),
  });
  if (!antwort.ok) {
    throw new Error(`Kontaktziel antwortete mit ${antwort.status}`);
  }
}
