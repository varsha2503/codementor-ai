import { execFile } from "node:child_process";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

export const RUNNER_INTEGRATION = process.env.RUNNER_INTEGRATION === "1";
export const RUNNER_IMAGE = process.env.RUNNER_IMAGE || "codementor-runner:1";

export async function dockerAvailable(): Promise<boolean> {
  try {
    await execFileAsync("docker", ["info"], { timeout: 10_000 });
    return true;
  } catch {
    return false;
  }
}

export async function runnerImagePresent(image = RUNNER_IMAGE): Promise<boolean> {
  try {
    const { stdout } = await execFileAsync("docker", ["image", "inspect", image], { timeout: 10_000 });
    return stdout.length > 0;
  } catch {
    return false;
  }
}

export type RunnerToolVersions = {
  cpp?: string;
  java?: string;
  python?: string;
};

export async function probeRunnerVersions(image = RUNNER_IMAGE): Promise<RunnerToolVersions> {
  const run = async (cmd: string[]) => {
    try {
      const { stdout, stderr } = await execFileAsync(
        "docker",
        ["run", "--rm", "--entrypoint", "", image, ...cmd],
        { timeout: 60_000, maxBuffer: 1_000_000 },
      );
      return `${stdout}${stderr}`.trim();
    } catch (error) {
      const err = error as { stdout?: string; stderr?: string };
      return `${err.stdout ?? ""}${err.stderr ?? ""}`.trim();
    }
  };
  const out: RunnerToolVersions = {};
  try {
    out.cpp = await run(["g++", "--version"]);
  } catch {
    out.cpp = undefined;
  }
  try {
    out.java = await run(["javac", "-version"]);
  } catch {
    out.java = undefined;
  }
  try {
    out.python = await run(["python3", "--version"]);
  } catch {
    out.python = undefined;
  }
  return out;
}
