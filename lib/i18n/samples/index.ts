import { sampleMarkdownEn } from './en';
import { sampleMarkdownEs } from './es';
import { sampleMarkdownZh } from './zh';
import { sampleMarkdownJa } from './ja';
import { sampleMarkdownRu } from './ru';
import { sampleMarkdownAr } from './ar';
import type { Language } from '../types';

export const sampleMarkdowns: Record<Language, string> = {
  en: sampleMarkdownEn,
  es: sampleMarkdownEs,
  zh: sampleMarkdownZh,
  ja: sampleMarkdownJa,
  ru: sampleMarkdownRu,
  ar: sampleMarkdownAr,
};

export function getSampleMarkdown(lang: Language): string {
  return sampleMarkdowns[lang] || sampleMarkdowns.en;
}

export * from './en';
export * from './es';
export * from './zh';
export * from './ja';
export * from './ru';
export * from './ar';
