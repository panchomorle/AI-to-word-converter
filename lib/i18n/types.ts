export type Language = 'en' | 'es' | 'zh' | 'ja' | 'ru' | 'ar';

export interface LanguageInfo {
  code: Language;
  name: string;
  nativeName: string;
  dir: 'ltr' | 'rtl';
}

export interface Translations {
  // Header
  appName: string;
  authorCredit: string;
  howToUse: string;
  generating: string;
  downloadDocx: string;
  
  // Input panel
  markdownInput: string;
  csvTables: string;
  source: string;
  inputPlaceholder: string;
  
  // Preview panel
  preview: string;
  aiCleanup: string;
  
  // Resizer
  dragToResize: string;
  
  // Info modal
  infoModalTitle: string;
  infoModalIntro: string;
  
  // Step 1
  step1Title: string;
  step1Warning: string;
  step1Incorrect: string;
  step1IncorrectDesc: string;
  step1Correct: string;
  step1CorrectDesc: string;
  
  // Step 2
  step2Title: string;
  step2Desc: string;
  step2GeminiDesc: string;
  step2ChatGPTDesc: string;
  step2Tip: string;
  
  // Step 3
  step3Title: string;
  step3Desc1: string;
  step3Desc2: string;
  step3Desc3: string;
  step3Desc4: string;
  
  // Tips
  tipsTitle: string;
  tip1: string;
  tip2: string;
  tip3: string;
  tip4: string;
  
  // Button
  gotIt: string;
  
  // Error message
  errorProcessing: string;
}

export const SUPPORTED_LANGUAGES: LanguageInfo[] = [
  { code: 'en', name: 'English', nativeName: 'English', dir: 'ltr' },
  { code: 'es', name: 'Spanish', nativeName: 'Español', dir: 'ltr' },
  { code: 'zh', name: 'Chinese', nativeName: '中文', dir: 'ltr' },
  { code: 'ja', name: 'Japanese', nativeName: '日本語', dir: 'ltr' },
  { code: 'ru', name: 'Russian', nativeName: 'Русский', dir: 'ltr' },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية', dir: 'rtl' },
];
