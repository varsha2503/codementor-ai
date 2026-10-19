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

export const TOPICS = Object.keys(TOPIC_LABELS);

export function topicLabel(topic: string) {
  return TOPIC_LABELS[topic] ?? topic;
}

export const VERDICT_LABELS: Record<string, string> = {
  QUEUED: "Queued",
  COMPILING: "Compiling",
  RUNNING: "Running",
  EVALUATING: "Evaluating",
  ACCEPTED: "Accepted",
  WRONG_ANSWER: "Wrong answer",
  COMPILE_ERROR: "Compile error",
  TIME_LIMIT_EXCEEDED: "Time limit",
  MEMORY_LIMIT_EXCEEDED: "Memory limit",
  RUNTIME_ERROR: "Runtime error",
  CANCELLED: "Cancelled",
  INTERNAL_ERROR: "Runner error",
  EXECUTED: "Executed",
  PASSED: "Passed",
};

export function verdictLabel(verdict: string, kind?: string) {
  if (verdict === "ACCEPTED" && kind === "RUN") return "Samples passed";
  return VERDICT_LABELS[verdict] ?? verdict;
}

export function verdictTone(verdict: string) {
  if (verdict === "ACCEPTED" || verdict === "PASSED" || verdict === "EXECUTED") return "text-good border-good/40 bg-good/10";
  if (verdict === "WRONG_ANSWER" || verdict === "COMPILE_ERROR" || verdict === "RUNTIME_ERROR") {
    return "text-bad border-bad/40 bg-bad/10";
  }
  if (verdict === "TIME_LIMIT_EXCEEDED" || verdict === "MEMORY_LIMIT_EXCEEDED") {
    return "text-warn border-warn/40 bg-warn/10";
  }
  return "text-muted border-line bg-panel2";
}

export const TERMINAL = new Set([
  "ACCEPTED",
  "WRONG_ANSWER",
  "COMPILE_ERROR",
  "TIME_LIMIT_EXCEEDED",
  "MEMORY_LIMIT_EXCEEDED",
  "RUNTIME_ERROR",
  "CANCELLED",
  "INTERNAL_ERROR",
]);

export const MISTAKE_NOTE = "No category yet. A time limit is tagged automatically. Other labels are added only when they fit the fixed list.";

export function difficultyTone(difficulty: string) {
  if (difficulty === "EASY") return "text-good";
  if (difficulty === "HARD") return "text-bad";
  return "text-warn";
}
