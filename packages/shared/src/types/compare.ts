export type CompareMode = "EXACT" | "UNORDERED" | "TOPOLOGICAL";

export function stableStringify(value: unknown): string {
  if (value === null || typeof value !== "object") return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map((item) => stableStringify(item)).join(",")}]`;
  const entries = Object.entries(value as Record<string, unknown>).sort(([a], [b]) => a.localeCompare(b));
  return `{${entries.map(([key, item]) => `${JSON.stringify(key)}:${stableStringify(item)}`).join(",")}}`;
}

function normalizeUnordered(value: unknown): unknown {
  if (!Array.isArray(value)) return value;
  return [...value].sort((a, b) => stableStringify(a).localeCompare(stableStringify(b)));
}

export function outputsMatch(actual: unknown, expected: unknown, mode: CompareMode): boolean {
  if (mode === "TOPOLOGICAL") return false;
  const left = mode === "UNORDERED" ? normalizeUnordered(actual) : actual;
  const right = mode === "UNORDERED" ? normalizeUnordered(expected) : expected;
  return stableStringify(left) === stableStringify(right);
}

export function isValidTopological(order: unknown, count: number, prerequisites: number[][]): boolean {
  if (!Array.isArray(order) || !order.every((item) => Number.isInteger(item))) return false;
  const nums = order as number[];
  const graph: number[][] = Array.from({ length: count }, () => []);
  const indegree = Array.from({ length: count }, () => 0);
  for (const edge of prerequisites) {
    const course = edge[0];
    const pre = edge[1];
    if (course === undefined || pre === undefined) return false;
    if (course < 0 || pre < 0 || course >= count || pre >= count) return false;
    graph[pre]?.push(course);
    indegree[course] = (indegree[course] ?? 0) + 1;
  }

  const queue: number[] = [];
  for (let node = 0; node < count; node += 1) {
    if (indegree[node] === 0) queue.push(node);
  }
  let seen = 0;
  const remaining = [...indegree];
  while (queue.length > 0) {
    const node = queue.shift();
    if (node === undefined) break;
    seen += 1;
    for (const next of graph[node] ?? []) {
      remaining[next] = (remaining[next] ?? 0) - 1;
      if (remaining[next] === 0) queue.push(next);
    }
  }
  const cyclic = seen !== count;
  if (cyclic) return nums.length === 0;
  if (nums.length !== count) return false;

  const position = new Map<number, number>();
  for (let index = 0; index < nums.length; index += 1) {
    const node = nums[index];
    if (node === undefined || node < 0 || node >= count || position.has(node)) return false;
    position.set(node, index);
  }
  for (const edge of prerequisites) {
    const course = edge[0];
    const pre = edge[1];
    if (course === undefined || pre === undefined) return false;
    if ((position.get(pre) ?? -1) > (position.get(course) ?? -1)) return false;
  }
  return true;
}

export type CaseVisibility = "SAMPLE" | "HIDDEN" | "CUSTOM";

export type StoredCase = {
  visibility: CaseVisibility;
  status: string;
  input?: unknown;
  expected?: unknown;
  actual?: unknown;
  runtimeMs?: number | null;
  memoryKb?: number | null;
  message?: string | null;
};

export function sanitizeCase(testCase: StoredCase): StoredCase {
  if (testCase.visibility !== "HIDDEN") return testCase;
  return {
    visibility: "HIDDEN",
    status: testCase.status,
    runtimeMs: testCase.runtimeMs ?? null,
    memoryKb: testCase.memoryKb ?? null,
    message: testCase.message ?? null,
  };
}
