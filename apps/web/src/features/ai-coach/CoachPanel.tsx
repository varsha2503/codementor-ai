import { useEffect, useRef, useState, type FormEvent } from "react";
import type { Analysis, InterviewStage, InterviewTurn } from "../../types/models";
import { useInterviewVoice } from "./useInterviewVoice";
import { visibleVoicePhase, VOICE_LABEL } from "./voice";

const STAGE_LABEL: Record<InterviewStage, string> = {
  introduction: "Introduction",
  understanding: "Understanding",
  approach: "Name an approach",
  coding: "Write and run",
  complexity: "Defend the cost",
  feedback: "Feedback",
};

export function CoachPanel({
  sessionKey,
  turns,
  stage,
  analysis,
  busy,
  onSend,
  onReset,
  onAnalyze,
}: {
  sessionKey: string;
  turns: InterviewTurn[];
  stage: InterviewStage;
  analysis: Analysis | null;
  busy: string;
  onSend: (message: string, clientTurnId: string) => Promise<string | null>;
  onReset: () => void;
  onAnalyze: () => void;
}) {
  const [draft, setDraft] = useState("");
  const turnId = useRef<string | null>(null);
  const voice = useInterviewVoice(sessionKey);
  const waiting = busy === "interview";
  const phase = visibleVoicePhase(voice.phase, waiting);
  const listening = voice.phase === "listening";
  const lastInterviewer = [...turns].reverse().find((turn) => turn.role === "interviewer");

  useEffect(() => {
    if (voice.phase === "transcript" && voice.finalized) setDraft(voice.finalized);
  }, [voice.finalized, voice.phase]);

  async function submit(event?: FormEvent) {
    event?.preventDefault();
    const message = (listening ? "" : draft).trim();
    if (!message || waiting || voice.phase === "processing") return;
    const id = turnId.current ?? crypto.randomUUID();
    turnId.current = id;
    const spoken = await onSend(message, id);
    if (spoken === null) return;
    setDraft("");
    turnId.current = null;
    if (spoken) voice.speak(spoken);
  }

  function replay() {
    if (!lastInterviewer || listening || waiting) return;
    voice.speak([lastInterviewer.message, lastInterviewer.followUp].filter(Boolean).join(" "));
  }

  return (
    <div className="flex h-full min-h-[28rem] flex-col text-sm">
      <div className="border-b border-ai/30 bg-ai/10 p-4">
        <div className="flex items-start gap-3">
          <InterviewerAvatar />
          <div className="min-w-0">
            <h2 className="font-semibold text-ai">AI Interviewer</h2>
            <p className="mt-0.5 text-xs text-muted">
              {STAGE_LABEL[stage]}. Each reply sends your current editor code. The interviewer discusses your logic; Run/Submit still decides correctness.
            </p>
          </div>
        </div>
        {(phase !== "idle" || voice.error) && (
          <p className="mt-2 text-xs text-muted" aria-live="polite">
            {VOICE_LABEL[phase]}
            {voice.error ? `. ${voice.error}` : ""}
          </p>
        )}
      </div>
      <div className="min-h-0 flex-1 space-y-3 overflow-auto p-4">
        {turns.map((turn, index) => (
          <article
            key={`${turn.role}-${index}-${turn.message.slice(0, 24)}`}
            className={`rounded-2xl border p-3 ${turn.role === "interviewer" ? "border-ai/40 bg-ai/10" : "ml-6 border-accent/40 bg-accent/10"}`}
          >
            <p className={`text-xs uppercase tracking-wide ${turn.role === "interviewer" ? "text-ai" : "text-muted"}`}>{turn.role === "interviewer" ? "AI Interviewer" : "You"}</p>
            <p className="mt-2 leading-6">{turn.message}</p>
            {turn.followUp && <p className="mt-2 text-xs text-muted">{turn.followUp}</p>}
          </article>
        ))}
        {turns.length === 0 && <p className="text-muted">The interviewer is joining…</p>}
      </div>
      <form className="space-y-2 border-t border-line p-3" onSubmit={(event) => void submit(event)}>
        <label className="sr-only" htmlFor="interview-reply">Reply to the interviewer</label>
        <textarea
          id="interview-reply"
          className="h-20 w-full resize-none rounded-2xl border border-line bg-panel2 px-3 py-2 outline-none"
          placeholder="Restate, explain your plan, or describe the run."
          readOnly={listening}
          value={listening ? voice.live : draft}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter" && (event.metaKey || event.ctrlKey)) {
              event.preventDefault();
              event.currentTarget.form?.requestSubmit();
            }
          }}
        />
        <div className="flex flex-wrap gap-2">
          <button className="rounded-full border border-line px-3 py-1 disabled:opacity-50" disabled={listening || waiting || voice.phase === "processing"} onClick={voice.startListening} type="button">
            Start Listening
          </button>
          <button className="rounded-full border border-line px-3 py-1 disabled:opacity-50" disabled={!listening} onClick={voice.doneSpeaking} type="button">
            Done Speaking
          </button>
          <button className="rounded-full border border-line px-3 py-1 disabled:opacity-50" disabled={!listening && voice.phase !== "transcript" && voice.phase !== "error"} onClick={voice.cancel} type="button">
            Cancel
          </button>
          <button className="rounded-full bg-accent px-3 py-1 font-semibold text-black disabled:opacity-50" disabled={waiting || listening || draft.trim().length === 0} type="submit">
            {waiting ? "Processing…" : "Send"}
          </button>
          <button className="rounded-full border border-line px-3 py-1 disabled:opacity-50" disabled={!lastInterviewer || listening || waiting || voice.phase === "speaking"} onClick={replay} type="button">
            Replay
          </button>
          <button className="rounded-full border border-line px-3 py-1 disabled:opacity-50" disabled={voice.phase !== "speaking"} onClick={voice.stopSpeaking} type="button">
            Stop Speaking
          </button>
          <button
            className="rounded-full border border-line px-3 py-1 disabled:opacity-50"
            disabled={!!busy}
            onClick={() => {
              voice.stopSpeaking();
              onReset();
            }}
            type="button"
          >
            Reset interview
          </button>
        </div>
        <p className="text-xs text-muted">Done Speaking keeps the text so you can correct it before Send. Speech recognition uses this browser's speech service, so it is not fully local and differs by browser.</p>
      </form>
      <div className="space-y-3 border-t border-line p-4">
        <button className="rounded-full border border-line px-3 py-1 disabled:opacity-50" disabled={!!busy} onClick={onAnalyze} type="button">
          {busy === "analyze" ? "Reading…" : "Analyze"}
        </button>
        {analysis && (
          <section className="rounded-2xl border border-line p-3">
            <p className="text-xs uppercase tracking-wide text-muted">Estimate · {analysis.confidence} confidence</p>
            <p className="mt-2 font-mono text-xs">{analysis.estimatedTimeComplexity} time · {analysis.estimatedSpaceComplexity} space</p>
            <Bullet title="Correctness" items={analysis.correctnessConcerns} />
            <Bullet title="Strengths" items={analysis.strengths} />
            <Bullet title="Improvements" items={analysis.improvements} />
            <Bullet title="Tests to add" items={analysis.additionalTestSuggestions} />
          </section>
        )}
      </div>
    </div>
  );
}

function BlueSparkle({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
      <path d="M12 2.4 13.7 8 19.4 9.6 13.7 11.2 12 16.8 10.3 11.2 4.6 9.6 10.3 8 12 2.4Z" />
    </svg>
  );
}

function InterviewerAvatar() {
  return (
    <span
      className="relative inline-flex shrink-0 rounded-2xl bg-gradient-to-br from-sky-200 via-ai to-blue-700 p-[3px] shadow-[0_0_24px_rgba(59,130,246,0.55)]"
      aria-hidden="true"
    >
      <BlueSparkle className="pointer-events-none absolute -left-1.5 top-1/2 z-10 h-3.5 w-3.5 -translate-y-1/2 text-sky-100 drop-shadow-[0_0_10px_rgba(59,130,246,1)]" />
      <BlueSparkle className="pointer-events-none absolute -right-1.5 top-1/2 z-10 h-3.5 w-3.5 -translate-y-1/2 text-sky-100 drop-shadow-[0_0_10px_rgba(59,130,246,1)]" />
      <BlueSparkle className="pointer-events-none absolute -top-1.5 left-1/2 z-10 h-4 w-4 -translate-x-1/2 text-white drop-shadow-[0_0_12px_rgba(96,165,250,1)]" />
      <BlueSparkle className="pointer-events-none absolute -bottom-1.5 left-1/2 z-10 h-3 w-3 -translate-x-1/2 text-sky-200 drop-shadow-[0_0_10px_rgba(59,130,246,0.95)]" />
      <BlueSparkle className="pointer-events-none absolute -right-0.5 -top-0.5 z-10 h-3 w-3 text-sky-50 drop-shadow-[0_0_8px_rgba(59,130,246,1)]" />
      <BlueSparkle className="pointer-events-none absolute -bottom-0.5 -left-0.5 z-10 h-2.5 w-2.5 text-sky-200 drop-shadow-[0_0_8px_rgba(59,130,246,0.9)]" />
      <span className="relative overflow-hidden rounded-[13px] ring-2 ring-ai/50 ring-offset-1 ring-offset-ai/20">
        <img
          alt=""
          className="block h-[3.75rem] w-[3.75rem] object-cover object-[50%_20%]"
          src="/ai-interviewer-brand.png"
        />
      </span>
    </span>
  );
}

function Bullet({ title, items }: { title: string; items: string[] }) {
  if (items.length === 0) return null;
  return (
    <div className="mt-3">
      <p className="text-xs uppercase tracking-wide text-muted">{title}</p>
      <ul className="mt-1 list-disc space-y-1 pl-4">
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </div>
  );
}
