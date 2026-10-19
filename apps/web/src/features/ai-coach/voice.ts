export type VoicePhase = "idle" | "listening" | "transcript" | "processing" | "speaking" | "error";

export type VoiceState = {
  phase: VoicePhase;
  transcript: string;
  interim: string;
  error: string;
  supported: boolean;
};

export type VoiceEvent =
  | { type: "checked"; supported: boolean }
  | { type: "start" }
  | { type: "partial"; text: string }
  | { type: "final-chunk"; text: string }
  | { type: "finish"; text: string }
  | { type: "cancel" }
  | { type: "submit" }
  | { type: "speech-ended" }
  | { type: "stop-speaking" }
  | { type: "replay" }
  | { type: "fail"; message: string };

export const initialVoiceState: VoiceState = {
  phase: "idle",
  transcript: "",
  interim: "",
  error: "",
  supported: true,
};

export const VOICE_LABEL: Record<VoicePhase, string> = {
  idle: "Idle",
  listening: "Listening",
  transcript: "Transcript ready",
  processing: "Processing",
  speaking: "Interviewer speaking",
  error: "Error",
};

export function reduceVoice(state: VoiceState, event: VoiceEvent): VoiceState {
  switch (event.type) {
    case "checked":
      return { ...state, supported: event.supported };
    case "start":
      if (!state.supported) {
        return { ...state, phase: "error", error: "This browser does not support speech recognition." };
      }
      if (state.phase === "listening" || state.phase === "processing") return state;
      return { ...state, phase: "listening", transcript: "", interim: "", error: "" };
    case "partial":
      if (state.phase !== "listening") return state;
      return { ...state, interim: event.text };
    case "final-chunk":
      if (state.phase !== "listening") return state;
      return { ...state, transcript: `${state.transcript} ${event.text}`.trim(), interim: "" };
    case "finish": {
      if (state.phase !== "listening") return state;
      const text = event.text.trim();
      if (!text) return { ...state, phase: "error", transcript: "", interim: "", error: "No speech was captured." };
      return { ...state, phase: "transcript", transcript: text, interim: "", error: "" };
    }
    case "cancel":
      if (state.phase === "processing") return state;
      return { ...initialVoiceState, supported: state.supported };
    case "submit":
      if (state.phase === "processing") return state;
      if (!`${state.transcript} ${state.interim}`.trim()) {
        return { ...state, phase: "error", error: "No speech was captured." };
      }
      return { ...state, phase: "processing", error: "" };
    case "replay":
      if (state.phase === "listening" || state.phase === "processing") return state;
      return { ...state, phase: "speaking", error: "" };
    case "speech-ended":
    case "stop-speaking":
      if (state.phase !== "speaking") return state;
      return { ...state, phase: "idle" };
    case "fail":
      return { ...state, phase: "error", error: event.message };
    default:
      return state;
  }
}

export function visibleVoicePhase(phase: VoicePhase, submitting: boolean): VoicePhase {
  return submitting ? "processing" : phase;
}
