import { LIST_NOTE, problem } from "./helpers.js";

export const listProblems = [
  problem({
    slug: "merge-rosters",
    title: "Merge Two Sorted Lists",
    difficulty: "EASY",
    topics: ["linked-lists"],
    tags: ["linked-list"],
    statement:
      "Two hiring rosters are sorted singly linked lists. Merge them into one sorted list and return its head. Either roster may be empty.\n\nThe judge builds the lists from arrays and serializes your returned list back to an array.",
    constraints: ["0 <= list length <= 500", "-1000 <= node value <= 1000", "Both lists are sorted non-decreasing."],
    examples: [
      { input: "left = [1, 2, 4], right = [1, 3, 4]", output: "[1, 1, 2, 3, 4, 4]" },
      { input: "left = [], right = [0]", output: "[0]" },
    ],
    signature: "ListNode* mergeRosters(ListNode* left, ListNode* right)",
    functionName: "mergeRosters",
    note: LIST_NOTE,
    driver: `auto left = buildList(in["left"]);\n    auto right = buildList(in["right"]);\n    printJson(listToJson(sol.mergeRosters(left, right)));`,
    method: `ListNode* mergeRosters(ListNode* left, ListNode* right) {
        ListNode dummy(0);
        ListNode* tail = &dummy;
        while (left && right) {
            if (left->val <= right->val) { tail->next = left; left = left->next; }
            else { tail->next = right; right = right->next; }
            tail = tail->next;
        }
        tail->next = left ? left : right;
        return dummy.next;
    }`,
    expectedTime: "O(n + m)",
    expectedSpace: "O(1)",
    hints: [
      "You already have two sorted chains. The next node in the merged chain is always the smaller of the two nodes you are looking at.",
      "A dummy head gives you a stable place to attach nodes before you know which real node comes first.",
      "Walk both lists. Link the smaller node onto the tail, then advance that list and the tail. When one list runs out, attach the other list in one pointer assignment.",
      "The merge reuses the existing nodes, so extra memory is only the dummy and a few pointers. Compare with <= if you want equal values from the left list to stay ahead, though either stable choice is accepted as long as the values are sorted.",
    ],
    tests: [
      { input: { left: [1, 2, 4], right: [1, 3, 4] }, expectedOutput: [1, 1, 2, 3, 4, 4], visibility: "SAMPLE" },
      { input: { left: [], right: [0] }, expectedOutput: [0], visibility: "SAMPLE" },
      { input: { left: [], right: [] }, expectedOutput: [], visibility: "HIDDEN" },
      { input: { left: [1, 3, 5], right: [2, 4, 6] }, expectedOutput: [1, 2, 3, 4, 5, 6], visibility: "HIDDEN" },
      { input: { left: [5], right: [1, 2, 3] }, expectedOutput: [1, 2, 3, 5], visibility: "HIDDEN" },
    ],
  }),
  problem({
    slug: "loop-in-chain",
    title: "Linked List Cycle",
    difficulty: "EASY",
    topics: ["linked-lists"],
    tags: ["floyd"],
    statement:
      "A chain of badges may loop. You receive the head of a singly linked list. Return true when some node is reachable again by following next pointers.\n\nThe input is shown to you as values plus pos, the index the tail links to. pos is -1 when there is no loop. Your function only receives the head.",
    constraints: ["0 <= number of nodes <= 10000", "pos is -1 or a valid index."],
    examples: [
      { input: "values = [3, 2, 0, -4], pos = 1", output: "true" },
      { input: "values = [1, 2], pos = -1", output: "false" },
    ],
    signature: "bool hasLoop(ListNode* head)",
    functionName: "hasLoop",
    note: LIST_NOTE,
    driver: `auto head = buildCyclicList(in["values"], (int)in["pos"].asInt());\n    printJson(Json::boolean(sol.hasLoop(head)));`,
    method: `bool hasLoop(ListNode* head) {
        ListNode* slow = head;
        ListNode* fast = head;
        while (fast && fast->next) {
            slow = slow->next;
            fast = fast->next->next;
            if (slow == fast) return true;
        }
        return false;
    }`,
    expectedTime: "O(n)",
    expectedSpace: "O(1)",
    hints: [
      "If you only remember every node you have seen, you can detect a repeat, but the extra memory grows with the chain. Two walkers at different speeds can meet without a set.",
      "Move one pointer one step and another pointer two steps.",
      "Start both pointers at the head. Advance slow by one and fast by two. If they ever land on the same node, the chain loops. If fast reaches null, it does not.",
      "This is Floyd's cycle check. In a loop the faster pointer gains one step each iteration and must eventually meet the slower one. Extra memory is two pointers. A single-node loop, where next points at itself, is still a loop.",
    ],
    tests: [
      { input: { values: [3, 2, 0, -4], pos: 1 }, expectedOutput: true, visibility: "SAMPLE" },
      { input: { values: [1, 2], pos: -1 }, expectedOutput: false, visibility: "SAMPLE" },
      { input: { values: [1], pos: -1 }, expectedOutput: false, visibility: "HIDDEN" },
      { input: { values: [1], pos: 0 }, expectedOutput: true, visibility: "HIDDEN" },
      { input: { values: [1, 2, 3], pos: 0 }, expectedOutput: true, visibility: "HIDDEN" },
      { input: { values: [], pos: -1 }, expectedOutput: false, visibility: "HIDDEN" },
    ],
  }),
];
