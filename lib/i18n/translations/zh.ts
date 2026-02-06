import type { Translations } from '../types';

export const zh: Translations = {
  // Header
  appName: 'MD2Word',
  appSubtitle: 'Markdown + LaTeX → Word',
  howToUse: '使用说明',
  generating: '生成中...',
  downloadDocx: '下载 .docx',
  
  // Input panel
  markdownInput: 'Markdown 输入',
  csvTables: 'CSV 表格',
  source: '来源：',
  inputPlaceholder: '在此粘贴包含 LaTeX 公式的 Markdown...',
  
  // Preview panel
  preview: '预览',
  aiCleanup: 'AI 清理',
  
  // Resizer
  dragToResize: '拖动调整大小',
  
  // Info modal
  infoModalTitle: '如何使用 MD2Word',
  infoModalIntro: 'MD2Word 将从 ChatGPT、Gemini 或其他 AI 复制的包含数学公式（LaTeX）的文本转换为格式正确的 Word 文档（.docx）。',
  
  // Step 1
  step1Title: '正确复制消息',
  step1Warning: '重要！不要手动选择文本。请始终使用 AI 消息上的复制按钮。',
  step1Incorrect: '错误方式',
  step1IncorrectDesc: '使用鼠标选择文本并按 Ctrl+C 会丢失公式格式。',
  step1Correct: '正确方式',
  step1CorrectDesc: '使用 AI 的复制按钮可以保留 LaTeX 公式。',
  
  // Step 2
  step2Title: '选择正确的来源',
  step2Desc: '每个 AI 使用不同的数学公式格式：',
  step2GeminiDesc: '使用双美元符号的标准 LaTeX 格式。',
  step2ChatGPTDesc: '使用方括号表示公式块。MD2Word 会自动转换。',
  step2Tip: '💡 如果选择了错误的来源，公式将无法正确显示。',
  
  // Step 3
  step3Title: '粘贴并生成文档',
  step3Desc1: '将内容粘贴到 Markdown 输入区域',
  step3Desc2: '确认预览正确显示公式',
  step3Desc3: '如果转义字符有问题，请启用 AI 清理',
  step3Desc4: '点击下载 .docx',
  
  // Tips
  tipsTitle: '💡 提示',
  tip1: '生成的 Word 文档使用 Office 原生公式（OMML）',
  tip2: '公式可以直接在 Microsoft Word 中编辑',
  tip3: '支持分数、根号、积分、求和、希腊字母等',
  tip4: '如果公式显示不正确，请检查 LaTeX 语法错误',
  
  // Button
  gotIt: '知道了！',
  
  // Error message
  errorProcessing: 'Markdown 处理错误',
};
