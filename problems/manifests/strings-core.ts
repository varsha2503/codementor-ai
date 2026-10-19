import { problem } from "./helpers.js";

export const stringCoreProblems = [
  problem({
    slug: "mirror-line",
    title: "Valid Palindrome",
    difficulty: "EASY",
    topics: ["strings"],
    tags: ["two-pointers"],
    statement:
      "A line may contain letters, spaces, and punctuation. Compare letters only, ignoring case. Return whether the letters read the same forward and backward.",
    constraints: ["0 <= line.length <= 10000"],
    examples: [
      { input: 'line = "A man, a plan, a canal: Panama"', output: "true" },
      { input: 'line = "race a car"', output: "false" },
    ],
    signature: "bool mirrorLine(string line)",
    functionName: "mirrorLine",
    driver: `printJson(Json::boolean(sol.mirrorLine(in["line"].asString())));`,
    method: `bool mirrorLine(string line) {
        int lo = 0, hi = (int)line.size() - 1;
        auto letter = [](unsigned char c) { return std::isalpha(c); };
        while (lo < hi) {
            while (lo < hi && !letter(line[lo])) lo++;
            while (lo < hi && !letter(line[hi])) hi--;
            if (std::tolower(line[lo]) != std::tolower(line[hi])) return false;
            lo++; hi--;
        }
        return true;
    }`,
    expectedTime: "O(n)",
    expectedSpace: "O(1)",
    hints: [
      "Punctuation and spaces are not part of the comparison. Case is not either.",
      "Walk one index from each end. Skip anything that is not a letter before you compare.",
      "Compare the lowercase form of the two letters. A mismatch ends the check. Then move both indexes inward.",
      "An empty line and a line with no letters are mirrors. Each character is visited at most once, so the scan is linear and needs only the two indexes.",
    ],
    tests: [
      { input: { line: "A man, a plan, a canal: Panama" }, expectedOutput: true, visibility: "SAMPLE" },
      { input: { line: "race a car" }, expectedOutput: false, visibility: "SAMPLE" },
      { input: { line: "" }, expectedOutput: true, visibility: "HIDDEN" },
      { input: { line: "0P" }, expectedOutput: true, visibility: "HIDDEN" },
      { input: { line: "ab" }, expectedOutput: false, visibility: "HIDDEN" },
    ],
  }),
  problem({
    slug: "same-bag",
    title: "Valid Anagram",
    difficulty: "EASY",
    topics: ["strings"],
    tags: ["frequency"],
    statement: "Two labels use only lowercase letters. Return whether they use the same letters the same number of times, regardless of order.",
    constraints: ["0 <= left.length, right.length <= 10000", "Both labels are lowercase letters."],
    examples: [
      { input: 'left = "listen", right = "silent"', output: "true" },
      { input: 'left = "rat", right = "car"', output: "false" },
    ],
    signature: "bool sameBag(string left, string right)",
    functionName: "sameBag",
    driver: `printJson(Json::boolean(sol.sameBag(in["left"].asString(), in["right"].asString())));`,
    method: `bool sameBag(string left, string right) {
        if (left.size() != right.size()) return false;
        array<int, 26> count{};
        for (char c : left) count[c - 'a']++;
        for (char c : right) if (--count[c - 'a'] < 0) return false;
        return true;
    }`,
    expectedTime: "O(n)",
    expectedSpace: "O(1)",
    hints: [
      "Order does not matter. The counts of the 26 letters do.",
      "Different lengths cannot match. A frequency table is enough after that check.",
      "Add every letter from the left label, then subtract every letter from the right. A count that goes negative means the right label used a letter too often.",
      "Equal lengths plus no negative count means the bags match. The table has a fixed size, so extra memory does not grow with the labels.",
    ],
    tests: [
      { input: { left: "listen", right: "silent" }, expectedOutput: true, visibility: "SAMPLE" },
      { input: { left: "rat", right: "car" }, expectedOutput: false, visibility: "SAMPLE" },
      { input: { left: "", right: "" }, expectedOutput: true, visibility: "HIDDEN" },
      { input: { left: "a", right: "ab" }, expectedOutput: false, visibility: "HIDDEN" },
      { input: { left: "aabb", right: "abab" }, expectedOutput: true, visibility: "HIDDEN" },
    ],
  }),
  problem({
    slug: "shared-prefix",
    title: "Longest Common Prefix",
    difficulty: "EASY",
    topics: ["strings"],
    tags: ["scan"],
    statement: "A list of lowercase words shares a prefix when every word begins with those letters. Return the longest shared prefix. It may be empty.",
    constraints: ["1 <= words.length <= 200", "0 <= words[i].length <= 200", "words[i] is lowercase letters."],
    examples: [
      { input: 'words = ["flower", "flow", "flight"]', output: '"fl"' },
      { input: 'words = ["dog", "racecar", "car"]', output: '""' },
    ],
    signature: "string sharedPrefix(vector<string>& words)",
    functionName: "sharedPrefix",
    driver: `auto words = in["words"].asStrings();\n    printJson(Json::text(sol.sharedPrefix(words)));`,
    method: `string sharedPrefix(vector<string>& words) {
        string prefix = words[0];
        for (int i = 1; i < (int)words.size(); i++) {
            int j = 0;
            while (j < (int)prefix.size() && j < (int)words[i].size() && prefix[j] == words[i][j]) j++;
            prefix.resize(j);
        }
        return prefix;
    }`,
    expectedTime: "O(total letters)",
    expectedSpace: "O(1)",
    hints: [
      "The answer cannot be longer than the shortest word, and it has to survive every later word.",
      "Start with the first word as a candidate. Shorten it as soon as another word disagrees.",
      "Compare the candidate with the next word until a character differs or one string ends. Resize the candidate to that length.",
      "Once the candidate is empty, later words cannot revive it. The scan looks at each letter a constant number of times.",
    ],
    tests: [
      { input: { words: ["flower", "flow", "flight"] }, expectedOutput: "fl", visibility: "SAMPLE" },
      { input: { words: ["dog", "racecar", "car"] }, expectedOutput: "", visibility: "SAMPLE" },
      { input: { words: ["inter", "internet"] }, expectedOutput: "inter", visibility: "HIDDEN" },
      { input: { words: [""] }, expectedOutput: "", visibility: "HIDDEN" },
      { input: { words: ["a"] }, expectedOutput: "a", visibility: "HIDDEN" },
    ],
  }),
  problem({
    slug: "lone-letter",
    title: "First Unique Character",
    difficulty: "EASY",
    topics: ["strings"],
    tags: ["frequency"],
    statement: "A lowercase note may repeat letters. Return the index of the first letter that appears once. If every letter repeats, return -1.",
    constraints: ["0 <= note.length <= 10000", "note is lowercase letters."],
    examples: [
      { input: 'note = "leetcode"', output: "0" },
      { input: 'note = "aabb"', output: "-1" },
    ],
    signature: "int loneLetter(string note)",
    functionName: "loneLetter",
    driver: `printJson(Json::number(sol.loneLetter(in["note"].asString())));`,
    method: `int loneLetter(string note) {
        array<int, 26> count{};
        for (char c : note) count[c - 'a']++;
        for (int i = 0; i < (int)note.size(); i++) if (count[note[i] - 'a'] == 1) return i;
        return -1;
    }`,
    expectedTime: "O(n)",
    expectedSpace: "O(1)",
    hints: [
      "You need the earliest unique letter, so a letter's count has to be known before you can trust its position.",
      "Count the 26 letters first. Then walk the note from the left.",
      "The first index whose letter has a count of one is the answer. If the second walk finishes, return -1.",
      "Two linear passes and a fixed table are enough. Do not stop during the counting pass, because a later copy can cancel an early letter.",
    ],
    tests: [
      { input: { note: "leetcode" }, expectedOutput: 0, visibility: "SAMPLE" },
      { input: { note: "aabb" }, expectedOutput: -1, visibility: "SAMPLE" },
      { input: { note: "loveleetcode" }, expectedOutput: 2, visibility: "HIDDEN" },
      { input: { note: "" }, expectedOutput: -1, visibility: "HIDDEN" },
      { input: { note: "ab" }, expectedOutput: 0, visibility: "HIDDEN" },
    ],
  }),
  problem({
    slug: "needle-mark",
    title: "Find the Index of the First Occurrence",
    difficulty: "EASY",
    topics: ["strings"],
    tags: ["two-pointers"],
    statement:
      "Find the first index where needle occurs inside hay. Both are lowercase. Return -1 when it does not occur. An empty needle occurs at index 0.",
    constraints: ["0 <= hay.length, needle.length <= 10000", "Both strings are lowercase letters."],
    examples: [
      { input: 'hay = "hello", needle = "ll"', output: "2" },
      { input: 'hay = "aaaaa", needle = "bba"', output: "-1" },
    ],
    signature: "int needleMark(string hay, string needle)",
    functionName: "needleMark",
    driver: `printJson(Json::number(sol.needleMark(in["hay"].asString(), in["needle"].asString())));`,
    method: `int needleMark(string hay, string needle) {
        if (needle.empty()) return 0;
        if (needle.size() > hay.size()) return -1;
        for (int i = 0; i + (int)needle.size() <= (int)hay.size(); i++) {
            int j = 0;
            while (j < (int)needle.size() && hay[i + j] == needle[j]) j++;
            if (j == (int)needle.size()) return i;
        }
        return -1;
    }`,
    expectedTime: "O(n * m)",
    expectedSpace: "O(1)",
    hints: [
      "Every start position in the hay is a possible match, until the remaining letters are shorter than the needle.",
      "From a start index, compare the needle letter by letter.",
      "A full match returns that start index immediately, so the answer is the leftmost one. A mismatch tries the next start.",
      "An empty needle is defined to sit at index 0, even when the hay is empty. A needle longer than the hay is absent.",
    ],
    tests: [
      { input: { hay: "hello", needle: "ll" }, expectedOutput: 2, visibility: "SAMPLE" },
      { input: { hay: "aaaaa", needle: "bba" }, expectedOutput: -1, visibility: "SAMPLE" },
      { input: { hay: "", needle: "" }, expectedOutput: 0, visibility: "HIDDEN" },
      { input: { hay: "a", needle: "" }, expectedOutput: 0, visibility: "HIDDEN" },
      { input: { hay: "abc", needle: "c" }, expectedOutput: 2, visibility: "HIDDEN" },
    ],
  }),
  problem({
    slug: "spin-check",
    title: "Check if One String Is a Rotation of Another",
    difficulty: "EASY",
    topics: ["strings"],
    tags: ["scan"],
    statement: "Return whether right is a rotation of left. A rotation moves some prefix of left to its end. Both strings are lowercase.",
    constraints: ["0 <= left.length, right.length <= 10000", "Both strings are lowercase letters."],
    examples: [
      { input: 'left = "abcde", right = "cdeab"', output: "true" },
      { input: 'left = "abcde", right = "abced"', output: "false" },
    ],
    signature: "bool spinCheck(string left, string right)",
    functionName: "spinCheck",
    driver: `printJson(Json::boolean(sol.spinCheck(in["left"].asString(), in["right"].asString())));`,
    method: `bool spinCheck(string left, string right) {
        if (left.size() != right.size()) return false;
        string doubled = left + left;
        return doubled.find(right) != string::npos;
    }`,
    expectedTime: "O(n)",
    expectedSpace: "O(n)",
    hints: [
      "A rotation keeps the same letters in a cycle. Different lengths cannot be rotations.",
      "Every rotation of left appears as a contiguous block inside left followed by left again.",
      "Build that doubled string and ask whether right occurs in it.",
      "Two empty strings are rotations of each other. The doubled string has length 2n, and searching it is linear in that length.",
    ],
    tests: [
      { input: { left: "abcde", right: "cdeab" }, expectedOutput: true, visibility: "SAMPLE" },
      { input: { left: "abcde", right: "abced" }, expectedOutput: false, visibility: "SAMPLE" },
      { input: { left: "", right: "" }, expectedOutput: true, visibility: "HIDDEN" },
      { input: { left: "a", right: "a" }, expectedOutput: true, visibility: "HIDDEN" },
      { input: { left: "aa", right: "a" }, expectedOutput: false, visibility: "HIDDEN" },
    ],
  }),
  problem({
    slug: "nest-depth",
    title: "Maximum Nesting Depth of Parentheses",
    difficulty: "EASY",
    topics: ["strings"],
    tags: ["scan"],
    statement:
      "An expression may contain parentheses and other characters. Other characters do not change the depth. Return the deepest nesting reached. A closer with nothing open does not make the depth negative.",
    constraints: ["0 <= expr.length <= 10000"],
    examples: [
      { input: 'expr = "(1+(2*3)+((8)/4))+1"', output: "3" },
      { input: 'expr = "(1)"', output: "1" },
    ],
    signature: "int nestDepth(string expr)",
    functionName: "nestDepth",
    driver: `printJson(Json::number(sol.nestDepth(in["expr"].asString())));`,
    method: `int nestDepth(string expr) {
        int depth = 0, best = 0;
        for (char c : expr) {
            if (c == '(') best = max(best, ++depth);
            else if (c == ')' && depth) depth--;
        }
        return best;
    }`,
    expectedTime: "O(n)",
    expectedSpace: "O(1)",
    hints: [
      "You only care how deep the parentheses go, not whether the expression calculates anything.",
      "Keep a running depth and the largest value it reaches.",
      "An opening parenthesis increases the depth. A closing one decreases it only when the depth is already positive.",
      "Letters, digits, and operators are ignored. The answer for a string with no parentheses is 0. One pass and two integers are enough.",
    ],
    tests: [
      { input: { expr: "(1+(2*3)+((8)/4))+1" }, expectedOutput: 3, visibility: "SAMPLE" },
      { input: { expr: "(1)" }, expectedOutput: 1, visibility: "SAMPLE" },
      { input: { expr: "" }, expectedOutput: 0, visibility: "HIDDEN" },
      { input: { expr: "1+(2)" }, expectedOutput: 1, visibility: "HIDDEN" },
      { input: { expr: "((()))" }, expectedOutput: 3, visibility: "HIDDEN" },
    ],
  }),
  problem({
    slug: "echo-trim",
    title: "Remove All Adjacent Duplicates in String",
    difficulty: "EASY",
    topics: ["strings"],
    tags: ["stack"],
    statement:
      "A lowercase ribbon repeats some letters side by side. While two equal letters are adjacent, remove that pair. Return what remains after every such pair is gone.",
    constraints: ["0 <= ribbon.length <= 10000", "ribbon is lowercase letters."],
    examples: [
      { input: 'ribbon = "abbaca"', output: '"ca"' },
      { input: 'ribbon = "azxxzy"', output: '"ay"' },
    ],
    signature: "string echoTrim(string ribbon)",
    functionName: "echoTrim",
    driver: `printJson(Json::text(sol.echoTrim(in["ribbon"].asString())));`,
    method: `string echoTrim(string ribbon) {
        string stack;
        for (char c : ribbon) {
            if (!stack.empty() && stack.back() == c) stack.pop_back();
            else stack.push_back(c);
        }
        return stack;
    }`,
    expectedTime: "O(n)",
    expectedSpace: "O(n)",
    hints: [
      "Removing a pair can make two new letters touch. You need the most recent letter that is still present.",
      "A string used as a stack stores the ribbon built so far.",
      "If the next letter equals the top, pop the top. Otherwise push the letter.",
      "Each letter is pushed once and popped at most once, so the pass is linear. The stack is the answer, in order. An empty ribbon stays empty.",
    ],
    tests: [
      { input: { ribbon: "abbaca" }, expectedOutput: "ca", visibility: "SAMPLE" },
      { input: { ribbon: "azxxzy" }, expectedOutput: "ay", visibility: "SAMPLE" },
      { input: { ribbon: "" }, expectedOutput: "", visibility: "HIDDEN" },
      { input: { ribbon: "a" }, expectedOutput: "a", visibility: "HIDDEN" },
      { input: { ribbon: "aaa" }, expectedOutput: "a", visibility: "HIDDEN" },
    ],
  }),
  problem({
    slug: "letter-run",
    title: "Is Subsequence",
    difficulty: "EASY",
    topics: ["strings"],
    tags: ["two-pointers"],
    statement:
      "Both strings are lowercase. Return whether pattern can be formed by deleting zero or more letters from text without reordering the letters that stay.",
    constraints: ["0 <= text.length, pattern.length <= 10000", "Both strings are lowercase letters."],
    examples: [
      { input: 'text = "ahbgdc", pattern = "abc"', output: "true" },
      { input: 'text = "ahbgdc", pattern = "axc"', output: "false" },
    ],
    signature: "bool letterRun(string text, string pattern)",
    functionName: "letterRun",
    driver: `printJson(Json::boolean(sol.letterRun(in["text"].asString(), in["pattern"].asString())));`,
    method: `bool letterRun(string text, string pattern) {
        int j = 0;
        for (char c : text) if (j < (int)pattern.size() && c == pattern[j]) j++;
        return j == (int)pattern.size();
    }`,
    expectedTime: "O(n)",
    expectedSpace: "O(1)",
    hints: [
      "The pattern letters must appear in text in the same order. They do not have to be contiguous.",
      "Keep an index into the pattern and walk the text once.",
      "When the current text letter matches the pattern letter you still need, advance the pattern index.",
      "The pattern fits when its index reaches the end. An empty pattern fits any text. A non-empty pattern does not fit an empty text.",
    ],
    tests: [
      { input: { text: "ahbgdc", pattern: "abc" }, expectedOutput: true, visibility: "SAMPLE" },
      { input: { text: "ahbgdc", pattern: "axc" }, expectedOutput: false, visibility: "SAMPLE" },
      { input: { text: "abc", pattern: "" }, expectedOutput: true, visibility: "HIDDEN" },
      { input: { text: "", pattern: "a" }, expectedOutput: false, visibility: "HIDDEN" },
      { input: { text: "abc", pattern: "abc" }, expectedOutput: true, visibility: "HIDDEN" },
    ],
  }),
  problem({
    slug: "note-from-scrap",
    title: "Ransom Note",
    difficulty: "EASY",
    topics: ["strings"],
    tags: ["frequency"],
    statement:
      "A note and a scrap pile are lowercase. Return whether the scrap contains at least as many of each letter as the note requires. Order does not matter.",
    constraints: ["0 <= note.length, scrap.length <= 10000", "Both strings are lowercase letters."],
    examples: [
      { input: 'note = "aa", scrap = "aab"', output: "true" },
      { input: 'note = "aa", scrap = "ab"', output: "false" },
    ],
    signature: "bool noteFromScrap(string note, string scrap)",
    functionName: "noteFromScrap",
    driver: `printJson(Json::boolean(sol.noteFromScrap(in["note"].asString(), in["scrap"].asString())));`,
    method: `bool noteFromScrap(string note, string scrap) {
        array<int, 26> count{};
        for (char c : scrap) count[c - 'a']++;
        for (char c : note) if (--count[c - 'a'] < 0) return false;
        return true;
    }`,
    expectedTime: "O(n + m)",
    expectedSpace: "O(1)",
    hints: [
      "The scrap is a supply of letters. The note is a demand. Positions do not matter.",
      "Count the scrap first.",
      "Spend one count for each letter of the note. If a count would go negative, the scrap is short.",
      "An empty note can always be built. Extra letters in the scrap are fine. The count table is a fixed 26 slots.",
    ],
    tests: [
      { input: { note: "aa", scrap: "aab" }, expectedOutput: true, visibility: "SAMPLE" },
      { input: { note: "aa", scrap: "ab" }, expectedOutput: false, visibility: "SAMPLE" },
      { input: { note: "", scrap: "a" }, expectedOutput: true, visibility: "HIDDEN" },
      { input: { note: "a", scrap: "" }, expectedOutput: false, visibility: "HIDDEN" },
      { input: { note: "abc", scrap: "cbad" }, expectedOutput: true, visibility: "HIDDEN" },
    ],
  }),
  problem({
    slug: "run-code",
    title: "String Compression",
    difficulty: "EASY",
    topics: ["strings"],
    tags: ["scan"],
    statement:
      "Compress a lowercase ribbon by replacing each run of the same letter with that letter and, when the run is longer than one, its length. A single letter stays a single letter.",
    constraints: ["0 <= ribbon.length <= 10000", "ribbon is lowercase letters."],
    examples: [
      { input: 'ribbon = "aaabbc"', output: '"a3b2c"' },
      { input: 'ribbon = "abc"', output: '"abc"' },
    ],
    signature: "string runCode(string ribbon)",
    functionName: "runCode",
    driver: `printJson(Json::text(sol.runCode(in["ribbon"].asString())));`,
    method: `string runCode(string ribbon) {
        string out;
        for (int i = 0; i < (int)ribbon.size();) {
            int j = i;
            while (j < (int)ribbon.size() && ribbon[j] == ribbon[i]) j++;
            out.push_back(ribbon[i]);
            int count = j - i;
            if (count > 1) out += to_string(count);
            i = j;
        }
        return out;
    }`,
    expectedTime: "O(n)",
    expectedSpace: "O(n)",
    hints: [
      "Equal letters only collapse when they form one contiguous run. A later repeat of the same letter starts a new piece.",
      "Walk with an index. From the current letter, advance while the letter stays the same.",
      "Write the letter. Write the decimal length only when it is greater than one. Then continue at the first different letter.",
      "An empty ribbon stays empty. A ribbon of distinct letters is unchanged. The output is built in one pass.",
    ],
    tests: [
      { input: { ribbon: "aaabbc" }, expectedOutput: "a3b2c", visibility: "SAMPLE" },
      { input: { ribbon: "abc" }, expectedOutput: "abc", visibility: "SAMPLE" },
      { input: { ribbon: "" }, expectedOutput: "", visibility: "HIDDEN" },
      { input: { ribbon: "a" }, expectedOutput: "a", visibility: "HIDDEN" },
      { input: { ribbon: "aabb" }, expectedOutput: "a2b2", visibility: "HIDDEN" },
    ],
  }),
  problem({
    slug: "odd-label",
    title: "Largest Odd Number in a String",
    difficulty: "EASY",
    topics: ["strings"],
    tags: ["scan"],
    statement:
      "A label is a string of digits. Return the longest prefix that ends with an odd digit. If no digit is odd, return an empty string. Do not drop leading zeros that belong to that prefix.",
    constraints: ["1 <= label.length <= 100", "label contains only digits."],
    examples: [
      { input: 'label = "52"', output: '"5"' },
      { input: 'label = "4206"', output: '""' },
      { input: 'label = "35427"', output: '"35427"' },
    ],
    signature: "string oddLabel(string label)",
    functionName: "oddLabel",
    driver: `printJson(Json::text(sol.oddLabel(in["label"].asString())));`,
    method: `string oddLabel(string label) {
        for (int i = (int)label.size() - 1; i >= 0; i--) {
            if ((label[i] - '0') % 2 == 1) return label.substr(0, i + 1);
        }
        return "";
    }`,
    expectedTime: "O(n)",
    expectedSpace: "O(n)",
    hints: [
      "A longer prefix is better, so the cut should be as far right as possible.",
      "An odd digit is 1, 3, 5, 7, or 9. The prefix must end on one of those.",
      "Scan from the right and stop at the first odd digit. Return everything up to and including it.",
      "If the scan reaches the front without an odd digit, the answer is empty. The digits are characters, so convert before testing parity.",
    ],
    tests: [
      { input: { label: "52" }, expectedOutput: "5", visibility: "SAMPLE" },
      { input: { label: "4206" }, expectedOutput: "", visibility: "SAMPLE" },
      { input: { label: "35427" }, expectedOutput: "35427", visibility: "HIDDEN" },
      { input: { label: "8" }, expectedOutput: "", visibility: "HIDDEN" },
      { input: { label: "135" }, expectedOutput: "135", visibility: "HIDDEN" },
    ],
  }),
  problem({
    slug: "word-flip",
    title: "Reverse Words in a String",
    difficulty: "MEDIUM",
    topics: ["strings"],
    tags: ["two-pointers"],
    statement:
      "A line contains lowercase words separated by one or more spaces, and it may have spaces at either end. Return the words in reverse order, separated by a single space, with no spaces at the ends.",
    constraints: ["0 <= line.length <= 10000", "line contains lowercase letters and spaces."],
    examples: [
      { input: 'line = "  hello world  "', output: '"world hello"' },
      { input: 'line = "a good   example"', output: '"example good a"' },
    ],
    signature: "string wordFlip(string line)",
    functionName: "wordFlip",
    driver: `printJson(Json::text(sol.wordFlip(in["line"].asString())));`,
    method: `string wordFlip(string line) {
        string word, out;
        for (int i = (int)line.size() - 1; i >= 0; i--) {
            if (line[i] != ' ') word.push_back(line[i]);
            else if (!word.empty()) {
                reverse(word.begin(), word.end());
                if (!out.empty()) out.push_back(' ');
                out += word;
                word.clear();
            }
        }
        if (!word.empty()) {
            reverse(word.begin(), word.end());
            if (!out.empty()) out.push_back(' ');
            out += word;
        }
        return out;
    }`,
    expectedTime: "O(n)",
    expectedSpace: "O(n)",
    hints: [
      "The words themselves stay spelled forward. Only their order changes, and extra spaces disappear.",
      "Reading from the right finds the last word first. Collect its letters, then reverse that one word.",
      "Skip runs of spaces. Put a single space before a word only when the output already has something.",
      "A line that is empty or only spaces returns an empty string. One word with surrounding spaces returns that word alone.",
    ],
    tests: [
      { input: { line: "  hello world  " }, expectedOutput: "world hello", visibility: "SAMPLE" },
      { input: { line: "a good   example" }, expectedOutput: "example good a", visibility: "SAMPLE" },
      { input: { line: "hello" }, expectedOutput: "hello", visibility: "HIDDEN" },
      { input: { line: "  a  " }, expectedOutput: "a", visibility: "HIDDEN" },
      { input: { line: "" }, expectedOutput: "", visibility: "HIDDEN" },
    ],
  }),
  problem({
    slug: "mirror-core",
    title: "Longest Palindromic Substring",
    difficulty: "MEDIUM",
    topics: ["strings"],
    tags: ["expand"],
    statement:
      "A lowercase ribbon hides palindromic stretches. Return the longest one. If several have that length, return the one that starts farthest left.",
    constraints: ["0 <= ribbon.length <= 1000", "ribbon is lowercase letters."],
    examples: [
      { input: 'ribbon = "babad"', output: '"bab"' },
      { input: 'ribbon = "cbbd"', output: '"bb"' },
    ],
    signature: "string mirrorCore(string ribbon)",
    functionName: "mirrorCore",
    driver: `printJson(Json::text(sol.mirrorCore(in["ribbon"].asString())));`,
    method: `string mirrorCore(string ribbon) {
        int n = (int)ribbon.size(), best = 0, start = 0;
        auto grow = [&](int left, int right) {
            while (left >= 0 && right < n && ribbon[left] == ribbon[right]) { left--; right++; }
            int len = right - left - 1;
            if (len > best) { best = len; start = left + 1; }
        };
        for (int i = 0; i < n; i++) { grow(i, i); grow(i, i + 1); }
        return ribbon.substr(start, best);
    }`,
    expectedTime: "O(n^2)",
    expectedSpace: "O(1)",
    hints: [
      "Every palindrome has a center. The center is one letter, or the gap between two equal letters.",
      "From each center, expand while the letters on both sides match.",
      "Keep the longest expansion. Replace the saved stretch only when the new one is strictly longer, so an equal later stretch does not win.",
      "A single letter is always a palindrome. An empty ribbon returns an empty string. Trying every center is quadratic, which fits the length limit.",
    ],
    tests: [
      { input: { ribbon: "babad" }, expectedOutput: "bab", visibility: "SAMPLE" },
      { input: { ribbon: "cbbd" }, expectedOutput: "bb", visibility: "SAMPLE" },
      { input: { ribbon: "a" }, expectedOutput: "a", visibility: "HIDDEN" },
      { input: { ribbon: "ac" }, expectedOutput: "a", visibility: "HIDDEN" },
      { input: { ribbon: "aaaa" }, expectedOutput: "aaaa", visibility: "HIDDEN" },
    ],
  }),
  problem({
    slug: "tight-window",
    title: "Minimum Window Substring",
    difficulty: "MEDIUM",
    topics: ["strings"],
    tags: ["sliding-window"],
    statement:
      "Text and need are lowercase. Return the shortest contiguous piece of text that contains every letter of need, including duplicates. If several pieces have that length, return the leftmost. If none exists, return an empty string.",
    constraints: ["0 <= text.length <= 10000", "1 <= need.length <= 10000", "Both strings are lowercase letters."],
    examples: [
      { input: 'text = "adobecodebanc", need = "abc"', output: '"banc"' },
      { input: 'text = "a", need = "aa"', output: '""' },
    ],
    signature: "string tightWindow(string text, string need)",
    functionName: "tightWindow",
    driver: `printJson(Json::text(sol.tightWindow(in["text"].asString(), in["need"].asString())));`,
    method: `string tightWindow(string text, string need) {
        array<int, 26> want{}, have{};
        int kinds = 0;
        for (char c : need) if (want[c - 'a']++ == 0) kinds++;
        int formed = 0, best = INT_MAX, start = 0, lo = 0;
        for (int hi = 0; hi < (int)text.size(); hi++) {
            int c = text[hi] - 'a';
            if (want[c] && ++have[c] == want[c]) formed++;
            while (formed == kinds && lo <= hi) {
                if (hi - lo + 1 < best) { best = hi - lo + 1; start = lo; }
                int d = text[lo++] - 'a';
                if (want[d] && --have[d] < want[d]) formed--;
            }
        }
        return best == INT_MAX ? "" : text.substr(start, best);
    }`,
    expectedTime: "O(n)",
    expectedSpace: "O(1)",
    hints: [
      "The useful windows are the ones that just became complete and the ones you can shrink from the left without losing a required letter.",
      "Count the letters need still requires, and count the letters inside the current window.",
      "Advance the right edge. When every required count is satisfied, record the window if it is strictly shorter than the best, then move the left edge forward.",
      "Duplicates in need must be covered that many times. Updating only on a strictly shorter window keeps the leftmost answer. If the right edge finishes first, no window exists.",
    ],
    tests: [
      { input: { text: "adobecodebanc", need: "abc" }, expectedOutput: "banc", visibility: "SAMPLE" },
      { input: { text: "a", need: "aa" }, expectedOutput: "", visibility: "SAMPLE" },
      { input: { text: "a", need: "a" }, expectedOutput: "a", visibility: "HIDDEN" },
      { input: { text: "ab", need: "b" }, expectedOutput: "b", visibility: "HIDDEN" },
      { input: { text: "aa", need: "aa" }, expectedOutput: "aa", visibility: "HIDDEN" },
    ],
  }),
  problem({
    slug: "paint-run",
    title: "Longest Repeating Character Replacement",
    difficulty: "MEDIUM",
    topics: ["strings"],
    tags: ["sliding-window"],
    statement:
      "A lowercase ribbon can have at most budget letters replaced. Return the length of the longest stretch that can be made into one repeated letter within that budget.",
    constraints: ["0 <= ribbon.length <= 10000", "0 <= budget <= ribbon.length", "ribbon is lowercase letters."],
    examples: [
      { input: 'ribbon = "abab", budget = 2', output: "4" },
      { input: 'ribbon = "aababba", budget = 1', output: "4" },
    ],
    signature: "int paintRun(string ribbon, int budget)",
    functionName: "paintRun",
    driver: `printJson(Json::number(sol.paintRun(in["ribbon"].asString(), (int)in["budget"].asInt())));`,
    method: `int paintRun(string ribbon, int budget) {
        array<int, 26> freq{};
        int lo = 0, best = 0, top = 0;
        for (int hi = 0; hi < (int)ribbon.size(); hi++) {
            top = max(top, ++freq[ribbon[hi] - 'a']);
            while (hi - lo + 1 - top > budget) freq[ribbon[lo++] - 'a']--;
            best = max(best, hi - lo + 1);
        }
        return best;
    }`,
    expectedTime: "O(n)",
    expectedSpace: "O(1)",
    hints: [
      "A window can become one letter when its length minus its most common letter is within the budget.",
      "Slide a window and keep the frequency of each letter inside it.",
      "Track the highest frequency seen. While the window needs more replacements than the budget, move the left edge.",
      "The highest frequency does not have to fall when the window shrinks. A later window only matters if it is longer, and a longer window would have needed an even higher peak to stay valid. The answer is the longest valid window.",
    ],
    tests: [
      { input: { ribbon: "abab", budget: 2 }, expectedOutput: 4, visibility: "SAMPLE" },
      { input: { ribbon: "aababba", budget: 1 }, expectedOutput: 4, visibility: "SAMPLE" },
      { input: { ribbon: "aaaa", budget: 0 }, expectedOutput: 4, visibility: "HIDDEN" },
      { input: { ribbon: "abc", budget: 0 }, expectedOutput: 1, visibility: "HIDDEN" },
      { input: { ribbon: "a", budget: 1 }, expectedOutput: 1, visibility: "HIDDEN" },
    ],
  }),
  problem({
    slug: "fold-code",
    title: "Decode String",
    difficulty: "MEDIUM",
    topics: ["strings"],
    tags: ["stack"],
    statement:
      "A fold code mixes lowercase letters with repeats written as count[inner]. The count is a positive integer without a leading zero, and inner is itself a fold code. Return the unfolded text.",
    constraints: ["0 <= code.length <= 200", "The unfolded text has length at most 10000.", "Brackets are balanced and every count is followed by a bracket group."],
    examples: [
      { input: 'code = "3[a]2[bc]"', output: '"aaabcbc"' },
      { input: 'code = "3[a2[c]]"', output: '"accaccacc"' },
    ],
    signature: "string foldCode(string code)",
    functionName: "foldCode",
    driver: `printJson(Json::text(sol.foldCode(in["code"].asString())));`,
    method: `string foldCode(string code) {
        int i = 0;
        function<string()> parse = [&]() {
            string out;
            while (i < (int)code.size() && code[i] != ']') {
                if (isdigit(static_cast<unsigned char>(code[i]))) {
                    int n = 0;
                    while (i < (int)code.size() && isdigit(static_cast<unsigned char>(code[i]))) n = n * 10 + (code[i++] - '0');
                    i++;
                    string inner = parse();
                    i++;
                    out.reserve(out.size() + (size_t)n * inner.size());
                    for (int t = 0; t < n; t++) out += inner;
                } else out.push_back(code[i++]);
            }
            return out;
        };
        return parse();
    }`,
    expectedTime: "O(unfolded length)",
    expectedSpace: "O(unfolded length)",
    hints: [
      "A bracket group is a smaller copy of the same problem. The count in front says how many times to repeat that copy.",
      "Parse from left to right. Letters are copied once. A number starts a group.",
      "Read the whole number, skip the opening bracket, parse until the matching closer, then append the inner text count times.",
      "Nested groups return before the outer count is applied, so 3[a2[c]] becomes three copies of a plus cc. A code with no brackets is already unfolded.",
    ],
    tests: [
      { input: { code: "3[a]2[bc]" }, expectedOutput: "aaabcbc", visibility: "SAMPLE" },
      { input: { code: "3[a2[c]]" }, expectedOutput: "accaccacc", visibility: "SAMPLE" },
      { input: { code: "2[abc]3[cd]ef" }, expectedOutput: "abcabccdcdcdef", visibility: "HIDDEN" },
      { input: { code: "abc" }, expectedOutput: "abc", visibility: "HIDDEN" },
      { input: { code: "10[a]" }, expectedOutput: "aaaaaaaaaa", visibility: "HIDDEN" },
    ],
  }),
  problem({
    slug: "label-sum",
    title: "Add Strings",
    difficulty: "MEDIUM",
    topics: ["strings"],
    tags: ["scan"],
    statement:
      "Two labels are non-negative integers written as digit strings, without leading zeros except for the single digit 0. Return their sum as a digit string in the same style.",
    constraints: ["1 <= left.length, right.length <= 200", "Each label is 0 or has no leading zero."],
    examples: [
      { input: 'left = "11", right = "123"', output: '"134"' },
      { input: 'left = "999", right = "1"', output: '"1000"' },
    ],
    signature: "string labelSum(string left, string right)",
    functionName: "labelSum",
    driver: `printJson(Json::text(sol.labelSum(in["left"].asString(), in["right"].asString())));`,
    method: `string labelSum(string left, string right) {
        string out;
        int i = (int)left.size() - 1, j = (int)right.size() - 1, carry = 0;
        while (i >= 0 || j >= 0 || carry) {
            int sum = carry;
            if (i >= 0) sum += left[i--] - '0';
            if (j >= 0) sum += right[j--] - '0';
            out.push_back('0' + sum % 10);
            carry = sum / 10;
        }
        reverse(out.begin(), out.end());
        return out;
    }`,
    expectedTime: "O(n + m)",
    expectedSpace: "O(max(n, m))",
    hints: [
      "The labels can be longer than a fixed-width integer. Add them the way you add on paper, from the right.",
      "Keep a carry of 0 or 1. It is part of the next column.",
      "Add the two digits in the current column, plus the carry. Write the units digit and keep the tens digit as the new carry.",
      "Continue while either label or the carry remains. The digits were produced from right to left, so reverse them before returning. 0 plus 0 is 0.",
    ],
    tests: [
      { input: { left: "11", right: "123" }, expectedOutput: "134", visibility: "SAMPLE" },
      { input: { left: "999", right: "1" }, expectedOutput: "1000", visibility: "SAMPLE" },
      { input: { left: "0", right: "0" }, expectedOutput: "0", visibility: "HIDDEN" },
      { input: { left: "5", right: "5" }, expectedOutput: "10", visibility: "HIDDEN" },
      { input: { left: "100", right: "200" }, expectedOutput: "300", visibility: "HIDDEN" },
    ],
  }),
  problem({
    slug: "release-order",
    title: "Compare Version Numbers",
    difficulty: "MEDIUM",
    topics: ["strings"],
    tags: ["scan"],
    statement:
      "Two release names are dot-separated revisions, such as 1.0 and 1.0.0. Each revision is a non-negative integer and may contain leading zeros. Return -1 when left is older, 1 when left is newer, and 0 when they are the same release. Missing revisions count as zero.",
    constraints: ["1 <= left.length, right.length <= 100", "Each revision has at most 9 digits.", "Names match digits separated by single dots."],
    examples: [
      { input: 'left = "1.01", right = "1.001"', output: "0" },
      { input: 'left = "0.1", right = "1.1"', output: "-1" },
    ],
    signature: "int releaseOrder(string left, string right)",
    functionName: "releaseOrder",
    driver: `printJson(Json::number(sol.releaseOrder(in["left"].asString(), in["right"].asString())));`,
    method: `int releaseOrder(string left, string right) {
        auto next = [](const string& text, int& i) {
            long long value = 0;
            while (i < (int)text.size() && text[i] != '.') value = value * 10 + (text[i++] - '0');
            if (i < (int)text.size() && text[i] == '.') i++;
            return value;
        };
        int i = 0, j = 0;
        while (i < (int)left.size() || j < (int)right.size()) {
            long long a = i < (int)left.size() ? next(left, i) : 0;
            long long b = j < (int)right.size() ? next(right, j) : 0;
            if (a < b) return -1;
            if (a > b) return 1;
        }
        return 0;
    }`,
    expectedTime: "O(n + m)",
    expectedSpace: "O(1)",
    hints: [
      "Compare revision by revision from the left. Leading zeros do not change a revision's value.",
      "Parse one integer from each name. A name that has run out of revisions supplies zero.",
      "The first unequal pair decides the order. Skip the dot after a revision so the next parse starts on a digit.",
      "1.0 and 1.0.0 are the same release because the extra revision is zero. Convert digit characters before comparing, and keep the numeric value in a 64-bit integer.",
    ],
    tests: [
      { input: { left: "1.01", right: "1.001" }, expectedOutput: 0, visibility: "SAMPLE" },
      { input: { left: "0.1", right: "1.1" }, expectedOutput: -1, visibility: "SAMPLE" },
      { input: { left: "1.0", right: "1.0.0" }, expectedOutput: 0, visibility: "HIDDEN" },
      { input: { left: "1.0.1", right: "1" }, expectedOutput: 1, visibility: "HIDDEN" },
      { input: { left: "1.2", right: "1.10" }, expectedOutput: -1, visibility: "HIDDEN" },
    ],
  }),
  problem({
    slug: "burst-marks",
    title: "Remove All Adjacent Duplicates in String II",
    difficulty: "MEDIUM",
    topics: ["strings"],
    tags: ["stack"],
    statement:
      "Marks are lowercase letters. Whenever limit copies of the same letter sit together, remove that whole group. Removals can create a new group. Return the marks that remain.",
    constraints: ["0 <= marks.length <= 10000", "1 <= limit <= 10000", "marks is lowercase letters."],
    examples: [
      { input: 'marks = "deeedbbcccbdaa", limit = 3', output: '"aa"' },
      { input: 'marks = "pbbcggttciiippooaais", limit = 2', output: '"ps"' },
    ],
    signature: "string burstMarks(string marks, int limit)",
    functionName: "burstMarks",
    driver: `printJson(Json::text(sol.burstMarks(in["marks"].asString(), (int)in["limit"].asInt())));`,
    method: `string burstMarks(string marks, int limit) {
        vector<pair<char, int>> stack;
        for (char c : marks) {
            if (!stack.empty() && stack.back().first == c) stack.back().second++;
            else stack.push_back({c, 1});
            if (stack.back().second == limit) stack.pop_back();
        }
        string out;
        for (auto [c, count] : stack) out.append(count, c);
        return out;
    }`,
    expectedTime: "O(n)",
    expectedSpace: "O(n)",
    hints: [
      "A group is removed only when its length reaches the limit, and only the current adjacent run counts.",
      "Store pairs of letter and run length. The top pair is the run still open.",
      "If the next mark matches the top, increase its count. Otherwise start a new pair. When a count hits the limit, pop that pair so the letters underneath become adjacent.",
      "Write the remaining pairs back out in order. Each mark is pushed once and popped at most once. A limit of 1 clears every mark.",
    ],
    tests: [
      { input: { marks: "deeedbbcccbdaa", limit: 3 }, expectedOutput: "aa", visibility: "SAMPLE" },
      { input: { marks: "pbbcggttciiippooaais", limit: 2 }, expectedOutput: "ps", visibility: "SAMPLE" },
      { input: { marks: "abcd", limit: 2 }, expectedOutput: "abcd", visibility: "HIDDEN" },
      { input: { marks: "aaa", limit: 3 }, expectedOutput: "", visibility: "HIDDEN" },
      { input: { marks: "aa", limit: 2 }, expectedOutput: "", visibility: "HIDDEN" },
    ],
  }),
  problem({
    slug: "shape-match",
    title: "Isomorphic Strings",
    difficulty: "MEDIUM",
    topics: ["strings"],
    tags: ["map"],
    statement:
      "Two lowercase words have the same shape when one can be renamed letter by letter onto the other, and the renaming is reversible. Return whether they have the same shape.",
    constraints: ["0 <= left.length, right.length <= 10000", "Both words are lowercase letters."],
    examples: [
      { input: 'left = "egg", right = "add"', output: "true" },
      { input: 'left = "foo", right = "bar"', output: "false" },
    ],
    signature: "bool shapeMatch(string left, string right)",
    functionName: "shapeMatch",
    driver: `printJson(Json::boolean(sol.shapeMatch(in["left"].asString(), in["right"].asString())));`,
    method: `bool shapeMatch(string left, string right) {
        if (left.size() != right.size()) return false;
        array<int, 26> to{}, from{};
        to.fill(-1); from.fill(-1);
        for (int i = 0; i < (int)left.size(); i++) {
            int x = left[i] - 'a', y = right[i] - 'a';
            if (to[x] == -1 && from[y] == -1) { to[x] = y; from[y] = x; }
            else if (to[x] != y || from[y] != x) return false;
        }
        return true;
    }`,
    expectedTime: "O(n)",
    expectedSpace: "O(1)",
    hints: [
      "Each letter on the left must always rename to the same letter on the right, and that right letter cannot also belong to a different left letter.",
      "Different lengths fail immediately. Then keep two maps, one in each direction.",
      "On the first time you see a pair, record both directions. Later, both maps must still agree with that pair.",
      "A single map is not enough: egg and add works, but ab and aa would let two left letters collapse onto one right letter. The reverse map stops that.",
    ],
    tests: [
      { input: { left: "egg", right: "add" }, expectedOutput: true, visibility: "SAMPLE" },
      { input: { left: "foo", right: "bar" }, expectedOutput: false, visibility: "SAMPLE" },
      { input: { left: "paper", right: "title" }, expectedOutput: true, visibility: "HIDDEN" },
      { input: { left: "a", right: "b" }, expectedOutput: true, visibility: "HIDDEN" },
      { input: { left: "ab", right: "aa" }, expectedOutput: false, visibility: "HIDDEN" },
    ],
  }),
  problem({
    slug: "desk-pattern",
    title: "Word Pattern",
    difficulty: "MEDIUM",
    topics: ["strings"],
    tags: ["map"],
    statement:
      "A pattern is lowercase letters. A phrase is lowercase words separated by single spaces. Return whether the pattern and the phrase describe the same pairing: equal pattern letters always sit on the same word, and different pattern letters sit on different words.",
    constraints: ["The pattern and the phrase have the same number of words.", "1 <= pattern.length <= 100", "Words are non-empty lowercase letters."],
    examples: [
      { input: 'pattern = "abba", phrase = "dog cat cat dog"', output: "true" },
      { input: 'pattern = "abba", phrase = "dog cat cat fish"', output: "false" },
    ],
    signature: "bool deskPattern(string pattern, string phrase)",
    functionName: "deskPattern",
    driver: `printJson(Json::boolean(sol.deskPattern(in["pattern"].asString(), in["phrase"].asString())));`,
    method: `bool deskPattern(string pattern, string phrase) {
        vector<string> words;
        string word;
        for (char c : phrase) {
            if (c == ' ') { words.push_back(word); word.clear(); }
            else word.push_back(c);
        }
        words.push_back(word);
        if (words.size() != pattern.size()) return false;
        unordered_map<char, string> toWord;
        unordered_map<string, char> toChar;
        for (int i = 0; i < (int)pattern.size(); i++) {
            char c = pattern[i];
            const string& token = words[i];
            if (!toWord.count(c) && !toChar.count(token)) { toWord[c] = token; toChar[token] = c; }
            else if (!toWord.count(c) || !toChar.count(token) || toWord[c] != token || toChar[token] != c) return false;
        }
        return true;
    }`,
    expectedTime: "O(n)",
    expectedSpace: "O(n)",
    hints: [
      "This is the same reversible renaming as a letter shape, except one side is a word instead of a letter.",
      "Split the phrase on single spaces. The number of words must equal the pattern length.",
      "Map each new pattern letter to its word and each new word back to its letter. A repeat must hit the same pair.",
      "abba cannot sit on four copies of one word, because the reverse map would give that word two pattern letters. A pattern of one letter matches a phrase of one word.",
    ],
    tests: [
      { input: { pattern: "abba", phrase: "dog cat cat dog" }, expectedOutput: true, visibility: "SAMPLE" },
      { input: { pattern: "abba", phrase: "dog cat cat fish" }, expectedOutput: false, visibility: "SAMPLE" },
      { input: { pattern: "aaaa", phrase: "dog cat cat dog" }, expectedOutput: false, visibility: "HIDDEN" },
      { input: { pattern: "abba", phrase: "dog dog dog dog" }, expectedOutput: false, visibility: "HIDDEN" },
      { input: { pattern: "a", phrase: "dog" }, expectedOutput: true, visibility: "HIDDEN" },
    ],
  }),
  problem({
    slug: "few-kinds",
    title: "Longest Substring with At Most K Distinct Characters",
    difficulty: "MEDIUM",
    topics: ["strings"],
    tags: ["sliding-window"],
    statement: "A lowercase log may use many letters. Return the length of the longest contiguous piece that uses at most kinds distinct letters.",
    constraints: ["0 <= log.length <= 10000", "0 <= kinds <= 26", "log is lowercase letters."],
    examples: [
      { input: 'log = "eceba", kinds = 2', output: "3" },
      { input: 'log = "aa", kinds = 1', output: "2" },
    ],
    signature: "int fewKinds(string log, int kinds)",
    functionName: "fewKinds",
    driver: `printJson(Json::number(sol.fewKinds(in["log"].asString(), (int)in["kinds"].asInt())));`,
    method: `int fewKinds(string log, int kinds) {
        if (kinds == 0) return 0;
        array<int, 26> freq{};
        int lo = 0, used = 0, best = 0;
        for (int hi = 0; hi < (int)log.size(); hi++) {
            if (freq[log[hi] - 'a']++ == 0) used++;
            while (used > kinds) if (--freq[log[lo++] - 'a'] == 0) used--;
            best = max(best, hi - lo + 1);
        }
        return best;
    }`,
    expectedTime: "O(n)",
    expectedSpace: "O(1)",
    hints: [
      "Adding a letter on the right can introduce a new kind. When the window has too many kinds, letters have to leave from the left.",
      "Keep a frequency table and a count of how many frequencies are positive.",
      "Move the left edge until the number of positive frequencies is back within the limit. The window length at that moment is a candidate.",
      "Zero kinds can only cover an empty piece, so the answer is 0. Each index enters and leaves once, which makes the scan linear.",
    ],
    tests: [
      { input: { log: "eceba", kinds: 2 }, expectedOutput: 3, visibility: "SAMPLE" },
      { input: { log: "aa", kinds: 1 }, expectedOutput: 2, visibility: "SAMPLE" },
      { input: { log: "abc", kinds: 1 }, expectedOutput: 1, visibility: "HIDDEN" },
      { input: { log: "", kinds: 1 }, expectedOutput: 0, visibility: "HIDDEN" },
      { input: { log: "aabbcc", kinds: 2 }, expectedOutput: 4, visibility: "HIDDEN" },
    ],
  }),
  problem({
    slug: "mirror-count",
    title: "Palindromic Substrings",
    difficulty: "MEDIUM",
    topics: ["strings"],
    tags: ["expand"],
    statement: "Count every contiguous palindrome inside a lowercase ribbon. Single letters count. Different centers count separately, even when their text is the same.",
    constraints: ["0 <= ribbon.length <= 1000", "ribbon is lowercase letters."],
    examples: [
      { input: 'ribbon = "abc"', output: "3" },
      { input: 'ribbon = "aaa"', output: "6" },
    ],
    signature: "int mirrorCount(string ribbon)",
    functionName: "mirrorCount",
    driver: `printJson(Json::number(sol.mirrorCount(in["ribbon"].asString())));`,
    method: `int mirrorCount(string ribbon) {
        int n = (int)ribbon.size(), count = 0;
        for (int center = 0; center < 2 * n - 1; center++) {
            int left = center / 2, right = left + center % 2;
            while (left >= 0 && right < n && ribbon[left] == ribbon[right]) { count++; left--; right++; }
        }
        return count;
    }`,
    expectedTime: "O(n^2)",
    expectedSpace: "O(1)",
    hints: [
      "You are counting stretches, not distinct texts. Three equal letters hide more than three palindromes.",
      "Each palindrome grows from a center. There are centers on letters and centers between letters.",
      "Expand from every center. Each successful step is one more palindrome, because every expansion is itself a palindrome.",
      "An empty ribbon has zero. A ribbon of one letter has one. The expansions overlap in time, and the total work is quadratic.",
    ],
    tests: [
      { input: { ribbon: "abc" }, expectedOutput: 3, visibility: "SAMPLE" },
      { input: { ribbon: "aaa" }, expectedOutput: 6, visibility: "SAMPLE" },
      { input: { ribbon: "a" }, expectedOutput: 1, visibility: "HIDDEN" },
      { input: { ribbon: "" }, expectedOutput: 0, visibility: "HIDDEN" },
      { input: { ribbon: "abba" }, expectedOutput: 6, visibility: "HIDDEN" },
    ],
  }),
  problem({
    slug: "border-length",
    title: "Longest Prefix Suffix",
    difficulty: "MEDIUM",
    topics: ["strings"],
    tags: ["prefix-function"],
    statement:
      "A border of a lowercase word is a proper prefix that is also a suffix. Return the length of the longest border. A word shorter than two letters has border length 0.",
    constraints: ["0 <= word.length <= 10000", "word is lowercase letters."],
    examples: [
      { input: 'word = "abab"', output: "2" },
      { input: 'word = "abc"', output: "0" },
    ],
    signature: "int borderLength(string word)",
    functionName: "borderLength",
    driver: `printJson(Json::number(sol.borderLength(in["word"].asString())));`,
    method: `int borderLength(string word) {
        int n = (int)word.size();
        if (n == 0) return 0;
        vector<int> border(n);
        int len = 0;
        for (int i = 1; i < n; i++) {
            while (len && word[i] != word[len]) len = border[len - 1];
            if (word[i] == word[len]) len++;
            border[i] = len;
        }
        return border[n - 1];
    }`,
    expectedTime: "O(n)",
    expectedSpace: "O(n)",
    hints: [
      "The longest border of the whole word is the last value of the prefix table used by string search.",
      "border[i] is the longest border of the prefix that ends at i. It is proper, so it is never i + 1.",
      "When the next letter continues the current border, increase its length. When it does not, fall back to the border of the current border and try again.",
      "The fallback is what keeps the scan linear: the length only climbs one by one, and every failed step decreases it. The answer is the final entry, or 0 when the word is empty.",
    ],
    tests: [
      { input: { word: "abab" }, expectedOutput: 2, visibility: "SAMPLE" },
      { input: { word: "abc" }, expectedOutput: 0, visibility: "SAMPLE" },
      { input: { word: "aaaa" }, expectedOutput: 3, visibility: "HIDDEN" },
      { input: { word: "a" }, expectedOutput: 0, visibility: "HIDDEN" },
      { input: { word: "abacaba" }, expectedOutput: 3, visibility: "HIDDEN" },
    ],
  }),
  problem({
    slug: "route-words",
    title: "Word Break",
    difficulty: "MEDIUM",
    topics: ["strings", "dynamic-programming"],
    tags: ["dynamic-programming"],
    statement:
      "A lowercase route can be split into dictionary words, which may be reused. Return whether some split uses the entire route. An empty route is already split.",
    constraints: ["0 <= route.length <= 200", "0 <= words.length <= 100", "1 <= words[i].length <= 20", "words[i] is lowercase letters."],
    examples: [
      { input: 'route = "leetcode", words = ["leet", "code"]', output: "true" },
      { input: 'route = "catsandog", words = ["cats", "dog", "sand", "and", "cat"]', output: "false" },
    ],
    signature: "bool routeWords(string route, vector<string>& words)",
    functionName: "routeWords",
    driver: `auto words = in["words"].asStrings();\n    printJson(Json::boolean(sol.routeWords(in["route"].asString(), words)));`,
    method: `bool routeWords(string route, vector<string>& words) {
        unordered_set<string> dict(words.begin(), words.end());
        int n = (int)route.size();
        vector<char> ok(n + 1);
        ok[0] = 1;
        for (int i = 0; i < n; i++) if (ok[i]) {
            for (int j = i + 1; j <= n && j - i <= 20; j++) {
                if (dict.count(route.substr(i, j - i))) ok[j] = 1;
            }
        }
        return ok[n];
    }`,
    expectedTime: "O(n^2)",
    expectedSpace: "O(n + dictionary)",
    hints: [
      "A split exists for a prefix when some dictionary word ends there and the prefix before that word also splits.",
      "Put the dictionary in a set. Let ok[i] mean the first i letters can be split. ok[0] is true.",
      "From every reachable i, try end positions i + 1 onward, but no farther than the longest word you allow. Mark the end when the slice is in the dictionary.",
      "The route works when ok at the full length is true. Reusing a word is free because the set does not consume it. An empty route succeeds before the loop.",
    ],
    tests: [
      { input: { route: "leetcode", words: ["leet", "code"] }, expectedOutput: true, visibility: "SAMPLE" },
      { input: { route: "catsandog", words: ["cats", "dog", "sand", "and", "cat"] }, expectedOutput: false, visibility: "SAMPLE" },
      { input: { route: "applepenapple", words: ["apple", "pen"] }, expectedOutput: true, visibility: "HIDDEN" },
      { input: { route: "a", words: ["a"] }, expectedOutput: true, visibility: "HIDDEN" },
      { input: { route: "a", words: ["b"] }, expectedOutput: false, visibility: "HIDDEN" },
    ],
  }),
  problem({
    slug: "label-product",
    title: "Multiply Strings",
    difficulty: "HARD",
    topics: ["strings"],
    tags: ["scan"],
    statement:
      "Two labels are non-negative integers written as digit strings, without leading zeros except for the single digit 0. Return their product as a digit string in the same style.",
    constraints: ["1 <= left.length, right.length <= 200", "Each label is 0 or has no leading zero."],
    examples: [
      { input: 'left = "2", right = "3"', output: '"6"' },
      { input: 'left = "123", right = "456"', output: '"56088"' },
    ],
    signature: "string labelProduct(string left, string right)",
    functionName: "labelProduct",
    driver: `printJson(Json::text(sol.labelProduct(in["left"].asString(), in["right"].asString())));`,
    method: `string labelProduct(string left, string right) {
        if (left == "0" || right == "0") return "0";
        int n = (int)left.size(), m = (int)right.size();
        vector<int> acc(n + m);
        for (int i = n - 1; i >= 0; i--) {
            for (int j = m - 1; j >= 0; j--) {
                int mul = (left[i] - '0') * (right[j] - '0') + acc[i + j + 1];
                acc[i + j + 1] = mul % 10;
                acc[i + j] += mul / 10;
            }
        }
        string out;
        int i = 0;
        while (i < n + m && acc[i] == 0) i++;
        for (; i < n + m; i++) out.push_back('0' + acc[i]);
        return out;
    }`,
    expectedTime: "O(n * m)",
    expectedSpace: "O(n + m)",
    hints: [
      "The product of an n-digit number and an m-digit number has at most n + m digits. Grade-school multiplication still works on characters.",
      "Store digits in an array of size n + m, with the ones place at the right.",
      "Digit i of the left label and digit j of the right label contribute to position i + j + 1, with carry into i + j.",
      "Skip leading zeros in the array before you build the string. If either label is 0, return 0 without multiplying. Each pair of digits is visited once.",
    ],
    tests: [
      { input: { left: "2", right: "3" }, expectedOutput: "6", visibility: "SAMPLE" },
      { input: { left: "123", right: "456" }, expectedOutput: "56088", visibility: "SAMPLE" },
      { input: { left: "0", right: "52" }, expectedOutput: "0", visibility: "HIDDEN" },
      { input: { left: "9", right: "9" }, expectedOutput: "81", visibility: "HIDDEN" },
      { input: { left: "10", right: "10" }, expectedOutput: "100", visibility: "HIDDEN" },
    ],
  }),
  problem({
    slug: "wild-mask",
    title: "Wildcard Matching",
    difficulty: "HARD",
    topics: ["strings", "dynamic-programming"],
    tags: ["dynamic-programming"],
    statement:
      "A mask matches a lowercase text when the whole text is consumed. In the mask, ? matches one letter and * matches any sequence of letters, including the empty sequence. Return whether the mask matches the text.",
    constraints: ["0 <= text.length, mask.length <= 200", "text is lowercase letters.", "mask contains lowercase letters, ?, and *."],
    examples: [
      { input: 'text = "aa", mask = "*"', output: "true" },
      { input: 'text = "adceb", mask = "*a*b"', output: "true" },
      { input: 'text = "acdcb", mask = "a*c?b"', output: "false" },
    ],
    signature: "bool wildMask(string text, string mask)",
    functionName: "wildMask",
    driver: `printJson(Json::boolean(sol.wildMask(in["text"].asString(), in["mask"].asString())));`,
    method: `bool wildMask(string text, string mask) {
        int n = (int)text.size(), m = (int)mask.size();
        vector<char> prev(m + 1), cur(m + 1);
        prev[0] = 1;
        for (int j = 1; j <= m; j++) prev[j] = mask[j - 1] == '*' && prev[j - 1];
        for (int i = 1; i <= n; i++) {
            cur[0] = 0;
            for (int j = 1; j <= m; j++) {
                if (mask[j - 1] == '*') cur[j] = cur[j - 1] || prev[j];
                else cur[j] = prev[j - 1] && (mask[j - 1] == '?' || mask[j - 1] == text[i - 1]);
            }
            swap(prev, cur);
        }
        return prev[m];
    }`,
    expectedTime: "O(n * m)",
    expectedSpace: "O(m)",
    hints: [
      "Whether a prefix of the mask matches a prefix of the text depends on one shorter choice.",
      "Let a cell mean the first i letters of text match the first j characters of the mask. The empty mask matches only the empty text, except a run of stars at the front can still match empty.",
      "A letter or ? consumes one text letter and the previous mask prefix. A star either consumes no text letter, using the previous mask character, or consumes one more text letter while staying on the same star.",
      "The answer is the cell for the full text and the full mask. Two rolling rows are enough. Stars are greedy only through those two choices, so they can match an empty span or a long one.",
    ],
    tests: [
      { input: { text: "aa", mask: "*" }, expectedOutput: true, visibility: "SAMPLE" },
      { input: { text: "adceb", mask: "*a*b" }, expectedOutput: true, visibility: "SAMPLE" },
      { input: { text: "acdcb", mask: "a*c?b" }, expectedOutput: false, visibility: "HIDDEN" },
      { input: { text: "aa", mask: "a" }, expectedOutput: false, visibility: "HIDDEN" },
      { input: { text: "cb", mask: "?a" }, expectedOutput: false, visibility: "HIDDEN" },
    ],
  }),
  problem({
    slug: "front-mirror",
    title: "Shortest Palindrome",
    difficulty: "HARD",
    topics: ["strings"],
    tags: ["prefix-function"],
    statement:
      "Add as few lowercase letters as possible in front of a lowercase word so the whole result is a palindrome. Return that result. Adding nothing is allowed when the word is already a palindrome.",
    constraints: ["0 <= word.length <= 1000", "word is lowercase letters."],
    examples: [
      { input: 'word = "aacecaaa"', output: '"aaacecaaa"' },
      { input: 'word = "abcd"', output: '"dcbabcd"' },
    ],
    signature: "string frontMirror(string word)",
    functionName: "frontMirror",
    driver: `printJson(Json::text(sol.frontMirror(in["word"].asString())));`,
    method: `string frontMirror(string word) {
        string rev = word;
        reverse(rev.begin(), rev.end());
        string mix = word + "#" + rev;
        vector<int> border(mix.size());
        int len = 0;
        for (int i = 1; i < (int)mix.size(); i++) {
            while (len && mix[i] != mix[len]) len = border[len - 1];
            if (mix[i] == mix[len]) len++;
            border[i] = len;
        }
        return rev.substr(0, word.size() - border.back()) + word;
    }`,
    expectedTime: "O(n)",
    expectedSpace: "O(n)",
    hints: [
      "The longest palindromic prefix can stay. Everything after it has to be mirrored onto the front.",
      "That prefix length is the border of word, plus a separator, plus the reverse of word.",
      "Build the prefix table of that mixed string. Its last value is how much of the word is already a palindrome at the front.",
      "The letters you add are the reverse of the unmatched suffix. Put them before the original word. A word that is already a palindrome has a full-length border, so nothing is added.",
    ],
    tests: [
      { input: { word: "aacecaaa" }, expectedOutput: "aaacecaaa", visibility: "SAMPLE" },
      { input: { word: "abcd" }, expectedOutput: "dcbabcd", visibility: "SAMPLE" },
      { input: { word: "a" }, expectedOutput: "a", visibility: "HIDDEN" },
      { input: { word: "aa" }, expectedOutput: "aa", visibility: "HIDDEN" },
      { input: { word: "abb" }, expectedOutput: "bbabb", visibility: "HIDDEN" },
    ],
  }),
];
