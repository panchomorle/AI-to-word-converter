import type { Translations } from '../types';

export const es: Translations = {
  // Header
  appName: 'MDWord',
  authorCredit: 'hecho por',
  howToUse: 'Cómo usar',
  generating: 'Generando...',
  downloadDocx: 'Descargar .docx',
  
  // Input panel
  markdownInput: 'Markdown Input',
  csvTables: 'Tablas CSV',
  source: 'Fuente:',
  inputPlaceholder: 'Pega aquí tu Markdown con fórmulas LaTeX...',
  
  // Preview panel
  preview: 'Vista Previa',
  aiCleanup: 'Limpieza IA',
  
  // Resizer
  dragToResize: 'Arrastra para redimensionar',
  
  // Info modal
  infoModalTitle: 'Cómo usar MDWord',
  infoModalIntro: 'MDWord convierte texto con fórmulas matemáticas (LaTeX) copiado desde ChatGPT, Gemini u otras IAs a documentos Word (.docx) con las ecuaciones correctamente formateadas.',
  
  // Step 1
  step1Title: 'Copia el mensaje correctamente',
  step1Warning: '¡Importante! No selecciones el texto manualmente. Usa siempre el botón de copiar que aparece en cada mensaje de la IA.',
  step1Incorrect: 'Incorrecto',
  step1IncorrectDesc: 'Seleccionar texto con el mouse y Ctrl+C pierde el formato de las fórmulas.',
  step1Correct: 'Correcto',
  step1CorrectDesc: 'Usar el botón de copiar de la IA preserva las fórmulas LaTeX.',
  
  // Step 2
  step2Title: 'Selecciona la fuente correcta',
  step2Desc: 'Cada IA usa un formato diferente para las fórmulas matemáticas:',
  step2GeminiDesc: 'Usa el formato estándar de LaTeX con signos de dólar dobles.',
  step2ChatGPTDesc: 'Usa corchetes para bloques de fórmulas. MDWord los convierte automáticamente.',
  step2Tip: '💡 Si seleccionas la fuente incorrecta, las fórmulas no se renderizarán correctamente.',
  
  // Step 3
  step3Title: 'Pega y genera el documento',
  step3Desc1: 'Pega el contenido en el área de Markdown Input',
  step3Desc2: 'Verifica que la Vista Previa muestre las fórmulas correctamente',
  step3Desc3: 'Activa Limpieza IA si hay problemas con caracteres escapados',
  step3Desc4: 'Haz clic en Descargar .docx',
  
  // Tips
  tipsTitle: '💡 Consejos',
  tip1: 'El documento Word generado usa ecuaciones nativas de Office (OMML)',
  tip2: 'Las fórmulas son editables directamente en Microsoft Word',
  tip3: 'Soporta fracciones, raíces, integrales, sumatorias, letras griegas y más',
  tip4: 'Si una fórmula no se ve bien, revisa que no tenga errores de sintaxis LaTeX',
  
  // Button
  gotIt: '¡Entendido!',
  
  // Error message
  errorProcessing: 'Error al procesar el Markdown',
};
