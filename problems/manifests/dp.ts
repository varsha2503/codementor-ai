import { problem } from "./helpers.js";

export const dpProblems = [
  problem({
    slug: "stair-routes",
    title: "Climbing Stairs",
    difficulty: "EASY",
    topics: ["dynamic-programming"],
    tags: ["dp"],
    statement:
      "A staircase has steps stairs. From any stair you may climb 1 or 2 steps. Return how many different orders reach the top. The answer fits in a 32-bit signed integer. steps is at most 45, which is large enough that a plain exponential recursion will time out.",
    constraints: ["1 <= steps <= 45"],
    examples: [
      { input: "steps = 2", output: "2", explanation: "1+1 and 2." },
      { input: "steps = 3", output: "3", explanation: "1+1+1, 1+2, and 2+1." },
    ],
    signature: "int stairRoutes(int steps)",
    functionName: "stairRoutes",
    driver: `printJson(Json::number(sol.stairRoutes((int)in["steps"].asInt())));`,
    method: `int stairRoutes(int steps) {
        if (steps <= 2) return steps;
        int a = 1, b = 2;
        for (int i = 3; i <= steps; i++) {
            int c = a + b;
            a = b;
            b = c;
        }
        return b;
    }`,
    expectedTime: "O(n)",
    expectedSpace: "O(1)",
    hints: [
      "The ways to reach stair n are the ways to reach n - 1, then take a single step, plus the ways to reach n - 2, then take a double step. Those smaller answers get reused.",
      "This is the Fibonacci recurrence. You can store every answer, or only the previous two.",
      "Let f(1) = 1 and f(2) = 2. For each later stair, add the previous two answers. Two rolling variables are enough.",
      "The loop runs once per stair, so the time is linear and the extra memory is constant. A recursion that branches to n - 1 and n - 2 without memory repeats the same stair many times and will miss the limit near 45.",
    ],
    tests: [
      { input: { steps: 2 }, expectedOutput: 2, visibility: "SAMPLE" },
      { input: { steps: 3 }, expectedOutput: 3, visibility: "SAMPLE" },
      { input: { steps: 1 }, expectedOutput: 1, visibility: "HIDDEN" },
      { input: { steps: 5 }, expectedOutput: 8, visibility: "HIDDEN" },
      { input: { steps: 45 }, expectedOutput: 1836311903, visibility: "HIDDEN" },
    ],
  }),
  problem({
    slug: "house-payout",
    title: "House Robber",
    difficulty: "EASY",
    topics: ["dynamic-programming"],
    tags: ["dp"],
    statement:
      "Houses on a street each offer a payout. You may not collect from two adjacent houses. Return the largest total you can collect. An empty street pays nothing.",
    constraints: ["0 <= values.length <= 100", "0 <= values[i] <= 400"],
    examples: [
      { input: "values = [1, 2, 3, 1]", output: "4", explanation: "1 + 3." },
      { input: "values = [2, 7, 9, 3, 1]", output: "12", explanation: "2 + 9 + 1." },
    ],
    signature: "int housePayout(vector<int>& values)",
    functionName: "housePayout",
    driver: `auto values = in["values"].asIntVector();\n    printJson(Json::number(sol.housePayout(values)));`,
    method: `int housePayout(vector<int>& values) {
        int skip = 0, take = 0;
        for (int value : values) {
            int next = max(take, skip + value);
            skip = take;
            take = next;
        }
        return take;
    }`,
    expectedTime: "O(n)",
    expectedSpace: "O(1)",
    hints: [
      "For each house, the choice is to skip it or to take it and give up the previous house. The best choice depends on answers you already know.",
      "Keep two running answers: the best total that ends by skipping the previous house, and the best total that was allowed to take it.",
      "For the current payout, the next best is the larger of 'keep the previous best' and 'previous skip total plus this payout'. Then slide the two totals forward.",
      "One pass updates a constant amount of state, so time is linear and extra memory is constant. Taking a house must use the best total from two houses back, not from the adjacent house.",
    ],
    tests: [
      { input: { values: [1, 2, 3, 1] }, expectedOutput: 4, visibility: "SAMPLE" },
      { input: { values: [2, 7, 9, 3, 1] }, expectedOutput: 12, visibility: "SAMPLE" },
      { input: { values: [2, 1] }, expectedOutput: 2, visibility: "HIDDEN" },
      { input: { values: [] }, expectedOutput: 0, visibility: "HIDDEN" },
      { input: { values: [5] }, expectedOutput: 5, visibility: "HIDDEN" },
      { input: { values: [2, 1, 1, 2] }, expectedOutput: 4, visibility: "HIDDEN" },
    ],
  }),
  problem({
    slug: "coin-picks",
    title: "Coin Change",
    difficulty: "MEDIUM",
    topics: ["dynamic-programming"],
    tags: ["dp"],
    statement:
      "You have unlimited copies of each coin. Return the fewest coins that sum to amount. If no combination works, return -1. Amount 0 needs no coins.",
    constraints: ["1 <= coins.length <= 12", "1 <= coins[i] <= 200", "0 <= amount <= 10000"],
    examples: [
      { input: "coins = [1, 2, 5], amount = 11", output: "3", explanation: "5 + 5 + 1." },
      { input: "coins = [2], amount = 3", output: "-1" },
      { input: "coins = [1], amount = 0", output: "0" },
    ],
    signature: "int fewestCoins(vector<int>& coins, int amount)",
    functionName: "fewestCoins",
    driver: `auto coins = in["coins"].asIntVector();\n    printJson(Json::number(sol.fewestCoins(coins, (int)in["amount"].asInt())));`,
    method: `int fewestCoins(vector<int>& coins, int amount) {
        const int INF = 1e9;
        vector<int> dp(amount + 1, INF);
        dp[0] = 0;
        for (int value = 1; value <= amount; value++) {
            for (int coin : coins) {
                if (coin <= value) dp[value] = min(dp[value], dp[value - coin] + 1);
            }
        }
        return dp[amount] >= INF ? -1 : dp[amount];
    }`,
    expectedTime: "O(amount * coins)",
    expectedSpace: "O(amount)",
    hints: [
      "The fewest coins for an amount is one plus the fewest coins for a smaller amount, after placing one coin. Many amounts share those smaller answers.",
      "A table dp[x] can store the fewest coins that make x. Start from 0, which takes no coins.",
      "For every amount from 1 upward, try each coin that fits and keep the minimum of dp[amount - coin] + 1. Amounts you cannot make stay at a sentinel.",
      "The nested loops are amount times the number of coin types. Extra memory is the table. Use a sentinel larger than any real answer, and turn that sentinel into -1 at the end. Order matters: smaller amounts must be finished before larger ones that depend on them.",
    ],
    tests: [
      { input: { coins: [1, 2, 5], amount: 11 }, expectedOutput: 3, visibility: "SAMPLE" },
      { input: { coins: [2], amount: 3 }, expectedOutput: -1, visibility: "SAMPLE" },
      { input: { coins: [1], amount: 0 }, expectedOutput: 0, visibility: "HIDDEN" },
      { input: { coins: [1, 3, 4], amount: 6 }, expectedOutput: 2, visibility: "HIDDEN" },
      { input: { coins: [2, 5], amount: 3 }, expectedOutput: -1, visibility: "HIDDEN" },
    ],
  }),
  problem({
    slug: "subset-ways",
    title: "Count Subsets with Sum K",
    difficulty: "MEDIUM",
    topics: ["dynamic-programming", "recursion"],
    tags: ["dp"],
    statement:
      "Count the subsets of nums that add up to target. Each value may be used only in the positions where it already appears. The empty subset sums to 0, so a target of 0 has at least one subset.",
    constraints: ["0 <= nums.length <= 20", "1 <= nums[i] <= 1000", "0 <= target <= 1000"],
    examples: [
      { input: "nums = [1, 2, 3], target = 3", output: "2", explanation: "{3} and {1, 2}." },
      { input: "nums = [1, 1, 1], target = 2", output: "3" },
    ],
    signature: "int subsetWays(vector<int>& nums, int target)",
    functionName: "subsetWays",
    driver: `auto nums = in["nums"].asIntVector();\n    printJson(Json::number(sol.subsetWays(nums, (int)in["target"].asInt())));`,
    method: `int subsetWays(vector<int>& nums, int target) {
        vector<int> dp(target + 1);
        dp[0] = 1;
        for (int value : nums) {
            for (int sum = target; sum >= value; sum--) dp[sum] += dp[sum - value];
        }
        return dp[target];
    }`,
    expectedTime: "O(n * target)",
    expectedSpace: "O(target)",
    hints: [
      "Every value is either in the subset or out of it. If you decide that from left to right and remember how many ways make each sum, you will not rebuild the same sum from scratch.",
      "dp[s] can be the number of ways to make s with the values considered so far. dp[0] starts at 1.",
      "Process one value at a time. Walk the sums downward from target to that value, adding dp[sum - value] into dp[sum]. Walking downward stops one value from being used twice.",
      "The table update is the 0/1 knapsack counting transition. Time is values times target, and the table is the extra memory. An empty input with target 0 returns 1. If you walk the sums upward, you count combinations that reuse a value.",
    ],
    tests: [
      { input: { nums: [1, 2, 3], target: 3 }, expectedOutput: 2, visibility: "SAMPLE" },
      { input: { nums: [1, 1, 1], target: 2 }, expectedOutput: 3, visibility: "SAMPLE" },
      { input: { nums: [2, 4, 6], target: 6 }, expectedOutput: 2, visibility: "HIDDEN" },
      { input: { nums: [], target: 0 }, expectedOutput: 1, visibility: "HIDDEN" },
      { input: { nums: [1], target: 0 }, expectedOutput: 1, visibility: "HIDDEN" },
      { input: { nums: [2, 2, 2], target: 4 }, expectedOutput: 3, visibility: "HIDDEN" },
    ],
  }),
  problem({
    slug: "rising-signal",
    title: "Longest Increasing Subsequence",
    difficulty: "HARD",
    topics: ["dynamic-programming", "binary-search"],
    tags: ["lis"],
    statement:
      "A sensor writes a sequence of readings. A rising signal is a subsequence that strictly increases, not necessarily contiguous. Return the length of the longest rising signal. An empty sequence has length 0.",
    constraints: ["0 <= readings.length <= 2500", "-10000 <= readings[i] <= 10000"],
    examples: [
      { input: "readings = [10, 9, 2, 5, 3, 7, 101, 18]", output: "4", explanation: "One longest signal is 2, 3, 7, 101." },
      { input: "readings = [7, 7, 7]", output: "1" },
    ],
    signature: "int risingSignal(vector<int>& readings)",
    functionName: "risingSignal",
    driver: `auto readings = in["readings"].asIntVector();\n    printJson(Json::number(sol.risingSignal(readings)));`,
    method: `int risingSignal(vector<int>& readings) {
        vector<int> tails;
        for (int value : readings) {
            auto it = lower_bound(tails.begin(), tails.end(), value);
            if (it == tails.end()) tails.push_back(value);
            else *it = value;
        }
        return (int)tails.size();
    }`,
    expectedTime: "O(n log n)",
    expectedSpace: "O(n)",
    hints: [
      "A quadratic comparison of every earlier reading is correct and may be fast enough here, but the tighter question is how to extend the best signals you have already started.",
      "Keep the smallest tail of every increasing length found so far. That list of tails stays sorted.",
      "For each reading, binary-search the first tail that is greater than or equal to it. Replace that tail, or append when every tail is smaller. The list length is the answer. It is not always a real subsequence you can read off directly.",
      "Patience sorting computes the length in n log n time. Equal readings must replace, not extend, because the signal has to be strict. An empty input leaves the tail list empty. A fully decreasing input has length 1.",
    ],
    tests: [
      { input: { readings: [10, 9, 2, 5, 3, 7, 101, 18] }, expectedOutput: 4, visibility: "SAMPLE" },
      { input: { readings: [0, 1, 0, 3, 2, 3] }, expectedOutput: 4, visibility: "SAMPLE" },
      { input: { readings: [7, 7, 7] }, expectedOutput: 1, visibility: "HIDDEN" },
      { input: { readings: [] }, expectedOutput: 0, visibility: "HIDDEN" },
      { input: { readings: [1, 3, 6, 7, 9, 4, 10, 5, 6] }, expectedOutput: 6, visibility: "HIDDEN" },
      { input: { readings: [5, 4, 3, 2, 1] }, expectedOutput: 1, visibility: "HIDDEN" },
    ],
  }),
  problem({
    slug: "corridor-routes",
    title: "Unique Paths II",
    difficulty: "MEDIUM",
    topics: ["dynamic-programming"],
    tags: ["dp"],
    statement:
      "A corridor is a grid of 0s and 1s. 0 is open and 1 is blocked. From the top-left cell you may move only right or down, and you need the number of routes to the bottom-right cell. A blocked start or finish has zero routes. A single open cell has one route: staying there.",
    constraints: ["1 <= rows, columns <= 100", "Each cell is 0 or 1."],
    examples: [
      { input: "grid = [[0,0,0],[0,1,0],[0,0,0]]", output: "2" },
      { input: "grid = [[0,1],[0,0]]", output: "1" },
    ],
    signature: "int corridorRoutes(vector<vector<int>>& grid)",
    functionName: "corridorRoutes",
    driver: `auto grid = in["grid"].asIntMatrix();\n    printJson(Json::number(sol.corridorRoutes(grid)));`,
    method: `int corridorRoutes(vector<vector<int>>& grid) {
        int rows = (int)grid.size(), cols = (int)grid[0].size();
        if (grid[0][0] || grid[rows - 1][cols - 1]) return 0;
        vector<int> dp(cols);
        dp[0] = 1;
        for (int r = 0; r < rows; r++) {
            for (int c = 0; c < cols; c++) {
                if (grid[r][c] == 1) dp[c] = 0;
                else if (c > 0) dp[c] += dp[c - 1];
            }
        }
        return dp[cols - 1];
    }`,
    expectedTime: "O(rows * cols)",
    expectedSpace: "O(cols)",
    hints: [
      "Every open cell is reached from the open cell above it, the open cell to its left, or both. Counting those arrivals is the whole problem.",
      "One row of counts is enough if you overwrite it from left to right, because the left neighbor is already the current row and the stored value is still the previous row.",
      "Set the start to 1 route when it is open. For every other cell, a block becomes 0. An open cell becomes the sum of the left count and the count already stored in that column.",
      "The grid is filled once. The rolling row is the extra memory. Check the finish cell up front: a blocked finish is zero even if the rest of the grid is open. Do not add a route through a blocked cell.",
    ],
    tests: [
      { input: { grid: [[0, 0, 0], [0, 1, 0], [0, 0, 0]] }, expectedOutput: 2, visibility: "SAMPLE" },
      { input: { grid: [[0, 1], [0, 0]] }, expectedOutput: 1, visibility: "SAMPLE" },
      { input: { grid: [[1, 0]] }, expectedOutput: 0, visibility: "HIDDEN" },
      { input: { grid: [[0]] }, expectedOutput: 1, visibility: "HIDDEN" },
      { input: { grid: [[0, 0], [0, 0]] }, expectedOutput: 2, visibility: "HIDDEN" },
      { input: { grid: [[0, 0], [1, 0]] }, expectedOutput: 1, visibility: "HIDDEN" },
    ],
  }),
  problem({
    slug: "palindrome-cuts",
    title: "Palindrome Partitioning II",
    difficulty: "HARD",
    topics: ["dynamic-programming", "strings"],
    tags: ["dp"],
    statement:
      "Cut a lowercase string into as few pieces as possible so every piece is a palindrome. Return the minimum number of cuts. A string that is already a palindrome needs zero cuts.",
    constraints: ["1 <= s.length <= 200", "s contains only lowercase letters."],
    examples: [
      { input: 's = "aab"', output: "1", explanation: '"aa" and "b".' },
      { input: 's = "a"', output: "0" },
    ],
    signature: "int palindromeCuts(string s)",
    functionName: "palindromeCuts",
    driver: `printJson(Json::number(sol.palindromeCuts(in["s"].asString())));`,
    method: `int palindromeCuts(string s) {
        int n = (int)s.size();
        vector<vector<char>> pal(n, vector<char>(n));
        for (int i = n - 1; i >= 0; i--) {
            for (int j = i; j < n; j++) {
                if (s[i] == s[j] && (j - i < 2 || pal[i + 1][j - 1])) pal[i][j] = 1;
            }
        }
        vector<int> dp(n, n);
        for (int i = 0; i < n; i++) {
            if (pal[0][i]) { dp[i] = 0; continue; }
            for (int j = 0; j < i; j++) if (pal[j + 1][i]) dp[i] = min(dp[i], dp[j] + 1);
        }
        return dp[n - 1];
    }`,
    expectedTime: "O(n^2)",
    expectedSpace: "O(n^2)",
    hints: [
      "A cut is useful only when the piece it finishes is a palindrome. Asking that question from scratch for every pair of indexes repeats a lot of character comparisons.",
      "Build a table of whether every substring is a palindrome. A span is a palindrome when its ends match and the inside span is a palindrome, with length 1 and 2 as the base.",
      "Let dp[i] be the fewest cuts for the prefix ending at i. If the whole prefix is a palindrome, dp[i] is 0. Otherwise try every earlier cut j where the span after j is a palindrome, and take dp[j] + 1.",
      "The palindrome table and the cut table are both quadratic, which fits a string of length 200. Fill shorter spans before longer ones, or fill by expanding from the end. A one-letter string needs no cut. The answer is the cut count, not the number of pieces.",
    ],
    tests: [
      { input: { s: "aab" }, expectedOutput: 1, visibility: "SAMPLE" },
      { input: { s: "a" }, expectedOutput: 0, visibility: "SAMPLE" },
      { input: { s: "ab" }, expectedOutput: 1, visibility: "HIDDEN" },
      { input: { s: "racecar" }, expectedOutput: 0, visibility: "HIDDEN" },
      { input: { s: "aabb" }, expectedOutput: 1, visibility: "HIDDEN" },
      { input: { s: "abc" }, expectedOutput: 2, visibility: "HIDDEN" },
    ],
  }),
];
