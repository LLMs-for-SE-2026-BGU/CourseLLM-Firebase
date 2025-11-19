
export interface ChunkMetadata {
  headerPath: string[];
}

export interface Chunk {
  content: string;
  metadata: ChunkMetadata;
}

const MAX_CHUNK_SIZE = 1000;

export function chunkMarkdown(markdown: string): Chunk[] {
  const lines = markdown.split('\n');
  const chunks: Chunk[] = [];
  let headerStack: { level: number; text: string }[] = [];
  let currentContent: string[] = [];

  function flushChunk() {
    if (currentContent.length === 0) return;

    const fullContent = currentContent.join('\n').trim();
    if (!fullContent) {
      currentContent = [];
      return;
    }

    const currentHeaderPath = headerStack.map(h => h.text);

    // Check if content needs splitting
    if (fullContent.length > MAX_CHUNK_SIZE) {
      // Split by paragraphs
      const paragraphs = fullContent.split(/\n\s*\n/);
      let tempChunk = "";
      
      for (const paragraph of paragraphs) {
        if ((tempChunk + "\n\n" + paragraph).length > MAX_CHUNK_SIZE && tempChunk.length > 0) {
             chunks.push({
                content: tempChunk.trim(),
                metadata: { headerPath: [...currentHeaderPath] }
             });
             tempChunk = paragraph;
        } else {
            tempChunk = tempChunk ? tempChunk + "\n\n" + paragraph : paragraph;
        }
      }
      if (tempChunk.trim()) {
          chunks.push({
            content: tempChunk.trim(),
            metadata: { headerPath: [...currentHeaderPath] }
          });
      }

    } else {
      chunks.push({
        content: fullContent,
        metadata: { headerPath: [...currentHeaderPath] },
      });
    }
    currentContent = [];
  }

  for (const line of lines) {
    const headerMatch = line.match(/^(#{1,6})\s+(.*)/);

    if (headerMatch) {
      // Flush previous content before processing new header
      flushChunk();

      const level = headerMatch[1].length;
      const text = headerMatch[2].trim();

      // Update stack: pop headers with level >= current level
      while (headerStack.length > 0 && headerStack[headerStack.length - 1].level >= level) {
        headerStack.pop();
      }
      headerStack.push({ level, text });
    } else {
      currentContent.push(line);
    }
  }

  // Flush remaining content
  flushChunk();

  return chunks;
}
