import { useEffect, useReducer, useRef } from "react";
import { initialVoiceState, reduceVoice, type VoiceState } from "./voice";

type RecognitionCtor = new () => BrowserRecognition;

type BrowserRecognition = {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onresult: ((event: RecognitionEventLike) => void) | null;
  onerror: ((event: { error?: string }) => void) | null;
  onend: (() => void) | null;
};

type RecognitionEventLike = {
  resultIndex: number;
  results: ArrayLike<{ isFinal: boolean; 0?: { transcript?: string } }>;
};

function recognitionCtor(): RecognitionCtor | null {
  const host = window as Window & { SpeechRecognition?: RecognitionCtor; webkitSpeechRecognition?: RecognitionCtor };
  return host.SpeechRecognition ?? host.webkitSpeechRecognition ?? null;
}

export function useInterviewVoice(sessionKey: string) {
  const [state, dispatch] = useReducer(reduceVoice, initialVoiceState);
  const recognition = useRef<BrowserRecognition | null>(null);
  const latest = useRef("");
  const captured = useRef("");
  const stateRef = useRef<VoiceState>(state);
  stateRef.current = state;

  useEffect(() => {
    recognition.current?.abort();
    window.speechSynthesis?.cancel();
    latest.current = "";
    captured.current = "";
    dispatch({ type: "cancel" });
  }, [sessionKey]);

  useEffect(() => {
    dispatch({ type: "checked", supported: recognitionCtor() !== null });
    return () => {
      recognition.current?.abort();
      window.speechSynthesis?.cancel();
    };
  }, []);

  function remember(event: RecognitionEventLike) {
    let interim = "";
    for (let index = event.resultIndex; index < event.results.length; index += 1) {
      const result = event.results[index];
      const piece = result?.[0]?.transcript ?? "";
      if (result?.isFinal) {
        captured.current = `${captured.current} ${piece}`.trim();
        dispatch({ type: "final-chunk", text: piece });
      } else interim += piece;
    }
    dispatch({ type: "partial", text: interim });
    latest.current = `${captured.current} ${interim}`.trim();
  }

  function startListening() {
    if (stateRef.current.phase === "listening" || stateRef.current.phase === "processing") return;
    window.speechSynthesis?.cancel();
    captured.current = "";
    latest.current = "";
    dispatch({ type: "start" });
    const Ctor = recognitionCtor();
    if (!Ctor) return;
    const session = new Ctor();
    session.continuous = true;
    session.interimResults = true;
    session.lang = "en-US";
    session.onresult = remember;
    session.onerror = (event) => {
      if (event.error === "aborted" || event.error === "no-speech") return;
      const denied = event.error === "not-allowed" || event.error === "service-not-allowed";
      dispatch({
        type: "fail",
        message: denied ? "Microphone permission was denied." : "Speech recognition stopped.",
      });
    };
    session.onend = () => {
      recognition.current = null;
    };
    try {
      session.start();
      recognition.current = session;
    } catch {
      dispatch({ type: "fail", message: "The microphone did not start." });
    }
  }

  function doneSpeaking() {
    const text = latest.current || `${state.transcript} ${state.interim}`.trim();
    recognition.current?.stop();
    dispatch({ type: "finish", text });
  }

  function cancel() {
    recognition.current?.abort();
    latest.current = "";
    captured.current = "";
    dispatch({ type: "cancel" });
  }

  function speak(text: string) {
    if (!text.trim()) return;
    if (!window.speechSynthesis) {
      dispatch({ type: "fail", message: "This browser cannot speak replies." });
      return;
    }
    window.speechSynthesis.cancel();
    dispatch({ type: "replay" });
    const utterance = new SpeechSynthesisUtterance(text.slice(0, 1800));
    utterance.onend = () => dispatch({ type: "speech-ended" });
    utterance.onerror = () => dispatch({ type: "speech-ended" });
    window.speechSynthesis.speak(utterance);
  }

  function stopSpeaking() {
    window.speechSynthesis?.cancel();
    dispatch({ type: "stop-speaking" });
  }

  return {
    phase: state.phase,
    error: state.error,
    live: `${state.transcript} ${state.interim}`.trim(),
    finalized: state.phase === "transcript" ? state.transcript : "",
    startListening,
    doneSpeaking,
    cancel,
    speak,
    stopSpeaking,
  };
}
