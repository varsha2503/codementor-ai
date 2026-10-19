import type { AnswerNextAction } from "@codementor/shared";
import type { QuestionIntent } from "./interview-coverage.js";
import { normalizeSpeech } from "./interview-coverage.js";

export type TopicMark =
  | "negative-input"
  | "overflow-discussed"
  | "no-string-noted"
  | "half-reverse"
  | "array-digits"
  | "long-long-noted"
  | "reversal-core";

export type InterviewSessionMeta = {
  marks: TopicMark[];
  pendingGaps: string[];
  followUpCounts: Record<string, number>;
  lastQuestionText: string;
  lastQuestionIntent: QuestionIntent | null;
  nextAction: AnswerNextAction | null;
  recordedIssues: string[];
};

export function emptyInterviewMeta(): InterviewSessionMeta {
  return {
    marks: [],
    pendingGaps: [],
    followUpCounts: {},
    lastQuestionText: "",
    lastQuestionIntent: null,
    nextAction: null,
    recordedIssues: [],
  };
}

export function hasMark(meta: InterviewSessionMeta, mark: TopicMark): boolean {
  return meta.marks.includes(mark);
}

export function addMark(meta: InterviewSessionMeta, mark: TopicMark): InterviewSessionMeta {
  if (hasMark(meta, mark)) return meta;
  return { ...meta, marks: [...meta.marks, mark] };
}

export function recordIssue(meta: InterviewSessionMeta, issue: string): InterviewSessionMeta {
  const trimmed = issue.trim().slice(0, 300);
  if (!trimmed || meta.recordedIssues.includes(trimmed)) return meta;
  return { ...meta, recordedIssues: [...meta.recordedIssues, trimmed].slice(0, 20) };
}

export function bumpFollowUp(meta: InterviewSessionMeta, key: string): InterviewSessionMeta {
  const count = (meta.followUpCounts[key] ?? 0) + 1;
  return { ...meta, followUpCounts: { ...meta.followUpCounts, [key]: count } };
}

export function followUpCount(meta: InterviewSessionMeta, key: string): number {
  return meta.followUpCounts[key] ?? 0;
}

const VAGUE_ACK =
  /^(yes|yeah|yep|yup|ok|okay|k|sure|right|correct|got it|i see|understood|mm hmm|mhm|uh huh|alright)([\s,!.]*(yes|yeah|yep|ok|okay|sure))*$/i;

export function isVagueAcknowledgment(message: string): boolean {
  const norm = normalizeSpeech(message);
  if (!norm) return true;
  if (/^(ready|i am ready|im ready|lets start|let s start|start)$/i.test(norm)) return false;
  if (VAGUE_ACK.test(norm)) return true;
  if (norm.length <= 14 && !/\b(loop|mod|digit|negative|reverse|overflow|string|array|compare|return|false|true|complexity|o\s*\()\b/.test(norm)) {
    return true;
  }
  return false;
}

export function isNonAnswerAcknowledgment(message: string, stageRequiresReasoning: boolean): boolean {
  if (!stageRequiresReasoning) return isVagueAcknowledgment(message);
  const norm = normalizeSpeech(message);
  if (VAGUE_ACK.test(norm)) return true;
  if (norm.split(" ").length < 6 && !/\b(because|since|mod|reverse|negative|false|compare|digit|overflow|string)\b/.test(norm)) {
    return true;
  }
  return false;
}

const INTERNAL_LABEL = /^(runTests|run_tests|executeTests|submitCode|true|false|null|undefined)$/i;

export function sanitizeCandidateFacingText(text: string): string {
  const trimmed = text.trim();
  if (!trimmed || INTERNAL_LABEL.test(trimmed)) return "";
  if (/\brunTests\b/i.test(trimmed) && trimmed.length < 40) return "";
  return trimmed;
}

export function lastInterviewerTurn(transcript: { role: string; message: string }[]): {
  message: string;
  followUp?: string;
} | null {
  for (let i = transcript.length - 1; i >= 0; i--) {
    const turn = transcript[i];
    if (turn?.role === "interviewer") return { message: turn.message };
  }
  return null;
}

export function combinedLastQuestion(transcript: { role: string; message: string; followUp?: string }[]): string {
  const last = lastInterviewerTurn(transcript);
  if (!last) return "";
  return [last.message, last.followUp].filter(Boolean).join(" ");
}
