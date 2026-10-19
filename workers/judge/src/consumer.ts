import "dotenv/config";
import dotenv from "dotenv";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { Worker } from "bullmq";
import IORedis from "ioredis";
import { executeAttempt, sweepStuckJobs, validateGeneratedCases } from "./jobs.js";
import { prisma } from "./prisma.js";

const here = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(here, "../../../.env") });

const redisUrl = process.env.REDIS_URL ?? "redis://localhost:6379";
const connection = new IORedis(redisUrl, { maxRetriesPerRequest: null });

const worker = new Worker(
  "execution",
  async (job) => {
    if (job.data?.type === "validate-tests") {
      await validateGeneratedCases(job.data);
      return;
    }
    if (job.data?.type === "execute" && typeof job.data.attemptId === "string") {
      await executeAttempt(job.data);
    }
  },
  { connection, concurrency: 1 },
);

worker.on("failed", (job, error) => {
  console.error("[worker] job failed", job?.id, error.message);
});

const timer = setInterval(() => {
  sweepStuckJobs().catch((error) => console.error("[worker] sweep failed", error));
}, 60_000);

sweepStuckJobs().catch((error) => console.error("[worker] initial sweep failed", error));
console.log("[worker] listening for execution jobs");

async function shutdown() {
  clearInterval(timer);
  await worker.close();
  await connection.quit();
  await prisma.$disconnect();
  process.exit(0);
}

process.on("SIGINT", () => void shutdown());
process.on("SIGTERM", () => void shutdown());
