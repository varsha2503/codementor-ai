import { SystemMessage, HumanMessage } from "@langchain/core/messages";
import { answerEvaluationSchema, type AnswerEvaluation, type InterviewStage } from "@codementor/shared";
import type { ExecutionSummary, InterviewInput } from "../types.js";
import { combinedLastQuestion } from "../interview-meta.js";
import { readLlmConfigFromEnv } from "../llm/config.js";
import { invokeJsonObject, toLangChainMessages, transcriptToMessages } from "../llm/invoke.js";
import { LlmProviderError, mapProviderError } from "../llm/errors.js";
import {
  ANSWER_EVALUATOR_PROMPT,
  ANSWER_EVALUATION_JSON_EXAMPLE,
  answerEvaluationPrompt,
} from "./prompts.js";
import { evaluationFromAssessResponse } from "./heuristic.js";
import { mergeAnswerEvaluations } from "./merge.js";

export type EvaluateAnswerInput = Pick<
  InterviewInput,
  "title" | "statement" | "stage" | "message" | "coverage" | "transcript" | "execution"
>;

function heuristicBaseline(input: EvaluateAnswerInput): AnswerEvaluation {
  return evaluationFromAssessResponse({
    stage: input.stage,
    message: input.message,
    coverage: input.coverage,
  });
}

/** LangGraph-ready node: structured evaluation of the latest candidate answer. */
export async function evaluateAnswer(input: EvaluateAnswerInput): Promise<AnswerEvaluation> {
  const heuristic = heuristicBaseline(input);
  if (!readLlmConfigFromEnv()) return heuristic;

  const userContent = `${answerEvaluationPrompt({
    title: input.title,
    statement: input.statement,
    stage: input.stage,
    message: input.message,
    lastQuestion: combinedLastQuestion(input.transcript),
    coverage: input.coverage,
    execution: input.execution,
    transcript: input.transcript,
  })}

Example shape: ${ANSWER_EVALUATION_JSON_EXAMPLE}`;

  const messages = [
    new SystemMessage(ANSWER_EVALUATOR_PROMPT),
    ...transcriptToMessages(input.transcript.slice(-14)),
    ...toLangChainMessages([{ role: "user", content: userContent }]),
  ];

  try {
    const raw = await invokeJsonObject(messages, { temperature: 0.15, jsonMode: true });
    let parsed = answerEvaluationSchema.safeParse(raw);
    if (!parsed.success) {
      const retry = await invokeJsonObject(
        [...messages, new HumanMessage(`Fix your JSON to match this shape exactly: ${ANSWER_EVALUATION_JSON_EXAMPLE}`)],
        { temperature: 0.1, jsonMode: true },
      );
      parsed = answerEvaluationSchema.safeParse(retry);
    }
    if (!parsed.success) {
      return heuristic;
    }
    return mergeAnswerEvaluations(heuristic, parsed.data);
  } catch (error) {
    const mapped = mapProviderError(error);
    if (mapped instanceof LlmProviderError && mapped.retryable) {
      console.error("[ai] answer evaluation skipped (provider):", mapped.message);
    } else if (!(error instanceof LlmProviderError)) {
      console.error("[ai] answer evaluation skipped:", error instanceof Error ? error.message : error);
    }
    return heuristic;
  }
}

export async function evaluateAnswerSafe(input: EvaluateAnswerInput): Promise<AnswerEvaluation> {
  return evaluateAnswer(input);
}

export function evaluateAnswerHeuristicOnly(input: {
  stage: InterviewStage;
  message: string;
  coverage: EvaluateAnswerInput["coverage"];
}): AnswerEvaluation {
  return evaluationFromAssessResponse(input);
}

export type { ExecutionSummary };
