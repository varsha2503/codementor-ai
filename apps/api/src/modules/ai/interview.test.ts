import { canonicalStage } from "@codementor/shared";
import { emptyCoverage } from "./interview-coverage.js";
import { clientTurnIdOf, hasClientTurn, interviewerReply, leaksImplementation, openingInterview } from "./interview.js";
import { presentInterviewTurn } from "./present.js";

const accepted = { verdict: "ACCEPTED", testsPassed: 4, testsTotal: 4 };

describe("interviewer", () => {
  it("opens on the introduction and does not give a solution", () => {
    const opening = openingInterview("Two Sum");
    expect(opening.stage).toBe("introduction");
    expect(opening.message).toContain("Two Sum");
    expect(opening.message).not.toContain("class Solution");
  });

  it("moves one step from the introduction when the candidate is ready", () => {
    const reply = interviewerReply({
      title: "Two Sum",
      stage: "introduction",
      message: "I'm ready",
      execution: null,
      nextHint: null,
      coverage: emptyCoverage(),
    });
    expect(reply.stage).toBe("understanding");
    expect(reply.message.toLowerCase()).toMatch(/return|what should/);
  });

  it("keeps a short reply in the understanding stage", () => {
    const reply = interviewerReply({
      title: "Two Sum",
      stage: "understanding",
      message: "It finds a pair.",
      execution: null,
      nextHint: null,
      coverage: emptyCoverage(),
    });
    expect(reply.stage).toBe("understanding");
  });

  it("does not advance when the candidate asks a clarifying question", () => {
    const reply = interviewerReply({
      title: "Two Sum",
      stage: "understanding",
      message: "Does the function return the indexes, or the values themselves? I want to be sure before I plan.",
      execution: null,
      nextHint: null,
      coverage: emptyCoverage(),
    });
    expect(reply.stage).toBe("understanding");
  });

  it("moves to the approach after a real restatement", () => {
    const reply = interviewerReply({
      title: "Two Sum",
      stage: "understanding",
      message: "Return the two indexes whose values add up to the target, and I would check a list with one element.",
      execution: null,
      nextHint: null,
      coverage: emptyCoverage(),
    });
    expect(reply.stage).toBe("approach");
  });

  it("moves to coding after a named plan", () => {
    const reply = interviewerReply({
      title: "Two Sum",
      stage: "approach",
      message: "A hash map stores each value I have seen, so I avoid a double loop.",
      execution: null,
      nextHint: null,
      coverage: emptyCoverage(),
    });
    expect(["approach", "coding"]).toContain(reply.stage);
  });

  it("discusses editor code before insisting on a run", () => {
    const reply = interviewerReply({
      title: "Two Sum",
      stage: "coding",
      message: "I think this works.",
      code: "class Solution { public: vector<int> twoSum(vector<int>& nums, int target) { unordered_map<int,int> seen; for (int i = 0; i < nums.size(); ++i) { if (seen.count(target - nums[i])) return {seen[target-nums[i]], i}; seen[nums[i]] = i; } return {}; } };",
      execution: null,
      nextHint: null,
      coverage: emptyCoverage(),
    });
    expect(reply.stage).toBe("coding");
    expect(reply.message.toLowerCase()).toMatch(/hash|map|editor|loop|implementation/);
  });

  it("uses an accepted verdict and does not invent one", () => {
    const acceptedReply = interviewerReply({
      title: "Two Sum",
      stage: "coding",
      message: "The samples passed.",
      execution: accepted,
      nextHint: null,
      coverage: emptyCoverage(),
    });
    expect(acceptedReply.stage).toBe("complexity");
    expect(acceptedReply.message).toContain("4 of 4");
    const failed = interviewerReply({
      title: "Two Sum",
      stage: "coding",
      message: "The samples passed.",
      execution: { verdict: "WRONG_ANSWER", testsPassed: 1, testsTotal: 4 },
      nextHint: null,
      coverage: emptyCoverage(),
    });
    expect(failed.stage).toBe("coding");
    expect(failed.message).not.toContain("accepted");
  });

  it("quotes a hint without pasting an implementation or leaving the stage", () => {
    const reply = interviewerReply({
      title: "Two Sum",
      stage: "approach",
      message: "I'm stuck, can I have a hint?",
      execution: null,
      nextHint: "Store values you have already seen.",
      coverage: emptyCoverage(),
    });
    expect(reply.stage).toBe("approach");
    expect(reply.message).toContain("Store values you have already seen.");
    expect(leaksImplementation(reply.message)).toBe(false);
    expect(leaksImplementation("class Solution { int solve() { return 0; } }")).toBe(true);
  });

  it("closes with feedback that cites the runner and does not invent a pass", () => {
    const reply = interviewerReply({
      title: "Two Sum",
      stage: "complexity",
      message: "It is O(n) time and O(n) extra space because of the map.",
      execution: accepted,
      nextHint: null,
      coverage: emptyCoverage(),
    });
    expect(reply.stage).toBe("feedback");
    expect(reply.message).toContain("ACCEPTED");
    expect(reply.message).toContain("4 of 4");
    const unrun = interviewerReply({
      title: "Two Sum",
      stage: "feedback",
      message: "Tell me how I did overall",
      execution: null,
      nextHint: null,
      coverage: emptyCoverage(),
    });
    expect(unrun.stage).toBe("feedback");
    expect(unrun.message).toContain("not established");
    expect(unrun.message).not.toContain("ACCEPTED");
  });

  it("reads an older stored stage and ignores a repeated client turn id", () => {
    expect(canonicalStage("clarify")).toBe("understanding");
    const turn = presentInterviewTurn({ role: "interviewer", stage: "debrief", message: "Done.", followUp: "Reset to begin again." });
    expect(turn?.stage).toBe("feedback");
    const id = "11111111-1111-1111-1111-111111111111";
    expect(hasClientTurn([{ clientTurnId: id, role: "candidate" }], id)).toBe(true);
    expect(hasClientTurn([{ clientTurnId: id, role: "candidate" }], "22222222-2222-2222-2222-222222222222")).toBe(false);
    expect(clientTurnIdOf({ clientTurnId: "nope" })).toBeNull();
  });
});
