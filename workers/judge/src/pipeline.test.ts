import { readFileSync } from "node:fs";
import path from "node:path";
import { COMPILE_COMMAND, buildScript } from "./compiler.js";
import { buildJavaScript, javaMainSource, JAVA_COMPILE } from "./languages/java.js";
import { buildPythonScript, pythonMainSource, PYTHON_COMPILE } from "./languages/python.js";
import { RUNNER_LIMITS } from "./limits.js";

const executorSource = readFileSync(path.join(process.cwd(), "workers/judge/src/executor.ts"), "utf8");

describe("language pipelines (static)", () => {
  it("C++ uses C++17 and compiles before running tests", () => {
    expect(COMPILE_COMMAND).toContain("-std=c++17");
    const script = buildScript(2, 30);
    expect(script).toContain(COMPILE_COMMAND);
    expect(script).toMatch(/compile\.code/);
    expect(script).toContain("timeout");
  });

  it("Python uses py_compile then python3 main (no separate compile stage at runtime)", () => {
    expect(PYTHON_COMPILE).toContain("py_compile");
    const script = buildPythonScript(2, 30);
    expect(script).toContain("python3 /src/main.py");
    expect(script).not.toContain("g++");
    const main = pythonMainSource("print_json(1)");
    expect(main).toContain("from solution import Solution");
    expect(main).toContain('if __name__ == "__main__"');
  });

  it("Java uses javac on Support, Solution, Main then java Main", () => {
    expect(JAVA_COMPILE).toContain("javac");
    expect(JAVA_COMPILE).toContain("Solution.java");
    expect(JAVA_COMPILE).toContain("Main.java");
    const script = buildJavaScript(2, 30);
    expect(script).toContain("java -cp /tmp/classes Main");
    const main = javaMainSource("Support.printJson(1);");
    expect(main).toContain("class Main");
    expect(main).toContain("new Solution()");
    expect(main).not.toMatch(/class Solution/);
  });

  it("executor sandbox flags include network isolation and read-only root", () => {
    expect(executorSource).toContain('"--network"');
    expect(executorSource).toContain('"none"');
    expect(executorSource).toContain('"--read-only"');
    expect(executorSource).toContain('"--cap-drop"');
    expect(executorSource).toContain('"--memory"');
    expect(executorSource).toContain("RUNNER_LIMITS");
  });

  it("runner memory/cpu limits are defined for sandboxes", () => {
    expect(RUNNER_LIMITS.cpus).toBe("1");
    expect(RUNNER_LIMITS.memory).toBe("768m");
    expect(RUNNER_LIMITS.pids).toBe("64");
  });

  it("user code is written to fixed filenames, not interpolated into shell", () => {
    expect(executorSource).toContain('writeFile(path.join(srcDir, "solution.cpp")');
    expect(executorSource).toContain('writeFile(path.join(srcDir, "solution.py")');
    expect(executorSource).toContain('writeFile(path.join(srcDir, "Solution.java")');
    expect(executorSource).not.toMatch(/exec.*options\.code/);
  });
});
