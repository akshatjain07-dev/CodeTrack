export type Difficulty = 'Easy' | 'Medium' | 'Hard';
export type Status = 'Solved' | 'Attempted' | 'Unsolved';
export type Confidence = 'Low' | 'Medium' | 'High';

export interface DSAQuestion {
  id: string;
  number: number;
  title: string;
  topic: string;
  difficulty: Difficulty;
  status: Status;
  platform: 'LeetCode' | 'GeeksforGeeks' | 'CodingNinjas' | 'Codeforces';
  problemUrl: string;
  bookmarked: boolean;
  isRevisit?: boolean;
  revisionCount?: number;
  sheets: string[];
  confidence?: Confidence;
  isMustDo?: boolean;
  lastAttempted?: string;
  notes?: string;
  acceptanceRate?: string;
  revisionDueDays?: number; // 0 = due today, negative = overdue, positive = days left
}

export interface DSASheet {
  id: string;
  title: string;
  tagline: string;
  author: string;
  totalQuestions: number;
  solvedQuestions: number;
  progress: number;
  category: string;
  color: string;
  popularTopics: string[];
}

export interface UserStats {
  totalSolved: number;
  totalQuestions: number;
  easySolved: number;
  easyTotal: number;
  mediumSolved: number;
  mediumTotal: number;
  hardSolved: number;
  hardTotal: number;
  currentStreak: number;
  bestStreak: number;
  activeSheetTitle: string;
  activeSheetProgress: number;
  activeSheetSolved: number;
  activeSheetTotal: number;
  dailyGoal: number;
  solvedToday: number;
}

export const MOCK_QUESTIONS: DSAQuestion[] = [
  // ================= ARRAYS & HASHING (Striver Page 1 & Love Babbar) =================
  {
    id: 'q-1',
    number: 1,
    title: 'Two Sum',
    topic: 'Arrays',
    difficulty: 'Easy',
    status: 'Solved',
    platform: 'LeetCode',
    problemUrl: 'https://leetcode.com/problems/two-sum/',
    bookmarked: true,
    sheets: ['Striver A2Z', 'Love Babbar 450', 'NeetCode 150', 'NeetCode 250', 'Apna College'],
    confidence: 'High',
    lastAttempted: '2 days ago',
    notes: 'HashMap complement lookup in O(N) time and O(N) space. Classic foundation.',
    acceptanceRate: '54.2%',
    revisionDueDays: 14,
  },
  {
    id: 'q-2',
    number: 53,
    title: "Kadane's Algorithm (Maximum Subarray)",
    topic: 'Arrays',
    difficulty: 'Medium',
    status: 'Solved',
    platform: 'LeetCode',
    problemUrl: 'https://leetcode.com/problems/maximum-subarray/',
    bookmarked: true,
    sheets: ['Striver A2Z', 'Love Babbar 450', 'NeetCode 150', 'NeetCode 250', 'Apna College'],
    confidence: 'High',
    lastAttempted: 'Yesterday',
    notes: 'Maintain current sum. Reset to 0 when it turns negative. O(N) time, O(1) space.',
    acceptanceRate: '51.3%',
    revisionDueDays: 5,
  },
  {
    id: 'q-3',
    number: 75,
    title: "Sort an array of 0's 1's and 2's",
    topic: 'Arrays',
    difficulty: 'Medium',
    status: 'Solved',
    platform: 'LeetCode',
    problemUrl: 'https://leetcode.com/problems/sort-colors/',
    bookmarked: false,
    sheets: ['Striver A2Z', 'Love Babbar 450', 'NeetCode 150', 'NeetCode 250'],
    confidence: 'High',
    lastAttempted: '3 days ago',
    notes: 'Dutch National Flag algorithm using three pointers (low, mid, high) in a single pass.',
    acceptanceRate: '64.5%',
    revisionDueDays: 20,
  },
  {
    id: 'q-4',
    number: 169,
    title: 'Majority Element-I',
    topic: 'Arrays',
    difficulty: 'Easy',
    status: 'Solved',
    platform: 'LeetCode',
    problemUrl: 'https://leetcode.com/problems/majority-element/',
    bookmarked: false,
    sheets: ['Striver A2Z', 'Love Babbar 450', 'NeetCode 250'],
    confidence: 'High',
    lastAttempted: '4 days ago',
    notes: "Moore's Voting Algorithm to identify the element with > N/2 occurrences in O(1) space.",
    acceptanceRate: '65.2%',
    revisionDueDays: 18,
  },
  {
    id: 'q-5',
    number: 229,
    title: 'Majority Element-II',
    topic: 'Arrays',
    difficulty: 'Medium',
    status: 'Attempted',
    platform: 'LeetCode',
    problemUrl: 'https://leetcode.com/problems/majority-element-ii/',
    bookmarked: true,
    sheets: ['Striver A2Z', 'Love Babbar 450'],
    confidence: 'Medium',
    lastAttempted: 'Today',
    notes: 'Extended Boyer-Moore voting with two candidate variables for > N/3 occurrences.',
    acceptanceRate: '48.9%',
    revisionDueDays: 1,
  },
  {
    id: 'q-6',
    number: 31,
    title: 'Next Permutation',
    topic: 'Arrays',
    difficulty: 'Medium',
    status: 'Solved',
    platform: 'LeetCode',
    problemUrl: 'https://leetcode.com/problems/next-permutation/',
    bookmarked: true,
    sheets: ['Striver A2Z', 'Love Babbar 450', 'Apna College'],
    confidence: 'Medium',
    lastAttempted: '2 days ago',
    notes: 'Find pivot index from right where a[i] < a[i+1], swap with successor, reverse suffix.',
    acceptanceRate: '40.6%',
    revisionDueDays: 0,
  },
  {
    id: 'q-7',
    number: 48,
    title: 'Rotate Matrix by 90 Degrees',
    topic: 'Arrays',
    difficulty: 'Medium',
    status: 'Solved',
    platform: 'LeetCode',
    problemUrl: 'https://leetcode.com/problems/rotate-image/',
    bookmarked: false,
    sheets: ['Striver A2Z', 'Love Babbar 450', 'NeetCode 150', 'Apna College'],
    confidence: 'High',
    lastAttempted: '5 days ago',
    notes: 'Transpose matrix in-place, then reverse each row. O(N^2) time, O(1) space.',
    acceptanceRate: '75.8%',
    revisionDueDays: 22,
  },
  {
    id: 'q-8',
    number: 54,
    title: 'Print the Matrix in Spiral Manner',
    topic: 'Arrays',
    difficulty: 'Medium',
    status: 'Solved',
    platform: 'LeetCode',
    problemUrl: 'https://leetcode.com/problems/spiral-matrix/',
    bookmarked: false,
    sheets: ['Striver A2Z', 'Love Babbar 450', 'NeetCode 150'],
    confidence: 'High',
    lastAttempted: '1 week ago',
    notes: 'Maintain top, bottom, left, right bounds and shrink inwards layer by layer.',
    acceptanceRate: '51.1%',
    revisionDueDays: 28,
  },
  {
    id: 'q-9',
    number: 15,
    title: '3 Sum',
    topic: 'Arrays',
    difficulty: 'Medium',
    status: 'Solved',
    platform: 'LeetCode',
    problemUrl: 'https://leetcode.com/problems/3sum/',
    bookmarked: true,
    sheets: ['Striver A2Z', 'Love Babbar 450', 'NeetCode 150', 'NeetCode 250'],
    confidence: 'Medium',
    lastAttempted: 'Yesterday',
    notes: 'Sort array, fix one number, run two-pointer scan. Skip duplicate elements carefully.',
    acceptanceRate: '35.4%',
    revisionDueDays: 2,
  },
  {
    id: 'q-10',
    number: 18,
    title: '4 Sum',
    topic: 'Arrays',
    difficulty: 'Medium',
    status: 'Unsolved',
    platform: 'LeetCode',
    problemUrl: 'https://leetcode.com/problems/4sum/',
    bookmarked: false,
    sheets: ['Striver A2Z', 'Love Babbar 450'],
    confidence: 'Low',
    lastAttempted: undefined,
    notes: 'Generalized k-sum with 2 fixed nested loops and two-pointer inner scan. Watch for overflow.',
    acceptanceRate: '37.0%',
    revisionDueDays: -1,
  },
  {
    id: 'q-11',
    number: 128,
    title: 'Longest Consecutive Sequence in an Array',
    topic: 'Arrays',
    difficulty: 'Medium',
    status: 'Solved',
    platform: 'LeetCode',
    problemUrl: 'https://leetcode.com/problems/longest-consecutive-sequence/',
    bookmarked: true,
    sheets: ['Striver A2Z', 'Love Babbar 450', 'NeetCode 150', 'NeetCode 250'],
    confidence: 'High',
    lastAttempted: '3 days ago',
    notes: 'Insert all into HashSet. Only initiate streak check if num - 1 is not in set.',
    acceptanceRate: '47.5%',
    revisionDueDays: 12,
  },
  {
    id: 'q-12',
    number: 152,
    title: 'Maximum Product Subarray in an Array',
    topic: 'Arrays',
    difficulty: 'Medium',
    status: 'Attempted',
    platform: 'LeetCode',
    problemUrl: 'https://leetcode.com/problems/maximum-product-subarray/',
    bookmarked: true,
    sheets: ['Striver A2Z', 'Love Babbar 450', 'NeetCode 150', 'Apna College'],
    confidence: 'Low',
    lastAttempted: '3 days ago',
    notes: 'Track both maxProduct and minProduct at each step because negative numbers flip signs.',
    acceptanceRate: '35.1%',
    revisionDueDays: 0,
  },

  // ================= BINARY SEARCH (Striver Page 1 & 2) =================
  {
    id: 'q-13',
    number: 704,
    title: 'Binary Search (Search X in Sorted Array)',
    topic: 'Binary Search',
    difficulty: 'Easy',
    status: 'Solved',
    platform: 'LeetCode',
    problemUrl: 'https://leetcode.com/problems/binary-search/',
    bookmarked: false,
    sheets: ['Striver A2Z', 'Love Babbar 450', 'NeetCode 150', 'NeetCode 250'],
    confidence: 'High',
    lastAttempted: '6 days ago',
    notes: 'Standard low + (high - low) / 2 avoid integer overflow condition. O(log N).',
    acceptanceRate: '58.3%',
    revisionDueDays: 25,
  },
  {
    id: 'q-14',
    number: 33,
    title: 'Search in Rotated Sorted Array-I',
    topic: 'Binary Search',
    difficulty: 'Medium',
    status: 'Solved',
    platform: 'LeetCode',
    problemUrl: 'https://leetcode.com/problems/search-in-rotated-sorted-array/',
    bookmarked: true,
    sheets: ['Striver A2Z', 'Love Babbar 450', 'NeetCode 150', 'Apna College'],
    confidence: 'Medium',
    lastAttempted: '2 days ago',
    notes: 'Determine which half is sorted (left or right), then check if target lies within.',
    acceptanceRate: '41.2%',
    revisionDueDays: 4,
  },
  {
    id: 'q-15',
    number: 875,
    title: 'Koko Eating Bananas',
    topic: 'Binary Search',
    difficulty: 'Medium',
    status: 'Solved',
    platform: 'LeetCode',
    problemUrl: 'https://leetcode.com/problems/koko-eating-bananas/',
    bookmarked: true,
    sheets: ['Striver A2Z', 'NeetCode 150', 'NeetCode 250'],
    confidence: 'High',
    lastAttempted: '4 days ago',
    notes: 'Binary search on answer speed range [1, max(piles)]. Feasibility check in O(N).',
    acceptanceRate: '49.8%',
    revisionDueDays: 16,
  },

  // ================= STRINGS (Striver Page 3, 4, 8 & Love Babbar) =================
  {
    id: 'q-16',
    number: 125,
    title: 'Valid Palindrome',
    topic: 'Strings',
    difficulty: 'Easy',
    status: 'Solved',
    platform: 'LeetCode',
    problemUrl: 'https://leetcode.com/problems/valid-palindrome/',
    bookmarked: false,
    sheets: ['Striver A2Z', 'Love Babbar 450', 'NeetCode 150', 'Apna College'],
    confidence: 'High',
    lastAttempted: '1 week ago',
    notes: 'Two pointers from head and tail skipping non-alphanumeric chars. O(1) memory.',
    acceptanceRate: '47.9%',
    revisionDueDays: 30,
  },
  {
    id: 'q-17',
    number: 3,
    title: 'Longest Substring Without Repeating Characters',
    topic: 'Strings',
    difficulty: 'Medium',
    status: 'Solved',
    platform: 'LeetCode',
    problemUrl: 'https://leetcode.com/problems/longest-substring-without-repeating-characters/',
    bookmarked: true,
    sheets: ['Striver A2Z', 'Love Babbar 450', 'NeetCode 150', 'NeetCode 250', 'Apna College'],
    confidence: 'High',
    lastAttempted: 'Yesterday',
    notes: 'Sliding window with character index hashmap to fast-forward left boundary.',
    acceptanceRate: '35.6%',
    revisionDueDays: 7,
  },
  {
    id: 'q-18',
    number: 76,
    title: 'Minimum Window Substring',
    topic: 'Strings',
    difficulty: 'Hard',
    status: 'Attempted',
    platform: 'LeetCode',
    problemUrl: 'https://leetcode.com/problems/minimum-window-substring/',
    bookmarked: true,
    sheets: ['Striver A2Z', 'Love Babbar 450', 'NeetCode 150', 'NeetCode 250'],
    confidence: 'Low',
    lastAttempted: '3 days ago',
    notes: 'Sliding window tracking matched unique character counts with reference frequency map.',
    acceptanceRate: '43.1%',
    revisionDueDays: 0,
  },

  // ================= LINKED LIST (Striver Page 2 & 3 & Love Babbar) =================
  {
    id: 'q-19',
    number: 206,
    title: 'Reverse a Linked List',
    topic: 'Linked List',
    difficulty: 'Easy',
    status: 'Solved',
    platform: 'LeetCode',
    problemUrl: 'https://leetcode.com/problems/reverse-linked-list/',
    bookmarked: false,
    sheets: ['Striver A2Z', 'Love Babbar 450', 'NeetCode 150', 'NeetCode 250', 'Apna College'],
    confidence: 'High',
    lastAttempted: '5 days ago',
    notes: 'Three-pointer iterative approach: prev, curr, nextNode. O(N) time and O(1) space.',
    acceptanceRate: '77.2%',
    revisionDueDays: 24,
  },
  {
    id: 'q-20',
    number: 141,
    title: 'Detect a Loop in Linked List',
    topic: 'Linked List',
    difficulty: 'Easy',
    status: 'Solved',
    platform: 'LeetCode',
    problemUrl: 'https://leetcode.com/problems/linked-list-cycle/',
    bookmarked: false,
    sheets: ['Striver A2Z', 'Love Babbar 450', 'NeetCode 150', 'Apna College'],
    confidence: 'High',
    lastAttempted: '4 days ago',
    notes: "Floyd's Tortoise and Hare cycle detection algorithm. Fast moves 2 steps, slow moves 1.",
    acceptanceRate: '50.9%',
    revisionDueDays: 21,
  },
  {
    id: 'q-21',
    number: 2,
    title: 'Add Two Numbers in Linked List',
    topic: 'Linked List',
    difficulty: 'Medium',
    status: 'Solved',
    platform: 'LeetCode',
    problemUrl: 'https://leetcode.com/problems/add-two-numbers/',
    bookmarked: false,
    sheets: ['Striver A2Z', 'Love Babbar 450', 'NeetCode 150', 'Apna College'],
    confidence: 'High',
    lastAttempted: '1 week ago',
    notes: 'Dummy head node with running carry. Propagate remainder until lists and carry are empty.',
    acceptanceRate: '43.8%',
    revisionDueDays: 27,
  },
  {
    id: 'q-22',
    number: 146,
    title: 'LRU Cache',
    topic: 'Linked List',
    difficulty: 'Medium',
    status: 'Solved',
    platform: 'LeetCode',
    problemUrl: 'https://leetcode.com/problems/lru-cache/',
    bookmarked: true,
    sheets: ['Striver A2Z', 'Love Babbar 450', 'NeetCode 150', 'NeetCode 250'],
    confidence: 'Medium',
    lastAttempted: '2 days ago',
    notes: 'Doubly Linked List + HashMap provides O(1) get and put operations with eviction.',
    acceptanceRate: '43.2%',
    revisionDueDays: 3,
  },

  // ================= TREES & BST (Striver Page 4 & 5 & Love Babbar) =================
  {
    id: 'q-23',
    number: 104,
    title: 'Maximum Depth in Binary Tree',
    topic: 'Trees',
    difficulty: 'Easy',
    status: 'Solved',
    platform: 'LeetCode',
    problemUrl: 'https://leetcode.com/problems/maximum-depth-of-binary-tree/',
    bookmarked: false,
    sheets: ['Striver A2Z', 'Love Babbar 450', 'NeetCode 150', 'NeetCode 250', 'Apna College'],
    confidence: 'High',
    lastAttempted: '3 days ago',
    notes: 'DFS recursion: 1 + max(maxDepth(root.left), maxDepth(root.right)). O(N) time.',
    acceptanceRate: '75.6%',
    revisionDueDays: 26,
  },
  {
    id: 'q-24',
    number: 102,
    title: 'Binary Tree Level Order Traversal',
    topic: 'Trees',
    difficulty: 'Medium',
    status: 'Solved',
    platform: 'LeetCode',
    problemUrl: 'https://leetcode.com/problems/binary-tree-level-order-traversal/',
    bookmarked: false,
    sheets: ['Striver A2Z', 'Love Babbar 450', 'NeetCode 150', 'Apna College'],
    confidence: 'High',
    lastAttempted: '5 days ago',
    notes: 'BFS with queue capturing level snapshot by looping queue.length times per tier.',
    acceptanceRate: '68.1%',
    revisionDueDays: 19,
  },
  {
    id: 'q-25',
    number: 236,
    title: 'Lowest Common Ancestor in Binary Tree',
    topic: 'Trees',
    difficulty: 'Medium',
    status: 'Solved',
    platform: 'LeetCode',
    problemUrl: 'https://leetcode.com/problems/lowest-common-ancestor-of-a-binary-tree/',
    bookmarked: true,
    sheets: ['Striver A2Z', 'Love Babbar 450', 'NeetCode 150', 'NeetCode 250'],
    confidence: 'Medium',
    lastAttempted: 'Yesterday',
    notes: 'Post-order DFS: if root is p or q return root. If both left and right return non-null, root is LCA.',
    acceptanceRate: '62.4%',
    revisionDueDays: 2,
  },
  {
    id: 'q-26',
    number: 124,
    title: 'Binary Tree Maximum Path Sum',
    topic: 'Trees',
    difficulty: 'Hard',
    status: 'Attempted',
    platform: 'LeetCode',
    problemUrl: 'https://leetcode.com/problems/binary-tree-maximum-path-sum/',
    bookmarked: true,
    sheets: ['Striver A2Z', 'Love Babbar 450', 'NeetCode 150', 'NeetCode 250'],
    confidence: 'Low',
    lastAttempted: 'Today',
    notes: 'Post-order DFS updating global max with root.val + leftMax + rightMax. Return root.val + max(left, right).',
    acceptanceRate: '40.5%',
    revisionDueDays: 0,
  },

  // ================= GRAPHS (Striver Page 6 & Love Babbar) =================
  {
    id: 'q-27',
    number: 200,
    title: 'Number of Islands',
    topic: 'Graphs',
    difficulty: 'Medium',
    status: 'Solved',
    platform: 'LeetCode',
    problemUrl: 'https://leetcode.com/problems/number-of-islands/',
    bookmarked: true,
    sheets: ['Striver A2Z', 'Love Babbar 450', 'NeetCode 150', 'NeetCode 250', 'Apna College'],
    confidence: 'High',
    lastAttempted: '3 days ago',
    notes: 'BFS or DFS flood-fill sinking connected 1s to 0s to avoid redundant visits.',
    acceptanceRate: '59.7%',
    revisionDueDays: 15,
  },
  {
    id: 'q-28',
    number: 207,
    title: 'Course Schedule (Detect Cycle in Directed Graph)',
    topic: 'Graphs',
    difficulty: 'Medium',
    status: 'Solved',
    platform: 'LeetCode',
    problemUrl: 'https://leetcode.com/problems/course-schedule/',
    bookmarked: true,
    sheets: ['Striver A2Z', 'Love Babbar 450', 'NeetCode 150', 'NeetCode 250'],
    confidence: 'Medium',
    lastAttempted: '2 days ago',
    notes: "Kahn's Algorithm (BFS with in-degree array) or DFS with 3-state recursion stack.",
    acceptanceRate: '47.6%',
    revisionDueDays: 1,
  },
  {
    id: 'q-29',
    number: 743,
    title: "Dijkstra's Algorithm (Network Delay Time)",
    topic: 'Graphs',
    difficulty: 'Medium',
    status: 'Attempted',
    platform: 'LeetCode',
    problemUrl: 'https://leetcode.com/problems/network-delay-time/',
    bookmarked: true,
    sheets: ['Striver A2Z', 'Love Babbar 450', 'NeetCode 150', 'Apna College'],
    confidence: 'Low',
    lastAttempted: 'Yesterday',
    notes: 'Min-heap priority queue storing (distance, node). O((V + E) log V) time.',
    acceptanceRate: '54.5%',
    revisionDueDays: 0,
  },

  // ================= DYNAMIC PROGRAMMING (Striver Page 7 & Love Babbar) =================
  {
    id: 'q-30',
    number: 70,
    title: 'Climbing Stairs',
    topic: 'Dynamic Programming',
    difficulty: 'Easy',
    status: 'Solved',
    platform: 'LeetCode',
    problemUrl: 'https://leetcode.com/problems/climbing-stairs/',
    bookmarked: false,
    sheets: ['Striver A2Z', 'Love Babbar 450', 'NeetCode 150', 'NeetCode 250', 'Apna College'],
    confidence: 'High',
    lastAttempted: '4 days ago',
    notes: 'Fibonacci state transition: dp[i] = dp[i-1] + dp[i-2] with O(1) space optimization.',
    acceptanceRate: '53.1%',
    revisionDueDays: 20,
  },
  {
    id: 'q-31',
    number: 300,
    title: 'Longest Increasing Subsequence (LIS)',
    topic: 'Dynamic Programming',
    difficulty: 'Medium',
    status: 'Solved',
    platform: 'LeetCode',
    problemUrl: 'https://leetcode.com/problems/longest-increasing-subsequence/',
    bookmarked: true,
    sheets: ['Striver A2Z', 'Love Babbar 450', 'NeetCode 150', 'NeetCode 250', 'Apna College'],
    confidence: 'Medium',
    lastAttempted: '3 days ago',
    notes: 'O(N^2) dynamic programming or O(N log N) patience sorting with binary search.',
    acceptanceRate: '55.3%',
    revisionDueDays: 4,
  },
  {
    id: 'q-32',
    number: 1143,
    title: 'Longest Common Subsequence (LCS)',
    topic: 'Dynamic Programming',
    difficulty: 'Medium',
    status: 'Solved',
    platform: 'LeetCode',
    problemUrl: 'https://leetcode.com/problems/longest-common-subsequence/',
    bookmarked: true,
    sheets: ['Striver A2Z', 'Love Babbar 450', 'NeetCode 150', 'NeetCode 250'],
    confidence: 'High',
    lastAttempted: '1 week ago',
    notes: '2D matrix dp[i][j]: if s1[i] == s2[j] then 1 + dp[i-1][j-1] else max(dp[i-1][j], dp[i][j-1]).',
    acceptanceRate: '58.0%',
    revisionDueDays: 11,
  },
  {
    id: 'q-33',
    number: 72,
    title: 'Edit Distance',
    topic: 'Dynamic Programming',
    difficulty: 'Hard',
    status: 'Attempted',
    platform: 'LeetCode',
    problemUrl: 'https://leetcode.com/problems/edit-distance/',
    bookmarked: true,
    sheets: ['Striver A2Z', 'Love Babbar 450', 'NeetCode 150', 'NeetCode 250'],
    confidence: 'Low',
    lastAttempted: 'Yesterday',
    notes: 'Three recursive choices: insert, delete, replace with 1 + min of all three branches.',
    acceptanceRate: '56.9%',
    revisionDueDays: 0,
  },
  {
    id: 'q-34',
    number: 416,
    title: 'Partition Equal Subset Sum',
    topic: 'Dynamic Programming',
    difficulty: 'Medium',
    status: 'Unsolved',
    platform: 'LeetCode',
    problemUrl: 'https://leetcode.com/problems/partition-equal-subset-sum/',
    bookmarked: false,
    sheets: ['Striver A2Z', 'Love Babbar 450', 'NeetCode 150'],
    confidence: 'Low',
    lastAttempted: undefined,
    notes: 'Equivalent to 0/1 Knapsack where target weight is sum(nums) / 2.',
    acceptanceRate: '46.7%',
    revisionDueDays: -2,
  },
  {
    id: 'q-35',
    number: 42,
    title: 'Trapping Rainwater',
    topic: 'Arrays',
    difficulty: 'Hard',
    status: 'Solved',
    platform: 'LeetCode',
    problemUrl: 'https://leetcode.com/problems/trapping-rain-water/',
    bookmarked: true,
    sheets: ['Striver A2Z', 'Love Babbar 450', 'NeetCode 150', 'NeetCode 250', 'Apna College'],
    confidence: 'High',
    lastAttempted: '3 days ago',
    notes: 'Two-pointer approach maintaining leftMax and rightMax in O(N) time and O(1) space.',
    acceptanceRate: '62.4%',
    revisionDueDays: 9,
  },
];

export const MOCK_SHEETS: DSASheet[] = [
  {
    id: 'striver-a2z',
    title: 'Striver A2Z',
    tagline: 'TakeUforward complete 328-question comprehensive DSA checklist',
    author: 'Raj Vikramaditya (takeUforward)',
    totalQuestions: 328,
    solvedQuestions: 142,
    progress: 43,
    category: 'Comprehensive',
    color: '#6366F1',
    popularTopics: ['Arrays', 'Binary Search', 'Trees', 'Graphs', 'DP'],
  },
  {
    id: 'love-babbar-450',
    title: 'Love Babbar 450',
    tagline: 'The ultimate 448 DSA cracker problem sheet for product companies',
    author: 'Love Babbar',
    totalQuestions: 448,
    solvedQuestions: 156,
    progress: 35,
    category: 'Placement Cracker',
    color: '#F59E0B',
    popularTopics: ['Arrays', 'Strings', 'LinkedList', 'Backtracking', 'Binary Trees'],
  },
  {
    id: 'neetcode-150',
    title: 'NeetCode 150',
    tagline: 'The gold standard high-yield interview question roadmap',
    author: 'Navdeep Singh (NeetCode)',
    totalQuestions: 150,
    solvedQuestions: 96,
    progress: 64,
    category: 'FAANG Curated',
    color: '#10B981',
    popularTopics: ['Two Pointers', 'Sliding Window', 'Trees', 'DP'],
  },
  {
    id: 'neetcode-250',
    title: 'NeetCode 250',
    tagline: 'Extended 250-problem comprehensive algorithm catalog',
    author: 'NeetCode',
    totalQuestions: 250,
    solvedQuestions: 118,
    progress: 47,
    category: 'Deep Dive',
    color: '#06B6D4',
    popularTopics: ['Arrays', 'Graphs', 'Dynamic Programming', 'Tries'],
  },
  {
    id: 'apna-college',
    title: 'Apna College',
    tagline: 'Placement-focused DSA questions curated by Aman & Shraddha',
    author: 'Aman Dhattarwal & Shraddha Khapra',
    totalQuestions: 375,
    solvedQuestions: 125,
    progress: 33,
    category: 'College Placement',
    color: '#EC4899',
    popularTopics: ['Arrays', 'Strings', 'Stacks & Queues', 'Trees', 'Graphs'],
  },
];

export const MOCK_USER_STATS: UserStats = {
  totalSolved: 142,
  totalQuestions: 450,
  easySolved: 68,
  easyTotal: 150,
  mediumSolved: 62,
  mediumTotal: 220,
  hardSolved: 12,
  hardTotal: 80,
  currentStreak: 18,
  bestStreak: 42,
  activeSheetTitle: 'Striver A2Z',
  activeSheetProgress: 42,
  activeSheetSolved: 192,
  activeSheetTotal: 455,
  dailyGoal: 3,
  solvedToday: 2,
};

export interface TopicStat {
  topic: string;
  solved: number;
  total: number;
  percentage: number;
  color: string;
}

export const MOCK_TOPIC_STATS: TopicStat[] = [
  { topic: 'Arrays', solved: 28, total: 36, percentage: 78, color: '#6366F1' },
  { topic: 'DP', solved: 21, total: 35, percentage: 60, color: '#10B981' },
  { topic: 'Trees', solved: 24, total: 36, percentage: 67, color: '#3B82F6' },
  { topic: 'Strings', solved: 18, total: 25, percentage: 72, color: '#F59E0B' },
  { topic: 'Graphs', solved: 14, total: 30, percentage: 47, color: '#EC4899' },
];

export interface HeatmapDay {
  date: string;
  dayOfWeek: number; // 0 (Sun) to 6 (Sat)
  weekIndex: number; // 0 to 51 (52 weeks)
  count: number;
}

// Generate 52 weeks (364 days) of realistic GitHub-style activity data
export function generateMockHeatmap(): HeatmapDay[] {
  const days: HeatmapDay[] = [];
  const today = new Date();
  const totalDays = 52 * 7; // 364 days
  
  for (let i = totalDays - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dayOfWeek = d.getDay();
    const weekIndex = Math.floor((totalDays - 1 - i) / 7);
    
    // Seeded realistic daily solve activity
    let count = 0;
    const r = Math.random();
    if (r > 0.35) {
      if (r > 0.88) count = 4;
      else if (r > 0.68) count = 3;
      else if (r > 0.48) count = 2;
      else count = 1;
    }
    
    // Ensure active streak for the most recent 18 days
    if (i < 18) {
      count = Math.max(1, count);
    }
    
    days.push({
      date: d.toISOString().split('T')[0],
      dayOfWeek,
      weekIndex,
      count,
    });
  }
  return days;
}
