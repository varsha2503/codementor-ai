import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api/client";
import { useAuth } from "../auth";
import { TopicRecord } from "../features/analytics/TopicRecord";
import { difficultyTone, topicLabel, verdictLabel, verdictTone } from "../labels";

type Problem = {
  id: string;
  slug: string;
  title: string;
  difficulty: "EASY" | "MEDIUM" | "HARD";
  topics: string[];
};

type Analytics = {
  solved: number;
  totalSubmits: number;
  streak: number;
  topics: { topic: string; submits: number; accepted: number; accuracy: number }[];
  mistakes: { category: string; label: string; count: number; topics: string[] }[];
  recentMistakes: { category: string; label: string; count: number; topics: string[] }[];
};

type AttemptRow = {
  id: string;
  kind: string;
  verdict: string;
  testsPassed: number;
  testsTotal: number;
  createdAt: string;
  problem: { slug: string; title: string; difficulty: string };
};

export function Dashboard() {
  const { user, refresh } = useAuth();
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [recommended, setRecommended] = useState<Problem[]>([]);
  const [attempts, setAttempts] = useState<AttemptRow[]>([]);
  const [name, setName] = useState(user?.displayName ?? "");
  const [error, setError] = useState("");

  useEffect(() => {
    setName(user?.displayName ?? "");
  }, [user?.displayName]);

  useEffect(() => {
    Promise.all([
      api<Analytics>("/api/v1/users/me/analytics"),
      api<{ problems: Problem[] }>("/api/v1/users/me/recommendations?limit=4"),
      api<{ attempts: AttemptRow[] }>("/api/v1/users/me/attempts?limit=8"),
    ])
      .then(([stats, picks, history]) => {
        setAnalytics(stats);
        setRecommended(picks.problems);
        setAttempts(history.attempts);
      })
      .catch((err) => setError(err instanceof Error ? err.message : "Could not load your desk."));
  }, []);

  async function saveName() {
    await api("/api/v1/users/me", { method: "PATCH", body: JSON.stringify({ displayName: name }) });
    await refresh();
  }

  const practiced = (analytics?.topics ?? []).filter((item) => item.submits > 0);
  const weak = practiced.filter((item) => item.accuracy < 0.8).slice(0, 4);
  const focusMistakes = (analytics?.recentMistakes ?? []).slice(0, 3);

  return (
    <div className="mx-auto max-w-5xl space-y-8 px-4 py-6 lg:px-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm text-muted">Welcome back</p>
          <h1 className="font-serif text-4xl">{user?.displayName}</h1>
          <p className="mt-2 text-sm text-muted">Pick up where you left off — no full problem library here.</p>
        </div>
        <Link className="rounded-full bg-accent px-4 py-2 text-sm font-semibold text-black" to="/sheet">
          Open DSA sheet
        </Link>
      </header>

      {error && <p className="text-sm text-bad">{error}</p>}

      <section className="grid grid-cols-3 gap-3">
        <Stat label="Solved" value={analytics?.solved ?? 0} />
        <Stat label="Submits" value={analytics?.totalSubmits ?? 0} />
        <Stat label="Streak" value={analytics?.streak ?? 0} suffix="d" />
      </section>

      <section className="rounded-3xl border border-line bg-panel p-5">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="font-serif text-2xl">Recent attempts</h2>
          <Link className="text-sm text-accent" to="/progress">
            All progress
          </Link>
        </div>
        <div className="space-y-2">
          {attempts.map((attempt) => (
            <Link
              key={attempt.id}
              to={`/submissions/${attempt.id}`}
              className="flex flex-wrap items-center gap-3 rounded-2xl border border-line px-4 py-3 hover:border-accent/40"
            >
              <span className={`rounded-full border px-2 py-0.5 text-xs ${verdictTone(attempt.verdict)}`}>
                {verdictLabel(attempt.verdict, attempt.kind)}
              </span>
              <span className="min-w-0 flex-1 font-medium">{attempt.problem.title}</span>
              <span className="text-xs text-muted">
                {new Date(attempt.createdAt).toLocaleDateString()} · {attempt.kind === "RUN" ? "Run" : "Submit"} · {attempt.testsPassed}/
                {attempt.testsTotal}
              </span>
            </Link>
          ))}
          {attempts.length === 0 && (
            <p className="text-sm text-muted">
              No attempts yet.{" "}
              <Link className="text-accent" to="/sheet">
                Start from the sheet
              </Link>
              .
            </p>
          )}
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <article className="rounded-3xl border border-line bg-panel p-5">
          <h2 className="font-serif text-xl">Work on next</h2>
          <p className="mt-1 text-sm text-muted">Recommended problems from your weakest topics.</p>
          <div className="mt-4 space-y-2">
            {recommended.map((problem) => (
              <Link key={problem.id} to={`/problems/${problem.slug}`} className="block rounded-2xl border border-line px-4 py-3 hover:border-accent/50">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-medium">{problem.title}</span>
                  <span className={`text-xs ${difficultyTone(problem.difficulty)}`}>{problem.difficulty}</span>
                </div>
                <p className="mt-1 text-xs text-muted">{problem.topics.map(topicLabel).join(" · ")}</p>
              </Link>
            ))}
            {recommended.length === 0 && <p className="text-sm text-muted">Recommendations appear after a few submits.</p>}
          </div>
        </article>

        <article className="space-y-4">
          <div className="rounded-3xl border border-line bg-panel p-5">
            <h2 className="font-semibold">Topics to strengthen</h2>
            <TopicRecord title="Weak areas" items={weak} empty="Submit a few problems and weak topics show up here." />
          </div>
          {focusMistakes.length > 0 && (
            <div className="rounded-3xl border border-line bg-panel p-5">
              <h2 className="font-semibold">Recent mistake patterns</h2>
              <ul className="mt-3 space-y-2 text-sm">
                {focusMistakes.map((item) => (
                  <li key={item.category} className="flex justify-between gap-3">
                    <span>
                      {item.label}
                      <span className="mt-0.5 block text-xs text-muted">{item.topics.map(topicLabel).join(" · ")}</span>
                    </span>
                    <span className="font-mono text-muted">{item.count}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </article>
      </section>

      <section className="rounded-3xl border border-line bg-panel p-5">
        <h2 className="text-sm font-semibold text-muted">Display name</h2>
        <div className="mt-3 flex flex-wrap gap-2">
          <input
            className="min-w-[12rem] flex-1 rounded-xl border border-line bg-panel2 px-3 py-2 text-sm"
            value={name}
            onChange={(event) => setName(event.target.value)}
          />
          <button className="rounded-full bg-accent px-4 py-2 text-sm font-semibold text-black" onClick={() => void saveName()} type="button">
            Save
          </button>
        </div>
      </section>
    </div>
  );
}

function Stat({ label, value, suffix = "" }: { label: string; value: number; suffix?: string }) {
  return (
    <div className="rounded-2xl border border-line bg-panel px-4 py-3">
      <p className="text-xs uppercase tracking-wide text-muted">{label}</p>
      <p className="font-mono text-2xl">
        {value}
        {suffix}
      </p>
    </div>
  );
}
