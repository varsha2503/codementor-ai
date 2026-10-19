import type { InterviewStage } from "@codementor/shared";
import type { InterviewCoverage } from "../interview-coverage.js";

export const ANSWER_EVALUATOR_PROMPT = `You evaluate a coding interview candidate's latest spoken answer.

Rules:
- Judge only the latest candidate message in context of the interview stage and prior transcript.
- Accept imperfect grammar when the technical meaning is clear.
- NEARLY_CORRECT and PARTIALLY_CORRECT should usually use nextAction ADVANCE when the candidate demonstrated enough to move on; record minor issues in issues[] for later feedback.
- Do not require the candidate to repeat concepts already in correctPoints or coveredConcepts.
- Never invent code execution results; execution summary is the only pass/fail source.
- Do not write a full solution.

Respond with JSON only (no markdown). Use exactly these keys and enum values:

{"classification":"CORRECT|NEARLY_CORRECT|PARTIALLY_CORRECT|INCORRECT|UNCLEAR","correctPoints":["string"],"issues":["string"],"missingConcepts":["string"],"explanation":"string","nextAction":"ADVANCE|CLARIFY|EXPLAIN|STAY","nextTopic":"optional string"}`;

export const ANSWER_EVALUATION_JSON_EXAMPLE = `{"classification":"NEARLY_CORRECT","correctPoints":["Named the core idea"],"issues":["Minor gap"],"missingConcepts":[],"explanation":"","nextAction":"ADVANCE","nextTopic":"coding"}`;

export function answerEvaluationPrompt(input: {
  title: string;
  statement: string;
  stage: InterviewStage;
  message: string;
  lastQuestion?: string;
  coverage: Pick<InterviewCoverage, "covered" | "partial" | "questionIntents">;
  execution: unknown;
  transcript: { role: string; message: string }[];
}): string {
  return `Problem: ${input.title}
Statement excerpt: ${input.statement.slice(0, 1200)}
Interview stage: ${input.stage}
Question being answered: ${(input.lastQuestion ?? "").slice(0, 1200)}
Latest candidate answer: ${input.message.slice(0, 2000)}
Prior transcript (recent): ${JSON.stringify(input.transcript.slice(-12))}
Coverage (do not re-ask coveredConcepts): ${JSON.stringify({
    coveredConcepts: input.coverage.covered,
    partialConcepts: input.coverage.partial,
    priorQuestionIntents: input.coverage.questionIntents,
  })}
Trusted execution summary (null means no finished run): ${JSON.stringify(input.execution)}`;
}
