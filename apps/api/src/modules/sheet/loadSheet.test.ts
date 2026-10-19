import { localSlugFromTitle, normSheetTitle, resolveLocalSlug } from "./loadSheet.js";

const index = {
  byTitle: { "reverse a number": "reverse-number", "two sum": "pair-target" },
  problems: [
    { slug: "reverse-number", norm: "reverse a number", title: "Reverse a number" },
    { slug: "pair-target", norm: "two sum", title: "Two Sum" },
  ],
};

describe("sheet local slug resolution", () => {
  it("normalizes titles for lookup", () => {
    expect(normSheetTitle("Reverse a number (LC)")).toBe("reverse a number");
  });

  it("matches manifest titles", () => {
    expect(localSlugFromTitle("Reverse a number", index)).toBe("reverse-number");
  });

  it("maps Basic Maths sheet titles via overrides", () => {
    const overrides = {
      byNormTitle: { "count all digits of a number": "count-digits" },
      byTufSlug: { "check-if-the-number-if-armstrong": "armstrong-number" },
    };
    expect(localSlugFromTitle("Count all Digits of a Number", index, overrides)).toBe("count-digits");
    expect(
      resolveLocalSlug(
        {
          tufId: 366,
          slug: "check-if-the-number-if-armstrong",
          title: "Check if the Number is Armstrong",
          section: "Beginner Problems",
          sectionPath: ["Beginner Problems", "Basic Maths"],
        },
        new Map(),
        index,
        overrides,
      ),
    ).toBe("armstrong-number");
  });

  it("prefers title match then leetcode slug from catalog", () => {
    const localByExternal = new Map([["reverse-integer", "reverse-number"]]);
    const slug = resolveLocalSlug(
      {
        tufId: 1,
        slug: "reverse-a-number",
        title: "Unknown title",
        section: "Math",
        sectionPath: ["Math"],
        leetcodeUrl: "https://leetcode.com/problems/reverse-integer/",
      },
      localByExternal,
      index,
    );
    expect(slug).toBe("reverse-number");
  });
});
