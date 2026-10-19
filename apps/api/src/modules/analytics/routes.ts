import { Router } from "express";
import {
  assistanceSplit,
  computeStreak,
  difficultyStats,
  MISTAKE_LABELS,
  profileSchema,
  recommendProblems,
  solvedProblemIds,
  topicStats,
  type AttemptFact,
  type Difficulty,
  type ProblemFact,
} from "@codementor/shared";
import { asyncRoute, HttpError } from "../../middleware/http.js";
import { prisma } from "../../config/prisma.js";
import { requireUser, type AuthedRequest } from "../../middleware/auth.js";

export const analyticsRouter = Router();

analyticsRouter.get(
  "/me",
  requireUser,
  asyncRoute(async (req, res) => {
    const user = await prisma.user.findUnique({
      where: { id: (req as AuthedRequest).userId },
      select: { id: true, email: true, displayName: true, createdAt: true },
    });
    if (!user) throw new HttpError(401, "Sign in to continue.", "UNAUTHENTICATED");
    res.json({ user });
  }),
);

analyticsRouter.patch(
  "/me",
  requireUser,
  asyncRoute(async (req, res) => {
    const body = profileSchema.parse(req.body);
    const user = await prisma.user.update({
      where: { id: (req as AuthedRequest).userId },
      data: { displayName: body.displayName },
      select: { id: true, email: true, displayName: true, createdAt: true },
    });
    res.json({ user });
  }),
);

analyticsRouter.get(
  "/me/attempts",
  requireUser,
  asyncRoute(async (req, res) => {
    const take = Math.min(50, Math.max(1, Number(req.query.limit) || 20));
    const attempts = await prisma.attempt.findMany({
      where: { userId: (req as AuthedRequest).userId },
      include: { problem: { select: { slug: true, title: true, difficulty: true, topics: true } } },
      orderBy: { createdAt: "desc" },
      take,
    });
    res.json({
      attempts: attempts.map((attempt) => ({
        id: attempt.id,
        kind: attempt.kind,
        verdict: attempt.verdict,
        testsPassed: attempt.testsPassed,
        testsTotal: attempt.testsTotal,
        runtimeMs: attempt.runtimeMs,
        createdAt: attempt.createdAt,
        problem: attempt.problem,
      })),
    });
  }),
);

analyticsRouter.get(
  "/me/analytics",
  requireUser,
  asyncRoute(async (req, res) => {
    const userId = (req as AuthedRequest).userId;
    const [attempts, hints, issues, problems] = await Promise.all([
      prisma.attempt.findMany({
        where: { userId },
        include: { problem: { select: { id: true, topics: true, difficulty: true } } },
      }),
      prisma.aIInteraction.findMany({
        where: { userId, type: "HINT" },
        include: { problem: { select: { slug: true, title: true } } },
      }),
      prisma.attemptIssue.findMany({
        where: { attempt: { userId } },
        include: { attempt: { select: { createdAt: true, problem: { select: { topics: true } } } } },
      }),
      prisma.problem.findMany({ select: { id: true, slug: true, title: true, difficulty: true, topics: true } }),
    ]);
    const facts: AttemptFact[] = attempts.map((attempt) => ({
      problemId: attempt.problemId,
      kind: attempt.kind,
      verdict: attempt.verdict,
      createdAt: attempt.createdAt.toISOString(),
      topics: attempt.problem.topics,
      difficulty: attempt.problem.difficulty,
    }));
    const hintFacts = hints.map((hint) => ({ problemId: hint.problemId, createdAt: hint.createdAt.toISOString() }));
    const solved = solvedProblemIds(facts);
    const today = new Date().toISOString().slice(0, 10);
    const recentCutoff = Date.now() - 14 * 24 * 60 * 60 * 1000;
    const mistakeCounts = (rows: typeof issues) => {
      const buckets = new Map<string, { count: number; topics: Set<string> }>();
      for (const issue of rows) {
        const bucket = buckets.get(issue.category) ?? { count: 0, topics: new Set<string>() };
        bucket.count += 1;
        for (const topic of issue.attempt.problem.topics) bucket.topics.add(topic);
        buckets.set(issue.category, bucket);
      }
      return [...buckets.entries()]
        .map(([category, bucket]) => ({
          category,
          label: MISTAKE_LABELS[category as keyof typeof MISTAKE_LABELS] ?? category,
          count: bucket.count,
          topics: [...bucket.topics],
        }))
        .sort((a, b) => b.count - a.count);
    };
    const hintsByProblem = new Map<string, { slug: string; title: string; hints: number; solved: boolean; problemId: string }>();
    for (const hint of hints) {
      const current = hintsByProblem.get(hint.problemId) ?? {
        problemId: hint.problemId,
        slug: hint.problem.slug,
        title: hint.problem.title,
        hints: 0,
        solved: solved.has(hint.problemId),
      };
      current.hints += 1;
      hintsByProblem.set(hint.problemId, current);
    }
    res.json({
      solved: solved.size,
      totalSubmits: facts.filter((item) => item.kind === "SUBMIT").length,
      totalRuns: facts.filter((item) => item.kind === "RUN").length,
      streak: computeStreak(facts.map((item) => item.createdAt.slice(0, 10)), today),
      topics: topicStats(facts),
      difficulties: difficultyStats(facts, problems as ProblemFact[]),
      assistance: assistanceSplit(facts, hintFacts),
      hintsByProblem: [...hintsByProblem.values()].sort((a, b) => b.hints - a.hints),
      mistakes: mistakeCounts(issues),
      recentMistakes: mistakeCounts(issues.filter((issue) => issue.attempt.createdAt.getTime() >= recentCutoff)),
    });
  }),
);

analyticsRouter.get(
  "/me/recommendations",
  requireUser,
  asyncRoute(async (req, res) => {
    const userId = (req as AuthedRequest).userId;
    const limit = Math.min(12, Math.max(1, Number(req.query.limit) || 5));
    const [attempts, problems] = await Promise.all([
      prisma.attempt.findMany({
        where: { userId },
        include: { problem: { select: { topics: true, difficulty: true } } },
      }),
      prisma.problem.findMany({ select: { id: true, slug: true, title: true, difficulty: true, topics: true } }),
    ]);
    const facts: AttemptFact[] = attempts.map((attempt) => ({
      problemId: attempt.problemId,
      kind: attempt.kind,
      verdict: attempt.verdict,
      createdAt: attempt.createdAt.toISOString(),
      topics: attempt.problem.topics,
      difficulty: attempt.problem.difficulty as Difficulty,
    }));
    res.json({ problems: recommendProblems(facts, problems, limit) });
  }),
);
