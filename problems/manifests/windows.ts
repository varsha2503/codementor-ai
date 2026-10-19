import { problem } from "./helpers.js";

export const windowProblems = [
  problem({
    slug: "max-ones-iii",
    title: "Max Consecutive Ones III",
    difficulty: "MEDIUM",
    topics: ["sliding-window", "arrays"],
    tags: ["sliding-window"],
    statement: "nums contains only 0 and 1. You may flip at most k zeros into ones. Return the longest stretch of ones you can make.",
    constraints: ["1 <= nums.length <= 100000", "nums[i] is 0 or 1.", "0 <= k <= nums.length"],
    examples: [
      { input: "nums = [1, 1, 1, 0, 0, 0, 1, 1, 1, 1, 0], k = 2", output: "6" },
      { input: "nums = [0], k = 0", output: "0" },
    ],
    signature: "int maxOnes(vector<int>& nums, int k)",
    functionName: "maxOnes",
    driver: `auto nums = in["nums"].asIntVector();\n    printJson(Json::number(sol.maxOnes(nums, (int)in["k"].asInt())));`,
    method: `int maxOnes(vector<int>& nums, int k) {
        int left = 0, zeros = 0, best = 0;
        for (int right = 0; right < (int)nums.size(); right++) {
            zeros += nums[right] == 0;
            while (zeros > k) zeros -= nums[left++] == 0;
            best = max(best, right - left + 1);
        }
        return best;
    }`,
    expectedTime: "O(n)",
    expectedSpace: "O(1)",
    hints: [
      "A valid window contains at most k zeros. The ones are already good.",
      "Grow the right end. Count the zeros inside the window.",
      "While the window has more than k zeros, move the left end forward and drop the zero it leaves behind.",
      "Every index enters and leaves once. The best window length is the answer. k = 0 means no zero may remain.",
    ],
    tests: [
      { input: { nums: [1, 1, 1, 0, 0, 0, 1, 1, 1, 1, 0], k: 2 }, expectedOutput: 6, visibility: "SAMPLE" },
      { input: { nums: [0], k: 0 }, expectedOutput: 0, visibility: "SAMPLE" },
      { input: { nums: [0, 0, 1, 1, 0, 0, 1, 1, 1, 0, 1, 1, 0, 0, 0, 1, 1, 1, 1], k: 3 }, expectedOutput: 10, visibility: "HIDDEN" },
      { input: { nums: [1, 1], k: 0 }, expectedOutput: 2, visibility: "HIDDEN" },
    ],
  }),
  problem({
    slug: "fruit-baskets",
    title: "Fruit Into Baskets",
    difficulty: "MEDIUM",
    topics: ["sliding-window", "arrays"],
    tags: ["sliding-window"],
    statement: "Each tree in fruits bears one type of fruit. You have two baskets, and each basket holds only one type. Return the most fruit you can pick from one contiguous row of trees.",
    constraints: ["1 <= fruits.length <= 100000", "0 <= fruits[i] <= 1000000000"],
    examples: [
      { input: "fruits = [1, 2, 1]", output: "3" },
      { input: "fruits = [0, 1, 2, 2]", output: "3" },
    ],
    signature: "int fruitBaskets(vector<int>& fruits)",
    functionName: "fruitBaskets",
    driver: `auto fruits = in["fruits"].asIntVector();\n    printJson(Json::number(sol.fruitBaskets(fruits)));`,
    method: `int fruitBaskets(vector<int>& fruits) {
        unordered_map<int, int> count;
        int left = 0, best = 0;
        for (int right = 0; right < (int)fruits.size(); right++) {
            count[fruits[right]]++;
            while ((int)count.size() > 2) {
                if (--count[fruits[left]] == 0) count.erase(fruits[left]);
                left++;
            }
            best = max(best, right - left + 1);
        }
        return best;
    }`,
    expectedTime: "O(n)",
    expectedSpace: "O(1)",
    hints: [
      "Two baskets means the row may contain at most two different types.",
      "This is the longest subarray with at most two distinct values.",
      "Grow the right end and count types. When a third type appears, shrink the left end until only two remain.",
      "Erase a type when its count hits zero, or it still occupies a basket. Each tree enters and leaves once.",
    ],
    tests: [
      { input: { fruits: [1, 2, 1] }, expectedOutput: 3, visibility: "SAMPLE" },
      { input: { fruits: [0, 1, 2, 2] }, expectedOutput: 3, visibility: "SAMPLE" },
      { input: { fruits: [1, 2, 3, 2, 2] }, expectedOutput: 4, visibility: "HIDDEN" },
      { input: { fruits: [1] }, expectedOutput: 1, visibility: "HIDDEN" },
    ],
  }),
  problem({
    slug: "binary-subarray-sum",
    title: "Binary Subarrays With Sum",
    difficulty: "MEDIUM",
    topics: ["sliding-window", "arrays"],
    tags: ["sliding-window"],
    statement: "nums contains only 0 and 1. Return how many contiguous subarrays add up to goal.",
    constraints: ["1 <= nums.length <= 100000", "nums[i] is 0 or 1.", "0 <= goal <= nums.length"],
    examples: [
      { input: "nums = [1, 0, 1, 0, 1], goal = 2", output: "4" },
      { input: "nums = [0, 0, 0, 0, 0], goal = 0", output: "15" },
    ],
    signature: "long long binarySum(vector<int>& nums, int goal)",
    functionName: "binarySum",
    driver: `auto nums = in["nums"].asIntVector();\n    printJson(Json::number(sol.binarySum(nums, (int)in["goal"].asInt())));`,
    method: `long long binarySum(vector<int>& nums, int goal) {
        auto atMost = [&](int limit) {
            if (limit < 0) return 0LL;
            int left = 0, sum = 0;
            long long ways = 0;
            for (int right = 0; right < (int)nums.size(); right++) {
                sum += nums[right];
                while (sum > limit) sum -= nums[left++];
                ways += right - left + 1;
            }
            return ways;
        };
        return atMost(goal) - atMost(goal - 1);
    }`,
    expectedTime: "O(n)",
    expectedSpace: "O(1)",
    hints: [
      "Counting sum exactly equal to goal is the count of sums at most goal minus sums at most goal - 1.",
      "Because every value is 0 or 1, a window sum only grows when the right edge is 1.",
      "For a limit, shrink the left edge while the sum is too large. Every subarray ending at the right edge and starting inside the window is valid.",
      "goal = 0 still has an answer: every subarray of zeros, and the at-most-minus-one formula uses a negative limit of zero ways.",
    ],
    tests: [
      { input: { nums: [1, 0, 1, 0, 1], goal: 2 }, expectedOutput: 4, visibility: "SAMPLE" },
      { input: { nums: [0, 0, 0, 0, 0], goal: 0 }, expectedOutput: 15, visibility: "SAMPLE" },
      { input: { nums: [1, 1, 1], goal: 1 }, expectedOutput: 3, visibility: "HIDDEN" },
      { input: { nums: [1], goal: 0 }, expectedOutput: 0, visibility: "HIDDEN" },
    ],
  }),
  problem({
    slug: "nice-subarrays",
    title: "Number of Nice Subarrays",
    difficulty: "MEDIUM",
    topics: ["sliding-window", "arrays"],
    tags: ["sliding-window"],
    statement: "A subarray is nice when it contains exactly k odd numbers. Return how many nice subarrays nums has.",
    constraints: ["1 <= nums.length <= 100000", "0 <= nums[i] <= 1000000000", "0 <= k <= nums.length"],
    examples: [
      { input: "nums = [1, 1, 2, 1, 1], k = 3", output: "2" },
      { input: "nums = [2, 4, 6], k = 1", output: "0" },
    ],
    signature: "long long niceSubarrays(vector<int>& nums, int k)",
    functionName: "niceSubarrays",
    driver: `auto nums = in["nums"].asIntVector();\n    printJson(Json::number(sol.niceSubarrays(nums, (int)in["k"].asInt())));`,
    method: `long long niceSubarrays(vector<int>& nums, int k) {
        auto atMost = [&](int limit) {
            if (limit < 0) return 0LL;
            int left = 0, odds = 0;
            long long ways = 0;
            for (int right = 0; right < (int)nums.size(); right++) {
                odds += nums[right] % 2;
                while (odds > limit) odds -= nums[left++] % 2;
                ways += right - left + 1;
            }
            return ways;
        };
        return atMost(k) - atMost(k - 1);
    }`,
    expectedTime: "O(n)",
    expectedSpace: "O(1)",
    hints: [
      "Even numbers do not change the odd count. Replace each value by 1 when it is odd and 0 when it is even.",
      "The question is then the number of subarrays whose sum is exactly k.",
      "Exactly k is at most k minus at most k - 1.",
      "Shrink a window while it holds more than the limit of odds, and add the number of valid starts ending at the current index.",
    ],
    tests: [
      { input: { nums: [1, 1, 2, 1, 1], k: 3 }, expectedOutput: 2, visibility: "SAMPLE" },
      { input: { nums: [2, 4, 6], k: 1 }, expectedOutput: 0, visibility: "SAMPLE" },
      { input: { nums: [1, 1], k: 1 }, expectedOutput: 2, visibility: "HIDDEN" },
      { input: { nums: [1], k: 0 }, expectedOutput: 0, visibility: "HIDDEN" },
    ],
  }),
  problem({
    slug: "substrings-with-abc",
    title: "Number of Substrings Containing All Three Characters",
    difficulty: "MEDIUM",
    topics: ["sliding-window", "strings"],
    tags: ["sliding-window"],
    statement: "s contains only the letters a, b, and c. Return how many substrings contain at least one of each letter.",
    constraints: ["1 <= s.length <= 100000", "s contains only a, b, and c."],
    examples: [
      { input: 's = "abcabc"', output: "10" },
      { input: 's = "ab"', output: "0" },
    ],
    signature: "long long substringsWithAbc(string s)",
    functionName: "substringsWithAbc",
    driver: `printJson(Json::number(sol.substringsWithAbc(in["s"].asString())));`,
    method: `long long substringsWithAbc(string s) {
        int last[3] = {-1, -1, -1};
        long long answer = 0;
        for (int i = 0; i < (int)s.size(); i++) {
            last[s[i] - 'a'] = i;
            int earliest = min(last[0], min(last[1], last[2]));
            if (earliest >= 0) answer += earliest + 1;
        }
        return answer;
    }`,
    expectedTime: "O(n)",
    expectedSpace: "O(1)",
    hints: [
      "A substring that ends at i and contains all three letters has a start that is not after the earliest of the three latest letters.",
      "Remember the last index of a, of b, and of c.",
      "When all three have been seen, every start from 0 through that earliest last index makes s[start..i] valid.",
      "Add earliest + 1. Before any letter is missing, add nothing.",
    ],
    tests: [
      { input: { s: "abcabc" }, expectedOutput: 10, visibility: "SAMPLE" },
      { input: { s: "ab" }, expectedOutput: 0, visibility: "SAMPLE" },
      { input: { s: "aaacb" }, expectedOutput: 3, visibility: "HIDDEN" },
      { input: { s: "abc" }, expectedOutput: 1, visibility: "HIDDEN" },
    ],
  }),
  problem({
    slug: "card-points",
    title: "Maximum Points You Can Obtain from Cards",
    difficulty: "MEDIUM",
    topics: ["sliding-window", "arrays"],
    tags: ["sliding-window"],
    statement:
      "There is a row of cards, each with points[i] points. Take exactly k cards. Every card you take must be at one of the two ends of the row that remains. Return the largest point total. k may be 0, which scores 0.",
    constraints: ["1 <= points.length <= 100000", "0 <= points[i] <= 10000", "0 <= k <= points.length"],
    examples: [
      { input: "points = [1, 2, 3, 4, 5, 6, 1], k = 3", output: "12" },
      { input: "points = [5], k = 0", output: "0" },
    ],
    signature: "int cardPoints(vector<int>& points, int k)",
    functionName: "cardPoints",
    driver: `auto points = in["points"].asIntVector();\n    printJson(Json::number(sol.cardPoints(points, (int)in["k"].asInt())));`,
    method: `int cardPoints(vector<int>& points, int k) {
        int n = (int)points.size(), window = 0;
        for (int i = 0; i < k; i++) window += points[i];
        int best = window;
        for (int takenRight = 1; takenRight <= k; takenRight++) {
            window += points[n - takenRight] - points[k - takenRight];
            best = max(best, window);
        }
        return best;
    }`,
    expectedTime: "O(k)",
    expectedSpace: "O(1)",
    hints: [
      "Taking k end cards is the same as leaving a contiguous middle of length n - k untouched.",
      "The cards you take are a prefix of the row plus a suffix, and those two pieces together contain k cards.",
      "Start with the first k cards. Then repeatedly drop the rightmost taken card from the left side and pick up the next card from the right end.",
      "k = 0 scores 0. When k equals the row length, every card is taken. The points fit in a 32-bit integer under the given limits.",
    ],
    tests: [
      { input: { points: [1, 2, 3, 4, 5, 6, 1], k: 3 }, expectedOutput: 12, visibility: "SAMPLE" },
      { input: { points: [5], k: 0 }, expectedOutput: 0, visibility: "SAMPLE" },
      { input: { points: [1, 2], k: 1 }, expectedOutput: 2, visibility: "HIDDEN" },
      { input: { points: [9, 7, 7, 9, 7, 7, 9], k: 7 }, expectedOutput: 55, visibility: "HIDDEN" },
    ],
  }),
  problem({
    slug: "k-distinct-subarrays",
    title: "Subarrays with K Different Integers",
    difficulty: "HARD",
    topics: ["sliding-window", "arrays"],
    tags: ["sliding-window"],
    statement: "Return how many contiguous subarrays of nums contain exactly k different values.",
    constraints: ["1 <= nums.length <= 100000", "0 <= nums[i] <= 1000000000", "1 <= k <= nums.length"],
    examples: [
      { input: "nums = [1, 2, 1, 2, 3], k = 2", output: "7" },
      { input: "nums = [1], k = 1", output: "1" },
    ],
    signature: "long long kDistinct(vector<int>& nums, int k)",
    functionName: "kDistinct",
    driver: `auto nums = in["nums"].asIntVector();\n    printJson(Json::number(sol.kDistinct(nums, (int)in["k"].asInt())));`,
    method: `long long kDistinct(vector<int>& nums, int k) {
        auto atMost = [&](int limit) {
            unordered_map<int, int> count;
            int left = 0;
            long long ways = 0;
            for (int right = 0; right < (int)nums.size(); right++) {
                count[nums[right]]++;
                while ((int)count.size() > limit) {
                    if (--count[nums[left]] == 0) count.erase(nums[left]);
                    left++;
                }
                ways += right - left + 1;
            }
            return ways;
        };
        return atMost(k) - atMost(k - 1);
    }`,
    expectedTime: "O(n)",
    expectedSpace: "O(k)",
    hints: [
      "Exactly k distinct values is at most k minus at most k - 1.",
      "A sliding window can count subarrays with at most a given number of distinct values.",
      "Grow the right end. While the window has too many distinct values, shrink the left end and erase a value whose count hits zero.",
      "Add right - left + 1 after the window is legal. Those are the subarrays ending at the right edge. The total can exceed a 32-bit integer.",
    ],
    tests: [
      { input: { nums: [1, 2, 1, 2, 3], k: 2 }, expectedOutput: 7, visibility: "SAMPLE" },
      { input: { nums: [1], k: 1 }, expectedOutput: 1, visibility: "SAMPLE" },
      { input: { nums: [1, 2, 1, 3, 4], k: 3 }, expectedOutput: 3, visibility: "HIDDEN" },
      { input: { nums: [1, 1], k: 2 }, expectedOutput: 0, visibility: "HIDDEN" },
    ],
  }),
  problem({
    slug: "window-subsequence",
    title: "Minimum Window Subsequence",
    difficulty: "HARD",
    topics: ["sliding-window", "strings"],
    tags: ["sliding-window"],
    statement:
      "Return the shortest contiguous window of source that contains target as a subsequence. If several windows share that length, return the leftmost one. Return an empty string when target is not a subsequence of source. Both strings are lowercase.",
    constraints: ["0 <= source.length <= 5000", "1 <= target.length <= 100"],
    examples: [
      { input: 'source = "abcdebdde", target = "bde"', output: '"bcde"' },
      { input: 'source = "abc", target = "d"', output: '""' },
    ],
    signature: "string windowSubsequence(string source, string target)",
    functionName: "windowSubsequence",
    driver: `printJson(Json::text(sol.windowSubsequence(in["source"].asString(), in["target"].asString())));`,
    method: `string windowSubsequence(string source, string target) {
        int n = (int)source.size(), m = (int)target.size();
        vector<array<int, 26>> next(n + 1);
        next[n].fill(n);
        for (int i = n - 1; i >= 0; i--) {
            next[i] = next[i + 1];
            next[i][source[i] - 'a'] = i;
        }
        string best;
        for (int i = 0; i < n; i++) {
            if (source[i] != target[0]) continue;
            int pos = i;
            bool ok = true;
            for (int j = 1; j < m; j++) {
                int found = next[pos + 1][target[j] - 'a'];
                if (found == n) { ok = false; break; }
                pos = found;
            }
            if (!ok) continue;
            int end = pos, letter = m - 1;
            int cursor = end;
            while (letter >= 0) {
                if (source[cursor] == target[letter]) letter--;
                cursor--;
            }
            int start = cursor + 1;
            if (best.empty() || end - start + 1 < (int)best.size()) best = source.substr(start, end - start + 1);
        }
        return best;
    }`,
    expectedTime: "O(n * m)",
    expectedSpace: "O(n)",
    hints: [
      "The window has to contain the letters of target in order, not necessarily as a block.",
      "From each possible start that matches the first letter, jump forward to the next required letter.",
      "Precompute, for every index, the next position of each letter. That makes each forward scan fast.",
      "After a match ends, walk target backwards from that end to pull the start as far right as it can go. Keep a window only when it is strictly shorter than the best, so the leftmost shortest window survives.",
    ],
    tests: [
      { input: { source: "abcdebdde", target: "bde" }, expectedOutput: "bcde", visibility: "SAMPLE" },
      { input: { source: "abc", target: "d" }, expectedOutput: "", visibility: "SAMPLE" },
      { input: { source: "abc", target: "c" }, expectedOutput: "c", visibility: "HIDDEN" },
      { input: { source: "cnhczmccqouqadqtmjjzl", target: "mm" }, expectedOutput: "mccqouqadqtm", visibility: "HIDDEN" },
    ],
  }),
];
