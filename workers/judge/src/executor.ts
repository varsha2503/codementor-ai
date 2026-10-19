import { execFile } from "node:child_process";
import { randomBytes } from "node:crypto";
import { mkdir, readFile, rm, writeFile, chmod } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { promisify } from "node:util";
import { fileURLToPath } from "node:url";
import { buildScript, mainSource } from "./compiler.js";
import { buildJavaScript, javaMainSource } from "./languages/java.js";
import { buildPythonScript, pythonMainSource } from "./languages/python.js";
import { RUNNER_LIMITS, timeBudget } from "./limits.js";
import type { SubmissionLanguage } from "@codementor/shared";

const execFileAsync = promisify(execFile);
const supportCppPath = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../cpp/support.hpp");
const supportPyPath = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../python/support.py");
const supportJavaPath = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../java/Support.java");

export type ProcessStatus = "OK" | "TIME_LIMIT_EXCEEDED" | "MEMORY_LIMIT_EXCEEDED" | "RUNTIME_ERROR";

export type ProcessResult = {
  status: ProcessStatus;
  actual?: unknown;
  stdout: string;
  stderr: string;
  runtimeMs: number | null;
  memoryKb: number | null;
  message: string | null;
};

export type DockerRunResult = {
  compileOk: boolean;
  compileOutput: string;
  results: ProcessResult[];
  failureCode?: string;
  message?: string;
};

function truncate(value: string, max: number): string {
  if (value.length <= max) return value;
  return `${value.slice(0, max)}\n… output truncated`;
}

async function readMaybe(file: string, max: number): Promise<string> {
  try {
    return truncate(await readFile(file, "utf8"), max);
  } catch {
    return "";
  }
}

async function docker(args: string[], timeoutMs: number): Promise<{ stdout: string; stderr: string; code: number }> {
  try {
    const { stdout, stderr } = await execFileAsync("docker", args, {
      timeout: timeoutMs,
      maxBuffer: 2_000_000,
    });
    return { stdout: String(stdout ?? ""), stderr: String(stderr ?? ""), code: 0 };
  } catch (error) {
    const err = error as { stdout?: string; stderr?: string; code?: number; killed?: boolean; message?: string };
    return {
      stdout: String(err.stdout ?? ""),
      stderr: String(err.stderr ?? err.message ?? ""),
      code: typeof err.code === "number" ? err.code : 1,
    };
  }
}

function parseActual(stdout: string): { ok: true; value: unknown } | { ok: false } {
  const trimmed = stdout.trim();
  if (!trimmed) return { ok: false };
  try {
    return { ok: true, value: JSON.parse(trimmed) as unknown };
  } catch {
    return { ok: false };
  }
}

export async function runInSandbox(options: {
  code: string;
  driverCode: string;
  language?: SubmissionLanguage;
  inputs: unknown[];
  timeLimitMs: number;
  memoryLimitKb: number;
  image: string;
}): Promise<DockerRunResult> {
  const language = options.language ?? "cpp";
  const id = `cm${randomBytes(6).toString("hex")}`;
  const root = path.join(os.tmpdir(), "codementor-jobs", id);
  const srcDir = path.join(root, "src");
  const outDir = path.join(root, "out");
  const { timeLimitSec, cpuSeconds, wallMs } = timeBudget(options.timeLimitMs, options.inputs.length);

  await mkdir(path.join(srcDir, "tests"), { recursive: true });
  await mkdir(outDir, { recursive: true });
  await chmod(outDir, 0o777);
  let runScript = buildScript(timeLimitSec, cpuSeconds);
  if (language === "cpp") {
    await writeFile(path.join(srcDir, "support.hpp"), await readFile(supportCppPath));
    await writeFile(path.join(srcDir, "solution.cpp"), options.code.endsWith("\n") ? options.code : `${options.code}\n`);
    await writeFile(path.join(srcDir, "main.cpp"), mainSource(options.driverCode));
  } else if (language === "python3") {
    await writeFile(path.join(srcDir, "support.py"), await readFile(supportPyPath));
    await writeFile(path.join(srcDir, "solution.py"), options.code.endsWith("\n") ? options.code : `${options.code}\n`);
    await writeFile(path.join(srcDir, "main.py"), pythonMainSource(options.driverCode));
    runScript = buildPythonScript(timeLimitSec, cpuSeconds);
  } else if (language === "java") {
    await writeFile(path.join(srcDir, "Support.java"), await readFile(supportJavaPath));
    await writeFile(path.join(srcDir, "Solution.java"), options.code.endsWith("\n") ? options.code : `${options.code}\n`);
    await writeFile(path.join(srcDir, "Main.java"), javaMainSource(options.driverCode));
    runScript = buildJavaScript(timeLimitSec, cpuSeconds);
  }
  await writeFile(path.join(srcDir, "run.sh"), runScript);
  for (let index = 0; index < options.inputs.length; index += 1) {
    await writeFile(path.join(srcDir, "tests", `${index}.in`), JSON.stringify(options.inputs[index]));
  }

  try {
    const run = await docker(
      [
        "run",
        "--name",
        id,
        "--pull",
        "never",
        "--network",
        "none",
        "--read-only",
        "--cap-drop",
        "ALL",
        "--security-opt",
        "no-new-privileges:true",
        "--pids-limit",
        RUNNER_LIMITS.pids,
        "--memory",
        RUNNER_LIMITS.memory,
        "--memory-swap",
        RUNNER_LIMITS.memorySwap,
        "--cpus",
        RUNNER_LIMITS.cpus,
        "--user",
        RUNNER_LIMITS.user,
        "--tmpfs",
        `/tmp:rw,exec,nosuid,nodev,size=${RUNNER_LIMITS.tmpfsMb}`,
        "--tmpfs",
        `/var/tmp:rw,nosuid,nodev,size=${RUNNER_LIMITS.varTmpMb}`,
        "--tmpfs",
        `/home/runner:rw,nosuid,nodev,size=${RUNNER_LIMITS.homeMb}`,
        "-e",
        "TMPDIR=/tmp",
        "-v",
        `${srcDir}:/src:ro`,
        "-v",
        `${outDir}:/out:rw`,
        options.image,
        "/bin/sh",
        "/src/run.sh",
      ],
      wallMs,
    );

    const inspect = await docker(["inspect", "--format", "{{.State.OOMKilled}}", id], 10_000);
    const oom = inspect.stdout.trim() === "true";
    const missingImage = /No such image|pull access denied|Unable to find image/i.test(`${run.stderr}\n${run.stdout}`);
    const dockerMissing = /docker: not found|Cannot connect to the Docker daemon|ENOENT/i.test(`${run.stderr}\n${run.stdout}`);

    if (dockerMissing) {
      return {
        compileOk: false,
        compileOutput: "",
        results: [],
        failureCode: "DOCKER_UNAVAILABLE",
        message: "The isolated runner could not reach Docker.",
      };
    }
    if (missingImage) {
      return {
        compileOk: false,
        compileOutput: "",
        results: [],
        failureCode: "RUNNER_IMAGE_MISSING",
        message: "The runner image is not built yet. Run npm run runner:build.",
      };
    }

    const compileCode = (await readMaybe(path.join(outDir, "compile.code"), 20)).trim();
    const compileOutput = truncate(
      (await readMaybe(path.join(outDir, "compile.out"), RUNNER_LIMITS.compileOutputMax)).replaceAll(srcDir, "solution"),
      RUNNER_LIMITS.compileOutputMax,
    );

    if (!compileCode) {
      return {
        compileOk: false,
        compileOutput,
        results: [],
        failureCode: oom ? "RUNNER_OOM" : "RUNNER_FAILED",
        message: oom
          ? "The compiler ran out of memory before the tests started."
          : "The runner stopped before it could compile the solution.",
      };
    }
    if (compileCode !== "0") {
      return { compileOk: false, compileOutput, results: [] };
    }

    const results: ProcessResult[] = [];
    for (let index = 0; index < options.inputs.length; index += 1) {
      const codeText = (await readMaybe(path.join(outDir, `${index}.code`), 20)).trim();
      const stdout = await readMaybe(path.join(outDir, `${index}.out`), RUNNER_LIMITS.stdoutMax);
      const stderr = await readMaybe(path.join(outDir, `${index}.err`), RUNNER_LIMITS.stderrMax);
      const meta = (await readMaybe(path.join(outDir, `${index}.meta`), 200)).trim().split(/\s+/);
      const runtimeMs = meta[0] ? Math.round(Number.parseFloat(meta[0]) * 1000) : null;
      const memoryKb = meta[1] ? Number.parseInt(meta[1], 10) : null;
      const safeRuntime = Number.isFinite(runtimeMs) ? runtimeMs : null;
      const safeMemory = Number.isFinite(memoryKb) ? memoryKb : null;

      if (!codeText) {
        results.push({
          status: oom ? "MEMORY_LIMIT_EXCEEDED" : "RUNTIME_ERROR",
          stdout,
          stderr,
          runtimeMs: safeRuntime,
          memoryKb: safeMemory,
          message: oom ? "The process was killed because it exceeded the container memory quota." : "The test did not finish.",
        });
        continue;
      }

      const exitCode = Number.parseInt(codeText, 10);
      if (exitCode === 124 || exitCode === 137) {
        results.push({
          status: oom ? "MEMORY_LIMIT_EXCEEDED" : "TIME_LIMIT_EXCEEDED",
          stdout: "",
          stderr,
          runtimeMs: safeRuntime,
          memoryKb: safeMemory,
          message: oom ? "Memory limit exceeded." : "Time limit exceeded.",
        });
        continue;
      }
      if (safeMemory !== null && safeMemory > options.memoryLimitKb) {
        results.push({
          status: "MEMORY_LIMIT_EXCEEDED",
          stdout: "",
          stderr,
          runtimeMs: safeRuntime,
          memoryKb: safeMemory,
          message: "Memory limit exceeded.",
        });
        continue;
      }
      if (exitCode !== 0) {
        results.push({
          status: "RUNTIME_ERROR",
          stdout: truncate(stdout, 500),
          stderr,
          runtimeMs: safeRuntime,
          memoryKb: safeMemory,
          message: stderr.trim() || `Process exited with code ${exitCode}.`,
        });
        continue;
      }
      const parsed = parseActual(stdout);
      if (!parsed.ok) {
        results.push({
          status: "RUNTIME_ERROR",
          stdout: truncate(stdout, 500),
          stderr,
          runtimeMs: safeRuntime,
          memoryKb: safeMemory,
          message: stdout.includes("truncated")
            ? "Output exceeded the capture limit."
            : "The solution did not print a single JSON value.",
        });
        continue;
      }
      results.push({
        status: "OK",
        actual: parsed.value,
        stdout: truncate(stdout, 2_000),
        stderr,
        runtimeMs: safeRuntime,
        memoryKb: safeMemory,
        message: null,
      });
    }

    return { compileOk: true, compileOutput, results };
  } finally {
    await docker(["rm", "-f", id], 15_000);
    await rm(root, { recursive: true, force: true });
  }
}
