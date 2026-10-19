/**
 * Ramp concurrent readers until thresholds fail → estimate max browsing VUs.
 * Seed enough users first: COUNT=100 npm run load:seed-users
 *
 * VUs cycle across tokens (if VUs > users, multiple VUs share an account — OK for API stress).
 */
import http from "k6/http";
import { check, sleep } from "k6";
import { SharedArray } from "k6/data";

const data = new SharedArray("tokens", () => [JSON.parse(open("./tokens.json"))]);
const users = data[0].users;
const BASE = __ENV.API_BASE || data[0].apiBase || "http://localhost:4000";

const peak = Number(__ENV.PEAK_VUS || 50);

function buildStages(peakVus) {
  const steps = [5, 10, 15, 20, 25, 30, 40, 50, 75, 100].filter((n) => n <= peakVus);
  if (!steps.includes(peakVus) && peakVus > 0) steps.push(peakVus);
  steps.sort((a, b) => a - b);
  const stages = [];
  for (const target of steps) {
    stages.push({ duration: "20s", target });
    stages.push({ duration: "40s", target });
  }
  stages.push({ duration: "20s", target: 0 });
  return stages;
}

export const options = {
  scenarios: {
    ramp_readers: {
      executor: "ramping-vus",
      startVUs: 0,
      stages: buildStages(peak),
      gracefulRampDown: "20s",
    },
  },
  thresholds: {
    http_req_failed: [{ threshold: "rate<0.02", abortOnFail: false }],
    http_req_duration: [{ threshold: "p(95)<2000", abortOnFail: false }],
    checks: [{ threshold: "rate>0.99", abortOnFail: false }],
  },
};

export default function () {
  const user = users[(__VU - 1) % users.length];
  const res = http.get(`${BASE}/api/v1/problems?page=1&limit=20`, {
    headers: { Authorization: `Bearer ${user.token}` },
  });
  check(res, { "200": (r) => r.status === 200 });
  sleep(0.25);
}

export function handleSummary(data) {
  const p95 = data.metrics.http_req_duration?.values?.["p(95)"];
  const fail = data.metrics.http_req_failed?.values?.rate ?? 0;
  const checks = data.metrics.checks?.values?.rate ?? 0;
  const rps = data.metrics.http_reqs?.values?.rate ?? 0;
  const peakVus = data.metrics.vus_max?.values?.max ?? peak;

  const ok = fail < 0.02 && p95 < 2000 && checks > 0.99;
  console.log("\n--- Ramp read capacity ---");
  console.log(`Peak VUs configured: ${peak}, max VUs reached: ${peakVus}`);
  console.log(`p95: ${p95?.toFixed(1)} ms, fail rate: ${(fail * 100).toFixed(2)}%, checks: ${(checks * 100).toFixed(1)}%, ~${rps.toFixed(0)} req/s`);
  console.log(
    ok
      ? `RESULT: Thresholds HELD at peak ${peakVus} — try PEAK_VUS=${peakVus + 25} to find breaking point.`
      : `RESULT: Thresholds FAILED at peak ${peakVus} — max comfortable browsing ≈ last step before this (reduce PEAK_VUS and bisect).`,
  );
  console.log(
    `Resume: "Problem list API sustained ramp to ${peakVus} concurrent VUs with p95 ${Math.round(p95 ?? 0)} ms and ${(fail * 100).toFixed(1)}% errors."`,
  );
  return {};
}
