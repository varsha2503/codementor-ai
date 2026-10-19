export const SUBMISSION_LANGUAGES = ["cpp", "python3", "java"] as const;
export type SubmissionLanguage = (typeof SUBMISSION_LANGUAGES)[number];

export const LANGUAGE_LABEL: Record<SubmissionLanguage, string> = {
  cpp: "C++17",
  python3: "Python 3",
  java: "Java 17",
};

export const MONACO_LANGUAGE: Record<SubmissionLanguage, string> = {
  cpp: "cpp",
  python3: "python",
  java: "java",
};
