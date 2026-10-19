import { HeuristicService, LangChainService, createAIService } from "./service.js";

const service = new HeuristicService();

const emptyExecution = {
  verdict: null,
  testsPassed: null,
  testsTotal: null,
  message: null,
  sampleFailures: [],
  compileExcerpt: null,
};

describe("HeuristicService", () => {
  it("returns authored hints at the requested level", async () => {
    const out = await service.generateHint({
      title: "Two Sum",
      statement: "Find two numbers.",
      topics: ["arrays"],
      code: "class Solution {};",
      level: 2,
      authoredHint: "Track complements.",
      priorHints: [],
      execution: null,
    });
    expect(out.result.hintLevel).toBe(2);
    expect(out.result.hint).toBe("Track complements.");
  });

  it("adds execution-aware analysis notes", async () => {
    const out = await service.analyzeSolution({
      title: "Two Sum",
      statement: "Find two numbers.",
      code: "class Solution { public: int f() { return 1; } };",
      topics: ["arrays"],
      expectedTime: "O(n)",
      expectedSpace: "O(1)",
      execution: {
        ...emptyExecution,
        verdict: "WRONG_ANSWER",
        sampleFailures: [{ input: {}, expected: 1, actual: 0 }],
      },
    });
    expect(out.result.correctnessConcerns.some((line) => /wrong answer/i.test(line))).toBe(true);
  });

  it("classifies time limits when execution reports TLE", async () => {
    const out = await service.classifyMistakes({
      title: "Two Sum",
      statement: "Find two numbers.",
      code: "for(;;){}",
      topics: ["arrays"],
      expectedTime: "O(n)",
      expectedSpace: "O(1)",
      constraints: [],
      previousCategories: [],
      execution: { ...emptyExecution, verdict: "TIME_LIMIT_EXCEEDED" },
    });
    expect(out.result.category).toBe("TIME_COMPLEXITY_TOO_HIGH");
  });

  it("falls back to builtin probes for test generation", async () => {
    const out = await service.generateTestCases({ slug: "pair-target", title: "Two Sum", statement: "", constraints: [], examples: [] });
    expect(out.cases.length).toBeGreaterThan(0);
    expect(out.cases[0]?.input).toHaveProperty("nums");
  });

  it("conducts interviews without calling an LLM", async () => {
    const { emptyCoverage } = await import("./interview-coverage.js");
    const out = await service.conductInterview({
      title: "Two Sum",
      statement: "Find two numbers.",
      stage: "introduction",
      message: "Ready",
      code: "",
      coverage: emptyCoverage(),
      transcript: [],
      execution: null,
      nextHint: null,
      hintsExhausted: false,
    });
    expect(out.result.stage).toBe("understanding");
  });
});

describe("createAIService", () => {
  const key = process.env.LLM_API_KEY;

  afterEach(() => {
    if (key === undefined) delete process.env.LLM_API_KEY;
    else process.env.LLM_API_KEY = key;
  });

  it("returns heuristic service when no API key is configured", () => {
    delete process.env.LLM_API_KEY;
    expect(createAIService()).toBeInstanceOf(HeuristicService);
  });

  it("returns LangChain service when an API key is configured", () => {
    process.env.LLM_API_KEY = "test-key";
    process.env.LLM_MODEL = "test-model";
    expect(createAIService()).toBeInstanceOf(LangChainService);
  });
});
