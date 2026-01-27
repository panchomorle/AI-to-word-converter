"use client";

import { X, Copy, FileDown, Settings2, AlertCircle, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface InfoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function InfoModal({ isOpen, onClose }: InfoModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-card border border-border rounded-xl shadow-2xl max-w-2xl w-full mx-4 max-h-[85vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-secondary/30">
          <h2 className="text-xl font-semibold text-foreground">
            Cómo usar MD2Word
          </h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-8 w-8 rounded-full"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
          {/* Intro */}
          <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
            <p className="text-sm text-foreground">
              <strong>MD2Word</strong> convierte texto con fórmulas matemáticas (LaTeX) 
              copiado desde ChatGPT, Gemini u otras IAs a documentos Word (.docx) con 
              las ecuaciones correctamente formateadas.
            </p>
          </div>

          {/* Step 1: Copy correctly */}
          <section>
            <h3 className="flex items-center gap-2 text-lg font-semibold text-foreground mb-3">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-sm font-bold">1</span>
              Copia el mensaje correctamente
            </h3>
            <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4 mb-3">
              <div className="flex gap-2">
                <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                <div className="text-sm text-foreground">
                  <strong className="text-amber-500">¡Importante!</strong> No selecciones el texto manualmente. 
                  Usa siempre el <strong>botón de copiar</strong> que aparece en cada mensaje de la IA.
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-2">
                  <X className="w-4 h-4 text-red-500" />
                  <span className="text-sm font-medium text-red-400">Incorrecto</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Seleccionar texto con el mouse y Ctrl+C pierde el formato de las fórmulas.
                </p>
              </div>
              <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                  <span className="text-sm font-medium text-green-400">Correcto</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Usar el botón <Copy className="w-3 h-3 inline mx-1" /> de la IA preserva las fórmulas LaTeX.
                </p>
              </div>
            </div>
          </section>

          {/* Step 2: Select source */}
          <section>
            <h3 className="flex items-center gap-2 text-lg font-semibold text-foreground mb-3">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-sm font-bold">2</span>
              Selecciona la fuente correcta
            </h3>
            <p className="text-sm text-muted-foreground mb-3">
              Cada IA usa un formato diferente para las fórmulas matemáticas:
            </p>
            <div className="space-y-2">
              <div className="bg-secondary/50 rounded-lg p-3 border border-border">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium text-foreground">Gemini</span>
                  <code className="text-xs bg-secondary px-2 py-0.5 rounded text-primary">$$fórmula$$</code>
                </div>
                <p className="text-xs text-muted-foreground">
                  Usa el formato estándar de LaTeX con signos de dólar dobles.
                </p>
              </div>
              <div className="bg-secondary/50 rounded-lg p-3 border border-border">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium text-foreground">ChatGPT</span>
                  <code className="text-xs bg-secondary px-2 py-0.5 rounded text-primary">[fórmula]</code>
                </div>
                <p className="text-xs text-muted-foreground">
                  Usa corchetes para bloques de fórmulas. MD2Word los convierte automáticamente.
                </p>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-3 italic">
              💡 Si seleccionas la fuente incorrecta, las fórmulas no se renderizarán correctamente.
            </p>
          </section>

          {/* Step 3: Paste and generate */}
          <section>
            <h3 className="flex items-center gap-2 text-lg font-semibold text-foreground mb-3">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-sm font-bold">3</span>
              Pega y genera el documento
            </h3>
            <ol className="text-sm text-muted-foreground space-y-2 list-decimal list-inside">
              <li>Pega el contenido en el área de <strong className="text-foreground">Markdown Input</strong></li>
              <li>Verifica que la <strong className="text-foreground">Vista Previa</strong> muestre las fórmulas correctamente</li>
              <li>
                Activa <Settings2 className="w-3 h-3 inline mx-1" /> <strong className="text-foreground">Limpieza IA</strong> si 
                hay problemas con caracteres escapados
              </li>
              <li>
                Haz clic en <FileDown className="w-3 h-3 inline mx-1" /> <strong className="text-foreground">Descargar .docx</strong>
              </li>
            </ol>
          </section>

          {/* Tips */}
          <section className="bg-secondary/30 rounded-lg p-4 border border-border">
            <h4 className="font-medium text-foreground mb-2">💡 Consejos</h4>
            <ul className="text-xs text-muted-foreground space-y-1.5">
              <li>• El documento Word generado usa ecuaciones nativas de Office (OMML)</li>
              <li>• Las fórmulas son editables directamente en Microsoft Word</li>
              <li>• Soporta fracciones, raíces, integrales, sumatorias, letras griegas y más</li>
              <li>• Si una fórmula no se ve bien, revisa que no tenga errores de sintaxis LaTeX</li>
            </ul>
          </section>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-border bg-secondary/30">
          <Button onClick={onClose} className="w-full">
            ¡Entendido!
          </Button>
        </div>
      </div>
    </div>
  );
}
