import { createContext, useContext, useState, type ReactNode } from "react";
import type { Locale } from "../content";

interface LanguageContextValue {
  lang: Locale;
  setLang: (l: Locale) => void;
}

const Ctx = createContext<LanguageContextValue>({ lang: "de", setLang: () => {} });

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Locale>("de");
  return <Ctx.Provider value={{ lang, setLang }}>{children}</Ctx.Provider>;
}

export function useLanguage() {
  return useContext(Ctx);
}
