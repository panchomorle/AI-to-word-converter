import type { Translations } from '../types';

export const ja: Translations = {
  // Header
  appName: 'MD2Word',
  appSubtitle: 'Markdown + LaTeX → Word',
  howToUse: '使い方',
  generating: '生成中...',
  downloadDocx: '.docx をダウンロード',
  
  // Input panel
  markdownInput: 'Markdown 入力',
  csvTables: 'CSV テーブル',
  source: 'ソース：',
  inputPlaceholder: 'LaTeX 数式を含む Markdown をここに貼り付け...',
  
  // Preview panel
  preview: 'プレビュー',
  aiCleanup: 'AI クリーンアップ',
  
  // Resizer
  dragToResize: 'ドラッグでサイズ変更',
  
  // Info modal
  infoModalTitle: 'MD2Word の使い方',
  infoModalIntro: 'MD2Word は ChatGPT、Gemini などの AI からコピーした数式（LaTeX）を含むテキストを、数式が正しくフォーマットされた Word 文書（.docx）に変換します。',
  
  // Step 1
  step1Title: 'メッセージを正しくコピー',
  step1Warning: '重要！テキストを手動で選択しないでください。AI メッセージに表示されるコピーボタンを必ず使用してください。',
  step1Incorrect: '間違った方法',
  step1IncorrectDesc: 'マウスでテキストを選択して Ctrl+C を押すと、数式のフォーマットが失われます。',
  step1Correct: '正しい方法',
  step1CorrectDesc: 'AI のコピーボタンを使用すると、LaTeX 数式が保持されます。',
  
  // Step 2
  step2Title: '正しいソースを選択',
  step2Desc: '各 AI は数式に異なるフォーマットを使用しています：',
  step2GeminiDesc: 'ダブルドル記号を使用した標準 LaTeX 形式。',
  step2ChatGPTDesc: '数式ブロックに角括弧を使用。MD2Word が自動的に変換します。',
  step2Tip: '💡 間違ったソースを選択すると、数式が正しく表示されません。',
  
  // Step 3
  step3Title: '貼り付けて文書を生成',
  step3Desc1: 'Markdown 入力エリアにコンテンツを貼り付け',
  step3Desc2: 'プレビューで数式が正しく表示されているか確認',
  step3Desc3: 'エスケープ文字に問題がある場合は AI クリーンアップを有効に',
  step3Desc4: '.docx をダウンロードをクリック',
  
  // Tips
  tipsTitle: '💡 ヒント',
  tip1: '生成された Word 文書は Office ネイティブの数式（OMML）を使用',
  tip2: '数式は Microsoft Word で直接編集可能',
  tip3: '分数、根号、積分、総和、ギリシャ文字などをサポート',
  tip4: '数式が正しく表示されない場合は、LaTeX 構文エラーを確認してください',
  
  // Button
  gotIt: '了解！',
  
  // Error message
  errorProcessing: 'Markdown の処理エラー',
};
