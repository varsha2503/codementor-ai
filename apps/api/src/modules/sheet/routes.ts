import { Router } from "express";
import { asyncRoute } from "../../middleware/http.js";
import { requireUser, type AuthedRequest } from "../../middleware/auth.js";
import { prisma } from "../../config/prisma.js";
import { buildSheetTracker } from "./loadSheet.js";

export const sheetRouter = Router();

sheetRouter.get(
  "/",
  requireUser,
  asyncRoute(async (req, res) => {
    const userId = (req as AuthedRequest).userId;
    const attempts = await prisma.attempt.findMany({
      where: { userId, kind: "SUBMIT" },
      select: { verdict: true, problem: { select: { slug: true } } },
    });
    const solvedSlugs = new Set<string>();
    const attemptedSlugs = new Set<string>();
    for (const attempt of attempts) {
      attemptedSlugs.add(attempt.problem.slug);
      if (attempt.verdict === "ACCEPTED") solvedSlugs.add(attempt.problem.slug);
    }
    res.json(buildSheetTracker(solvedSlugs, attemptedSlugs));
  }),
);
