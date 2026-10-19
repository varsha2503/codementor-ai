import type { ProcessResult } from "./executor.js";
import { caseMessage, gradeOutput } from "./comparator.js";

function ok(actual: unknown): ProcessResult {
  return { status: "OK", actual, stdout: "", stderr: "", runtimeMs: 1, memoryKb: 1, message: null };
}

describe("gradeOutput", () => {
  it("passes exact matches", () => {
    expect(gradeOutput(ok([0, 1]), [0, 1], "EXACT", {})).toBe("PASSED");
  });

  it("returns the executor status when execution failed", () => {
    const failed: ProcessResult = {
      status: "RUNTIME_ERROR",
      stdout: "",
      stderr: "boom",
      runtimeMs: null,
      memoryKb: null,
      message: "boom",
    };
    expect(gradeOutput(failed, [0], "EXACT", {})).toBe("RUNTIME_ERROR");
  });

  it("grades topological orders", () => {
    const input = { count: 4, prerequisites: [[1, 0], [2, 0], [3, 1], [3, 2]] };
    expect(gradeOutput(ok([0, 1, 2, 3]), null, "TOPOLOGICAL", input)).toBe("PASSED");
    expect(gradeOutput(ok([3, 0, 1, 2]), null, "TOPOLOGICAL", input)).toBe("WRONG_ANSWER");
  });
});

describe("caseMessage", () => {
  it("hides details for hidden failures", () => {
    expect(caseMessage("WRONG_ANSWER", true)).toMatch(/hidden test failed/i);
    expect(caseMessage("WRONG_ANSWER", false)).toBe("Wrong answer.");
  });
});
