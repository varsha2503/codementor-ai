import cors from "cors";
import express from "express";
import { prisma } from "./config/prisma.js";
import { errorHandler } from "./middleware/http.js";
import { analyticsRouter } from "./modules/analytics/routes.js";
import { aiRouter } from "./modules/ai/routes.js";
import { authRouter } from "./modules/auth/routes.js";
import { catalogRouter } from "./modules/catalog/routes.js";
import { problemRouter } from "./modules/problems/routes.js";
import { submissionRouter } from "./modules/submissions/routes.js";
import { sheetRouter } from "./modules/sheet/routes.js";
import { redis } from "./queue/redis.js";

export function createApp() {
  const app = express();
  app.use(cors({ origin: process.env.WEB_ORIGIN ?? "http://localhost:5173", credentials: true }));
  app.use(express.json({ limit: "200kb" }));

  app.get("/api/v1/health", async (_req, res) => {
    let db = false;
    let queue = false;
    try {
      await prisma.$queryRaw`SELECT 1`;
      db = true;
    } catch {
      db = false;
    }
    try {
      queue = (await redis.ping()) === "PONG";
    } catch {
      queue = false;
    }
    res.status(db && queue ? 200 : 503).json({ ok: db && queue, db, queue });
  });

  app.use("/api/v1/auth", authRouter);
  app.use("/api/v1/problems", problemRouter);
  app.use("/api/v1/catalog", catalogRouter);
  app.use("/api/v1/submissions", submissionRouter);
  app.use("/api/v1/ai", aiRouter);
  app.use("/api/v1/users", analyticsRouter);
  app.use("/api/v1/sheet", sheetRouter);
  app.use(errorHandler);
  return app;
}
