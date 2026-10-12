import { createRoot } from "react-dom/client";
import App from "./app/App.tsx";
import { SolutionsApp } from "./app/solutions/SolutionsApp.tsx";
import "./styles/index.css";
import { zweiZeilenRegel } from "./app/zweiZeilen";

/* Eingabeart merken (Zeiger oder Tastatur). Safari zeigt den Fokusrahmen
   auch dann, wenn ein Skript den Fokus setzt, nachdem man mit Maus oder
   Finger geklickt hat (z. B. Schliessen-Knopf im Teamporträt, Rücksprung
   auf die Porträtkachel). Nach Zeiger-Eingabe blendet index.css diese
   Rahmen aus; mit Tab oder Pfeiltasten erscheinen sie wie gewohnt. */
const eingabe = (art: "zeiger" | "tastatur") => {
  if (document.documentElement.dataset.eingabe !== art) document.documentElement.dataset.eingabe = art;
};
window.addEventListener("pointerdown", () => eingabe("zeiger"), { capture: true, passive: true });
window.addEventListener("keydown", (e) => {
  if (e.key === "Tab" || e.key.startsWith("Arrow")) eingabe("tastatur");
}, { capture: true });

/* /solutions ist die zweite Stationen-Erfahrung — gleiche App,
   gleiches Deployment, eigener Wurzelbaum. Alles andere (inkl. der
   Unterseiten- und Rechtsrouten) gehört der Hauptseite. */
const wurzel = window.location.pathname.startsWith("/solutions") ? (
  <SolutionsApp />
) : (
  <App />
);

createRoot(document.getElementById("root")!).render(wurzel);

/* Überschriften höchstens zweizeilig (siehe zweiZeilen.ts). */
zweiZeilenRegel();
