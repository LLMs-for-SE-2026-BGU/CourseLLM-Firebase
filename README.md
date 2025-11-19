# Firebase Studio

This is a NextJS starter in Firebase Studio.

To get started, take a look at src/app/page.tsx.

## 🧠 AI Features

### Context-Aware RAG Pipeline

We have implemented an optimized Retrieval-Augmented Generation (RAG) pipeline designed for course materials (textbooks, lectures).

**The Problem:** Standard chunking loses context. A chunk saying "It uses a boolean flag" is useless without knowing it belongs to "Chapter 2 > While Loops".

**Our Solution:**
1.  **Hierarchical Chunking:** We parse Markdown headers to track the full path of every text chunk (e.g., `["Unit 1", "React", "Hooks"]`).
2.  **AI Enrichment:** We use Gemini to generate metadata for each chunk:
    *   **Summary:** One-sentence overview.
    *   **Keywords:** For tag-based filtering.
    *   **Hypothetical Questions:** Enables "Question-to-Question" semantic search.
3.  **Smart Embedding:** We embed a rich context string (Title + Path + Summary + Content) rather than just raw text.

### 🧪 Testing the Pipeline

**1. Run the Chunking Logic Tests**
Verify that the deterministic chunker correctly handles headers, nesting, and code blocks.
```bash
npx tsx scripts/test-chunking.ts
```

**2. Test the Full AI Pipeline (Genkit UI)**
1.  Start the Genkit server:
    ```bash
    npm run genkit:dev
    ```
2.  Open `http://localhost:4000`.
3.  Select `optimizedIndexingFlow`.
4.  Input sample Markdown to see the generated chunks, metadata, and vector embeddings.

    **Example Input JSON:**
    ```json
    {
      "courseId": "cs-101",
      "documentTitle": "Introduction to AI",
      "markdownContent": "# What is AI?\n\nArtificial Intelligence (AI) is the simulation of human intelligence processes by machines.\n\n## Key Concepts\n\n### Machine Learning\nMachine Learning (ML) is a subset of AI that provides systems the ability to automatically learn and improve from experience."
    }
    ```
