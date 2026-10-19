import { problem } from "./helpers.js";

const numbersOut = (call: string) =>
  `auto values = ${call};\n    Json out;\n    out.type = Json::ARR;\n    for (long long value : values) out.a.push_back(Json::number(value));\n    printJson(out);`;

const rowsOut = (call: string) =>
  `auto rows = ${call};\n    Json out;\n    out.type = Json::ARR;\n    for (const auto& row : rows) out.a.push_back(Json::ints(row));\n    printJson(out);`;

export const basicProblems = [
  problem({
    slug: "count-digits",
    title: "Count all Digits of a Number",
    difficulty: "EASY",
    topics: ["basics"],
    tags: ["math"],
    statement: "Return how many digits n has in base 10. Zero has one digit.",
    constraints: ["0 <= n <= 1000000000"],
    examples: [
      { input: "n = 12345", output: "5" },
      { input: "n = 0", output: "1" },
    ],
    signature: "int countDigits(int n)",
    functionName: "countDigits",
    driver: `printJson(Json::number(sol.countDigits((int)in["n"].asInt())));`,
    method: `int countDigits(int n) {
        if (n == 0) return 1;
        int count = 0;
        while (n) { count++; n /= 10; }
        return count;
    }`,
    expectedTime: "O(digits)",
    expectedSpace: "O(1)",
    hints: [
      "Each division by 10 drops one digit.",
      "Zero is the one value that has no positive quotient and still counts as a single digit.",
      "Keep dividing by 10 and count the steps until the number becomes 0.",
      "For a positive n the loop runs once per digit. Return 1 immediately when n is 0.",
    ],
    tests: [
      { input: { n: 12345 }, expectedOutput: 5, visibility: "SAMPLE" },
      { input: { n: 0 }, expectedOutput: 1, visibility: "SAMPLE" },
      { input: { n: 7 }, expectedOutput: 1, visibility: "HIDDEN" },
      { input: { n: 1000000000 }, expectedOutput: 10, visibility: "HIDDEN" },
    ],
  }),
  problem({
    slug: "reverse-number",
    title: "Reverse a Number",
    difficulty: "EASY",
    topics: ["basics"],
    tags: ["math"],
    statement:
      "Reverse the decimal digits of n. Leading zeros in the reversed digits disappear, and a negative sign stays in front. If the reversed value does not fit in a signed 32-bit integer, return 0.",
    constraints: ["-2000000000 <= n <= 2000000000"],
    examples: [
      { input: "n = 120", output: "21" },
      { input: "n = -123", output: "-321" },
    ],
    signature: "int reverseNumber(int n)",
    functionName: "reverseNumber",
    driver: `printJson(Json::number(sol.reverseNumber((int)in["n"].asInt())));`,
    method: `int reverseNumber(int n) {
        long long sign = n < 0 ? -1 : 1;
        long long value = n < 0 ? -(long long)n : n;
        long long reversed = 0;
        while (value) {
            reversed = reversed * 10 + value % 10;
            value /= 10;
        }
        reversed *= sign;
        if (reversed < INT_MIN || reversed > INT_MAX) return 0;
        return (int)reversed;
    }`,
    expectedTime: "O(digits)",
    expectedSpace: "O(1)",
    hints: [
      "Peel off the last digit with remainder 10 and append it to a new number.",
      "Keep the sign separate so the digit loop can run on a non-negative value.",
      "Build the reverse in a wider integer. Trailing zeros of the original become nothing at the front of the result.",
      "After restoring the sign, return 0 when the value is outside the signed 32-bit range. Otherwise cast it back.",
    ],
    tests: [
      { input: { n: 120 }, expectedOutput: 21, visibility: "SAMPLE" },
      { input: { n: -123 }, expectedOutput: -321, visibility: "SAMPLE" },
      { input: { n: 0 }, expectedOutput: 0, visibility: "HIDDEN" },
      { input: { n: 1534236469 }, expectedOutput: 0, visibility: "HIDDEN" },
    ],
  }),
  problem({
    slug: "palindrome-number",
    title: "Palindrome Number",
    difficulty: "EASY",
    topics: ["basics"],
    tags: ["math"],
    statement: "Return whether n reads the same forwards and backwards in base 10. A negative number is not a palindrome.",
    constraints: ["-2000000000 <= n <= 2000000000"],
    examples: [
      { input: "n = 121", output: "true" },
      { input: "n = -121", output: "false" },
    ],
    signature: "bool palindromeNumber(int n)",
    functionName: "palindromeNumber",
    driver: `printJson(Json::boolean(sol.palindromeNumber((int)in["n"].asInt())));`,
    method: `bool palindromeNumber(int n) {
        if (n < 0) return false;
        long long reversed = 0, value = n;
        while (value) {
            reversed = reversed * 10 + value % 10;
            value /= 10;
        }
        return reversed == n;
    }`,
    expectedTime: "O(digits)",
    expectedSpace: "O(1)",
    hints: [
      "A negative sign has no matching character on the other end.",
      "Reverse the digits the same way as reversing a number, using a wider integer.",
      "Compare the rebuilt value with the original. A trailing zero only works when the number itself is 0.",
      "Return false immediately for a negative n. Zero reverses to zero and is a palindrome.",
    ],
    tests: [
      { input: { n: 121 }, expectedOutput: true, visibility: "SAMPLE" },
      { input: { n: -121 }, expectedOutput: false, visibility: "SAMPLE" },
      { input: { n: 10 }, expectedOutput: false, visibility: "HIDDEN" },
      { input: { n: 0 }, expectedOutput: true, visibility: "HIDDEN" },
    ],
  }),
  problem({
    slug: "gcd-two",
    title: "GCD of Two Numbers",
    difficulty: "EASY",
    topics: ["basics"],
    tags: ["math"],
    statement: "Return the greatest positive integer that divides both a and b.",
    constraints: ["1 <= a, b <= 1000000000"],
    examples: [
      { input: "a = 48, b = 18", output: "6" },
      { input: "a = 7, b = 13", output: "1" },
    ],
    signature: "int greatestDivisor(int a, int b)",
    functionName: "greatestDivisor",
    driver: `printJson(Json::number(sol.greatestDivisor((int)in["a"].asInt(), (int)in["b"].asInt())));`,
    method: `int greatestDivisor(int a, int b) {
        while (b) {
            int rest = a % b;
            a = b;
            b = rest;
        }
        return a;
    }`,
    expectedTime: "O(log min(a, b))",
    expectedSpace: "O(1)",
    hints: [
      "Any common divisor of a and b also divides the remainder of a divided by b.",
      "Euclid's algorithm replaces the larger number by that remainder.",
      "Swap in the remainder until the remainder is 0. The other number is the divisor you want.",
      "The loop is logarithmic because the remainder is smaller than the divisor each time.",
    ],
    tests: [
      { input: { a: 48, b: 18 }, expectedOutput: 6, visibility: "SAMPLE" },
      { input: { a: 7, b: 13 }, expectedOutput: 1, visibility: "SAMPLE" },
      { input: { a: 1, b: 1 }, expectedOutput: 1, visibility: "HIDDEN" },
      { input: { a: 100, b: 25 }, expectedOutput: 25, visibility: "HIDDEN" },
    ],
  }),
  problem({
    slug: "armstrong-number",
    title: "Armstrong Number",
    difficulty: "EASY",
    topics: ["basics"],
    tags: ["math"],
    statement:
      "Return whether n equals the sum of its digits each raised to the number of digits. For a d-digit number, add digit^d for every digit.",
    constraints: ["0 <= n <= 1000000000"],
    examples: [
      { input: "n = 153", output: "true", explanation: "1^3 + 5^3 + 3^3 = 153." },
      { input: "n = 123", output: "false" },
    ],
    signature: "bool armstrongNumber(int n)",
    functionName: "armstrongNumber",
    driver: `printJson(Json::boolean(sol.armstrongNumber((int)in["n"].asInt())));`,
    method: `bool armstrongNumber(int n) {
        if (n == 0) return true;
        int digits = 0;
        long long value = n;
        while (value) { digits++; value /= 10; }
        long long sum = 0;
        value = n;
        while (value) {
            int digit = (int)(value % 10);
            long long power = 1;
            for (int i = 0; i < digits; i++) power *= digit;
            sum += power;
            value /= 10;
        }
        return sum == n;
    }`,
    expectedTime: "O(digits^2)",
    expectedSpace: "O(1)",
    hints: [
      "Count the digits first. That count is the exponent for every digit.",
      "Raise each digit to that power with a small loop, and add the powers in a wide integer.",
      "Zero has one digit and 0^1 is 0, so it qualifies.",
      "Compare the sum with the original number. A single-digit number always qualifies because digit^1 is itself.",
    ],
    tests: [
      { input: { n: 153 }, expectedOutput: true, visibility: "SAMPLE" },
      { input: { n: 123 }, expectedOutput: false, visibility: "SAMPLE" },
      { input: { n: 9474 }, expectedOutput: true, visibility: "HIDDEN" },
      { input: { n: 0 }, expectedOutput: true, visibility: "HIDDEN" },
    ],
  }),
  problem({
    slug: "prime-check",
    title: "Check for Prime Number",
    difficulty: "EASY",
    topics: ["basics"],
    tags: ["math"],
    statement: "Return whether n is a prime number. A prime has exactly two distinct positive divisors, 1 and itself.",
    constraints: ["0 <= n <= 1000000000"],
    examples: [
      { input: "n = 17", output: "true" },
      { input: "n = 9", output: "false" },
    ],
    signature: "bool isPrime(int n)",
    functionName: "isPrime",
    driver: `printJson(Json::boolean(sol.isPrime((int)in["n"].asInt())));`,
    method: `bool isPrime(int n) {
        if (n < 2) return false;
        for (int factor = 2; (long long)factor * factor <= n; factor++) if (n % factor == 0) return false;
        return true;
    }`,
    expectedTime: "O(sqrt n)",
    expectedSpace: "O(1)",
    hints: [
      "0 and 1 are not prime. 2 is the smallest prime.",
      "If n has a divisor other than 1 and itself, one of that pair is at most sqrt(n).",
      "Test factors from 2 while factor * factor does not exceed n. Multiply in a wide integer so the square does not overflow.",
      "Return false on the first divisor. If the loop finishes, n is prime.",
    ],
    tests: [
      { input: { n: 17 }, expectedOutput: true, visibility: "SAMPLE" },
      { input: { n: 9 }, expectedOutput: false, visibility: "SAMPLE" },
      { input: { n: 1 }, expectedOutput: false, visibility: "HIDDEN" },
      { input: { n: 2 }, expectedOutput: true, visibility: "HIDDEN" },
    ],
  }),
  problem({
    slug: "print-1-to-n",
    title: "Print 1 to N",
    difficulty: "EASY",
    topics: ["basics"],
    tags: ["recursion"],
    statement: "Return the integers from 1 through n in increasing order.",
    constraints: ["1 <= n <= 1000"],
    examples: [
      { input: "n = 5", output: "[1, 2, 3, 4, 5]" },
      { input: "n = 1", output: "[1]" },
    ],
    signature: "vector<int> printOneToN(int n)",
    functionName: "printOneToN",
    driver: ` ${numbersOut("sol.printOneToN((int)in[\"n\"].asInt())")}`,
    method: `vector<int> printOneToN(int n) {
        if (n == 1) return {1};
        auto values = printOneToN(n - 1);
        values.push_back(n);
        return values;
    }`,
    expectedTime: "O(n)",
    expectedSpace: "O(n)",
    hints: [
      "The list for n is the list for n - 1 with n placed at the end.",
      "The base case is n = 1, which is the list containing only 1.",
      "Recurse down to 1, then append the current n on the way back up.",
      "Each call adds one number, so the time and the extra stack space are linear.",
    ],
    tests: [
      { input: { n: 5 }, expectedOutput: [1, 2, 3, 4, 5], visibility: "SAMPLE" },
      { input: { n: 1 }, expectedOutput: [1], visibility: "SAMPLE" },
      { input: { n: 3 }, expectedOutput: [1, 2, 3], visibility: "HIDDEN" },
      { input: { n: 2 }, expectedOutput: [1, 2], visibility: "HIDDEN" },
    ],
  }),
  problem({
    slug: "print-n-to-1",
    title: "Print N to 1",
    difficulty: "EASY",
    topics: ["basics"],
    tags: ["recursion"],
    statement: "Return the integers from n down through 1.",
    constraints: ["1 <= n <= 1000"],
    examples: [
      { input: "n = 5", output: "[5, 4, 3, 2, 1]" },
      { input: "n = 1", output: "[1]" },
    ],
    signature: "vector<int> printNToOne(int n)",
    functionName: "printNToOne",
    driver: ` ${numbersOut("sol.printNToOne((int)in[\"n\"].asInt())")}`,
    method: `vector<int> printNToOne(int n) {
        if (n == 1) return {1};
        auto values = printNToOne(n - 1);
        values.insert(values.begin(), n);
        return values;
    }`,
    expectedTime: "O(n^2)",
    expectedSpace: "O(n)",
    hints: [
      "Write n first, then the descending list of everything smaller.",
      "The base case is again the list containing only 1.",
      "Recurse to n - 1 and put n at the front of the returned list.",
      "Putting a value at the front copies the tail, so this particular recursion is quadratic. n stays small enough for that copy.",
    ],
    tests: [
      { input: { n: 5 }, expectedOutput: [5, 4, 3, 2, 1], visibility: "SAMPLE" },
      { input: { n: 1 }, expectedOutput: [1], visibility: "SAMPLE" },
      { input: { n: 3 }, expectedOutput: [3, 2, 1], visibility: "HIDDEN" },
      { input: { n: 2 }, expectedOutput: [2, 1], visibility: "HIDDEN" },
    ],
  }),
  problem({
    slug: "sum-first-n",
    title: "Sum of First N Numbers",
    difficulty: "EASY",
    topics: ["basics"],
    tags: ["math"],
    statement: "Return the sum of the integers from 1 through n.",
    constraints: ["1 <= n <= 100000"],
    examples: [
      { input: "n = 5", output: "15" },
      { input: "n = 1", output: "1" },
    ],
    signature: "long long sumFirst(int n)",
    functionName: "sumFirst",
    driver: `printJson(Json::number(sol.sumFirst((int)in["n"].asInt())));`,
    method: `long long sumFirst(int n) {
        return (long long)n * (n + 1) / 2;
    }`,
    expectedTime: "O(1)",
    expectedSpace: "O(1)",
    hints: [
      "Adding 1 through n by hand is correct, and there is also a closed form.",
      "Pair the smallest with the largest: 1 + n, 2 + (n - 1), and so on.",
      "There are n / 2 such pairs, each equal to n + 1, which gives n * (n + 1) / 2.",
      "Multiply in a wide integer before dividing by 2. For n = 100000 the sum does not fit in a 32-bit integer.",
    ],
    tests: [
      { input: { n: 5 }, expectedOutput: 15, visibility: "SAMPLE" },
      { input: { n: 1 }, expectedOutput: 1, visibility: "SAMPLE" },
      { input: { n: 100 }, expectedOutput: 5050, visibility: "HIDDEN" },
      { input: { n: 100000 }, expectedOutput: 5000050000, visibility: "HIDDEN" },
    ],
  }),
  problem({
    slug: "factorial-n",
    title: "Factorial of a Number",
    difficulty: "EASY",
    topics: ["basics"],
    tags: ["recursion"],
    statement: "Return n!, the product of the integers from 1 through n. The factorial of 0 is 1.",
    constraints: ["0 <= n <= 12"],
    examples: [
      { input: "n = 5", output: "120" },
      { input: "n = 0", output: "1" },
    ],
    signature: "int factorial(int n)",
    functionName: "factorial",
    driver: `printJson(Json::number(sol.factorial((int)in["n"].asInt())));`,
    method: `int factorial(int n) {
        if (n <= 1) return 1;
        return n * factorial(n - 1);
    }`,
    expectedTime: "O(n)",
    expectedSpace: "O(n)",
    hints: [
      "n! is n times (n - 1)!.",
      "Both 0! and 1! are 1, so that is the base case.",
      "Recurse until n is at most 1, then multiply on the way back.",
      "n is at most 12 so the product still fits in a signed 32-bit integer. 13! would not.",
    ],
    tests: [
      { input: { n: 5 }, expectedOutput: 120, visibility: "SAMPLE" },
      { input: { n: 0 }, expectedOutput: 1, visibility: "SAMPLE" },
      { input: { n: 1 }, expectedOutput: 1, visibility: "HIDDEN" },
      { input: { n: 12 }, expectedOutput: 479001600, visibility: "HIDDEN" },
    ],
  }),
  problem({
    slug: "reverse-array",
    title: "Reverse an Array",
    difficulty: "EASY",
    topics: ["basics"],
    tags: ["two-pointers"],
    statement: "Return the values of nums in reverse order. An empty list stays empty.",
    constraints: ["0 <= nums.length <= 100000", "-1000000000 <= nums[i] <= 1000000000"],
    examples: [
      { input: "nums = [1, 2, 3]", output: "[3, 2, 1]" },
      { input: "nums = []", output: "[]" },
    ],
    signature: "vector<int> reverseArray(vector<int>& nums)",
    functionName: "reverseArray",
    driver: `auto nums = in["nums"].asIntVector();\n    ${numbersOut("sol.reverseArray(nums)")}`,
    method: `vector<int> reverseArray(vector<int>& nums) {
        int left = 0, right = (int)nums.size() - 1;
        while (left < right) swap(nums[left++], nums[right--]);
        return nums;
    }`,
    expectedTime: "O(n)",
    expectedSpace: "O(1)",
    hints: [
      "The first value trades places with the last, the second with the second last, and so on.",
      "Two indexes walking toward each other meet in the middle.",
      "Swap and move both indexes inward while the left index is still smaller.",
      "An empty list and a one-element list need no swaps. Extra memory is not required beyond the input.",
    ],
    tests: [
      { input: { nums: [1, 2, 3] }, expectedOutput: [3, 2, 1], visibility: "SAMPLE" },
      { input: { nums: [] }, expectedOutput: [], visibility: "SAMPLE" },
      { input: { nums: [4] }, expectedOutput: [4], visibility: "HIDDEN" },
      { input: { nums: [1, 2] }, expectedOutput: [2, 1], visibility: "HIDDEN" },
    ],
  }),
  problem({
    slug: "fibonacci-number",
    title: "Fibonacci Number",
    difficulty: "EASY",
    topics: ["basics"],
    tags: ["recursion"],
    statement: "Return the nth Fibonacci number. F(0) is 0, F(1) is 1, and each later number is the sum of the previous two.",
    constraints: ["0 <= n <= 40"],
    examples: [
      { input: "n = 5", output: "5" },
      { input: "n = 0", output: "0" },
    ],
    signature: "int fibonacci(int n)",
    functionName: "fibonacci",
    driver: `printJson(Json::number(sol.fibonacci((int)in["n"].asInt())));`,
    method: `int fibonacci(int n) {
        if (n == 0) return 0;
        int previous = 0, current = 1;
        for (int step = 2; step <= n; step++) {
            int next = previous + current;
            previous = current;
            current = next;
        }
        return current;
    }`,
    expectedTime: "O(n)",
    expectedSpace: "O(1)",
    hints: [
      "The recurrence is F(n) = F(n - 1) + F(n - 2), with F(0) = 0 and F(1) = 1.",
      "A direct double recursion repeats the same subproblems. Keep only the last two values instead.",
      "Start from 0 and 1 and replace the pair n - 1 times, or n - 1 steps after the first 1.",
      "F(40) still fits in a signed 32-bit integer. The loop is linear and uses constant extra memory.",
    ],
    tests: [
      { input: { n: 5 }, expectedOutput: 5, visibility: "SAMPLE" },
      { input: { n: 0 }, expectedOutput: 0, visibility: "SAMPLE" },
      { input: { n: 1 }, expectedOutput: 1, visibility: "HIDDEN" },
      { input: { n: 10 }, expectedOutput: 55, visibility: "HIDDEN" },
    ],
  }),
  problem({
    slug: "element-frequencies",
    title: "Counting Frequencies of Array Elements",
    difficulty: "EASY",
    topics: ["basics"],
    tags: ["hash-map"],
    statement:
      "Return one pair [value, count] for every distinct value in nums. Sort the pairs by value ascending. Count is how many times that value appears.",
    constraints: ["1 <= nums.length <= 100000", "-1000000000 <= nums[i] <= 1000000000"],
    examples: [
      { input: "nums = [1, 2, 1, 3, 2]", output: "[[1, 2], [2, 2], [3, 1]]" },
      { input: "nums = [4]", output: "[[4, 1]]" },
    ],
    signature: "vector<vector<int>> frequencies(vector<int>& nums)",
    functionName: "frequencies",
    driver: `auto nums = in["nums"].asIntVector();\n    ${rowsOut("sol.frequencies(nums)")}`,
    method: `vector<vector<int>> frequencies(vector<int>& nums) {
        map<int, int> count;
        for (int value : nums) count[value]++;
        vector<vector<int>> rows;
        for (auto [value, times] : count) rows.push_back({value, times});
        return rows;
    }`,
    expectedTime: "O(n log n)",
    expectedSpace: "O(n)",
    hints: [
      "Equal values should share one counter.",
      "A map from value to count both stores the totals and keeps the keys in order.",
      "Walk the input once and increment the counter for each value.",
      "Read the map from its smallest key to its largest and emit [value, count] for each entry.",
    ],
    tests: [
      { input: { nums: [1, 2, 1, 3, 2] }, expectedOutput: [[1, 2], [2, 2], [3, 1]], visibility: "SAMPLE" },
      { input: { nums: [4] }, expectedOutput: [[4, 1]], visibility: "SAMPLE" },
      { input: { nums: [3, 3, 3] }, expectedOutput: [[3, 3]], visibility: "HIDDEN" },
      { input: { nums: [2, 1] }, expectedOutput: [[1, 1], [2, 1]], visibility: "HIDDEN" },
    ],
  }),
  problem({
    slug: "highest-occurring",
    title: "Highest Occurring Element",
    difficulty: "EASY",
    topics: ["basics"],
    tags: ["hash-map"],
    statement: "Return the value that appears most often in nums. If several values share that count, return the smallest one.",
    constraints: ["1 <= nums.length <= 100000", "-1000000000 <= nums[i] <= 1000000000"],
    examples: [
      { input: "nums = [1, 2, 2, 3, 1]", output: "1", explanation: "1 and 2 each appear twice, and 1 is smaller." },
      { input: "nums = [4]", output: "4" },
    ],
    signature: "int highestOccurring(vector<int>& nums)",
    functionName: "highestOccurring",
    driver: `auto nums = in["nums"].asIntVector();\n    printJson(Json::number(sol.highestOccurring(nums)));`,
    method: `int highestOccurring(vector<int>& nums) {
        map<int, int> count;
        for (int value : nums) count[value]++;
        int best = nums[0], times = 0;
        for (auto [value, seen] : count) if (seen > times) { times = seen; best = value; }
        return best;
    }`,
    expectedTime: "O(n log n)",
    expectedSpace: "O(n)",
    hints: [
      "Count every value, then choose the count that is largest.",
      "A map ordered by value makes the tie rule easy: the first time you see the winning count, that value is the smallest.",
      "Update the answer only when a count is strictly greater than the best count so far.",
      "Because the map is scanned from small values to large ones, a later equal count must not replace the answer.",
    ],
    tests: [
      { input: { nums: [1, 2, 2, 3, 1] }, expectedOutput: 1, visibility: "SAMPLE" },
      { input: { nums: [4] }, expectedOutput: 4, visibility: "SAMPLE" },
      { input: { nums: [3, 1, 3, 1, 2] }, expectedOutput: 1, visibility: "HIDDEN" },
      { input: { nums: [5, 5, 1] }, expectedOutput: 5, visibility: "HIDDEN" },
    ],
  }),
];
