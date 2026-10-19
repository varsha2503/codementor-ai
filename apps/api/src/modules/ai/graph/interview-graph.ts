import { Annotation, END, START, StateGraph } from "@langchain/langgraph";
import type { AnswerEvaluation, InterviewReply } from "@codementor/shared";
import { interviewReplySchema } from "@codementor/shared";
import {
  allowedStages,
  assessResponse,
  ensureMeta,
  guardRepetitiveReply,
  ingestCandidateMessage,
  recordAskedQuestion,
  type InterviewCoverage,
} from "../interview-coverage.js";
import { codeLooksLikeStub } from "../interview-code.js";
import { coerceInterviewReply, interviewerReplyWithCoverage, leaksImplementation } from "../interview.js";
import type { InterviewInput } from "../types.js";
import {
  combinedLastQuestion,
  sanitizeCandidateFacingText,
  type InterviewSessionMeta,
} from "../interview-meta.js";
import { evaluateCandidateTurn } from "../evaluation/contextual-evaluate.js";
import { clampReplyStage, mergeCoverageMeta, planRouting, type RoutingPlan } from "./routing.js";
import { replyFromEvaluation } from "./reply-from-evaluation.js";
import { INTERVIEWER_PROMPT, interviewTurnPrompt } from "../prompts.js";
import { SystemMessage } from "@langchain/core/messages";
import { invokeJsonObject, toLangChainMessages, transcriptToMessages } from "../llm/invoke.js";
import { readLlmConfigFromEnv } from "../llm/config.js";
import { getConfiguredModelName } from "../llm/chat-model.js";
import { heuristicInterviewTurn } from "../heuristic-interview.js";

export type InterviewGraphOptions = {
  polish: boolean;
};

type TurnState = {
  input: InterviewInput;
  coverage: InterviewCoverage;
  evaluation: AnswerEvaluation | null;
  meta: InterviewSessionMeta;
  plan: RoutingPlan | null;
  reply: InterviewReply | null;
  scripted: InterviewReply | null;
  model: string;
  polish: boolean;
};

const InterviewState = Annotation.Root({
  input: Annotation<InterviewInput>(),
  coverage: Annotation<InterviewCoverage>(),
  evaluation: Annotation<AnswerEvaluation | null>(),
  meta: Annotation<InterviewSessionMeta>(),
  plan: Annotation<RoutingPlan | null>(),
  reply: Annotation<InterviewReply | null>(),
  scripted: Annotation<InterviewReply | null>(),
  model: Annotation<string>(),
  polish: Annotation<boolean>(),
});

async function evaluateTurn(state: TurnState): Promise<Partial<TurnState>> {
  const lastQuestion = combinedLastQuestion(state.input.transcript);
  const { evaluation, meta } = await evaluateCandidateTurn({
    title: state.input.title,
    statement: state.input.statement,
    stage: state.input.stage,
    message: state.input.message,
    coverage: state.input.coverage,
    transcript: state.input.transcript,
    execution: state.input.execution,
    lastQuestion,
  });
  let coverage = ensureMeta(state.input.coverage);
  coverage = ingestCandidateMessage(coverage, state.input.message);
  for (const point of evaluation.correctPoints) {
    coverage = ingestCandidateMessage(coverage, point);
  }
  coverage = mergeCoverageMeta(coverage, { ...meta, lastQuestionText: lastQuestion });
  return { evaluation, meta: { ...meta, lastQuestionText: lastQuestion }, coverage };
}

function routeTurn(state: TurnState): Partial<TurnState> {
  if (!state.evaluation) return {};
  const plan = planRouting({
    stage: state.input.stage,
    evaluation: state.evaluation,
    meta: state.meta,
    coverage: state.coverage,
    executionVerdict: state.input.execution?.verdict ?? null,
    codeLooksStub: codeLooksLikeStub(state.input.code ?? ""),
  });
  return { plan, meta: { ...state.meta, nextAction: state.evaluation.nextAction } };
}

function composeTurn(state: TurnState): Partial<TurnState> {
  if (!state.evaluation || !state.plan) return {};
  const rubric = assessResponse({
    stage: state.input.stage,
    message: state.input.message,
    coverage: state.input.coverage,
  });
  const adaptive = interviewerReplyWithCoverage({
    title: state.input.title,
    stage: state.input.stage,
    message: state.input.message,
    code: state.input.code,
    coverage: state.coverage,
    execution: state.input.execution,
    nextHint: state.input.nextHint,
    hintsExhausted: state.input.hintsExhausted,
    responseAssessment: { sufficiency: state.plan.sufficiency, missing: rubric.missing },
  });
  const scripted = adaptive.reply;
  const tailored = replyFromEvaluation({
    stage: state.input.stage,
    title: state.input.title,
    evaluation: state.evaluation,
    plan: state.plan,
    lastQuestion: state.meta.lastQuestionText,
  });
  let reply = tailored ?? scripted;
  reply = clampReplyStage(reply, state.plan, state.input.stage);
  reply = guardRepetitiveReply(reply, state.coverage, scripted);
  const message = sanitizeCandidateFacingText(reply.message);
  if (!message) reply = scripted;
  else reply = { ...reply, message };
  let coverage = recordAskedQuestion(adaptive.coverage, reply.message);
  coverage = mergeCoverageMeta(coverage, state.meta);
  return { reply, scripted, coverage, model: "heuristic" };
}

async function polishTurn(state: TurnState): Promise<Partial<TurnState>> {
  if (!state.polish || !readLlmConfigFromEnv() || !state.reply || !state.evaluation || !state.plan) {
    return {};
  }
  const allowed = allowedStages(state.input.stage, state.reply.stage);
  try {
    const turnPrompt = interviewTurnPrompt({
      title: state.input.title,
      statement: state.input.statement,
      stage: state.input.stage,
      allowed,
      message: state.input.message,
      code: state.input.code,
      execution: state.input.execution,
      nextHint: state.input.nextHint,
      coverage: state.coverage,
      sufficiency: state.plan.sufficiency,
      answerEvaluation: {
        classification: state.evaluation.classification,
        nextAction: state.evaluation.nextAction,
        correctPoints: state.evaluation.correctPoints,
        issues: state.evaluation.issues,
        missingConcepts: state.evaluation.missingConcepts,
      },
    });
    const messages = [
      new SystemMessage(INTERVIEWER_PROMPT),
      ...transcriptToMessages(state.input.transcript.slice(-16)),
      ...toLangChainMessages([{ role: "user", content: turnPrompt }]),
    ];
    const raw = await invokeJsonObject(messages, { temperature: 0.35, jsonMode: true });
    const parsed = interviewReplySchema.parse(coerceInterviewReply(raw));
    if (leaksImplementation(parsed.message)) return {};
    const stage = allowed.includes(parsed.stage) ? parsed.stage : state.reply.stage;
    let candidate = clampReplyStage({ ...parsed, stage }, state.plan, state.input.stage);
    candidate = guardRepetitiveReply(candidate, state.coverage, state.reply);
    const clean = sanitizeCandidateFacingText(candidate.message);
    if (!clean) return {};
    candidate = { ...candidate, message: clean };
    let coverage = recordAskedQuestion(state.coverage, candidate.message);
    coverage = mergeCoverageMeta(coverage, state.meta);
    return { reply: candidate, coverage, model: getConfiguredModelName() };
  } catch {
    return {};
  }
}

function shouldPolish(state: TurnState): "polishReply" | typeof END {
  if (state.polish && readLlmConfigFromEnv()) return "polishReply";
  return END;
}

export function buildInterviewGraph() {
  return new StateGraph(InterviewState)
    .addNode("evaluate", (state) => evaluateTurn(state as TurnState))
    .addNode("route", (state) => routeTurn(state as TurnState))
    .addNode("compose", (state) => composeTurn(state as TurnState))
    .addNode("polishReply", (state) => polishTurn(state as TurnState))
    .addEdge(START, "evaluate")
    .addEdge("evaluate", "route")
    .addEdge("route", "compose")
    .addConditionalEdges("compose", (state) => shouldPolish(state as TurnState))
    .addEdge("polishReply", END)
    .compile();
}

export async function runInterviewTurn(
  input: InterviewInput,
  options: InterviewGraphOptions,
): Promise<{ result: InterviewReply; coverage: InterviewCoverage; model: string }> {
  const graph = buildInterviewGraph();
  const finalState = (await graph.invoke({
    input,
    coverage: ensureMeta(input.coverage),
    evaluation: null,
    meta: ensureMeta(input.coverage).meta!,
    plan: null,
    reply: null,
    scripted: null,
    model: "heuristic",
    polish: options.polish,
  })) as TurnState;

  if (!finalState.reply) {
    return heuristicInterviewTurn(input);
  }
  return {
    result: finalState.reply,
    coverage: finalState.coverage,
    model: finalState.model,
  };
}
