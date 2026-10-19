import {
  acceptClassification,
  assistanceSplit,
  computeStreak,
  inferIssues,
  isValidTopological,
  nextHintLevel,
  outputsMatch,
  recommendProblems,
  sanitizeCase,
  topicStats,
  validateSource,
} from "./index.js";

describe("source policy", () => {
  it("rejects a candidate-supplied main", () => {
    expect(validateSource("int main() { return 0; }")).toMatch(/Solution method/);
  });

  it("accepts a normal solution", () => {
    expect(validateSource("class Solution { public: int f(){ return 1; } };")).toBeNull();
  });
});

describe("output comparison", () => {
  it("treats pair order as irrelevant in unordered mode", () => {
    expect(outputsMatch([1, 0], [0, 1], "UNORDERED")).toBe(true);
    expect(outputsMatch([1, 2], [0, 1], "UNORDERED")).toBe(false);
  });

  it("requires exact order otherwise", () => {
    expect(outputsMatch([1, 0], [0, 1], "EXACT")).toBe(false);
  });

  it("accepts any valid module order and only an empty order when there is a cycle", () => {
    expect(isValidTopological([0, 2, 1, 3], 4, [[1, 0], [2, 0], [3, 1], [3, 2]])).toBe(true);
    expect(isValidTopological([3, 0, 1, 2], 4, [[1, 0], [2, 0], [3, 1], [3, 2]])).toBe(false);
    expect(isValidTopological([], 2, [[1, 0], [0, 1]])).toBe(true);
    expect(isValidTopological([0, 1], 2, [[1, 0], [0, 1]])).toBe(false);
  });
});

describe("hidden test privacy", () => {
  it("strips inputs and outputs from hidden cases", () => {
    const sanitized = sanitizeCase({
      visibility: "HIDDEN",
      status: "WRONG_ANSWER",
      input: { nums: [1, 2] },
      expected: [0, 1],
      actual: [1, 0],
      runtimeMs: 4,
      message: "Hidden test failed.",
    });
    expect(sanitized).toEqual({
      visibility: "HIDDEN",
      status: "WRONG_ANSWER",
      runtimeMs: 4,
      memoryKb: null,
      message: "Hidden test failed.",
    });
    expect(JSON.stringify(sanitized)).not.toContain("nums");
  });
});

describe("mistake rules", () => {
  it("maps a time limit to high time-complexity confidence", () => {
    const issues = inferIssues({ verdict: "TIME_LIMIT_EXCEEDED", code: "for(;;){}", topics: ["arrays"] });
    expect(issues[0]?.category).toBe("TIME_COMPLEXITY_TOO_HIGH");
    expect(issues[0]?.confidence).toBe("high");
  });

  it("keeps taxonomy labels and drops UNKNOWN or invented categories", () => {
    expect(
      acceptClassification({ category: "OFF_BY_ONE", evidence: "The loop never steps past mid.", confidence: "medium" })?.category,
    ).toBe("OFF_BY_ONE");
    expect(acceptClassification({ category: "UNKNOWN", evidence: "Not enough evidence.", confidence: "low" })).toBeNull();
    expect(acceptClassification({ category: "MADE_UP", evidence: "nope", confidence: "high" })).toBeNull();
  });
});

describe("progress math", () => {
  const problems = [
    { id: "p1", slug: "pair-target", title: "Pair Target", difficulty: "EASY" as const, topics: ["arrays"] },
    { id: "p2", slug: "campus", title: "Campus Islands", difficulty: "MEDIUM" as const, topics: ["graphs"] },
    { id: "p3", slug: "stairs", title: "Stair Routes", difficulty: "EASY" as const, topics: ["dynamic-programming"] },
  ];

  it("continues a streak through today and stops at a gap", () => {
    expect(computeStreak(["2026-10-10", "2026-10-11", "2026-10-12"], "2026-10-12")).toBe(3);
    expect(computeStreak(["2026-10-10", "2026-10-12"], "2026-10-12")).toBe(1);
    expect(computeStreak(["2026-10-10"], "2026-10-12")).toBe(0);
  });

  it("advances the hint ladder without passing level 4", () => {
    expect(nextHintLevel([])).toBe(1);
    expect(nextHintLevel([1, 2])).toBe(3);
    expect(nextHintLevel([4])).toBe(4);
  });

  it("counts topic accuracy from judged submissions only", () => {
    const stats = topicStats([
      { problemId: "p1", kind: "SUBMIT", verdict: "ACCEPTED", createdAt: "2026-10-12T00:00:00.000Z", topics: ["arrays"], difficulty: "EASY" },
      { problemId: "p1", kind: "RUN", verdict: "WRONG_ANSWER", createdAt: "2026-10-12T00:00:00.000Z", topics: ["arrays"], difficulty: "EASY" },
      { problemId: "p2", kind: "SUBMIT", verdict: "WRONG_ANSWER", createdAt: "2026-10-12T00:00:00.000Z", topics: ["graphs"], difficulty: "MEDIUM" },
    ]);
    expect(stats.find((item) => item.topic === "arrays")?.accuracy).toBe(1);
    expect(stats.find((item) => item.topic === "graphs")?.accuracy).toBe(0);
  });

  it("separates independent solves from solves that used a hint", () => {
    const split = assistanceSplit(
      [
        { problemId: "p1", kind: "SUBMIT", verdict: "ACCEPTED", createdAt: "2026-10-12T02:00:00.000Z", topics: ["arrays"], difficulty: "EASY" },
        { problemId: "p3", kind: "SUBMIT", verdict: "ACCEPTED", createdAt: "2026-10-12T04:00:00.000Z", topics: ["dynamic-programming"], difficulty: "EASY" },
      ],
      [{ problemId: "p1", createdAt: "2026-10-12T01:00:00.000Z" }],
    );
    expect(split).toEqual({ assisted: 1, independent: 1 });
  });

  it("recommends unsolved problems from the weakest topic", () => {
    const picks = recommendProblems(
      [
        { problemId: "p1", kind: "SUBMIT", verdict: "ACCEPTED", createdAt: "2026-10-12T00:00:00.000Z", topics: ["arrays"], difficulty: "EASY" },
        { problemId: "p2", kind: "SUBMIT", verdict: "WRONG_ANSWER", createdAt: "2026-10-12T00:00:00.000Z", topics: ["graphs"], difficulty: "MEDIUM" },
      ],
      problems,
    );
    expect(picks.map((problem) => problem.id)).toContain("p2");
    expect(picks.map((problem) => problem.id)).not.toContain("p1");
  });
});
