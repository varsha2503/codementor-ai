export class LlmProviderError extends Error {
  readonly status?: number;
  readonly retryable: boolean;

  constructor(message: string, options?: { status?: number; retryable?: boolean; cause?: unknown }) {
    super(message, { cause: options?.cause });
    this.name = "LlmProviderError";
    this.status = options?.status;
    this.retryable = options?.retryable ?? false;
  }
}

export class LlmRateLimitError extends LlmProviderError {
  constructor(message = "The language model provider rate-limited this request.") {
    super(message, { status: 429, retryable: true });
    this.name = "LlmRateLimitError";
  }
}

export class LlmMalformedResponseError extends LlmProviderError {
  constructor(message = "The language model returned a response that could not be parsed.") {
    super(message, { retryable: false });
    this.name = "LlmMalformedResponseError";
  }
}

export function mapProviderError(error: unknown): LlmProviderError {
  if (error instanceof LlmProviderError) return error;
  const message = error instanceof Error ? error.message : String(error);
  const lower = message.toLowerCase();
  if (lower.includes("429") || lower.includes("rate limit")) {
    return new LlmRateLimitError();
  }
  if (lower.includes("timeout") || lower.includes("aborted")) {
    return new LlmProviderError("The language model request timed out.", { retryable: true, cause: error });
  }
  return new LlmProviderError("The language model request failed.", { cause: error });
}
