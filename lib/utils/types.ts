import {
  MathRun,
  MathFraction,
  MathRadical,
  MathSuperScript,
  MathSubScript,
  MathSubSuperScript,
} from "docx";

// Simplified types that don't depend on mdast module
export type MathElement = MathRun | MathFraction | MathRadical | MathSuperScript | MathSubScript | MathSubSuperScript;

export type AISource = "gemini" | "chatgpt";
