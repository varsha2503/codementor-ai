import { TREE_NOTE, problem } from "./helpers.js";

const numbersOut = (call: string) =>
  `auto values = ${call};\n    Json out;\n    out.type = Json::ARR;\n    for (long long value : values) out.a.push_back(Json::number(value));\n    printJson(out);`;

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

export const bstProblems = [
  problem({
    slug: "search-bst",
    title: "Search in a Binary Search Tree",
    difficulty: "EASY",
    topics: ["binary-search-trees"],
    tags: ["bst"],
    statement:
      "The tree is a binary search tree: every left value is smaller than its parent and every right value is larger. Return the subtree whose root equals key, in level order. Return an empty list when key is absent.",
    constraints: ["The tree is a binary search tree.", "0 <= nodes <= 2000", "0 <= node value, key <= 10000"],
    examples: [
      { input: "root = [8, 4, 12, 2, 6, 10, 14], key = 12", output: "[12, 10, 14]" },
      { input: "root = [8, 4, 12, 2, 6, 10, 14], key = 7", output: "[]" },
    ],
    signature: "TreeNode* searchBst(TreeNode* root, int key)",
    functionName: "searchBst",
    note: TREE_NOTE,
    driver: treeOut('sol.searchBst(buildTree(in["root"]), (int)in["key"].asInt())'),
    method: `TreeNode* searchBst(TreeNode* root, int key) {
        while (root && root->val != key) root = key < root->val ? root->left : root->right;
        return root;
    }`,
    expectedTime: "O(h)",
    expectedSpace: "O(1)",
    hints: [
      "A search tree tells you which child can still hold the key.",
      "Go left when the key is smaller and right when it is larger.",
      "Stop when the current value matches or the child you need is missing.",
      "Return that node, not a rewritten copy. A missing key returns an empty tree.",
    ],
    tests: [
      { input: { root: [8, 4, 12, 2, 6, 10, 14], key: 12 }, expectedOutput: [12, 10, 14], visibility: "SAMPLE" },
      { input: { root: [8, 4, 12, 2, 6, 10, 14], key: 7 }, expectedOutput: [], visibility: "SAMPLE" },
      { input: { root: [8, 4, 12, 2, 6, 10, 14], key: 6 }, expectedOutput: [6], visibility: "HIDDEN" },
      { input: { root: [8, 4, 12, 2, 6, 10, 14], key: 8 }, expectedOutput: [8, 4, 12, 2, 6, 10, 14], visibility: "HIDDEN" },
      { input: { root: [], key: 1 }, expectedOutput: [], visibility: "HIDDEN" },
    ],
  }),
  problem({
    slug: "bst-minmax",
    title: "Find Min and Max in BST",
    difficulty: "EASY",
    topics: ["binary-search-trees"],
    tags: ["bst"],
    statement: "The tree is a nonempty binary search tree. Return [minimum, maximum]. The minimum is the leftmost value and the maximum is the rightmost value.",
    constraints: ["The tree is a nonempty binary search tree.", "1 <= nodes <= 2000", "0 <= node value <= 10000"],
    examples: [
      { input: "root = [8, 4, 12, 2, 6, 10, 14]", output: "[2, 14]" },
      { input: "root = [1]", output: "[1, 1]" },
    ],
    signature: "vector<int> bstMinMax(TreeNode* root)",
    functionName: "bstMinMax",
    note: TREE_NOTE,
    driver: `auto root = buildTree(in["root"]);\n    ${numbersOut("sol.bstMinMax(root)")}`,
    method: `vector<int> bstMinMax(TreeNode* root) {
        auto* low = root;
        auto* high = root;
        while (low->left) low = low->left;
        while (high->right) high = high->right;
        return {low->val, high->val};
    }`,
    expectedTime: "O(h)",
    expectedSpace: "O(1)",
    hints: [
      "In a search tree the smallest value has no left child, and the largest has no right child.",
      "You do not need to visit the rest of the tree.",
      "Walk left from the root for the minimum and right from the root for the maximum.",
      "A single node is both answers.",
    ],
    tests: [
      { input: { root: [8, 4, 12, 2, 6, 10, 14] }, expectedOutput: [2, 14], visibility: "SAMPLE" },
      { input: { root: [1] }, expectedOutput: [1, 1], visibility: "SAMPLE" },
      { input: { root: [2, 1, 3] }, expectedOutput: [1, 3], visibility: "HIDDEN" },
      { input: { root: [5, null, 7] }, expectedOutput: [5, 7], visibility: "HIDDEN" },
      { input: { root: [4, 2, 7, 1, 3] }, expectedOutput: [1, 7], visibility: "HIDDEN" },
    ],
  }),
  problem({
    slug: "floor-ceil-bst",
    title: "Floor and Ceil in a BST",
    difficulty: "EASY",
    topics: ["binary-search-trees"],
    tags: ["bst"],
    statement:
      "The tree is a binary search tree. The floor of key is the greatest value less than or equal to key. The ceil is the smallest value greater than or equal to key. Return [floor, ceil]. Use -1 when a side does not exist.",
    constraints: ["The tree is a binary search tree.", "0 <= nodes <= 2000", "0 <= node value, key <= 10000"],
    examples: [
      { input: "root = [8, 4, 12, 2, 6, 10, 14], key = 5", output: "[4, 6]" },
      { input: "root = [8, 4, 12, 2, 6, 10, 14], key = 1", output: "[-1, 2]" },
    ],
    signature: "vector<int> floorCeilBst(TreeNode* root, int key)",
    functionName: "floorCeilBst",
    note: TREE_NOTE,
    driver: `auto root = buildTree(in["root"]);\n    ${numbersOut('sol.floorCeilBst(root, (int)in["key"].asInt())')}`,
    method: `vector<int> floorCeilBst(TreeNode* root, int key) {
        int floor = -1, ceil = -1;
        while (root) {
            if (root->val == key) return {key, key};
            if (root->val < key) { floor = root->val; root = root->right; }
            else { ceil = root->val; root = root->left; }
        }
        return {floor, ceil};
    }`,
    expectedTime: "O(h)",
    expectedSpace: "O(1)",
    hints: [
      "One walk can remember the best floor and the best ceil seen so far.",
      "A node smaller than the key is a floor candidate. Anything better must be in its right subtree.",
      "A node larger than the key is a ceil candidate. Anything better must be in its left subtree.",
      "An exact match is both the floor and the ceil. If the walk ends without a candidate, that side is -1.",
    ],
    tests: [
      { input: { root: [8, 4, 12, 2, 6, 10, 14], key: 5 }, expectedOutput: [4, 6], visibility: "SAMPLE" },
      { input: { root: [8, 4, 12, 2, 6, 10, 14], key: 1 }, expectedOutput: [-1, 2], visibility: "SAMPLE" },
      { input: { root: [8, 4, 12, 2, 6, 10, 14], key: 8 }, expectedOutput: [8, 8], visibility: "HIDDEN" },
      { input: { root: [8, 4, 12, 2, 6, 10, 14], key: 15 }, expectedOutput: [14, -1], visibility: "HIDDEN" },
      { input: { root: [], key: 3 }, expectedOutput: [-1, -1], visibility: "HIDDEN" },
    ],
  }),
  problem({
    slug: "floor-bst",
    title: "Floor in a BST",
    difficulty: "EASY",
    topics: ["binary-search-trees"],
    tags: ["bst"],
    statement:
      "The tree is a binary search tree. Return the greatest value that is less than or equal to key. Return -1 when every value is greater than key.",
    constraints: ["The tree is a binary search tree.", "0 <= nodes <= 2000", "0 <= node value, key <= 10000"],
    examples: [
      { input: "root = [8, 4, 12, 2, 6, 10, 14], key = 5", output: "4" },
      { input: "root = [8, 4, 12, 2, 6, 10, 14], key = 1", output: "-1" },
    ],
    signature: "int floorBst(TreeNode* root, int key)",
    functionName: "floorBst",
    note: TREE_NOTE,
    driver: `printJson(Json::number(sol.floorBst(buildTree(in["root"]), (int)in["key"].asInt())));`,
    method: `int floorBst(TreeNode* root, int key) {
        int floor = -1;
        while (root) {
            if (root->val == key) return key;
            if (root->val < key) { floor = root->val; root = root->right; }
            else root = root->left;
        }
        return floor;
    }`,
    expectedTime: "O(h)",
    expectedSpace: "O(1)",
    hints: [
      "The floor is the closest value that does not pass the key.",
      "When the current node is too big, the floor cannot be in its right subtree.",
      "When the current node is smaller than the key, keep it as a candidate and look right for a closer one.",
      "An equal node is the answer immediately. If no candidate appears, return -1.",
    ],
    tests: [
      { input: { root: [8, 4, 12, 2, 6, 10, 14], key: 5 }, expectedOutput: 4, visibility: "SAMPLE" },
      { input: { root: [8, 4, 12, 2, 6, 10, 14], key: 1 }, expectedOutput: -1, visibility: "SAMPLE" },
      { input: { root: [8, 4, 12, 2, 6, 10, 14], key: 14 }, expectedOutput: 14, visibility: "HIDDEN" },
      { input: { root: [8, 4, 12, 2, 6, 10, 14], key: 8 }, expectedOutput: 8, visibility: "HIDDEN" },
      { input: { root: [], key: 0 }, expectedOutput: -1, visibility: "HIDDEN" },
    ],
  }),
  problem({
    slug: "insert-bst",
    title: "Insert into a BST",
    difficulty: "MEDIUM",
    topics: ["binary-search-trees"],
    tags: ["bst"],
    statement:
      "The tree is a binary search tree. Insert key if it is not already present. A smaller key becomes a left child and a larger key becomes a right child, at the first missing position on that search path. If key is already present, leave the tree unchanged. Return the tree in level order.",
    constraints: ["The tree is a binary search tree.", "0 <= nodes <= 2000", "0 <= node value, key <= 10000"],
    examples: [
      { input: "root = [8, 4, 12, 2, 6, 10, 14], key = 9", output: "[8, 4, 12, 2, 6, 10, 14, null, null, null, null, 9]" },
      { input: "root = [], key = 5", output: "[5]" },
    ],
    signature: "TreeNode* insertBst(TreeNode* root, int key)",
    functionName: "insertBst",
    note: TREE_NOTE,
    driver: treeOut('sol.insertBst(buildTree(in["root"]), (int)in["key"].asInt())'),
    method: `TreeNode* insertBst(TreeNode* root, int key) {
        if (!root) return new TreeNode(key);
        auto* cur = root;
        while (true) {
            if (key == cur->val) return root;
            if (key < cur->val) {
                if (!cur->left) { cur->left = new TreeNode(key); return root; }
                cur = cur->left;
            } else {
                if (!cur->right) { cur->right = new TreeNode(key); return root; }
                cur = cur->right;
            }
        }
    }`,
    expectedTime: "O(h)",
    expectedSpace: "O(1)",
    hints: [
      "Search for the key. The insertion point is the missing child where the search falls off.",
      "Equal values are not inserted again.",
      "A smaller key follows the left child. A larger key follows the right child.",
      "An empty tree becomes a single node. Return the original root after attaching the new leaf.",
    ],
    tests: [
      { input: { root: [8, 4, 12, 2, 6, 10, 14], key: 9 }, expectedOutput: [8, 4, 12, 2, 6, 10, 14, null, null, null, null, 9], visibility: "SAMPLE" },
      { input: { root: [], key: 5 }, expectedOutput: [5], visibility: "SAMPLE" },
      { input: { root: [8, 4, 12, 2, 6, 10, 14], key: 4 }, expectedOutput: [8, 4, 12, 2, 6, 10, 14], visibility: "HIDDEN" },
      { input: { root: [4, 2, 7], key: 5 }, expectedOutput: [4, 2, 7, null, null, 5], visibility: "HIDDEN" },
      { input: { root: [2], key: 1 }, expectedOutput: [2, 1], visibility: "HIDDEN" },
    ],
  }),
  problem({
    slug: "delete-bst",
    title: "Delete Node in a BST",
    difficulty: "MEDIUM",
    topics: ["binary-search-trees"],
    tags: ["bst"],
    statement:
      "The tree is a binary search tree. Delete key if it is present and return the tree in level order. A missing key leaves the tree unchanged. A leaf is removed. A node with one child is replaced by that child. A node with two children is replaced by its inorder successor, the smallest value in its right subtree, and that successor is then removed.",
    constraints: ["The tree is a binary search tree.", "0 <= nodes <= 2000", "0 <= node value, key <= 10000"],
    examples: [
      { input: "root = [8, 4, 12, 2, 6, 10, 14], key = 4", output: "[8, 6, 12, 2, null, 10, 14]" },
      { input: "root = [8, 4, 12, 2, 6, 10, 14], key = 2", output: "[8, 4, 12, null, 6, 10, 14]" },
    ],
    signature: "TreeNode* deleteBst(TreeNode* root, int key)",
    functionName: "deleteBst",
    note: TREE_NOTE,
    driver: treeOut('sol.deleteBst(buildTree(in["root"]), (int)in["key"].asInt())'),
    method: `TreeNode* deleteBst(TreeNode* root, int key) {
        if (!root) return nullptr;
        if (key < root->val) root->left = deleteBst(root->left, key);
        else if (key > root->val) root->right = deleteBst(root->right, key);
        else {
            if (!root->left) return root->right;
            if (!root->right) return root->left;
            auto* succ = root->right;
            while (succ->left) succ = succ->left;
            root->val = succ->val;
            root->right = deleteBst(root->right, succ->val);
        }
        return root;
    }`,
    expectedTime: "O(h)",
    expectedSpace: "O(h)",
    hints: [
      "Search for the key first. The shape of the deletion depends on how many children that node has.",
      "Zero children removes the node. One child links the parent to that child.",
      "Two children: copy the smallest value of the right subtree into this node, then delete that successor from the right subtree.",
      "The successor has no left child, so its own deletion is the easy case. A missing key returns the same tree.",
    ],
    tests: [
      { input: { root: [8, 4, 12, 2, 6, 10, 14], key: 4 }, expectedOutput: [8, 6, 12, 2, null, 10, 14], visibility: "SAMPLE" },
      { input: { root: [8, 4, 12, 2, 6, 10, 14], key: 2 }, expectedOutput: [8, 4, 12, null, 6, 10, 14], visibility: "SAMPLE" },
      { input: { root: [8, 4, 12, 2, 6, 10, 14], key: 99 }, expectedOutput: [8, 4, 12, 2, 6, 10, 14], visibility: "HIDDEN" },
      { input: { root: [5], key: 5 }, expectedOutput: [], visibility: "HIDDEN" },
      { input: { root: [2, 1, 3], key: 2 }, expectedOutput: [3, 1], visibility: "HIDDEN" },
    ],
  }),
  problem({
    slug: "kth-bst",
    title: "Kth Smallest and Largest in BST",
    difficulty: "MEDIUM",
    topics: ["binary-search-trees"],
    tags: ["bst"],
    statement:
      "The tree is a nonempty binary search tree. k is counted from 1. Return [kth smallest, kth largest]. The inorder sequence is the sorted order of the values.",
    constraints: ["The tree is a nonempty binary search tree.", "1 <= k <= nodes <= 2000", "0 <= node value <= 10000"],
    examples: [
      { input: "root = [8, 4, 12, 2, 6, 10, 14], k = 1", output: "[2, 14]" },
      { input: "root = [8, 4, 12, 2, 6, 10, 14], k = 3", output: "[6, 10]" },
    ],
    signature: "vector<int> kthBst(TreeNode* root, int k)",
    functionName: "kthBst",
    note: TREE_NOTE,
    driver: `auto root = buildTree(in["root"]);\n    ${numbersOut('sol.kthBst(root, (int)in["k"].asInt())')}`,
    method: `vector<int> kthBst(TreeNode* root, int k) {
        vector<int> order;
        function<void(TreeNode*)> walk = [&](TreeNode* node) {
            if (!node) return;
            walk(node->left);
            order.push_back(node->val);
            walk(node->right);
        };
        walk(root);
        return {order[k - 1], order[(int)order.size() - k]};
    }`,
    expectedTime: "O(n)",
    expectedSpace: "O(n)",
    hints: [
      "Inorder of a search tree is sorted, so rank is a position in that sequence.",
      "The kth smallest is index k-1. The kth largest is the same distance from the end.",
      "You can stop the inorder walk once you have enough values for the smaller rank, then read the larger rank from the other end if you kept the whole list.",
      "k is at least 1 and at most the number of nodes. A one-node tree with k = 1 returns that value twice.",
    ],
    tests: [
      { input: { root: [8, 4, 12, 2, 6, 10, 14], k: 1 }, expectedOutput: [2, 14], visibility: "SAMPLE" },
      { input: { root: [8, 4, 12, 2, 6, 10, 14], k: 3 }, expectedOutput: [6, 10], visibility: "SAMPLE" },
      { input: { root: [8, 4, 12, 2, 6, 10, 14], k: 7 }, expectedOutput: [14, 2], visibility: "HIDDEN" },
      { input: { root: [1], k: 1 }, expectedOutput: [1, 1], visibility: "HIDDEN" },
      { input: { root: [2, 1, 3], k: 2 }, expectedOutput: [2, 2], visibility: "HIDDEN" },
    ],
  }),
  problem({
    slug: "valid-bst",
    title: "Validate Binary Search Tree",
    difficulty: "MEDIUM",
    topics: ["binary-search-trees"],
    tags: ["bst"],
    statement:
      "Return whether the binary tree is a binary search tree. Every value in a left subtree must be strictly smaller than the node, and every value in a right subtree must be strictly larger. An empty tree is valid. Equal values are not allowed.",
    constraints: ["0 <= nodes <= 2000", "-10000 <= node value <= 10000"],
    examples: [
      { input: "root = [2, 1, 3]", output: "true" },
      { input: "root = [5, 1, 4, null, null, 3, 6]", output: "false" },
    ],
    signature: "bool validBst(TreeNode* root)",
    functionName: "validBst",
    note: TREE_NOTE,
    driver: `printJson(Json::boolean(sol.validBst(buildTree(in["root"]))));`,
    method: `bool validBst(TreeNode* root) {
        function<bool(TreeNode*, long long, long long)> ok = [&](TreeNode* node, long long low, long long high) -> bool {
            if (!node) return true;
            if (node->val <= low || node->val >= high) return false;
            return ok(node->left, low, node->val) && ok(node->right, node->val, high);
        };
        return ok(root, LLONG_MIN, LLONG_MAX);
    }`,
    expectedTime: "O(n)",
    expectedSpace: "O(h)",
    hints: [
      "Checking only the two children is not enough. A grandchild can break a bound set by an ancestor.",
      "Carry an exclusive lower bound and an exclusive upper bound down the walk.",
      "A left child tightens the upper bound to the parent. A right child tightens the lower bound to the parent.",
      "A null node is valid. A value that is not strictly inside its bounds fails the tree.",
    ],
    tests: [
      { input: { root: [2, 1, 3] }, expectedOutput: true, visibility: "SAMPLE" },
      { input: { root: [5, 1, 4, null, null, 3, 6] }, expectedOutput: false, visibility: "SAMPLE" },
      { input: { root: [8, 4, 12, 2, 6, 10, 14] }, expectedOutput: true, visibility: "HIDDEN" },
      { input: { root: [] }, expectedOutput: true, visibility: "HIDDEN" },
      { input: { root: [5, 4, 6, null, null, 3, 7] }, expectedOutput: false, visibility: "HIDDEN" },
    ],
  }),
  problem({
    slug: "lca-bst",
    title: "Lowest Common Ancestor of a Binary Search Tree",
    difficulty: "MEDIUM",
    topics: ["binary-search-trees"],
    tags: ["bst"],
    statement:
      "The tree is a binary search tree and both p and q are values in it. Return their lowest common ancestor. A node can be an ancestor of itself. Use the search-tree order instead of searching both subtrees.",
    constraints: ["The tree is a nonempty binary search tree.", "p and q are values in the tree.", "0 <= node value <= 10000"],
    examples: [
      { input: "root = [6, 2, 8, 0, 4, 7, 9, null, null, 3, 5], p = 2, q = 8", output: "6" },
      { input: "root = [6, 2, 8, 0, 4, 7, 9, null, null, 3, 5], p = 2, q = 4", output: "2" },
    ],
    signature: "int lcaBst(TreeNode* root, int p, int q)",
    functionName: "lcaBst",
    note: TREE_NOTE,
    driver: `printJson(Json::number(sol.lcaBst(buildTree(in["root"]), (int)in["p"].asInt(), (int)in["q"].asInt())));`,
    method: `int lcaBst(TreeNode* root, int p, int q) {
        while (root) {
            if (p < root->val && q < root->val) root = root->left;
            else if (p > root->val && q > root->val) root = root->right;
            else return root->val;
        }
        return -1;
    }`,
    expectedTime: "O(h)",
    expectedSpace: "O(1)",
    hints: [
      "If both targets are smaller than the current node, their meeting point is in the left subtree.",
      "If both are larger, it is in the right subtree.",
      "The first node that is between them, or equal to one of them, is the ancestor.",
      "You never need to explore the other side. A target can be the answer when the other target is inside its subtree.",
    ],
    tests: [
      { input: { root: [6, 2, 8, 0, 4, 7, 9, null, null, 3, 5], p: 2, q: 8 }, expectedOutput: 6, visibility: "SAMPLE" },
      { input: { root: [6, 2, 8, 0, 4, 7, 9, null, null, 3, 5], p: 2, q: 4 }, expectedOutput: 2, visibility: "SAMPLE" },
      { input: { root: [6, 2, 8, 0, 4, 7, 9, null, null, 3, 5], p: 0, q: 5 }, expectedOutput: 2, visibility: "HIDDEN" },
      { input: { root: [6, 2, 8, 0, 4, 7, 9, null, null, 3, 5], p: 7, q: 9 }, expectedOutput: 8, visibility: "HIDDEN" },
      { input: { root: [2, 1, 3], p: 1, q: 1 }, expectedOutput: 1, visibility: "HIDDEN" },
    ],
  }),
  problem({
    slug: "bst-preorder",
    title: "Construct BST from Preorder Traversal",
    difficulty: "MEDIUM",
    topics: ["binary-search-trees"],
    tags: ["bst"],
    statement:
      "preorder is the preorder traversal of a binary search tree with unique values. Rebuild that tree and return it in level order. The first value is the root. Later values belong to the left subtree while they stay smaller than the root, and then to the right subtree.",
    constraints: ["0 <= preorder.length <= 2000", "Values are unique and from 0 to 10000.", "preorder is a valid binary-search-tree preorder."],
    examples: [
      { input: "preorder = [8, 5, 1, 7, 10, 12]", output: "[8, 5, 10, 1, 7, null, 12]" },
      { input: "preorder = [4, 2, 1, 3, 7]", output: "[4, 2, 7, 1, 3]" },
    ],
    signature: "TreeNode* bstFromPreorder(vector<int>& preorder)",
    functionName: "bstFromPreorder",
    note: TREE_NOTE,
    driver: `auto preorder = in["preorder"].asIntVector();\n    ${treeOut("sol.bstFromPreorder(preorder)")}`,
    method: `TreeNode* bstFromPreorder(vector<int>& preorder) {
        int i = 0;
        function<TreeNode*(int, int)> build = [&](int low, int high) -> TreeNode* {
            if (i == (int)preorder.size() || preorder[i] <= low || preorder[i] >= high) return nullptr;
            int value = preorder[i++];
            auto* node = new TreeNode(value);
            node->left = build(low, value);
            node->right = build(value, high);
            return node;
        };
        return build(-1, 10001);
    }`,
    expectedTime: "O(n)",
    expectedSpace: "O(n)",
    hints: [
      "The next preorder value is the next root, but only when it fits the bounds inherited from its ancestors.",
      "The left subtree accepts values strictly below the current root. The right subtree accepts values strictly above it and still inside the parent bound.",
      "Keep one index into the array and advance it only when you create a node.",
      "An empty array builds an empty tree. Bounds stop you from pulling a right-subtree value into the left subtree.",
    ],
    tests: [
      { input: { preorder: [8, 5, 1, 7, 10, 12] }, expectedOutput: [8, 5, 10, 1, 7, null, 12], visibility: "SAMPLE" },
      { input: { preorder: [4, 2, 1, 3, 7] }, expectedOutput: [4, 2, 7, 1, 3], visibility: "SAMPLE" },
      { input: { preorder: [] }, expectedOutput: [], visibility: "HIDDEN" },
      { input: { preorder: [1] }, expectedOutput: [1], visibility: "HIDDEN" },
      { input: { preorder: [2, 1, 3] }, expectedOutput: [2, 1, 3], visibility: "HIDDEN" },
    ],
  }),
  problem({
    slug: "pred-succ-bst",
    title: "Inorder Predecessor and Successor in BST",
    difficulty: "MEDIUM",
    topics: ["binary-search-trees"],
    tags: ["bst"],
    statement:
      "The tree is a binary search tree. The predecessor of key is the greatest value strictly less than key. The successor is the smallest value strictly greater than key. key itself may be missing. Return [predecessor, successor], using -1 when a side does not exist.",
    constraints: ["The tree is a binary search tree.", "0 <= nodes <= 2000", "0 <= node value, key <= 10000"],
    examples: [
      { input: "root = [8, 4, 12, 2, 6, 10, 14], key = 8", output: "[6, 10]" },
      { input: "root = [8, 4, 12, 2, 6, 10, 14], key = 5", output: "[4, 6]" },
    ],
    signature: "vector<int> predSuccBst(TreeNode* root, int key)",
    functionName: "predSuccBst",
    note: TREE_NOTE,
    driver: `auto root = buildTree(in["root"]);\n    ${numbersOut('sol.predSuccBst(root, (int)in["key"].asInt())')}`,
    method: `vector<int> predSuccBst(TreeNode* root, int key) {
        int pred = -1, succ = -1;
        while (root) {
            if (root->val < key) { pred = root->val; root = root->right; }
            else if (root->val > key) { succ = root->val; root = root->left; }
            else {
                if (root->left) {
                    auto* node = root->left;
                    while (node->right) node = node->right;
                    pred = node->val;
                }
                if (root->right) {
                    auto* node = root->right;
                    while (node->left) node = node->left;
                    succ = node->val;
                }
                break;
            }
        }
        return {pred, succ};
    }`,
    expectedTime: "O(h)",
    expectedSpace: "O(1)",
    hints: [
      "Predecessor and successor are the neighbors of key in sorted order, whether or not key is stored.",
      "While the key is missing, a smaller node is a predecessor candidate and a larger node is a successor candidate.",
      "When you land on key, the predecessor is the rightmost node of the left subtree, and the successor is the leftmost node of the right subtree.",
      "Keep the closest candidate on the way down. A missing side stays -1.",
    ],
    tests: [
      { input: { root: [8, 4, 12, 2, 6, 10, 14], key: 8 }, expectedOutput: [6, 10], visibility: "SAMPLE" },
      { input: { root: [8, 4, 12, 2, 6, 10, 14], key: 5 }, expectedOutput: [4, 6], visibility: "SAMPLE" },
      { input: { root: [8, 4, 12, 2, 6, 10, 14], key: 2 }, expectedOutput: [-1, 4], visibility: "HIDDEN" },
      { input: { root: [8, 4, 12, 2, 6, 10, 14], key: 14 }, expectedOutput: [12, -1], visibility: "HIDDEN" },
      { input: { root: [8, 4, 12, 2, 6, 10, 14], key: 9 }, expectedOutput: [8, 10], visibility: "HIDDEN" },
    ],
  }),
  problem({
    slug: "merge-bsts",
    title: "Merge Two BSTs",
    difficulty: "HARD",
    topics: ["binary-search-trees"],
    tags: ["bst"],
    statement:
      "Both trees are binary search trees. Return every value from both trees in nondecreasing order. If the same value appears in both trees, keep both copies.",
    constraints: ["Both trees are binary search trees.", "0 <= nodes in each tree <= 2000", "0 <= node value <= 10000"],
    examples: [
      { input: "left = [2, 1, 4], right = [5, 3, 7]", output: "[1, 2, 3, 4, 5, 7]" },
      { input: "left = [2, 1, 3], right = [2, 1, 3]", output: "[1, 1, 2, 2, 3, 3]" },
    ],
    signature: "vector<int> mergeBsts(TreeNode* left, TreeNode* right)",
    functionName: "mergeBsts",
    note: TREE_NOTE,
    driver: `auto left = buildTree(in["left"]);\n    auto right = buildTree(in["right"]);\n    ${numbersOut("sol.mergeBsts(left, right)")}`,
    method: `vector<int> mergeBsts(TreeNode* left, TreeNode* right) {
        auto collect = [](TreeNode* root) {
            vector<int> order;
            function<void(TreeNode*)> walk = [&](TreeNode* node) {
                if (!node) return;
                walk(node->left);
                order.push_back(node->val);
                walk(node->right);
            };
            walk(root);
            return order;
        };
        auto a = collect(left), b = collect(right);
        vector<int> out;
        int i = 0, j = 0;
        while (i < (int)a.size() && j < (int)b.size()) {
            if (a[i] <= b[j]) out.push_back(a[i++]);
            else out.push_back(b[j++]);
        }
        while (i < (int)a.size()) out.push_back(a[i++]);
        while (j < (int)b.size()) out.push_back(b[j++]);
        return out;
    }`,
    expectedTime: "O(n + m)",
    expectedSpace: "O(n + m)",
    hints: [
      "Each tree already has a sorted inorder sequence.",
      "Merge those two sequences the way you merge two sorted lists.",
      "When the heads are equal, take the left one first. Both copies stay.",
      "An empty tree contributes nothing. The result is the inorder of any search tree that contained every node.",
    ],
    tests: [
      { input: { left: [2, 1, 4], right: [5, 3, 7] }, expectedOutput: [1, 2, 3, 4, 5, 7], visibility: "SAMPLE" },
      { input: { left: [2, 1, 3], right: [2, 1, 3] }, expectedOutput: [1, 1, 2, 2, 3, 3], visibility: "SAMPLE" },
      { input: { left: [], right: [1] }, expectedOutput: [1], visibility: "HIDDEN" },
      { input: { left: [], right: [] }, expectedOutput: [], visibility: "HIDDEN" },
      { input: { left: [4, 2, 7, 1, 3], right: [8, 4, 12, 2, 6, 10, 14] }, expectedOutput: [1, 2, 2, 3, 4, 4, 6, 7, 8, 10, 12, 14], visibility: "HIDDEN" },
    ],
  }),
  problem({
    slug: "two-sum-bst",
    title: "Two Sum in a BST",
    difficulty: "HARD",
    topics: ["binary-search-trees"],
    tags: ["bst"],
    statement: "The tree is a binary search tree. Return whether two different nodes add up to k. A value may be used twice only when it occurs on two nodes.",
    constraints: ["The tree is a binary search tree.", "0 <= nodes <= 2000", "0 <= node value <= 10000", "0 <= k <= 20000"],
    examples: [
      { input: "root = [8, 4, 12, 2, 6, 10, 14], k = 16", output: "true", explanation: "2 and 14 add to 16." },
      { input: "root = [8, 4, 12, 2, 6, 10, 14], k = 3", output: "false" },
    ],
    signature: "bool twoSumBst(TreeNode* root, int k)",
    functionName: "twoSumBst",
    note: TREE_NOTE,
    driver: `printJson(Json::boolean(sol.twoSumBst(buildTree(in["root"]), (int)in["k"].asInt())));`,
    method: `bool twoSumBst(TreeNode* root, int k) {
        vector<int> order;
        function<void(TreeNode*)> walk = [&](TreeNode* node) {
            if (!node) return;
            walk(node->left);
            order.push_back(node->val);
            walk(node->right);
        };
        walk(root);
        int i = 0, j = (int)order.size() - 1;
        while (i < j) {
            int sum = order[i] + order[j];
            if (sum == k) return true;
            if (sum < k) i++;
            else j--;
        }
        return false;
    }`,
    expectedTime: "O(n)",
    expectedSpace: "O(n)",
    hints: [
      "Inorder gives the values in sorted order, so the usual pair scan applies.",
      "Put one pointer on the smallest value and one on the largest.",
      "If the sum is too small, move the left pointer. If it is too large, move the right pointer.",
      "The pointers must stay on different nodes. An empty tree and a single node cannot make a pair.",
    ],
    tests: [
      { input: { root: [8, 4, 12, 2, 6, 10, 14], k: 16 }, expectedOutput: true, visibility: "SAMPLE" },
      { input: { root: [8, 4, 12, 2, 6, 10, 14], k: 3 }, expectedOutput: false, visibility: "SAMPLE" },
      { input: { root: [8, 4, 12, 2, 6, 10, 14], k: 8 }, expectedOutput: true, visibility: "HIDDEN" },
      { input: { root: [8, 4, 12, 2, 6, 10, 14], k: 22 }, expectedOutput: true, visibility: "HIDDEN" },
      { input: { root: [], k: 1 }, expectedOutput: false, visibility: "HIDDEN" },
    ],
  }),
  problem({
    slug: "recover-bst",
    title: "Recover Binary Search Tree",
    difficulty: "HARD",
    topics: ["binary-search-trees"],
    tags: ["bst"],
    statement:
      "The tree was a binary search tree until the values of exactly two nodes were swapped. Swap those two values back and return the repaired tree in level order. Do not change the shape.",
    constraints: ["Exactly two node values were swapped in a binary search tree.", "2 <= nodes <= 2000", "Values are unique and from -10000 to 10000."],
    examples: [
      { input: "root = [8, 12, 4, 2, 6, 10, 14]", output: "[8, 4, 12, 2, 6, 10, 14]" },
      { input: "root = [6, 4, 12, 2, 8, 10, 14]", output: "[8, 4, 12, 2, 6, 10, 14]" },
    ],
    signature: "TreeNode* recoverBst(TreeNode* root)",
    functionName: "recoverBst",
    note: TREE_NOTE,
    driver: treeOut('sol.recoverBst(buildTree(in["root"]))'),
    method: `TreeNode* recoverBst(TreeNode* root) {
        TreeNode *first = nullptr, *second = nullptr, *prev = nullptr;
        function<void(TreeNode*)> walk = [&](TreeNode* node) {
            if (!node) return;
            walk(node->left);
            if (prev && node->val < prev->val) {
                if (!first) first = prev;
                second = node;
            }
            prev = node;
            walk(node->right);
        };
        walk(root);
        swap(first->val, second->val);
        return root;
    }`,
    expectedTime: "O(n)",
    expectedSpace: "O(h)",
    hints: [
      "Inorder of a healthy search tree is strictly increasing. The swapped values are the places it decreases.",
      "The first bad node is the previous node at the first decrease.",
      "The second bad node is the current node at the latest decrease. An adjacent swap has only one decrease, and that current node is the partner.",
      "Swap those two stored values. The links stay where they are.",
    ],
    tests: [
      { input: { root: [8, 12, 4, 2, 6, 10, 14] }, expectedOutput: [8, 4, 12, 2, 6, 10, 14], visibility: "SAMPLE" },
      { input: { root: [6, 4, 12, 2, 8, 10, 14] }, expectedOutput: [8, 4, 12, 2, 6, 10, 14], visibility: "SAMPLE" },
      { input: { root: [2, 3, 1] }, expectedOutput: [2, 1, 3], visibility: "HIDDEN" },
      { input: { root: [1, 2, 3] }, expectedOutput: [2, 1, 3], visibility: "HIDDEN" },
      { input: { root: [1, null, 0] }, expectedOutput: [0, null, 1], visibility: "HIDDEN" },
    ],
  }),
  problem({
    slug: "largest-bst",
    title: "Largest BST in a Binary Tree",
    difficulty: "HARD",
    topics: ["binary-search-trees"],
    tags: ["bst"],
    statement:
      "Return the number of nodes in the largest subtree that is a binary search tree. A subtree is a node plus every node below it. Left values must be strictly smaller than the subtree root and right values strictly larger. A single node counts as size 1. An empty tree has size 0.",
    constraints: ["0 <= nodes <= 2000", "-10000 <= node value <= 10000"],
    examples: [
      { input: "root = [10, 5, 15, 1, 8, null, 7]", output: "3", explanation: "The subtree rooted at 5 is a search tree of three nodes." },
      { input: "root = [2, 1, 3]", output: "3" },
    ],
    signature: "int largestBst(TreeNode* root)",
    functionName: "largestBst",
    note: TREE_NOTE,
    driver: `printJson(Json::number(sol.largestBst(buildTree(in["root"]))));`,
    method: `int largestBst(TreeNode* root) {
        int best = 0;
        struct Info { bool ok; int size; int low; int high; };
        function<Info(TreeNode*)> walk = [&](TreeNode* node) -> Info {
            if (!node) return {true, 0, INT_MAX, INT_MIN};
            auto left = walk(node->left);
            auto right = walk(node->right);
            if (left.ok && right.ok && left.high < node->val && node->val < right.low) {
                int size = left.size + right.size + 1;
                best = max(best, size);
                return {true, size, left.size ? left.low : node->val, right.size ? right.high : node->val};
            }
            return {false, 0, 0, 0};
        };
        walk(root);
        return best;
    }`,
    expectedTime: "O(n)",
    expectedSpace: "O(h)",
    hints: [
      "A subtree is a search tree only when both children are search trees and the node sits strictly between the left maximum and the right minimum.",
      "Return more than a boolean from each call: whether it is a search tree, its size, and its minimum and maximum.",
      "An empty child is a valid search tree of size 0. Give it a minimum above every value and a maximum below every value so the parent comparison still works.",
      "Keep the largest valid size. A node that fails still leaves the valid sizes found below it.",
    ],
    tests: [
      { input: { root: [10, 5, 15, 1, 8, null, 7] }, expectedOutput: 3, visibility: "SAMPLE" },
      { input: { root: [2, 1, 3] }, expectedOutput: 3, visibility: "SAMPLE" },
      { input: { root: [1] }, expectedOutput: 1, visibility: "HIDDEN" },
      { input: { root: [] }, expectedOutput: 0, visibility: "HIDDEN" },
      { input: { root: [8, 4, 12, 2, 6, 10, 14] }, expectedOutput: 7, visibility: "HIDDEN" },
    ],
  }),
];
