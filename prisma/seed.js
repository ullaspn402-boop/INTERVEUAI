/**
 * Idempotent Seed Script for INTERVUE AI Placement Subjects, Topics, and Quizzes
 *
 * Running this script multiple times will NOT create duplicate data.
 * Uses `upsert` and deterministic lookups for subjects, topics, quizzes, questions, and options.
 */

const { PrismaClient } = require('@prisma/client')
const db = new PrismaClient()

// ─── 1. SUBJECTS & TOPICS SEED DATA ──────────────────────────────────────────

const SUBJECT_SEED_DATA = [
  {
    name: 'Data Structures & Algorithms',
    shortTitle: 'DSA',
    slug: 'dsa',
    description: 'Core data structures, algorithmic paradigms, problem-solving techniques, and complexity analysis.',
    category: 'CORE_TECHNICAL',
    displayOrder: 1,
    topics: [
      'Arrays',
      'Strings',
      'Linked Lists',
      'Stacks',
      'Queues',
      'Hashing',
      'Recursion',
      'Trees',
      'Binary Search Trees',
      'Heaps',
      'Graphs',
      'Dynamic Programming',
      'Greedy Algorithms',
      'Sorting',
      'Searching',
    ],
  },
  {
    name: 'Database Management',
    shortTitle: 'DBMS',
    slug: 'dbms',
    description: 'Relational database concepts, ER modeling, SQL fundamentals, normalization, transactions, and indexing.',
    category: 'CORE_TECHNICAL',
    displayOrder: 2,
    topics: [
      'Database Fundamentals',
      'ER Model',
      'Relational Model',
      'Keys',
      'Normalization',
      'SQL Fundamentals',
      'Transactions',
      'ACID Properties',
      'Indexing',
      'Joins',
      'Concurrency Control',
      'Database Security',
    ],
  },
  {
    name: 'Operating Systems',
    shortTitle: 'OS',
    slug: 'os',
    description: 'Process management, concurrency, synchronization, memory management, virtual memory, and file systems.',
    category: 'CORE_TECHNICAL',
    displayOrder: 3,
    topics: [
      'Processes',
      'Threads',
      'Process Scheduling',
      'Synchronization',
      'Deadlocks',
      'Memory Management',
      'Virtual Memory',
      'File Systems',
      'CPU Scheduling',
      'I/O Systems',
    ],
  },
  {
    name: 'Computer Networks',
    shortTitle: 'CN',
    slug: 'cn',
    description: 'Network architecture, OSI & TCP/IP models, routing protocols, transport protocols, and security principles.',
    category: 'CORE_TECHNICAL',
    displayOrder: 4,
    topics: [
      'Networking Fundamentals',
      'OSI Model',
      'TCP/IP',
      'IP Addressing',
      'TCP',
      'UDP',
      'HTTP',
      'HTTPS',
      'DNS',
      'Routing',
      'Network Security',
    ],
  },
  {
    name: 'Object Oriented Programming',
    shortTitle: 'OOP',
    slug: 'oop',
    description: 'Object-oriented paradigms, encapsulation, inheritance, polymorphism, design patterns, and SOLID principles.',
    category: 'CORE_TECHNICAL',
    displayOrder: 5,
    topics: [
      'Classes and Objects',
      'Encapsulation',
      'Inheritance',
      'Polymorphism',
      'Abstraction',
      'Interfaces',
      'Constructors',
      'SOLID Principles',
      'Design Principles',
    ],
  },
  {
    name: 'SQL Practice',
    shortTitle: 'SQL',
    slug: 'sql',
    description: 'Practical database querying, aggregation, window functions, complex joins, CTEs, and query optimization.',
    category: 'CORE_TECHNICAL',
    displayOrder: 6,
    topics: [
      'SELECT',
      'WHERE',
      'ORDER BY',
      'GROUP BY',
      'HAVING',
      'Joins',
      'Subqueries',
      'Aggregate Functions',
      'Window Functions',
      'CTEs',
      'Indexes',
      'Query Optimization',
    ],
  },
  {
    name: 'Quantitative Aptitude',
    shortTitle: 'Aptitude',
    slug: 'aptitude',
    description: 'Mathematical problem solving, logical reasoning, data interpretation, and speed math for campus recruitment.',
    category: 'ADDITIONAL',
    displayOrder: 7,
    topics: [
      'Percentages',
      'Profit and Loss',
      'Ratios',
      'Averages',
      'Time and Work',
      'Time Speed Distance',
      'Probability',
      'Permutations and Combinations',
      'Number Systems',
      'Logical Reasoning',
      'Data Interpretation',
      'Verbal Ability',
    ],
  },
  {
    name: 'AI & ML Fundamentals',
    shortTitle: 'AI/ML',
    slug: 'aiml',
    description: 'Artificial intelligence concepts, supervised & unsupervised machine learning, deep learning, NLP, and vision.',
    category: 'ADDITIONAL',
    displayOrder: 8,
    topics: [
      'Machine Learning Fundamentals',
      'Supervised Learning',
      'Unsupervised Learning',
      'Regression',
      'Classification',
      'Clustering',
      'Feature Engineering',
      'Model Evaluation',
      'Neural Networks',
      'Deep Learning',
      'NLP',
      'Computer Vision',
    ],
  },
]

// ─── 2. QUIZ & QUESTION SEED DATA ────────────────────────────────────────────

const QUIZ_SEED_DATA = [
  // ── DSA Quizzes ──
  {
    subjectSlug: 'dsa',
    title: 'DSA Fundamentals',
    slug: 'dsa-fundamentals',
    description: 'Core concepts on arrays, stacks, sorting, searching, and algorithm complexity.',
    difficulty: 'EASY',
    durationMinutes: 12,
    displayOrder: 1,
    questions: [
      {
        questionText: 'What is the time complexity of searching for an element in an unsorted array of size N?',
        explanation: 'In an unsorted array, we must potentially check every element sequentially (linear search), giving O(N) complexity.',
        difficulty: 'EASY',
        topicSlug: 'arrays',
        options: [
          { key: 'A', text: 'O(N)', isCorrect: true },
          { key: 'B', text: 'O(log N)', isCorrect: false },
          { key: 'C', text: 'O(1)', isCorrect: false },
          { key: 'D', text: 'O(N log N)', isCorrect: false },
        ],
      },
      {
        questionText: 'Which data structure operates on a Last-In, First-Out (LIFO) principle?',
        explanation: 'A stack inserts and removes elements from the top, obeying LIFO order.',
        difficulty: 'EASY',
        topicSlug: 'stacks',
        options: [
          { key: 'A', text: 'Queue', isCorrect: false },
          { key: 'B', text: 'Stack', isCorrect: true },
          { key: 'C', text: 'Heap', isCorrect: false },
          { key: 'D', text: 'Tree', isCorrect: false },
        ],
      },
      {
        questionText: 'What is the worst-case time complexity of Quick Sort?',
        explanation: 'When the array is already sorted or bad pivots are chosen repeatedly, Quick Sort degrades to O(N²).',
        difficulty: 'MEDIUM',
        topicSlug: 'sorting',
        options: [
          { key: 'A', text: 'O(N log N)', isCorrect: false },
          { key: 'B', text: 'O(N²)', isCorrect: true },
          { key: 'C', text: 'O(N)', isCorrect: false },
          { key: 'D', text: 'O(log N)', isCorrect: false },
        ],
      },
      {
        questionText: 'Which data structure allows fast average O(1) lookups using key-value pairs?',
        explanation: 'Hash tables compute a hash function on the key to access elements in average O(1) constant time.',
        difficulty: 'EASY',
        topicSlug: 'hashing',
        options: [
          { key: 'A', text: 'Binary Tree', isCorrect: false },
          { key: 'B', text: 'Hash Table', isCorrect: true },
          { key: 'C', text: 'Doubly Linked List', isCorrect: false },
          { key: 'D', text: 'Priority Queue', isCorrect: false },
        ],
      },
      {
        questionText: 'What is the maximum number of children a node can have in a Binary Tree?',
        explanation: 'By definition, each node in a binary tree has at most two children (left and right).',
        difficulty: 'EASY',
        topicSlug: 'trees',
        options: [
          { key: 'A', text: '1', isCorrect: false },
          { key: 'B', text: '2', isCorrect: true },
          { key: 'C', text: '3', isCorrect: false },
          { key: 'D', text: 'Unlimited', isCorrect: false },
        ],
      },
      {
        questionText: 'What is the space complexity of a recursive function with a maximum call stack depth of N?',
        explanation: 'Each recursive call adds a stack frame to memory, yielding O(N) auxiliary space.',
        difficulty: 'EASY',
        topicSlug: 'recursion',
        options: [
          { key: 'A', text: 'O(1)', isCorrect: false },
          { key: 'B', text: 'O(N)', isCorrect: true },
          { key: 'C', text: 'O(N²)', isCorrect: false },
          { key: 'D', text: 'O(log N)', isCorrect: false },
        ],
      },
      {
        questionText: 'Which sorting algorithm is guaranteed to have O(N log N) worst-case time complexity?',
        explanation: 'Merge Sort divides the array into halves recursively and merges them in O(N log N) time in all cases.',
        difficulty: 'EASY',
        topicSlug: 'sorting',
        options: [
          { key: 'A', text: 'Quick Sort', isCorrect: false },
          { key: 'B', text: 'Merge Sort', isCorrect: true },
          { key: 'C', text: 'Bubble Sort', isCorrect: false },
          { key: 'D', text: 'Insertion Sort', isCorrect: false },
        ],
      },
      {
        questionText: 'In a Queue data structure, from which end are elements removed?',
        explanation: 'Queues follow First-In, First-Out (FIFO). Elements enter at the rear and exit from the front.',
        difficulty: 'EASY',
        topicSlug: 'queues',
        options: [
          { key: 'A', text: 'Rear', isCorrect: false },
          { key: 'B', text: 'Front', isCorrect: true },
          { key: 'C', text: 'Top', isCorrect: false },
          { key: 'D', text: 'Middle', isCorrect: false },
        ],
      },
      {
        questionText: 'What is the space complexity of storing a graph with V vertices using an Adjacency Matrix?',
        explanation: 'An adjacency matrix is a 2D V x V grid, requiring O(V²) space regardless of the number of edges.',
        difficulty: 'MEDIUM',
        topicSlug: 'graphs',
        options: [
          { key: 'A', text: 'O(V + E)', isCorrect: false },
          { key: 'B', text: 'O(V²)', isCorrect: true },
          { key: 'C', text: 'O(E²)', isCorrect: false },
          { key: 'D', text: 'O(V log V)', isCorrect: false },
        ],
      },
      {
        questionText: 'Binary Search requires the input array to be in what state?',
        explanation: 'Binary search works by halving the search space based on element ordering, which requires a sorted array.',
        difficulty: 'EASY',
        topicSlug: 'searching',
        options: [
          { key: 'A', text: 'Reverse order', isCorrect: false },
          { key: 'B', text: 'Unsorted', isCorrect: false },
          { key: 'C', text: 'Sorted', isCorrect: true },
          { key: 'D', text: 'Randomized', isCorrect: false },
        ],
      },
    ],
  },
  {
    subjectSlug: 'dsa',
    title: 'DSA Interview Basics',
    slug: 'dsa-interview-basics',
    description: 'Frequently asked placement questions on trees, graphs, heaps, dynamic programming, and greedy methods.',
    difficulty: 'MEDIUM',
    durationMinutes: 15,
    displayOrder: 2,
    questions: [
      {
        questionText: 'How can you detect a cycle in a Singly Linked List using O(1) extra space?',
        explanation: 'Floyd\'s algorithm uses two pointers (slow and fast); if they meet, a cycle exists.',
        difficulty: 'MEDIUM',
        topicSlug: 'linked-lists',
        options: [
          { key: 'A', text: 'Hash Set', isCorrect: false },
          { key: 'B', text: 'Floyd\'s Tortoise and Hare algorithm', isCorrect: true },
          { key: 'C', text: 'Recursion', isCorrect: false },
          { key: 'D', text: 'Breadth First Search', isCorrect: false },
        ],
      },
      {
        questionText: 'What is the average time complexity of insertion in a Min Heap of size N?',
        explanation: 'Inserting at the bottom of the tree and bubbling up takes O(log N) time proportional to tree height.',
        difficulty: 'MEDIUM',
        topicSlug: 'heaps',
        options: [
          { key: 'A', text: 'O(1)', isCorrect: false },
          { key: 'B', text: 'O(log N)', isCorrect: true },
          { key: 'C', text: 'O(N)', isCorrect: false },
          { key: 'D', text: 'O(N log N)', isCorrect: false },
        ],
      },
      {
        questionText: 'Which algorithmic strategy is used in the 0/1 Knapsack Problem for optimal substructure?',
        explanation: '0/1 Knapsack exhibits overlapping subproblems and optimal substructure, solved efficiently via Dynamic Programming.',
        difficulty: 'HARD',
        topicSlug: 'dynamic-programming',
        options: [
          { key: 'A', text: 'Greedy Approach', isCorrect: false },
          { key: 'B', text: 'Dynamic Programming', isCorrect: true },
          { key: 'C', text: 'Backtracking only', isCorrect: false },
          { key: 'D', text: 'Divide and Conquer without memoization', isCorrect: false },
        ],
      },
      {
        questionText: 'What data structure is typically used to implement Breadth-First Search (BFS) on a graph?',
        explanation: 'BFS explores nodes level by level using a FIFO Queue.',
        difficulty: 'EASY',
        topicSlug: 'graphs',
        options: [
          { key: 'A', text: 'Stack', isCorrect: false },
          { key: 'B', text: 'Queue', isCorrect: true },
          { key: 'C', text: 'Priority Queue', isCorrect: false },
          { key: 'D', text: 'Binary Search Tree', isCorrect: false },
        ],
      },
      {
        questionText: 'What is the height of a balanced Binary Search Tree (BST) containing N nodes?',
        explanation: 'A balanced BST maintains height proportional to O(log N), guaranteeing efficient logarithmic operations.',
        difficulty: 'MEDIUM',
        topicSlug: 'binary-search-trees',
        options: [
          { key: 'A', text: 'O(N)', isCorrect: false },
          { key: 'B', text: 'O(log N)', isCorrect: true },
          { key: 'C', text: 'O(1)', isCorrect: false },
          { key: 'D', text: 'O(N²)', isCorrect: false },
        ],
      },
      {
        questionText: 'In Dynamic Programming, what term describes storing results of recursive calls to avoid recalculation?',
        explanation: 'Memoization caches top-down recursive results to prevent redundant subproblem computation.',
        difficulty: 'MEDIUM',
        topicSlug: 'dynamic-programming',
        options: [
          { key: 'A', text: 'Hashing', isCorrect: false },
          { key: 'B', text: 'Memoization', isCorrect: true },
          { key: 'C', text: 'Recursion', isCorrect: false },
          { key: 'D', text: 'Serialization', isCorrect: false },
        ],
      },
      {
        questionText: 'Which data structure is optimal for implementing Dijkstra\'s shortest path algorithm efficiently?',
        explanation: 'A min-priority queue (min-heap) allows extracting the minimum distance node in O(log V) time.',
        difficulty: 'HARD',
        topicSlug: 'graphs',
        options: [
          { key: 'A', text: 'Stack', isCorrect: false },
          { key: 'B', text: 'Min-Priority Queue', isCorrect: true },
          { key: 'C', text: 'Standard Queue', isCorrect: false },
          { key: 'D', text: 'Deque', isCorrect: false },
        ],
      },
      {
        questionText: 'What is the worst-case search time complexity in an unbalanced Binary Search Tree?',
        explanation: 'In a skewed BST (like a linked list), searching requires visiting all N nodes, resulting in O(N) time.',
        difficulty: 'MEDIUM',
        topicSlug: 'binary-search-trees',
        options: [
          { key: 'A', text: 'O(log N)', isCorrect: false },
          { key: 'B', text: 'O(N)', isCorrect: true },
          { key: 'C', text: 'O(1)', isCorrect: false },
          { key: 'D', text: 'O(N log N)', isCorrect: false },
        ],
      },
      {
        questionText: 'What is the main property of an In-Order traversal on a Binary Search Tree (BST)?',
        explanation: 'In-order traversal (Left, Root, Right) visits nodes of a BST in strictly non-decreasing sorted order.',
        difficulty: 'MEDIUM',
        topicSlug: 'trees',
        options: [
          { key: 'A', text: 'Visits root first', isCorrect: false },
          { key: 'B', text: 'Yields elements in sorted ascending order', isCorrect: true },
          { key: 'C', text: 'Minimizes call stack size', isCorrect: false },
          { key: 'D', text: 'Finds tree depth', isCorrect: false },
        ],
      },
      {
        questionText: 'Which algorithmic paradigm is used in Kruskal\'s Algorithm to find a Minimum Spanning Tree?',
        explanation: 'Kruskal\'s algorithm greedily chooses the smallest available edge that does not form a cycle.',
        difficulty: 'MEDIUM',
        topicSlug: 'greedy-algorithms',
        options: [
          { key: 'A', text: 'Dynamic Programming', isCorrect: false },
          { key: 'B', text: 'Greedy Algorithm', isCorrect: true },
          { key: 'C', text: 'Backtracking', isCorrect: false },
          { key: 'D', text: 'Divide and Conquer', isCorrect: false },
        ],
      },
    ],
  },

  // ── DBMS Quizzes ──
  {
    subjectSlug: 'dbms',
    title: 'DBMS Fundamentals',
    slug: 'dbms-fundamentals',
    description: 'Relational database basics, ER models, normalization rules, primary/foreign keys, and relational operations.',
    difficulty: 'EASY',
    durationMinutes: 12,
    displayOrder: 1,
    questions: [
      {
        questionText: 'What is the primary goal of database normalization?',
        explanation: 'Normalization structures tables to eliminate redundant data and update/insertion/deletion anomalies.',
        difficulty: 'EASY',
        topicSlug: 'normalization',
        options: [
          { key: 'A', text: 'Eliminate all primary keys', isCorrect: false },
          { key: 'B', text: 'Organize data to reduce redundancy and anomalies', isCorrect: true },
          { key: 'C', text: 'Convert data to JSON objects', isCorrect: false },
          { key: 'D', text: 'Make every query run faster regardless of schema', isCorrect: false },
        ],
      },
      {
        questionText: 'Which key is selected from candidate keys to uniquely identify tuples in a table?',
        explanation: 'The primary key is chosen from candidate keys to uniquely identify each row in a relational table.',
        difficulty: 'EASY',
        topicSlug: 'keys',
        options: [
          { key: 'A', text: 'Foreign Key', isCorrect: false },
          { key: 'B', text: 'Primary Key', isCorrect: true },
          { key: 'C', text: 'Alternate Key', isCorrect: false },
          { key: 'D', text: 'Super Key', isCorrect: false },
        ],
      },
      {
        questionText: 'Which normal form requires removing partial dependencies on composite primary keys?',
        explanation: 'Second Normal Form (2NF) removes partial dependencies, ensuring full functional dependency on primary keys.',
        difficulty: 'MEDIUM',
        topicSlug: 'normalization',
        options: [
          { key: 'A', text: '1NF', isCorrect: false },
          { key: 'B', text: '2NF', isCorrect: true },
          { key: 'C', text: '3NF', isCorrect: false },
          { key: 'D', text: 'BCNF', isCorrect: false },
        ],
      },
      {
        questionText: 'What is a Foreign Key in relational databases?',
        explanation: 'A foreign key establishes relational integrity between tables by linking to a primary key in a parent table.',
        difficulty: 'EASY',
        topicSlug: 'keys',
        options: [
          { key: 'A', text: 'A key used for encrypting database tables', isCorrect: false },
          { key: 'B', text: 'A column in one table that references the primary key of another table', isCorrect: true },
          { key: 'C', text: 'A randomly generated unique ID', isCorrect: false },
          { key: 'D', text: 'A primary key in a remote database server', isCorrect: false },
        ],
      },
      {
        questionText: 'What does the "A" stand for in ACID transaction properties?',
        explanation: 'Atomicity ensures that all statements within a transaction succeed together or fail completely (all-or-nothing).',
        difficulty: 'EASY',
        topicSlug: 'acid-properties',
        options: [
          { key: 'A', text: 'Availability', isCorrect: false },
          { key: 'B', text: 'Atomicity', isCorrect: true },
          { key: 'C', text: 'Authenticity', isCorrect: false },
          { key: 'D', text: 'Asynchrony', isCorrect: false },
        ],
      },
      {
        questionText: 'Which ER diagram concept represents an entity that depends on an identifying owner entity?',
        explanation: 'A weak entity lacks a primary key of its own and depends on an identifying owner entity.',
        difficulty: 'MEDIUM',
        topicSlug: 'er-model',
        options: [
          { key: 'A', text: 'Strong Entity', isCorrect: false },
          { key: 'B', text: 'Weak Entity', isCorrect: true },
          { key: 'C', text: 'Derived Attribute', isCorrect: false },
          { key: 'D', text: 'Recursive Relation', isCorrect: false },
        ],
      },
      {
        questionText: 'Which SQL command is used to add or modify columns in an existing table structure?',
        explanation: '`ALTER TABLE` is a DDL command used to add, delete, or modify columns in an existing table structure.',
        difficulty: 'EASY',
        topicSlug: 'sql-fundamentals',
        options: [
          { key: 'A', text: 'UPDATE', isCorrect: false },
          { key: 'B', text: 'ALTER TABLE', isCorrect: true },
          { key: 'C', text: 'MODIFY TABLE', isCorrect: false },
          { key: 'D', text: 'CHANGE TABLE', isCorrect: false },
        ],
      },
      {
        questionText: 'In relational algebra, which operator filters rows based on a given condition?',
        explanation: 'Selection (σ) selects a subset of tuples (rows) that satisfy a specified predicate condition.',
        difficulty: 'MEDIUM',
        topicSlug: 'relational-model',
        options: [
          { key: 'A', text: 'Projection (π)', isCorrect: false },
          { key: 'B', text: 'Selection (σ)', isCorrect: true },
          { key: 'C', text: 'Cartesian Product (×)', isCorrect: false },
          { key: 'D', text: 'Join (⋈)', isCorrect: false },
        ],
      },
      {
        questionText: 'Which type of join returns all rows from the left table and matching rows from the right table?',
        explanation: 'LEFT JOIN preserves all records from the left relation, filling NULL for unmatched right relation attributes.',
        difficulty: 'EASY',
        topicSlug: 'joins',
        options: [
          { key: 'A', text: 'INNER JOIN', isCorrect: false },
          { key: 'B', text: 'LEFT OUTER JOIN', isCorrect: true },
          { key: 'C', text: 'RIGHT OUTER JOIN', isCorrect: false },
          { key: 'D', text: 'FULL OUTER JOIN', isCorrect: false },
        ],
      },
      {
        questionText: 'Which property ensures that concurrent transaction execution yields the same result as sequential execution?',
        explanation: 'Isolation guarantees that concurrent transactions do not interfere with each other\'s intermediate operations.',
        difficulty: 'MEDIUM',
        topicSlug: 'concurrency-control',
        options: [
          { key: 'A', text: 'Atomicity', isCorrect: false },
          { key: 'B', text: 'Isolation', isCorrect: true },
          { key: 'C', text: 'Durability', isCorrect: false },
          { key: 'D', text: 'Consistency', isCorrect: false },
        ],
      },
    ],
  },
  {
    subjectSlug: 'dbms',
    title: 'DBMS Interview Basics',
    slug: 'dbms-interview-basics',
    description: 'Placement questions on B+ Trees, transaction isolation levels, deadlocks, WAL protocols, and BCNF.',
    difficulty: 'MEDIUM',
    durationMinutes: 15,
    displayOrder: 2,
    questions: [
      {
        questionText: 'What is a Phantom Read anomaly in transaction processing?',
        explanation: 'Phantom reads occur when a transaction re-runs a range query and sees new rows inserted/committed by another transaction.',
        difficulty: 'MEDIUM',
        topicSlug: 'transactions',
        options: [
          { key: 'A', text: 'Reading uncommitted data from another transaction', isCorrect: false },
          { key: 'B', text: 'Re-reading a single row yields modified values', isCorrect: false },
          { key: 'C', text: 'Re-running a range query yields new rows inserted by another committed transaction', isCorrect: true },
          { key: 'D', text: 'Database crash during active commit', isCorrect: false },
        ],
      },
      {
        questionText: 'Which index structure is most widely used in relational database engines for efficient range queries?',
        explanation: 'B+ Trees store all data pointers at leaf nodes linked sequentially, providing efficient point lookups and range scans.',
        difficulty: 'MEDIUM',
        topicSlug: 'indexing',
        options: [
          { key: 'A', text: 'Hash Index', isCorrect: false },
          { key: 'B', text: 'B+ Tree Index', isCorrect: true },
          { key: 'C', text: 'Binary Search Tree', isCorrect: false },
          { key: 'D', text: 'Heap File', isCorrect: false },
        ],
      },
      {
        questionText: 'What is a deadlock in database transaction processing?',
        explanation: 'A deadlock happens when circular wait conditions arise among transactions acquiring database locks.',
        difficulty: 'MEDIUM',
        topicSlug: 'concurrency-control',
        options: [
          { key: 'A', text: 'Database server running out of storage space', isCorrect: false },
          { key: 'B', text: 'Two or more transactions waiting indefinitely for locks held by each other', isCorrect: true },
          { key: 'C', text: 'A table with missing primary key index', isCorrect: false },
          { key: 'D', text: 'Uncommitted read error on secondary node', isCorrect: false },
        ],
      },
      {
        questionText: 'What is the purpose of the Write-Ahead Logging (WAL) protocol?',
        explanation: 'WAL writes transaction log records to persistent storage before modifying database data pages to ensure crash recovery.',
        difficulty: 'MEDIUM',
        topicSlug: 'transactions',
        options: [
          { key: 'A', text: 'Speeding up SELECT queries in memory', isCorrect: false },
          { key: 'B', text: 'Ensuring Durability by writing changes to log storage before updating data files', isCorrect: true },
          { key: 'C', text: 'Encrypting user authentication data', isCorrect: false },
          { key: 'D', text: 'Generating auto-incrementing primary keys', isCorrect: false },
        ],
      },
      {
        questionText: 'What condition defines Third Normal Form (3NF)?',
        explanation: '3NF requires 2NF plus the elimination of transitive functional dependencies X -> Y where Y is non-prime.',
        difficulty: 'MEDIUM',
        topicSlug: 'normalization',
        options: [
          { key: 'A', text: 'In 2NF and no transitive functional dependencies exist for non-prime attributes', isCorrect: true },
          { key: 'B', text: 'In 1NF with no duplicate rows', isCorrect: false },
          { key: 'C', text: 'Every attribute is part of the primary key', isCorrect: false },
          { key: 'D', text: 'Table contains no foreign key references', isCorrect: false },
        ],
      },
      {
        questionText: 'What is a Dirty Read in database transactions?',
        explanation: 'A dirty read occurs when Transaction A reads modifications made by Transaction B before B has committed.',
        difficulty: 'EASY',
        topicSlug: 'transactions',
        options: [
          { key: 'A', text: 'Reading corrupted disk blocks from storage', isCorrect: false },
          { key: 'B', text: 'Reading uncommitted data modified by another transaction', isCorrect: true },
          { key: 'C', text: 'Reading rows without a defined index', isCorrect: false },
          { key: 'D', text: 'Reading stale cache data', isCorrect: false },
        ],
      },
      {
        questionText: 'Which transaction isolation level prevents Dirty Reads but allows Non-Repeatable Reads?',
        explanation: 'READ COMMITTED ensures queries only read committed data, preventing dirty reads.',
        difficulty: 'MEDIUM',
        topicSlug: 'transactions',
        options: [
          { key: 'A', text: 'READ UNCOMMITTED', isCorrect: false },
          { key: 'B', text: 'READ COMMITTED', isCorrect: true },
          { key: 'C', text: 'REPEATABLE READ', isCorrect: false },
          { key: 'D', text: 'SERIALIZABLE', isCorrect: false },
        ],
      },
      {
        questionText: 'What is the primary purpose of the Two-Phase Locking (2PL) protocol?',
        explanation: '2PL splits locking into growing (acquiring) and shrinking (releasing) phases, ensuring serializable schedules.',
        difficulty: 'HARD',
        topicSlug: 'concurrency-control',
        options: [
          { key: 'A', text: 'Optimizing SQL execution plans', isCorrect: false },
          { key: 'B', text: 'Guaranteeing serializability of concurrent transaction execution', isCorrect: true },
          { key: 'C', text: 'Replicating data asynchronously across servers', isCorrect: false },
          { key: 'D', text: 'Creating database backups during runtime', isCorrect: false },
        ],
      },
      {
        questionText: 'What is a Clustered Index?',
        explanation: 'A clustered index physically sorts table rows on disk according to the indexed key values (e.g. Primary Key).',
        difficulty: 'MEDIUM',
        topicSlug: 'indexing',
        options: [
          { key: 'A', text: 'An index stored entirely in RAM memory', isCorrect: false },
          { key: 'B', text: 'An index that determines the physical storage order of data rows on disk', isCorrect: true },
          { key: 'C', text: 'An index built across multiple databases', isCorrect: false },
          { key: 'D', text: 'An index without a corresponding primary key', isCorrect: false },
        ],
      },
      {
        questionText: 'In BCNF (Boyce-Codd Normal Form), what rule must every non-trivial functional dependency X -> Y satisfy?',
        explanation: 'BCNF is a stricter version of 3NF requiring that for every functional dependency X -> Y, X must be a super key.',
        difficulty: 'HARD',
        topicSlug: 'normalization',
        options: [
          { key: 'A', text: 'Y must be a primary key', isCorrect: false },
          { key: 'B', text: 'X must be a super key', isCorrect: true },
          { key: 'C', text: 'X must be a foreign key', isCorrect: false },
          { key: 'D', text: 'Y must be a single integer column', isCorrect: false },
        ],
      },
    ],
  },

  // ── OS Quizzes ──
  {
    subjectSlug: 'os',
    title: 'Operating Systems Fundamentals',
    slug: 'os-fundamentals',
    description: 'Process states, thread concepts, CPU scheduling algorithms, virtual memory, and system calls.',
    difficulty: 'EASY',
    durationMinutes: 12,
    displayOrder: 1,
    questions: [
      {
        questionText: 'What is the primary role of an Operating System kernel?',
        explanation: 'The kernel is the central core of an OS managing memory, processes, device drivers, and system calls.',
        difficulty: 'EASY',
        topicSlug: 'processes',
        options: [
          { key: 'A', text: 'Designing user interface graphics', isCorrect: false },
          { key: 'B', text: 'Managing hardware resources and process execution environment', isCorrect: true },
          { key: 'C', text: 'Executing web database queries', isCorrect: false },
          { key: 'D', text: 'Compiling application source code', isCorrect: false },
        ],
      },
      {
        questionText: 'What state does a process enter when it is waiting for an I/O operation to complete?',
        explanation: 'Processes waiting for external events like disk or network I/O move from Running to Blocked/Waiting state.',
        difficulty: 'EASY',
        topicSlug: 'processes',
        options: [
          { key: 'A', text: 'Running', isCorrect: false },
          { key: 'B', text: 'Waiting / Blocked', isCorrect: true },
          { key: 'C', text: 'Ready', isCorrect: false },
          { key: 'D', text: 'Terminated', isCorrect: false },
        ],
      },
      {
        questionText: 'What is a Context Switch in CPU management?',
        explanation: 'A context switch involves saving CPU registers/state of a process so it can be resumed later while another runs.',
        difficulty: 'MEDIUM',
        topicSlug: 'process-scheduling',
        options: [
          { key: 'A', text: 'Switching network routes between servers', isCorrect: false },
          { key: 'B', text: 'Saving state of running process and restoring state of another process', isCorrect: true },
          { key: 'C', text: 'Recompiling kernel modules', isCorrect: false },
          { key: 'D', text: 'Formatting virtual memory swap file', isCorrect: false },
        ],
      },
      {
        questionText: 'Which scheduling algorithm allocates CPU time to processes in equal time slices round-robin style?',
        explanation: 'Round Robin scheduling uses a fixed time quantum per process in a cyclic queue.',
        difficulty: 'EASY',
        topicSlug: 'cpu-scheduling',
        options: [
          { key: 'A', text: 'First-Come First-Served (FCFS)', isCorrect: false },
          { key: 'B', text: 'Round Robin (RR)', isCorrect: true },
          { key: 'C', text: 'Shortest Job First (SJF)', isCorrect: false },
          { key: 'D', text: 'Priority Scheduling', isCorrect: false },
        ],
      },
      {
        questionText: 'What is Thrashing in Virtual Memory systems?',
        explanation: 'Thrashing happens when main memory is insufficient, causing continuous page faults and disk swapping.',
        difficulty: 'MEDIUM',
        topicSlug: 'virtual-memory',
        options: [
          { key: 'A', text: 'High CPU processing throughput', isCorrect: false },
          { key: 'B', text: 'Excessive time spent swapping pages in and out of disk instead of executing code', isCorrect: true },
          { key: 'C', text: 'Deleting temporary cache files automatically', isCorrect: false },
          { key: 'D', text: 'Overheating of physical RAM chips', isCorrect: false },
        ],
      },
      {
        questionText: 'What is a Thread in operating system architecture?',
        explanation: 'Threads share code, data, and OS resources of their parent process while maintaining their own call stack.',
        difficulty: 'EASY',
        topicSlug: 'threads',
        options: [
          { key: 'A', text: 'A separate physical hard drive partition', isCorrect: false },
          { key: 'B', text: 'A lightweight unit of execution sharing address space within a process', isCorrect: true },
          { key: 'C', text: 'A hardware cable inside the computer chassis', isCorrect: false },
          { key: 'D', text: 'An encrypted security token file', isCorrect: false },
        ],
      },
      {
        questionText: 'Which of the following is NOT a necessary Coffman condition for Deadlock to occur?',
        explanation: 'Deadlock requires NO preemption. If resources CAN be preempted, deadlock cannot occur.',
        difficulty: 'MEDIUM',
        topicSlug: 'deadlocks',
        options: [
          { key: 'A', text: 'Mutual Exclusion', isCorrect: false },
          { key: 'B', text: 'Hold and Wait', isCorrect: false },
          { key: 'C', text: 'Preemption Allowed', isCorrect: true },
          { key: 'D', text: 'Circular Wait', isCorrect: false },
        ],
      },
      {
        questionText: 'What is Virtual Memory?',
        explanation: 'Virtual memory maps virtual addresses to physical RAM and secondary disk storage via paging.',
        difficulty: 'EASY',
        topicSlug: 'virtual-memory',
        options: [
          { key: 'A', text: 'Dedicated RAM on a dedicated graphics card', isCorrect: false },
          { key: 'B', text: 'Memory management technique giving processes illusion of large contiguous RAM using secondary storage', isCorrect: true },
          { key: 'C', text: 'L1/L2 cache inside CPU core', isCorrect: false },
          { key: 'D', text: 'Read-only BIOS firmware memory', isCorrect: false },
        ],
      },
      {
        questionText: 'What mechanism is used by user-space applications to request privileged OS kernel services?',
        explanation: 'System calls provide a secure interface for user-mode applications to invoke kernel-privileged operations.',
        difficulty: 'EASY',
        topicSlug: 'processes',
        options: [
          { key: 'A', text: 'System Calls', isCorrect: true },
          { key: 'B', text: 'Direct Register Modification', isCorrect: false },
          { key: 'C', text: 'Global Variable Write', isCorrect: false },
          { key: 'D', text: 'Thread Interruption', isCorrect: false },
        ],
      },
      {
        questionText: 'Which CPU scheduling algorithm gives the minimum average waiting time for a static batch of processes?',
        explanation: 'SJF is mathematically optimal in yielding the minimum average waiting time for processes.',
        difficulty: 'MEDIUM',
        topicSlug: 'cpu-scheduling',
        options: [
          { key: 'A', text: 'FCFS', isCorrect: false },
          { key: 'B', text: 'Shortest Job First (SJF)', isCorrect: true },
          { key: 'C', text: 'Priority Scheduling', isCorrect: false },
          { key: 'D', text: 'Round Robin', isCorrect: false },
        ],
      },
    ],
  },
  {
    subjectSlug: 'os',
    title: 'OS Interview Basics',
    slug: 'os-interview-basics',
    description: 'Placement questions on semaphores, mutexes, Banker\'s algorithm, page replacement, zombie processes, and TLB.',
    difficulty: 'MEDIUM',
    durationMinutes: 15,
    displayOrder: 2,
    questions: [
      {
        questionText: 'What is a Semaphore in process synchronization?',
        explanation: 'A semaphore is a synchronization primitive managed via atomic wait (P) and signal (V) operations.',
        difficulty: 'EASY',
        topicSlug: 'synchronization',
        options: [
          { key: 'A', text: 'A type of disk file system', isCorrect: false },
          { key: 'B', text: 'An integer variable used to coordinate resource access via atomic wait/signal calls', isCorrect: true },
          { key: 'C', text: 'A network socket buffer', isCorrect: false },
          { key: 'D', text: 'A CPU instruction register', isCorrect: false },
        ],
      },
      {
        questionText: 'What is Belady\'s Anomaly in page replacement algorithms?',
        explanation: 'Belady\'s anomaly occurs in FIFO page replacement where increasing page frames causes more page faults.',
        difficulty: 'MEDIUM',
        topicSlug: 'virtual-memory',
        options: [
          { key: 'A', text: 'Page faults decrease when allocated frames increase', isCorrect: false },
          { key: 'B', text: 'Increasing physical memory frames causes page fault count to increase', isCorrect: true },
          { key: 'C', text: 'Memory leak caused by unclosed file pointers', isCorrect: false },
          { key: 'D', text: 'CPU utilization drops when adding RAM', isCorrect: false },
        ],
      },
      {
        questionText: 'Which page replacement algorithm can suffer from Belady\'s Anomaly?',
        explanation: 'FIFO page replacement can exhibit Belady\'s anomaly, whereas stack-based algorithms like LRU do not.',
        difficulty: 'MEDIUM',
        topicSlug: 'virtual-memory',
        options: [
          { key: 'A', text: 'LRU (Least Recently Used)', isCorrect: false },
          { key: 'B', text: 'FIFO (First-In First-Out)', isCorrect: true },
          { key: 'C', text: 'Optimal Page Replacement', isCorrect: false },
          { key: 'D', text: 'LFU (Least Frequently Used)', isCorrect: false },
        ],
      },
      {
        questionText: 'What is Dijkstra\'s Banker\'s Algorithm used for in operating systems?',
        explanation: 'Dijkstra\'s Banker\'s algorithm tests for safe states before allocating resources to avoid deadlocks.',
        difficulty: 'MEDIUM',
        topicSlug: 'deadlocks',
        options: [
          { key: 'A', text: 'Bank transaction security encryption', isCorrect: false },
          { key: 'B', text: 'Deadlock Avoidance', isCorrect: true },
          { key: 'C', text: 'CPU Time Slicing', isCorrect: false },
          { key: 'D', text: 'Disk Defragmentation', isCorrect: false },
        ],
      },
      {
        questionText: 'What is a Zombie Process in Unix-like operating systems?',
        explanation: 'A zombie process has terminated, but its parent process has not yet read its exit status via wait().',
        difficulty: 'MEDIUM',
        topicSlug: 'processes',
        options: [
          { key: 'A', text: 'A process running infinite loops consuming 100% CPU', isCorrect: false },
          { key: 'B', text: 'A process that has finished execution but still has an entry in the OS process table', isCorrect: true },
          { key: 'C', text: 'A process blocked on network socket IO', isCorrect: false },
          { key: 'D', text: 'A malicious virus process', isCorrect: false },
        ],
      },
      {
        questionText: 'What is an Orphan Process?',
        explanation: 'An orphan process continues running after its parent dies, usually adopted by the init/systemd process.',
        difficulty: 'EASY',
        topicSlug: 'processes',
        options: [
          { key: 'A', text: 'A process with no assigned threads', isCorrect: false },
          { key: 'B', text: 'A process whose parent process terminated before it completed', isCorrect: true },
          { key: 'C', text: 'A process with zero priority', isCorrect: false },
          { key: 'D', text: 'A kernel thread with no PID', isCorrect: false },
        ],
      },
      {
        questionText: 'What key distinction separates a Mutex from a Counting Semaphore?',
        explanation: 'A Mutex is an ownership-based locking mechanism, whereas a Counting Semaphore manages access to N identical resources.',
        difficulty: 'MEDIUM',
        topicSlug: 'synchronization',
        options: [
          { key: 'A', text: 'Mutex can be unlocked by any thread in the system', isCorrect: false },
          { key: 'B', text: 'Mutex provides ownership-based locking by a single thread; Semaphore holds an integer counter', isCorrect: true },
          { key: 'C', text: 'Mutex handles disk files while Semaphore handles RAM', isCorrect: false },
          { key: 'D', text: 'There is no distinction between them', isCorrect: false },
        ],
      },
      {
        questionText: 'What causes External Fragmentation in memory allocation?',
        explanation: 'External fragmentation occurs when free memory is divided into small non-contiguous holes scattered across RAM.',
        difficulty: 'MEDIUM',
        topicSlug: 'memory-management',
        options: [
          { key: 'A', text: 'Unused space inside allocated fixed-size memory blocks', isCorrect: false },
          { key: 'B', text: 'Total free memory space is sufficient but divided into small non-contiguous blocks', isCorrect: true },
          { key: 'C', text: 'Hard disk sector corruption', isCorrect: false },
          { key: 'D', text: 'Missing page table entry', isCorrect: false },
        ],
      },
      {
        questionText: 'What is Internal Fragmentation in paging systems?',
        explanation: 'Internal fragmentation occurs when memory is allocated in fixed-size blocks (e.g. pages) larger than requested.',
        difficulty: 'EASY',
        topicSlug: 'memory-management',
        options: [
          { key: 'A', text: 'Unallocated gaps between separate process spaces', isCorrect: false },
          { key: 'B', text: 'Unused space inside an allocated fixed-size block when requested size is smaller than block size', isCorrect: true },
          { key: 'C', text: 'Network buffer overrun', isCorrect: false },
          { key: 'D', text: 'CPU cache line miss', isCorrect: false },
        ],
      },
      {
        questionText: 'What is the purpose of a Translation Lookaside Buffer (TLB)?',
        explanation: 'TLB is a CPU cache that stores recent virtual-to-physical memory address mappings to avoid page table lookups.',
        difficulty: 'MEDIUM',
        topicSlug: 'virtual-memory',
        options: [
          { key: 'A', text: 'File system directory caching', isCorrect: false },
          { key: 'B', text: 'High-speed hardware cache to accelerate virtual-to-physical address translation', isCorrect: true },
          { key: 'C', text: 'Network socket frame buffer', isCorrect: false },
          { key: 'D', text: 'Graphics rendering pipeline buffer', isCorrect: false },
        ],
      },
    ],
  },

  // ── SQL Quizzes ──
  {
    subjectSlug: 'sql',
    title: 'SQL Fundamentals',
    slug: 'sql-fundamentals',
    description: 'Essential SQL queries, SELECT filtering, aggregation, GROUP BY, HAVING, ORDER BY, and set operations.',
    difficulty: 'EASY',
    durationMinutes: 12,
    displayOrder: 1,
    questions: [
      {
        questionText: 'Which SQL clause is used to filter records before any grouping takes place?',
        explanation: '`WHERE` filters individual rows before aggregation; `HAVING` filters aggregated groups after `GROUP BY`.',
        difficulty: 'EASY',
        topicSlug: 'where',
        options: [
          { key: 'A', text: 'HAVING', isCorrect: false },
          { key: 'B', text: 'WHERE', isCorrect: true },
          { key: 'C', text: 'GROUP BY', isCorrect: false },
          { key: 'D', text: 'ORDER BY', isCorrect: false },
        ],
      },
      {
        questionText: 'What is the result of `COUNT(*)` on a table containing 5 total rows, where 2 rows have NULL values?',
        explanation: '`COUNT(*)` counts total rows including rows with NULL values, returning 5.',
        difficulty: 'EASY',
        topicSlug: 'aggregate-functions',
        options: [
          { key: 'A', text: '3', isCorrect: false },
          { key: 'B', text: '5', isCorrect: true },
          { key: 'C', text: 'NULL', isCorrect: false },
          { key: 'D', text: '0', isCorrect: false },
        ],
      },
      {
        questionText: 'Which SQL statement removes all records from a table without logging individual row deletions?',
        explanation: '`TRUNCATE TABLE` is a DDL operation that quickly removes all rows by deallocating data pages.',
        difficulty: 'EASY',
        topicSlug: 'select',
        options: [
          { key: 'A', text: 'DELETE', isCorrect: false },
          { key: 'B', text: 'TRUNCATE', isCorrect: true },
          { key: 'C', text: 'DROP', isCorrect: false },
          { key: 'D', text: 'REMOVE', isCorrect: false },
        ],
      },
      {
        questionText: 'Which clause is specifically used to filter groups created by `GROUP BY`?',
        explanation: '`HAVING` filters summarized/aggregated group results after `GROUP BY` executes.',
        difficulty: 'EASY',
        topicSlug: 'having',
        options: [
          { key: 'A', text: 'WHERE', isCorrect: false },
          { key: 'B', text: 'HAVING', isCorrect: true },
          { key: 'C', text: 'FILTER', isCorrect: false },
          { key: 'D', text: 'ORDER BY', isCorrect: false },
        ],
      },
      {
        questionText: 'What is the default sorting direction of the `ORDER BY` clause in SQL?',
        explanation: '`ORDER BY column` sorts in Ascending (ASC) order by default if unspecified.',
        difficulty: 'EASY',
        topicSlug: 'order-by',
        options: [
          { key: 'A', text: 'DESC', isCorrect: false },
          { key: 'B', text: 'ASC', isCorrect: true },
          { key: 'C', text: 'RANDOM', isCorrect: false },
          { key: 'D', text: 'Insertion order', isCorrect: false },
        ],
      },
      {
        questionText: 'Which operator is used to search for a specified pattern in a column value?',
        explanation: 'The `LIKE` operator performs pattern matching using wildcard characters like `%` and `_`.',
        difficulty: 'EASY',
        topicSlug: 'where',
        options: [
          { key: 'A', text: 'IN', isCorrect: false },
          { key: 'B', text: 'LIKE', isCorrect: true },
          { key: 'C', text: 'BETWEEN', isCorrect: false },
          { key: 'D', text: 'EXISTS', isCorrect: false },
        ],
      },
      {
        questionText: 'Which SQL set operator returns distinct rows present in both result sets?',
        explanation: '`INTERSECT` evaluates set intersection, returning distinct rows common to both SELECT result sets.',
        difficulty: 'MEDIUM',
        topicSlug: 'select',
        options: [
          { key: 'A', text: 'UNION', isCorrect: false },
          { key: 'B', text: 'INTERSECT', isCorrect: true },
          { key: 'C', text: 'EXCEPT', isCorrect: false },
          { key: 'D', text: 'MINUS', isCorrect: false },
        ],
      },
      {
        questionText: 'What is the function of `COALESCE()` in SQL?',
        explanation: '`COALESCE(val1, val2, ...)` returns the first non-NULL value among its parameters.',
        difficulty: 'EASY',
        topicSlug: 'select',
        options: [
          { key: 'A', text: 'Concatenates multiple string columns', isCorrect: false },
          { key: 'B', text: 'Returns the first non-null expression in its argument list', isCorrect: true },
          { key: 'C', text: 'Computes average value across groups', isCorrect: false },
          { key: 'D', text: 'Rounds floating point numbers', isCorrect: false },
        ],
      },
      {
        questionText: 'Which keyword eliminates duplicate rows from a query result set?',
        explanation: '`SELECT DISTINCT` filters out duplicate rows from the final result set.',
        difficulty: 'EASY',
        topicSlug: 'select',
        options: [
          { key: 'A', text: 'UNIQUE', isCorrect: false },
          { key: 'B', text: 'DISTINCT', isCorrect: true },
          { key: 'C', text: 'GROUP BY', isCorrect: false },
          { key: 'D', text: 'SINGLE', isCorrect: false },
        ],
      },
      {
        questionText: 'What rows does a `FULL OUTER JOIN` return?',
        explanation: 'FULL OUTER JOIN returns all rows from both tables, matching where possible and appending NULLs otherwise.',
        difficulty: 'EASY',
        topicSlug: 'joins',
        options: [
          { key: 'A', text: 'Matching rows only', isCorrect: false },
          { key: 'B', text: 'All rows from both tables, filling NULLs for non-matching sides', isCorrect: true },
          { key: 'C', text: 'Left table rows only', isCorrect: false },
          { key: 'D', text: 'Right table rows only', isCorrect: false },
        ],
      },
    ],
  },
  {
    subjectSlug: 'sql',
    title: 'SQL Interview Practice',
    slug: 'sql-interview-practice',
    description: 'Advanced placement SQL: window functions (RANK, DENSE_RANK, LAG, LEAD), CTEs, correlated subqueries, and 2nd max salary.',
    difficulty: 'MEDIUM',
    durationMinutes: 15,
    displayOrder: 2,
    questions: [
      {
        questionText: 'What is the purpose of SQL Window Functions such as `ROW_NUMBER()`, `RANK()`, and `DENSE_RANK()`?',
        explanation: 'Window functions calculate values over a partition of rows while preserving individual row outputs.',
        difficulty: 'MEDIUM',
        topicSlug: 'window-functions',
        options: [
          { key: 'A', text: 'Altering database table storage format', isCorrect: false },
          { key: 'B', text: 'Performing calculations across a set of table rows related to the current row without collapsing rows', isCorrect: true },
          { key: 'C', text: 'Automatically deleting duplicated rows on insert', isCorrect: false },
          { key: 'D', text: 'Encrypting sensitive column values', isCorrect: false },
        ],
      },
      {
        questionText: 'What is the key difference between `RANK()` and `DENSE_RANK()` when ties occur?',
        explanation: 'For ties (e.g. 1st, 1st), RANK assigns next value as 3rd, while DENSE_RANK assigns next value as 2nd.',
        difficulty: 'MEDIUM',
        topicSlug: 'window-functions',
        options: [
          { key: 'A', text: 'RANK ignores duplicate values completely', isCorrect: false },
          { key: 'B', text: 'RANK skips numbers after ties, while DENSE_RANK assigns consecutive ranks without gaps', isCorrect: true },
          { key: 'C', text: 'DENSE_RANK cannot be used with ORDER BY', isCorrect: false },
          { key: 'D', text: 'They produce identical outputs', isCorrect: false },
        ],
      },
      {
        questionText: 'How is a Common Table Expression (CTE) defined in a SQL query?',
        explanation: 'CTEs are temporary named result sets defined using `WITH cte_name AS (...)`.',
        difficulty: 'EASY',
        topicSlug: 'ctes',
        options: [
          { key: 'A', text: 'CREATE VIEW cte_name AS', isCorrect: false },
          { key: 'B', text: 'WITH cte_name AS (...)', isCorrect: true },
          { key: 'C', text: 'SELECT INTO cte_name', isCorrect: false },
          { key: 'D', text: 'DECLARE TABLE cte_name', isCorrect: false },
        ],
      },
      {
        questionText: 'Which clause is required to define window partitioning and ordering for a window function?',
        explanation: 'The `OVER()` clause defines the window partitioning and ordering for window functions.',
        difficulty: 'EASY',
        topicSlug: 'window-functions',
        options: [
          { key: 'A', text: 'GROUP BY', isCorrect: false },
          { key: 'B', text: 'OVER()', isCorrect: true },
          { key: 'C', text: 'HAVING', isCorrect: false },
          { key: 'D', text: 'WHERE', isCorrect: false },
        ],
      },
      {
        questionText: 'How does `UNION ALL` differ from `UNION` in SQL?',
        explanation: '`UNION` performs distinct sorting to eliminate duplicates, whereas `UNION ALL` combines all rows directly.',
        difficulty: 'EASY',
        topicSlug: 'select',
        options: [
          { key: 'A', text: 'UNION ALL removes duplicates automatically', isCorrect: false },
          { key: 'B', text: 'UNION ALL retains duplicate rows and is faster because it skips deduplication', isCorrect: true },
          { key: 'C', text: 'UNION ALL works only on numeric data types', isCorrect: false },
          { key: 'D', text: 'UNION ALL sorts output automatically', isCorrect: false },
        ],
      },
      {
        questionText: 'What is a Correlated Subquery?',
        explanation: 'A correlated subquery depends on the current row of the outer query for its execution.',
        difficulty: 'MEDIUM',
        topicSlug: 'subqueries',
        options: [
          { key: 'A', text: 'A subquery that executes once before outer query starts', isCorrect: false },
          { key: 'B', text: 'A subquery that references outer query columns and evaluates once per outer row', isCorrect: true },
          { key: 'C', text: 'A subquery with no WHERE clause', isCorrect: false },
          { key: 'D', text: 'A subquery that creates a temporary table', isCorrect: false },
        ],
      },
      {
        questionText: 'Which window function allows accessing values from a preceding row in the result set?',
        explanation: '`LAG(col, offset)` allows querying data from a preceding row without a self-join.',
        difficulty: 'MEDIUM',
        topicSlug: 'window-functions',
        options: [
          { key: 'A', text: 'LEAD()', isCorrect: false },
          { key: 'B', text: 'LAG()', isCorrect: true },
          { key: 'C', text: 'FIRST_VALUE()', isCorrect: false },
          { key: 'D', text: 'NTILE()', isCorrect: false },
        ],
      },
      {
        questionText: 'What does the `EXISTS` operator test for in SQL?',
        explanation: '`EXISTS (subquery)` evaluates to TRUE if the subquery returns at least one row.',
        difficulty: 'EASY',
        topicSlug: 'subqueries',
        options: [
          { key: 'A', text: 'NULL values in a column', isCorrect: false },
          { key: 'B', text: 'Existence of any matching records returned by a subquery', isCorrect: true },
          { key: 'C', text: 'Exact regex string match', isCorrect: false },
          { key: 'D', text: 'Column data type match', isCorrect: false },
        ],
      },
      {
        questionText: 'Which query correctly finds the 2nd highest salary from an `Employee` table without using non-standard vendor syntax?',
        explanation: 'Filtering for the maximum salary strictly less than the top maximum yields the second highest salary reliably.',
        difficulty: 'MEDIUM',
        topicSlug: 'subqueries',
        options: [
          { key: 'A', text: 'SELECT MAX(salary) FROM Employee WHERE salary < (SELECT MAX(salary) FROM Employee)', isCorrect: true },
          { key: 'B', text: 'SELECT MIN(salary) FROM Employee', isCorrect: false },
          { key: 'C', text: 'SELECT TOP 2 salary FROM Employee', isCorrect: false },
          { key: 'D', text: 'SELECT salary FROM Employee WHERE rownum = 2', isCorrect: false },
        ],
      },
      {
        questionText: 'What is a Covering Index in database query optimization?',
        explanation: 'A Covering Index contains all columns requested by a query, satisfying it entirely from the index leaf nodes.',
        difficulty: 'HARD',
        topicSlug: 'query-optimization',
        options: [
          { key: 'A', text: 'Primary key index on table', isCorrect: false },
          { key: 'B', text: 'An index that contains all columns requested by a query, avoiding main table access', isCorrect: true },
          { key: 'C', text: 'An index built on 100% of rows', isCorrect: false },
          { key: 'D', text: 'A clustered index with foreign keys', isCorrect: false },
        ],
      },
    ],
  },
]

function slugify(text) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

async function seed() {
  console.log('🌱 Starting database seed...')
  let totalSubjects = 0
  let totalTopics = 0
  let totalQuizzes = 0
  let totalQuestions = 0
  let totalOptions = 0

  // 1. Seed Subjects & Topics
  const existingSubjectCount = await db.subject.count()
  if (existingSubjectCount >= SUBJECT_SEED_DATA.length) {
    console.log(`ℹ️ Subjects & topics already seeded (${existingSubjectCount} subjects), skipping re-creation.`)
    const subjects = await db.subject.findMany({ include: { topics: true } })
    totalSubjects = subjects.length
    totalTopics = subjects.reduce((acc, s) => acc + s.topics.length, 0)
  } else {
    for (const item of SUBJECT_SEED_DATA) {
      console.log(`  Seeding subject: ${item.shortTitle}...`)
      const subject = await db.subject.upsert({
        where: { slug: item.slug },
        update: {
          name: item.name,
          shortTitle: item.shortTitle,
          description: item.description,
          category: item.category,
          displayOrder: item.displayOrder,
        },
        create: {
          name: item.name,
          shortTitle: item.shortTitle,
          slug: item.slug,
          description: item.description,
          category: item.category,
          displayOrder: item.displayOrder,
        },
      })
      totalSubjects++

      for (let i = 0; i < item.topics.length; i++) {
        const topicName = item.topics[i]
        const topicSlug = slugify(topicName)

        await db.topic.upsert({
          where: {
            subjectId_slug: {
              subjectId: subject.id,
              slug: topicSlug,
            },
          },
          update: {
            name: topicName,
            displayOrder: i + 1,
          },
          create: {
            subjectId: subject.id,
            name: topicName,
            slug: topicSlug,
            displayOrder: i + 1,
          },
        })
        totalTopics++
      }
    }
  }

  // Pre-fetch subjects and topics for instant in-memory lookup
  const allSubjects = await db.subject.findMany({
    include: { topics: true },
  })
  const subjectMap = new Map(allSubjects.map((s) => [s.slug, s]))

  // 2. Seed Quizzes, Questions, and Options inside fast transactions
  for (const qItem of QUIZ_SEED_DATA) {
    console.log(`  Seeding quiz: ${qItem.title}...`)
    const subject = subjectMap.get(qItem.subjectSlug)

    if (!subject) {
      console.warn(`Subject with slug "${qItem.subjectSlug}" not found, skipping quiz "${qItem.slug}"`)
      continue
    }

    const topicMap = new Map(subject.topics.map((t) => [t.slug, t.id]))

    const quiz = await db.quiz.upsert({
      where: { slug: qItem.slug },
      update: {
        title: qItem.title,
        description: qItem.description,
        subjectId: subject.id,
        difficulty: qItem.difficulty,
        questionCount: qItem.questions.length,
        durationMinutes: qItem.durationMinutes,
        isPublished: true,
        displayOrder: qItem.displayOrder,
      },
      create: {
        title: qItem.title,
        slug: qItem.slug,
        description: qItem.description,
        subjectId: subject.id,
        difficulty: qItem.difficulty,
        questionCount: qItem.questions.length,
        durationMinutes: qItem.durationMinutes,
        isPublished: true,
        displayOrder: qItem.displayOrder,
      },
    })
    totalQuizzes++

    // Clear existing questions for idempotent re-runs
    await db.question.deleteMany({
      where: { quizId: quiz.id },
    })

    for (let qIdx = 0; qIdx < qItem.questions.length; qIdx++) {
      const qData = qItem.questions[qIdx]
      const topicId = qData.topicSlug ? topicMap.get(qData.topicSlug) || null : null

      await db.question.create({
        data: {
          quizId: quiz.id,
          topicId,
          questionText: qData.questionText,
          explanation: qData.explanation,
          difficulty: qData.difficulty,
          displayOrder: qIdx + 1,
          options: {
            create: qData.options.map((oData, oIdx) => ({
              optionKey: oData.key,
              optionText: oData.text,
              isCorrect: oData.isCorrect,
              displayOrder: oIdx + 1,
            })),
          },
        },
      })
      totalQuestions++
      totalOptions += qData.options.length
    }
  }

  // ─── 3. CODING PROBLEMS SEED DATA ─────────────────────────────────────────

  const CODING_PROBLEM_SEED_DATA = [
    {
      title: 'Two Sum',
      slug: 'two-sum',
      description: 'Given an array of integers `nums` and an integer `target`, return indices of the two numbers such that they add up to `target`. You may assume that each input would have exactly one solution, and you may not use the same element twice.',
      difficulty: 'EASY',
      subjectSlug: 'dsa',
      topicSlug: 'arrays',
      constraints: '2 <= nums.length <= 10^4\n-10^9 <= nums[i] <= 10^9\n-10^9 <= target <= 10^9\nOnly one valid answer exists.',
      inputFormat: 'Line 1: Array of integers nums\nLine 2: Integer target',
      outputFormat: 'Array of two integers representing indices [index1, index2]',
      examples: [
        { input: 'nums = [2, 7, 11, 15], target = 9', output: '[0, 1]', explanation: 'Because nums[0] + nums[1] == 9, we return [0, 1].' },
        { input: 'nums = [3, 2, 4], target = 6', output: '[1, 2]', explanation: 'Because nums[1] + nums[2] == 6, we return [1, 2].' }
      ],
      starterCode: {
        javascript: 'function twoSum(nums, target) {\n  const map = new Map();\n  for (let i = 0; i < nums.length; i++) {\n    const diff = target - nums[i];\n    if (map.has(diff)) return [map.get(diff), i];\n    map.set(nums[i], i);\n  }\n  return [];\n}',
        python: 'def twoSum(nums: list[int], target: int) -> list[int]:\n    seen = {}\n    for i, num in enumerate(nums):\n        diff = target - num\n        if diff in seen:\n            return [seen[diff], i]\n        seen[num] = i\n    return []',
        java: 'class Solution {\n    public int[] twoSum(int[] nums, int target) {\n        Map<Integer, Integer> map = new HashMap<>();\n        for (int i = 0; i < nums.length; i++) {\n            int diff = target - nums[i];\n            if (map.containsKey(diff)) {\n                return new int[] { map.get(diff), i };\n            }\n            map.put(nums[i], i);\n        }\n        return new int[]{};\n    }\n}',
        cpp: 'class Solution {\npublic:\n    vector<int> twoSum(vector<int>& nums, int target) {\n        unordered_map<int, int> mp;\n        for (int i = 0; i < nums.size(); i++) {\n            int diff = target - nums[i];\n            if (mp.count(diff)) return {mp[diff], i};\n            mp[nums[i]] = i;\n        }\n        return {};\n    }\n};'
      },
      tags: ['Array', 'Hash Table', 'Two Pointers'],
      displayOrder: 1,
    },
    {
      title: 'Valid Parentheses',
      slug: 'valid-parentheses',
      description: 'Given a string `s` containing just the characters `(`, `)`, `{`, `}`, `[` and `]`, determine if the input string is valid.\nAn input string is valid if open brackets are closed by the same type of brackets and in the correct order.',
      difficulty: 'EASY',
      subjectSlug: 'dsa',
      topicSlug: 'stacks',
      constraints: '1 <= s.length <= 10^4\ns consists of parentheses only \'()[]{}\'.',
      inputFormat: 'String s containing bracket characters.',
      outputFormat: 'Boolean true if valid, false otherwise.',
      examples: [
        { input: 's = "()[]{}"', output: 'true', explanation: 'All open brackets are closed by matching closing brackets.' },
        { input: 's = "(]"', output: 'false', explanation: 'Open bracket "(" is closed by mismatched bracket "]".' }
      ],
      starterCode: {
        javascript: 'function isValid(s) {\n  const stack = [];\n  const pairs = { ")": "(", "}": "{", "]": "[" };\n  for (const char of s) {\n    if (pairs[char]) {\n      if (stack.pop() !== pairs[char]) return false;\n    } else {\n      stack.push(char);\n    }\n  }\n  return stack.length === 0;\n}',
        python: 'def isValid(s: str) -> bool:\n    stack = []\n    mapping = {")": "(", "}": "{", "]": "["}\n    for char in s:\n        if char in mapping:\n            top = stack.pop() if stack else "#"\n            if mapping[char] != top:\n                return False\n        else:\n            stack.append(char)\n    return not stack',
        java: 'class Solution {\n    public boolean isValid(String s) {\n        Stack<Character> stack = new Stack<>();\n        for (char c : s.toCharArray()) {\n            if (c == \'(\') stack.push(\')\');\n            else if (c == \'{\') stack.push(\'}\');\n            else if (c == \'[\') stack.push(\']\');\n            else if (stack.isEmpty() || stack.pop() != c) return false;\n        }\n        return stack.isEmpty();\n    }\n}',
        cpp: 'class Solution {\npublic:\n    bool isValid(string s) {\n        stack<char> st;\n        for (char c : s) {\n            if (c == \'(\' || c == \'{\' || c == \'[\') st.push(c);\n            else {\n                if (st.empty()) return false;\n                char top = st.top(); st.pop();\n                if ((c == \')\' && top != \'(\') || (c == \'}\' && top != \'{\') || (c == \']\' && top != \'[\')) return false;\n            }\n        }\n        return st.empty();\n    }\n};'
      },
      tags: ['String', 'Stack'],
      displayOrder: 2,
    },
    {
      title: 'Reverse Linked List',
      slug: 'reverse-linked-list',
      description: 'Given the head of a singly linked list, reverse the list, and return the reversed list head.',
      difficulty: 'EASY',
      subjectSlug: 'dsa',
      topicSlug: 'linked-lists',
      constraints: 'The number of nodes in the list is in the range [0, 5000].\n-5000 <= Node.val <= 5000',
      inputFormat: 'Head of a singly linked list.',
      outputFormat: 'Head of the reversed singly linked list.',
      examples: [
        { input: 'head = [1,2,3,4,5]', output: '[5,4,3,2,1]', explanation: 'Linked list links are reversed.' },
        { input: 'head = [1,2]', output: '[2,1]', explanation: 'Node 2 points to Node 1.' }
      ],
      starterCode: {
        javascript: 'function reverseList(head) {\n  let prev = null, curr = head;\n  while (curr) {\n    let nextTemp = curr.next;\n    curr.next = prev;\n    prev = curr;\n    curr = nextTemp;\n  }\n  return prev;\n}',
        python: 'def reverseList(head):\n    prev, curr = None, head\n    while curr:\n        nxt = curr.next\n        curr.next = prev\n        prev = curr\n        curr = nxt\n    return prev',
        java: 'class Solution {\n    public ListNode reverseList(ListNode head) {\n        ListNode prev = null, curr = head;\n        while (curr != null) {\n            ListNode nextTemp = curr.next;\n            curr.next = prev;\n            prev = curr;\n            curr = nextTemp;\n        }\n        return prev;\n    }\n}',
        cpp: 'class Solution {\npublic:\n    ListNode* reverseList(ListNode* head) {\n        ListNode *prev = nullptr, *curr = head;\n        while (curr) {\n            ListNode *nextTemp = curr->next;\n            curr->next = prev;\n            prev = curr;\n            curr = nextTemp;\n        }\n        return prev;\n    }\n};'
      },
      tags: ['Linked List', 'Recursion'],
      displayOrder: 3,
    },
    {
      title: 'Binary Search',
      slug: 'binary-search',
      description: 'Given an array of integers `nums` which is sorted in ascending order, and an integer `target`, write a function to search `target` in `nums`. If target exists, return its index; otherwise return -1.',
      difficulty: 'EASY',
      subjectSlug: 'dsa',
      topicSlug: 'searching',
      constraints: '1 <= nums.length <= 10^4\nAll integers in nums are unique and sorted in ascending order.',
      inputFormat: 'Sorted array nums and target value.',
      outputFormat: 'Integer index of target or -1.',
      examples: [
        { input: 'nums = [-1,0,3,5,9,12], target = 9', output: '4', explanation: '9 exists in nums and its index is 4.' },
        { input: 'nums = [-1,0,3,5,9,12], target = 2', output: '-1', explanation: '2 does not exist in nums so return -1.' }
      ],
      starterCode: {
        javascript: 'function search(nums, target) {\n  let left = 0, right = nums.length - 1;\n  while (left <= right) {\n    const mid = Math.floor((left + right) / 2);\n    if (nums[mid] === target) return mid;\n    if (nums[mid] < target) left = mid + 1;\n    else right = mid - 1;\n  }\n  return -1;\n}',
        python: 'def search(nums: list[int], target: int) -> int:\n    left, right = 0, len(nums) - 1\n    while left <= right:\n        mid = (left + right) // 2\n        if nums[mid] == target:\n            return mid\n        elif nums[mid] < target:\n            left = mid + 1\n        else:\n            right = mid - 1\n    return -1',
        java: 'class Solution {\n    public int search(int[] nums, int target) {\n        int left = 0, right = nums.length - 1;\n        while (left <= right) {\n            int mid = left + (right - left) / 2;\n            if (nums[mid] == target) return mid;\n            if (nums[mid] < target) left = mid + 1;\n            else right = mid - 1;\n        }\n        return -1;\n    }\n}',
        cpp: 'class Solution {\npublic:\n    int search(vector<int>& nums, int target) {\n        int left = 0, right = nums.size() - 1;\n        while (left <= right) {\n            int mid = left + (right - left) / 2;\n            if (nums[mid] == target) return mid;\n            if (nums[mid] < target) left = mid + 1;\n            else right = mid - 1;\n        }\n        return -1;\n    }\n};'
      },
      tags: ['Array', 'Binary Search'],
      displayOrder: 4,
    },
    {
      title: 'Valid Anagram',
      slug: 'valid-anagram',
      description: 'Given two strings `s` and `t`, return `true` if `t` is an anagram of `s`, and `false` otherwise. An Anagram is a word formed by rearranging the letters of a different word using all the original letters exactly once.',
      difficulty: 'EASY',
      subjectSlug: 'dsa',
      topicSlug: 'strings',
      constraints: '1 <= s.length, t.length <= 5 * 10^4\ns and t consist of lowercase English letters.',
      inputFormat: 'Two strings s and t.',
      outputFormat: 'Boolean true if t is an anagram of s, false otherwise.',
      examples: [
        { input: 's = "anagram", t = "nagaram"', output: 'true', explanation: 'Both strings have identical character frequencies.' },
        { input: 's = "rat", t = "car"', output: 'false', explanation: 'Character frequencies do not match.' }
      ],
      starterCode: {
        javascript: 'function isAnagram(s, t) {\n  if (s.length !== t.length) return false;\n  const count = {};\n  for (let c of s) count[c] = (count[c] || 0) + 1;\n  for (let c of t) {\n    if (!count[c]) return false;\n    count[c]--;\n  }\n  return true;\n}',
        python: 'def isAnagram(s: str, t: str) -> bool:\n    if len(s) != len(t):\n        return False\n    return sorted(s) == sorted(t)',
        java: 'class Solution {\n    public boolean isAnagram(String s, String t) {\n        if (s.length() != t.length()) return false;\n        int[] counts = new int[26];\n        for (int i = 0; i < s.length(); i++) {\n            counts[s.charAt(i) - \'a\']++;\n            counts[t.charAt(i) - \'a\']--;\n        }\n        for (int c : counts) if (c != 0) return false;\n        return true;\n    }\n}',
        cpp: 'class Solution {\npublic:\n    bool isAnagram(string s, string t) {\n        if (s.length() != t.length()) return false;\n        vector<int> freq(26, 0);\n        for (int i = 0; i < s.length(); i++) {\n            freq[s[i] - \'a\']++;\n            freq[t[i] - \'a\']--;\n        }\n        for (int count : freq) if (count != 0) return false;\n        return true;\n    }\n};'
      },
      tags: ['Hash Table', 'String', 'Sorting'],
      displayOrder: 5,
    },
    {
      title: 'Container With Most Water',
      slug: 'container-with-most-water',
      description: 'You are given an integer array `height` of length `n`. There are `n` vertical lines drawn such that the two endpoints of the `i`-th line are `(i, 0)` and `(i, height[i])`. Find two lines that together with the x-axis form a container, such that the container contains the most water.',
      difficulty: 'MEDIUM',
      subjectSlug: 'dsa',
      topicSlug: 'arrays',
      constraints: 'n == height.length\n2 <= n <= 10^5\n0 <= height[i] <= 10^4',
      inputFormat: 'Array of line heights height.',
      outputFormat: 'Integer representing maximum water volume area.',
      examples: [
        { input: 'height = [1,8,6,2,5,4,8,3,7]', output: '49', explanation: 'The vertical lines at indices 1 and 8 yield area = min(8, 7) * (8 - 1) = 49.' },
        { input: 'height = [1,1]', output: '1', explanation: 'Area = min(1, 1) * (1 - 0) = 1.' }
      ],
      starterCode: {
        javascript: 'function maxArea(height) {\n  let maxWater = 0, left = 0, right = height.length - 1;\n  while (left < right) {\n    const w = right - left;\n    const h = Math.min(height[left], height[right]);\n    maxWater = Math.max(maxWater, w * h);\n    if (height[left] < height[right]) left++;\n    else right--;\n  }\n  return maxWater;\n}',
        python: 'def maxArea(height: list[int]) -> int:\n    left, right = 0, len(height) - 1\n    max_water = 0\n    while left < right:\n        w = right - left\n        h = min(height[left], height[right])\n        max_water = max(max_water, w * h)\n        if height[left] < height[right]:\n            left += 1\n        else:\n            right -= 1\n    return max_water',
        java: 'class Solution {\n    public int maxArea(int[] height) {\n        int maxWater = 0, left = 0, right = height.length - 1;\n        while (left < right) {\n            int width = right - left;\n            int minH = Math.min(height[left], height[right]);\n            maxWater = Math.max(maxWater, width * minH);\n            if (height[left] < height[right]) left++;\n            else right--;\n        }\n        return maxWater;\n    }\n}',
        cpp: 'class Solution {\npublic:\n    int maxArea(vector<int>& height) {\n        int maxWater = 0, left = 0, right = height.size() - 1;\n        while (left < right) {\n            int w = right - left;\n            int h = min(height[left], height[right]);\n            maxWater = max(maxWater, w * h);\n            if (height[left] < height[right]) left++;\n            else right--;\n        }\n        return maxWater;\n    }\n};'
      },
      tags: ['Array', 'Two Pointers', 'Greedy'],
      displayOrder: 6,
    },
    {
      title: 'Merge Two Sorted Lists',
      slug: 'merge-two-sorted-lists',
      description: 'You are given the heads of two sorted linked lists `list1` and `list2`. Merge the two lists into one sorted list. The list should be made by splicing together the nodes of the first two lists. Return the head of the merged linked list.',
      difficulty: 'EASY',
      subjectSlug: 'dsa',
      topicSlug: 'linked-lists',
      constraints: 'The number of nodes in both lists is in range [0, 50].\n-100 <= Node.val <= 100\nBoth lists are sorted in non-decreasing order.',
      inputFormat: 'Heads of two sorted linked lists list1 and list2.',
      outputFormat: 'Head of merged sorted linked list.',
      examples: [
        { input: 'list1 = [1,2,4], list2 = [1,3,4]', output: '[1,1,2,3,4,4]', explanation: 'Merged list contains elements from both in sorted order.' }
      ],
      starterCode: {
        javascript: 'function mergeTwoLists(list1, list2) {\n  const dummy = { val: 0, next: null };\n  let curr = dummy;\n  while (list1 && list2) {\n    if (list1.val <= list2.val) {\n      curr.next = list1;\n      list1 = list1.next;\n    } else {\n      curr.next = list2;\n      list2 = list2.next;\n    }\n    curr = curr.next;\n  }\n  curr.next = list1 || list2;\n  return dummy.next;\n}',
        python: 'def mergeTwoLists(list1, list2):\n    dummy = ListNode(0)\n    curr = dummy\n    while list1 and list2:\n        if list1.val <= list2.val:\n            curr.next = list1\n            list1 = list1.next\n        else:\n            curr.next = list2\n            list2 = list2.next\n        curr = curr.next\n    curr.next = list1 or list2\n    return dummy.next',
        java: 'class Solution {\n    public ListNode mergeTwoLists(ListNode list1, ListNode list2) {\n        ListNode dummy = new ListNode(0);\n        ListNode curr = dummy;\n        while (list1 != null && list2 != null) {\n            if (list1.val <= list2.val) {\n                curr.next = list1;\n                list1 = list1.next;\n            } else {\n                curr.next = list2;\n                list2 = list2.next;\n            }\n            curr = curr.next;\n        }\n        curr.next = (list1 != null) ? list1 : list2;\n        return dummy.next;\n    }\n}',
        cpp: 'class Solution {\npublic:\n    ListNode* mergeTwoLists(ListNode* list1, ListNode* list2) {\n        ListNode dummy(0);\n        ListNode* curr = &dummy;\n        while (list1 && list2) {\n            if (list1->val <= list2->val) {\n                curr->next = list1;\n                list1 = list1->next;\n            } else {\n                curr->next = list2;\n                list2 = list2->next;\n            }\n            curr = curr->next;\n        }\n        curr->next = list1 ? list1 : list2;\n        return dummy.next;\n    }\n};'
      },
      tags: ['Linked List', 'Recursion'],
      displayOrder: 7,
    },
    {
      title: 'Maximum Subarray',
      slug: 'maximum-subarray',
      description: 'Given an integer array `nums`, find the subarray with the largest sum, and return its sum (Kadane\'s Algorithm).',
      difficulty: 'MEDIUM',
      subjectSlug: 'dsa',
      topicSlug: 'dynamic-programming',
      constraints: '1 <= nums.length <= 10^5\n-10^4 <= nums[i] <= 10^4',
      inputFormat: 'Array of integers nums.',
      outputFormat: 'Integer representing maximum contiguous subarray sum.',
      examples: [
        { input: 'nums = [-2,1,-3,4,-1,2,1,-5,4]', output: '6', explanation: 'The contiguous subarray [4,-1,2,1] has the largest sum = 6.' },
        { input: 'nums = [1]', output: '1', explanation: 'Subarray [1] has max sum = 1.' }
      ],
      starterCode: {
        javascript: 'function maxSubArray(nums) {\n  let maxSoFar = nums[0], currMax = nums[0];\n  for (let i = 1; i < nums.length; i++) {\n    currMax = Math.max(nums[i], currMax + nums[i]);\n    maxSoFar = Math.max(maxSoFar, currMax);\n  }\n  return maxSoFar;\n}',
        python: 'def maxSubArray(nums: list[int]) -> int:\n    max_so_far = curr_max = nums[0]\n    for num in nums[1:]:\n        curr_max = max(num, curr_max + num)\n        max_so_far = max(max_so_far, curr_max)\n    return max_so_far',
        java: 'class Solution {\n    public int maxSubArray(int[] nums) {\n        int maxSoFar = nums[0], currMax = nums[0];\n        for (int i = 1; i < nums.length; i++) {\n            currMax = Math.max(nums[i], currMax + nums[i]);\n            maxSoFar = Math.max(maxSoFar, currMax);\n        }\n        return maxSoFar;\n    }\n}',
        cpp: 'class Solution {\npublic:\n    int maxSubArray(vector<int>& nums) {\n        int maxSoFar = nums[0], currMax = nums[0];\n        for (size_t i = 1; i < nums.size(); i++) {\n            currMax = max(nums[i], currMax + nums[i]);\n            maxSoFar = max(maxSoFar, currMax);\n        }\n        return maxSoFar;\n    }\n};'
      },
      tags: ['Array', 'Divide and Conquer', 'Dynamic Programming'],
      displayOrder: 8,
    },
    {
      title: 'Invert Binary Tree',
      slug: 'invert-binary-tree',
      description: 'Given the root of a binary tree, invert the tree (swap left and right subtrees recursively), and return its root.',
      difficulty: 'EASY',
      subjectSlug: 'dsa',
      topicSlug: 'trees',
      constraints: 'The number of nodes in the tree is in range [0, 100].\n-100 <= Node.val <= 100',
      inputFormat: 'Root of binary tree.',
      outputFormat: 'Root of inverted binary tree.',
      examples: [
        { input: 'root = [4,2,7,1,3,6,9]', output: '[4,7,2,9,6,3,1]', explanation: 'Left and right children at each level are swapped.' }
      ],
      starterCode: {
        javascript: 'function invertTree(root) {\n  if (!root) return null;\n  const temp = root.left;\n  root.left = invertTree(root.right);\n  root.right = invertTree(temp);\n  return root;\n}',
        python: 'def invertTree(root):\n    if not root:\n        return None\n    root.left, root.right = invertTree(root.right), invertTree(root.left)\n    return root',
        java: 'class Solution {\n    public TreeNode invertTree(TreeNode root) {\n        if (root == null) return null;\n        TreeNode temp = root.left;\n        root.left = invertTree(root.right);\n        root.right = invertTree(temp);\n        return root;\n    }\n}',
        cpp: 'class Solution {\npublic:\n    TreeNode* invertTree(TreeNode* root) {\n        if (!root) return nullptr;\n        TreeNode* temp = root->left;\n        root->left = invertTree(root->right);\n        root->right = invertTree(temp);\n        return root;\n    }\n};'
      },
      tags: ['Tree', 'Depth-First Search', 'Breadth-First Search', 'Binary Tree'],
      displayOrder: 9,
    },
    {
      title: 'Valid Palindrome',
      slug: 'valid-palindrome',
      description: 'A phrase is a palindrome if, after converting all uppercase letters into lowercase letters and removing all non-alphanumeric characters, it reads the same forward and backward.',
      difficulty: 'EASY',
      subjectSlug: 'dsa',
      topicSlug: 'strings',
      constraints: '1 <= s.length <= 2 * 10^5\ns consists only of printable ASCII characters.',
      inputFormat: 'String s.',
      outputFormat: 'Boolean true if s is a valid palindrome, false otherwise.',
      examples: [
        { input: 's = "A man, a plan, a canal: Panama"', output: 'true', explanation: '"amanaplanacanalpanama" is a palindrome.' },
        { input: 's = "race a car"', output: 'false', explanation: '"raceacar" is not a palindrome.' }
      ],
      starterCode: {
        javascript: 'function isPalindrome(s) {\n  const clean = s.toLowerCase().replace(/[^a-z0-9]/g, "");\n  let left = 0, right = clean.length - 1;\n  while (left < right) {\n    if (clean[left] !== clean[right]) return false;\n    left++; right--;\n  }\n  return true;\n}',
        python: 'def isPalindrome(s: str) -> bool:\n    clean = [c.lower() for c in s if c.isalnum()]\n    return clean == clean[::-1]',
        java: 'class Solution {\n    public boolean isPalindrome(String s) {\n        String clean = s.replaceAll("[^a-zA-Z0-9]", "").toLowerCase();\n        int left = 0, right = clean.length() - 1;\n        while (left < right) {\n            if (clean.charAt(left) != clean.charAt(right)) return false;\n            left++; right--;\n        }\n        return true;\n    }\n}',
        cpp: 'class Solution {\npublic:\n    bool isPalindrome(string s) {\n        string clean = "";\n        for (char c : s) if (isalnum(c)) clean += tolower(c);\n        int left = 0, right = clean.length() - 1;\n        while (left < right) {\n            if (clean[left] != clean[right]) return false;\n            left++; right--;\n        }\n        return true;\n    }\n};'
      },
      tags: ['Two Pointers', 'String'],
      displayOrder: 10,
    },
    {
      title: 'Min Stack Design',
      slug: 'min-stack',
      description: 'Design a stack that supports push, pop, top, and retrieving the minimum element in O(1) constant time.',
      difficulty: 'MEDIUM',
      subjectSlug: 'dsa',
      topicSlug: 'stacks',
      constraints: '-2^31 <= val <= 2^31 - 1\nAt most 3 * 10^4 calls will be made to push, pop, top, and getMin.',
      inputFormat: 'Method calls on MinStack object instance.',
      outputFormat: 'Returned values for top() and getMin().',
      examples: [
        { input: '["MinStack","push","push","push","getMin","pop","top","getMin"]\n[[],[-2],[0],[-3],[],[],[],[]]', output: '[null,null,null,null,-3,null,0,-2]', explanation: 'MinStack tracks current min via auxiliary stack.' }
      ],
      starterCode: {
        javascript: 'class MinStack {\n  constructor() {\n    this.stack = [];\n    this.minStack = [];\n  }\n  push(val) {\n    this.stack.push(val);\n    const currentMin = this.minStack.length ? Math.min(val, this.minStack[this.minStack.length - 1]) : val;\n    this.minStack.push(currentMin);\n  }\n  pop() {\n    this.stack.pop();\n    this.minStack.pop();\n  }\n  top() {\n    return this.stack[this.stack.length - 1];\n  }\n  getMin() {\n    return this.minStack[this.minStack.length - 1];\n  }\n}',
        python: 'class MinStack:\n    def __init__(self):\n        self.stack = []\n        self.min_stack = []\n    def push(self, val: int) -> None:\n        self.stack.append(val)\n        val = min(val, self.min_stack[-1] if self.min_stack else val)\n        self.min_stack.append(val)\n    def pop(self) -> None:\n        self.stack.pop()\n        self.min_stack.pop()\n    def top(self) -> int:\n        return self.stack[-1]\n    def getMin(self) -> int:\n        return self.min_stack[-1]',
        java: 'class MinStack {\n    private Stack<Integer> stack = new Stack<>();\n    private Stack<Integer> minStack = new Stack<>();\n    public void push(int val) {\n        stack.push(val);\n        int currentMin = minStack.isEmpty() ? val : Math.min(val, minStack.peek());\n        minStack.push(currentMin);\n    }\n    public void pop() {\n        stack.pop();\n        minStack.pop();\n    }\n    public int top() { return stack.peek(); }\n    public int getMin() { return minStack.peek(); }\n}',
        cpp: 'class MinStack {\n    stack<int> st, minSt;\npublic:\n    void push(int val) {\n        st.push(val);\n        int curMin = minSt.empty() ? val : min(val, minSt.top());\n        minSt.push(curMin);\n    }\n    void pop() {\n        st.pop(); minSt.pop();\n    }\n    int top() { return st.top(); }\n    int getMin() { return minSt.top(); }\n};'
      },
      tags: ['Stack', 'Design'],
      displayOrder: 11,
    },
    {
      title: 'Best Time to Buy and Sell Stock',
      slug: 'best-time-to-buy-and-sell-stock',
      description: 'You are given an array `prices` where `prices[i]` is the price of a given stock on the `i`-th day. You want to maximize your profit by choosing a single day to buy one stock and choosing a different day in the future to sell that stock. Return the maximum profit you can achieve.',
      difficulty: 'EASY',
      subjectSlug: 'dsa',
      topicSlug: 'arrays',
      constraints: '1 <= prices.length <= 10^5\n0 <= prices[i] <= 10^4',
      inputFormat: 'Array of stock prices.',
      outputFormat: 'Integer representing maximum possible profit.',
      examples: [
        { input: 'prices = [7,1,5,3,6,4]', output: '5', explanation: 'Buy on day 2 (price = 1) and sell on day 5 (price = 6), profit = 6 - 1 = 5.' },
        { input: 'prices = [7,6,4,3,1]', output: '0', explanation: 'In this case, no transactions are done and max profit = 0.' }
      ],
      starterCode: {
        javascript: 'function maxProfit(prices) {\n  let minPrice = Infinity, maxProfit = 0;\n  for (let price of prices) {\n    if (price < minPrice) minPrice = price;\n    else if (price - minPrice > maxProfit) maxProfit = price - minPrice;\n  }\n  return maxProfit;\n}',
        python: 'def maxProfit(prices: list[int]) -> int:\n    min_price, max_profit = float("inf"), 0\n    for price in prices:\n        if price < min_price:\n            min_price = price\n        elif price - min_price > max_profit:\n            max_profit = price - min_price\n    return max_profit',
        java: 'class Solution {\n    public int maxProfit(int[] prices) {\n        int minPrice = Integer.MAX_VALUE, maxProfit = 0;\n        for (int price : prices) {\n            if (price < minPrice) minPrice = price;\n            else if (price - minPrice > maxProfit) maxProfit = price - minPrice;\n        }\n        return maxProfit;\n    }\n}',
        cpp: 'class Solution {\npublic:\n    int maxProfit(vector<int>& prices) {\n        int minPrice = INT_MAX, maxProfit = 0;\n        for (int price : prices) {\n            if (price < minPrice) minPrice = price;\n            else if (price - minPrice > maxProfit) maxProfit = price - minPrice;\n        }\n        return maxProfit;\n    }\n};'
      },
      tags: ['Array', 'Dynamic Programming'],
      displayOrder: 12,
    },
    {
      title: 'Climbing Stairs',
      slug: 'climbing-stairs',
      description: 'You are climbing a staircase. It takes `n` steps to reach the top. Each time you can either climb 1 or 2 steps. In how many distinct ways can you climb to the top?',
      difficulty: 'EASY',
      subjectSlug: 'dsa',
      topicSlug: 'recursion',
      constraints: '1 <= n <= 45',
      inputFormat: 'Integer n steps.',
      outputFormat: 'Integer representing number of distinct ways.',
      examples: [
        { input: 'n = 2', output: '2', explanation: '1. 1 step + 1 step\n2. 2 steps' },
        { input: 'n = 3', output: '3', explanation: '1. 1 step + 1 step + 1 step\n2. 1 step + 2 steps\n3. 2 steps + 1 step' }
      ],
      starterCode: {
        javascript: 'function climbStairs(n) {\n  if (n <= 2) return n;\n  let first = 1, second = 2;\n  for (let i = 3; i <= n; i++) {\n    const third = first + second;\n    first = second;\n    second = third;\n  }\n  return second;\n}',
        python: 'def climbStairs(n: int) -> int:\n    if n <= 2:\n        return n\n    first, second = 1, 2\n    for _ in range(3, n + 1):\n        first, second = second, first + second\n    return second',
        java: 'class Solution {\n    public int climbStairs(int n) {\n        if (n <= 2) return n;\n        int first = 1, second = 2;\n        for (int i = 3; i <= n; i++) {\n            int third = first + second;\n            first = second;\n            second = third;\n        }\n        return second;\n    }\n}',
        cpp: 'class Solution {\npublic:\n    int climbStairs(int n) {\n        if (n <= 2) return n;\n        int first = 1, second = 2;\n        for (int i = 3; i <= n; i++) {\n            int third = first + second;\n            first = second;\n            second = third;\n        }\n        return second;\n    }\n};'
      },
      tags: ['Math', 'Dynamic Programming', 'Memoization'],
      displayOrder: 13,
    },
    {
      title: 'Merge Intervals',
      slug: 'merge-intervals',
      description: 'Given an array of `intervals` where `intervals[i] = [start_i, end_i]`, merge all overlapping intervals, and return an array of the non-overlapping intervals that cover all the intervals in the input.',
      difficulty: 'MEDIUM',
      subjectSlug: 'dsa',
      topicSlug: 'sorting',
      constraints: '1 <= intervals.length <= 10^4\nintervals[i].length == 2\n0 <= start_i <= end_i <= 10^4',
      inputFormat: '2D Array of intervals [[start1, end1], [start2, end2], ...]',
      outputFormat: '2D Array of merged non-overlapping intervals.',
      examples: [
        { input: 'intervals = [[1,3],[2,6],[8,10],[15,18]]', output: '[[1,6],[8,10],[15,18]]', explanation: 'Intervals [1,3] and [2,6] overlap, merged into [1,6].' },
        { input: 'intervals = [[1,4],[4,5]]', output: '[[1,5]]', explanation: 'Intervals [1,4] and [4,5] are considered overlapping.' }
      ],
      starterCode: {
        javascript: 'function merge(intervals) {\n  if (!intervals.length) return [];\n  intervals.sort((a, b) => a[0] - b[0]);\n  const result = [intervals[0]];\n  for (let i = 1; i < intervals.length; i++) {\n    const last = result[result.length - 1];\n    if (intervals[i][0] <= last[1]) {\n      last[1] = Math.max(last[1], intervals[i][1]);\n    } else {\n      result.push(intervals[i]);\n    }\n  }\n  return result;\n}',
        python: 'def merge(intervals: list[list[int]]) -> list[list[int]]:\n    intervals.sort(key=lambda x: x[0])\n    merged = []\n    for interval in intervals:\n        if not merged or merged[-1][1] < interval[0]:\n            merged.append(interval)\n        else:\n            merged[-1][1] = max(merged[-1][1], interval[1])\n    return merged',
        java: 'class Solution {\n    public int[][] merge(int[][] intervals) {\n        Arrays.sort(intervals, (a, b) -> Integer.compare(a[0], b[0]));\n        List<int[]> result = new ArrayList<>();\n        for (int[] interval : intervals) {\n            if (result.isEmpty() || result.get(result.size() - 1)[1] < interval[0]) {\n                result.add(interval);\n            } else {\n                result.get(result.size() - 1)[1] = Math.max(result.get(result.size() - 1)[1], interval[1]);\n            }\n        }\n        return result.toArray(new int[result.size()][]);\n    }\n}',
        cpp: 'class Solution {\npublic:\n    vector<vector<int>> merge(vector<vector<int>>& intervals) {\n        if (intervals.empty()) return {};\n        sort(intervals.begin(), intervals.end());\n        vector<vector<int>> merged;\n        for (const auto& interval : intervals) {\n            if (merged.empty() || merged.back()[1] < interval[0]) {\n                merged.push_back(interval);\n            } else {\n                merged.back()[1] = max(merged.back()[1], interval[1]);\n            }\n        }\n        return merged;\n    }\n};'
      },
      tags: ['Array', 'Sorting'],
      displayOrder: 14,
    },
  ]

  let totalCodingProblems = 0

  for (const prob of CODING_PROBLEM_SEED_DATA) {
    const subject = subjectMap.get(prob.subjectSlug)
    if (!subject) continue
    const topicObj = prob.topicSlug ? subject.topics.find((t) => t.slug === prob.topicSlug) : null
    const topicId = topicObj ? topicObj.id : null

    await db.codingProblem.upsert({
      where: { slug: prob.slug },
      update: {
        title: prob.title,
        description: prob.description,
        difficulty: prob.difficulty,
        subjectId: subject.id,
        topicId: topicId,
        constraints: prob.constraints,
        inputFormat: prob.inputFormat,
        outputFormat: prob.outputFormat,
        examples: prob.examples,
        starterCode: prob.starterCode,
        tags: prob.tags,
        isPublished: true,
        displayOrder: prob.displayOrder,
      },
      create: {
        title: prob.title,
        slug: prob.slug,
        description: prob.description,
        difficulty: prob.difficulty,
        subjectId: subject.id,
        topicId: topicId,
        constraints: prob.constraints,
        inputFormat: prob.inputFormat,
        outputFormat: prob.outputFormat,
        examples: prob.examples,
        starterCode: prob.starterCode,
        tags: prob.tags,
        isPublished: true,
        displayOrder: prob.displayOrder,
      },
    })
    totalCodingProblems++
  }

  console.log(`✅ Seeding complete:`)
  console.log(`   - Subjects: ${totalSubjects}`)
  console.log(`   - Topics: ${totalTopics}`)
  console.log(`   - Quizzes: ${totalQuizzes}`)
  console.log(`   - Questions: ${totalQuestions}`)
  console.log(`   - Question Options: ${totalOptions}`)
  console.log(`   - Coding Problems: ${totalCodingProblems}`)
}

seed()
  .catch((e) => {
    console.error('❌ Seeding failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await db.$disconnect()
  })

