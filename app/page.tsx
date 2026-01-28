"use client";

import React from "react"

import { useState, useCallback, useEffect } from "react";
import { FileDown, Sparkles, Settings2, FileText, Eye, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardContentWithRef } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import MarkdownPreview from "@/components/markdown-preview";
import { generateDocx } from "@/lib/docx-generator";
import Confetti from "@/components/confetti";
import InfoModal from "@/components/info-modal";
import type { AISource } from "@/lib/utils/types";

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
  const [parseCsvTables, setParseCsvTables] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [cleanedMarkdown, setCleanedMarkdown] = useState(sampleMarkdown);
  const [aiSource, setAiSource] = useState<AISource>("gemini");
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [leftPanelWidth, setLeftPanelWidth] = useState(50); // percentage
  const [isDragging, setIsDragging] = useState(false);
  
  // Refs for scroll synchronization
  const inputRef = React.useRef<HTMLTextAreaElement>(null);
  const previewRef = React.useRef<HTMLDivElement>(null);
  const syncingFromRef = React.useRef<'input' | 'preview' | null>(null);

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
              case "table":
                // Convert HTML table to Markdown table
                const rows: string[][] = [];
                const headerRow: string[] = [];
                let hasHeader = false;
                
                // Process thead and tbody
                for (const child of Array.from(el.children)) {
                  const childTag = (child as Element).tagName.toLowerCase();
                  if (childTag === "thead") {
                    hasHeader = true;
                    for (const tr of Array.from((child as Element).querySelectorAll("tr"))) {
                      const cells: string[] = [];
                      for (const cell of Array.from(tr.children)) {
                        cells.push(convertToMarkdown(cell as Element).trim().replace(/\|/g, "\\|"));
                      }
                      if (headerRow.length === 0) {
                        headerRow.push(...cells);
                      }
                    }
                  } else if (childTag === "tbody") {
                    for (const tr of Array.from((child as Element).querySelectorAll("tr"))) {
                      const cells: string[] = [];
                      for (const cell of Array.from(tr.children)) {
                        cells.push(convertToMarkdown(cell as Element).trim().replace(/\|/g, "\\|"));
                      }
                      rows.push(cells);
                    }
                  } else if (childTag === "tr") {
                    // Direct tr children (no thead/tbody)
                    const cells: string[] = [];
                    for (const cell of Array.from((child as Element).children)) {
                      const cellTag = (cell as Element).tagName.toLowerCase();
                      const cellContent = convertToMarkdown(cell as Element).trim().replace(/\|/g, "\\|");
                      if (cellTag === "th" && !hasHeader) {
                        headerRow.push(cellContent);
                      } else {
                        cells.push(cellContent);
                      }
                    }
                    if (cells.length > 0) {
                      rows.push(cells);
                    }
                    if (headerRow.length > 0 && !hasHeader) {
                      hasHeader = true;
                    }
                  }
                }
                
                // Build Markdown table
                if (headerRow.length > 0 || rows.length > 0) {
                  result += "\n";
                  
                  // If no header, use first row as header
                  const actualHeader = headerRow.length > 0 ? headerRow : (rows.shift() || []);
                  const numCols = actualHeader.length;
                  
                  // Header row
                  result += `| ${actualHeader.join(" | ")} |\n`;
                  // Separator row
                  result += `| ${actualHeader.map(() => "---").join(" | ")} |\n`;
                  // Data rows
                  for (const row of rows) {
                    // Pad row to have correct number of columns
                    while (row.length < numCols) row.push("");
                    result += `| ${row.join(" | ")} |\n`;
                  }
                  result += "\n";
                }
                break;
              case "tr":
              case "td":
              case "th":
              case "thead":
              case "tbody":
                // These are handled by the table case above
                result += convertToMarkdown(el);
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
      await generateDocx(cleanedMarkdown, aiSource, parseCsvTables);
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 3000);
    } catch (error) {
      console.error("Error generating document:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleMouseDown = () => {
    setIsDragging(true);
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging) return;
    
    const container = document.getElementById('panels-container');
    if (!container) return;
    
    const containerRect = container.getBoundingClientRect();
    const newWidth = ((e.clientX - containerRect.left) / containerRect.width) * 100;
    
    // Limit between 20% and 80%
    if (newWidth >= 20 && newWidth <= 80) {
      setLeftPanelWidth(newWidth);
    }
  }, [isDragging]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  // Scroll synchronization - bidirectional with simple flag
  const handleInputScroll = useCallback(() => {
    if (!inputRef.current || !previewRef.current) return;
    if (syncingFromRef.current === 'preview') return;
    
    syncingFromRef.current = 'input';
    
    const inputElement = inputRef.current;
    const previewElement = previewRef.current;
    
    const scrollRatio = inputElement.scrollTop / (inputElement.scrollHeight - inputElement.clientHeight || 1);
    const targetScroll = scrollRatio * (previewElement.scrollHeight - previewElement.clientHeight);
    
    previewElement.scrollTop = targetScroll;
    
    setTimeout(() => {
      syncingFromRef.current = null;
    }, 0);
  }, []);

  const handlePreviewScroll = useCallback(() => {
    if (!inputRef.current || !previewRef.current) return;
    if (syncingFromRef.current === 'input') return;
    
    syncingFromRef.current = 'preview';
    
    const previewElement = previewRef.current;
    const inputElement = inputRef.current;
    
    const scrollRatio = previewElement.scrollTop / (previewElement.scrollHeight - previewElement.clientHeight || 1);
    const targetScroll = scrollRatio * (inputElement.scrollHeight - inputElement.clientHeight);
    
    inputElement.scrollTop = targetScroll;
    
    setTimeout(() => {
      syncingFromRef.current = null;
    }, 0);
  }, []);

  return (
    <div className="h-screen bg-background flex flex-col overflow-hidden">
      {showConfetti && <Confetti />}
      <InfoModal isOpen={showInfoModal} onClose={() => setShowInfoModal(false)} />
      
      {/* Header */}
      <header className="border-b border-border shrink-0">
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
              <Button
                variant="outline"
                size="icon"
                onClick={() => setShowInfoModal(true)}
                className="h-9 w-9"
                title="Cómo usar"
              >
                <Info className="h-4 w-4" />
              </Button>
              
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
      <main className="container mx-auto px-4 py-3 flex-1 overflow-hidden">
        <div id="panels-container" className="flex gap-0 h-full relative">
          {/* Input Panel */}
          <div style={{ width: `${leftPanelWidth}%` }} className="shrink-0 pr-2">
            <Card className="flex flex-col gap-0 py-0 overflow-hidden h-full">
              <div className="flex items-center gap-2 px-4 py-3 border-b border-border bg-secondary/30">
                <FileText className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-medium text-foreground">Markdown Input</span>
                <div className="ml-auto flex items-center gap-4">
                  {aiSource === "gemini" && (
                    <div className="flex items-center gap-2">
                      <Label htmlFor="parse-csv" className="text-xs text-muted-foreground cursor-pointer" title="Detectar tablas en formato CSV (separadas por comas)">
                        Tablas CSV
                      </Label>
                      <Switch
                        id="parse-csv"
                        checked={parseCsvTables}
                        onCheckedChange={setParseCsvTables}
                      />
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <Label className="text-xs text-muted-foreground">Fuente:</Label>
                    <select
                      value={aiSource}
                      onChange={(e) => setAiSource(e.target.value as AISource)}
                      className="bg-secondary text-sm text-foreground border border-border rounded px-2 py-1 cursor-pointer focus:outline-none focus:ring-1 focus:ring-primary"
                    >
                      <option value="gemini" className="bg-secondary text-foreground">Gemini</option>
                      <option value="chatgpt" className="bg-secondary text-foreground">ChatGPT</option>
                    </select>
                  </div>
                </div>
              </div>
              <CardContent className="flex-1 p-0 overflow-hidden">
                <Textarea
                  ref={inputRef}
                  value={markdown}
                  onChange={(e) => setMarkdown(e.target.value)}
                  onPaste={handlePaste}
                  onScroll={handleInputScroll}
                  placeholder="Pega aquí tu Markdown con fórmulas LaTeX..."
                  className="h-full w-full resize-none border-0 rounded-none font-mono text-sm bg-input/50 focus-visible:ring-0 focus-visible:ring-offset-0 overflow-y-auto [field-sizing:initial]"
                />
              </CardContent>
            </Card>
          </div>

          {/* Resizable Divider */}
          <div
            onMouseDown={handleMouseDown}
            className={`w-1 cursor-col-resize shrink-0 relative group ${isDragging ? 'bg-primary' : 'bg-border hover:bg-primary/70'} transition-all duration-200`}
            title="Arrastra para redimensionar"
          >
            {/* Wider hit area for easier grabbing */}
            <div className="absolute inset-y-0 -left-2 -right-2" />
            {/* Visual indicator on hover */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
              <div className="flex flex-col gap-1 items-center">
                <div className="w-1 h-8 bg-primary/80 rounded-full" />
                <div className="w-1 h-8 bg-primary/80 rounded-full" />
              </div>
            </div>
          </div>

          {/* Preview Panel */}
          <div style={{ width: `${100 - leftPanelWidth}%` }} className="shrink-0 pl-2">
            <Card className="flex flex-col gap-0 py-0 overflow-hidden h-full">
              <div className="flex items-center gap-2 px-4 py-3 border-b border-border bg-secondary/30">
                <Eye className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-medium text-foreground">Vista Previa</span>
                <div className="ml-auto flex items-center gap-2">
                  <Settings2 className="w-4 h-4 text-muted-foreground" />
                  <Label htmlFor="auto-clean" className="text-xs text-muted-foreground cursor-pointer">
                    Limpieza IA
                  </Label>
                  <Switch
                    id="auto-clean"
                    checked={autoClean}
                    onCheckedChange={setAutoClean}
                  />
                </div>
              </div>
              <CardContentWithRef 
                ref={previewRef}
                onScroll={handlePreviewScroll}
                className="flex-1 p-4 overflow-auto bg-card"
              >
                <MarkdownPreview markdown={cleanedMarkdown} source={aiSource} parseCsvTables={parseCsvTables} />
              </CardContentWithRef>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
