import { Router } from "express";
import type { Prisma } from "@prisma/client";
import { prisma } from "../../config/prisma.js";
import { asyncRoute, HttpError } from "../../middleware/http.js";
import { requireUser, type AuthedRequest } from "../../middleware/auth.js";
import { rateLimit } from "../../queue/redis.js";
import { createAIService } from "../ai/service.js";
import { latestCoverageFromResponses, loadCoverage } from "../ai/interview-coverage.js";
import { clientTurnIdOf, openingInterview } from "../ai/interview.js";
import { presentInterviewTurn } from "../ai/present.js";

export const catalogRouter = Router();
const ai = createAIService();

const EXTERNAL_STATEMENT_NOTICE =
  "No authorized statement is stored for this problem. The candidate must read it on the source website. Ask them to restate what they read. Do not invent examples, constraints, inputs, or a solution.";

const DEFAULT_PAGE_SIZE = 20;
const MAX_PAGE_SIZE = 50;

function positiveInt(value: unknown, fallback: number, max: number): number {
  const parsed = typeof value === "string" ? Number(value) : Number.NaN;
  if (!Number.isInteger(parsed) || parsed < 1) return fallback;
  return Math.min(parsed, max);
}

const publicEntry = {
  id: true,
  source: true,
  externalSlug: true,
  externalId: true,
  title: true,
  difficulty: true,
  topics: true,
  tags: true,
  canonicalUrl: true,
  licenseStatus: true,
  permissionNote: true,
  attribution: true,
  importStatus: true,
  importedAt: true,
  problem: { select: { slug: true, title: true } },
} satisfies Prisma.ProblemCatalogEntrySelect;

catalogRouter.get(
  "/",
  requireUser,
  asyncRoute(async (req, res) => {
    const difficulty = typeof req.query.difficulty === "string" ? req.query.difficulty.toUpperCase() : undefined;
    const topic = typeof req.query.topic === "string" ? req.query.topic : undefined;
    const q = typeof req.query.q === "string" ? req.query.q.trim() : "";
    const page = positiveInt(req.query.page, 1, 10_000);
    const pageSize = positiveInt(req.query.limit, DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE);
    const where: Prisma.ProblemCatalogEntryWhereInput = {
      importStatus: "IMPORTED",
      ...(difficulty === "EASY" || difficulty === "MEDIUM" || difficulty === "HARD" ? { difficulty } : {}),
      ...(topic ? { topics: { has: topic } } : {}),
      ...(q
        ? {
            OR: [
              { title: { contains: q, mode: "insensitive" } },
              { externalSlug: { contains: q, mode: "insensitive" } },
            ],
          }
        : {}),
    };
    const [total, entries] = await Promise.all([
      prisma.problemCatalogEntry.count({ where }),
      prisma.problemCatalogEntry.findMany({
        where,
        select: publicEntry,
        orderBy: [{ difficulty: "asc" }, { title: "asc" }],
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
    ]);
    res.json({ entries, page, pageSize, total });
  }),
);

catalogRouter.get(
  "/:source/:slug",
  requireUser,
  asyncRoute(async (req, res) => {
    const entry = await loadEntry(req.params.source ?? "", req.params.slug ?? "");
    res.json({ entry: presentEntry(entry) });
  }),
);

catalogRouter.get(
  "/:source/:slug/interview",
  requireUser,
  asyncRoute(async (req, res) => {
    const entry = await loadEntry(req.params.source ?? "", req.params.slug ?? "");
    if (entry.licenseStatus !== "LINK_ONLY" || entry.problemId) {
      throw new HttpError(409, "This catalog entry has a local problem. Interview it from that problem.", "USE_LOCAL_PROBLEM");
    }
    const userId = (req as AuthedRequest).userId;
    await ensureCatalogOpening(userId, entry.id, entry.title);
    const turns = await catalogTurns(userId, entry.id);
    const stage = [...turns].reverse().find((turn) => turn.role === "interviewer")?.stage ?? "introduction";
    res.json({ turns, stage });
  }),
);

catalogRouter.post(
  "/:source/:slug/interview",
  requireUser,
  asyncRoute(async (req, res) => {
    const userId = (req as AuthedRequest).userId;
    const entry = await loadEntry(req.params.source ?? "", req.params.slug ?? "");
    if (entry.licenseStatus !== "LINK_ONLY" || entry.problemId) {
      throw new HttpError(409, "This catalog entry has a local problem. Interview it from that problem.", "USE_LOCAL_PROBLEM");
    }
    const reset = req.body?.reset === true;
    const message = typeof req.body?.message === "string" ? req.body.message.trim() : "";
    const code = typeof req.body?.code === "string" ? req.body.code : "";
    const clientTurnId = clientTurnIdOf({ clientTurnId: req.body?.clientTurnId });
    if (req.body?.clientTurnId !== undefined && !clientTurnId) throw new HttpError(400, "That turn id is not valid.", "INVALID_TURN");
    if (code.length > 65536) throw new HttpError(400, "Code exceeds the 64KB limit.", "CODE_TOO_LARGE");
    if (!reset && message.length === 0) throw new HttpError(400, "Say something to the interviewer.", "EMPTY_MESSAGE");
    if (message.length > 2000) throw new HttpError(400, "That reply is too long.", "MESSAGE_TOO_LONG");
    await rateLimit(userId, "interview", 20);
    if (reset) {
      await prisma.aIInteraction.deleteMany({ where: { userId, catalogEntryId: entry.id, type: "INTERVIEW" } });
      await ensureCatalogOpening(userId, entry.id, entry.title);
      const turns = await catalogTurns(userId, entry.id);
      res.json({ turns, stage: "introduction" });
      return;
    }
    if (clientTurnId && (await savedCatalogTurn(userId, entry.id, clientTurnId))) {
      const turns = await catalogTurns(userId, entry.id);
      const stage = [...turns].reverse().find((turn) => turn.role === "interviewer")?.stage ?? "introduction";
      res.json({ turns, stage });
      return;
    }
    await ensureCatalogOpening(userId, entry.id, entry.title);
    const rows = await catalogInterviewRows(userId, entry.id);
    const turns = rows.flatMap((row) => {
      const turn = presentInterviewTurn(row.response);
      return turn ? [turn] : [];
    });
    const stage = [...turns].reverse().find((turn) => turn.role === "interviewer")?.stage ?? "introduction";
    const transcript = turns.map((turn) => ({ role: turn.role, message: turn.message }));
    const coverage = loadCoverage(latestCoverageFromResponses(rows.map((row) => row.response)), transcript);
    const generated = await ai.conductInterview({
      title: entry.title,
      statement: EXTERNAL_STATEMENT_NOTICE,
      stage,
      message,
      code,
      execution: null,
      nextHint: null,
      hintsExhausted: false,
      transcript,
      coverage,
    });
    await prisma.$transaction([
      prisma.aIInteraction.create({
        data: {
          userId,
          catalogEntryId: entry.id,
          type: "INTERVIEW",
          response: { role: "candidate", stage, message, clientTurnId, code },
          model: "candidate",
        },
      }),
      prisma.aIInteraction.create({
        data: {
          userId,
          catalogEntryId: entry.id,
          type: "INTERVIEW",
          response: { role: "interviewer", ...generated.result, coverage: generated.coverage },
          model: generated.model,
        },
      }),
    ]);
    const nextTurns = await catalogTurns(userId, entry.id);
    res.json({ turns: nextTurns, stage: generated.result.stage });
  }),
);

async function loadEntry(source: string, slug: string) {
  const entry = await prisma.problemCatalogEntry.findUnique({
    where: { source_externalSlug: { source, externalSlug: slug } },
    include: { problem: { select: { slug: true, title: true } } },
  });
  if (!entry || entry.importStatus !== "IMPORTED") throw new HttpError(404, "Catalog entry not found.", "NOT_FOUND");
  return entry;
}

function presentEntry(entry: Awaited<ReturnType<typeof loadEntry>>) {
  return {
    id: entry.id,
    source: entry.source,
    externalSlug: entry.externalSlug,
    externalId: entry.externalId,
    title: entry.title,
    difficulty: entry.difficulty,
    topics: entry.topics,
    tags: entry.tags,
    canonicalUrl: entry.canonicalUrl,
    licenseStatus: entry.licenseStatus,
    permissionNote: entry.permissionNote,
    attribution: entry.attribution,
    importedAt: entry.importedAt,
    localProblem: entry.problem,
    statementStored: false,
  };
}

async function catalogInterviewRows(userId: string, catalogEntryId: string) {
  return prisma.aIInteraction.findMany({
    where: { userId, catalogEntryId, type: "INTERVIEW" },
    orderBy: { createdAt: "asc" },
    select: { response: true },
  });
}

async function catalogTurns(userId: string, catalogEntryId: string) {
  const rows = await catalogInterviewRows(userId, catalogEntryId);
  return rows.flatMap((row) => {
    const turn = presentInterviewTurn(row.response);
    return turn ? [turn] : [];
  });
}

async function ensureCatalogOpening(userId: string, catalogEntryId: string, title: string) {
  const existing = await prisma.aIInteraction.findFirst({
    where: { userId, catalogEntryId, type: "INTERVIEW" },
    select: { id: true },
  });
  if (existing) return;
  const opening = openingInterview(title);
  await prisma.aIInteraction.create({
    data: {
      userId,
      catalogEntryId,
      type: "INTERVIEW",
      response: { role: "interviewer", ...opening },
      model: "heuristic",
    },
  });
}

async function savedCatalogTurn(userId: string, catalogEntryId: string, clientTurnId: string) {
  const rows = await prisma.aIInteraction.findMany({
    where: { userId, catalogEntryId, type: "INTERVIEW" },
    select: { response: true },
  });
  return rows.some((row) => clientTurnIdOf(row.response) === clientTurnId);
}
