import type { AnswerEvaluation, InterviewReply, InterviewStage } from "@codementor/shared";
import type { RoutingPlan } from "./routing.js";
import { hasMark } from "../interview-meta.js";

export function replyFromEvaluation(input: {
  stage: InterviewStage;
  title: string;
  evaluation: AnswerEvaluation;
  plan: RoutingPlan;
  lastQuestion: string;
}): InterviewReply | null {
  const { evaluation, plan } = input;

  if (plan.action === "runTests") {
    return {
      stage: "coding",
      message: "Use Run or Submit in the editor so the runner can judge correctness.",
      followUp: "Tell me what the runner reported once it finishes.",
    };
  }

  if (plan.action === "clarify" && evaluation.classification === "UNCLEAR") {
    const focus = input.lastQuestion ? `On "${truncate(input.lastQuestion, 120)}", ` : "";
    return {
      stage: input.stage,
      message: `${focus}what is your concrete answer in one or two sentences?`,
      followUp: "Skip acknowledgments — give the technical point I asked for.",
    };
  }

  if (evaluation.classification === "CORRECT" || evaluation.classification === "NEARLY_CORRECT") {
    const ack = evaluation.correctPoints[0] ? `${evaluation.correctPoints[0]} ` : "That works. ";
    const clarify = evaluation.explanation && evaluation.issues.length ? `${evaluation.explanation} ` : "";
    if (plan.action === "advanceStage" && input.stage === "approach" && plan.targetStage === "coding") {
      return {
        stage: "coding",
        message: `${ack}${clarify}Implement that in the editor when you are ready.`,
        followUp: "Run samples when you want the runner's verdict.",
      };
    }
    if (plan.action === "advanceStage" && input.stage === "understanding") {
      return {
        stage: "approach",
        message: `${ack}What is your core numeric approach — no string conversion?`,
        followUp: "High-level steps are enough.",
      };
    }
  }

  if (evaluation.classification === "INCORRECT" || plan.action === "explain") {
    const explain = evaluation.explanation || evaluation.issues[0] || "There is a constraint mismatch.";
    return {
      stage: input.stage,
      message: `${explain}`,
      followUp: evaluation.nextAction === "CLARIFY" ? "Try again with a numeric approach." : "Adjust your plan, then continue.",
    };
  }

  if (evaluation.classification === "PARTIALLY_CORRECT") {
    const gap = evaluation.issues[0] ?? evaluation.missingConcepts[0] ?? "one detail";
    if (plan.action === "advanceStage") {
      return {
        stage: plan.targetStage,
        message: `Mostly there — note ${gap} for later. Let's move on.`,
        followUp: plan.targetStage === "coding" ? "Start coding when ready." : "Continue.",
      };
    }
    return {
      stage: input.stage,
      message: `You are close. ${gap}`,
      followUp: "One focused sentence on that gap.",
    };
  }

  if (evaluation.issues.length && evaluation.nextAction === "CLARIFY" && evaluation.nextTopic === "overflow") {
    return {
      stage: input.stage,
      message: evaluation.explanation || evaluation.issues[0] || "How would you avoid overflow while reversing?",
      followUp: "Hint: you may not need the fully reversed number.",
    };
  }

  return null;
}

function truncate(text: string, max: number): string {
  const t = text.trim();
  return t.length <= max ? t : `${t.slice(0, max - 1)}…`;
}
