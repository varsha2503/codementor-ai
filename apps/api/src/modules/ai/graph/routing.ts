import type { AnswerEvaluation, InterviewReply, InterviewStage } from "@codementor/shared";
import { hasConcept, type InterviewCoverage, type Sufficiency } from "../interview-coverage.js";
import { hasMark, type InterviewSessionMeta } from "../interview-meta.js";
import { sufficiencyFromEvaluation } from "../evaluation/heuristic.js";

export type GraphRoutingAction =
  | "advanceStage"
  | "clarify"
  | "explain"
  | "stay"
  | "runTests"
  | "finish";

export type RoutingPlan = {
  action: GraphRoutingAction;
  targetStage: InterviewStage;
  sufficiency: Sufficiency;
  allowPolish: boolean;
};

const STAGE_ORDER: InterviewStage[] = ["introduction", "understanding", "approach", "coding", "complexity", "feedback"];

function nextStage(current: InterviewStage): InterviewStage {
  const i = STAGE_ORDER.indexOf(current);
  return STAGE_ORDER[Math.min(i + 1, STAGE_ORDER.length - 1)] ?? current;
}

export function planRouting(input: {
  stage: InterviewStage;
  evaluation: AnswerEvaluation;
  meta: InterviewSessionMeta;
  coverage: InterviewCoverage;
  executionVerdict: string | null;
  codeLooksStub: boolean;
}): RoutingPlan {
  const sufficiency = sufficiencyFromEvaluation(input.evaluation);
  let action: GraphRoutingAction = "stay";
  let targetStage = input.stage;

  if (input.evaluation.nextAction === "ADVANCE" && sufficiency === "sufficient") {
    action = "advanceStage";
    if (input.stage === "coding" && input.executionVerdict === "ACCEPTED") {
      targetStage = hasConcept(input.coverage, "complexity") ? "feedback" : "complexity";
    } else if (input.stage !== "feedback") {
      targetStage = input.stage === "complexity" && sufficiency === "sufficient" ? "feedback" : nextStage(input.stage);
    }
  } else if (input.evaluation.nextAction === "EXPLAIN") {
    action = "explain";
  } else if (input.evaluation.nextAction === "CLARIFY" || input.evaluation.classification === "UNCLEAR") {
    action = "clarify";
  } else if (input.evaluation.classification === "INCORRECT") {
    action = "explain";
  } else if (input.evaluation.nextAction === "ADVANCE") {
    action = "advanceStage";
    targetStage = input.stage === "approach" ? "coding" : nextStage(input.stage);
  }

  if (input.stage === "coding") {
    if (input.codeLooksStub && input.executionVerdict === null) {
      action = "stay";
      targetStage = "coding";
    } else if (
      input.executionVerdict === null &&
      /\b(implemented|done coding|finished|submitted|run tests|execute)\b/i.test(input.evaluation.nextTopic ?? "")
    ) {
      action = "runTests";
      targetStage = "coding";
    }
  }

  if (input.stage === "feedback") action = "finish";

  return { action, targetStage, sufficiency, allowPolish: action !== "runTests" && action !== "finish" };
}

export function clampReplyStage(reply: InterviewReply, plan: RoutingPlan, current: InterviewStage): InterviewReply {
  const allowed = new Set<InterviewStage>([current, plan.targetStage]);
  if (!allowed.has(reply.stage)) return { ...reply, stage: plan.targetStage };
  if (plan.action === "clarify" || plan.action === "explain") {
    return { ...reply, stage: current };
  }
  return { ...reply, stage: plan.targetStage };
}

export function mergeCoverageMeta(coverage: InterviewCoverage, meta: InterviewSessionMeta): InterviewCoverage {
  return { ...coverage, meta };
}
