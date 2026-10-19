import { answerEvaluationSchema, type AnswerEvaluation } from "@codementor/shared";
import type { Sufficiency } from "../interview-coverage.js";
import { sufficiencyFromEvaluation } from "./heuristic.js";

const ADVANCE_CLASSIFICATIONS = new Set<AnswerEvaluation["classification"]>([
  "CORRECT",
  "NEARLY_CORRECT",
  "PARTIALLY_CORRECT",
]);

export function mergeAnswerEvaluations(heuristic: AnswerEvaluation, model?: AnswerEvaluation | null): AnswerEvaluation {
  if (!model) return heuristic;
  const parsed = answerEvaluationSchema.safeParse(model);
  if (!parsed.success) return heuristic;

  const llm = parsed.data;
  let nextAction = llm.nextAction;
  let classification = llm.classification;

  if (heuristic.nextAction === "CLARIFY" && heuristic.classification === "UNCLEAR") {
    if (!(llm.correctPoints.length >= 2 && ADVANCE_CLASSIFICATIONS.has(llm.classification))) {
      nextAction = "CLARIFY";
      classification = "UNCLEAR";
    }
  }

  if (heuristic.nextAction === "ADVANCE" && heuristic.classification !== "UNCLEAR") {
    if (llm.classification === "INCORRECT" && llm.issues.length === 0) {
      classification = heuristic.classification;
      nextAction = heuristic.nextAction;
    } else if (ADVANCE_CLASSIFICATIONS.has(llm.classification) || llm.classification === "INCORRECT") {
      if (llm.classification === "INCORRECT" && llm.issues.length > 0) {
        classification = "NEARLY_CORRECT";
        nextAction = "ADVANCE";
      }
    }
  }

  if (classification === "NEARLY_CORRECT" || classification === "PARTIALLY_CORRECT") {
    if (heuristic.nextAction === "ADVANCE" && nextAction === "CLARIFY") {
      nextAction = "ADVANCE";
    }
  }

  const correctPoints = [...new Set([...heuristic.correctPoints, ...llm.correctPoints])].slice(0, 12);
  const issues = [...new Set([...llm.issues])].slice(0, 12);
  const missingConcepts = [...new Set([...llm.missingConcepts, ...heuristic.missingConcepts])].slice(0, 12);

  return answerEvaluationSchema.parse({
    classification,
    correctPoints,
    issues,
    missingConcepts,
    explanation: llm.explanation.slice(0, 800),
    nextAction,
    nextTopic: llm.nextTopic ?? heuristic.nextTopic,
  });
}

export function mergedSufficiency(evaluation: AnswerEvaluation): Sufficiency {
  return sufficiencyFromEvaluation(evaluation);
}
