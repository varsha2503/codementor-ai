import { interviewerReplyWithCoverage } from "./interview.js";
import type { InterviewInput } from "./types.js";

/** Direct scripted interview turn without LangGraph polish (used as graph fallback). */
export function heuristicInterviewTurn(input: InterviewInput) {
  const adaptive = interviewerReplyWithCoverage({
    title: input.title,
    stage: input.stage,
    message: input.message,
    code: input.code,
    coverage: input.coverage,
    execution: input.execution,
    nextHint: input.nextHint,
    hintsExhausted: input.hintsExhausted,
  });
  return { model: "heuristic", result: adaptive.reply, coverage: adaptive.coverage };
}
