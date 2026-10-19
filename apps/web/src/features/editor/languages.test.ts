import { LANGUAGE_OPTIONS, languageLabel, monacoLanguage } from "./languages";

describe("language configuration", () => {
  it("maps backend identifiers to Monaco ids", () => {
    expect(monacoLanguage("cpp")).toBe("cpp");
    expect(monacoLanguage("python3")).toBe("python");
    expect(monacoLanguage("java")).toBe("java");
  });

  it("labels all supported languages", () => {
    expect(LANGUAGE_OPTIONS.map((o) => o.value)).toEqual(["cpp", "python3", "java"]);
    expect(languageLabel("python3")).toBe("Python 3");
    expect(languageLabel("java")).toBe("Java 17");
  });
});
