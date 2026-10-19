import { problem } from "./helpers.js";

const numbersOut = (call: string) =>
  `auto values = ${call};\n    Json out;\n    out.type = Json::ARR;\n    for (long long value : values) out.a.push_back(Json::number(value));\n    printJson(out);`;

export const dpCoreProblems = [
  problem({
    slug: "frog-jump",
    title: "Frog Jump",
    difficulty: "MEDIUM",
    topics: ["dynamic-programming"],
    tags: ["dp"],
    statement:
      "A frog starts on the first stone and wants the last stone. heights[i] is the height of stone i. From a stone the frog can jump one or two stones forward. The energy of a jump is the absolute difference of the two heights. Return the smallest total energy that reaches the last stone. One stone costs nothing.",
    constraints: ["1 <= heights.length <= 100000", "0 <= heights[i] <= 10000"],
    examples: [
      { input: "heights = [10, 20, 30, 10]", output: "20" },
      { input: "heights = [10, 50, 10]", output: "0" },
    ],
    signature: "int frogJump(vector<int>& heights)",
    functionName: "frogJump",
    driver: `auto heights = in["heights"].asIntVector();\n    printJson(Json::number(sol.frogJump(heights)));`,
    method: `int frogJump(vector<int>& heights) {
        int n = (int)heights.size();
        vector<int> cost(n);
        for (int i = 1; i < n; i++) {
            cost[i] = cost[i - 1] + abs(heights[i] - heights[i - 1]);
            if (i > 1) cost[i] = min(cost[i], cost[i - 2] + abs(heights[i] - heights[i - 2]));
        }
        return cost[n - 1];
    }`,
    expectedTime: "O(n)",
    expectedSpace: "O(n)",
    hints: [
      "The cheapest way to reach a stone depends only on the cheapest ways to reach the stones it can jump from.",
      "A stone is reached either from the previous stone or from the stone two steps back.",
      "Store the best energy for each stone from left to right, and keep the smaller of those two jumps.",
      "The last entry is the answer. A single stone never jumps. Recomputing the same stone from scratch repeats a lot of work.",
    ],
    tests: [
      { input: { heights: [10, 20, 30, 10] }, expectedOutput: 20, visibility: "SAMPLE" },
      { input: { heights: [10, 50, 10] }, expectedOutput: 0, visibility: "SAMPLE" },
      { input: { heights: [10] }, expectedOutput: 0, visibility: "HIDDEN" },
      { input: { heights: [30, 10, 60, 10, 60, 50] }, expectedOutput: 40, visibility: "HIDDEN" },
    ],
  }),
  problem({
    slug: "frog-jump-k",
    title: "Frog Jump with K Distances",
    difficulty: "MEDIUM",
    topics: ["dynamic-programming"],
    tags: ["dp"],
    statement:
      "The frog may now jump forward by any distance from 1 through k stones. The energy of a jump is still the absolute height difference. Return the smallest energy that reaches the last stone.",
    constraints: ["1 <= heights.length <= 10000", "1 <= k <= 100", "0 <= heights[i] <= 10000"],
    examples: [
      { input: "heights = [10, 30, 40, 50, 20], k = 3", output: "30" },
      { input: "heights = [10, 20, 30, 10], k = 2", output: "20" },
    ],
    signature: "int frogJumpK(vector<int>& heights, int k)",
    functionName: "frogJumpK",
    driver: `auto heights = in["heights"].asIntVector();\n    printJson(Json::number(sol.frogJumpK(heights, (int)in["k"].asInt())));`,
    method: `int frogJumpK(vector<int>& heights, int k) {
        int n = (int)heights.size();
        const int INF = 1000000000;
        vector<int> cost(n, INF);
        cost[0] = 0;
        for (int i = 1; i < n; i++) for (int step = 1; step <= k && i - step >= 0; step++) {
            cost[i] = min(cost[i], cost[i - step] + abs(heights[i] - heights[i - step]));
        }
        return cost[n - 1];
    }`,
    expectedTime: "O(n * k)",
    expectedSpace: "O(n)",
    hints: [
      "Each stone has a best energy, and a jump of length 1 through k can finish there.",
      "Fill the stones from left to right so every earlier stone is already final.",
      "For stone i, try every start i - step where step is from 1 to k and the start exists.",
      "k = 1 forces a walk along every stone. A single stone still costs 0.",
    ],
    tests: [
      { input: { heights: [10, 30, 40, 50, 20], k: 3 }, expectedOutput: 30, visibility: "SAMPLE" },
      { input: { heights: [10, 20, 30, 10], k: 2 }, expectedOutput: 20, visibility: "SAMPLE" },
      { input: { heights: [10], k: 1 }, expectedOutput: 0, visibility: "HIDDEN" },
      { input: { heights: [10, 40, 30, 10], k: 1 }, expectedOutput: 60, visibility: "HIDDEN" },
    ],
  }),
  problem({
    slug: "ninja-training",
    title: "Ninja's Training",
    difficulty: "MEDIUM",
    topics: ["dynamic-programming"],
    tags: ["dp"],
    statement:
      "points[day] holds the merit of three tasks on that day. The ninja trains once each day and cannot repeat the same task on two days in a row. Return the largest total merit.",
    constraints: ["1 <= points.length <= 100000", "Each day has exactly three merits.", "0 <= points[day][task] <= 100"],
    examples: [
      { input: "points = [[10, 40, 70], [20, 50, 80], [30, 60, 90]]", output: "210" },
      { input: "points = [[1, 2, 5], [3, 1, 1], [3, 3, 3]]", output: "11" },
    ],
    signature: "int ninjaTraining(vector<vector<int>>& points)",
    functionName: "ninjaTraining",
    driver: `auto points = in["points"].asIntMatrix();\n    printJson(Json::number(sol.ninjaTraining(points)));`,
    method: `int ninjaTraining(vector<vector<int>>& points) {
        int a = 0, b = 0, c = 0;
        for (auto& day : points) {
            int na = day[0] + max(b, c);
            int nb = day[1] + max(a, c);
            int nc = day[2] + max(a, b);
            a = na; b = nb; c = nc;
        }
        return max(a, max(b, c));
    }`,
    expectedTime: "O(days)",
    expectedSpace: "O(1)",
    hints: [
      "The best plan ending today depends on which task was used yesterday.",
      "Keep the best total that ends on each of the three tasks.",
      "Today's task adds its merit to the better of the other two tasks from yesterday.",
      "After the last day, the answer is the best of the three endings. One day just picks its largest merit.",
    ],
    tests: [
      { input: { points: [[10, 40, 70], [20, 50, 80], [30, 60, 90]] }, expectedOutput: 210, visibility: "SAMPLE" },
      { input: { points: [[1, 2, 5], [3, 1, 1], [3, 3, 3]] }, expectedOutput: 11, visibility: "SAMPLE" },
      { input: { points: [[7, 4, 1]] }, expectedOutput: 7, visibility: "HIDDEN" },
      { input: { points: [[1, 2, 3], [3, 2, 1]] }, expectedOutput: 6, visibility: "HIDDEN" },
    ],
  }),
  problem({
    slug: "unique-paths",
    title: "Unique Paths",
    difficulty: "MEDIUM",
    topics: ["dynamic-programming"],
    tags: ["dp"],
    statement:
      "A robot starts at the top-left of a grid with m rows and n columns. It may move only right or down. Return how many routes reach the bottom-right cell. A grid with one row or one column has one route. The answer fits in a 32-bit signed integer.",
    constraints: ["1 <= m, n <= 15"],
    examples: [
      { input: "m = 3, n = 7", output: "28" },
      { input: "m = 3, n = 2", output: "3" },
    ],
    signature: "int uniquePaths(int m, int n)",
    functionName: "uniquePaths",
    driver: `printJson(Json::number(sol.uniquePaths((int)in["m"].asInt(), (int)in["n"].asInt())));`,
    method: `int uniquePaths(int m, int n) {
        vector<int> ways(n, 1);
        for (int row = 1; row < m; row++) for (int col = 1; col < n; col++) ways[col] += ways[col - 1];
        return ways[n - 1];
    }`,
    expectedTime: "O(m * n)",
    expectedSpace: "O(n)",
    hints: [
      "Every cell is reached from the cell above it or the cell to its left.",
      "The first row and the first column have only one route each, because the robot cannot move up or left.",
      "Add the route counts of the two incoming cells. One rolling row is enough.",
      "A 1 by n grid or an m by 1 grid has a single route. The robot always takes m + n - 2 moves.",
    ],
    tests: [
      { input: { m: 3, n: 7 }, expectedOutput: 28, visibility: "SAMPLE" },
      { input: { m: 3, n: 2 }, expectedOutput: 3, visibility: "SAMPLE" },
      { input: { m: 1, n: 1 }, expectedOutput: 1, visibility: "HIDDEN" },
      { input: { m: 1, n: 10 }, expectedOutput: 1, visibility: "HIDDEN" },
    ],
  }),
  problem({
    slug: "falling-path",
    title: "Minimum Falling Path Sum",
    difficulty: "MEDIUM",
    topics: ["dynamic-programming"],
    tags: ["dp"],
    statement:
      "grid is a square of integers. A falling path starts at any cell of the first row. From a cell it steps to the next row, into the same column or either neighboring column, and it must stay inside the grid. Return the smallest sum of any falling path.",
    constraints: ["1 <= grid.length <= 100", "The grid is square.", "-100 <= grid[r][c] <= 100"],
    examples: [
      { input: "grid = [[2, 1, 3], [6, 5, 4], [7, 8, 9]]", output: "13" },
      { input: "grid = [[-19, 57], [-40, -5]]", output: "-59" },
    ],
    signature: "int fallingPath(vector<vector<int>>& grid)",
    functionName: "fallingPath",
    driver: `auto grid = in["grid"].asIntMatrix();\n    printJson(Json::number(sol.fallingPath(grid)));`,
    method: `int fallingPath(vector<vector<int>>& grid) {
        int n = (int)grid.size();
        vector<int> best = grid[0];
        for (int row = 1; row < n; row++) {
            vector<int> next(n, 1000000000);
            for (int col = 0; col < n; col++) for (int shift = -1; shift <= 1; shift++) {
                int from = col + shift;
                if (from >= 0 && from < n) next[col] = min(next[col], best[from] + grid[row][col]);
            }
            best.swap(next);
        }
        return *min_element(best.begin(), best.end());
    }`,
    expectedTime: "O(n^2)",
    expectedSpace: "O(n)",
    hints: [
      "The best path ending at a cell is that cell plus the best path that can step into it.",
      "A cell in the next row can be reached from at most three cells in the current row.",
      "Keep one row of best sums and replace it as you move downward.",
      "The answer is the smallest value in the last row. A single row is just its smallest cell. Negative cells can be the right choice.",
    ],
    tests: [
      { input: { grid: [[2, 1, 3], [6, 5, 4], [7, 8, 9]] }, expectedOutput: 13, visibility: "SAMPLE" },
      { input: { grid: [[-19, 57], [-40, -5]] }, expectedOutput: -59, visibility: "SAMPLE" },
      { input: { grid: [[5]] }, expectedOutput: 5, visibility: "HIDDEN" },
      { input: { grid: [[1, 2], [3, 4]] }, expectedOutput: 4, visibility: "HIDDEN" },
    ],
  }),
  problem({
    slug: "triangle-path",
    title: "Triangle",
    difficulty: "MEDIUM",
    topics: ["dynamic-programming"],
    tags: ["dp"],
    statement:
      "triangle[r] is row r, and row r contains r + 1 integers. A path starts at the single top cell. From triangle[r][c] it may move to triangle[r + 1][c] or triangle[r + 1][c + 1]. Return the smallest path sum.",
    constraints: ["1 <= triangle.length <= 100", "Row r has r + 1 values.", "-1000 <= triangle[r][c] <= 1000"],
    examples: [
      { input: "triangle = [[2], [3, 4], [6, 5, 7], [4, 1, 8, 3]]", output: "11" },
      { input: "triangle = [[-10]]", output: "-10" },
    ],
    signature: "int trianglePath(vector<vector<int>>& triangle)",
    functionName: "trianglePath",
    driver: `auto triangle = in["triangle"].asIntMatrix();\n    printJson(Json::number(sol.trianglePath(triangle)));`,
    method: `int trianglePath(vector<vector<int>>& triangle) {
        vector<int> best = triangle.back();
        for (int row = (int)triangle.size() - 2; row >= 0; row--) {
            for (int col = 0; col <= row; col++) best[col] = triangle[row][col] + min(best[col], best[col + 1]);
        }
        return best[0];
    }`,
    expectedTime: "O(rows^2)",
    expectedSpace: "O(rows)",
    hints: [
      "From a cell, the remaining cost is the cell plus the cheaper of the two cells under it.",
      "Those two choices are adjacent in the next row.",
      "Start at the bottom row, where the remaining cost is the cell itself, and walk upward.",
      "The top cell then holds the answer. One row has no choice. A negative cell is allowed.",
    ],
    tests: [
      { input: { triangle: [[2], [3, 4], [6, 5, 7], [4, 1, 8, 3]] }, expectedOutput: 11, visibility: "SAMPLE" },
      { input: { triangle: [[-10]] }, expectedOutput: -10, visibility: "SAMPLE" },
      { input: { triangle: [[1], [2, 3]] }, expectedOutput: 3, visibility: "HIDDEN" },
      { input: { triangle: [[1], [-5, 2], [3, -1, 4]] }, expectedOutput: -5, visibility: "HIDDEN" },
    ],
  }),
  problem({
    slug: "ninja-friends",
    title: "Ninja and his Friends",
    difficulty: "MEDIUM",
    topics: ["dynamic-programming"],
    tags: ["dp"],
    statement:
      "grid holds chocolates. One friend starts at the top-left cell and the other at the top-right cell. In one move, both friends step to the next row, and each may shift one column left, stay, or shift one column right, while staying inside the grid. A chocolate cell is collected once even if both friends land on it. Return the most chocolates they can collect on the way to the last row.",
    constraints: ["1 <= rows, columns <= 50", "0 <= grid[r][c] <= 100"],
    examples: [
      { input: "grid = [[3, 1, 1], [2, 5, 1], [1, 5, 5], [2, 1, 1]]", output: "24" },
      { input: "grid = [[8]]", output: "8" },
    ],
    signature: "int ninjaFriends(vector<vector<int>>& grid)",
    functionName: "ninjaFriends",
    driver: `auto grid = in["grid"].asIntMatrix();\n    printJson(Json::number(sol.ninjaFriends(grid)));`,
    method: `int ninjaFriends(vector<vector<int>>& grid) {
        int rows = (int)grid.size(), cols = (int)grid[0].size();
        const int NEG = -1000000000;
        vector<vector<int>> best(cols, vector<int>(cols, NEG));
        best[0][cols - 1] = grid[0][0] + (cols == 1 ? 0 : grid[0][cols - 1]);
        for (int row = 1; row < rows; row++) {
            vector<vector<int>> next(cols, vector<int>(cols, NEG));
            for (int c1 = 0; c1 < cols; c1++) for (int c2 = 0; c2 < cols; c2++) if (best[c1][c2] > NEG / 2) {
                for (int d1 = -1; d1 <= 1; d1++) for (int d2 = -1; d2 <= 1; d2++) {
                    int n1 = c1 + d1, n2 = c2 + d2;
                    if (n1 < 0 || n2 < 0 || n1 >= cols || n2 >= cols) continue;
                    int add = n1 == n2 ? grid[row][n1] : grid[row][n1] + grid[row][n2];
                    next[n1][n2] = max(next[n1][n2], best[c1][c2] + add);
                }
            }
            best.swap(next);
        }
        int answer = NEG;
        for (auto& row : best) for (int value : row) answer = max(answer, value);
        return answer;
    }`,
    expectedTime: "O(rows * cols^2)",
    expectedSpace: "O(cols^2)",
    hints: [
      "The state is the row and the two columns the friends occupy.",
      "Both friends move together, so one row index is enough.",
      "From a pair of columns, try all nine combinations of their next shifts and add the chocolates, counting a shared cell once.",
      "The answer is the best pair on the last row. A single cell is collected once.",
    ],
    tests: [
      { input: { grid: [[3, 1, 1], [2, 5, 1], [1, 5, 5], [2, 1, 1]] }, expectedOutput: 24, visibility: "SAMPLE" },
      { input: { grid: [[8]] }, expectedOutput: 8, visibility: "SAMPLE" },
      { input: { grid: [[1, 2], [3, 4]] }, expectedOutput: 10, visibility: "HIDDEN" },
      { input: { grid: [[1, 0, 1]] }, expectedOutput: 2, visibility: "HIDDEN" },
    ],
  }),
  problem({
    slug: "subset-sum",
    title: "Subset Sum Equal to Target",
    difficulty: "HARD",
    topics: ["dynamic-programming"],
    tags: ["dp"],
    statement:
      "Return whether a subset of nums adds up to target. Each value may be used only once. The empty subset sums to 0.",
    constraints: ["1 <= nums.length <= 100", "1 <= nums[i] <= 1000", "0 <= target <= 10000"],
    examples: [
      { input: "nums = [1, 2, 3], target = 5", output: "true" },
      { input: "nums = [1, 2, 3], target = 7", output: "false" },
    ],
    signature: "bool subsetSum(vector<int>& nums, int target)",
    functionName: "subsetSum",
    driver: `auto nums = in["nums"].asIntVector();\n    printJson(Json::boolean(sol.subsetSum(nums, (int)in["target"].asInt())));`,
    method: `bool subsetSum(vector<int>& nums, int target) {
        vector<char> can(target + 1);
        can[0] = 1;
        for (int value : nums) for (int sum = target; sum >= value; sum--) can[sum] = can[sum] || can[sum - value];
        return can[target];
    }`,
    expectedTime: "O(n * target)",
    expectedSpace: "O(target)",
    hints: [
      "A sum is possible when some earlier sum, plus one unused value, reaches it.",
      "A boolean table of reachable sums starts with 0 reachable.",
      "Process each value once, and update the table from the target downward so a value is not reused inside the same pass.",
      "The cell for the target is the answer. Target 0 is always reachable. Updating upward would let one value be counted many times.",
    ],
    tests: [
      { input: { nums: [1, 2, 3], target: 5 }, expectedOutput: true, visibility: "SAMPLE" },
      { input: { nums: [1, 2, 3], target: 7 }, expectedOutput: false, visibility: "SAMPLE" },
      { input: { nums: [2, 3, 7, 8, 10], target: 11 }, expectedOutput: true, visibility: "HIDDEN" },
      { input: { nums: [1], target: 0 }, expectedOutput: true, visibility: "HIDDEN" },
    ],
  }),
  problem({
    slug: "equal-partition",
    title: "Partition Equal Subset Sum",
    difficulty: "HARD",
    topics: ["dynamic-programming"],
    tags: ["dp"],
    statement:
      "Return whether nums can be split into two groups with the same sum. Every element belongs to exactly one group. A group may be empty only when the total is 0, which does not happen here.",
    constraints: ["1 <= nums.length <= 200", "1 <= nums[i] <= 100"],
    examples: [
      { input: "nums = [1, 5, 11, 5]", output: "true" },
      { input: "nums = [1, 2, 3, 5]", output: "false" },
    ],
    signature: "bool equalPartition(vector<int>& nums)",
    functionName: "equalPartition",
    driver: `auto nums = in["nums"].asIntVector();\n    printJson(Json::boolean(sol.equalPartition(nums)));`,
    method: `bool equalPartition(vector<int>& nums) {
        int total = accumulate(nums.begin(), nums.end(), 0);
        if (total % 2) return false;
        int target = total / 2;
        vector<char> can(target + 1);
        can[0] = 1;
        for (int value : nums) for (int sum = target; sum >= value; sum--) can[sum] = can[sum] || can[sum - value];
        return can[target];
    }`,
    expectedTime: "O(n * sum)",
    expectedSpace: "O(sum)",
    hints: [
      "Two equal groups exist exactly when some subset sums to half the total.",
      "An odd total can never split evenly.",
      "After that check, this is the subset-sum question with target equal to half the total.",
      "Update the reachable sums downward so each element is used once. Two equal numbers can form the two groups.",
    ],
    tests: [
      { input: { nums: [1, 5, 11, 5] }, expectedOutput: true, visibility: "SAMPLE" },
      { input: { nums: [1, 2, 3, 5] }, expectedOutput: false, visibility: "SAMPLE" },
      { input: { nums: [1, 1] }, expectedOutput: true, visibility: "HIDDEN" },
      { input: { nums: [1] }, expectedOutput: false, visibility: "HIDDEN" },
    ],
  }),
  problem({
    slug: "min-partition",
    title: "Minimum Absolute Sum Difference Partition",
    difficulty: "HARD",
    topics: ["dynamic-programming"],
    tags: ["dp"],
    statement:
      "Split nums into two groups so every element is in exactly one group. Return the smallest absolute difference between the two group sums.",
    constraints: ["1 <= nums.length <= 100", "1 <= nums[i] <= 1000"],
    examples: [
      { input: "nums = [1, 6, 11, 5]", output: "1" },
      { input: "nums = [1, 2, 7]", output: "4" },
    ],
    signature: "int minPartition(vector<int>& nums)",
    functionName: "minPartition",
    driver: `auto nums = in["nums"].asIntVector();\n    printJson(Json::number(sol.minPartition(nums)));`,
    method: `int minPartition(vector<int>& nums) {
        int total = accumulate(nums.begin(), nums.end(), 0);
        vector<char> can(total + 1);
        can[0] = 1;
        for (int value : nums) for (int sum = total; sum >= value; sum--) can[sum] = can[sum] || can[sum - value];
        int best = total;
        for (int sum = 0; sum <= total; sum++) if (can[sum]) best = min(best, abs(total - 2 * sum));
        return best;
    }`,
    expectedTime: "O(n * sum)",
    expectedSpace: "O(sum)",
    hints: [
      "The difference between the two groups is the total minus twice the subset you put in the first group.",
      "The closest subset sum to half the total gives the smallest difference.",
      "Mark every reachable subset sum, then scan those sums.",
      "One element has difference equal to itself. A perfect split has difference 0.",
    ],
    tests: [
      { input: { nums: [1, 6, 11, 5] }, expectedOutput: 1, visibility: "SAMPLE" },
      { input: { nums: [1, 2, 7] }, expectedOutput: 4, visibility: "SAMPLE" },
      { input: { nums: [1] }, expectedOutput: 1, visibility: "HIDDEN" },
      { input: { nums: [1, 2, 3] }, expectedOutput: 0, visibility: "HIDDEN" },
    ],
  }),
  problem({
    slug: "count-partitions",
    title: "Count Partitions with Given Difference",
    difficulty: "HARD",
    topics: ["dynamic-programming"],
    tags: ["dp"],
    statement:
      "Choose a subset of nums to be the first group and put every remaining element in the second group. Return how many subsets make the first group's sum larger than the second by exactly difference. Take the count modulo 1000000007. If difference is larger than the total, or the total plus difference is odd, return 0.",
    constraints: ["1 <= nums.length <= 100", "1 <= nums[i] <= 1000", "0 <= difference <= 10000"],
    examples: [
      { input: "nums = [5, 2, 6, 4], difference = 3", output: "1" },
      { input: "nums = [1, 1, 1, 1], difference = 0", output: "6" },
    ],
    signature: "int countPartitions(vector<int>& nums, int difference)",
    functionName: "countPartitions",
    driver: `auto nums = in["nums"].asIntVector();\n    printJson(Json::number(sol.countPartitions(nums, (int)in["difference"].asInt())));`,
    method: `int countPartitions(vector<int>& nums, int difference) {
        int total = accumulate(nums.begin(), nums.end(), 0);
        if (difference > total || (total + difference) % 2) return 0;
        int target = (total + difference) / 2;
        const int MOD = 1000000007;
        vector<int> ways(target + 1);
        ways[0] = 1;
        for (int value : nums) for (int sum = target; sum >= value; sum--) ways[sum] = (ways[sum] + ways[sum - value]) % MOD;
        return ways[target];
    }`,
    expectedTime: "O(n * sum)",
    expectedSpace: "O(sum)",
    hints: [
      "If the two group sums differ by difference and add up to the total, the larger group has a fixed sum.",
      "That sum is (total + difference) / 2, and it has to be an integer.",
      "Count the subsets that make that sum. Each element is used at most once, so walk the sum table downward.",
      "Modulo the count as you add. Difference 0 counts every subset that holds exactly half the total, including both sides of a split.",
    ],
    tests: [
      { input: { nums: [5, 2, 6, 4], difference: 3 }, expectedOutput: 1, visibility: "SAMPLE" },
      { input: { nums: [1, 1, 1, 1], difference: 0 }, expectedOutput: 6, visibility: "SAMPLE" },
      { input: { nums: [1, 2], difference: 4 }, expectedOutput: 0, visibility: "HIDDEN" },
      { input: { nums: [1], difference: 0 }, expectedOutput: 0, visibility: "HIDDEN" },
    ],
  }),
  problem({
    slug: "coin-change-ii",
    title: "Coin Change II",
    difficulty: "HARD",
    topics: ["dynamic-programming"],
    tags: ["dp"],
    statement:
      "You have unlimited copies of each coin. Return how many combinations make amount. Order does not matter: 1 + 2 and 2 + 1 are the same combination. Amount 0 has one combination, using no coins. The answer fits in a 32-bit signed integer.",
    constraints: ["1 <= coins.length <= 100", "1 <= coins[i] <= 200", "The coin values are distinct.", "0 <= amount <= 1000"],
    examples: [
      { input: "coins = [1, 2, 5], amount = 5", output: "4" },
      { input: "coins = [2], amount = 3", output: "0" },
    ],
    signature: "int coinChangeII(vector<int>& coins, int amount)",
    functionName: "coinChangeII",
    driver: `auto coins = in["coins"].asIntVector();\n    printJson(Json::number(sol.coinChangeII(coins, (int)in["amount"].asInt())));`,
    method: `int coinChangeII(vector<int>& coins, int amount) {
        vector<long long> ways(amount + 1);
        ways[0] = 1;
        for (int coin : coins) for (int value = coin; value <= amount; value++) ways[value] += ways[value - coin];
        return (int)ways[amount];
    }`,
    expectedTime: "O(amount * coins)",
    expectedSpace: "O(amount)",
    hints: [
      "Combinations ignore order, so each coin type should be considered completely before the next type.",
      "ways[x] can store how many combinations make x.",
      "For one coin, walk the amounts upward and add ways[amount - coin]. Upward order allows unlimited copies of that coin.",
      "Doing the coins in the outer loop prevents 1 + 2 and 2 + 1 from both being counted. Amount 0 starts at one. An amount that no coin can build stays 0.",
    ],
    tests: [
      { input: { coins: [1, 2, 5], amount: 5 }, expectedOutput: 4, visibility: "SAMPLE" },
      { input: { coins: [2], amount: 3 }, expectedOutput: 0, visibility: "SAMPLE" },
      { input: { coins: [1], amount: 0 }, expectedOutput: 1, visibility: "HIDDEN" },
      { input: { coins: [1, 2], amount: 3 }, expectedOutput: 2, visibility: "HIDDEN" },
    ],
  }),
  problem({
    slug: "target-sum",
    title: "Target Sum",
    difficulty: "HARD",
    topics: ["dynamic-programming"],
    tags: ["dp"],
    statement:
      "Place + or - before every number in nums so the expression equals target. Return how many ways that can be done. +0 and -0 count as different signs. The answer fits in a 32-bit signed integer.",
    constraints: ["1 <= nums.length <= 20", "0 <= nums[i] <= 1000", "-1000 <= target <= 1000"],
    examples: [
      { input: "nums = [1, 1, 1, 1, 1], target = 3", output: "5" },
      { input: "nums = [1], target = 2", output: "0" },
    ],
    signature: "int targetSum(vector<int>& nums, int target)",
    functionName: "targetSum",
    driver: `auto nums = in["nums"].asIntVector();\n    printJson(Json::number(sol.targetSum(nums, (int)in["target"].asInt())));`,
    method: `int targetSum(vector<int>& nums, int target) {
        int total = accumulate(nums.begin(), nums.end(), 0);
        if (abs(target) > total || (total + target) % 2) return 0;
        int goal = (total + target) / 2;
        vector<int> ways(goal + 1);
        ways[0] = 1;
        for (int value : nums) for (int sum = goal; sum >= value; sum--) ways[sum] += ways[sum - value];
        return ways[goal];
    }`,
    expectedTime: "O(n * sum)",
    expectedSpace: "O(sum)",
    hints: [
      "The positive numbers and the negative numbers are two groups whose difference is the target.",
      "The positive group must sum to (total + target) / 2.",
      "Count subsets with that sum. A zero can sit in either group without changing the sum, so it doubles the ways.",
      "If the target is larger than the total, or total + target is odd, no expression works.",
    ],
    tests: [
      { input: { nums: [1, 1, 1, 1, 1], target: 3 }, expectedOutput: 5, visibility: "SAMPLE" },
      { input: { nums: [1], target: 2 }, expectedOutput: 0, visibility: "SAMPLE" },
      { input: { nums: [1], target: 1 }, expectedOutput: 1, visibility: "HIDDEN" },
      { input: { nums: [0, 0], target: 0 }, expectedOutput: 4, visibility: "HIDDEN" },
    ],
  }),
  problem({
    slug: "unbounded-knapsack",
    title: "Unbounded Knapsack",
    difficulty: "HARD",
    topics: ["dynamic-programming"],
    tags: ["dp"],
    statement:
      "Each item has a weight and a value, and you may take unlimited copies of it. Return the largest value that fits in capacity. Capacity 0 holds nothing.",
    constraints: ["1 <= weights.length <= 100", "weights and values have the same length.", "1 <= weights[i], values[i] <= 1000", "0 <= capacity <= 1000"],
    examples: [
      { input: "weights = [2, 4, 6], values = [5, 11, 13], capacity = 10", output: "27" },
      { input: "weights = [5], values = [10], capacity = 4", output: "0" },
    ],
    signature: "int unboundedKnapsack(vector<int>& weights, vector<int>& values, int capacity)",
    functionName: "unboundedKnapsack",
    driver: `auto weights = in["weights"].asIntVector();\n    auto values = in["values"].asIntVector();\n    printJson(Json::number(sol.unboundedKnapsack(weights, values, (int)in["capacity"].asInt())));`,
    method: `int unboundedKnapsack(vector<int>& weights, vector<int>& values, int capacity) {
        vector<int> best(capacity + 1);
        for (int i = 0; i < (int)weights.size(); i++) {
            for (int cap = weights[i]; cap <= capacity; cap++) best[cap] = max(best[cap], best[cap - weights[i]] + values[i]);
        }
        return best[capacity];
    }`,
    expectedTime: "O(items * capacity)",
    expectedSpace: "O(capacity)",
    hints: [
      "Because copies are unlimited, a capacity can reuse an item that was already used for a smaller capacity.",
      "best[cap] stores the largest value that fits in that capacity.",
      "For each item, walk capacities upward from its weight and relax best[cap] with best[cap - weight] + value.",
      "Upward order is what allows a second copy. An item heavier than the capacity never fits.",
    ],
    tests: [
      { input: { weights: [2, 4, 6], values: [5, 11, 13], capacity: 10 }, expectedOutput: 27, visibility: "SAMPLE" },
      { input: { weights: [5], values: [10], capacity: 4 }, expectedOutput: 0, visibility: "SAMPLE" },
      { input: { weights: [1], values: [1], capacity: 0 }, expectedOutput: 0, visibility: "HIDDEN" },
      { input: { weights: [2, 3], values: [4, 5], capacity: 6 }, expectedOutput: 12, visibility: "HIDDEN" },
    ],
  }),
  problem({
    slug: "rod-cutting",
    title: "Rod Cutting",
    difficulty: "HARD",
    topics: ["dynamic-programming"],
    tags: ["dp"],
    statement:
      "A rod has length price.length. price[i] is what a piece of length i + 1 sells for. You may cut the rod into any number of whole pieces. Return the largest total price.",
    constraints: ["1 <= price.length <= 1000", "1 <= price[i] <= 1000"],
    examples: [
      { input: "price = [1, 5, 8, 9, 10, 17, 17, 20]", output: "22" },
      { input: "price = [3]", output: "3" },
    ],
    signature: "int rodCutting(vector<int>& price)",
    functionName: "rodCutting",
    driver: `auto price = in["price"].asIntVector();\n    printJson(Json::number(sol.rodCutting(price)));`,
    method: `int rodCutting(vector<int>& price) {
        int n = (int)price.size();
        vector<int> best(n + 1);
        for (int length = 1; length <= n; length++) {
            for (int cut = 1; cut <= length; cut++) best[length] = max(best[length], price[cut - 1] + best[length - cut]);
        }
        return best[n];
    }`,
    expectedTime: "O(n^2)",
    expectedSpace: "O(n)",
    hints: [
      "A rod of length L is a first piece plus the best way to sell whatever remains.",
      "The first piece can be any length from 1 through L.",
      "Fill a table from short rods to long rods. The remaining length is already solved.",
      "This is an unbounded choice: several pieces may have the same length. A rod of length 1 cannot be cut.",
    ],
    tests: [
      { input: { price: [1, 5, 8, 9, 10, 17, 17, 20] }, expectedOutput: 22, visibility: "SAMPLE" },
      { input: { price: [3] }, expectedOutput: 3, visibility: "SAMPLE" },
      { input: { price: [1, 5, 8, 9] }, expectedOutput: 10, visibility: "HIDDEN" },
      { input: { price: [1, 1, 1] }, expectedOutput: 3, visibility: "HIDDEN" },
    ],
  }),
];
