import { problem } from "./helpers.js";

const numbersOut = (call: string) =>
  `auto values = ${call};\n    Json out;\n    out.type = Json::ARR;\n    for (long long value : values) out.a.push_back(Json::number(value));\n    printJson(out);`;

export const searchRestProblems = [
  problem({
    slug: "upper-bound",
    title: "Upper Bound",
    difficulty: "EASY",
    topics: ["binary-search"],
    tags: ["binary-search"],
    statement:
      "values is sorted in nondecreasing order. Return the first index whose value is strictly greater than target. Return values.length when every value is less than or equal to target.",
    constraints: ["0 <= values.length <= 100000", "-1000000000 <= values[i], target <= 1000000000"],
    examples: [
      { input: "values = [1, 2, 2, 3], target = 2", output: "3" },
      { input: "values = [1, 2, 2, 3], target = 4", output: "4" },
    ],
    signature: "int upperBound(vector<int>& values, int target)",
    functionName: "upperBound",
    driver: `auto values = in["values"].asIntVector();\n    printJson(Json::number(sol.upperBound(values, (int)in["target"].asInt())));`,
    method: `int upperBound(vector<int>& values, int target) {
        int lo = 0, hi = (int)values.size();
        while (lo < hi) {
            int mid = lo + (hi - lo) / 2;
            if (values[mid] <= target) lo = mid + 1;
            else hi = mid;
        }
        return lo;
    }`,
    expectedTime: "O(log n)",
    expectedSpace: "O(1)",
    hints: [
      "You want the first value that target does not reach, not the last copy of target.",
      "Search a half-open range whose right end can sit one past the last index.",
      "If the middle value is less than or equal to target, the answer is strictly to its right. Otherwise the answer is at mid or to its left.",
      "When the two ends meet, that index is the upper bound. It equals the length when target is at least as large as every value.",
    ],
    tests: [
      { input: { values: [1, 2, 2, 3], target: 2 }, expectedOutput: 3, visibility: "SAMPLE" },
      { input: { values: [1, 2, 2, 3], target: 4 }, expectedOutput: 4, visibility: "SAMPLE" },
      { input: { values: [1, 2, 2, 3], target: 0 }, expectedOutput: 0, visibility: "HIDDEN" },
      { input: { values: [1, 1, 1], target: 1 }, expectedOutput: 3, visibility: "HIDDEN" },
    ],
  }),
  problem({
    slug: "count-occurrences",
    title: "Count Occurrences in a Sorted Array",
    difficulty: "EASY",
    topics: ["binary-search"],
    tags: ["binary-search"],
    statement: "values is sorted in nondecreasing order. Return how many times target appears. Return 0 when it is absent.",
    constraints: ["0 <= values.length <= 100000", "-1000000000 <= values[i], target <= 1000000000"],
    examples: [
      { input: "values = [1, 1, 2, 2, 2, 3], target = 2", output: "3" },
      { input: "values = [1, 1, 2, 2, 2, 3], target = 4", output: "0" },
    ],
    signature: "int countOccurrences(vector<int>& values, int target)",
    functionName: "countOccurrences",
    driver: `auto values = in["values"].asIntVector();\n    printJson(Json::number(sol.countOccurrences(values, (int)in["target"].asInt())));`,
    method: `int countOccurrences(vector<int>& values, int target) {
        auto bound = [&](int key, bool strict) {
            int lo = 0, hi = (int)values.size();
            while (lo < hi) {
                int mid = lo + (hi - lo) / 2;
                if (values[mid] < key || (strict && values[mid] == key)) lo = mid + 1;
                else hi = mid;
            }
            return lo;
        };
        return bound(target, true) - bound(target, false);
    }`,
    expectedTime: "O(log n)",
    expectedSpace: "O(1)",
    hints: [
      "Because the array is sorted, every copy of target sits in one contiguous block.",
      "The length of that block is the first index greater than target minus the first index greater than or equal to target.",
      "Find both edges with binary search. One search stops on equals, the other steps past them.",
      "Subtract the two indexes. A missing target makes them equal, so the count is 0.",
    ],
    tests: [
      { input: { values: [1, 1, 2, 2, 2, 3], target: 2 }, expectedOutput: 3, visibility: "SAMPLE" },
      { input: { values: [1, 1, 2, 2, 2, 3], target: 4 }, expectedOutput: 0, visibility: "SAMPLE" },
      { input: { values: [5], target: 5 }, expectedOutput: 1, visibility: "HIDDEN" },
      { input: { values: [], target: 1 }, expectedOutput: 0, visibility: "HIDDEN" },
    ],
  }),
  problem({
    slug: "rotation-count",
    title: "Find How Many Times an Array Is Rotated",
    difficulty: "EASY",
    topics: ["binary-search"],
    tags: ["binary-search"],
    statement:
      "values is a strictly increasing list that was rotated to the left some number of places, possibly zero. Return that number of places, which is also the index of the smallest value.",
    constraints: ["1 <= values.length <= 100000", "All values are distinct.", "-1000000000 <= values[i] <= 1000000000"],
    examples: [
      { input: "values = [3, 4, 5, 1, 2]", output: "3" },
      { input: "values = [1, 2, 3]", output: "0" },
    ],
    signature: "int rotationCount(vector<int>& values)",
    functionName: "rotationCount",
    driver: `auto values = in["values"].asIntVector();\n    printJson(Json::number(sol.rotationCount(values)));`,
    method: `int rotationCount(vector<int>& values) {
        int lo = 0, hi = (int)values.size() - 1;
        while (lo < hi) {
            int mid = lo + (hi - lo) / 2;
            if (values[mid] > values[hi]) lo = mid + 1;
            else hi = mid;
        }
        return lo;
    }`,
    expectedTime: "O(log n)",
    expectedSpace: "O(1)",
    hints: [
      "A left rotation moves the smallest value to index equal to the number of places.",
      "The sorted list has one cliff, unless it was not rotated at all.",
      "Compare the middle value with the right end. If the middle is larger, the cliff is to the right of mid. Otherwise the minimum is at mid or to its left.",
      "Do not drop mid when it might be the minimum. A list that was never rotated returns 0.",
    ],
    tests: [
      { input: { values: [3, 4, 5, 1, 2] }, expectedOutput: 3, visibility: "SAMPLE" },
      { input: { values: [1, 2, 3] }, expectedOutput: 0, visibility: "SAMPLE" },
      { input: { values: [2, 1] }, expectedOutput: 1, visibility: "HIDDEN" },
      { input: { values: [1] }, expectedOutput: 0, visibility: "HIDDEN" },
    ],
  }),
  problem({
    slug: "gas-stations",
    title: "Minimize Max Distance to Gas Station",
    difficulty: "HARD",
    topics: ["binary-search"],
    tags: ["binary-search"],
    statement:
      "stations lists positions on a line, in strictly increasing order. Add exactly k new stations anywhere on the line, including between the existing ones. Return the smallest integer m such that the stations can be placed so every neighboring gap is at most m / 1000000.",
    constraints: ["2 <= stations.length <= 100000", "0 <= stations[i] <= 1000000000", "0 <= k <= 1000000000", "stations is strictly increasing"],
    examples: [
      { input: "stations = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10], k = 9", output: "500000", explanation: "One new station in every gap makes the maximum gap 0.5." },
      { input: "stations = [1, 2], k = 0", output: "1000000" },
    ],
    signature: "long long minStationGap(vector<int>& stations, int k)",
    functionName: "minStationGap",
    driver: `auto stations = in["stations"].asIntVector();\n    printJson(Json::number(sol.minStationGap(stations, (int)in["k"].asInt())));`,
    method: `long long minStationGap(vector<int>& stations, int k) {
        auto need = [&](long long limit) {
            if (limit == 0) return (long long)4e18;
            long long count = 0;
            for (int i = 1; i < (int)stations.size(); i++) {
                long long gap = (long long)(stations[i] - stations[i - 1]) * 1000000LL;
                count += (gap + limit - 1) / limit - 1;
            }
            return count;
        };
        long long lo = 0, hi = (long long)(stations.back() - stations.front()) * 1000000LL;
        while (lo < hi) {
            long long mid = lo + (hi - lo) / 2;
            if (need(mid) <= k) hi = mid;
            else lo = mid + 1;
        }
        return lo;
    }`,
    expectedTime: "O(n log (span))",
    expectedSpace: "O(1)",
    hints: [
      "The answer is a maximum gap, so guess a gap and ask whether k new stations are enough to enforce it.",
      "On one existing gap of length d, the number of new stations needed for a maximum of g is ceil(d / g) - 1.",
      "Search g in millionths. For a candidate m, add ceil(gap * 1000000 / m) - 1 over every neighboring pair.",
      "The smallest m whose total is at most k is the answer. A limit of 0 is impossible while any existing gap is positive. Use wide integers for the products.",
    ],
    tests: [
      { input: { stations: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10], k: 9 }, expectedOutput: 500000, visibility: "SAMPLE" },
      { input: { stations: [1, 2], k: 0 }, expectedOutput: 1000000, visibility: "SAMPLE" },
      { input: { stations: [1, 13, 17, 23], k: 5 }, expectedOutput: 3000000, visibility: "HIDDEN" },
      { input: { stations: [3, 6, 12, 19], k: 2 }, expectedOutput: 3500000, visibility: "HIDDEN" },
    ],
  }),
  problem({
    slug: "median-two-sorted",
    title: "Median of Two Sorted Arrays",
    difficulty: "HARD",
    topics: ["binary-search"],
    tags: ["binary-search"],
    statement:
      "first and second are sorted in nondecreasing order, and together they contain at least one value. Return twice the median of the merged sequence. When the combined length is odd, that is twice the middle value. When it is even, that is the sum of the two middle values.",
    constraints: ["0 <= first.length, second.length <= 100000", "-1000000000 <= first[i], second[j] <= 1000000000"],
    examples: [
      { input: "first = [1, 3], second = [2]", output: "4", explanation: "The merged sequence is [1, 2, 3] and twice the middle value is 4." },
      { input: "first = [1, 2], second = [3, 4]", output: "5", explanation: "The two middle values are 2 and 3." },
    ],
    signature: "long long twiceMedian(vector<int>& first, vector<int>& second)",
    functionName: "twiceMedian",
    driver: `auto first = in["first"].asIntVector();\n    auto second = in["second"].asIntVector();\n    printJson(Json::number(sol.twiceMedian(first, second)));`,
    method: `long long twiceMedian(vector<int>& first, vector<int>& second) {
        if (first.size() > second.size()) return twiceMedian(second, first);
        int n = (int)first.size(), m = (int)second.size();
        int lo = 0, hi = n, half = (n + m + 1) / 2;
        while (lo <= hi) {
            int i = lo + (hi - lo) / 2;
            int j = half - i;
            long long leftA = i ? first[i - 1] : LLONG_MIN;
            long long rightA = i < n ? first[i] : LLONG_MAX;
            long long leftB = j ? second[j - 1] : LLONG_MIN;
            long long rightB = j < m ? second[j] : LLONG_MAX;
            if (leftA <= rightB && leftB <= rightA) {
                long long left = max(leftA, leftB);
                if ((n + m) % 2) return left * 2;
                return left + min(rightA, rightB);
            }
            if (leftA > rightB) hi = i - 1;
            else lo = i + 1;
        }
        return 0;
    }`,
    expectedTime: "O(log min(n, m))",
    expectedSpace: "O(1)",
    hints: [
      "The median depends only on the one or two central values of the merged sequence.",
      "Cut both arrays so the left side has half of the combined count, rounded up. A valid cut has both left edges less than or equal to both right edges.",
      "Binary search the cut on the shorter array. If its left edge is too large, move the cut left. Otherwise move it right.",
      "The left median is the larger left edge. For an odd total, double it. For an even total, add the smaller right edge. Empty sides use infinite sentinels.",
    ],
    tests: [
      { input: { first: [1, 3], second: [2] }, expectedOutput: 4, visibility: "SAMPLE" },
      { input: { first: [1, 2], second: [3, 4] }, expectedOutput: 5, visibility: "SAMPLE" },
      { input: { first: [], second: [1] }, expectedOutput: 2, visibility: "HIDDEN" },
      { input: { first: [1, 2], second: [] }, expectedOutput: 3, visibility: "HIDDEN" },
    ],
  }),
  problem({
    slug: "search-matrix-ii",
    title: "Search a 2D Matrix II",
    difficulty: "MEDIUM",
    topics: ["binary-search"],
    tags: ["binary-search"],
    statement:
      "Every row of matrix is sorted nondecreasing from left to right, and every column is sorted nondecreasing from top to bottom. Return whether target appears.",
    constraints: ["1 <= matrix.length, matrix[0].length <= 100", "-1000000000 <= matrix[r][c], target <= 1000000000"],
    examples: [
      { input: "matrix = [[1, 4, 7], [2, 5, 8], [3, 6, 9]], target = 5", output: "true" },
      { input: "matrix = [[1, 4, 7], [2, 5, 8], [3, 6, 9]], target = 10", output: "false" },
    ],
    signature: "bool searchMatrix(vector<vector<int>>& matrix, int target)",
    functionName: "searchMatrix",
    driver: `auto matrix = in["matrix"].asIntMatrix();\n    printJson(Json::boolean(sol.searchMatrix(matrix, (int)in["target"].asInt())));`,
    method: `bool searchMatrix(vector<vector<int>>& matrix, int target) {
        int row = 0, col = (int)matrix[0].size() - 1;
        while (row < (int)matrix.size() && col >= 0) {
            if (matrix[row][col] == target) return true;
            if (matrix[row][col] > target) col--;
            else row++;
        }
        return false;
    }`,
    expectedTime: "O(rows + cols)",
    expectedSpace: "O(1)",
    hints: [
      "The top-right corner is larger than everything to its left and smaller than everything below it.",
      "Start there. A value that is too large cannot appear in that row any farther left? It cannot appear in that column above, so discard the column.",
      "If the corner is greater than target, move left. If it is smaller, move down. Equality is a hit.",
      "Each step removes a row or a column, so the search is linear in the sum of the dimensions.",
    ],
    tests: [
      { input: { matrix: [[1, 4, 7], [2, 5, 8], [3, 6, 9]], target: 5 }, expectedOutput: true, visibility: "SAMPLE" },
      { input: { matrix: [[1, 4, 7], [2, 5, 8], [3, 6, 9]], target: 10 }, expectedOutput: false, visibility: "SAMPLE" },
      { input: { matrix: [[1]], target: 1 }, expectedOutput: true, visibility: "HIDDEN" },
      { input: { matrix: [[1, 2], [3, 4]], target: 3 }, expectedOutput: true, visibility: "HIDDEN" },
    ],
  }),
  problem({
    slug: "peak-element-ii",
    title: "Find Peak Element II",
    difficulty: "MEDIUM",
    topics: ["binary-search"],
    tags: ["binary-search"],
    statement:
      "A peak is a cell strictly greater than every cell that shares an edge with it. matrix contains distinct values, so a peak exists. Return [row, column] of the peak with the smallest row, breaking a remaining tie with the smallest column. Indexes start at 0.",
    constraints: ["1 <= matrix.length, matrix[0].length <= 200", "All values are distinct.", "-1000000000 <= matrix[r][c] <= 1000000000"],
    examples: [
      { input: "matrix = [[1, 4], [3, 2]]", output: "[0, 1]" },
      { input: "matrix = [[7]]", output: "[0, 0]" },
    ],
    signature: "vector<int> peakElement(vector<vector<int>>& matrix)",
    functionName: "peakElement",
    driver: `auto matrix = in["matrix"].asIntMatrix();\n    ${numbersOut("sol.peakElement(matrix)")}`,
    method: `vector<int> peakElement(vector<vector<int>>& matrix) {
        int rows = (int)matrix.size(), cols = (int)matrix[0].size();
        for (int row = 0; row < rows; row++) for (int col = 0; col < cols; col++) {
            int value = matrix[row][col];
            bool peak = true;
            if (row && matrix[row - 1][col] > value) peak = false;
            if (row + 1 < rows && matrix[row + 1][col] > value) peak = false;
            if (col && matrix[row][col - 1] > value) peak = false;
            if (col + 1 < cols && matrix[row][col + 1] > value) peak = false;
            if (peak) return {row, col};
        }
        return {0, 0};
    }`,
    expectedTime: "O(rows * cols)",
    expectedSpace: "O(1)",
    hints: [
      "A peak only has to beat its existing neighbors. A corner has two, and an edge cell has three.",
      "A binary search on columns also finds a peak: take the largest cell in the middle column, then move toward the larger horizontal neighbor.",
      "That search is fast, but this problem asks for one particular peak: the smallest row, then the smallest column.",
      "Scan in that order and return the first cell that is strictly greater than every adjacent cell. Distinct values guarantee one exists.",
    ],
    tests: [
      { input: { matrix: [[1, 4], [3, 2]] }, expectedOutput: [0, 1], visibility: "SAMPLE" },
      { input: { matrix: [[7]] }, expectedOutput: [0, 0], visibility: "SAMPLE" },
      { input: { matrix: [[10, 20, 15], [21, 30, 14], [7, 16, 32]] }, expectedOutput: [1, 1], visibility: "HIDDEN" },
      { input: { matrix: [[2, 1]] }, expectedOutput: [0, 0], visibility: "HIDDEN" },
    ],
  }),
];
