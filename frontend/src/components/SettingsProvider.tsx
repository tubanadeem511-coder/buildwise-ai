"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

export type Language = "en" | "ur" | "ar" | "zh";
export type Theme = "light" | "dark";

export type Currency =
  | "PKR"
  | "USD"
  | "AED"
  | "SAR"
  | "GBP"
  | "EUR";

interface SettingsContextType {
  language: Language;
  setLanguage: (language: Language) => void;

  theme: Theme;
  setTheme: (theme: Theme) => void;

  currency: Currency;
  setCurrency: (currency: Currency) => void;

  isDark: boolean;
  isRTL: boolean;
}

const SettingsContext = createContext<SettingsContextType | undefined>(
  undefined
);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>("en");
  const [theme, setTheme] = useState<Theme>("light");
  const [currency, setCurrency] = useState<Currency>("PKR");
  const [settingsLoaded, setSettingsLoaded] = useState(false);

  // Load saved settings when the application starts
  useEffect(() => {
    try {
      const savedLanguage = localStorage.getItem("buildwise-language");
      const savedTheme = localStorage.getItem("buildwise-theme");
      const savedCurrency = localStorage.getItem("buildwise-currency");

      // Language
      if (
        savedLanguage === "en" ||
        savedLanguage === "ur" ||
        savedLanguage === "ar" ||
        savedLanguage === "zh"
      ) {
        setLanguage(savedLanguage);
      }

      // Theme
      if (savedTheme === "light" || savedTheme === "dark") {
        setTheme(savedTheme);
      }

      // Currency
      if (
        savedCurrency === "PKR" ||
        savedCurrency === "USD" ||
        savedCurrency === "AED" ||
        savedCurrency === "SAR" ||
        savedCurrency === "GBP" ||
        savedCurrency === "EUR"
      ) {
        setCurrency(savedCurrency);
      }
    } catch (error) {
      console.info("Could not load saved preferences.", error);
    }

    setSettingsLoaded(true);
  }, []);

  // Apply settings globally and save them
  useEffect(() => {
    if (!settingsLoaded) return;

    const isRTL = language === "ur" || language === "ar";

    document.documentElement.classList.toggle("dark", theme === "dark");
    document.documentElement.lang = language;
    document.documentElement.dir = isRTL ? "rtl" : "ltr";
    document.documentElement.style.colorScheme = theme;

    try {
      localStorage.setItem("buildwise-language", language);
      localStorage.setItem("buildwise-theme", theme);
      localStorage.setItem("buildwise-currency", currency);
    } catch (error) {
      console.info("Could not save preferences.", error);
    }
  }, [language, theme, currency, settingsLoaded]);

  const isDark = theme === "dark";
  const isRTL = language === "ur" || language === "ar";

  return (
    <SettingsContext.Provider
      value={{
        language,
        setLanguage,
        theme,
        setTheme,
        currency,
        setCurrency,
        isDark,
        isRTL,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);

  if (!context) {
    throw new Error("useSettings must be used inside SettingsProvider");
  }

  return context;
}