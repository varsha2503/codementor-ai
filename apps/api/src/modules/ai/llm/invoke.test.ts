import { AIMessage, HumanMessage, SystemMessage } from "@langchain/core/messages";
import { FakeListChatModel } from "@langchain/core/utils/testing";
import { invokeJsonObject, setChatModelForTests, transcriptToMessages } from "./index.js";
import { resetChatModelCache } from "./chat-model.js";
import { LlmMalformedResponseError } from "./errors.js";

describe("llm invoke", () => {
  afterEach(() => {
    setChatModelForTests(null);
    resetChatModelCache();
  });

  it("maps transcript roles to human and assistant messages", () => {
    const messages = transcriptToMessages([
      { role: "interviewer", message: "Hello" },
      { role: "candidate", message: "Ready" },
    ]);
    expect(messages).toHaveLength(2);
    expect(messages[0]).toBeInstanceOf(AIMessage);
    expect(messages[1]).toBeInstanceOf(HumanMessage);
  });

  it("parses JSON model content", async () => {
    setChatModelForTests(
      new FakeListChatModel({
        responses: ['{"stage":"understanding","message":"Tell me more.","followUp":"Go on."}'],
      }),
    );
    const raw = await invokeJsonObject([new SystemMessage("sys"), new HumanMessage("hi")]);
    expect(raw).toMatchObject({ stage: "understanding" });
  });

  it("throws on malformed JSON", async () => {
    setChatModelForTests(new FakeListChatModel({ responses: ["not json at all"] }));
    await expect(invokeJsonObject([new HumanMessage("hi")], { jsonMode: false })).rejects.toBeInstanceOf(
      LlmMalformedResponseError,
    );
  });
});
