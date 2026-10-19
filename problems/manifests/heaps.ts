import { LIST_NOTE, problem } from "./helpers.js";

const numbersOut = (call: string) =>
  `auto values = ${call};\n    Json out;\n    out.type = Json::ARR;\n    for (long long value : values) out.a.push_back(Json::number(value));\n    printJson(out);`;

const commandOut = (call: string) => `auto commands = in["commands"].asStrings();\n    ${numbersOut(call)}`;

const rowsOut = (call: string) =>
  `auto rows = ${call};\n    Json out;\n    out.type = Json::ARR;\n    for (const auto& row : rows) out.a.push_back(Json::ints(row));\n    printJson(out);`;

export const heapProblems = [
  problem({
    slug: "min-heap",
    title: "Implement Min Heap",
    difficulty: "MEDIUM",
    topics: ["heaps"],
    tags: ["heap"],
    statement:
      "Run a min heap. It starts empty. insert x adds x. extract removes and returns the smallest value. peek returns the smallest value without removing it. extract and peek are only requested while the heap is not empty. Return the results of extract and peek in order.",
    constraints: ["0 <= commands.length <= 1000", "Inserted values are integers from -1e9 to 1e9."],
    examples: [
      { input: 'commands = ["insert 3", "insert 1", "insert 2", "peek", "extract", "peek"]', output: "[1, 1, 2]" },
      { input: 'commands = ["insert 5", "insert 5", "extract", "peek"]', output: "[5, 5]" },
    ],
    signature: "vector<long long> minHeap(vector<string>& commands)",
    functionName: "minHeap",
    driver: commandOut("sol.minHeap(commands)"),
    method: `vector<long long> minHeap(vector<string>& commands) {
        vector<long long> heap;
        auto siftUp = [&](int index) {
            while (index > 0 && heap[(index - 1) / 2] > heap[index]) {
                swap(heap[(index - 1) / 2], heap[index]);
                index = (index - 1) / 2;
            }
        };
        auto siftDown = [&](int index) {
            while (true) {
                int best = index, left = 2 * index + 1, right = 2 * index + 2;
                if (left < (int)heap.size() && heap[left] < heap[best]) best = left;
                if (right < (int)heap.size() && heap[right] < heap[best]) best = right;
                if (best == index) break;
                swap(heap[index], heap[best]);
                index = best;
            }
        };
        vector<long long> out;
        for (const string& command : commands) {
            if (command.rfind("insert ", 0) == 0) {
                heap.push_back(stoll(command.substr(7)));
                siftUp((int)heap.size() - 1);
            } else if (command == "extract") {
                out.push_back(heap[0]);
                heap[0] = heap.back();
                heap.pop_back();
                if (!heap.empty()) siftDown(0);
            } else out.push_back(heap[0]);
        }
        return out;
    }`,
    expectedTime: "O(commands log commands)",
    expectedSpace: "O(commands)",
    hints: [
      "The smallest value has to stay where you can read it in constant time, and a new value has to find its place without scanning the whole collection.",
      "Store the heap in an array. The children of index i are 2i + 1 and 2i + 2. The parent is (i - 1) / 2.",
      "insert writes at the end and swaps upward while the parent is larger. extract saves the root, moves the last value to the root, and swaps downward with the smaller child.",
      "peek is the root. Equal values may sit in either order as long as a parent is never larger than its children.",
    ],
    tests: [
      { input: { commands: ["insert 3", "insert 1", "insert 2", "peek", "extract", "peek"] }, expectedOutput: [1, 1, 2], visibility: "SAMPLE" },
      { input: { commands: ["insert 5", "insert 5", "extract", "peek"] }, expectedOutput: [5, 5], visibility: "SAMPLE" },
      { input: { commands: ["insert 3", "insert 1", "insert 2", "peek", "extract", "peek", "extract", "extract"] }, expectedOutput: [1, 1, 2, 2, 3], visibility: "HIDDEN" },
      { input: { commands: [] }, expectedOutput: [], visibility: "HIDDEN" },
      { input: { commands: ["insert -4", "insert 0", "extract"] }, expectedOutput: [-4], visibility: "HIDDEN" },
    ],
  }),
  problem({
    slug: "heap-check",
    title: "Check if an Array Represents a Min Heap",
    difficulty: "MEDIUM",
    topics: ["heaps"],
    tags: ["heap"],
    statement:
      "An array represents a min heap when every parent is less than or equal to both of its children. Index i has children 2i + 1 and 2i + 2, when those indexes exist. Return true when the array has that shape. An empty array and a one-element array are min heaps.",
    constraints: ["0 <= heap.length <= 10000", "-1e9 <= heap[i] <= 1e9"],
    examples: [
      { input: "heap = [1, 3, 2, 7, 6, 5, 4]", output: "true" },
      { input: "heap = [2, 1, 3]", output: "false" },
    ],
    signature: "bool isMinHeap(vector<int>& heap)",
    functionName: "isMinHeap",
    driver: `auto heap = in["heap"].asIntVector();\n    printJson(Json::boolean(sol.isMinHeap(heap)));`,
    method: `bool isMinHeap(vector<int>& heap) {
        for (int index = 0; index < (int)heap.size(); ++index) {
            int left = 2 * index + 1, right = 2 * index + 2;
            if (left < (int)heap.size() && heap[left] < heap[index]) return false;
            if (right < (int)heap.size() && heap[right] < heap[index]) return false;
        }
        return true;
    }`,
    expectedTime: "O(n)",
    expectedSpace: "O(1)",
    hints: [
      "A heap array is not required to be fully sorted. Only each parent and its own children have an order.",
      "Walk every index that has a child. The left child is 2i + 1 and the right child is 2i + 2.",
      "If either child exists and is smaller than the parent, the array is not a min heap.",
      "You can stop at the last parent, which is at index n / 2 - 1. Indexes past that are leaves.",
    ],
    tests: [
      { input: { heap: [1, 3, 2, 7, 6, 5, 4] }, expectedOutput: true, visibility: "SAMPLE" },
      { input: { heap: [2, 1, 3] }, expectedOutput: false, visibility: "SAMPLE" },
      { input: { heap: [] }, expectedOutput: true, visibility: "HIDDEN" },
      { input: { heap: [4] }, expectedOutput: true, visibility: "HIDDEN" },
      { input: { heap: [1, 2, 1] }, expectedOutput: true, visibility: "HIDDEN" },
      { input: { heap: [1, 3, 2, 0] }, expectedOutput: false, visibility: "HIDDEN" },
    ],
  }),
  problem({
    slug: "heap-flip",
    title: "Convert Min Heap to Max Heap",
    difficulty: "MEDIUM",
    topics: ["heaps"],
    tags: ["heap"],
    statement:
      "heap is a min heap in level order. Turn it into a max heap by sifting down from the last parent to the root. At a node, while a child is larger, swap with the larger child. If the two children are equal, choose the left one. Return the array after that build.",
    constraints: ["0 <= heap.length <= 10000", "heap is a min heap", "-1e9 <= heap[i] <= 1e9"],
    examples: [
      { input: "heap = [1, 3, 2, 7, 6, 5, 4]", output: "[7, 6, 5, 3, 1, 2, 4]" },
      { input: "heap = [1, 2, 3]", output: "[3, 2, 1]" },
    ],
    signature: "vector<int> toMaxHeap(vector<int>& heap)",
    functionName: "toMaxHeap",
    driver: `auto heap = in["heap"].asIntVector();\n    printJson(Json::ints(sol.toMaxHeap(heap)));`,
    method: `vector<int> toMaxHeap(vector<int>& heap) {
        int n = (int)heap.size();
        auto sift = [&](int index) {
            while (true) {
                int best = index, left = 2 * index + 1, right = 2 * index + 2;
                if (left < n && heap[left] > heap[best]) best = left;
                if (right < n && heap[right] > heap[best]) best = right;
                if (best == index) break;
                swap(heap[index], heap[best]);
                index = best;
            }
        };
        for (int index = n / 2 - 1; index >= 0; --index) sift(index);
        return heap;
    }`,
    expectedTime: "O(n)",
    expectedSpace: "O(1)",
    hints: [
      "The leaves of a heap are already in place. Only the parents can violate a max-heap order.",
      "The last parent is at index n / 2 - 1. Visit parents from there back to index 0.",
      "Sift a parent down by swapping it with the larger child until it is at least as large as both children. A tie between children goes left.",
      "One downward pass per parent is the whole build. The same values remain; only their positions change.",
    ],
    tests: [
      { input: { heap: [1, 3, 2, 7, 6, 5, 4] }, expectedOutput: [7, 6, 5, 3, 1, 2, 4], visibility: "SAMPLE" },
      { input: { heap: [1, 2, 3] }, expectedOutput: [3, 2, 1], visibility: "SAMPLE" },
      { input: { heap: [] }, expectedOutput: [], visibility: "HIDDEN" },
      { input: { heap: [1] }, expectedOutput: [1], visibility: "HIDDEN" },
      { input: { heap: [2, 3, 4, 5, 6, 7, 8] }, expectedOutput: [8, 6, 7, 5, 3, 2, 4], visibility: "HIDDEN" },
    ],
  }),
  problem({
    slug: "kth-largest",
    title: "Kth Largest Element in an Array",
    difficulty: "MEDIUM",
    topics: ["heaps"],
    tags: ["heap"],
    statement:
      "Return the kth largest value in nums. Duplicate values are separate entries, so the sorted order can contain the same number more than once. k is 1 for the largest value.",
    constraints: ["1 <= nums.length <= 10000", "1 <= k <= nums.length", "-1e9 <= nums[i] <= 1e9"],
    examples: [
      { input: "nums = [3, 2, 1, 5, 6, 4], k = 2", output: "5" },
      { input: "nums = [3, 2, 3, 1, 2, 4, 5, 5, 6], k = 4", output: "4" },
    ],
    signature: "int kthLargest(vector<int>& nums, int k)",
    functionName: "kthLargest",
    driver: `auto nums = in["nums"].asIntVector();\n    printJson(Json::number(sol.kthLargest(nums, (int)in["k"].asInt())));`,
    method: `int kthLargest(vector<int>& nums, int k) {
        priority_queue<int, vector<int>, greater<int>> heap;
        for (int value : nums) {
            heap.push(value);
            if ((int)heap.size() > k) heap.pop();
        }
        return heap.top();
    }`,
    expectedTime: "O(n log k)",
    expectedSpace: "O(k)",
    hints: [
      "You do not need the whole array in order. You only need the k largest values, and then the smallest among those.",
      "Keep a min heap of size k. The heap holds the k largest values seen so far, so its root is the kth largest.",
      "Push every value. Whenever the heap grows past k, pop the root. A smaller value cannot enter the final k.",
      "After the scan the root is the answer. Sorting the whole array also works, but it does more ordering than k requires.",
    ],
    tests: [
      { input: { nums: [3, 2, 1, 5, 6, 4], k: 2 }, expectedOutput: 5, visibility: "SAMPLE" },
      { input: { nums: [3, 2, 3, 1, 2, 4, 5, 5, 6], k: 4 }, expectedOutput: 4, visibility: "SAMPLE" },
      { input: { nums: [1], k: 1 }, expectedOutput: 1, visibility: "HIDDEN" },
      { input: { nums: [2, 2, 2], k: 3 }, expectedOutput: 2, visibility: "HIDDEN" },
      { input: { nums: [7, 1, 9], k: 1 }, expectedOutput: 9, visibility: "HIDDEN" },
    ],
  }),
  problem({
    slug: "kth-smallest",
    title: "Kth Smallest Element in an Array",
    difficulty: "MEDIUM",
    topics: ["heaps"],
    tags: ["heap"],
    statement:
      "Return the kth smallest value in nums. Duplicate values count separately. k is 1 for the smallest value.",
    constraints: ["1 <= nums.length <= 10000", "1 <= k <= nums.length", "-1e9 <= nums[i] <= 1e9"],
    examples: [
      { input: "nums = [7, 10, 4, 3, 20, 15], k = 3", output: "7" },
      { input: "nums = [1, 1, 1], k = 2", output: "1" },
    ],
    signature: "int kthSmallest(vector<int>& nums, int k)",
    functionName: "kthSmallest",
    driver: `auto nums = in["nums"].asIntVector();\n    printJson(Json::number(sol.kthSmallest(nums, (int)in["k"].asInt())));`,
    method: `int kthSmallest(vector<int>& nums, int k) {
        priority_queue<int> heap;
        for (int value : nums) {
            heap.push(value);
            if ((int)heap.size() > k) heap.pop();
        }
        return heap.top();
    }`,
    expectedTime: "O(n log k)",
    expectedSpace: "O(k)",
    hints: [
      "The kth smallest value is the largest value inside the set of k smallest values.",
      "Keep a max heap of size k. Its root is the largest of the small values, which is the kth smallest overall.",
      "Push every value and pop the root whenever the heap has more than k values. The popped root is too large to stay.",
      "A min heap of every value would also work, with k pops, but it stores the whole array.",
    ],
    tests: [
      { input: { nums: [7, 10, 4, 3, 20, 15], k: 3 }, expectedOutput: 7, visibility: "SAMPLE" },
      { input: { nums: [1, 1, 1], k: 2 }, expectedOutput: 1, visibility: "SAMPLE" },
      { input: { nums: [8], k: 1 }, expectedOutput: 8, visibility: "HIDDEN" },
      { input: { nums: [5, 1, 4], k: 1 }, expectedOutput: 1, visibility: "HIDDEN" },
      { input: { nums: [9, 8, 7], k: 3 }, expectedOutput: 9, visibility: "HIDDEN" },
    ],
  }),
  problem({
    slug: "nearly-sorted",
    title: "Sort a K Sorted Array",
    difficulty: "EASY",
    topics: ["heaps"],
    tags: ["heap"],
    statement:
      "nums is nearly sorted: every value is at most k places away from where it belongs in sorted order. Return the array sorted in non-decreasing order. k may be 0, which means the array is already sorted.",
    constraints: ["1 <= nums.length <= 10000", "0 <= k <= nums.length", "-1e9 <= nums[i] <= 1e9"],
    examples: [
      { input: "nums = [6, 5, 3, 2, 8, 10, 9], k = 3", output: "[2, 3, 5, 6, 8, 9, 10]" },
      { input: "nums = [1], k = 0", output: "[1]" },
    ],
    signature: "vector<int> sortNearlySorted(vector<int>& nums, int k)",
    functionName: "sortNearlySorted",
    driver: `auto nums = in["nums"].asIntVector();\n    printJson(Json::ints(sol.sortNearlySorted(nums, (int)in["k"].asInt())));`,
    method: `vector<int> sortNearlySorted(vector<int>& nums, int k) {
        priority_queue<int, vector<int>, greater<int>> heap;
        vector<int> sorted;
        for (int value : nums) {
            heap.push(value);
            if ((int)heap.size() > k) {
                sorted.push_back(heap.top());
                heap.pop();
            }
        }
        while (!heap.empty()) {
            sorted.push_back(heap.top());
            heap.pop();
        }
        return sorted;
    }`,
    expectedTime: "O(n log k)",
    expectedSpace: "O(k)",
    hints: [
      "The next output value is somewhere in a small window, not anywhere later in the array.",
      "A min heap of the next k + 1 unread values always has the next sorted value at its root.",
      "Push values from left to right. Once the heap holds k + 1 values, pop the root into the answer and continue. Drain the heap at the end.",
      "When k is 0 the heap never holds more than one value, so the array is copied through unchanged.",
    ],
    tests: [
      { input: { nums: [6, 5, 3, 2, 8, 10, 9], k: 3 }, expectedOutput: [2, 3, 5, 6, 8, 9, 10], visibility: "SAMPLE" },
      { input: { nums: [1], k: 0 }, expectedOutput: [1], visibility: "SAMPLE" },
      { input: { nums: [3, 2, 1, 5, 4], k: 2 }, expectedOutput: [1, 2, 3, 4, 5], visibility: "HIDDEN" },
      { input: { nums: [1, 2, 3], k: 0 }, expectedOutput: [1, 2, 3], visibility: "HIDDEN" },
      { input: { nums: [4, 3], k: 1 }, expectedOutput: [3, 4], visibility: "HIDDEN" },
    ],
  }),
  problem({
    slug: "merge-k-lists",
    title: "Merge K Sorted Lists",
    difficulty: "HARD",
    topics: ["heaps"],
    tags: ["heap", "linked-list"],
    statement:
      "You are given k singly linked lists. Each list is sorted in non-decreasing order, and any of them may be empty. Merge them into one sorted list and return its head.\n\nThe judge builds the lists from arrays and serializes your returned list back to an array.",
    constraints: ["0 <= k <= 100", "0 <= list length <= 500", "At most 10000 nodes in total.", "-10000 <= node value <= 10000", "Each list is sorted non-decreasing."],
    examples: [
      { input: "lists = [[1, 4, 5], [1, 3, 4], [2, 6]]", output: "[1, 1, 2, 3, 4, 4, 5, 6]" },
      { input: "lists = [[], [1]]", output: "[1]" },
    ],
    signature: "ListNode* mergeKLists(vector<ListNode*>& lists)",
    functionName: "mergeKLists",
    note: LIST_NOTE,
    driver: `vector<ListNode*> lists;\n    for (const auto& row : in["lists"].a) lists.push_back(buildList(row));\n    printJson(listToJson(sol.mergeKLists(lists)));`,
    method: `ListNode* mergeKLists(vector<ListNode*>& lists) {
        struct Node {
            int val;
            ListNode* ptr;
            bool operator>(const Node& other) const { return val > other.val; }
        };
        priority_queue<Node, vector<Node>, greater<Node>> heap;
        for (ListNode* node : lists) if (node) heap.push({node->val, node});
        ListNode dummy(0);
        ListNode* tail = &dummy;
        while (!heap.empty()) {
            Node item = heap.top();
            heap.pop();
            tail->next = item.ptr;
            tail = tail->next;
            if (item.ptr->next) heap.push({item.ptr->next->val, item.ptr->next});
        }
        return dummy.next;
    }`,
    expectedTime: "O(n log k)",
    expectedSpace: "O(k)",
    hints: [
      "The next node in the merged list is the smallest head among the lists that still have nodes.",
      "Keep those heads in a min heap, ordered by value. An empty list contributes nothing.",
      "Pop the smallest head, append it to the result, and push that node's successor if it exists.",
      "The heap never holds more than one node from each list, so its size is at most k. Merging the lists two at a time is also correct.",
    ],
    tests: [
      { input: { lists: [[1, 4, 5], [1, 3, 4], [2, 6]] }, expectedOutput: [1, 1, 2, 3, 4, 4, 5, 6], visibility: "SAMPLE" },
      { input: { lists: [[], [1]] }, expectedOutput: [1], visibility: "SAMPLE" },
      { input: { lists: [] }, expectedOutput: [], visibility: "HIDDEN" },
      { input: { lists: [[], []] }, expectedOutput: [], visibility: "HIDDEN" },
      { input: { lists: [[2], [1, 3]] }, expectedOutput: [1, 2, 3], visibility: "HIDDEN" },
    ],
  }),
  problem({
    slug: "value-ranks",
    title: "Replace Elements by Their Rank",
    difficulty: "EASY",
    topics: ["heaps"],
    tags: ["heap", "sorting"],
    statement:
      "Replace every value by its rank. The smallest distinct value has rank 1. A larger distinct value has rank one more than the number of distinct values strictly below it. Equal values share a rank. Return the ranks in the original order.",
    constraints: ["1 <= nums.length <= 10000", "-1e9 <= nums[i] <= 1e9"],
    examples: [
      { input: "nums = [20, 15, 26, 2, 98, 6]", output: "[4, 3, 5, 1, 6, 2]" },
      { input: "nums = [1, 5, 8, 15, 8, 25, 9]", output: "[1, 2, 3, 5, 3, 6, 4]" },
    ],
    signature: "vector<int> replaceByRank(vector<int>& nums)",
    functionName: "replaceByRank",
    driver: `auto nums = in["nums"].asIntVector();\n    printJson(Json::ints(sol.replaceByRank(nums)));`,
    method: `vector<int> replaceByRank(vector<int>& nums) {
        vector<int> sorted = nums;
        sort(sorted.begin(), sorted.end());
        sorted.erase(unique(sorted.begin(), sorted.end()), sorted.end());
        unordered_map<int, int> rank;
        for (int index = 0; index < (int)sorted.size(); ++index) rank[sorted[index]] = index + 1;
        vector<int> out;
        for (int value : nums) out.push_back(rank[value]);
        return out;
    }`,
    expectedTime: "O(n log n)",
    expectedSpace: "O(n)",
    hints: [
      "Rank depends on how many different values are smaller, not on the index or on how many times a value repeats.",
      "Sort a copy and drop duplicate values. The position of a value in that list is its rank.",
      "Map each distinct value to one plus its index in the sorted unique list, then rewrite the original array through the map.",
      "A min heap that pops values in order can assign the same ranks. Equal copies must receive the rank already given to the first copy.",
    ],
    tests: [
      { input: { nums: [20, 15, 26, 2, 98, 6] }, expectedOutput: [4, 3, 5, 1, 6, 2], visibility: "SAMPLE" },
      { input: { nums: [1, 5, 8, 15, 8, 25, 9] }, expectedOutput: [1, 2, 3, 5, 3, 6, 4], visibility: "SAMPLE" },
      { input: { nums: [4, 4, 4] }, expectedOutput: [1, 1, 1], visibility: "HIDDEN" },
      { input: { nums: [1] }, expectedOutput: [1], visibility: "HIDDEN" },
      { input: { nums: [3, 1, 2] }, expectedOutput: [3, 1, 2], visibility: "HIDDEN" },
    ],
  }),
  problem({
    slug: "task-gap",
    title: "Task Scheduler",
    difficulty: "MEDIUM",
    topics: ["heaps"],
    tags: ["heap", "greedy"],
    statement:
      "tasks is a string of uppercase letters. Each letter is one task. The same letter needs at least n idle slots between two of its runs. A different letter may fill a slot. Return the minimum number of slots needed to finish every task, counting idle slots.",
    constraints: ["1 <= tasks.length <= 10000", "tasks contains only uppercase letters.", "0 <= n <= 100"],
    examples: [
      { input: 'tasks = "AAABBB", n = 2', output: "8", explanation: "One shortest schedule is A, B, idle, A, B, idle, A, B." },
      { input: 'tasks = "AAABBB", n = 0', output: "6" },
    ],
    signature: "int leastInterval(string tasks, int n)",
    functionName: "leastInterval",
    driver: `printJson(Json::number(sol.leastInterval(in["tasks"].asString(), (int)in["n"].asInt())));`,
    method: `int leastInterval(string tasks, int n) {
        int count[26] = {};
        for (char task : tasks) count[task - 'A'] += 1;
        int most = *max_element(count, count + 26);
        int tied = 0;
        for (int value : count) if (value == most) ++tied;
        return max((int)tasks.size(), (most - 1) * (n + 1) + tied);
    }`,
    expectedTime: "O(tasks)",
    expectedSpace: "O(1)",
    hints: [
      "The letter that occurs most often forces gaps. Other letters are useful only when they fill those gaps.",
      "Count the 26 letters. Let most be the highest count, and let tied be how many letters reach that count.",
      "The busiest letters form (most - 1) full frames of length n + 1, then one last frame that holds the tied letters. If there are more tasks than that frame count, there is no idle time and the answer is the number of tasks.",
      "A max heap of remaining counts, popping up to n + 1 tasks per round, builds the same schedule one slot at a time.",
    ],
    tests: [
      { input: { tasks: "AAABBB", n: 2 }, expectedOutput: 8, visibility: "SAMPLE" },
      { input: { tasks: "AAABBB", n: 0 }, expectedOutput: 6, visibility: "SAMPLE" },
      { input: { tasks: "A", n: 2 }, expectedOutput: 1, visibility: "HIDDEN" },
      { input: { tasks: "AA", n: 2 }, expectedOutput: 4, visibility: "HIDDEN" },
      { input: { tasks: "ABC", n: 2 }, expectedOutput: 3, visibility: "HIDDEN" },
      { input: { tasks: "AAAAAABCDEFG", n: 2 }, expectedOutput: 16, visibility: "HIDDEN" },
    ],
  }),
  problem({
    slug: "straight-hand",
    title: "Hand of Straights",
    difficulty: "MEDIUM",
    topics: ["heaps"],
    tags: ["heap", "greedy"],
    statement:
      "hand holds card values, which may repeat. Return true when the cards can be rearranged into groups of groupSize consecutive values. Every card is used once. A groupSize of 1 is always possible.",
    constraints: ["1 <= hand.length <= 10000", "1 <= groupSize <= hand.length", "-1e9 <= hand[i] <= 1e9"],
    examples: [
      { input: "hand = [1, 2, 3, 6, 2, 3, 4, 7, 8], groupSize = 3", output: "true" },
      { input: "hand = [1, 2, 3, 4, 5], groupSize = 4", output: "false" },
    ],
    signature: "bool straightHand(vector<int>& hand, int groupSize)",
    functionName: "straightHand",
    driver: `auto hand = in["hand"].asIntVector();\n    printJson(Json::boolean(sol.straightHand(hand, (int)in["groupSize"].asInt())));`,
    method: `bool straightHand(vector<int>& hand, int groupSize) {
        if ((int)hand.size() % groupSize != 0) return false;
        map<int, int> count;
        for (int card : hand) count[card] += 1;
        for (const auto& entry : count) {
            int need = entry.second;
            if (need == 0) continue;
            for (int value = entry.first; value < entry.first + groupSize; ++value) {
                if (count[value] < need) return false;
                count[value] -= need;
            }
        }
        return true;
    }`,
    expectedTime: "O(n log n)",
    expectedSpace: "O(n)",
    hints: [
      "If the count of cards is not divisible by the group size, no arrangement exists.",
      "The smallest remaining card has to start a group. Nothing smaller can pair with it.",
      "Sort the distinct values. For each value that still has copies, those copies must be matched with the next groupSize - 1 integers, the same number of times.",
      "Subtract as you go. A later value that was already used up by an earlier group cannot start another one. A min heap of the remaining cards pops the same groups.",
    ],
    tests: [
      { input: { hand: [1, 2, 3, 6, 2, 3, 4, 7, 8], groupSize: 3 }, expectedOutput: true, visibility: "SAMPLE" },
      { input: { hand: [1, 2, 3, 4, 5], groupSize: 4 }, expectedOutput: false, visibility: "SAMPLE" },
      { input: { hand: [1], groupSize: 1 }, expectedOutput: true, visibility: "HIDDEN" },
      { input: { hand: [1, 2, 3, 4], groupSize: 2 }, expectedOutput: true, visibility: "HIDDEN" },
      { input: { hand: [8, 8, 9, 7], groupSize: 2 }, expectedOutput: true, visibility: "HIDDEN" },
      { input: { hand: [1, 2, 4], groupSize: 3 }, expectedOutput: false, visibility: "HIDDEN" },
    ],
  }),
  problem({
    slug: "tweet-feed",
    title: "Design Twitter",
    difficulty: "MEDIUM",
    topics: ["heaps"],
    tags: ["heap", "design"],
    statement:
      "Run a short social feed. post user tweet records a tweet. A later post is newer than an earlier post. follow a b makes a see b's tweets, and repeating it changes nothing. unfollow a b removes that link, and unfollowing someone who is not followed changes nothing. Following or unfollowing yourself changes nothing. feed user returns up to 10 tweet ids, newest first, from that user's own posts and from users they follow. Return one array for every feed command, in order.",
    constraints: ["0 <= commands.length <= 1000", "User ids are integers from 1 to 500.", "Tweet ids are integers from 1 to 1e9."],
    examples: [
      {
        input: 'commands = ["post 1 5", "feed 1", "follow 1 2", "post 2 6", "feed 1", "unfollow 1 2", "feed 1"]',
        output: "[[5], [6, 5], [5]]",
      },
      { input: 'commands = ["feed 3"]', output: "[[]]" },
    ],
    signature: "vector<vector<int>> tweetFeed(vector<string>& commands)",
    functionName: "tweetFeed",
    driver: `auto commands = in["commands"].asStrings();\n    ${rowsOut("sol.tweetFeed(commands)")}`,
    method: `vector<vector<int>> tweetFeed(vector<string>& commands) {
        unordered_map<int, vector<pair<int, int>>> posts;
        unordered_map<int, unordered_set<int>> follows;
        int clock = 0;
        vector<vector<int>> out;
        for (const string& command : commands) {
            stringstream reader(command);
            string op;
            reader >> op;
            if (op == "post") {
                int user, tweet;
                reader >> user >> tweet;
                posts[user].push_back({++clock, tweet});
            } else if (op == "follow") {
                int follower, followee;
                reader >> follower >> followee;
                if (follower != followee) follows[follower].insert(followee);
            } else if (op == "unfollow") {
                int follower, followee;
                reader >> follower >> followee;
                follows[follower].erase(followee);
            } else {
                int user;
                reader >> user;
                vector<pair<int, int>> tweets = posts[user];
                for (int other : follows[user]) for (const auto& item : posts[other]) tweets.push_back(item);
                sort(tweets.begin(), tweets.end(), [](const pair<int, int>& left, const pair<int, int>& right) {
                    return left.first > right.first;
                });
                vector<int> ids;
                for (int index = 0; index < (int)tweets.size() && index < 10; ++index) ids.push_back(tweets[index].second);
                out.push_back(ids);
            }
        }
        return out;
    }`,
    expectedTime: "O(commands * posts)",
    expectedSpace: "O(commands)",
    hints: [
      "A feed is the newest posts among one user and the users they follow. Ten is a cap, not a requirement to have ten posts.",
      "Store each user's posts in order, and store each user's follow set. Ignore a follow or unfollow where both ids are the same.",
      "On feed, gather that user's posts and the posts of everyone in the follow set. Sort by post time descending and keep the first 10 ids.",
      "A heap can merge the post lists from newest to oldest and stop after 10, which avoids sorting every old tweet when the lists are long.",
    ],
    tests: [
      {
        input: { commands: ["post 1 5", "feed 1", "follow 1 2", "post 2 6", "feed 1", "unfollow 1 2", "feed 1"] },
        expectedOutput: [[5], [6, 5], [5]],
        visibility: "SAMPLE",
      },
      { input: { commands: ["feed 3"] }, expectedOutput: [[]], visibility: "SAMPLE" },
      { input: { commands: ["follow 1 1", "post 1 4", "feed 1", "unfollow 1 1", "feed 1"] }, expectedOutput: [[4], [4]], visibility: "HIDDEN" },
      {
        input: { commands: ["post 1 1", "post 1 2", "post 1 3", "post 1 4", "post 1 5", "post 1 6", "post 1 7", "post 1 8", "post 1 9", "post 1 10", "post 1 11", "post 1 12", "feed 1"] },
        expectedOutput: [[12, 11, 10, 9, 8, 7, 6, 5, 4, 3]],
        visibility: "HIDDEN",
      },
    ],
  }),
  problem({
    slug: "stick-cost",
    title: "Minimum Cost to Connect Sticks",
    difficulty: "MEDIUM",
    topics: ["heaps"],
    tags: ["heap", "greedy"],
    statement:
      "sticks holds the lengths of separate sticks. Connecting two sticks produces one stick whose length is their sum, and that sum is added to the cost. Repeat until one stick remains. Return the smallest possible total cost. One stick, or none, costs 0.",
    constraints: ["0 <= sticks.length <= 10000", "1 <= sticks[i] <= 10000"],
    examples: [
      { input: "sticks = [1, 8, 3, 5]", output: "30" },
      { input: "sticks = [1]", output: "0" },
    ],
    signature: "long long connectSticks(vector<int>& sticks)",
    functionName: "connectSticks",
    driver: `auto sticks = in["sticks"].asIntVector();\n    printJson(Json::number(sol.connectSticks(sticks)));`,
    method: `long long connectSticks(vector<int>& sticks) {
        priority_queue<long long, vector<long long>, greater<long long>> heap(sticks.begin(), sticks.end());
        long long cost = 0;
        while (heap.size() > 1) {
            long long first = heap.top(); heap.pop();
            long long second = heap.top(); heap.pop();
            cost += first + second;
            heap.push(first + second);
        }
        return cost;
    }`,
    expectedTime: "O(n log n)",
    expectedSpace: "O(n)",
    hints: [
      "Every connection adds the sum you just made, and that new stick may be connected again. Connecting long sticks early makes them get counted many times.",
      "Always connect the two shortest sticks still available.",
      "Keep the lengths in a min heap. Pop two, add their sum to the cost, and push that sum back. Stop when one length remains.",
      "A single stick never enters the loop, so the cost stays 0.",
    ],
    tests: [
      { input: { sticks: [1, 8, 3, 5] }, expectedOutput: 30, visibility: "SAMPLE" },
      { input: { sticks: [1] }, expectedOutput: 0, visibility: "SAMPLE" },
      { input: { sticks: [] }, expectedOutput: 0, visibility: "HIDDEN" },
      { input: { sticks: [2, 4, 3] }, expectedOutput: 14, visibility: "HIDDEN" },
      { input: { sticks: [5, 5] }, expectedOutput: 10, visibility: "HIDDEN" },
      { input: { sticks: [1, 2, 3, 4] }, expectedOutput: 19, visibility: "HIDDEN" },
    ],
  }),
  problem({
    slug: "kth-stream",
    title: "Kth Largest Element in a Stream",
    difficulty: "HARD",
    topics: ["heaps"],
    tags: ["heap"],
    statement:
      "A stream starts with nums, which already contains at least k values. Then each value in adds is appended, one at a time. After every append, report the kth largest value in the stream so far. Return those reports in order. k is 1 for the largest value.",
    constraints: ["1 <= k <= nums.length <= 10000", "0 <= adds.length <= 10000", "-1e9 <= each value <= 1e9"],
    examples: [
      { input: "nums = [4, 5, 8, 2], k = 3, adds = [3, 5, 10, 9, 4]", output: "[4, 5, 5, 8, 8]" },
      { input: "nums = [1], k = 1, adds = [2, -1]", output: "[2, 2]" },
    ],
    signature: "vector<int> kthInStream(vector<int>& nums, int k, vector<int>& adds)",
    functionName: "kthInStream",
    driver: `auto nums = in["nums"].asIntVector();\n    auto adds = in["adds"].asIntVector();\n    printJson(Json::ints(sol.kthInStream(nums, (int)in["k"].asInt(), adds)));`,
    method: `vector<int> kthInStream(vector<int>& nums, int k, vector<int>& adds) {
        priority_queue<int, vector<int>, greater<int>> heap;
        for (int value : nums) {
            heap.push(value);
            if ((int)heap.size() > k) heap.pop();
        }
        vector<int> out;
        for (int value : adds) {
            heap.push(value);
            if ((int)heap.size() > k) heap.pop();
            out.push_back(heap.top());
        }
        return out;
    }`,
    expectedTime: "O((nums + adds) log k)",
    expectedSpace: "O(k)",
    hints: [
      "After each new value you need the kth largest, not a fresh sort of the whole stream.",
      "Keep a min heap of the k largest values seen so far. Its root is the kth largest.",
      "Start by pushing nums and popping until k values remain. For each added value, push it and pop if the heap exceeds k, then record the root.",
      "A value smaller than the current root cannot change the k largest, so the pop removes it immediately.",
    ],
    tests: [
      { input: { nums: [4, 5, 8, 2], k: 3, adds: [3, 5, 10, 9, 4] }, expectedOutput: [4, 5, 5, 8, 8], visibility: "SAMPLE" },
      { input: { nums: [1], k: 1, adds: [2, -1] }, expectedOutput: [2, 2], visibility: "SAMPLE" },
      { input: { nums: [7, 7], k: 1, adds: [6] }, expectedOutput: [7], visibility: "HIDDEN" },
      { input: { nums: [3, 1], k: 2, adds: [] }, expectedOutput: [], visibility: "HIDDEN" },
      { input: { nums: [9, 8, 7], k: 3, adds: [10] }, expectedOutput: [8], visibility: "HIDDEN" },
    ],
  }),
  problem({
    slug: "pair-sums",
    title: "Maximum Sum Combination",
    difficulty: "HARD",
    topics: ["heaps"],
    tags: ["heap"],
    statement:
      "Choose one value from left and one value from right and add them. Return the k largest sums of that form, in descending order. The same index may be reused across different pairs. k is at most the length of either array, and the two arrays have the same length.",
    constraints: ["1 <= left.length = right.length <= 1000", "1 <= k <= left.length", "-1e9 <= left[i], right[i] <= 1e9"],
    examples: [
      { input: "left = [1, 4, 2, 3], right = [2, 5, 1, 6], k = 4", output: "[10, 9, 9, 8]" },
      { input: "left = [3, 2], right = [1, 4], k = 2", output: "[7, 6]" },
    ],
    signature: "vector<long long> maxPairSums(vector<int>& left, vector<int>& right, int k)",
    functionName: "maxPairSums",
    driver: `auto left = in["left"].asIntVector();\n    auto right = in["right"].asIntVector();\n    ${numbersOut('sol.maxPairSums(left, right, (int)in["k"].asInt())')}`,
    method: `vector<long long> maxPairSums(vector<int>& left, vector<int>& right, int k) {
        sort(left.begin(), left.end(), greater<int>());
        sort(right.begin(), right.end(), greater<int>());
        int n = (int)left.size();
        using Item = tuple<long long, int, int>;
        priority_queue<Item> heap;
        set<pair<int, int>> seen;
        heap.push({(long long)left[0] + right[0], 0, 0});
        seen.insert({0, 0});
        vector<long long> out;
        while ((int)out.size() < k) {
            auto [sum, i, j] = heap.top();
            heap.pop();
            out.push_back(sum);
            if (i + 1 < n && !seen.count({i + 1, j})) {
                seen.insert({i + 1, j});
                heap.push({(long long)left[i + 1] + right[j], i + 1, j});
            }
            if (j + 1 < n && !seen.count({i, j + 1})) {
                seen.insert({i, j + 1});
                heap.push({(long long)left[i] + right[j + 1], i, j + 1});
            }
        }
        return out;
    }`,
    expectedTime: "O(n log n + k log k)",
    expectedSpace: "O(k)",
    hints: [
      "The largest sum uses the largest value from each array. The next candidates are the neighbors of pairs you have already taken, after both arrays are sorted descending.",
      "Sort both arrays from large to small. A max heap stores candidate sums together with their index pair.",
      "Start with index pair (0, 0). Each time you pop a pair (i, j), record its sum and push (i + 1, j) and (i, j + 1) if those indexes exist and have not been pushed before.",
      "Stop after k pops. A pair is generated from the pair above it or to its left, so the heap only explores sums that can still be among the largest.",
    ],
    tests: [
      { input: { left: [1, 4, 2, 3], right: [2, 5, 1, 6], k: 4 }, expectedOutput: [10, 9, 9, 8], visibility: "SAMPLE" },
      { input: { left: [3, 2], right: [1, 4], k: 2 }, expectedOutput: [7, 6], visibility: "SAMPLE" },
      { input: { left: [1], right: [1], k: 1 }, expectedOutput: [2], visibility: "HIDDEN" },
      { input: { left: [5, 1], right: [4, 2], k: 1 }, expectedOutput: [9], visibility: "HIDDEN" },
      { input: { left: [-1, -3], right: [-2, 4], k: 2 }, expectedOutput: [3, 1], visibility: "HIDDEN" },
    ],
  }),
  problem({
    slug: "running-median",
    title: "Find Median from Data Stream",
    difficulty: "HARD",
    topics: ["heaps"],
    tags: ["heap"],
    statement:
      "Numbers arrive through add commands. median is only requested after at least one number has been added. If the count is odd, the median is the middle value in sorted order. If the count is even, the median is the smaller of the two middle values. Return the results of the median commands in order.",
    constraints: ["1 <= commands.length <= 10000", "Added values are integers from -1e9 to 1e9."],
    examples: [
      { input: 'commands = ["add 1", "add 2", "median", "add 3", "median"]', output: "[1, 2]" },
      { input: 'commands = ["add 5", "median"]', output: "[5]" },
    ],
    signature: "vector<long long> runningMedian(vector<string>& commands)",
    functionName: "runningMedian",
    driver: commandOut("sol.runningMedian(commands)"),
    method: `vector<long long> runningMedian(vector<string>& commands) {
        priority_queue<long long> low;
        priority_queue<long long, vector<long long>, greater<long long>> high;
        vector<long long> out;
        for (const string& command : commands) {
            if (command.rfind("add ", 0) == 0) {
                low.push(stoll(command.substr(4)));
                high.push(low.top());
                low.pop();
                if (high.size() > low.size()) {
                    low.push(high.top());
                    high.pop();
                }
            } else out.push_back(low.top());
        }
        return out;
    }`,
    expectedTime: "O(commands log commands)",
    expectedSpace: "O(commands)",
    hints: [
      "The median only depends on the middle of the sorted numbers. The halves on either side can stay unordered.",
      "Keep a max heap for the lower half and a min heap for the upper half. The max heap's root is the lower median.",
      "Add the new number to the lower heap, move its root to the upper heap, then move the upper root back if the upper heap becomes larger. The lower heap then has either the same size as the upper heap or one extra value.",
      "median reads the lower root. That root is the single middle when the count is odd, and the smaller middle when the count is even.",
    ],
    tests: [
      { input: { commands: ["add 1", "add 2", "median", "add 3", "median"] }, expectedOutput: [1, 2], visibility: "SAMPLE" },
      { input: { commands: ["add 5", "median"] }, expectedOutput: [5], visibility: "SAMPLE" },
      { input: { commands: ["add 5", "median", "add 1", "median", "add 4", "median"] }, expectedOutput: [5, 1, 4], visibility: "HIDDEN" },
      { input: { commands: ["add -1", "add -2", "median"] }, expectedOutput: [-2], visibility: "HIDDEN" },
      { input: { commands: ["add 0", "add 0", "median"] }, expectedOutput: [0], visibility: "HIDDEN" },
    ],
  }),
  problem({
    slug: "frequent-values",
    title: "Top K Frequent Elements",
    difficulty: "MEDIUM",
    topics: ["heaps"],
    tags: ["heap"],
    statement:
      "Return the k values that occur most often in nums. Sort them by frequency descending. When two values occur equally often, the larger value comes first. k is at most the number of distinct values.",
    constraints: ["1 <= nums.length <= 10000", "1 <= k <= the number of distinct values", "-1e9 <= nums[i] <= 1e9"],
    examples: [
      { input: "nums = [1, 1, 1, 2, 2, 3], k = 2", output: "[1, 2]" },
      { input: "nums = [1, 2, 2, 3, 3], k = 2", output: "[3, 2]" },
    ],
    signature: "vector<int> topFrequent(vector<int>& nums, int k)",
    functionName: "topFrequent",
    driver: `auto nums = in["nums"].asIntVector();\n    printJson(Json::ints(sol.topFrequent(nums, (int)in["k"].asInt())));`,
    method: `vector<int> topFrequent(vector<int>& nums, int k) {
        unordered_map<int, int> count;
        for (int value : nums) count[value] += 1;
        vector<pair<int, int>> ranked;
        for (const auto& entry : count) ranked.push_back(entry);
        sort(ranked.begin(), ranked.end(), [](const pair<int, int>& left, const pair<int, int>& right) {
            if (left.second != right.second) return left.second > right.second;
            return left.first > right.first;
        });
        vector<int> out;
        for (int index = 0; index < k; ++index) out.push_back(ranked[index].first);
        return out;
    }`,
    expectedTime: "O(n log n)",
    expectedSpace: "O(n)",
    hints: [
      "Frequency is a count of equal values. The original order does not matter, except as a tie break when counts match.",
      "Count every value in a map. Then order the distinct values by count descending, and by the value itself descending when counts are equal.",
      "The first k values in that order are the answer. Keep them in that order.",
      "A min heap of size k, ordered by the same pair of count and value, can select those k values without sorting every distinct value.",
    ],
    tests: [
      { input: { nums: [1, 1, 1, 2, 2, 3], k: 2 }, expectedOutput: [1, 2], visibility: "SAMPLE" },
      { input: { nums: [1, 2, 2, 3, 3], k: 2 }, expectedOutput: [3, 2], visibility: "SAMPLE" },
      { input: { nums: [4], k: 1 }, expectedOutput: [4], visibility: "HIDDEN" },
      { input: { nums: [1, 1, 2, 2], k: 1 }, expectedOutput: [2], visibility: "HIDDEN" },
      { input: { nums: [1, 1, 2, 2], k: 2 }, expectedOutput: [2, 1], visibility: "HIDDEN" },
    ],
  }),
];
