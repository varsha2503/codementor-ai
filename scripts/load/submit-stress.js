import { check, sleep } from "k6";
import { postRun } from "./lib.js";

/** Run only on staging after confirming worker + rate limits. Expect 429s. */
export const options = {
  stages: [{ duration: "2m", target: 15 }],
  thresholds: {
    http_req_failed: ["rate<0.5"],
  },
};

export default function () {
  const langs = ["cpp", "python3", "java"];
  const res = postRun(langs[__VU % 3]);
  check(res, { not_5xx: (r) => r.status < 500 });
  sleep(0.3);
}
