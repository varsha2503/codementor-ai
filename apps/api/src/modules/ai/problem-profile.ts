export type ProblemProfile = {
  kind: "palindrome-number" | "generic";
  forbidsStringConversion: boolean;
  title: string;
};

export function buildProblemProfile(title: string, statement: string): ProblemProfile {
  const blob = `${title}\n${statement}`.toLowerCase();
  const isPalindromeNumber = /palindrome number|palindrome-number|reads the same forwards and backwards/.test(blob);
  const forbidsStringConversion =
    /\b(without|no)\s+(converting|convert|using)\s+(it\s+)?to\s+a?\s*string\b/.test(blob) ||
    /\bdo not convert.*string\b/.test(blob) ||
    /\bwithout string conversion\b/.test(blob);
  return {
    kind: isPalindromeNumber ? "palindrome-number" : "generic",
    forbidsStringConversion,
    title,
  };
}

/** Interview constraint commonly stated for Palindrome Number even when the DB statement is minimal. */
export function effectivePalindromeConstraints(profile: ProblemProfile): string[] {
  if (profile.kind !== "palindrome-number") return [];
  const lines = ["Negative integers are not palindromes in base 10."];
  if (profile.forbidsStringConversion) {
    lines.push("Do not convert the number to a string.");
  } else {
    lines.push("Prefer an numeric digit approach; string conversion is a common follow-up constraint in interviews.");
  }
  return lines;
}
