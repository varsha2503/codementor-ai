import {
  computeStreak,
  difficultyStats,
  previousDay,
  solvedProblemIds,
  utcDay,
} from "./types/analytics.js";

describe("date helpers", () => {
  it("extracts UTC day strings and steps back one day", () => {
    expect(utcDay("2026-10-12T15:00:00.000Z")).toBe("2026-10-12");
    expect(previousDay("2026-10-12")).toBe("2026-10-11");
  });
});

describe("difficultyStats", () => {
  const problems = [
    { id: "p1", slug: "a", title: "A", difficulty: "EASY" as const, topics: ["arrays"] },
    { id: "p2", slug: "b", title: "B", difficulty: "MEDIUM" as const, topics: ["graphs"] },
  ];

  it("counts attempted and solved problems per difficulty", () => {
    const attempts = [
      { problemId: "p1", kind: "SUBMIT" as const, verdict: "ACCEPTED", createdAt: "2026-10-12T00:00:00.000Z", topics: ["arrays"], difficulty: "EASY" as const },
      { problemId: "p2", kind: "SUBMIT" as const, verdict: "WRONG_ANSWER", createdAt: "2026-10-12T00:00:00.000Z", topics: ["graphs"], difficulty: "MEDIUM" as const },
    ];
    expect(solvedProblemIds(attempts)).toEqual(new Set(["p1"]));
    const stats = difficultyStats(attempts, problems);
    expect(stats.find((row) => row.difficulty === "EASY")).toEqual({
      difficulty: "EASY",
      total: 1,
      attempted: 1,
      solved: 1,
      accuracy: 1,
    });
    expect(stats.find((row) => row.difficulty === "MEDIUM")).toEqual({
      difficulty: "MEDIUM",
      total: 1,
      attempted: 1,
      solved: 0,
      accuracy: 0,
    });
  });
});

describe("computeStreak edge cases", () => {
  it("counts yesterday when today has no attempt yet", () => {
    expect(computeStreak(["2026-10-11"], "2026-10-12")).toBe(1);
  });
});
