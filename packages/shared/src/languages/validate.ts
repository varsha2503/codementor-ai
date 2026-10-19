import type { SubmissionLanguage } from "./types.js";
import { isCppOnlyDriver } from "./cpp-only.js";
import { translateDriver } from "./driver-translate.js";

const MAX_CODE_BYTES = 65536;

export function validateSourceForLanguage(code: string, language: SubmissionLanguage): string | null {
  if (code.length > MAX_CODE_BYTES) return "Code exceeds the 64KB limit.";
  if (code.includes("\0")) return "Code contains a null byte.";

  if (language === "cpp") {
    if (/\bmain\s*\(/.test(code)) return "Implement the Solution method only. The judge supplies main.";
    return null;
  }

  if (language === "python3") {
    if (/if\s+__name__\s*==\s*['"]__main__['"]/.test(code)) return "Implement the Solution class only. The judge supplies main.";
    if (!/class\s+Solution\b/.test(code)) return "Define a Solution class with your method.";
    return null;
  }

  if (language === "java") {
    if (/\bpublic\s+static\s+void\s+main\s*\(/.test(code)) return "Implement the Solution class only. The judge supplies main.";
    if (!/class\s+Solution\b/.test(code)) return "Define a Solution class with your method.";
    return null;
  }

  return null;
}

export function problemSupportsLanguage(driverCode: string, language: SubmissionLanguage): boolean {
  if (language === "cpp") return true;
  if (isCppOnlyDriver(driverCode)) return false;
  return translateDriver(driverCode, language) !== null;
}
