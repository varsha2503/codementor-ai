import { answerEvaluationSchema } from "@codementor/shared";
import { emptyCoverage } from "../interview-coverage.js";
import { evaluationFromAssessResponse } from "./heuristic.js";
import { mergeAnswerEvaluations } from "./merge.js";

describe("mergeAnswerEvaluations", () => {
  it("lets nearly-correct heuristic answers advance when the model agrees", () => {
    const heuristic = evaluationFromAssessResponse({
      stage: "approach",
      message: "I would loop and use mod ten to extract digits then compare the sum.",
      coverage: emptyCoverage(),
    });
    expect(heuristic.nextAction).toBe("ADVANCE");
    const merged = mergeAnswerEvaluations(
      heuristic,
      answerEvaluationSchema.parse({
        classification: "NEARLY_CORRECT",
        correctPoints: ["Digit extraction with mod 10."],
        issues: ["Power step not explicit."],
        missingConcepts: [],
        explanation: "",
        nextAction: "ADVANCE",
      }),
    );
    expect(merged.nextAction).toBe("ADVANCE");
  });

  it("blocks advance when heuristic says unclear and the model lacks evidence", () => {
    const heuristic = evaluationFromAssessResponse({
      stage: "understanding",
      message: "idk",
      coverage: emptyCoverage(),
    });
    const merged = mergeAnswerEvaluations(
      heuristic,
      answerEvaluationSchema.parse({
        classification: "UNCLEAR",
        correctPoints: [],
        issues: [],
        missingConcepts: ["problem-io"],
        explanation: "",
        nextAction: "ADVANCE",
      }),
    );
    expect(merged.nextAction).toBe("CLARIFY");
  });
});
