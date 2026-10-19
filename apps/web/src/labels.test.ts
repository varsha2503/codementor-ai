import { TERMINAL, difficultyTone, topicLabel, verdictLabel, verdictTone } from "./labels";

describe("labels", () => {
  it("maps known topics and falls back to the raw slug", () => {
    expect(topicLabel("arrays")).toBe("Arrays");
    expect(topicLabel("custom-topic")).toBe("custom-topic");
  });

  it("labels run accepts differently from submits", () => {
    expect(verdictLabel("ACCEPTED", "RUN")).toBe("Samples passed");
    expect(verdictLabel("ACCEPTED", "SUBMIT")).toBe("Accepted");
  });

  it("assigns tone classes by verdict and difficulty", () => {
    expect(verdictTone("ACCEPTED")).toContain("text-good");
    expect(verdictTone("WRONG_ANSWER")).toContain("text-bad");
    expect(difficultyTone("EASY")).toBe("text-good");
    expect(difficultyTone("HARD")).toBe("text-bad");
  });

  it("tracks terminal verdicts", () => {
    expect(TERMINAL.has("ACCEPTED")).toBe(true);
    expect(TERMINAL.has("RUNNING")).toBe(false);
  });
});
