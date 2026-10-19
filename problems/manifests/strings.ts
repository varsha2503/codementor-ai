import { problem } from "./helpers.js";

export const stringProblems = [
  problem({
    slug: "anagram-spots",
    title: "Find All Anagrams in a String",
    difficulty: "MEDIUM",
    topics: ["strings"],
    tags: ["sliding-window"],
    statement:
      "A transcript and a short pattern are both lowercase letters. Return every start index where a window of the transcript is an anagram of the pattern. The indexes should be in ascending order.",
    constraints: ["0 <= pattern.length, text.length <= 20000", "Both strings contain only lowercase letters."],
    examples: [
      { input: 'text = "cbaebabacd", pattern = "abc"', output: "[0, 6]" },
      { input: 'text = "abab", pattern = "ab"', output: "[0, 1, 2]" },
    ],
    signature: "vector<int> anagramStarts(string text, string pattern)",
    functionName: "anagramStarts",
    driver: `printJson(Json::ints(sol.anagramStarts(in["text"].asString(), in["pattern"].asString())));`,
    method: `vector<int> anagramStarts(string text, string pattern) {
        vector<int> ans;
        if (pattern.size() > text.size()) return ans;
        array<int, 26> need{}, win{};
        for (char c : pattern) need[c - 'a']++;
        for (int i = 0; i < (int)text.size(); i++) {
            win[text[i] - 'a']++;
            if (i >= (int)pattern.size()) win[text[i - (int)pattern.size()] - 'a']--;
            if (i + 1 >= (int)pattern.size() && win == need) ans.push_back(i + 1 - (int)pattern.size());
        }
        return ans;
    }`,
    expectedTime: "O(n)",
    expectedSpace: "O(1)",
    hints: [
      "Sorting every window works, but each window shares almost all of its letters with the next one. What can you update instead of rebuilding the window?",
      "Two frequency tables of 26 letters are enough: one for the pattern, one for the current window.",
      "Add the letter that enters the window and remove the letter that leaves. When the tables match, record the start index, which is the current end minus the pattern length plus one.",
      "The window slides once across the transcript. Comparing two 26-length tables is constant work, so the scan is linear and the extra memory does not grow with the transcript. If the pattern is longer than the text, the answer is empty.",
    ],
    tests: [
      { input: { text: "cbaebabacd", pattern: "abc" }, expectedOutput: [0, 6], visibility: "SAMPLE" },
      { input: { text: "abab", pattern: "ab" }, expectedOutput: [0, 1, 2], visibility: "SAMPLE" },
      { input: { text: "aaaa", pattern: "aa" }, expectedOutput: [0, 1, 2], visibility: "HIDDEN" },
      { input: { text: "abc", pattern: "abcd" }, expectedOutput: [], visibility: "HIDDEN" },
      { input: { text: "a", pattern: "a" }, expectedOutput: [0], visibility: "HIDDEN" },
    ],
  }),
  problem({
    slug: "unique-stretch",
    title: "Longest Substring Without Repeating Characters",
    difficulty: "MEDIUM",
    topics: ["strings"],
    tags: ["sliding-window"],
    statement:
      "A log is a string that may contain any characters. Return the length of the longest contiguous stretch that never repeats a character.",
    constraints: ["0 <= log.length <= 50000"],
    examples: [
      { input: 'log = "abcabcbb"', output: "3", explanation: '"abc" is a longest stretch.' },
      { input: 'log = "bbbbb"', output: "1" },
      { input: 'log = ""', output: "0" },
    ],
    signature: "int longestUnique(string log)",
    functionName: "longestUnique",
    driver: `printJson(Json::number(sol.longestUnique(in["log"].asString())));`,
    method: `int longestUnique(string log) {
        array<int, 256> last;
        last.fill(-1);
        int start = 0, best = 0;
        for (int i = 0; i < (int)log.size(); i++) {
            unsigned char ch = (unsigned char)log[i];
            if (last[ch] >= start) start = last[ch] + 1;
            last[ch] = i;
            best = max(best, i - start + 1);
        }
        return best;
    }`,
    expectedTime: "O(n)",
    expectedSpace: "O(1)",
    hints: [
      "A stretch that repeats a character is invalid, but you do not have to restart from every index. When a repeat appears, how far do you need to move the left edge?",
      "Remember the last index of each character. A fixed table of 256 slots is enough if you index by the character code.",
      "Let start be the left edge. When the current character was last seen at or after start, move start to one past that previous index. The candidate length is i - start + 1.",
      "Each character enters and leaves the window at most once, so the scan is linear. Extra memory is the fixed last-seen table. An empty log has length 0. Do not move start backward.",
    ],
    tests: [
      { input: { log: "abcabcbb" }, expectedOutput: 3, visibility: "SAMPLE" },
      { input: { log: "bbbbb" }, expectedOutput: 1, visibility: "SAMPLE" },
      { input: { log: "" }, expectedOutput: 0, visibility: "SAMPLE" },
      { input: { log: "pwwkew" }, expectedOutput: 3, visibility: "HIDDEN" },
      { input: { log: "au" }, expectedOutput: 2, visibility: "HIDDEN" },
      { input: { log: "dvdf" }, expectedOutput: 3, visibility: "HIDDEN" },
    ],
  }),
  problem({
    slug: "bracket-check",
    title: "Valid Parentheses",
    difficulty: "EASY",
    topics: ["strings"],
    tags: ["stack"],
    statement:
      "An expression contains only the brackets ()[]{}. It is balanced when every closer matches the nearest unmatched opener of the same kind, and every opener is closed. Return whether the expression is balanced. An empty expression is balanced.",
    constraints: ["0 <= expr.length <= 10000", "expr contains only parentheses, brackets, and braces."],
    examples: [
      { input: 'expr = "()"', output: "true" },
      { input: 'expr = "([)]"', output: "false" },
      { input: 'expr = "{[]}"', output: "true" },
    ],
    signature: "bool isBalanced(string expr)",
    functionName: "isBalanced",
    driver: `printJson(Json::boolean(sol.isBalanced(in["expr"].asString())));`,
    method: `bool isBalanced(string expr) {
        string open;
        for (char c : expr) {
            if (c == '(' || c == '[' || c == '{') open.push_back(c);
            else {
                if (open.empty()) return false;
                char o = open.back();
                open.pop_back();
                if ((c == ')' && o != '(') || (c == ']' && o != '[') || (c == '}' && o != '{')) return false;
            }
        }
        return open.empty();
    }`,
    expectedTime: "O(n)",
    expectedSpace: "O(n)",
    hints: [
      "A closer has to match the most recent opener that is still open, not the first opener in the string. What structure gives you that most recent opener?",
      "Use a stack of opening brackets.",
      "Push openers. On a closer, the stack must be non-empty and its top must be the matching opener; then pop. The expression is balanced only when the stack is empty at the end.",
      "One left-to-right pass is enough. A closer with an empty stack fails immediately, and leftover openers fail at the end. The stack holds at most every character, so extra memory is linear.",
    ],
    tests: [
      { input: { expr: "()" }, expectedOutput: true, visibility: "SAMPLE" },
      { input: { expr: "([)]" }, expectedOutput: false, visibility: "SAMPLE" },
      { input: { expr: "{[]}" }, expectedOutput: true, visibility: "SAMPLE" },
      { input: { expr: "" }, expectedOutput: true, visibility: "HIDDEN" },
      { input: { expr: "((((" }, expectedOutput: false, visibility: "HIDDEN" },
      { input: { expr: "([{}])" }, expectedOutput: true, visibility: "HIDDEN" },
      { input: { expr: "]" }, expectedOutput: false, visibility: "HIDDEN" },
    ],
  }),
];

export const searchProblems = [
  problem({
    slug: "shifted-search",
    title: "Search in Rotated Sorted Array",
    difficulty: "MEDIUM",
    topics: ["binary-search", "arrays"],
    tags: ["binary-search"],
    statement:
      "A sorted list of distinct integers was rotated some unknown number of places. Search for target and return its index, or -1 when it is absent. A linear scan is too slow for the hidden cases.",
    constraints: ["1 <= nums.length <= 10000", "All values are distinct.", "-1e9 <= nums[i], target <= 1e9"],
    examples: [
      { input: "nums = [4, 5, 6, 7, 0, 1, 2], target = 0", output: "4" },
      { input: "nums = [4, 5, 6, 7, 0, 1, 2], target = 3", output: "-1" },
    ],
    signature: "int searchShifted(vector<int>& nums, int target)",
    functionName: "searchShifted",
    driver: `auto nums = in["nums"].asIntVector();\n    printJson(Json::number(sol.searchShifted(nums, (int)in["target"].asInt())));`,
    method: `int searchShifted(vector<int>& nums, int target) {
        int lo = 0, hi = (int)nums.size() - 1;
        while (lo <= hi) {
            int mid = lo + (hi - lo) / 2;
            if (nums[mid] == target) return mid;
            if (nums[lo] <= nums[mid]) {
                if (nums[lo] <= target && target < nums[mid]) hi = mid - 1;
                else lo = mid + 1;
            } else if (nums[mid] < target && target <= nums[hi]) lo = mid + 1;
            else hi = mid - 1;
        }
        return -1;
    }`,
    expectedTime: "O(log n)",
    expectedSpace: "O(1)",
    hints: [
      "The list is not fully sorted, but one half of any window still is. How can you tell which half is sorted?",
      "Keep the ordinary binary-search window. The extra decision is which side of mid is monotonic.",
      "If nums[lo] <= nums[mid], the left side is sorted. Search it when the target lies in that inclusive-exclusive range; otherwise search the other side. Mirror the test when the right side is the sorted one.",
      "Each step throws away half the window, so the search is logarithmic and uses constant extra memory. The boundary comparisons are the usual source of off-by-one mistakes: decide whether mid itself is included before you move lo or hi.",
    ],
    tests: [
      { input: { nums: [4, 5, 6, 7, 0, 1, 2], target: 0 }, expectedOutput: 4, visibility: "SAMPLE" },
      { input: { nums: [4, 5, 6, 7, 0, 1, 2], target: 3 }, expectedOutput: -1, visibility: "SAMPLE" },
      { input: { nums: [1], target: 0 }, expectedOutput: -1, visibility: "HIDDEN" },
      { input: { nums: [3, 1], target: 1 }, expectedOutput: 1, visibility: "HIDDEN" },
      { input: { nums: [5, 1, 3], target: 5 }, expectedOutput: 0, visibility: "HIDDEN" },
      { input: { nums: [4, 5, 6, 7, 0, 1, 2], target: 1 }, expectedOutput: 5, visibility: "HIDDEN" },
    ],
  }),
];
