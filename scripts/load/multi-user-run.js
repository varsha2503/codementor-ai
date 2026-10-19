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

const CODE = `class Solution {
public:
  int countDigits(int n) {
    if (n == 0) return 1;
    int c = 0;
    while (n) { c++; n /= 10; }
    return c;
  }
};`;

const TERMINAL = new Set([
  "ACCEPTED",
  "WRONG_ANSWER",
  "COMPILE_ERROR",
  "TIME_LIMIT_EXCEEDED",
  "MEMORY_LIMIT_EXCEEDED",
  "RUNTIME_ERROR",
  "INTERNAL_ERROR",
]);

export const options = {
  scenarios: {
    concurrent_runners: {
      executor: "constant-vus",
      vus: Math.min(Number(__ENV.VUS || 10), users.length),
      duration: __ENV.DURATION || "2m",
    },
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
    { headers, tags: { vu: String(__VU) } },
  );

  if (post.status === 429) {
    rateLimit429.add(1);
    sleep(5);
    return;
  }

  check(post, { "enqueue 202": (r) => r.status === 202 });
  if (post.status !== 202) {
    sleep(5);
    return;
  }
  enqueue202.add(1);

  const submissionId = post.json("submissionId");
  const started = Date.now();
  let verdict = "";
  const pollMax = Number(__ENV.POLL_MAX_SEC || 90);
  for (let i = 0; i < pollMax; i++) {
    sleep(1);
    const get = http.get(`${BASE}/api/v1/submissions/${submissionId}`, { headers });
    if (get.status !== 200) continue;
    verdict = get.json("submission.verdict") || "";
    if (TERMINAL.has(verdict)) break;
  }

  if (TERMINAL.has(verdict)) {
    queueWaitMs.add(Date.now() - started);
    runAccepted.add(verdict === "ACCEPTED");
  }

  sleep(5);
}

export function handleSummary(data) {
  const vus = Math.min(Number(__ENV.VUS || 10), users.length);
  const duration = __ENV.DURATION || "2m";
  const p95Queue = data.metrics.queue_wait_ms?.values?.["p(95)"];
  const avgQueue = data.metrics.queue_wait_ms?.values?.avg;
  const acceptedRate = data.metrics.run_accepted?.values?.rate;
  const n429 = data.metrics.rate_limit_429?.values?.count ?? 0;
  const n202 = data.metrics.enqueue_202?.values?.count ?? 0;
  const postP95 = data.metrics.http_req_duration?.values?.["p(95)"];

  console.log("\n--- Multi-user run experiment ---");
  console.log(`VUs: ${vus}, duration: ${duration}, 1 run attempt per VU every ~5s (+ poll until terminal)`);
  console.log(`Enqueue 202 count: ${n202}, Rate limit 429 count: ${n429}`);
  console.log(
    `Queue wait avg: ${avgQueue != null ? (avgQueue / 1000).toFixed(2) : "n/a"} s, p95: ${p95Queue != null ? (p95Queue / 1000).toFixed(2) : "n/a"} s`,
  );
  console.log(`ACCEPTED rate (of completed polls): ${acceptedRate != null ? (acceptedRate * 100).toFixed(1) : "n/a"}%`);
  console.log(`POST p95 latency (ms): ${postP95 != null ? postP95.toFixed(2) : "n/a"}`);
  console.log(
    `Resume line: "${vus} concurrent runners on 1 worker, queue wait p95 ~${p95Queue != null ? (p95Queue / 1000).toFixed(1) : "?"} s, ACCEPTED ~${acceptedRate != null ? (acceptedRate * 100).toFixed(0) : "?"}%, 429 events: ${n429}"`,
  );
  return {};
}
