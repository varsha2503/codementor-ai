import { isValidTopological, outputsMatch, type CompareMode } from "@codementor/shared";
import type { ProcessResult } from "./executor.js";

export function gradeOutput(result: ProcessResult, expected: unknown, mode: CompareMode, input: unknown): string {
  if (result.status !== "OK") return result.status;
  if (mode === "TOPOLOGICAL") {
    const count = Number((input as { count?: number }).count);
    const prerequisites = ((input as { prerequisites?: number[][] }).prerequisites ?? []) as number[][];
    return isValidTopological(result.actual, count, prerequisites) ? "PASSED" : "WRONG_ANSWER";
  }
  return outputsMatch(result.actual, expected, mode) ? "PASSED" : "WRONG_ANSWER";
}

export function caseMessage(status: string, hidden: boolean): string {
  if (status === "PASSED") return hidden ? "Hidden test passed." : "Passed.";
  if (status === "TIME_LIMIT_EXCEEDED") return hidden ? "A hidden test exceeded the time limit." : "Time limit exceeded.";
  if (status === "MEMORY_LIMIT_EXCEEDED") return hidden ? "A hidden test exceeded the memory limit." : "Memory limit exceeded.";
  if (status === "RUNTIME_ERROR") return hidden ? "A hidden test crashed." : "Runtime error.";
  return hidden ? "A hidden test failed. The input stays hidden." : "Wrong answer.";
}
