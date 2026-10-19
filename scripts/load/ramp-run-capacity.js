/**
 * Ramp concurrent runners (unique tokens cycled) — measures queue wait vs VUs on 1 worker.
 * "Max runners" = highest VU count where queue p95 and ACCEPTED rate stay acceptable.
 *
 * Seed: COUNT=50 npm run load:seed-users
 */
import http from "k6/http";
import { check, sleep } from "k6";
import { SharedArray } from "k6/data";
import { Counter, Rate, Trend } from "k6/metrics";

const queueWaitMs = new Trend("queue_wait_ms", true);
const runAccepted = new Rate("run_accepted");
const rateLimit429 = new Counter("rate_limit_429");
const enqueue202 = new Counter("enqueue_202");

const data = new SharedArray("tokens", () => [JSON.parse(open("./tokens.json"))]);
const users = data[0].users;
const BASE = __ENV.API_BASE || data[0].apiBase || "http://localhost:4000";
const PROBLEM_ID = __ENV.PROBLEM_ID || "count-digits";
const CODE = `class Solution { public: int countDigits(int n) { if (n==0) return 1; int c=0; while(n){c++;n/=10;} return c; } };`;

const TERMINAL = new Set([
  "ACCEPTED",
  "WRONG_ANSWER",
  "COMPILE_ERROR",
  "TIME_LIMIT_EXCEEDED",
  "MEMORY_LIMIT_EXCEEDED",
  "RUNTIME_ERROR",
  "INTERNAL_ERROR",
]);

const peak = Number(__ENV.PEAK_VUS || 20);

function buildStages(peakVus) {
  const steps = [2, 5, 8, 10, 12, 15, 20, 25, 30].filter((n) => n <= peakVus);
  if (peakVus > 0 && !steps.includes(peakVus)) steps.push(peakVus);
  steps.sort((a, b) => a - b);
  const stages = [];
  for (const target of steps) {
    stages.push({ duration: "30s", target });
    stages.push({ duration: "90s", target });
  }
  stages.push({ duration: "20s", target: 0 });
  return stages;
}

export const options = {
  scenarios: {
    ramp_runners: {
      executor: "ramping-vus",
      startVUs: 0,
      stages: buildStages(peak),
      gracefulRampDown: "30s",
    },
  },
  thresholds: {
    run_accepted: [{ threshold: "rate>0.90", abortOnFail: false }],
    queue_wait_ms: [{ threshold: "p(95)<15000", abortOnFail: false }],
  },
};

export default function () {
  const user = users[(__VU - 1) % users.length];
  const headers = {
    Authorization: `Bearer ${user.token}`,
    "Content-Type": "application/json",
  };
  const post = http.post(
    `${BASE}/api/v1/submissions/run`,
    JSON.stringify({ problemId: PROBLEM_ID, language: "cpp", code: CODE }),
    { headers },
  );
  if (post.status === 429) {
    rateLimit429.add(1);
    sleep(5);
    return;
  }
  if (post.status !== 202) {
    sleep(5);
    return;
  }
  enqueue202.add(1);
  const id = post.json("submissionId");
  const t0 = Date.now();
  for (let i = 0; i < Number(__ENV.POLL_MAX_SEC || 120); i++) {
    sleep(1);
    const get = http.get(`${BASE}/api/v1/submissions/${id}`, { headers });
    if (get.status !== 200) continue;
    const v = get.json("submission.verdict") || "";
    if (TERMINAL.has(v)) {
      queueWaitMs.add(Date.now() - t0);
      runAccepted.add(v === "ACCEPTED");
      break;
    }
  }
  sleep(5);
}

export function handleSummary(data) {
  const peakVus = data.metrics.vus_max?.values?.max ?? peak;
  const p95q = data.metrics.queue_wait_ms?.values?.["p(95)"];
  const acc = data.metrics.run_accepted?.values?.rate ?? 0;
  const n429 = data.metrics.rate_limit_429?.values?.count ?? 0;
  const n202 = data.metrics.enqueue_202?.values?.count ?? 0;

  const ok = acc >= 0.9 && (p95q ?? 0) < 15000;
  console.log("\n--- Ramp run capacity (1 worker, concurrency 1) ---");
  console.log(`Peak VUs: ${peakVus}, enqueued: ${n202}, 429: ${n429}`);
  console.log(`Queue wait p95: ${p95q != null ? (p95q / 1000).toFixed(1) : "?"} s, ACCEPTED rate: ${(acc * 100).toFixed(1)}%`);
  console.log(
    ok
      ? `RESULT: OK at peak ${peakVus} — try PEAK_VUS=${peakVus + 5} or accept ~${peakVus} active runners (queue grows with VUs).`
      : `RESULT: Degraded at peak ${peakVus} — max practical concurrent runners ≈ lower PEAK_VUS (bisect).`,
  );
  console.log(
    `Note: Only 1 sandbox runs at a time; "max" here means how many users can share the queue before wait/SLO breaks, not parallel Docker jobs.`,
  );
  return {};
}
