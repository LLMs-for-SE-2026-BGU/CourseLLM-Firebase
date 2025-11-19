
/**
 * Represents the metadata associated with a text chunk.
 * Currently, it only holds the hierarchical path of headers.
 */
export interface ChunkMetadata {
  headerPath: string[];
}

/**
 * Represents a single chunk of text extracted from a Markdown document.
 */
export interface Chunk {
  content: string;
  metadata: ChunkMetadata;
}

// The maximum number of characters allowed in a single chunk.
// If a section exceeds this, it will be split by paragraphs.
const MAX_CHUNK_SIZE = 1000;

/**
 * Splits a Markdown string into context-aware chunks.
 * 
 * This function parses Markdown line-by-line to track the document structure (headers).
 * It ensures that every chunk of text is associated with its full "Header Path"
 * (e.g., ["Chapter 1", "Section 2", "Subsection A"]).
 * 
 * Key Features:
 * 1. **Hierarchy Tracking:** Maintains a stack of headers to know exactly where we are in the document.
 * 2. **Code Block Safety:** Detects code blocks (```) to avoid mistaking comments like `#` for headers.
 * 3. **Size Limiting:** Splits long sections into smaller paragraph-based chunks if they exceed MAX_CHUNK_SIZE.
 * 
 * @param markdown The raw Markdown string to chunk.
 * @returns An array of Chunk objects with content and metadata.
 */
export function chunkMarkdown(markdown: string): Chunk[] {
  const lines = markdown.split('\n');
  const chunks: Chunk[] = [];
  
  // Stack to keep track of the current header hierarchy.
  // Example: [{ level: 1, text: "Intro" }, { level: 2, text: "Setup" }]
  let headerStack: { level: number; text: string }[] = [];
  
  // Buffer to hold lines of text for the current section being processed.
  let currentContent: string[] = [];

  /**
   * Helper function to process the accumulated content in `currentContent`.
   * It creates one or more chunks and adds them to the `chunks` array.
   */
  function flushChunk() {
    if (currentContent.length === 0) return;

    const fullContent = currentContent.join('\n').trim();
    if (!fullContent) {
      currentContent = [];
      return;
    }

    // Capture the current state of the header stack as the context for this chunk.
    const currentHeaderPath = headerStack.map(h => h.text);

    // Check if the accumulated content is too large and needs splitting.
    if (fullContent.length > MAX_CHUNK_SIZE) {
      // Split by double newlines to respect paragraph boundaries.
      const paragraphs = fullContent.split(/\n\s*\n/);
      let tempChunk = "";
      
      for (const paragraph of paragraphs) {
        // If adding the next paragraph exceeds the limit, save the current tempChunk.
        if ((tempChunk + "\n\n" + paragraph).length > MAX_CHUNK_SIZE && tempChunk.length > 0) {
             chunks.push({
                content: tempChunk.trim(),
                metadata: { headerPath: [...currentHeaderPath] }
             });
             tempChunk = paragraph;
        } else {
            // Otherwise, keep appending to the current tempChunk.
            tempChunk = tempChunk ? tempChunk + "\n\n" + paragraph : paragraph;
        }
      }
      // Don't forget to save the last remaining piece.
      if (tempChunk.trim()) {
          chunks.push({
            content: tempChunk.trim(),
            metadata: { headerPath: [...currentHeaderPath] }
          });
      }

    } else {
      // If content fits within the limit, save it as a single chunk.
      chunks.push({
        content: fullContent,
        metadata: { headerPath: [...currentHeaderPath] },
      });
    }
    // Reset the buffer for the next section.
    currentContent = [];
  }

  let inCodeBlock = false;

  for (const line of lines) {
    // Toggle code block state to prevent parsing headers inside code.
    if (line.trim().startsWith('```')) {
      inCodeBlock = !inCodeBlock;
    }

    // Regex to match Markdown headers (e.g., "## Title").
    const headerMatch = line.match(/^(#{1,6})\s+(.*)/);

    // If we find a header and we are NOT inside a code block...
    if (headerMatch && !inCodeBlock) {
      // 1. Save whatever content we were processing before this new header.
      flushChunk();

      const level = headerMatch[1].length; // e.g., 2 for "##"
      const text = headerMatch[2].trim();  // e.g., "Title"

      // 2. Update the header stack.
      // Pop headers that are deeper or same level as the new one.
      // Example: If stack is [H1, H3] and we see an H2, we pop H3.
      while (headerStack.length > 0 && headerStack[headerStack.length - 1].level >= level) {
        headerStack.pop();
      }
      // Push the new header.
      headerStack.push({ level, text });
    } else {
      // If it's not a header, just add the line to the current content buffer.
      currentContent.push(line);
    }
  }

  // Flush any remaining content after the loop finishes.
  flushChunk();

  return chunks;
}
