import http from "k6/http";

const BASE = __ENV.API_BASE || "http://localhost:4000";
const TOKEN = __ENV.AUTH_TOKEN || "";
const PROBLEM_ID = __ENV.PROBLEM_ID || "count-digits";

export const solutions = {
  cpp: `class Solution {
public:
  int countDigits(int n) {
    if (n == 0) return 1;
    int c = 0;
    while (n) { c++; n /= 10; }
    return c;
  }
};`,
  python3: `class Solution:
    def countDigits(self, n: int) -> int:
        if n == 0:
            return 1
        c = 0
        while n:
            c += 1
            n //= 10
        return c
`,
  java: `class Solution {
    public int countDigits(int n) {
        if (n == 0) return 1;
        int c = 0;
        while (n > 0) { c++; n /= 10; }
        return c;
    }
}
`,
};

export function postRun(language) {
  if (!TOKEN) throw new Error("AUTH_TOKEN required");
  return http.post(
    `${BASE}/api/v1/submissions/run`,
    JSON.stringify({ problemId: PROBLEM_ID, language, code: solutions[language] }),
    { headers: { Authorization: `Bearer ${TOKEN}`, "Content-Type": "application/json" }, tags: { language } },
  );
}

export { BASE, TOKEN, PROBLEM_ID };
