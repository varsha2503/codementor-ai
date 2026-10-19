import { stableStringify } from "./types/compare.js";

describe("stableStringify", () => {
  it("sorts object keys for stable comparison", () => {
    expect(stableStringify({ b: 1, a: 2 })).toBe('{"a":2,"b":1}');
  });

  it("stringifies nested structures deterministically", () => {
    expect(stableStringify([{ z: 1 }, { a: 2 }])).toBe('[{"z":1},{"a":2}]');
  });
});
