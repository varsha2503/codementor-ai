import { problem } from "./helpers.js";

const linesOut = (call: string) =>
  `auto lines = ${call};\n    Json out;\n    out.type = Json::ARR;\n    for (const auto& line : lines) out.a.push_back(Json::text(line));\n    printJson(out);`;

export const languageBasicsProblems = [
  problem({
    slug: "io-sum",
    title: "Input Output",
    difficulty: "EASY",
    topics: ["basics"],
    tags: ["language"],
    statement: "Given two integers a and b, return their sum.",
    constraints: ["-1000000 <= a, b <= 1000000"],
    examples: [{ input: "a = 2, b = 3", output: "5" }],
    signature: "int ioSum(int a, int b)",
    functionName: "ioSum",
    driver: `printJson(Json::number(sol.ioSum((int)in["a"].asInt(), (int)in["b"].asInt())));`,
    method: `int ioSum(int a, int b) { return a + b; }`,
    expectedTime: "O(1)",
    expectedSpace: "O(1)",
    hints: ["Return a + b."],
    tests: [
      { input: { a: 2, b: 3 }, expectedOutput: 5, visibility: "SAMPLE" },
      { input: { a: -1, b: 1 }, expectedOutput: 0, visibility: "HIDDEN" },
    ],
  }),
  problem({
    slug: "repeat-line",
    title: "Print name N times using recursion",
    difficulty: "EASY",
    topics: ["basics"],
    tags: ["recursion"],
    statement: "Given a lowercase word and a positive count n, return a list with the word repeated n times in order.",
    constraints: ["1 <= n <= 100", "word length 1..20, lowercase letters"],
    examples: [{ input: 'word = "code", n = 3', output: '["code", "code", "code"]' }],
    signature: "vector<string> repeatLine(string word, int n)",
    functionName: "repeatLine",
    driver: `${linesOut("sol.repeatLine(in[\"word\"].asString(), (int)in[\"n\"].asInt())")}`,
    method: `vector<string> repeatLine(string word, int n) {
        if (n <= 0) return {};
        if (n == 1) return {word};
        auto tail = repeatLine(word, n - 1);
        tail.push_back(word);
        return tail;
    }`,
    expectedTime: "O(n)",
    expectedSpace: "O(n)",
    hints: ["Base case n = 1 returns a single-element list.", "Otherwise append one more copy after the list for n - 1."],
    tests: [
      { input: { word: "code", n: 3 }, expectedOutput: ["code", "code", "code"], visibility: "SAMPLE" },
      { input: { word: "a", n: 1 }, expectedOutput: ["a"], visibility: "HIDDEN" },
    ],
  }),
];
