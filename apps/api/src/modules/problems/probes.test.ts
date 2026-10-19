import { builtinProbes } from "./probes.js";

describe("builtinProbes", () => {
  it("returns sort probes for sorting problems", () => {
    const probes = builtinProbes("quick-sort");
    expect(probes).toHaveLength(2);
    expect(probes[0]?.input).toEqual({ values: [] });
  });

  it("returns pair-target edge cases", () => {
    const probes = builtinProbes("pair-target");
    expect(probes.some((probe) => probe.rationale.includes("duplicate"))).toBe(true);
  });

  it("returns an empty list for unknown slugs", () => {
    expect(builtinProbes("not-a-problem")).toEqual([]);
  });
});
