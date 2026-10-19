/**
 * Generates docs/RUNNER-TEST-RESULTS.json when Docker + runner image are available.
 * Usage: RUNNER_INTEGRATION=1 npm run test:runner:report
 */
import { writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import type { SubmissionLanguage } from "@codementor/shared";
import { outputsMatch } from "@codementor/shared";
import { runInSandbox } from "../src/executor.js";
import {
  COMPILE_OR_SYNTAX_ERROR,
  COUNT_DIGITS_CASES,
  driverFor,
  INFINITE_LOOP,
  RUNTIME_ERROR,
  VALID_SOLUTION,
  WRONG_ANSWER,
} from "./fixtures/countDigits.js";
import {
  dockerAvailable,
  probeRunnerVersions,
  RUNNER_IMAGE,
  runnerImagePresent,
} from "./runnerEnv.js";

const LANGS: SubmissionLanguage[] = ["cpp", "python3", "java"];
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../..");
const outPath = path.join(root, "docs/RUNNER-TEST-RESULTS.json");

type Row = { name: string; language: SubmissionLanguage; ok: boolean; detail: string };

async function main() {
  const report: Record<string, unknown> = {
    generatedAt: new Date().toISOString(),
    runnerImage: RUNNER_IMAGE,
    dockerAvailable: await dockerAvailable(),
    runnerImagePresent: await runnerImagePresent(),
    versions: {},
    rows: [] as Row[],
    blocked: [] as string[],
  };

  if (!report.dockerAvailable) {
    report.blocked.push("Docker daemon not available");
  }
  if (!report.runnerImagePresent) {
    report.blocked.push(`Runner image missing: ${RUNNER_IMAGE}. Run npm run runner:build`);
  }
  if (report.blocked.length > 0) {
    writeFileSync(outPath, JSON.stringify(report, null, 2));
    console.error("Report written with blocked tests:", outPath);
    process.exit(2);
  }

  report.versions = await probeRunnerVersions();

  const push = (row: Row) => {
    (report.rows as Row[]).push(row);
    console.log(row.ok ? "ok" : "FAIL", row.language, row.name, row.detail);
  };

  for (const language of LANGS) {
    const smoke = await runInSandbox({
      code: VALID_SOLUTION[language],
      driverCode: driverFor(language),
      language,
      inputs: COUNT_DIGITS_CASES.sample.map((c) => c.input),
      timeLimitMs: 2000,
      memoryLimitKb: 262_144,
      image: RUNNER_IMAGE,
    });
    push({
      name: "smoke_valid",
      language,
      ok: smoke.compileOk && smoke.results.every((r, i) => r.status === "OK" && outputsMatch(r.actual, COUNT_DIGITS_CASES.sample[i]!.expected, "EXACT")),
      detail: smoke.compileOk ? `cases=${smoke.results.length}` : smoke.compileOutput.slice(0, 200),
    });

    const compileFail = await runInSandbox({
      code: COMPILE_OR_SYNTAX_ERROR[language],
      driverCode: driverFor(language),
      language,
      inputs: [{ n: 1 }],
      timeLimitMs: 2000,
      memoryLimitKb: 262_144,
      image: RUNNER_IMAGE,
    });
    push({
      name: "compile_or_syntax_error",
      language,
      ok: !compileFail.compileOk,
      detail: compileFail.compileOutput.slice(0, 120),
    });

    const wrong = await runInSandbox({
      code: WRONG_ANSWER[language],
      driverCode: driverFor(language),
      language,
      inputs: [{ n: 10 }],
      timeLimitMs: 2000,
      memoryLimitKb: 262_144,
      image: RUNNER_IMAGE,
    });
    push({
      name: "wrong_answer_output",
      language,
      ok: wrong.compileOk === true && !outputsMatch(wrong.results[0]?.actual, 2, "EXACT"),
      detail: JSON.stringify(wrong.results[0]?.actual),
    });

    const rte = await runInSandbox({
      code: RUNTIME_ERROR[language],
      driverCode: driverFor(language),
      language,
      inputs: [{ n: 1 }],
      timeLimitMs: 2000,
      memoryLimitKb: 262_144,
      image: RUNNER_IMAGE,
    });
    push({
      name: "runtime_error",
      language,
      ok: rte.results[0]?.status === "RUNTIME_ERROR",
      detail: rte.results[0]?.status ?? "missing",
    });

    const tle = await runInSandbox({
      code: INFINITE_LOOP[language],
      driverCode: driverFor(language),
      language,
      inputs: [{ n: 1 }],
      timeLimitMs: 400,
      memoryLimitKb: 262_144,
      image: RUNNER_IMAGE,
    });
    push({
      name: "timeout",
      language,
      ok: ["TIME_LIMIT_EXCEEDED", "RUNTIME_ERROR"].includes(tle.results[0]?.status ?? ""),
      detail: tle.results[0]?.status ?? "missing",
    });
  }

  writeFileSync(outPath, JSON.stringify(report, null, 2));
  const failed = (report.rows as Row[]).filter((r) => !r.ok).length;
  console.log(`Wrote ${outPath} (${failed} failed row(s))`);
  process.exit(failed > 0 ? 1 : 0);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
