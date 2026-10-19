import { AIMessage } from "@langchain/core/messages";
import { FakeListChatModel } from "@langchain/core/utils/testing";
import { answerEvaluationSchema } from "@codementor/shared";
import { HeuristicService, LangChainService } from "./service.js";
import { emptyCoverage } from "./interview-coverage.js";
import { setChatModelForTests, resetChatModelCache } from "./llm/chat-model.js";
import { evaluateAnswerHeuristicOnly } from "./evaluation/evaluate-answer.js";

const baseInterview = {
  title: "Armstrong Number",
  statement: "Return true if the number is an Armstrong number.",
  stage: "introduction" as const,
  message: "Ready",
  code: "",
  execution: null,
  nextHint: null,
  hintsExhausted: false,
  transcript: [{ role: "interviewer" as const, message: "Say when you are ready." }],
  coverage: emptyCoverage(),
};

describe("LangChainService", () => {
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

  it("sends conversation history and returns a parsed interviewer reply", async () => {
    const captured: unknown[] = [];
    const model = new FakeListChatModel({
      responses: [
        JSON.stringify({
          classification: "CORRECT",
          correctPoints: [],
          issues: [],
          missingConcepts: [],
          explanation: "",
          nextAction: "ADVANCE",
        }),
        JSON.stringify({
          stage: "understanding",
          message: "What should the function return on input 153?",
          followUp: "One example is enough.",
        }),
      ],
    });
    const originalInvoke = model.invoke.bind(model);
    model.invoke = async (input, options) => {
      captured.push(input);
      return originalInvoke(input, options);
    };
    setChatModelForTests(model);

    const service = new LangChainService(new HeuristicService());
    const out = await service.conductInterview(baseInterview);
    expect(out.result.stage).toBe("understanding");
    expect(out.model).toBe("test-model");
    const batch = captured.find((item) => Array.isArray(item) && item.some((m) => m instanceof AIMessage));
    expect(batch).toBeTruthy();
  });

  it("falls back to heuristic replies when the provider fails", async () => {
    setChatModelForTests(
      new FakeListChatModel({
        responses: [],
      }),
    );
    const service = new LangChainService(new HeuristicService());
    const out = await service.conductInterview(baseInterview);
    expect(out.model).toBe("heuristic");
    expect(out.result.stage).toBe("understanding");
  });

  it("does not use execution verdict in verbal evaluation heuristics", () => {
    const withRun = evaluateAnswerHeuristicOnly({
      stage: "approach",
      message: "Loop with mod 10 and compare the powered sum.",
      coverage: emptyCoverage(),
    });
    expect(withRun.classification).not.toBe("INCORRECT");
    expect(answerEvaluationSchema.safeParse(withRun).success).toBe(true);
  });
});
