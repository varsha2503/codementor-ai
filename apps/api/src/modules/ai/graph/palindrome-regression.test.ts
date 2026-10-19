import { emptyCoverage, isRepetitiveQuestion, recordAskedQuestion } from "../interview-coverage.js";
import { addMark, emptyInterviewMeta, hasMark } from "../interview-meta.js";
import { buildProblemProfile } from "../problem-profile.js";
import { evaluatePalindromeTurn } from "../evaluation/palindrome-evaluator.js";
import { evaluateCandidateTurn } from "../evaluation/contextual-evaluate.js";
import { runInterviewTurn } from "./interview-graph.js";
import { sanitizeCandidateFacingText } from "../interview-meta.js";

const PALINDROME_TITLE = "Palindrome Number";
const PALINDROME_STATEMENT =
  "Return whether n reads the same forwards and backwards in base 10. A negative number is not a palindrome.";

const profile = buildProblemProfile(PALINDROME_TITLE, PALINDROME_STATEMENT);

function metaWithMarks(...marks: Parameters<typeof addMark>[1][]) {
  let meta = emptyInterviewMeta();
  for (const mark of marks) meta = addMark(meta, mark);
  return meta;
}

describe("Palindrome Number regression", () => {
  it("Scenario A: accepts array + mod loop and notes space when relevant", () => {
    const result = evaluatePalindromeTurn({
      stage: "approach",
      message: "I will store all the digits of the number into an array using modulo and a loop.",
      lastQuestion: "How would you solve without string conversion?",
      meta: emptyInterviewMeta(),
      profile,
    });
    expect(result?.evaluation.classification).toMatch(/CORRECT|NEARLY_CORRECT/);
    expect(result?.evaluation.nextAction).toBe("ADVANCE");
    expect(hasMark(result!.meta, "array-digits")).toBe(true);
  });

  it("Scenario B: confirms negative handling and marks topic covered", () => {
    const result = evaluatePalindromeTurn({
      stage: "approach",
      message: "For a negative number, I will return false because it cannot be a palindrome.",
      lastQuestion: "How do negative inputs behave?",
      meta: emptyInterviewMeta(),
      profile,
    });
    expect(result?.evaluation.classification).toBe("CORRECT");
    expect(hasMark(result!.meta, "negative-input")).toBe(true);
    let coverage = emptyCoverage();
    coverage = { ...coverage, meta: result!.meta };
    coverage = recordAskedQuestion(coverage, "How do negative inputs behave?");
    expect(isRepetitiveQuestion("What about negative numbers?", coverage)).toBe(true);
  });

  it("Scenario C: nearly correct full reverse with overflow guidance", () => {
    const result = evaluatePalindromeTurn({
      stage: "approach",
      message: "I will create another variable and reverse the number using modulo and division, then compare it with the original.",
      lastQuestion: "Walk me through reversing the digits.",
      meta: emptyInterviewMeta(),
      profile,
    });
    expect(result?.evaluation.classification).toBe("NEARLY_CORRECT");
    expect(result?.evaluation.issues.some((i) => /overflow/i.test(i))).toBe(true);
  });

  it("Scenario D: flags string conversion", () => {
    const result = evaluatePalindromeTurn({
      stage: "approach",
      message: "If the number is too large, I will convert it to a string and compare the first and last digits.",
      lastQuestion: "How would you compare digits?",
      meta: emptyInterviewMeta(),
      profile: { ...profile, forbidsStringConversion: true },
    });
    expect(result?.evaluation.classification).toBe("INCORRECT");
    expect(result?.evaluation.issues.some((i) => /string/i.test(i))).toBe(true);
  });

  it("Scenario E: long long does not repeat overflow interrogation once resolved", () => {
    const first = evaluatePalindromeTurn({
      stage: "approach",
      message: "I will use the long long data type.",
      lastQuestion: "What about overflow when reversing?",
      meta: emptyInterviewMeta(),
      profile,
    });
    expect(first?.evaluation.issues.some((i) => /overflow|half/i.test(i))).toBe(true);
    const second = evaluatePalindromeTurn({
      stage: "approach",
      message: "I will use the long long data type.",
      lastQuestion: "What about overflow when reversing?",
      meta: first!.meta,
      profile,
    });
    expect(second?.evaluation.nextAction).toBe("ADVANCE");
    expect(hasMark(second!.meta, "overflow-discussed")).toBe(true);
  });

  it("Scenario F: reversal challenge advances when overflow already discussed", () => {
    const result = evaluatePalindromeTurn({
      stage: "approach",
      message: "The tricky part is reversing the integer.",
      lastQuestion: "What is the hardest part?",
      meta: metaWithMarks("overflow-discussed"),
      profile,
    });
    expect(result?.evaluation.nextAction).toBe("ADVANCE");
    expect(result?.evaluation.issues).toHaveLength(0);
  });

  it("treats yes yes as unclear, not a technical answer", async () => {
    const { evaluation } = await evaluateCandidateTurn({
      title: PALINDROME_TITLE,
      statement: PALINDROME_STATEMENT,
      stage: "approach",
      message: "yes yes",
      coverage: emptyCoverage(),
      transcript: [{ role: "interviewer", message: "Explain how you avoid overflow when reversing." }],
      execution: null,
    });
    expect(evaluation.classification).toBe("UNCLEAR");
    expect(evaluation.nextAction).toBe("CLARIFY");
  });

  it("graph advances approach to coding after a strong numeric plan", async () => {
    const out = await runInterviewTurn(
      {
        title: PALINDROME_TITLE,
        statement: PALINDROME_STATEMENT,
        stage: "approach",
        message: "For a negative number, I will return false because it cannot be a palindrome.",
        code: "",
        execution: null,
        nextHint: null,
        hintsExhausted: false,
        transcript: [{ role: "interviewer", message: "How do negative inputs behave?" }],
        coverage: emptyCoverage(),
      },
      { polish: false },
    );
    expect(out.result.stage).not.toBe("introduction");
    expect(sanitizeCandidateFacingText("runTests")).toBe("");
    expect(out.result.message.toLowerCase()).not.toBe("runtests");
  });

  it("does not use runner verdict for verbal classification", async () => {
    const { evaluation } = await evaluateCandidateTurn({
      title: PALINDROME_TITLE,
      statement: PALINDROME_STATEMENT,
      stage: "approach",
      message: "Loop with mod 10 and compare halves.",
      coverage: emptyCoverage(),
      transcript: [],
      execution: { verdict: "WRONG_ANSWER", testsPassed: 0, testsTotal: 5, message: null, sampleFailures: [], compileExcerpt: null },
    });
    expect(evaluation.classification).not.toBe("INCORRECT");
  });
});
