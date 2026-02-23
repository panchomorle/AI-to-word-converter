import {
  MathRun,
  MathFraction,
  MathRadical,
  MathSuperScript,
  MathSubScript,
  MathSubSuperScript,
} from "docx";
import type { MathElement } from "./types";

// Symbol mappings for LaTeX to Unicode
export const symbolMap: Record<string, string> = {
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
  "\\centerdot": "·",
  "\\ast": "∗",
  "\\star": "⋆",
  "\\bullet": "•",
  "\\circ": "∘",
  "\\leq": "≤",
  "\\geq": "≥",
  "\\neq": "≠",
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
  "\\emptyset": "∅",
  "\\forall": "∀",
  "\\exists": "∃",
  "\\neg": "¬",
  "\\land": "∧",
  "\\lor": "∨",
  "\\Rightarrow": "⇒",
  "\\Leftarrow": "⇐",
  "\\Leftrightarrow": "⇔",
  "\\rightarrow": "→",
  "\\leftarrow": "←",
  "\\leftrightarrow": "↔",
  "\\to": "→",
  "\\gets": "←",
  "\\uparrow": "↑",
  "\\downarrow": "↓",
  "\\infty": "∞",
  "\\partial": "∂",
  "\\nabla": "∇",
  "\\angle": "∠",
  "\\triangle": "△",
  "\\square": "□",
  "\\diamond": "◇",
  "\\ldots": "…",
  "\\cdots": "⋯",
  "\\vdots": "⋮",
  "\\ddots": "⋱",
  "\\prime": "′",
  "\\quad": "  ",
  "\\qquad": "    ",
  "\\,": " ",
  "\\;": " ",
  "\\:": " ",
  "\\!": "",
  "\\ ": " ",
  "\\text": "",
  // Escaped characters
  "\\$": "$",
  "\\%": "%",
  "\\&": "&",
  "\\#": "#",
  "\\_": "_",
  "\\{": "{",
  "\\}": "}",
};

// Parse LaTeX to docx Math components - shared by all parsers
export function parseLatexToDocxMath(latex: string): MathElement[] {
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

    // Handle integrals with limits: \int_{lower}^{upper}
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

    // Handle standalone superscript without explicit base: ^{content} or ^char
    const standaloneSuperMatch = remaining.match(/^\^\{([^{}]*(?:\{[^{}]*\}[^{}]*)*)\}/);
    if (standaloneSuperMatch && elements.length > 0) {
      const lastElement = elements.pop()!;
      elements.push(
        new MathSuperScript({
          children: [lastElement],
          superScript: parseLatexToDocxMath(standaloneSuperMatch[1]),
        })
      );
      remaining = remaining.slice(standaloneSuperMatch[0].length);
      continue;
    }

    // Handle superscript with base: x^{content} or x^2
    const superMatch = remaining.match(/^([a-zA-Z0-9\)\]])(?:\^\{([^{}]*(?:\{[^{}]*\}[^{}]*)*)\}|\^([a-zA-Z0-9]))/);
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

    // Handle standalone subscript without explicit base: _{content} or _char
    const standaloneSubMatch = remaining.match(/^_\{([^{}]*(?:\{[^{}]*\}[^{}]*)*)\}/);
    if (standaloneSubMatch && elements.length > 0) {
      const lastElement = elements.pop()!;
      elements.push(
        new MathSubScript({
          children: [lastElement],
          subScript: parseLatexToDocxMath(standaloneSubMatch[1]),
        })
      );
      remaining = remaining.slice(standaloneSubMatch[0].length);
      continue;
    }

    // Handle subscript with base: x_{content} or x_2
    const subMatch = remaining.match(/^([a-zA-Z0-9])(?:_\{([^{}]*(?:\{[^{}]*\}[^{}]*)*)\}|_([a-zA-Z0-9]))/);
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
    let symbolMatched = false;
    for (const [latexCmd, symbol] of Object.entries(symbolMap)) {
      if (remaining.startsWith(latexCmd)) {
        // Check if it's a complete command (not part of longer word)
        const nextChar = remaining[latexCmd.length];
        if (!nextChar || !/[a-zA-Z]/.test(nextChar)) {
          if (symbol) {
            elements.push(new MathRun(symbol));
          }
          remaining = remaining.slice(latexCmd.length);
          symbolMatched = true;
          break;
        }
      }
    }
    if (symbolMatched) continue;

    // Handle parentheses: \left( and \right)
    const leftMatch = remaining.match(/^\\left([\(\[\{|])/);
    if (leftMatch) {
      elements.push(new MathRun(leftMatch[1]));
      remaining = remaining.slice(leftMatch[0].length);
      continue;
    }
    
    const rightMatch = remaining.match(/^\\right([\)\]\}|])/);
    if (rightMatch) {
      elements.push(new MathRun(rightMatch[1]));
      remaining = remaining.slice(rightMatch[0].length);
      continue;
    }

    // Handle braces groups {content}
    const braceMatch = remaining.match(/^\{([^{}]*(?:\{[^{}]*\}[^{}]*)*)\}/);
    if (braceMatch) {
      elements.push(...parseLatexToDocxMath(braceMatch[1]));
      remaining = remaining.slice(braceMatch[0].length);
      continue;
    }

    // Skip unknown commands
    const unknownCmd = remaining.match(/^\\[a-zA-Z]+/);
    if (unknownCmd) {
      remaining = remaining.slice(unknownCmd[0].length);
      continue;
    }

    // Single character
    const charMatch = remaining.match(/^[a-zA-Z0-9+\-=()[\]{}<>|,.:;!?'"\/\s]/);
    if (charMatch) {
      elements.push(new MathRun(charMatch[0]));
      remaining = remaining.slice(1);
      continue;
    }

    // Skip any unrecognized character
    remaining = remaining.slice(1);
  }

  return elements;
}
