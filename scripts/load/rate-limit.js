/**
 * Verifies per-user Redis rate limits (separate from global capacity).
 * Uses ONE token (first user in tokens.json or AUTH_TOKEN).
 *
 * RUN:    expect ~20 x 202 in any rolling 60s window, then 429
 * SUBMIT: expect ~10 x 202 in any rolling 60s window, then 429
 *
 * Usage:
 *   KIND=run k6 run scripts/load/rate-limit.js
 *   KIND=submit k6 run scripts/load/rate-limit.js
 */
import http from "k6/http";
import { check, sleep } from "k6";
import { Counter } from "k6/metrics";
import { SharedArray } from "k6/data";

const accepted202 = new Counter("accepted_202");
const rateLimited429 = new Counter("rate_limited_429");
const otherStatus = new Counter("other_status");

const data = new SharedArray("tokens", () => {
  try {
    return [JSON.parse(open("./tokens.json"))];
  } catch {
    return [{ users: [] }];
  }
});

const BASE = __ENV.API_BASE || data[0].apiBase || "http://localhost:4000";
const KIND = (__ENV.KIND || "run").toLowerCase();
const TOKEN = __ENV.AUTH_TOKEN || data[0].users?.[0]?.token || "";
const PROBLEM_ID = __ENV.PROBLEM_ID || "count-digits";

const CODE = `class Solution { public: int countDigits(int n) { if (n==0) return 1; int c=0; while(n){c++;n/=10;} return c; } };`;

export const options = {
  vus: 1,
  duration: __ENV.DURATION || "90s",
};

export default function () {
  if (!TOKEN) throw new Error("Set AUTH_TOKEN or run npm run load:seed-users");
  const headers = {
    Authorization: `Bearer ${TOKEN}`,
    "Content-Type": "application/json",
  };
  const path = KIND === "submit" ? "/api/v1/submissions" : "/api/v1/submissions/run";
  const res = http.post(
    `${BASE}${path}`,
    JSON.stringify({ problemId: PROBLEM_ID, language: "cpp", code: CODE }),
    { headers },
  );
  if (res.status === 202) accepted202.add(1);
  else if (res.status === 429) rateLimited429.add(1);
  else otherStatus.add(1);
  check(res, { "202 or 429": (r) => r.status === 202 || r.status === 429 });
  sleep(Number(__ENV.INTERVAL_SEC || 0.15));
}

export function handleSummary(summary) {
  const n202 = summary.metrics.accepted_202?.values?.count ?? 0;
  const n429 = summary.metrics.rate_limited_429?.values?.count ?? 0;
  const limit = KIND === "submit" ? 10 : 20;
  console.log(`\n--- Rate limit test (KIND=${KIND}) ---`);
  console.log(`Expected cap: ~${limit} accepts per 60s per user`);
  console.log(`202 accepted: ${n202}, 429 rate-limited: ${n429}`);
  console.log(
    n202 >= limit - 2 && n202 <= limit + 3 && n429 > 0
      ? `PASS: Saw ~${limit}/min enforcement (202≈${limit}, then 429s).`
      : `Review: 202=${n202}, 429=${n429} (adjust INTERVAL_SEC or DURATION if needed).`,
  );
  return {};
}
