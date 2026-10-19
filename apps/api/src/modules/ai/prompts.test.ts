import {
  analysisPrompt,
  classificationPrompt,
  hintPrompt,
  interviewPrompt,
  testPrompt,
} from "./prompts.js";

describe("prompt builders", () => {
  it("includes problem context in hint prompts", () => {
    const prompt = hintPrompt({
      title: "Two Sum",
      statement: "Find two numbers.",
      level: 2,
      authoredHint: "Think about complements.",
      code: "class Solution {};",
      priorHints: ["Think about pairs."],
      execution: null,
    });
    expect(prompt).toContain("Two Sum");
    expect(prompt).toContain("level 2");
    expect(prompt).toContain("Think about pairs.");
  });

  it("embeds execution summaries in analysis prompts", () => {
    const prompt = analysisPrompt({
      title: "Two Sum",
      statement: "Find two numbers.",
      expectedTime: "O(n)",
      expectedSpace: "O(n)",
      code: "class Solution {};",
      execution: { verdict: "WRONG_ANSWER" },
    });
    expect(prompt).toContain("WRONG_ANSWER");
    expect(prompt).toContain("O(n)");
  });

  it("lists prior categories for classification", () => {
    const prompt = classificationPrompt({
      title: "Two Sum",
      topics: ["graphs"],
      constraints: ["n <= 10^4"],
      code: "class Solution {};",
      execution: { verdict: "WRONG_ANSWER" },
      previousCategories: ["OFF_BY_ONE"],
    });
    expect(prompt).toContain("OFF_BY_ONE");
  });

  it("includes interview stage and transcript snippets", () => {
    const prompt = interviewPrompt({
      title: "Two Sum",
      statement: "Find two numbers.",
      stage: "approach",
      allowed: ["approach", "coding"],
      message: "I would use a hash map.",
      transcript: [{ role: "candidate", message: "Ready" }],
      code: "",
      execution: null,
      nextHint: null,
      coverage: { covered: [], partial: [], questionIntents: [] },
      sufficiency: "partial",
    });
    expect(prompt).toContain("approach");
    expect(prompt).toContain("hash map");
  });

  it("describes constraints for test generation", () => {
    const prompt = testPrompt({
      title: "Two Sum",
      statement: "Find two numbers.",
      constraints: ["1 <= nums.length <= 10^4"],
      examples: [{ input: { nums: [2, 7], target: 9 }, output: [0, 1] }],
    });
    expect(prompt).toContain("Two Sum");
    expect(prompt).toContain("10^4");
  });
});
