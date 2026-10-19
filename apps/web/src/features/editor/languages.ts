export type SubmissionLanguage = "cpp" | "python3" | "java";

export const LANGUAGE_OPTIONS: { value: SubmissionLanguage; label: string; monaco: string }[] = [
  { value: "cpp", label: "C++17", monaco: "cpp" },
  { value: "python3", label: "Python 3", monaco: "python" },
  { value: "java", label: "Java 17", monaco: "java" },
];

export function languageLabel(language: string): string {
  return LANGUAGE_OPTIONS.find((item) => item.value === language)?.label ?? language;
}

export function monacoLanguage(language: SubmissionLanguage): string {
  return LANGUAGE_OPTIONS.find((item) => item.value === language)?.monaco ?? "cpp";
}
