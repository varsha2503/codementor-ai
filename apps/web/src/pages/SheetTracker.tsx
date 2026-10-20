import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api/client";

type SheetItem = {
  id: string;
  title: string;
  topic: string;
  subtopic: string;
  tufDifficulty: string | null;
  difficultyLabel: "Easy" | "Medium" | "Hard" | null;
  localSlug: string | null;
  leetcodeUrl: string | null;
  tufUrl: string | null;
  status: "solved" | "attempted" | "todo";
};

type SheetSubtopic = {
  name: string;
  solved: number;
  attempted: number;
  practicable: number;
  total: number;
  items: SheetItem[];
};

type SheetTopic = {
  step: number;
  name: string;
  solved: number;
  attempted: number;
  practicable: number;
  total: number;
  subtopics: SheetSubtopic[];
};

type SheetPayload = {
  title: string;
  summary: { solved: number; attempted: number; practicable: number; total: number };
  topics: SheetTopic[];
};

type StatusFilter = "all" | SheetItem["status"];

const STATUS_LABEL: Record<SheetItem["status"], string> = {
  solved: "Solved",
  attempted: "In progress",
  todo: "Not started",
};

export function SheetTracker() {
  const [sheet, setSheet] = useState<SheetPayload | null>(null);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<StatusFilter>("all");
  const [inAppOnly, setInAppOnly] = useState(true);
  const [openTopics, setOpenTopics] = useState<Set<string>>(new Set());
  const [openSubtopics, setOpenSubtopics] = useState<Set<string>>(new Set());

  useEffect(() => {
    api<SheetPayload>("/api/v1/sheet")
      .then((body) => {
        setSheet(body);
        const first = body.topics[0];
        if (first) {
          setOpenTopics(new Set([first.name]));
          const sub = first.subtopics[0];
          if (sub) setOpenSubtopics(new Set([`${first.name}::${sub.name}`]));
        }
      })
      .catch((err) => setError(err instanceof Error ? err.message : "Could not load the sheet."));
  }, []);

  const filteredTopics = useMemo(() => {
    if (!sheet) return [];
    const q = query.trim().toLowerCase();
    return sheet.topics
      .map((topic) => {
        const subtopics = topic.subtopics
          .map((subtopic) => {
            const items = subtopic.items.filter((item) => {
              if (inAppOnly && !item.localSlug) return false;
              if (status !== "all" && item.status !== status) return false;
              if (!q) return true;
              return (
                item.title.toLowerCase().includes(q) ||
                topic.name.toLowerCase().includes(q) ||
                subtopic.name.toLowerCase().includes(q)
              );
            });
            return { ...subtopic, items };
          })
          .filter((subtopic) => subtopic.items.length > 0);
        return { ...topic, subtopics };
      })
      .filter((topic) => topic.subtopics.length > 0);
  }, [inAppOnly, query, sheet, status]);

  const byDifficulty = useMemo(
    () => (sheet ? difficultyRollup(sheet, inAppOnly) : { Easy: { total: 0, solved: 0 }, Medium: { total: 0, solved: 0 }, Hard: { total: 0, solved: 0 } }),
    [inAppOnly, sheet],
  );

  if (error) return <p className="p-8 text-bad">{error}</p>;
  if (!sheet) return <p className="p-8 text-muted">Loading your sheet…</p>;

  const pct = sheet.summary.practicable === 0 ? 0 : Math.round((sheet.summary.solved / sheet.summary.practicable) * 100);

  return (
    <div className="mx-auto max-w-5xl space-y-6 px-4 py-6 lg:px-6">
      <header className="rounded-3xl border border-line bg-panel p-6">
        <div>
          <p className="text-sm text-muted">Question tracker</p>
          <h1 className="font-serif text-3xl">{sheet.title}</h1>
          <p className="mt-2 max-w-2xl text-sm text-muted">Topics → subtopics → questions.</p>
        </div>
        <div className="mt-5 flex flex-wrap items-center gap-4 text-sm">
          <span className="font-mono text-lg">
            {sheet.summary.solved} / {sheet.summary.practicable} solved · {pct}%
          </span>
          <div className="h-2 min-w-[12rem] flex-1 overflow-hidden rounded-full bg-panel2">
            <div className="h-full rounded-full bg-good" style={{ width: `${pct}%` }} />
          </div>
        </div>
        <div className="mt-4 grid gap-2 sm:grid-cols-3">
          {(["Easy", "Medium", "Hard"] as const).map((label) => {
            const row = byDifficulty[label];
            const rowPct = row.total === 0 ? 0 : Math.round((row.solved / row.total) * 100);
            return (
              <div key={label} className="rounded-2xl border border-line bg-panel2/60 px-3 py-2">
                <p className={`text-xs font-semibold uppercase tracking-wide ${difficultyClass(label)}`}>{label}</p>
                <p className="mt-1 font-mono text-lg">{row.solved} / {row.total}</p>
                <p className="text-xs text-muted">{rowPct}% solved</p>
              </div>
            );
          })}
        </div>
      </header>

      <div className="flex flex-wrap gap-2">
        <input
          className="min-w-[12rem] flex-1 rounded-full border border-line bg-panel2 px-4 py-2 text-sm"
          placeholder="Search topic, subtopic, or question…"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
        <button
          className={`rounded-full px-3 py-1.5 text-sm ${inAppOnly ? "bg-accent text-black" : "border border-line text-muted"}`}
          onClick={() => setInAppOnly((value) => !value)}
          type="button"
        >
          {inAppOnly ? "In app only" : "Full sheet"}
        </button>
        {(["all", "todo", "attempted", "solved"] as const).map((item) => (
          <button
            key={item}
            className={`rounded-full px-3 py-1.5 text-sm ${status === item ? "bg-panel2 ring-1 ring-line" : "border border-line text-muted"}`}
            onClick={() => setStatus(item)}
            type="button"
          >
            {item === "all" ? "All" : STATUS_LABEL[item]}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {filteredTopics.map((topic) => {
          const topicOpen = openTopics.has(topic.name);
          return (
            <section key={topic.name} className="overflow-hidden rounded-2xl border border-accent/25 bg-panel shadow-sm">
              <button
                className="flex w-full items-center gap-3 border-l-4 border-accent bg-panel2/30 px-4 py-4 text-left"
                onClick={() =>
                  setOpenTopics((prev) => {
                    const next = new Set(prev);
                    if (next.has(topic.name)) next.delete(topic.name);
                    else next.add(topic.name);
                    return next;
                  })
                }
                type="button"
              >
                <span className="font-serif text-lg font-semibold leading-snug">
                  Step {topic.step}: {topic.name}
                </span>
                <span className="rounded-full bg-panel px-2 py-0.5 font-mono text-xs text-muted">
                  {topic.solved} / {topic.practicable || topic.total}
                  {topic.practicable ? ` · ${Math.round((topic.solved / topic.practicable) * 100)}%` : ""}
                </span>
                <span className="ml-auto text-muted">{topicOpen ? "▾" : "▸"}</span>
              </button>

              {topicOpen && (
                <div className="space-y-2 border-t border-line/60 bg-panel2/20 px-3 py-3">
                  {topic.subtopics.map((subtopic, subIndex) => {
                    const key = `${topic.name}::${subtopic.name}`;
                    const subOpen = openSubtopics.has(key);
                    const subTotal = subtopic.practicable || subtopic.total;
                    const subPct = subTotal === 0 ? 0 : Math.round((subtopic.solved / subTotal) * 100);
                    return (
                      <div key={key} className="overflow-hidden rounded-xl border border-line/80 bg-panel">
                        <button
                          className="flex w-full items-center gap-3 px-3 py-2.5 text-left text-sm"
                          onClick={() =>
                            setOpenSubtopics((prev) => {
                              const next = new Set(prev);
                              if (next.has(key)) next.delete(key);
                              else next.add(key);
                              return next;
                            })
                          }
                          type="button"
                        >
                          <span className="min-w-0 flex-1 font-medium text-muted">
                            <span className="mr-2 font-mono text-[10px] uppercase tracking-wider text-accent/90">Lec {subIndex + 1}</span>
                            <span className="text-ink">{subtopic.name}</span>
                          </span>
                          <span className="shrink-0 font-mono text-xs text-muted">
                            {subtopic.solved}/{subTotal} · {subPct}%
                          </span>
                          <span className="shrink-0 text-muted">{subOpen ? "▾" : "▸"}</span>
                        </button>

                        {subOpen && (
                          <ul className="divide-y divide-line border-t border-line bg-panel">
                            {subtopic.items.map((item) => (
                              <li key={item.id} className="flex flex-wrap items-center gap-2 px-3 py-2.5 text-sm">
                                <StatusDot status={item.status} />
                                <span className="min-w-0 flex-1 font-medium">{item.title}</span>
                                {item.difficultyLabel && (
                                  <span className={`text-xs font-medium ${difficultyClass(item.difficultyLabel)}`}>{item.difficultyLabel}</span>
                                )}
                                {item.leetcodeUrl && (
                                  <a
                                    className="rounded border border-line px-1.5 py-0.5 text-[10px] font-bold text-muted hover:text-ink"
                                    href={item.leetcodeUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                    title="LeetCode"
                                  >
                                    LC
                                  </a>
                                )}
                                {item.localSlug ? (
                                  <Link className="rounded-full bg-accent px-3 py-1 text-xs font-semibold text-black" to={`/problems/${item.localSlug}`}>
                                    Practice
                                  </Link>
                                ) : item.tufUrl ? (
                                  <a className="rounded-full border border-line px-3 py-1 text-xs text-muted" href={item.tufUrl} target="_blank" rel="noreferrer">
                                    TUF
                                  </a>
                                ) : null}
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </section>
          );
        })}
        {filteredTopics.length === 0 && <p className="text-sm text-muted">No questions match this filter.</p>}
      </div>
    </div>
  );
}

function difficultyRollup(sheet: SheetPayload, inAppOnly: boolean) {
  const rows = {
    Easy: { total: 0, solved: 0 },
    Medium: { total: 0, solved: 0 },
    Hard: { total: 0, solved: 0 },
  };
  for (const topic of sheet.topics) {
    for (const subtopic of topic.subtopics) {
      for (const item of subtopic.items) {
        if (inAppOnly && !item.localSlug) continue;
        if (!item.difficultyLabel) continue;
        rows[item.difficultyLabel].total += 1;
        if (item.status === "solved") rows[item.difficultyLabel].solved += 1;
      }
    }
  }
  return rows;
}

function difficultyClass(label: "Easy" | "Medium" | "Hard") {
  if (label === "Easy") return "text-good";
  if (label === "Hard") return "text-bad";
  return "text-warn";
}

function StatusDot({ status }: { status: SheetItem["status"] }) {
  const tone = status === "solved" ? "bg-good" : status === "attempted" ? "bg-warn" : "ring-1 ring-line bg-panel2";
  return <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${tone}`} title={STATUS_LABEL[status]} />;
}
