import { stableStringify } from "@codementor/shared";
import type { GeneratedCase } from "../ai/types.js";
import { constraintError } from "./constraints.js";

export function screenCandidates(
  slug: string,
  candidates: GeneratedCase[],
  existingInputs: unknown[],
): { accepted: GeneratedCase[]; rejected: { rationale?: string; reason: string }[] } {
  const existing = new Set(existingInputs.map((input) => stableStringify(input)));
  const seen = new Set<string>();
  const accepted: GeneratedCase[] = [];
  const rejected: { rationale?: string; reason: string }[] = [];
  for (const candidate of candidates) {
    const key = stableStringify(candidate.input);
    if (seen.has(key) || existing.has(key)) {
      rejected.push({ rationale: candidate.rationale, reason: "Duplicate of an existing case." });
      continue;
    }
    const reason = constraintError(slug, candidate.input);
    if (reason) {
      rejected.push({ rationale: candidate.rationale, reason });
      continue;
    }
    seen.add(key);
    accepted.push(candidate);
  }
  return { accepted, rejected };
}
