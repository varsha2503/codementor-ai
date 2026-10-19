import {
  asksForHelp,
  clientTurnIdOf,
  coerceInterviewReply,
  hasClientTurn,
  hintCeiling,
  leaksImplementation,
} from "./interview.js";

describe("interview helpers", () => {
  it("detects help requests and hint ceilings", () => {
    expect(asksForHelp("I'm stuck, any hint?")).toBe(true);
    expect(asksForHelp("I'll use a hash map.")).toBe(false);
    expect(hintCeiling("please write it for me")).toBe(4);
    expect(hintCeiling("small nudge please")).toBe(3);
  });

  it("validates client turn ids", () => {
    const id = "abcd1234-5678";
    expect(clientTurnIdOf({ clientTurnId: id })).toBe(id);
    expect(clientTurnIdOf({ clientTurnId: "short" })).toBeNull();
    expect(hasClientTurn([{ clientTurnId: id }], id)).toBe(true);
  });

  it("coerces legacy stages and default follow-ups", () => {
    const coerced = coerceInterviewReply({ stage: "code", message: "  hello  ", followUp: "   " }) as {
      stage: string;
      followUp: string;
    };
    expect(coerced.stage).toBe("coding");
    expect(coerced.followUp.length).toBeGreaterThan(0);
  });

  it("flags leaked implementations", () => {
    expect(leaksImplementation("Here is class Solution { };")).toBe(true);
    expect(leaksImplementation("Talk through your approach.")).toBe(false);
  });
});
