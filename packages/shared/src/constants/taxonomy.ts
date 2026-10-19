export const MISTAKE_CATEGORIES = [
  "INCORRECT_BASE_CASE",
  "OFF_BY_ONE",
  "INCORRECT_BOUNDARY_HANDLING",
  "WRONG_DATA_STRUCTURE",
  "INCORRECT_DP_TRANSITION",
  "MISSING_VISITED_STATE",
  "INTEGER_OVERFLOW",
  "TIME_COMPLEXITY_TOO_HIGH",
  "INCORRECT_DUPLICATES",
] as const;

export type MistakeCategory = (typeof MISTAKE_CATEGORIES)[number];

export const MISTAKE_LABELS: Record<MistakeCategory, string> = {
  INCORRECT_BASE_CASE: "Incorrect base case",
  OFF_BY_ONE: "Off-by-one error",
  INCORRECT_BOUNDARY_HANDLING: "Incorrect boundary handling",
  WRONG_DATA_STRUCTURE: "Wrong data structure",
  INCORRECT_DP_TRANSITION: "Incorrect DP state transition",
  MISSING_VISITED_STATE: "Missing visited-state handling",
  INTEGER_OVERFLOW: "Integer overflow risk",
  TIME_COMPLEXITY_TOO_HIGH: "Time complexity too high",
  INCORRECT_DUPLICATES: "Incorrect handling of duplicates",
};

export function isMistakeCategory(value: string): value is MistakeCategory {
  return (MISTAKE_CATEGORIES as readonly string[]).includes(value);
}

export const TOPIC_LABELS: Record<string, string> = {
  arrays: "Arrays",
  sorting: "Sorting",
  strings: "Strings",
  "binary-search": "Binary search",
  "linked-lists": "Linked lists",
  trees: "Trees",
  "binary-search-trees": "Binary search trees",
  graphs: "Graphs",
  recursion: "Recursion",
  "bit-manipulation": "Bit manipulation",
  "stacks-queues": "Stacks and queues",
  heaps: "Heaps",
  greedy: "Greedy",
  "dynamic-programming": "Dynamic programming",
  tries: "Tries",
  basics: "Basics",
  "sliding-window": "Sliding window",
};

export const HINT_TITLES: Record<number, string> = {
  1: "Conceptual hint",
  2: "Data-structure hint",
  3: "Algorithm hint",
  4: "Solution explanation",
};

export const TERMINAL_VERDICTS = [
  "ACCEPTED",
  "WRONG_ANSWER",
  "COMPILE_ERROR",
  "TIME_LIMIT_EXCEEDED",
  "MEMORY_LIMIT_EXCEEDED",
  "RUNTIME_ERROR",
  "CANCELLED",
  "INTERNAL_ERROR",
] as const;

export function isTerminalVerdict(verdict: string): boolean {
  return (TERMINAL_VERDICTS as readonly string[]).includes(verdict);
}
