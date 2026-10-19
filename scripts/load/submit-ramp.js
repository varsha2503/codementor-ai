import { check, sleep } from "k6";
import { postRun } from "./lib.js";

const langs = ["cpp", "python3", "java"];

export const options = {
  stages: [
    { duration: "30s", target: 3 },
    { duration: "1m", target: 8 },
    { duration: "30s", target: 0 },
  ],
};

export default function () {
  const language = langs[Math.floor(Math.random() * langs.length)];
  const res = postRun(language);
  check(res, { accepted: (r) => r.status === 202 || r.status === 429 });
  sleep(2);
}
