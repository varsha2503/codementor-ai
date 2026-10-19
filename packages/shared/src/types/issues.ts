import { isMistakeCategory, type MistakeCategory } from "../constants/taxonomy.js";

export type Severity = "low" | "medium" | "high";

export type IssueDraft = {
  category: MistakeCategory;
  severity: Severity;
  confidence: Severity;
  rationale: string;
};

const VERDICT_ISSUES: Record<string, IssueDraft | undefined> = {
  TIME_LIMIT_EXCEEDED: {
    category: "TIME_COMPLEXITY_TOO_HIGH",
    severity: "high",
    confidence: "high",
    rationale: "A test exceeded the time limit. Measured time is not a Big-O proof, but the limit was hit.",
  },
};

export function inferIssues(input: {
  verdict: string;
  code: string;
  topics: string[];
  stderr?: string;
}): IssueDraft[] {
  const issues: IssueDraft[] = [];
  const seen = new Set<string>();
  const push = (issue: IssueDraft) => {
    if (seen.has(issue.category)) return;
    seen.add(issue.category);
    issues.push(issue);
  };

  const fromVerdict = VERDICT_ISSUES[input.verdict];
  if (fromVerdict) push(fromVerdict);

  const stderr = input.stderr ?? "";
  if (/overflow|signed integer/i.test(stderr)) {
    push({
      category: "INTEGER_OVERFLOW",
      severity: "high",
      confidence: "high",
      rationale: "The runtime reported an integer overflow.",
    });
  }

  const graphTopic = input.topics.includes("graphs");
  const wa = input.verdict === "WRONG_ANSWER" || input.verdict === "RUNTIME_ERROR";
  if (graphTopic && wa && !/visited|seen|color|indegree|inDegree/.test(input.code)) {
    push({
      category: "MISSING_VISITED_STATE",
      severity: "medium",
      confidence: "low",
      rationale: "This graph solution does not mention a visited set, color, or indegree tracker.",
    });
  }

  if (input.topics.includes("dynamic-programming") && input.verdict === "WRONG_ANSWER") {
    if (!/dp|memo|prev1|prev2|cache/.test(input.code)) {
      push({
        category: "INCORRECT_DP_TRANSITION",
        severity: "medium",
        confidence: "low",
        rationale: "The solution does not show a table or memo that would record overlapping subproblems.",
      });
    }
  }

  if (input.topics.includes("binary-search") && input.verdict === "WRONG_ANSWER" && /while\s*\(/.test(input.code)) {
    if (/mid\s*\+\s*1|mid\s*-\s*1/.test(input.code) === false) {
      push({
        category: "OFF_BY_ONE",
        severity: "medium",
        confidence: "low",
        rationale: "The binary search loop never moves the boundary past mid, which often skips or repeats the boundary.",
      });
    }
  }

  return issues;
}

export function acceptClassification(raw: {
  category: string;
  evidence: string;
  confidence: Severity;
}): IssueDraft | null {
  if (!isMistakeCategory(raw.category)) return null;
  return {
    category: raw.category,
    severity: raw.confidence,
    confidence: raw.confidence,
    rationale: raw.evidence,
  };
}
