import { answerEvaluationSchema, type AnswerEvaluation, type InterviewStage } from "@codementor/shared";
import { assessResponse, type InterviewCoverage, type Sufficiency } from "../interview-coverage.js";

export function sufficiencyFromEvaluation(evaluation: AnswerEvaluation): Sufficiency {
  if (evaluation.nextAction === "ADVANCE") {
    if (evaluation.classification === "CORRECT" || evaluation.classification === "NEARLY_CORRECT") return "sufficient";
    if (evaluation.classification === "PARTIALLY_CORRECT") return "sufficient";
  }
  if (evaluation.classification === "UNCLEAR" || evaluation.nextAction === "CLARIFY") {
    return evaluation.correctPoints.length > 0 ? "partial" : "unclear";
  }
  if (evaluation.classification === "INCORRECT") return "partial";
  return "partial";
}

export function evaluationFromAssessResponse(input: {
  stage: InterviewStage;
  message: string;
  coverage: InterviewCoverage;
}): AnswerEvaluation {
  const assessment = assessResponse(input);
  const correctPoints: string[] = [];
  if (assessment.sufficiency === "sufficient") {
    correctPoints.push("Answer meets the stage rubric used by the backend.");
  }
  let classification: AnswerEvaluation["classification"] = "UNCLEAR";
  let nextAction: AnswerEvaluation["nextAction"] = "CLARIFY";
  if (assessment.sufficiency === "sufficient") {
    classification = "CORRECT";
    nextAction = "ADVANCE";
  } else if (assessment.sufficiency === "partial") {
    classification = "NEARLY_CORRECT";
    nextAction = "ADVANCE";
  } else {
    classification = "UNCLEAR";
    nextAction = "CLARIFY";
  }
  const missingConcepts = assessment.missing ? [assessment.missing] : [];
  return answerEvaluationSchema.parse({
    classification,
    correctPoints,
    issues: [],
    missingConcepts,
    explanation: "",
    nextAction,
    nextTopic: assessment.missing,
  });
}
