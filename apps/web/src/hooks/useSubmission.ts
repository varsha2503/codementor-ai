import { api } from "../api/client";
import { TERMINAL } from "../labels";
import type { SubmissionView } from "../types/models";

export async function pollSubmission(id: string): Promise<SubmissionView> {
  for (let attempt = 0; attempt < 80; attempt += 1) {
    const body = await api<{ submission: SubmissionView }>(`/api/v1/submissions/${id}`);
    if (TERMINAL.has(body.submission.verdict)) return body.submission;
    await new Promise((resolve) => setTimeout(resolve, 1200));
  }
  throw new Error("The run is still queued. Check it from recent attempts.");
}
