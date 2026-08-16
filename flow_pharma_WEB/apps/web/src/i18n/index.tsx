"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { Language } from "@/types/common";
import type { Dict } from "./types";
import { en } from "./en";
import { hi } from "./hi";
import { mr } from "./mr";

const dictionaries: Record<Language, Dict> = { en, hi, mr };

const LANG_KEY = "flow-lang";

interface I18nContextValue {
  lang: Language;
  dir: "ltr";
  t: Dict;
  setLang: (lang: Language) => void;
  tl: (key: string) => string;
}

const I18nContext = createContext<I18nContextValue | null>(null);

function resolveInitial(): Language {
  if (typeof window === "undefined") return "en";
  const stored = window.localStorage.getItem(LANG_KEY);
  if (stored === "en" || stored === "hi" || stored === "mr") return stored;
  const nav = navigator.language?.toLowerCase() ?? "";
  if (nav.startsWith("hi")) return "hi";
  if (nav.startsWith("mr")) return "mr";
  return "en";
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Language>("en");

  useEffect(() => {
    setLangState(resolveInitial());
  }, []);

  const setLang = useCallback((next: Language) => {
    setLangState(next);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(LANG_KEY, next);
    }
  }, []);

  useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.lang = lang;
    }
  }, [lang]);

  const value = useMemo<I18nContextValue>(
    () => ({
      lang,
      dir: "ltr",
      t: dictionaries[lang],
      setLang,
      tl: (key: string) => key,
    }),
    [lang, setLang],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used within I18nProvider");
  return ctx;
}

export function useDict(): Dict {
  return useI18n().t;
}
