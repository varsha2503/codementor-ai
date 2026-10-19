import { TREE_NOTE, problem } from "./helpers.js";

const numbersOut = (call: string) =>
  `auto values = ${call};\n    Json out;\n    out.type = Json::ARR;\n    for (long long value : values) out.a.push_back(Json::number(value));\n    printJson(out);`;

const rowsOut = (call: string) =>
  `auto rows = ${call};\n    Json out;\n    out.type = Json::ARR;\n    for (const auto& row : rows) out.a.push_back(Json::ints(row));\n    printJson(out);`;

const treeOut = (call: string) => `{
    auto* node = ${call};
    Json out; out.type = Json::ARR;
    if (node) {
        queue<TreeNode*> pending;
        pending.push(node);
        while (!pending.empty()) {
            auto* cur = pending.front(); pending.pop();
            if (!cur) out.a.push_back(Json::nul());
            else {
                out.a.push_back(Json::number(cur->val));
                pending.push(cur->left);
                pending.push(cur->right);
            }
        }
        while (!out.a.empty() && out.a.back().isNull()) out.a.pop_back();
    }
    printJson(out);
}`;

const rootDriver = (call: string) => `auto root = buildTree(in["root"]);\n    ${call}`;

export const treeCoreProblems = [
  problem({
    slug: "preorder-walk",
    title: "Preorder Traversal",
    difficulty: "EASY",
    topics: ["trees"],
    tags: ["traversal"],
    statement: "Return the preorder traversal of the binary tree: visit a node, then its left subtree, then its right subtree. An empty tree produces an empty list.",
    constraints: ["0 <= nodes <= 2000", "-10000 <= node value <= 10000"],
    examples: [
      { input: "root = [1, null, 2, 3]", output: "[1, 2, 3]" },
      { input: "root = []", output: "[]" },
    ],
    signature: "vector<int> preorderWalk(TreeNode* root)",
    functionName: "preorderWalk",
    note: TREE_NOTE,
    driver: rootDriver(numbersOut("sol.preorderWalk(root)")),
    method: `vector<int> preorderWalk(TreeNode* root) {
        vector<int> out;
        function<void(TreeNode*)> walk = [&](TreeNode* node) {
            if (!node) return;
            out.push_back(node->val);
            walk(node->left);
            walk(node->right);
        };
        walk(root);
        return out;
    }`,
    expectedTime: "O(n)",
    expectedSpace: "O(h)",
    hints: [
      "Preorder writes the node down before either child.",
      "A missing child is the base case. Do not read its value.",
      "Visit, then recurse left, then recurse right.",
      "An empty tree returns an empty list. The call stack follows the height.",
    ],
    tests: [
      { input: { root: [1, null, 2, 3] }, expectedOutput: [1, 2, 3], visibility: "SAMPLE" },
      { input: { root: [] }, expectedOutput: [], visibility: "SAMPLE" },
      { input: { root: [1, 2, 3] }, expectedOutput: [1, 2, 3], visibility: "HIDDEN" },
      { input: { root: [1] }, expectedOutput: [1], visibility: "HIDDEN" },
      { input: { root: [3, 9, 20, null, null, 15, 7] }, expectedOutput: [3, 9, 20, 15, 7], visibility: "HIDDEN" },
    ],
  }),
  problem({
    slug: "inorder-walk",
    title: "Inorder Traversal",
    difficulty: "EASY",
    topics: ["trees"],
    tags: ["traversal"],
    statement: "Return the inorder traversal: left subtree, then the node, then the right subtree. An empty tree produces an empty list.",
    constraints: ["0 <= nodes <= 2000", "-10000 <= node value <= 10000"],
    examples: [
      { input: "root = [1, null, 2, 3]", output: "[1, 3, 2]" },
      { input: "root = [1, 2, 3]", output: "[2, 1, 3]" },
    ],
    signature: "vector<int> inorderWalk(TreeNode* root)",
    functionName: "inorderWalk",
    note: TREE_NOTE,
    driver: rootDriver(numbersOut("sol.inorderWalk(root)")),
    method: `vector<int> inorderWalk(TreeNode* root) {
        vector<int> out;
        function<void(TreeNode*)> walk = [&](TreeNode* node) {
            if (!node) return;
            walk(node->left);
            out.push_back(node->val);
            walk(node->right);
        };
        walk(root);
        return out;
    }`,
    expectedTime: "O(n)",
    expectedSpace: "O(h)",
    hints: [
      "The node is written between its two subtrees.",
      "Finish the whole left subtree before recording the node.",
      "Null is the base case. Then left, record, right.",
      "A single node returns a one-element list. An empty tree returns nothing.",
    ],
    tests: [
      { input: { root: [1, null, 2, 3] }, expectedOutput: [1, 3, 2], visibility: "SAMPLE" },
      { input: { root: [1, 2, 3] }, expectedOutput: [2, 1, 3], visibility: "SAMPLE" },
      { input: { root: [] }, expectedOutput: [], visibility: "HIDDEN" },
      { input: { root: [1] }, expectedOutput: [1], visibility: "HIDDEN" },
      { input: { root: [3, 9, 20, null, null, 15, 7] }, expectedOutput: [9, 3, 15, 20, 7], visibility: "HIDDEN" },
    ],
  }),
  problem({
    slug: "postorder-walk",
    title: "Postorder Traversal",
    difficulty: "EASY",
    topics: ["trees"],
    tags: ["traversal"],
    statement: "Return the postorder traversal: left subtree, then the right subtree, then the node. An empty tree produces an empty list.",
    constraints: ["0 <= nodes <= 2000", "-10000 <= node value <= 10000"],
    examples: [
      { input: "root = [1, null, 2, 3]", output: "[3, 2, 1]" },
      { input: "root = [1, 2, 3]", output: "[2, 3, 1]" },
    ],
    signature: "vector<int> postorderWalk(TreeNode* root)",
    functionName: "postorderWalk",
    note: TREE_NOTE,
    driver: rootDriver(numbersOut("sol.postorderWalk(root)")),
    method: `vector<int> postorderWalk(TreeNode* root) {
        vector<int> out;
        function<void(TreeNode*)> walk = [&](TreeNode* node) {
            if (!node) return;
            walk(node->left);
            walk(node->right);
            out.push_back(node->val);
        };
        walk(root);
        return out;
    }`,
    expectedTime: "O(n)",
    expectedSpace: "O(h)",
    hints: [
      "Both children are finished before the node itself is recorded.",
      "A leaf is recorded immediately, because both children are missing.",
      "Recurse left, recurse right, then push the value.",
      "The root is always last when the tree is not empty.",
    ],
    tests: [
      { input: { root: [1, null, 2, 3] }, expectedOutput: [3, 2, 1], visibility: "SAMPLE" },
      { input: { root: [1, 2, 3] }, expectedOutput: [2, 3, 1], visibility: "SAMPLE" },
      { input: { root: [] }, expectedOutput: [], visibility: "HIDDEN" },
      { input: { root: [1] }, expectedOutput: [1], visibility: "HIDDEN" },
      { input: { root: [1, 2, 3, 4, 5, null, 6] }, expectedOutput: [4, 5, 2, 6, 3, 1], visibility: "HIDDEN" },
    ],
  }),
  problem({
    slug: "level-walk",
    title: "Level Order Traversal",
    difficulty: "EASY",
    topics: ["trees"],
    tags: ["bfs"],
    statement: "Return the node values level by level, from the root downward. Each level is read from left to right. An empty tree produces an empty list of levels.",
    constraints: ["0 <= nodes <= 2000", "-10000 <= node value <= 10000"],
    examples: [
      { input: "root = [3, 9, 20, null, null, 15, 7]", output: "[[3], [9, 20], [15, 7]]" },
      { input: "root = []", output: "[]" },
    ],
    signature: "vector<vector<int>> levelWalk(TreeNode* root)",
    functionName: "levelWalk",
    note: TREE_NOTE,
    driver: rootDriver(rowsOut("sol.levelWalk(root)")),
    method: `vector<vector<int>> levelWalk(TreeNode* root) {
        vector<vector<int>> out;
        if (!root) return out;
        queue<TreeNode*> pending;
        pending.push(root);
        while (!pending.empty()) {
            int size = (int)pending.size();
            vector<int> row;
            while (size--) {
                auto* node = pending.front(); pending.pop();
                row.push_back(node->val);
                if (node->left) pending.push(node->left);
                if (node->right) pending.push(node->right);
            }
            out.push_back(row);
        }
        return out;
    }`,
    expectedTime: "O(n)",
    expectedSpace: "O(n)",
    hints: [
      "A queue keeps the next level in the order you discovered it.",
      "Snapshot the queue size before taking nodes out. That size is one level.",
      "Push a child only when it exists. Missing children are not entries in the row.",
      "An empty tree returns no rows. A single node returns one row of one value.",
    ],
    tests: [
      { input: { root: [3, 9, 20, null, null, 15, 7] }, expectedOutput: [[3], [9, 20], [15, 7]], visibility: "SAMPLE" },
      { input: { root: [] }, expectedOutput: [], visibility: "SAMPLE" },
      { input: { root: [1] }, expectedOutput: [[1]], visibility: "HIDDEN" },
      { input: { root: [1, null, 2, 3] }, expectedOutput: [[1], [2], [3]], visibility: "HIDDEN" },
      { input: { root: [1, 2, 3, 4, 5, null, 6] }, expectedOutput: [[1], [2, 3], [4, 5, 6]], visibility: "HIDDEN" },
    ],
  }),
  problem({
    slug: "iter-preorder",
    title: "Iterative Preorder Traversal",
    difficulty: "EASY",
    topics: ["trees"],
    tags: ["stack"],
    statement: "Return the preorder traversal using an explicit stack rather than the call stack. Visit a node, then its left subtree, then its right subtree.",
    constraints: ["0 <= nodes <= 2000", "-10000 <= node value <= 10000"],
    examples: [
      { input: "root = [1, null, 2, 3]", output: "[1, 2, 3]" },
      { input: "root = [1, 2, 3]", output: "[1, 2, 3]" },
    ],
    signature: "vector<int> iterativePreorder(TreeNode* root)",
    functionName: "iterativePreorder",
    note: TREE_NOTE,
    driver: rootDriver(numbersOut("sol.iterativePreorder(root)")),
    method: `vector<int> iterativePreorder(TreeNode* root) {
        vector<int> out;
        if (!root) return out;
        stack<TreeNode*> pending;
        pending.push(root);
        while (!pending.empty()) {
            auto* node = pending.top(); pending.pop();
            out.push_back(node->val);
            if (node->right) pending.push(node->right);
            if (node->left) pending.push(node->left);
        }
        return out;
    }`,
    expectedTime: "O(n)",
    expectedSpace: "O(n)",
    hints: [
      "A stack can replay the recursive calls. The next node to visit sits on top.",
      "Push the right child before the left child, so the left child is popped first.",
      "Record a node as soon as you pop it. Then push its existing children.",
      "An empty tree never enters the loop. Do not push null children.",
    ],
    tests: [
      { input: { root: [1, null, 2, 3] }, expectedOutput: [1, 2, 3], visibility: "SAMPLE" },
      { input: { root: [1, 2, 3] }, expectedOutput: [1, 2, 3], visibility: "SAMPLE" },
      { input: { root: [] }, expectedOutput: [], visibility: "HIDDEN" },
      { input: { root: [1] }, expectedOutput: [1], visibility: "HIDDEN" },
      { input: { root: [3, 9, 20, null, null, 15, 7] }, expectedOutput: [3, 9, 20, 15, 7], visibility: "HIDDEN" },
    ],
  }),
  problem({
    slug: "iter-inorder",
    title: "Iterative Inorder Traversal",
    difficulty: "EASY",
    topics: ["trees"],
    tags: ["stack"],
    statement: "Return the inorder traversal using an explicit stack. Finish the left spine before recording a node, then move to its right child.",
    constraints: ["0 <= nodes <= 2000", "-10000 <= node value <= 10000"],
    examples: [
      { input: "root = [1, null, 2, 3]", output: "[1, 3, 2]" },
      { input: "root = [1, 2, 3]", output: "[2, 1, 3]" },
    ],
    signature: "vector<int> iterativeInorder(TreeNode* root)",
    functionName: "iterativeInorder",
    note: TREE_NOTE,
    driver: rootDriver(numbersOut("sol.iterativeInorder(root)")),
    method: `vector<int> iterativeInorder(TreeNode* root) {
        vector<int> out;
        stack<TreeNode*> pending;
        auto* cur = root;
        while (cur || !pending.empty()) {
            while (cur) { pending.push(cur); cur = cur->left; }
            cur = pending.top(); pending.pop();
            out.push_back(cur->val);
            cur = cur->right;
        }
        return out;
    }`,
    expectedTime: "O(n)",
    expectedSpace: "O(h)",
    hints: [
      "Keep walking left and pushing nodes until the left child is missing.",
      "Popping a node means its left subtree is done. Record it, then switch to its right child.",
      "The outer loop continues while a node is waiting on the stack or the current pointer is not null.",
      "A right child of null simply falls through to the next pop. An empty tree returns nothing.",
    ],
    tests: [
      { input: { root: [1, null, 2, 3] }, expectedOutput: [1, 3, 2], visibility: "SAMPLE" },
      { input: { root: [1, 2, 3] }, expectedOutput: [2, 1, 3], visibility: "SAMPLE" },
      { input: { root: [] }, expectedOutput: [], visibility: "HIDDEN" },
      { input: { root: [1] }, expectedOutput: [1], visibility: "HIDDEN" },
      { input: { root: [3, 9, 20, null, null, 15, 7] }, expectedOutput: [9, 3, 15, 20, 7], visibility: "HIDDEN" },
    ],
  }),
  problem({
    slug: "post-two-stacks",
    title: "Postorder Traversal Using Two Stacks",
    difficulty: "EASY",
    topics: ["trees"],
    tags: ["stack"],
    statement: "Return the postorder traversal using two stacks. The first stack explores the tree. The second stack collects nodes so they come out left, right, then parent.",
    constraints: ["0 <= nodes <= 2000", "-10000 <= node value <= 10000"],
    examples: [
      { input: "root = [1, null, 2, 3]", output: "[3, 2, 1]" },
      { input: "root = [1, 2, 3]", output: "[2, 3, 1]" },
    ],
    signature: "vector<int> postorderTwoStacks(TreeNode* root)",
    functionName: "postorderTwoStacks",
    note: TREE_NOTE,
    driver: rootDriver(numbersOut("sol.postorderTwoStacks(root)")),
    method: `vector<int> postorderTwoStacks(TreeNode* root) {
        vector<int> out;
        if (!root) return out;
        stack<TreeNode*> explore, ready;
        explore.push(root);
        while (!explore.empty()) {
            auto* node = explore.top(); explore.pop();
            ready.push(node);
            if (node->left) explore.push(node->left);
            if (node->right) explore.push(node->right);
        }
        while (!ready.empty()) { out.push_back(ready.top()->val); ready.pop(); }
        return out;
    }`,
    expectedTime: "O(n)",
    expectedSpace: "O(n)",
    hints: [
      "Postorder is the reverse of a walk that visits a node, then its right child, then its left child.",
      "The first stack produces that reverse walk. Push every popped node onto the second stack.",
      "Push the left child before the right child on the first stack, so the right child is explored first.",
      "Empty the second stack into the answer. Its top is the first postorder value.",
    ],
    tests: [
      { input: { root: [1, null, 2, 3] }, expectedOutput: [3, 2, 1], visibility: "SAMPLE" },
      { input: { root: [1, 2, 3] }, expectedOutput: [2, 3, 1], visibility: "SAMPLE" },
      { input: { root: [] }, expectedOutput: [], visibility: "HIDDEN" },
      { input: { root: [1] }, expectedOutput: [1], visibility: "HIDDEN" },
      { input: { root: [1, 2, 3, 4, 5, null, 6] }, expectedOutput: [4, 5, 2, 6, 3, 1], visibility: "HIDDEN" },
    ],
  }),
  problem({
    slug: "post-one-stack",
    title: "Postorder Traversal Using One Stack",
    difficulty: "EASY",
    topics: ["trees"],
    tags: ["stack"],
    statement: "Return the postorder traversal using one stack. A node is recorded only after both of its subtrees have been visited.",
    constraints: ["0 <= nodes <= 2000", "-10000 <= node value <= 10000"],
    examples: [
      { input: "root = [1, null, 2, 3]", output: "[3, 2, 1]" },
      { input: "root = [1, 2, 3]", output: "[2, 3, 1]" },
    ],
    signature: "vector<int> postorderOneStack(TreeNode* root)",
    functionName: "postorderOneStack",
    note: TREE_NOTE,
    driver: rootDriver(numbersOut("sol.postorderOneStack(root)")),
    method: `vector<int> postorderOneStack(TreeNode* root) {
        vector<int> out;
        stack<TreeNode*> pending;
        TreeNode* cur = root;
        TreeNode* last = nullptr;
        while (cur || !pending.empty()) {
            if (cur) { pending.push(cur); cur = cur->left; }
            else {
                auto* node = pending.top();
                if (node->right && last != node->right) cur = node->right;
                else {
                    out.push_back(node->val);
                    last = node;
                    pending.pop();
                }
            }
        }
        return out;
    }`,
    expectedTime: "O(n)",
    expectedSpace: "O(h)",
    hints: [
      "Walk left and push, as in iterative inorder. The difference is when you are allowed to pop.",
      "If the node on top still has an unvisited right child, go there instead of popping.",
      "Remember the last recorded node. It tells you that the right subtree is already done.",
      "Record and pop only when the right child is missing or was just finished. The root comes out last.",
    ],
    tests: [
      { input: { root: [1, null, 2, 3] }, expectedOutput: [3, 2, 1], visibility: "SAMPLE" },
      { input: { root: [1, 2, 3] }, expectedOutput: [2, 3, 1], visibility: "SAMPLE" },
      { input: { root: [] }, expectedOutput: [], visibility: "HIDDEN" },
      { input: { root: [1] }, expectedOutput: [1], visibility: "HIDDEN" },
      { input: { root: [1, 2, 3, 4, 5, null, 6] }, expectedOutput: [4, 5, 2, 6, 3, 1], visibility: "HIDDEN" },
    ],
  }),
  problem({
    slug: "triple-order",
    title: "Preorder, Inorder, and Postorder in One Traversal",
    difficulty: "EASY",
    topics: ["trees"],
    tags: ["stack"],
    statement: "Walk the tree once and return three lists: preorder, inorder, and postorder. The result is a list of those three lists, in that order.",
    constraints: ["0 <= nodes <= 2000", "-10000 <= node value <= 10000"],
    examples: [
      { input: "root = [1, 2, 3]", output: "[[1, 2, 3], [2, 1, 3], [2, 3, 1]]" },
      { input: "root = []", output: "[[], [], []]" },
    ],
    signature: "vector<vector<int>> tripleOrder(TreeNode* root)",
    functionName: "tripleOrder",
    note: TREE_NOTE,
    driver: rootDriver(rowsOut("sol.tripleOrder(root)")),
    method: `vector<vector<int>> tripleOrder(TreeNode* root) {
        vector<int> pre, inorder, post;
        stack<pair<TreeNode*, int>> pending;
        if (root) pending.push({root, 1});
        while (!pending.empty()) {
            auto [node, state] = pending.top(); pending.pop();
            if (state == 1) {
                pre.push_back(node->val);
                pending.push({node, 2});
                if (node->left) pending.push({node->left, 1});
            } else if (state == 2) {
                inorder.push_back(node->val);
                pending.push({node, 3});
                if (node->right) pending.push({node->right, 1});
            } else post.push_back(node->val);
        }
        return {pre, inorder, post};
    }`,
    expectedTime: "O(n)",
    expectedSpace: "O(h)",
    hints: [
      "Each node is seen three times: before the left subtree, between the children, and after the right subtree.",
      "Store the node with a state of 1, 2, or 3 on the stack.",
      "State 1 records preorder and schedules the left child. State 2 records inorder and schedules the right child. State 3 records postorder.",
      "Push the next state before the child, so the child is processed first. An empty tree returns three empty lists.",
    ],
    tests: [
      { input: { root: [1, 2, 3] }, expectedOutput: [[1, 2, 3], [2, 1, 3], [2, 3, 1]], visibility: "SAMPLE" },
      { input: { root: [] }, expectedOutput: [[], [], []], visibility: "SAMPLE" },
      { input: { root: [1] }, expectedOutput: [[1], [1], [1]], visibility: "HIDDEN" },
      { input: { root: [1, null, 2, 3] }, expectedOutput: [[1, 2, 3], [1, 3, 2], [3, 2, 1]], visibility: "HIDDEN" },
      { input: { root: [3, 9, 20, null, null, 15, 7] }, expectedOutput: [[3, 9, 20, 15, 7], [9, 3, 15, 20, 7], [9, 15, 7, 20, 3]], visibility: "HIDDEN" },
    ],
  }),
  problem({
    slug: "balanced-tree",
    title: "Balanced Binary Tree",
    difficulty: "MEDIUM",
    topics: ["trees"],
    tags: ["height"],
    statement: "A binary tree is balanced when, for every node, the heights of its left and right subtrees differ by at most 1. Height is the number of nodes on the longest downward path. Return whether the tree is balanced. An empty tree is balanced.",
    constraints: ["0 <= nodes <= 2000", "-10000 <= node value <= 10000"],
    examples: [
      { input: "root = [3, 9, 20, null, null, 15, 7]", output: "true" },
      { input: "root = [1, 2, 2, 3, 3, null, null, 4, 4]", output: "false" },
    ],
    signature: "bool balancedTree(TreeNode* root)",
    functionName: "balancedTree",
    note: TREE_NOTE,
    driver: rootDriver(`printJson(Json::boolean(sol.balancedTree(root)));`),
    method: `bool balancedTree(TreeNode* root) {
        function<int(TreeNode*)> height = [&](TreeNode* node) -> int {
            if (!node) return 0;
            int left = height(node->left), right = height(node->right);
            if (left < 0 || right < 0 || abs(left - right) > 1) return -1;
            return 1 + max(left, right);
        };
        return height(root) >= 0;
    }`,
    expectedTime: "O(n)",
    expectedSpace: "O(h)",
    hints: [
      "Balance is not only about the root. Every subtree has to pass the same test.",
      "The height of a node is 1 plus the taller child. A null child has height 0.",
      "Return a failure signal, such as -1, as soon as a subtree is unbalanced or the two heights differ by more than 1.",
      "One walk can compute the height and the verdict together. An empty tree succeeds.",
    ],
    tests: [
      { input: { root: [3, 9, 20, null, null, 15, 7] }, expectedOutput: true, visibility: "SAMPLE" },
      { input: { root: [1, 2, 2, 3, 3, null, null, 4, 4] }, expectedOutput: false, visibility: "SAMPLE" },
      { input: { root: [] }, expectedOutput: true, visibility: "HIDDEN" },
      { input: { root: [1] }, expectedOutput: true, visibility: "HIDDEN" },
      { input: { root: [1, 2, null, 3] }, expectedOutput: false, visibility: "HIDDEN" },
    ],
  }),
  problem({
    slug: "tree-diameter",
    title: "Diameter of Binary Tree",
    difficulty: "EASY",
    topics: ["trees"],
    tags: ["height"],
    statement: "The diameter is the number of edges on the longest path between any two nodes. The path may pass through the root or stay inside a subtree. Return the diameter. An empty tree has diameter 0.",
    constraints: ["0 <= nodes <= 2000", "-10000 <= node value <= 10000"],
    examples: [
      { input: "root = [1, 2, 3, 4, 5]", output: "3" },
      { input: "root = [1, 2]", output: "1" },
    ],
    signature: "int treeDiameter(TreeNode* root)",
    functionName: "treeDiameter",
    note: TREE_NOTE,
    driver: rootDriver(`printJson(Json::number(sol.treeDiameter(root)));`),
    method: `int treeDiameter(TreeNode* root) {
        int best = 0;
        function<int(TreeNode*)> height = [&](TreeNode* node) -> int {
            if (!node) return 0;
            int left = height(node->left), right = height(node->right);
            best = max(best, left + right);
            return 1 + max(left, right);
        };
        height(root);
        return best;
    }`,
    expectedTime: "O(n)",
    expectedSpace: "O(h)",
    hints: [
      "The longest path through a node is the left height plus the right height, measured in edges.",
      "Height in edges below a node is the same number as the node count of the taller child chain.",
      "While computing each height, keep the largest left-plus-right you have seen.",
      "A single node has diameter 0. The answer might live entirely in one subtree, so do not look only at the root.",
    ],
    tests: [
      { input: { root: [1, 2, 3, 4, 5] }, expectedOutput: 3, visibility: "SAMPLE" },
      { input: { root: [1, 2] }, expectedOutput: 1, visibility: "SAMPLE" },
      { input: { root: [] }, expectedOutput: 0, visibility: "HIDDEN" },
      { input: { root: [1] }, expectedOutput: 0, visibility: "HIDDEN" },
      { input: { root: [1, 2, 3, 4, 5, null, 6] }, expectedOutput: 4, visibility: "HIDDEN" },
    ],
  }),
  problem({
    slug: "max-path-sum",
    title: "Binary Tree Maximum Path Sum",
    difficulty: "MEDIUM",
    topics: ["trees"],
    tags: ["path"],
    statement: "A path is any sequence of nodes connected by edges, with no repeated node. The path does not have to pass through the root and does not have to touch a leaf. Return the largest sum of node values along any path. The tree contains at least one node.",
    constraints: ["1 <= nodes <= 2000", "-10000 <= node value <= 10000"],
    examples: [
      { input: "root = [-10, 9, 20, null, null, 15, 7]", output: "42", explanation: "The path 15, 20, 7 sums to 42." },
      { input: "root = [-3]", output: "-3" },
    ],
    signature: "int maxPathSum(TreeNode* root)",
    functionName: "maxPathSum",
    note: TREE_NOTE,
    driver: rootDriver(`printJson(Json::number(sol.maxPathSum(root)));`),
    method: `int maxPathSum(TreeNode* root) {
        long long best = LLONG_MIN;
        function<int(TreeNode*)> gain = [&](TreeNode* node) -> int {
            if (!node) return 0;
            int left = max(0, gain(node->left));
            int right = max(0, gain(node->right));
            best = max(best, (long long)node->val + left + right);
            return node->val + max(left, right);
        };
        gain(root);
        return (int)best;
    }`,
    expectedTime: "O(n)",
    expectedSpace: "O(h)",
    hints: [
      "At each node the best path that bends there uses the node plus the best downward gain from each side.",
      "A negative child gain should be ignored. Taking nothing is better than taking a loss.",
      "The value you return upward can include only one child. A parent cannot use both of your branches.",
      "Track the best bend separately from the gain you return. A single negative node is a valid path.",
    ],
    tests: [
      { input: { root: [-10, 9, 20, null, null, 15, 7] }, expectedOutput: 42, visibility: "SAMPLE" },
      { input: { root: [-3] }, expectedOutput: -3, visibility: "SAMPLE" },
      { input: { root: [1, 2, 3] }, expectedOutput: 6, visibility: "HIDDEN" },
      { input: { root: [2, -1] }, expectedOutput: 2, visibility: "HIDDEN" },
      { input: { root: [-2, -1] }, expectedOutput: -1, visibility: "HIDDEN" },
    ],
  }),
  problem({
    slug: "zigzag-levels",
    title: "Zig Zag Traversal",
    difficulty: "MEDIUM",
    topics: ["trees"],
    tags: ["bfs"],
    statement: "Return the levels of the tree from the root downward. Even levels, starting at level 0, are read left to right. Odd levels are read right to left. An empty tree produces no levels.",
    constraints: ["0 <= nodes <= 2000", "-10000 <= node value <= 10000"],
    examples: [
      { input: "root = [3, 9, 20, null, null, 15, 7]", output: "[[3], [20, 9], [15, 7]]" },
      { input: "root = [1, 2, 3]", output: "[[1], [3, 2]]" },
    ],
    signature: "vector<vector<int>> zigzagLevels(TreeNode* root)",
    functionName: "zigzagLevels",
    note: TREE_NOTE,
    driver: rootDriver(rowsOut("sol.zigzagLevels(root)")),
    method: `vector<vector<int>> zigzagLevels(TreeNode* root) {
        vector<vector<int>> out;
        if (!root) return out;
        queue<TreeNode*> pending;
        pending.push(root);
        bool reverseRow = false;
        while (!pending.empty()) {
            int size = (int)pending.size();
            vector<int> row;
            while (size--) {
                auto* node = pending.front(); pending.pop();
                row.push_back(node->val);
                if (node->left) pending.push(node->left);
                if (node->right) pending.push(node->right);
            }
            if (reverseRow) std::reverse(row.begin(), row.end());
            out.push_back(row);
            reverseRow = !reverseRow;
        }
        return out;
    }`,
    expectedTime: "O(n)",
    expectedSpace: "O(n)",
    hints: [
      "Collect each level left to right with a queue, the same way as level order.",
      "Reverse every other row after the row is complete. The root row stays left to right.",
      "Children are still enqueued left then right. Only the printed row flips.",
      "Toggling a boolean after each level keeps the direction. An empty tree returns no rows.",
    ],
    tests: [
      { input: { root: [3, 9, 20, null, null, 15, 7] }, expectedOutput: [[3], [20, 9], [15, 7]], visibility: "SAMPLE" },
      { input: { root: [1, 2, 3] }, expectedOutput: [[1], [3, 2]], visibility: "SAMPLE" },
      { input: { root: [] }, expectedOutput: [], visibility: "HIDDEN" },
      { input: { root: [1] }, expectedOutput: [[1]], visibility: "HIDDEN" },
      { input: { root: [1, 2, 3, 4, 5, null, 6] }, expectedOutput: [[1], [3, 2], [4, 5, 6]], visibility: "HIDDEN" },
    ],
  }),
  problem({
    slug: "tree-boundary",
    title: "Boundary Traversal",
    difficulty: "MEDIUM",
    topics: ["trees"],
    tags: ["traversal"],
    statement:
      "Return the anticlockwise boundary. Start with the left boundary from the root downward, excluding leaves. Then add every leaf from left to right. Then add the right boundary from the bottom upward, excluding the root and the leaves. A node is a leaf when it has no children. Do not repeat the root. An empty tree returns an empty list, and a single node returns that node.",
    constraints: ["0 <= nodes <= 2000", "-10000 <= node value <= 10000"],
    examples: [
      { input: "root = [1, 2, 3, 4, 5, 6, 7, null, null, 8, 9]", output: "[1, 2, 4, 8, 9, 6, 7, 3]" },
      { input: "root = [1, null, 2, 3]", output: "[1, 3, 2]" },
    ],
    signature: "vector<int> treeBoundary(TreeNode* root)",
    functionName: "treeBoundary",
    note: TREE_NOTE,
    driver: rootDriver(numbersOut("sol.treeBoundary(root)")),
    method: `vector<int> treeBoundary(TreeNode* root) {
        vector<int> out;
        if (!root) return out;
        auto leaf = [](TreeNode* node) { return node && !node->left && !node->right; };
        if (!leaf(root)) out.push_back(root->val);
        for (auto* node = root->left; node; node = node->left ? node->left : node->right)
            if (!leaf(node)) out.push_back(node->val);
        function<void(TreeNode*)> leaves = [&](TreeNode* node) {
            if (!node) return;
            if (!node->left && !node->right) { out.push_back(node->val); return; }
            leaves(node->left);
            leaves(node->right);
        };
        leaves(root);
        vector<int> right;
        for (auto* node = root->right; node; node = node->right ? node->right : node->left)
            if (!leaf(node)) right.push_back(node->val);
        for (int i = (int)right.size() - 1; i >= 0; i--) out.push_back(right[i]);
        return out;
    }`,
    expectedTime: "O(n)",
    expectedSpace: "O(h)",
    hints: [
      "Split the boundary into three pieces so the root and the leaves are not written twice.",
      "The left boundary prefers the left child and uses the right child only when the left is missing. Stop before a leaf.",
      "Leaves are a normal left-to-right walk. The right boundary prefers the right child and is reversed at the end.",
      "If the root is itself a leaf, the leaf walk is the only place it should appear.",
    ],
    tests: [
      { input: { root: [1, 2, 3, 4, 5, 6, 7, null, null, 8, 9] }, expectedOutput: [1, 2, 4, 8, 9, 6, 7, 3], visibility: "SAMPLE" },
      { input: { root: [1, null, 2, 3] }, expectedOutput: [1, 3, 2], visibility: "SAMPLE" },
      { input: { root: [1] }, expectedOutput: [1], visibility: "HIDDEN" },
      { input: { root: [] }, expectedOutput: [], visibility: "HIDDEN" },
      { input: { root: [1, 2, 3] }, expectedOutput: [1, 2, 3], visibility: "HIDDEN" },
    ],
  }),
  problem({
    slug: "vertical-order",
    title: "Vertical Order Traversal",
    difficulty: "MEDIUM",
    topics: ["trees"],
    tags: ["bfs"],
    statement:
      "Give the root column 0. A left child is one column to the left, and a right child is one column to the right. Return the columns from left to right. Inside a column, higher nodes come first. When two nodes share a row and a column, the smaller value comes first.",
    constraints: ["0 <= nodes <= 2000", "-10000 <= node value <= 10000"],
    examples: [
      { input: "root = [3, 9, 20, null, null, 15, 7]", output: "[[9], [3, 15], [20], [7]]" },
      { input: "root = [1, 2, 3, 4, 5, 6, 7]", output: "[[4], [2], [1, 5, 6], [3], [7]]" },
    ],
    signature: "vector<vector<int>> verticalOrder(TreeNode* root)",
    functionName: "verticalOrder",
    note: TREE_NOTE,
    driver: rootDriver(rowsOut("sol.verticalOrder(root)")),
    method: `vector<vector<int>> verticalOrder(TreeNode* root) {
        map<int, vector<pair<int, int>>> cols;
        function<void(TreeNode*, int, int)> walk = [&](TreeNode* node, int row, int col) {
            if (!node) return;
            cols[col].push_back({row, node->val});
            walk(node->left, row + 1, col - 1);
            walk(node->right, row + 1, col + 1);
        };
        walk(root, 0, 0);
        vector<vector<int>> out;
        for (auto& entry : cols) {
            auto cells = entry.second;
            sort(cells.begin(), cells.end());
            vector<int> row;
            for (auto cell : cells) row.push_back(cell.second);
            out.push_back(row);
        }
        return out;
    }`,
    expectedTime: "O(n log n)",
    expectedSpace: "O(n)",
    hints: [
      "A column index and a row index locate every node.",
      "Group nodes by column. A map keeps the columns sorted.",
      "Sort one column by row, and by value when the row is the same.",
      "An empty tree has no columns. A single node is one column containing that value.",
    ],
    tests: [
      { input: { root: [3, 9, 20, null, null, 15, 7] }, expectedOutput: [[9], [3, 15], [20], [7]], visibility: "SAMPLE" },
      { input: { root: [1, 2, 3, 4, 5, 6, 7] }, expectedOutput: [[4], [2], [1, 5, 6], [3], [7]], visibility: "SAMPLE" },
      { input: { root: [1] }, expectedOutput: [[1]], visibility: "HIDDEN" },
      { input: { root: [] }, expectedOutput: [], visibility: "HIDDEN" },
      { input: { root: [1, 2, 3, null, 4] }, expectedOutput: [[2], [1, 4], [3]], visibility: "HIDDEN" },
    ],
  }),
  problem({
    slug: "top-view",
    title: "Top View of Binary Tree",
    difficulty: "MEDIUM",
    topics: ["trees"],
    tags: ["bfs"],
    statement:
      "Looking from above, a column shows only its first node. The root is column 0, a left child moves one column left, and a right child moves one column right. Scan level by level, left to right, and keep the first value you meet in each column. Return those values from the leftmost column to the rightmost.",
    constraints: ["0 <= nodes <= 2000", "-10000 <= node value <= 10000"],
    examples: [
      { input: "root = [1, 2, 3, 4, 5, 6, 7]", output: "[4, 2, 1, 3, 7]" },
      { input: "root = [1, 2, 3, null, 4]", output: "[2, 1, 3]" },
    ],
    signature: "vector<int> topView(TreeNode* root)",
    functionName: "topView",
    note: TREE_NOTE,
    driver: rootDriver(numbersOut("sol.topView(root)")),
    method: `vector<int> topView(TreeNode* root) {
        vector<int> out;
        if (!root) return out;
        map<int, int> seen;
        queue<pair<TreeNode*, int>> pending;
        pending.push({root, 0});
        while (!pending.empty()) {
            auto [node, col] = pending.front(); pending.pop();
            if (!seen.count(col)) seen[col] = node->val;
            if (node->left) pending.push({node->left, col - 1});
            if (node->right) pending.push({node->right, col + 1});
        }
        for (auto& entry : seen) out.push_back(entry.second);
        return out;
    }`,
    expectedTime: "O(n log n)",
    expectedSpace: "O(n)",
    hints: [
      "Level order meets the upper node of a column before a node hidden below it.",
      "Carry the column index in the queue.",
      "Record a column only the first time you see it.",
      "A sorted map emits the columns from left to right. An empty tree returns nothing.",
    ],
    tests: [
      { input: { root: [1, 2, 3, 4, 5, 6, 7] }, expectedOutput: [4, 2, 1, 3, 7], visibility: "SAMPLE" },
      { input: { root: [1, 2, 3, null, 4] }, expectedOutput: [2, 1, 3], visibility: "SAMPLE" },
      { input: { root: [1] }, expectedOutput: [1], visibility: "HIDDEN" },
      { input: { root: [] }, expectedOutput: [], visibility: "HIDDEN" },
      { input: { root: [1, 2, 3, null, 4, null, null, null, 5] }, expectedOutput: [2, 1, 3], visibility: "HIDDEN" },
    ],
  }),
  problem({
    slug: "bottom-view",
    title: "Bottom View of Binary Tree",
    difficulty: "MEDIUM",
    topics: ["trees"],
    tags: ["bfs"],
    statement:
      "Looking from below, a column shows its lowest node. The root is column 0. A left child moves one column left and a right child moves one column right. Scan level by level from left to right, and let a later node replace an earlier node in the same column. Return the surviving values from the leftmost column to the rightmost.",
    constraints: ["0 <= nodes <= 2000", "-10000 <= node value <= 10000"],
    examples: [
      { input: "root = [1, 2, 3, 4, 5, 6, 7]", output: "[4, 2, 6, 3, 7]" },
      { input: "root = [20, 8, 22, 5, 3, null, 25, null, null, 10, 14]", output: "[5, 10, 3, 14, 25]" },
    ],
    signature: "vector<int> bottomView(TreeNode* root)",
    functionName: "bottomView",
    note: TREE_NOTE,
    driver: rootDriver(numbersOut("sol.bottomView(root)")),
    method: `vector<int> bottomView(TreeNode* root) {
        vector<int> out;
        if (!root) return out;
        map<int, int> seen;
        queue<pair<TreeNode*, int>> pending;
        pending.push({root, 0});
        while (!pending.empty()) {
            auto [node, col] = pending.front(); pending.pop();
            seen[col] = node->val;
            if (node->left) pending.push({node->left, col - 1});
            if (node->right) pending.push({node->right, col + 1});
        }
        for (auto& entry : seen) out.push_back(entry.second);
        return out;
    }`,
    expectedTime: "O(n log n)",
    expectedSpace: "O(n)",
    hints: [
      "This is the top view with the opposite update rule.",
      "Carry the column in a level-order queue.",
      "Always overwrite the column. A deeper node, or a node further right on the same level, replaces what was there.",
      "Read the map from the smallest column to the largest when the scan ends.",
    ],
    tests: [
      { input: { root: [1, 2, 3, 4, 5, 6, 7] }, expectedOutput: [4, 2, 6, 3, 7], visibility: "SAMPLE" },
      { input: { root: [20, 8, 22, 5, 3, null, 25, null, null, 10, 14] }, expectedOutput: [5, 10, 3, 14, 25], visibility: "SAMPLE" },
      { input: { root: [1] }, expectedOutput: [1], visibility: "HIDDEN" },
      { input: { root: [] }, expectedOutput: [], visibility: "HIDDEN" },
      { input: { root: [1, 2, 3] }, expectedOutput: [2, 1, 3], visibility: "HIDDEN" },
    ],
  }),
  problem({
    slug: "right-view",
    title: "Right View of Binary Tree",
    difficulty: "MEDIUM",
    topics: ["trees"],
    tags: ["bfs"],
    statement: "Return the rightmost node of each level, from the root downward. An empty tree returns an empty list.",
    constraints: ["0 <= nodes <= 2000", "-10000 <= node value <= 10000"],
    examples: [
      { input: "root = [1, 2, 3, null, 5, null, 4]", output: "[1, 3, 4]" },
      { input: "root = [1, 2, 3, 4]", output: "[1, 3, 4]" },
    ],
    signature: "vector<int> rightView(TreeNode* root)",
    functionName: "rightView",
    note: TREE_NOTE,
    driver: rootDriver(numbersOut("sol.rightView(root)")),
    method: `vector<int> rightView(TreeNode* root) {
        vector<int> out;
        if (!root) return out;
        queue<TreeNode*> pending;
        pending.push(root);
        while (!pending.empty()) {
            int size = (int)pending.size();
            for (int i = 0; i < size; i++) {
                auto* node = pending.front(); pending.pop();
                if (i == size - 1) out.push_back(node->val);
                if (node->left) pending.push(node->left);
                if (node->right) pending.push(node->right);
            }
        }
        return out;
    }`,
    expectedTime: "O(n)",
    expectedSpace: "O(n)",
    hints: [
      "The right view is one value per level.",
      "A level-order queue already holds a level from left to right.",
      "Keep the last node you pop while draining one level.",
      "Enqueue existing children for the next level. An empty tree contributes no levels.",
    ],
    tests: [
      { input: { root: [1, 2, 3, null, 5, null, 4] }, expectedOutput: [1, 3, 4], visibility: "SAMPLE" },
      { input: { root: [1, 2, 3, 4] }, expectedOutput: [1, 3, 4], visibility: "SAMPLE" },
      { input: { root: [] }, expectedOutput: [], visibility: "HIDDEN" },
      { input: { root: [1] }, expectedOutput: [1], visibility: "HIDDEN" },
      { input: { root: [1, 2] }, expectedOutput: [1, 2], visibility: "HIDDEN" },
    ],
  }),
  problem({
    slug: "left-view",
    title: "Left View of Binary Tree",
    difficulty: "MEDIUM",
    topics: ["trees"],
    tags: ["bfs"],
    statement: "Return the leftmost node of each level, from the root downward. An empty tree returns an empty list.",
    constraints: ["0 <= nodes <= 2000", "-10000 <= node value <= 10000"],
    examples: [
      { input: "root = [1, 2, 3, null, 5, null, 4]", output: "[1, 2, 5]" },
      { input: "root = [1, 2, 3, 4]", output: "[1, 2, 4]" },
    ],
    signature: "vector<int> leftView(TreeNode* root)",
    functionName: "leftView",
    note: TREE_NOTE,
    driver: rootDriver(numbersOut("sol.leftView(root)")),
    method: `vector<int> leftView(TreeNode* root) {
        vector<int> out;
        if (!root) return out;
        queue<TreeNode*> pending;
        pending.push(root);
        while (!pending.empty()) {
            int size = (int)pending.size();
            for (int i = 0; i < size; i++) {
                auto* node = pending.front(); pending.pop();
                if (i == 0) out.push_back(node->val);
                if (node->left) pending.push(node->left);
                if (node->right) pending.push(node->right);
            }
        }
        return out;
    }`,
    expectedTime: "O(n)",
    expectedSpace: "O(n)",
    hints: [
      "The left view is the first node of every level.",
      "Drain one level at a time from a queue.",
      "Record a node only when it is the first node of that level.",
      "Children still go into the queue left then right, so the next level starts at its leftmost node.",
    ],
    tests: [
      { input: { root: [1, 2, 3, null, 5, null, 4] }, expectedOutput: [1, 2, 5], visibility: "SAMPLE" },
      { input: { root: [1, 2, 3, 4] }, expectedOutput: [1, 2, 4], visibility: "SAMPLE" },
      { input: { root: [] }, expectedOutput: [], visibility: "HIDDEN" },
      { input: { root: [1] }, expectedOutput: [1], visibility: "HIDDEN" },
      { input: { root: [1, null, 2] }, expectedOutput: [1, 2], visibility: "HIDDEN" },
    ],
  }),
  problem({
    slug: "symmetric-tree",
    title: "Symmetric Binary Tree",
    difficulty: "MEDIUM",
    topics: ["trees"],
    tags: ["recursion"],
    statement: "A tree is symmetric when its left subtree is a mirror of its right subtree. Values and missing children must mirror each other. Return whether the tree is symmetric. An empty tree is symmetric.",
    constraints: ["0 <= nodes <= 2000", "-10000 <= node value <= 10000"],
    examples: [
      { input: "root = [1, 2, 2, 3, 4, 4, 3]", output: "true" },
      { input: "root = [1, 2, 2, null, 3, null, 3]", output: "false" },
    ],
    signature: "bool symmetricTree(TreeNode* root)",
    functionName: "symmetricTree",
    note: TREE_NOTE,
    driver: rootDriver(`printJson(Json::boolean(sol.symmetricTree(root)));`),
    method: `bool symmetricTree(TreeNode* root) {
        function<bool(TreeNode*, TreeNode*)> mirror = [&](TreeNode* a, TreeNode* b) -> bool {
            if (!a || !b) return a == b;
            return a->val == b->val && mirror(a->left, b->right) && mirror(a->right, b->left);
        };
        return !root || mirror(root->left, root->right);
    }`,
    expectedTime: "O(n)",
    expectedSpace: "O(h)",
    hints: [
      "Compare the left child of one side with the right child of the other side.",
      "Two missing nodes match. A node does not match a missing node.",
      "After the values match, check the outer pair and the inner pair.",
      "The root itself has no partner. An empty tree and a single node are symmetric.",
    ],
    tests: [
      { input: { root: [1, 2, 2, 3, 4, 4, 3] }, expectedOutput: true, visibility: "SAMPLE" },
      { input: { root: [1, 2, 2, null, 3, null, 3] }, expectedOutput: false, visibility: "SAMPLE" },
      { input: { root: [] }, expectedOutput: true, visibility: "HIDDEN" },
      { input: { root: [1] }, expectedOutput: true, visibility: "HIDDEN" },
      { input: { root: [1, 2, 2] }, expectedOutput: true, visibility: "HIDDEN" },
    ],
  }),
  problem({
    slug: "root-paths",
    title: "Root to Leaf Paths",
    difficulty: "MEDIUM",
    topics: ["trees"],
    tags: ["dfs"],
    statement: "Return every path from the root to a leaf. A leaf has no children. Visit the left subtree before the right subtree, and list the paths in that order. Each path is the list of values from the root down to that leaf.",
    constraints: ["0 <= nodes <= 2000", "-10000 <= node value <= 10000"],
    examples: [
      { input: "root = [1, 2, 3, null, 5]", output: "[[1, 2, 5], [1, 3]]" },
      { input: "root = [1]", output: "[[1]]" },
    ],
    signature: "vector<vector<int>> rootPaths(TreeNode* root)",
    functionName: "rootPaths",
    note: TREE_NOTE,
    driver: rootDriver(rowsOut("sol.rootPaths(root)")),
    method: `vector<vector<int>> rootPaths(TreeNode* root) {
        vector<vector<int>> out;
        vector<int> cur;
        function<void(TreeNode*)> walk = [&](TreeNode* node) {
            if (!node) return;
            cur.push_back(node->val);
            if (!node->left && !node->right) out.push_back(cur);
            walk(node->left);
            walk(node->right);
            cur.pop_back();
        };
        walk(root);
        return out;
    }`,
    expectedTime: "O(n^2)",
    expectedSpace: "O(n)",
    hints: [
      "Carry the path taken so far while you walk downward.",
      "A leaf is the moment to copy the current path into the answer.",
      "Pop the node after both children return, so the sibling sees the path without it.",
      "Go left before right. An empty tree has no paths. A single node has one path.",
    ],
    tests: [
      { input: { root: [1, 2, 3, null, 5] }, expectedOutput: [[1, 2, 5], [1, 3]], visibility: "SAMPLE" },
      { input: { root: [1] }, expectedOutput: [[1]], visibility: "SAMPLE" },
      { input: { root: [] }, expectedOutput: [], visibility: "HIDDEN" },
      { input: { root: [1, 2] }, expectedOutput: [[1, 2]], visibility: "HIDDEN" },
      { input: { root: [1, 2, 3] }, expectedOutput: [[1, 2], [1, 3]], visibility: "HIDDEN" },
    ],
  }),
  problem({
    slug: "lowest-ancestor",
    title: "Lowest Common Ancestor of a Binary Tree",
    difficulty: "HARD",
    topics: ["trees"],
    tags: ["recursion"],
    statement: "Node values are unique, and both p and q appear in the tree. Return the value of their lowest common ancestor. A node may be an ancestor of itself.",
    constraints: ["1 <= nodes <= 2000", "Node values are unique and from -10000 to 10000.", "p and q are values in the tree."],
    examples: [
      { input: "root = [3, 5, 1, 6, 2, 0, 8, null, null, 7, 4], p = 5, q = 1", output: "3" },
      { input: "root = [3, 5, 1, 6, 2, 0, 8, null, null, 7, 4], p = 5, q = 4", output: "5" },
    ],
    signature: "int lowestAncestor(TreeNode* root, int p, int q)",
    functionName: "lowestAncestor",
    note: TREE_NOTE,
    driver: rootDriver(`printJson(Json::number(sol.lowestAncestor(root, (int)in["p"].asInt(), (int)in["q"].asInt())));`),
    method: `int lowestAncestor(TreeNode* root, int p, int q) {
        function<TreeNode*(TreeNode*)> search = [&](TreeNode* node) -> TreeNode* {
            if (!node || node->val == p || node->val == q) return node;
            auto* left = search(node->left);
            auto* right = search(node->right);
            if (left && right) return node;
            return left ? left : right;
        };
        return search(root)->val;
    }`,
    expectedTime: "O(n)",
    expectedSpace: "O(h)",
    hints: [
      "If the two targets fall in different child subtrees, the current node is their meeting point.",
      "A search that finds a target should return that node and stop going deeper.",
      "If only one side finds a target, that side's result is the answer, because the other target is inside it or the current node is the target.",
      "The returned node can be p or q. Do not require a strict parent.",
    ],
    tests: [
      { input: { root: [3, 5, 1, 6, 2, 0, 8, null, null, 7, 4], p: 5, q: 1 }, expectedOutput: 3, visibility: "SAMPLE" },
      { input: { root: [3, 5, 1, 6, 2, 0, 8, null, null, 7, 4], p: 5, q: 4 }, expectedOutput: 5, visibility: "SAMPLE" },
      { input: { root: [3, 5, 1, 6, 2, 0, 8, null, null, 7, 4], p: 6, q: 4 }, expectedOutput: 5, visibility: "HIDDEN" },
      { input: { root: [1, 2], p: 1, q: 2 }, expectedOutput: 1, visibility: "HIDDEN" },
      { input: { root: [1], p: 1, q: 1 }, expectedOutput: 1, visibility: "HIDDEN" },
    ],
  }),
  problem({
    slug: "max-width",
    title: "Maximum Width of Binary Tree",
    difficulty: "MEDIUM",
    topics: ["trees"],
    tags: ["bfs"],
    statement:
      "Number the positions on each level as if missing nodes still occupied a slot. The root is position 0, the left child of position i is 2i, and the right child is 2i+1. The width of a level is the last occupied position minus the first occupied position, plus 1. Return the largest width. An empty tree has width 0.",
    constraints: ["0 <= nodes <= 2000", "-10000 <= node value <= 10000"],
    examples: [
      { input: "root = [1, 3, 2, 5, 3, null, 9]", output: "4" },
      { input: "root = [1, 3, null, 5, 3]", output: "2" },
    ],
    signature: "int maxWidth(TreeNode* root)",
    functionName: "maxWidth",
    note: TREE_NOTE,
    driver: rootDriver(`printJson(Json::number(sol.maxWidth(root)));`),
    method: `int maxWidth(TreeNode* root) {
        if (!root) return 0;
        queue<pair<TreeNode*, long long>> pending;
        pending.push({root, 0});
        long long best = 0;
        while (!pending.empty()) {
            int size = (int)pending.size();
            long long origin = pending.front().second;
            long long right = 0;
            for (int i = 0; i < size; i++) {
                auto [node, index] = pending.front(); pending.pop();
                index -= origin;
                right = index;
                if (node->left) pending.push({node->left, index * 2});
                if (node->right) pending.push({node->right, index * 2 + 1});
            }
            best = max(best, right + 1);
        }
        return (int)best;
    }`,
    expectedTime: "O(n)",
    expectedSpace: "O(n)",
    hints: [
      "The width counts the gaps between the end nodes of a level, not only the nodes that exist.",
      "Heap indexing gives those positions. Subtract the first index of a level so the numbers stay small.",
      "The width is the normalized index of the last node in the level, plus 1.",
      "Push children with twice the normalized parent index. A single node has width 1.",
    ],
    tests: [
      { input: { root: [1, 3, 2, 5, 3, null, 9] }, expectedOutput: 4, visibility: "SAMPLE" },
      { input: { root: [1, 3, null, 5, 3] }, expectedOutput: 2, visibility: "SAMPLE" },
      { input: { root: [1] }, expectedOutput: 1, visibility: "HIDDEN" },
      { input: { root: [] }, expectedOutput: 0, visibility: "HIDDEN" },
      { input: { root: [1, 3, 2, 5] }, expectedOutput: 2, visibility: "HIDDEN" },
    ],
  }),
  problem({
    slug: "children-sum",
    title: "Children Sum Property",
    difficulty: "MEDIUM",
    topics: ["trees"],
    tags: ["tree"],
    statement:
      "Change the tree so every parent equals the sum of its children. You may only increase a value, never decrease it. When a parent is larger than its children, add the whole difference to the left child if it exists, otherwise to the right child. Then fix both subtrees. After they return, set the parent to the sum of the children it has. Leaves stay as they are. Return the changed tree in level order.",
    constraints: ["0 <= nodes <= 2000", "-10000 <= node value <= 10000"],
    examples: [
      { input: "root = [50, 7, 2, 3, 5, null, 30]", output: "[85, 55, 30, 50, 5, null, 30]" },
      { input: "root = [10, 4]", output: "[10, 10]" },
    ],
    signature: "TreeNode* childrenSum(TreeNode* root)",
    functionName: "childrenSum",
    note: TREE_NOTE,
    driver: treeOut('sol.childrenSum(buildTree(in["root"]))'),
    method: `TreeNode* childrenSum(TreeNode* root) {
        function<void(TreeNode*)> fix = [&](TreeNode* node) {
            if (!node || (!node->left && !node->right)) return;
            int child = (node->left ? node->left->val : 0) + (node->right ? node->right->val : 0);
            if (child >= node->val) node->val = child;
            else if (node->left) node->left->val = node->val;
            else node->right->val = node->val;
            fix(node->left);
            fix(node->right);
            node->val = (node->left ? node->left->val : 0) + (node->right ? node->right->val : 0);
        };
        fix(root);
        return root;
    }`,
    expectedTime: "O(n)",
    expectedSpace: "O(h)",
    hints: [
      "A parent that is too small can be raised to the current sum of its children before you go deeper.",
      "A parent that is too large must push that extra amount into one child. Use the left child when it exists.",
      "After both children have been fixed, the parent has to be set again, because the children may have grown.",
      "A leaf has nothing to match. An empty tree stays empty.",
    ],
    tests: [
      { input: { root: [50, 7, 2, 3, 5, null, 30] }, expectedOutput: [85, 55, 30, 50, 5, null, 30], visibility: "SAMPLE" },
      { input: { root: [10, 4] }, expectedOutput: [10, 10], visibility: "SAMPLE" },
      { input: { root: [1] }, expectedOutput: [1], visibility: "HIDDEN" },
      { input: { root: [] }, expectedOutput: [], visibility: "HIDDEN" },
      { input: { root: [2, 35, 10, 2, 3, null, 5] }, expectedOutput: [48, 38, 10, 35, 3, null, 10], visibility: "HIDDEN" },
    ],
  }),
  problem({
    slug: "nodes-at-k",
    title: "All Nodes Distance K in Binary Tree",
    difficulty: "HARD",
    topics: ["trees"],
    tags: ["graph"],
    statement: "Node values are unique. target is the value of one node. Return every value at distance k from that node. Distance counts edges and may travel through a parent. The order of the answer does not matter.",
    constraints: ["1 <= nodes <= 2000", "Node values are unique.", "target is a value in the tree.", "0 <= k <= 2000"],
    examples: [
      { input: "root = [3, 5, 1, 6, 2, 0, 8, null, null, 7, 4], target = 5, k = 2", output: "[1, 4, 7]" },
      { input: "root = [3, 5, 1, 6, 2, 0, 8, null, null, 7, 4], target = 5, k = 0", output: "[5]" },
    ],
    signature: "vector<int> nodesAtK(TreeNode* root, int target, int k)",
    functionName: "nodesAtK",
    note: TREE_NOTE,
    compareMode: "UNORDERED",
    driver: rootDriver(numbersOut('sol.nodesAtK(root, (int)in["target"].asInt(), (int)in["k"].asInt())')),
    method: `vector<int> nodesAtK(TreeNode* root, int target, int k) {
        unordered_map<TreeNode*, TreeNode*> parent;
        TreeNode* start = nullptr;
        function<void(TreeNode*, TreeNode*)> mark = [&](TreeNode* node, TreeNode* par) {
            if (!node) return;
            parent[node] = par;
            if (node->val == target) start = node;
            mark(node->left, node);
            mark(node->right, node);
        };
        mark(root, nullptr);
        vector<int> out;
        queue<pair<TreeNode*, int>> pending;
        unordered_set<TreeNode*> seen;
        pending.push({start, 0});
        seen.insert(start);
        while (!pending.empty()) {
            auto [node, dist] = pending.front(); pending.pop();
            if (dist == k) { out.push_back(node->val); continue; }
            for (auto* next : {node->left, node->right, parent[node]}) {
                if (next && !seen.count(next)) {
                    seen.insert(next);
                    pending.push({next, dist + 1});
                }
            }
        }
        return out;
    }`,
    expectedTime: "O(n)",
    expectedSpace: "O(n)",
    hints: [
      "The parent link is the missing edge. Record it before you search.",
      "Find the target while you build the parent links.",
      "Breadth-first search from the target, moving to the left child, the right child, and the parent.",
      "Stop a branch when the distance reaches k, and mark nodes so you do not walk back. Distance 0 returns the target.",
    ],
    tests: [
      { input: { root: [3, 5, 1, 6, 2, 0, 8, null, null, 7, 4], target: 5, k: 2 }, expectedOutput: [1, 4, 7], visibility: "SAMPLE" },
      { input: { root: [3, 5, 1, 6, 2, 0, 8, null, null, 7, 4], target: 5, k: 0 }, expectedOutput: [5], visibility: "SAMPLE" },
      { input: { root: [1, 2, 3], target: 1, k: 1 }, expectedOutput: [2, 3], visibility: "HIDDEN" },
      { input: { root: [1], target: 1, k: 2 }, expectedOutput: [], visibility: "HIDDEN" },
      { input: { root: [1, 2, 3], target: 2, k: 2 }, expectedOutput: [3], visibility: "HIDDEN" },
    ],
  }),
  problem({
    slug: "burn-tree",
    title: "Minimum Time to Burn Binary Tree",
    difficulty: "HARD",
    topics: ["trees"],
    tags: ["graph"],
    statement: "Fire starts at the node whose value is target. Values are unique. In one minute the fire spreads from every burning node to its parent and its children. Return how many minutes pass until every node is burning. A tree of one node takes 0 minutes.",
    constraints: ["1 <= nodes <= 2000", "Node values are unique.", "target is a value in the tree."],
    examples: [
      { input: "root = [1, 2, 3, 4, null, 5, 6], target = 2", output: "3" },
      { input: "root = [1], target = 1", output: "0" },
    ],
    signature: "int burnTree(TreeNode* root, int target)",
    functionName: "burnTree",
    note: TREE_NOTE,
    driver: rootDriver(`printJson(Json::number(sol.burnTree(root, (int)in["target"].asInt())));`),
    method: `int burnTree(TreeNode* root, int target) {
        unordered_map<TreeNode*, TreeNode*> parent;
        TreeNode* start = nullptr;
        function<void(TreeNode*, TreeNode*)> mark = [&](TreeNode* node, TreeNode* par) {
            if (!node) return;
            parent[node] = par;
            if (node->val == target) start = node;
            mark(node->left, node);
            mark(node->right, node);
        };
        mark(root, nullptr);
        queue<pair<TreeNode*, int>> pending;
        unordered_set<TreeNode*> seen;
        pending.push({start, 0});
        seen.insert(start);
        int far = 0;
        while (!pending.empty()) {
            auto [node, dist] = pending.front(); pending.pop();
            far = max(far, dist);
            for (auto* next : {node->left, node->right, parent[node]}) {
                if (next && !seen.count(next)) {
                    seen.insert(next);
                    pending.push({next, dist + 1});
                }
            }
        }
        return far;
    }`,
    expectedTime: "O(n)",
    expectedSpace: "O(n)",
    hints: [
      "The time is the distance from the start node to the farthest node, once parent edges exist.",
      "Record each parent, and remember the node whose value is the target.",
      "Search outward from the target through children and the parent.",
      "The answer is the largest distance reached. The start node itself is distance 0.",
    ],
    tests: [
      { input: { root: [1, 2, 3, 4, null, 5, 6], target: 2 }, expectedOutput: 3, visibility: "SAMPLE" },
      { input: { root: [1], target: 1 }, expectedOutput: 0, visibility: "SAMPLE" },
      { input: { root: [1, 2, 3], target: 1 }, expectedOutput: 1, visibility: "HIDDEN" },
      { input: { root: [3, 5, 1, 6, 2, 0, 8, null, null, 7, 4], target: 5 }, expectedOutput: 3, visibility: "HIDDEN" },
      { input: { root: [1, 2], target: 2 }, expectedOutput: 1, visibility: "HIDDEN" },
    ],
  }),
  problem({
    slug: "count-complete",
    title: "Count Complete Tree Nodes",
    difficulty: "EASY",
    topics: ["trees"],
    tags: ["binary-search"],
    statement:
      "The tree is complete: every level except the last is full, and the last level is filled from the left. Return how many nodes it contains. An empty tree contains 0.",
    constraints: ["The tree is complete.", "0 <= nodes <= 2000", "-10000 <= node value <= 10000"],
    examples: [
      { input: "root = [1, 2, 3, 4, 5, 6]", output: "6" },
      { input: "root = []", output: "0" },
    ],
    signature: "int countComplete(TreeNode* root)",
    functionName: "countComplete",
    note: TREE_NOTE,
    driver: rootDriver(`printJson(Json::number(sol.countComplete(root)));`),
    method: `int countComplete(TreeNode* root) {
        if (!root) return 0;
        int left = 0, right = 0;
        for (auto* node = root; node; node = node->left) left++;
        for (auto* node = root; node; node = node->right) right++;
        if (left == right) return (int)((1LL << left) - 1);
        return 1 + countComplete(root->left) + countComplete(root->right);
    }`,
    expectedTime: "O(log n * log n)",
    expectedSpace: "O(log n)",
    hints: [
      "A complete tree whose leftmost and rightmost heights match is perfect, so its size is a power of two minus one.",
      "Measure height by walking only the left spine and only the right spine.",
      "When the heights differ, the node itself counts as one and the two subtrees are smaller complete trees.",
      "Do not visit every node once the heights match. An empty tree is zero.",
    ],
    tests: [
      { input: { root: [1, 2, 3, 4, 5, 6] }, expectedOutput: 6, visibility: "SAMPLE" },
      { input: { root: [] }, expectedOutput: 0, visibility: "SAMPLE" },
      { input: { root: [1] }, expectedOutput: 1, visibility: "HIDDEN" },
      { input: { root: [1, 2, 3, 4, 5] }, expectedOutput: 5, visibility: "HIDDEN" },
      { input: { root: [1, 2, 3, 4, 5, 6, 7] }, expectedOutput: 7, visibility: "HIDDEN" },
    ],
  }),
  problem({
    slug: "build-pre-in",
    title: "Construct Binary Tree from Preorder and Inorder Traversal",
    difficulty: "HARD",
    topics: ["trees"],
    tags: ["tree"],
    statement: "preorder and inorder are traversals of the same binary tree. Values are unique. Rebuild the tree and return it in level order, with null only where a missing child sits between existing nodes.",
    constraints: ["0 <= preorder.length == inorder.length <= 2000", "Values are unique and from -10000 to 10000.", "Both arrays contain the same values."],
    examples: [
      { input: "preorder = [3, 9, 20, 15, 7], inorder = [9, 3, 15, 20, 7]", output: "[3, 9, 20, null, null, 15, 7]" },
      { input: "preorder = [1, 2], inorder = [2, 1]", output: "[1, 2]" },
    ],
    signature: "TreeNode* buildPreIn(vector<int>& preorder, vector<int>& inorder)",
    functionName: "buildPreIn",
    note: TREE_NOTE,
    driver: `auto preorder = in["preorder"].asIntVector();\n    auto inorder = in["inorder"].asIntVector();\n    ${treeOut("sol.buildPreIn(preorder, inorder)")}`,
    method: `TreeNode* buildPreIn(vector<int>& preorder, vector<int>& inorder) {
        unordered_map<int, int> index;
        for (int i = 0; i < (int)inorder.size(); i++) index[inorder[i]] = i;
        function<TreeNode*(int, int, int, int)> build = [&](int pl, int pr, int il, int ir) -> TreeNode* {
            if (pl > pr) return nullptr;
            auto* node = new TreeNode(preorder[pl]);
            int mid = index[preorder[pl]];
            int left = mid - il;
            node->left = build(pl + 1, pl + left, il, mid - 1);
            node->right = build(pl + left + 1, pr, mid + 1, ir);
            return node;
        };
        if (preorder.empty()) return nullptr;
        return build(0, (int)preorder.size() - 1, 0, (int)inorder.size() - 1);
    }`,
    expectedTime: "O(n)",
    expectedSpace: "O(n)",
    hints: [
      "The first preorder value is the root. Find that value in the inorder list.",
      "Values left of the root in inorder form the left subtree. Values to the right form the right subtree.",
      "The left subtree occupies the next left-count positions of preorder.",
      "A map from value to inorder index avoids a linear search. Two empty arrays build an empty tree.",
    ],
    tests: [
      { input: { preorder: [3, 9, 20, 15, 7], inorder: [9, 3, 15, 20, 7] }, expectedOutput: [3, 9, 20, null, null, 15, 7], visibility: "SAMPLE" },
      { input: { preorder: [1, 2], inorder: [2, 1] }, expectedOutput: [1, 2], visibility: "SAMPLE" },
      { input: { preorder: [], inorder: [] }, expectedOutput: [], visibility: "HIDDEN" },
      { input: { preorder: [1], inorder: [1] }, expectedOutput: [1], visibility: "HIDDEN" },
      { input: { preorder: [1, 2, 3], inorder: [2, 1, 3] }, expectedOutput: [1, 2, 3], visibility: "HIDDEN" },
    ],
  }),
  problem({
    slug: "build-post-in",
    title: "Construct Binary Tree from Postorder and Inorder Traversal",
    difficulty: "HARD",
    topics: ["trees"],
    tags: ["tree"],
    statement: "postorder and inorder are traversals of the same binary tree. Values are unique. Rebuild the tree and return it in level order.",
    constraints: ["0 <= postorder.length == inorder.length <= 2000", "Values are unique and from -10000 to 10000.", "Both arrays contain the same values."],
    examples: [
      { input: "postorder = [9, 15, 7, 20, 3], inorder = [9, 3, 15, 20, 7]", output: "[3, 9, 20, null, null, 15, 7]" },
      { input: "postorder = [2, 1], inorder = [2, 1]", output: "[1, 2]" },
    ],
    signature: "TreeNode* buildPostIn(vector<int>& postorder, vector<int>& inorder)",
    functionName: "buildPostIn",
    note: TREE_NOTE,
    driver: `auto postorder = in["postorder"].asIntVector();\n    auto inorder = in["inorder"].asIntVector();\n    ${treeOut("sol.buildPostIn(postorder, inorder)")}`,
    method: `TreeNode* buildPostIn(vector<int>& postorder, vector<int>& inorder) {
        unordered_map<int, int> index;
        for (int i = 0; i < (int)inorder.size(); i++) index[inorder[i]] = i;
        function<TreeNode*(int, int, int, int)> build = [&](int pl, int pr, int il, int ir) -> TreeNode* {
            if (pl > pr) return nullptr;
            auto* node = new TreeNode(postorder[pr]);
            int mid = index[postorder[pr]];
            int left = mid - il;
            node->left = build(pl, pl + left - 1, il, mid - 1);
            node->right = build(pl + left, pr - 1, mid + 1, ir);
            return node;
        };
        if (postorder.empty()) return nullptr;
        return build(0, (int)postorder.size() - 1, 0, (int)inorder.size() - 1);
    }`,
    expectedTime: "O(n)",
    expectedSpace: "O(n)",
    hints: [
      "The last postorder value is the root. Its inorder index splits the two sides.",
      "The left subtree is the inorder prefix before the root, and it occupies that many values at the front of postorder.",
      "The right subtree is what remains before the root in postorder.",
      "Build the ranges with indexes instead of copying the arrays. Empty input builds an empty tree.",
    ],
    tests: [
      { input: { postorder: [9, 15, 7, 20, 3], inorder: [9, 3, 15, 20, 7] }, expectedOutput: [3, 9, 20, null, null, 15, 7], visibility: "SAMPLE" },
      { input: { postorder: [2, 1], inorder: [2, 1] }, expectedOutput: [1, 2], visibility: "SAMPLE" },
      { input: { postorder: [], inorder: [] }, expectedOutput: [], visibility: "HIDDEN" },
      { input: { postorder: [1], inorder: [1] }, expectedOutput: [1], visibility: "HIDDEN" },
      { input: { postorder: [2, 3, 1], inorder: [2, 1, 3] }, expectedOutput: [1, 2, 3], visibility: "HIDDEN" },
    ],
  }),
  problem({
    slug: "serialize-tree",
    title: "Serialize Binary Tree",
    difficulty: "HARD",
    topics: ["trees"],
    tags: ["tree"],
    statement:
      'Encode the tree as a level-order string. Separate values with commas and write a missing child as null. Omit trailing nulls. An empty tree is the empty string. For example, [1, 2] becomes "1,2" and [3, 9, 20, null, null, 15, 7] becomes "3,9,20,null,null,15,7".',
    constraints: ["0 <= nodes <= 2000", "-10000 <= node value <= 10000"],
    examples: [
      { input: "root = [3, 9, 20, null, null, 15, 7]", output: '"3,9,20,null,null,15,7"' },
      { input: "root = []", output: '""' },
    ],
    signature: "string serializeTree(TreeNode* root)",
    functionName: "serializeTree",
    note: TREE_NOTE,
    driver: rootDriver(`printJson(Json::text(sol.serializeTree(root)));`),
    method: `string serializeTree(TreeNode* root) {
        if (!root) return "";
        queue<TreeNode*> pending;
        pending.push(root);
        vector<string> parts;
        while (!pending.empty()) {
            auto* node = pending.front(); pending.pop();
            if (!node) parts.push_back("null");
            else {
                parts.push_back(to_string(node->val));
                pending.push(node->left);
                pending.push(node->right);
            }
        }
        while (!parts.empty() && parts.back() == "null") parts.pop_back();
        string out;
        for (int i = 0; i < (int)parts.size(); i++) {
            if (i) out.push_back(',');
            out += parts[i];
        }
        return out;
    }`,
    expectedTime: "O(n)",
    expectedSpace: "O(n)",
    hints: [
      "Level order already lists children in the order a decoder expects.",
      "Write null when a child is missing, because a later child may still exist.",
      "Join the tokens with commas and no spaces.",
      "Drop null tokens from the end. An empty tree is an empty string, and a single node is just its number.",
    ],
    tests: [
      { input: { root: [3, 9, 20, null, null, 15, 7] }, expectedOutput: "3,9,20,null,null,15,7", visibility: "SAMPLE" },
      { input: { root: [] }, expectedOutput: "", visibility: "SAMPLE" },
      { input: { root: [1] }, expectedOutput: "1", visibility: "HIDDEN" },
      { input: { root: [1, 2] }, expectedOutput: "1,2", visibility: "HIDDEN" },
      { input: { root: [1, null, 2] }, expectedOutput: "1,null,2", visibility: "HIDDEN" },
    ],
  }),
  problem({
    slug: "deserialize-tree",
    title: "Deserialize Binary Tree",
    difficulty: "HARD",
    topics: ["trees"],
    tags: ["tree"],
    statement:
      'data is a level-order encoding. Values are separated by commas, a missing child is null, and trailing nulls are omitted. The empty string is an empty tree. Rebuild the tree and return it in level order.',
    constraints: ["data is empty or a comma-separated level-order encoding of at most 2000 entries.", "Values are integers from -10000 to 10000."],
    examples: [
      { input: 'data = "3,9,20,null,null,15,7"', output: "[3, 9, 20, null, null, 15, 7]" },
      { input: 'data = ""', output: "[]" },
    ],
    signature: "TreeNode* deserializeTree(string data)",
    functionName: "deserializeTree",
    note: TREE_NOTE,
    driver: treeOut('sol.deserializeTree(in["data"].asString())'),
    method: `TreeNode* deserializeTree(string data) {
        if (data.empty()) return nullptr;
        vector<string> parts;
        string token;
        stringstream ss(data);
        while (getline(ss, token, ',')) parts.push_back(token);
        auto* root = new TreeNode(stoi(parts[0]));
        queue<TreeNode*> pending;
        pending.push(root);
        int i = 1;
        while (!pending.empty() && i < (int)parts.size()) {
            auto* node = pending.front(); pending.pop();
            if (parts[i] != "null") {
                node->left = new TreeNode(stoi(parts[i]));
                pending.push(node->left);
            }
            i++;
            if (i < (int)parts.size() && parts[i] != "null") {
                node->right = new TreeNode(stoi(parts[i]));
                pending.push(node->right);
            }
            if (i < (int)parts.size()) i++;
        }
        return root;
    }`,
    expectedTime: "O(n)",
    expectedSpace: "O(n)",
    hints: [
      "Split on commas first. The first token is the root, and it is never null unless the string is empty.",
      "A queue of parents waits for the next one or two child tokens.",
      "A null token means that child is missing and has no children of its own.",
      "Stop when the tokens run out. The omitted trailing nulls are simply absent children.",
    ],
    tests: [
      { input: { data: "3,9,20,null,null,15,7" }, expectedOutput: [3, 9, 20, null, null, 15, 7], visibility: "SAMPLE" },
      { input: { data: "" }, expectedOutput: [], visibility: "SAMPLE" },
      { input: { data: "1" }, expectedOutput: [1], visibility: "HIDDEN" },
      { input: { data: "1,2" }, expectedOutput: [1, 2], visibility: "HIDDEN" },
      { input: { data: "1,null,2" }, expectedOutput: [1, null, 2], visibility: "HIDDEN" },
    ],
  }),
  problem({
    slug: "morris-preorder",
    title: "Morris Preorder Traversal",
    difficulty: "HARD",
    topics: ["trees"],
    tags: ["morris"],
    statement: "Return the preorder traversal without a stack and without recursion. Temporary right-child threads may point back to ancestors, and the tree must be restored before you finish.",
    constraints: ["0 <= nodes <= 2000", "-10000 <= node value <= 10000"],
    examples: [
      { input: "root = [1, null, 2, 3]", output: "[1, 2, 3]" },
      { input: "root = [1, 2, 3]", output: "[1, 2, 3]" },
    ],
    signature: "vector<int> morrisPreorder(TreeNode* root)",
    functionName: "morrisPreorder",
    note: TREE_NOTE,
    driver: rootDriver(numbersOut("sol.morrisPreorder(root)")),
    method: `vector<int> morrisPreorder(TreeNode* root) {
        vector<int> out;
        auto* cur = root;
        while (cur) {
            if (!cur->left) {
                out.push_back(cur->val);
                cur = cur->right;
            } else {
                auto* pred = cur->left;
                while (pred->right && pred->right != cur) pred = pred->right;
                if (!pred->right) {
                    out.push_back(cur->val);
                    pred->right = cur;
                    cur = cur->left;
                } else {
                    pred->right = nullptr;
                    cur = cur->right;
                }
            }
        }
        return out;
    }`,
    expectedTime: "O(n)",
    expectedSpace: "O(1)",
    hints: [
      "The predecessor of a node is the rightmost node in its left subtree.",
      "If that predecessor has no right child, record the current node, thread the predecessor back to it, and descend left.",
      "If the thread already exists, remove it and move right. The node was recorded when the thread was created.",
      "A node with no left child is recorded and then followed to the right. Every thread is cleared before the walk ends.",
    ],
    tests: [
      { input: { root: [1, null, 2, 3] }, expectedOutput: [1, 2, 3], visibility: "SAMPLE" },
      { input: { root: [1, 2, 3] }, expectedOutput: [1, 2, 3], visibility: "SAMPLE" },
      { input: { root: [] }, expectedOutput: [], visibility: "HIDDEN" },
      { input: { root: [1] }, expectedOutput: [1], visibility: "HIDDEN" },
      { input: { root: [3, 9, 20, null, null, 15, 7] }, expectedOutput: [3, 9, 20, 15, 7], visibility: "HIDDEN" },
    ],
  }),
  problem({
    slug: "morris-inorder",
    title: "Morris Inorder Traversal",
    difficulty: "HARD",
    topics: ["trees"],
    tags: ["morris"],
    statement: "Return the inorder traversal without a stack and without recursion. Temporary threads must be removed so the original children are restored.",
    constraints: ["0 <= nodes <= 2000", "-10000 <= node value <= 10000"],
    examples: [
      { input: "root = [1, null, 2, 3]", output: "[1, 3, 2]" },
      { input: "root = [1, 2, 3]", output: "[2, 1, 3]" },
    ],
    signature: "vector<int> morrisInorder(TreeNode* root)",
    functionName: "morrisInorder",
    note: TREE_NOTE,
    driver: rootDriver(numbersOut("sol.morrisInorder(root)")),
    method: `vector<int> morrisInorder(TreeNode* root) {
        vector<int> out;
        auto* cur = root;
        while (cur) {
            if (!cur->left) {
                out.push_back(cur->val);
                cur = cur->right;
            } else {
                auto* pred = cur->left;
                while (pred->right && pred->right != cur) pred = pred->right;
                if (!pred->right) {
                    pred->right = cur;
                    cur = cur->left;
                } else {
                    pred->right = nullptr;
                    out.push_back(cur->val);
                    cur = cur->right;
                }
            }
        }
        return out;
    }`,
    expectedTime: "O(n)",
    expectedSpace: "O(1)",
    hints: [
      "Inorder records a node after its left subtree, so the thread is created before the node is recorded.",
      "Find the predecessor in the left subtree. An empty right child means the left side is new: install a thread and go left.",
      "A thread that already points at the current node means the left side is finished. Remove the thread, record the node, and go right.",
      "A node with no left child is recorded immediately. Restoring every thread leaves the tree unchanged.",
    ],
    tests: [
      { input: { root: [1, null, 2, 3] }, expectedOutput: [1, 3, 2], visibility: "SAMPLE" },
      { input: { root: [1, 2, 3] }, expectedOutput: [2, 1, 3], visibility: "SAMPLE" },
      { input: { root: [] }, expectedOutput: [], visibility: "HIDDEN" },
      { input: { root: [1] }, expectedOutput: [1], visibility: "HIDDEN" },
      { input: { root: [3, 9, 20, null, null, 15, 7] }, expectedOutput: [9, 3, 15, 20, 7], visibility: "HIDDEN" },
    ],
  }),
  problem({
    slug: "flatten-tree",
    title: "Flatten Binary Tree to Linked List",
    difficulty: "MEDIUM",
    topics: ["trees"],
    tags: ["tree"],
    statement: "Rearrange the tree into a right spine that follows preorder. Every left child becomes null, and the next preorder node becomes the right child. Return the rearranged tree in level order.",
    constraints: ["0 <= nodes <= 2000", "-10000 <= node value <= 10000"],
    examples: [
      { input: "root = [1, 2, 5, 3, 4, null, 6]", output: "[1, null, 2, null, 3, null, 4, null, 5, null, 6]" },
      { input: "root = [0]", output: "[0]" },
    ],
    signature: "TreeNode* flattenTree(TreeNode* root)",
    functionName: "flattenTree",
    note: TREE_NOTE,
    driver: treeOut('sol.flattenTree(buildTree(in["root"]))'),
    method: `TreeNode* flattenTree(TreeNode* root) {
        TreeNode* prev = nullptr;
        function<void(TreeNode*)> walk = [&](TreeNode* node) {
            if (!node) return;
            TreeNode* left = node->left;
            TreeNode* right = node->right;
            if (prev) prev->right = node;
            node->left = nullptr;
            prev = node;
            walk(left);
            walk(right);
        };
        walk(root);
        return root;
    }`,
    expectedTime: "O(n)",
    expectedSpace: "O(h)",
    hints: [
      "Preorder is the order of the finished spine.",
      "Save both children before you change the pointers.",
      "The previous node in preorder should point right at the current node, and the current left child should become null.",
      "Then continue into the saved left child and the saved right child. An empty tree stays empty.",
    ],
    tests: [
      { input: { root: [1, 2, 5, 3, 4, null, 6] }, expectedOutput: [1, null, 2, null, 3, null, 4, null, 5, null, 6], visibility: "SAMPLE" },
      { input: { root: [0] }, expectedOutput: [0], visibility: "SAMPLE" },
      { input: { root: [] }, expectedOutput: [], visibility: "HIDDEN" },
      { input: { root: [1, 2, 3] }, expectedOutput: [1, null, 2, null, 3], visibility: "HIDDEN" },
      { input: { root: [1, null, 2] }, expectedOutput: [1, null, 2], visibility: "HIDDEN" },
    ],
  }),
];
