import { AIMessage, HumanMessage, SystemMessage, type BaseMessage } from "@langchain/core/messages";
import type { z } from "zod";
import { getChatModel } from "./chat-model.js";
import { LlmMalformedResponseError, mapProviderError } from "./errors.js";

export type SimpleChatMessage = { role: "system" | "user" | "assistant"; content: string };

export function toLangChainMessages(messages: SimpleChatMessage[]): BaseMessage[] {
  return messages.map((message) => {
    if (message.role === "system") return new SystemMessage(message.content);
    if (message.role === "assistant") return new AIMessage(message.content);
    return new HumanMessage(message.content);
  });
}

export function transcriptToMessages(transcript: { role: string; message: string }[]): BaseMessage[] {
  return transcript.flatMap((turn) => {
    const content = turn.message.trim();
    if (!content) return [];
    if (turn.role === "interviewer") return [new AIMessage(content)];
    if (turn.role === "candidate") return [new HumanMessage(content)];
    return [];
  });
}

function parseJsonContent(content: string): unknown {
  const trimmed = content.trim();
  if (!trimmed) throw new LlmMalformedResponseError("Empty model content.");
  try {
    return JSON.parse(trimmed) as unknown;
  } catch {
    const start = trimmed.indexOf("{");
    const end = trimmed.lastIndexOf("}");
    if (start >= 0 && end > start) {
      try {
        return JSON.parse(trimmed.slice(start, end + 1)) as unknown;
      } catch {
        throw new LlmMalformedResponseError();
      }
    }
    throw new LlmMalformedResponseError();
  }
}

export async function invokeJsonObject(
  messages: BaseMessage[],
  options?: { temperature?: number; jsonMode?: boolean },
): Promise<unknown> {
  const model = getChatModel();
  const temperature = options?.temperature ?? 0.2;
  const jsonMode = options?.jsonMode ?? true;
  try {
    const bound =
      jsonMode && "bind" in model && typeof model.bind === "function"
        ? model.bind({ response_format: { type: "json_object" } } as Record<string, unknown>)
        : model;
    const response = await bound.invoke(messages, { temperature } as Record<string, unknown>);
    const text =
      typeof response.content === "string"
        ? response.content
        : Array.isArray(response.content)
          ? response.content
              .map((part) => (typeof part === "string" ? part : "text" in part ? String(part.text) : ""))
              .join("")
          : String(response.content ?? "");
    return parseJsonContent(text);
  } catch (error) {
    if (error instanceof LlmMalformedResponseError) throw error;
    if (jsonMode) {
      try {
        return await invokeJsonObject(messages, { ...options, jsonMode: false });
      } catch (retryError) {
        throw mapProviderError(retryError);
      }
    }
    throw mapProviderError(error);
  }
}

export async function invokeJsonFromSimpleMessages(
  messages: SimpleChatMessage[],
  options?: { temperature?: number },
): Promise<unknown> {
  return invokeJsonObject(toLangChainMessages(messages), options);
}

export async function invokeStructuredOutput<T extends z.ZodTypeAny>(
  schema: T,
  messages: BaseMessage[],
  options?: { temperature?: number },
): Promise<z.infer<T>> {
  const model = getChatModel();
  const temperature = options?.temperature ?? 0.2;
  try {
    if ("withStructuredOutput" in model && typeof model.withStructuredOutput === "function") {
      const structured = model.withStructuredOutput(schema, { name: "structured_response", strict: false });
      return (await structured.invoke(messages, { temperature } as Record<string, unknown>)) as z.infer<T>;
    }
    const raw = await invokeJsonObject(messages, { temperature, jsonMode: true });
    return schema.parse(raw);
  } catch (error) {
    if (error instanceof LlmMalformedResponseError) throw error;
    try {
      const raw = await invokeJsonObject(messages, { temperature, jsonMode: false });
      return schema.parse(raw);
    } catch (fallbackError) {
      throw mapProviderError(fallbackError);
    }
  }
}
