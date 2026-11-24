"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";
import {
  Locale,
  DICTIONARIES,
  DEFAULT_LOCALE,
  TranslationKey,
  SUPPORTED_LOCALES,
} from "@/lib/i18n";

const STORAGE_KEY = "licensecert_locale";

interface LanguageContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: TranslationKey) => string;
  supportedLocales: typeof SUPPORTED_LOCALES;
  currentLocaleInfo: (typeof SUPPORTED_LOCALES)[number];
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(DEFAULT_LOCALE);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Read saved locale from localStorage on mount
    const saved = localStorage.getItem(STORAGE_KEY) as Locale | null;
    if (saved && ["en", "kk", "ru"].includes(saved)) {
      setLocaleState(saved);
    } else {
      // Auto-detect browser language
      const browserLang = navigator.language?.toLowerCase().slice(0, 2);
      if (browserLang === "kk") setLocaleState("kk");
      else if (browserLang === "ru") setLocaleState("ru");
      else setLocaleState("en");
    }
    setMounted(true);
  }, []);

  const setLocale = useCallback((newLocale: Locale) => {
    setLocaleState(newLocale);
    localStorage.setItem(STORAGE_KEY, newLocale);
    // Update html lang attribute
    document.documentElement.setAttribute("lang", newLocale);
  }, []);

  const t = useCallback(
    (key: TranslationKey): string => {
      const dict = DICTIONARIES[locale] as Record<string, string>;
      return dict[key] ?? (DICTIONARIES.en as Record<string, string>)[key] ?? key;
    },
    [locale]
  );

  const currentLocaleInfo =
    SUPPORTED_LOCALES.find((l) => l.code === locale) ?? SUPPORTED_LOCALES[0];

  // Prevent flash before hydration
  if (!mounted) {
    return (
      <LanguageContext.Provider
        value={{
          locale: DEFAULT_LOCALE,
          setLocale,
          t: (key) => (DICTIONARIES.en as Record<string, string>)[key] ?? key,
          supportedLocales: SUPPORTED_LOCALES,
          currentLocaleInfo: SUPPORTED_LOCALES[0],
        }}
      >
        {children}
      </LanguageContext.Provider>
    );
  }

  return (
    <LanguageContext.Provider
      value={{ locale, setLocale, t, supportedLocales: SUPPORTED_LOCALES, currentLocaleInfo }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage(): LanguageContextValue {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used inside <LanguageProvider>");
  return ctx;
}
