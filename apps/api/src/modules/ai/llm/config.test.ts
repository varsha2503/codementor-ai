import { assertLlmConfigured, LlmConfigurationError, readLlmConfigFromEnv } from "./config.js";

describe("llm config", () => {
  const env = { ...process.env };

  afterEach(() => {
    process.env = { ...env };
  });

  it("returns null when LLM_API_KEY is missing", () => {
    delete process.env.LLM_API_KEY;
    expect(readLlmConfigFromEnv()).toBeNull();
  });

  it("reads model and base URL from the environment", () => {
    process.env.LLM_API_KEY = "test-key";
    process.env.LLM_BASE_URL = "https://api.groq.com/openai/v1";
    process.env.LLM_MODEL = "openai/gpt-oss-120b";
    const config = readLlmConfigFromEnv();
    expect(config?.model).toBe("openai/gpt-oss-120b");
    expect(config?.baseUrl).toBe("https://api.groq.com/openai/v1");
  });

  it("throws a clear error when assertLlmConfigured is called without a key", () => {
    delete process.env.LLM_API_KEY;
    expect(() => assertLlmConfigured()).toThrow(LlmConfigurationError);
    expect(() => assertLlmConfigured()).toThrow(/LLM_API_KEY/);
  });

  it("rejects invalid timeout values", () => {
    process.env.LLM_API_KEY = "x";
    process.env.LLM_TIMEOUT_MS = "0";
    expect(() => readLlmConfigFromEnv()).toThrow(LlmConfigurationError);
  });
});
