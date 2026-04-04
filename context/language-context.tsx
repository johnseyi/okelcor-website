"use client";

import { createContext, useContext, useEffect, useState } from "react";
import {
  type Locale,
  type Translations,
  translations,
  defaultLocale,
} from "@/lib/translations";

type LanguageContextValue = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: Translations;
};

const LanguageContext = createContext<LanguageContextValue>({
  locale: defaultLocale,
  setLocale: () => {},
  t: translations[defaultLocale],
});

const STORAGE_KEY = "okelcor_locale";
const COOKIE_NAME = "okelcor_locale";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 365; // 1 year

function persistLocale(value: Locale) {
  localStorage.setItem(STORAGE_KEY, value);
  document.cookie = `${COOKIE_NAME}=${value};path=/;max-age=${COOKIE_MAX_AGE};SameSite=Lax`;
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(defaultLocale);

  // Restore saved locale on mount and sync cookie so server components see it
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY) as Locale | null;
    if (stored && stored in translations) {
      setLocaleState(stored);
      persistLocale(stored);
    }
  }, []);

  // Keep <html lang="..."> in sync
  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  const setLocale = (next: Locale) => {
    setLocaleState(next);
    persistLocale(next);
  };

  return (
    <LanguageContext.Provider value={{ locale, setLocale, t: translations[locale] }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
