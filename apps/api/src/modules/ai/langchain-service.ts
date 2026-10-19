import {
  analysisResultSchema,
  classificationResultSchema,
  hintResultSchema,
  testCandidateSchema,
} from "@codementor/shared";
import { builtinProbes } from "../problems/probes.js";
import {
  analysisPrompt,
  CLASSIFIER_PROMPT,
  classificationPrompt,
  COACH_PROMPT,
  EVALUATOR_PROMPT,
  hintPrompt,
  TEST_WRITER_PROMPT,
  testPrompt,
} from "./prompts.js";
import { runInterviewTurn } from "./graph/interview-graph.js";
import type { AIService, AnalysisInput, ClassificationInput, HintInput, InterviewInput, TestGenerationInput } from "./types.js";
import { assertLlmConfigured } from "./llm/config.js";
import { getConfiguredModelName } from "./llm/chat-model.js";
import { invokeJsonFromSimpleMessages } from "./llm/invoke.js";
export class LangChainService implements AIService {
  constructor(private fallback: AIService) {
    assertLlmConfigured();
  }

  private modelName() {
    return getConfiguredModelName();
  }

  async generateHint(input: HintInput) {
    try {
      const raw = await invokeJsonFromSimpleMessages([
        { role: "system", content: COACH_PROMPT },
        { role: "user", content: hintPrompt(input) },
      ]);
      const result = hintResultSchema.parse(raw);
      if (result.hintLevel !== input.level) return this.fallback.generateHint(input);
      return { result, model: this.modelName() };
    } catch (error) {
      console.error("[ai] hint fallback", error instanceof Error ? error.message : error);
      return this.fallback.generateHint(input);
    }
  }

  async analyzeSolution(input: AnalysisInput) {
    try {
      const raw = await invokeJsonFromSimpleMessages([
        { role: "system", content: EVALUATOR_PROMPT },
        { role: "user", content: analysisPrompt(input) },
      ]);
      return { result: analysisResultSchema.parse(raw), model: this.modelName() };
    } catch (error) {
      console.error("[ai] analysis fallback", error instanceof Error ? error.message : error);
      return this.fallback.analyzeSolution(input);
    }
  }

  async classifyMistakes(input: ClassificationInput) {
    try {
      const raw = await invokeJsonFromSimpleMessages([
        { role: "system", content: CLASSIFIER_PROMPT },
        { role: "user", content: classificationPrompt(input) },
      ]);
      return { result: classificationResultSchema.parse(raw), model: this.modelName() };
    } catch (error) {
      console.error("[ai] classification fallback", error instanceof Error ? error.message : error);
      return this.fallback.classifyMistakes(input);
    }
  }

  async conductInterview(input: InterviewInput) {
    return runInterviewTurn(input, { polish: true });
  }

  async generateTestCases(input: TestGenerationInput) {
    try {
      const raw = await invokeJsonFromSimpleMessages([
        { role: "system", content: TEST_WRITER_PROMPT },
        { role: "user", content: testPrompt(input) },
      ]);
      const parsed = testCandidateSchema.parse(raw);
      return { cases: [...builtinProbes(input.slug), ...parsed.cases], model: this.modelName() };
    } catch (error) {
      console.error("[ai] test generation fallback", error instanceof Error ? error.message : error);
      return this.fallback.generateTestCases(input);
    }
  }
}

/** @deprecated Use LangChainService — kept for tests and gradual renames. */
export const OpenAICompatibleService = LangChainService;
