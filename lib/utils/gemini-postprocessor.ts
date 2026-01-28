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

// Detect and convert Gemini's concatenated table format to Markdown tables
// When Gemini renders tables and user copies them, all cells get concatenated in a single line:
// **Header1****Header2****Header3****Row1Col1**$Row1Col2$$Row1Col3$**Row2Col1**$Row2Col2$$Row2Col3$
// Pattern: Headers are consecutive **...**, then each data row is **...** followed by $...$ for other columns
function convertConcatenatedTableToMarkdown(markdown: string): string {
  const lines = markdown.split('\n');
  const result: string[] = [];
  
  for (const line of lines) {
    // Check if this line looks like a concatenated Gemini table
    // It should have multiple consecutive **...** at the start (headers)
    // followed by patterns of **...**$...$... (data rows)
    
    // Match pattern: starts with at least 2 consecutive **...** (headers)
    const headerPattern = /^\*\*[^*]+\*\*(?:\*\*[^*]+\*\*)+/;
    if (!headerPattern.test(line)) {
      result.push(line);
      continue;
    }
    
    // Extract all tokens: **...** and $...$
    // For **...**, we need to handle nested $...$ inside like **Hectárea ($ha$)**
    const tokens: { type: 'bold' | 'math', content: string }[] = [];
    let remaining = line;
    
    while (remaining.length > 0) {
      // Try to match **...** first (can contain $...$ inside)
      const boldMatch = remaining.match(/^\*\*(.+?)\*\*(?=\*\*|\$|$)/);
      if (boldMatch) {
        tokens.push({ type: 'bold', content: boldMatch[1] });
        remaining = remaining.slice(boldMatch[0].length);
        continue;
      }
      
      // Try to match $...$ (math/value)
      const mathMatch = remaining.match(/^\$([^$]+)\$/);
      if (mathMatch) {
        tokens.push({ type: 'math', content: mathMatch[1] });
        remaining = remaining.slice(mathMatch[0].length);
        continue;
      }
      
      // If neither matches, this isn't a valid table format
      break;
    }
    
    // If we couldn't parse all tokens or have remaining text, it's not a table
    if (remaining.length > 0 || tokens.length < 4) {
      result.push(line);
      continue;
    }
    
    // Count consecutive bold tokens at the start (these are headers)
    let headerCount = 0;
    for (const token of tokens) {
      if (token.type === 'bold') {
        headerCount++;
      } else {
        break;
      }
    }
    
    // We need at least 2 headers to form a table
    if (headerCount < 2) {
      result.push(line);
      continue;
    }
    
    const numColumns = headerCount;
    const headers = tokens.slice(0, numColumns).map(t => t.content);
    const remainingTokens = tokens.slice(numColumns);
    
    // Each data row should be: 1 bold + (numColumns - 1) math tokens
    const tokensPerRow = numColumns;
    const dataRows: string[][] = [];
    
    for (let i = 0; i < remainingTokens.length; i += tokensPerRow) {
      const rowTokens = remainingTokens.slice(i, i + tokensPerRow);
      
      // First token should be bold, rest should be math
      if (rowTokens.length !== tokensPerRow) break;
      if (rowTokens[0].type !== 'bold') break;
      
      const row: string[] = [];
      for (let j = 0; j < rowTokens.length; j++) {
        const token = rowTokens[j];
        if (j === 0) {
          // First column - wrap in bold, keep internal math
          row.push(`**${token.content}**`);
        } else {
          // Other columns - wrap in math delimiters
          row.push(`$${token.content}$`);
        }
      }
      dataRows.push(row);
    }
    
    // If we successfully parsed rows, convert to Markdown table
    if (dataRows.length > 0) {
      // Header row
      result.push(`| ${headers.join(' | ')} |`);
      // Separator row
      result.push(`| ${headers.map(() => '---').join(' | ')} |`);
      // Data rows
      for (const row of dataRows) {
        result.push(`| ${row.join(' | ')} |`);
      }
    } else {
      result.push(line);
    }
  }
  
  return result.join('\n');
}

// Helper function to count separators outside of math blocks
function countSeparatorsOutsideMath(line: string, separator: string): number {
  // Remove content inside $...$ (inline math) before counting
  const withoutMath = line.replace(/\$[^$]+\$/g, '');
  if (separator === ',') {
    return (withoutMath.match(/,/g) || []).length;
  } else {
    return (withoutMath.match(/\t/g) || []).length;
  }
}

// Check if a line looks like a list item
function isListItem(line: string): boolean {
  const trimmed = line.trim();
  // Unordered list: starts with -, *, or +
  if (/^[-*+]\s/.test(trimmed)) return true;
  // Ordered list: starts with number followed by . or )
  if (/^\d+[.)]\s/.test(trimmed)) return true;
  return false;
}

// Detect and convert plain text tables (CSV-like) to Markdown tables
// When Gemini renders tables and user copies them, the Markdown format is lost
// and only plain text with comma or tab separators remains
function convertPlainTextTablesToMarkdown(markdown: string): string {
  const lines = markdown.split('\n');
  const result: string[] = [];
  let i = 0;
  
  while (i < lines.length) {
    const line = lines[i];
    
    // Try to detect a plain text table starting at this line
    // A plain text table is:
    // - Multiple consecutive non-empty lines
    // - Each line has the same number of separators (comma or tab)
    // - At least 2 columns and 2 rows
    // - Lines should NOT already be Markdown table format (starting with |)
    // - Lines should NOT be list items (starting with -, *, +, or numbers)
    
    if (line.trim() && 
        !line.trim().startsWith('|') && 
        !line.trim().startsWith('#') &&
        !isListItem(line)) {
      // Determine the separator (comma or tab) - don't count separators inside math
      const commaCount = countSeparatorsOutsideMath(line, ',');
      const tabCount = countSeparatorsOutsideMath(line, '\t');
      
      // Choose the separator that appears more consistently
      let separator: string | null = null;
      let expectedColumns = 0;
      
      if (commaCount >= 1) {
        separator = ',';
        expectedColumns = commaCount + 1;
      } else if (tabCount >= 1) {
        separator = '\t';
        expectedColumns = tabCount + 1;
      }
      
      if (separator && expectedColumns >= 2) {
        // Check if subsequent lines form a table with same column count
        const tableLines: string[] = [line];
        let j = i + 1;
        
        while (j < lines.length) {
          const nextLine = lines[j];
          
          // Stop if line is empty, starts with | (already markdown table), is a header, or is a list item
          if (!nextLine.trim() || 
              nextLine.trim().startsWith('|') || 
              nextLine.trim().startsWith('#') ||
              isListItem(nextLine)) {
            break;
          }
          
          // Count separators in this line (outside of math blocks)
          const sepCount = countSeparatorsOutsideMath(nextLine, separator);
          
          // Check if column count matches (allow some flexibility for edge cases)
          if (sepCount + 1 === expectedColumns) {
            tableLines.push(nextLine);
            j++;
          } else {
            break;
          }
        }
        
        // If we have at least 2 rows, convert to Markdown table
        if (tableLines.length >= 2) {
          // Convert each line to Markdown table row
          const mdTableLines: string[] = [];
          
          for (let k = 0; k < tableLines.length; k++) {
            const cells = tableLines[k].split(separator).map(cell => cell.trim());
            const mdRow = `| ${cells.join(' | ')} |`;
            mdTableLines.push(mdRow);
            
            // Add separator row after header (first row)
            if (k === 0) {
              const separatorRow = `| ${cells.map(() => '---').join(' | ')} |`;
              mdTableLines.push(separatorRow);
            }
          }
          
          result.push(...mdTableLines);
          i = j; // Skip the processed lines
          continue;
        }
      }
    }
    
    result.push(line);
    i++;
  }
  
  return result.join('\n');
}

// Pre-process Gemini markdown before parsing
// Gemini adds extra blank lines between table rows that break the table parser
export function preprocessGeminiMarkdown(markdown: string, parseCsvTables: boolean = false): string {
  let processed = markdown;
  
  // Step 0: Convert concatenated table format (all cells in one line with **...** and $...$)
  // This is always applied as it's specific to Gemini's table copy format
  processed = convertConcatenatedTableToMarkdown(processed);
  
  // Step 1: Convert plain text tables (CSV/TSV) to Markdown tables
  // This is OPTIONAL because it can misinterpret lists with commas as tables
  if (parseCsvTables) {
    processed = convertPlainTextTablesToMarkdown(processed);
  }
  
  // Step 2: Fix Gemini's table format: remove blank lines between table rows
  // Gemini outputs tables like:
  // | Header 1 | Header 2 |
  // 
  // | :--- | :--- |
  // 
  // | Cell 1 | Cell 2 |
  // 
  // We need to make it:
  // | Header 1 | Header 2 |
  // | :--- | :--- |
  // | Cell 1 | Cell 2 |
  
  // Match table rows (lines starting with |) and remove blank lines between them
  const lines = processed.split('\n');
  const result: string[] = [];
  let inTable = false;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const isTableRow = line.trim().startsWith('|');
    const isBlankLine = line.trim() === '';
    
    if (isTableRow) {
      inTable = true;
      result.push(line);
    } else if (isBlankLine && inTable) {
      // Check if next non-blank line is also a table row
      let nextNonBlank = i + 1;
      while (nextNonBlank < lines.length && lines[nextNonBlank].trim() === '') {
        nextNonBlank++;
      }
      if (nextNonBlank < lines.length && lines[nextNonBlank].trim().startsWith('|')) {
        // Skip this blank line - it's between table rows
        continue;
      } else {
        // End of table
        inTable = false;
        result.push(line);
      }
    } else {
      inTable = false;
      result.push(line);
    }
  }
  
  return result.join('\n');
}
