
import { chunkMarkdown } from '../src/lib/markdown-chunker';

const testCases = [
  {
    name: "Data Structures: Linked Lists (Textbook Style)",
    markdown: `
# Data Structures and Algorithms

## Chapter 3: Linked Lists

A linked list is a linear data structure, in which the elements are not stored at contiguous memory locations. The elements in a linked list are linked using pointers.

### Singly Linked List
In a singly linked list, each node contains a reference to the next node in the sequence. Traversing a singly linked list is done in a forward direction.

### Doubly Linked List
A doubly linked list is a linked list that contains a reference to the previous node as well as the next node. This allows for traversal in both forward and backward directions.
`
  },
  {
    name: "Web Development: React Components (Code Heavy)",
    markdown: `
# Modern Web Development

## React Basics

React is a JavaScript library for building user interfaces. It is maintained by Facebook and a community of individual developers and companies.

### Components

Components are the building blocks of a React application. They let you split the UI into independent, reusable pieces.

\`\`\`jsx
// This is a functional component
function Welcome(props) {
  return <h1>Hello, {props.name}</h1>;
}
\`\`\`

### Props
Props are arguments passed into React components. They are passed to components via HTML attributes.
`
  },
  {
    name: "Database Systems: Normalization (Lists & Concepts)",
    markdown: `
# Database Management Systems

## Normalization

Normalization is the process of organizing data in a database. This includes creating tables and establishing relationships between those tables according to rules designed both to protect the data and to make the database more flexible by eliminating redundancy and inconsistent dependency.

### First Normal Form (1NF)
The goals of First Normal Form are:
- Eliminate repeating groups in individual tables.
- Create a separate table for each set of related data.
- Identify each set of related data with a primary key.

### Second Normal Form (2NF)
Second Normal Form further addresses the concept of removing duplicative data:
- Meet all the requirements of the first normal form.
- Remove subsets of data that apply to multiple rows of a table and place them in separate tables.
- Create relationships between these new tables and their predecessors through the use of foreign keys.
`
  }
];

function runTests() {
  console.log("🧪 Running Markdown Chunking Tests...\n");

  for (const test of testCases) {
    console.log(`\n----------------------------------------`);
    console.log(`Testing: ${test.name}`);
    console.log(`----------------------------------------`);
    
    const chunks = chunkMarkdown(test.markdown);
    
    chunks.forEach((chunk, i) => {
      console.log(`\n[Chunk ${i + 1}]`);
      console.log(`Header Path: ${JSON.stringify(chunk.metadata.headerPath)}`);
      console.log(`Content: \n${chunk.content}`);
    });
  }
  console.log("\n✅ Tests Completed.");
}

runTests();
