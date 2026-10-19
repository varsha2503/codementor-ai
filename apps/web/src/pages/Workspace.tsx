import { useCallback, useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { api } from "../api/client";
import { CodeEditor } from "../features/editor/CodeEditor";
import { LANGUAGE_OPTIONS, monacoLanguage, type SubmissionLanguage } from "../features/editor/languages";
import { CoachPanel } from "../features/ai-coach/CoachPanel";
import { HintDrawer } from "../features/problems/HintDrawer";
import { ProblemStatement } from "../features/problems/ProblemStatement";
import { TestResults } from "../features/submissions/TestResults";
import { pollSubmission } from "../hooks/useSubmission";
import { difficultyTone, topicLabel } from "../labels";
import type { Analysis, Hint, InterviewStage, InterviewTurn, Problem, SubmissionView } from "../types/models";

type Pane = "problem" | "code" | "results" | "coach";

export function Workspace() {
  const { slug = "" } = useParams();
  const navigate = useNavigate();
  const [problem, setProblem] = useState<Problem | null>(null);
  const [code, setCode] = useState("");
  const [language, setLanguage] = useState<SubmissionLanguage>("cpp");
  const [supportedLanguages, setSupportedLanguages] = useState<SubmissionLanguage[]>(["cpp"]);
  const [starterCode, setStarterCode] = useState("");
  const [hints, setHints] = useState<Hint[]>([]);
  const [turns, setTurns] = useState<InterviewTurn[]>([]);
  const [stage, setStage] = useState<InterviewStage>("introduction");
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [result, setResult] = useState<SubmissionView | null>(null);
  const [customInput, setCustomInput] = useState('{\n  \n}');
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");
  const [pane, setPane] = useState<Pane>("code");
  const [showProblem, setShowProblem] = useState(true);
  const [showCoach, setShowCoach] = useState(true);
  const [showResults, setShowResults] = useState(true);
  const [hintsOpen, setHintsOpen] = useState(false);
  const [layout, setLayout] = useState(readLayout);
  const layoutRef = useRef(layout);
  layoutRef.current = layout;
  const wide = useWideScreen();

  function applyLayout(next: Layout) {
    layoutRef.current = next;
    setLayout(next);
    localStorage.setItem("codementor.layout", JSON.stringify(next));
  }

  function nudge(side: "problem" | "coach", delta: number) {
    setLayout((current) => {
      const next = moveLayout(current, side, delta);
      layoutRef.current = next;
      localStorage.setItem("codementor.layout", JSON.stringify(next));
      return next;
    });
  }

  const loadProblem = useCallback(
    async (lang: SubmissionLanguage, cancelRef?: { cancel: boolean }) => {
      const body = await api<{ problem: Problem }>(`/api/v1/problems/${slug}?language=${lang}`);
      if (cancelRef?.cancel) return;
      setProblem(body.problem);
      setStarterCode(body.problem.starterCode);
      const supported = (body.problem.supportedLanguages?.length ? body.problem.supportedLanguages : ["cpp"]) as SubmissionLanguage[];
      setSupportedLanguages(supported);
      const active = supported.includes(lang) ? lang : "cpp";
      setLanguage(active);
      localStorage.setItem(`codementor.lang.${body.problem.slug}`, active);
      const saved = localStorage.getItem(`codementor.code.${body.problem.slug}.${active}`);
      setCode(saved || body.problem.starterCode);
    },
    [slug],
  );

  useEffect(() => {
    const gate = { cancel: false };
    const pref = (localStorage.getItem(`codementor.lang.${slug}`) || "cpp") as SubmissionLanguage;
    loadProblem(pref, gate).catch((err) => setError(err instanceof Error ? err.message : "Problem missing."));
    api<{ hints: Hint[] }>(`/api/v1/ai/hints?problemId=${slug}`)
      .then((body) => {
        if (!cancel) setHints(body.hints);
      })
      .catch(() => undefined);
    api<{ turns: InterviewTurn[]; stage: InterviewStage }>(`/api/v1/ai/interview?problemId=${slug}`)
      .then((body) => {
        if (cancel) return;
        setTurns(body.turns);
        setStage(body.stage);
      })
      .catch(() => undefined);
    return () => {
      gate.cancel = true;
    };
  }, [loadProblem, slug]);

  useEffect(() => {
    if (problem) localStorage.setItem(`codementor.code.${problem.slug}.${language}`, code);
  }, [code, language, problem]);

  async function changeLanguage(next: SubmissionLanguage) {
    if (!problem || next === language) return;
    localStorage.setItem(`codementor.code.${problem.slug}.${language}`, code);
    setError("");
    try {
      await loadProblem(next);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not switch language.");
    }
  }

  const run = useCallback(
    async (kind: "run" | "submit") => {
      if (!problem) return;
      setBusy(kind);
      setError("");
      try {
        let custom: Record<string, unknown> | undefined;
        if (kind === "run" && customInput.trim()) {
          const parsed = JSON.parse(customInput) as unknown;
          if (parsed && typeof parsed === "object" && !Array.isArray(parsed) && Object.keys(parsed).length > 0) {
            custom = parsed as Record<string, unknown>;
          }
        }
        const queued = await api<{ submissionId: string }>(kind === "run" ? "/api/v1/submissions/run" : "/api/v1/submissions", {
          method: "POST",
          body: JSON.stringify({ problemId: problem.id, language, code, customInput: custom }),
        });
        if (kind === "submit") {
          navigate(`/submissions/${queued.submissionId}`);
          return;
        }
        setShowResults(true);
        setPane("results");
        const finished = await pollSubmission(queued.submissionId);
        setResult(finished);
      } catch (err) {
        setError(err instanceof Error ? err.message : "The run did not start.");
      } finally {
        setBusy("");
      }
    },
    [code, customInput, language, navigate, problem],
  );

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (!(event.metaKey || event.ctrlKey) || event.key !== "Enter") return;
      event.preventDefault();
      void run(event.shiftKey ? "submit" : "run");
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [run]);

  async function sendInterview(message: string, clientTurnId: string): Promise<string | null> {
    if (!problem) return null;
    setBusy("interview");
    setError("");
    try {
      const body = await api<{ turns: InterviewTurn[]; stage: InterviewStage; revealedHint: Hint | null }>("/api/v1/ai/interview", {
        method: "POST",
        body: JSON.stringify({ problemId: problem.id, code, message, attemptId: result?.id, clientTurnId }),
      });
      setTurns(body.turns);
      setStage(body.stage);
      if (body.revealedHint) {
        setHints((current) =>
          current.some((item) => item.hintLevel === body.revealedHint?.hintLevel) ? current : [...current, body.revealedHint as Hint],
        );
        setHintsOpen(true);
      }
      setShowCoach(true);
      setPane("coach");
      const spoken = [...body.turns].reverse().find((turn) => turn.role === "interviewer");
      return spoken ? [spoken.message, spoken.followUp].filter(Boolean).join(" ") : "";
    } catch (err) {
      setError(err instanceof Error ? err.message : "The interviewer did not reply.");
      return null;
    } finally {
      setBusy("");
    }
  }

  async function resetInterview() {
    if (!problem) return;
    setBusy("interview");
    setError("");
    try {
      const body = await api<{ turns: InterviewTurn[]; stage: InterviewStage }>("/api/v1/ai/interview", {
        method: "POST",
        body: JSON.stringify({ problemId: problem.id, code, reset: true }),
      });
      setTurns(body.turns);
      setStage(body.stage);
    } catch (err) {
      setError(err instanceof Error ? err.message : "The interview did not reset.");
    } finally {
      setBusy("");
    }
  }

  async function askHint() {
    if (!problem) return;
    setBusy("hint");
    setError("");
    try {
      const hint = await api<Hint>("/api/v1/ai/hints", {
        method: "POST",
        body: JSON.stringify({ problemId: problem.id, code, attemptId: result?.id }),
      });
      setHints((current) => (current.some((item) => item.hintLevel === hint.hintLevel && item.hint === hint.hint) ? current : [...current, hint]));
      setHintsOpen(true);
      setShowProblem(true);
      setPane("problem");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Hint failed.");
    } finally {
      setBusy("");
    }
  }

  async function askAnalysis() {
    if (!problem) return;
    setBusy("analyze");
    setError("");
    try {
      const body = await api<{ analysis: Analysis }>("/api/v1/ai/analyze", {
        method: "POST",
        body: JSON.stringify({ problemId: problem.id, code, attemptId: result?.id }),
      });
      setAnalysis(body.analysis);
      setShowCoach(true);
      setPane("coach");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Analysis failed.");
    } finally {
      setBusy("");
    }
  }

  if (!problem) return <p className="p-8 text-muted">{error || "Opening the problem…"}</p>;

  return (
    <div className="flex h-[calc(100vh-57px)] flex-col">
      <div className="flex flex-wrap items-center gap-2 border-b border-line px-3 py-2">
        <Link className="text-sm text-muted hover:text-ink" to="/">Library</Link>
        <h1 className="font-medium">{problem.title}</h1>
        {problem.catalog && (
          <a className="rounded-full border border-ai/40 px-3 py-1 text-sm text-ai" href={problem.catalog.canonicalUrl} target="_blank" rel="noreferrer">
            Open original problem
          </a>
        )}
        <span className={`text-xs ${difficultyTone(problem.difficulty)}`}>{problem.difficulty}</span>
        <span className="text-xs text-muted">{problem.topics.map(topicLabel).join(" · ")}</span>
        <div className="ml-auto flex flex-wrap items-center gap-2">
          <select
            className="rounded-full border border-line bg-panel px-3 py-1 text-sm"
            value={language}
            aria-label="Language"
            onChange={(event) => void changeLanguage(event.target.value as SubmissionLanguage)}
          >
            {LANGUAGE_OPTIONS.filter((item) => supportedLanguages.includes(item.value)).map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
          <button className="rounded-full border border-line px-3 py-1 text-sm" type="button" onClick={() => setCode(starterCode)}>
            Reset
          </button>
          <button className="rounded-full border border-line px-3 py-1 text-sm disabled:opacity-50" disabled={!!busy} type="button" onClick={() => void run("run")}>
            {busy === "run" ? "Running…" : "Run"}
          </button>
          <button className="rounded-full bg-accent px-3 py-1 text-sm font-semibold text-black disabled:opacity-50" disabled={!!busy} type="button" onClick={() => void run("submit")}>
            Submit
          </button>
        </div>
      </div>
      <div className="flex gap-2 border-b border-line px-3 py-2 md:hidden">
        {(["problem", "code", "results", "coach"] as Pane[]).map((item) => (
          <button key={item} className={`rounded-full px-3 py-1 text-sm capitalize ${pane === item ? "bg-accent text-black" : "text-muted"}`} onClick={() => setPane(item)} type="button">
            {item === "coach" ? "AI" : item}
          </button>
        ))}
      </div>
      {error && <p className="border-b border-line px-3 py-2 text-sm text-bad">{error}</p>}
      <div className="flex min-h-0 flex-1">
        <section
          className={`${pane === "problem" ? "flex" : "hidden"} min-h-0 w-full flex-col overflow-auto md:flex md:w-auto ${showProblem ? "" : "md:hidden"}`}
          style={wide && showProblem ? { flex: `0 0 ${layout.problem}%` } : undefined}
        >
          {problem.catalog && (
            <p className="border-b border-line px-4 py-3 text-sm text-muted">
              {problem.catalog.licenseStatus === "LOCAL_STATEMENT"
                ? "This page shows CodeMentor's own statement. The original problem text stays on the source site."
                : "The original statement is not stored here. Read it on the source site."}
            </p>
          )}
          <ProblemStatement problem={problem} />
          <HintDrawer hints={hints} open={hintsOpen} busy={busy} onToggle={() => setHintsOpen((value) => !value)} onHint={() => void askHint()} />
        </section>
        {wide && showProblem && (
          <PaneHandle
            label="Resize problem and editor"
            onBegin={() => layoutRef.current}
            onDrag={(start, delta) => applyLayout(moveLayout(start, "problem", delta))}
            onKey={(delta) => nudge("problem", delta)}
          />
        )}
        <section className={`${pane === "code" || pane === "results" ? "flex" : "hidden"} min-h-0 w-full min-w-0 flex-1 flex-col md:flex`}>
          <div className={`${pane === "code" ? "block" : "hidden"} min-h-[280px] flex-1 md:block ${showResults ? "" : ""}`}>
            <CodeEditor value={code} onChange={setCode} language={monacoLanguage(language)} />
          </div>
          <div className={`${pane === "results" ? "block" : "hidden"} max-h-[42%] min-h-40 overflow-auto border-t border-line md:block ${showResults ? "" : "md:hidden"}`}>
            <TestResults result={result} customInput={customInput} onCustomInput={setCustomInput} />
          </div>
        </section>
        {wide && showCoach && (
          <PaneHandle
            label="Resize editor and AI interviewer"
            onBegin={() => layoutRef.current}
            onDrag={(start, delta) => applyLayout(moveLayout(start, "coach", delta))}
            onKey={(delta) => nudge("coach", delta)}
          />
        )}
        <aside
          className={`${pane === "coach" ? "flex" : "hidden"} min-h-0 w-full flex-col overflow-auto md:flex md:w-auto ${showCoach ? "" : "md:hidden"}`}
          style={wide && showCoach ? { flex: `0 0 ${layout.coach}%` } : undefined}
        >
          <CoachPanel
            sessionKey={problem.slug}
            turns={turns}
            stage={stage}
            analysis={analysis}
            busy={busy}
            onSend={sendInterview}
            onReset={() => void resetInterview()}
            onAnalyze={() => void askAnalysis()}
          />
        </aside>
      </div>
      <div className="hidden items-center gap-2 border-t border-line px-3 py-1.5 text-xs text-muted md:flex">
        <span>⌘Enter runs samples. ⌘⇧Enter submits.</span>
        <button className="ml-auto" type="button" onClick={() => setShowProblem((value) => !value)}>{showProblem ? "Hide problem" : "Show problem"}</button>
        <button type="button" onClick={() => setShowResults((value) => !value)}>{showResults ? "Hide results" : "Show results"}</button>
        <button type="button" onClick={() => setShowCoach((value) => !value)}>{showCoach ? "Hide AI interviewer" : "Show AI interviewer"}</button>
      </div>
    </div>
  );
}

type Layout = { problem: number; coach: number };

function readLayout(): Layout {
  const fallback = { problem: 34, coach: 26 };
  try {
    const raw = localStorage.getItem("codementor.layout");
    if (!raw) return fallback;
    const parsed = JSON.parse(raw) as Partial<Layout>;
    if (typeof parsed.problem !== "number" || typeof parsed.coach !== "number") return fallback;
    if (parsed.problem < 18 || parsed.problem > 50 || parsed.coach < 18 || parsed.coach > 42) return fallback;
    if (100 - parsed.problem - parsed.coach < 24) return fallback;
    return { problem: parsed.problem, coach: parsed.coach };
  } catch {
    return fallback;
  }
}

function moveLayout(current: Layout, side: "problem" | "coach", delta: number): Layout {
  if (side === "problem") {
    const problem = clamp(current.problem + delta, 18, 50);
    if (100 - problem - current.coach < 24) return current;
    return { ...current, problem };
  }
  const coach = clamp(current.coach - delta, 18, 42);
  if (100 - current.problem - coach < 24) return current;
  return { ...current, coach };
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function useWideScreen() {
  const [wide, setWide] = useState(() => window.matchMedia("(min-width: 768px)").matches);
  useEffect(() => {
    const media = window.matchMedia("(min-width: 768px)");
    const onChange = () => setWide(media.matches);
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, []);
  return wide;
}

function PaneHandle({
  label,
  onBegin,
  onDrag,
  onKey,
}: {
  label: string;
  onBegin: () => Layout;
  onDrag: (start: Layout, delta: number) => void;
  onKey: (delta: number) => void;
}) {
  function down(event: ReactPointerEvent<HTMLButtonElement>) {
    event.preventDefault();
    const width = event.currentTarget.parentElement?.getBoundingClientRect().width ?? 1;
    const origin = event.clientX;
    const start = onBegin();
    const target = event.currentTarget;
    target.setPointerCapture(event.pointerId);
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
    function move(next: PointerEvent) {
      onDrag(start, ((next.clientX - origin) / width) * 100);
    }
    function up() {
      target.removeEventListener("pointermove", move);
      target.removeEventListener("pointerup", up);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    }
    target.addEventListener("pointermove", move);
    target.addEventListener("pointerup", up);
  }

  return (
    <button
      type="button"
      aria-label={label}
      className="hidden w-1.5 shrink-0 cursor-col-resize border-0 bg-line/70 p-0 hover:bg-ai focus:bg-ai md:block"
      onPointerDown={down}
      onKeyDown={(event) => {
        if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
        event.preventDefault();
        onKey(event.key === "ArrowRight" ? 2 : -2);
      }}
    />
  );
}
