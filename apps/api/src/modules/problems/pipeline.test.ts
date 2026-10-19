import { constraintError } from "./constraints.js";
import { screenCandidates } from "./testPipeline.js";

describe("generated test screening", () => {
  it("rejects cases outside the constraints and duplicates", () => {
    const screened = screenCandidates(
      "pair-target",
      [
        { input: { nums: [0, 0], target: 0 }, rationale: "zeros" },
        { input: { nums: [1], target: 1 }, rationale: "too short" },
        { input: { nums: [0, 0], target: 0 }, rationale: "again" },
      ],
      [{ nums: [2, 7], target: 9 }],
    );
    expect(screened.accepted).toHaveLength(1);
    expect(screened.rejected.map((item) => item.reason)).toEqual([
      "array length is outside the constraints",
      "Duplicate of an existing case.",
    ]);
  });

  it("rejects a catalog that is not strictly increasing", () => {
    expect(constraintError("catalog-spot", { values: [1, 1], target: 1 })).toMatch(/strictly increasing/);
    expect(constraintError("stair-routes", { steps: 46 })).toMatch(/1 to 45/);
  });
});
