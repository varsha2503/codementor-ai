import { ChatOpenAI } from "@langchain/openai";
import type { BaseChatModel } from "@langchain/core/language_models/chat_models";
import { assertLlmConfigured, type LlmConfig } from "./config.js";

let cached: { config: LlmConfig; model: ChatOpenAI } | null = null;
let testOverride: BaseChatModel | null = null;

export function resetChatModelCache(): void {
  cached = null;
}

/** Test hook: inject a mock chat model without touching env credentials. */
export function setChatModelForTests(model: BaseChatModel | null): void {
  testOverride = model;
}

export function getChatModel(): BaseChatModel {
  if (testOverride) return testOverride;
  const config = assertLlmConfigured();
  if (cached && configsEqual(cached.config, config)) return cached.model;
  const model = new ChatOpenAI({
    apiKey: config.apiKey,
    model: config.model,
    temperature: 0.2,
    timeout: config.timeoutMs,
    maxRetries: 1,
    configuration: { baseURL: config.baseUrl },
  });
  cached = { config, model };
  return model;
}

export function getConfiguredModelName(): string {
  return assertLlmConfigured().model;
}

function configsEqual(a: LlmConfig, b: LlmConfig): boolean {
  return a.apiKey === b.apiKey && a.baseUrl === b.baseUrl && a.model === b.model && a.timeoutMs === b.timeoutMs;
}
