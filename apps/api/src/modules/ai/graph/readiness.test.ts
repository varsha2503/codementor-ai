import { langGraphReadinessProbe } from "./readiness.js";

describe("langgraph readiness", () => {
  it("compiles and runs a minimal probe graph", async () => {
    await expect(langGraphReadinessProbe()).resolves.toBe(true);
  });
});
