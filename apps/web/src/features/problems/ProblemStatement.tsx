import type { Problem } from "../../types/models";

export function ProblemStatement({ problem }: { problem: Problem }) {
  return (
    <article className="space-y-5 p-4 text-sm leading-6">
      {problem.statement.split("\n\n").map((paragraph) => (
        <p key={paragraph}>{paragraph}</p>
      ))}
      <section>
        <h2 className="font-semibold">Constraints</h2>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-muted">
          {problem.constraints.map((item) => (
            <li key={item}>{item}</li>
          ))}
          <li>Time limit {problem.timeLimitMs} ms · memory limit {Math.round(problem.memoryLimitKb / 1024)} MB</li>
          <li>Expected shape: {problem.expectedTime} time, {problem.expectedSpace} extra space</li>
        </ul>
      </section>
      <section className="space-y-3">
        <h2 className="font-semibold">Examples</h2>
        {problem.examples.map((example, index) => (
          <div key={`${example.input}-${index}`} className="rounded-2xl border border-line bg-panel2 p-3">
            <p className="font-mono text-xs text-muted">Example {index + 1}</p>
            <p className="mt-2 font-mono text-xs">Input: {example.input}</p>
            <p className="font-mono text-xs">Output: {example.output}</p>
            {example.explanation && <p className="mt-2 text-muted">{example.explanation}</p>}
          </div>
        ))}
      </section>
    </article>
  );
}
