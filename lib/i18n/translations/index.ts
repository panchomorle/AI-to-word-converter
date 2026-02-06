import { en } from './en';
import { es } from './es';
import { zh } from './zh';
import { ja } from './ja';
import { ru } from './ru';
import { ar } from './ar';
import type { Language, Translations } from '../types';

export const translations: Record<Language, Translations> = {
  en,
  es,
  zh,
  ja,
  ru,
  ar,
};

export function getTranslation(lang: Language): Translations {
  return translations[lang] || translations.en;
}
