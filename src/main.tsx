import { createRoot } from "react-dom/client";
import App from "./app/App.tsx";
import { SolutionsApp } from "./app/solutions/SolutionsApp.tsx";
import "./styles/index.css";

/* /solutions ist die zweite Stationen-Erfahrung — gleiche App,
   gleiches Deployment, eigener Wurzelbaum. Alles andere (inkl. der
   Unterseiten- und Rechtsrouten) gehört der Hauptseite. */
const wurzel = window.location.pathname.startsWith("/solutions") ? (
  <SolutionsApp />
) : (
  <App />
);

createRoot(document.getElementById("root")!).render(wurzel);
