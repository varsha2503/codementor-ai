import { z } from "zod";
import { MISTAKE_CATEGORIES } from "../constants/taxonomy.js";
import { validateSourceForLanguage } from "../languages/validate.js";
import type { SubmissionLanguage } from "../languages/types.js";

export const languageSchema = z.enum(["cpp", "python3", "java"]);

export const registerSchema = z.object({
  email: z.string().trim().email().max(200),
  password: z.string().min(8).max(200),
  displayName: z.string().trim().min(1).max(80),
});

export const loginSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(1).max(200),
});

export const profileSchema = z.object({
  displayName: z.string().trim().min(1).max(80),
});

export const submissionSchema = z.object({
  problemId: z.string().min(1).max(80),
  language: languageSchema,
  code: z.string().min(1).max(65536),
  customInput: z.record(z.unknown()).optional(),
});

export const hintRequestSchema = z.object({
  problemId: z.string().min(1),
  code: z.string().max(65536).default(""),
  attemptId: z.string().optional(),
});

export const analyzeRequestSchema = z.object({
  problemId: z.string().min(1),
  code: z.string().min(1).max(65536),
  attemptId: z.string().optional(),
});

export const confidenceSchema = z.enum(["low", "medium", "high"]);

export const analysisResultSchema = z.object({
  estimatedTimeComplexity: z.string().min(1).max(80),
  estimatedSpaceComplexity: z.string().min(1).max(80),
  confidence: confidenceSchema,
  correctnessConcerns: z.array(z.string().max(400)).max(8),
  strengths: z.array(z.string().max(400)).max(8),
  improvements: z.array(z.string().max(400)).max(8),
  additionalTestSuggestions: z.array(z.string().max(400)).max(8),
});

export const hintResultSchema = z.object({
  hintLevel: z.number().int().min(1).max(4),
  hint: z.string().min(1).max(2000),
  concept: z.string().min(1).max(160),
  nextStep: z.string().min(1).max(400),
});

export const classificationResultSchema = z.object({
  category: z.enum(MISTAKE_CATEGORIES).or(z.literal("UNKNOWN")),
  evidence: z.string().min(1).max(600),
  confidence: confidenceSchema,
  recommendedPracticeTopic: z.string().min(1).max(80),
});

export const testCandidateSchema = z.object({
  cases: z
    .array(
      z.object({
        input: z.record(z.unknown()),
        rationale: z.string().max(300).optional(),
      }),
    )
    .max(12),
});

export const interviewStageSchema = z.enum(["introduction", "understanding", "approach", "coding", "complexity", "feedback"]);

const legacyInterviewStage: Record<string, InterviewStage> = {
  clarify: "understanding",
  code: "coding",
  debrief: "feedback",
};

export function canonicalStage(value: unknown): InterviewStage | null {
  if (typeof value !== "string") return null;
  const normalized = value.trim().toLowerCase().replaceAll("_", "-");
  const parsed = interviewStageSchema.safeParse(normalized);
  if (parsed.success) return parsed.data;
  return legacyInterviewStage[normalized] ?? null;
}

export const interviewTurnSchema = z.object({
  role: z.enum(["interviewer", "candidate"]),
  stage: interviewStageSchema,
  message: z.string().min(1).max(4000),
  followUp: z.string().max(400).optional(),
});

export const interviewReplySchema = z.object({
  stage: interviewStageSchema,
  message: z.string().min(1).max(2000),
  followUp: z.string().min(1).max(400),
});

export type AnalysisResult = z.infer<typeof analysisResultSchema>;
export type HintResult = z.infer<typeof hintResultSchema>;
export type ClassificationResult = z.infer<typeof classificationResultSchema>;
export type InterviewStage = z.infer<typeof interviewStageSchema>;
export type InterviewTurn = z.infer<typeof interviewTurnSchema>;
export type InterviewReply = z.infer<typeof interviewReplySchema>;

export const answerEvaluationClassificationSchema = z.enum([
  "CORRECT",
  "NEARLY_CORRECT",
  "PARTIALLY_CORRECT",
  "INCORRECT",
  "UNCLEAR",
]);

export const answerNextActionSchema = z.enum(["ADVANCE", "CLARIFY", "EXPLAIN", "STAY"]);

export const answerEvaluationSchema = z.object({
  classification: answerEvaluationClassificationSchema,
  correctPoints: z.array(z.string().max(300)).max(12),
  issues: z.array(z.string().max(300)).max(12),
  missingConcepts: z.array(z.string().max(120)).max(12),
  explanation: z.string().max(800),
  nextAction: answerNextActionSchema,
  nextTopic: z.string().max(160).optional(),
});

export type AnswerEvaluation = z.infer<typeof answerEvaluationSchema>;
export type AnswerEvaluationClassification = z.infer<typeof answerEvaluationClassificationSchema>;
export type AnswerNextAction = z.infer<typeof answerNextActionSchema>;

export const MAX_CODE_BYTES = 65536;

export function validateSource(code: string, language: SubmissionLanguage = "cpp"): string | null {
  return validateSourceForLanguage(code, language);
}
