"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import type { Language, Translations, LanguageInfo } from '@/lib/i18n/types';
import { SUPPORTED_LANGUAGES } from '@/lib/i18n/types';
import { getTranslation } from '@/lib/i18n/translations';
import { getSampleMarkdown } from '@/lib/i18n/samples';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: Translations;
  sampleMarkdown: string;
  languageInfo: LanguageInfo;
  supportedLanguages: LanguageInfo[];
}

// Default values for SSR
const defaultLanguage: Language = 'en';
const defaultTranslations = getTranslation(defaultLanguage);
const defaultSampleMarkdown = getSampleMarkdown(defaultLanguage);
const defaultLanguageInfo = SUPPORTED_LANGUAGES.find(l => l.code === defaultLanguage) || SUPPORTED_LANGUAGES[0];

const LanguageContext = createContext<LanguageContextType>({
  language: defaultLanguage,
  setLanguage: () => {},
  t: defaultTranslations,
  sampleMarkdown: defaultSampleMarkdown,
  languageInfo: defaultLanguageInfo,
  supportedLanguages: SUPPORTED_LANGUAGES,
});

const STORAGE_KEY = 'md2word-language';

function detectBrowserLanguage(): Language {
  if (typeof window === 'undefined') return 'en';
  
  const browserLang = navigator.language.toLowerCase();
  
  // Check for exact match first
  for (const lang of SUPPORTED_LANGUAGES) {
    if (browserLang === lang.code || browserLang.startsWith(`${lang.code}-`)) {
      return lang.code;
    }
  }
  
  // Check for partial match (e.g., 'zh-CN' -> 'zh')
  const shortCode = browserLang.split('-')[0];
  for (const lang of SUPPORTED_LANGUAGES) {
    if (shortCode === lang.code) {
      return lang.code;
    }
  }
  
  return 'en';
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>(defaultLanguage);
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize language from storage or browser
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored && SUPPORTED_LANGUAGES.some(l => l.code === stored)) {
      setLanguageState(stored as Language);
    } else {
      setLanguageState(detectBrowserLanguage());
    }
    setIsInitialized(true);
  }, []);

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem(STORAGE_KEY, lang);
    
    // Update document direction for RTL languages
    const langInfo = SUPPORTED_LANGUAGES.find(l => l.code === lang);
    if (langInfo) {
      document.documentElement.dir = langInfo.dir;
      document.documentElement.lang = lang;
    }
  }, []);

  // Set initial direction
  useEffect(() => {
    if (isInitialized) {
      const langInfo = SUPPORTED_LANGUAGES.find(l => l.code === language);
      if (langInfo) {
        document.documentElement.dir = langInfo.dir;
        document.documentElement.lang = language;
      }
    }
  }, [language, isInitialized]);

  const t = useMemo(() => getTranslation(language), [language]);
  const sampleMarkdown = useMemo(() => getSampleMarkdown(language), [language]);
  const languageInfo = useMemo(
    () => SUPPORTED_LANGUAGES.find(l => l.code === language) || SUPPORTED_LANGUAGES[0],
    [language]
  );

  const contextValue = useMemo<LanguageContextType>(() => ({
    language,
    setLanguage,
    t,
    sampleMarkdown,
    languageInfo,
    supportedLanguages: SUPPORTED_LANGUAGES,
  }), [language, setLanguage, t, sampleMarkdown, languageInfo]);

  return (
    <LanguageContext.Provider value={contextValue}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  return context;
}
