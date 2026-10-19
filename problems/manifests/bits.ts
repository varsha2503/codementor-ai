import { problem } from "./helpers.js";

const numbersOut = (call: string) =>
  `auto values = ${call};\n    Json out;\n    out.type = Json::ARR;\n    for (long long value : values) out.a.push_back(Json::number(value));\n    printJson(out);`;

const pairsOut = (call: string) =>
  `auto rows = ${call};\n    Json out;\n    out.type = Json::ARR;\n    for (const auto& row : rows) {\n        Json pair;\n        pair.type = Json::ARR;\n        for (long long value : row) pair.a.push_back(Json::number(value));\n        out.a.push_back(pair);\n    }\n    printJson(out);`;

export const bitProblems = [
  problem({
    slug: "bit-index",
    title: "Check if the i-th Bit is Set",
    difficulty: "EASY",
    topics: ["bit-manipulation"],
    tags: ["bits"],
    statement:
      "Return true when bit i of n is 1. Bit 0 is the least significant bit, so it is the ones place. n is non-negative.",
    constraints: ["0 <= n <= 1000000000000", "0 <= i <= 52"],
    examples: [
      { input: "n = 13, i = 0", output: "true", explanation: "13 is 1101 in binary, and the ones bit is set." },
      { input: "n = 13, i = 1", output: "false" },
    ],
    signature: "bool isBitSet(long long n, int i)",
    functionName: "isBitSet",
    driver: `printJson(Json::boolean(sol.isBitSet(in["n"].asInt(), (int)in["i"].asInt())));`,
    method: `bool isBitSet(long long n, int i) {
        return ((n >> i) & 1LL) != 0;
    }`,
    expectedTime: "O(1)",
    expectedSpace: "O(1)",
    hints: [
      "Dividing by two drops the ones bit. Doing that i times leaves the bit you want in the ones place.",
      "Shift n right by i, then keep only the lowest bit.",
      "A mask of 1 shifted left by i tests the same bit with AND. Either form is constant time.",
      "Bit 0 of an even number is clear. Shifting by the full width of the value is why i stops at 52 for these constraints.",
    ],
    tests: [
      { input: { n: 13, i: 0 }, expectedOutput: true, visibility: "SAMPLE" },
      { input: { n: 13, i: 1 }, expectedOutput: false, visibility: "SAMPLE" },
      { input: { n: 0, i: 0 }, expectedOutput: false, visibility: "HIDDEN" },
      { input: { n: 8, i: 3 }, expectedOutput: true, visibility: "HIDDEN" },
      { input: { n: 1000000000000, i: 52 }, expectedOutput: false, visibility: "HIDDEN" },
    ],
  }),
  problem({
    slug: "odd-check",
    title: "Check if a Number is Odd",
    difficulty: "EASY",
    topics: ["bit-manipulation"],
    tags: ["bits"],
    statement: "Return true when n is odd. A negative number is odd when it is not divisible by 2.",
    constraints: ["-1000000000 <= n <= 1000000000"],
    examples: [
      { input: "n = 7", output: "true" },
      { input: "n = -4", output: "false" },
    ],
    signature: "bool isOdd(long long n)",
    functionName: "isOdd",
    driver: `printJson(Json::boolean(sol.isOdd(in["n"].asInt())));`,
    method: `bool isOdd(long long n) {
        return (n & 1LL) != 0;
    }`,
    expectedTime: "O(1)",
    expectedSpace: "O(1)",
    hints: [
      "The ones bit is the only bit that changes between an even number and the next odd number.",
      "AND n with 1. A non-zero result means the ones bit is set.",
      "In two's complement the ones bit still tells you whether a negative number is odd.",
      "Zero is even. You do not need a remainder operator.",
    ],
    tests: [
      { input: { n: 7 }, expectedOutput: true, visibility: "SAMPLE" },
      { input: { n: -4 }, expectedOutput: false, visibility: "SAMPLE" },
      { input: { n: 0 }, expectedOutput: false, visibility: "HIDDEN" },
      { input: { n: -3 }, expectedOutput: true, visibility: "HIDDEN" },
      { input: { n: 8 }, expectedOutput: false, visibility: "HIDDEN" },
    ],
  }),
  problem({
    slug: "power-two",
    title: "Check if a Number is a Power of Two",
    difficulty: "EASY",
    topics: ["bit-manipulation"],
    tags: ["bits"],
    statement: "Return true when n is a positive power of two. 1 counts, because it is 2 to the power 0. 0 does not.",
    constraints: ["0 <= n <= 1000000000000"],
    examples: [
      { input: "n = 16", output: "true" },
      { input: "n = 18", output: "false" },
    ],
    signature: "bool isPowerOfTwo(long long n)",
    functionName: "isPowerOfTwo",
    driver: `printJson(Json::boolean(sol.isPowerOfTwo(in["n"].asInt())));`,
    method: `bool isPowerOfTwo(long long n) {
        return n > 0 && (n & (n - 1)) == 0;
    }`,
    expectedTime: "O(1)",
    expectedSpace: "O(1)",
    hints: [
      "A power of two has exactly one bit set. Subtracting one flips that bit off and turns every lower bit on.",
      "n AND (n - 1) is 0 exactly when n has a single set bit.",
      "Reject 0 before the mask. Zero has no set bit, and it is not a positive power of two.",
      "1 passes, because 1 AND 0 is 0. Any number with two set bits leaves a non-zero mask.",
    ],
    tests: [
      { input: { n: 16 }, expectedOutput: true, visibility: "SAMPLE" },
      { input: { n: 18 }, expectedOutput: false, visibility: "SAMPLE" },
      { input: { n: 0 }, expectedOutput: false, visibility: "HIDDEN" },
      { input: { n: 1 }, expectedOutput: true, visibility: "HIDDEN" },
      { input: { n: 1073741824 }, expectedOutput: true, visibility: "HIDDEN" },
    ],
  }),
  problem({
    slug: "popcount",
    title: "Count the Number of Set Bits",
    difficulty: "EASY",
    topics: ["bit-manipulation"],
    tags: ["bits"],
    statement: "Count the 1 bits in the binary form of a non-negative n. Leading zeros do not count, so 0 has zero set bits.",
    constraints: ["0 <= n <= 1000000000000"],
    examples: [
      { input: "n = 7", output: "3" },
      { input: "n = 0", output: "0" },
    ],
    signature: "int countSetBits(long long n)",
    functionName: "countSetBits",
    driver: `printJson(Json::number(sol.countSetBits(in["n"].asInt())));`,
    method: `int countSetBits(long long n) {
        int count = 0;
        while (n) {
            n &= n - 1;
            count++;
        }
        return count;
    }`,
    expectedTime: "O(set bits)",
    expectedSpace: "O(1)",
    hints: [
      "You can test every bit position. There is also a step that deletes one set bit at a time.",
      "n AND (n - 1) clears the lowest set bit.",
      "Repeat that until n becomes 0, and count the repetitions.",
      "The loop runs once per set bit, not once per bit of width. Zero never enters the loop.",
    ],
    tests: [
      { input: { n: 7 }, expectedOutput: 3, visibility: "SAMPLE" },
      { input: { n: 0 }, expectedOutput: 0, visibility: "SAMPLE" },
      { input: { n: 1024 }, expectedOutput: 1, visibility: "HIDDEN" },
      { input: { n: 15 }, expectedOutput: 4, visibility: "HIDDEN" },
      { input: { n: 1000000000000 }, expectedOutput: 13, visibility: "HIDDEN" },
    ],
  }),
  problem({
    slug: "rightmost-bit",
    title: "Set/Unset the Rightmost Unset Bit",
    difficulty: "EASY",
    topics: ["bit-manipulation"],
    tags: ["bits"],
    statement:
      "Return two numbers, [turnedOn, turnedOff]. turnedOn is n with its lowest 0 bit changed to 1. turnedOff is n with its lowest 1 bit changed to 0. When n is 0, turnedOff stays 0.",
    constraints: ["0 <= n <= 1000000000000"],
    examples: [
      { input: "n = 6", output: "[7, 4]", explanation: "6 is 110. Setting the lowest 0 makes 111. Clearing the lowest 1 makes 100." },
      { input: "n = 0", output: "[1, 0]" },
    ],
    signature: "vector<long long> rightmostBits(long long n)",
    functionName: "rightmostBits",
    driver: numbersOut("sol.rightmostBits(in[\"n\"].asInt())"),
    method: `vector<long long> rightmostBits(long long n) {
        long long turnedOn = n | (n + 1);
        long long turnedOff = n & (n - 1);
        return {turnedOn, turnedOff};
    }`,
    expectedTime: "O(1)",
    expectedSpace: "O(1)",
    hints: [
      "Adding one flips every trailing 1 into 0 and the first 0 into 1. That is the bit you want to turn on.",
      "OR n with n + 1 to set the lowest unset bit. AND n with n - 1 to clear the lowest set bit.",
      "n - 1 flips the lowest 1 off and fills the bits under it, so the AND keeps everything above that bit.",
      "For 0, n + 1 is 1 and the OR is 1. n - 1 is negative, and AND with 0 stays 0. Both formulas are constant time.",
    ],
    tests: [
      { input: { n: 6 }, expectedOutput: [7, 4], visibility: "SAMPLE" },
      { input: { n: 0 }, expectedOutput: [1, 0], visibility: "SAMPLE" },
      { input: { n: 7 }, expectedOutput: [15, 6], visibility: "HIDDEN" },
      { input: { n: 8 }, expectedOutput: [9, 0], visibility: "HIDDEN" },
    ],
  }),
  problem({
    slug: "swap-values",
    title: "Swap Two Numbers",
    difficulty: "EASY",
    topics: ["bit-manipulation"],
    tags: ["bits"],
    statement: "Swap a and b without using a third variable, and return them as [b, a] in the original argument order's swapped form.",
    constraints: ["-1000000000 <= a, b <= 1000000000"],
    examples: [
      { input: "a = 4, b = 9", output: "[9, 4]" },
      { input: "a = 5, b = 5", output: "[5, 5]" },
    ],
    signature: "vector<long long> swapNumbers(long long a, long long b)",
    functionName: "swapNumbers",
    driver: numbersOut("sol.swapNumbers(in[\"a\"].asInt(), in[\"b\"].asInt())"),
    method: `vector<long long> swapNumbers(long long a, long long b) {
        a ^= b;
        b ^= a;
        a ^= b;
        return {a, b};
    }`,
    expectedTime: "O(1)",
    expectedSpace: "O(1)",
    hints: [
      "XOR stores the difference of two bit patterns. Applying it again brings the other value back.",
      "Set a to a XOR b. Then b XOR that result is the old a. Then a XOR the new b is the old b.",
      "The three assignments are a ^= b, b ^= a, a ^= b.",
      "Equal values stay equal, because x XOR x is 0 and XORing 0 changes nothing. The two variables must be distinct storage; these are two parameters, so that holds.",
    ],
    tests: [
      { input: { a: 4, b: 9 }, expectedOutput: [9, 4], visibility: "SAMPLE" },
      { input: { a: 5, b: 5 }, expectedOutput: [5, 5], visibility: "SAMPLE" },
      { input: { a: 0, b: -3 }, expectedOutput: [-3, 0], visibility: "HIDDEN" },
      { input: { a: -8, b: 2 }, expectedOutput: [2, -8], visibility: "HIDDEN" },
    ],
  }),
  problem({
    slug: "bit-divide",
    title: "Divide Two Integers",
    difficulty: "MEDIUM",
    topics: ["bit-manipulation"],
    tags: ["bits"],
    statement:
      "Divide dividend by divisor without using multiplication, division, or modulo. Truncate the quotient toward zero. divisor is never 0. If the true quotient is outside the 32-bit signed range, return 2147483647.",
    constraints: ["-2147483648 <= dividend, divisor <= 2147483647", "divisor != 0"],
    examples: [
      { input: "dividend = 10, divisor = 3", output: "3" },
      { input: "dividend = 7, divisor = -3", output: "-2" },
    ],
    signature: "int divideIntegers(int dividend, int divisor)",
    functionName: "divideIntegers",
    driver: `printJson(Json::number(sol.divideIntegers((int)in["dividend"].asInt(), (int)in["divisor"].asInt())));`,
    method: `int divideIntegers(int dividend, int divisor) {
        if (dividend == -2147483648 && divisor == -1) return 2147483647;
        long long magnitude = llabs((long long)dividend);
        long long step = llabs((long long)divisor);
        long long quotient = 0;
        for (int bit = 31; bit >= 0; bit--) {
            if ((magnitude >> bit) >= step) {
                magnitude -= step << bit;
                quotient += 1LL << bit;
            }
        }
        bool negative = (dividend < 0) != (divisor < 0);
        return (int)(negative ? -quotient : quotient);
    }`,
    expectedTime: "O(1)",
    expectedSpace: "O(1)",
    hints: [
      "Subtracting the divisor one copy at a time is too slow. Subtract the largest shifted copy that still fits.",
      "Work with absolute values in 64-bit integers. The sign of the quotient is negative when the signs differ.",
      "From bit 31 downward, if the dividend shifted down is at least the divisor, subtract divisor << bit and add that power of two to the quotient.",
      "The only 32-bit overflow is the most negative int divided by -1. Return the maximum 32-bit int for that case. Truncation toward zero is what the positive magnitude already gives you before you restore the sign.",
    ],
    tests: [
      { input: { dividend: 10, divisor: 3 }, expectedOutput: 3, visibility: "SAMPLE" },
      { input: { dividend: 7, divisor: -3 }, expectedOutput: -2, visibility: "SAMPLE" },
      { input: { dividend: -7, divisor: 3 }, expectedOutput: -2, visibility: "HIDDEN" },
      { input: { dividend: 1, divisor: 1 }, expectedOutput: 1, visibility: "HIDDEN" },
      { input: { dividend: -2147483648, divisor: -1 }, expectedOutput: 2147483647, visibility: "HIDDEN" },
      { input: { dividend: -2147483648, divisor: 2 }, expectedOutput: -1073741824, visibility: "HIDDEN" },
    ],
  }),
  problem({
    slug: "bit-flips",
    title: "Minimum Bit Flips to Convert Number",
    difficulty: "MEDIUM",
    topics: ["bit-manipulation"],
    tags: ["bits"],
    statement: "Return how many bits must flip to turn start into goal. Both numbers are non-negative.",
    constraints: ["0 <= start, goal <= 1000000000"],
    examples: [
      { input: "start = 10, goal = 7", output: "3" },
      { input: "start = 3, goal = 4", output: "3" },
    ],
    signature: "int minBitFlips(int start, int goal)",
    functionName: "minBitFlips",
    driver: `printJson(Json::number(sol.minBitFlips((int)in["start"].asInt(), (int)in["goal"].asInt())));`,
    method: `int minBitFlips(int start, int goal) {
        int different = start ^ goal;
        int flips = 0;
        while (different) {
            different &= different - 1;
            flips++;
        }
        return flips;
    }`,
    expectedTime: "O(1)",
    expectedSpace: "O(1)",
    hints: [
      "A bit needs to flip exactly where the two numbers disagree.",
      "XOR is 1 in the positions that differ. Count those 1 bits.",
      "Clear the lowest set bit of the XOR with AND against one less than itself, and count how many times you do it.",
      "Identical numbers XOR to 0, so the answer is 0. The width is fixed, so the count is constant time.",
    ],
    tests: [
      { input: { start: 10, goal: 7 }, expectedOutput: 3, visibility: "SAMPLE" },
      { input: { start: 3, goal: 4 }, expectedOutput: 3, visibility: "SAMPLE" },
      { input: { start: 0, goal: 0 }, expectedOutput: 0, visibility: "HIDDEN" },
      { input: { start: 1, goal: 0 }, expectedOutput: 1, visibility: "HIDDEN" },
      { input: { start: 15, goal: 15 }, expectedOutput: 0, visibility: "HIDDEN" },
    ],
  }),
  problem({
    slug: "bit-subsets",
    title: "Power Set using Bit Manipulation",
    difficulty: "MEDIUM",
    topics: ["bit-manipulation"],
    tags: ["bits"],
    statement:
      "Return every subset of a list of distinct integers, including the empty subset. Inside each subset, keep values in the order they appear in the input. Build the subsets from bit masks. The order of the subsets does not matter.",
    constraints: ["0 <= nums length <= 16", "-1000 <= value <= 1000", "values are distinct"],
    examples: [
      { input: "nums = [1, 2]", output: "[[], [1], [2], [1, 2]]" },
      { input: "nums = []", output: "[[]]" },
    ],
    signature: "vector<vector<int>> bitSubsets(vector<int>& nums)",
    functionName: "bitSubsets",
    driver: `auto nums = in["nums"].asIntVector();\n    auto rows = sol.bitSubsets(nums);\n    Json out;\n    out.type = Json::ARR;\n    for (const auto& row : rows) out.a.push_back(Json::ints(row));\n    printJson(out);`,
    method: `vector<vector<int>> bitSubsets(vector<int>& nums) {
        int n = (int)nums.size();
        vector<vector<int>> answers;
        int masks = 1 << n;
        for (int mask = 0; mask < masks; mask++) {
            vector<int> subset;
            for (int bit = 0; bit < n; bit++) {
                if (mask & (1 << bit)) subset.push_back(nums[bit]);
            }
            answers.push_back(subset);
        }
        return answers;
    }`,
    compareMode: "UNORDERED",
    expectedTime: "O(n * 2^n)",
    expectedSpace: "O(n)",
    hints: [
      "Each element is in or out, so the subsets correspond to the integers from 0 through 2^n - 1.",
      "Bit i of a mask says whether nums[i] belongs in that subset.",
      "For every mask, walk the bits from low to high and append the values whose bits are set. That keeps input order.",
      "Mask 0 is the empty subset. n is at most 16 so the mask fits in a 32-bit integer. An empty input has one mask and one empty subset.",
    ],
    tests: [
      { input: { nums: [1, 2] }, expectedOutput: [[], [1], [2], [1, 2]], visibility: "SAMPLE" },
      { input: { nums: [] }, expectedOutput: [[]], visibility: "SAMPLE" },
      { input: { nums: [4] }, expectedOutput: [[], [4]], visibility: "HIDDEN" },
      { input: { nums: [3, 1, 2] }, expectedOutput: [[], [3], [1], [2], [3, 1], [3, 2], [1, 2], [3, 1, 2]], visibility: "HIDDEN" },
    ],
  }),
  problem({
    slug: "range-xor",
    title: "XOR of Numbers in a Range",
    difficulty: "MEDIUM",
    topics: ["bit-manipulation"],
    tags: ["bits"],
    statement: "Return the XOR of every integer from left through right, inclusive. left may be 0.",
    constraints: ["0 <= left <= right <= 1000000000000"],
    examples: [
      { input: "left = 1, right = 5", output: "1" },
      { input: "left = 4, right = 7", output: "0" },
    ],
    signature: "long long rangeXor(long long left, long long right)",
    functionName: "rangeXor",
    driver: `printJson(Json::number(sol.rangeXor(in["left"].asInt(), in["right"].asInt())));`,
    method: `long long rangeXor(long long left, long long right) {
        auto prefix = [](long long n) -> long long {
            if (n < 0) return 0;
            if (n % 4 == 0) return n;
            if (n % 4 == 1) return 1;
            if (n % 4 == 2) return n + 1;
            return 0;
        };
        return prefix(right) ^ prefix(left - 1);
    }`,
    expectedTime: "O(1)",
    expectedSpace: "O(1)",
    hints: [
      "XORing a long interval one number at a time will not finish. The XOR of 1 through n repeats a pattern every four numbers.",
      "If n modulo 4 is 0, the prefix XOR is n. If it is 1, the prefix is 1. If it is 2, the prefix is n + 1. If it is 3, the prefix is 0.",
      "The XOR from left through right is the prefix through right, XOR the prefix through left - 1. Treat a negative end as 0 so a range that starts at 0 still works.",
      "A single number is its own XOR, which the formula covers when left and right are equal. The four-case prefix is the whole algorithm.",
    ],
    tests: [
      { input: { left: 1, right: 5 }, expectedOutput: 1, visibility: "SAMPLE" },
      { input: { left: 4, right: 7 }, expectedOutput: 0, visibility: "SAMPLE" },
      { input: { left: 0, right: 0 }, expectedOutput: 0, visibility: "HIDDEN" },
      { input: { left: 3, right: 3 }, expectedOutput: 3, visibility: "HIDDEN" },
      { input: { left: 2, right: 1000000000 }, expectedOutput: 1000000001, visibility: "HIDDEN" },
      { input: { left: 1, right: 1000000000000 }, expectedOutput: 1000000000000, visibility: "HIDDEN" },
    ],
  }),
  problem({
    slug: "two-singles",
    title: "Single Number III",
    difficulty: "MEDIUM",
    topics: ["bit-manipulation"],
    tags: ["bits"],
    statement:
      "Every value appears twice, except two values that each appear once. Return those two values. Their order does not matter.",
    constraints: ["2 <= values length <= 10000", "length is even", "-1000000000 <= value <= 1000000000", "exactly two values appear once and every other value appears twice"],
    examples: [
      { input: "values = [1, 2, 1, 3, 2, 5]", output: "[3, 5]" },
      { input: "values = [4, 8]", output: "[4, 8]" },
    ],
    signature: "vector<int> twoSingles(vector<int>& values)",
    functionName: "twoSingles",
    driver: `auto values = in["values"].asIntVector();\n    printJson(Json::ints(sol.twoSingles(values)));`,
    method: `vector<int> twoSingles(vector<int>& values) {
        unsigned int mixed = 0;
        for (int value : values) mixed ^= (unsigned int)value;
        unsigned int bit = mixed & (~mixed + 1);
        unsigned int first = 0;
        unsigned int second = 0;
        for (int value : values) {
            if ((unsigned int)value & bit) first ^= (unsigned int)value;
            else second ^= (unsigned int)value;
        }
        return {(int)first, (int)second};
    }`,
    compareMode: "UNORDERED",
    expectedTime: "O(n)",
    expectedSpace: "O(1)",
    hints: [
      "XORing the whole list cancels every pair and leaves the XOR of the two singles. Those two numbers differ in at least one bit.",
      "Take any bit that is set in that XOR. It is set in one single and clear in the other.",
      "Split the list by that bit and XOR each group. Each group then has one single, so each XOR is one of the answers.",
      "Use an unsigned split so the lowest set bit is well defined even when the XOR is negative as a signed int. A frequency map also works, but it uses extra memory.",
    ],
    tests: [
      { input: { values: [1, 2, 1, 3, 2, 5] }, expectedOutput: [3, 5], visibility: "SAMPLE" },
      { input: { values: [4, 8] }, expectedOutput: [4, 8], visibility: "SAMPLE" },
      { input: { values: [-1, -1, 2, 4] }, expectedOutput: [2, 4], visibility: "HIDDEN" },
      { input: { values: [0, 7, 0, 9] }, expectedOutput: [7, 9], visibility: "HIDDEN" },
    ],
  }),
  problem({
    slug: "prime-factors",
    title: "Print Prime Factors of a Number",
    difficulty: "HARD",
    topics: ["bit-manipulation"],
    tags: ["math"],
    statement:
      "Return the prime factors of n from smallest to largest. Repeat a prime as many times as it divides n. The number 1 has no prime factors.",
    constraints: ["1 <= n <= 1000000000000"],
    examples: [
      { input: "n = 84", output: "[2, 2, 3, 7]" },
      { input: "n = 1", output: "[]" },
    ],
    signature: "vector<long long> primeFactors(long long n)",
    functionName: "primeFactors",
    driver: numbersOut("sol.primeFactors(in[\"n\"].asInt())"),
    method: `vector<long long> primeFactors(long long n) {
        vector<long long> factors;
        for (long long prime = 2; prime * prime <= n; prime += (prime == 2 ? 1 : 2)) {
            while (n % prime == 0) {
                factors.push_back(prime);
                n /= prime;
            }
        }
        if (n > 1) factors.push_back(n);
        return factors;
    }`,
    expectedTime: "O(sqrt n)",
    expectedSpace: "O(log n)",
    hints: [
      "A factor no larger than the square root is enough. Whatever remains after removing those factors is either 1 or a prime.",
      "Try 2, then the odd candidates. While a candidate divides n, record it and divide it out.",
      "Stop the loop when the candidate's square passes the remaining n. If anything greater than 1 is left, it is the last prime factor.",
      "Dividing factors out as you find them keeps later candidates prime relative to what remains. 1 never enters the loop and produces an empty list.",
    ],
    tests: [
      { input: { n: 84 }, expectedOutput: [2, 2, 3, 7], visibility: "SAMPLE" },
      { input: { n: 1 }, expectedOutput: [], visibility: "SAMPLE" },
      { input: { n: 97 }, expectedOutput: [97], visibility: "HIDDEN" },
      { input: { n: 12 }, expectedOutput: [2, 2, 3], visibility: "HIDDEN" },
      { input: { n: 1000000000000 }, expectedOutput: [2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5], visibility: "HIDDEN" },
    ],
  }),
  problem({
    slug: "all-divisors",
    title: "Divisors of a Number",
    difficulty: "EASY",
    topics: ["basics", "bit-manipulation"],
    tags: ["math"],
    statement: "Return every positive divisor of n, in increasing order. 1 and n are always included.",
    constraints: ["1 <= n <= 1000000000000"],
    examples: [
      { input: "n = 36", output: "[1, 2, 3, 4, 6, 9, 12, 18, 36]" },
      { input: "n = 7", output: "[1, 7]" },
    ],
    signature: "vector<long long> divisors(long long n)",
    functionName: "divisors",
    driver: numbersOut("sol.divisors(in[\"n\"].asInt())"),
    method: `vector<long long> divisors(long long n) {
        vector<long long> small;
        vector<long long> large;
        for (long long divisor = 1; divisor * divisor <= n; divisor++) {
            if (n % divisor != 0) continue;
            small.push_back(divisor);
            if (divisor != n / divisor) large.push_back(n / divisor);
        }
        for (int index = (int)large.size() - 1; index >= 0; index--) small.push_back(large[index]);
        return small;
    }`,
    expectedTime: "O(sqrt n)",
    expectedSpace: "O(number of divisors)",
    hints: [
      "Divisors come in pairs. If d divides n, so does n / d, and one of them is at most the square root.",
      "Walk d from 1 while d * d is still at most n. Whenever d divides n, keep both d and n / d.",
      "Store the small half in order and the large half separately, then append the large half from last to first so the full list increases.",
      "When d * d is exactly n, record d once. Checking every integer up to n is unnecessary.",
    ],
    tests: [
      { input: { n: 36 }, expectedOutput: [1, 2, 3, 4, 6, 9, 12, 18, 36], visibility: "SAMPLE" },
      { input: { n: 7 }, expectedOutput: [1, 7], visibility: "SAMPLE" },
      { input: { n: 1 }, expectedOutput: [1], visibility: "HIDDEN" },
      { input: { n: 100 }, expectedOutput: [1, 2, 4, 5, 10, 20, 25, 50, 100], visibility: "HIDDEN" },
    ],
  }),
  problem({
    slug: "prime-span",
    title: "Count Primes in a Range",
    difficulty: "HARD",
    topics: ["bit-manipulation"],
    tags: ["sieve"],
    statement:
      "Return how many prime numbers lie from left through right, inclusive. 1 is not prime. The range can sit high on the number line, but it is not wider than 1000000.",
    constraints: ["1 <= left <= right <= 1000000000000", "right - left + 1 <= 1000000"],
    examples: [
      { input: "left = 1, right = 10", output: "4" },
      { input: "left = 10, right = 20", output: "4" },
    ],
    signature: "int countPrimes(long long left, long long right)",
    functionName: "countPrimes",
    driver: `printJson(Json::number(sol.countPrimes(in["left"].asInt(), in["right"].asInt())));`,
    method: `int countPrimes(long long left, long long right) {
        long long root = std::sqrt((long double)right);
        while ((root + 1) * (root + 1) <= right) root++;
        while (root * root > right) root--;
        vector<char> mark((size_t)root + 1, 1);
        if (root >= 0) mark[0] = 0;
        if (root >= 1) mark[1] = 0;
        vector<int> primes;
        for (long long value = 2; value <= root; value++) {
            if (!mark[(size_t)value]) continue;
            primes.push_back((int)value);
            for (long long multiple = value * value; multiple <= root; multiple += value) mark[(size_t)multiple] = 0;
        }
        int span = (int)(right - left + 1);
        vector<char> inRange(span, 1);
        if (left == 1) inRange[0] = 0;
        for (int prime : primes) {
            long long start = max((long long)prime * prime, ((left + prime - 1) / prime) * (long long)prime);
            for (long long value = start; value <= right; value += prime) inRange[(size_t)(value - left)] = 0;
        }
        int count = 0;
        for (char flag : inRange) count += flag ? 1 : 0;
        return count;
    }`,
    expectedTime: "O(sqrt(right) log log sqrt(right) + span log log span)",
    expectedSpace: "O(sqrt(right) + span)",
    hints: [
      "A sieve up to right is impossible when right is around 10^12. You only need the primes up to its square root, then a sieve of the window itself.",
      "Find every prime up to floor(sqrt(right)). Allocate a flag for each number from left through right.",
      "For each small prime, start at the first multiple that is at least both left and the prime's square, and mark every later multiple inside the window.",
      "Do not mark the prime itself when it falls inside the window: starting at the prime's square avoids that. Clear 1 when the window includes it. The answer is the number of unmarked cells.",
    ],
    tests: [
      { input: { left: 1, right: 10 }, expectedOutput: 4, visibility: "SAMPLE" },
      { input: { left: 10, right: 20 }, expectedOutput: 4, visibility: "SAMPLE" },
      { input: { left: 1, right: 1 }, expectedOutput: 0, visibility: "HIDDEN" },
      { input: { left: 2, right: 2 }, expectedOutput: 1, visibility: "HIDDEN" },
      { input: { left: 8, right: 10 }, expectedOutput: 0, visibility: "HIDDEN" },
      { input: { left: 1000000000, right: 1000000100 }, expectedOutput: 7, visibility: "HIDDEN" },
      { input: { left: 999999999950, right: 1000000000000 }, expectedOutput: 3, visibility: "HIDDEN" },
    ],
  }),
  problem({
    slug: "prime-breakdown",
    title: "Prime Factorisation of a Number",
    difficulty: "HARD",
    topics: ["bit-manipulation"],
    tags: ["math"],
    statement:
      "Return the prime factorisation of n as pairs [prime, exponent], with the primes in increasing order. Each exponent is the number of times that prime divides n. The number 1 has an empty factorisation.",
    constraints: ["1 <= n <= 1000000000000"],
    examples: [
      { input: "n = 84", output: "[[2, 2], [3, 1], [7, 1]]" },
      { input: "n = 12", output: "[[2, 2], [3, 1]]" },
    ],
    signature: "vector<vector<long long>> factorise(long long n)",
    functionName: "factorise",
    driver: pairsOut("sol.factorise(in[\"n\"].asInt())"),
    method: `vector<vector<long long>> factorise(long long n) {
        vector<vector<long long>> pairs;
        for (long long prime = 2; prime * prime <= n; prime += (prime == 2 ? 1 : 2)) {
            if (n % prime != 0) continue;
            long long exponent = 0;
            while (n % prime == 0) {
                n /= prime;
                exponent++;
            }
            pairs.push_back({prime, exponent});
        }
        if (n > 1) pairs.push_back({n, 1});
        return pairs;
    }`,
    expectedTime: "O(sqrt n)",
    expectedSpace: "O(log n)",
    hints: [
      "This is the same search as listing prime factors, except identical primes collapse into a count.",
      "When a candidate divides n, count how many times it does, divide them all out, and store the pair.",
      "Move to the next candidate only after that prime is gone. If a number greater than 1 remains, its exponent is 1.",
      "Because smaller primes are removed first, a later candidate that divides the remainder is prime. 1 produces no pairs.",
    ],
    tests: [
      { input: { n: 84 }, expectedOutput: [[2, 2], [3, 1], [7, 1]], visibility: "SAMPLE" },
      { input: { n: 12 }, expectedOutput: [[2, 2], [3, 1]], visibility: "SAMPLE" },
      { input: { n: 1 }, expectedOutput: [], visibility: "HIDDEN" },
      { input: { n: 97 }, expectedOutput: [[97, 1]], visibility: "HIDDEN" },
      { input: { n: 1000000000000 }, expectedOutput: [[2, 12], [5, 12]], visibility: "HIDDEN" },
      { input: { n: 1000000007 }, expectedOutput: [[1000000007, 1]], visibility: "HIDDEN" },
    ],
  }),
];
