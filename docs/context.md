# 📄 Project Context: LaTeX-to-Word Professional Converter

## 🎯 Overview

This is a high-performance web application designed to convert **Markdown/LaTeX** text (specifically from LLM outputs like Gemini or ChatGPT) into **native Microsoft Word (.docx) equations**.

**The Problem:** Standard converters treat math as text or images. This app converts them into **OMML (Office Math Markup Language)** so they are editable and professional within Word.

---

## 🛠 Tech Stack

* **Framework:** Next.js (App Router) + Tailwind CSS + Shadcn/UI.
* **Core Logic:** `docx.js` (Document generation on the client-side).
* **Parsing:** `remark`, `remark-math` (to differentiate text from math blocks).
* **Math Engine:** `mathjax-full` (to convert TeX strings to MathML/OMML).

---

## 🧠 Core Engineering Logic (Strict Rules)

### 1. The "Cleaning" Regex (Anti-LLM Over-escaping)

LLMs often over-escape mathematical symbols when generating Markdown. This causes Pandoc and other parsers to fail.

* **Rule:** Before parsing, the application MUST run a regex to remove backslashes from arithmetic operators.
* **Target:** `\+`, `\=`, `\-`, `\(`, `\)`  `+`, `=`, `-`, `(`, `)`.
* **Implementation:** `text.replace(/\\([=+\-()]) /g, '$1')`.

### 2. Clipboard Logic (The "Gemini Paste" Fix)

When copying from Gemini, the `text/plain` MIME type often strips LaTeX formulas (e.g., `$\frac{1}{2}$` disappears).

* **Rule:** The `Textarea` or Input component must implement a `onPaste` handler.
* **Logic:** It must check for `text/html` or attempt to sanitize the `text/plain` input to ensure `$` delimiters and math symbols are preserved before setting the state.

### 3. Native Math Conversion

We avoid using images for formulas.

* **Workflow:** 1. Parse Markdown nodes.
2. Identify `math` (display) and `inlineMath` nodes.
3. Convert LaTeX string to **MathML** via MathJax.
4. Wrap MathML into the `docx` library's `Math` component (which generates OMML).

---

## ⚠️ Known Constraints & Edge Cases

* **No Pandoc:** The app is 100% client-side. Do not attempt to call shell commands.
* **Styles:** Ensure the "Professional" math font (Cambria Math) is respected in the `.docx` output.
* **Tables:** Markdown tables containing math are a complex edge case; ensure the cell content is parsed for math nodes individually.

---

## 🚀 How to interpret this codebase

When modifying the UI, **do not touch the regex cleaning functions** or the **MathML-to-Docx wrapper** unless explicitly requested, as they are calibrated for high-precision engineering documentation.

---
