import { initialVoiceState, reduceVoice, visibleVoicePhase, type VoiceState } from "./voice";

function hear(state: VoiceState, finalText: string, partial = ""): VoiceState {
  const withFinal = reduceVoice(state, { type: "final-chunk", text: finalText });
  return partial ? reduceVoice(withFinal, { type: "partial", text: partial }) : withFinal;
}

describe("voice interview controls", () => {
  it("stays idle until the candidate starts, and does not submit a partial result", () => {
    const listening = reduceVoice(initialVoiceState, { type: "start" });
    const partial = reduceVoice(listening, { type: "partial", text: "return the indexes" });
    expect(partial.phase).toBe("listening");
    expect(partial.interim).toBe("return the indexes");
    const finished = reduceVoice(partial, { type: "finish", text: "return the indexes" });
    expect(finished.phase).toBe("transcript");
    expect(finished.phase).not.toBe("processing");
  });

  it("keeps an empty capture from becoming a turn", () => {
    const listening = reduceVoice(initialVoiceState, { type: "start" });
    const finished = reduceVoice(listening, { type: "finish", text: "   " });
    expect(finished.phase).toBe("error");
    expect(finished.error).toContain("No speech");
  });

  it("ignores a second submit while a turn is processing", () => {
    const ready = hear(reduceVoice(initialVoiceState, { type: "start" }), "I would use a hash map");
    const spoken = reduceVoice(ready, { type: "finish", text: ready.transcript });
    const first = reduceVoice(spoken, { type: "submit" });
    const second = reduceVoice(first, { type: "submit" });
    expect(first.phase).toBe("processing");
    expect(second).toEqual(first);
  });

  it("cancels recognition without storing a turn and stops speech on unmount-style cancel", () => {
    const listening = hear(reduceVoice(initialVoiceState, { type: "start" }), "hello");
    const cancelled = reduceVoice(listening, { type: "cancel" });
    expect(cancelled.phase).toBe("idle");
    expect(cancelled.transcript).toBe("");
    const speaking = reduceVoice(cancelled, { type: "replay" });
    expect(reduceVoice(speaking, { type: "stop-speaking" }).phase).toBe("idle");
  });

  it("reports an unsupported browser and shows processing while the reply is in flight", () => {
    const unsupported = reduceVoice({ ...initialVoiceState, supported: false }, { type: "start" });
    expect(unsupported.phase).toBe("error");
    expect(unsupported.error).toContain("does not support");
    expect(visibleVoicePhase("transcript", true)).toBe("processing");
    expect(visibleVoicePhase("speaking", false)).toBe("speaking");
  });
});
