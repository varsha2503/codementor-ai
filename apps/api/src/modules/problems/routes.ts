import { Router } from "express";
import type { Prisma } from "@prisma/client";
import { prisma } from "../../config/prisma.js";
import { asyncRoute, HttpError } from "../../middleware/http.js";
import { requireUser, type AuthedRequest } from "../../middleware/auth.js";
import { executionQueue, rateLimit } from "../../queue/redis.js";
import { createAIService } from "../ai/service.js";
import { screenCandidates } from "./testPipeline.js";
import {
  SUBMISSION_LANGUAGES,
  starterFromCpp,
  problemSupportsLanguage,
  type SubmissionLanguage,
} from "@codementor/shared";

export const problemRouter = Router();
const ai = createAIService();

const publicProblem = {
  id: true,
  slug: true,
  title: true,
  difficulty: true,
  topics: true,
  tags: true,
  expectedTime: true,
  expectedSpace: true,
} satisfies Prisma.ProblemSelect;

const DEFAULT_PAGE_SIZE = 20;
const MAX_PAGE_SIZE = 50;

function positiveInt(value: unknown, fallback: number, max: number): number {
  const parsed = typeof value === "string" ? Number(value) : Number.NaN;
  if (!Number.isInteger(parsed) || parsed < 1) return fallback;
  return Math.min(parsed, max);
}

problemRouter.get(
  "/",
  requireUser,
  asyncRoute(async (req, res) => {
    const userId = (req as AuthedRequest).userId;
    const difficulty = typeof req.query.difficulty === "string" ? req.query.difficulty.toUpperCase() : undefined;
    const topic = typeof req.query.topic === "string" ? req.query.topic : undefined;
    const q = typeof req.query.q === "string" ? req.query.q.trim() : "";
    const page = positiveInt(req.query.page, 1, 10_000);
    const pageSize = positiveInt(req.query.limit, DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE);
    const where: Prisma.ProblemWhereInput = {
      ...(difficulty === "EASY" || difficulty === "MEDIUM" || difficulty === "HARD" ? { difficulty } : {}),
      ...(topic ? { topics: { has: topic } } : {}),
      ...(q
        ? {
            OR: [
              { title: { contains: q, mode: "insensitive" } },
              { slug: { contains: q, mode: "insensitive" } },
            ],
          }
        : {}),
    };
    const [total, problems, solved] = await Promise.all([
      prisma.problem.count({ where }),
      prisma.problem.findMany({
        where,
        select: publicProblem,
        orderBy: [{ difficulty: "asc" }, { title: "asc" }],
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.attempt.findMany({
        where: { userId, kind: "SUBMIT", verdict: "ACCEPTED" },
        select: { problemId: true },
        distinct: ["problemId"],
      }),
    ]);
    const solvedIds = new Set(solved.map((item) => item.problemId));
    res.json({
      problems: problems.map((problem) => ({ ...problem, solved: solvedIds.has(problem.id) })),
      page,
      pageSize,
      total,
    });
  }),
);

problemRouter.get(
  "/:slug",
  requireUser,
  asyncRoute(async (req, res) => {
    const problem = await prisma.problem.findUnique({
      where: { slug: req.params.slug },
      select: {
        ...publicProblem,
        statement: true,
        constraints: true,
        examples: true,
        starterCode: true,
        driverCode: true,
        functionName: true,
        version: true,
        timeLimitMs: true,
        memoryLimitKb: true,
      },
    });
    if (!problem) throw new HttpError(404, "Problem not found.", "NOT_FOUND");
    const supportedLanguages = SUBMISSION_LANGUAGES.filter((language) =>
      problemSupportsLanguage(problem.driverCode, language),
    );
    const languageParam = typeof req.query.language === "string" ? req.query.language : "cpp";
    const language = supportedLanguages.includes(languageParam as SubmissionLanguage)
      ? (languageParam as SubmissionLanguage)
      : "cpp";
    let starterCode = problem.starterCode;
    if (language !== "cpp") {
      const translated = starterFromCpp(problem.starterCode, language);
      if (translated) starterCode = translated;
    }
    const { driverCode: _driver, ...publicFields } = problem;
    const catalog = await prisma.problemCatalogEntry.findFirst({
      where: { problemId: problem.id, importStatus: "IMPORTED" },
      select: { source: true, externalSlug: true, canonicalUrl: true, licenseStatus: true, permissionNote: true, attribution: true },
    });
    res.json({
      problem: { ...publicFields, starterCode, supportedLanguages, catalog: catalog ?? null },
    });
  }),
);

problemRouter.post(
  "/:slug/evaluation-pool",
  requireUser,
  asyncRoute(async (req, res) => {
    const userId = (req as AuthedRequest).userId;
    await rateLimit(userId, "run", 20);
    const problem = await prisma.problem.findUnique({
      where: { slug: req.params.slug },
      include: { testCases: true, evaluationCases: true },
    });
    if (!problem) throw new HttpError(404, "Problem not found.", "NOT_FOUND");
    const generated = await ai.generateTestCases({
      slug: problem.slug,
      title: problem.title,
      statement: problem.statement,
      constraints: problem.constraints,
      examples: problem.examples,
    });
    const screened = screenCandidates(problem.slug, generated.cases, [
      ...problem.testCases.map((testCase) => testCase.input),
      ...problem.evaluationCases.map((testCase) => testCase.input),
    ]);
    const pending = [];
    for (const candidate of screened.accepted) {
      pending.push(
        await prisma.evaluationCase.create({
          data: {
            problemId: problem.id,
            input: candidate.input as Prisma.InputJsonValue,
            source: generated.model,
            status: "PENDING",
          },
        }),
      );
    }
    if (pending.length > 0) {
      await executionQueue.add(
        "validate-tests",
        { type: "validate-tests", caseIds: pending.map((item) => item.id) },
        { removeOnComplete: 1000, removeOnFail: 1000 },
      );
    }
    res.status(202).json({
      model: generated.model,
      pending: pending.length,
      rejected: screened.rejected.map((item) => ({ reason: item.reason })),
    });
  }),
);

problemRouter.get(
  "/:slug/evaluation-pool",
  requireUser,
  asyncRoute(async (req, res) => {
    const problem = await prisma.problem.findUnique({ where: { slug: req.params.slug }, select: { id: true } });
    if (!problem) throw new HttpError(404, "Problem not found.", "NOT_FOUND");
    const rows = await prisma.evaluationCase.findMany({
      where: { problemId: problem.id },
      select: { status: true, rejectionReason: true },
    });
    const counts = { PENDING: 0, ACCEPTED: 0, REJECTED: 0 };
    for (const row of rows) {
      if (row.status === "PENDING" || row.status === "ACCEPTED" || row.status === "REJECTED") counts[row.status] += 1;
    }
    res.json({
      counts,
      rejectionReasons: rows.filter((row) => row.status === "REJECTED" && row.rejectionReason).map((row) => row.rejectionReason),
    });
  }),
);
