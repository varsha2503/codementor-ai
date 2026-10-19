import { prisma } from "../../config/prisma.js";
import { HttpError } from "../../middleware/http.js";
import { executionQueue } from "../../queue/redis.js";

export async function enqueueExecution(attemptId: string, customInput?: Record<string, unknown>): Promise<void> {
  try {
    const queued = await executionQueue.add(
      "execute",
      { type: "execute", attemptId, customInput },
      { jobId: attemptId, removeOnComplete: 1000, removeOnFail: 1000 },
    );
    await prisma.executionJob.update({
      where: { attemptId },
      data: { queueJobId: String(queued.id) },
    });
  } catch (error) {
    console.error("[api] queue", error);
    await prisma.attempt.update({
      where: { id: attemptId },
      data: { verdict: "INTERNAL_ERROR", message: "The execution queue is unavailable.", finishedAt: new Date() },
    });
    throw new HttpError(503, "The execution queue is unavailable.", "QUEUE_UNAVAILABLE");
  }
}
