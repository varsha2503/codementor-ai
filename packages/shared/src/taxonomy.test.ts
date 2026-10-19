import { MISTAKE_CATEGORIES, isMistakeCategory } from "./constants/taxonomy.js";

describe("mistake taxonomy", () => {
  it("recognizes approved categories only", () => {
    expect(isMistakeCategory("OFF_BY_ONE")).toBe(true);
    expect(isMistakeCategory("UNKNOWN")).toBe(false);
    expect(MISTAKE_CATEGORIES).toContain("TIME_COMPLEXITY_TOO_HIGH");
  });
});
