export type Visibility = "SAMPLE" | "HIDDEN";
export type CompareMode = "EXACT" | "UNORDERED" | "TOPOLOGICAL";
export type Difficulty = "EASY" | "MEDIUM" | "HARD";

export type ProblemSeed = {
  slug: string;
  title: string;
  difficulty: Difficulty;
  topics: string[];
  tags: string[];
  statement: string;
  constraints: string[];
  examples: { input: string; output: string; explanation?: string }[];
  starterCode: string;
  functionName: string;
  driverCode: string;
  compareMode: CompareMode;
  timeLimitMs: number;
  memoryLimitKb: number;
  expectedTime: string;
  expectedSpace: string;
  referenceSolution: string;
  hintLadder: { level: number; text: string; whenCodeHas?: string; alternateText?: string }[];
  tests: { input: unknown; expectedOutput: unknown; visibility: Visibility }[];
};

const LIST_NOTE = `// ListNode is provided by the judge:
// struct ListNode { int val; ListNode* next; ListNode(int x) : val(x), next(nullptr) {} };
// Do not redefine it. Do not write main, and do not print from your method.`;

const TREE_NOTE = `// TreeNode is provided by the judge:
// struct TreeNode { int val; TreeNode* left; TreeNode* right; TreeNode(int x) : val(x), left(nullptr), right(nullptr) {} };
// Trees arrive as level-order arrays. Do not redefine TreeNode, write main, or print.`;

export function problem(def: {
  slug: string;
  title: string;
  difficulty: Difficulty;
  topics: string[];
  tags: string[];
  statement: string;
  constraints: string[];
  examples: ProblemSeed["examples"];
  signature: string;
  functionName: string;
  driver: string;
  method: string;
  note?: string;
  compareMode?: CompareMode;
  timeLimitMs?: number;
  expectedTime: string;
  expectedSpace: string;
  hints: string[];
  alternates?: ({ whenCodeHas: string; alternateText: string } | undefined)[];
  tests: ProblemSeed["tests"];
}): ProblemSeed {
  const note = def.note ? `${def.note}\n` : "";
  return {
    slug: def.slug,
    title: def.title,
    difficulty: def.difficulty,
    topics: def.topics,
    tags: def.tags,
    statement: def.statement,
    constraints: def.constraints,
    examples: def.examples,
    starterCode: `#include <bits/stdc++.h>\nusing namespace std;\n${note}\nclass Solution {\npublic:\n    ${def.signature} {\n\n    }\n};\n`,
    functionName: def.functionName,
    driverCode: def.driver,
    compareMode: def.compareMode ?? "EXACT",
    timeLimitMs: def.timeLimitMs ?? (def.difficulty === "EASY" ? 1000 : 2000),
    memoryLimitKb: 262144,
    expectedTime: def.expectedTime,
    expectedSpace: def.expectedSpace,
    referenceSolution: `#include <bits/stdc++.h>\nusing namespace std;\n${note}\nclass Solution {\npublic:\n    ${def.method}\n};\n`,
    hintLadder: def.hints.map((text, index) => ({
      level: index + 1,
      text,
      ...(def.alternates?.[index] ?? {}),
    })),
    tests: def.tests,
  };
}

export { LIST_NOTE, TREE_NOTE };
