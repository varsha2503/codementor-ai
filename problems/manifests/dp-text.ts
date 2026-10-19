import { problem } from "./helpers.js";

export const dpTextProblems = [
  problem({
    slug: "longest-common-subsequence",
    title: "Longest Common Subsequence",
    difficulty: "HARD",
    topics: ["dynamic-programming"],
    tags: ["dp"],
    statement:
      "A subsequence keeps the relative order of characters but may skip some. Return the length of the longest subsequence shared by a and b.",
    constraints: ["1 <= a.length, b.length <= 500", "a and b are lowercase."],
    examples: [
      { input: 'a = "abcde", b = "ace"', output: "3" },
      { input: 'a = "abc", b = "def"', output: "0" },
    ],
    signature: "int longestCommonSubsequence(string a, string b)",
    functionName: "longestCommonSubsequence",
    driver: `printJson(Json::number(sol.longestCommonSubsequence(in["a"].asString(), in["b"].asString())));`,
    method: `int longestCommonSubsequence(string a, string b) {
        int n = (int)a.size(), m = (int)b.size();
        vector<int> dp(m + 1);
        for (int i = 1; i <= n; i++) {
            int previous = 0;
            for (int j = 1; j <= m; j++) {
                int saved = dp[j];
                dp[j] = a[i - 1] == b[j - 1] ? previous + 1 : max(dp[j], dp[j - 1]);
                previous = saved;
            }
        }
        return dp[m];
    }`,
    expectedTime: "O(n * m)",
    expectedSpace: "O(m)",
    hints: [
      "The longest shared subsequence of two prefixes depends on the prefixes that are one character shorter.",
      "When the current characters match, they can extend the answer of the prefixes before them.",
      "When they differ, skip a character from one string or the other and keep the longer result.",
      "One row of prefix lengths is enough if you remember the diagonal value. Two strings with no shared letter have length 0.",
    ],
    tests: [
      { input: { a: "abcde", b: "ace" }, expectedOutput: 3, visibility: "SAMPLE" },
      { input: { a: "abc", b: "def" }, expectedOutput: 0, visibility: "SAMPLE" },
      { input: { a: "a", b: "a" }, expectedOutput: 1, visibility: "HIDDEN" },
      { input: { a: "abac", b: "cab" }, expectedOutput: 2, visibility: "HIDDEN" },
    ],
  }),
  problem({
    slug: "print-lcs",
    title: "Print Longest Common Subsequence",
    difficulty: "HARD",
    topics: ["dynamic-programming"],
    tags: ["dp"],
    statement:
      "Return a longest common subsequence of a and b. If several subsequences share that length, return the lexicographically smallest one. Return an empty string when the strings share nothing.",
    constraints: ["1 <= a.length, b.length <= 500", "a and b are lowercase."],
    examples: [
      { input: 'a = "abcde", b = "ace"', output: '"ace"' },
      { input: 'a = "abac", b = "cab"', output: '"ab"' },
    ],
    signature: "string printLcs(string a, string b)",
    functionName: "printLcs",
    driver: `printJson(Json::text(sol.printLcs(in["a"].asString(), in["b"].asString())));`,
    method: `string printLcs(string a, string b) {
        int n = (int)a.size(), m = (int)b.size();
        vector<vector<int>> dp(n + 1, vector<int>(m + 1));
        for (int i = n - 1; i >= 0; i--) for (int j = m - 1; j >= 0; j--) {
            dp[i][j] = a[i] == b[j] ? 1 + dp[i + 1][j + 1] : max(dp[i + 1][j], dp[i][j + 1]);
        }
        string out;
        int i = 0, j = 0;
        while (i < n && j < m && dp[i][j]) {
            bool found = false;
            for (char ch = 'a'; ch <= 'z' && !found; ch++) {
                for (int ia = i; ia < n && !found; ia++) if (a[ia] == ch) {
                    for (int ib = j; ib < m; ib++) if (b[ib] == ch && 1 + dp[ia + 1][ib + 1] == dp[i][j]) {
                        out.push_back(ch); i = ia + 1; j = ib + 1; found = true; break;
                    }
                }
            }
            if (!found) break;
        }
        return out;
    }`,
    expectedTime: "O(n * m)",
    expectedSpace: "O(n * m)",
    hints: [
      "First find the length of the longest common subsequence for every pair of suffixes.",
      "The answer string is built from the left. At each step the next character must still allow the full remaining length.",
      "Try letters from a to z. Take the first letter that appears later in both strings and leaves a suffix problem of length one less.",
      "That choice makes the result the lexicographically smallest. If the length is 0, the result is empty.",
    ],
    tests: [
      { input: { a: "abcde", b: "ace" }, expectedOutput: "ace", visibility: "SAMPLE" },
      { input: { a: "abac", b: "cab" }, expectedOutput: "ab", visibility: "SAMPLE" },
      { input: { a: "abc", b: "def" }, expectedOutput: "", visibility: "HIDDEN" },
      { input: { a: "a", b: "a" }, expectedOutput: "a", visibility: "HIDDEN" },
    ],
  }),
  problem({
    slug: "longest-common-substring",
    title: "Longest Common Substring",
    difficulty: "HARD",
    topics: ["dynamic-programming"],
    tags: ["dp"],
    statement:
      "A substring is a contiguous block. Return the length of the longest block that appears in both a and b.",
    constraints: ["1 <= a.length, b.length <= 500", "a and b are lowercase."],
    examples: [
      { input: 'a = "abcde", b = "abfce"', output: "2" },
      { input: 'a = "abc", b = "def"', output: "0" },
    ],
    signature: "int longestCommonSubstring(string a, string b)",
    functionName: "longestCommonSubstring",
    driver: `printJson(Json::number(sol.longestCommonSubstring(in["a"].asString(), in["b"].asString())));`,
    method: `int longestCommonSubstring(string a, string b) {
        int best = 0;
        vector<int> dp((int)b.size() + 1);
        for (int i = 1; i <= (int)a.size(); i++) {
            for (int j = (int)b.size(); j >= 1; j--) {
                dp[j] = a[i - 1] == b[j - 1] ? dp[j - 1] + 1 : 0;
                best = max(best, dp[j]);
            }
        }
        return best;
    }`,
    expectedTime: "O(n * m)",
    expectedSpace: "O(m)",
    hints: [
      "A shared block ends wherever the current characters match and the characters just before them also formed a shared block.",
      "A mismatch breaks the block, so that cell is 0.",
      "Track the largest cell while you fill the table.",
      "Unlike a subsequence, you cannot skip a character inside the block. The answer is a length, not the text.",
    ],
    tests: [
      { input: { a: "abcde", b: "abfce" }, expectedOutput: 2, visibility: "SAMPLE" },
      { input: { a: "abc", b: "def" }, expectedOutput: 0, visibility: "SAMPLE" },
      { input: { a: "aaa", b: "aa" }, expectedOutput: 2, visibility: "HIDDEN" },
      { input: { a: "z", b: "z" }, expectedOutput: 1, visibility: "HIDDEN" },
    ],
  }),
  problem({
    slug: "longest-palindromic-subsequence",
    title: "Longest Palindromic Subsequence",
    difficulty: "HARD",
    topics: ["dynamic-programming"],
    tags: ["dp"],
    statement:
      "Return the length of the longest subsequence of s that reads the same forward and backward. A single character is a palindrome.",
    constraints: ["1 <= s.length <= 500", "s is lowercase."],
    examples: [
      { input: 's = "bbbab"', output: "4" },
      { input: 's = "cbbd"', output: "2" },
    ],
    signature: "int longestPalindromicSubsequence(string s)",
    functionName: "longestPalindromicSubsequence",
    driver: `printJson(Json::number(sol.longestPalindromicSubsequence(in["s"].asString())));`,
    method: `int longestPalindromicSubsequence(string s) {
        int n = (int)s.size();
        vector<vector<int>> dp(n, vector<int>(n));
        for (int i = n - 1; i >= 0; i--) {
            dp[i][i] = 1;
            for (int j = i + 1; j < n; j++) dp[i][j] = s[i] == s[j] ? dp[i + 1][j - 1] + 2 : max(dp[i + 1][j], dp[i][j - 1]);
        }
        return dp[0][n - 1];
    }`,
    expectedTime: "O(n^2)",
    expectedSpace: "O(n^2)",
    hints: [
      "A palindromic subsequence inside a span depends on the two ends of that span.",
      "If the ends match, they wrap a palindrome from the inside and add two.",
      "If they differ, drop one end or the other and keep the longer result.",
      "Every span of one character has length 1. Fill shorter spans before longer ones.",
    ],
    tests: [
      { input: { s: "bbbab" }, expectedOutput: 4, visibility: "SAMPLE" },
      { input: { s: "cbbd" }, expectedOutput: 2, visibility: "SAMPLE" },
      { input: { s: "a" }, expectedOutput: 1, visibility: "HIDDEN" },
      { input: { s: "aa" }, expectedOutput: 2, visibility: "HIDDEN" },
    ],
  }),
  problem({
    slug: "min-palindrome-insertions",
    title: "Minimum Insertions to Make String Palindrome",
    difficulty: "HARD",
    topics: ["dynamic-programming"],
    tags: ["dp"],
    statement:
      "Return the fewest characters that must be inserted into s, anywhere, so the whole string becomes a palindrome. A string that is already a palindrome needs no insertions.",
    constraints: ["1 <= s.length <= 500", "s is lowercase."],
    examples: [
      { input: 's = "mbadm"', output: "2" },
      { input: 's = "zzazz"', output: "0" },
    ],
    signature: "int minPalindromeInsertions(string s)",
    functionName: "minPalindromeInsertions",
    driver: `printJson(Json::number(sol.minPalindromeInsertions(in["s"].asString())));`,
    method: `int minPalindromeInsertions(string s) {
        int n = (int)s.size();
        vector<vector<int>> dp(n, vector<int>(n));
        for (int i = n - 1; i >= 0; i--) {
            dp[i][i] = 1;
            for (int j = i + 1; j < n; j++) dp[i][j] = s[i] == s[j] ? dp[i + 1][j - 1] + 2 : max(dp[i + 1][j], dp[i][j - 1]);
        }
        return n - dp[0][n - 1];
    }`,
    expectedTime: "O(n^2)",
    expectedSpace: "O(n^2)",
    hints: [
      "Characters that already form a palindromic subsequence can stay where they are.",
      "Every other character needs a matching character inserted somewhere.",
      "So the number of insertions is the length minus the longest palindromic subsequence.",
      "A palindrome needs 0. A string of one character needs 0. The same span recurrence used for palindromic subsequences gives the length you can keep.",
    ],
    tests: [
      { input: { s: "mbadm" }, expectedOutput: 2, visibility: "SAMPLE" },
      { input: { s: "zzazz" }, expectedOutput: 0, visibility: "SAMPLE" },
      { input: { s: "leetcode" }, expectedOutput: 5, visibility: "HIDDEN" },
      { input: { s: "a" }, expectedOutput: 0, visibility: "HIDDEN" },
    ],
  }),
  problem({
    slug: "string-conversions",
    title: "Minimum Insertions and Deletions to Convert String",
    difficulty: "HARD",
    topics: ["dynamic-programming"],
    tags: ["dp"],
    statement:
      "You may insert or delete a character. Return the fewest operations that turn source into target. Replacing a character is not one operation; it would be a deletion plus an insertion.",
    constraints: ["1 <= source.length, target.length <= 500", "Both strings are lowercase."],
    examples: [
      { input: 'source = "sea", target = "eat"', output: "2" },
      { input: 'source = "leetcode", target = "etco"', output: "4" },
    ],
    signature: "int stringConversions(string source, string target)",
    functionName: "stringConversions",
    driver: `printJson(Json::number(sol.stringConversions(in["source"].asString(), in["target"].asString())));`,
    method: `int stringConversions(string source, string target) {
        int n = (int)source.size(), m = (int)target.size();
        vector<int> dp(m + 1);
        for (int i = 1; i <= n; i++) {
            int previous = 0;
            for (int j = 1; j <= m; j++) {
                int saved = dp[j];
                dp[j] = source[i - 1] == target[j - 1] ? previous + 1 : max(dp[j], dp[j - 1]);
                previous = saved;
            }
        }
        return n + m - 2 * dp[m];
    }`,
    expectedTime: "O(n * m)",
    expectedSpace: "O(m)",
    hints: [
      "Characters in a shared subsequence can stay. They do not need to be deleted or inserted.",
      "Everything in the source outside that subsequence is deleted.",
      "Everything in the target outside it is inserted.",
      "The count is source length plus target length minus twice the longest common subsequence. Identical strings need 0.",
    ],
    tests: [
      { input: { source: "sea", target: "eat" }, expectedOutput: 2, visibility: "SAMPLE" },
      { input: { source: "leetcode", target: "etco" }, expectedOutput: 4, visibility: "SAMPLE" },
      { input: { source: "a", target: "a" }, expectedOutput: 0, visibility: "HIDDEN" },
      { input: { source: "a", target: "b" }, expectedOutput: 2, visibility: "HIDDEN" },
    ],
  }),
  problem({
    slug: "shortest-supersequence",
    title: "Shortest Common Supersequence",
    difficulty: "HARD",
    topics: ["dynamic-programming"],
    tags: ["dp"],
    statement:
      "Return the shortest string that has both a and b as subsequences. Build it from the left. When the next characters match, take that character once. When they differ, take the character from a if doing so preserves a longest common subsequence at least as long as taking the character from b; otherwise take the character from b. Append any unfinished suffix at the end.",
    constraints: ["1 <= a.length, b.length <= 500", "a and b are lowercase."],
    examples: [
      { input: 'a = "abac", b = "cab"', output: '"cabac"' },
      { input: 'a = "abc", b = "def"', output: '"abcdef"' },
    ],
    signature: "string shortestSupersequence(string a, string b)",
    functionName: "shortestSupersequence",
    driver: `printJson(Json::text(sol.shortestSupersequence(in["a"].asString(), in["b"].asString())));`,
    method: `string shortestSupersequence(string a, string b) {
        int n = (int)a.size(), m = (int)b.size();
        vector<vector<int>> dp(n + 1, vector<int>(m + 1));
        for (int i = n - 1; i >= 0; i--) for (int j = m - 1; j >= 0; j--) {
            dp[i][j] = a[i] == b[j] ? 1 + dp[i + 1][j + 1] : max(dp[i + 1][j], dp[i][j + 1]);
        }
        string out;
        int i = 0, j = 0;
        while (i < n && j < m) {
            if (a[i] == b[j]) { out.push_back(a[i]); i++; j++; }
            else if (dp[i + 1][j] >= dp[i][j + 1]) out.push_back(a[i++]);
            else out.push_back(b[j++]);
        }
        out += a.substr(i);
        out += b.substr(j);
        return out;
    }`,
    expectedTime: "O(n * m)",
    expectedSpace: "O(n * m)",
    hints: [
      "A shortest supersequence keeps one copy of a longest common subsequence and adds the other characters around it.",
      "The length is len(a) + len(b) - LCS, but the string itself comes from walking the LCS table.",
      "Matching characters are written once. On a mismatch, move along the side whose remaining common subsequence is longer, and prefer a when the two sides tie.",
      "After one string is used up, copy the rest of the other. Identical strings return that string.",
    ],
    tests: [
      { input: { a: "abac", b: "cab" }, expectedOutput: "cabac", visibility: "SAMPLE" },
      { input: { a: "abc", b: "def" }, expectedOutput: "abcdef", visibility: "SAMPLE" },
      { input: { a: "aaaaaaaa", b: "aaaaaaaa" }, expectedOutput: "aaaaaaaa", visibility: "HIDDEN" },
      { input: { a: "abcde", b: "ace" }, expectedOutput: "abcde", visibility: "HIDDEN" },
    ],
  }),
  problem({
    slug: "distinct-subsequences",
    title: "Distinct Subsequences",
    difficulty: "HARD",
    topics: ["dynamic-programming"],
    tags: ["dp"],
    statement:
      "Return how many distinct subsequences of s equal t. Two subsequences are different when they use different indexes, even if the text looks the same. The answer fits in a 32-bit signed integer. An empty t occurs once.",
    constraints: ["0 <= s.length <= 200", "0 <= t.length <= 200", "s and t are lowercase."],
    examples: [
      { input: 's = "rabbbit", t = "rabbit"', output: "3" },
      { input: 's = "babgbag", t = "bag"', output: "5" },
    ],
    signature: "int distinctSubsequences(string s, string t)",
    functionName: "distinctSubsequences",
    driver: `printJson(Json::number(sol.distinctSubsequences(in["s"].asString(), in["t"].asString())));`,
    method: `int distinctSubsequences(string s, string t) {
        int m = (int)t.size();
        vector<long long> ways(m + 1);
        ways[0] = 1;
        for (char ch : s) for (int j = m; j >= 1; j--) if (ch == t[j - 1]) ways[j] += ways[j - 1];
        return (int)ways[m];
    }`,
    expectedTime: "O(n * m)",
    expectedSpace: "O(m)",
    hints: [
      "A prefix of t can be formed in several ways from a prefix of s.",
      "When the current s character matches the next t character, you may use it or skip it.",
      "Using it adds the ways to form the shorter t prefix. Skipping it leaves the current count alone.",
      "Walk t from the end of the row so one s character is used at most once in that pass. An empty t has one way, the empty choice. If t is longer than what s can supply, the count stays 0.",
    ],
    tests: [
      { input: { s: "rabbbit", t: "rabbit" }, expectedOutput: 3, visibility: "SAMPLE" },
      { input: { s: "babgbag", t: "bag" }, expectedOutput: 5, visibility: "SAMPLE" },
      { input: { s: "abc", t: "d" }, expectedOutput: 0, visibility: "HIDDEN" },
      { input: { s: "abc", t: "" }, expectedOutput: 1, visibility: "HIDDEN" },
    ],
  }),
  problem({
    slug: "edit-distance",
    title: "Edit Distance",
    difficulty: "HARD",
    topics: ["dynamic-programming"],
    tags: ["dp"],
    statement:
      "You may insert a character, delete a character, or replace a character. Return the fewest operations that turn source into target. An empty string becomes the other string by insertions or deletions alone.",
    constraints: ["0 <= source.length, target.length <= 500", "Both strings are lowercase."],
    examples: [
      { input: 'source = "horse", target = "ros"', output: "3" },
      { input: 'source = "intention", target = "execution"', output: "5" },
    ],
    signature: "int editDistance(string source, string target)",
    functionName: "editDistance",
    driver: `printJson(Json::number(sol.editDistance(in["source"].asString(), in["target"].asString())));`,
    method: `int editDistance(string source, string target) {
        int n = (int)source.size(), m = (int)target.size();
        vector<int> dp(m + 1);
        iota(dp.begin(), dp.end(), 0);
        for (int i = 1; i <= n; i++) {
            int previous = dp[0];
            dp[0] = i;
            for (int j = 1; j <= m; j++) {
                int saved = dp[j];
                if (source[i - 1] == target[j - 1]) dp[j] = previous;
                else dp[j] = 1 + min(previous, min(dp[j], dp[j - 1]));
                previous = saved;
            }
        }
        return dp[m];
    }`,
    expectedTime: "O(n * m)",
    expectedSpace: "O(m)",
    hints: [
      "The distance between two prefixes is one edit away from three shorter problems: a shorter source, a shorter target, or both shorter.",
      "A matching character costs the distance of the prefixes before it, with no new edit.",
      "A mismatch takes one plus the cheapest of replace, delete, or insert.",
      "The first row and column are the costs of building a string from empty. Identical strings have distance 0.",
    ],
    tests: [
      { input: { source: "horse", target: "ros" }, expectedOutput: 3, visibility: "SAMPLE" },
      { input: { source: "intention", target: "execution" }, expectedOutput: 5, visibility: "SAMPLE" },
      { input: { source: "a", target: "" }, expectedOutput: 1, visibility: "HIDDEN" },
      { input: { source: "", target: "" }, expectedOutput: 0, visibility: "HIDDEN" },
    ],
  }),
  problem({
    slug: "stock-profit",
    title: "Best Time to Buy and Sell Stock",
    difficulty: "MEDIUM",
    topics: ["dynamic-programming"],
    tags: ["dp"],
    statement:
      "prices[i] is the price on day i. You may buy once and sell once on a later day. Return the largest profit. If no sale helps, return 0.",
    constraints: ["1 <= prices.length <= 100000", "0 <= prices[i] <= 10000"],
    examples: [
      { input: "prices = [7, 1, 5, 3, 6, 4]", output: "5" },
      { input: "prices = [7, 6, 4, 3, 1]", output: "0" },
    ],
    signature: "int stockProfit(vector<int>& prices)",
    functionName: "stockProfit",
    driver: `auto prices = in["prices"].asIntVector();\n    printJson(Json::number(sol.stockProfit(prices)));`,
    method: `int stockProfit(vector<int>& prices) {
        int best = 0, low = prices[0];
        for (int price : prices) { low = min(low, price); best = max(best, price - low); }
        return best;
    }`,
    expectedTime: "O(n)",
    expectedSpace: "O(1)",
    hints: [
      "A sale on a day is profitable against the cheapest earlier day, including today.",
      "You only need the lowest price seen so far, not every past day.",
      "Walk once, update the low, then update the best difference.",
      "A strictly falling list never sells. One day has profit 0.",
    ],
    tests: [
      { input: { prices: [7, 1, 5, 3, 6, 4] }, expectedOutput: 5, visibility: "SAMPLE" },
      { input: { prices: [7, 6, 4, 3, 1] }, expectedOutput: 0, visibility: "SAMPLE" },
      { input: { prices: [1] }, expectedOutput: 0, visibility: "HIDDEN" },
      { input: { prices: [2, 4, 1] }, expectedOutput: 2, visibility: "HIDDEN" },
    ],
  }),
  problem({
    slug: "stock-profit-ii",
    title: "Best Time to Buy and Sell Stock II",
    difficulty: "MEDIUM",
    topics: ["dynamic-programming"],
    tags: ["dp"],
    statement:
      "You may buy and sell as many times as you want. You cannot hold more than one share, so a buy must be sold before the next buy. Return the largest total profit. A day may be both a sale and the next buy.",
    constraints: ["1 <= prices.length <= 100000", "0 <= prices[i] <= 10000"],
    examples: [
      { input: "prices = [7, 1, 5, 3, 6, 4]", output: "7" },
      { input: "prices = [1, 2, 3, 4, 5]", output: "4" },
    ],
    signature: "int stockProfitII(vector<int>& prices)",
    functionName: "stockProfitII",
    driver: `auto prices = in["prices"].asIntVector();\n    printJson(Json::number(sol.stockProfitII(prices)));`,
    method: `int stockProfitII(vector<int>& prices) {
        int profit = 0;
        for (int i = 1; i < (int)prices.size(); i++) profit += max(0, prices[i] - prices[i - 1]);
        return profit;
    }`,
    expectedTime: "O(n)",
    expectedSpace: "O(1)",
    hints: [
      "Every rise can be captured, because you may trade every day.",
      "A rise from yesterday to today is a one-day trade. A fall is skipped.",
      "Add every positive difference between neighbors.",
      "Several small rises add up to the same profit as one long rise. A falling list earns 0.",
    ],
    tests: [
      { input: { prices: [7, 1, 5, 3, 6, 4] }, expectedOutput: 7, visibility: "SAMPLE" },
      { input: { prices: [1, 2, 3, 4, 5] }, expectedOutput: 4, visibility: "SAMPLE" },
      { input: { prices: [7, 6, 4, 3, 1] }, expectedOutput: 0, visibility: "HIDDEN" },
      { input: { prices: [1] }, expectedOutput: 0, visibility: "HIDDEN" },
    ],
  }),
  problem({
    slug: "stock-profit-iii",
    title: "Best Time to Buy and Sell Stock III",
    difficulty: "MEDIUM",
    topics: ["dynamic-programming"],
    tags: ["dp"],
    statement:
      "You may complete at most two transactions. A transaction is a buy followed by a later sell, and you cannot hold two shares at once. Return the largest profit.",
    constraints: ["1 <= prices.length <= 100000", "0 <= prices[i] <= 10000"],
    examples: [
      { input: "prices = [3, 3, 5, 0, 0, 3, 1, 4]", output: "6" },
      { input: "prices = [1, 2, 3, 4, 5]", output: "4" },
    ],
    signature: "int stockProfitIII(vector<int>& prices)",
    functionName: "stockProfitIII",
    driver: `auto prices = in["prices"].asIntVector();\n    printJson(Json::number(sol.stockProfitIII(prices)));`,
    method: `int stockProfitIII(vector<int>& prices) {
        int buy1 = 1000000000, buy2 = 1000000000, sell1 = 0, sell2 = 0;
        for (int price : prices) {
            buy1 = min(buy1, price);
            sell1 = max(sell1, price - buy1);
            buy2 = min(buy2, price - sell1);
            sell2 = max(sell2, price - buy2);
        }
        return sell2;
    }`,
    expectedTime: "O(n)",
    expectedSpace: "O(1)",
    hints: [
      "The second trade can use the profit of the first trade as a discount on its buy price.",
      "Track the cheapest first buy, the best profit after one sale, the cheapest second buy after that profit, and the best second sale.",
      "Update those four numbers in that order for every price.",
      "One rising stretch is still one transaction, so a monotone rise does not need the second trade. A falling list earns 0.",
    ],
    tests: [
      { input: { prices: [3, 3, 5, 0, 0, 3, 1, 4] }, expectedOutput: 6, visibility: "SAMPLE" },
      { input: { prices: [1, 2, 3, 4, 5] }, expectedOutput: 4, visibility: "SAMPLE" },
      { input: { prices: [7, 6, 4, 3, 1] }, expectedOutput: 0, visibility: "HIDDEN" },
      { input: { prices: [1, 2, 4, 2, 5, 7, 2, 4, 9, 0] }, expectedOutput: 13, visibility: "HIDDEN" },
    ],
  }),
  problem({
    slug: "stock-profit-iv",
    title: "Best Time to Buy and Sell Stock IV",
    difficulty: "MEDIUM",
    topics: ["dynamic-programming"],
    tags: ["dp"],
    statement:
      "You may complete at most k transactions. A transaction is a buy followed by a later sell, and you cannot hold two shares at once. Return the largest profit. k = 0 means you cannot trade.",
    constraints: ["0 <= k <= 100", "1 <= prices.length <= 1000", "0 <= prices[i] <= 1000"],
    examples: [
      { input: "k = 2, prices = [3, 3, 5, 0, 0, 3, 1, 4]", output: "6" },
      { input: "k = 2, prices = [1, 2, 3, 4, 5]", output: "4" },
    ],
    signature: "int stockProfitIV(int k, vector<int>& prices)",
    functionName: "stockProfitIV",
    driver: `auto prices = in["prices"].asIntVector();\n    printJson(Json::number(sol.stockProfitIV((int)in["k"].asInt(), prices)));`,
    method: `int stockProfitIV(int k, vector<int>& prices) {
        int n = (int)prices.size();
        if (k == 0 || n == 0) return 0;
        if (k >= n / 2) {
            int profit = 0;
            for (int i = 1; i < n; i++) profit += max(0, prices[i] - prices[i - 1]);
            return profit;
        }
        vector<int> buy(k + 1, -1000000000), sell(k + 1);
        for (int price : prices) for (int trade = 1; trade <= k; trade++) {
            buy[trade] = max(buy[trade], sell[trade - 1] - price);
            sell[trade] = max(sell[trade], buy[trade] + price);
        }
        return sell[k];
    }`,
    expectedTime: "O(k * n)",
    expectedSpace: "O(k)",
    hints: [
      "Once k is large enough to trade every rise, the limit no longer matters.",
      "Otherwise keep the best buy and the best sell for each transaction count from 1 through k.",
      "On a day, a new buy for trade t spends the price after the best sale of t - 1 trades. A sale adds the price to that buy.",
      "k = 0 earns nothing. Update the trades from 1 upward so today's new sale is not reused as an earlier trade in the same day.",
    ],
    tests: [
      { input: { k: 2, prices: [3, 3, 5, 0, 0, 3, 1, 4] }, expectedOutput: 6, visibility: "SAMPLE" },
      { input: { k: 2, prices: [1, 2, 3, 4, 5] }, expectedOutput: 4, visibility: "SAMPLE" },
      { input: { k: 0, prices: [1, 2] }, expectedOutput: 0, visibility: "HIDDEN" },
      { input: { k: 1, prices: [2, 4, 1] }, expectedOutput: 2, visibility: "HIDDEN" },
    ],
  }),
  problem({
    slug: "stock-cooldown",
    title: "Best Time to Buy and Sell Stock with Cooldown",
    difficulty: "MEDIUM",
    topics: ["dynamic-programming"],
    tags: ["dp"],
    statement:
      "You may trade as many times as you want, but after you sell you must wait one day before buying again. You cannot hold more than one share. Return the largest profit.",
    constraints: ["1 <= prices.length <= 5000", "0 <= prices[i] <= 1000"],
    examples: [
      { input: "prices = [1, 2, 3, 0, 2]", output: "3" },
      { input: "prices = [1]", output: "0" },
    ],
    signature: "int stockCooldown(vector<int>& prices)",
    functionName: "stockCooldown",
    driver: `auto prices = in["prices"].asIntVector();\n    printJson(Json::number(sol.stockCooldown(prices)));`,
    method: `int stockCooldown(vector<int>& prices) {
        int hold = -1000000000, sold = 0, rest = 0;
        for (int price : prices) {
            int previous = sold;
            sold = hold + price;
            hold = max(hold, rest - price);
            rest = max(rest, previous);
        }
        return max(sold, rest);
    }`,
    expectedTime: "O(n)",
    expectedSpace: "O(1)",
    hints: [
      "Three situations matter: holding a share, having just sold, and being free to buy.",
      "A sale moves holding into the just-sold state. A buy is allowed only from the free state.",
      "The free state can stay free or arrive from yesterday's sale, which is the cooldown.",
      "The answer is the better of just sold and free, because holding a share has not cashed out. One day earns 0.",
    ],
    tests: [
      { input: { prices: [1, 2, 3, 0, 2] }, expectedOutput: 3, visibility: "SAMPLE" },
      { input: { prices: [1] }, expectedOutput: 0, visibility: "SAMPLE" },
      { input: { prices: [1, 2, 4] }, expectedOutput: 3, visibility: "HIDDEN" },
      { input: { prices: [2, 1] }, expectedOutput: 0, visibility: "HIDDEN" },
    ],
  }),
  problem({
    slug: "stock-fee",
    title: "Best Time to Buy and Sell Stock with Transaction Fee",
    difficulty: "MEDIUM",
    topics: ["dynamic-programming"],
    tags: ["dp"],
    statement:
      "You may trade as many times as you want, but every sale pays fee. You cannot hold more than one share. Return the largest profit after fees.",
    constraints: ["1 <= prices.length <= 5000", "0 <= prices[i], fee <= 5000"],
    examples: [
      { input: "prices = [1, 3, 2, 8, 4, 9], fee = 2", output: "8" },
      { input: "prices = [1, 3, 7, 5, 10, 3], fee = 3", output: "6" },
    ],
    signature: "int stockFee(vector<int>& prices, int fee)",
    functionName: "stockFee",
    driver: `auto prices = in["prices"].asIntVector();\n    printJson(Json::number(sol.stockFee(prices, (int)in["fee"].asInt())));`,
    method: `int stockFee(vector<int>& prices, int fee) {
        int cash = 0, hold = -prices[0];
        for (int i = 1; i < (int)prices.size(); i++) {
            cash = max(cash, hold + prices[i] - fee);
            hold = max(hold, cash - prices[i]);
        }
        return cash;
    }`,
    expectedTime: "O(n)",
    expectedSpace: "O(1)",
    hints: [
      "The fee makes a small rise not worth a trade.",
      "Keep the best profit while holding a share and the best profit while holding cash.",
      "Selling adds the price and subtracts the fee. Buying spends the price from the cash state.",
      "The cash state is the answer, because a share still in hand has not paid the fee. One day earns 0.",
    ],
    tests: [
      { input: { prices: [1, 3, 2, 8, 4, 9], fee: 2 }, expectedOutput: 8, visibility: "SAMPLE" },
      { input: { prices: [1, 3, 7, 5, 10, 3], fee: 3 }, expectedOutput: 6, visibility: "SAMPLE" },
      { input: { prices: [1], fee: 2 }, expectedOutput: 0, visibility: "HIDDEN" },
      { input: { prices: [1, 3], fee: 5 }, expectedOutput: 0, visibility: "HIDDEN" },
    ],
  }),
];
