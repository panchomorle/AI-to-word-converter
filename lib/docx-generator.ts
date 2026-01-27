import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  Math as DocxMath,
  MathRun,
  MathFraction,
  MathRadical,
  MathSuperScript,
  MathSubScript,
  MathSubSuperScript,
  AlignmentType,
} from "docx";
import fileSaver from "file-saver";
const { saveAs } = fileSaver;
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkMath from "remark-math";
import type { Root, RootContent, PhrasingContent } from "mdast";

interface MathNode {
  type: "math" | "inlineMath";
  value: string;
}

interface TextNode {
  type: "text";
  value: string;
}

interface HeadingNode {
  type: "heading";
  depth: 1 | 2 | 3 | 4 | 5 | 6;
  children: Array<TextNode | MathNode | PhrasingContent>;
}

interface ParagraphNode {
  type: "paragraph";
  children: Array<TextNode | MathNode | PhrasingContent>;
}

interface ListNode {
  type: "list";
  ordered: boolean;
  children: Array<{
    type: "listItem";
    children: Array<ParagraphNode | ListNode>;
  }>;
}

type ContentNode = HeadingNode | ParagraphNode | MathNode | ListNode | RootContent;

type MathElement = MathRun | MathFraction | MathRadical | MathSuperScript | MathSubScript | MathSubSuperScript;

// Parse LaTeX to docx Math components
function parseLatexToDocxMath(latex: string): MathElement[] {
  const elements: MathElement[] = [];
  
  // Tokenize the LaTeX string
  let remaining = latex.trim();
  
  while (remaining.length > 0) {
    // Handle fractions: \frac{num}{den}
    const fracMatch = remaining.match(/^\\frac\s*\{([^{}]*(?:\{[^{}]*\}[^{}]*)*)\}\s*\{([^{}]*(?:\{[^{}]*\}[^{}]*)*)\}/);
    if (fracMatch) {
      elements.push(
        new MathFraction({
          numerator: parseLatexToDocxMath(fracMatch[1]),
          denominator: parseLatexToDocxMath(fracMatch[2]),
        })
      );
      remaining = remaining.slice(fracMatch[0].length);
      continue;
    }

    // Handle square roots: \sqrt{content} or \sqrt[n]{content}
    const sqrtMatch = remaining.match(/^\\sqrt(?:\[([^\]]*)\])?\s*\{([^{}]*(?:\{[^{}]*\}[^{}]*)*)\}/);
    if (sqrtMatch) {
      if (sqrtMatch[1]) {
        // nth root
        elements.push(
          new MathRadical({
            children: parseLatexToDocxMath(sqrtMatch[2]),
            degree: parseLatexToDocxMath(sqrtMatch[1]),
          })
        );
      } else {
        // square root
        elements.push(
          new MathRadical({
            children: parseLatexToDocxMath(sqrtMatch[2]),
          })
        );
      }
      remaining = remaining.slice(sqrtMatch[0].length);
      continue;
    }

    // Handle integrals with limits: \int_{lower}^{upper} - render as symbol with sub/superscript
    const intMatch = remaining.match(/^\\int(?:_\{([^{}]*)\})?\s*(?:\^\{([^{}]*)\})?/);
    if (intMatch) {
      const hasLimits = intMatch[1] || intMatch[2];
      if (hasLimits && intMatch[1] && intMatch[2]) {
        elements.push(
          new MathSubSuperScript({
            children: [new MathRun("∫")],
            subScript: parseLatexToDocxMath(intMatch[1]),
            superScript: parseLatexToDocxMath(intMatch[2]),
          })
        );
      } else if (intMatch[1]) {
        elements.push(
          new MathSubScript({
            children: [new MathRun("∫")],
            subScript: parseLatexToDocxMath(intMatch[1]),
          })
        );
      } else if (intMatch[2]) {
        elements.push(
          new MathSuperScript({
            children: [new MathRun("∫")],
            superScript: parseLatexToDocxMath(intMatch[2]),
          })
        );
      } else {
        elements.push(new MathRun("∫"));
      }
      remaining = remaining.slice(intMatch[0].length);
      continue;
    }

    // Handle sum with limits: \sum_{lower}^{upper}
    const sumMatch = remaining.match(/^\\sum(?:_\{([^{}]*)\})?\s*(?:\^\{([^{}]*)\})?/);
    if (sumMatch) {
      const hasLimits = sumMatch[1] || sumMatch[2];
      if (hasLimits && sumMatch[1] && sumMatch[2]) {
        elements.push(
          new MathSubSuperScript({
            children: [new MathRun("∑")],
            subScript: parseLatexToDocxMath(sumMatch[1]),
            superScript: parseLatexToDocxMath(sumMatch[2]),
          })
        );
      } else if (sumMatch[1]) {
        elements.push(
          new MathSubScript({
            children: [new MathRun("∑")],
            subScript: parseLatexToDocxMath(sumMatch[1]),
          })
        );
      } else if (sumMatch[2]) {
        elements.push(
          new MathSuperScript({
            children: [new MathRun("∑")],
            superScript: parseLatexToDocxMath(sumMatch[2]),
          })
        );
      } else {
        elements.push(new MathRun("∑"));
      }
      remaining = remaining.slice(sumMatch[0].length);
      continue;
    }

    // Handle product with limits: \prod_{lower}^{upper}
    const prodMatch = remaining.match(/^\\prod(?:_\{([^{}]*)\})?\s*(?:\^\{([^{}]*)\})?/);
    if (prodMatch) {
      const hasLimits = prodMatch[1] || prodMatch[2];
      if (hasLimits && prodMatch[1] && prodMatch[2]) {
        elements.push(
          new MathSubSuperScript({
            children: [new MathRun("∏")],
            subScript: parseLatexToDocxMath(prodMatch[1]),
            superScript: parseLatexToDocxMath(prodMatch[2]),
          })
        );
      } else if (prodMatch[1]) {
        elements.push(
          new MathSubScript({
            children: [new MathRun("∏")],
            subScript: parseLatexToDocxMath(prodMatch[1]),
          })
        );
      } else if (prodMatch[2]) {
        elements.push(
          new MathSuperScript({
            children: [new MathRun("∏")],
            superScript: parseLatexToDocxMath(prodMatch[2]),
          })
        );
      } else {
        elements.push(new MathRun("∏"));
      }
      remaining = remaining.slice(prodMatch[0].length);
      continue;
    }

    // Handle limits: \lim_{x \to value}
    const limMatch = remaining.match(/^\\lim_\{([^{}]*)\}/);
    if (limMatch) {
      elements.push(
        new MathSubScript({
          children: [new MathRun("lim")],
          subScript: parseLatexToDocxMath(limMatch[1]),
        })
      );
      remaining = remaining.slice(limMatch[0].length);
      continue;
    }

    // Handle superscript and subscript together: x_{sub}^{super}
    const subSuperMatch = remaining.match(/^([a-zA-Z0-9])_\{([^{}]*)\}\s*\^\{([^{}]*)\}/);
    if (subSuperMatch) {
      elements.push(
        new MathSubSuperScript({
          children: [new MathRun(subSuperMatch[1])],
          subScript: parseLatexToDocxMath(subSuperMatch[2]),
          superScript: parseLatexToDocxMath(subSuperMatch[3]),
        })
      );
      remaining = remaining.slice(subSuperMatch[0].length);
      continue;
    }

    // Handle superscript: x^{content} or x^2
    const superMatch = remaining.match(/^([a-zA-Z0-9\)\]])(?:\^\{([^{}]*)\}|\^([a-zA-Z0-9]))/);
    if (superMatch) {
      const superContent = superMatch[2] || superMatch[3];
      elements.push(
        new MathSuperScript({
          children: [new MathRun(superMatch[1])],
          superScript: parseLatexToDocxMath(superContent),
        })
      );
      remaining = remaining.slice(superMatch[0].length);
      continue;
    }

    // Handle subscript: x_{content} or x_2
    const subMatch = remaining.match(/^([a-zA-Z0-9])(?:_\{([^{}]*)\}|_([a-zA-Z0-9]))/);
    if (subMatch) {
      const subContent = subMatch[2] || subMatch[3];
      elements.push(
        new MathSubScript({
          children: [new MathRun(subMatch[1])],
          subScript: parseLatexToDocxMath(subContent),
        })
      );
      remaining = remaining.slice(subMatch[0].length);
      continue;
    }

    // Handle Greek letters and symbols
    const symbolMap: Record<string, string> = {
      "\\alpha": "α",
      "\\beta": "β",
      "\\gamma": "γ",
      "\\delta": "δ",
      "\\epsilon": "ε",
      "\\zeta": "ζ",
      "\\eta": "η",
      "\\theta": "θ",
      "\\iota": "ι",
      "\\kappa": "κ",
      "\\lambda": "λ",
      "\\mu": "μ",
      "\\nu": "ν",
      "\\xi": "ξ",
      "\\pi": "π",
      "\\rho": "ρ",
      "\\sigma": "σ",
      "\\tau": "τ",
      "\\upsilon": "υ",
      "\\phi": "φ",
      "\\chi": "χ",
      "\\psi": "ψ",
      "\\omega": "ω",
      "\\Gamma": "Γ",
      "\\Delta": "Δ",
      "\\Theta": "Θ",
      "\\Lambda": "Λ",
      "\\Xi": "Ξ",
      "\\Pi": "Π",
      "\\Sigma": "Σ",
      "\\Phi": "Φ",
      "\\Psi": "Ψ",
      "\\Omega": "Ω",
      "\\pm": "±",
      "\\mp": "∓",
      "\\times": "×",
      "\\div": "÷",
      "\\cdot": "·",
      "\\ast": "∗",
      "\\star": "⋆",
      "\\bullet": "•",
      "\\circ": "∘",
      "\\leq": "≤",
      "\\le": "≤",
      "\\geq": "≥",
      "\\ge": "≥",
      "\\neq": "≠",
      "\\ne": "≠",
      "\\approx": "≈",
      "\\equiv": "≡",
      "\\sim": "∼",
      "\\subset": "⊂",
      "\\supset": "⊃",
      "\\subseteq": "⊆",
      "\\supseteq": "⊇",
      "\\in": "∈",
      "\\notin": "∉",
      "\\cup": "∪",
      "\\cap": "∩",
      "\\vee": "∨",
      "\\wedge": "∧",
      "\\neg": "¬",
      "\\forall": "∀",
      "\\exists": "∃",
      "\\partial": "∂",
      "\\nabla": "∇",
      "\\infty": "∞",
      "\\to": "→",
      "\\rightarrow": "→",
      "\\leftarrow": "←",
      "\\leftrightarrow": "↔",
      "\\Rightarrow": "⇒",
      "\\Leftarrow": "⇐",
      "\\Leftrightarrow": "⇔",
      "\\ldots": "…",
      "\\cdots": "⋯",
      "\\vdots": "⋮",
      "\\ddots": "⋱",
      "\\prime": "′",
      "\\,": " ",
      "\\ ": " ",
      "\\quad": "  ",
      "\\qquad": "    ",
    };

    let foundSymbol = false;
    for (const [latexCmd, symbol] of Object.entries(symbolMap)) {
      if (remaining.startsWith(latexCmd)) {
        elements.push(new MathRun(symbol));
        remaining = remaining.slice(latexCmd.length);
        foundSymbol = true;
        break;
      }
    }
    if (foundSymbol) continue;

    // Handle \left and \right (just skip them, keep the bracket)
    const leftRightMatch = remaining.match(/^\\(?:left|right)(.)/);
    if (leftRightMatch) {
      elements.push(new MathRun(leftRightMatch[1]));
      remaining = remaining.slice(leftRightMatch[0].length);
      continue;
    }

    // Handle text inside math: \text{content}
    const textMatch = remaining.match(/^\\text\{([^{}]*)\}/);
    if (textMatch) {
      elements.push(new MathRun(textMatch[1]));
      remaining = remaining.slice(textMatch[0].length);
      continue;
    }

    // Handle regular characters and operators
    const charMatch = remaining.match(/^[a-zA-Z0-9+\-=()[\]{}<>|,.:;!?'"\/\s]/);
    if (charMatch) {
      // Collect consecutive characters
      const textMatchResult = remaining.match(/^[a-zA-Z0-9+\-=()[\]{}<>|,.:;!?'"\/\s]+/);
      if (textMatchResult) {
        elements.push(new MathRun(textMatchResult[0]));
        remaining = remaining.slice(textMatchResult[0].length);
        continue;
      }
    }

    // Skip unknown commands
    const unknownCmd = remaining.match(/^\\[a-zA-Z]+/);
    if (unknownCmd) {
      remaining = remaining.slice(unknownCmd[0].length);
      continue;
    }

    // Skip any other character
    remaining = remaining.slice(1);
  }

  // If no elements were parsed, return a single empty MathRun
  if (elements.length === 0) {
    elements.push(new MathRun(latex));
  }

  return elements;
}

// Convert inline content (text and inline math) to TextRuns and Math
function processInlineContent(
  children: Array<TextNode | MathNode | PhrasingContent>
): (TextRun | DocxMath)[] {
  const runs: (TextRun | DocxMath)[] = [];

  for (const child of children) {
    if (child.type === "text") {
      runs.push(new TextRun({ text: (child as TextNode).value }));
    } else if (child.type === "inlineMath") {
      const mathContent = parseLatexToDocxMath((child as MathNode).value);
      runs.push(new DocxMath({ children: mathContent }));
    } else if (child.type === "strong" && "children" in child) {
      const strongChildren = processInlineContent(
        (child as { children: Array<TextNode | MathNode | PhrasingContent> }).children
      );
      for (const c of strongChildren) {
        if (c instanceof TextRun) {
          runs.push(new TextRun({ text: (c as unknown as { text: string }).text || "", bold: true }));
        } else {
          runs.push(c);
        }
      }
    } else if (child.type === "emphasis" && "children" in child) {
      const emChildren = processInlineContent(
        (child as { children: Array<TextNode | MathNode | PhrasingContent> }).children
      );
      for (const c of emChildren) {
        if (c instanceof TextRun) {
          runs.push(new TextRun({ text: (c as unknown as { text: string }).text || "", italics: true }));
        } else {
          runs.push(c);
        }
      }
    } else if (child.type === "link" && "children" in child) {
      const linkChildren = processInlineContent(
        (child as { children: Array<TextNode | MathNode | PhrasingContent> }).children
      );
      runs.push(...linkChildren);
    } else if ("value" in child && typeof child.value === "string") {
      runs.push(new TextRun({ text: child.value }));
    }
  }

  return runs;
}

// Get heading level for docx
function getHeadingLevel(depth: number): (typeof HeadingLevel)[keyof typeof HeadingLevel] {
  const levels: Record<number, (typeof HeadingLevel)[keyof typeof HeadingLevel]> = {
    1: HeadingLevel.HEADING_1,
    2: HeadingLevel.HEADING_2,
    3: HeadingLevel.HEADING_3,
    4: HeadingLevel.HEADING_4,
    5: HeadingLevel.HEADING_5,
    6: HeadingLevel.HEADING_6,
  };
  return levels[depth] || HeadingLevel.HEADING_1;
}

// Process AST nodes to paragraphs
function processNodes(nodes: ContentNode[]): Paragraph[] {
  const paragraphs: Paragraph[] = [];

  for (const node of nodes) {
    if (node.type === "heading") {
      const headingNode = node as HeadingNode;
      const runs = processInlineContent(headingNode.children);
      paragraphs.push(
        new Paragraph({
          children: runs,
          heading: getHeadingLevel(headingNode.depth),
          spacing: { before: 240, after: 120 },
        })
      );
    } else if (node.type === "paragraph") {
      const paragraphNode = node as ParagraphNode;
      const runs = processInlineContent(paragraphNode.children);
      if (runs.length > 0) {
        paragraphs.push(
          new Paragraph({
            children: runs,
            spacing: { after: 200 },
          })
        );
      }
    } else if (node.type === "math") {
      // Block math - display equation
      const mathNode = node as MathNode;
      const mathContent = parseLatexToDocxMath(mathNode.value);
      paragraphs.push(
        new Paragraph({
          children: [new DocxMath({ children: mathContent })],
          alignment: AlignmentType.CENTER,
          spacing: { before: 200, after: 200 },
        })
      );
    } else if (node.type === "list") {
      const listNode = node as ListNode;
      let itemNumber = 1;
      for (const item of listNode.children) {
        if (item.type === "listItem" && item.children) {
          for (const child of item.children) {
            if (child.type === "paragraph") {
              const runs = processInlineContent((child as ParagraphNode).children);
              const bullet = listNode.ordered ? `${itemNumber}. ` : "• ";
              paragraphs.push(
                new Paragraph({
                  children: [new TextRun({ text: bullet }), ...runs],
                  spacing: { after: 100 },
                  indent: { left: 720 },
                })
              );
            }
          }
          itemNumber++;
        }
      }
    } else if (node.type === "blockquote" && "children" in node) {
      const quoteChildren = processNodes(
        (node as { children: ContentNode[] }).children
      );
      for (const p of quoteChildren) {
        paragraphs.push(
          new Paragraph({
            children: (p as unknown as { options: { children: (TextRun | DocxMath)[] } }).options?.children || [],
            indent: { left: 720 },
            spacing: { after: 200 },
          })
        );
      }
    } else if (node.type === "thematicBreak") {
      paragraphs.push(
        new Paragraph({
          children: [],
          border: {
            bottom: { style: "single" as const, size: 6, color: "auto" },
          },
          spacing: { before: 200, after: 200 },
        })
      );
    } else if (node.type === "code" && "value" in node) {
      paragraphs.push(
        new Paragraph({
          children: [
            new TextRun({
              text: (node as { value: string }).value,
              font: "Courier New",
              size: 20,
            }),
          ],
          spacing: { before: 200, after: 200 },
        })
      );
    }
  }

  return paragraphs;
}

export async function generateDocx(markdown: string): Promise<void> {
  // Parse markdown with math support
  const processor = unified().use(remarkParse).use(remarkMath);

  const tree = processor.parse(markdown) as Root;

  // Process the AST
  const paragraphs = processNodes(tree.children as ContentNode[]);

  // Create the document
  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: 1440, // 1 inch in twips
              right: 1440,
              bottom: 1440,
              left: 1440,
            },
          },
        },
        children: paragraphs,
      },
    ],
    styles: {
      default: {
        document: {
          run: {
            font: "Calibri",
            size: 24, // 12pt
          },
        },
        heading1: {
          run: {
            font: "Calibri",
            size: 48,
            bold: true,
            color: "2E74B5",
          },
        },
        heading2: {
          run: {
            font: "Calibri",
            size: 36,
            bold: true,
            color: "2E74B5",
          },
        },
        heading3: {
          run: {
            font: "Calibri",
            size: 28,
            bold: true,
          },
        },
      },
    },
  });

  // Generate and download
  const blob = await Packer.toBlob(doc);
  saveAs(blob, "documento.docx");
}
