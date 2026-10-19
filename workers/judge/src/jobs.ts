import {
  inferIssues,
  isTerminalVerdict,
  sanitizeCase,
  translateDriver,
  type StoredCase,
  type SubmissionLanguage,
} from "@codementor/shared";
import type { Prisma, Verdict } from "@prisma/client";
import { caseMessage, gradeOutput } from "./comparator.js";
import { prisma } from "./prisma.js";
import { runInSandbox } from "./executor.js";

type ExecutePayload = {
  type: "execute";
  attemptId: string;
  customInput?: Record<string, unknown>;
};

type ValidatePayload = {
  type: "validate-tests";
  caseIds: string[];
};

const VERDICT_RANK = ["MEMORY_LIMIT_EXCEEDED", "TIME_LIMIT_EXCEEDED", "RUNTIME_ERROR", "WRONG_ANSWER", "ACCEPTED"];

function imageName(): string {
  return process.env.RUNNER_IMAGE || "codementor-runner:1";
}

async function mark(attemptId: string, verdict: Verdict, data: Prisma.AttemptUpdateInput = {}) {
  const terminal = isTerminalVerdict(verdict);
  await prisma.attempt.update({
    where: { id: attemptId },
    data: {
      verdict,
      finishedAt: terminal ? new Date() : undefined,
      ...data,
    },
  });
  await prisma.executionJob.update({
    where: { attemptId },
    data: {
      status: verdict,
      startedAt: verdict === "COMPILING" ? new Date() : undefined,
      finishedAt: terminal ? new Date() : undefined,
      failureCode: typeof data.message === "string" ? undefined : undefined,
    },
  });
}

export async function executeAttempt(payload: ExecutePayload): Promise<void> {
  const attempt = await prisma.attempt.findUnique({
    where: { id: payload.attemptId },
    include: {
      problem: { include: { testCases: { orderBy: { ordinal: "asc" } } } },
    },
  });
  if (!attempt || isTerminalVerdict(attempt.verdict)) return;

  await mark(attempt.id, "COMPILING");
  const graded = attempt.problem.testCases.filter((testCase) =>
    attempt.kind === "RUN" ? testCase.visibility === "SAMPLE" : true,
  );
  const inputs: unknown[] = graded.map((testCase) => testCase.input);
  if (payload.customInput) inputs.push(payload.customInput);

  const language = (attempt.language as SubmissionLanguage) || "cpp";
  const driverCode = translateDriver(attempt.problem.driverCode, language);
  if (!driverCode) {
    await mark(attempt.id, "INTERNAL_ERROR", {
      message: `Language "${language}" is not supported for this problem yet.`,
    });
    return;
  }

  const report = await runInSandbox({
    code: attempt.code,
    driverCode,
    language,
    inputs,
    timeLimitMs: attempt.problem.timeLimitMs,
    memoryLimitKb: attempt.problem.memoryLimitKb,
    image: imageName(),
  });

  if (report.failureCode) {
    await mark(attempt.id, "INTERNAL_ERROR", { message: report.message, compileOutput: report.compileOutput || null });
    await prisma.executionJob.update({
      where: { attemptId: attempt.id },
      data: { failureCode: report.failureCode, status: "INTERNAL_ERROR", finishedAt: new Date() },
    });
    return;
  }

  if (!report.compileOk) {
    await mark(attempt.id, "COMPILE_ERROR", {
      message: "The solution did not compile.",
      compileOutput: report.compileOutput,
      testsPassed: 0,
      testsTotal: graded.length,
      testSummary: [],
    });
    return;
  }

  await mark(attempt.id, "EVALUATING", { compileOutput: report.compileOutput || null });

  const stored: StoredCase[] = [];
  const gradedStatuses: string[] = [];
  let peakRuntime: number | null = null;
  let peakMemory: number | null = null;
  const stderr: string[] = [];

  report.results.forEach((result, index) => {
    const custom = index >= graded.length;
    const testCase = graded[index];
    const visibility = custom ? "CUSTOM" : testCase?.visibility === "HIDDEN" ? "HIDDEN" : "SAMPLE";
    let status = result.status === "OK" ? "PASSED" : result.status;
    if (!custom && testCase) {
      status = gradeOutput(result, testCase.expectedOutput, attempt.problem.compareMode, testCase.input);
      gradedStatuses.push(status);
      if (result.runtimeMs !== null) peakRuntime = Math.max(peakRuntime ?? 0, result.runtimeMs);
      if (result.memoryKb !== null) peakMemory = Math.max(peakMemory ?? 0, result.memoryKb);
      if (result.stderr) stderr.push(result.stderr);
    }
    const hidden = visibility === "HIDDEN";
    const detail = hidden ? caseMessage(status, true) : (result.message ?? caseMessage(status, false));
    const topoNote =
      !custom && !hidden && attempt.problem.compareMode === "TOPOLOGICAL"
        ? " Any prerequisite-respecting order is accepted."
        : "";
    stored.push(
      sanitizeCase({
        visibility,
        status: custom && result.status === "OK" ? "EXECUTED" : status,
        input: custom ? payload.customInput : testCase?.input,
        expected: custom ? undefined : testCase?.expectedOutput,
        actual: result.actual,
        runtimeMs: result.runtimeMs,
        memoryKb: result.memoryKb,
        message: custom
          ? result.status === "OK"
            ? "Custom input executed. It is not graded."
            : result.message
          : `${detail}${topoNote}`,
      }),
    );
  });

  const verdict = (VERDICT_RANK.find((status) => gradedStatuses.includes(status)) ?? "ACCEPTED") as Verdict;
  const passed = gradedStatuses.filter((status) => status === "PASSED").length;
  const hiddenFailed = stored.some((item) => item.visibility === "HIDDEN" && item.status !== "PASSED");
  const message =
    verdict === "ACCEPTED"
      ? attempt.kind === "RUN"
        ? "Visible examples passed. Submit to run the hidden suite."
        : "Accepted."
      : verdict === "WRONG_ANSWER" && hiddenFailed
        ? "Wrong answer on a hidden test. The input and expected output stay hidden."
        : verdict === "TIME_LIMIT_EXCEEDED"
          ? "Time limit exceeded."
          : verdict === "MEMORY_LIMIT_EXCEEDED"
            ? "Memory limit exceeded."
            : verdict === "RUNTIME_ERROR"
              ? "Runtime error."
              : "Wrong answer.";

  await mark(attempt.id, verdict, {
    message,
    compileOutput: report.compileOutput || null,
    testsPassed: passed,
    testsTotal: graded.length,
    runtimeMs: peakRuntime,
    memoryKb: peakMemory,
    testSummary: stored as unknown as Prisma.InputJsonValue,
  });

  if (attempt.kind === "SUBMIT") {
    const issues = inferIssues({
      verdict,
      code: attempt.code,
      topics: attempt.problem.topics,
      stderr: stderr.join("\n"),
    });
    if (issues.length > 0) {
      await prisma.attemptIssue.createMany({
        data: issues.map((issue) => ({ attemptId: attempt.id, ...issue })),
      });
    }
  }
}

export async function validateGeneratedCases(payload: ValidatePayload): Promise<void> {
  const cases = await prisma.evaluationCase.findMany({
    where: { id: { in: payload.caseIds }, status: "PENDING" },
    include: { problem: true },
  });
  const groups = new Map<string, typeof cases>();
  for (const item of cases) {
    const list = groups.get(item.problemId) ?? [];
    list.push(item);
    groups.set(item.problemId, list);
  }

  for (const group of groups.values()) {
    const problem = group[0]?.problem;
    if (!problem) continue;
    const report = await runInSandbox({
      code: problem.referenceSolution,
      driverCode: problem.driverCode,
      inputs: group.map((item) => item.input),
      timeLimitMs: problem.timeLimitMs,
      memoryLimitKb: problem.memoryLimitKb,
      image: imageName(),
    });
    if (!report.compileOk || report.failureCode) {
      await prisma.evaluationCase.updateMany({
        where: { id: { in: group.map((item) => item.id) } },
        data: {
          status: "REJECTED",
          rejectionReason: report.message || "The trusted reference solution did not run.",
        },
      });
      continue;
    }
    for (let index = 0; index < group.length; index += 1) {
      const item = group[index];
      const result = report.results[index];
      if (!item || !result || result.status !== "OK") {
        if (item) {
          await prisma.evaluationCase.update({
            where: { id: item.id },
            data: { status: "REJECTED", rejectionReason: result?.message || "Reference run failed." },
          });
        }
        continue;
      }
      await prisma.evaluationCase.update({
        where: { id: item.id },
        data: { status: "ACCEPTED", expectedOutput: result.actual as Prisma.InputJsonValue, rejectionReason: null },
      });
    }
  }
}

export async function sweepStuckJobs(): Promise<void> {
  const runningCutoff = new Date(Date.now() - 3 * 60 * 1000);
  const queuedCutoff = new Date(Date.now() - 10 * 60 * 1000);
  const stuck = await prisma.executionJob.findMany({
    where: {
      finishedAt: null,
      OR: [
        { status: { in: ["COMPILING", "RUNNING", "EVALUATING"] }, startedAt: { lt: runningCutoff } },
        { status: "QUEUED", createdAt: { lt: queuedCutoff } },
      ],
    },
  });
  for (const job of stuck) {
    await prisma.executionJob.update({
      where: { id: job.id },
      data: { status: "INTERNAL_ERROR", failureCode: "WORKER_LOST", finishedAt: new Date() },
    });
    await prisma.attempt.updateMany({
      where: { id: job.attemptId, verdict: { in: ["QUEUED", "COMPILING", "RUNNING", "EVALUATING"] } },
      data: {
        verdict: "INTERNAL_ERROR",
        message: "The worker stopped before this submission finished. Submit it again.",
        finishedAt: new Date(),
      },
    });
  }
}
