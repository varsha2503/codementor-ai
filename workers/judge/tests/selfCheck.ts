import "dotenv/config";
import dotenv from "dotenv";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { isValidTopological, outputsMatch } from "@codementor/shared";
import { prisma } from "../src/prisma.js";
import { runInSandbox } from "../src/executor.js";

const here = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(here, "../../../.env") });

const only = process.argv[2];
const image = process.env.RUNNER_IMAGE || "codementor-runner:1";

const problems = await prisma.problem.findMany({
  where: only ? { slug: only } : undefined,
  include: { testCases: { orderBy: { ordinal: "asc" } } },
  orderBy: { slug: "asc" },
});

if (problems.length === 0) {
  console.error(only ? `No problem named ${only}` : "No problems seeded");
  process.exit(1);
}

let failed = 0;
for (const problem of problems) {
  const report = await runInSandbox({
    code: problem.referenceSolution,
    driverCode: problem.driverCode,
    inputs: problem.testCases.map((testCase) => testCase.input),
    timeLimitMs: problem.timeLimitMs,
    memoryLimitKb: problem.memoryLimitKb,
    image,
  });
  if (!report.compileOk || report.failureCode) {
    failed += 1;
    console.error(`FAIL ${problem.slug} compile`, report.failureCode ?? "", report.compileOutput);
    continue;
  }
  let problemFailed = false;
  report.results.forEach((result, index) => {
    const testCase = problem.testCases[index];
    if (!testCase) return;
    const passed =
      result.status === "OK" &&
      (problem.compareMode === "TOPOLOGICAL"
        ? isValidTopological(
            result.actual,
            Number((testCase.input as { count?: number }).count),
            ((testCase.input as { prerequisites?: number[][] }).prerequisites ?? []) as number[][],
          )
        : outputsMatch(result.actual, testCase.expectedOutput, problem.compareMode));
    if (!passed) {
      problemFailed = true;
      console.error(
        `FAIL ${problem.slug} case ${index} ${testCase.visibility}`,
        result.status,
        result.message ?? "",
        "actual",
        JSON.stringify(result.actual),
        "expected",
        JSON.stringify(testCase.expectedOutput),
      );
    }
  });
  if (problemFailed) failed += 1;
  else console.log(`ok ${problem.slug} (${problem.testCases.length} tests)`);
}

await prisma.$disconnect();
if (failed > 0) {
  console.error(`${failed} problem(s) failed the reference check`);
  process.exit(1);
}
console.log(`reference solutions passed for ${problems.length} problem(s)`);
