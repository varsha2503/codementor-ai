import { HINT_TITLES, TOPIC_LABELS, analysisResultSchema, classificationResultSchema, hintResultSchema, testCandidateSchema } from "@codementor/shared";
import { builtinProbes } from "../problems/probes.js";
import { runInterviewTurn } from "./graph/interview-graph.js";
import type { AIService, AnalysisInput, ClassificationInput, HintInput, InterviewInput, TestGenerationInput } from "./types.js";
import { readLlmConfigFromEnv } from "./llm/config.js";
import { LangChainService } from "./langchain-service.js";

function complexity(code: string): { time: string; space: string; confidence: "low" | "medium"; notes: string[] } {
  const nestedLoop = /for\s*\([^)]*\)\s*\{[\s\S]{0,500}?for\s*\(/.test(code);
  const sorts = (code.match(/\bsort\s*\(/g) ?? []).length;
  const hashed = /unordered_map|unordered_set/.test(code);
  const recursion = (code.match(/\breturn\b[\s\S]{0,120}?\(/g) ?? []).length > 1;
  const memo = /memo|cache|\bdp\b|prev1|prev2/.test(code);
  const notes: string[] = [];
  if (nestedLoop) notes.push("There is a loop nested inside another loop.");
  if (sorts) notes.push("The code sorts, which is typically O(n log n) plus whatever follows.");
  if (hashed) notes.push("A hash table usually removes a repeated linear scan, with extra linear memory.");
  if (recursion && !memo) notes.push("Recursion without an obvious memo table can recompute the same state.");
  if (notes.length === 0) notes.push("The control flow is not obvious from a pattern scan.");

  let time = "unclear";
  let space = "unclear";
  let confidence: "low" | "medium" = "low";
  if (nestedLoop && !hashed && sorts === 0) {
    time = "O(n^2)";
    space = "O(1) extra, if the loops only use a handful of locals";
  } else if (sorts && !nestedLoop) {
    time = "O(n log n)";
    space = "O(1) or O(n) extra, depending on the sort and auxiliaries";
    confidence = "medium";
  } else if (hashed && !nestedLoop) {
    time = "O(n) average";
    space = "O(n) extra";
    confidence = "medium";
  } else if (memo) {
    time = "often polynomial in the state size";
    space = "proportional to the memo or table";
    confidence = "low";
  } else if (!nestedLoop && /for\s*\(/.test(code)) {
    time = "O(n) if each iteration is constant work";
    space = "depends on the containers allocated inside the loop";
  }
  return { time, space, confidence, notes };
}

export class HeuristicService implements AIService {
  async generateHint(input: HintInput) {
    const concept = HINT_TITLES[input.level] ?? "Hint";
    return {
      model: "heuristic",
      result: hintResultSchema.parse({
        hintLevel: input.level,
        hint: input.authoredHint,
        concept,
        nextStep:
          input.level >= 4
            ? "Implement the approach yourself, then submit. The runner decides whether it passes."
            : "Apply this idea to a visible example. Ask for the next hint only if that example is still unclear.",
      }),
    };
  }

  async analyzeSolution(input: AnalysisInput) {
    const estimate = complexity(input.code);
    const correctnessConcerns = [...estimate.notes];
    if (input.execution?.verdict === "TIME_LIMIT_EXCEEDED") {
      correctnessConcerns.push("The runner reported a time limit. That is a measurement, not a proof of the asymptotic bound.");
    }
    if (input.execution?.verdict === "WRONG_ANSWER") {
      correctnessConcerns.push("Trusted execution reported a wrong answer. Compare the visible failures before changing the approach.");
    }
    if (!input.execution) {
      correctnessConcerns.push("This code has not been executed, so nothing here is a test result.");
    }
    const strengths: string[] = [];
    if (/unordered_map|unordered_set/.test(input.code)) strengths.push("Uses hashing instead of scanning the whole collection for every element.");
    if (/while\s*\(/.test(input.code) && input.topics.includes("binary-search")) strengths.push("Uses a shrinking range, which is the right shape for a binary search.");
    if (strengths.length === 0) strengths.push("The solution is structured as a single Solution method the judge can call.");
    const practice = input.topics[0] ? (TOPIC_LABELS[input.topics[0]] ?? input.topics[0]) : "this topic";
    return {
      model: "heuristic",
      result: analysisResultSchema.parse({
        estimatedTimeComplexity: estimate.time,
        estimatedSpaceComplexity: estimate.space,
        confidence: estimate.confidence,
        correctnessConcerns: correctnessConcerns.slice(0, 5),
        strengths,
        improvements: [
          `A published bound for this problem is about ${input.expectedTime} time and ${input.expectedSpace} extra space. That bound is context, not a grade of this code.`,
          `Static reading suggests ${estimate.time} time. Confirm it by naming the loops, not by the measured milliseconds.`,
        ],
        additionalTestSuggestions: [
          input.execution?.sampleFailures.length
            ? "Replay the failing visible example by hand and write down the values your loop sees."
            : `Add a duplicate-heavy case and a ${practice} case at the constraint boundary before you submit.`,
        ],
      }),
    };
  }

  async classifyMistakes(input: ClassificationInput) {
    const topic = input.topics.find((item) => !input.previousCategories.includes(item)) ?? input.topics[0] ?? "arrays";
    if (input.execution?.verdict === "TIME_LIMIT_EXCEEDED" && !input.previousCategories.includes("TIME_COMPLEXITY_TOO_HIGH")) {
      return {
        model: "heuristic",
        result: classificationResultSchema.parse({
          category: "TIME_COMPLEXITY_TOO_HIGH",
          evidence: "The compiler/test result reports TIME_LIMIT_EXCEEDED. That is the runner's measurement, not a formal proof.",
          confidence: "medium",
          recommendedPracticeTopic: topic,
        }),
      };
    }
    if (
      input.topics.includes("graphs") &&
      input.execution?.verdict === "WRONG_ANSWER" &&
      !/visited|indegree|color/.test(input.code) &&
      !input.previousCategories.includes("MISSING_VISITED_STATE")
    ) {
      return {
        model: "heuristic",
        result: classificationResultSchema.parse({
          category: "MISSING_VISITED_STATE",
          evidence: "The runner reported a wrong answer, and the graph code has no visited, color, or indegree state.",
          confidence: "low",
          recommendedPracticeTopic: "graphs",
        }),
      };
    }
    return {
      model: "heuristic",
      result: classificationResultSchema.parse({
        category: "UNKNOWN",
        evidence: input.execution
          ? "The code and the execution summary do not support a single taxonomy label."
          : "There is no trusted execution result, so the mistake is not classified.",
        confidence: "low",
        recommendedPracticeTopic: topic,
      }),
    };
  }

  async generateTestCases(input: TestGenerationInput) {
    return {
      model: "heuristic",
      cases: testCandidateSchema.parse({ cases: builtinProbes(input.slug) }).cases,
    };
  }

  async conductInterview(input: InterviewInput) {
    return runInterviewTurn(input, { polish: false });
  }
}

export function createAIService(): AIService {
  const heuristic = new HeuristicService();
  if (readLlmConfigFromEnv()) return new LangChainService(heuristic);
  return heuristic;
}

export { LangChainService, OpenAICompatibleService } from "./langchain-service.js";
