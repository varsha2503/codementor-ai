import { problem } from "./helpers.js";

const bounds = ["0 <= values.length <= 1000", "-10000 <= values[i] <= 10000"];

export const sortingProblems = [
  problem({
    slug: "selection-sort",
    title: "Selection Sort",
    difficulty: "EASY",
    topics: ["sorting", "arrays"],
    tags: ["selection-sort"],
    statement:
      "A loading dock has one row of crates, each stamped with an integer weight. Arrange the row from lightest to heaviest.\n\nDo it by selection: for each position from the left, find the lightest crate still sitting to the right, including that position, and swap it into place. Return the row after every position has been filled.",
    constraints: bounds,
    examples: [
      { input: "values = [64, 25, 12, 22, 11]", output: "[11, 12, 22, 25, 64]", explanation: "11 is placed first, then 12, then 22, then 25." },
      { input: "values = [3, 1, 2]", output: "[1, 2, 3]" },
    ],
    signature: "vector<int> selectionSort(vector<int>& values)",
    functionName: "selectionSort",
    driver: `auto values = in["values"].asIntVector();\n    printJson(Json::ints(sol.selectionSort(values)));`,
    method: `vector<int> selectionSort(vector<int>& values) {
        int n = (int)values.size();
        for (int i = 0; i < n; i++) {
            int best = i;
            for (int j = i + 1; j < n; j++) if (values[j] < values[best]) best = j;
            swap(values[i], values[best]);
        }
        return values;
    }`,
    expectedTime: "O(n^2)",
    expectedSpace: "O(1)",
    hints: [
      "The left side of the row can grow as a finished prefix. Each step only needs to choose which crate belongs at the next open position.",
      "You do not need an extra array. Track the index of the smallest value in the unsorted suffix, then swap it with the start of that suffix.",
      "For index i, scan j from i + 1 to the end. If values[j] is smaller than the current best, remember j. After the scan, swap i with that index.",
      "The outer loop runs once per position and the inner scan looks at the remaining crates, so the time is quadratic and the extra memory is a handful of indexes. Equal weights can stay in either order.",
    ],
    tests: [
      { input: { values: [64, 25, 12, 22, 11] }, expectedOutput: [11, 12, 22, 25, 64], visibility: "SAMPLE" },
      { input: { values: [3, 1, 2] }, expectedOutput: [1, 2, 3], visibility: "SAMPLE" },
      { input: { values: [] }, expectedOutput: [], visibility: "HIDDEN" },
      { input: { values: [7] }, expectedOutput: [7], visibility: "HIDDEN" },
      { input: { values: [3, 3, 1] }, expectedOutput: [1, 3, 3], visibility: "HIDDEN" },
      { input: { values: [9, 8, 7, 6] }, expectedOutput: [6, 7, 8, 9], visibility: "HIDDEN" },
      { input: { values: [-2, 0, -5, 3] }, expectedOutput: [-5, -2, 0, 3], visibility: "HIDDEN" },
    ],
  }),
  problem({
    slug: "bubble-sort",
    title: "Bubble Sort",
    difficulty: "EASY",
    topics: ["sorting", "arrays"],
    tags: ["bubble-sort"],
    statement:
      "Cars are parked in one lane, and each car has an integer priority. A lower number should end up closer to the exit, on the left.\n\nWalk the lane from left to right. Whenever two neighbors are out of order, swap them. Repeat full passes until a pass makes no swaps. Return the lane.",
    constraints: bounds,
    examples: [
      { input: "values = [5, 1, 4, 2, 8]", output: "[1, 2, 4, 5, 8]", explanation: "Each pass floats the largest remaining priority to the right." },
      { input: "values = [1, 2, 3]", output: "[1, 2, 3]", explanation: "One pass with no swaps is enough." },
    ],
    signature: "vector<int> bubbleSort(vector<int>& values)",
    functionName: "bubbleSort",
    driver: `auto values = in["values"].asIntVector();\n    printJson(Json::ints(sol.bubbleSort(values)));`,
    method: `vector<int> bubbleSort(vector<int>& values) {
        int n = (int)values.size();
        for (int i = 0; i < n; i++) {
            bool swapped = false;
            for (int j = 0; j + 1 < n - i; j++) {
                if (values[j] > values[j + 1]) {
                    swap(values[j], values[j + 1]);
                    swapped = true;
                }
            }
            if (!swapped) break;
        }
        return values;
    }`,
    expectedTime: "O(n^2)",
    expectedSpace: "O(1)",
    hints: [
      "A large priority only needs to move one spot per comparison. After one full walk, where does the largest remaining car sit?",
      "Compare only neighbors. A boolean can record whether the latest walk swapped anything. If it did not, the lane is finished.",
      "On pass i, the last i cars are already in their final places, so the inner walk can stop at n - i - 1. Swap when values[j] > values[j + 1].",
      "Worst case is a reverse-sorted lane: about n passes of n comparisons, with only a few local variables of extra memory. Stop early when a pass is quiet.",
    ],
    tests: [
      { input: { values: [5, 1, 4, 2, 8] }, expectedOutput: [1, 2, 4, 5, 8], visibility: "SAMPLE" },
      { input: { values: [1, 2, 3] }, expectedOutput: [1, 2, 3], visibility: "SAMPLE" },
      { input: { values: [] }, expectedOutput: [], visibility: "HIDDEN" },
      { input: { values: [4, 4, 4] }, expectedOutput: [4, 4, 4], visibility: "HIDDEN" },
      { input: { values: [2, 1] }, expectedOutput: [1, 2], visibility: "HIDDEN" },
      { input: { values: [10, -1, 10, 0] }, expectedOutput: [-1, 0, 10, 10], visibility: "HIDDEN" },
      { input: { values: [9, 7, 5, 3, 1] }, expectedOutput: [1, 3, 5, 7, 9], visibility: "HIDDEN" },
    ],
  }),
  problem({
    slug: "insertion-sort",
    title: "Insertion Sort",
    difficulty: "EASY",
    topics: ["sorting", "arrays"],
    tags: ["insertion-sort"],
    statement:
      "You are sorting a hand of numbered cards. The cards already in your hand stay in order. Each new card is slid left until it sits between the cards it belongs beside.\n\nTreat the first card as a sorted hand of one. For every later card, insert it into that hand. Return the hand.",
    constraints: bounds,
    examples: [
      { input: "values = [12, 11, 13, 5, 6]", output: "[5, 6, 11, 12, 13]", explanation: "5 slides to the front, then 6 slides in after it." },
      { input: "values = [4, 3, 2, 1]", output: "[1, 2, 3, 4]" },
    ],
    signature: "vector<int> insertionSort(vector<int>& values)",
    functionName: "insertionSort",
    driver: `auto values = in["values"].asIntVector();\n    printJson(Json::ints(sol.insertionSort(values)));`,
    method: `vector<int> insertionSort(vector<int>& values) {
        for (int i = 1; i < (int)values.size(); i++) {
            int key = values[i];
            int j = i - 1;
            while (j >= 0 && values[j] > key) {
                values[j + 1] = values[j];
                j--;
            }
            values[j + 1] = key;
        }
        return values;
    }`,
    expectedTime: "O(n^2)",
    expectedSpace: "O(1)",
    hints: [
      "At the moment you pick up card i, the cards before it can already be in order. The only open question is where this card belongs inside that prefix.",
      "Hold the new card in a temporary variable so shifting the larger cards one step right does not erase it.",
      "Start j at i - 1. While j is still inside the hand and values[j] is greater than the saved card, copy values[j] into values[j + 1] and move j left. Write the saved card at j + 1.",
      "Each insertion can shift the whole prefix, so the worst case is quadratic. Extra memory is the saved card and the index. A card equal to its neighbor can stay on the right, which keeps equal cards in their original relative order.",
    ],
    tests: [
      { input: { values: [12, 11, 13, 5, 6] }, expectedOutput: [5, 6, 11, 12, 13], visibility: "SAMPLE" },
      { input: { values: [4, 3, 2, 1] }, expectedOutput: [1, 2, 3, 4], visibility: "SAMPLE" },
      { input: { values: [] }, expectedOutput: [], visibility: "HIDDEN" },
      { input: { values: [8] }, expectedOutput: [8], visibility: "HIDDEN" },
      { input: { values: [1, 2, 2, 1] }, expectedOutput: [1, 1, 2, 2], visibility: "HIDDEN" },
      { input: { values: [-3, -1, -2] }, expectedOutput: [-3, -2, -1], visibility: "HIDDEN" },
      { input: { values: [2, 2, 2] }, expectedOutput: [2, 2, 2], visibility: "HIDDEN" },
    ],
  }),
  problem({
    slug: "merge-sort",
    title: "Merge Sort",
    difficulty: "MEDIUM",
    topics: ["sorting", "recursion"],
    tags: ["merge-sort"],
    statement:
      "A roster of integer scores is too long to sort in one glance. Split it into two halves, sort each half the same way, then merge the two sorted halves into one non-decreasing list.\n\nReturn that list. A half with fewer than two scores is already sorted.",
    constraints: bounds,
    examples: [
      { input: "values = [38, 27, 43, 3, 9, 82, 10]", output: "[3, 9, 10, 27, 38, 43, 82]", explanation: "The halves are sorted separately, then merged by always taking the smaller head." },
      { input: "values = [2, 1]", output: "[1, 2]" },
    ],
    signature: "vector<int> mergeSort(vector<int>& values)",
    functionName: "mergeSort",
    driver: `auto values = in["values"].asIntVector();\n    printJson(Json::ints(sol.mergeSort(values)));`,
    method: `vector<int> mergeSort(vector<int>& values) {
        function<void(int, int)> rec = [&](int lo, int hi) {
            if (hi - lo <= 1) return;
            int mid = lo + (hi - lo) / 2;
            rec(lo, mid);
            rec(mid, hi);
            vector<int> merged;
            int i = lo, j = mid;
            while (i < mid && j < hi) {
                if (values[i] <= values[j]) merged.push_back(values[i++]);
                else merged.push_back(values[j++]);
            }
            while (i < mid) merged.push_back(values[i++]);
            while (j < hi) merged.push_back(values[j++]);
            for (int k = 0; k < (int)merged.size(); k++) values[lo + k] = merged[k];
        };
        rec(0, (int)values.size());
        return values;
    }`,
    expectedTime: "O(n log n)",
    expectedSpace: "O(n)",
    hints: [
      "Sorting the whole roster at once is the hard part. What becomes easy if you already have two shorter rosters that are each in order?",
      "The merge needs a temporary buffer. Two indexes walk the sorted halves, and you always append the smaller current head.",
      "Recurse on [lo, mid) and [mid, hi). Stop when the range has fewer than two elements. When merging, take values[i] when it is less than or equal to values[j], so equal scores from the left half stay ahead.",
      "Each level of splits does linear work to merge, and there are about log n levels, so the time is n log n. The buffer is linear in the roster length. The base case is a range of length 0 or 1.",
    ],
    tests: [
      { input: { values: [38, 27, 43, 3, 9, 82, 10] }, expectedOutput: [3, 9, 10, 27, 38, 43, 82], visibility: "SAMPLE" },
      { input: { values: [2, 1] }, expectedOutput: [1, 2], visibility: "SAMPLE" },
      { input: { values: [] }, expectedOutput: [], visibility: "HIDDEN" },
      { input: { values: [1] }, expectedOutput: [1], visibility: "HIDDEN" },
      { input: { values: [5, 5, 1, 5] }, expectedOutput: [1, 5, 5, 5], visibility: "HIDDEN" },
      { input: { values: [4, 3, 2, 1, 0] }, expectedOutput: [0, 1, 2, 3, 4], visibility: "HIDDEN" },
      { input: { values: [-10, 8, -10, 0] }, expectedOutput: [-10, -10, 0, 8], visibility: "HIDDEN" },
    ],
  }),
  problem({
    slug: "recursive-bubble-sort",
    title: "Recursive Bubble Sort",
    difficulty: "EASY",
    topics: ["sorting", "recursion"],
    tags: ["bubble-sort"],
    statement:
      "The same lane of integer priorities needs to be ordered from small to large, but each pass should be one recursive call rather than an outer loop.\n\nA call responsible for the first n cars walks those cars once and swaps every adjacent pair that is out of order. The largest of those n cars ends at position n - 1. The call then repeats the job for the first n - 1 cars. Stop when fewer than two cars remain. Return the lane.",
    constraints: bounds,
    examples: [
      { input: "values = [6, 2, 5, 1]", output: "[1, 2, 5, 6]", explanation: "The first call parks 6 at the end, the next parks 5, then 2." },
      { input: "values = [1]", output: "[1]" },
    ],
    signature: "vector<int> recursiveBubbleSort(vector<int>& values)",
    functionName: "recursiveBubbleSort",
    driver: `auto values = in["values"].asIntVector();\n    printJson(Json::ints(sol.recursiveBubbleSort(values)));`,
    method: `vector<int> recursiveBubbleSort(vector<int>& values) {
        function<void(int)> rec = [&](int n) {
            if (n <= 1) return;
            for (int i = 0; i + 1 < n; i++) {
                if (values[i] > values[i + 1]) swap(values[i], values[i + 1]);
            }
            rec(n - 1);
        };
        rec((int)values.size());
        return values;
    }`,
    expectedTime: "O(n^2)",
    expectedSpace: "O(n)",
    hints: [
      "After one adjacent walk over the first n cars, one car is finished. Which index can the next recursive call ignore?",
      "The recursion shrinks the problem size by one car. The call stack is the outer loop you would otherwise write.",
      "If n is less than 2, return. Otherwise swap every values[i] > values[i + 1] for i from 0 through n - 2, then recurse with n - 1.",
      "There are n walks and each walk is shorter than the last, so the time is still quadratic. The extra memory is the recursion depth, which is linear in the number of cars.",
    ],
    tests: [
      { input: { values: [6, 2, 5, 1] }, expectedOutput: [1, 2, 5, 6], visibility: "SAMPLE" },
      { input: { values: [1] }, expectedOutput: [1], visibility: "SAMPLE" },
      { input: { values: [] }, expectedOutput: [], visibility: "HIDDEN" },
      { input: { values: [2, 1] }, expectedOutput: [1, 2], visibility: "HIDDEN" },
      { input: { values: [4, 4, 2, 4] }, expectedOutput: [2, 4, 4, 4], visibility: "HIDDEN" },
      { input: { values: [0, -1, -1, 3] }, expectedOutput: [-1, -1, 0, 3], visibility: "HIDDEN" },
      { input: { values: [8, 7, 6, 5, 4] }, expectedOutput: [4, 5, 6, 7, 8], visibility: "HIDDEN" },
    ],
  }),
  problem({
    slug: "recursive-insertion-sort",
    title: "Recursive Insertion Sort",
    difficulty: "EASY",
    topics: ["sorting", "recursion"],
    tags: ["insertion-sort"],
    statement:
      "Sort a row of integer badges into non-decreasing order by recursion. To place n badges, first sort the first n - 1 badges the same way, then slide the last badge left through that sorted prefix until it is in order.\n\nA row of fewer than two badges is already sorted. Return the row.",
    constraints: bounds,
    examples: [
      { input: "values = [3, 1, 4, 2]", output: "[1, 2, 3, 4]", explanation: "The prefix of three is sorted first, then 2 slides between 1 and 3." },
      { input: "values = [9, 8]", output: "[8, 9]" },
    ],
    signature: "vector<int> recursiveInsertionSort(vector<int>& values)",
    functionName: "recursiveInsertionSort",
    driver: `auto values = in["values"].asIntVector();\n    printJson(Json::ints(sol.recursiveInsertionSort(values)));`,
    method: `vector<int> recursiveInsertionSort(vector<int>& values) {
        function<void(int)> rec = [&](int n) {
            if (n <= 1) return;
            rec(n - 1);
            int key = values[n - 1];
            int j = n - 2;
            while (j >= 0 && values[j] > key) {
                values[j + 1] = values[j];
                j--;
            }
            values[j + 1] = key;
        };
        rec((int)values.size());
        return values;
    }`,
    expectedTime: "O(n^2)",
    expectedSpace: "O(n)",
    hints: [
      "The recursive call should finish the prefix before you touch the last badge. What do you know about the first n - 1 badges when that call returns?",
      "Save the last badge before you shift larger badges to the right, or the value you are inserting will be overwritten.",
      "Recurse on n - 1 when n is at least 2. Then let key be values[n - 1] and walk j left from n - 2 while values[j] is greater than key, copying each badge one step right. Store key at j + 1.",
      "Every badge can slide past the whole prefix, so the time is quadratic. The call depth is linear, which is the extra memory beyond the row itself.",
    ],
    tests: [
      { input: { values: [3, 1, 4, 2] }, expectedOutput: [1, 2, 3, 4], visibility: "SAMPLE" },
      { input: { values: [9, 8] }, expectedOutput: [8, 9], visibility: "SAMPLE" },
      { input: { values: [] }, expectedOutput: [], visibility: "HIDDEN" },
      { input: { values: [5] }, expectedOutput: [5], visibility: "HIDDEN" },
      { input: { values: [1, 3, 2, 2] }, expectedOutput: [1, 2, 2, 3], visibility: "HIDDEN" },
      { input: { values: [-4, 7, -4] }, expectedOutput: [-4, -4, 7], visibility: "HIDDEN" },
      { input: { values: [1, 2, 3, 4] }, expectedOutput: [1, 2, 3, 4], visibility: "HIDDEN" },
    ],
  }),
  problem({
    slug: "quick-sort",
    title: "Quick Sort",
    difficulty: "MEDIUM",
    topics: ["sorting", "recursion"],
    tags: ["quick-sort"],
    statement:
      "A bin of integer part numbers should be ordered from small to large. Pick the last number in the current range as the pivot. Rearrange that range so every number before the pivot's final seat is less than or equal to it, and every number after it is greater.\n\nThen sort the left side and the right side the same way. A range with fewer than two numbers is finished. Return the bin.",
    constraints: bounds,
    examples: [
      { input: "values = [10, 7, 8, 9, 1, 5]", output: "[1, 5, 7, 8, 9, 10]", explanation: "5 is the first pivot. Smaller numbers move to its left, then both sides are sorted." },
      { input: "values = [3, 3, 1]", output: "[1, 3, 3]" },
    ],
    signature: "vector<int> quickSort(vector<int>& values)",
    functionName: "quickSort",
    driver: `auto values = in["values"].asIntVector();\n    printJson(Json::ints(sol.quickSort(values)));`,
    method: `vector<int> quickSort(vector<int>& values) {
        function<void(int, int)> rec = [&](int lo, int hi) {
            if (lo >= hi) return;
            int pivot = values[hi];
            int store = lo;
            for (int i = lo; i < hi; i++) {
                if (values[i] <= pivot) {
                    swap(values[store], values[i]);
                    store++;
                }
            }
            swap(values[store], values[hi]);
            rec(lo, store - 1);
            rec(store + 1, hi);
        };
        if (!values.empty()) rec(0, (int)values.size() - 1);
        return values;
    }`,
    expectedTime: "O(n log n) average",
    expectedSpace: "O(log n) average",
    hints: [
      "Once the pivot is sitting in its final seat, the two sides never need to trade values again. What has to be true about every value on the left of that seat?",
      "Use one index as the boundary of the 'small or equal' region. Walk the rest of the range, and swap a value into that region when it belongs on the pivot's left.",
      "Let the pivot be values[hi]. Start store at lo. For each i from lo to hi - 1, if values[i] <= pivot, swap it with values[store] and advance store. Finally swap values[store] with values[hi], then recurse on [lo, store - 1] and [store + 1, hi].",
      "Average time is n log n when the pivot lands near the middle. A pivot that is always the extreme value degrades toward quadratic, which is why the last element of an already sorted range is a weak pivot. Extra memory is the recursion depth. Equal values may go to either side of their twins.",
    ],
    tests: [
      { input: { values: [10, 7, 8, 9, 1, 5] }, expectedOutput: [1, 5, 7, 8, 9, 10], visibility: "SAMPLE" },
      { input: { values: [3, 3, 1] }, expectedOutput: [1, 3, 3], visibility: "SAMPLE" },
      { input: { values: [] }, expectedOutput: [], visibility: "HIDDEN" },
      { input: { values: [4] }, expectedOutput: [4], visibility: "HIDDEN" },
      { input: { values: [1, 2, 3, 4, 5] }, expectedOutput: [1, 2, 3, 4, 5], visibility: "HIDDEN" },
      { input: { values: [5, 4, 3, 2, 1] }, expectedOutput: [1, 2, 3, 4, 5], visibility: "HIDDEN" },
      { input: { values: [-2, 8, -2, 0, 8] }, expectedOutput: [-2, -2, 0, 8, 8], visibility: "HIDDEN" },
    ],
  }),
];
