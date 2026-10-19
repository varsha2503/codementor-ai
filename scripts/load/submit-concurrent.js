import { check, sleep } from "k6";
import { postRun } from "./lib.js";

export const options = {
  scenarios: {
    cpp: { executor: "constant-vus", vus: 2, duration: "30s", exec: "cpp" },
    py: { executor: "constant-vus", vus: 2, duration: "30s", exec: "py" },
    java: { executor: "constant-vus", vus: 2, duration: "30s", exec: "java" },
  },
  thresholds: {
    http_req_failed: ["rate<0.15"],
  },
};

export function cpp() {
  check(postRun("cpp"), { queued: (r) => r.status === 202 || r.status === 429 });
  sleep(1);
}
export function py() {
  check(postRun("python3"), { queued: (r) => r.status === 202 || r.status === 429 });
  sleep(1);
}
export function java() {
  check(postRun("java"), { queued: (r) => r.status === 202 || r.status === 429 });
  sleep(1);
}
