import { canonicalStage, interviewReplySchema, type InterviewReply, type InterviewStage } from "@codementor/shared";
import {
  adaptiveInterviewerReply,
  combineMessageAndFollowUp,
  emptyCoverage,
  guardRepetitiveReply,
  type InterviewCoverage,
} from "./interview-coverage.js";
export { codeDiscussionPrompt, codeLooksLikeStub } from "./interview-code.js";
export type { InterviewCoverage } from "./interview-coverage.js";
export {
  detectConcepts,
  emptyCoverage,
  guardRepetitiveReply,
  ingestCandidateMessage,
  isRepetitiveQuestion,
  loadCoverage,
  parseStoredCoverage,
  rebuildCoverageFromTranscript,
  assessResponse,
} from "./interview-coverage.js";

export type InterviewExecution = {
  verdict: string | null;
  testsPassed: number | null;
  testsTotal: number | null;
};

export function openingInterview(title: string): InterviewReply {
  return interviewReplySchema.parse({
    stage: "introduction",
    message: `I'm your interviewer for "${title}". We'll talk through the problem, then you code. One question at a time.`,
    followUp: "Say when you are ready.",
  });
}

export function asksForHelp(message: string): boolean {
  return /\b(hint|stuck|no idea|don't know|dont know|not sure|solution|show the code|write it for me)\b/i.test(message);
}

export function hintCeiling(message: string): number {
  return /\b(show the code|write it for me|full solution|explain the solution)\b/i.test(message) ? 4 : 3;
}

export function clientTurnIdOf(value: unknown): string | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const id = (value as Record<string, unknown>).clientTurnId;
  return typeof id === "string" && /^[A-Za-z0-9-]{8,80}$/.test(id) ? id : null;
}

export function hasClientTurn(rows: unknown[], clientTurnId: string): boolean {
  return rows.some((row) => clientTurnIdOf(row) === clientTurnId);
}

export function coerceInterviewReply(value: unknown): unknown {
  if (!value || typeof value !== "object" || Array.isArray(value)) return value;
  const record = value as Record<string, unknown>;
  const stage = typeof record.stage === "string" ? canonicalStage(record.stage) : null;
  const message = typeof record.message === "string" ? record.message.trim().slice(0, 2000) : record.message;
  const followUp =
    typeof record.followUp === "string" && record.followUp.trim().length > 0
      ? record.followUp.trim().slice(0, 400)
      : "Take your time — one clear point is enough.";
  return stage ? { ...record, stage, message, followUp } : { ...record, message, followUp };
}

function namesComplexity(message: string): boolean {
  return /\bO\s*\(|linear|constant|quadratic|logarithmic|log|n log/i.test(message);
}

function isClarifyingQuestion(message: string): boolean {
  if (!message.includes("?")) return false;
  if (namesComplexity(message)) return false;
  if (/\b(map|hash|stack|queue|heap|sort|two pointers|sliding|binary|dp|recursion|graph|bfs|dfs|greedy)\b/i.test(message) && message.length > 80) {
    return false;
  }
  return true;
}

export function interviewerReply(input: {
  title: string;
  stage: InterviewStage;
  message: string;
  code?: string;
  coverage?: InterviewCoverage;
  execution: InterviewExecution | null;
  nextHint: string | null;
  hintsExhausted?: boolean;
}): InterviewReply {
  const { reply } = adaptiveInterviewerReply({
    title: input.title,
    stage: canonicalStage(input.stage) ?? input.stage,
    message: input.message,
    code: input.code,
    execution: input.execution,
    coverage: input.coverage ?? emptyCoverage(),
    nextHint: input.nextHint,
    hintsExhausted: input.hintsExhausted,
    asksForHelp,
    isClarifyingQuestion,
  });
  return interviewReplySchema.parse(combineMessageAndFollowUp(reply));
}

export function interviewerReplyWithCoverage(input: {
  title: string;
  stage: InterviewStage;
  message: string;
  code?: string;
  coverage: InterviewCoverage;
  execution: InterviewExecution | null;
  nextHint: string | null;
  hintsExhausted?: boolean;
  responseAssessment?: import("./interview-coverage.js").AssessResponseResult;
}): { reply: InterviewReply; coverage: InterviewCoverage } {
  const { reply, coverage } = adaptiveInterviewerReply({
    title: input.title,
    stage: canonicalStage(input.stage) ?? input.stage,
    message: input.message,
    code: input.code,
    execution: input.execution,
    coverage: input.coverage,
    nextHint: input.nextHint,
    hintsExhausted: input.hintsExhausted,
    asksForHelp,
    isClarifyingQuestion,
    responseAssessment: input.responseAssessment,
  });
  return { reply: interviewReplySchema.parse(combineMessageAndFollowUp(reply)), coverage };
}

export function leaksImplementation(text: string): boolean {
  return /class\s+Solution/.test(text) || /```[\s\S]{80,}```/.test(text);
}
