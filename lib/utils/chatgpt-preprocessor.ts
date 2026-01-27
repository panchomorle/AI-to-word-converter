// Pre-process ChatGPT markdown to standard format
// ChatGPT uses [...] for display math instead of $$...$$
// and uses (...) for inline math instead of $...$
export function preprocessChatGPTMarkdown(markdown: string): string {
  let processed = markdown;
  
  // Step 1: Convert display math blocks FIRST (before any inline processing)
  // ChatGPT format has math between [ and ] on separate lines like:
  // [
  // \frac{4500}{3} = \frac{x}{7}
  // ]
  // Convert to $$formula$$
  processed = processed.replace(
    /\[\s*\n([^\]]+?)\n\s*\]/g,
    (match, formula) => {
      // Clean up the formula - remove extra whitespace
      const cleanFormula = formula.trim();
      return `$$${cleanFormula}$$`;
    }
  );
  
  // Also handle single-line block math: [formula] on its own line
  processed = processed.replace(
    /^\[([^\]\n]+)\]$/gm,
    (match, formula) => {
      // Check if it looks like LaTeX (has backslash or math symbols)
      if (formula.includes('\\') || formula.match(/[\^_{}=+\-*/]/)) {
        return `$$${formula.trim()}$$`;
      }
      return match;
    }
  );
  
  // Step 2: Convert inline math ONLY outside of $$ blocks
  // We need to be careful not to convert parentheses inside display math
  // Split by $$ blocks, process only non-math parts, then rejoin
  const parts = processed.split(/(\$\$[\s\S]*?\$\$)/g);
  
  processed = parts.map((part, index) => {
    // Even indices are non-math content, odd indices are $$...$$ blocks
    if (index % 2 === 1) {
      // This is a display math block - don't touch it
      return part;
    }
    
    // This is regular content - convert inline math (\frac{...}) patterns
    // But only if it's truly standalone inline math, not inside other content
    let result = part;
    
    // Convert inline math: (\frac{...}) or similar standalone patterns
    // Only match if it looks like a complete inline math expression
    result = result.replace(
      /\(\\([a-zA-Z]+)(\{[^)]+)\)(?![^[]*\])/g,
      (match, command, rest) => {
        // Skip if this looks like it might be part of a larger structure
        return `$\\${command}${rest}$`;
      }
    );
    
    return result;
  }).join('');
  
  return processed;
}

// ChatGPT uses **N. Title** format instead of proper numbered lists
// This function doesn't need to restructure - the standard parser handles it well
// after the math notation is converted
export function preprocessChatGPTForPreview(markdown: string): string {
  return preprocessChatGPTMarkdown(markdown);
}
