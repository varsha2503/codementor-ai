import http from "k6/http";
import { check, sleep } from "k6";
import { SharedArray } from "k6/data";

const data = new SharedArray("tokens", () => [JSON.parse(open("./tokens.json"))]);
const users = data[0].users;
const BASE = __ENV.API_BASE || data[0].apiBase || "http://localhost:4000";

export const options = {
  scenarios: {
    concurrent_readers: {
      executor: "constant-vus",
      vus: Math.min(Number(__ENV.VUS || 10), users.length),
      duration: __ENV.DURATION || "2m",
    },
  },
  thresholds: {
    http_req_failed: ["rate<0.02"],
    http_req_duration: ["p(95)<2000"],
    checks: ["rate>0.99"],
  },
};

export default function () {
  const user = users[(__VU - 1) % users.length];
  const res = http.get(`${BASE}/api/v1/problems?page=1&limit=20`, {
    headers: { Authorization: `Bearer ${user.token}` },
    tags: { vu: String(__VU) },
  });
  check(res, {
    "status 200": (r) => r.status === 200,
    "has problems key": (r) => r.json("problems") !== undefined,
  });
  sleep(0.3);
}

export function handleSummary(data) {
  const vus = Math.min(Number(__ENV.VUS || 10), users.length);
  const duration = __ENV.DURATION || "2m";
  const p95 = data.metrics.http_req_duration?.values?.["p(95)"];
  const failRate = data.metrics.http_req_failed?.values?.rate;
  const rps = data.metrics.http_reqs?.values?.rate;
  console.log("\n--- Multi-user read experiment ---");
  console.log(`VUs: ${vus}, duration: ${duration}`);
  console.log(`p95 latency (ms): ${p95 != null ? p95.toFixed(2) : "n/a"}`);
  console.log(`http_req_failed rate: ${failRate != null ? (failRate * 100).toFixed(2) : "n/a"}%`);
  console.log(`throughput: ${rps != null ? rps.toFixed(1) : "n/a"} req/s`);
  console.log(
    `Resume line: "${vus} concurrent read users, p95 ~${p95 != null ? Math.round(p95) : "?"} ms, error rate ~${failRate != null ? (failRate * 100).toFixed(1) : "?"}%, ~${rps != null ? Math.round(rps) : "?"} req/s"`,
  );
  return {};
}
