import type { InterviewReply, InterviewStage } from "@codementor/shared";
import type { InterviewExecution } from "./interview.js";
import { codeDiscussionPrompt, codeLooksLikeStub } from "./interview-code.js";
import { emptyInterviewMeta, hasMark, type InterviewSessionMeta } from "./interview-meta.js";

/** Stable tags for what the candidate has discussed (problem-agnostic). */
export type ConceptId =
  | "problem-io"
  | "algorithm-outline"
  | "digit-count"
  | "digit-extract"
  | "power-or-accumulate"
  | "edge-zero-or-empty"
  | "edge-general"
  | "data-structure"
  | "complexity"
  | "implementation-detail"
  | "correctness-from-runner";

export type QuestionIntent =
  | "ask-ready"
  | "ask-problem-restatement"
  | "ask-algorithm"
  | "ask-digit-count"
  | "ask-digit-extract"
  | "ask-edge-case"
  | "ask-data-structure"
  | "ask-complexity"
  | "ask-code-walkthrough"
  | "ask-run-or-debug"
  | "ask-clarification"
  | "acknowledge-advance"
  | "feedback";

export type InterviewCoverage = {
  covered: ConceptId[];
  partial: ConceptId[];
  questionIntents: QuestionIntent[];
  /** Normalized stems of interviewer questions for fuzzy repetition checks. */
  questionStems: string[];
  meta?: InterviewSessionMeta;
};

export type Sufficiency = "sufficient" | "partial" | "unclear";

const STAGE_ORDER: InterviewStage[] = ["introduction", "understanding", "approach", "coding", "complexity", "feedback"];

export function emptyCoverage(): InterviewCoverage {
  return { covered: [], partial: [], questionIntents: [], questionStems: [], meta: emptyInterviewMeta() };
}

export function ensureMeta(coverage: InterviewCoverage): InterviewCoverage {
  return coverage.meta ? coverage : { ...coverage, meta: emptyInterviewMeta() };
}

export function normalizeSpeech(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, " ")
    .replace(/\b(uh|um|like|you know)\b/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function hasConcept(coverage: InterviewCoverage, id: ConceptId): boolean {
  return coverage.covered.includes(id);
}

export function detectConcepts(raw: string): ConceptId[] {
  const text = normalizeSpeech(raw);
  if (!text) return [];
  const found = new Set<ConceptId>();
  if (/\b(return|output|input|given|must|function|find|compute|determine)\b/.test(text) && text.length > 25) {
    found.add("problem-io");
  }
  if (
    /\b(first|then|next|after|step|loop|while|until|compare|sum|total)\b/.test(text) &&
    (text.split(" ").length > 12 || /\bthen\b.*\bthen\b/.test(text))
  ) {
    found.add("algorithm-outline");
  }
  if (
    /\b(count.*digit|digit.*count|number of digit|how many digit|string length|strlen|log10|digits in|count the digit|count digit)\b/.test(text) ||
    (/\bcount\b/.test(text) && /\bdigits?\b/.test(text))
  ) {
    found.add("digit-count");
  }
  if (
    /\b(mod(ulo)?\s*10|% 10|mod 10|divide by 10|\/ 10|extract.*digit|digit.*extract|last digit|with mod)\b/.test(text) ||
    (/\bextract\b/.test(text) && /\bdigits?\b/.test(text))
  ) {
    found.add("digit-extract");
  }
  if (/\b(power|raise|exponent|\bpow\b|\^|nth power|digit count power)\b/.test(text)) {
    found.add("power-or-accumulate");
  }
  if (/\b(zero|n = 0|single digit|empty|n == 0|input 0)\b/.test(text)) {
    found.add("edge-zero-or-empty");
  }
  if (/\b(edge|null|overflow|negative|duplicate|boundary|corner|limit|max int)\b/.test(text)) {
    found.add("edge-general");
  }
  if (/\b(map|hash|set|stack|queue|heap|sort|two pointer|binary search|dp|recursion|graph|bfs|dfs|greedy|array|list|tree)\b/.test(text)) {
    found.add("data-structure");
  }
  if (/\b(negative|less than zero|n\s*<\s*0)\b/.test(text) && /\b(false|not|palindrome|return)\b/.test(text)) {
    found.add("edge-general");
  }
  if (/\b(overflow|long long|32.?bit|revers(e|ing) the entire|full reverse)\b/.test(text)) {
    found.add("edge-general");
  }
  if (/\b(string|to_string|stringstream|char array)\b/.test(text)) {
    found.add("implementation-detail");
  }
  if (/\b(half|stop halfway|middle|second half)\b/.test(text) && /\b(reverse|digit)\b/.test(text)) {
    found.add("algorithm-outline");
  }
  if (/\bo\s*\(|linear|quadratic|logarithmic|n log n|constant time|space\b/.test(text)) {
    found.add("complexity");
  }
  if (/\b(implement|code|variable|line|loop body|recurs|base case)\b/.test(text) && text.length > 20) {
    found.add("implementation-detail");
  }
  return [...found];
}

export function mergeConcepts(coverage: InterviewCoverage, concepts: ConceptId[]): InterviewCoverage {
  const covered = new Set(coverage.covered);
  const partial = new Set(coverage.partial);
  for (const c of concepts) {
    covered.add(c);
    partial.delete(c);
  }
  return { ...coverage, covered: [...covered], partial: [...partial] };
}

export function ingestCandidateMessage(coverage: InterviewCoverage, message: string): InterviewCoverage {
  return mergeConcepts(coverage, detectConcepts(message));
}

export function rebuildCoverageFromTranscript(messages: { role: string; message: string }[]): InterviewCoverage {
  let coverage = emptyCoverage();
  for (const turn of messages) {
    if (turn.role === "candidate") coverage = ingestCandidateMessage(coverage, turn.message);
  }
  return coverage;
}

export function latestCoverageFromResponses(responses: unknown[]): InterviewCoverage | null {
  for (let i = responses.length - 1; i >= 0; i--) {
    const parsed = parseStoredCoverage(responses[i]);
    if (parsed) return parsed;
  }
  return null;
}

export function parseStoredCoverage(value: unknown): InterviewCoverage | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const record = value as Record<string, unknown>;
  const cov = record.coverage;
  if (!cov || typeof cov !== "object" || Array.isArray(cov)) return null;
  const c = cov as Record<string, unknown>;
  const covered = Array.isArray(c.covered) ? c.covered.filter((x): x is ConceptId => typeof x === "string") : [];
  const partial = Array.isArray(c.partial) ? c.partial.filter((x): x is ConceptId => typeof x === "string") : [];
  const questionIntents = Array.isArray(c.questionIntents)
    ? c.questionIntents.filter((x): x is QuestionIntent => typeof x === "string")
    : [];
  const questionStems = Array.isArray(c.questionStems) ? c.questionStems.filter((x): x is string => typeof x === "string") : [];
  const metaRaw = c.meta;
  const meta =
    metaRaw && typeof metaRaw === "object" && !Array.isArray(metaRaw)
      ? (metaRaw as InterviewCoverage["meta"])
      : emptyInterviewMeta();
  return { covered, partial, questionIntents, questionStems, meta };
}

export function loadCoverage(stored: InterviewCoverage | null, transcript: { role: string; message: string }[]): InterviewCoverage {
  const rebuilt = rebuildCoverageFromTranscript(transcript);
  if (!stored) return rebuilt;
  return mergeConcepts(
    {
      ...stored,
      covered: [...new Set([...stored.covered, ...rebuilt.covered])],
      questionIntents: stored.questionIntents,
      questionStems: stored.questionStems,
      partial: stored.partial.filter((p) => !rebuilt.covered.includes(p)),
    },
    [],
  );
}

export function questionIntentsFromText(text: string): QuestionIntent[] {
  const t = normalizeSpeech(text);
  const intents: QuestionIntent[] = [];
  if (/\b(ready|start|begin)\b/.test(t)) intents.push("ask-ready");
  if (/\b(restate|what should|what must|return|problem ask|in your own words)\b/.test(t)) intents.push("ask-problem-restatement");
  if (/\b(approach|algorithm|how would you solve|plan|pattern|structure|double loop)\b/.test(t)) intents.push("ask-algorithm");
  if (/\b(count.*digits?|how many digits?|digits? count)\b/.test(t)) intents.push("ask-digit-count");
  if (/\b(extract.*digit|modulo|mod 10|divide by 10|get each digit|every digit|getting.*digit|each digit)\b/.test(t)) {
    intents.push("ask-digit-extract");
  }
  if (/\b(edge|zero|empty|boundary|corner case)\b/.test(t)) intents.push("ask-edge-case");
  if (/\b(negative|less than zero)\b/.test(t)) intents.push("ask-edge-case");
  if (/\b(overflow|long long|32.?bit)\b/.test(t)) intents.push("ask-edge-case");
  if (/\b(string conversion|convert.*string|without string)\b/.test(t)) intents.push("ask-clarification");
  if (/\b(complexity|big o|time and space|linear|quadratic)\b/.test(t)) intents.push("ask-complexity");
  if (/\b(editor|implementation|walk through|your code|loop)\b/.test(t)) intents.push("ask-code-walkthrough");
  if (/\b(run|runner|sample|compile|wrong answer|failing test|debug)\b/.test(t)) intents.push("ask-run-or-debug");
  if (/\b(clarif|constraint|statement)\b/.test(t)) intents.push("ask-clarification");
  if (/\b(makes sense|good|correct|let's move|move on|implement)\b/.test(t) && !/\?\s*$/.test(text.trim())) {
    intents.push("acknowledge-advance");
  }
  return intents.length > 0 ? intents : ["ask-clarification"];
}

export function recordAskedQuestion(coverage: InterviewCoverage, questionText: string): InterviewCoverage {
  const intents = questionIntentsFromText(questionText);
  const stem = normalizeSpeech(questionText).split(" ").slice(0, 12).join(" ");
  return {
    ...coverage,
    questionIntents: [...new Set([...coverage.questionIntents, ...intents])],
    questionStems: stem ? [...coverage.questionStems, stem] : coverage.questionStems,
  };
}

function tokenSet(text: string): Set<string> {
  return new Set(normalizeSpeech(text).split(" ").filter((w) => w.length > 2));
}

function jaccard(a: Set<string>, b: Set<string>): number {
  if (a.size === 0 && b.size === 0) return 1;
  let inter = 0;
  for (const x of a) if (b.has(x)) inter++;
  const union = a.size + b.size - inter;
  return union === 0 ? 0 : inter / union;
}

const INTENT_TO_CONCEPT: Partial<Record<QuestionIntent, ConceptId>> = {
  "ask-digit-count": "digit-count",
  "ask-digit-extract": "digit-extract",
  "ask-complexity": "complexity",
  "ask-problem-restatement": "problem-io",
  "ask-algorithm": "algorithm-outline",
  "ask-edge-case": "edge-zero-or-empty",
};

export function isRepetitiveQuestion(questionText: string, coverage: InterviewCoverage): boolean {
  const intents = questionIntentsFromText(questionText);
  for (const intent of intents) {
    const concept = INTENT_TO_CONCEPT[intent];
    if (concept && hasConcept(coverage, concept)) return true;
    if (intent === "ask-digit-count" && hasConcept(coverage, "digit-count")) return true;
    if (intent === "ask-digit-extract" && hasConcept(coverage, "digit-extract")) return true;
    if (coverage.questionIntents.includes(intent)) {
      if (intent === "ask-complexity" && hasConcept(coverage, "complexity")) return true;
      if (intent === "ask-algorithm" && hasConcept(coverage, "algorithm-outline")) return true;
      if (intent === "ask-problem-restatement" && hasConcept(coverage, "problem-io")) return true;
    }
  }
  const tokens = tokenSet(questionText);
  for (const stem of coverage.questionStems) {
    if (jaccard(tokens, tokenSet(stem)) >= 0.45) return true;
  }
  const q = normalizeSpeech(questionText);
  if (intents.includes("ask-digit-extract") && /\bdigit\b/.test(q) && /\b(extract|get|mod|divide|walk)\b/.test(q)) {
    return coverage.questionIntents.includes("ask-digit-extract");
  }
  const meta = coverage.meta;
  if (meta) {
    if (/\b(negative|less than zero)\b/.test(q) && hasMark(meta, "negative-input")) return true;
    if (/\b(overflow|long long|32.?bit)\b/.test(q) && hasMark(meta, "overflow-discussed")) return true;
    if (/\b(string conversion|convert.*string)\b/.test(q) && hasMark(meta, "no-string-noted")) return true;
  }
  return false;
}

export type AssessResponseResult = { sufficiency: Sufficiency; missing?: ConceptId };

export function assessResponse(input: {
  stage: InterviewStage;
  message: string;
  coverage: InterviewCoverage;
}): AssessResponseResult {
  const text = input.message.trim();
  const norm = normalizeSpeech(text);
  const after = ingestCandidateMessage(input.coverage, text);

  if (input.stage === "introduction") {
    const ready =
      /^(i am ready|i'm ready|im ready|ready|let's start|lets start|start|yes)$/i.test(text) ||
      (text.length >= 18 && !text.includes("?"));
    return ready ? { sufficiency: "sufficient" } : { sufficiency: "unclear" };
  }

  if (input.stage === "understanding") {
    if (hasConcept(after, "problem-io") && norm.split(" ").length >= 8) return { sufficiency: "sufficient" };
    if (text.length >= 35) return { sufficiency: "partial", missing: "problem-io" };
    return { sufficiency: "unclear", missing: "problem-io" };
  }

  if (input.stage === "approach") {
    const strongAlgorithm =
      hasConcept(after, "algorithm-outline") &&
      (hasConcept(after, "digit-count") || hasConcept(after, "digit-extract") || hasConcept(after, "data-structure") || norm.split(" ").length > 25);
    if (strongAlgorithm) return { sufficiency: "sufficient" };
    if (hasConcept(after, "algorithm-outline") || hasConcept(after, "data-structure")) {
      return { sufficiency: "partial", missing: "algorithm-outline" };
    }
    if (text.length >= 25) return { sufficiency: "partial", missing: "algorithm-outline" };
    return { sufficiency: "unclear", missing: "algorithm-outline" };
  }

  if (input.stage === "coding") {
    return { sufficiency: "sufficient" };
  }

  if (input.stage === "complexity") {
    if (hasConcept(after, "complexity") || hasConcept(input.coverage, "complexity")) return { sufficiency: "sufficient" };
    return { sufficiency: "partial", missing: "complexity" };
  }

  return { sufficiency: "sufficient" };
}

export function allowedStages(current: InterviewStage, target: InterviewStage): InterviewStage[] {
  const i = STAGE_ORDER.indexOf(current);
  const j = STAGE_ORDER.indexOf(target);
  if (i < 0 || j < 0) return [current];
  const lo = Math.min(i, j);
  const hi = Math.max(i, j);
  return STAGE_ORDER.slice(lo, hi + 1);
}

function nextMissingEdge(coverage: InterviewCoverage, title: string): ConceptId | null {
  const t = title.toLowerCase();
  if (/palindrome/.test(t)) return null;
  const needsDigitFlow = /armstrong|reverse integer/.test(t) || (/digit/.test(t) && !/palindrome/.test(t));
  if (needsDigitFlow && !hasConcept(coverage, "digit-extract") && hasConcept(coverage, "digit-count")) return "digit-extract";
  if (needsDigitFlow && !hasConcept(coverage, "edge-zero-or-empty") && hasConcept(coverage, "digit-extract")) return "edge-zero-or-empty";
  if (!hasConcept(coverage, "edge-general") && hasConcept(coverage, "algorithm-outline") && !needsDigitFlow) {
    return "edge-general";
  }
  return null;
}

function questionForConcept(concept: ConceptId, title: string): { message: string; followUp: string; intent: QuestionIntent } {
  switch (concept) {
    case "digit-extract":
      return {
        message: "That approach makes sense. How will you extract each digit in your implementation?",
        followUp: "One mechanism is enough.",
        intent: "ask-digit-extract",
      };
    case "digit-count":
      return {
        message: `For "${title}", how will you count the digits before the main loop?`,
        followUp: "A sentence is fine.",
        intent: "ask-digit-count",
      };
    case "edge-zero-or-empty":
      return {
        message: "How would you handle the input zero, or another smallest case that could break a naive loop?",
        followUp: "State the expected result for that case.",
        intent: "ask-edge-case",
      };
    case "edge-general":
      return {
        message: "Name one edge input you would test before trusting this on large cases.",
        followUp: "Keep it to a single case.",
        intent: "ask-edge-case",
      };
    case "problem-io":
      return {
        message: `In your own words, what should "${title}" return on a typical input?`,
        followUp: "One example input is enough.",
        intent: "ask-problem-restatement",
      };
    case "algorithm-outline":
      return {
        message: "Walk me through the main steps you would take before writing code.",
        followUp: "Order matters more than perfect wording.",
        intent: "ask-algorithm",
      };
    case "complexity":
      return {
        message: "State time and extra space in Big-O and tie each term to a loop or container in your approach.",
        followUp: "Do not cite milliseconds from a run.",
        intent: "ask-complexity",
      };
    default:
      return {
        message: "What is the next concrete detail you would nail down before coding?",
        followUp: "One detail only.",
        intent: "ask-clarification",
      };
  }
}

function ack(prefix: string): string {
  return prefix.replace(/\s+$/, "");
}

export function adaptiveInterviewerReply(input: {
  title: string;
  stage: InterviewStage;
  message: string;
  code?: string;
  execution: InterviewExecution | null;
  coverage: InterviewCoverage;
  nextHint: string | null;
  hintsExhausted?: boolean;
  asksForHelp: (m: string) => boolean;
  isClarifyingQuestion: (m: string) => boolean;
  /** When set (e.g. merged LangChain evaluation), overrides heuristic assessResponse. */
  responseAssessment?: AssessResponseResult;
}): { reply: InterviewReply; coverage: InterviewCoverage } {
  let coverage = ingestCandidateMessage(input.coverage, input.message);
  const stage = input.stage;
  const text = input.message.trim();

  if (input.asksForHelp(text)) {
    const hint = input.nextHint?.slice(0, 900) ?? null;
    const message = hint
      ? `I will not write the function. Take this step and apply it yourself: ${hint}`
      : input.hintsExhausted
        ? "The written explanation for this problem was already given. Implement it yourself. The runner is the only judge."
        : "Finish the question I asked. Ask for the written explanation when you want the last rung, and I still will not paste code.";
    const reply: InterviewReply = { stage, message, followUp: hint ? "Change the editor, then tell me what you changed." : "Run the samples once the code compiles." };
    return { reply, coverage };
  }

  if (input.isClarifyingQuestion(text)) {
    const reply: InterviewReply = {
      stage,
      message: "Good question — use the statement and visible examples on the page. I will not add hidden constraints or show the solution.",
      followUp: "Answer the last thing I asked when you are ready.",
    };
    return { reply, coverage };
  }

  const assessment =
    input.responseAssessment ?? assessResponse({ stage, message: text, coverage });

  if (stage === "introduction") {
    if (assessment.sufficiency !== "sufficient") {
      const reply: InterviewReply = {
        stage: "introduction",
        message: `When you are ready, we will restate "${input.title}" in your own words.`,
        followUp: "Say ready or give a short opener.",
      };
      return { reply, coverage: recordAskedQuestion(coverage, reply.message) };
    }
    const reply: InterviewReply = {
      stage: "understanding",
      message: `What should "${input.title}" return, in plain language?`,
      followUp: "One example input helps.",
    };
    return { reply, coverage: recordAskedQuestion(coverage, reply.message) };
  }

  if (stage === "understanding") {
    if (assessment.sufficiency === "unclear") {
      const q = questionForConcept("problem-io", input.title);
      const reply: InterviewReply = { stage: "understanding", message: q.message, followUp: q.followUp };
      return { reply, coverage: recordAskedQuestion(coverage, reply.message) };
    }
    if (assessment.sufficiency === "sufficient") {
      const reply: InterviewReply = {
        stage: "approach",
        message: ack("Got it.") + " How would you solve it — what is the core idea?",
        followUp: "High-level steps are fine; no pseudocode required.",
      };
      return { reply, coverage: recordAskedQuestion(coverage, reply.message) };
    }
    const reply: InterviewReply = {
      stage: "understanding",
      message: "What is still unclear about the required output?",
      followUp: "One gap is enough.",
    };
    return { reply, coverage: recordAskedQuestion(coverage, reply.message) };
  }

  if (stage === "approach") {
    if (assessment.sufficiency === "sufficient") {
      const missing = nextMissingEdge(coverage, input.title);
      if (missing && !hasConcept(coverage, missing)) {
        const q = questionForConcept(missing, input.title);
        if (!isRepetitiveQuestion(q.message, coverage)) {
          const reply: InterviewReply = { stage: "approach", message: q.message, followUp: q.followUp };
          return { reply, coverage: recordAskedQuestion(coverage, reply.message) };
        }
      }
      const reply: InterviewReply = {
        stage: "coding",
        message: ack("You have covered the core plan.") + " Implement it in the editor when you are ready.",
        followUp: "I read your code each turn; run samples when you want the runner's verdict.",
      };
      return { reply, coverage: recordAskedQuestion(coverage, reply.message) };
    }
    if (assessment.sufficiency === "partial") {
      const missing =
        nextMissingEdge(coverage, input.title) ??
        (assessment.missing && !hasConcept(coverage, assessment.missing) ? assessment.missing : "algorithm-outline");
      const q = questionForConcept(missing, input.title);
      if (!isRepetitiveQuestion(q.message, coverage)) {
        const reply: InterviewReply = { stage: "approach", message: q.message, followUp: q.followUp };
        return { reply, coverage: recordAskedQuestion(coverage, reply.message) };
      }
    }
    const q = questionForConcept("algorithm-outline", input.title);
    const reply: InterviewReply = { stage: "approach", message: q.message, followUp: q.followUp };
    return { reply, coverage: recordAskedQuestion(coverage, reply.message) };
  }

  if (stage === "coding") {
    const verdict = input.execution?.verdict ?? null;
    if (verdict === "ACCEPTED") {
      if (hasConcept(coverage, "complexity")) {
        const reply: InterviewReply = {
          stage: "feedback",
          message: feedbackLine(input.execution),
          followUp: "Reset the interview to practice another problem.",
        };
        return { reply, coverage: recordAskedQuestion(coverage, reply.message) };
      }
      const passed = input.execution?.testsPassed ?? 0;
      const total = input.execution?.testsTotal ?? 0;
      const reply: InterviewReply = {
        stage: "complexity",
        message: `The runner accepted this attempt (${passed} of ${total}). What are time and extra space in Big-O for your code?`,
        followUp: "Point at a loop or container, not wall-clock time.",
      };
      return { reply, coverage: recordAskedQuestion(coverage, reply.message) };
    }
    if (verdict === "WRONG_ANSWER") {
      const reply: InterviewReply = {
        stage: "coding",
        message: "The runner reported a wrong answer. Walk one visible failing sample and where your trace diverges.",
        followUp: "I will not patch the function for you.",
      };
      return { reply, coverage: recordAskedQuestion(coverage, reply.message) };
    }
    if (verdict === "COMPILE_ERROR") {
      const reply: InterviewReply = {
        stage: "coding",
        message: "The compiler rejected this. What does the first diagnostic refer to?",
        followUp: "Fix compile, then run again.",
      };
      return { reply, coverage: recordAskedQuestion(coverage, reply.message) };
    }
    if (verdict === "TIME_LIMIT_EXCEEDED") {
      const reply: InterviewReply = {
        stage: "coding",
        message: "The runner stopped for time. Which loop might repeat work on the same data?",
        followUp: "Name the bottleneck, then adjust structure if needed.",
      };
      return { reply, coverage: recordAskedQuestion(coverage, reply.message) };
    }
    if (verdict === "RUNTIME_ERROR" || verdict === "MEMORY_LIMIT_EXCEEDED") {
      const reply: InterviewReply = {
        stage: "coding",
        message:
          verdict === "RUNTIME_ERROR"
            ? "The runner hit a runtime error. Which index or container do you suspect?"
            : "The runner hit a memory limit. Which structure grows with input size?",
        followUp: "Describe the suspect line; I will not rewrite it.",
      };
      return { reply, coverage: recordAskedQuestion(coverage, reply.message) };
    }
    const code = input.code ?? "";
    if (codeLooksLikeStub(code)) {
      const reply: InterviewReply = {
        stage: "coding",
        message: "The editor still looks like a stub. Add your core loop or recursive step.",
        followUp: "Tell me what it does once written.",
      };
      return { reply, coverage: recordAskedQuestion(coverage, reply.message) };
    }
    const discuss = codeDiscussionPrompt(input.title, code);
    if (discuss && !isRepetitiveQuestion(discuss, coverage)) {
      const reply: InterviewReply = { stage: "coding", message: discuss, followUp: "Run samples when you want the runner to confirm." };
      return { reply, coverage: recordAskedQuestion(coverage, reply.message) };
    }
    const reply: InterviewReply = {
      stage: "coding",
      message: "Explain the trickiest part of your implementation in one or two sentences.",
      followUp: "The runner decides pass/fail when you execute.",
    };
    return { reply, coverage: recordAskedQuestion(coverage, reply.message) };
  }

  if (stage === "complexity") {
    if (assessment.sufficiency !== "sufficient" && !hasConcept(coverage, "complexity")) {
      const q = questionForConcept("complexity", input.title);
      if (!isRepetitiveQuestion(q.message, coverage)) {
        const reply: InterviewReply = { stage: "complexity", message: q.message, followUp: q.followUp };
        return { reply, coverage: recordAskedQuestion(coverage, reply.message) };
      }
    }
    const reply: InterviewReply = {
      stage: "feedback",
      message: feedbackLine(input.execution),
      followUp: "Reset the interview if you want another pass.",
    };
    return { reply, coverage: recordAskedQuestion(coverage, reply.message) };
  }

  const reply: InterviewReply = {
    stage: "feedback",
    message: feedbackLine(input.execution),
    followUp: "The hint ladder is still available on another attempt.",
  };
  return { reply, coverage: recordAskedQuestion(coverage, reply.message) };
}

function feedbackLine(execution: InterviewExecution | null): string {
  if (!execution?.verdict) {
    return "Feedback: your reasoning and communication stood on their own; correctness was not established by a finished run.";
  }
  const passed = execution.testsPassed ?? 0;
  const total = execution.testsTotal ?? 0;
  return `Feedback: correctness follows the runner (${execution.verdict}, ${passed} of ${total}). Note one thing you would test next time before submit.`;
}

export function guardRepetitiveReply(reply: InterviewReply, coverage: InterviewCoverage, fallback: InterviewReply): InterviewReply {
  if (!isRepetitiveQuestion(reply.message, coverage)) return reply;
  return fallback;
}

export function combineMessageAndFollowUp(reply: InterviewReply): InterviewReply {
  const msg = reply.message.trim();
  const hasQuestion = msg.includes("?");
  if (hasQuestion && msg.split("?").length <= 2) return reply;
  const sentences = msg.split(/(?<=[.?!])\s+/).filter(Boolean);
  if (sentences.length <= 2) return reply;
  return { ...reply, message: sentences.slice(0, 2).join(" ") };
}
