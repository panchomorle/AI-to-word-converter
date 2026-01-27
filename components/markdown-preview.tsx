"use client";

import { useMemo } from "react";
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkMath from "remark-math";
import remarkRehype from "remark-rehype";
import rehypeKatex from "rehype-katex";
import rehypeStringify from "rehype-stringify";
import { postProcessGeminiHtml } from "@/lib/utils/gemini-postprocessor";
import { preprocessChatGPTForPreview } from "@/lib/utils/chatgpt-preprocessor";
import type { AISource } from "@/lib/utils/types";

interface MarkdownPreviewProps {
  markdown: string;
  source?: AISource;
}

export default function MarkdownPreview({ markdown, source = "gemini" }: MarkdownPreviewProps) {
  const html = useMemo(() => {
    try {
      // Pre-process based on source
      let processedMarkdown = markdown;
      if (source === "chatgpt") {
        processedMarkdown = preprocessChatGPTForPreview(markdown);
      }
      
      // Process markdown - remark-math will handle $$ naturally
      const result = unified()
        .use(remarkParse)
        .use(remarkMath)
        .use(remarkRehype)
        .use(rehypeKatex)
        .use(rehypeStringify)
        .processSync(processedMarkdown);
      
      let htmlOutput = String(result);
      
      // Post-process based on source
      if (source === "gemini") {
        htmlOutput = postProcessGeminiHtml(htmlOutput);
      }
      // ChatGPT doesn't need HTML post-processing after the markdown pre-processing
      
      return htmlOutput;
    } catch (error) {
      console.error("Error parsing markdown:", error);
      return "<p>Error al procesar el Markdown</p>";
    }
  }, [markdown, source]);

  return (
    <>
      {/* KaTeX CSS */}
      <link
        rel="stylesheet"
        href="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.css"
        integrity="sha384-n8MVd4RsNIU0tAv4ct0nTaAbDJwPJzDEaqSD1odI+WdtXRGWt2kTvGFasHpSy3SV"
        crossOrigin="anonymous"
      />
      <style>{`
        .markdown-preview h1 {
          font-size: 1.875rem;
          font-weight: 700;
          margin-bottom: 1rem;
          margin-top: 1.5rem;
          color: var(--foreground);
          border-bottom: 1px solid var(--border);
          padding-bottom: 0.5rem;
        }
        .markdown-preview h1:first-child {
          margin-top: 0;
        }
        .markdown-preview h2 {
          font-size: 1.5rem;
          font-weight: 600;
          margin-bottom: 0.75rem;
          margin-top: 1.5rem;
          color: var(--foreground);
        }
        .markdown-preview h3 {
          font-size: 1.25rem;
          font-weight: 600;
          margin-bottom: 0.5rem;
          margin-top: 1.25rem;
          color: var(--foreground);
        }
        .markdown-preview p {
          margin-bottom: 1rem;
          line-height: 1.7;
          color: var(--muted-foreground);
        }
        .markdown-preview .katex-display {
          margin: 1.5rem 0;
          padding: 1rem;
          background: var(--secondary);
          border-radius: 0.5rem;
          overflow-x: auto;
        }
        .markdown-preview .katex {
          color: var(--primary);
        }
        .markdown-preview code {
          background: var(--secondary);
          padding: 0.125rem 0.375rem;
          border-radius: 0.25rem;
          font-family: var(--font-mono);
          font-size: 0.875rem;
        }
        .markdown-preview pre {
          background: var(--secondary);
          padding: 1rem;
          border-radius: 0.5rem;
          overflow-x: auto;
          margin-bottom: 1rem;
        }
        .markdown-preview pre code {
          background: transparent;
          padding: 0;
        }
        .markdown-preview ul, .markdown-preview ol {
          margin-bottom: 1rem;
          padding-left: 1.5rem;
          color: var(--muted-foreground);
        }
        .markdown-preview li {
          margin-bottom: 0.5rem;
          line-height: 1.6;
        }
        .markdown-preview li > p {
          margin-bottom: 0.5rem;
        }
        .markdown-preview li .katex-display {
          margin: 0.75rem 0;
          margin-left: 0;
        }
        .markdown-preview ol > li {
          display: list-item;
          list-style-type: decimal;
        }
        .markdown-preview ol {
          counter-reset: item;
        }
        /* Handle math blocks that appear between list items */
        .markdown-preview ol + p > .katex-display,
        .markdown-preview ol + p:has(.katex-display) {
          margin-left: 1.5rem;
          margin-top: -0.5rem;
          margin-bottom: 0.5rem;
        }
        /* Ensure list numbering continues */
        .markdown-preview ol + ol {
          counter-reset: item var(--start, 1);
        }
        .markdown-preview blockquote {
          border-left: 3px solid var(--primary);
          padding-left: 1rem;
          margin: 1rem 0;
          color: var(--muted-foreground);
          font-style: italic;
        }
        .markdown-preview a {
          color: var(--primary);
          text-decoration: underline;
        }
        .markdown-preview hr {
          border: none;
          border-top: 1px solid var(--border);
          margin: 2rem 0;
        }
        .markdown-preview table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 1rem;
        }
        .markdown-preview th, .markdown-preview td {
          border: 1px solid var(--border);
          padding: 0.5rem;
          text-align: left;
        }
        .markdown-preview th {
          background: var(--secondary);
          font-weight: 600;
        }
      `}</style>
      <div 
        className="markdown-preview prose prose-invert max-w-none"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </>
  );
}
