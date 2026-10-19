import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api } from "../api/client";
import { languageLabel } from "../features/editor/languages";
import { MISTAKE_NOTE, TERMINAL, topicLabel, verdictLabel, verdictTone } from "../labels";

type Issue = { id?: string; category: string; severity: string; confidence: string; rationale: string };
type Analysis = {
  estimatedTimeComplexity: string;
  estimatedSpaceComplexity: string;
  confidence: string;
  correctnessConcerns: string[];
  strengths: string[];
  improvements: string[];
  additionalTestSuggestions: string[];
};
type CaseResult = {
  visibility: string;
  status: string;
  input?: unknown;
  expected?: unknown;
  actual?: unknown;
  message?: string | null;
  runtimeMs?: number | null;
  memoryKb?: number | null;
};
type Submission = {
  id: string;
  kind: string;
  language: string;
  code: string;
  verdict: string;
  runtimeMs: number | null;
  memoryKb: number | null;
  testsPassed: number;
  testsTotal: number;
  message: string | null;
  compileOutput: string | null;
  cases: CaseResult[];
  issues: Issue[];
  analysis: Analysis | null;
  problem: { id: string; slug: string; title: string; difficulty: string; topics: string[]; expectedTime: string; expectedSpace: string };
};

const MISTAKE_LABELS: Record<string, string> = {
  INCORRECT_BASE_CASE: "Incorrect base case",
  OFF_BY_ONE: "Off-by-one error",
  INCORRECT_BOUNDARY_HANDLING: "Incorrect boundary handling",
  WRONG_DATA_STRUCTURE: "Wrong data structure",
  INCORRECT_DP_TRANSITION: "Incorrect DP state transition",
  MISSING_VISITED_STATE: "Missing visited-state handling",
  INTEGER_OVERFLOW: "Integer overflow risk",
  TIME_COMPLEXITY_TOO_HIGH: "Time complexity too high",
  INCORRECT_DUPLICATES: "Incorrect handling of duplicates",
};

export function Submission() {
  const { id = "" } = useParams();
  const [submission, setSubmission] = useState<Submission | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let stop = false;
    async function load() {
      try {
        const body = await api<{ submission: Submission }>(`/api/v1/submissions/${id}`);
        if (stop) return;
        setSubmission(body.submission);
        if (!TERMINAL.has(body.submission.verdict)) {
          window.setTimeout(load, 1200);
        }
      } catch (err) {
        if (!stop) setError(err instanceof Error ? err.message : "Submission missing.");
      }
    }
    void load();
    return () => {
      stop = true;
    };
  }, [id]);

  async function analyze() {
    if (!submission) return;
    setBusy(true);
    try {
      const body = await api<{ analysis: Analysis; issues: Issue[] }>("/api/v1/ai/analyze", {
        method: "POST",
        body: JSON.stringify({ problemId: submission.problem.id, code: submission.code, attemptId: submission.id }),
      });
      setSubmission({ ...submission, analysis: body.analysis, issues: body.issues });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Analysis failed.");
    } finally {
      setBusy(false);
    }
  }

  if (error) return <p className="p-8 text-bad">{error}</p>;
  if (!submission) return <p className="p-8 text-muted">Loading the attempt…</p>;
  const next = submission.verdict === "ACCEPTED" && submission.kind === "SUBMIT"
    ? "This one is solved. The progress page will move the weak topics forward."
    : submission.verdict === "ACCEPTED"
      ? "Samples passed. Submit when you want the hidden suite to count."
      : "Use the failing visible case, or ask for the next hint, before rewriting the whole approach.";

  return (
    <div className="mx-auto grid max-w-6xl gap-6 px-4 py-6 lg:grid-cols-[1.1fr_0.9fr] lg:px-6">
      <section className="space-y-4">
        <Link className="text-sm text-muted" to={`/problems/${submission.problem.slug}`}>Back to {submission.problem.title}</Link>
        <div className="rounded-3xl border border-line bg-panel p-6">
          <p className="text-sm text-muted">{submission.kind === "RUN" ? "Sample run" : "Submission"} · {languageLabel(submission.language)}</p>
          <h1 className="mt-2 font-serif text-4xl">{verdictLabel(submission.verdict, submission.kind)}</h1>
          <p className="mt-3 text-muted">{submission.message}</p>
          <dl className="mt-5 grid grid-cols-3 gap-3 text-sm">
            <div><dt className="text-muted">Tests</dt><dd className="font-mono text-xl">{submission.testsPassed}/{submission.testsTotal}</dd></div>
            <div><dt className="text-muted">Peak time</dt><dd className="font-mono text-xl">{submission.runtimeMs ?? "–"} ms</dd></div>
            <div><dt className="text-muted">Peak memory</dt><dd className="font-mono text-xl">{submission.memoryKb ?? "–"} KB</dd></div>
          </dl>
        </div>
        <ul className="space-y-2">
          {submission.cases.map((item, index) => (
            <li key={`${item.visibility}-${index}`} className="rounded-2xl border border-line p-4 text-sm">
              <div className="flex justify-between">
                <span>{item.visibility === "HIDDEN" ? "Hidden test" : item.visibility === "CUSTOM" ? "Custom input" : `Sample ${index + 1}`}</span>
                <span className={`rounded-full border px-2 py-0.5 text-xs ${verdictTone(item.status)}`}>{verdictLabel(item.status)}</span>
              </div>
              {item.message && <p className="mt-2 text-muted">{item.message}</p>}
              {item.visibility === "SAMPLE" && (
                <pre className="mt-2 overflow-auto font-mono text-xs text-muted">expected {JSON.stringify(item.expected)}{"\n"}actual {JSON.stringify(item.actual)}</pre>
              )}
            </li>
          ))}
        </ul>
        {submission.compileOutput && <pre className="overflow-auto rounded-2xl bg-black/40 p-4 font-mono text-xs text-bad">{submission.compileOutput}</pre>}
      </section>
      <aside className="space-y-4">
        <section className="rounded-3xl border border-line bg-panel p-5">
          <h2 className="font-semibold">Suggested next step</h2>
          <p className="mt-2 text-sm leading-6 text-muted">{next}</p>
          <p className="mt-3 text-xs text-muted">A published bound for this problem is {submission.problem.expectedTime} time and {submission.problem.expectedSpace} extra space. That is not a grade of this attempt.</p>
          <button className="mt-4 rounded-full bg-accent px-4 py-2 text-sm font-semibold text-black disabled:opacity-50" disabled={busy || !TERMINAL.has(submission.verdict)} onClick={() => void analyze()} type="button">
            {busy ? "Reading the attempt…" : "Analyze complexity and code"}
          </button>
        </section>
        {submission.analysis && (
          <section className="rounded-3xl border border-line bg-panel p-5 text-sm">
            <p className="text-xs uppercase tracking-wide text-muted">{submission.analysis.confidence} confidence</p>
            <p className="mt-2 font-mono text-xs">{submission.analysis.estimatedTimeComplexity} · {submission.analysis.estimatedSpaceComplexity}</p>
            <List title="Correctness" items={submission.analysis.correctnessConcerns} />
            <List title="Strengths" items={submission.analysis.strengths} />
            <List title="Improvements" items={submission.analysis.improvements} />
            <List title="Tests to add" items={submission.analysis.additionalTestSuggestions} />
          </section>
        )}
        <section className="rounded-3xl border border-line bg-panel p-5">
          <h2 className="font-semibold">Tagged issues</h2>
          <ul className="mt-3 space-y-3 text-sm">
            {submission.issues.map((issue) => (
              <li key={issue.id ?? issue.category}>
                <p>{MISTAKE_LABELS[issue.category] ?? issue.category}</p>
                <p className="text-xs text-muted">{issue.rationale} · {issue.confidence} confidence</p>
              </li>
            ))}
            {submission.issues.length === 0 && <li className="text-sm text-muted">{MISTAKE_NOTE}</li>}
          </ul>
          <p className="mt-4 text-xs text-muted">{submission.problem.topics.map(topicLabel).join(" · ")}</p>
        </section>
      </aside>
    </div>
  );
}

function List({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="mt-3">
      <p className="text-xs uppercase tracking-wide text-muted">{title}</p>
      <ul className="mt-1 list-disc pl-4">
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </div>
  );
}
