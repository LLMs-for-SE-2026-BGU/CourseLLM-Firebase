
import { chunkMarkdown } from '../src/lib/markdown-chunker';
import { mockCourseData } from '../src/lib/mock-course-data';

function runTest() {
  console.log("Running Chunking Tests...\n");

  for (const [name, markdown] of Object.entries(mockCourseData)) {
    console.log(`--- Testing: ${name} ---`);
    const chunks = chunkMarkdown(markdown);
    
    chunks.forEach((chunk, index) => {
      console.log(`Chunk ${index + 1}:`);
      console.log(`  Header Path: ${JSON.stringify(chunk.metadata.headerPath)}`);
      console.log(`  Content Preview: ${chunk.content.substring(0, 50).replace(/\n/g, ' ')}...`);
      console.log('-----------------------------------');
    });
    console.log("\n");
  }
}

runTest();
