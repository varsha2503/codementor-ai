import { analysisResultSchema, canonicalStage, hintResultSchema, interviewTurnSchema, type AnalysisResult, type HintResult, type InterviewTurn } from "@codementor/shared";

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  return value as Record<string, unknown>;
}

function strings(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === "string");
}

export function presentHint(value: unknown): HintResult | null {
  const record = asRecord(value);
  if (!record || typeof record.hint !== "string" || record.hint.length === 0) return null;
  const hintLevel = typeof record.hintLevel === "number" ? record.hintLevel : typeof record.level === "number" ? record.level : 1;
  const parsed = hintResultSchema.safeParse({
    hintLevel,
    hint: record.hint,
    concept: typeof record.concept === "string" ? record.concept : typeof record.title === "string" ? record.title : "Hint",
    nextStep:
      typeof record.nextStep === "string"
        ? record.nextStep
        : hintLevel >= 4
          ? "Implement the approach yourself and submit. The runner decides whether it passes."
          : "Apply this to a visible example before asking for the next hint.",
  });
  return parsed.success ? parsed.data : null;
}

export function presentInterviewTurn(value: unknown): InterviewTurn | null {
  const record = asRecord(value);
  const stage = canonicalStage(record?.stage);
  if (!record || !stage) return null;
  const parsed = interviewTurnSchema.safeParse({ ...record, stage });
  return parsed.success ? parsed.data : null;
}

export function presentAnalysis(value: unknown): AnalysisResult | null {
  const direct = analysisResultSchema.safeParse(value);
  if (direct.success) return direct.data;
  const record = asRecord(value);
  if (!record) return null;
  const concerns = strings(record.correctnessConcerns);
  const improvements = strings(record.improvements);
  const suggestions = strings(record.suggestions);
  const parsed = analysisResultSchema.safeParse({
    estimatedTimeComplexity: record.estimatedTimeComplexity,
    estimatedSpaceComplexity: record.estimatedSpaceComplexity,
    confidence: record.confidence,
    correctnessConcerns: concerns.length > 0 ? concerns : strings(record.concerns),
    strengths: strings(record.strengths),
    improvements: [...(typeof record.summary === "string" ? [record.summary] : []), ...(improvements.length > 0 ? improvements : suggestions)].slice(0, 8),
    additionalTestSuggestions: strings(record.additionalTestSuggestions),
  });
  return parsed.success ? parsed.data : null;
}
