import type { SubmissionLanguage } from "@codementor/shared";
import { translateDriver } from "@codementor/shared";

/** Same logical problem as `problems/manifests/basics.ts` count-digits. */
export const COUNT_DIGITS_CPP_DRIVER =
  'printJson(Json::number(sol.countDigits((int)in["n"].asInt())));';

export const COUNT_DIGITS_CASES = {
  sample: [
    { input: { n: 12345 }, expected: 5 },
    { input: { n: 0 }, expected: 1 },
  ],
  boundary: [{ input: { n: 1_000_000_000 }, expected: 10 }],
  emptyObject: [{ input: {}, expected: null as number | null }],
};

export function driverFor(language: SubmissionLanguage): string {
  const translated = translateDriver(COUNT_DIGITS_CPP_DRIVER, language);
  if (!translated) throw new Error(`driver translation failed for ${language}`);
  return translated;
}

export const VALID_SOLUTION: Record<SubmissionLanguage, string> = {
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

export const WRONG_ANSWER: Record<SubmissionLanguage, string> = {
  cpp: `class Solution { public: int countDigits(int n) { return 0; } };`,
  python3: `class Solution:\n    def countDigits(self, n: int) -> int:\n        return 0\n`,
  java: `class Solution { public int countDigits(int n) { return 0; } }`,
};

export const COMPILE_OR_SYNTAX_ERROR: Record<SubmissionLanguage, string> = {
  cpp: `class Solution { public: int countDigits(int n) { @@ invalid } };`,
  python3: `class Solution\n def countDigits(self, n):\n pass\n`,
  java: `class Solution { public int countDigits(int n) { return ; } }`,
};

export const RUNTIME_ERROR: Record<SubmissionLanguage, string> = {
  cpp: `#include <stdexcept>
class Solution { public: int countDigits(int n) { throw std::runtime_error("fail"); return 0; } };`,
  python3: `class Solution:\n    def countDigits(self, n: int) -> int:\n        return 1 // (n - n)\n`,
  java: `class Solution { public int countDigits(int n) { return 5 / (n - n); } }`,
};

export const INFINITE_LOOP: Record<SubmissionLanguage, string> = {
  cpp: `class Solution { public: int countDigits(int n) { while (true) {} return 1; } };`,
  python3: `class Solution:\n    def countDigits(self, n: int) -> int:\n        while True:\n            pass\n`,
  java: `class Solution {
    public int countDigits(int n) {
        try {
            while (true) Thread.sleep(1_000_000);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            return 0;
        }
    }
}`,
};

export const EXCESSIVE_OUTPUT: Record<SubmissionLanguage, string> = {
  cpp: `#include <iostream>
class Solution { public: int countDigits(int n) { for (int i = 0; i < 50000; i++) std::cout << "x"; return 1; } };`,
  python3: `class Solution:\n    def countDigits(self, n: int) -> int:\n        print("x" * 50000)\n        return 1\n`,
  java: `class Solution { public int countDigits(int n) { for (int i = 0; i < 50000; i++) System.out.print("x"); return 1; } }`,
};
