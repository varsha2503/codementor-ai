import { inferIssues } from "./types/issues.js";

describe("inferIssues", () => {
  it("flags integer overflow from stderr", () => {
    const issues = inferIssues({
      verdict: "RUNTIME_ERROR",
      code: "class Solution {};",
      topics: ["arrays"],
      stderr: "signed integer overflow",
    });
    expect(issues.some((issue) => issue.category === "INTEGER_OVERFLOW")).toBe(true);
  });

  it("suggests visited state for graph wrong answers", () => {
    const issues = inferIssues({
      verdict: "WRONG_ANSWER",
      code: "class Solution { void dfs(int u) {} };",
      topics: ["graphs"],
    });
    expect(issues.some((issue) => issue.category === "MISSING_VISITED_STATE")).toBe(true);
  });
});
