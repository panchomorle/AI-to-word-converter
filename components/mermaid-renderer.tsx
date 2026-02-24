"use client";

import { useEffect, useRef, useState, useId } from "react";
import mermaid from "mermaid";

interface MermaidRendererProps {
  code: string;
  className?: string;
}

// Initialize mermaid with default config
let initialized = false;

function initializeMermaid() {
  if (initialized) return;
  
  mermaid.initialize({
    startOnLoad: false,
    theme: "default",
    securityLevel: "loose",
    fontFamily: "var(--font-sans), sans-serif",
    flowchart: {
      htmlLabels: true,
      useMaxWidth: true,
    },
    sequence: {
      useMaxWidth: true,
    },
    gantt: {
      useMaxWidth: true,
    },
  });
  
  initialized = true;
}

export default function MermaidRenderer({ code, className = "" }: MermaidRendererProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [svg, setSvg] = useState<string>("");
  const [error, setError] = useState<string>("");
  const uniqueId = useId().replace(/:/g, "-");

  useEffect(() => {
    const renderDiagram = async () => {
      if (!code.trim()) return;
      
      try {
        initializeMermaid();
        
        // Clean the code - remove extra whitespace and ensure proper formatting
        const cleanCode = code.trim();
        
        // Generate unique ID for this diagram
        const diagramId = `mermaid-diagram-${uniqueId}`;
        
        // Render the mermaid diagram
        const { svg: renderedSvg } = await mermaid.render(diagramId, cleanCode);
        setSvg(renderedSvg);
        setError("");
      } catch (err) {
        console.error("Mermaid rendering error:", err);
        setError(err instanceof Error ? err.message : "Failed to render diagram");
        setSvg("");
      }
    };

    renderDiagram();
  }, [code, uniqueId]);

  if (error) {
    return (
      <div className={`mermaid-error p-4 bg-destructive/10 border border-destructive/30 rounded-lg ${className}`}>
        <p className="text-sm text-destructive font-medium mb-2">Error rendering Mermaid diagram:</p>
        <pre className="text-xs text-destructive/80 whitespace-pre-wrap">{error}</pre>
        <details className="mt-2">
          <summary className="text-xs text-muted-foreground cursor-pointer">Show source code</summary>
          <pre className="mt-2 text-xs p-2 bg-secondary rounded overflow-x-auto">{code}</pre>
        </details>
      </div>
    );
  }

  if (!svg) {
    return (
      <div className={`mermaid-loading p-4 bg-secondary/50 rounded-lg animate-pulse ${className}`}>
        <div className="h-32 flex items-center justify-center text-muted-foreground">
          Loading diagram...
        </div>
      </div>
    );
  }

  return (
    <div 
      ref={containerRef}
      className={`mermaid-container flex justify-center my-4 p-4 bg-white dark:bg-secondary/30 rounded-lg overflow-x-auto ${className}`}
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}

// Export a function to render mermaid to SVG string (for DOCX export)
export async function renderMermaidToSvg(code: string): Promise<string> {
  initializeMermaid();
  
  const id = `mermaid-export-${Date.now()}-${Math.random().toString(36).slice(2)}`;
  const { svg } = await mermaid.render(id, code.trim());
  
  return svg;
}

// Export a function to convert SVG to PNG data URL (for DOCX export)
export async function renderMermaidToPng(code: string, scale: number = 2): Promise<{ data: string; width: number; height: number }> {
  const svg = await renderMermaidToSvg(code);
  
  // Parse SVG to get dimensions
  const parser = new DOMParser();
  const svgDoc = parser.parseFromString(svg, "image/svg+xml");
  const svgElement = svgDoc.documentElement;
  
  // Get viewBox dimensions or width/height attributes
  let width = 800;
  let height = 600;
  
  const viewBox = svgElement.getAttribute("viewBox");
  if (viewBox) {
    const parts = viewBox.split(" ").map(Number);
    if (parts.length === 4) {
      width = parts[2];
      height = parts[3];
    }
  }
  
  const widthAttr = svgElement.getAttribute("width");
  const heightAttr = svgElement.getAttribute("height");
  
  if (widthAttr && heightAttr) {
    width = parseFloat(widthAttr) || width;
    height = parseFloat(heightAttr) || height;
  }
  
  // Scale dimensions
  const scaledWidth = Math.round(width * scale);
  const scaledHeight = Math.round(height * scale);
  
  // Create canvas and render SVG to it
  const canvas = document.createElement("canvas");
  canvas.width = scaledWidth;
  canvas.height = scaledHeight;
  
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Failed to get canvas context");
  
  // Fill with white background
  ctx.fillStyle = "white";
  ctx.fillRect(0, 0, scaledWidth, scaledHeight);
  
  // Create image from SVG
  const img = new Image();
  const svgBlob = new Blob([svg], { type: "image/svg+xml;charset=utf-8" });
  const url = URL.createObjectURL(svgBlob);
  
  return new Promise((resolve, reject) => {
    img.onload = () => {
      ctx.drawImage(img, 0, 0, scaledWidth, scaledHeight);
      URL.revokeObjectURL(url);
      
      const pngData = canvas.toDataURL("image/png");
      resolve({
        data: pngData,
        width: scaledWidth,
        height: scaledHeight,
      });
    };
    
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Failed to load SVG image"));
    };
    
    img.src = url;
  });
}
