import { problem } from "./helpers.js";

const numbersOut = (call: string) =>
  `auto values = ${call};\n    Json out;\n    out.type = Json::ARR;\n    for (long long value : values) out.a.push_back(Json::number(value));\n    printJson(out);`;

const rowsOut = (call: string) =>
  `auto rows = ${call};\n    Json out;\n    out.type = Json::ARR;\n    for (const auto& row : rows) out.a.push_back(Json::ints(row));\n    printJson(out);`;

export const arrayRestProblems = [
  problem({
    slug: "sum-k-any",
    title: "Longest Subarray with Given Sum K",
    difficulty: "MEDIUM",
    topics: ["arrays"],
    tags: ["prefix-sum"],
    statement:
      "nums may contain negative numbers and zeros. Return the length of the longest contiguous subarray whose values add up to k. Return 0 when no such subarray exists.",
    constraints: ["1 <= nums.length <= 100000", "-1000000000 <= nums[i], k <= 1000000000"],
    examples: [
      { input: "nums = [1, -1, 5, -2, 3], k = 3", output: "4", explanation: "1 + -1 + 5 + -2 = 3." },
      { input: "nums = [1], k = 2", output: "0" },
    ],
    signature: "int longestSumAny(vector<int>& nums, int k)",
    functionName: "longestSumAny",
    driver: `auto nums = in["nums"].asIntVector();\n    printJson(Json::number(sol.longestSumAny(nums, (int)in["k"].asInt())));`,
    method: `int longestSumAny(vector<int>& nums, int k) {
        map<long long, int> first;
        first[0] = -1;
        long long sum = 0;
        int best = 0;
        for (int i = 0; i < (int)nums.size(); i++) {
            sum += nums[i];
            auto it = first.find(sum - k);
            if (it != first.end()) best = max(best, i - it->second);
            if (!first.count(sum)) first[sum] = i;
        }
        return best;
    }`,
    expectedTime: "O(n log n)",
    expectedSpace: "O(n)",
    hints: [
      "A sliding window that shrinks whenever the sum is too large only works when every value is positive.",
      "If prefix[j] - prefix[i] = k, the subarray after i and through j is a candidate. Store the earliest index of each prefix sum.",
      "Keep a map from prefix sum to its first index. Include 0 at index -1 so a subarray starting at the front can be seen.",
      "When sum - k was seen before, the distance is a candidate. Do not overwrite an earlier index of the same prefix, or a longer span is lost.",
    ],
    tests: [
      { input: { nums: [1, -1, 5, -2, 3], k: 3 }, expectedOutput: 4, visibility: "SAMPLE" },
      { input: { nums: [1], k: 2 }, expectedOutput: 0, visibility: "SAMPLE" },
      { input: { nums: [1, 2, 3], k: 3 }, expectedOutput: 2, visibility: "HIDDEN" },
      { input: { nums: [-1, -1, 1], k: 0 }, expectedOutput: 2, visibility: "HIDDEN" },
    ],
  }),
  problem({
    slug: "max-sum-subarray",
    title: "Print the Maximum Sum Subarray",
    difficulty: "MEDIUM",
    topics: ["arrays"],
    tags: ["kadane"],
    statement:
      "Return one contiguous subarray whose sum is maximum. If several subarrays share that sum, return the one with the smallest starting index, and break a remaining tie with the smallest ending index.",
    constraints: ["1 <= nums.length <= 100000", "-1000000000 <= nums[i] <= 1000000000"],
    examples: [
      { input: "nums = [-2, 1, -3, 4, -1, 2, 1, -5, 4]", output: "[4, -1, 2, 1]" },
      { input: "nums = [-2, -1]", output: "[-1]" },
    ],
    signature: "vector<int> maxSumSubarray(vector<int>& nums)",
    functionName: "maxSumSubarray",
    driver: `auto nums = in["nums"].asIntVector();\n    ${numbersOut("sol.maxSumSubarray(nums)")}`,
    method: `vector<int> maxSumSubarray(vector<int>& nums) {
        long long best = nums[0], cur = nums[0];
        int bl = 0, br = 0, start = 0;
        for (int i = 1; i < (int)nums.size(); i++) {
            if (cur < 0) { cur = nums[i]; start = i; }
            else cur += nums[i];
            if (cur > best || (cur == best && (start < bl || (start == bl && i < br)))) {
                best = cur; bl = start; br = i;
            }
        }
        return vector<int>(nums.begin() + bl, nums.begin() + br + 1);
    }`,
    expectedTime: "O(n)",
    expectedSpace: "O(1)",
    hints: [
      "A prefix that is already negative cannot help a later subarray.",
      "Keep a running sum and remember where the current piece started. Also remember the best piece seen so far.",
      "When the running sum is negative, start a new piece at the next index. Otherwise extend the current piece.",
      "Replace the saved piece only when the sum is larger, or when the sum is equal and the new piece starts earlier or ends earlier. Sums need a wide integer.",
    ],
    tests: [
      { input: { nums: [-2, 1, -3, 4, -1, 2, 1, -5, 4] }, expectedOutput: [4, -1, 2, 1], visibility: "SAMPLE" },
      { input: { nums: [-2, -1] }, expectedOutput: [-1], visibility: "SAMPLE" },
      { input: { nums: [1] }, expectedOutput: [1], visibility: "HIDDEN" },
      { input: { nums: [5, -10, 5] }, expectedOutput: [5], visibility: "HIDDEN" },
    ],
  }),
  problem({
    slug: "pascal-triangle",
    title: "Pascal's Triangle",
    difficulty: "EASY",
    topics: ["arrays"],
    tags: ["math"],
    statement: "Return the first n rows of Pascal's triangle. Row 1 is [1]. Each later entry is the sum of the two entries above it, and every row starts and ends with 1.",
    constraints: ["1 <= n <= 30"],
    examples: [
      { input: "n = 5", output: "[[1], [1, 1], [1, 2, 1], [1, 3, 3, 1], [1, 4, 6, 4, 1]]" },
      { input: "n = 1", output: "[[1]]" },
    ],
    signature: "vector<vector<int>> pascalTriangle(int n)",
    functionName: "pascalTriangle",
    driver: `${rowsOut('sol.pascalTriangle((int)in["n"].asInt())')}`,
    method: `vector<vector<int>> pascalTriangle(int n) {
        vector<vector<int>> rows(n);
        for (int r = 0; r < n; r++) {
            rows[r].assign(r + 1, 1);
            for (int c = 1; c < r; c++) rows[r][c] = rows[r - 1][c - 1] + rows[r - 1][c];
        }
        return rows;
    }`,
    expectedTime: "O(n^2)",
    expectedSpace: "O(n^2)",
    hints: [
      "Each row is one entry longer than the row above it.",
      "The edges are always 1. An interior entry adds the neighbor on the left and the neighbor above.",
      "Build row r from row r - 1. There is no need to compute binomial coefficients directly.",
      "n is at most 30, so every entry fits in a signed 32-bit integer. Fill the edges first, then the middle.",
    ],
    tests: [
      { input: { n: 5 }, expectedOutput: [[1], [1, 1], [1, 2, 1], [1, 3, 3, 1], [1, 4, 6, 4, 1]], visibility: "SAMPLE" },
      { input: { n: 1 }, expectedOutput: [[1]], visibility: "SAMPLE" },
      { input: { n: 2 }, expectedOutput: [[1], [1, 1]], visibility: "HIDDEN" },
      { input: { n: 3 }, expectedOutput: [[1], [1, 1], [1, 2, 1]], visibility: "HIDDEN" },
    ],
  }),
  problem({
    slug: "majority-element-ii",
    title: "Majority Element II",
    difficulty: "MEDIUM",
    topics: ["arrays"],
    tags: ["boyer-moore"],
    statement:
      "Return every value that appears more than floor(nums.length / 3) times, sorted ascending. At most two values can qualify. Return an empty list when none do.",
    constraints: ["1 <= nums.length <= 100000", "-1000000000 <= nums[i] <= 1000000000"],
    examples: [
      { input: "nums = [3, 2, 3]", output: "[3]" },
      { input: "nums = [1, 2]", output: "[1, 2]" },
    ],
    signature: "vector<int> majorityTwo(vector<int>& nums)",
    functionName: "majorityTwo",
    driver: `auto nums = in["nums"].asIntVector();\n    ${numbersOut("sol.majorityTwo(nums)")}`,
    method: `vector<int> majorityTwo(vector<int>& nums) {
        int first = 0, second = 0, count1 = 0, count2 = 0;
        for (int value : nums) {
            if (count1 && value == first) count1++;
            else if (count2 && value == second) count2++;
            else if (!count1) { first = value; count1 = 1; }
            else if (!count2) { second = value; count2 = 1; }
            else { count1--; count2--; }
        }
        count1 = count2 = 0;
        for (int value : nums) {
            if (value == first) count1++;
            else if (value == second) count2++;
        }
        vector<int> answer;
        int need = (int)nums.size() / 3;
        if (count1 > need) answer.push_back(first);
        if (count2 > need && second != first) answer.push_back(second);
        sort(answer.begin(), answer.end());
        return answer;
    }`,
    expectedTime: "O(n)",
    expectedSpace: "O(1)",
    hints: [
      "More than n / 3 means at most two survivors. A third frequent value would need more than n slots.",
      "Keep two candidates and two counters. A value that matches a candidate increments it.",
      "When both candidates are set and the value matches neither, decrement both counters. A counter that hits zero can take a new candidate.",
      "The counters are not the real frequencies. Scan once more, keep a candidate only when its true count is greater than n / 3, and sort the survivors.",
    ],
    tests: [
      { input: { nums: [3, 2, 3] }, expectedOutput: [3], visibility: "SAMPLE" },
      { input: { nums: [1, 2] }, expectedOutput: [1, 2], visibility: "SAMPLE" },
      { input: { nums: [1] }, expectedOutput: [1], visibility: "HIDDEN" },
      { input: { nums: [1, 2, 3] }, expectedOutput: [], visibility: "HIDDEN" },
    ],
  }),
  problem({
    slug: "four-sum",
    title: "4Sum",
    difficulty: "MEDIUM",
    topics: ["arrays"],
    tags: ["two-pointers"],
    statement:
      "Return every unique quadruplet of values from nums that adds up to target. Each quadruplet uses four different indexes. Sort each quadruplet ascending, and sort the list of quadruplets lexicographically. Return an empty list when none exist.",
    constraints: ["0 <= nums.length <= 200", "-1000000000 <= nums[i], target <= 1000000000"],
    examples: [
      {
        input: "nums = [1, 0, -1, 0, -2, 2], target = 0",
        output: "[[-2, -1, 1, 2], [-2, 0, 0, 2], [-1, 0, 0, 1]]",
      },
      { input: "nums = [1, 2, 3], target = 6", output: "[]" },
    ],
    signature: "vector<vector<int>> fourSum(vector<int>& nums, int target)",
    functionName: "fourSum",
    driver: `auto nums = in["nums"].asIntVector();\n    ${rowsOut("sol.fourSum(nums, (int)in[\"target\"].asInt())")}`,
    method: `vector<vector<int>> fourSum(vector<int>& nums, int target) {
        sort(nums.begin(), nums.end());
        int n = (int)nums.size();
        vector<vector<int>> rows;
        for (int i = 0; i < n; i++) {
            if (i && nums[i] == nums[i - 1]) continue;
            for (int j = i + 1; j < n; j++) {
                if (j > i + 1 && nums[j] == nums[j - 1]) continue;
                int left = j + 1, right = n - 1;
                while (left < right) {
                    long long sum = (long long)nums[i] + nums[j] + nums[left] + nums[right];
                    if (sum == target) {
                        rows.push_back({nums[i], nums[j], nums[left], nums[right]});
                        left++; right--;
                        while (left < right && nums[left] == nums[left - 1]) left++;
                        while (left < right && nums[right] == nums[right + 1]) right--;
                    } else if (sum < target) left++;
                    else right--;
                }
            }
        }
        return rows;
    }`,
    expectedTime: "O(n^3)",
    expectedSpace: "O(1)",
    hints: [
      "Sort first. Equal values then sit together, which makes duplicate quadruplets easy to skip.",
      "Fix two indexes and solve the remaining pair with two pointers on the sorted tail.",
      "Add the four values in a wide integer. Move the left pointer up when the sum is small and the right pointer down when it is large.",
      "After recording a match, skip repeated values at both pointers and at the two fixed indexes. n is at most 200, so the cubic scan fits.",
    ],
    tests: [
      { input: { nums: [1, 0, -1, 0, -2, 2], target: 0 }, expectedOutput: [[-2, -1, 1, 2], [-2, 0, 0, 2], [-1, 0, 0, 1]], visibility: "SAMPLE" },
      { input: { nums: [1, 2, 3], target: 6 }, expectedOutput: [], visibility: "SAMPLE" },
      { input: { nums: [2, 2, 2, 2, 2], target: 8 }, expectedOutput: [[2, 2, 2, 2]], visibility: "HIDDEN" },
      { input: { nums: [], target: 0 }, expectedOutput: [], visibility: "HIDDEN" },
    ],
  }),
  problem({
    slug: "zero-sum-length",
    title: "Largest Subarray with Sum 0",
    difficulty: "MEDIUM",
    topics: ["arrays"],
    tags: ["prefix-sum"],
    statement: "Return the length of the longest contiguous subarray whose values add up to 0. Return 0 when every subarray has a nonzero sum.",
    constraints: ["1 <= nums.length <= 100000", "-1000000000 <= nums[i] <= 1000000000"],
    examples: [
      { input: "nums = [15, -2, 2, -8, 1, 7, 10, 23]", output: "5" },
      { input: "nums = [1, 2, 3]", output: "0" },
    ],
    signature: "int zeroSumLength(vector<int>& nums)",
    functionName: "zeroSumLength",
    driver: `auto nums = in["nums"].asIntVector();\n    printJson(Json::number(sol.zeroSumLength(nums)));`,
    method: `int zeroSumLength(vector<int>& nums) {
        map<long long, int> first;
        first[0] = -1;
        long long sum = 0;
        int best = 0;
        for (int i = 0; i < (int)nums.size(); i++) {
            sum += nums[i];
            auto it = first.find(sum);
            if (it != first.end()) best = max(best, i - it->second);
            else first[sum] = i;
        }
        return best;
    }`,
    expectedTime: "O(n log n)",
    expectedSpace: "O(n)",
    hints: [
      "A subarray sums to 0 exactly when the prefix sum returns to a value it has already had.",
      "Store the first index of every prefix sum, and treat the empty prefix as 0 at index -1.",
      "If the current prefix was seen before, the distance between those indexes is a zero-sum subarray.",
      "Keep the earliest index only. The longest distance is the answer, or 0 when a prefix never repeats.",
    ],
    tests: [
      { input: { nums: [15, -2, 2, -8, 1, 7, 10, 23] }, expectedOutput: 5, visibility: "SAMPLE" },
      { input: { nums: [1, 2, 3] }, expectedOutput: 0, visibility: "SAMPLE" },
      { input: { nums: [1, -1] }, expectedOutput: 2, visibility: "HIDDEN" },
      { input: { nums: [0] }, expectedOutput: 1, visibility: "HIDDEN" },
    ],
  }),
  problem({
    slug: "subarray-xor-k",
    title: "Count Subarrays with XOR K",
    difficulty: "HARD",
    topics: ["arrays"],
    tags: ["prefix-sum"],
    statement: "Return how many contiguous subarrays have a bitwise XOR equal to k.",
    constraints: ["1 <= nums.length <= 100000", "0 <= nums[i], k <= 1000000000"],
    examples: [
      { input: "nums = [4, 2, 2, 6, 4], k = 6", output: "4" },
      { input: "nums = [0], k = 0", output: "1" },
    ],
    signature: "long long subarrayXor(vector<int>& nums, int k)",
    functionName: "subarrayXor",
    driver: `auto nums = in["nums"].asIntVector();\n    printJson(Json::number(sol.subarrayXor(nums, (int)in["k"].asInt())));`,
    method: `long long subarrayXor(vector<int>& nums, int k) {
        map<int, long long> seen;
        seen[0] = 1;
        int prefix = 0;
        long long answer = 0;
        for (int value : nums) {
            prefix ^= value;
            auto it = seen.find(prefix ^ k);
            if (it != seen.end()) answer += it->second;
            seen[prefix]++;
        }
        return answer;
    }`,
    expectedTime: "O(n log n)",
    expectedSpace: "O(n)",
    hints: [
      "XOR of a subarray is prefix[j] XOR prefix[i - 1].",
      "You want prefix[j] XOR earlier = k, which means the earlier prefix is prefix[j] XOR k.",
      "Count how many times each prefix XOR has occurred. Start with 0 counted once, for the empty prefix.",
      "Add the count of prefix XOR k before recording the current prefix. The total can exceed a 32-bit integer.",
    ],
    tests: [
      { input: { nums: [4, 2, 2, 6, 4], k: 6 }, expectedOutput: 4, visibility: "SAMPLE" },
      { input: { nums: [0], k: 0 }, expectedOutput: 1, visibility: "SAMPLE" },
      { input: { nums: [5, 6, 7, 8, 9], k: 5 }, expectedOutput: 2, visibility: "HIDDEN" },
      { input: { nums: [1, 1, 1], k: 0 }, expectedOutput: 2, visibility: "HIDDEN" },
    ],
  }),
  problem({
    slug: "merge-sorted-arrays",
    title: "Merge Two Sorted Arrays",
    difficulty: "MEDIUM",
    topics: ["arrays"],
    tags: ["two-pointers"],
    statement:
      "first and second are each sorted in nondecreasing order. Merge them so first holds the smaller values, second holds the rest, and both are sorted nondecreasing. Return [first, second]. Either array may be empty.",
    constraints: ["0 <= first.length, second.length <= 100000", "-1000000000 <= first[i], second[j] <= 1000000000"],
    examples: [
      { input: "first = [1, 3, 5, 7], second = [0, 2, 6, 8, 9]", output: "[[0, 1, 2, 3], [5, 6, 7, 8, 9]]" },
      { input: "first = [], second = [1, 2]", output: "[[], [1, 2]]" },
    ],
    signature: "vector<vector<int>> mergeSorted(vector<int>& first, vector<int>& second)",
    functionName: "mergeSorted",
    driver: `auto first = in["first"].asIntVector();\n    auto second = in["second"].asIntVector();\n    ${rowsOut("sol.mergeSorted(first, second)")}`,
    method: `vector<vector<int>> mergeSorted(vector<int>& first, vector<int>& second) {
        vector<int> both;
        int i = 0, j = 0;
        while (i < (int)first.size() && j < (int)second.size()) {
            if (first[i] <= second[j]) both.push_back(first[i++]);
            else both.push_back(second[j++]);
        }
        while (i < (int)first.size()) both.push_back(first[i++]);
        while (j < (int)second.size()) both.push_back(second[j++]);
        vector<int> left(both.begin(), both.begin() + first.size());
        vector<int> right(both.begin() + first.size(), both.end());
        return {left, right};
    }`,
    expectedTime: "O(n + m)",
    expectedSpace: "O(n + m)",
    hints: [
      "The smaller n values of the combined sequence belong in the first array. n is the original length of first.",
      "The gap method compares items a fixed distance apart and swaps them when they are out of order, then shrinks the gap. It rearranges the two arrays without a third array of size n + m.",
      "Start the gap at half the combined length, rounding up, and reduce it the same way until the gap is 1. Treat the two arrays as one sequence.",
      "After the gap of 1 finishes, both pieces are sorted and the cut between them is unchanged. An empty side simply stays empty.",
    ],
    tests: [
      { input: { first: [1, 3, 5, 7], second: [0, 2, 6, 8, 9] }, expectedOutput: [[0, 1, 2, 3], [5, 6, 7, 8, 9]], visibility: "SAMPLE" },
      { input: { first: [], second: [1, 2] }, expectedOutput: [[], [1, 2]], visibility: "SAMPLE" },
      { input: { first: [1, 2], second: [] }, expectedOutput: [[1, 2], []], visibility: "HIDDEN" },
      { input: { first: [1, 4], second: [2, 3] }, expectedOutput: [[1, 2], [3, 4]], visibility: "HIDDEN" },
    ],
  }),
  problem({
    slug: "count-inversions",
    title: "Count Inversions",
    difficulty: "HARD",
    topics: ["arrays"],
    tags: ["merge-sort"],
    statement: "Return how many pairs of indexes i < j have nums[i] > nums[j].",
    constraints: ["0 <= nums.length <= 100000", "-1000000000 <= nums[i] <= 1000000000"],
    examples: [
      { input: "nums = [2, 4, 1, 3, 5]", output: "3" },
      { input: "nums = [1]", output: "0" },
    ],
    signature: "long long countInversions(vector<int>& nums)",
    functionName: "countInversions",
    driver: `auto nums = in["nums"].asIntVector();\n    printJson(Json::number(sol.countInversions(nums)));`,
    method: `long long countInversions(vector<int>& nums) {
        long long answer = 0;
        function<void(int, int)> sortRange = [&](int left, int right) {
            if (right - left <= 1) return;
            int mid = left + (right - left) / 2;
            sortRange(left, mid);
            sortRange(mid, right);
            vector<int> merged;
            int i = left, j = mid;
            while (i < mid && j < right) {
                if (nums[i] <= nums[j]) merged.push_back(nums[i++]);
                else { merged.push_back(nums[j++]); answer += mid - i; }
            }
            while (i < mid) merged.push_back(nums[i++]);
            while (j < right) merged.push_back(nums[j++]);
            for (int k = left; k < right; k++) nums[k] = merged[k - left];
        };
        sortRange(0, (int)nums.size());
        return answer;
    }`,
    expectedTime: "O(n log n)",
    expectedSpace: "O(n)",
    hints: [
      "A pair is inverted when a larger value sits somewhere before a smaller one.",
      "Merge sort already compares two sorted halves. Every time a value from the right half is taken first, it forms an inversion with each remaining value on the left.",
      "Count mid - i when the right value is smaller. Equal values are not inversions, so take the left value on a tie.",
      "The count can exceed a 32-bit integer. The merge itself stays linear per level, so the whole count is n log n.",
    ],
    tests: [
      { input: { nums: [2, 4, 1, 3, 5] }, expectedOutput: 3, visibility: "SAMPLE" },
      { input: { nums: [1] }, expectedOutput: 0, visibility: "SAMPLE" },
      { input: { nums: [5, 4, 3, 2, 1] }, expectedOutput: 10, visibility: "HIDDEN" },
      { input: { nums: [] }, expectedOutput: 0, visibility: "HIDDEN" },
    ],
  }),
  problem({
    slug: "reverse-pairs",
    title: "Reverse Pairs",
    difficulty: "HARD",
    topics: ["arrays"],
    tags: ["merge-sort"],
    statement: "Return how many pairs of indexes i < j have nums[i] > 2 * nums[j]. The product uses the full integer value, not a 32-bit wrap.",
    constraints: ["0 <= nums.length <= 100000", "-1000000000 <= nums[i] <= 1000000000"],
    examples: [
      { input: "nums = [1, 3, 2, 3, 1]", output: "2" },
      { input: "nums = [1, 1]", output: "0" },
    ],
    signature: "long long reversePairs(vector<int>& nums)",
    functionName: "reversePairs",
    driver: `auto nums = in["nums"].asIntVector();\n    printJson(Json::number(sol.reversePairs(nums)));`,
    method: `long long reversePairs(vector<int>& nums) {
        long long answer = 0;
        function<void(int, int)> sortRange = [&](int left, int right) {
            if (right - left <= 1) return;
            int mid = left + (right - left) / 2;
            sortRange(left, mid);
            sortRange(mid, right);
            int j = mid;
            for (int i = left; i < mid; i++) {
                while (j < right && nums[i] > 2LL * nums[j]) j++;
                answer += j - mid;
            }
            inplace_merge(nums.begin() + left, nums.begin() + mid, nums.begin() + right);
        };
        sortRange(0, (int)nums.size());
        return answer;
    }`,
    expectedTime: "O(n log n)",
    expectedSpace: "O(n)",
    hints: [
      "This is stricter than an ordinary inversion: the earlier value must be more than twice the later one.",
      "After both halves are sorted, two pointers can count the pairs between them before the halves are merged.",
      "For each left value, advance a pointer on the right while the left value is greater than twice the right value. Add how far that pointer moved.",
      "Multiply by 2 in a wide integer. Count these pairs before merging, because the merge destroys the half boundary. The right pointer only moves forward.",
    ],
    tests: [
      { input: { nums: [1, 3, 2, 3, 1] }, expectedOutput: 2, visibility: "SAMPLE" },
      { input: { nums: [1, 1] }, expectedOutput: 0, visibility: "SAMPLE" },
      { input: { nums: [2, 4, 3, 5, 1] }, expectedOutput: 3, visibility: "HIDDEN" },
      { input: { nums: [5, 4] }, expectedOutput: 0, visibility: "HIDDEN" },
    ],
  }),
];
