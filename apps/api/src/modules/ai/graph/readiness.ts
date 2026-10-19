import { Annotation, END, START, StateGraph } from "@langchain/langgraph";

const ReadinessState = Annotation.Root({
  ok: Annotation<boolean>(),
});

/** Minimal LangGraph wiring check — not used in production interview flow yet. */
export function buildReadinessProbeGraph() {
  return new StateGraph(ReadinessState)
    .addNode("probe", () => ({ ok: true }))
    .addEdge(START, "probe")
    .addEdge("probe", END)
    .compile();
}

export async function langGraphReadinessProbe(): Promise<boolean> {
  const graph = buildReadinessProbeGraph();
  const result = await graph.invoke({ ok: false });
  return result.ok === true;
}
