export type LlmConfig = {
  apiKey: string;
  baseUrl: string;
  model: string;
  timeoutMs: number;
};

export class LlmConfigurationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "LlmConfigurationError";
  }
}

const DEFAULT_BASE = "https://api.openai.com/v1";
const DEFAULT_MODEL = "gpt-4o-mini";

export function readLlmConfigFromEnv(env: NodeJS.ProcessEnv = process.env): LlmConfig | null {
  const apiKey = env.LLM_API_KEY?.trim();
  if (!apiKey) return null;
  const baseUrl = (env.LLM_BASE_URL?.trim() || DEFAULT_BASE).replace(/\/$/, "");
  const model = env.LLM_MODEL?.trim() || DEFAULT_MODEL;
  const timeoutMs = Number(env.LLM_TIMEOUT_MS ?? 25_000);
  if (!Number.isFinite(timeoutMs) || timeoutMs < 1_000) {
    throw new LlmConfigurationError("LLM_TIMEOUT_MS must be a number of milliseconds >= 1000.");
  }
  return { apiKey, baseUrl, model, timeoutMs };
}

export function assertLlmConfigured(env: NodeJS.ProcessEnv = process.env): LlmConfig {
  const config = readLlmConfigFromEnv(env);
  if (!config) {
    throw new LlmConfigurationError("LLM_API_KEY is required when LLM features are enabled.");
  }
  if (!config.model) {
    throw new LlmConfigurationError("LLM_MODEL must be a non-empty model id.");
  }
  if (!config.baseUrl.startsWith("http")) {
    throw new LlmConfigurationError("LLM_BASE_URL must be an http(s) URL.");
  }
  return config;
}
