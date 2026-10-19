/**
 * Docker integration tests for C++ / Java / Python runners.
 * RUNNER_INTEGRATION=1 npm run test:runner:integration
 */
import assert from "node:assert/strict";
import { outputsMatch } from "@codementor/shared";
import type { SubmissionLanguage } from "@codementor/shared";
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
const TIME_LIMIT_MS = 2000;
const MEMORY_KB = 262_144;
const TLE_LIMIT_MS = 400;

let failed = 0;

function ok(name: string) {
  console.log("ok", name);
}

function fail(name: string, detail: unknown) {
  failed += 1;
  console.error("FAIL", name, detail);
}

async function main() {
  if (process.env.RUNNER_INTEGRATION !== "1") {
    console.log("skip: set RUNNER_INTEGRATION=1 to run Docker integration tests");
    process.exit(0);
  }
  if (!(await dockerAvailable())) {
    fail("docker", "daemon unavailable");
    process.exit(1);
  }
  if (!(await runnerImagePresent())) {
    fail("runner-image", `missing ${RUNNER_IMAGE}; run npm run runner:build`);
    process.exit(1);
  }

  const versions = await probeRunnerVersions();
  ok("versions probed");
  assert.match(versions.cpp ?? "", /g\+\+|Free Software/i);
  assert.match(versions.java ?? "", /javac/i);
  assert.match(versions.python ?? "", /Python 3/i);

  for (const language of LANGS) {
    const smoke = await runInSandbox({
      code: VALID_SOLUTION[language],
      driverCode: driverFor(language),
      language,
      inputs: COUNT_DIGITS_CASES.sample.map((c) => c.input),
      timeLimitMs: TIME_LIMIT_MS,
      memoryLimitKb: MEMORY_KB,
      image: RUNNER_IMAGE,
    });
    if (!smoke.compileOk || smoke.results.some((r, i) => r.status !== "OK" || !outputsMatch(r.actual, COUNT_DIGITS_CASES.sample[i]!.expected, "EXACT"))) {
      fail(`${language} smoke`, smoke);
    } else ok(`${language} smoke`);

    const compileFail = await runInSandbox({
      code: COMPILE_OR_SYNTAX_ERROR[language],
      driverCode: driverFor(language),
      language,
      inputs: [{ n: 1 }],
      timeLimitMs: TIME_LIMIT_MS,
      memoryLimitKb: MEMORY_KB,
      image: RUNNER_IMAGE,
    });
    if (compileFail.compileOk) fail(`${language} compile-fail`, "expected compileOk=false");
    else ok(`${language} compile-fail`);

    const wrong = await runInSandbox({
      code: WRONG_ANSWER[language],
      driverCode: driverFor(language),
      language,
      inputs: [{ n: 12345 }],
      timeLimitMs: TIME_LIMIT_MS,
      memoryLimitKb: MEMORY_KB,
      image: RUNNER_IMAGE,
    });
    if (!wrong.compileOk || outputsMatch(wrong.results[0]?.actual, 5, "EXACT")) fail(`${language} wrong-answer`, wrong.results[0]?.actual);
    else ok(`${language} wrong-answer`);

    const rte = await runInSandbox({
      code: RUNTIME_ERROR[language],
      driverCode: driverFor(language),
      language,
      inputs: [{ n: 1 }],
      timeLimitMs: TIME_LIMIT_MS,
      memoryLimitKb: MEMORY_KB,
      image: RUNNER_IMAGE,
    });
    if (rte.results[0]?.status !== "RUNTIME_ERROR") fail(`${language} runtime-error`, rte.results[0]?.status);
    else ok(`${language} runtime-error`);

    const tle = await runInSandbox({
      code: INFINITE_LOOP[language],
      driverCode: driverFor(language),
      language,
      inputs: [{ n: 1 }],
      timeLimitMs: TLE_LIMIT_MS,
      memoryLimitKb: MEMORY_KB,
      image: RUNNER_IMAGE,
    });
    const tleStatus = tle.results[0]?.status;
    if (tleStatus === "OK") fail(`${language} timeout`, "expected TLE/RTE, got OK");
    else if (!tleStatus && !tle.compileOk) fail(`${language} timeout`, tle.compileOutput.slice(0, 120));
    else ok(`${language} timeout (${tleStatus ?? "no-result"})`);
  }

  const inputs = COUNT_DIGITS_CASES.sample.map((c) => c.input);
  const cross: unknown[][] = [];
  for (const language of LANGS) {
    const report = await runInSandbox({
      code: VALID_SOLUTION[language],
      driverCode: driverFor(language),
      language,
      inputs,
      timeLimitMs: TIME_LIMIT_MS,
      memoryLimitKb: MEMORY_KB,
      image: RUNNER_IMAGE,
    });
    cross.push(report.results.map((r) => r.actual));
  }
  if (JSON.stringify(cross[0]) !== JSON.stringify(cross[1]) || JSON.stringify(cross[1]) !== JSON.stringify(cross[2])) {
    fail("cross-language", cross);
  } else ok("cross-language parity");

  const concurrent = await Promise.all(
    LANGS.map((language) =>
      runInSandbox({
        code: VALID_SOLUTION[language],
        driverCode: driverFor(language),
        language,
        inputs: [{ n: 7 }],
        timeLimitMs: TIME_LIMIT_MS,
        memoryLimitKb: MEMORY_KB,
        image: RUNNER_IMAGE,
      }),
    ),
  );
  if (concurrent.some((r) => !r.compileOk || !outputsMatch(r.results[0]?.actual, 1, "EXACT"))) fail("concurrent", concurrent);
  else ok("concurrent mixed languages");

  console.log(`\n${failed === 0 ? "All integration checks passed" : `${failed} failed`}`);
  process.exit(failed > 0 ? 1 : 0);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
