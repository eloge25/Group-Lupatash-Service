import React, { createContext, useContext, useState } from "react";
import { TRANSLATIONS } from "./translations";

const LanguageContext = createContext(null);

export function LanguageProvider({ children }) {
  const [lang, setLangState] = useState(() => localStorage.getItem("gls-lang") || "fr");
  const setLang = (l) => {
    setLangState(l);
    localStorage.setItem("gls-lang", l);
  };
  return (
    <LanguageContext.Provider value={{ lang, setLang, t: TRANSLATIONS[lang] }}>
      {children}
    </LanguageContext.Provider>
  );
}

export const useLang = () => useContext(LanguageContext);
