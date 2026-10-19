import { verdictLabel, verdictTone } from "../../labels";
import type { SubmissionView } from "../../types/models";

export function TestResults({
  result,
  customInput,
  onCustomInput,
}: {
  result: SubmissionView | null;
  customInput: string;
  onCustomInput: (value: string) => void;
}) {
  return (
    <div className="space-y-3 p-3 text-sm">
      <div className="flex flex-wrap items-center gap-2">
        <h2 className="font-semibold">Console</h2>
        {result && <span className={`rounded-full border px-2 py-0.5 text-xs ${verdictTone(result.verdict)}`}>{verdictLabel(result.verdict, result.kind)}</span>}
        {result && <span className="text-xs text-muted">{result.testsPassed}/{result.testsTotal} tests{result.runtimeMs != null ? ` · ${result.runtimeMs} ms` : ""}{result.memoryKb != null ? ` · ${result.memoryKb} KB` : ""}</span>}
      </div>
      {!result && <p className="text-muted">Run the visible examples, or submit the full suite. Hidden inputs stay hidden.</p>}
      {result?.message && <p>{result.message}</p>}
      {result?.compileOutput && <pre className="overflow-auto rounded-xl bg-black/40 p-3 font-mono text-xs text-bad">{result.compileOutput}</pre>}
      <ul className="space-y-2">
        {result?.cases.map((item, index) => (
          <li key={`${item.visibility}-${index}`} className="rounded-xl border border-line p-2">
            <div className="flex justify-between gap-2 text-xs">
              <span>{item.visibility === "HIDDEN" ? `Hidden test ${index + 1}` : item.visibility === "CUSTOM" ? "Custom input" : `Sample ${index + 1}`}</span>
              <span className={verdictTone(item.status).split(" ")[0]}>{verdictLabel(item.status)}</span>
            </div>
            {item.message && <p className="mt-1 text-xs text-muted">{item.message}</p>}
            {item.visibility !== "HIDDEN" && item.input !== undefined && (
              <pre className="mt-2 overflow-auto font-mono text-xs text-muted">{JSON.stringify(item.input)}</pre>
            )}
            {item.visibility === "SAMPLE" && (
              <p className="mt-1 font-mono text-xs">expected {JSON.stringify(item.expected)} · actual {JSON.stringify(item.actual)}</p>
            )}
            {item.visibility === "CUSTOM" && item.actual !== undefined && (
              <p className="mt-1 font-mono text-xs">output {JSON.stringify(item.actual)}</p>
            )}
          </li>
        ))}
      </ul>
      <label className="block text-xs text-muted">
        Custom input JSON, same shape as the examples. It is executed, not graded.
        <textarea className="mt-1 h-24 w-full rounded-xl border border-line bg-panel2 p-2 font-mono text-xs text-ink" value={customInput} onChange={(event) => onCustomInput(event.target.value)} />
      </label>
    </div>
  );
}
