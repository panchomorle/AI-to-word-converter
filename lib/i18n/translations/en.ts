import type { Translations } from '../types';

export const en: Translations = {
  // Header
  appName: 'mdword',
  authorCredit: 'by',
  howToUse: 'How to use',
  generating: 'Generating...',
  downloadDocx: 'Download .docx',
  
  // Input panel
  markdownInput: 'Markdown Input',
  csvTables: 'CSV Tables',
  source: 'Source:',
  inputPlaceholder: 'Paste your Markdown with LaTeX formulas here...',
  
  // Preview panel
  preview: 'Preview',
  aiCleanup: 'AI Cleanup',
  
  // Resizer
  dragToResize: 'Drag to resize',
  
  // Info modal
  infoModalTitle: 'How to use mdword',
  infoModalIntro: 'mdword converts text with mathematical formulas (LaTeX) copied from ChatGPT, Gemini or other AIs into Word documents (.docx) with properly formatted equations.',
  
  // Step 1
  step1Title: 'Copy the message correctly',
  step1Warning: 'Important! Do not select text manually. Always use the copy button that appears on each AI message.',
  step1Incorrect: 'Incorrect',
  step1IncorrectDesc: 'Selecting text with the mouse and Ctrl+C loses the formula formatting.',
  step1Correct: 'Correct',
  step1CorrectDesc: 'Using the AI\'s copy button preserves LaTeX formulas.',
  
  // Step 2
  step2Title: 'Select the correct source',
  step2Desc: 'Each AI uses a different format for mathematical formulas:',
  step2GeminiDesc: 'Uses standard LaTeX format with double dollar signs.',
  step2ChatGPTDesc: 'Uses brackets for formula blocks. mdword converts them automatically.',
  step2Tip: '💡 If you select the wrong source, formulas won\'t render correctly.',
  
  // Step 3
  step3Title: 'Paste and generate the document',
  step3Desc1: 'Paste the content in the Markdown Input area',
  step3Desc2: 'Verify that the Preview shows the formulas correctly',
  step3Desc3: 'Enable AI Cleanup if there are issues with escaped characters',
  step3Desc4: 'Click Download .docx',
  
  // Tips
  tipsTitle: '💡 Tips',
  tip1: 'The generated Word document uses native Office equations (OMML)',
  tip2: 'Formulas are editable directly in Microsoft Word',
  tip3: 'Supports fractions, roots, integrals, summations, Greek letters and more',
  tip4: 'If a formula doesn\'t look right, check for LaTeX syntax errors',
  
  // Button
  gotIt: 'Got it!',
  
  // Error message
  errorProcessing: 'Error processing Markdown',
};
