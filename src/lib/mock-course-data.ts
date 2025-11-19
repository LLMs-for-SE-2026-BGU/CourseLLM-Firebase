
export const mockCourseData = {
  algorithms: `
# Introduction to Algorithms

Algorithms are the heart of computer science. An algorithm is a precise sequence of instructions for solving a problem.

## Sorting Algorithms

Sorting is a fundamental operation in computer science.

### Bubble Sort
Bubble Sort is the simplest sorting algorithm that works by repeatedly swapping the adjacent elements if they are in wrong order.

### Quick Sort
QuickSort is a Divide and Conquer algorithm. It picks an element as pivot and partitions the given array around the picked pivot.

## Graph Algorithms

Graphs are used to model pairwise relations between objects.

### Dijkstra's Algorithm
Dijkstra's algorithm is an algorithm for finding the shortest paths between nodes in a graph.

### BFS and DFS
Breadth-First Search (BFS) and Depth-First Search (DFS) are two common ways to traverse a graph.
`,

  reactHooks: `
# React Hooks

Hooks are a new addition in React 16.8. They let you use state and other React features without writing a class.

## Basic Hooks

### useState
Returns a stateful value, and a function to update it.

\`\`\`javascript
const [state, setState] = useState(initialState);
\`\`\`

### useEffect
Accepts a function that contains imperative, possibly effectful code.

## Additional Hooks

### useContext
Accepts a context object (the value returned from React.createContext) and returns the current context value for that context.

### useReducer
An alternative to useState. Accepts a reducer of type (state, action) => newState, and returns the current state paired with a dispatch method.
`,

  databaseNormalization: `
# Database Normalization

Normalization is the process of organizing data in a database.

## Normal Forms

### First Normal Form (1NF)
A relation is in 1NF if it contains no repeating groups of data.

### Second Normal Form (2NF)
A relation is in 2NF if it is in 1NF and every non-key attribute is fully dependent on the primary key.

### Third Normal Form (3NF)
A relation is in 3NF if it is in 2NF and no transitive dependencies exist.
`
};
