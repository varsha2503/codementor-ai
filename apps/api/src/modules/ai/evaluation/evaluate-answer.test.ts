import { AIMessage, HumanMessage, SystemMessage } from "@langchain/core/messages";
import { FakeListChatModel } from "@langchain/core/utils/testing";
import { emptyCoverage } from "../interview-coverage.js";
import { evaluateAnswer } from "./evaluate-answer.js";
import { resetChatModelCache, setChatModelForTests } from "../llm/chat-model.js";

describe("evaluateAnswer", () => {
  const env = { ...process.env };

  beforeEach(() => {
    process.env.LLM_API_KEY = "test-key";
    process.env.LLM_BASE_URL = "https://api.example.com/v1";
    process.env.LLM_MODEL = "test-model";
    resetChatModelCache();
  });

  afterEach(() => {
    setChatModelForTests(null);
    resetChatModelCache();
    process.env = { ...env };
  });

  it("parses JSON mode evaluation without throwing", async () => {
    setChatModelForTests(
      new FakeListChatModel({
        responses: [
          JSON.stringify({
            classification: "NEARLY_CORRECT",
            correctPoints: ["Uses hashing"],
            issues: [],
            missingConcepts: [],
            explanation: "",
            nextAction: "ADVANCE",
          }),
        ],
      }),
    );

    const result = await evaluateAnswer({
      title: "Two Sum",
      statement: "Find two numbers.",
      stage: "approach",
      message: "I would use a hash map for complements.",
      coverage: emptyCoverage(),
      transcript: [{ role: "interviewer", message: "What is your approach?" }],
      execution: null,
    });
    expect(result.classification).toBe("NEARLY_CORRECT");
    expect(result.nextAction).toBe("ADVANCE");
  });

  it("falls back to heuristic without answer evaluation fallback error log", async () => {
    const errorSpy = jest.spyOn(console, "error").mockImplementation(() => {});
    setChatModelForTests(new FakeListChatModel({ responses: ["not-json"] }));
    const result = await evaluateAnswer({
      title: "Two Sum",
      statement: "Find two numbers.",
      stage: "approach",
      message: "Hash map for complements while scanning once.",
      coverage: emptyCoverage(),
      transcript: [],
      execution: null,
    });
    expect(result.nextAction).toBeDefined();
    expect(errorSpy.mock.calls.some((c) => String(c[0]).includes("answer evaluation fallback"))).toBe(false);
    errorSpy.mockRestore();
  });
});
