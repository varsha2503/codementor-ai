import { problem } from "./helpers.js";

const numbersOut = (call: string) =>
  `auto values = ${call};\n    Json out;\n    out.type = Json::ARR;\n    for (long long value : values) out.a.push_back(Json::number(value));\n    printJson(out);`;

export const stringRestProblems = [
  problem({
    slug: "outer-parentheses",
    title: "Remove Outermost Parentheses",
    difficulty: "MEDIUM",
    topics: ["strings"],
    tags: ["stack"],
    statement:
      "s is a valid parentheses string. Split it into primitive pieces, pieces that cannot be split into two shorter valid strings. Remove the outer pair of each piece and concatenate what remains.",
    constraints: ["0 <= s.length <= 100000", "s is a valid parentheses string."],
    examples: [
      { input: 's = "(()())(())"', output: '"()()()"' },
      { input: 's = "()()"', output: '""' },
    ],
    signature: "string removeOuter(string s)",
    functionName: "removeOuter",
    driver: `printJson(Json::text(sol.removeOuter(in["s"].asString())));`,
    method: `string removeOuter(string s) {
        string out;
        int balance = 0;
        for (char ch : s) {
            if (ch == '(') {
                if (balance) out.push_back(ch);
                balance++;
            } else {
                balance--;
                if (balance) out.push_back(ch);
            }
        }
        return out;
    }`,
    expectedTime: "O(n)",
    expectedSpace: "O(n)",
    hints: [
      "A primitive piece begins when the balance returns to zero.",
      "The outer parenthesis is the one that moves the balance from 0 to 1, or from 1 back to 0.",
      "Copy an opening parenthesis only when the balance was already positive. Copy a closing one only when the balance stays positive after it.",
      "One pass is enough. An empty string and a string of adjacent pairs such as ()() both become empty.",
    ],
    tests: [
      { input: { s: "(()())(())" }, expectedOutput: "()()()", visibility: "SAMPLE" },
      { input: { s: "()()" }, expectedOutput: "", visibility: "SAMPLE" },
      { input: { s: "(()())(())(()(()))" }, expectedOutput: "()()()()(())", visibility: "HIDDEN" },
      { input: { s: "" }, expectedOutput: "", visibility: "HIDDEN" },
    ],
  }),
  problem({
    slug: "frequency-sort",
    title: "Sort Characters by Frequency",
    difficulty: "EASY",
    topics: ["strings"],
    tags: ["sorting"],
    statement:
      "Return the letters of s rearranged so more frequent letters come first. When two letters have the same frequency, the earlier letter in the alphabet comes first. s is lowercase.",
    constraints: ["1 <= s.length <= 100000", "s is lowercase letters."],
    examples: [
      { input: 's = "tree"', output: '"eert"' },
      { input: 's = "cccaaa"', output: '"aaaccc"' },
    ],
    signature: "string frequencySort(string s)",
    functionName: "frequencySort",
    driver: `printJson(Json::text(sol.frequencySort(in["s"].asString())));`,
    method: `string frequencySort(string s) {
        int freq[26] = {};
        for (char ch : s) freq[ch - 'a']++;
        vector<char> letters(26);
        iota(letters.begin(), letters.end(), 'a');
        sort(letters.begin(), letters.end(), [&](char a, char b) {
            if (freq[a - 'a'] != freq[b - 'a']) return freq[a - 'a'] > freq[b - 'a'];
            return a < b;
        });
        string out;
        for (char ch : letters) out.append(freq[ch - 'a'], ch);
        return out;
    }`,
    expectedTime: "O(n)",
    expectedSpace: "O(1)",
    hints: [
      "Count the 26 letters first. The order of the original string does not matter after that.",
      "Sort the letters by frequency descending, and by the letter itself when the frequencies match.",
      "Append each letter as many times as it occurred.",
      "Letters that never appear append nothing. There are only 26 letters, so the sort is constant beside the linear count.",
    ],
    tests: [
      { input: { s: "tree" }, expectedOutput: "eert", visibility: "SAMPLE" },
      { input: { s: "cccaaa" }, expectedOutput: "aaaccc", visibility: "SAMPLE" },
      { input: { s: "a" }, expectedOutput: "a", visibility: "HIDDEN" },
      { input: { s: "bba" }, expectedOutput: "bba", visibility: "HIDDEN" },
    ],
  }),
  problem({
    slug: "roman-integer",
    title: "Roman to Integer",
    difficulty: "MEDIUM",
    topics: ["strings"],
    tags: ["string"],
    statement:
      "Convert a valid Roman numeral to an integer. The symbols are I 1, V 5, X 10, L 50, C 100, D 500, and M 1000. A smaller symbol written immediately before a larger one is subtracted instead of added.",
    constraints: ["s is a valid Roman numeral from 1 through 3999."],
    examples: [
      { input: 's = "III"', output: "3" },
      { input: 's = "MCMXCIV"', output: "1994" },
    ],
    signature: "int romanToInt(string s)",
    functionName: "romanToInt",
    driver: `printJson(Json::number(sol.romanToInt(in["s"].asString())));`,
    method: `int romanToInt(string s) {
        auto value = [](char ch) {
            if (ch == 'I') return 1;
            if (ch == 'V') return 5;
            if (ch == 'X') return 10;
            if (ch == 'L') return 50;
            if (ch == 'C') return 100;
            if (ch == 'D') return 500;
            return 1000;
        };
        int total = 0;
        for (int i = 0; i < (int)s.size(); i++) {
            int current = value(s[i]);
            if (i + 1 < (int)s.size() && current < value(s[i + 1])) total -= current;
            else total += current;
        }
        return total;
    }`,
    expectedTime: "O(n)",
    expectedSpace: "O(1)",
    hints: [
      "Most symbols add their value. The six subtractive pairs are the exception: IV, IX, XL, XC, CD, and CM.",
      "You do not need to special-case each pair. Compare each symbol with the one after it.",
      "If the next symbol is larger, subtract the current value. Otherwise add it.",
      "The last symbol always adds. A left-to-right scan produces the integer.",
    ],
    tests: [
      { input: { s: "III" }, expectedOutput: 3, visibility: "SAMPLE" },
      { input: { s: "MCMXCIV" }, expectedOutput: 1994, visibility: "SAMPLE" },
      { input: { s: "LVIII" }, expectedOutput: 58, visibility: "HIDDEN" },
      { input: { s: "IX" }, expectedOutput: 9, visibility: "HIDDEN" },
    ],
  }),
  problem({
    slug: "count-k-substrings",
    title: "Count Number of Substrings",
    difficulty: "MEDIUM",
    topics: ["strings"],
    tags: ["sliding-window"],
    statement: "s is lowercase. Return how many contiguous substrings contain exactly k different letters.",
    constraints: ["1 <= s.length <= 100000", "1 <= k <= 26"],
    examples: [
      { input: 's = "aba", k = 2', output: "3", explanation: "The substrings are ab, ba, and aba." },
      { input: 's = "abc", k = 3', output: "1" },
    ],
    signature: "long long countKSubstrings(string s, int k)",
    functionName: "countKSubstrings",
    driver: `printJson(Json::number(sol.countKSubstrings(in["s"].asString(), (int)in["k"].asInt())));`,
    method: `long long countKSubstrings(string s, int k) {
        auto atMost = [&](int limit) {
            if (limit < 0) return 0LL;
            int freq[26] = {}, distinct = 0, left = 0;
            long long ways = 0;
            for (int right = 0; right < (int)s.size(); right++) {
                if (freq[s[right] - 'a']++ == 0) distinct++;
                while (distinct > limit) {
                    if (--freq[s[left] - 'a'] == 0) distinct--;
                    left++;
                }
                ways += right - left + 1;
            }
            return ways;
        };
        return atMost(k) - atMost(k - 1);
    }`,
    expectedTime: "O(n)",
    expectedSpace: "O(1)",
    hints: [
      "Exactly k is easier as at most k minus at most k - 1.",
      "A window's substrings that end at its right edge and stay inside the window number right - left + 1.",
      "Grow the right edge and count letters. While the window has too many distinct letters, shrink the left edge.",
      "Run that count twice. The answer can exceed a 32-bit integer when the string is long.",
    ],
    tests: [
      { input: { s: "aba", k: 2 }, expectedOutput: 3, visibility: "SAMPLE" },
      { input: { s: "abc", k: 3 }, expectedOutput: 1, visibility: "SAMPLE" },
      { input: { s: "aba", k: 1 }, expectedOutput: 3, visibility: "HIDDEN" },
      { input: { s: "aaaa", k: 1 }, expectedOutput: 10, visibility: "HIDDEN" },
    ],
  }),
  problem({
    slug: "beauty-sum",
    title: "Sum of Beauty of All Substrings",
    difficulty: "MEDIUM",
    topics: ["strings"],
    tags: ["string"],
    statement:
      "The beauty of a substring is the highest letter frequency in it minus the lowest frequency among letters that actually appear. Return the sum of beauty over every substring. s is lowercase.",
    constraints: ["1 <= s.length <= 400"],
    examples: [
      { input: 's = "aabcb"', output: "5" },
      { input: 's = "a"', output: "0" },
    ],
    signature: "int beautySum(string s)",
    functionName: "beautySum",
    driver: `printJson(Json::number(sol.beautySum(in["s"].asString())));`,
    method: `int beautySum(string s) {
        int n = (int)s.size(), total = 0;
        for (int i = 0; i < n; i++) {
            int freq[26] = {};
            for (int j = i; j < n; j++) {
                freq[s[j] - 'a']++;
                int high = 0, low = n + 1;
                for (int f : freq) if (f) { high = max(high, f); low = min(low, f); }
                total += high - low;
            }
        }
        return total;
    }`,
    expectedTime: "O(n^2 * 26)",
    expectedSpace: "O(1)",
    hints: [
      "Beauty ignores letters that do not appear. A one-letter substring has beauty 0.",
      "Every substring is a start index plus an end index. There are not many, because n is at most 400.",
      "For a fixed start, extend the end one letter at a time and keep 26 counters.",
      "After each extension, the beauty is the largest positive counter minus the smallest positive counter. Add it to the total.",
    ],
    tests: [
      { input: { s: "aabcb" }, expectedOutput: 5, visibility: "SAMPLE" },
      { input: { s: "a" }, expectedOutput: 0, visibility: "SAMPLE" },
      { input: { s: "aba" }, expectedOutput: 1, visibility: "HIDDEN" },
      { input: { s: "abc" }, expectedOutput: 0, visibility: "HIDDEN" },
    ],
  }),
  problem({
    slug: "reverse-each-word",
    title: "Reverse Every Word in a String",
    difficulty: "MEDIUM",
    topics: ["strings"],
    tags: ["two-pointers"],
    statement:
      "Reverse the letters inside each word. Leave the words in their original order and leave every space where it is, including repeated spaces. The line contains lowercase letters and spaces.",
    constraints: ["0 <= line.length <= 10000"],
    examples: [
      { input: 'line = "hello world"', output: '"olleh dlrow"' },
      { input: 'line = "ab  cd"', output: '"ba  dc"' },
    ],
    signature: "string reverseEachWord(string line)",
    functionName: "reverseEachWord",
    driver: `printJson(Json::text(sol.reverseEachWord(in["line"].asString())));`,
    method: `string reverseEachWord(string line) {
        int n = (int)line.size(), i = 0;
        while (i < n) {
            if (line[i] == ' ') { i++; continue; }
            int j = i;
            while (j < n && line[j] != ' ') j++;
            reverse(line.begin() + i, line.begin() + j);
            i = j;
        }
        return line;
    }`,
    expectedTime: "O(n)",
    expectedSpace: "O(1)",
    hints: [
      "The words do not change places. Only the spelling of each word is reversed.",
      "A word is a maximal run of letters between spaces.",
      "Find the start and end of each run and reverse that slice in place. Spaces are skipped.",
      "Leading, trailing, and repeated spaces stay put because they are never inside a reversed slice.",
    ],
    tests: [
      { input: { line: "hello world" }, expectedOutput: "olleh dlrow", visibility: "SAMPLE" },
      { input: { line: "ab  cd" }, expectedOutput: "ba  dc", visibility: "SAMPLE" },
      { input: { line: "a" }, expectedOutput: "a", visibility: "HIDDEN" },
      { input: { line: "" }, expectedOutput: "", visibility: "HIDDEN" },
    ],
  }),
  problem({
    slug: "bracket-reversals",
    title: "Minimum Bracket Reversals",
    difficulty: "HARD",
    topics: ["strings"],
    tags: ["stack"],
    statement:
      "expression contains only the braces { and }. One move reverses a single brace, turning { into } or } into {. Return the fewest moves that make the expression balanced. Return -1 when the length is odd, because an odd-length string can never balance.",
    constraints: ["1 <= expression.length <= 100000", "expression contains only { and }."],
    examples: [
      { input: 'expression = "}{"', output: "2" },
      { input: 'expression = "{"', output: "-1" },
    ],
    signature: "int bracketReversals(string expression)",
    functionName: "bracketReversals",
    driver: `printJson(Json::number(sol.bracketReversals(in["expression"].asString())));`,
    method: `int bracketReversals(string expression) {
        if (expression.size() % 2) return -1;
        int open = 0, close = 0;
        for (char ch : expression) {
            if (ch == '{') open++;
            else if (open) open--;
            else close++;
        }
        return (open + 1) / 2 + (close + 1) / 2;
    }`,
    expectedTime: "O(n)",
    expectedSpace: "O(1)",
    hints: [
      "Balanced pairs can be removed. Only a leftover shape such as }}}{{{ still needs reversals.",
      "An odd length is impossible. Return -1 before counting.",
      "Scan left to right. An opening brace increases the unmatched-open count. A closing brace cancels an open brace, or becomes an unmatched close when none is open.",
      "Two unmatched opens become one reversal of the second into a close, and the same is true of closes. Round each leftover count up by using (count + 1) / 2 and add them.",
    ],
    tests: [
      { input: { expression: "}{" }, expectedOutput: 2, visibility: "SAMPLE" },
      { input: { expression: "{" }, expectedOutput: -1, visibility: "SAMPLE" },
      { input: { expression: "{{" }, expectedOutput: 1, visibility: "HIDDEN" },
      { input: { expression: "{}" }, expectedOutput: 0, visibility: "HIDDEN" },
    ],
  }),
  problem({
    slug: "count-and-say",
    title: "Count and Say",
    difficulty: "MEDIUM",
    topics: ["strings"],
    tags: ["string"],
    statement:
      'The count-and-say sequence starts with "1". Each later term describes the previous term by counts of consecutive digits. Return the nth term, with n starting at 1.',
    constraints: ["1 <= n <= 30"],
    examples: [
      { input: "n = 1", output: '"1"' },
      { input: "n = 4", output: '"1211"' },
    ],
    signature: "string countAndSay(int n)",
    functionName: "countAndSay",
    driver: `printJson(Json::text(sol.countAndSay((int)in["n"].asInt())));`,
    method: `string countAndSay(int n) {
        string term = "1";
        for (int step = 1; step < n; step++) {
            string next;
            for (int i = 0; i < (int)term.size();) {
                int j = i;
                while (j < (int)term.size() && term[j] == term[i]) j++;
                next.push_back(char('0' + (j - i)));
                next.push_back(term[i]);
                i = j;
            }
            term.swap(next);
        }
        return term;
    }`,
    expectedTime: "O(length of the nth term)",
    expectedSpace: "O(length of the nth term)",
    hints: [
      "Read the previous term in runs of the same digit.",
      "A run of three 1s is spoken as 31: the count, then the digit.",
      "Start from \"1\" and build the next term n - 1 times.",
      "A run in this sequence is shorter than 10 for n up to 30, so the count is a single digit. Swap into the next term instead of copying twice.",
    ],
    tests: [
      { input: { n: 1 }, expectedOutput: "1", visibility: "SAMPLE" },
      { input: { n: 4 }, expectedOutput: "1211", visibility: "SAMPLE" },
      { input: { n: 5 }, expectedOutput: "111221", visibility: "HIDDEN" },
      { input: { n: 6 }, expectedOutput: "312211", visibility: "HIDDEN" },
    ],
  }),
  problem({
    slug: "rabin-karp",
    title: "Rabin Karp",
    difficulty: "HARD",
    topics: ["strings"],
    tags: ["hashing"],
    statement:
      "Return every starting index where pattern occurs in text, in increasing order. Overlapping occurrences count. Both strings are lowercase. Return an empty list when the pattern does not occur.",
    constraints: ["0 <= text.length <= 100000", "1 <= pattern.length <= 100000", "Both strings are lowercase."],
    examples: [
      { input: 'text = "aabaacaadaabaaba", pattern = "aaba"', output: "[0, 9, 12]" },
      { input: 'text = "abc", pattern = "d"', output: "[]" },
    ],
    signature: "vector<int> rabinKarp(string text, string pattern)",
    functionName: "rabinKarp",
    driver: `auto indexes = sol.rabinKarp(in["text"].asString(), in["pattern"].asString());\n    ${numbersOut("indexes")}`,
    method: `vector<int> rabinKarp(string text, string pattern) {
        int n = (int)text.size(), m = (int)pattern.size();
        if (m > n) return {};
        const long long mod1 = 1000000007, mod2 = 1000000009, base = 911382323;
        long long pat1 = 0, pat2 = 0, win1 = 0, win2 = 0, pow1 = 1, pow2 = 1;
        for (int i = 0; i < m; i++) {
            pat1 = (pat1 * base + pattern[i]) % mod1;
            pat2 = (pat2 * base + pattern[i]) % mod2;
            win1 = (win1 * base + text[i]) % mod1;
            win2 = (win2 * base + text[i]) % mod2;
            if (i) { pow1 = pow1 * base % mod1; pow2 = pow2 * base % mod2; }
        }
        auto same = [&](int start) {
            for (int j = 0; j < m; j++) if (text[start + j] != pattern[j]) return false;
            return true;
        };
        vector<int> indexes;
        if (win1 == pat1 && win2 == pat2 && same(0)) indexes.push_back(0);
        for (int i = m; i < n; i++) {
            win1 = (win1 - text[i - m] * pow1) % mod1;
            if (win1 < 0) win1 += mod1;
            win1 = (win1 * base + text[i]) % mod1;
            win2 = (win2 - text[i - m] * pow2) % mod2;
            if (win2 < 0) win2 += mod2;
            win2 = (win2 * base + text[i]) % mod2;
            if (win1 == pat1 && win2 == pat2 && same(i - m + 1)) indexes.push_back(i - m + 1);
        }
        return indexes;
    }`,
    expectedTime: "O(n + m + matches * m)",
    expectedSpace: "O(1)",
    hints: [
      "A rolling hash turns a window of the text into a number so most windows can be rejected without a letter-by-letter compare.",
      "Use two moduli. A single modulus can collide, and a collision must still be checked against the real pattern.",
      "The next window drops the outgoing letter, multiplies by the base, and adds the incoming letter. Keep the power base^(m - 1) for the outgoing letter.",
      "Record the start index only when both hashes match and the characters match. Advance the window by one so overlapping copies are found. Normalize a negative remainder before continuing.",
    ],
    tests: [
      { input: { text: "aabaacaadaabaaba", pattern: "aaba" }, expectedOutput: [0, 9, 12], visibility: "SAMPLE" },
      { input: { text: "abc", pattern: "d" }, expectedOutput: [], visibility: "SAMPLE" },
      { input: { text: "hello", pattern: "ll" }, expectedOutput: [2], visibility: "HIDDEN" },
      { input: { text: "aaaa", pattern: "aa" }, expectedOutput: [0, 1, 2], visibility: "HIDDEN" },
    ],
  }),
  problem({
    slug: "z-function",
    title: "Z-Function",
    difficulty: "HARD",
    topics: ["strings"],
    tags: ["string"],
    statement:
      "Return the Z-array of s. z[i] is the length of the longest substring starting at i that is also a prefix of s. z[0] is 0. s is lowercase.",
    constraints: ["1 <= s.length <= 100000"],
    examples: [
      { input: 's = "aabaab"', output: "[0, 1, 0, 3, 1, 0]" },
      { input: 's = "abc"', output: "[0, 0, 0]" },
    ],
    signature: "vector<int> zFunction(string s)",
    functionName: "zFunction",
    driver: `${numbersOut('sol.zFunction(in["s"].asString())')}`,
    method: `vector<int> zFunction(string s) {
        int n = (int)s.size();
        vector<int> z(n);
        int left = 0, right = 0;
        for (int i = 1; i < n; i++) {
            if (i < right) z[i] = min(right - i, z[i - left]);
            while (i + z[i] < n && s[z[i]] == s[i + z[i]]) z[i]++;
            if (i + z[i] > right) { left = i; right = i + z[i]; }
        }
        return z;
    }`,
    expectedTime: "O(n)",
    expectedSpace: "O(n)",
    hints: [
      "z[i] compares s[i...] with s[0...]. Doing that naively from every i is quadratic.",
      "Keep the rightmost segment [left, right) that is already known to match a prefix.",
      "If i is inside that segment, z[i] is at least the same as the corresponding earlier position, but it cannot claim characters past right.",
      "Extend explicitly from that guess. When the match passes right, move the segment. Each character is extended a constant number of times, so the scan is linear. z[0] stays 0.",
    ],
    tests: [
      { input: { s: "aabaab" }, expectedOutput: [0, 1, 0, 3, 1, 0], visibility: "SAMPLE" },
      { input: { s: "abc" }, expectedOutput: [0, 0, 0], visibility: "SAMPLE" },
      { input: { s: "aaaa" }, expectedOutput: [0, 3, 2, 1], visibility: "HIDDEN" },
      { input: { s: "a" }, expectedOutput: [0], visibility: "HIDDEN" },
    ],
  }),
  problem({
    slug: "longest-happy-prefix",
    title: "Longest Happy Prefix",
    difficulty: "HARD",
    topics: ["strings"],
    tags: ["kmp"],
    statement:
      "A happy prefix is a proper prefix of s that is also a suffix. Return the longest one. Return an empty string when none exists. s is lowercase.",
    constraints: ["0 <= s.length <= 100000"],
    examples: [
      { input: 's = "ababab"', output: '"abab"' },
      { input: 's = "abc"', output: '""' },
    ],
    signature: "string happyPrefix(string s)",
    functionName: "happyPrefix",
    driver: `printJson(Json::text(sol.happyPrefix(in["s"].asString())));`,
    method: `string happyPrefix(string s) {
        int n = (int)s.size();
        if (n == 0) return "";
        vector<int> border(n);
        int length = 0;
        for (int i = 1; i < n; i++) {
            while (length && s[i] != s[length]) length = border[length - 1];
            if (s[i] == s[length]) length++;
            border[i] = length;
        }
        return s.substr(0, border[n - 1]);
    }`,
    expectedTime: "O(n)",
    expectedSpace: "O(n)",
    hints: [
      "The longest happy prefix is the last entry of the prefix table used by string search.",
      "border[i] is the longest proper prefix of s[0..i] that is also a suffix of that slice.",
      "When the next letter continues the current border, grow it. When it does not, fall back to the border of the current border.",
      "The answer is the prefix of that final length. A length of 0, and an empty word, both return an empty string. The border is proper, so it is never the whole word.",
    ],
    tests: [
      { input: { s: "ababab" }, expectedOutput: "abab", visibility: "SAMPLE" },
      { input: { s: "abc" }, expectedOutput: "", visibility: "SAMPLE" },
      { input: { s: "level" }, expectedOutput: "l", visibility: "HIDDEN" },
      { input: { s: "aaaa" }, expectedOutput: "aaa", visibility: "HIDDEN" },
    ],
  }),
  problem({
    slug: "palindromic-subsequences",
    title: "Count Palindromic Subsequences",
    difficulty: "MEDIUM",
    topics: ["strings"],
    tags: ["dynamic-programming"],
    statement:
      "Return how many non-empty subsequences of s are palindromes, modulo 1000000007. Different index sets count separately even when their letters match. s is lowercase.",
    constraints: ["1 <= s.length <= 400"],
    examples: [
      { input: 's = "aba"', output: "5" },
      { input: 's = "abcd"', output: "4" },
    ],
    signature: "int countPalindromic(string s)",
    functionName: "countPalindromic",
    driver: `printJson(Json::number(sol.countPalindromic(in["s"].asString())));`,
    method: `int countPalindromic(string s) {
        const int mod = 1000000007;
        int n = (int)s.size();
        vector<vector<int>> ways(n, vector<int>(n));
        for (int i = 0; i < n; i++) ways[i][i] = 1;
        for (int length = 2; length <= n; length++) {
            for (int i = 0; i + length <= n; i++) {
                int j = i + length - 1;
                if (s[i] == s[j]) ways[i][j] = (ways[i + 1][j] + (long long)ways[i][j - 1] + 1) % mod;
                else {
                    int value = (ways[i + 1][j] + ways[i][j - 1] - (i + 1 <= j - 1 ? ways[i + 1][j - 1] : 0)) % mod;
                    if (value < 0) value += mod;
                    ways[i][j] = value;
                }
            }
        }
        return ways[0][n - 1];
    }`,
    expectedTime: "O(n^2)",
    expectedSpace: "O(n^2)",
    hints: [
      "A single letter is a palindromic subsequence. Count index sets, not distinct spellings.",
      "Let ways[i][j] be the count inside the slice from i through j.",
      "When the ends match, every palindrome in either side remains, and the two ends wrap one new palindrome around each palindrome strictly inside, plus the two-letter pair itself. That simplifies to the two sides plus one.",
      "When the ends differ, add the two sides and subtract the overlap so it is not counted twice. Take the result modulo 1000000007, and add the modulus back after a subtraction.",
    ],
    tests: [
      { input: { s: "aba" }, expectedOutput: 5, visibility: "SAMPLE" },
      { input: { s: "abcd" }, expectedOutput: 4, visibility: "SAMPLE" },
      { input: { s: "aa" }, expectedOutput: 3, visibility: "HIDDEN" },
      { input: { s: "aaa" }, expectedOutput: 7, visibility: "HIDDEN" },
    ],
  }),
];
