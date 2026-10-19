import { RUNNER_LIMITS, timeBudget } from "./limits.js";

describe("timeBudget", () => {
  it("scales CPU and wall limits with case count", () => {
    const one = timeBudget(1000, 1);
    const many = timeBudget(1000, 5);
    expect(one.timeLimitSec).toBe(1);
    expect(many.cpuSeconds).toBeGreaterThan(one.cpuSeconds);
    expect(many.wallMs).toBeGreaterThan(one.wallMs);
  });

  it("never uses zero-second limits", () => {
    expect(timeBudget(0, 3).timeLimitSec).toBe(1);
  });
});

describe("RUNNER_LIMITS", () => {
  it("exports stable docker resource caps", () => {
    expect(RUNNER_LIMITS.memory).toBe("768m");
    expect(RUNNER_LIMITS.compileOutputMax).toBeGreaterThan(0);
  });
});
