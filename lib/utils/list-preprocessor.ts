// List preprocessor - handles nested lists and numbering issues
// This module normalizes markdown lists to ensure proper parsing

interface ListContext {
  type: 'ordered' | 'unordered';
  indent: number;
  startNumber?: number;
  currentNumber?: number;
}

interface ParsedListLine {
  isListItem: boolean;
  type: 'ordered' | 'unordered';
  indent: number;
  number?: number;
  content: string;
  marker: string;
  fullLine: string;
}

/**
 * Detects if a line is a list item and returns its properties
 */
function parseListLine(line: string): ParsedListLine | null {
  // Match ordered list: spaces/tabs + number + . or ) + space + content
  const orderedMatch = line.match(/^(\s*)(\d+)([.)]\s)(.*)$/);
  if (orderedMatch) {
    return {
      isListItem: true,
      type: 'ordered',
      indent: orderedMatch[1].length,
      number: parseInt(orderedMatch[2], 10),
      content: orderedMatch[4],
      marker: orderedMatch[2] + orderedMatch[3],
      fullLine: line
    };
  }
  
  // Match unordered list: spaces/tabs + (-, *, +) + space + content
  const unorderedMatch = line.match(/^(\s*)([-*+])\s(.*)$/);
  if (unorderedMatch) {
    return {
      isListItem: true,
      type: 'unordered',
      indent: unorderedMatch[1].length,
      number: undefined,
      content: unorderedMatch[3],
      marker: unorderedMatch[2] + ' ',
      fullLine: line
    };
  }
  
  return null;
}

/**
 * Determines if a line is continuation content for a list item
 */
function isContinuationLine(line: string): boolean {
  // Empty line could be between list items
  if (line.trim() === '') return true;
  
  // Indented content that's not a list item
  if (line.match(/^\s+/) && !parseListLine(line)) return true;
  
  return false;
}

/**
 * Pre-processes markdown to fix list numbering issues.
 * 
 * The main problem: When copying from Gemini/AI sources, numbered lists like:
 * 
 * 13. **Item 13**
 *     - sub item
 *     - sub item
 * 14. **Item 14**
 * 
 * Get broken into separate lists because of the nested content.
 * The markdown parser sees "14." after nested content as a new list starting at 1.
 * 
 * This preprocessor:
 * 1. Tracks the expected numbering sequence
 * 2. Renumbers items when they incorrectly restart
 * 3. Preserves intentional list breaks
 */
export function preprocessListMarkdown(markdown: string): string {
  const lines = markdown.split('\n');
  const result: string[] = [];
  
  // Track ordered list sequences at different indentation levels
  const orderedListState: Map<number, { startNumber: number; currentNumber: number; lastIndex: number }> = new Map();
  
  let lastOrderedIndent = -1;
  let lastOrderedNumber = 0;
  let consecutiveNonListLines = 0;
  let inNestedContent = false;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const parsed = parseListLine(line);
    
    if (!parsed) {
      // Not a list item
      if (line.trim() === '') {
        consecutiveNonListLines++;
      } else if (line.match(/^(\s+)/)) {
        // Indented non-list content - likely continuation or nested
        inNestedContent = true;
        consecutiveNonListLines = 0;
      } else {
        // Non-indented non-list content - reset tracking
        if (!line.trim().startsWith('#')) { // Don't reset on headings mid-list
          // Only reset if we have significant non-list content
          if (consecutiveNonListLines > 1 || (!inNestedContent && line.trim().length > 0)) {
            orderedListState.clear();
            lastOrderedIndent = -1;
            lastOrderedNumber = 0;
          }
        }
        consecutiveNonListLines++;
        inNestedContent = false;
      }
      result.push(line);
      continue;
    }
    
    // Reset consecutive counter
    consecutiveNonListLines = 0;
    
    if (parsed.type === 'unordered') {
      // Unordered lists don't affect numbered list tracking
      // but mark that we're in nested content if indented
      if (parsed.indent > 0) {
        inNestedContent = true;
      }
      result.push(line);
      continue;
    }
    
    // Ordered list item
    const indent = parsed.indent;
    const number = parsed.number!;
    
    // Get or create state for this indentation level
    let state = orderedListState.get(indent);
    
    if (!state) {
      // New list at this level
      state = { startNumber: number, currentNumber: number, lastIndex: i };
      orderedListState.set(indent, state);
      lastOrderedIndent = indent;
      lastOrderedNumber = number;
      inNestedContent = false;
      result.push(line);
      continue;
    }
    
    // Check if this number makes sense in the sequence
    const expectedNumber = state.currentNumber + 1;
    
    if (number === expectedNumber) {
      // Perfect continuation
      state.currentNumber = number;
      state.lastIndex = i;
      lastOrderedNumber = number;
      inNestedContent = false;
      result.push(line);
    } else if (number === 1 && state.currentNumber > 1 && inNestedContent) {
      // This is the bug case! The number restarted at 1 after nested content
      // but it should continue from where we left off
      const correctedNumber = expectedNumber;
      const indentStr = ' '.repeat(indent);
      const correctedLine = `${indentStr}${correctedNumber}. ${parsed.content}`;
      
      state.currentNumber = correctedNumber;
      state.lastIndex = i;
      lastOrderedNumber = correctedNumber;
      inNestedContent = false;
      result.push(correctedLine);
    } else if (number > expectedNumber && number <= expectedNumber + 5) {
      // Small gap - might have skipped some numbers intentionally or had blank items
      // Accept and continue
      state.currentNumber = number;
      state.lastIndex = i;
      lastOrderedNumber = number;
      inNestedContent = false;
      result.push(line);
    } else if (number < expectedNumber && number === 1) {
      // Restart at 1 - could be intentional new list or bug
      // If we're right after nested content, it's likely a bug
      if (inNestedContent || (i - state.lastIndex) <= 5) {
        // Likely a bug - correct it
        const correctedNumber = expectedNumber;
        const indentStr = ' '.repeat(indent);
        const correctedLine = `${indentStr}${correctedNumber}. ${parsed.content}`;
        
        state.currentNumber = correctedNumber;
        state.lastIndex = i;
        lastOrderedNumber = correctedNumber;
        inNestedContent = false;
        result.push(correctedLine);
      } else {
        // Likely intentional new list
        state.startNumber = 1;
        state.currentNumber = 1;
        state.lastIndex = i;
        lastOrderedNumber = 1;
        inNestedContent = false;
        result.push(line);
      }
    } else {
      // Some other number - could be a new list or continuation
      // Accept the number as-is but update tracking
      state.startNumber = number;
      state.currentNumber = number;
      state.lastIndex = i;
      lastOrderedNumber = number;
      inNestedContent = false;
      result.push(line);
    }
    
    lastOrderedIndent = indent;
  }
  
  return result.join('\n');
}

/**
 * Normalizes list markers to ensure consistent parsing
 * Converts inconsistent markers (*, +) to (-) for unordered lists
 */
export function normalizeListMarkers(markdown: string): string {
  const lines = markdown.split('\n');
  const result: string[] = [];
  
  for (const line of lines) {
    // Normalize unordered list markers to dash
    const unorderedMatch = line.match(/^(\s*)([*+])\s(.*)$/);
    if (unorderedMatch) {
      result.push(`${unorderedMatch[1]}- ${unorderedMatch[3]}`);
    } else {
      result.push(line);
    }
  }
  
  return result.join('\n');
}

/**
 * Complete list preprocessing pipeline
 */
export function preprocessLists(markdown: string): string {
  // Step 1: Normalize markers
  let processed = normalizeListMarkers(markdown);
  
  // Step 2: Fix numbering issues
  processed = preprocessListMarkdown(processed);
  
  return processed;
}

export type { ListContext, ParsedListLine };
