import { answerEvaluationSchema, type AnswerEvaluation, type InterviewStage } from "@codementor/shared";
import type { InterviewCoverage } from "../interview-coverage.js";
import {
  combinedLastQuestion,
  isNonAnswerAcknowledgment,
  type InterviewSessionMeta,
} from "../interview-meta.js";
import { buildProblemProfile } from "../problem-profile.js";
import { evaluationFromAssessResponse } from "./heuristic.js";
import { applyPalindromeMarksFromEvaluation, evaluatePalindromeTurn } from "./palindrome-evaluator.js";
import { readLlmConfigFromEnv } from "../llm/config.js";
import { evaluateAnswer } from "./evaluate-answer.js";

export type ContextualEvaluateInput = {
  title: string;
  statement: string;
  stage: InterviewStage;
  message: string;
  coverage: InterviewCoverage;
  transcript: { role: string; message: string }[];
  execution: unknown;
  lastQuestion?: string;
};

export type ContextualEvaluateResult = {
  evaluation: AnswerEvaluation;
  meta: InterviewSessionMeta;
};

const REASONING_STAGES = new Set<InterviewStage>(["understanding", "approach", "complexity"]);

export async function evaluateCandidateTurn(input: ContextualEvaluateInput): Promise<ContextualEvaluateResult> {
  const lastQuestion = input.lastQuestion ?? combinedLastQuestion(input.transcript);
  let meta: InterviewSessionMeta = { ...(input.coverage.meta ?? { marks: [], pendingGaps: [], followUpCounts: {}, lastQuestionText: "", lastQuestionIntent: null, nextAction: null, recordedIssues: [] }) };
  meta = { ...meta, lastQuestionText: lastQuestion };

  if (input.stage !== "introduction" && isNonAnswerAcknowledgment(input.message, REASONING_STAGES.has(input.stage))) {
    return {
      meta: { ...meta, nextAction: "CLARIFY" },
      evaluation: answerEvaluationSchema.parse({
        classification: "UNCLEAR",
        correctPoints: [],
        issues: [],
        missingConcepts: [],
        explanation: "",
        nextAction: "CLARIFY",
      }),
    };
  }

  const profile = buildProblemProfile(input.title, input.statement);
  const palindrome = evaluatePalindromeTurn({
    stage: input.stage,
    message: input.message,
    lastQuestion,
    meta,
    profile,
  });

  if (palindrome) {
    meta = applyPalindromeMarksFromEvaluation(palindrome.meta, palindrome.evaluation);
    meta = { ...meta, nextAction: palindrome.evaluation.nextAction };
    return { evaluation: palindrome.evaluation, meta };
  }

  const heuristic = evaluationFromAssessResponse({
    stage: input.stage,
    message: input.message,
    coverage: input.coverage,
  });
  meta = { ...meta, nextAction: heuristic.nextAction };

  if (!readLlmConfigFromEnv()) {
    return { evaluation: heuristic, meta };
  }

  const modelEval = await evaluateAnswer({
    ...input,
    coverage: input.coverage,
  });
  meta = { ...meta, nextAction: modelEval.nextAction };
  return { evaluation: modelEval, meta };
}
