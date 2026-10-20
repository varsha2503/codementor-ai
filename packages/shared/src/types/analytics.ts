export type Difficulty = "EASY" | "MEDIUM" | "HARD";

export type AttemptFact = {
  problemId: string;
  kind: "RUN" | "SUBMIT";
  verdict: string;
  createdAt: string;
  topics: string[];
  difficulty: Difficulty;
};

export type HintFact = {
  problemId: string;
  createdAt: string;
};

export type ProblemFact = {
  id: string;
  slug: string;
  title: string;
  difficulty: Difficulty;
  topics: string[];
};

const DIFFICULTY_RANK: Record<Difficulty, number> = { EASY: 0, MEDIUM: 1, HARD: 2 };

export function utcDay(iso: string): string {
  return iso.slice(0, 10);
}

export function previousDay(day: string): string {
  const [year, month, date] = day.split("-").map(Number);
  const utc = Date.UTC(year ?? 1970, (month ?? 1) - 1, date ?? 1);
  const prior = new Date(utc - 24 * 60 * 60 * 1000);
  return prior.toISOString().slice(0, 10);
}

export function computeStreak(attemptDays: string[], today: string): number {
  const days = new Set(attemptDays);
  let cursor = today;
  if (!days.has(cursor)) {
    cursor = previousDay(cursor);
    if (!days.has(cursor)) return 0;
  }
  let streak = 0;
  while (days.has(cursor)) {
    streak += 1;
    cursor = previousDay(cursor);
  }
  return streak;
}

export function nextHintLevel(priorLevels: number[]): number {
  const highest = priorLevels.reduce((max, level) => Math.max(max, level), 0);
  return Math.min(4, highest + 1);
}

export type TopicStat = {
  topic: string;
  submits: number;
  accepted: number;
  accuracy: number;
};

export function topicStats(attempts: AttemptFact[]): TopicStat[] {
  const buckets = new Map<string, { submits: number; accepted: number }>();
  for (const attempt of attempts) {
    if (attempt.kind !== "SUBMIT") continue;
    if (attempt.verdict === "COMPILE_ERROR" || attempt.verdict === "INTERNAL_ERROR" || attempt.verdict === "CANCELLED") {
      continue;
    }
    if (!["ACCEPTED", "WRONG_ANSWER", "TIME_LIMIT_EXCEEDED", "MEMORY_LIMIT_EXCEEDED", "RUNTIME_ERROR"].includes(attempt.verdict)) {
      continue;
    }
    for (const topic of attempt.topics) {
      const bucket = buckets.get(topic) ?? { submits: 0, accepted: 0 };
      bucket.submits += 1;
      if (attempt.verdict === "ACCEPTED") bucket.accepted += 1;
      buckets.set(topic, bucket);
    }
  }
  return [...buckets.entries()]
    .map(([topic, bucket]) => ({
      topic,
      submits: bucket.submits,
      accepted: bucket.accepted,
      accuracy: bucket.submits === 0 ? 0 : bucket.accepted / bucket.submits,
    }))
    .sort((a, b) => a.accuracy - b.accuracy || b.submits - a.submits);
}

export type DifficultyStat = {
  difficulty: Difficulty;
  total: number;
  attempted: number;
  solved: number;
  accuracy: number;
};

export function difficultyStats(attempts: AttemptFact[], problems: ProblemFact[]): DifficultyStat[] {
  const solved = solvedProblemIds(attempts);
  const attempted = new Set(attempts.filter((item) => item.kind === "SUBMIT").map((item) => item.problemId));
  return (["EASY", "MEDIUM", "HARD"] as Difficulty[]).map((difficulty) => {
    const matching = problems.filter((problem) => problem.difficulty === difficulty);
    const total = matching.length;
    const attemptedCount = matching.filter((problem) => attempted.has(problem.id)).length;
    const solvedCount = matching.filter((problem) => solved.has(problem.id)).length;
    return {
      difficulty,
      total,
      attempted: attemptedCount,
      solved: solvedCount,
      accuracy: total === 0 ? 0 : solvedCount / total,
    };
  });
}

export function solvedProblemIds(attempts: AttemptFact[]): Set<string> {
  const ids = new Set<string>();
  for (const attempt of attempts) {
    if (attempt.kind === "SUBMIT" && attempt.verdict === "ACCEPTED") ids.add(attempt.problemId);
  }
  return ids;
}

export function assistanceSplit(attempts: AttemptFact[], hints: HintFact[]): { independent: number; assisted: number } {
  const firstAccept = new Map<string, string>();
  for (const attempt of [...attempts].sort((a, b) => a.createdAt.localeCompare(b.createdAt))) {
    if (attempt.kind === "SUBMIT" && attempt.verdict === "ACCEPTED" && !firstAccept.has(attempt.problemId)) {
      firstAccept.set(attempt.problemId, attempt.createdAt);
    }
  }
  let assisted = 0;
  let independent = 0;
  for (const [problemId, acceptedAt] of firstAccept) {
    const helped = hints.some((hint) => hint.problemId === problemId && hint.createdAt <= acceptedAt);
    if (helped) assisted += 1;
    else independent += 1;
  }
  return { independent, assisted };
}

export function recommendProblems(attempts: AttemptFact[], problems: ProblemFact[], limit = 5): ProblemFact[] {
  const solved = solvedProblemIds(attempts);
  const unsolved = problems.filter((problem) => !solved.has(problem.id));
  const stats = topicStats(attempts).filter((stat) => stat.submits > 0);
  const rankedTopics = stats.map((stat) => stat.topic);
  const score = (problem: ProblemFact) => {
    const ranks = problem.topics.map((topic) => {
      const index = rankedTopics.indexOf(topic);
      return index === -1 ? rankedTopics.length : index;
    });
    const topicRank = ranks.length === 0 ? rankedTopics.length : Math.min(...ranks);
    return topicRank * 10 + DIFFICULTY_RANK[problem.difficulty];
  };
  const ordered = [...unsolved].sort((a, b) => score(a) - score(b) || a.title.localeCompare(b.title));
  if (rankedTopics.length === 0) {
    return ordered.filter((problem) => problem.difficulty === "EASY").slice(0, limit);
  }
  return ordered.slice(0, limit);
}
