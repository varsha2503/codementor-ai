import { LlmRateLimitError, mapProviderError } from "./errors.js";

describe("mapProviderError", () => {
  it("maps rate limit messages to LlmRateLimitError", () => {
    const mapped = mapProviderError(new Error("429 Too Many Requests"));
    expect(mapped).toBeInstanceOf(LlmRateLimitError);
    expect(mapped.retryable).toBe(true);
  });
});
