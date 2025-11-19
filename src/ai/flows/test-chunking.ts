
import { genkit, z } from 'genkit';
import { chunkMarkdown } from '@/lib/markdown-chunker';
import { ai } from '@/ai/genkit';

const ChunkSchema = z.object({
  content: z.string(),
  metadata: z.object({
    headerPath: z.array(z.string()),
  }),
});

export const testChunkingFlow = ai.defineFlow(
  {
    name: 'testChunkingFlow',
    inputSchema: z.object({
      markdown: z.string(),
    }),
    outputSchema: z.array(ChunkSchema),
  },
  async (input) => {
    const chunks = chunkMarkdown(input.markdown);
    return chunks;
  }
);
