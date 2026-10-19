import type { Hint } from "../../types/models";

export function HintDrawer({
  hints,
  open,
  busy,
  onToggle,
  onHint,
}: {
  hints: Hint[];
  open: boolean;
  busy: string;
  onToggle: () => void;
  onHint: () => void;
}) {
  return (
    <section className="border-t border-line">
      <button className="flex w-full items-center justify-between px-4 py-3 text-left" aria-expanded={open} onClick={onToggle} type="button">
        <span className="font-semibold">Hints</span>
        <span className="text-xs text-muted">{open ? "Hide" : hints.length > 0 ? `${hints.length} ready` : "Show"}</span>
      </button>
      {open && (
        <div className="space-y-3 px-4 pb-4">
          {hints.length === 0 && <p className="text-sm text-muted">Hints stay closed until you ask for one.</p>}
          {hints.map((hint) => (
            <div key={`${hint.hintLevel}-${hint.concept}`} className="rounded-2xl border border-line bg-panel2 p-3">
              <p className="text-xs uppercase tracking-wide text-muted">Hint {hint.hintLevel} · {hint.concept}</p>
              <p className="mt-2 leading-6">{hint.hint}</p>
              <p className="mt-2 text-xs text-muted">{hint.nextStep}</p>
            </div>
          ))}
          <button className="rounded-full border border-line px-3 py-1 text-sm disabled:opacity-50" disabled={!!busy} onClick={onHint} type="button">
            {busy === "hint" ? "Thinking…" : "Next hint"}
          </button>
        </div>
      )}
    </section>
  );
}
