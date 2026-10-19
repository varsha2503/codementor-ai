import { TREE_NOTE, problem } from "./helpers.js";

export const treeProblems = [
  problem({
    slug: "shelf-depth",
    title: "Maximum Depth of Binary Tree",
    difficulty: "EASY",
    topics: ["trees", "recursion"],
    tags: ["tree"],
    statement:
      "A shelf plan is a binary tree. The depth is the number of nodes on the longest path from the root to a leaf. An empty plan has depth 0.",
    constraints: ["0 <= number of nodes <= 2000", "-10000 <= node value <= 10000"],
    examples: [
      { input: "root = [3, 9, 20, null, null, 15, 7]", output: "3" },
      { input: "root = []", output: "0" },
    ],
    signature: "int shelfDepth(TreeNode* root)",
    functionName: "shelfDepth",
    note: TREE_NOTE,
    driver: `printJson(Json::number(sol.shelfDepth(buildTree(in["root"]))));`,
    method: `int shelfDepth(TreeNode* root) {
        if (!root) return 0;
        return 1 + max(shelfDepth(root->left), shelfDepth(root->right));
    }`,
    expectedTime: "O(n)",
    expectedSpace: "O(h)",
    hints: [
      "The depth of a shelf is one more than the deeper of its two children. What is the depth of a missing child?",
      "Recursion fits the shape. The call stack is the extra memory.",
      "Return 0 for a null node. Otherwise return 1 plus the larger of the two child depths.",
      "Every node is visited once, so the time is linear. The call stack is proportional to the height, which is the whole chain on a skewed tree. An empty tree is the base case, not a depth of 1.",
    ],
    tests: [
      { input: { root: [3, 9, 20, null, null, 15, 7] }, expectedOutput: 3, visibility: "SAMPLE" },
      { input: { root: [1, null, 2] }, expectedOutput: 2, visibility: "SAMPLE" },
      { input: { root: [] }, expectedOutput: 0, visibility: "HIDDEN" },
      { input: { root: [1] }, expectedOutput: 1, visibility: "HIDDEN" },
      { input: { root: [1, 2, 3, 4] }, expectedOutput: 3, visibility: "HIDDEN" },
    ],
  }),
  problem({
    slug: "identical-layout",
    title: "Same Tree",
    difficulty: "EASY",
    topics: ["trees", "recursion"],
    tags: ["tree"],
    statement:
      "Two floor plans are binary trees. They match when their shapes and values match, including the positions of missing children. Return whether they are the same.",
    constraints: ["0 <= nodes in each tree <= 2000"],
    examples: [
      { input: "left = [1, 2, 3], right = [1, 2, 3]", output: "true" },
      { input: "left = [1, 2], right = [1, null, 2]", output: "false" },
    ],
    signature: "bool sameLayout(TreeNode* a, TreeNode* b)",
    functionName: "sameLayout",
    note: TREE_NOTE,
    driver: `printJson(Json::boolean(sol.sameLayout(buildTree(in["left"]), buildTree(in["right"]))));`,
    method: `bool sameLayout(TreeNode* a, TreeNode* b) {
        if (!a || !b) return a == b;
        return a->val == b->val && sameLayout(a->left, b->left) && sameLayout(a->right, b->right);
    }`,
    expectedTime: "O(n)",
    expectedSpace: "O(h)",
    hints: [
      "Two plans can fail because a value differs or because one has a child where the other has nothing. Handle the missing-node case before you read a value.",
      "Recurse on both trees together.",
      "If either pointer is null, they match only when both are null. Otherwise the values must match and both pairs of children must match.",
      "The walk stops early on the first mismatch. Worst-case time still visits every node. The null check is the base case: a node is not equal to an empty child just because you forgot to look.",
    ],
    tests: [
      { input: { left: [1, 2, 3], right: [1, 2, 3] }, expectedOutput: true, visibility: "SAMPLE" },
      { input: { left: [1, 2], right: [1, null, 2] }, expectedOutput: false, visibility: "SAMPLE" },
      { input: { left: [], right: [] }, expectedOutput: true, visibility: "HIDDEN" },
      { input: { left: [1, 2, 1], right: [1, 1, 2] }, expectedOutput: false, visibility: "HIDDEN" },
      { input: { left: [1], right: [1] }, expectedOutput: true, visibility: "HIDDEN" },
    ],
  }),
];
