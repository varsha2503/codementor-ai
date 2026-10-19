import { problem } from "./helpers.js";

const numbersOut = (call: string) =>
  `auto values = ${call};\n    Json out;\n    out.type = Json::ARR;\n    for (long long value : values) out.a.push_back(Json::number(value));\n    printJson(out);`;

const boolsOut = (call: string) =>
  `auto values = ${call};\n    Json out;\n    out.type = Json::ARR;\n    for (bool value : values) out.a.push_back(Json::boolean(value));\n    printJson(out);`;

export const trieProblems = [
  problem({
    slug: "trie-ops",
    title: "Trie Implementation and Operations",
    difficulty: "HARD",
    topics: ["tries"],
    tags: ["trie"],
    statement:
      "commands are applied to an empty trie of lowercase words. insert word stores the word. search word asks whether that exact word has been inserted. prefix word asks whether any inserted word begins with that text. Return the boolean answers of the search and prefix commands, in the order they appear.",
    constraints: ["1 <= commands.length <= 1000", "Each word has 1 to 20 lowercase letters.", "A command is insert, search, or prefix."],
    examples: [
      {
        input: 'commands = ["insert apple", "search apple", "search app", "prefix app", "insert app", "search app"]',
        output: "[true, false, true, true]",
      },
      { input: 'commands = ["search a", "prefix a"]', output: "[false, false]" },
    ],
    signature: "vector<bool> trieOps(vector<string>& commands)",
    functionName: "trieOps",
    driver: `auto commands = in["commands"].asStrings();\n    ${boolsOut("sol.trieOps(commands)")}`,
    method: `vector<bool> trieOps(vector<string>& commands) {
        struct Node { Node* next[26]{}; bool end = false; int passing = 0; };
        Node root;
        auto walk = [&](const string& word, bool make) -> Node* {
            Node* node = &root;
            for (char ch : word) {
                int bit = ch - 'a';
                if (!node->next[bit]) {
                    if (!make) return nullptr;
                    node->next[bit] = new Node();
                }
                node = node->next[bit];
                if (make) node->passing++;
            }
            return node;
        };
        vector<bool> out;
        for (const string& command : commands) {
            stringstream ss(command);
            string kind, word;
            ss >> kind >> word;
            if (kind == "insert") walk(word, true)->end = true;
            else if (kind == "search") { Node* node = walk(word, false); out.push_back(node && node->end); }
            else { Node* node = walk(word, false); out.push_back(node && node->passing > 0); }
        }
        return out;
    }`,
    expectedTime: "O(total letters)",
    expectedSpace: "O(total letters)",
    hints: [
      "A trie is a tree of letters. Words that share a beginning share the nodes for that beginning.",
      "insert walks the letters and creates a missing child. Mark the last node as the end of a word.",
      "search must reach the end of the word and find that end mark. prefix only needs the path to exist.",
      "A word that was inserted is also a prefix of itself. A prefix of an inserted word is not a stored word until it is inserted on its own.",
    ],
    tests: [
      {
        input: { commands: ["insert apple", "search apple", "search app", "prefix app", "insert app", "search app"] },
        expectedOutput: [true, false, true, true],
        visibility: "SAMPLE",
      },
      { input: { commands: ["search a", "prefix a"] }, expectedOutput: [false, false], visibility: "SAMPLE" },
      { input: { commands: ["insert a"] }, expectedOutput: [], visibility: "HIDDEN" },
      { input: { commands: ["insert a", "prefix a", "search a", "search b"] }, expectedOutput: [true, true, false], visibility: "HIDDEN" },
    ],
  }),
  problem({
    slug: "trie-advanced",
    title: "Trie Implementation and Advanced Operations",
    difficulty: "HARD",
    topics: ["tries"],
    tags: ["trie"],
    statement:
      "commands are applied to an empty trie. insert word stores another copy of the word. count word returns how many copies of that exact word are stored. start word returns how many stored words begin with that text. erase word removes one copy, and it is used only when at least one copy is present. Return the numeric answers of the count and start commands, in order.",
    constraints: ["1 <= commands.length <= 1000", "Each word has 1 to 20 lowercase letters.", "A command is insert, count, start, or erase."],
    examples: [
      {
        input: 'commands = ["insert apple", "insert apple", "count apple", "start app", "erase apple", "count apple", "start app", "insert app", "count app", "start app"]',
        output: "[2, 2, 1, 1, 1, 2]",
      },
      { input: 'commands = ["insert a", "count a", "erase a", "count a", "start a"]', output: "[1, 0, 0]" },
    ],
    signature: "vector<int> trieAdvanced(vector<string>& commands)",
    functionName: "trieAdvanced",
    driver: `auto commands = in["commands"].asStrings();\n    ${numbersOut("sol.trieAdvanced(commands)")}`,
    method: `vector<int> trieAdvanced(vector<string>& commands) {
        struct Node { Node* next[26]{}; int words = 0; int passing = 0; };
        Node root;
        auto walk = [&](const string& word, int delta) -> Node* {
            Node* node = &root;
            for (char ch : word) {
                int bit = ch - 'a';
                if (!node->next[bit]) node->next[bit] = new Node();
                node = node->next[bit];
                node->passing += delta;
            }
            return node;
        };
        auto find = [&](const string& word) -> Node* {
            Node* node = &root;
            for (char ch : word) {
                int bit = ch - 'a';
                if (!node->next[bit]) return nullptr;
                node = node->next[bit];
            }
            return node;
        };
        vector<int> out;
        for (const string& command : commands) {
            stringstream ss(command);
            string kind, word;
            ss >> kind >> word;
            if (kind == "insert") walk(word, 1)->words++;
            else if (kind == "erase") walk(word, -1)->words--;
            else if (kind == "count") { Node* node = find(word); out.push_back(node ? node->words : 0); }
            else { Node* node = find(word); out.push_back(node ? node->passing : 0); }
        }
        return out;
    }`,
    expectedTime: "O(total letters)",
    expectedSpace: "O(total letters)",
    hints: [
      "Each node needs two counts: how many words end there, and how many words pass through it.",
      "insert increases the passing count of every letter it walks, then increases the ending count.",
      "count reads the ending count. start reads the passing count. A missing path means zero.",
      "erase reverses one insert: decrease the passing counts and the ending count. Copies stack, so two inserts need two erases to remove the word.",
    ],
    tests: [
      {
        input: {
          commands: ["insert apple", "insert apple", "count apple", "start app", "erase apple", "count apple", "start app", "insert app", "count app", "start app"],
        },
        expectedOutput: [2, 2, 1, 1, 1, 2],
        visibility: "SAMPLE",
      },
      { input: { commands: ["insert a", "count a", "erase a", "count a", "start a"] }, expectedOutput: [1, 0, 0], visibility: "SAMPLE" },
      { input: { commands: ["insert abc", "insert abd", "start ab", "start a", "count ab"] }, expectedOutput: [2, 2, 0], visibility: "HIDDEN" },
      { input: { commands: ["count z"] }, expectedOutput: [0], visibility: "HIDDEN" },
    ],
  }),
  problem({
    slug: "longest-prefix-word",
    title: "Longest Word with All Prefixes",
    difficulty: "MEDIUM",
    topics: ["tries"],
    tags: ["trie"],
    statement:
      "words holds lowercase words. Return the longest word whose every prefix, including the word itself, is also in the list. If several words tie for the greatest length, return the lexicographically smallest one. Return an empty string when no word qualifies.",
    constraints: ["1 <= words.length <= 1000", "1 <= words[i].length <= 20", "Words are lowercase."],
    examples: [
      { input: 'words = ["n", "ni", "nin", "ninj", "ninja", "ninga"]', output: '"ninja"' },
      { input: 'words = ["a", "banana", "app", "appl", "ap", "apply", "apple"]', output: '"apple"' },
    ],
    signature: "string longestPrefixWord(vector<string>& words)",
    functionName: "longestPrefixWord",
    driver: `auto words = in["words"].asStrings();\n    printJson(Json::text(sol.longestPrefixWord(words)));`,
    method: `string longestPrefixWord(vector<string>& words) {
        struct Node { Node* next[26]{}; bool end = false; };
        Node root;
        for (const string& word : words) {
            Node* node = &root;
            for (char ch : word) {
                int bit = ch - 'a';
                if (!node->next[bit]) node->next[bit] = new Node();
                node = node->next[bit];
            }
            node->end = true;
        }
        string best;
        for (const string& word : words) {
            Node* node = &root;
            bool ok = true;
            for (char ch : word) {
                node = node->next[ch - 'a'];
                if (!node->end) { ok = false; break; }
            }
            if (ok && (word.size() > best.size() || (word.size() == best.size() && word < best))) best = word;
        }
        return best;
    }`,
    expectedTime: "O(total letters)",
    expectedSpace: "O(total letters)",
    hints: [
      "Put every word in a trie and mark the node where that word ends.",
      "A word qualifies when every node along its path, not only the last one, is the end of some word.",
      "That means each shorter prefix was inserted as its own word.",
      "Among the words that pass, keep the longest. On a length tie, keep the lexicographically smaller word. A one-letter word qualifies because its only prefix is itself.",
    ],
    tests: [
      { input: { words: ["n", "ni", "nin", "ninj", "ninja", "ninga"] }, expectedOutput: "ninja", visibility: "SAMPLE" },
      { input: { words: ["a", "banana", "app", "appl", "ap", "apply", "apple"] }, expectedOutput: "apple", visibility: "SAMPLE" },
      { input: { words: ["abc"] }, expectedOutput: "", visibility: "HIDDEN" },
      { input: { words: ["w", "wo", "wor"] }, expectedOutput: "wor", visibility: "HIDDEN" },
    ],
  }),
  problem({
    slug: "distinct-substrings",
    title: "Number of Distinct Substrings",
    difficulty: "MEDIUM",
    topics: ["tries"],
    tags: ["trie"],
    statement:
      "Return how many different non-empty substrings s contains. A substring is a contiguous block. The same text reached from different starting positions counts once.",
    constraints: ["1 <= s.length <= 200", "s is lowercase."],
    examples: [
      { input: 's = "abab"', output: "7" },
      { input: 's = "aaa"', output: "3" },
    ],
    signature: "int distinctSubstrings(string s)",
    functionName: "distinctSubstrings",
    driver: `printJson(Json::number(sol.distinctSubstrings(in["s"].asString())));`,
    method: `int distinctSubstrings(string s) {
        struct Node { Node* next[26]{}; };
        Node root;
        int count = 0;
        for (int start = 0; start < (int)s.size(); start++) {
            Node* node = &root;
            for (int i = start; i < (int)s.size(); i++) {
                int bit = s[i] - 'a';
                if (!node->next[bit]) { node->next[bit] = new Node(); count++; }
                node = node->next[bit];
            }
        }
        return count;
    }`,
    expectedTime: "O(n^2)",
    expectedSpace: "O(n^2)",
    hints: [
      "Every substring is a prefix of some suffix.",
      "Insert each suffix into a trie. A brand-new node is a substring that has not been seen before.",
      "If the letter already has a child, that substring occurred earlier, so do not count it again.",
      "The number of nodes created is the number of distinct non-empty substrings. A string of one character has one.",
    ],
    tests: [
      { input: { s: "abab" }, expectedOutput: 7, visibility: "SAMPLE" },
      { input: { s: "aaa" }, expectedOutput: 3, visibility: "SAMPLE" },
      { input: { s: "abc" }, expectedOutput: 6, visibility: "HIDDEN" },
      { input: { s: "ccca" }, expectedOutput: 7, visibility: "HIDDEN" },
    ],
  }),
  problem({
    slug: "max-xor-pair",
    title: "Maximum XOR of Two Numbers in an Array",
    difficulty: "HARD",
    topics: ["tries"],
    tags: ["trie"],
    statement:
      "Return the largest bitwise XOR of any two values in nums. The two positions must be different. If every value is the same, the result is 0.",
    constraints: ["2 <= nums.length <= 1000", "0 <= nums[i] <= 1000000000"],
    examples: [
      { input: "nums = [3, 10, 5, 25, 2, 8]", output: "28" },
      { input: "nums = [1, 2]", output: "3" },
    ],
    signature: "int maxXorPair(vector<int>& nums)",
    functionName: "maxXorPair",
    driver: `auto nums = in["nums"].asIntVector();\n    printJson(Json::number(sol.maxXorPair(nums)));`,
    method: `int maxXorPair(vector<int>& nums) {
        struct Bit { Bit* next[2]{}; };
        Bit root;
        auto insert = [&](int value) {
            Bit* node = &root;
            for (int bit = 30; bit >= 0; bit--) {
                int side = (value >> bit) & 1;
                if (!node->next[side]) node->next[side] = new Bit();
                node = node->next[side];
            }
        };
        auto best = [&](int value) {
            Bit* node = &root;
            int answer = 0;
            for (int bit = 30; bit >= 0; bit--) {
                int side = (value >> bit) & 1;
                int want = 1 - side;
                if (node->next[want]) { answer |= 1 << bit; node = node->next[want]; }
                else node = node->next[side];
            }
            return answer;
        };
        for (int value : nums) insert(value);
        int answer = 0;
        for (int value : nums) answer = max(answer, best(value));
        return answer;
    }`,
    expectedTime: "O(n * bits)",
    expectedSpace: "O(n * bits)",
    hints: [
      "The largest XOR wants the opposite bit at the highest position where that is possible.",
      "A binary trie stores each number from bit 30 down to bit 0.",
      "After every number is inserted, query each number by preferring the opposite bit at every level.",
      "The best query result is the answer. Two equal numbers contribute 0. The number can match itself in the trie, but another number with a differing high bit will score higher.",
    ],
    tests: [
      { input: { nums: [3, 10, 5, 25, 2, 8] }, expectedOutput: 28, visibility: "SAMPLE" },
      { input: { nums: [1, 2] }, expectedOutput: 3, visibility: "SAMPLE" },
      { input: { nums: [1, 1] }, expectedOutput: 0, visibility: "HIDDEN" },
      { input: { nums: [14, 70, 53, 83, 49, 91, 36, 80, 92, 51, 66, 70] }, expectedOutput: 127, visibility: "HIDDEN" },
    ],
  }),
  problem({
    slug: "max-xor-query",
    title: "Maximum XOR with an Element from an Array",
    difficulty: "HARD",
    topics: ["tries"],
    tags: ["trie"],
    statement:
      "queries[i] is [value, limit]. Among the numbers in nums that are less than or equal to limit, return the largest bitwise XOR with value. If no number is small enough, that answer is -1. Return the answers in the same order as the queries.",
    constraints: ["1 <= nums.length, queries.length <= 1000", "0 <= nums[i], value, limit <= 1000000000", "Each query has two numbers."],
    examples: [
      { input: "nums = [0, 1, 2, 3, 4], queries = [[3, 1], [1, 3], [5, 6]]", output: "[3, 3, 7]" },
      { input: "nums = [5, 2, 4, 6, 6, 3], queries = [[12, 4], [8, 1], [6, 3]]", output: "[15, -1, 5]" },
    ],
    signature: "vector<int> maxXorQuery(vector<int>& nums, vector<vector<int>>& queries)",
    functionName: "maxXorQuery",
    driver: `auto nums = in["nums"].asIntVector();\n    auto queries = in["queries"].asIntMatrix();\n    ${numbersOut("sol.maxXorQuery(nums, queries)")}`,
    method: `vector<int> maxXorQuery(vector<int>& nums, vector<vector<int>>& queries) {
        struct Bit { Bit* next[2]{}; bool empty() const { return !next[0] && !next[1]; } };
        Bit root;
        auto insert = [&](int value) {
            Bit* node = &root;
            for (int bit = 30; bit >= 0; bit--) {
                int side = (value >> bit) & 1;
                if (!node->next[side]) node->next[side] = new Bit();
                node = node->next[side];
            }
        };
        auto best = [&](int value) {
            Bit* node = &root;
            int answer = 0;
            for (int bit = 30; bit >= 0; bit--) {
                int side = (value >> bit) & 1;
                int want = 1 - side;
                if (node->next[want]) { answer |= 1 << bit; node = node->next[want]; }
                else node = node->next[side];
            }
            return answer;
        };
        sort(nums.begin(), nums.end());
        vector<int> order(queries.size());
        iota(order.begin(), order.end(), 0);
        sort(order.begin(), order.end(), [&](int a, int b) { return queries[a][1] < queries[b][1]; });
        vector<int> answer(queries.size(), -1);
        int index = 0;
        for (int query : order) {
            while (index < (int)nums.size() && nums[index] <= queries[query][1]) insert(nums[index++]);
            if (!root.empty()) answer[query] = best(queries[query][0]);
        }
        return answer;
    }`,
    expectedTime: "O((n + queries) * bits)",
    expectedSpace: "O(n * bits)",
    hints: [
      "A query can use only numbers up to its limit, so the useful set grows as the limit grows.",
      "Sort the numbers and answer the queries from the smallest limit to the largest.",
      "Insert a number into a binary trie when the limit first becomes large enough to include it.",
      "Query the trie for the opposite bits. If the trie is still empty, that query is -1. Write each answer back at the query's original position.",
    ],
    tests: [
      { input: { nums: [0, 1, 2, 3, 4], queries: [[3, 1], [1, 3], [5, 6]] }, expectedOutput: [3, 3, 7], visibility: "SAMPLE" },
      { input: { nums: [5, 2, 4, 6, 6, 3], queries: [[12, 4], [8, 1], [6, 3]] }, expectedOutput: [15, -1, 5], visibility: "SAMPLE" },
      { input: { nums: [1], queries: [[2, 0], [2, 1]] }, expectedOutput: [-1, 3], visibility: "HIDDEN" },
      { input: { nums: [0], queries: [[0, 0]] }, expectedOutput: [0], visibility: "HIDDEN" },
    ],
  }),
];
