import { problemSupportsLanguage, validateSourceForLanguage } from "./validate.js";
import { translateDriver } from "./driver-translate.js";

describe("validateSourceForLanguage", () => {
  it("rejects main in C++ and Java", () => {
    expect(validateSourceForLanguage("int main() {}", "cpp")).toMatch(/Solution/);
    expect(validateSourceForLanguage("public static void main(String[] a) {}", "java")).toMatch(/Solution/);
  });

  it("requires Solution class for Python and Java", () => {
    expect(validateSourceForLanguage("def f(): pass", "python3")).toMatch(/Solution class/);
    expect(validateSourceForLanguage("public class Foo {}", "java")).toMatch(/Solution class/);
  });

  it("allows valid stubs per language", () => {
    expect(validateSourceForLanguage("class Solution { public: int f() { return 1; } };", "cpp")).toBeNull();
    expect(validateSourceForLanguage("class Solution:\n    def f(self):\n        pass\n", "python3")).toBeNull();
    expect(validateSourceForLanguage("class Solution { int f() { return 1; } }", "java")).toBeNull();
  });
});

describe("problemSupportsLanguage", () => {
  const simple = 'printJson(Json::number(sol.countDigits((int)in["n"].asInt())));';
  const cppOnly = 'auto head = buildList(in["head"]);';

  it("supports all three for translatable drivers", () => {
    expect(problemSupportsLanguage(simple, "cpp")).toBe(true);
    expect(problemSupportsLanguage(simple, "python3")).toBe(true);
    expect(problemSupportsLanguage(simple, "java")).toBe(true);
  });

  it("C++ only for linked-list helpers", () => {
    expect(problemSupportsLanguage(cppOnly, "cpp")).toBe(true);
    expect(problemSupportsLanguage(cppOnly, "python3")).toBe(false);
    expect(problemSupportsLanguage(cppOnly, "java")).toBe(false);
  });

  it("translateDriver returns null when translation fails", () => {
    expect(translateDriver(cppOnly, "python3")).toBeNull();
  });
});
