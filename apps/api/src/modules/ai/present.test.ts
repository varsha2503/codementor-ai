import { presentAnalysis, presentHint, presentInterviewTurn } from "./present.js";

describe("presentHint", () => {
  it("accepts level aliases and fills defaults", () => {
    const hint = presentHint({ level: 2, hint: "Try a hash map." });
    expect(hint?.hintLevel).toBe(2);
    expect(hint?.concept).toBe("Hint");
  });

  it("rejects empty hints", () => {
    expect(presentHint({ hint: "" })).toBeNull();
  });
});

describe("presentInterviewTurn", () => {
  it("canonicalizes legacy stages", () => {
    const turn = presentInterviewTurn({
      role: "interviewer",
      stage: "code",
      message: "Start coding when ready.",
    });
    expect(turn?.stage).toBe("coding");
  });
});

describe("presentAnalysis", () => {
  it("maps alternate field names into the schema", () => {
    const analysis = presentAnalysis({
      estimatedTimeComplexity: "O(n)",
      estimatedSpaceComplexity: "O(1)",
      confidence: "medium",
      concerns: ["Might miss duplicates"],
      strengths: ["Clear loop"],
      summary: "Tighten the boundary check.",
      suggestions: ["Try n = 0"],
    });
    expect(analysis?.correctnessConcerns).toContain("Might miss duplicates");
    expect(analysis?.improvements[0]).toContain("boundary");
  });
});
