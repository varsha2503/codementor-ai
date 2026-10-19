import { inspectCatalogFile, linkLocalProblem } from "./inspect.js";

const locals = [
  { slug: "pair-target", title: "Two Sum" },
  { slug: "bracket-check", title: "Valid Parentheses" },
];

const permission = "Metadata and links only. Statements are not copied from the source.";

function file(entries: unknown[]) {
  return { source: "leetcode", permission, entries };
}

describe("catalog import inspection", () => {
  it("accepts a title, difficulty, tags, and canonical link", () => {
    const result = inspectCatalogFile(
      file([
        {
          externalSlug: "two-sum",
          title: "Two Sum",
          difficulty: "EASY",
          topics: ["arrays"],
          tags: ["hash-map"],
          canonicalUrl: "https://leetcode.com/problems/two-sum/",
          localSlug: "pair-target",
        },
      ]),
      locals,
    );
    expect(result.rejected).toEqual([]);
    expect(result.accepted[0]?.canonicalUrl).toBe("https://leetcode.com/problems/two-sum/description/");
    expect(result.accepted[0]?.localSlug).toBe("pair-target");
  });

  it("rejects a copied statement, examples, or solution", () => {
    const result = inspectCatalogFile(
      file([
        {
          externalSlug: "two-sum",
          title: "Two Sum",
          difficulty: "EASY",
          topics: [],
          tags: [],
          canonicalUrl: "https://leetcode.com/problems/two-sum/",
          statement: "Given an array of integers nums and an integer target.",
        },
      ]),
      locals,
    );
    expect(result.accepted).toEqual([]);
    expect(result.rejected[0]?.reason).toContain("statement");
  });

  it("accepts a /description/ link and stores the description page url", () => {
    const result = inspectCatalogFile(
      file([
        {
          externalSlug: "find-the-city-with-the-smallest-number-of-neighbors-at-a-threshold-distance",
          title: "Find the City With the Smallest Number of Neighbors at a Threshold Distance",
          difficulty: "MEDIUM",
          topics: ["graphs"],
          tags: ["shortest-path"],
          canonicalUrl:
            "https://leetcode.com/problems/find-the-city-with-the-smallest-number-of-neighbors-at-a-threshold-distance/description/",
        },
      ]),
      locals,
    );
    expect(result.rejected).toEqual([]);
    expect(result.accepted[0]?.externalSlug).toBe("find-the-city-with-the-smallest-number-of-neighbors-at-a-threshold-distance");
    expect(result.accepted[0]?.canonicalUrl).toContain("/description/");
  });

  it("rejects a url that is not the public problem link for that slug", () => {
    const result = inspectCatalogFile(
      file([
        {
          externalSlug: "two-sum",
          title: "Two Sum",
          difficulty: "EASY",
          topics: [],
          tags: [],
          canonicalUrl: "https://leetcode.com/problems/other-problem/",
        },
      ]),
      locals,
    );
    expect(result.accepted).toEqual([]);
    expect(result.rejected[0]?.reason).toContain("canonicalUrl");
  });

  it("rejects a duplicate slug in the same file", () => {
    const entry = {
      externalSlug: "two-sum",
      title: "Two Sum",
      difficulty: "EASY",
      topics: [],
      tags: [],
      canonicalUrl: "https://leetcode.com/problems/two-sum/",
    };
    const result = inspectCatalogFile(file([entry, entry]), locals);
    expect(result.accepted).toHaveLength(1);
    expect(result.rejected[0]?.reason).toContain("Duplicate");
  });

  it("accepts a GeeksforGeeks entry with per-entry source", () => {
    const result = inspectCatalogFile(
      {
        permission,
        entries: [
          {
            source: "geeksforgeeks",
            externalSlug: "reverse-digits-of-a-number",
            title: "Reverse a number",
            difficulty: "EASY",
            topics: ["math"],
            tags: ["striver-a2z"],
            canonicalUrl: "https://www.geeksforgeeks.org/problems/reverse-digits-of-a-number/1",
          },
        ],
      },
      locals,
    );
    expect(result.rejected).toEqual([]);
    expect(result.accepted[0]?.source).toBe("geeksforgeeks");
    expect(result.accepted[0]?.canonicalUrl).toBe("https://www.geeksforgeeks.org/problems/reverse-digits-of-a-number/1");
  });

  it("does not guess when two local problems share a title", () => {
    const draft = inspectCatalogFile(
      file([
        {
          externalSlug: "two-sum",
          title: "Two Sum",
          difficulty: "EASY",
          topics: [],
          tags: [],
          canonicalUrl: "https://leetcode.com/problems/two-sum/",
        },
      ]),
      [
        { slug: "pair-target", title: "Two Sum" },
        { slug: "pair-target-copy", title: "Two Sum" },
      ],
    ).accepted[0];
    expect(draft).toBeDefined();
    const link = linkLocalProblem(draft!, [
      { slug: "pair-target", title: "Two Sum" },
      { slug: "pair-target-copy", title: "Two Sum" },
    ], null);
    expect(link.problemSlug).toBeNull();
    expect(link.note).toContain("share this title");
  });
});
