export const RUNNER_LIMITS = {
  pids: "64",
  memory: "768m",
  memorySwap: "768m",
  cpus: "1",
  tmpfsMb: "256m",
  varTmpMb: "64m",
  homeMb: "16m",
  compileOutputMax: 12_000,
  stdoutMax: 16_000,
  stderrMax: 4_000,
  user: "1000:1000",
};

export function timeBudget(timeLimitMs: number, cases: number) {
  const timeLimitSec = Math.max(1, Math.ceil(timeLimitMs / 1000));
  const cpuSeconds = 20 + cases * (timeLimitSec + 1);
  const wallMs = (25 + cases * (timeLimitSec + 3)) * 1000;
  return { timeLimitSec, cpuSeconds, wallMs };
}
