import { problem } from "./helpers.js";

const numbersOut = (call: string) =>
  `auto values = ${call};\n    Json out;\n    out.type = Json::ARR;\n    for (long long value : values) out.a.push_back(Json::number(value));\n    printJson(out);`;

export const dpSeqProblems = [
  problem({
    slug: "print-lis",
    title: "Print Longest Increasing Subsequence",
    difficulty: "MEDIUM",
    topics: ["dynamic-programming"],
    tags: ["dp"],
    statement:
      "Return a longest strictly increasing subsequence of nums. If several subsequences share that length, return the lexicographically smallest one. An empty input returns an empty list.",
    constraints: ["0 <= nums.length <= 200", "-10000 <= nums[i] <= 10000"],
    examples: [
      { input: "nums = [10, 9, 2, 5, 3, 7, 101, 18]", output: "[2, 3, 7, 18]" },
      { input: "nums = [0, 1, 0, 3, 2, 3]", output: "[0, 1, 2, 3]" },
    ],
    signature: "vector<int> printLis(vector<int>& nums)",
    functionName: "printLis",
    driver: `auto nums = in["nums"].asIntVector();\n    ${numbersOut("sol.printLis(nums)")}`,
    method: `vector<int> printLis(vector<int>& nums) {
        int n = (int)nums.size();
        vector<vector<int>> best(n);
        vector<int> answer;
        for (int i = 0; i < n; i++) {
            best[i] = {nums[i]};
            for (int j = 0; j < i; j++) if (nums[j] < nums[i]) {
                auto candidate = best[j];
                candidate.push_back(nums[i]);
                if (candidate.size() > best[i].size() || (candidate.size() == best[i].size() && candidate < best[i])) best[i] = candidate;
            }
            if (best[i].size() > answer.size() || (best[i].size() == answer.size() && best[i] < answer)) answer = best[i];
        }
        return answer;
    }`,
    expectedTime: "O(n^2)",
    expectedSpace: "O(n^2)",
    hints: [
      "The best subsequence ending at each index is some shorter best subsequence plus this value.",
      "It has to be strictly increasing, so only earlier smaller values can be extended.",
      "When two endings have the same length, keep the lexicographically smaller sequence.",
      "The answer is the best sequence among all endings, again preferring the smaller one on a tie. Equal values cannot extend each other. An empty list stays empty.",
    ],
    tests: [
      { input: { nums: [10, 9, 2, 5, 3, 7, 101, 18] }, expectedOutput: [2, 3, 7, 18], visibility: "SAMPLE" },
      { input: { nums: [0, 1, 0, 3, 2, 3] }, expectedOutput: [0, 1, 2, 3], visibility: "SAMPLE" },
      { input: { nums: [7, 7, 7] }, expectedOutput: [7], visibility: "HIDDEN" },
      { input: { nums: [] }, expectedOutput: [], visibility: "HIDDEN" },
    ],
  }),
  problem({
    slug: "largest-divisible",
    title: "Largest Divisible Subset",
    difficulty: "MEDIUM",
    topics: ["dynamic-programming"],
    tags: ["dp"],
    statement:
      "Return the largest subset of nums in which every pair has one value dividing the other. Return it in increasing order. If several subsets share that size, return the lexicographically smallest sequence.",
    constraints: ["1 <= nums.length <= 200", "1 <= nums[i] <= 100000", "The values are distinct."],
    examples: [
      { input: "nums = [1, 2, 3]", output: "[1, 2]" },
      { input: "nums = [1, 2, 4, 8]", output: "[1, 2, 4, 8]" },
    ],
    signature: "vector<int> largestDivisible(vector<int>& nums)",
    functionName: "largestDivisible",
    driver: `auto nums = in["nums"].asIntVector();\n    ${numbersOut("sol.largestDivisible(nums)")}`,
    method: `vector<int> largestDivisible(vector<int>& nums) {
        sort(nums.begin(), nums.end());
        int n = (int)nums.size();
        vector<vector<int>> best(n);
        vector<int> answer;
        for (int i = 0; i < n; i++) {
            best[i] = {nums[i]};
            for (int j = 0; j < i; j++) if (nums[i] % nums[j] == 0) {
                auto candidate = best[j];
                candidate.push_back(nums[i]);
                if (candidate.size() > best[i].size() || (candidate.size() == best[i].size() && candidate < best[i])) best[i] = candidate;
            }
            if (best[i].size() > answer.size() || (best[i].size() == answer.size() && best[i] < answer)) answer = best[i];
        }
        return answer;
    }`,
    expectedTime: "O(n^2)",
    expectedSpace: "O(n^2)",
    hints: [
      "Sort first. In a sorted divisible subset, each value only needs to be divisible by the previous one.",
      "That chain condition is enough for every pair, because divisibility is transitive on a sorted chain.",
      "Build the best chain ending at each value, and prefer the lexicographically smaller chain when lengths match.",
      "A single number is always a valid subset. Among the endings, keep the largest, then the smaller sequence.",
    ],
    tests: [
      { input: { nums: [1, 2, 3] }, expectedOutput: [1, 2], visibility: "SAMPLE" },
      { input: { nums: [1, 2, 4, 8] }, expectedOutput: [1, 2, 4, 8], visibility: "SAMPLE" },
      { input: { nums: [3, 4, 6] }, expectedOutput: [3, 6], visibility: "HIDDEN" },
      { input: { nums: [5] }, expectedOutput: [5], visibility: "HIDDEN" },
    ],
  }),
  problem({
    slug: "string-chain",
    title: "Longest String Chain",
    difficulty: "MEDIUM",
    topics: ["dynamic-programming"],
    tags: ["dp"],
    statement:
      "A word is a predecessor of another when the longer word can be made by inserting exactly one letter into the shorter word. Return the length of the longest chain of predecessors in words. A single word is a chain of length 1.",
    constraints: ["1 <= words.length <= 100", "1 <= words[i].length <= 16", "Words are distinct and lowercase."],
    examples: [
      { input: 'words = ["a", "b", "ba", "bca", "bda", "bdca"]', output: "4" },
      { input: 'words = ["abcd", "dbqca"]', output: "1" },
    ],
    signature: "int stringChain(vector<string>& words)",
    functionName: "stringChain",
    driver: `auto words = in["words"].asStrings();\n    printJson(Json::number(sol.stringChain(words)));`,
    method: `int stringChain(vector<string>& words) {
        sort(words.begin(), words.end(), [](const string& a, const string& b) { return a.size() < b.size(); });
        auto predecessor = [](const string& small, const string& big) {
            if (big.size() != small.size() + 1) return false;
            int i = 0, j = 0;
            while (i < (int)small.size() && j < (int)big.size()) {
                if (small[i] == big[j]) i++;
                j++;
            }
            return i == (int)small.size();
        };
        vector<int> best((int)words.size(), 1);
        int answer = 1;
        for (int i = 0; i < (int)words.size(); i++) {
            for (int j = 0; j < i; j++) if (predecessor(words[j], words[i])) best[i] = max(best[i], best[j] + 1);
            answer = max(answer, best[i]);
        }
        return answer;
    }`,
    expectedTime: "O(n^2 * length)",
    expectedSpace: "O(n)",
    hints: [
      "A chain grows by one character at a time, so shorter words come before longer ones.",
      "Sort by length. A word can extend only a word that is exactly one character shorter.",
      "Two pointers check the insertion: every character of the shorter word must match while the longer word may skip one character.",
      "The answer is the longest chain length, not the words. Words of equal length cannot extend each other.",
    ],
    tests: [
      { input: { words: ["a", "b", "ba", "bca", "bda", "bdca"] }, expectedOutput: 4, visibility: "SAMPLE" },
      { input: { words: ["abcd", "dbqca"] }, expectedOutput: 1, visibility: "SAMPLE" },
      { input: { words: ["xbc", "pcxbcf", "xb", "cxbc", "pcxbc"] }, expectedOutput: 5, visibility: "HIDDEN" },
      { input: { words: ["a"] }, expectedOutput: 1, visibility: "HIDDEN" },
    ],
  }),
  problem({
    slug: "bitonic-subsequence",
    title: "Longest Bitonic Subsequence",
    difficulty: "MEDIUM",
    topics: ["dynamic-programming"],
    tags: ["dp"],
    statement:
      "A bitonic subsequence strictly increases up to one peak and then strictly decreases. The increasing part or the decreasing part may be empty, so a strictly increasing or strictly decreasing sequence counts. Return the length of the longest bitonic subsequence.",
    constraints: ["1 <= nums.length <= 1000", "1 <= nums[i] <= 10000"],
    examples: [
      { input: "nums = [1, 11, 2, 10, 4, 5, 2, 1]", output: "6" },
      { input: "nums = [10, 20, 30]", output: "3" },
    ],
    signature: "int bitonicSubsequence(vector<int>& nums)",
    functionName: "bitonicSubsequence",
    driver: `auto nums = in["nums"].asIntVector();\n    printJson(Json::number(sol.bitonicSubsequence(nums)));`,
    method: `int bitonicSubsequence(vector<int>& nums) {
        int n = (int)nums.size();
        vector<int> left(n, 1), right(n, 1);
        for (int i = 0; i < n; i++) for (int j = 0; j < i; j++) if (nums[j] < nums[i]) left[i] = max(left[i], left[j] + 1);
        for (int i = n - 1; i >= 0; i--) for (int j = n - 1; j > i; j--) if (nums[j] < nums[i]) right[i] = max(right[i], right[j] + 1);
        int best = 0;
        for (int i = 0; i < n; i++) best = max(best, left[i] + right[i] - 1);
        return best;
    }`,
    expectedTime: "O(n^2)",
    expectedSpace: "O(n)",
    hints: [
      "Pick the peak. Everything chosen before it increases toward it, and everything chosen after it decreases away from it.",
      "The longest increase ending at i and the longest decrease starting at i share the peak, so subtract one.",
      "Compute both directions with the usual increasing-subsequence recurrence.",
      "A fully increasing list has its peak at the end. A fully decreasing list has its peak at the start. Equal neighbors cannot be used on a strict slope.",
    ],
    tests: [
      { input: { nums: [1, 11, 2, 10, 4, 5, 2, 1] }, expectedOutput: 6, visibility: "SAMPLE" },
      { input: { nums: [10, 20, 30] }, expectedOutput: 3, visibility: "SAMPLE" },
      { input: { nums: [10, 9, 8] }, expectedOutput: 3, visibility: "HIDDEN" },
      { input: { nums: [1, 2, 1] }, expectedOutput: 3, visibility: "HIDDEN" },
    ],
  }),
  problem({
    slug: "lis-count",
    title: "Number of Longest Increasing Subsequences",
    difficulty: "MEDIUM",
    topics: ["dynamic-programming"],
    tags: ["dp"],
    statement:
      "Return how many strictly increasing subsequences of nums have the greatest length. Two subsequences are different when they use different indexes. An empty input has zero. The answer fits in a 32-bit signed integer.",
    constraints: ["0 <= nums.length <= 500", "-10000 <= nums[i] <= 10000"],
    examples: [
      { input: "nums = [1, 3, 5, 4, 7]", output: "2" },
      { input: "nums = [2, 2, 2, 2, 2]", output: "5" },
    ],
    signature: "int lisCount(vector<int>& nums)",
    functionName: "lisCount",
    driver: `auto nums = in["nums"].asIntVector();\n    printJson(Json::number(sol.lisCount(nums)));`,
    method: `int lisCount(vector<int>& nums) {
        int n = (int)nums.size();
        if (n == 0) return 0;
        vector<int> length(n, 1), ways(n, 1);
        for (int i = 0; i < n; i++) for (int j = 0; j < i; j++) if (nums[j] < nums[i]) {
            if (length[j] + 1 > length[i]) { length[i] = length[j] + 1; ways[i] = ways[j]; }
            else if (length[j] + 1 == length[i]) ways[i] += ways[j];
        }
        int best = *max_element(length.begin(), length.end()), total = 0;
        for (int i = 0; i < n; i++) if (length[i] == best) total += ways[i];
        return total;
    }`,
    expectedTime: "O(n^2)",
    expectedSpace: "O(n)",
    hints: [
      "Along with the best length ending at each index, remember how many subsequences achieve it.",
      "Extending a shorter length replaces the count. Matching the current best length adds the counts.",
      "Equal values do not extend, so each lone equal value is its own subsequence of length 1.",
      "Add the counts of every index whose length equals the global maximum. An empty list contributes nothing.",
    ],
    tests: [
      { input: { nums: [1, 3, 5, 4, 7] }, expectedOutput: 2, visibility: "SAMPLE" },
      { input: { nums: [2, 2, 2, 2, 2] }, expectedOutput: 5, visibility: "SAMPLE" },
      { input: { nums: [1] }, expectedOutput: 1, visibility: "HIDDEN" },
      { input: { nums: [] }, expectedOutput: 0, visibility: "HIDDEN" },
    ],
  }),
  problem({
    slug: "matrix-chain",
    title: "Matrix Chain Multiplication",
    difficulty: "HARD",
    topics: ["dynamic-programming"],
    tags: ["dp"],
    statement:
      "dims describes a chain of matrices. Matrix i has dims[i] rows and dims[i + 1] columns. Multiplying a p by q matrix by a q by r matrix costs p * q * r. Return the smallest cost of multiplying the whole chain. One matrix costs 0.",
    constraints: ["2 <= dims.length <= 50", "1 <= dims[i] <= 100"],
    examples: [
      { input: "dims = [40, 20, 30, 10, 30]", output: "26000" },
      { input: "dims = [10, 20, 30]", output: "6000" },
    ],
    signature: "long long matrixChain(vector<int>& dims)",
    functionName: "matrixChain",
    driver: `auto dims = in["dims"].asIntVector();\n    printJson(Json::number(sol.matrixChain(dims)));`,
    method: `long long matrixChain(vector<int>& dims) {
        int n = (int)dims.size() - 1;
        vector<vector<long long>> memo(n, vector<long long>(n, -1));
        function<long long(int, int)> cost = [&](int left, int right) -> long long {
            if (left == right) return 0;
            if (memo[left][right] != -1) return memo[left][right];
            long long best = LLONG_MAX;
            for (int mid = left; mid < right; mid++) {
                best = min(best, cost(left, mid) + cost(mid + 1, right) + 1LL * dims[left] * dims[mid + 1] * dims[right + 1]);
            }
            return memo[left][right] = best;
        };
        return cost(0, n - 1);
    }`,
    expectedTime: "O(n^3)",
    expectedSpace: "O(n^2)",
    hints: [
      "The last multiplication joins two smaller chains, and every split point is a candidate.",
      "The cost of a split is the two smaller costs plus the product of the outer dimensions and the split dimension.",
      "Memoize the span from matrix left through matrix right so each span is solved once.",
      "A span of one matrix costs 0. Try every place the final join can happen and keep the minimum.",
    ],
    tests: [
      { input: { dims: [40, 20, 30, 10, 30] }, expectedOutput: 26000, visibility: "SAMPLE" },
      { input: { dims: [10, 20, 30] }, expectedOutput: 6000, visibility: "SAMPLE" },
      { input: { dims: [10, 20] }, expectedOutput: 0, visibility: "HIDDEN" },
      { input: { dims: [10, 20, 30, 40] }, expectedOutput: 18000, visibility: "HIDDEN" },
    ],
  }),
  problem({
    slug: "matrix-chain-bottom",
    title: "Matrix Chain Multiplication Bottom-Up",
    difficulty: "HARD",
    topics: ["dynamic-programming"],
    tags: ["dp"],
    statement:
      "dims describes a chain of matrices. Matrix i has dims[i] rows and dims[i + 1] columns. Multiplying a p by q matrix by a q by r matrix costs p * q * r. Return the smallest cost of multiplying the whole chain. One matrix costs 0.",
    constraints: ["2 <= dims.length <= 50", "1 <= dims[i] <= 100"],
    examples: [
      { input: "dims = [40, 20, 30, 10, 30]", output: "26000" },
      { input: "dims = [10, 20, 30]", output: "6000" },
    ],
    signature: "long long matrixChainBottom(vector<int>& dims)",
    functionName: "matrixChainBottom",
    driver: `auto dims = in["dims"].asIntVector();\n    printJson(Json::number(sol.matrixChainBottom(dims)));`,
    method: `long long matrixChainBottom(vector<int>& dims) {
        int n = (int)dims.size() - 1;
        vector<vector<long long>> cost(n, vector<long long>(n));
        for (int length = 2; length <= n; length++) for (int left = 0; left + length - 1 < n; left++) {
            int right = left + length - 1;
            cost[left][right] = LLONG_MAX;
            for (int mid = left; mid < right; mid++) {
                cost[left][right] = min(cost[left][right], cost[left][mid] + cost[mid + 1][right] + 1LL * dims[left] * dims[mid + 1] * dims[right + 1]);
            }
        }
        return cost[0][n - 1];
    }`,
    expectedTime: "O(n^3)",
    expectedSpace: "O(n^2)",
    hints: [
      "Solve short chains before the longer chains that contain them.",
      "A table cell is the best cost of matrices left through right.",
      "Grow the chain length from 2 upward. For each span, try every split and store the minimum.",
      "Length 1 stays 0 because those cells are never multiplied. The full chain is the cell from the first matrix to the last.",
    ],
    tests: [
      { input: { dims: [40, 20, 30, 10, 30] }, expectedOutput: 26000, visibility: "SAMPLE" },
      { input: { dims: [10, 20, 30] }, expectedOutput: 6000, visibility: "SAMPLE" },
      { input: { dims: [10, 20] }, expectedOutput: 0, visibility: "HIDDEN" },
      { input: { dims: [10, 20, 30, 40] }, expectedOutput: 18000, visibility: "HIDDEN" },
    ],
  }),
  problem({
    slug: "stick-cuts",
    title: "Minimum Cost to Cut a Stick",
    difficulty: "HARD",
    topics: ["dynamic-programming"],
    tags: ["dp"],
    statement:
      "A stick has length n. cuts lists the distinct positions where it must be cut. The cost of a cut is the length of the piece you cut. After a cut, the two pieces are separate and later cuts pay the length of the piece they divide. Return the smallest total cost. No cuts costs 0.",
    constraints: ["1 <= n <= 1000", "0 <= cuts.length <= 100", "Cuts are distinct and lie strictly between the ends."],
    examples: [
      { input: "n = 7, cuts = [1, 3, 4, 5]", output: "16" },
      { input: "n = 9, cuts = [5, 6, 4, 2]", output: "20" },
    ],
    signature: "int stickCuts(int n, vector<int>& cuts)",
    functionName: "stickCuts",
    driver: `auto cuts = in["cuts"].asIntVector();\n    printJson(Json::number(sol.stickCuts((int)in["n"].asInt(), cuts)));`,
    method: `int stickCuts(int n, vector<int>& cuts) {
        cuts.push_back(0); cuts.push_back(n);
        sort(cuts.begin(), cuts.end());
        int m = (int)cuts.size();
        vector<vector<int>> cost(m, vector<int>(m));
        for (int length = 2; length < m; length++) for (int left = 0; left + length < m; left++) {
            int right = left + length;
            cost[left][right] = 1000000000;
            for (int mid = left + 1; mid < right; mid++) cost[left][right] = min(cost[left][right], cost[left][mid] + cost[mid][right] + cuts[right] - cuts[left]);
        }
        return cost[0][m - 1];
    }`,
    expectedTime: "O(cuts^3)",
    expectedSpace: "O(cuts^2)",
    hints: [
      "Add the two ends, 0 and n, and sort every cut position. A piece is then a span between two of those positions.",
      "The first cut inside a span costs the span length, and the two sides become independent.",
      "Try every cut that can be first inside the span, then add the already solved sides.",
      "Solve shorter spans first. A span with no interior cut costs 0.",
    ],
    tests: [
      { input: { n: 7, cuts: [1, 3, 4, 5] }, expectedOutput: 16, visibility: "SAMPLE" },
      { input: { n: 9, cuts: [5, 6, 4, 2] }, expectedOutput: 20, visibility: "SAMPLE" },
      { input: { n: 4, cuts: [] }, expectedOutput: 0, visibility: "HIDDEN" },
      { input: { n: 5, cuts: [1, 3] }, expectedOutput: 8, visibility: "HIDDEN" },
    ],
  }),
  problem({
    slug: "burst-balloons",
    title: "Burst Balloons",
    difficulty: "HARD",
    topics: ["dynamic-programming"],
    tags: ["dp"],
    statement:
      "nums are balloon values in a row. Bursting a balloon scores the product of its neighbors' values; balloons already burst are gone. Add a balloon of value 1 at each end, and those ends cannot be burst. Return the largest score.",
    constraints: ["1 <= nums.length <= 100", "0 <= nums[i] <= 100"],
    examples: [
      { input: "nums = [3, 1, 5, 8]", output: "167" },
      { input: "nums = [1, 5]", output: "10" },
    ],
    signature: "int burstBalloons(vector<int>& nums)",
    functionName: "burstBalloons",
    driver: `auto nums = in["nums"].asIntVector();\n    printJson(Json::number(sol.burstBalloons(nums)));`,
    method: `int burstBalloons(vector<int>& nums) {
        nums.insert(nums.begin(), 1);
        nums.push_back(1);
        int m = (int)nums.size();
        vector<vector<int>> best(m, vector<int>(m));
        for (int length = 2; length < m; length++) for (int left = 0; left + length < m; left++) {
            int right = left + length;
            for (int mid = left + 1; mid < right; mid++) {
                best[left][right] = max(best[left][right], best[left][mid] + best[mid][right] + nums[left] * nums[mid] * nums[right]);
            }
        }
        return best[0][m - 1];
    }`,
    expectedTime: "O(n^3)",
    expectedSpace: "O(n^2)",
    hints: [
      "Choosing the last balloon to burst inside an open span makes the score easy: its neighbors are the ends of the span.",
      "The balloons on either side of that last one are independent smaller spans.",
      "Add the score of those spans to the product of the last balloon and the two ends.",
      "Fill spans from short to long. One balloon between the imaginary ends scores that balloon, because both ends are 1.",
    ],
    tests: [
      { input: { nums: [3, 1, 5, 8] }, expectedOutput: 167, visibility: "SAMPLE" },
      { input: { nums: [1, 5] }, expectedOutput: 10, visibility: "SAMPLE" },
      { input: { nums: [1] }, expectedOutput: 1, visibility: "HIDDEN" },
      { input: { nums: [0, 0] }, expectedOutput: 0, visibility: "HIDDEN" },
    ],
  }),
  problem({
    slug: "boolean-ways",
    title: "Different Ways to Evaluate a Boolean Expression",
    difficulty: "MEDIUM",
    topics: ["dynamic-programming"],
    tags: ["dp"],
    statement:
      "expression alternates operands T or F with operators &, |, and ^. Count the ways to parenthesize it so the result is true, modulo 1000000007. A single operand has one way when it is T and zero ways when it is F.",
    constraints: ["1 <= expression.length <= 100", "The length is odd.", "Operands are T or F.", "Operators are &, |, or ^."],
    examples: [
      { input: 'expression = "T|T&F^T"', output: "4" },
      { input: 'expression = "T|F"', output: "1" },
    ],
    signature: "int booleanWays(string expression)",
    functionName: "booleanWays",
    driver: `printJson(Json::number(sol.booleanWays(in["expression"].asString())));`,
    method: `int booleanWays(string expression) {
        vector<char> symbol;
        vector<char> op;
        for (int i = 0; i < (int)expression.size(); i++) (i % 2 == 0 ? symbol : op).push_back(expression[i]);
        int n = (int)symbol.size();
        const int MOD = 1000000007;
        vector<vector<long long>> truth(n, vector<long long>(n)), falsehood(n, vector<long long>(n));
        for (int i = 0; i < n; i++) {
            truth[i][i] = symbol[i] == 'T';
            falsehood[i][i] = symbol[i] == 'F';
        }
        for (int length = 2; length <= n; length++) for (int left = 0; left + length - 1 < n; left++) {
            int right = left + length - 1;
            for (int mid = left; mid < right; mid++) {
                long long lt = truth[left][mid], lf = falsehood[left][mid], rt = truth[mid + 1][right], rf = falsehood[mid + 1][right];
                if (op[mid] == '&') {
                    truth[left][right] = (truth[left][right] + lt * rt) % MOD;
                    falsehood[left][right] = (falsehood[left][right] + lt * rf + lf * rt + lf * rf) % MOD;
                } else if (op[mid] == '|') {
                    truth[left][right] = (truth[left][right] + lt * rt + lt * rf + lf * rt) % MOD;
                    falsehood[left][right] = (falsehood[left][right] + lf * rf) % MOD;
                } else {
                    truth[left][right] = (truth[left][right] + lt * rf + lf * rt) % MOD;
                    falsehood[left][right] = (falsehood[left][right] + lt * rt + lf * rf) % MOD;
                }
            }
        }
        return (int)truth[0][n - 1];
    }`,
    expectedTime: "O(n^3)",
    expectedSpace: "O(n^2)",
    hints: [
      "The last operator to be evaluated splits the expression into two smaller expressions.",
      "Count the ways each side can be true and the ways it can be false.",
      "AND is true only when both sides are true. OR is true unless both are false. XOR is true when the sides differ.",
      "Combine those cases for every split and every operator, and take the counts modulo 1000000007. A lone F has no true evaluation.",
    ],
    tests: [
      { input: { expression: "T|T&F^T" }, expectedOutput: 4, visibility: "SAMPLE" },
      { input: { expression: "T|F" }, expectedOutput: 1, visibility: "SAMPLE" },
      { input: { expression: "F" }, expectedOutput: 0, visibility: "HIDDEN" },
      { input: { expression: "T^F|F" }, expectedOutput: 2, visibility: "HIDDEN" },
    ],
  }),
  problem({
    slug: "max-sum-partition",
    title: "Partition Array for Maximum Sum",
    difficulty: "MEDIUM",
    topics: ["dynamic-programming"],
    tags: ["dp"],
    statement:
      "Split nums into contiguous groups of length at most k. A group scores its maximum value multiplied by its length. Return the largest total score.",
    constraints: ["1 <= nums.length <= 500", "1 <= k <= nums.length", "0 <= nums[i] <= 10000"],
    examples: [
      { input: "nums = [1, 15, 7, 9, 2, 5, 10], k = 3", output: "84" },
      { input: "nums = [1], k = 1", output: "1" },
    ],
    signature: "int maxSumPartition(vector<int>& nums, int k)",
    functionName: "maxSumPartition",
    driver: `auto nums = in["nums"].asIntVector();\n    printJson(Json::number(sol.maxSumPartition(nums, (int)in["k"].asInt())));`,
    method: `int maxSumPartition(vector<int>& nums, int k) {
        int n = (int)nums.size();
        vector<int> best(n + 1);
        for (int i = n - 1; i >= 0; i--) {
            int peak = 0;
            for (int j = i; j < n && j < i + k; j++) {
                peak = max(peak, nums[j]);
                best[i] = max(best[i], peak * (j - i + 1) + best[j + 1]);
            }
        }
        return best[0];
    }`,
    expectedTime: "O(n * k)",
    expectedSpace: "O(n)",
    hints: [
      "The score of a prefix depends on where its last group starts.",
      "That last group has length 1 through k, and its score is its max times its length.",
      "Add the already computed score of the suffix after the group.",
      "Fill the answers from the end of the array toward the start. A group of one value scores that value.",
    ],
    tests: [
      { input: { nums: [1, 15, 7, 9, 2, 5, 10], k: 3 }, expectedOutput: 84, visibility: "SAMPLE" },
      { input: { nums: [1], k: 1 }, expectedOutput: 1, visibility: "SAMPLE" },
      { input: { nums: [1, 4, 1, 5, 7, 3, 6, 1, 9, 9, 3], k: 4 }, expectedOutput: 83, visibility: "HIDDEN" },
      { input: { nums: [2, 2], k: 2 }, expectedOutput: 4, visibility: "HIDDEN" },
    ],
  }),
  problem({
    slug: "count-squares",
    title: "Count Square Submatrices with All Ones",
    difficulty: "EASY",
    topics: ["dynamic-programming"],
    tags: ["dp"],
    statement:
      "grid contains only 0 and 1. Return how many square submatrices are filled entirely with 1. Squares of every size count, including 1 by 1.",
    constraints: ["1 <= rows, columns <= 100", "Each cell is 0 or 1."],
    examples: [
      { input: "grid = [[0, 1, 1, 1], [1, 1, 1, 1], [0, 1, 1, 1]]", output: "15" },
      { input: "grid = [[1, 0, 1], [1, 1, 0], [1, 1, 0]]", output: "7" },
    ],
    signature: "int countSquares(vector<vector<int>>& grid)",
    functionName: "countSquares",
    driver: `auto grid = in["grid"].asIntMatrix();\n    printJson(Json::number(sol.countSquares(grid)));`,
    method: `int countSquares(vector<vector<int>>& grid) {
        int rows = (int)grid.size(), cols = (int)grid[0].size(), total = 0;
        vector<vector<int>> side(rows, vector<int>(cols));
        for (int r = 0; r < rows; r++) for (int c = 0; c < cols; c++) if (grid[r][c] == 1) {
            side[r][c] = r == 0 || c == 0 ? 1 : min(side[r - 1][c], min(side[r][c - 1], side[r - 1][c - 1])) + 1;
            total += side[r][c];
        }
        return total;
    }`,
    expectedTime: "O(rows * cols)",
    expectedSpace: "O(rows * cols)",
    hints: [
      "A square of ones ending at a cell is limited by the squares ending just above, just left, and diagonally above-left.",
      "If the cell is 0, no square ends there.",
      "If it is 1, the largest side is one more than the smallest of those three neighbors.",
      "That side length is also the number of squares that end at the cell: one for each size from 1 through the side. Add those counts. A first row or column can only start squares of side 1.",
    ],
    tests: [
      { input: { grid: [[0, 1, 1, 1], [1, 1, 1, 1], [0, 1, 1, 1]] }, expectedOutput: 15, visibility: "SAMPLE" },
      { input: { grid: [[1, 0, 1], [1, 1, 0], [1, 1, 0]] }, expectedOutput: 7, visibility: "SAMPLE" },
      { input: { grid: [[0]] }, expectedOutput: 0, visibility: "HIDDEN" },
      { input: { grid: [[1, 1], [1, 1]] }, expectedOutput: 5, visibility: "HIDDEN" },
    ],
  }),
];
