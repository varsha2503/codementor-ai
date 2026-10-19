import { Router } from "express";
import type { Prisma } from "@prisma/client";
import { submissionSchema, validateSource, problemSupportsLanguage } from "@codementor/shared";
import { prisma } from "../../config/prisma.js";
import { asyncRoute, HttpError } from "../../middleware/http.js";
import { requireUser, type AuthedRequest } from "../../middleware/auth.js";
import { rateLimit } from "../../queue/redis.js";
import { enqueueExecution } from "../execution/enqueue.js";
import { presentAnalysis } from "../ai/present.js";

export const submissionRouter = Router();

async function createSubmission(req: AuthedRequest, kind: "RUN" | "SUBMIT") {
  const body = submissionSchema.parse(req.body);
  const policy = validateSource(body.code, body.language);
  if (policy) throw new HttpError(400, policy, "CODE_POLICY");
  if (kind === "SUBMIT" && body.customInput) {
    throw new HttpError(400, "Custom input belongs on run, not submit.", "CUSTOM_INPUT");
  }
  if (body.customInput && JSON.stringify(body.customInput).length > 8000) {
    throw new HttpError(400, "Custom input exceeds 8KB.", "INPUT_TOO_LARGE");
  }
  await rateLimit(req.userId, kind === "RUN" ? "run" : "submit", kind === "RUN" ? 20 : 10);
  const problem = await prisma.problem.findFirst({
    where: { OR: [{ id: body.problemId }, { slug: body.problemId }] },
  });
  if (!problem) throw new HttpError(404, "Problem not found.", "NOT_FOUND");
  if (!problemSupportsLanguage(problem.driverCode, body.language)) {
    throw new HttpError(
      400,
      "This problem is not available in that language yet. Try C++ or pick another problem.",
      "LANGUAGE_UNSUPPORTED",
    );
  }
  const attempt = await prisma.attempt.create({
    data: {
      userId: req.userId,
      problemId: problem.id,
      problemVersion: problem.version,
      code: body.code,
      language: body.language,
      kind,
      verdict: "QUEUED",
    },
  });
  await prisma.executionJob.create({ data: { attemptId: attempt.id, status: "QUEUED" } });
  await enqueueExecution(attempt.id, body.customInput);
  return attempt.id;
}

submissionRouter.post(
  "/run",
  requireUser,
  asyncRoute(async (req, res) => {
    const submissionId = await createSubmission(req as AuthedRequest, "RUN");
    res.status(202).json({ submissionId, status: "QUEUED" });
  }),
);

submissionRouter.post(
  "/",
  requireUser,
  asyncRoute(async (req, res) => {
    const submissionId = await createSubmission(req as AuthedRequest, "SUBMIT");
    res.status(202).json({ submissionId, status: "QUEUED" });
  }),
);

submissionRouter.get(
  "/:id",
  requireUser,
  asyncRoute(async (req, res) => {
    const attempt = await prisma.attempt.findFirst({
      where: { id: req.params.id, userId: (req as AuthedRequest).userId },
      include: {
        problem: {
          select: { id: true, slug: true, title: true, difficulty: true, topics: true, expectedTime: true, expectedSpace: true },
        },
        issues: true,
        interactions: { where: { type: "ANALYSIS" }, orderBy: { createdAt: "desc" }, take: 1 },
      },
    });
    if (!attempt) throw new HttpError(404, "Submission not found.", "NOT_FOUND");
    res.json({
      submission: {
        id: attempt.id,
        problem: attempt.problem,
        kind: attempt.kind,
        language: attempt.language,
        code: attempt.code,
        verdict: attempt.verdict,
        runtimeMs: attempt.runtimeMs,
        memoryKb: attempt.memoryKb,
        testsPassed: attempt.testsPassed,
        testsTotal: attempt.testsTotal,
        message: attempt.message,
        compileOutput: attempt.compileOutput,
        cases: (attempt.testSummary ?? []) as Prisma.JsonArray,
        createdAt: attempt.createdAt,
        finishedAt: attempt.finishedAt,
        issues: attempt.issues,
        analysis: presentAnalysis(attempt.interactions[0]?.response ?? null),
      },
    });
  }),
);
