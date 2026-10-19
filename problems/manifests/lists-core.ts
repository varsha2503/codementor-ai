import { LIST_NOTE, problem } from "./helpers.js";

const DOUBLY_NOTE = `// DoublyNode is provided by the judge:
// struct DoublyNode { int val; DoublyNode* next; DoublyNode* prev; DoublyNode(int x) : val(x), next(nullptr), prev(nullptr) {} };
// Do not redefine it. Do not write main, and do not print from your method.
// The judge walks next and checks that each prev pointer names the node before it.`;

const CHILD_NOTE = `// ChildNode is provided by the judge:
// struct ChildNode { int val; ChildNode* next; ChildNode* bottom; ChildNode(int x) : val(x), next(nullptr), bottom(nullptr) {} };
// next moves to the next column. bottom moves down a column.
// Do not redefine it, write main, or print.`;

const RANDOM_NOTE = `// RandomNode is provided by the judge:
// struct RandomNode { int val; RandomNode* next; RandomNode* random; RandomNode(int x) : val(x), next(nullptr), random(nullptr) {} };
// Return new nodes. Do not reuse nodes from the input list.
// Do not redefine RandomNode, write main, or print.`;

const listOut = (call: string) => `auto head = buildList(in["values"]);\n    printJson(listToJson(${call}));`;

const doublyOut = (call: string) => `auto head = buildDoubly(in["values"]);\n    printJson(doublyToJson(${call}));`;

export const listCoreProblems = [
  problem({
    slug: "head-insert",
    title: "Insertion at the Head of a Linked List",
    difficulty: "EASY",
    topics: ["linked-lists"],
    tags: ["linked-list"],
    statement:
      "A singly linked list stores a row of badge numbers. Insert a new value at the front and return the new head. The list may be empty, in which case the new node is the whole list.\n\nThe judge builds the list from an array and serializes your returned list back to an array.",
    constraints: ["0 <= list length <= 1000", "-1000 <= node value, inserted value <= 1000"],
    examples: [
      { input: "values = [1, 2], value = 7", output: "[7, 1, 2]" },
      { input: "values = [], value = 5", output: "[5]" },
    ],
    signature: "ListNode* insertHead(ListNode* head, int value)",
    functionName: "insertHead",
    note: LIST_NOTE,
    driver: `auto head = buildList(in["values"]);\n    printJson(listToJson(sol.insertHead(head, (int)in["value"].asInt())));`,
    method: `ListNode* insertHead(ListNode* head, int value) {
        auto* node = new ListNode(value);
        node->next = head;
        return node;
    }`,
    expectedTime: "O(1)",
    expectedSpace: "O(1)",
    hints: [
      "The new front node does not depend on walking the rest of the row. You only need somewhere to hang the old head.",
      "Allocate one node, point its next at the current head, and return that node.",
      "An empty list is the same operation: the old head is null, so the new node is the only node.",
      "Nothing else in the list moves, so the work is constant time and constant extra memory. Forgetting to set next leaves the old row unreachable.",
    ],
    tests: [
      { input: { values: [1, 2], value: 7 }, expectedOutput: [7, 1, 2], visibility: "SAMPLE" },
      { input: { values: [], value: 5 }, expectedOutput: [5], visibility: "SAMPLE" },
      { input: { values: [4], value: 4 }, expectedOutput: [4, 4], visibility: "HIDDEN" },
      { input: { values: [-3, 0], value: -1 }, expectedOutput: [-1, -3, 0], visibility: "HIDDEN" },
    ],
  }),
  problem({
    slug: "head-delete",
    title: "Deletion of the Head of a Linked List",
    difficulty: "EASY",
    topics: ["linked-lists"],
    tags: ["linked-list"],
    statement:
      "Remove the first node of a singly linked list and return the new head. An empty list stays empty. A one-node list becomes empty.",
    constraints: ["0 <= list length <= 1000", "-1000 <= node value <= 1000"],
    examples: [
      { input: "values = [7, 1, 2]", output: "[1, 2]" },
      { input: "values = [7]", output: "[]" },
    ],
    signature: "ListNode* deleteHead(ListNode* head)",
    functionName: "deleteHead",
    note: LIST_NOTE,
    driver: listOut("sol.deleteHead(head)"),
    method: `ListNode* deleteHead(ListNode* head) {
        if (!head) return nullptr;
        return head->next;
    }`,
    expectedTime: "O(1)",
    expectedSpace: "O(1)",
    hints: [
      "The rest of the row is already a valid list. You do not need to copy it.",
      "If the head is null, return null. Otherwise return the node after the head.",
      "A single node has a null next, so removing it yields an empty list.",
      "The old head is simply no longer the start. Extra memory is a pointer, and you never walk past the first node.",
    ],
    tests: [
      { input: { values: [7, 1, 2] }, expectedOutput: [1, 2], visibility: "SAMPLE" },
      { input: { values: [7] }, expectedOutput: [], visibility: "SAMPLE" },
      { input: { values: [] }, expectedOutput: [], visibility: "HIDDEN" },
      { input: { values: [0, -4] }, expectedOutput: [-4], visibility: "HIDDEN" },
    ],
  }),
  problem({
    slug: "chain-length",
    title: "Find the Length of the Linked List",
    difficulty: "EASY",
    topics: ["linked-lists"],
    tags: ["linked-list"],
    statement: "Count the nodes in a singly linked list. An empty list has length 0.",
    constraints: ["0 <= list length <= 1000", "-1000 <= node value <= 1000"],
    examples: [
      { input: "values = [4, 1, 4]", output: "3" },
      { input: "values = []", output: "0" },
    ],
    signature: "int listLength(ListNode* head)",
    functionName: "listLength",
    note: LIST_NOTE,
    driver: `auto head = buildList(in["values"]);\n    printJson(Json::number(sol.listLength(head)));`,
    method: `int listLength(ListNode* head) {
        int count = 0;
        while (head) {
            count++;
            head = head->next;
        }
        return count;
    }`,
    expectedTime: "O(n)",
    expectedSpace: "O(1)",
    hints: [
      "A linked list does not store its length. You learn it by walking from the head until next runs out.",
      "Keep a counter. Move one node at a time and stop when the pointer is null.",
      "Start the counter at 0 so an empty list is handled before the loop body runs.",
      "Every node is visited once, so the time is linear. You only need the counter and the moving pointer.",
    ],
    tests: [
      { input: { values: [4, 1, 4] }, expectedOutput: 3, visibility: "SAMPLE" },
      { input: { values: [] }, expectedOutput: 0, visibility: "SAMPLE" },
      { input: { values: [8] }, expectedOutput: 1, visibility: "HIDDEN" },
      { input: { values: [0, 0, 0, 0] }, expectedOutput: 4, visibility: "HIDDEN" },
    ],
  }),
  problem({
    slug: "chain-search",
    title: "Search in Linked List",
    difficulty: "MEDIUM",
    topics: ["linked-lists"],
    tags: ["linked-list"],
    statement: "Return true when a singly linked list contains the given key. Order does not help you: the row is not sorted.",
    constraints: ["0 <= list length <= 1000", "-1000 <= node value, key <= 1000"],
    examples: [
      { input: "values = [4, 1, 4], key = 1", output: "true" },
      { input: "values = [4, 1, 4], key = 9", output: "false" },
    ],
    signature: "bool searchList(ListNode* head, int key)",
    functionName: "searchList",
    note: LIST_NOTE,
    driver: `auto head = buildList(in["values"]);\n    printJson(Json::boolean(sol.searchList(head, (int)in["key"].asInt())));`,
    method: `bool searchList(ListNode* head, int key) {
        while (head) {
            if (head->val == key) return true;
            head = head->next;
        }
        return false;
    }`,
    expectedTime: "O(n)",
    expectedSpace: "O(1)",
    hints: [
      "Without random access or a sorted order, the only complete check is to look at each node.",
      "Walk next until you see the key or fall off the end.",
      "Return true on the first match. Return false only after the pointer becomes null.",
      "A miss costs a full scan. An empty list is a miss. Duplicate values still count as soon as the first one matches.",
    ],
    tests: [
      { input: { values: [4, 1, 4], key: 1 }, expectedOutput: true, visibility: "SAMPLE" },
      { input: { values: [4, 1, 4], key: 9 }, expectedOutput: false, visibility: "SAMPLE" },
      { input: { values: [], key: 0 }, expectedOutput: false, visibility: "HIDDEN" },
      { input: { values: [6], key: 6 }, expectedOutput: true, visibility: "HIDDEN" },
      { input: { values: [-2, 0, 5], key: -2 }, expectedOutput: true, visibility: "HIDDEN" },
    ],
  }),
  problem({
    slug: "dll-head-insert",
    title: "Insert a Node before the Head of a Doubly Linked List",
    difficulty: "EASY",
    topics: ["linked-lists"],
    tags: ["doubly-linked-list"],
    statement:
      "A doubly linked list can be walked forward through next and backward through prev. Insert a new value before the current head and return the new head. Wire both directions. The list may be empty.",
    constraints: ["0 <= list length <= 1000", "-1000 <= node value, inserted value <= 1000"],
    examples: [
      { input: "values = [1, 2], value = 9", output: "[9, 1, 2]" },
      { input: "values = [], value = 4", output: "[4]" },
    ],
    signature: "DoublyNode* insertBeforeHead(DoublyNode* head, int value)",
    functionName: "insertBeforeHead",
    note: DOUBLY_NOTE,
    driver: `auto head = buildDoubly(in["values"]);\n    printJson(doublyToJson(sol.insertBeforeHead(head, (int)in["value"].asInt())));`,
    method: `DoublyNode* insertBeforeHead(DoublyNode* head, int value) {
        auto* node = new DoublyNode(value);
        node->next = head;
        if (head) head->prev = node;
        return node;
    }`,
    expectedTime: "O(1)",
    expectedSpace: "O(1)",
    hints: [
      "The new node becomes the head, so the old head must know how to step backward to it.",
      "Create the node, point its next at the old head, and point the old head's prev back at the new node.",
      "When the list is empty there is no old head, so the new node's prev and next both stay null.",
      "The new head's prev must stay null. Setting only next makes a forward list that fails the backward check.",
    ],
    tests: [
      { input: { values: [1, 2], value: 9 }, expectedOutput: [9, 1, 2], visibility: "SAMPLE" },
      { input: { values: [], value: 4 }, expectedOutput: [4], visibility: "SAMPLE" },
      { input: { values: [3], value: 3 }, expectedOutput: [3, 3], visibility: "HIDDEN" },
      { input: { values: [0, -1], value: 8 }, expectedOutput: [8, 0, -1], visibility: "HIDDEN" },
    ],
  }),
  problem({
    slug: "dll-head-delete",
    title: "Delete the Head of a Doubly Linked List",
    difficulty: "EASY",
    topics: ["linked-lists"],
    tags: ["doubly-linked-list"],
    statement:
      "Remove the first node of a doubly linked list and return the new head. The new head's prev must be null. An empty list stays empty.",
    constraints: ["0 <= list length <= 1000", "-1000 <= node value <= 1000"],
    examples: [
      { input: "values = [9, 1, 2]", output: "[1, 2]" },
      { input: "values = [9]", output: "[]" },
    ],
    signature: "DoublyNode* deleteDoublyHead(DoublyNode* head)",
    functionName: "deleteDoublyHead",
    note: DOUBLY_NOTE,
    driver: doublyOut("sol.deleteDoublyHead(head)"),
    method: `DoublyNode* deleteDoublyHead(DoublyNode* head) {
        if (!head) return nullptr;
        DoublyNode* next = head->next;
        if (next) next->prev = nullptr;
        return next;
    }`,
    expectedTime: "O(1)",
    expectedSpace: "O(1)",
    hints: [
      "The second node is the new head, but it still points backward at the node you are removing.",
      "Remember head->next, then clear that node's prev before you return it.",
      "If there is no second node, or no first node, the result is null.",
      "Leaving prev aimed at the removed node makes the backward walk leave the list. The forward values can look right while the links are still wrong.",
    ],
    tests: [
      { input: { values: [9, 1, 2] }, expectedOutput: [1, 2], visibility: "SAMPLE" },
      { input: { values: [9] }, expectedOutput: [], visibility: "SAMPLE" },
      { input: { values: [] }, expectedOutput: [], visibility: "HIDDEN" },
      { input: { values: [0, -5] }, expectedOutput: [-5], visibility: "HIDDEN" },
    ],
  }),
  problem({
    slug: "dll-reverse",
    title: "Reverse a Doubly Linked List",
    difficulty: "MEDIUM",
    topics: ["linked-lists"],
    tags: ["doubly-linked-list"],
    statement:
      "Reverse a doubly linked list in place and return the new head. After the reversal, next walks from the old tail back to the old head, and each prev points the other way.",
    constraints: ["0 <= list length <= 1000", "-1000 <= node value <= 1000"],
    examples: [
      { input: "values = [6, 1, 8]", output: "[8, 1, 6]" },
      { input: "values = []", output: "[]" },
    ],
    signature: "DoublyNode* reverseDoubly(DoublyNode* head)",
    functionName: "reverseDoubly",
    note: DOUBLY_NOTE,
    driver: doublyOut("sol.reverseDoubly(head)"),
    method: `DoublyNode* reverseDoubly(DoublyNode* head) {
        DoublyNode* cur = head;
        DoublyNode* prev = nullptr;
        while (cur) {
            DoublyNode* nxt = cur->next;
            cur->next = prev;
            cur->prev = nxt;
            prev = cur;
            cur = nxt;
        }
        return prev;
    }`,
    expectedTime: "O(n)",
    expectedSpace: "O(1)",
    hints: [
      "Each node already has both directions. Reversing means swapping the two pointers, then moving on to the node that used to be next.",
      "Save next before you overwrite it. Then next becomes the node you just left, and prev becomes the node you used to call next.",
      "The node you finish on, the old tail, is the new head. Its prev is null because the old next there was null.",
      "Swap both pointers on every node. Updating only next leaves the backward links aimed at the old order.",
    ],
    tests: [
      { input: { values: [6, 1, 8] }, expectedOutput: [8, 1, 6], visibility: "SAMPLE" },
      { input: { values: [] }, expectedOutput: [], visibility: "SAMPLE" },
      { input: { values: [4] }, expectedOutput: [4], visibility: "HIDDEN" },
      { input: { values: [1, 1, 2] }, expectedOutput: [2, 1, 1], visibility: "HIDDEN" },
    ],
  }),
  problem({
    slug: "list-middle",
    title: "Middle of the Linked List",
    difficulty: "EASY",
    topics: ["linked-lists"],
    tags: ["tortoise-hare"],
    statement:
      "Return the value of the middle node of a singly linked list. When the length is even, there are two middle nodes; return the second one.",
    constraints: ["1 <= list length <= 1000", "-1000 <= node value <= 1000"],
    examples: [
      { input: "values = [8, 1, 4, 9, 2]", output: "4" },
      { input: "values = [8, 1, 4, 9]", output: "4" },
    ],
    signature: "int middleValue(ListNode* head)",
    functionName: "middleValue",
    note: LIST_NOTE,
    driver: `auto head = buildList(in["values"]);\n    printJson(Json::number(sol.middleValue(head)));`,
    method: `int middleValue(ListNode* head) {
        ListNode* slow = head;
        ListNode* fast = head;
        while (fast && fast->next) {
            slow = slow->next;
            fast = fast->next->next;
        }
        return slow->val;
    }`,
    expectedTime: "O(n)",
    expectedSpace: "O(1)",
    hints: [
      "You can count the nodes and walk halfway, but two pointers at different speeds land on the middle in one pass.",
      "Move one pointer one step and the other two steps. Stop when the faster pointer cannot take another full stride.",
      "Start both at the head. The slower pointer is on the middle when the faster one reaches the end. An even length leaves the slower pointer on the second middle.",
      "The fast pointer must be checked for null before you read its next. One node is already the middle, so the loop does not run.",
    ],
    tests: [
      { input: { values: [8, 1, 4, 9, 2] }, expectedOutput: 4, visibility: "SAMPLE" },
      { input: { values: [8, 1, 4, 9] }, expectedOutput: 4, visibility: "SAMPLE" },
      { input: { values: [5] }, expectedOutput: 5, visibility: "HIDDEN" },
      { input: { values: [1, 2] }, expectedOutput: 2, visibility: "HIDDEN" },
    ],
  }),
  problem({
    slug: "reverse-chain",
    title: "Reverse a Linked List",
    difficulty: "MEDIUM",
    topics: ["linked-lists"],
    tags: ["linked-list"],
    statement: "Reverse a singly linked list iteratively and return the new head. Do the reversal by changing next pointers.",
    constraints: ["0 <= list length <= 1000", "-1000 <= node value <= 1000"],
    examples: [
      { input: "values = [6, 1, 8]", output: "[8, 1, 6]" },
      { input: "values = []", output: "[]" },
    ],
    signature: "ListNode* reverseList(ListNode* head)",
    functionName: "reverseList",
    note: LIST_NOTE,
    driver: listOut("sol.reverseList(head)"),
    method: `ListNode* reverseList(ListNode* head) {
        ListNode* prev = nullptr;
        while (head) {
            ListNode* nxt = head->next;
            head->next = prev;
            prev = head;
            head = nxt;
        }
        return prev;
    }`,
    expectedTime: "O(n)",
    expectedSpace: "O(1)",
    hints: [
      "Each node should point at the node that used to be behind it. While you are walking forward you need to remember that previous node.",
      "Save the old next, aim the current node at the previous one, then step both pointers forward.",
      "Start previous as null so the old head becomes the new tail. The pointer you have when the walk ends is the new head.",
      "Losing the old next before you save it splits the list. The loop is one pass and uses three pointers.",
    ],
    tests: [
      { input: { values: [6, 1, 8] }, expectedOutput: [8, 1, 6], visibility: "SAMPLE" },
      { input: { values: [] }, expectedOutput: [], visibility: "SAMPLE" },
      { input: { values: [4] }, expectedOutput: [4], visibility: "HIDDEN" },
      { input: { values: [1, 2, 3, 4] }, expectedOutput: [4, 3, 2, 1], visibility: "HIDDEN" },
    ],
  }),
  problem({
    slug: "reverse-chain-recursive",
    title: "Reverse a Linked List Recursively",
    difficulty: "MEDIUM",
    topics: ["linked-lists", "recursion"],
    tags: ["recursion"],
    statement:
      "Reverse a singly linked list and return the new head. Use recursion: the recursive call reverses the tail, then the current node is attached behind that tail.",
    constraints: ["0 <= list length <= 1000", "-1000 <= node value <= 1000"],
    examples: [
      { input: "values = [6, 1, 8]", output: "[8, 1, 6]" },
      { input: "values = [4]", output: "[4]" },
    ],
    signature: "ListNode* reverseRecursive(ListNode* head)",
    functionName: "reverseRecursive",
    note: LIST_NOTE,
    driver: listOut("sol.reverseRecursive(head)"),
    method: `ListNode* reverseRecursive(ListNode* head) {
        if (!head || !head->next) return head;
        ListNode* tail = reverseRecursive(head->next);
        head->next->next = head;
        head->next = nullptr;
        return tail;
    }`,
    expectedTime: "O(n)",
    expectedSpace: "O(n)",
    hints: [
      "Assume the call on head->next already returns the head of the reversed tail. The current node then belongs at the end of that tail.",
      "The node that used to follow the current node is the tail of the reversed remainder. Point that node back at the current node.",
      "Base case: an empty list or a single node is already reversed. After linking backward, set the current node's next to null so the old forward edge is gone.",
      "The first call's return value is the old tail, and every level returns that same node. The call stack is one frame per node, so the extra memory is linear even though you allocate no new list.",
    ],
    tests: [
      { input: { values: [6, 1, 8] }, expectedOutput: [8, 1, 6], visibility: "SAMPLE" },
      { input: { values: [4] }, expectedOutput: [4], visibility: "SAMPLE" },
      { input: { values: [] }, expectedOutput: [], visibility: "HIDDEN" },
      { input: { values: [1, 2, 3, 4] }, expectedOutput: [4, 3, 2, 1], visibility: "HIDDEN" },
    ],
  }),
  problem({
    slug: "loop-start",
    title: "Find the Starting Point of the Loop",
    difficulty: "MEDIUM",
    topics: ["linked-lists"],
    tags: ["floyd"],
    statement:
      "A singly linked list may contain a loop. Return the node where that loop begins, or null when there is no loop.\n\nThe input is shown as values plus pos, the index the tail links to. pos is -1 when there is no loop. Your function only receives the head. Node values are unique and are never -1. The judge prints the returned node's value, or -1 when you return null.",
    constraints: ["0 <= number of nodes <= 1000", "0 <= node value <= 100000", "values are unique", "pos is -1 or a valid index"],
    examples: [
      { input: "values = [6, 1, 8, 3], pos = 1", output: "1" },
      { input: "values = [6, 1, 8, 3], pos = -1", output: "-1" },
    ],
    signature: "ListNode* loopStart(ListNode* head)",
    functionName: "loopStart",
    note: LIST_NOTE,
    driver: `auto head = buildCyclicList(in["values"], (int)in["pos"].asInt());\n    auto node = sol.loopStart(head);\n    printJson(Json::number(node ? node->val : -1));`,
    method: `ListNode* loopStart(ListNode* head) {
        ListNode* slow = head;
        ListNode* fast = head;
        while (fast && fast->next) {
            slow = slow->next;
            fast = fast->next->next;
            if (slow == fast) {
                ListNode* entry = head;
                while (entry != slow) {
                    entry = entry->next;
                    slow = slow->next;
                }
                return entry;
            }
        }
        return nullptr;
    }`,
    expectedTime: "O(n)",
    expectedSpace: "O(1)",
    hints: [
      "Finding that a loop exists is the first half. The entrance is a second walk from the head after two pointers have met inside the loop.",
      "Advance one pointer by one and another by two. If they meet, put one pointer back on the head.",
      "Move both of those pointers one step at a time. They meet again at the first node of the loop. If the fast pointer reaches null, there is no loop.",
      "The meeting point is not always the entrance. Resetting one pointer to the head is what lines the distances up. A loop that starts at the head still works: the second walk meets immediately.",
    ],
    tests: [
      { input: { values: [6, 1, 8, 3], pos: 1 }, expectedOutput: 1, visibility: "SAMPLE" },
      { input: { values: [6, 1, 8, 3], pos: -1 }, expectedOutput: -1, visibility: "SAMPLE" },
      { input: { values: [], pos: -1 }, expectedOutput: -1, visibility: "HIDDEN" },
      { input: { values: [9], pos: 0 }, expectedOutput: 9, visibility: "HIDDEN" },
      { input: { values: [4, 7, 2], pos: 0 }, expectedOutput: 4, visibility: "HIDDEN" },
    ],
  }),
  problem({
    slug: "loop-length",
    title: "Length of Loop in Linked List",
    difficulty: "MEDIUM",
    topics: ["linked-lists"],
    tags: ["floyd"],
    statement:
      "Return how many nodes are in the loop of a singly linked list. Return 0 when there is no loop.\n\nThe input is shown as values plus pos, the index the tail links to. pos is -1 when there is no loop. Your function only receives the head.",
    constraints: ["0 <= number of nodes <= 1000", "-1000 <= node value <= 1000", "pos is -1 or a valid index"],
    examples: [
      { input: "values = [6, 1, 8, 3], pos = 1", output: "3" },
      { input: "values = [6, 1, 8, 3], pos = -1", output: "0" },
    ],
    signature: "int loopLength(ListNode* head)",
    functionName: "loopLength",
    note: LIST_NOTE,
    driver: `auto head = buildCyclicList(in["values"], (int)in["pos"].asInt());\n    printJson(Json::number(sol.loopLength(head)));`,
    method: `int loopLength(ListNode* head) {
        ListNode* slow = head;
        ListNode* fast = head;
        while (fast && fast->next) {
            slow = slow->next;
            fast = fast->next->next;
            if (slow == fast) {
                int count = 1;
                ListNode* cur = slow->next;
                while (cur != slow) {
                    count++;
                    cur = cur->next;
                }
                return count;
            }
        }
        return 0;
    }`,
    expectedTime: "O(n)",
    expectedSpace: "O(1)",
    hints: [
      "Once two different-speed pointers meet, you are standing inside the loop. The loop length is the walk that returns to that same node.",
      "Use the one-step and two-step pointers to detect the loop. After they meet, freeze one and count steps with the other until it comes back.",
      "Count the meeting node as one, then follow next until you see it again. If the fast pointer hits null, the length is 0.",
      "Do not count the tail before the loop. A one-node loop, where next points at the same node, has length 1 because the next step is already back.",
    ],
    tests: [
      { input: { values: [6, 1, 8, 3], pos: 1 }, expectedOutput: 3, visibility: "SAMPLE" },
      { input: { values: [6, 1, 8, 3], pos: -1 }, expectedOutput: 0, visibility: "SAMPLE" },
      { input: { values: [], pos: -1 }, expectedOutput: 0, visibility: "HIDDEN" },
      { input: { values: [9], pos: 0 }, expectedOutput: 1, visibility: "HIDDEN" },
      { input: { values: [4, 7, 2], pos: 0 }, expectedOutput: 3, visibility: "HIDDEN" },
    ],
  }),
  problem({
    slug: "chain-palindrome",
    title: "Palindrome Linked List",
    difficulty: "MEDIUM",
    topics: ["linked-lists"],
    tags: ["linked-list"],
    statement:
      "Return true when the values of a singly linked list read the same forward and backward. An empty list and a single node are palindromes.",
    constraints: ["0 <= list length <= 1000", "-1000 <= node value <= 1000"],
    examples: [
      { input: "values = [4, 1, 4]", output: "true" },
      { input: "values = [4, 1, 2]", output: "false" },
    ],
    signature: "bool isPalindrome(ListNode* head)",
    functionName: "isPalindrome",
    note: LIST_NOTE,
    driver: `auto head = buildList(in["values"]);\n    printJson(Json::boolean(sol.isPalindrome(head)));`,
    method: `bool isPalindrome(ListNode* head) {
        if (!head || !head->next) return true;
        ListNode* slow = head;
        ListNode* fast = head;
        while (fast->next && fast->next->next) {
            slow = slow->next;
            fast = fast->next->next;
        }
        ListNode* prev = nullptr;
        ListNode* cur = slow->next;
        while (cur) {
            ListNode* nxt = cur->next;
            cur->next = prev;
            prev = cur;
            cur = nxt;
        }
        ListNode* left = head;
        ListNode* right = prev;
        while (right) {
            if (left->val != right->val) return false;
            left = left->next;
            right = right->next;
        }
        return true;
    }`,
    expectedTime: "O(n)",
    expectedSpace: "O(1)",
    hints: [
      "A list cannot be indexed from the back. The second half can be reversed so the two halves sit next to two pointers.",
      "Find the middle with a slow and a fast pointer, then reverse the nodes after the middle.",
      "Compare the original head with the head of the reversed second half. Stop when the reversed half runs out. A mismatch ends the check.",
      "Copying every value into an array also works, but it uses linear extra memory. The reverse-and-compare walk uses a handful of pointers. On an odd length the middle node is compared against nothing in the shorter half, which is correct.",
    ],
    tests: [
      { input: { values: [4, 1, 4] }, expectedOutput: true, visibility: "SAMPLE" },
      { input: { values: [4, 1, 2] }, expectedOutput: false, visibility: "SAMPLE" },
      { input: { values: [] }, expectedOutput: true, visibility: "HIDDEN" },
      { input: { values: [7] }, expectedOutput: true, visibility: "HIDDEN" },
      { input: { values: [1, 2, 3, 2, 1] }, expectedOutput: true, visibility: "HIDDEN" },
      { input: { values: [7, 7] }, expectedOutput: true, visibility: "HIDDEN" },
      { input: { values: [7, 8] }, expectedOutput: false, visibility: "HIDDEN" },
    ],
  }),
  problem({
    slug: "odd-even-chain",
    title: "Segregate Odd and Even Nodes in a Linked List",
    difficulty: "MEDIUM",
    topics: ["linked-lists"],
    tags: ["linked-list"],
    statement:
      "Rearrange a singly linked list so every odd value comes before every even value. Keep the original order of the odd values, and keep the original order of the even values. Zero is even. A value is odd when it is not divisible by 2, including negatives.",
    constraints: ["0 <= list length <= 1000", "-1000 <= node value <= 1000"],
    examples: [
      { input: "values = [1, 8, 3, 6, 5]", output: "[1, 3, 5, 8, 6]" },
      { input: "values = [-2, -1, 0, 1]", output: "[-1, 1, -2, 0]" },
    ],
    signature: "ListNode* segregateOddEven(ListNode* head)",
    functionName: "segregateOddEven",
    note: LIST_NOTE,
    driver: listOut("sol.segregateOddEven(head)"),
    method: `ListNode* segregateOddEven(ListNode* head) {
        ListNode oddDummy(0), evenDummy(0);
        ListNode* odd = &oddDummy;
        ListNode* even = &evenDummy;
        while (head) {
            if (head->val % 2 != 0) {
                odd->next = head;
                odd = odd->next;
            } else {
                even->next = head;
                even = even->next;
            }
            head = head->next;
        }
        odd->next = evenDummy.next;
        even->next = nullptr;
        return oddDummy.next;
    }`,
    expectedTime: "O(n)",
    expectedSpace: "O(1)",
    hints: [
      "You can split the nodes into two lists, odds and evens, without allocating new nodes. Joining those lists at the end preserves each group's order.",
      "Give each group a dummy head. As you walk, hang the current node on the odd tail or the even tail.",
      "After the walk, point the odd tail at the first real even node, and point the even tail at null so the old next edges do not loop.",
      "In C++ a negative odd value modulo 2 is not 1, so test that the remainder is not 0. The dummies are the only extra nodes, and they are not part of the result.",
    ],
    tests: [
      { input: { values: [1, 8, 3, 6, 5] }, expectedOutput: [1, 3, 5, 8, 6], visibility: "SAMPLE" },
      { input: { values: [-2, -1, 0, 1] }, expectedOutput: [-1, 1, -2, 0], visibility: "SAMPLE" },
      { input: { values: [] }, expectedOutput: [], visibility: "HIDDEN" },
      { input: { values: [2, 4, 6] }, expectedOutput: [2, 4, 6], visibility: "HIDDEN" },
      { input: { values: [1, 3, 5] }, expectedOutput: [1, 3, 5], visibility: "HIDDEN" },
      { input: { values: [0] }, expectedOutput: [0], visibility: "HIDDEN" },
    ],
  }),
  problem({
    slug: "drop-from-end",
    title: "Remove Nth Node From End of List",
    difficulty: "MEDIUM",
    topics: ["linked-lists"],
    tags: ["two-pointers"],
    statement:
      "Remove the nth node from the end of a singly linked list and return the new head. n is counted from 1, and it always names a real node. Removing the only node leaves an empty list.",
    constraints: ["1 <= list length <= 1000", "1 <= n <= list length", "-1000 <= node value <= 1000"],
    examples: [
      { input: "values = [8, 1, 4, 9, 2], n = 2", output: "[8, 1, 4, 2]" },
      { input: "values = [8, 1, 4, 9, 2], n = 5", output: "[1, 4, 9, 2]" },
    ],
    signature: "ListNode* removeNthFromEnd(ListNode* head, int n)",
    functionName: "removeNthFromEnd",
    note: LIST_NOTE,
    driver: `auto head = buildList(in["values"]);\n    printJson(listToJson(sol.removeNthFromEnd(head, (int)in["n"].asInt())));`,
    method: `ListNode* removeNthFromEnd(ListNode* head, int n) {
        ListNode dummy(0);
        dummy.next = head;
        ListNode* fast = &dummy;
        ListNode* slow = &dummy;
        for (int i = 0; i < n; i++) fast = fast->next;
        while (fast->next) {
            fast = fast->next;
            slow = slow->next;
        }
        slow->next = slow->next->next;
        return dummy.next;
    }`,
    expectedTime: "O(n)",
    expectedSpace: "O(1)",
    hints: [
      "The node to delete is n steps before the end. A pointer that stays n nodes behind another pointer is standing on the node just before the one you want when the leader hits the tail.",
      "A dummy before the head gives you a node to stand on even when the head itself is removed.",
      "Move the leader n steps past the dummy. Then move the leader and the trailer together until the leader's next is null. The trailer's next is the node to unlink.",
      "One pass is enough. If the leader never moves after the opening gap, the trailer is still on the dummy and the head is what gets removed.",
    ],
    tests: [
      { input: { values: [8, 1, 4, 9, 2], n: 2 }, expectedOutput: [8, 1, 4, 2], visibility: "SAMPLE" },
      { input: { values: [8, 1, 4, 9, 2], n: 5 }, expectedOutput: [1, 4, 9, 2], visibility: "SAMPLE" },
      { input: { values: [4], n: 1 }, expectedOutput: [], visibility: "HIDDEN" },
      { input: { values: [1, 2, 3], n: 1 }, expectedOutput: [1, 2], visibility: "HIDDEN" },
      { input: { values: [1, 2, 3], n: 3 }, expectedOutput: [2, 3], visibility: "HIDDEN" },
    ],
  }),
  problem({
    slug: "drop-middle",
    title: "Delete the Middle Node of a Linked List",
    difficulty: "MEDIUM",
    topics: ["linked-lists"],
    tags: ["tortoise-hare"],
    statement:
      "Delete the middle node of a singly linked list and return the head. For a length of n, the middle is the node at index floor(n / 2), counting from 0. A one-node list becomes empty.",
    constraints: ["1 <= list length <= 1000", "-1000 <= node value <= 1000"],
    examples: [
      { input: "values = [8, 1, 4, 9, 2]", output: "[8, 1, 9, 2]" },
      { input: "values = [8, 1, 4, 9]", output: "[8, 1, 9]" },
    ],
    signature: "ListNode* deleteMiddle(ListNode* head)",
    functionName: "deleteMiddle",
    note: LIST_NOTE,
    driver: listOut("sol.deleteMiddle(head)"),
    method: `ListNode* deleteMiddle(ListNode* head) {
        ListNode dummy(0);
        dummy.next = head;
        ListNode* slow = &dummy;
        ListNode* fast = head;
        while (fast && fast->next) {
            slow = slow->next;
            fast = fast->next->next;
        }
        slow->next = slow->next->next;
        return dummy.next;
    }`,
    expectedTime: "O(n)",
    expectedSpace: "O(1)",
    hints: [
      "You need the node before the middle so you can skip the middle. A dummy head lets the same loop cover deleting the first node.",
      "Start the slow pointer on the dummy and the fast pointer on the real head. Move slow once and fast twice.",
      "When fast cannot move two steps, slow->next is the middle. Unlink it.",
      "For a single node the fast pointer cannot move, so the dummy's next is cleared and the result is empty. For an even length this lands on the later middle, which is index n / 2.",
    ],
    tests: [
      { input: { values: [8, 1, 4, 9, 2] }, expectedOutput: [8, 1, 9, 2], visibility: "SAMPLE" },
      { input: { values: [8, 1, 4, 9] }, expectedOutput: [8, 1, 9], visibility: "SAMPLE" },
      { input: { values: [5] }, expectedOutput: [], visibility: "HIDDEN" },
      { input: { values: [2, 1] }, expectedOutput: [2], visibility: "HIDDEN" },
      { input: { values: [1, 2, 3] }, expectedOutput: [1, 3], visibility: "HIDDEN" },
    ],
  }),
  problem({
    slug: "sort-chain",
    title: "Sort List",
    difficulty: "HARD",
    topics: ["linked-lists"],
    tags: ["merge-sort"],
    statement: "Sort a singly linked list into non-decreasing order and return its head. Change the links; you do not have random access to the nodes.",
    constraints: ["0 <= list length <= 500", "-1000 <= node value <= 1000"],
    examples: [
      { input: "values = [4, 2, 1, 3]", output: "[1, 2, 3, 4]" },
      { input: "values = []", output: "[]" },
    ],
    signature: "ListNode* sortList(ListNode* head)",
    functionName: "sortList",
    note: LIST_NOTE,
    driver: listOut("sol.sortList(head)"),
    method: `ListNode* sortList(ListNode* head) {
        std::function<ListNode*(ListNode*, ListNode*)> merge = [](ListNode* a, ListNode* b) -> ListNode* {
            ListNode dummy(0);
            ListNode* tail = &dummy;
            while (a && b) {
                if (a->val <= b->val) { tail->next = a; a = a->next; }
                else { tail->next = b; b = b->next; }
                tail = tail->next;
            }
            tail->next = a ? a : b;
            return dummy.next;
        };
        std::function<ListNode*(ListNode*)> sort = [&](ListNode* node) -> ListNode* {
            if (!node || !node->next) return node;
            ListNode* slow = node;
            ListNode* fast = node->next;
            while (fast && fast->next) {
                slow = slow->next;
                fast = fast->next->next;
            }
            ListNode* right = slow->next;
            slow->next = nullptr;
            return merge(sort(node), sort(right));
        };
        return sort(head);
    }`,
    expectedTime: "O(n log n)",
    expectedSpace: "O(log n)",
    hints: [
      "Merge sort fits a linked list: split into two halves, sort each, then merge by relinking nodes.",
      "Find the split with a slow pointer and a fast pointer that starts one node ahead, so the halves differ by at most one.",
      "Cut the list at the slow pointer by setting its next to null. Merge the sorted halves with a dummy tail, always attaching the smaller node.",
      "The split must actually break the next pointer. If the two halves stay connected, the recursion never reaches a one-node list. The merge reuses nodes, and the recursion depth is logarithmic.",
    ],
    tests: [
      { input: { values: [4, 2, 1, 3] }, expectedOutput: [1, 2, 3, 4], visibility: "SAMPLE" },
      { input: { values: [] }, expectedOutput: [], visibility: "SAMPLE" },
      { input: { values: [5] }, expectedOutput: [5], visibility: "HIDDEN" },
      { input: { values: [-2, 3, -1] }, expectedOutput: [-2, -1, 3], visibility: "HIDDEN" },
      { input: { values: [2, 2, 1] }, expectedOutput: [1, 2, 2], visibility: "HIDDEN" },
    ],
  }),
  problem({
    slug: "color-chain",
    title: "Sort a Linked List of 0's 1's and 2's",
    difficulty: "MEDIUM",
    topics: ["linked-lists"],
    tags: ["linked-list"],
    statement:
      "A singly linked list contains only the values 0, 1, and 2. Rearrange it into non-decreasing order by changing links, and return the head.",
    constraints: ["0 <= list length <= 1000", "each node value is 0, 1, or 2"],
    examples: [
      { input: "values = [2, 0, 2, 1, 0]", output: "[0, 0, 1, 2, 2]" },
      { input: "values = []", output: "[]" },
    ],
    signature: "ListNode* sortColors(ListNode* head)",
    functionName: "sortColors",
    note: LIST_NOTE,
    driver: listOut("sol.sortColors(head)"),
    method: `ListNode* sortColors(ListNode* head) {
        ListNode zero(0), one(0), two(0);
        ListNode* z = &zero;
        ListNode* o = &one;
        ListNode* t = &two;
        while (head) {
            if (head->val == 0) { z->next = head; z = z->next; }
            else if (head->val == 1) { o->next = head; o = o->next; }
            else { t->next = head; t = t->next; }
            head = head->next;
        }
        z->next = one.next ? one.next : two.next;
        o->next = two.next;
        t->next = nullptr;
        return zero.next;
    }`,
    expectedTime: "O(n)",
    expectedSpace: "O(1)",
    hints: [
      "Three values means three chains. You can gather every 0, every 1, and every 2, then connect those chains.",
      "Hang each node on the tail of the chain that matches its value. A dummy head per chain avoids special cases for the first node.",
      "Join the 0 tail to the first 1, or to the first 2 when there is no 1. Join the 1 tail to the first 2, and close the 2 tail with null.",
      "If you skip the null at the end, the last 2 still points into whatever followed it in the original list and the walk loops or repeats nodes.",
    ],
    tests: [
      { input: { values: [2, 0, 2, 1, 0] }, expectedOutput: [0, 0, 1, 2, 2], visibility: "SAMPLE" },
      { input: { values: [] }, expectedOutput: [], visibility: "SAMPLE" },
      { input: { values: [1, 1, 1] }, expectedOutput: [1, 1, 1], visibility: "HIDDEN" },
      { input: { values: [2, 0] }, expectedOutput: [0, 2], visibility: "HIDDEN" },
      { input: { values: [0] }, expectedOutput: [0], visibility: "HIDDEN" },
    ],
  }),
  problem({
    slug: "y-meet",
    title: "Intersection of Two Linked Lists",
    difficulty: "MEDIUM",
    topics: ["linked-lists"],
    tags: ["linked-list"],
    statement:
      "Two singly linked lists may share a tail, forming a Y. Return the first shared node, or null when they never meet.\n\nThe input is split into prefixA, prefixB, and the shared tail. Your function receives the two heads. The judge prints the returned node's value, or -1 when you return null.",
    constraints: ["0 <= each part's length <= 500", "-1000 <= node value <= 1000"],
    examples: [
      { input: "prefixA = [4, 1], prefixB = [5, 6, 1], shared = [8, 4]", output: "8" },
      { input: "prefixA = [1, 2], prefixB = [3], shared = []", output: "-1" },
    ],
    signature: "ListNode* intersection(ListNode* left, ListNode* right)",
    functionName: "intersection",
    note: LIST_NOTE,
    driver: `ListNode* left = nullptr;\n    ListNode* right = nullptr;\n    buildY(in["prefixA"], in["prefixB"], in["shared"], left, right);\n    auto node = sol.intersection(left, right);\n    printJson(Json::number(node ? node->val : -1));`,
    method: `ListNode* intersection(ListNode* left, ListNode* right) {
        ListNode* a = left;
        ListNode* b = right;
        while (a != b) {
            a = a ? a->next : right;
            b = b ? b->next : left;
        }
        return a;
    }`,
    expectedTime: "O(n + m)",
    expectedSpace: "O(1)",
    hints: [
      "The lists can differ in length before they join. If each pointer, after finishing its own list, continues at the head of the other list, both pointers travel the same total distance.",
      "Walk two pointers. When one becomes null, send it to the other list's head.",
      "They meet at the first shared node. If there is no shared node, both become null on the same step and that null is the answer.",
      "Comparing values is not enough, because the same number can appear in both private prefixes. Compare the node pointers. Two empty lists meet immediately at null.",
    ],
    tests: [
      { input: { prefixA: [4, 1], prefixB: [5, 6, 1], shared: [8, 4] }, expectedOutput: 8, visibility: "SAMPLE" },
      { input: { prefixA: [1, 2], prefixB: [3], shared: [] }, expectedOutput: -1, visibility: "SAMPLE" },
      { input: { prefixA: [], prefixB: [], shared: [4, 5] }, expectedOutput: 4, visibility: "HIDDEN" },
      { input: { prefixA: [], prefixB: [1], shared: [9] }, expectedOutput: 9, visibility: "HIDDEN" },
      { input: { prefixA: [], prefixB: [], shared: [] }, expectedOutput: -1, visibility: "HIDDEN" },
    ],
  }),
  problem({
    slug: "plus-one-chain",
    title: "Add 1 to a Number Represented by Linked List",
    difficulty: "MEDIUM",
    topics: ["linked-lists"],
    tags: ["linked-list"],
    statement:
      "A singly linked list stores a non-negative integer. The head holds the most significant digit. Add one and return the head. Do not leave a leading zero, except that the number zero itself is a single node holding 0.",
    constraints: ["1 <= number of digits <= 100", "0 <= digit <= 9", "no leading zero unless the number is 0"],
    examples: [
      { input: "values = [1, 2, 9]", output: "[1, 3, 0]" },
      { input: "values = [9, 9]", output: "[1, 0, 0]" },
    ],
    signature: "ListNode* plusOne(ListNode* head)",
    functionName: "plusOne",
    note: LIST_NOTE,
    driver: listOut("sol.plusOne(head)"),
    method: `ListNode* plusOne(ListNode* head) {
        std::function<int(ListNode*)> add = [&](ListNode* node) -> int {
            if (!node->next) node->val += 1;
            else node->val += add(node->next);
            int carry = node->val / 10;
            node->val %= 10;
            return carry;
        };
        if (add(head)) {
            auto* node = new ListNode(1);
            node->next = head;
            return node;
        }
        return head;
    }`,
    expectedTime: "O(n)",
    expectedSpace: "O(n)",
    hints: [
      "The digit that actually increases is at the tail. A carry then walks back toward the head.",
      "Recurse to the last node, add one there, and return the carry. Each caller adds that carry into its own digit.",
      "Store digit % 10 and pass digit / 10 upward. If the head still has a carry, insert a new node holding 1 in front.",
      "Adding one in a loop from the head changes the wrong end. 999 must grow a new digit; 129 only changes the last two digits.",
    ],
    tests: [
      { input: { values: [1, 2, 9] }, expectedOutput: [1, 3, 0], visibility: "SAMPLE" },
      { input: { values: [9, 9] }, expectedOutput: [1, 0, 0], visibility: "SAMPLE" },
      { input: { values: [0] }, expectedOutput: [1], visibility: "HIDDEN" },
      { input: { values: [9] }, expectedOutput: [1, 0], visibility: "HIDDEN" },
      { input: { values: [1, 0, 0] }, expectedOutput: [1, 0, 1], visibility: "HIDDEN" },
    ],
  }),
  problem({
    slug: "add-chains",
    title: "Add Two Numbers",
    difficulty: "MEDIUM",
    topics: ["linked-lists"],
    tags: ["linked-list"],
    statement:
      "Each singly linked list stores a non-negative integer with the ones digit at the head. Return their sum in the same form. The highest digit of a result is never a stored zero unless the sum itself is zero.",
    constraints: ["1 <= each list's length <= 100", "0 <= digit <= 9", "no leading zero on the highest digit unless the number is 0"],
    examples: [
      { input: "left = [9, 1], right = [3, 2]", output: "[2, 4]", explanation: "19 + 23 = 42, stored with the ones digit first." },
      { input: "left = [9, 9], right = [1]", output: "[0, 0, 1]" },
    ],
    signature: "ListNode* addTwoNumbers(ListNode* left, ListNode* right)",
    functionName: "addTwoNumbers",
    note: LIST_NOTE,
    driver: `auto left = buildList(in["left"]);\n    auto right = buildList(in["right"]);\n    printJson(listToJson(sol.addTwoNumbers(left, right)));`,
    method: `ListNode* addTwoNumbers(ListNode* left, ListNode* right) {
        ListNode dummy(0);
        ListNode* tail = &dummy;
        int carry = 0;
        while (left || right || carry) {
            int sum = carry;
            if (left) { sum += left->val; left = left->next; }
            if (right) { sum += right->val; right = right->next; }
            tail->next = new ListNode(sum % 10);
            tail = tail->next;
            carry = sum / 10;
        }
        return dummy.next;
    }`,
    expectedTime: "O(n + m)",
    expectedSpace: "O(1)",
    hints: [
      "Because the ones digit is at the head, you can add from the front the way you add on paper from the right.",
      "Keep a carry. At each step add the two current digits, if they exist, plus the carry.",
      "Append sum % 10 and keep sum / 10 as the next carry. Continue while either list or the carry remains.",
      "The lists can have different lengths, so do not stop when the shorter one ends. A final carry of 1 is a new node. Extra memory is the output list.",
    ],
    tests: [
      { input: { left: [9, 1], right: [3, 2] }, expectedOutput: [2, 4], visibility: "SAMPLE" },
      { input: { left: [9, 9], right: [1] }, expectedOutput: [0, 0, 1], visibility: "SAMPLE" },
      { input: { left: [0], right: [0] }, expectedOutput: [0], visibility: "HIDDEN" },
      { input: { left: [9], right: [1] }, expectedOutput: [0, 1], visibility: "HIDDEN" },
      { input: { left: [2, 4, 3], right: [5, 6] }, expectedOutput: [7, 0, 4], visibility: "HIDDEN" },
    ],
  }),
  problem({
    slug: "dll-drop-key",
    title: "Delete All Occurrences of a Key in DLL",
    difficulty: "HARD",
    topics: ["linked-lists"],
    tags: ["doubly-linked-list"],
    statement:
      "Delete every node of a doubly linked list whose value equals the key. Return the new head, which may be null. Keep both directions consistent for the nodes that remain.",
    constraints: ["0 <= list length <= 1000", "-1000 <= node value, key <= 1000"],
    examples: [
      { input: "values = [2, 1, 2, 3, 2], key = 2", output: "[1, 3]" },
      { input: "values = [4, 4, 4], key = 4", output: "[]" },
    ],
    signature: "DoublyNode* deleteKey(DoublyNode* head, int key)",
    functionName: "deleteKey",
    note: DOUBLY_NOTE,
    driver: `auto head = buildDoubly(in["values"]);\n    printJson(doublyToJson(sol.deleteKey(head, (int)in["key"].asInt())));`,
    method: `DoublyNode* deleteKey(DoublyNode* head, int key) {
        DoublyNode* cur = head;
        while (cur) {
            DoublyNode* nxt = cur->next;
            if (cur->val == key) {
                if (cur->prev) cur->prev->next = cur->next;
                else head = cur->next;
                if (cur->next) cur->next->prev = cur->prev;
            }
            cur = nxt;
        }
        return head;
    }`,
    expectedTime: "O(n)",
    expectedSpace: "O(1)",
    hints: [
      "A doubly linked node can be unhooked from both neighbors without walking back to the head, except when the node is the head.",
      "If the node matches, point its previous node's next at its next, and point its next node's prev at its previous.",
      "When the matching node has no previous, it is the head, so move the head forward. Save next before you relink, then continue from that saved node.",
      "Consecutive matches are fine if you saved next first. Forgetting to clear the new head's prev leaves the backward link aimed at a removed node.",
    ],
    tests: [
      { input: { values: [2, 1, 2, 3, 2], key: 2 }, expectedOutput: [1, 3], visibility: "SAMPLE" },
      { input: { values: [4, 4, 4], key: 4 }, expectedOutput: [], visibility: "SAMPLE" },
      { input: { values: [], key: 1 }, expectedOutput: [], visibility: "HIDDEN" },
      { input: { values: [1, 3, 5], key: 9 }, expectedOutput: [1, 3, 5], visibility: "HIDDEN" },
      { input: { values: [7, 7, 1], key: 7 }, expectedOutput: [1], visibility: "HIDDEN" },
    ],
  }),
  problem({
    slug: "dll-pairs",
    title: "Find Pairs with Given Sum in Doubly Linked List",
    difficulty: "MEDIUM",
    topics: ["linked-lists"],
    tags: ["two-pointers"],
    statement:
      "A doubly linked list is sorted in non-decreasing order. Find every pair of distinct nodes whose values add up to the target. Return the pairs as [left value, right value], in the order a scan from the two ends would discover them. A pair uses two different nodes.",
    constraints: ["0 <= list length <= 1000", "-1000 <= node value, target <= 1000", "the list is sorted non-decreasing"],
    examples: [
      { input: "values = [1, 2, 3, 4, 6], target = 7", output: "[[1, 6], [3, 4]]" },
      { input: "values = [1, 1, 1], target = 2", output: "[[1, 1]]" },
    ],
    signature: "vector<vector<int>> findPairs(DoublyNode* head, int target)",
    functionName: "findPairs",
    note: DOUBLY_NOTE,
    driver: `auto head = buildDoubly(in["values"]);\n    auto pairs = sol.findPairs(head, (int)in["target"].asInt());\n    Json out;\n    out.type = Json::ARR;\n    for (const auto& row : pairs) out.a.push_back(Json::ints(row));\n    printJson(out);`,
    method: `vector<vector<int>> findPairs(DoublyNode* head, int target) {
        vector<vector<int>> pairs;
        if (!head) return pairs;
        DoublyNode* right = head;
        while (right->next) right = right->next;
        DoublyNode* left = head;
        while (left != right && right->next != left) {
            long long sum = (long long)left->val + right->val;
            if (sum == target) {
                pairs.push_back({left->val, right->val});
                left = left->next;
                right = right->prev;
            } else if (sum < target) left = left->next;
            else right = right->prev;
        }
        return pairs;
    }`,
    expectedTime: "O(n)",
    expectedSpace: "O(1)",
    hints: [
      "The list is sorted and you can start at both ends. That is the same two-pointer idea as a sorted array, using next and prev instead of indexes.",
      "Put one pointer on the head and another on the tail. Compare their sum with the target.",
      "If the sum is too small, move the left pointer forward. If it is too large, move the right pointer backward. If it matches, record the pair and move both. Stop when the pointers meet or cross.",
      "A node must not pair with itself, so the loop ends when the two pointers land on the same node. The extra memory is the answer. The scan itself is one pass inward.",
    ],
    tests: [
      { input: { values: [1, 2, 3, 4, 6], target: 7 }, expectedOutput: [[1, 6], [3, 4]], visibility: "SAMPLE" },
      { input: { values: [1, 1, 1], target: 2 }, expectedOutput: [[1, 1]], visibility: "SAMPLE" },
      { input: { values: [], target: 0 }, expectedOutput: [], visibility: "HIDDEN" },
      { input: { values: [1, 2, 2, 3], target: 4 }, expectedOutput: [[1, 3], [2, 2]], visibility: "HIDDEN" },
      { input: { values: [5], target: 10 }, expectedOutput: [], visibility: "HIDDEN" },
    ],
  }),
  problem({
    slug: "dll-unique",
    title: "Remove Duplicates from Sorted DLL",
    difficulty: "HARD",
    topics: ["linked-lists"],
    tags: ["doubly-linked-list"],
    statement:
      "A doubly linked list is sorted in non-decreasing order. Remove extra copies so each value remains once, keeping the first node of each run. Return the head with both directions still consistent.",
    constraints: ["0 <= list length <= 1000", "-1000 <= node value <= 1000", "the list is sorted non-decreasing"],
    examples: [
      { input: "values = [1, 1, 2, 3, 3]", output: "[1, 2, 3]" },
      { input: "values = [5, 5, 5]", output: "[5]" },
    ],
    signature: "DoublyNode* removeDuplicates(DoublyNode* head)",
    functionName: "removeDuplicates",
    note: DOUBLY_NOTE,
    driver: doublyOut("sol.removeDuplicates(head)"),
    method: `DoublyNode* removeDuplicates(DoublyNode* head) {
        DoublyNode* cur = head;
        while (cur && cur->next) {
            if (cur->val == cur->next->val) {
                DoublyNode* drop = cur->next;
                cur->next = drop->next;
                if (drop->next) drop->next->prev = cur;
            } else cur = cur->next;
        }
        return head;
    }`,
    expectedTime: "O(n)",
    expectedSpace: "O(1)",
    hints: [
      "Because the list is sorted, duplicates sit next to each other. You only compare a node with the one after it.",
      "When the next value matches, unlink that next node and repair the following node's prev.",
      "Stay on the current node after a deletion so a run of three or more collapses fully. Move forward only when the next value differs.",
      "The head never changes, because the first node of the whole list is the first of its run. The backward pointer of the node after a deleted duplicate must be updated or the reverse walk skips.",
    ],
    tests: [
      { input: { values: [1, 1, 2, 3, 3] }, expectedOutput: [1, 2, 3], visibility: "SAMPLE" },
      { input: { values: [5, 5, 5] }, expectedOutput: [5], visibility: "SAMPLE" },
      { input: { values: [] }, expectedOutput: [], visibility: "HIDDEN" },
      { input: { values: [1, 2, 3] }, expectedOutput: [1, 2, 3], visibility: "HIDDEN" },
      { input: { values: [-1, -1, 0, 0] }, expectedOutput: [-1, 0], visibility: "HIDDEN" },
    ],
  }),
  problem({
    slug: "reverse-groups",
    title: "Reverse Nodes in k-Group",
    difficulty: "HARD",
    topics: ["linked-lists"],
    tags: ["linked-list"],
    statement:
      "Reverse every group of k nodes in a singly linked list and return the new head. If fewer than k nodes remain at the end, leave that tail as it is. k is at least 1 and at most the length.",
    constraints: ["1 <= list length <= 500", "1 <= k <= list length", "-1000 <= node value <= 1000"],
    examples: [
      { input: "values = [9, 8, 7, 6, 5], k = 3", output: "[7, 8, 9, 6, 5]" },
      { input: "values = [9, 8, 7], k = 3", output: "[7, 8, 9]" },
    ],
    signature: "ListNode* reverseKGroup(ListNode* head, int k)",
    functionName: "reverseKGroup",
    note: LIST_NOTE,
    driver: `auto head = buildList(in["values"]);\n    printJson(listToJson(sol.reverseKGroup(head, (int)in["k"].asInt())));`,
    method: `ListNode* reverseKGroup(ListNode* head, int k) {
        ListNode* node = head;
        for (int i = 0; i < k; i++) {
            if (!node) return head;
            node = node->next;
        }
        ListNode* prev = nullptr;
        ListNode* cur = head;
        for (int i = 0; i < k; i++) {
            ListNode* nxt = cur->next;
            cur->next = prev;
            prev = cur;
            cur = nxt;
        }
        head->next = reverseKGroup(cur, k);
        return prev;
    }`,
    expectedTime: "O(n)",
    expectedSpace: "O(n / k)",
    hints: [
      "Count k nodes before you reverse. If you cannot, that remaining piece stays in its original order.",
      "Reverse the k nodes with the usual previous-pointer walk. The old group head becomes the tail of the group.",
      "The node after the reversed group is the start of the next group. Attach the recursive result to the old group head, and return the old group tail as this group's new head.",
      "Check that k nodes exist before reversing. Reversing a short tail and then trying to undo it is how the last group gets scrambled. k equal to 1 changes nothing.",
    ],
    tests: [
      { input: { values: [9, 8, 7, 6, 5], k: 3 }, expectedOutput: [7, 8, 9, 6, 5], visibility: "SAMPLE" },
      { input: { values: [9, 8, 7], k: 3 }, expectedOutput: [7, 8, 9], visibility: "SAMPLE" },
      { input: { values: [1, 2, 3, 4], k: 2 }, expectedOutput: [2, 1, 4, 3], visibility: "HIDDEN" },
      { input: { values: [1, 2, 3, 4], k: 1 }, expectedOutput: [1, 2, 3, 4], visibility: "HIDDEN" },
      { input: { values: [1, 2, 3], k: 2 }, expectedOutput: [2, 1, 3], visibility: "HIDDEN" },
    ],
  }),
  problem({
    slug: "spin-chain",
    title: "Rotate List",
    difficulty: "HARD",
    topics: ["linked-lists"],
    tags: ["linked-list"],
    statement:
      "Rotate a singly linked list to the right by k places and return the new head. k may be larger than the length. Rotating an empty list leaves it empty.",
    constraints: ["0 <= list length <= 500", "0 <= k <= 1000000000", "-1000 <= node value <= 1000"],
    examples: [
      { input: "values = [8, 3, 1, 6], k = 1", output: "[6, 8, 3, 1]" },
      { input: "values = [8, 3, 1, 6], k = 5", output: "[6, 8, 3, 1]" },
    ],
    signature: "ListNode* rotateRight(ListNode* head, int k)",
    functionName: "rotateRight",
    note: LIST_NOTE,
    driver: `auto head = buildList(in["values"]);\n    printJson(listToJson(sol.rotateRight(head, (int)in["k"].asInt())));`,
    method: `ListNode* rotateRight(ListNode* head, int k) {
        if (!head || !head->next || k == 0) return head;
        int n = 1;
        ListNode* tail = head;
        while (tail->next) {
            tail = tail->next;
            n++;
        }
        k %= n;
        if (k == 0) return head;
        ListNode* cur = head;
        for (int i = 0; i < n - k - 1; i++) cur = cur->next;
        ListNode* nextHead = cur->next;
        cur->next = nullptr;
        tail->next = head;
        return nextHead;
    }`,
    expectedTime: "O(n)",
    expectedSpace: "O(1)",
    hints: [
      "A right rotation by k moves the last k nodes in front of the first node. Rotating by the length, or by any multiple of the length, changes nothing.",
      "Count the nodes and reduce k with modulo. Close the list into a circle by pointing the tail at the head, then find the new break.",
      "The new tail is n - k steps from the old head. Cut after that node and return the node that follows it.",
      "Do the modulo before you walk, or a huge k will loop far past the list. Remember to break the circle; otherwise the judge's walk never ends.",
    ],
    tests: [
      { input: { values: [8, 3, 1, 6], k: 1 }, expectedOutput: [6, 8, 3, 1], visibility: "SAMPLE" },
      { input: { values: [8, 3, 1, 6], k: 5 }, expectedOutput: [6, 8, 3, 1], visibility: "SAMPLE" },
      { input: { values: [], k: 3 }, expectedOutput: [], visibility: "HIDDEN" },
      { input: { values: [4], k: 10 }, expectedOutput: [4], visibility: "HIDDEN" },
      { input: { values: [1, 2, 3], k: 0 }, expectedOutput: [1, 2, 3], visibility: "HIDDEN" },
      { input: { values: [1, 2, 3, 4, 5], k: 2 }, expectedOutput: [4, 5, 1, 2, 3], visibility: "HIDDEN" },
    ],
  }),
  problem({
    slug: "flatten-columns",
    title: "Flattening of a Linked List",
    difficulty: "HARD",
    topics: ["linked-lists"],
    tags: ["linked-list"],
    statement:
      "A list is arranged in columns. Each column is sorted and linked downward through bottom. The column heads are linked left to right through next. Merge every value into one sorted downward chain and return its head. In the result, follow bottom, and every next pointer is null.",
    constraints: ["1 <= number of columns <= 50", "1 <= each column length <= 50", "-1000 <= value <= 1000", "each column is sorted non-decreasing"],
    examples: [
      { input: "columns = [[3, 8], [4, 10], [6]]", output: "[3, 4, 6, 8, 10]" },
      { input: "columns = [[1, 2]]", output: "[1, 2]" },
    ],
    signature: "ChildNode* flatten(ChildNode* head)",
    functionName: "flatten",
    note: CHILD_NOTE,
    driver: `auto head = buildColumns(in["columns"]);\n    printJson(bottomToJson(sol.flatten(head)));`,
    method: `ChildNode* flatten(ChildNode* head) {
        std::function<ChildNode*(ChildNode*, ChildNode*)> merge = [](ChildNode* a, ChildNode* b) -> ChildNode* {
            ChildNode dummy(0);
            ChildNode* tail = &dummy;
            while (a && b) {
                if (a->val <= b->val) { tail->bottom = a; a = a->bottom; }
                else { tail->bottom = b; b = b->bottom; }
                tail = tail->bottom;
                tail->next = nullptr;
            }
            tail->bottom = a ? a : b;
            for (ChildNode* cur = tail->bottom; cur; cur = cur->bottom) cur->next = nullptr;
            return dummy.bottom;
        };
        std::function<ChildNode*(ChildNode*)> flat = [&](ChildNode* node) -> ChildNode* {
            if (!node || !node->next) {
                for (ChildNode* cur = node; cur; cur = cur->bottom) cur->next = nullptr;
                return node;
            }
            ChildNode* rest = flat(node->next);
            node->next = nullptr;
            return merge(node, rest);
        };
        return flat(head);
    }`,
    expectedTime: "O(n log c)",
    expectedSpace: "O(c)",
    hints: [
      "Each column is already sorted downward. Flattening the columns to the right first gives you one sorted chain you can merge with the current column.",
      "Recurse on next so the rest of the row becomes a single bottom chain. Then merge the current column with that chain by always taking the smaller bottom node.",
      "Clear next on every node you attach. The merged chain uses only bottom.",
      "Merging from the left without flattening the right side first still works if you merge column by column, but each node must lose its horizontal link. A leftover next makes the result fail even when the downward values look sorted.",
    ],
    tests: [
      { input: { columns: [[3, 8], [4, 10], [6]] }, expectedOutput: [3, 4, 6, 8, 10], visibility: "SAMPLE" },
      { input: { columns: [[1, 2]] }, expectedOutput: [1, 2], visibility: "SAMPLE" },
      { input: { columns: [[1], [2], [3]] }, expectedOutput: [1, 2, 3], visibility: "HIDDEN" },
      { input: { columns: [[1, 4], [2, 3]] }, expectedOutput: [1, 2, 3, 4], visibility: "HIDDEN" },
      { input: { columns: [[5, 5], [5]] }, expectedOutput: [5, 5, 5], visibility: "HIDDEN" },
    ],
  }),
  problem({
    slug: "clone-random",
    title: "Copy List with Random Pointer",
    difficulty: "HARD",
    topics: ["linked-lists"],
    tags: ["linked-list"],
    statement:
      "Each node has a next pointer and a random pointer. The random pointer is null or some node in the same list, including the node itself. Return a deep copy. The copy must be built from new nodes, and each copied random pointer must aim at the copy of the original target.\n\nThe list is shown as pairs [value, random index]. A random index of -1 means null.",
    constraints: ["0 <= number of nodes <= 500", "-1000 <= node value <= 1000", "random index is -1 or a valid index"],
    examples: [
      { input: "nodes = [[1, 1], [2, 0]]", output: "[[1, 1], [2, 0]]" },
      { input: "nodes = [[4, 0]]", output: "[[4, 0]]" },
    ],
    signature: "RandomNode* copyRandom(RandomNode* head)",
    functionName: "copyRandom",
    note: RANDOM_NOTE,
    driver: `auto original = buildRandom(in["nodes"]);\n    printJson(randomToJson(sol.copyRandom(original), original));`,
    method: `RandomNode* copyRandom(RandomNode* head) {
        if (!head) return nullptr;
        for (auto* cur = head; cur; cur = cur->next->next) {
            auto* copy = new RandomNode(cur->val);
            copy->next = cur->next;
            cur->next = copy;
        }
        for (auto* cur = head; cur; cur = cur->next->next) {
            if (cur->random) cur->next->random = cur->random->next;
        }
        RandomNode* copyHead = head->next;
        for (auto* cur = head; cur; cur = cur->next) {
            auto* copy = cur->next;
            cur->next = copy->next;
            copy->next = copy->next ? copy->next->next : nullptr;
        }
        return copyHead;
    }`,
    expectedTime: "O(n)",
    expectedSpace: "O(1)",
    hints: [
      "A map from each original node to its copy makes the random links easy, at the cost of extra memory. You can also weave each copy in front of the next original node and avoid the map.",
      "Insert a copy between a node and its next. The copy of a node is then that node's next.",
      "Set each copy's random to original->random->next, which is the copy of the random target. Then unweave the lists so the originals follow originals and the copies follow copies.",
      "Restore the original next pointers while you separate the lists. If a copy's random still points at an original node, it is one step short: the woven copy sits immediately after that original.",
    ],
    tests: [
      { input: { nodes: [[1, 1], [2, 0]] }, expectedOutput: [[1, 1], [2, 0]], visibility: "SAMPLE" },
      { input: { nodes: [[4, 0]] }, expectedOutput: [[4, 0]], visibility: "SAMPLE" },
      { input: { nodes: [] }, expectedOutput: [], visibility: "HIDDEN" },
      { input: { nodes: [[5, -1]] }, expectedOutput: [[5, -1]], visibility: "HIDDEN" },
      { input: { nodes: [[3, -1], [8, 0], [6, 1]] }, expectedOutput: [[3, -1], [8, 0], [6, 1]], visibility: "HIDDEN" },
    ],
  }),
];
