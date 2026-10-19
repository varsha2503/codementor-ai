import http from "k6/http";
import { check, sleep } from "k6";

export const options = {
  stages: [
    { duration: "20s", target: 10 },
    { duration: "40s", target: 30 },
    { duration: "20s", target: 0 },
  ],
  thresholds: {
    http_req_failed: ["rate<0.02"],
    http_req_duration: ["p(95)<3000"],
  },
};

const BASE = __ENV.API_BASE || "http://localhost:4000";

export default function () {
  const res = http.get(`${BASE}/api/v1/health`);
  check(res, {
    "status 200": (r) => r.status === 200,
    "ok true": (r) => r.json("ok") === true,
  });
  sleep(0.5);
}
