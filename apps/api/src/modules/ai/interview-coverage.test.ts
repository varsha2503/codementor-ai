import {
  assessResponse,
  detectConcepts,
  emptyCoverage,
  guardRepetitiveReply,
  ingestCandidateMessage,
  isRepetitiveQuestion,
  loadCoverage,
  normalizeSpeech,
  rebuildCoverageFromTranscript,
  recordAskedQuestion,
  type InterviewCoverage,
} from "./interview-coverage.js";
import { interviewerReplyWithCoverage } from "./interview.js";

const TITLE = "Armstrong Number";

describe("interview coverage", () => {
  it("does not ask again after a concept is covered", () => {
    let coverage = emptyCoverage();
    coverage = ingestCandidateMessage(coverage, "I count digits, extract with mod 10, raise to power n, and compare.");
    expect(isRepetitiveQuestion("How will you count the digits?", coverage)).toBe(true);
    expect(isRepetitiveQuestion("How will you extract each digit?", coverage)).toBe(true);
  });

  it("asks one focused follow-up for a partial answer", () => {
    const coverage = emptyCoverage();
    const { reply } = interviewerReplyWithCoverage({
      title: TITLE,
      stage: "approach",
      message: "I will count digits and compare the sum.",
      coverage,
      execution: null,
      nextHint: null,
    });
    expect(reply.stage).toBe("approach");
    expect(reply.message.toLowerCase()).toMatch(/extract|digit|mod/);
    expect(reply.message.split("?").length).toBeLessThanOrEqual(2);
  });

  it("clarifies a misconception without changing topic randomly", () => {
    const { reply } = interviewerReplyWithCoverage({
      title: TITLE,
      stage: "approach",
      message: "I would always return true for any input.",
      coverage: emptyCoverage(),
      execution: null,
      nextHint: null,
    });
    expect(reply.stage).toBe("approach");
    expect(reply.message.length).toBeGreaterThan(10);
  });

  it("moves to coding without demanding pseudocode after a full algorithm", () => {
    let coverage = emptyCoverage();
    const step1 =
      "First I count digits. Then I extract each digit, raise to the power of the count, add, and compare with the original number.";
    let r = interviewerReplyWithCoverage({ title: TITLE, stage: "approach", message: step1, coverage, execution: null, nextHint: null });
    coverage = r.coverage;
    expect(r.reply.message.toLowerCase()).toMatch(/extract|digit|zero|edge|implement/);

    const step2 = "I use modulo 10 to get each digit and divide by 10 in a loop. String length counts digits.";
    r = interviewerReplyWithCoverage({ title: TITLE, stage: "approach", message: step2, coverage, execution: null, nextHint: null });
    coverage = r.coverage;
    expect(r.reply.message.toLowerCase()).toMatch(/zero|edge|implement|editor/);

    const step3 = "Zero has one digit and sum zero so return true.";
    r = interviewerReplyWithCoverage({ title: TITLE, stage: "approach", message: step3, coverage, execution: null, nextHint: null });
    expect(r.reply.stage).toBe("coding");
    expect(r.reply.message.toLowerCase()).not.toMatch(/count.*digit.*extract.*pseudocode/);
  });

  it("does not ask complexity again when already stated", () => {
    let coverage = ingestCandidateMessage(emptyCoverage(), "Time is O(d log d) for d digits due to pow; space O(1).");
    coverage = recordAskedQuestion(coverage, "What is the time complexity?");
    expect(isRepetitiveQuestion("State the Big-O time and space.", coverage)).toBe(true);
    const assessment = assessResponse({ stage: "complexity", message: "Linear in digits, constant space.", coverage });
    expect(assessment.sufficiency).toBe("sufficient");
  });

  it("accepts speech-recognition grammar when meaning is clear", () => {
    const messy = "uh first i will count the digit in the number then i extract digit with mod 10";
    const concepts = detectConcepts(messy);
    expect(concepts).toContain("digit-count");
    expect(concepts).toContain("digit-extract");
    const assessment = assessResponse({
      stage: "approach",
      message: messy,
      coverage: emptyCoverage(),
    });
    expect(assessment.sufficiency).not.toBe("unclear");
  });

  it("detects rephrased duplicate questions", () => {
    let coverage = recordAskedQuestion(emptyCoverage(), "How will you extract each digit in your implementation?");
    expect(isRepetitiveQuestion("Walk me through getting every digit from the number.", coverage)).toBe(true);
  });

  it("advances understanding when restatement is sufficient", () => {
    const { reply } = interviewerReplyWithCoverage({
      title: TITLE,
      stage: "understanding",
      message: "Return true if the sum of each digit raised to the power of digit count equals the number.",
      coverage: emptyCoverage(),
      execution: null,
      nextHint: null,
    });
    expect(reply.stage).toBe("approach");
  });

  it("rebuilds and merges coverage from transcript for persistence", () => {
    const transcript = [
      { role: "candidate", message: "Count digits then extract with mod 10." },
      { role: "interviewer", message: "How handle zero?" },
    ];
    const rebuilt = rebuildCoverageFromTranscript(transcript);
    const stored: InterviewCoverage = { covered: ["problem-io"], partial: [], questionIntents: [], questionStems: [] };
    const merged = loadCoverage(stored, transcript);
    expect(merged.covered).toEqual(expect.arrayContaining(["digit-count", "digit-extract", "problem-io"]));
    expect(rebuilt.covered).toContain("digit-extract");
  });

  it("uses guard to replace repetitive LLM-shaped replies", () => {
    const coverage = ingestCandidateMessage(emptyCoverage(), "Mod 10 and divide by 10 for digits.");
    const repetitive = {
      stage: "approach" as const,
      message: "How will you extract each digit from the number?",
      followUp: "Explain extraction.",
    };
    const fallback = {
      stage: "approach" as const,
      message: "Let's move to implementation in the editor.",
      followUp: "Code when ready.",
    };
    expect(guardRepetitiveReply(repetitive, coverage, fallback)).toEqual(fallback);
  });

  it("does not claim correctness without runner verdict", () => {
    const { reply } = interviewerReplyWithCoverage({
      title: TITLE,
      stage: "coding",
      message: "I think it works now.",
      code: "class Solution { public: bool check(int n) { return true; } };",
      coverage: emptyCoverage(),
      execution: null,
      nextHint: null,
    });
    expect(reply.message.toLowerCase()).not.toMatch(/accepted|all tests pass|correct answer/);
  });

  it("normalizes speech for comparison", () => {
    expect(normalizeSpeech("  The  the   MOD 10!! ")).toBe("the the mod 10");
  });
});
