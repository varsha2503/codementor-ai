import { Router } from "express";
import type { Prisma } from "@prisma/client";
import { HINT_TITLES, acceptClassification, analyzeRequestSchema, hintRequestSchema, hintResultSchema, nextHintLevel } from "@codementor/shared";
import { prisma } from "../../config/prisma.js";
import { asyncRoute, HttpError } from "../../middleware/http.js";
import { requireUser, type AuthedRequest } from "../../middleware/auth.js";
import { latestCoverageFromResponses, loadCoverage } from "./interview-coverage.js";
import { asksForHelp, clientTurnIdOf, hintCeiling, openingInterview } from "./interview.js";
import { rateLimit, redis } from "../../queue/redis.js";
import { createAIService } from "./service.js";
import { presentHint, presentInterviewTurn } from "./present.js";

export const aiRouter = Router();
const ai = createAIService();

type LadderStep = { level: number; text: string; whenCodeHas?: string; alternateText?: string };

function ladderOf(value: Prisma.JsonValue): LadderStep[] {
  if (!Array.isArray(value)) return [];
  return value.filter((step): step is LadderStep => {
    if (!step || typeof step !== "object" || Array.isArray(step)) return false;
    const record = step as Record<string, unknown>;
    return typeof record.level === "number" && typeof record.text === "string";
  });
}

function authoredText(step: LadderStep, code: string): string {
  if (!step.whenCodeHas || !step.alternateText) return step.text;
  try {
    return new RegExp(step.whenCodeHas).test(code) ? step.alternateText : step.text;
  } catch {
    return step.text;
  }
}

function executionSummary(attempt: {
  verdict: string;
  testsPassed: number;
  testsTotal: number;
  message: string | null;
  compileOutput: string | null;
  testSummary: Prisma.JsonValue | null;
} | null) {
  if (!attempt) return null;
  const cases = Array.isArray(attempt.testSummary) ? attempt.testSummary : [];
  const sampleFailures = cases.flatMap((item) => {
    if (!item || typeof item !== "object" || Array.isArray(item)) return [];
    const record = item as Record<string, unknown>;
    if (record.visibility !== "SAMPLE" || record.status === "PASSED") return [];
    return [
      {
        input: record.input,
        expected: record.expected,
        actual: record.actual,
        message: typeof record.message === "string" ? record.message : null,
      },
    ];
  });
  const summary = {
    verdict: attempt.verdict,
    testsPassed: attempt.testsPassed,
    testsTotal: attempt.testsTotal,
    message: attempt.message,
    sampleFailures,
    compileExcerpt: attempt.compileOutput?.slice(0, 1500) ?? null,
  };
  return summary;
}

aiRouter.get(
  "/hints",
  requireUser,
  asyncRoute(async (req, res) => {
    const problemId = typeof req.query.problemId === "string" ? req.query.problemId : "";
    const problem = await prisma.problem.findFirst({
      where: { OR: [{ id: problemId }, { slug: problemId }] },
      select: { id: true },
    });
    if (!problem) throw new HttpError(404, "Problem not found.", "NOT_FOUND");
    const hints = await prisma.aIInteraction.findMany({
      where: { userId: (req as AuthedRequest).userId, problemId: problem.id, type: "HINT" },
      orderBy: { createdAt: "asc" },
    });
    res.json({ hints: hints.flatMap((hint) => {
      const presented = presentHint(hint.response);
      return presented ? [presented] : [];
    }) });
  }),
);

aiRouter.post(
  "/hints",
  requireUser,
  asyncRoute(async (req, res) => {
    const userId = (req as AuthedRequest).userId;
    const body = hintRequestSchema.parse(req.body);
    const problem = await prisma.problem.findFirst({
      where: { OR: [{ id: body.problemId }, { slug: body.problemId }] },
    });
    if (!problem) throw new HttpError(404, "Problem not found.", "NOT_FOUND");
    const prior = await prisma.aIInteraction.findMany({
      where: { userId, problemId: problem.id, type: "HINT" },
      orderBy: { createdAt: "asc" },
    });
    const levels = prior.map((item) => item.level ?? 0);
    if (levels.includes(4)) {
      const last = presentHint(prior[prior.length - 1]?.response);
      res.json(last ?? { hintLevel: 4, hint: "The explanation was already given.", concept: "Solution explanation", nextStep: "Implement it yourself and submit." });
      return;
    }
    const level = nextHintLevel(levels);
    const step = ladderOf(problem.hintLadder).find((item) => item.level === level);
    if (!step) throw new HttpError(404, "This problem has no hint at that level.", "NO_HINT");
    const attempt = body.attemptId
      ? await prisma.attempt.findFirst({ where: { id: body.attemptId, userId, problemId: problem.id } })
      : null;
    const generated = await ai.generateHint({
      title: problem.title,
      statement: problem.statement,
      topics: problem.topics,
      code: body.code,
      level,
      authoredHint: authoredText(step, body.code),
      priorHints: prior.map((item) => {
        const response = item.response as { hint?: string };
        return response.hint ?? "";
      }),
      execution: executionSummary(attempt),
    });
    await prisma.aIInteraction.create({
      data: {
        userId,
        problemId: problem.id,
        attemptId: attempt?.id,
        type: "HINT",
        level,
        response: generated.result as Prisma.InputJsonValue,
        model: generated.model,
      },
    });
    res.json(generated.result);
  }),
);

aiRouter.post(
  "/analyze",
  requireUser,
  asyncRoute(async (req, res) => {
    const userId = (req as AuthedRequest).userId;
    const body = analyzeRequestSchema.parse(req.body);
    const problem = await prisma.problem.findFirst({
      where: { OR: [{ id: body.problemId }, { slug: body.problemId }] },
    });
    if (!problem) throw new HttpError(404, "Problem not found.", "NOT_FOUND");
    const attempt = body.attemptId
      ? await prisma.attempt.findFirst({
          where: { id: body.attemptId, userId, problemId: problem.id },
          include: { issues: true },
        })
      : await prisma.attempt.findFirst({
          where: { userId, problemId: problem.id },
          include: { issues: true },
          orderBy: { createdAt: "desc" },
        });
    const context = {
      title: problem.title,
      statement: problem.statement,
      topics: problem.topics,
      constraints: problem.constraints,
      expectedTime: problem.expectedTime,
      expectedSpace: problem.expectedSpace,
      code: body.code,
      execution: executionSummary(attempt),
      previousCategories: (attempt?.issues ?? []).map((issue) => issue.category),
    };
    const [analysis, classified] = await Promise.all([ai.analyzeSolution(context), ai.classifyMistakes(context)]);
    await prisma.aIInteraction.create({
      data: {
        userId,
        problemId: problem.id,
        attemptId: attempt?.id,
        type: "ANALYSIS",
        response: analysis.result as Prisma.InputJsonValue,
        model: analysis.model,
      },
    });
    const accepted = acceptClassification(classified.result);
    const seen = new Set((attempt?.issues ?? []).map((issue) => issue.category));
    const fresh = accepted && !seen.has(accepted.category) ? [accepted] : [];
    if (attempt && fresh.length > 0) {
      await prisma.attemptIssue.createMany({
        data: fresh.map((issue) => ({ attemptId: attempt.id, ...issue })),
      });
      await prisma.aIInteraction.create({
        data: {
          userId,
          problemId: problem.id,
          attemptId: attempt.id,
          type: "CLASSIFICATION",
          response: classified.result as Prisma.InputJsonValue,
          model: classified.model,
        },
      });
    }
    res.json({ analysis: analysis.result, model: analysis.model, classification: classified.result, issues: [...(attempt?.issues ?? []), ...fresh] });
  }),
);

async function interviewRows(userId: string, problemId: string) {
  return prisma.aIInteraction.findMany({
    where: { userId, problemId, type: "INTERVIEW" },
    orderBy: { createdAt: "asc" },
    select: { response: true },
  });
}

async function interviewTurns(userId: string, problemId: string) {
  const rows = await interviewRows(userId, problemId);
  return rows.flatMap((row) => {
    const turn = presentInterviewTurn(row.response);
    return turn ? [turn] : [];
  });
}

function interviewCoverageForTurns(rows: { response: unknown }[], turns: { role: string; message: string }[]) {
  const stored = latestCoverageFromResponses(rows.map((row) => row.response));
  return loadCoverage(stored, turns);
}

async function ensureOpening(userId: string, problemId: string, title: string) {
  const existing = await prisma.aIInteraction.findFirst({
    where: { userId, problemId, type: "INTERVIEW" },
    select: { id: true },
  });
  if (existing) return;
  const opening = openingInterview(title);
  await prisma.aIInteraction.create({
    data: {
      userId,
      problemId,
      type: "INTERVIEW",
      response: { role: "interviewer", ...opening },
      model: "heuristic",
    },
  });
}

aiRouter.get(
  "/interview",
  requireUser,
  asyncRoute(async (req, res) => {
    const problemId = typeof req.query.problemId === "string" ? req.query.problemId : "";
    const problem = await prisma.problem.findFirst({
      where: { OR: [{ id: problemId }, { slug: problemId }] },
      select: { id: true, title: true },
    });
    if (!problem) throw new HttpError(404, "Problem not found.", "NOT_FOUND");
    const userId = (req as AuthedRequest).userId;
    await ensureOpening(userId, problem.id, problem.title);
    const turns = await interviewTurns(userId, problem.id);
    const stage = [...turns].reverse().find((turn) => turn.role === "interviewer")?.stage ?? "introduction";
    res.json({ turns, stage });
  }),
);

aiRouter.post(
  "/interview",
  requireUser,
  asyncRoute(async (req, res) => {
    const userId = (req as AuthedRequest).userId;
    const problemId = typeof req.body?.problemId === "string" ? req.body.problemId : "";
    const reset = req.body?.reset === true;
    const message = typeof req.body?.message === "string" ? req.body.message.trim() : "";
    const code = typeof req.body?.code === "string" ? req.body.code : "";
    const attemptId = typeof req.body?.attemptId === "string" ? req.body.attemptId : undefined;
    const clientTurnId = clientTurnIdOf({ clientTurnId: req.body?.clientTurnId });
    if (req.body?.clientTurnId !== undefined && !clientTurnId) throw new HttpError(400, "That turn id is not valid.", "INVALID_TURN");
    if (code.length > 65536) throw new HttpError(400, "Code exceeds the 64KB limit.", "CODE_TOO_LARGE");
    if (!reset && message.length === 0) throw new HttpError(400, "Say something to the interviewer.", "EMPTY_MESSAGE");
    if (message.length > 2000) throw new HttpError(400, "That reply is too long.", "MESSAGE_TOO_LONG");
    await rateLimit(userId, "interview", 20);
    const problem = await prisma.problem.findFirst({
      where: { OR: [{ id: problemId }, { slug: problemId }] },
    });
    if (!problem) throw new HttpError(404, "Problem not found.", "NOT_FOUND");
    if (reset) {
      await prisma.aIInteraction.deleteMany({ where: { userId, problemId: problem.id, type: "INTERVIEW" } });
      await ensureOpening(userId, problem.id, problem.title);
      const turns = await interviewTurns(userId, problem.id);
      res.json({ turns, stage: "introduction", revealedHint: null });
      return;
    }
    if (clientTurnId && (await savedClientTurn(userId, problem.id, clientTurnId))) {
      const turns = await interviewTurns(userId, problem.id);
      const stage = [...turns].reverse().find((turn) => turn.role === "interviewer")?.stage ?? "introduction";
      res.json({ turns, stage, revealedHint: null });
      return;
    }
    const lockKey = clientTurnId ? `interview-turn:${userId}:${clientTurnId}` : "";
    const claimed = lockKey ? await redis.set(lockKey, "1", "EX", 30, "NX") : "OK";
    if (claimed !== "OK") throw new HttpError(409, "That spoken turn is already being saved.", "DUPLICATE_TURN");
    let saved = false;
    try {
    await ensureOpening(userId, problem.id, problem.title);
    const rows = await interviewRows(userId, problem.id);
    const turns = rows.flatMap((row) => {
      const turn = presentInterviewTurn(row.response);
      return turn ? [turn] : [];
    });
    const stage = [...turns].reverse().find((turn) => turn.role === "interviewer")?.stage ?? "introduction";
    const transcript = turns.map((turn) => ({ role: turn.role, message: turn.message }));
    const coverage = interviewCoverageForTurns(rows, transcript);
    const attempt = attemptId
      ? await prisma.attempt.findFirst({ where: { id: attemptId, userId, problemId: problem.id } })
      : await prisma.attempt.findFirst({ where: { userId, problemId: problem.id }, orderBy: { createdAt: "desc" } });
    const priorHints = await prisma.aIInteraction.findMany({
      where: { userId, problemId: problem.id, type: "HINT" },
      orderBy: { createdAt: "asc" },
    });
    const levels = priorHints.map((item) => item.level ?? 0);
    let nextHint: string | null = null;
    let revealedHint: ReturnType<typeof hintResultSchema.parse> | null = null;
    const exhausted = levels.includes(4);
    if (asksForHelp(message) && !exhausted) {
      const level = nextHintLevel(levels);
      const step = ladderOf(problem.hintLadder).find((item) => item.level === level);
      if (step && level <= hintCeiling(message)) {
        nextHint = authoredText(step, code);
        revealedHint = hintResultSchema.parse({
          hintLevel: level,
          hint: nextHint,
          concept: HINT_TITLES[level] ?? "Hint",
          nextStep: level >= 4 ? "Implement it yourself and submit." : "Apply this in the editor before you ask for more.",
        });
      }
    }
    const generated = await ai.conductInterview({
      title: problem.title,
      statement: problem.statement,
      stage,
      message,
      code,
      execution: executionSummary(attempt),
      nextHint,
      hintsExhausted: exhausted,
      transcript,
      coverage,
    });
    await prisma.$transaction(async (tx) => {
      await tx.aIInteraction.create({
        data: {
          userId,
          problemId: problem.id,
          attemptId: attempt?.id,
          type: "INTERVIEW",
          response: { role: "candidate", stage, message, clientTurnId, code },
          model: "candidate",
        },
      });
      if (revealedHint) {
        await tx.aIInteraction.create({
          data: {
            userId,
            problemId: problem.id,
            attemptId: attempt?.id,
            type: "HINT",
            level: revealedHint.hintLevel,
            response: revealedHint,
            model: generated.model,
          },
        });
      }
      await tx.aIInteraction.create({
        data: {
          userId,
          problemId: problem.id,
          attemptId: attempt?.id,
          type: "INTERVIEW",
          response: { role: "interviewer", ...generated.result, coverage: generated.coverage },
          model: generated.model,
        },
      });
    });
    saved = true;
    const nextTurns = await interviewTurns(userId, problem.id);
    res.json({ turns: nextTurns, stage: generated.result.stage, revealedHint });
    } finally {
      if (lockKey && !saved) await redis.del(lockKey);
    }
  }),
);

async function savedClientTurn(userId: string, problemId: string, clientTurnId: string) {
  const rows = await prisma.aIInteraction.findMany({
    where: { userId, problemId, type: "INTERVIEW" },
    select: { response: true },
  });
  return rows.some((row) => clientTurnIdOf(row.response) === clientTurnId);
}
