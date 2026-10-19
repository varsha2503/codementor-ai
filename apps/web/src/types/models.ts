export type Example = { input: string; output: string; explanation?: string };

export type Problem = {
  id: string;
  slug: string;
  title: string;
  difficulty: string;
  topics: string[];
  tags: string[];
  statement: string;
  constraints: string[];
  examples: Example[];
  starterCode: string;
  supportedLanguages?: ("cpp" | "python3" | "java")[];
  expectedTime: string;
  expectedSpace: string;
  timeLimitMs: number;
  memoryLimitKb: number;
  catalog?: {
    source: string;
    externalSlug: string;
    canonicalUrl: string;
    licenseStatus: "LINK_ONLY" | "LOCAL_STATEMENT";
    permissionNote: string;
    attribution: string | null;
  } | null;
};

export type InterviewStage = "introduction" | "understanding" | "approach" | "coding" | "complexity" | "feedback";

export type InterviewTurn = {
  role: "interviewer" | "candidate";
  stage: InterviewStage;
  message: string;
  followUp?: string;
};

export type Hint = {
  hintLevel: number;
  hint: string;
  concept: string;
  nextStep: string;
};

export type Analysis = {
  estimatedTimeComplexity: string;
  estimatedSpaceComplexity: string;
  confidence: string;
  correctnessConcerns: string[];
  strengths: string[];
  improvements: string[];
  additionalTestSuggestions: string[];
};

export type Classification = {
  category: string;
  evidence: string;
  confidence: string;
  recommendedPracticeTopic: string;
};

export type CaseResult = {
  visibility: string;
  status: string;
  input?: unknown;
  expected?: unknown;
  actual?: unknown;
  runtimeMs?: number | null;
  memoryKb?: number | null;
  message?: string | null;
};

export type SubmissionView = {
  id: string;
  kind: string;
  verdict: string;
  message: string | null;
  compileOutput: string | null;
  testsPassed: number;
  testsTotal: number;
  runtimeMs: number | null;
  memoryKb: number | null;
  cases: CaseResult[];
};
