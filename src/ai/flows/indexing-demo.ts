
import { genkit, z } from 'genkit';
import { chunkMarkdown } from '@/lib/markdown-chunker';
import { ai } from '@/ai/genkit';

// This flow simulates the process of ingesting a course document,
// chunking it, and preparing it for a vector database.

export const indexCourseDocument = ai.defineFlow(
  {
    name: 'indexCourseDocument',
    inputSchema: z.object({
      courseId: z.string(),
      documentTitle: z.string(),
      markdownContent: z.string(),
    }),
    outputSchema: z.object({
      chunksCreated: z.number(),
      preview: z.array(z.object({
        id: z.string(),
        text: z.string(),
        metadata: z.any()
      }))
    }),
  },
  async (input) => {
    console.log(`Processing document: ${input.documentTitle} for course: ${input.courseId}`);

    // 1. Chunk the markdown
    const chunks = chunkMarkdown(input.markdownContent);

    // 2. Simulate "Embedding & Indexing"
    // In a real app, you would loop through these chunks, generate embeddings
    // using an embedding model, and save them to a Vector DB (like Pinecone, Firestore Vector Search, etc.)
    
    const processedChunks = chunks.map((chunk, index) => {
      return {
        id: `${input.courseId}-${index}`,
        text: chunk.content,
        metadata: {
          source: input.documentTitle,
          headerPath: chunk.metadata.headerPath.join(' > '), // Flatten path for easier reading
          courseId: input.courseId
        }
      };
    });

    console.log(`Successfully processed ${processedChunks.length} chunks.`);

    return {
      chunksCreated: processedChunks.length,
      preview: processedChunks.slice(0, 3) // Return first 3 for verification
    };
  }
);
