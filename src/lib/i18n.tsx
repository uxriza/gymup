import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from "react";
import { enUS, id as dateFnsId } from "date-fns/locale";

export type Language = "id" | "en";

type I18nContextValue = {
  language: Language;
  setLanguage: (language: Language) => void;
  toggleLanguage: () => void;
  dateLocale: typeof dateFnsId;
};

const STORAGE_KEY = "gymup-language";

const I18nContext = createContext<I18nContextValue | undefined>(undefined);

const getInitialLanguage = (): Language => {
  if (typeof window === "undefined") return "id";
  const storedLanguage = window.localStorage.getItem(STORAGE_KEY);
  return storedLanguage === "en" ? "en" : "id";
};

export function I18nProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(getInitialLanguage);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, language);
    document.documentElement.lang = language;
  }, [language]);

  const value = useMemo<I18nContextValue>(
    () => ({
      language,
      setLanguage: (nextLanguage) => setLanguageState(nextLanguage),
      toggleLanguage: () => setLanguageState((current) => (current === "id" ? "en" : "id")),
      dateLocale: language === "en" ? enUS : dateFnsId,
    }),
    [language],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error("useI18n must be used inside I18nProvider");
  }

  return context;
}
