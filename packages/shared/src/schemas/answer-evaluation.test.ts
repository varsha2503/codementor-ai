import { answerEvaluationSchema } from "./index.js";

describe("answerEvaluationSchema", () => {
  it("accepts a valid evaluation payload", () => {
    const parsed = answerEvaluationSchema.parse({
      classification: "NEARLY_CORRECT",
      correctPoints: ["Uses a hash map for complements."],
      issues: ["Did not mention duplicate indices."],
      missingConcepts: [],
      explanation: "",
      nextAction: "ADVANCE",
      nextTopic: "approach",
    });
    expect(parsed.nextAction).toBe("ADVANCE");
  });

  it("rejects unknown classification values", () => {
    expect(() =>
      answerEvaluationSchema.parse({
        classification: "MAYBE",
        correctPoints: [],
        issues: [],
        missingConcepts: [],
        explanation: "",
        nextAction: "CLARIFY",
      }),
    ).toThrow();
  });
});
