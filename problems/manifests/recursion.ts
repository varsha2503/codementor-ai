import { problem } from "./helpers.js";

const intsOut = (call: string) =>
  `auto rows = ${call};\n    Json out;\n    out.type = Json::ARR;\n    for (const auto& row : rows) out.a.push_back(Json::ints(row));\n    printJson(out);`;

const textsOut = (call: string) =>
  `auto rows = ${call};\n    Json out;\n    out.type = Json::ARR;\n    for (const auto& row : rows) out.a.push_back(Json::text(row));\n    printJson(out);`;

const textGridOut = (call: string) =>
  `auto groups = ${call};\n    Json out;\n    out.type = Json::ARR;\n    for (const auto& group : groups) {\n        Json row;\n        row.type = Json::ARR;\n        for (const auto& part : group) row.a.push_back(Json::text(part));\n        out.a.push_back(row);\n    }\n    printJson(out);`;

export const recursionProblems = [
  problem({
    slug: "recursive-atoi",
    title: "String to Integer (atoi)",
    difficulty: "MEDIUM",
    topics: ["recursion", "strings"],
    tags: ["recursion"],
    statement:
      "Read a 32-bit integer from a string. Skip leading spaces. An optional + or - may follow, then digits. Stop at the first character that is not a digit. If no digits appear, return 0. If the value is below -2147483648, return -2147483648. If it is above 2147483647, return 2147483647.",
    constraints: ["0 <= text length <= 200", "characters are spaces, letters, digits, + or -"],
    examples: [
      { input: 'text = "   -13"', output: "-13" },
      { input: 'text = "713abc"', output: "713" },
    ],
    signature: "int myAtoi(string text)",
    functionName: "myAtoi",
    driver: `printJson(Json::number(sol.myAtoi(in["text"].asString())));`,
    method: `int myAtoi(string text) {
        int index = 0;
        while (index < (int)text.size() && text[index] == ' ') index++;
        int sign = 1;
        if (index < (int)text.size() && (text[index] == '+' || text[index] == '-')) {
            if (text[index] == '-') sign = -1;
            index++;
        }
        std::function<int(int, long long)> read = [&](int i, long long acc) -> int {
            if (i >= (int)text.size() || text[i] < '0' || text[i] > '9') return (int)(sign * acc);
            int digit = text[i] - '0';
            if (acc > 214748364LL || (acc == 214748364LL && digit > (sign == 1 ? 7 : 8))) {
                return sign == 1 ? 2147483647 : -2147483648;
            }
            return read(i + 1, acc * 10 + digit);
        };
        return read(index, 0);
    }`,
    expectedTime: "O(n)",
    expectedSpace: "O(n)",
    hints: [
      "The string is a small state machine: spaces, then a sign, then digits. Recursion fits the digit walk, where each call consumes one character.",
      "After the sign is known, pass the index and the value built so far into a recursive reader.",
      "A non-digit, or the end of the string, returns the signed value. Before multiplying by 10, check whether another digit would leave the 32-bit range.",
      "Clamp as soon as the next digit would overflow, instead of building a huge temporary number. A sign with no digits, or letters before any digit, is 0.",
    ],
    tests: [
      { input: { text: "   -13" }, expectedOutput: -13, visibility: "SAMPLE" },
      { input: { text: "713abc" }, expectedOutput: 713, visibility: "SAMPLE" },
      { input: { text: "" }, expectedOutput: 0, visibility: "HIDDEN" },
      { input: { text: "words" }, expectedOutput: 0, visibility: "HIDDEN" },
      { input: { text: "+8" }, expectedOutput: 8, visibility: "HIDDEN" },
      { input: { text: "-999999999999" }, expectedOutput: -2147483648, visibility: "HIDDEN" },
      { input: { text: "999999999999" }, expectedOutput: 2147483647, visibility: "HIDDEN" },
    ],
  }),
  problem({
    slug: "integer-power",
    title: "Pow(x, n)",
    difficulty: "EASY",
    topics: ["recursion"],
    tags: ["recursion"],
    statement:
      "Compute x raised to the integer power n. n may be negative, in which case the result is the reciprocal. x is a non-zero integer when n is negative. The judge prints the result to five digits after the decimal point.",
    constraints: ["-100 <= x <= 100", "-1000000000 <= n <= 1000000000", "x is not 0 when n is negative"],
    examples: [
      { input: "x = 2, n = 10", output: '"1024.00000"' },
      { input: "x = 2, n = -3", output: '"0.12500"' },
    ],
    signature: "double myPow(double x, int n)",
    functionName: "myPow",
    driver: `std::ostringstream os;\n    os << std::fixed << std::setprecision(5) << sol.myPow((double)in["x"].asInt(), (int)in["n"].asInt());\n    printJson(Json::text(os.str()));`,
    method: `double myPow(double x, int n) {
        std::function<double(long long)> pow = [&](long long exp) -> double {
            if (exp == 0) return 1;
            double half = pow(exp / 2);
            double squared = half * half;
            return exp % 2 ? squared * x : squared;
        };
        long long exp = n;
        if (exp < 0) {
            x = 1.0 / x;
            exp = -exp;
        }
        return pow(exp);
    }`,
    expectedTime: "O(log n)",
    expectedSpace: "O(log n)",
    hints: [
      "Multiplying x by itself n times is too slow for a huge exponent. Squaring halves the exponent.",
      "x^n is (x^(n/2))^2, and one extra multiplication by x when n is odd.",
      "Handle a negative exponent by taking the reciprocal of x and making the exponent positive. Store the exponent in a 64-bit integer before negating it.",
      "The base case is exponent 0, which is 1, including 0^0 in this problem only when the exponent is 0. Each call cuts the exponent in half, so the depth is logarithmic.",
    ],
    tests: [
      { input: { x: 2, n: 10 }, expectedOutput: "1024.00000", visibility: "SAMPLE" },
      { input: { x: 2, n: -3 }, expectedOutput: "0.12500", visibility: "SAMPLE" },
      { input: { x: 5, n: 0 }, expectedOutput: "1.00000", visibility: "HIDDEN" },
      { input: { x: -2, n: 3 }, expectedOutput: "-8.00000", visibility: "HIDDEN" },
      { input: { x: -2, n: -2 }, expectedOutput: "0.25000", visibility: "HIDDEN" },
      { input: { x: 2, n: -1 }, expectedOutput: "0.50000", visibility: "HIDDEN" },
    ],
  }),
  problem({
    slug: "good-digits",
    title: "Count Good Numbers",
    difficulty: "MEDIUM",
    topics: ["recursion"],
    tags: ["modular-exponentiation"],
    statement:
      "A digit string of length n is good when every even index holds an even digit (0, 2, 4, 6, or 8) and every odd index holds a prime digit (2, 3, 5, or 7). Indexes start at 0. Return how many good strings of length n exist, modulo 1000000007.",
    constraints: ["1 <= n <= 1000000000000000"],
    examples: [
      { input: "n = 1", output: "5" },
      { input: "n = 4", output: "400" },
    ],
    signature: "long long countGood(long long n)",
    functionName: "countGood",
    driver: `printJson(Json::number(sol.countGood(in["n"].asInt())));`,
    method: `long long countGood(long long n) {
        const long long MOD = 1000000007LL;
        std::function<long long(long long, long long)> pow = [&](long long base, long long exp) -> long long {
            if (exp == 0) return 1;
            long long half = pow(base, exp / 2);
            long long squared = half * half % MOD;
            if (exp % 2) squared = squared * base % MOD;
            return squared;
        };
        return pow(5, (n + 1) / 2) * pow(4, n / 2) % MOD;
    }`,
    expectedTime: "O(log n)",
    expectedSpace: "O(log n)",
    hints: [
      "Even positions have 5 choices and odd positions have 4. The count is 5 to the power of the even slots times 4 to the power of the odd slots.",
      "n can be enormous, so multiply the powers under the modulus with exponentiation by squaring.",
      "There are (n + 1) / 2 even indexes and n / 2 odd indexes. Compute both modular powers, then multiply them modulo 1000000007.",
      "A loop that builds the string one digit at a time cannot finish for the upper bound. The recursive square reduces the exponent by half each call.",
    ],
    tests: [
      { input: { n: 1 }, expectedOutput: 5, visibility: "SAMPLE" },
      { input: { n: 4 }, expectedOutput: 400, visibility: "SAMPLE" },
      { input: { n: 2 }, expectedOutput: 20, visibility: "HIDDEN" },
      { input: { n: 50 }, expectedOutput: 564908303, visibility: "HIDDEN" },
      { input: { n: 1000000000000000 }, expectedOutput: 711414395, visibility: "HIDDEN" },
    ],
  }),
  problem({
    slug: "sort-stack",
    title: "Sort a Stack",
    difficulty: "MEDIUM",
    topics: ["recursion"],
    tags: ["stack"],
    statement:
      "Sort a stack using recursion. The array's last element is the top. Return the stack from bottom to top, with the smallest value at the bottom and the largest at the top. Do not use another array as a second stack; the call stack is the extra memory.",
    constraints: ["0 <= stack size <= 200", "-1000 <= value <= 1000"],
    examples: [
      { input: "stack = [3, 1, 2]", output: "[1, 2, 3]" },
      { input: "stack = [2, 1]", output: "[1, 2]" },
    ],
    signature: "vector<int> sortStack(vector<int> stack)",
    functionName: "sortStack",
    driver: `auto stack = in["stack"].asIntVector();\n    printJson(Json::ints(sol.sortStack(stack)));`,
    method: `vector<int> sortStack(vector<int> stack) {
        std::function<void(int)> insert = [&](int value) {
            if (stack.empty() || stack.back() <= value) {
                stack.push_back(value);
                return;
            }
            int top = stack.back();
            stack.pop_back();
            insert(value);
            stack.push_back(top);
        };
        std::function<void()> sort = [&]() {
            if (stack.size() <= 1) return;
            int top = stack.back();
            stack.pop_back();
            sort();
            insert(top);
        };
        sort();
        return stack;
    }`,
    expectedTime: "O(n^2)",
    expectedSpace: "O(n)",
    hints: [
      "If the stack below the top is already sorted, the top value has to sink until it sits above a smaller or equal value.",
      "Pop the top, sort the rest recursively, then insert the saved value back into its sorted place.",
      "Insertion pops values that are larger than the new one, inserts, then pushes those values back. The base case is an empty stack or a top that is already large enough.",
      "Equal values can stay in their existing order by inserting when the current top is less than or equal to the new value. The quadratic cost comes from inserting each of the n values into a stack of growing size.",
    ],
    tests: [
      { input: { stack: [3, 1, 2] }, expectedOutput: [1, 2, 3], visibility: "SAMPLE" },
      { input: { stack: [2, 1] }, expectedOutput: [1, 2], visibility: "SAMPLE" },
      { input: { stack: [] }, expectedOutput: [], visibility: "HIDDEN" },
      { input: { stack: [5] }, expectedOutput: [5], visibility: "HIDDEN" },
      { input: { stack: [2, 2, 1] }, expectedOutput: [1, 2, 2], visibility: "HIDDEN" },
    ],
  }),
  problem({
    slug: "reverse-stack",
    title: "Reverse a Stack",
    difficulty: "MEDIUM",
    topics: ["recursion"],
    tags: ["stack"],
    statement:
      "Reverse a stack using recursion. The array's last element is the top. Return the reversed stack from bottom to top. Do not use another array as a second stack.",
    constraints: ["0 <= stack size <= 200", "-1000 <= value <= 1000"],
    examples: [
      { input: "stack = [1, 2, 3]", output: "[3, 2, 1]" },
      { input: "stack = [4]", output: "[4]" },
    ],
    signature: "vector<int> reverseStack(vector<int> stack)",
    functionName: "reverseStack",
    driver: `auto stack = in["stack"].asIntVector();\n    printJson(Json::ints(sol.reverseStack(stack)));`,
    method: `vector<int> reverseStack(vector<int> stack) {
        std::function<void(int)> insertBottom = [&](int value) {
            if (stack.empty()) {
                stack.push_back(value);
                return;
            }
            int top = stack.back();
            stack.pop_back();
            insertBottom(value);
            stack.push_back(top);
        };
        std::function<void()> reverse = [&]() {
            if (stack.size() <= 1) return;
            int top = stack.back();
            stack.pop_back();
            reverse();
            insertBottom(top);
        };
        reverse();
        return stack;
    }`,
    expectedTime: "O(n^2)",
    expectedSpace: "O(n)",
    hints: [
      "Reversing the stack below the top leaves the old top as the new bottom. The missing step is putting that saved value underneath the reversed remainder.",
      "Pop the top, reverse the rest, then insert the saved value at the bottom.",
      "To insert at the bottom, pop down to an empty stack, push the new value, and push the saved values back on the way out.",
      "A single pop-and-push pass only swaps with a second container. Here every element is sent to the bottom once, which is why the time is quadratic and the extra memory is the call stack.",
    ],
    tests: [
      { input: { stack: [1, 2, 3] }, expectedOutput: [3, 2, 1], visibility: "SAMPLE" },
      { input: { stack: [4] }, expectedOutput: [4], visibility: "SAMPLE" },
      { input: { stack: [] }, expectedOutput: [], visibility: "HIDDEN" },
      { input: { stack: [1, 1] }, expectedOutput: [1, 1], visibility: "HIDDEN" },
      { input: { stack: [8, 0, -1] }, expectedOutput: [-1, 0, 8], visibility: "HIDDEN" },
    ],
  }),
  problem({
    slug: "binary-strings",
    title: "Generate Binary Strings Without Consecutive 1s",
    difficulty: "MEDIUM",
    topics: ["recursion"],
    tags: ["backtracking"],
    statement:
      "Generate every binary string of length n that does not contain two 1s in a row. Leading zeros count, because the length is fixed. The order of the strings does not matter.",
    constraints: ["1 <= n <= 12"],
    examples: [
      { input: "n = 2", output: '["00", "01", "10"]' },
      { input: "n = 1", output: '["0", "1"]' },
    ],
    signature: "vector<string> binaryStrings(int n)",
    functionName: "binaryStrings",
    note: "",
    driver: textsOut("sol.binaryStrings((int)in[\"n\"].asInt())"),
    method: `vector<string> binaryStrings(int n) {
        vector<string> answers;
        string current;
        std::function<void(char)> place = [&](char previous) {
            if ((int)current.size() == n) {
                answers.push_back(current);
                return;
            }
            current.push_back('0');
            place('0');
            current.pop_back();
            if (previous != '1') {
                current.push_back('1');
                place('1');
                current.pop_back();
            }
        };
        place('0');
        return answers;
    }`,
    compareMode: "UNORDERED",
    expectedTime: "O(n * F)",
    expectedSpace: "O(n)",
    hints: [
      "Each position is 0 or 1, except a 1 is illegal immediately after another 1. Build the string one character at a time and undo the choice.",
      "Pass the previous character into the recursive call. Always try 0. Try 1 only when the previous character was not 1.",
      "When the string reaches length n, store a copy. Pop the character before trying the other branch.",
      "The first character has no real predecessor, so treat the start as if the previous bit were 0. The number of strings is a Fibonacci count, and each string costs linear time to copy.",
    ],
    tests: [
      { input: { n: 2 }, expectedOutput: ["00", "01", "10"], visibility: "SAMPLE" },
      { input: { n: 1 }, expectedOutput: ["0", "1"], visibility: "SAMPLE" },
      { input: { n: 3 }, expectedOutput: ["000", "001", "010", "100", "101"], visibility: "HIDDEN" },
    ],
  }),
  problem({
    slug: "pair-parens",
    title: "Generate Parentheses",
    difficulty: "MEDIUM",
    topics: ["recursion", "strings"],
    tags: ["backtracking"],
    statement:
      "Generate every string of n pairs of parentheses that is correctly matched. The order of the strings does not matter.",
    constraints: ["1 <= n <= 8"],
    examples: [
      { input: "n = 1", output: '["()"]' },
      { input: "n = 2", output: '["(())", "()()"]' },
    ],
    signature: "vector<string> generateParenthesis(int n)",
    functionName: "generateParenthesis",
    driver: textsOut("sol.generateParenthesis((int)in[\"n\"].asInt())"),
    method: `vector<string> generateParenthesis(int n) {
        vector<string> answers;
        string current;
        std::function<void(int, int)> place = [&](int open, int close) {
            if ((int)current.size() == 2 * n) {
                answers.push_back(current);
                return;
            }
            if (open < n) {
                current.push_back('(');
                place(open + 1, close);
                current.pop_back();
            }
            if (close < open) {
                current.push_back(')');
                place(open, close + 1);
                current.pop_back();
            }
        };
        place(0, 0);
        return answers;
    }`,
    compareMode: "UNORDERED",
    expectedTime: "O(4^n / sqrt(n))",
    expectedSpace: "O(n)",
    hints: [
      "A prefix is valid while it never has more closing parentheses than opening ones, and it never uses more than n opening parentheses.",
      "Track how many opening and closing parentheses you have placed.",
      "Add '(' when openings are still available. Add ')' only when closings so far are fewer than openings. Store the string when its length is 2n.",
      "Undo each character after the recursive call. The count of answers is the Catalan number, so n stays small.",
    ],
    tests: [
      { input: { n: 1 }, expectedOutput: ["()"], visibility: "SAMPLE" },
      { input: { n: 2 }, expectedOutput: ["(())", "()()"], visibility: "SAMPLE" },
      { input: { n: 3 }, expectedOutput: ["((()))", "(()())", "(())()", "()(())", "()()()"], visibility: "HIDDEN" },
    ],
  }),
  problem({
    slug: "power-set",
    title: "Power Set",
    difficulty: "MEDIUM",
    topics: ["recursion"],
    tags: ["recursion"],
    statement:
      "Return every subset of a list of distinct integers, including the empty subset. Inside each subset, keep the values in the order they appear in the input. The order of the subsets themselves does not matter.",
    constraints: ["0 <= list length <= 10", "-1000 <= value <= 1000", "values are distinct"],
    examples: [
      { input: "nums = [4, 5]", output: "[[], [4], [5], [4, 5]]" },
      { input: "nums = []", output: "[[]]" },
    ],
    signature: "vector<vector<int>> powerSet(vector<int>& nums)",
    functionName: "powerSet",
    driver: `auto nums = in["nums"].asIntVector();\n    ${intsOut("sol.powerSet(nums)")}`,
    method: `vector<vector<int>> powerSet(vector<int>& nums) {
        auto values = nums;
        vector<vector<int>> answers;
        vector<int> current;
        std::function<void(int)> choose = [&](int index) {
            if (index == (int)values.size()) {
                answers.push_back(current);
                return;
            }
            choose(index + 1);
            current.push_back(values[index]);
            choose(index + 1);
            current.pop_back();
        };
        choose(0);
        return answers;
    }`,
    compareMode: "UNORDERED",
    expectedTime: "O(n * 2^n)",
    expectedSpace: "O(n)",
    hints: [
      "Every element is either left out or taken. That choice tree has one leaf per subset.",
      "Recurse on the next index twice: once without the current value, and once after appending it.",
      "When the index reaches the end, store a copy of the current subset, then undo the append before the next branch.",
      "Decide for the elements from left to right so each subset keeps input order. There are 2^n subsets, and copying one takes linear time.",
    ],
    tests: [
      { input: { nums: [4, 5] }, expectedOutput: [[], [4], [5], [4, 5]], visibility: "SAMPLE" },
      { input: { nums: [] }, expectedOutput: [[]], visibility: "SAMPLE" },
      { input: { nums: [1] }, expectedOutput: [[], [1]], visibility: "HIDDEN" },
      { input: { nums: [1, 2, 3] }, expectedOutput: [[], [1], [2], [3], [1, 2], [1, 3], [2, 3], [1, 2, 3]], visibility: "HIDDEN" },
    ],
  }),
  problem({
    slug: "subset-check",
    title: "Check if There Exists a Subsequence with Sum K",
    difficulty: "EASY",
    topics: ["recursion"],
    tags: ["recursion"],
    statement:
      "Return true when some subsequence of nums adds up to target. The empty subsequence is allowed and its sum is 0. Values are positive, so order does not change the sum.",
    constraints: ["0 <= nums length <= 16", "1 <= nums[i] <= 100", "0 <= target <= 500"],
    examples: [
      { input: "nums = [1, 2, 3], target = 5", output: "true" },
      { input: "nums = [1, 2, 3], target = 7", output: "false" },
    ],
    signature: "bool hasSum(vector<int>& nums, int target)",
    functionName: "hasSum",
    driver: `auto nums = in["nums"].asIntVector();\n    printJson(Json::boolean(sol.hasSum(nums, (int)in["target"].asInt())));`,
    method: `bool hasSum(vector<int>& nums, int target) {
        std::function<bool(int, int)> search = [&](int index, int remain) -> bool {
            if (remain == 0) return true;
            if (index == (int)nums.size() || remain < 0) return false;
            return search(index + 1, remain) || search(index + 1, remain - nums[index]);
        };
        return search(0, target);
    }`,
    expectedTime: "O(2^n)",
    expectedSpace: "O(n)",
    hints: [
      "A subsequence either uses the current value or skips it. The target that remains is the only extra state you need.",
      "Recurse with the same remainder, and recurse again after subtracting the current value.",
      "Return true as soon as the remainder is 0. Return false when the remainder goes negative or the list ends first.",
      "Target 0 is true before any element is chosen, because the empty subsequence sums to 0. Positive values let you stop a branch that has already overshot.",
    ],
    tests: [
      { input: { nums: [1, 2, 3], target: 5 }, expectedOutput: true, visibility: "SAMPLE" },
      { input: { nums: [1, 2, 3], target: 7 }, expectedOutput: false, visibility: "SAMPLE" },
      { input: { nums: [], target: 0 }, expectedOutput: true, visibility: "HIDDEN" },
      { input: { nums: [], target: 1 }, expectedOutput: false, visibility: "HIDDEN" },
      { input: { nums: [4, 1, 4], target: 0 }, expectedOutput: true, visibility: "HIDDEN" },
      { input: { nums: [4, 1, 4], target: 8 }, expectedOutput: true, visibility: "HIDDEN" },
    ],
  }),
  problem({
    slug: "combo-sum",
    title: "Combination Sum",
    difficulty: "MEDIUM",
    topics: ["recursion"],
    tags: ["backtracking"],
    statement:
      "Given distinct positive candidates, find every combination that adds up to target. The same candidate may be used more than once. Write each combination in non-decreasing order. The order of the combinations does not matter.",
    constraints: ["1 <= candidates length <= 10", "1 <= candidates[i] <= 30", "candidates are distinct", "1 <= target <= 30"],
    examples: [
      { input: "candidates = [2, 4, 6], target = 6", output: "[[2, 2, 2], [2, 4], [6]]" },
      { input: "candidates = [3, 5], target = 4", output: "[]" },
    ],
    signature: "vector<vector<int>> combinationSum(vector<int>& candidates, int target)",
    functionName: "combinationSum",
    driver: `auto candidates = in["candidates"].asIntVector();\n    ${intsOut('sol.combinationSum(candidates, (int)in["target"].asInt())')}`,
    method: `vector<vector<int>> combinationSum(vector<int>& candidates, int target) {
        auto values = candidates;
        sort(values.begin(), values.end());
        vector<vector<int>> answers;
        vector<int> current;
        std::function<void(int, int)> choose = [&](int start, int remain) {
            if (remain == 0) {
                answers.push_back(current);
                return;
            }
            for (int i = start; i < (int)values.size(); i++) {
                if (values[i] > remain) break;
                current.push_back(values[i]);
                choose(i, remain - values[i]);
                current.pop_back();
            }
        };
        choose(0, target);
        return answers;
    }`,
    compareMode: "UNORDERED",
    expectedTime: "O(k * n^(target / min))",
    expectedSpace: "O(target / min)",
    hints: [
      "Unlimited reuse is allowed, but each combination should be written in one order so [2, 4] and [4, 2] are not both stored.",
      "Sort the candidates. From a start index, try every candidate that still fits, and let the next call begin at that same index.",
      "Subtract from the remaining target. When it hits 0, store a copy. Pop the candidate before the next choice. Skip candidates larger than the remainder.",
      "Starting the next call at i, not i + 1, is what allows reuse. Starting at i + 1 would be the version where each value is used once.",
    ],
    tests: [
      { input: { candidates: [2, 4, 6], target: 6 }, expectedOutput: [[2, 2, 2], [2, 4], [6]], visibility: "SAMPLE" },
      { input: { candidates: [3, 5], target: 4 }, expectedOutput: [], visibility: "SAMPLE" },
      { input: { candidates: [2], target: 4 }, expectedOutput: [[2, 2]], visibility: "HIDDEN" },
      { input: { candidates: [3, 5], target: 8 }, expectedOutput: [[3, 5]], visibility: "HIDDEN" },
    ],
  }),
  problem({
    slug: "combo-sum-unique",
    title: "Combination Sum II",
    difficulty: "MEDIUM",
    topics: ["recursion"],
    tags: ["backtracking"],
    statement:
      "Each candidate may be used once. The list may contain duplicates. Find every unique combination that adds up to target, and write each combination in non-decreasing order. The order of the combinations does not matter.",
    constraints: ["1 <= candidates length <= 12", "1 <= candidates[i] <= 30", "1 <= target <= 30"],
    examples: [
      { input: "candidates = [1, 1, 2, 4], target = 4", output: "[[1, 1, 2], [4]]" },
      { input: "candidates = [1, 2, 2, 3], target = 5", output: "[[1, 2, 2], [2, 3]]" },
    ],
    signature: "vector<vector<int>> combinationSum2(vector<int>& candidates, int target)",
    functionName: "combinationSum2",
    driver: `auto candidates = in["candidates"].asIntVector();\n    ${intsOut('sol.combinationSum2(candidates, (int)in["target"].asInt())')}`,
    method: `vector<vector<int>> combinationSum2(vector<int>& candidates, int target) {
        auto values = candidates;
        sort(values.begin(), values.end());
        vector<vector<int>> answers;
        vector<int> current;
        std::function<void(int, int)> choose = [&](int start, int remain) {
            if (remain == 0) {
                answers.push_back(current);
                return;
            }
            for (int i = start; i < (int)values.size(); i++) {
                if (i > start && values[i] == values[i - 1]) continue;
                if (values[i] > remain) break;
                current.push_back(values[i]);
                choose(i + 1, remain - values[i]);
                current.pop_back();
            }
        };
        choose(0, target);
        return answers;
    }`,
    compareMode: "UNORDERED",
    expectedTime: "O(2^n)",
    expectedSpace: "O(n)",
    hints: [
      "Each index can be used once. Duplicate values still create duplicate combinations unless you skip a repeated choice at the same depth.",
      "Sort first. Walk from a start index, and move the next call to the following index.",
      "If the current value equals the previous one and you are still choosing among siblings, skip it. Store the combination when the remainder is 0.",
      "The skip is i > start, not i > 0. A later depth may still use the second copy of a value, which is how [1, 1, 2] survives while a second identical [1, 1, 2] does not.",
    ],
    tests: [
      { input: { candidates: [1, 1, 2, 4], target: 4 }, expectedOutput: [[1, 1, 2], [4]], visibility: "SAMPLE" },
      { input: { candidates: [1, 2, 2, 3], target: 5 }, expectedOutput: [[1, 2, 2], [2, 3]], visibility: "SAMPLE" },
      { input: { candidates: [2], target: 1 }, expectedOutput: [], visibility: "HIDDEN" },
      { input: { candidates: [2, 2], target: 2 }, expectedOutput: [[2]], visibility: "HIDDEN" },
    ],
  }),
  problem({
    slug: "all-subsets",
    title: "Subsets",
    difficulty: "MEDIUM",
    topics: ["recursion"],
    tags: ["backtracking"],
    statement:
      "Return every subset of a list of distinct integers, including the empty subset. Inside each subset, keep the values in the order they appear in the input. The order of the subsets does not matter.",
    constraints: ["0 <= nums length <= 10", "-1000 <= value <= 1000", "values are distinct"],
    examples: [
      { input: "nums = [1, 2, 3]", output: "[[], [1], [2], [3], [1, 2], [1, 3], [2, 3], [1, 2, 3]]" },
      { input: "nums = [8]", output: "[[], [8]]" },
    ],
    signature: "vector<vector<int>> subsets(vector<int>& nums)",
    functionName: "subsets",
    driver: `auto nums = in["nums"].asIntVector();\n    ${intsOut("sol.subsets(nums)")}`,
    method: `vector<vector<int>> subsets(vector<int>& nums) {
        vector<vector<int>> answers;
        vector<int> current;
        std::function<void(int)> choose = [&](int start) {
            answers.push_back(current);
            for (int i = start; i < (int)nums.size(); i++) {
                current.push_back(nums[i]);
                choose(i + 1);
                current.pop_back();
            }
        };
        choose(0);
        return answers;
    }`,
    compareMode: "UNORDERED",
    expectedTime: "O(n * 2^n)",
    expectedSpace: "O(n)",
    hints: [
      "Build subsets by deciding a start index. Everything before that index is already settled.",
      "At every call, the current list is already a subset, so store it before extending it.",
      "Append nums[i] for each i from the start index onward, recurse at i + 1, then pop.",
      "Moving the start forward prevents [1, 2] and [2, 1] from both appearing. An empty input stores one empty subset and the loop does not run.",
    ],
    tests: [
      { input: { nums: [1, 2, 3] }, expectedOutput: [[], [1], [2], [3], [1, 2], [1, 3], [2, 3], [1, 2, 3]], visibility: "SAMPLE" },
      { input: { nums: [8] }, expectedOutput: [[], [8]], visibility: "SAMPLE" },
      { input: { nums: [] }, expectedOutput: [[]], visibility: "HIDDEN" },
      { input: { nums: [3, 1] }, expectedOutput: [[], [3], [1], [3, 1]], visibility: "HIDDEN" },
    ],
  }),
  problem({
    slug: "unique-subsets",
    title: "Subsets II",
    difficulty: "MEDIUM",
    topics: ["recursion"],
    tags: ["backtracking"],
    statement:
      "Return every unique subset of a list that may contain duplicates. Write each subset in non-decreasing order. The order of the subsets does not matter.",
    constraints: ["0 <= nums length <= 10", "-1000 <= value <= 1000"],
    examples: [
      { input: "nums = [1, 2, 2]", output: "[[], [1], [2], [1, 2], [2, 2], [1, 2, 2]]" },
      { input: "nums = [2, 2]", output: "[[], [2], [2, 2]]" },
    ],
    signature: "vector<vector<int>> subsetsWithDup(vector<int>& nums)",
    functionName: "subsetsWithDup",
    driver: `auto nums = in["nums"].asIntVector();\n    ${intsOut("sol.subsetsWithDup(nums)")}`,
    method: `vector<vector<int>> subsetsWithDup(vector<int>& nums) {
        auto values = nums;
        sort(values.begin(), values.end());
        vector<vector<int>> answers;
        vector<int> current;
        std::function<void(int)> choose = [&](int start) {
            answers.push_back(current);
            for (int i = start; i < (int)values.size(); i++) {
                if (i > start && values[i] == values[i - 1]) continue;
                current.push_back(values[i]);
                choose(i + 1);
                current.pop_back();
            }
        };
        choose(0);
        return answers;
    }`,
    compareMode: "UNORDERED",
    expectedTime: "O(n * 2^n)",
    expectedSpace: "O(n)",
    hints: [
      "Sorting pulls equal values together. A subset is then built in non-decreasing order, and a repeated value is skipped when it would start the same subset twice.",
      "Store the current subset, then extend it from a start index, as in the distinct version.",
      "Skip values[i] when it equals values[i - 1] and i is greater than the start index. Recurse at i + 1.",
      "The second 2 can still appear inside a subset that already chose the first 2. The skip only blocks choosing it as an alternate sibling at the same depth.",
    ],
    tests: [
      { input: { nums: [1, 2, 2] }, expectedOutput: [[], [1], [2], [1, 2], [2, 2], [1, 2, 2]], visibility: "SAMPLE" },
      { input: { nums: [2, 2] }, expectedOutput: [[], [2], [2, 2]], visibility: "SAMPLE" },
      { input: { nums: [] }, expectedOutput: [[]], visibility: "HIDDEN" },
      { input: { nums: [3, 1, 3] }, expectedOutput: [[], [1], [3], [1, 3], [3, 3], [1, 3, 3]], visibility: "HIDDEN" },
    ],
  }),
  problem({
    slug: "combo-three",
    title: "Combination Sum III",
    difficulty: "MEDIUM",
    topics: ["recursion"],
    tags: ["backtracking"],
    statement:
      "Find every set of k distinct integers from 1 through 9 that adds up to n. Write each combination in increasing order. The order of the combinations does not matter.",
    constraints: ["1 <= k <= 9", "1 <= n <= 60"],
    examples: [
      { input: "k = 3, n = 7", output: "[[1, 2, 4]]" },
      { input: "k = 3, n = 9", output: "[[1, 2, 6], [1, 3, 5], [2, 3, 4]]" },
    ],
    signature: "vector<vector<int>> combinationSum3(int k, int n)",
    functionName: "combinationSum3",
    driver: intsOut('sol.combinationSum3((int)in["k"].asInt(), (int)in["n"].asInt())'),
    method: `vector<vector<int>> combinationSum3(int k, int n) {
        vector<vector<int>> answers;
        vector<int> current;
        std::function<void(int, int, int)> choose = [&](int start, int remain, int left) {
            if (left == 0) {
                if (remain == 0) answers.push_back(current);
                return;
            }
            for (int value = start; value <= 9; value++) {
                if (value > remain) break;
                current.push_back(value);
                choose(value + 1, remain - value, left - 1);
                current.pop_back();
            }
        };
        choose(1, n, k);
        return answers;
    }`,
    compareMode: "UNORDERED",
    expectedTime: "O(C(9, k))",
    expectedSpace: "O(k)",
    hints: [
      "The pool is only 1 through 9, each number at most once. You are choosing a combination of a fixed length.",
      "Track the next number you may use, how much sum remains, and how many numbers you still need.",
      "When no numbers remain, store the combination only if the sum is also exhausted. Otherwise try the next unused integer and move the start past it.",
      "Stop when the next integer is larger than the remaining sum. k ones that already overshoot, or a sum larger than the largest k digits, correctly produces no combinations.",
    ],
    tests: [
      { input: { k: 3, n: 7 }, expectedOutput: [[1, 2, 4]], visibility: "SAMPLE" },
      { input: { k: 3, n: 9 }, expectedOutput: [[1, 2, 6], [1, 3, 5], [2, 3, 4]], visibility: "SAMPLE" },
      { input: { k: 1, n: 5 }, expectedOutput: [[5]], visibility: "HIDDEN" },
      { input: { k: 2, n: 18 }, expectedOutput: [], visibility: "HIDDEN" },
      { input: { k: 4, n: 10 }, expectedOutput: [[1, 2, 3, 4]], visibility: "HIDDEN" },
    ],
  }),
  problem({
    slug: "digit-letters",
    title: "Letter Combinations of a Phone Number",
    difficulty: "HARD",
    topics: ["recursion", "strings"],
    tags: ["backtracking"],
    statement:
      "A digit string uses the usual phone letters: 2 abc, 3 def, 4 ghi, 5 jkl, 6 mno, 7 pqrs, 8 tuv, 9 wxyz. Return every letter string those digits can spell. An empty digit string spells nothing. The order of the answers does not matter.",
    constraints: ["0 <= digits length <= 4", "each character is a digit from 2 to 9"],
    examples: [
      { input: 'digits = "2"', output: '["a", "b", "c"]' },
      { input: 'digits = "23"', output: '["ad", "ae", "af", "bd", "be", "bf", "cd", "ce", "cf"]' },
    ],
    signature: "vector<string> letterCombinations(string digits)",
    functionName: "letterCombinations",
    driver: textsOut('sol.letterCombinations(in["digits"].asString())'),
    method: `vector<string> letterCombinations(string digits) {
        if (digits.empty()) return {};
        vector<string> pad = {"", "", "abc", "def", "ghi", "jkl", "mno", "pqrs", "tuv", "wxyz"};
        vector<string> answers;
        string current;
        std::function<void(int)> place = [&](int index) {
            if (index == (int)digits.size()) {
                answers.push_back(current);
                return;
            }
            for (char letter : pad[digits[index] - '0']) {
                current.push_back(letter);
                place(index + 1);
                current.pop_back();
            }
        };
        place(0);
        return answers;
    }`,
    compareMode: "UNORDERED",
    expectedTime: "O(4^n * n)",
    expectedSpace: "O(n)",
    hints: [
      "Each digit is a short menu of letters. The answer length equals the number of digits, and every position is independent except that you must pick one letter per digit.",
      "Map each digit to its letters. Build one string and walk the digits from left to right.",
      "For the current digit, append each of its letters, recurse to the next digit, and pop the letter.",
      "An empty digit string returns an empty list, not a list containing an empty string. Digits 7 and 9 have four letters, which is why the branching factor is up to 4.",
    ],
    tests: [
      { input: { digits: "2" }, expectedOutput: ["a", "b", "c"], visibility: "SAMPLE" },
      { input: { digits: "23" }, expectedOutput: ["ad", "ae", "af", "bd", "be", "bf", "cd", "ce", "cf"], visibility: "SAMPLE" },
      { input: { digits: "" }, expectedOutput: [], visibility: "HIDDEN" },
      { input: { digits: "9" }, expectedOutput: ["w", "x", "y", "z"], visibility: "HIDDEN" },
    ],
  }),
  problem({
    slug: "palindrome-split",
    title: "Palindrome Partitioning",
    difficulty: "HARD",
    topics: ["recursion", "strings"],
    tags: ["backtracking"],
    statement:
      "Split a lowercase string into one or more contiguous pieces so every piece is a palindrome. Return every way to do that. Each answer lists the pieces from left to right. The order of the answers does not matter.",
    constraints: ["1 <= text length <= 12", "text is lowercase letters"],
    examples: [
      { input: 'text = "aab"', output: '[["a", "a", "b"], ["aa", "b"]]' },
      { input: 'text = "a"', output: '[["a"]]' },
    ],
    signature: "vector<vector<string>> partition(string text)",
    functionName: "partition",
    driver: textGridOut('sol.partition(in["text"].asString())'),
    method: `vector<vector<string>> partition(string text) {
        vector<vector<string>> answers;
        vector<string> current;
        auto palindrome = [&](int left, int right) {
            while (left < right) {
                if (text[left++] != text[right--]) return false;
            }
            return true;
        };
        std::function<void(int)> cut = [&](int start) {
            if (start == (int)text.size()) {
                answers.push_back(current);
                return;
            }
            for (int end = start; end < (int)text.size(); end++) {
                if (!palindrome(start, end)) continue;
                current.push_back(text.substr(start, end - start + 1));
                cut(end + 1);
                current.pop_back();
            }
        };
        cut(0);
        return answers;
    }`,
    compareMode: "UNORDERED",
    expectedTime: "O(n * 2^n)",
    expectedSpace: "O(n)",
    hints: [
      "A cut is a choice of where the next palindromic piece ends. The following piece has to start immediately after it.",
      "From a start index, try every end index. Keep the slice only when it reads the same forward and backward.",
      "Append that slice, recurse from end + 1, then pop it. When the start reaches the end of the string, store the list of pieces.",
      "A single letter is always a palindrome, so a split into individual letters always exists. Check the slice with two pointers before you recurse, or you will store cuts that are not palindromes.",
    ],
    tests: [
      { input: { text: "aab" }, expectedOutput: [["a", "a", "b"], ["aa", "b"]], visibility: "SAMPLE" },
      { input: { text: "a" }, expectedOutput: [["a"]], visibility: "SAMPLE" },
      { input: { text: "aba" }, expectedOutput: [["a", "b", "a"], ["aba"]], visibility: "HIDDEN" },
      { input: { text: "ab" }, expectedOutput: [["a", "b"]], visibility: "HIDDEN" },
    ],
  }),
  problem({
    slug: "board-word",
    title: "Word Search",
    difficulty: "HARD",
    topics: ["recursion"],
    tags: ["backtracking"],
    statement:
      "A grid holds uppercase letters. Return true when the word can be traced through adjacent cells. Moves are up, down, left, and right. A cell may be used only once in the trace.",
    constraints: ["1 <= rows, columns <= 6", "1 <= word length <= 12", "board and word use uppercase letters"],
    examples: [
      { input: 'board = ["AB", "CD"], word = "ABD"', output: "true" },
      { input: 'board = ["AB", "CD"], word = "ABC"', output: "false" },
    ],
    signature: "bool exist(vector<string>& board, string word)",
    functionName: "exist",
    driver: `auto board = in["board"].asStrings();\n    printJson(Json::boolean(sol.exist(board, in["word"].asString())));`,
    method: `bool exist(vector<string>& board, string word) {
        int rows = (int)board.size();
        int cols = (int)board[0].size();
        std::function<bool(int, int, int)> search = [&](int row, int col, int index) -> bool {
            if (index == (int)word.size()) return true;
            if (row < 0 || col < 0 || row >= rows || col >= cols || board[row][col] != word[index]) return false;
            char saved = board[row][col];
            board[row][col] = '#';
            bool found = search(row + 1, col, index + 1) || search(row - 1, col, index + 1) || search(row, col + 1, index + 1) || search(row, col - 1, index + 1);
            board[row][col] = saved;
            return found;
        };
        for (int row = 0; row < rows; row++) {
            for (int col = 0; col < cols; col++) {
                if (search(row, col, 0)) return true;
            }
        }
        return false;
    }`,
    expectedTime: "O(rows * cols * 4^word)",
    expectedSpace: "O(word)",
    hints: [
      "Try every cell as the start of the word. From a matching cell, the next letter must sit in one of the four neighbors.",
      "Mark the current cell as used before exploring, and clear the mark when that call returns.",
      "The search succeeds when the index reaches the word length. It fails when the cell is off the board, already used, or holds the wrong letter.",
      "A diagonal neighbor does not count. Restoring the letter is required, because a later path may need that same cell.",
    ],
    tests: [
      { input: { board: ["AB", "CD"], word: "ABD" }, expectedOutput: true, visibility: "SAMPLE" },
      { input: { board: ["AB", "CD"], word: "ABC" }, expectedOutput: false, visibility: "SAMPLE" },
      { input: { board: ["A"], word: "A" }, expectedOutput: true, visibility: "HIDDEN" },
      { input: { board: ["AA"], word: "AAA" }, expectedOutput: false, visibility: "HIDDEN" },
      { input: { board: ["SEE", "EAT"], word: "EAT" }, expectedOutput: true, visibility: "HIDDEN" },
    ],
  }),
  problem({
    slug: "queen-grid",
    title: "N-Queens",
    difficulty: "HARD",
    topics: ["recursion"],
    tags: ["backtracking"],
    statement:
      "Place n queens on an n by n board so no two share a row, column, or diagonal. Return every solution. Each solution is n strings of length n, using Q for a queen and . for an empty square. Rows run from top to bottom. The order of the solutions does not matter.",
    constraints: ["1 <= n <= 8"],
    examples: [
      { input: "n = 1", output: '[["Q"]]' },
      { input: "n = 4", output: '[[".Q..", "...Q", "Q...", "..Q."], ["..Q.", "Q...", "...Q", ".Q.."]]' },
    ],
    signature: "vector<vector<string>> solveNQueens(int n)",
    functionName: "solveNQueens",
    driver: textGridOut("sol.solveNQueens((int)in[\"n\"].asInt())"),
    method: `vector<vector<string>> solveNQueens(int n) {
        vector<vector<string>> answers;
        vector<int> placed(n, -1);
        vector<int> column(n), diagonal(2 * n), anti(2 * n);
        std::function<void(int)> place = [&](int row) {
            if (row == n) {
                vector<string> board(n, string(n, '.'));
                for (int r = 0; r < n; r++) board[r][placed[r]] = 'Q';
                answers.push_back(board);
                return;
            }
            for (int col = 0; col < n; col++) {
                if (column[col] || diagonal[row + col] || anti[row - col + n]) continue;
                column[col] = diagonal[row + col] = anti[row - col + n] = 1;
                placed[row] = col;
                place(row + 1);
                column[col] = diagonal[row + col] = anti[row - col + n] = 0;
            }
        };
        place(0);
        return answers;
    }`,
    compareMode: "UNORDERED",
    expectedTime: "O(n!)",
    expectedSpace: "O(n)",
    hints: [
      "Put exactly one queen in each row. The remaining question is which column, and whether that column or either diagonal is already taken.",
      "Track occupied columns and the two diagonal directions. One diagonal index is row + column. The other is row - column, shifted so it stays non-negative.",
      "Try every free column, mark it, recurse to the next row, then clear the marks. When every row has a queen, draw the board.",
      "n = 2 and n = 3 have no solution, so an empty list is correct. Clearing the marks after the recursive call is what lets the next column be tried.",
    ],
    tests: [
      { input: { n: 1 }, expectedOutput: [["Q"]], visibility: "SAMPLE" },
      {
        input: { n: 4 },
        expectedOutput: [
          [".Q..", "...Q", "Q...", "..Q."],
          ["..Q.", "Q...", "...Q", ".Q.."],
        ],
        visibility: "SAMPLE",
      },
      { input: { n: 2 }, expectedOutput: [], visibility: "HIDDEN" },
      { input: { n: 3 }, expectedOutput: [], visibility: "HIDDEN" },
    ],
  }),
  problem({
    slug: "maze-paths",
    title: "Rat in a Maze",
    difficulty: "HARD",
    topics: ["recursion"],
    tags: ["backtracking"],
    statement:
      "A square maze uses 1 for an open cell and 0 for a wall. A rat starts in the top-left cell and wants the bottom-right cell. It may step down, left, right, or up, written D, L, R, and U, and it cannot visit a cell twice in one path. Return every route as a string of moves. A 1 by 1 open maze has one route, the empty string. The order of the routes does not matter.",
    constraints: ["1 <= n <= 5", "each cell is 0 or 1"],
    examples: [
      { input: "maze = [[1, 0, 0], [1, 1, 0], [1, 1, 1]]", output: '["DDRR", "DRDR"]' },
      { input: "maze = [[1, 1], [1, 1]]", output: '["DR", "RD"]' },
    ],
    signature: "vector<string> ratPaths(vector<vector<int>> maze)",
    functionName: "ratPaths",
    driver: textsOut("sol.ratPaths(in[\"maze\"].asIntMatrix())"),
    method: `vector<string> ratPaths(vector<vector<int>> maze) {
        int n = (int)maze.size();
        vector<string> paths;
        string path;
        vector<vector<int>> seen(n, vector<int>(n));
        std::function<void(int, int)> walk = [&](int row, int col) {
            if (row < 0 || col < 0 || row >= n || col >= n || maze[row][col] == 0 || seen[row][col]) return;
            if (row == n - 1 && col == n - 1) {
                paths.push_back(path);
                return;
            }
            seen[row][col] = 1;
            path.push_back('D');
            walk(row + 1, col);
            path.pop_back();
            path.push_back('L');
            walk(row, col - 1);
            path.pop_back();
            path.push_back('R');
            walk(row, col + 1);
            path.pop_back();
            path.push_back('U');
            walk(row - 1, col);
            path.pop_back();
            seen[row][col] = 0;
        };
        if (n && maze[0][0] && maze[n - 1][n - 1]) walk(0, 0);
        return paths;
    }`,
    compareMode: "UNORDERED",
    expectedTime: "O(4^(n^2))",
    expectedSpace: "O(n^2)",
    hints: [
      "From the current cell, try the four steps. A path is a sequence of successful steps that lands on the destination.",
      "Mark the cell visited before exploring, and unmark it when you leave, so another route can use it.",
      "Ignore steps that leave the maze, hit a wall, or revisit a cell. When you are on the destination, store the move string.",
      "Do not mark the destination and keep walking, or you will look for routes past the exit. If the start or the exit is a wall, there are no routes. A single open cell is already the exit, so the move string is empty.",
    ],
    tests: [
      { input: { maze: [[1, 0, 0], [1, 1, 0], [1, 1, 1]] }, expectedOutput: ["DDRR", "DRDR"], visibility: "SAMPLE" },
      { input: { maze: [[1, 1], [1, 1]] }, expectedOutput: ["DR", "RD"], visibility: "SAMPLE" },
      { input: { maze: [[1]] }, expectedOutput: [""], visibility: "HIDDEN" },
      { input: { maze: [[0]] }, expectedOutput: [], visibility: "HIDDEN" },
      { input: { maze: [[1, 0], [0, 1]] }, expectedOutput: [], visibility: "HIDDEN" },
    ],
  }),
  problem({
    slug: "color-graph",
    title: "M-Coloring Problem",
    difficulty: "HARD",
    topics: ["recursion", "graphs"],
    tags: ["backtracking"],
    statement:
      "An undirected graph has count nodes numbered from 0. You may use colors 1 through m. Return true when every node can be colored so that no edge connects two nodes of the same color.",
    constraints: ["1 <= count <= 10", "1 <= m <= 10", "0 <= each endpoint < count", "an edge does not connect a node to itself"],
    examples: [
      { input: "count = 3, edges = [[0, 1], [1, 2], [0, 2]], m = 2", output: "false" },
      { input: "count = 3, edges = [[0, 1], [1, 2], [0, 2]], m = 3", output: "true" },
    ],
    signature: "bool canColor(int count, vector<vector<int>>& edges, int colors)",
    functionName: "canColor",
    driver: `int count = (int)in["count"].asInt();\n    auto edges = in["edges"].asIntMatrix();\n    printJson(Json::boolean(sol.canColor(count, edges, (int)in["m"].asInt())));`,
    method: `bool canColor(int count, vector<vector<int>>& edges, int colors) {
        vector<vector<int>> graph(count);
        for (const auto& edge : edges) {
            graph[edge[0]].push_back(edge[1]);
            graph[edge[1]].push_back(edge[0]);
        }
        vector<int> color(count, 0);
        std::function<bool(int)> paint = [&](int node) -> bool {
            if (node == count) return true;
            for (int shade = 1; shade <= colors; shade++) {
                bool ok = true;
                for (int next : graph[node]) {
                    if (color[next] == shade) ok = false;
                }
                if (!ok) continue;
                color[node] = shade;
                if (paint(node + 1)) return true;
                color[node] = 0;
            }
            return false;
        };
        return paint(0);
    }`,
    expectedTime: "O(m^n)",
    expectedSpace: "O(n + edges)",
    hints: [
      "Color the nodes in order. A color is legal for a node when none of its already colored neighbors uses it.",
      "Build an adjacency list, then recurse from node 0 toward node count.",
      "Try each color, mark the node, and continue. If a later node gets stuck, clear the color and try the next one.",
      "A node with no edges accepts the first color. A triangle needs three colors because each pair shares an edge. Success is reaching one past the last node.",
    ],
    tests: [
      { input: { count: 3, edges: [[0, 1], [1, 2], [0, 2]], m: 2 }, expectedOutput: false, visibility: "SAMPLE" },
      { input: { count: 3, edges: [[0, 1], [1, 2], [0, 2]], m: 3 }, expectedOutput: true, visibility: "SAMPLE" },
      { input: { count: 1, edges: [], m: 1 }, expectedOutput: true, visibility: "HIDDEN" },
      { input: { count: 2, edges: [[0, 1]], m: 1 }, expectedOutput: false, visibility: "HIDDEN" },
      { input: { count: 4, edges: [[0, 1], [2, 3]], m: 2 }, expectedOutput: true, visibility: "HIDDEN" },
    ],
  }),
  problem({
    slug: "fill-grid",
    title: "Sudoku Solver",
    difficulty: "HARD",
    topics: ["recursion"],
    tags: ["backtracking"],
    statement:
      "Fill a 9 by 9 Sudoku grid. Empty cells are 0. Each row, each column, and each 3 by 3 box must contain the digits 1 through 9 once. The given clues have a single completion. Return the completed grid.",
    constraints: ["the grid is 9 by 9", "each cell is an integer from 0 to 9", "the given clues do not already repeat in a row, column, or box"],
    examples: [
      {
        input: "one empty cell at the top-left of a finished grid whose first row is otherwise 3 4 6 7 8 9 1 2 and whose first column below it is 6 1 8 4 7 9 2 3",
        output: "the same grid with 5 in the top-left",
      },
    ],
    signature: "vector<vector<int>> solveSudoku(vector<vector<int>> grid)",
    functionName: "solveSudoku",
    driver: intsOut('sol.solveSudoku(in["grid"].asIntMatrix())'),
    method: `vector<vector<int>> solveSudoku(vector<vector<int>> grid) {
        auto legal = [&](int row, int col, int digit) {
            for (int i = 0; i < 9; i++) {
                if (grid[row][i] == digit || grid[i][col] == digit) return false;
            }
            int boxRow = row / 3 * 3;
            int boxCol = col / 3 * 3;
            for (int r = 0; r < 3; r++) {
                for (int c = 0; c < 3; c++) {
                    if (grid[boxRow + r][boxCol + c] == digit) return false;
                }
            }
            return true;
        };
        std::function<bool(int)> fill = [&](int cell) -> bool {
            if (cell == 81) return true;
            int row = cell / 9;
            int col = cell % 9;
            if (grid[row][col] != 0) return fill(cell + 1);
            for (int digit = 1; digit <= 9; digit++) {
                if (!legal(row, col, digit)) continue;
                grid[row][col] = digit;
                if (fill(cell + 1)) return true;
                grid[row][col] = 0;
            }
            return false;
        };
        fill(0);
        return grid;
    }`,
    expectedTime: "O(9^empty)",
    expectedSpace: "O(1)",
    hints: [
      "Scan the 81 cells in order. A filled cell is skipped. An empty cell tries digits that are still missing from its row, column, and box.",
      "Number cells from 0 to 80. Row is cell / 9 and column is cell % 9. The box origin is those coordinates rounded down to a multiple of 3.",
      "Place a legal digit and move to the next cell. If a later cell has no digit, erase the placement and try the next digit.",
      "Stop at the first completion, because the clues determine one grid. Forgetting to erase a failed digit leaves it blocking every later attempt.",
    ],
    tests: [
      {
        input: {
          grid: [
            [0, 3, 4, 6, 7, 8, 9, 1, 2],
            [6, 7, 2, 1, 9, 5, 3, 4, 8],
            [1, 9, 8, 3, 4, 2, 5, 6, 7],
            [8, 5, 9, 7, 6, 1, 4, 2, 3],
            [4, 2, 6, 8, 5, 3, 7, 9, 1],
            [7, 1, 3, 9, 2, 4, 8, 5, 6],
            [9, 6, 1, 5, 3, 7, 2, 8, 4],
            [2, 8, 7, 4, 1, 9, 6, 3, 5],
            [3, 4, 5, 2, 8, 6, 1, 7, 9],
          ],
        },
        expectedOutput: [
          [5, 3, 4, 6, 7, 8, 9, 1, 2],
          [6, 7, 2, 1, 9, 5, 3, 4, 8],
          [1, 9, 8, 3, 4, 2, 5, 6, 7],
          [8, 5, 9, 7, 6, 1, 4, 2, 3],
          [4, 2, 6, 8, 5, 3, 7, 9, 1],
          [7, 1, 3, 9, 2, 4, 8, 5, 6],
          [9, 6, 1, 5, 3, 7, 2, 8, 4],
          [2, 8, 7, 4, 1, 9, 6, 3, 5],
          [3, 4, 5, 2, 8, 6, 1, 7, 9],
        ],
        visibility: "SAMPLE",
      },
      {
        input: {
          grid: [
            [0, 3, 4, 6, 7, 8, 9, 1, 2],
            [6, 7, 2, 1, 9, 5, 3, 4, 8],
            [1, 9, 8, 3, 4, 0, 5, 6, 7],
            [8, 5, 9, 7, 6, 1, 4, 2, 3],
            [4, 2, 6, 8, 0, 3, 7, 9, 1],
            [7, 1, 3, 9, 2, 4, 8, 5, 6],
            [9, 6, 1, 5, 3, 7, 2, 8, 4],
            [2, 8, 7, 4, 1, 9, 6, 3, 5],
            [3, 4, 5, 2, 8, 6, 1, 7, 0],
          ],
        },
        expectedOutput: [
          [5, 3, 4, 6, 7, 8, 9, 1, 2],
          [6, 7, 2, 1, 9, 5, 3, 4, 8],
          [1, 9, 8, 3, 4, 2, 5, 6, 7],
          [8, 5, 9, 7, 6, 1, 4, 2, 3],
          [4, 2, 6, 8, 5, 3, 7, 9, 1],
          [7, 1, 3, 9, 2, 4, 8, 5, 6],
          [9, 6, 1, 5, 3, 7, 2, 8, 4],
          [2, 8, 7, 4, 1, 9, 6, 3, 5],
          [3, 4, 5, 2, 8, 6, 1, 7, 9],
        ],
        visibility: "HIDDEN",
      },
    ],
  }),
  problem({
    slug: "operator-ways",
    title: "Expression Add Operators",
    difficulty: "HARD",
    topics: ["recursion", "strings"],
    tags: ["backtracking"],
    statement:
      "A string of digits should be split, and the pieces joined by +, -, or *, so the expression equals target. The pieces stay in their original order. A piece may not have a leading zero, except the number 0 itself. Return every expression. The order of the expressions does not matter.",
    constraints: ["1 <= digits length <= 10", "digits are characters 0 through 9", "-5000 <= target <= 5000"],
    examples: [
      { input: 'digits = "123", target = 6', output: '["1+2+3", "1*2*3"]' },
      { input: 'digits = "105", target = 5', output: '["1*0+5", "10-5"]' },
    ],
    signature: "vector<string> addOperators(string digits, int target)",
    functionName: "addOperators",
    driver: textsOut('sol.addOperators(in["digits"].asString(), (int)in["target"].asInt())'),
    method: `vector<string> addOperators(string digits, int target) {
        vector<string> answers;
        std::function<void(int, long long, long long, string)> place = [&](int index, long long value, long long last, string expr) {
            if (index == (int)digits.size()) {
                if (value == target) answers.push_back(expr);
                return;
            }
            for (int end = index; end < (int)digits.size(); end++) {
                if (end > index && digits[index] == '0') break;
                string part = digits.substr(index, end - index + 1);
                long long current = stoll(part);
                if (index == 0) {
                    place(end + 1, current, current, part);
                    continue;
                }
                place(end + 1, value + current, current, expr + "+" + part);
                place(end + 1, value - current, -current, expr + "-" + part);
                place(end + 1, value - last + last * current, last * current, expr + "*" + part);
            }
        };
        if (!digits.empty()) place(0, 0, 0, "");
        return answers;
    }`,
    compareMode: "UNORDERED",
    expectedTime: "O(4^n)",
    expectedSpace: "O(n)",
    hints: [
      "Cut a number off the front of the remaining digits, then attach it with +, -, or *. Multiplication has to undo the previous addition and apply to the previous term.",
      "Carry the value so far and the last term you added. For *, the new value is value - last + last * current.",
      "Do not put an operator before the first number. Reject a cut that continues after a leading zero. Store the expression when the digits are used and the value equals the target.",
      "The last term for a subtraction is negative, so a following multiplication keeps the sign. \"10-5\" and \"1*0+5\" are different cuts of the same digits.",
    ],
    tests: [
      { input: { digits: "123", target: 6 }, expectedOutput: ["1+2+3", "1*2*3"], visibility: "SAMPLE" },
      { input: { digits: "105", target: 5 }, expectedOutput: ["1*0+5", "10-5"], visibility: "SAMPLE" },
      { input: { digits: "00", target: 0 }, expectedOutput: ["0+0", "0-0", "0*0"], visibility: "HIDDEN" },
      { input: { digits: "232", target: 8 }, expectedOutput: ["2+3*2", "2*3+2"], visibility: "HIDDEN" },
      { input: { digits: "12", target: 3 }, expectedOutput: ["1+2"], visibility: "HIDDEN" },
    ],
  }),
];
