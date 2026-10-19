import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api } from "../api/client";
import { CoachPanel } from "../features/ai-coach/CoachPanel";
import { CodeEditor } from "../features/editor/CodeEditor";
import { difficultyTone, topicLabel, TOPICS } from "../labels";
import type { InterviewStage, InterviewTurn } from "../types/models";

type CatalogEntry = {
  id: string;
  source: string;
  externalSlug: string;
  externalId: string | null;
  title: string;
  difficulty: "EASY" | "MEDIUM" | "HARD";
  topics: string[];
  tags: string[];
  canonicalUrl: string;
  licenseStatus: "LINK_ONLY" | "LOCAL_STATEMENT";
  permissionNote: string;
  attribution: string | null;
  localProblem: { slug: string; title: string } | null;
  statementStored: boolean;
};

export function Catalog() {
  const [entries, setEntries] = useState<CatalogEntry[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [pageSize, setPageSize] = useState(20);
  const [query, setQuery] = useState("");
  const [difficulty, setDifficulty] = useState("");
  const [topic, setTopic] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const params = new URLSearchParams();
    if (query.trim()) params.set("q", query.trim());
    if (difficulty) params.set("difficulty", difficulty);
    if (topic) params.set("topic", topic);
    params.set("page", String(page));
    params.set("limit", "20");
    let cancelled = false;
    api<{ entries: CatalogEntry[]; total: number; pageSize: number }>(`/api/v1/catalog?${params.toString()}`)
      .then((body) => {
        if (cancelled) return;
        setEntries(body.entries);
        setTotal(body.total);
        setPageSize(body.pageSize);
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : "Could not load the catalog.");
      });
    return () => {
      cancelled = true;
    };
  }, [query, difficulty, topic, page]);

  const pageCount = Math.max(1, Math.ceil(total / pageSize));

  return (
    <div className="mx-auto max-w-5xl px-4 py-6">
      <h1 className="font-serif text-3xl">Problem catalog</h1>
      <p className="mt-2 max-w-3xl text-sm text-muted">
        Titles, difficulty, tags, and links only. Original statements stay on the source site unless a CodeMentor problem is linked.
      </p>
      {error && <p className="mt-4 text-sm text-bad">{error}</p>}
      <div className="mt-4 flex flex-wrap gap-2">
        <input
          className="rounded-full border border-line bg-panel2 px-3 py-1.5 text-sm"
          placeholder="Search titles"
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setPage(1);
          }}
        />
        <select className="rounded-full border border-line bg-panel2 px-3 py-1.5 text-sm" value={difficulty} onChange={(event) => { setDifficulty(event.target.value); setPage(1); }}>
          <option value="">All levels</option>
          <option value="EASY">Easy</option>
          <option value="MEDIUM">Medium</option>
          <option value="HARD">Hard</option>
        </select>
        <select className="rounded-full border border-line bg-panel2 px-3 py-1.5 text-sm" value={topic} onChange={(event) => { setTopic(event.target.value); setPage(1); }}>
          <option value="">All topics</option>
          {TOPICS.map((item) => (
            <option key={item} value={item}>{topicLabel(item)}</option>
          ))}
        </select>
      </div>
      <ul className="mt-4 divide-y divide-line rounded-3xl border border-line bg-panel">
        {entries.map((entry) => (
          <li key={entry.id}>
            <Link className="flex items-center gap-4 px-4 py-3 hover:bg-white/5" to={`/catalog/${entry.source}/${entry.externalSlug}`}>
              <span className={`w-16 text-xs ${difficultyTone(entry.difficulty)}`}>{entry.difficulty}</span>
              <span className="flex-1">
                <span className="block">{entry.title}</span>
                <span className="text-xs text-muted">{entry.topics.map(topicLabel).join(" · ") || entry.tags.join(" · ")} · {entry.licenseStatus === "LOCAL_STATEMENT" ? "Local statement" : "Link only"}</span>
              </span>
              <span className="text-xs text-muted">{entry.source}</span>
            </Link>
          </li>
        ))}
      </ul>
      {total === 0 && <p className="mt-4 text-sm text-muted">No catalog entries yet. Import a metadata file to add titles and links.</p>}
      {total > 0 && (
        <div className="mt-3 flex items-center justify-between text-sm">
          <p className="text-muted">{total} entries</p>
          <div className="flex gap-2">
            <button className="rounded-full border border-line px-3 py-1 disabled:opacity-40" disabled={page <= 1} onClick={() => setPage((value) => value - 1)} type="button">Previous</button>
            <span className="text-muted">{page} / {pageCount}</span>
            <button className="rounded-full border border-line px-3 py-1 disabled:opacity-40" disabled={page >= pageCount} onClick={() => setPage((value) => value + 1)} type="button">Next</button>
          </div>
        </div>
      )}
    </div>
  );
}

export function CatalogSession() {
  const { source = "", slug = "" } = useParams();
  const [entry, setEntry] = useState<CatalogEntry | null>(null);
  const [turns, setTurns] = useState<InterviewTurn[]>([]);
  const [stage, setStage] = useState<InterviewStage>("introduction");
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    api<{ entry: CatalogEntry }>(`/api/v1/catalog/${source}/${slug}`)
      .then((body) => {
        if (!cancelled) setEntry(body.entry);
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : "Catalog entry missing.");
      });
    return () => {
      cancelled = true;
    };
  }, [source, slug]);

  useEffect(() => {
    if (!entry || entry.localProblem) return;
    let cancelled = false;
    api<{ turns: InterviewTurn[]; stage: InterviewStage }>(`/api/v1/catalog/${entry.source}/${entry.externalSlug}/interview`)
      .then((body) => {
        if (cancelled) return;
        setTurns(body.turns);
        setStage(body.stage);
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : "The interview did not open.");
      });
    return () => {
      cancelled = true;
    };
  }, [entry]);

  async function sendInterview(message: string, clientTurnId: string): Promise<string | null> {
    if (!entry) return null;
    setBusy("interview");
    setError("");
    try {
      const body = await api<{ turns: InterviewTurn[]; stage: InterviewStage }>(`/api/v1/catalog/${entry.source}/${entry.externalSlug}/interview`, {
        method: "POST",
        body: JSON.stringify({ message, code, clientTurnId }),
      });
      setTurns(body.turns);
      setStage(body.stage);
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
    if (!entry) return;
    setBusy("interview");
    setError("");
    try {
      const body = await api<{ turns: InterviewTurn[]; stage: InterviewStage }>(`/api/v1/catalog/${entry.source}/${entry.externalSlug}/interview`, {
        method: "POST",
        body: JSON.stringify({ reset: true }),
      });
      setTurns(body.turns);
      setStage(body.stage);
    } catch (err) {
      setError(err instanceof Error ? err.message : "The interview did not reset.");
    } finally {
      setBusy("");
    }
  }

  if (!entry) return <p className="p-8 text-muted">{error || "Opening the catalog entry…"}</p>;

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-6">
      <div className="flex flex-wrap items-center gap-3">
        <Link className="text-sm text-muted" to="/sheet">DSA sheet</Link>
        <h1 className="font-serif text-3xl">{entry.title}</h1>
        <span className={`text-xs ${difficultyTone(entry.difficulty)}`}>{entry.difficulty}</span>
      </div>
      <p className="max-w-3xl text-sm text-muted">{entry.permissionNote}</p>
      {entry.attribution && <p className="max-w-3xl text-sm text-muted">{entry.attribution}</p>}
      <div className="flex flex-wrap gap-2">
        <a className="rounded-full bg-ai px-3 py-1.5 text-sm font-semibold text-white" href={entry.canonicalUrl} target="_blank" rel="noreferrer">
          Open original problem
        </a>
        {entry.localProblem && (
          <Link className="rounded-full border border-line px-3 py-1.5 text-sm" to={`/problems/${entry.localProblem.slug}`}>
            Practice local statement
          </Link>
        )}
      </div>
      {error && <p className="text-sm text-bad">{error}</p>}
      {!entry.localProblem && (
        <div className="grid min-h-[36rem] gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(280px,360px)]">
          <section className="min-h-[24rem] overflow-hidden rounded-3xl border border-line">
            <p className="border-b border-line px-4 py-3 text-sm text-muted">
              The statement is not stored here. Read it on the source site, then tell the interviewer what it asks. Run and Submit stay off until a local problem with tests is linked.
            </p>
            <div className="h-[32rem]">
              <CodeEditor value={code} onChange={setCode} />
            </div>
          </section>
          <aside className="min-h-[36rem] overflow-hidden rounded-3xl border border-ai/30">
            <CoachPanel
              sessionKey={`${entry.source}:${entry.externalSlug}`}
              turns={turns}
              stage={stage}
              analysis={null}
              busy={busy}
              onSend={sendInterview}
              onReset={() => void resetInterview()}
              onAnalyze={() => setError("Analysis needs a local problem with tests.")}
            />
          </aside>
        </div>
      )}
    </div>
  );
}
