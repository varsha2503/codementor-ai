import { answerEvaluationSchema, type AnswerEvaluation } from "@codementor/shared";
import type { InterviewStage } from "@codementor/shared";
import {
  addMark,
  bumpFollowUp,
  followUpCount,
  hasMark,
  recordIssue,
  type InterviewSessionMeta,
  type TopicMark,
} from "../interview-meta.js";
import { normalizeSpeech } from "../interview-coverage.js";
import type { ProblemProfile } from "../problem-profile.js";

export type PalindromeEvalResult = {
  evaluation: AnswerEvaluation;
  meta: InterviewSessionMeta;
};

function baseEval(partial: Partial<AnswerEvaluation>): AnswerEvaluation {
  return answerEvaluationSchema.parse({
    classification: "UNCLEAR",
    correctPoints: [],
    issues: [],
    missingConcepts: [],
    explanation: "",
    nextAction: "CLARIFY",
    ...partial,
  });
}

function questionAboutNegative(lastQuestion: string): boolean {
  const q = normalizeSpeech(lastQuestion);
  return /\b(negative|less than zero|n\s*<\s*0)\b/.test(q);
}

function questionAboutOverflow(lastQuestion: string): boolean {
  const q = normalizeSpeech(lastQuestion);
  return /\b(overflow|32.?bit|long long|large value|entire number)\b/.test(q);
}

function questionAboutString(lastQuestion: string): boolean {
  const q = normalizeSpeech(lastQuestion);
  return /\b(string|convert)\b/.test(q);
}

export function evaluatePalindromeTurn(input: {
  stage: InterviewStage;
  message: string;
  lastQuestion: string;
  meta: InterviewSessionMeta;
  profile: ProblemProfile;
}): PalindromeEvalResult | null {
  if (input.profile.kind !== "palindrome-number") return null;
  const text = input.message.trim();
  const norm = normalizeSpeech(text);
  let meta = { ...input.meta };

  if (/\b(string|to_string|stringstream|std::string)\b/.test(norm) && /\b(convert|compare|digit|first and last)\b/.test(norm)) {
    meta = addMark(meta, "no-string-noted");
    meta = recordIssue(meta, "Proposed string conversion against numeric interview constraints.");
    const forbids = input.profile.forbidsStringConversion;
    return {
      meta,
      evaluation: baseEval({
        classification: "INCORRECT",
        issues: [forbids ? "String conversion violates the stated constraint." : "String conversion skips the numeric reasoning we want here."],
        explanation:
          "Extract digits with modulo and division, or reverse half the number numerically, instead of converting to a string.",
        nextAction: forbids ? "CLARIFY" : "EXPLAIN",
        nextTopic: "numeric-digit-approach",
        correctPoints: [],
      }),
    };
  }

  if (/\b(negative|less than zero)\b/.test(norm) && /\b(false|not|cannot|can't|return)\b/.test(norm)) {
    meta = addMark(meta, "negative-input");
    return {
      meta,
      evaluation: baseEval({
        classification: "CORRECT",
        correctPoints: ["Negative inputs are not palindromes under the usual integer definition."],
        nextAction: "ADVANCE",
        nextTopic: "approach",
      }),
    };
  }

  if (/\b(array|vector|list)\b/.test(norm) && /\b(mod|modulo|digit|loop)\b/.test(norm)) {
    meta = addMark(meta, "array-digits");
    meta = addMark(meta, "reversal-core");
    const issues: string[] = [];
    if (/\bwithout extra space|o\s*\(\s*1\s*\)\s*space|constant space\b/i.test(input.lastQuestion)) {
      issues.push("An array of digits uses O(d) auxiliary space; consider reversing half in O(1) extra space.");
    }
    return {
      meta,
      evaluation: baseEval({
        classification: issues.length ? "NEARLY_CORRECT" : "CORRECT",
        correctPoints: ["Digit extraction with modulo in a loop is a valid starting approach."],
        issues,
        explanation: issues[0] ?? "",
        nextAction: "ADVANCE",
        nextTopic: issues.length ? "space-or-half-reverse" : "coding",
      }),
    };
  }

  if (/\b(reverse|reversing)\b/.test(norm) && /\b(mod|divide|compare|original)\b/.test(norm)) {
    meta = addMark(meta, "reversal-core");
    const fullReverse = /\b(entire|whole|full)\b/.test(norm) || !/\bhalf\b/.test(norm);
    if (fullReverse && !hasMark(meta, "overflow-discussed")) {
      if (questionAboutOverflow(input.lastQuestion) || followUpCount(meta, "overflow") >= 1) {
        meta = addMark(meta, "overflow-discussed");
        return {
          meta,
          evaluation: baseEval({
            classification: "NEARLY_CORRECT",
            correctPoints: ["Reversing digits numerically matches the problem structure."],
            issues: [],
            nextAction: "ADVANCE",
            nextTopic: "half-reverse-hint",
          }),
        };
      }
      meta = bumpFollowUp(meta, "overflow");
      return {
        meta,
        evaluation: baseEval({
          classification: "NEARLY_CORRECT",
          correctPoints: ["Reversing the digit sequence is the right idea."],
          issues: ["Reversing the entire number can overflow before the comparison finishes."],
          explanation: "Reversing only half the digits avoids building the full reversed value.",
          nextAction: followUpCount(meta, "overflow") > 1 ? "ADVANCE" : "CLARIFY",
          nextTopic: "overflow",
        }),
      };
    }
    if (/\bhalf\b/.test(norm)) meta = addMark(meta, "half-reverse");
    meta = addMark(meta, "overflow-discussed");
    return {
      meta,
      evaluation: baseEval({
        classification: "CORRECT",
        correctPoints: ["Numeric reversal approach is sound."],
        nextAction: "ADVANCE",
        nextTopic: "coding",
      }),
    };
  }

  if (/\b(long long|longlong|64.?bit)\b/.test(norm)) {
    meta = addMark(meta, "long-long-noted");
    if (!hasMark(meta, "overflow-discussed")) {
      meta = addMark(meta, "overflow-discussed");
      return {
        meta,
        evaluation: baseEval({
          classification: "PARTIALLY_CORRECT",
          correctPoints: ["Using a wider integer type increases range."],
          issues: ["A wider type does not remove overflow risk for every input under 32-bit constraints."],
          explanation: "Reversing half the digits keeps the reversed partial value small enough to compare safely.",
          nextAction: "ADVANCE",
          nextTopic: "half-reverse",
        }),
      };
    }
    return {
      meta,
      evaluation: baseEval({
        classification: "NEARLY_CORRECT",
        correctPoints: ["Acknowledged wider integer type."],
        nextAction: "ADVANCE",
        nextTopic: "coding",
      }),
    };
  }

  if (/\b(tricky|challenge|hard part)\b/.test(norm) && /\b(reverse|reversing|integer)\b/.test(norm)) {
    meta = addMark(meta, "reversal-core");
    return {
      meta,
      evaluation: baseEval({
        classification: "NEARLY_CORRECT",
        correctPoints: ["Identified reversal as the core challenge."],
        issues: [],
        nextAction: "ADVANCE",
        nextTopic: hasMark(meta, "overflow-discussed") ? "coding" : "overflow",
      }),
    };
  }

  if (questionAboutNegative(input.lastQuestion) && hasMark(meta, "negative-input")) {
    return {
      meta,
      evaluation: baseEval({
        classification: "CORRECT",
        correctPoints: ["Already covered negative inputs."],
        nextAction: "ADVANCE",
      }),
    };
  }

  if (questionAboutOverflow(input.lastQuestion) && hasMark(meta, "overflow-discussed")) {
    return {
      meta,
      evaluation: baseEval({
        classification: "CORRECT",
        correctPoints: ["Overflow topic already addressed."],
        nextAction: "ADVANCE",
      }),
    };
  }

  if (input.stage === "approach" && norm.split(" ").length >= 10 && /\b(mod|divide|compare|loop)\b/.test(norm)) {
    return {
      meta,
      evaluation: baseEval({
        classification: "NEARLY_CORRECT",
        correctPoints: ["Outlined a numeric approach."],
        nextAction: "ADVANCE",
        nextTopic: "coding",
      }),
    };
  }

  return null;
}

export function applyPalindromeMarksFromEvaluation(meta: InterviewSessionMeta, evaluation: AnswerEvaluation): InterviewSessionMeta {
  let next = meta;
  const topic = evaluation.nextTopic ?? "";
  const markForTopic: Record<string, TopicMark> = {
    overflow: "overflow-discussed",
    "half-reverse": "half-reverse",
    "half-reverse-hint": "half-reverse",
    "negative-input": "negative-input",
  };
  for (const [key, mark] of Object.entries(markForTopic)) {
    if (topic.includes(key)) next = addMark(next, mark);
  }
  for (const issue of evaluation.issues) next = recordIssue(next, issue);
  return next;
}
