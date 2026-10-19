import type { AnalysisResult, ClassificationResult, HintResult, InterviewReply, InterviewStage, InterviewTurn } from "@codementor/shared";
import type { InterviewCoverage } from "./interview-coverage.js";

export type ExecutionSummary = {
  verdict: string | null;
  testsPassed: number | null;
  testsTotal: number | null;
  message: string | null;
  sampleFailures: { input: unknown; expected: unknown; actual: unknown; message?: string | null }[];
  compileExcerpt: string | null;
};

export type HintInput = {
  title: string;
  statement: string;
  topics: string[];
  code: string;
  level: number;
  authoredHint: string;
  priorHints: string[];
  execution: ExecutionSummary | null;
};

export type AnalysisInput = {
  title: string;
  statement: string;
  topics: string[];
  expectedTime: string;
  expectedSpace: string;
  code: string;
  execution: ExecutionSummary | null;
};

export type ClassificationInput = AnalysisInput & {
  constraints: string[];
  previousCategories: string[];
};

export type TestGenerationInput = {
  slug: string;
  title: string;
  statement: string;
  constraints: string[];
  examples: unknown;
};

export type GeneratedCase = { input: Record<string, unknown>; rationale?: string };

export type InterviewInput = {
  title: string;
  statement: string;
  stage: InterviewStage;
  message: string;
  code: string;
  execution: ExecutionSummary | null;
  nextHint: string | null;
  hintsExhausted: boolean;
  transcript: Pick<InterviewTurn, "role" | "message">[];
  coverage: InterviewCoverage;
};

export interface AIService {
  generateHint(input: HintInput): Promise<{ result: HintResult; model: string }>;
  analyzeSolution(input: AnalysisInput): Promise<{ result: AnalysisResult; model: string }>;
  classifyMistakes(input: ClassificationInput): Promise<{ result: ClassificationResult; model: string }>;
  generateTestCases(input: TestGenerationInput): Promise<{ cases: GeneratedCase[]; model: string }>;
  conductInterview(input: InterviewInput): Promise<{ result: InterviewReply; coverage: InterviewCoverage; model: string }>;
}
