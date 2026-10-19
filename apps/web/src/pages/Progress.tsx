import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api/client";
import { difficultyTone, topicLabel } from "../labels";

type Analytics = {
  solved: number;
  topics: { topic: string; submits: number; accepted: number; accuracy: number }[];
  difficulties: { difficulty: string; attempted: number; solved: number; accuracy: number }[];
  assistance: { independent: number; assisted: number };
  hintsByProblem: { slug: string; title: string; hints: number; solved: boolean }[];
  mistakes: { category: string; label: string; count: number; topics: string[] }[];
  recentMistakes: { category: string; label: string; count: number; topics: string[] }[];
};

type Problem = { id: string; slug: string; title: string; difficulty: string; topics: string[] };

export function Progress() {
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [queue, setQueue] = useState<Problem[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([
      api<Analytics>("/api/v1/users/me/analytics"),
      api<{ problems: Problem[] }>("/api/v1/users/me/recommendations?limit=8"),
    ])
      .then(([stats, revision]) => {
        setAnalytics(stats);
        setQueue(revision.problems);
      })
      .catch((err) => setError(err instanceof Error ? err.message : "Could not load progress."));
  }, []);

  if (error) return <p className="p-8 text-bad">{error}</p>;
  if (!analytics) return <p className="p-8 text-muted">Loading progress…</p>;

  return (
    <div className="mx-auto max-w-6xl space-y-6 px-4 py-6 lg:px-6">
      <header>
        <h1 className="font-serif text-4xl">Progress</h1>
        <p className="mt-2 max-w-2xl text-muted">
          A problem counts as solved after an accepted submission. Topic bars compare accepted submissions with every judged submission. Hints are context, not a penalty.
        </p>
      </header>
      <section className="grid gap-3 md:grid-cols-3">
        {analytics.difficulties.map((item) => (
          <article key={item.difficulty} className="rounded-3xl border border-line bg-panel p-5">
            <p className={`text-sm ${difficultyTone(item.difficulty)}`}>{item.difficulty}</p>
            <p className="mt-2 font-mono text-3xl">{item.attempted ? Math.round(item.accuracy * 100) : 0}%</p>
            <p className="text-sm text-muted">{item.solved} solved of {item.attempted} attempted</p>
          </article>
        ))}
      </section>
      <section className="grid gap-4 lg:grid-cols-2">
        <article className="rounded-3xl border border-line bg-panel p-5">
          <h2 className="font-semibold">Accuracy by topic</h2>
          <ul className="mt-4 space-y-3">
            {analytics.topics.map((item) => (
              <li key={item.topic}>
                <div className="flex justify-between text-sm">
                  <span>{topicLabel(item.topic)}</span>
                  <span className="font-mono text-muted">{item.accepted}/{item.submits}</span>
                </div>
                <div className="mt-1 h-2 rounded-full bg-panel2">
                  <div className="h-2 rounded-full bg-accent" style={{ width: `${Math.round(item.accuracy * 100)}%` }} />
                </div>
              </li>
            ))}
            {analytics.topics.length === 0 && <li className="text-sm text-muted">No judged submissions yet.</li>}
          </ul>
        </article>
        <article className="rounded-3xl border border-line bg-panel p-5">
          <h2 className="font-semibold">Solved with and without hints</h2>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <div className="rounded-2xl bg-panel2 p-4">
              <p className="font-mono text-3xl">{analytics.assistance.independent}</p>
              <p className="text-sm text-muted">Independent</p>
            </div>
            <div className="rounded-2xl bg-panel2 p-4">
              <p className="font-mono text-3xl">{analytics.assistance.assisted}</p>
              <p className="text-sm text-muted">After a hint</p>
            </div>
          </div>
          <h3 className="mt-6 text-sm font-semibold">Hints used</h3>
          <ul className="mt-2 space-y-2 text-sm">
            {analytics.hintsByProblem.map((item) => (
              <li key={item.slug} className="flex justify-between gap-3">
                <Link className="hover:text-accent" to={`/problems/${item.slug}`}>{item.title}</Link>
                <span className="font-mono text-muted">{item.hints}{item.solved ? " · solved" : ""}</span>
              </li>
            ))}
            {analytics.hintsByProblem.length === 0 && <li className="text-muted">No hints yet.</li>}
          </ul>
        </article>
      </section>
      <section className="grid gap-4 lg:grid-cols-2">
        <MistakeCard title="Recurring mistakes" items={analytics.mistakes} />
        <MistakeCard title="Last 14 days" items={analytics.recentMistakes} />
      </section>
      <section>
        <h2 className="mb-3 font-serif text-2xl">Revision queue</h2>
        <div className="grid gap-3 md:grid-cols-2">
          {queue.map((problem) => (
            <Link key={problem.id} to={`/problems/${problem.slug}`} className="rounded-2xl border border-line bg-panel p-4 hover:border-accent/60">
              <div className="flex justify-between gap-3">
                <span>{problem.title}</span>
                <span className={`text-xs ${difficultyTone(problem.difficulty)}`}>{problem.difficulty}</span>
              </div>
              <p className="mt-1 text-sm text-muted">{problem.topics.map(topicLabel).join(" · ")}</p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}

function MistakeCard({ title, items }: { title: string; items: Analytics["mistakes"] }) {
  return (
    <article className="rounded-3xl border border-line bg-panel p-5">
      <h2 className="font-semibold">{title}</h2>
      <ul className="mt-4 space-y-3">
        {items.map((item) => (
          <li key={item.category} className="flex items-start justify-between gap-3 text-sm">
            <span>
              {item.label}
              <span className="mt-1 block text-xs text-muted">{item.topics.map(topicLabel).join(" · ")}</span>
            </span>
            <span className="font-mono">{item.count}</span>
          </li>
        ))}
        {items.length === 0 && <li className="text-sm text-muted">Nothing tagged in this window.</li>}
      </ul>
    </article>
  );
}
