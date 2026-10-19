import { topicLabel } from "../../labels";

export type TopicStat = { topic: string; submits: number; accepted: number; accuracy: number };

export function TopicRecord({
  title,
  items,
  empty,
}: {
  title: string;
  items: TopicStat[];
  empty: string;
}) {
  return (
    <div className="mt-4">
      <h3 className="text-xs uppercase tracking-wide text-muted">{title}</h3>
      {items.length === 0 ? (
        <p className="mt-2 text-sm text-muted">{empty}</p>
      ) : (
        <ul className="mt-2 space-y-2">
          {items.map((item) => (
            <li key={item.topic}>
              <div className="flex justify-between text-sm">
                <span>{topicLabel(item.topic)}</span>
                <span className="font-mono text-muted">{Math.round(item.accuracy * 100)}%</span>
              </div>
              <div className="mt-1 h-1.5 rounded-full bg-panel2">
                <div className="h-1.5 rounded-full bg-accent" style={{ width: `${Math.round(item.accuracy * 100)}%` }} />
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
