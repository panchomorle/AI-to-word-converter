"use client";

import React from "react"

import { useState, useCallback, useEffect } from "react";
import { FileDown, Sparkles, Settings2, FileText, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import MarkdownPreview from "@/components/markdown-preview";
import { generateDocx } from "@/lib/docx-generator";
import Confetti from "@/components/confetti";

const sampleMarkdown = `# Ejemplo de Documento Técnico

## Introducción a las Ecuaciones

La famosa ecuación de Einstein establece que la energía es igual a la masa por la velocidad de la luz al cuadrado:

$$E = mc^2$$

## Fórmulas Matemáticas

La fórmula cuadrática para resolver ecuaciones de segundo grado es:

$$x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}$$

También podemos usar matemáticas inline como $\\alpha + \\beta = \\gamma$ dentro del texto.

### Integrales y Derivadas

La integral definida se expresa como:

$$\\int_{a}^{b} f(x) \\, dx = F(b) - F(a)$$

Y la derivada parcial:

$$\\frac{\\partial f}{\\partial x} = \\lim_{h \\to 0} \\frac{f(x+h, y) - f(x, y)}{h}$$
`;

export default function MarkdownToWordConverter() {
  const [markdown, setMarkdown] = useState(sampleMarkdown);
  const [autoClean, setAutoClean] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [cleanedMarkdown, setCleanedMarkdown] = useState(sampleMarkdown);

  // Regex cleaning function for AI over-escaping
  const cleanAIMarkdown = useCallback((text: string): string => {
    let cleaned = text;
    
    // Fix over-escaped operators
    cleaned = cleaned.replace(/\\\\+/g, "+");
    cleaned = cleaned.replace(/\\\\=/g, "=");
    cleaned = cleaned.replace(/\\\\-/g, "-");
    cleaned = cleaned.replace(/\\\\\(/g, "(");
    cleaned = cleaned.replace(/\\\\\)/g, ")");
    
    // Fix double backslashes in LaTeX commands
    cleaned = cleaned.replace(/\\\\frac/g, "\\frac");
    cleaned = cleaned.replace(/\\\\sqrt/g, "\\sqrt");
    cleaned = cleaned.replace(/\\\\int/g, "\\int");
    cleaned = cleaned.replace(/\\\\sum/g, "\\sum");
    cleaned = cleaned.replace(/\\\\prod/g, "\\prod");
    cleaned = cleaned.replace(/\\\\lim/g, "\\lim");
    cleaned = cleaned.replace(/\\\\alpha/g, "\\alpha");
    cleaned = cleaned.replace(/\\\\beta/g, "\\beta");
    cleaned = cleaned.replace(/\\\\gamma/g, "\\gamma");
    cleaned = cleaned.replace(/\\\\delta/g, "\\delta");
    cleaned = cleaned.replace(/\\\\partial/g, "\\partial");
    cleaned = cleaned.replace(/\\\\infty/g, "\\infty");
    cleaned = cleaned.replace(/\\\\pm/g, "\\pm");
    cleaned = cleaned.replace(/\\\\times/g, "\\times");
    cleaned = cleaned.replace(/\\\\cdot/g, "\\cdot");
    cleaned = cleaned.replace(/\\\\ldots/g, "\\ldots");
    cleaned = cleaned.replace(/\\\\left/g, "\\left");
    cleaned = cleaned.replace(/\\\\right/g, "\\right");
    
    return cleaned;
  }, []);

  // Update cleaned markdown when input changes or autoClean toggles
  useEffect(() => {
    if (autoClean) {
      setCleanedMarkdown(cleanAIMarkdown(markdown));
    } else {
      setCleanedMarkdown(markdown);
    }
  }, [markdown, autoClean, cleanAIMarkdown]);

  // Handle paste to preserve formulas from Gemini/ChatGPT/Claude
  const handlePaste = useCallback((e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const clipboardData = e.clipboardData;
    
    // Check for custom markdown mime types some apps use (highest priority)
    const customTypes = ["text/markdown", "text/x-markdown", "application/x-markdown"];
    for (const mimeType of customTypes) {
      const customContent = clipboardData.getData(mimeType);
      if (customContent && customContent.trim()) {
        e.preventDefault();
        const textarea = e.currentTarget;
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const newValue = markdown.slice(0, start) + customContent + markdown.slice(end);
        setMarkdown(newValue);
        
        setTimeout(() => {
          textarea.selectionStart = textarea.selectionEnd = start + customContent.length;
        }, 0);
        return;
      }
    }
    
    // Try to get HTML content and convert to Markdown
    const htmlContent = clipboardData.getData("text/html");
    const plainText = clipboardData.getData("text/plain");
    
    if (htmlContent) {
      const parser = new DOMParser();
      const doc = parser.parseFromString(htmlContent, "text/html");
      
      // Convert HTML back to Markdown preserving structure
      const convertToMarkdown = (element: Element): string => {
        let result = "";
        
        for (const node of Array.from(element.childNodes)) {
          if (node.nodeType === Node.TEXT_NODE) {
            result += node.textContent || "";
          } else if (node.nodeType === Node.ELEMENT_NODE) {
            const el = node as Element;
            const tagName = el.tagName.toLowerCase();
            
            switch (tagName) {
              case "h1":
                result += `\n# ${convertToMarkdown(el).trim()}\n\n`;
                break;
              case "h2":
                result += `\n## ${convertToMarkdown(el).trim()}\n\n`;
                break;
              case "h3":
                result += `\n### ${convertToMarkdown(el).trim()}\n\n`;
                break;
              case "h4":
                result += `\n#### ${convertToMarkdown(el).trim()}\n\n`;
                break;
              case "h5":
                result += `\n##### ${convertToMarkdown(el).trim()}\n\n`;
                break;
              case "h6":
                result += `\n###### ${convertToMarkdown(el).trim()}\n\n`;
                break;
              case "p":
                result += `\n${convertToMarkdown(el).trim()}\n\n`;
                break;
              case "br":
                result += "\n";
                break;
              case "strong":
              case "b":
                result += `**${convertToMarkdown(el)}**`;
                break;
              case "em":
              case "i":
                result += `*${convertToMarkdown(el)}*`;
                break;
              case "code":
                // Check if it's inside a pre (code block) or inline
                if (el.parentElement?.tagName.toLowerCase() === "pre") {
                  result += convertToMarkdown(el);
                } else {
                  result += `\`${convertToMarkdown(el)}\``;
                }
                break;
              case "pre":
                result += `\n\`\`\`\n${convertToMarkdown(el).trim()}\n\`\`\`\n\n`;
                break;
              case "ul":
                result += "\n" + convertToMarkdown(el) + "\n";
                break;
              case "ol":
                let counter = 1;
                for (const li of Array.from(el.children)) {
                  if (li.tagName.toLowerCase() === "li") {
                    result += `${counter}. ${convertToMarkdown(li as Element).trim()}\n`;
                    counter++;
                  }
                }
                result += "\n";
                break;
              case "li":
                if (el.parentElement?.tagName.toLowerCase() === "ul") {
                  result += `- ${convertToMarkdown(el).trim()}\n`;
                } else {
                  result += convertToMarkdown(el);
                }
                break;
              case "a":
                const href = el.getAttribute("href") || "";
                result += `[${convertToMarkdown(el)}](${href})`;
                break;
              case "blockquote":
                const lines = convertToMarkdown(el).trim().split("\n");
                result += "\n" + lines.map(line => `> ${line}`).join("\n") + "\n\n";
                break;
              case "div":
              case "span":
                // Check for math/katex classes
                if (el.classList.contains("math") || el.classList.contains("katex") || el.hasAttribute("data-math")) {
                  // Try to get the original LaTeX from data attributes or text
                  const latex = el.getAttribute("data-latex") || el.textContent || "";
                  if (latex.includes("\\") || latex.includes("^") || latex.includes("_")) {
                    result += latex;
                  } else {
                    result += convertToMarkdown(el);
                  }
                } else {
                  result += convertToMarkdown(el);
                }
                break;
              default:
                result += convertToMarkdown(el);
            }
          }
        }
        
        return result;
      };
      
      let extractedMarkdown = convertToMarkdown(doc.body);
      
      // Clean up excessive newlines
      extractedMarkdown = extractedMarkdown
        .replace(/\n{3,}/g, "\n\n")
        .trim();
      
      // Check if the HTML conversion preserved more content (especially $) than plain text
      const htmlHasMath = extractedMarkdown.includes("$") || extractedMarkdown.includes("\\");
      const plainHasMath = plainText.includes("$") || plainText.includes("\\");
      const htmlHasStructure = extractedMarkdown.includes("#") || extractedMarkdown.includes("**") || extractedMarkdown.includes("- ");
      const plainHasStructure = plainText.includes("#") || plainText.includes("**") || plainText.includes("- ");
      
      // Use HTML conversion if it has math AND structure, or if plain text lacks structure
      if ((htmlHasMath && htmlHasStructure) || (htmlHasMath && !plainHasStructure)) {
        e.preventDefault();
        const textarea = e.currentTarget;
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const newValue = markdown.slice(0, start) + extractedMarkdown + markdown.slice(end);
        setMarkdown(newValue);
        
        setTimeout(() => {
          textarea.selectionStart = textarea.selectionEnd = start + extractedMarkdown.length;
        }, 0);
        return;
      }
      
      // If plain text has better structure, use it instead
      if (plainHasStructure && plainHasMath) {
        // Let default paste behavior happen with plain text
        return;
      }
      
      // If HTML has structure but plain doesn't, prefer HTML
      if (htmlHasStructure && !plainHasStructure) {
        e.preventDefault();
        const textarea = e.currentTarget;
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const newValue = markdown.slice(0, start) + extractedMarkdown + markdown.slice(end);
        setMarkdown(newValue);
        
        setTimeout(() => {
          textarea.selectionStart = textarea.selectionEnd = start + extractedMarkdown.length;
        }, 0);
        return;
      }
    }
    
    // Fallback: let the default text/plain behavior happen
  }, [markdown]);

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      await generateDocx(cleanedMarkdown);
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 3000);
    } catch (error) {
      console.error("Error generating document:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {showConfetti && <Confetti />}
      
      {/* Header */}
      <header className="border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10">
                <FileText className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-foreground tracking-tight">
                  MD2Word
                </h1>
                <p className="text-xs text-muted-foreground">
                  Markdown + LaTeX → Word
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-secondary/50">
                <Settings2 className="w-4 h-4 text-muted-foreground" />
                <Label htmlFor="auto-clean" className="text-sm text-muted-foreground cursor-pointer">
                  Limpieza IA
                </Label>
                <Switch
                  id="auto-clean"
                  checked={autoClean}
                  onCheckedChange={setAutoClean}
                />
              </div>
              
              <Button 
                onClick={handleGenerate}
                disabled={isGenerating || !markdown.trim()}
                className="gap-2"
              >
                {isGenerating ? (
                  <>
                    <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                    Generando...
                  </>
                ) : (
                  <>
                    <FileDown className="w-4 h-4" />
                    Descargar .docx
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[calc(100vh-140px)]">
          {/* Input Panel */}
          <Card className="flex flex-col overflow-hidden">
            <div className="flex items-center gap-2 px-4 py-3 border-b border-border bg-secondary/30">
              <FileText className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium text-foreground">Markdown Input</span>
              <div className="ml-auto flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-primary" />
                <span className="text-xs text-muted-foreground">
                  Pega texto de ChatGPT, Gemini, Claude...
                </span>
              </div>
            </div>
            <CardContent className="flex-1 p-0">
              <Textarea
                value={markdown}
                onChange={(e) => setMarkdown(e.target.value)}
                onPaste={handlePaste}
                placeholder="Pega aquí tu Markdown con fórmulas LaTeX..."
                className="h-full min-h-[500px] resize-none border-0 rounded-none font-mono text-sm bg-input/50 focus-visible:ring-0 focus-visible:ring-offset-0"
              />
            </CardContent>
          </Card>

          {/* Preview Panel */}
          <Card className="flex flex-col overflow-hidden">
            <div className="flex items-center gap-2 px-4 py-3 border-b border-border bg-secondary/30">
              <Eye className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium text-foreground">Vista Previa</span>
              {autoClean && (
                <div className="ml-auto">
                  <span className="text-xs text-primary bg-primary/10 px-2 py-1 rounded">
                    Limpieza activa
                  </span>
                </div>
              )}
            </div>
            <CardContent className="flex-1 p-4 overflow-auto bg-card">
              <MarkdownPreview markdown={cleanedMarkdown} />
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
