import { Queue } from "bullmq";
import IORedis from "ioredis";

const redisUrl = process.env.REDIS_URL ?? "redis://localhost:6379";

export const redis = new IORedis(redisUrl, { maxRetriesPerRequest: null });

export const executionQueue = new Queue("execution", { connection: redis });

export async function rateLimit(userId: string, action: "run" | "submit" | "interview", limit: number): Promise<void> {
  const key = `rate:${action}:${userId}`;
  const count = await redis.incr(key);
  if (count === 1) await redis.expire(key, 60);
  if (count > limit) {
    throw Object.assign(new Error("Too many requests. Wait a minute and try again."), { status: 429, code: "RATE_LIMIT" });
  }
}
