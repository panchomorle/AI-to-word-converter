// Pre-process Gemini markdown for preview
// Gemini uses $$ for display math which works well, but has issues with list formatting
// This file handles Gemini-specific HTML post-processing for the preview
export function postProcessGeminiHtml(htmlOutput: string): string {
  let processed = htmlOutput;
  
  // Fix Gemini's broken list format where items 2, 3, etc. are embedded in <p> tags
  // Pattern: </span></span>\n2. <strong>Title:</strong></p>
  // Split these into proper <li> tags
  
  // Step 1: Extract items like "2. <strong>..." from within <p> tags and convert to <li>
  processed = processed.replace(
    /(<\/span><\/span>)\s*(\d+)\.\s+(<strong>.*?<\/strong>)<\/p>/g,
    '$1</p></li><li>$3\n<p>'
  );
  
  // Step 2: Wrap the first item's formula in a <p> tag (it comes right after </ol>)
  // Pattern: </ol><p><span class="katex">
  // But first, we need to merge the </ol> that comes after the first <li> back into the list
  processed = processed.replace(
    /(<ol>\s*<li><strong>.*?<\/strong><\/li>\s*<\/ol>)\s*(<p><span class="katex">)/,
    (match, listPart, formula) => {
      // Extract the title from the first list item
      const titleMatch = listPart.match(/<li>(<strong>.*?<\/strong>)<\/li>/);
      if (titleMatch) {
        return `<ol><li>${titleMatch[1]}\n${formula}`;
      }
      return match;
    }
  );
  
  // Step 3: Close the list at the very end (before next heading or end)
  processed = processed.replace(
    /(<\/p><\/li>)(?!.*<\/li>)(?=\s*(?:<h\d>|<p>(?!<span class="katex">)|$))/,
    '$1</ol>'
  );
  
  return processed;
}
