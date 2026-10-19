import { check } from "k6";
import { postRun } from "./lib.js";

export const options = { vus: 1, iterations: 3 };

export default function () {
  const langs = ["cpp", "python3", "java"];
  const language = langs[__ITER % langs.length];
  const res = postRun(language);
  check(res, {
    queued: (r) => r.status === 202,
    language_tag: () => true,
  });
}
