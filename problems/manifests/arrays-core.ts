import { problem } from "./helpers.js";

const matrixOut = (call: string) =>
  `auto grid = in["grid"].asIntMatrix();\n    auto rows = ${call};\n    Json out;\n    out.type = Json::ARR;\n    for (const auto& row : rows) out.a.push_back(Json::ints(row));\n    printJson(out);`;

const rowsOut = (call: string) =>
  `auto rows = ${call};\n    Json out;\n    out.type = Json::ARR;\n    for (const auto& row : rows) out.a.push_back(Json::ints(row));\n    printJson(out);`;

export const arrayCoreProblems = [
  problem({
    slug: "heaviest-crate",
    title: "Largest Element in an Array",
    difficulty: "EASY",
    topics: ["arrays"],
    tags: ["scan"],
    statement: "A dock row lists crate weights, which may be negative. Return the heaviest weight in the row.",
    constraints: ["1 <= values.length <= 10000", "-10000 <= values[i] <= 10000"],
    examples: [
      { input: "values = [3, 1, 4, 1]", output: "4" },
      { input: "values = [-2, -8, -1]", output: "-1" },
    ],
    signature: "int heaviestCrate(vector<int>& values)",
    functionName: "heaviestCrate",
    driver: `auto values = in["values"].asIntVector();\n    printJson(Json::number(sol.heaviestCrate(values)));`,
    method: `int heaviestCrate(vector<int>& values) {
        int best = values[0];
        for (int value : values) best = max(best, value);
        return best;
    }`,
    expectedTime: "O(n)",
    expectedSpace: "O(1)",
    hints: [
      "You only need one answer, not a new order. What can you remember while you walk the row once?",
      "A single integer is enough. It starts as the first weight.",
      "For each later weight, replace the saved value when the current weight is larger.",
      "One pass is enough. Time is linear and extra memory is one integer. The row may be entirely negative, so do not start the answer at zero.",
    ],
    tests: [
      { input: { values: [3, 1, 4, 1] }, expectedOutput: 4, visibility: "SAMPLE" },
      { input: { values: [-2, -8, -1] }, expectedOutput: -1, visibility: "SAMPLE" },
      { input: { values: [7] }, expectedOutput: 7, visibility: "HIDDEN" },
      { input: { values: [0, 0, 0] }, expectedOutput: 0, visibility: "HIDDEN" },
      { input: { values: [9, 9, 1] }, expectedOutput: 9, visibility: "HIDDEN" },
    ],
  }),
  problem({
    slug: "runner-up-weight",
    title: "Second Largest Element",
    difficulty: "EASY",
    topics: ["arrays"],
    tags: ["scan"],
    statement:
      "Return the second-largest distinct crate weight. The row contains at least two different weights. Repeats of the heaviest weight do not count as the runner-up.",
    constraints: ["2 <= values.length <= 10000", "-10000 <= values[i] <= 10000", "At least two distinct weights."],
    examples: [
      { input: "values = [3, 1, 4, 4]", output: "3", explanation: "4 is heaviest. The next distinct weight is 3." },
      { input: "values = [5, 5, 1]", output: "1" },
    ],
    signature: "int runnerUpWeight(vector<int>& values)",
    functionName: "runnerUpWeight",
    driver: `auto values = in["values"].asIntVector();\n    printJson(Json::number(sol.runnerUpWeight(values)));`,
    method: `int runnerUpWeight(vector<int>& values) {
        int first = INT_MIN, second = INT_MIN;
        for (int value : values) {
            if (value > first) { second = first; first = value; }
            else if (value < first && value > second) second = value;
        }
        return second;
    }`,
    expectedTime: "O(n)",
    expectedSpace: "O(1)",
    hints: [
      "Sorting works, but you only need two ranks. What goes wrong if the second saved weight is updated when it equals the first?",
      "Keep the best and the second best. A repeat of the best should be ignored.",
      "When a weight is greater than the best, the old best becomes second. When it is strictly between them, it becomes second.",
      "One pass and two integers. Initialize both below every allowed weight, or seed them from the first two distinct values. Equal weights must not fill the runner-up slot.",
    ],
    tests: [
      { input: { values: [3, 1, 4, 4] }, expectedOutput: 3, visibility: "SAMPLE" },
      { input: { values: [5, 5, 1] }, expectedOutput: 1, visibility: "SAMPLE" },
      { input: { values: [9, 8, 9, 7] }, expectedOutput: 8, visibility: "HIDDEN" },
      { input: { values: [-1, -5, -1] }, expectedOutput: -5, visibility: "HIDDEN" },
      { input: { values: [2, 2, 3] }, expectedOutput: 2, visibility: "HIDDEN" },
    ],
  }),
  problem({
    slug: "rising-lane",
    title: "Check if the Array Is Sorted",
    difficulty: "EASY",
    topics: ["arrays"],
    tags: ["scan"],
    statement: "A lane of integers is acceptable when each value is less than or equal to the next. Return whether the lane is non-decreasing. A single value is acceptable.",
    constraints: ["1 <= values.length <= 10000", "-10000 <= values[i] <= 10000"],
    examples: [
      { input: "values = [1, 2, 2, 3]", output: "true" },
      { input: "values = [1, 3, 2]", output: "false" },
    ],
    signature: "bool risingLane(vector<int>& values)",
    functionName: "risingLane",
    driver: `auto values = in["values"].asIntVector();\n    printJson(Json::boolean(sol.risingLane(values)));`,
    method: `bool risingLane(vector<int>& values) {
        for (int i = 1; i < (int)values.size(); i++) if (values[i] < values[i - 1]) return false;
        return true;
    }`,
    expectedTime: "O(n)",
    expectedSpace: "O(1)",
    hints: [
      "You do not need the fully sorted copy. Which neighboring pair is enough to reject the lane?",
      "Compare each value only with the one before it.",
      "If values[i] < values[i - 1], return false immediately. If the walk finishes, return true.",
      "One pass, constant extra memory. Equal neighbors are allowed.",
    ],
    tests: [
      { input: { values: [1, 2, 2, 3] }, expectedOutput: true, visibility: "SAMPLE" },
      { input: { values: [1, 3, 2] }, expectedOutput: false, visibility: "SAMPLE" },
      { input: { values: [5] }, expectedOutput: true, visibility: "HIDDEN" },
      { input: { values: [5, 5] }, expectedOutput: true, visibility: "HIDDEN" },
      { input: { values: [1, 2, 3, 2] }, expectedOutput: false, visibility: "HIDDEN" },
    ],
  }),
  problem({
    slug: "compact-badges",
    title: "Remove Duplicates from Sorted Array",
    difficulty: "EASY",
    topics: ["arrays"],
    tags: ["two-pointers"],
    statement: "Badge numbers are already sorted non-decreasing, but repeats are stacked together. Return the distinct numbers in the same order, with each number once.",
    constraints: ["1 <= values.length <= 10000", "-10000 <= values[i] <= 10000", "values is sorted non-decreasing."],
    examples: [
      { input: "values = [1, 1, 2, 3, 3]", output: "[1, 2, 3]" },
      { input: "values = [2, 2, 2]", output: "[2]" },
    ],
    signature: "vector<int> compactBadges(vector<int>& values)",
    functionName: "compactBadges",
    driver: `auto values = in["values"].asIntVector();\n    printJson(Json::ints(sol.compactBadges(values)));`,
    method: `vector<int> compactBadges(vector<int>& values) {
        vector<int> out;
        for (int value : values) if (out.empty() || out.back() != value) out.push_back(value);
        return out;
    }`,
    expectedTime: "O(n)",
    expectedSpace: "O(1) extra beyond the result",
    hints: [
      "Because the row is sorted, a repeat is always next to the previous copy. You never need to search the whole row for an earlier copy.",
      "Write into a new list, or overwrite a prefix of the same array. Keep the last accepted number.",
      "Append a value only when the result is empty or the value differs from the last appended number.",
      "One pass. Extra memory is the result itself if you build a new list. Unsorted input is outside this problem.",
    ],
    tests: [
      { input: { values: [1, 1, 2, 3, 3] }, expectedOutput: [1, 2, 3], visibility: "SAMPLE" },
      { input: { values: [2, 2, 2] }, expectedOutput: [2], visibility: "SAMPLE" },
      { input: { values: [1] }, expectedOutput: [1], visibility: "HIDDEN" },
      { input: { values: [-2, -2, -1, 0, 0] }, expectedOutput: [-2, -1, 0], visibility: "HIDDEN" },
      { input: { values: [4, 5, 6] }, expectedOutput: [4, 5, 6], visibility: "HIDDEN" },
    ],
  }),
  problem({
    slug: "step-forward",
    title: "Left Rotate the Array by One",
    difficulty: "EASY",
    topics: ["arrays"],
    tags: ["rotation"],
    statement: "Move a row of integers one place to the left. The first value wraps around to the end. Return the row.",
    constraints: ["1 <= values.length <= 10000", "-10000 <= values[i] <= 10000"],
    examples: [
      { input: "values = [1, 2, 3, 4]", output: "[2, 3, 4, 1]" },
      { input: "values = [7]", output: "[7]" },
    ],
    signature: "vector<int> stepForward(vector<int>& values)",
    functionName: "stepForward",
    driver: `auto values = in["values"].asIntVector();\n    printJson(Json::ints(sol.stepForward(values)));`,
    method: `vector<int> stepForward(vector<int>& values) {
        if (values.size() <= 1) return values;
        int first = values[0];
        for (int i = 1; i < (int)values.size(); i++) values[i - 1] = values[i];
        values.back() = first;
        return values;
    }`,
    expectedTime: "O(n)",
    expectedSpace: "O(1)",
    hints: [
      "If you write the first value into its new place too early, you lose it. Where should you keep it?",
      "Save the first value, then shift every later value one index left.",
      "After the shift, write the saved value into the last index. A row of one value stays as it is.",
      "One pass and one saved integer. This is a left rotation by one, not by an arbitrary distance.",
    ],
    tests: [
      { input: { values: [1, 2, 3, 4] }, expectedOutput: [2, 3, 4, 1], visibility: "SAMPLE" },
      { input: { values: [7] }, expectedOutput: [7], visibility: "SAMPLE" },
      { input: { values: [2, 1] }, expectedOutput: [1, 2], visibility: "HIDDEN" },
      { input: { values: [-1, 0, 5] }, expectedOutput: [0, 5, -1], visibility: "HIDDEN" },
    ],
  }),
  problem({
    slug: "roll-left",
    title: "Left Rotate the Array by K Places",
    difficulty: "EASY",
    topics: ["arrays"],
    tags: ["rotation"],
    statement:
      "Roll a row of integers left by k places. Values that fall off the front return at the end, in the same order. k may be larger than the row. Return the row.",
    constraints: ["1 <= values.length <= 10000", "0 <= k <= 100000", "-10000 <= values[i] <= 10000"],
    examples: [
      { input: "values = [1, 2, 3, 4, 5], k = 2", output: "[3, 4, 5, 1, 2]" },
      { input: "values = [1, 2], k = 3", output: "[2, 1]", explanation: "3 mod 2 is 1." },
    ],
    signature: "vector<int> rollLeft(vector<int>& values, int k)",
    functionName: "rollLeft",
    driver: `auto values = in["values"].asIntVector();\n    printJson(Json::ints(sol.rollLeft(values, (int)in["k"].asInt())));`,
    method: `vector<int> rollLeft(vector<int>& values, int k) {
        int n = (int)values.size();
        k %= n;
        if (k == 0) return values;
        reverse(values.begin(), values.begin() + k);
        reverse(values.begin() + k, values.end());
        reverse(values.begin(), values.end());
        return values;
    }`,
    expectedTime: "O(n)",
    expectedSpace: "O(1)",
    hints: [
      "Rolling one step, k times, repeats the same work, and k can be huge. Which smaller roll matches it?",
      "Reduce k with the length first. Reversing three ranges can finish the roll without another array.",
      "Let k = k % n. Reverse the first k values, reverse the rest, then reverse the whole row.",
      "After the modulo, the work is linear and the extra memory is a few indexes. k equal to a multiple of the length leaves the row unchanged.",
    ],
    tests: [
      { input: { values: [1, 2, 3, 4, 5], k: 2 }, expectedOutput: [3, 4, 5, 1, 2], visibility: "SAMPLE" },
      { input: { values: [1, 2], k: 3 }, expectedOutput: [2, 1], visibility: "SAMPLE" },
      { input: { values: [4, 5, 6], k: 0 }, expectedOutput: [4, 5, 6], visibility: "HIDDEN" },
      { input: { values: [1, 2, 3], k: 3 }, expectedOutput: [1, 2, 3], visibility: "HIDDEN" },
      { input: { values: [9], k: 100 }, expectedOutput: [9], visibility: "HIDDEN" },
    ],
  }),
  problem({
    slug: "zeros-to-the-back",
    title: "Move All Zeros to the End",
    difficulty: "EASY",
    topics: ["arrays"],
    tags: ["two-pointers"],
    statement: "Move every zero in a row to the end. Keep the relative order of the non-zero values. Return the row.",
    constraints: ["1 <= values.length <= 10000", "-10000 <= values[i] <= 10000"],
    examples: [
      { input: "values = [0, 1, 0, 3, 12]", output: "[1, 3, 12, 0, 0]" },
      { input: "values = [1, 2]", output: "[1, 2]" },
    ],
    signature: "vector<int> zerosToTheBack(vector<int>& values)",
    functionName: "zerosToTheBack",
    driver: `auto values = in["values"].asIntVector();\n    printJson(Json::ints(sol.zerosToTheBack(values)));`,
    method: `vector<int> zerosToTheBack(vector<int>& values) {
        int write = 0;
        for (int value : values) if (value != 0) values[write++] = value;
        while (write < (int)values.size()) values[write++] = 0;
        return values;
    }`,
    expectedTime: "O(n)",
    expectedSpace: "O(1)",
    hints: [
      "The non-zero values already appear in the order you want. The zeros only need a place at the end.",
      "Use a write index for the next non-zero slot. A second pass can fill the tail with zeros.",
      "Copy each non-zero value to values[write] and advance write. After the scan, set every index from write onward to 0.",
      "Two linear passes and constant extra memory. Do not sort: sorting would change the order of the non-zero values.",
    ],
    tests: [
      { input: { values: [0, 1, 0, 3, 12] }, expectedOutput: [1, 3, 12, 0, 0], visibility: "SAMPLE" },
      { input: { values: [1, 2] }, expectedOutput: [1, 2], visibility: "SAMPLE" },
      { input: { values: [0, 0] }, expectedOutput: [0, 0], visibility: "HIDDEN" },
      { input: { values: [0, -2, 0, 4] }, expectedOutput: [-2, 4, 0, 0], visibility: "HIDDEN" },
      { input: { values: [8] }, expectedOutput: [8], visibility: "HIDDEN" },
    ],
  }),
  problem({
    slug: "locate-bin",
    title: "Linear Search",
    difficulty: "EASY",
    topics: ["arrays"],
    tags: ["scan"],
    statement: "Bins are listed in no particular order. Return the first index of the target code, or -1 when it is absent.",
    constraints: ["1 <= values.length <= 10000", "-10000 <= values[i], target <= 10000"],
    examples: [
      { input: "values = [4, 2, 4, 1], target = 4", output: "0" },
      { input: "values = [4, 2, 4, 1], target = 9", output: "-1" },
    ],
    signature: "int locateBin(vector<int>& values, int target)",
    functionName: "locateBin",
    driver: `auto values = in["values"].asIntVector();\n    printJson(Json::number(sol.locateBin(values, (int)in["target"].asInt())));`,
    method: `int locateBin(vector<int>& values, int target) {
        for (int i = 0; i < (int)values.size(); i++) if (values[i] == target) return i;
        return -1;
    }`,
    expectedTime: "O(n)",
    expectedSpace: "O(1)",
    hints: [
      "The row is not sorted, so skipping ahead is not safe. Where do you have to start?",
      "Walk from the left and stop at the first match.",
      "Return the index as soon as values[i] equals target. If the loop ends, return -1.",
      "Linear time, constant extra memory. If the code repeats, the smaller index is the answer.",
    ],
    tests: [
      { input: { values: [4, 2, 4, 1], target: 4 }, expectedOutput: 0, visibility: "SAMPLE" },
      { input: { values: [4, 2, 4, 1], target: 9 }, expectedOutput: -1, visibility: "SAMPLE" },
      { input: { values: [4, 2, 4, 1], target: 1 }, expectedOutput: 3, visibility: "HIDDEN" },
      { input: { values: [-3], target: -3 }, expectedOutput: 0, visibility: "HIDDEN" },
      { input: { values: [0, 0], target: 0 }, expectedOutput: 0, visibility: "HIDDEN" },
    ],
  }),
  problem({
    slug: "merged-catalog",
    title: "Union of Two Sorted Arrays",
    difficulty: "EASY",
    topics: ["arrays"],
    tags: ["two-pointers"],
    statement:
      "Two catalogs are each sorted non-decreasing and may contain repeats. Return one sorted catalog of every distinct code that appears in either list.",
    constraints: ["0 <= left.length, right.length <= 10000", "-10000 <= values <= 10000", "Both lists are sorted."],
    examples: [
      { input: "left = [1, 2, 2, 4], right = [2, 3, 4, 5]", output: "[1, 2, 3, 4, 5]" },
      { input: "left = [], right = [1, 1]", output: "[1]" },
    ],
    signature: "vector<int> mergedCatalog(vector<int>& left, vector<int>& right)",
    functionName: "mergedCatalog",
    driver: `auto left = in["left"].asIntVector();\n    auto right = in["right"].asIntVector();\n    printJson(Json::ints(sol.mergedCatalog(left, right)));`,
    method: `vector<int> mergedCatalog(vector<int>& left, vector<int>& right) {
        vector<int> out;
        int i = 0, j = 0;
        auto push = [&](int value) { if (out.empty() || out.back() != value) out.push_back(value); };
        while (i < (int)left.size() && j < (int)right.size()) {
            if (left[i] < right[j]) push(left[i++]);
            else if (right[j] < left[i]) push(right[j++]);
            else { push(left[i]); i++; j++; }
        }
        while (i < (int)left.size()) push(left[i++]);
        while (j < (int)right.size()) push(right[j++]);
        return out;
    }`,
    expectedTime: "O(n + m)",
    expectedSpace: "O(1) extra beyond the result",
    hints: [
      "Both catalogs are sorted, so the next code to consider is one of two heads. Which structure lets you always take the smaller head?",
      "Two indexes, one per catalog. Skip a value when it equals the last value you already wrote.",
      "While both indexes are in range, append the smaller head and advance that side. When they are equal, append once and advance both. Then drain the leftover side.",
      "The walk is linear in the combined length. Do not concatenate and sort unless you are willing to pay for the sort. Repeats inside one catalog still collapse to one entry.",
    ],
    tests: [
      { input: { left: [1, 2, 2, 4], right: [2, 3, 4, 5] }, expectedOutput: [1, 2, 3, 4, 5], visibility: "SAMPLE" },
      { input: { left: [], right: [1, 1] }, expectedOutput: [1], visibility: "SAMPLE" },
      { input: { left: [], right: [] }, expectedOutput: [], visibility: "HIDDEN" },
      { input: { left: [1, 3], right: [2, 4] }, expectedOutput: [1, 2, 3, 4], visibility: "HIDDEN" },
      { input: { left: [-2, -2, 0], right: [-2, 1] }, expectedOutput: [-2, 0, 1], visibility: "HIDDEN" },
    ],
  }),
  problem({
    slug: "skipped-locker",
    title: "Find the Missing Number",
    difficulty: "EASY",
    topics: ["arrays"],
    tags: ["math"],
    statement:
      "Lockers are numbered from 0 through n. You are given n of those numbers, each once, so exactly one number in that range is missing. Return the missing number.",
    constraints: ["1 <= values.length <= 10000", "values contains n distinct integers from 0 through n."],
    examples: [
      { input: "values = [3, 0, 1]", output: "2", explanation: "n is 3, so the full range is 0, 1, 2, 3." },
      { input: "values = [0, 1]", output: "2" },
    ],
    signature: "int skippedLocker(vector<int>& values)",
    functionName: "skippedLocker",
    driver: `auto values = in["values"].asIntVector();\n    printJson(Json::number(sol.skippedLocker(values)));`,
    method: `int skippedLocker(vector<int>& values) {
        int n = (int)values.size();
        int expect = n * (n + 1) / 2;
        int have = 0;
        for (int value : values) have += value;
        return expect - have;
    }`,
    expectedTime: "O(n)",
    expectedSpace: "O(1)",
    hints: [
      "The complete range 0 through n has a known total. The given list is that range with one hole.",
      "The sum 0 + 1 + ... + n is n * (n + 1) / 2. The length of the list is n, not n + 1.",
      "Subtract the sum of the list from that formula. The difference is the missing locker.",
      "Linear time and constant memory. XOR of every index and every value also works and avoids a large sum. The missing number may be 0 or n.",
    ],
    tests: [
      { input: { values: [3, 0, 1] }, expectedOutput: 2, visibility: "SAMPLE" },
      { input: { values: [0, 1] }, expectedOutput: 2, visibility: "SAMPLE" },
      { input: { values: [1] }, expectedOutput: 0, visibility: "HIDDEN" },
      { input: { values: [0] }, expectedOutput: 1, visibility: "HIDDEN" },
      { input: { values: [0, 1, 3, 4] }, expectedOutput: 2, visibility: "HIDDEN" },
    ],
  }),
  problem({
    slug: "open-streak",
    title: "Maximum Consecutive Ones",
    difficulty: "EASY",
    topics: ["arrays"],
    tags: ["scan"],
    statement: "A signal is a row of zeros and ones. Return the length of the longest run of ones. Zeros break the run.",
    constraints: ["1 <= values.length <= 10000", "values[i] is 0 or 1"],
    examples: [
      { input: "values = [1, 1, 0, 1, 1, 1]", output: "3" },
      { input: "values = [0, 0]", output: "0" },
    ],
    signature: "int openStreak(vector<int>& values)",
    functionName: "openStreak",
    driver: `auto values = in["values"].asIntVector();\n    printJson(Json::number(sol.openStreak(values)));`,
    method: `int openStreak(vector<int>& values) {
        int best = 0, run = 0;
        for (int value : values) {
            if (value == 1) best = max(best, ++run);
            else run = 0;
        }
        return best;
    }`,
    expectedTime: "O(n)",
    expectedSpace: "O(1)",
    hints: [
      "A run ends at a zero. You do not need to store every run, only the best length so far and the current one.",
      "Reset the current length when the bit is 0. Increase it when the bit is 1.",
      "After each increase, keep the maximum of the best length and the current run.",
      "One pass and two integers. An all-zero signal has length 0. The run does not wrap around the ends.",
    ],
    tests: [
      { input: { values: [1, 1, 0, 1, 1, 1] }, expectedOutput: 3, visibility: "SAMPLE" },
      { input: { values: [0, 0] }, expectedOutput: 0, visibility: "SAMPLE" },
      { input: { values: [1, 1, 1] }, expectedOutput: 3, visibility: "HIDDEN" },
      { input: { values: [1, 0, 1, 0, 1] }, expectedOutput: 1, visibility: "HIDDEN" },
      { input: { values: [0, 1, 1] }, expectedOutput: 2, visibility: "HIDDEN" },
    ],
  }),
  problem({
    slug: "lone-tag",
    title: "Find the Number That Appears Once",
    difficulty: "EASY",
    topics: ["arrays"],
    tags: ["bits"],
    statement: "Every tag number appears twice, except one tag that appears once. Return the tag that appears once.",
    constraints: ["1 <= values.length <= 10001", "values.length is odd", "-10000 <= values[i] <= 10000"],
    examples: [
      { input: "values = [2, 2, 1]", output: "1" },
      { input: "values = [4, 1, 2, 1, 2]", output: "4" },
    ],
    signature: "int loneTag(vector<int>& values)",
    functionName: "loneTag",
    driver: `auto values = in["values"].asIntVector();\n    printJson(Json::number(sol.loneTag(values)));`,
    method: `int loneTag(vector<int>& values) {
        int answer = 0;
        for (int value : values) answer ^= value;
        return answer;
    }`,
    expectedTime: "O(n)",
    expectedSpace: "O(1)",
    hints: [
      "A frequency map works. There is also a way to cancel every pair without extra memory. Which operation undoes itself?",
      "XOR is its own inverse: x XOR x is 0, and x XOR 0 is x.",
      "XOR every tag into one accumulator. Pairs cancel, and the leftover bits are the single tag.",
      "Linear time and constant memory. Order does not matter. A count map is correct too, but it uses extra memory.",
    ],
    tests: [
      { input: { values: [2, 2, 1] }, expectedOutput: 1, visibility: "SAMPLE" },
      { input: { values: [4, 1, 2, 1, 2] }, expectedOutput: 4, visibility: "SAMPLE" },
      { input: { values: [7] }, expectedOutput: 7, visibility: "HIDDEN" },
      { input: { values: [-1, -1, 3, 5, 3] }, expectedOutput: 5, visibility: "HIDDEN" },
      { input: { values: [0, 1, 0] }, expectedOutput: 1, visibility: "HIDDEN" },
    ],
  }),
  problem({
    slug: "exact-haul",
    title: "Longest Subarray with Sum K",
    difficulty: "EASY",
    topics: ["arrays"],
    tags: ["sliding-window"],
    statement:
      "Daily loads are positive integers. Return the length of the longest contiguous haul whose loads add up to exactly k. Return 0 when no such haul exists.",
    constraints: ["1 <= values.length <= 10000", "1 <= values[i] <= 1000", "1 <= k <= 1000000000"],
    examples: [
      { input: "values = [1, 2, 1, 1, 1], k = 3", output: "3", explanation: "The last three loads add to 3." },
      { input: "values = [2, 2], k = 1", output: "0" },
    ],
    signature: "int exactHaul(vector<int>& values, int k)",
    functionName: "exactHaul",
    driver: `auto values = in["values"].asIntVector();\n    printJson(Json::number(sol.exactHaul(values, (int)in["k"].asInt())));`,
    method: `int exactHaul(vector<int>& values, int k) {
        int best = 0, sum = 0, left = 0;
        for (int right = 0; right < (int)values.size(); right++) {
            sum += values[right];
            while (left <= right && sum > k) sum -= values[left++];
            if (sum == k) best = max(best, right - left + 1);
        }
        return best;
    }`,
    expectedTime: "O(n)",
    expectedSpace: "O(1)",
    hints: [
      "Every load is positive, so growing the window only increases the sum. What should happen when the sum passes k?",
      "A sliding window with a running sum is enough. You do not need a map while every load is positive.",
      "Advance the right end and add the load. While the sum is greater than k, subtract the left load and move left forward. When the sum equals k, record the window length.",
      "Each index enters and leaves once, so the time is linear. This shrink rule fails if loads can be negative or zero.",
    ],
    tests: [
      { input: { values: [1, 2, 1, 1, 1], k: 3 }, expectedOutput: 3, visibility: "SAMPLE" },
      { input: { values: [2, 2], k: 1 }, expectedOutput: 0, visibility: "SAMPLE" },
      { input: { values: [1, 2, 3], k: 3 }, expectedOutput: 2, visibility: "HIDDEN" },
      { input: { values: [5], k: 5 }, expectedOutput: 1, visibility: "HIDDEN" },
      { input: { values: [1, 1, 1, 1], k: 4 }, expectedOutput: 4, visibility: "HIDDEN" },
    ],
  }),
  problem({
    slug: "lane-colors",
    title: "Sort an Array of 0s, 1s and 2s",
    difficulty: "MEDIUM",
    topics: ["arrays"],
    tags: ["two-pointers"],
    statement: "A lane is painted with 0, 1, and 2 only. Group the colors so every 0 comes first, then every 1, then every 2. Return the lane.",
    constraints: ["1 <= values.length <= 10000", "values[i] is 0, 1, or 2"],
    examples: [
      { input: "values = [2, 0, 2, 1, 1, 0]", output: "[0, 0, 1, 1, 2, 2]" },
      { input: "values = [2, 0, 1]", output: "[0, 1, 2]" },
    ],
    signature: "vector<int> laneColors(vector<int>& values)",
    functionName: "laneColors",
    driver: `auto values = in["values"].asIntVector();\n    printJson(Json::ints(sol.laneColors(values)));`,
    method: `vector<int> laneColors(vector<int>& values) {
        int low = 0, mid = 0, high = (int)values.size() - 1;
        while (mid <= high) {
            if (values[mid] == 0) swap(values[low++], values[mid++]);
            else if (values[mid] == 1) mid++;
            else swap(values[mid], values[high--]);
        }
        return values;
    }`,
    expectedTime: "O(n)",
    expectedSpace: "O(1)",
    hints: [
      "Counting the three colors and rewriting the row works. Can you also partition in one walk with a few boundaries?",
      "Keep a region of known 0s on the left and a region of known 2s on the right. The middle index scans the unknown gap.",
      "If values[mid] is 0, swap it with the left boundary and advance both. If it is 2, swap it with the right boundary and shrink the right side only. If it is 1, just advance mid.",
      "Each index is swapped a constant number of times, so the time is linear and the extra memory is three indexes. Do not advance mid after swapping a 2, because the swapped-in value is still unknown.",
    ],
    tests: [
      { input: { values: [2, 0, 2, 1, 1, 0] }, expectedOutput: [0, 0, 1, 1, 2, 2], visibility: "SAMPLE" },
      { input: { values: [2, 0, 1] }, expectedOutput: [0, 1, 2], visibility: "SAMPLE" },
      { input: { values: [1] }, expectedOutput: [1], visibility: "HIDDEN" },
      { input: { values: [2, 2, 0, 0] }, expectedOutput: [0, 0, 2, 2], visibility: "HIDDEN" },
      { input: { values: [0, 1, 2] }, expectedOutput: [0, 1, 2], visibility: "HIDDEN" },
    ],
  }),
  problem({
    slug: "majority-vote",
    title: "Majority Element",
    difficulty: "MEDIUM",
    topics: ["arrays"],
    tags: ["boyer-moore"],
    statement: "One candidate number appears more than half the time in a ballot. Return that number. It is guaranteed to exist.",
    constraints: ["1 <= values.length <= 10000", "-10000 <= values[i] <= 10000"],
    examples: [
      { input: "values = [2, 2, 1, 1, 1, 2, 2]", output: "2" },
      { input: "values = [3, 3, 4]", output: "3" },
    ],
    signature: "int majorityVote(vector<int>& values)",
    functionName: "majorityVote",
    driver: `auto values = in["values"].asIntVector();\n    printJson(Json::number(sol.majorityVote(values)));`,
    method: `int majorityVote(vector<int>& values) {
        int pick = values[0], count = 0;
        for (int value : values) {
            if (count == 0) pick = value;
            count += value == pick ? 1 : -1;
        }
        return pick;
    }`,
    expectedTime: "O(n)",
    expectedSpace: "O(1)",
    hints: [
      "A frequency map finds the answer. If one number is more than half the ballot, pairs of different numbers cannot erase it.",
      "Keep a current pick and a count. A matching vote increases the count. A different vote decreases it.",
      "When the count hits zero, the next vote becomes the new pick. Because a majority exists, the final pick is that majority.",
      "One pass and two variables. This shortcut is only safe because the problem promises a strict majority. Without that promise you would count the pick in a second pass.",
    ],
    tests: [
      { input: { values: [2, 2, 1, 1, 1, 2, 2] }, expectedOutput: 2, visibility: "SAMPLE" },
      { input: { values: [3, 3, 4] }, expectedOutput: 3, visibility: "SAMPLE" },
      { input: { values: [8] }, expectedOutput: 8, visibility: "HIDDEN" },
      { input: { values: [1, 2, 1, 1] }, expectedOutput: 1, visibility: "HIDDEN" },
      { input: { values: [-1, -1, -1, 2] }, expectedOutput: -1, visibility: "HIDDEN" },
    ],
  }),
  problem({
    slug: "richest-stretch",
    title: "Maximum Subarray Sum",
    difficulty: "MEDIUM",
    topics: ["arrays"],
    tags: ["kadane"],
    statement:
      "Daily balances may be negative. Choose one contiguous stretch, at least one day, whose balances add to the largest possible total. Return that total.",
    constraints: ["1 <= values.length <= 10000", "-1000 <= values[i] <= 1000"],
    examples: [
      { input: "values = [-2, 1, -3, 4, -1, 2, 1, -5, 4]", output: "6", explanation: "4 + -1 + 2 + 1 is the best stretch." },
      { input: "values = [-1]", output: "-1" },
    ],
    signature: "int richestStretch(vector<int>& values)",
    functionName: "richestStretch",
    driver: `auto values = in["values"].asIntVector();\n    printJson(Json::number(sol.richestStretch(values)));`,
    method: `int richestStretch(vector<int>& values) {
        int best = values[0], run = values[0];
        for (int i = 1; i < (int)values.size(); i++) {
            run = max(values[i], run + values[i]);
            best = max(best, run);
        }
        return best;
    }`,
    expectedTime: "O(n)",
    expectedSpace: "O(1)",
    hints: [
      "Every stretch ending at today either starts today or extends the best stretch that ended yesterday. When is extending a bad idea?",
      "Keep the best sum that ends at the current index, and the best sum seen anywhere.",
      "Let the running sum become max(values[i], running + values[i]). Then update the global best. Seed both with the first day so an all-negative row still works.",
      "One pass and two integers. Starting the best at zero is wrong when every day is negative.",
    ],
    tests: [
      { input: { values: [-2, 1, -3, 4, -1, 2, 1, -5, 4] }, expectedOutput: 6, visibility: "SAMPLE" },
      { input: { values: [-1] }, expectedOutput: -1, visibility: "SAMPLE" },
      { input: { values: [5, -1, 2] }, expectedOutput: 6, visibility: "HIDDEN" },
      { input: { values: [-3, -2, -5] }, expectedOutput: -2, visibility: "HIDDEN" },
      { input: { values: [1, 2, 3] }, expectedOutput: 6, visibility: "HIDDEN" },
    ],
  }),
  problem({
    slug: "single-trade",
    title: "Best Time to Buy and Sell Stock",
    difficulty: "MEDIUM",
    topics: ["arrays"],
    tags: ["scan"],
    statement:
      "Prices for one item are listed from earliest to latest. You may buy once and sell once on a later day. Return the largest profit. If no later price is higher, return 0.",
    constraints: ["1 <= prices.length <= 10000", "0 <= prices[i] <= 10000"],
    examples: [
      { input: "prices = [7, 1, 5, 3, 6, 4]", output: "5", explanation: "Buy at 1 and sell at 6." },
      { input: "prices = [7, 6, 4]", output: "0" },
    ],
    signature: "int singleTrade(vector<int>& prices)",
    functionName: "singleTrade",
    driver: `auto prices = in["prices"].asIntVector();\n    printJson(Json::number(sol.singleTrade(prices)));`,
    method: `int singleTrade(vector<int>& prices) {
        int best = 0, low = prices[0];
        for (int i = 1; i < (int)prices.size(); i++) {
            best = max(best, prices[i] - low);
            low = min(low, prices[i]);
        }
        return best;
    }`,
    expectedTime: "O(n)",
    expectedSpace: "O(1)",
    hints: [
      "The sell day has to be after the buy day. For each day, the best buy so far is the cheapest day already seen.",
      "Track the minimum price to the left of today, and the best difference.",
      "Update the profit with price - minimum before you update the minimum with today's price. That keeps the buy strictly earlier.",
      "One pass and two integers. Profit stays 0 when the series only falls. You cannot sell and then buy.",
    ],
    tests: [
      { input: { prices: [7, 1, 5, 3, 6, 4] }, expectedOutput: 5, visibility: "SAMPLE" },
      { input: { prices: [7, 6, 4] }, expectedOutput: 0, visibility: "SAMPLE" },
      { input: { prices: [1, 2] }, expectedOutput: 1, visibility: "HIDDEN" },
      { input: { prices: [2] }, expectedOutput: 0, visibility: "HIDDEN" },
      { input: { prices: [3, 3, 3] }, expectedOutput: 0, visibility: "HIDDEN" },
    ],
  }),
  problem({
    slug: "signed-row",
    title: "Rearrange Array Elements by Sign",
    difficulty: "MEDIUM",
    topics: ["arrays"],
    tags: ["two-pointers"],
    statement:
      "A row has the same number of positive and negative integers, and no zeros. Rearrange it so the signs alternate, starting with a positive value. Keep the original relative order of the positives, and the original relative order of the negatives. Return the row.",
    constraints: ["2 <= values.length <= 10000", "values.length is even", "values[i] != 0", "The two signs are equally common."],
    examples: [
      { input: "values = [3, 1, -2, -5, 2, -4]", output: "[3, -2, 1, -5, 2, -4]" },
      { input: "values = [-1, 2]", output: "[2, -1]" },
    ],
    signature: "vector<int> signedRow(vector<int>& values)",
    functionName: "signedRow",
    driver: `auto values = in["values"].asIntVector();\n    printJson(Json::ints(sol.signedRow(values)));`,
    method: `vector<int> signedRow(vector<int>& values) {
        vector<int> pos, neg, out;
        for (int value : values) (value > 0 ? pos : neg).push_back(value);
        for (int i = 0; i < (int)pos.size(); i++) {
            out.push_back(pos[i]);
            out.push_back(neg[i]);
        }
        return out;
    }`,
    expectedTime: "O(n)",
    expectedSpace: "O(n)",
    hints: [
      "The next positive is the next unused positive in the original order, not the positive closest to a negative.",
      "Collect the positives and the negatives in two lists, preserving the order you meet them.",
      "Build the answer by taking positive i, then negative i, until both lists are used.",
      "Linear time and linear extra memory. Starting with a negative, or sorting by absolute value, breaks the required order.",
    ],
    tests: [
      { input: { values: [3, 1, -2, -5, 2, -4] }, expectedOutput: [3, -2, 1, -5, 2, -4], visibility: "SAMPLE" },
      { input: { values: [-1, 2] }, expectedOutput: [2, -1], visibility: "SAMPLE" },
      { input: { values: [1, -1, 2, -2] }, expectedOutput: [1, -1, 2, -2], visibility: "HIDDEN" },
      { input: { values: [4, 5, -8, -9] }, expectedOutput: [4, -8, 5, -9], visibility: "HIDDEN" },
    ],
  }),
  problem({
    slug: "next-roster",
    title: "Next Permutation",
    difficulty: "MEDIUM",
    topics: ["arrays"],
    tags: ["permutation"],
    statement:
      "A roster is one permutation of its own numbers, repeats allowed. Return the next roster in lexicographic order. If this roster is the last permutation, return the first one, the non-decreasing order.",
    constraints: ["1 <= values.length <= 1000", "-1000 <= values[i] <= 1000"],
    examples: [
      { input: "values = [1, 2, 3]", output: "[1, 3, 2]" },
      { input: "values = [3, 2, 1]", output: "[1, 2, 3]" },
    ],
    signature: "vector<int> nextRoster(vector<int>& values)",
    functionName: "nextRoster",
    driver: `auto values = in["values"].asIntVector();\n    printJson(Json::ints(sol.nextRoster(values)));`,
    method: `vector<int> nextRoster(vector<int>& values) {
        int n = (int)values.size();
        int i = n - 2;
        while (i >= 0 && values[i] >= values[i + 1]) i--;
        if (i >= 0) {
            int j = n - 1;
            while (values[j] <= values[i]) j--;
            swap(values[i], values[j]);
        }
        reverse(values.begin() + i + 1, values.end());
        return values;
    }`,
    expectedTime: "O(n)",
    expectedSpace: "O(1)",
    hints: [
      "The longest non-increasing suffix is already as large as it can be. The change has to happen at the pivot just before that suffix.",
      "Find the rightmost index i where values[i] < values[i + 1]. If no such index exists, reverse the whole roster.",
      "Swap values[i] with the rightmost later value that is strictly greater than it. Then reverse the suffix after i so that suffix becomes the smallest possible.",
      "The scan and the reverse are linear, with constant extra memory. Use a strict greater-than test so equal values do not become a false successor.",
    ],
    tests: [
      { input: { values: [1, 2, 3] }, expectedOutput: [1, 3, 2], visibility: "SAMPLE" },
      { input: { values: [3, 2, 1] }, expectedOutput: [1, 2, 3], visibility: "SAMPLE" },
      { input: { values: [1, 1, 5] }, expectedOutput: [1, 5, 1], visibility: "HIDDEN" },
      { input: { values: [1, 3, 2] }, expectedOutput: [2, 1, 3], visibility: "HIDDEN" },
      { input: { values: [1] }, expectedOutput: [1], visibility: "HIDDEN" },
    ],
  }),
  problem({
    slug: "front-leaders",
    title: "Leaders in an Array",
    difficulty: "MEDIUM",
    topics: ["arrays"],
    tags: ["scan"],
    statement:
      "A value in a row is a leader when it is strictly greater than every value to its right. The last value is always a leader. Return the leaders from left to right.",
    constraints: ["1 <= values.length <= 10000", "-10000 <= values[i] <= 10000"],
    examples: [
      { input: "values = [16, 17, 4, 3, 5, 2]", output: "[17, 5, 2]" },
      { input: "values = [5, 4, 3]", output: "[5, 4, 3]" },
    ],
    signature: "vector<int> frontLeaders(vector<int>& values)",
    functionName: "frontLeaders",
    driver: `auto values = in["values"].asIntVector();\n    printJson(Json::ints(sol.frontLeaders(values)));`,
    method: `vector<int> frontLeaders(vector<int>& values) {
        vector<int> out;
        int best = INT_MIN;
        for (int i = (int)values.size() - 1; i >= 0; i--) {
            if (values[i] > best) {
                out.push_back(values[i]);
                best = values[i];
            }
        }
        reverse(out.begin(), out.end());
        return out;
    }`,
    expectedTime: "O(n)",
    expectedSpace: "O(1) extra beyond the result",
    hints: [
      "From the left, you cannot yet know whether a value beats everything on its right. From the right, that test is one comparison.",
      "Walk backward and remember the greatest value already seen on the right.",
      "If the current value is strictly greater than that maximum, it is a leader. Then update the maximum. Reverse the collected leaders at the end so they read left to right.",
      "One backward pass. A value equal to a later leader is not itself a leader, because the test is strict.",
    ],
    tests: [
      { input: { values: [16, 17, 4, 3, 5, 2] }, expectedOutput: [17, 5, 2], visibility: "SAMPLE" },
      { input: { values: [5, 4, 3] }, expectedOutput: [5, 4, 3], visibility: "SAMPLE" },
      { input: { values: [1] }, expectedOutput: [1], visibility: "HIDDEN" },
      { input: { values: [1, 2, 3] }, expectedOutput: [3], visibility: "HIDDEN" },
      { input: { values: [7, 7, 4] }, expectedOutput: [7, 4], visibility: "HIDDEN" },
    ],
  }),
  problem({
    slug: "consecutive-run",
    title: "Longest Consecutive Sequence",
    difficulty: "MEDIUM",
    topics: ["arrays"],
    tags: ["hash-set"],
    statement:
      "Readings are unsorted and may repeat. A consecutive run is a set of values that could be arranged as x, x + 1, x + 2, and so on. Return the length of the longest such run. Repeats do not extend it.",
    constraints: ["0 <= values.length <= 10000", "-100000 <= values[i] <= 100000"],
    examples: [
      { input: "values = [100, 4, 200, 1, 3, 2]", output: "4", explanation: "1, 2, 3, 4 is the longest run." },
      { input: "values = [0, 0, 1]", output: "2" },
    ],
    signature: "int consecutiveRun(vector<int>& values)",
    functionName: "consecutiveRun",
    driver: `auto values = in["values"].asIntVector();\n    printJson(Json::number(sol.consecutiveRun(values)));`,
    method: `int consecutiveRun(vector<int>& values) {
        unordered_set<int> seen(values.begin(), values.end());
        int best = 0;
        for (int value : seen) {
            if (seen.count(value - 1)) continue;
            int length = 0;
            while (seen.count(value + length)) length++;
            best = max(best, length);
        }
        return best;
    }`,
    expectedTime: "O(n)",
    expectedSpace: "O(n)",
    hints: [
      "Sorting the unique values makes the runs obvious. A set can do the same without sorting if you only start counting at the beginning of a run.",
      "Put every reading in a hash set. A number starts a run when the set does not contain number - 1.",
      "From each start, walk forward while number + length is present, and keep the best length.",
      "Each value is visited a constant number of times across all walks, so the expected time is linear. The empty row has length 0. Duplicates collapse inside the set.",
    ],
    tests: [
      { input: { values: [100, 4, 200, 1, 3, 2] }, expectedOutput: 4, visibility: "SAMPLE" },
      { input: { values: [0, 0, 1] }, expectedOutput: 2, visibility: "SAMPLE" },
      { input: { values: [] }, expectedOutput: 0, visibility: "HIDDEN" },
      { input: { values: [9] }, expectedOutput: 1, visibility: "HIDDEN" },
      { input: { values: [1, 3, 5] }, expectedOutput: 1, visibility: "HIDDEN" },
    ],
  }),
  problem({
    slug: "ways-to-tally",
    title: "Count Subarrays with Sum K",
    difficulty: "MEDIUM",
    topics: ["arrays"],
    tags: ["prefix-sum"],
    statement:
      "Daily totals may be negative. Return how many contiguous stretches add up to exactly k. Stretches may overlap, and a single day counts when it equals k.",
    constraints: ["1 <= values.length <= 2000", "-1000 <= values[i], k <= 1000"],
    examples: [
      { input: "values = [1, 1, 1], k = 2", output: "2" },
      { input: "values = [1, -1, 1], k = 1", output: "3" },
    ],
    signature: "int waysToTally(vector<int>& values, int k)",
    functionName: "waysToTally",
    driver: `auto values = in["values"].asIntVector();\n    printJson(Json::number(sol.waysToTally(values, (int)in["k"].asInt())));`,
    method: `int waysToTally(vector<int>& values, int k) {
        unordered_map<long long, int> seen;
        seen[0] = 1;
        long long sum = 0;
        int count = 0;
        for (int value : values) {
            sum += value;
            auto it = seen.find(sum - k);
            if (it != seen.end()) count += it->second;
            seen[sum]++;
        }
        return count;
    }`,
    expectedTime: "O(n)",
    expectedSpace: "O(n)",
    hints: [
      "A stretch ending today has sum k when today's prefix sum minus some earlier prefix sum equals k.",
      "Store how many times each prefix sum has already occurred. Include the empty prefix 0 once, before the walk.",
      "Add the current value to the prefix. Add the count of prefix - k to the answer, then record the new prefix.",
      "Expected linear time with a hash map. Record the prefix after the lookup so a stretch is not counted against itself. Negatives mean a sliding window that only shrinks is not enough.",
    ],
    tests: [
      { input: { values: [1, 1, 1], k: 2 }, expectedOutput: 2, visibility: "SAMPLE" },
      { input: { values: [1, -1, 1], k: 1 }, expectedOutput: 3, visibility: "SAMPLE" },
      { input: { values: [1, 2, 3], k: 3 }, expectedOutput: 2, visibility: "HIDDEN" },
      { input: { values: [0, 0], k: 0 }, expectedOutput: 3, visibility: "HIDDEN" },
      { input: { values: [2], k: 1 }, expectedOutput: 0, visibility: "HIDDEN" },
    ],
  }),
  problem({
    slug: "blank-cross",
    title: "Set Matrix Zeroes",
    difficulty: "MEDIUM",
    topics: ["arrays"],
    tags: ["matrix"],
    statement:
      "A grid of integers should become blank along every row and every column that already contains a zero. Other cells stay as they are. Return the grid. Read every original zero before you start writing new ones.",
    constraints: ["1 <= rows, columns <= 20", "-1000 <= grid[i][j] <= 1000"],
    examples: [
      {
        input: "grid = [[1, 1, 1], [1, 0, 1], [1, 1, 1]]",
        output: "[[1, 0, 1], [0, 0, 0], [1, 0, 1]]",
      },
      {
        input: "grid = [[0, 1], [1, 1]]",
        output: "[[0, 0], [0, 1]]",
      },
    ],
    signature: "vector<vector<int>> blankCross(vector<vector<int>>& grid)",
    functionName: "blankCross",
    driver: matrixOut("sol.blankCross(grid)"),
    method: `vector<vector<int>> blankCross(vector<vector<int>>& grid) {
        int n = (int)grid.size(), m = (int)grid[0].size();
        vector<int> rows(n), cols(m);
        for (int i = 0; i < n; i++)
            for (int j = 0; j < m; j++)
                if (grid[i][j] == 0) rows[i] = cols[j] = 1;
        for (int i = 0; i < n; i++)
            for (int j = 0; j < m; j++)
                if (rows[i] || cols[j]) grid[i][j] = 0;
        return grid;
    }`,
    expectedTime: "O(rows * columns)",
    expectedSpace: "O(rows + columns)",
    hints: [
      "If you write a zero as soon as you see one, later cells cannot tell an original zero from a zero you just painted.",
      "First mark the rows and columns that contain an original zero. Then paint.",
      "Use two marker arrays. On the second pass, set a cell to zero when its row or its column is marked.",
      "Two passes over the grid. The markers are linear in the number of rows plus columns. The first row and first column can also act as markers if you want constant extra memory, but only after you remember whether they themselves contained a zero.",
    ],
    tests: [
      { input: { grid: [[1, 1, 1], [1, 0, 1], [1, 1, 1]] }, expectedOutput: [[1, 0, 1], [0, 0, 0], [1, 0, 1]], visibility: "SAMPLE" },
      { input: { grid: [[0, 1], [1, 1]] }, expectedOutput: [[0, 0], [0, 1]], visibility: "SAMPLE" },
      { input: { grid: [[1]] }, expectedOutput: [[1]], visibility: "HIDDEN" },
      { input: { grid: [[0]] }, expectedOutput: [[0]], visibility: "HIDDEN" },
      { input: { grid: [[1, 2, 3], [4, 5, 6]] }, expectedOutput: [[1, 2, 3], [4, 5, 6]], visibility: "HIDDEN" },
    ],
  }),
  problem({
    slug: "quarter-turn",
    title: "Rotate Matrix by 90 Degrees",
    difficulty: "MEDIUM",
    topics: ["arrays"],
    tags: ["matrix"],
    statement: "A square grid of integers should rotate a quarter turn clockwise. Return the grid.",
    constraints: ["1 <= n <= 20", "-1000 <= grid[i][j] <= 1000", "The grid is square."],
    examples: [
      { input: "grid = [[1, 2, 3], [4, 5, 6], [7, 8, 9]]", output: "[[7, 4, 1], [8, 5, 2], [9, 6, 3]]" },
      { input: "grid = [[1, 2], [3, 4]]", output: "[[3, 1], [4, 2]]" },
    ],
    signature: "vector<vector<int>> quarterTurn(vector<vector<int>>& grid)",
    functionName: "quarterTurn",
    driver: matrixOut("sol.quarterTurn(grid)"),
    method: `vector<vector<int>> quarterTurn(vector<vector<int>>& grid) {
        int n = (int)grid.size();
        for (int i = 0; i < n; i++)
            for (int j = i + 1; j < n; j++)
                swap(grid[i][j], grid[j][i]);
        for (auto& row : grid) reverse(row.begin(), row.end());
        return grid;
    }`,
    expectedTime: "O(n^2)",
    expectedSpace: "O(1)",
    hints: [
      "A clockwise quarter turn sends each value to a new row and column. There is also a two-step picture: mirror across the diagonal, then mirror each row.",
      "Transpose the square first, swapping grid[i][j] with grid[j][i] only when j is to the right of i.",
      "After the transpose, reverse every row.",
      "The transpose and the row reversals together visit every cell a constant number of times. Extra memory is a few indexes. Reversing columns instead of rows turns the other way.",
    ],
    tests: [
      { input: { grid: [[1, 2, 3], [4, 5, 6], [7, 8, 9]] }, expectedOutput: [[7, 4, 1], [8, 5, 2], [9, 6, 3]], visibility: "SAMPLE" },
      { input: { grid: [[1, 2], [3, 4]] }, expectedOutput: [[3, 1], [4, 2]], visibility: "SAMPLE" },
      { input: { grid: [[5]] }, expectedOutput: [[5]], visibility: "HIDDEN" },
      { input: { grid: [[1, 0], [0, 1]] }, expectedOutput: [[0, 1], [1, 0]], visibility: "HIDDEN" },
    ],
  }),
  problem({
    slug: "spiral-pickup",
    title: "Spiral Traversal of Matrix",
    difficulty: "MEDIUM",
    topics: ["arrays"],
    tags: ["matrix"],
    statement: "Pick up every integer in a grid in clockwise spiral order, starting at the top-left and walking right first. Return the values in pickup order.",
    constraints: ["1 <= rows, columns <= 20", "-1000 <= grid[i][j] <= 1000"],
    examples: [
      { input: "grid = [[1, 2, 3], [4, 5, 6], [7, 8, 9]]", output: "[1, 2, 3, 6, 9, 8, 7, 4, 5]" },
      { input: "grid = [[1, 2, 3, 4], [5, 6, 7, 8], [9, 10, 11, 12]]", output: "[1, 2, 3, 4, 8, 12, 11, 10, 9, 5, 6, 7]" },
    ],
    signature: "vector<int> spiralPickup(vector<vector<int>>& grid)",
    functionName: "spiralPickup",
    driver: `auto grid = in["grid"].asIntMatrix();\n    printJson(Json::ints(sol.spiralPickup(grid)));`,
    method: `vector<int> spiralPickup(vector<vector<int>>& grid) {
        int top = 0, bottom = (int)grid.size() - 1, left = 0, right = (int)grid[0].size() - 1;
        vector<int> out;
        while (top <= bottom && left <= right) {
            for (int j = left; j <= right; j++) out.push_back(grid[top][j]);
            top++;
            for (int i = top; i <= bottom; i++) out.push_back(grid[i][right]);
            right--;
            if (top <= bottom) {
                for (int j = right; j >= left; j--) out.push_back(grid[bottom][j]);
                bottom--;
            }
            if (left <= right) {
                for (int i = bottom; i >= top; i--) out.push_back(grid[i][left]);
                left++;
            }
        }
        return out;
    }`,
    expectedTime: "O(rows * columns)",
    expectedSpace: "O(1) extra beyond the result",
    hints: [
      "The walk peels the grid one layer at a time: right along the top, down the right side, left along the bottom, up the left side.",
      "Four boundaries shrink after each side. Stop when the boundaries cross.",
      "After moving the top boundary down and the right boundary left, only walk the bottom if top still does not pass bottom, and only walk the left if left still does not pass right.",
      "Every cell is appended once. A single row or a single column is the case those extra checks protect.",
    ],
    tests: [
      { input: { grid: [[1, 2, 3], [4, 5, 6], [7, 8, 9]] }, expectedOutput: [1, 2, 3, 6, 9, 8, 7, 4, 5], visibility: "SAMPLE" },
      { input: { grid: [[1, 2, 3, 4], [5, 6, 7, 8], [9, 10, 11, 12]] }, expectedOutput: [1, 2, 3, 4, 8, 12, 11, 10, 9, 5, 6, 7], visibility: "SAMPLE" },
      { input: { grid: [[1]] }, expectedOutput: [1], visibility: "HIDDEN" },
      { input: { grid: [[1, 2, 3]] }, expectedOutput: [1, 2, 3], visibility: "HIDDEN" },
      { input: { grid: [[1], [2], [3]] }, expectedOutput: [1, 2, 3], visibility: "HIDDEN" },
    ],
  }),
  problem({
    slug: "triple-sum",
    title: "3Sum",
    difficulty: "HARD",
    topics: ["arrays"],
    tags: ["two-pointers"],
    statement:
      "Find every group of three different positions whose values add to zero. Return the groups as sorted triples, and return the list of triples in sorted order. Each distinct triple of values appears once, even if several positions could form it.",
    constraints: ["3 <= values.length <= 300", "-1000 <= values[i] <= 1000"],
    examples: [
      { input: "values = [-1, 0, 1, 2, -1, -4]", output: "[[-1, -1, 2], [-1, 0, 1]]" },
      { input: "values = [0, 0, 0]", output: "[[0, 0, 0]]" },
    ],
    signature: "vector<vector<int>> tripleSum(vector<int>& values)",
    functionName: "tripleSum",
    driver: `auto values = in["values"].asIntVector();\n    ${rowsOut("sol.tripleSum(values)")}`,
    method: `vector<vector<int>> tripleSum(vector<int>& values) {
        sort(values.begin(), values.end());
        vector<vector<int>> out;
        int n = (int)values.size();
        for (int i = 0; i < n; i++) {
            if (i && values[i] == values[i - 1]) continue;
            int left = i + 1, right = n - 1;
            while (left < right) {
                long long sum = (long long)values[i] + values[left] + values[right];
                if (sum == 0) {
                    out.push_back({values[i], values[left], values[right]});
                    left++;
                    right--;
                    while (left < right && values[left] == values[left - 1]) left++;
                    while (left < right && values[right] == values[right + 1]) right--;
                } else if (sum < 0) left++;
                else right--;
            }
        }
        return out;
    }`,
    expectedTime: "O(n^2)",
    expectedSpace: "O(1) extra beyond the result",
    hints: [
      "After the values are ordered, fixing one value leaves a sorted pair problem. How do you move two ends when their sum is too small?",
      "Sort a copy. Skip a fixed value when it repeats the previous fixed value.",
      "For index i, set left to i + 1 and right to the end. If the three sum to zero, record them and skip duplicate left and right values. If the sum is low, move left rightward. If it is high, move right leftward.",
      "The outer index and the inner pair give quadratic time. The result triples must be sorted inside and the list itself sorted, which falls out of scanning the sorted row from the left.",
    ],
    tests: [
      { input: { values: [-1, 0, 1, 2, -1, -4] }, expectedOutput: [[-1, -1, 2], [-1, 0, 1]], visibility: "SAMPLE" },
      { input: { values: [0, 0, 0] }, expectedOutput: [[0, 0, 0]], visibility: "SAMPLE" },
      { input: { values: [1, 2, 3] }, expectedOutput: [], visibility: "HIDDEN" },
      { input: { values: [-2, 0, 1, 1, 2] }, expectedOutput: [[-2, 0, 2], [-2, 1, 1]], visibility: "HIDDEN" },
      { input: { values: [0, 0, 0, 0] }, expectedOutput: [[0, 0, 0]], visibility: "HIDDEN" },
    ],
  }),
  problem({
    slug: "merged-shifts",
    title: "Merge Overlapping Intervals",
    difficulty: "HARD",
    topics: ["arrays"],
    tags: ["intervals"],
    statement:
      "Each shift is a closed interval [start, end], with start less than or equal to end. Overlapping or touching shifts should become one shift covering the whole span. Return the merged shifts sorted by start time.",
    constraints: ["0 <= shifts.length <= 1000", "0 <= start <= end <= 10000"],
    examples: [
      { input: "shifts = [[1, 3], [2, 6], [8, 10], [15, 18]]", output: "[[1, 6], [8, 10], [15, 18]]" },
      { input: "shifts = [[1, 4], [4, 5]]", output: "[[1, 5]]", explanation: "Touching endpoints merge." },
    ],
    signature: "vector<vector<int>> mergedShifts(vector<vector<int>>& shifts)",
    functionName: "mergedShifts",
    driver: `auto shifts = in["shifts"].asIntMatrix();\n    ${rowsOut("sol.mergedShifts(shifts)")}`,
    method: `vector<vector<int>> mergedShifts(vector<vector<int>>& shifts) {
        sort(shifts.begin(), shifts.end());
        vector<vector<int>> out;
        for (const auto& span : shifts) {
            if (out.empty() || out.back()[1] < span[0]) out.push_back(span);
            else out.back()[1] = max(out.back()[1], span[1]);
        }
        return out;
    }`,
    expectedTime: "O(n log n)",
    expectedSpace: "O(1) extra beyond the result",
    hints: [
      "Merging is easy once the shifts are in start order. What does the last merged shift tell you about the next one?",
      "Sort by start. A new shift begins only when it starts strictly after the current merged end.",
      "If the next start is less than or equal to the current end, extend the current end to the larger of the two ends. Otherwise append a new shift.",
      "Sorting dominates the time. Touching endpoints merge because the comparison is strict. An empty list stays empty.",
    ],
    tests: [
      { input: { shifts: [[1, 3], [2, 6], [8, 10], [15, 18]] }, expectedOutput: [[1, 6], [8, 10], [15, 18]], visibility: "SAMPLE" },
      { input: { shifts: [[1, 4], [4, 5]] }, expectedOutput: [[1, 5]], visibility: "SAMPLE" },
      { input: { shifts: [] }, expectedOutput: [], visibility: "HIDDEN" },
      { input: { shifts: [[5, 6], [1, 2]] }, expectedOutput: [[1, 2], [5, 6]], visibility: "HIDDEN" },
      { input: { shifts: [[1, 10], [2, 3], [4, 8]] }, expectedOutput: [[1, 10]], visibility: "HIDDEN" },
    ],
  }),
  problem({
    slug: "gap-and-repeat",
    title: "Find the Repeating and Missing Number",
    difficulty: "HARD",
    topics: ["arrays"],
    tags: ["math"],
    statement:
      "A list of length n should contain each integer from 1 through n once. Instead, one number from that range is missing and another number from the list is repeated. Return [repeated, missing].",
    constraints: ["2 <= values.length <= 10000", "1 <= values[i] <= n"],
    examples: [
      { input: "values = [1, 3, 3]", output: "[3, 2]" },
      { input: "values = [2, 2]", output: "[2, 1]" },
    ],
    signature: "vector<int> gapAndRepeat(vector<int>& values)",
    functionName: "gapAndRepeat",
    driver: `auto values = in["values"].asIntVector();\n    printJson(Json::ints(sol.gapAndRepeat(values)));`,
    method: `vector<int> gapAndRepeat(vector<int>& values) {
        int n = (int)values.size();
        vector<int> freq(n + 1);
        for (int value : values) freq[value]++;
        int repeated = 0, missing = 0;
        for (int number = 1; number <= n; number++) {
            if (freq[number] == 2) repeated = number;
            if (freq[number] == 0) missing = number;
        }
        return {repeated, missing};
    }`,
    expectedTime: "O(n)",
    expectedSpace: "O(n)",
    hints: [
      "The legal numbers are exactly 1 through n. A count of how often each of those numbers appears separates the hole from the extra copy.",
      "An array of size n + 1 can store the counts. Index 0 stays unused.",
      "After counting, the number with count 2 is repeated and the number with count 0 is missing. Return them in that order.",
      "Linear time and linear memory. The repeated value is one of the list values, and the missing value might not appear at all.",
    ],
    tests: [
      { input: { values: [1, 3, 3] }, expectedOutput: [3, 2], visibility: "SAMPLE" },
      { input: { values: [2, 2] }, expectedOutput: [2, 1], visibility: "SAMPLE" },
      { input: { values: [1, 2, 2, 4] }, expectedOutput: [2, 3], visibility: "HIDDEN" },
      { input: { values: [4, 3, 2, 1, 1] }, expectedOutput: [1, 5], visibility: "HIDDEN" },
      { input: { values: [1, 1] }, expectedOutput: [1, 2], visibility: "HIDDEN" },
    ],
  }),
  problem({
    slug: "strongest-product",
    title: "Maximum Product Subarray",
    difficulty: "HARD",
    topics: ["arrays"],
    tags: ["kadane"],
    statement:
      "Choose a contiguous stretch of at least one factor. Return the largest product the stretch can make. A negative factor can become useful after another negative factor, and a zero ends a stretch.",
    constraints: ["1 <= values.length <= 20", "-8 <= values[i] <= 8"],
    examples: [
      { input: "values = [2, 3, -2, 4]", output: "6", explanation: "2 * 3 is the best product." },
      { input: "values = [-2, 3, -4]", output: "24" },
    ],
    signature: "int strongestProduct(vector<int>& values)",
    functionName: "strongestProduct",
    driver: `auto values = in["values"].asIntVector();\n    printJson(Json::number(sol.strongestProduct(values)));`,
    method: `int strongestProduct(vector<int>& values) {
        int best = values[0], low = values[0], high = values[0];
        for (int i = 1; i < (int)values.size(); i++) {
            int value = values[i];
            int nextHigh = max(value, max(high * value, low * value));
            int nextLow = min(value, min(high * value, low * value));
            high = nextHigh;
            low = nextLow;
            best = max(best, high);
        }
        return best;
    }`,
    expectedTime: "O(n)",
    expectedSpace: "O(1)",
    hints: [
      "The best product ending today might come from the largest product ending yesterday or from the smallest, because a negative factor flips the sign.",
      "Track both the maximum and the minimum product that end at the current index.",
      "The next maximum is the largest of the value itself, maximum times value, and minimum times value. The next minimum is the smallest of those three. Update the answer from the maximum.",
      "One pass and three integers. Seed them with the first factor so a row of one negative number stays correct. A zero makes both running products zero, and the next factor can start fresh.",
    ],
    tests: [
      { input: { values: [2, 3, -2, 4] }, expectedOutput: 6, visibility: "SAMPLE" },
      { input: { values: [-2, 3, -4] }, expectedOutput: 24, visibility: "SAMPLE" },
      { input: { values: [-2, 0, -1] }, expectedOutput: 0, visibility: "HIDDEN" },
      { input: { values: [-3] }, expectedOutput: -3, visibility: "HIDDEN" },
      { input: { values: [1, -2, -3, 0, 4] }, expectedOutput: 6, visibility: "HIDDEN" },
    ],
  }),
];
