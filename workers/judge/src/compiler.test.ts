import { COMPILE_COMMAND, buildScript, mainSource } from "./compiler.js";

describe("buildScript", () => {
  it("sets ulimits and runs each numbered test file", () => {
    const script = buildScript(2, 30);
    expect(script).toContain("ulimit -t 30");
    expect(script).toContain(COMPILE_COMMAND);
    expect(script).toContain('while [ -f "/src/tests/$i.in" ]');
    expect(script).toContain("timeout -k 1s 2s /tmp/prog");
  });
});

describe("mainSource", () => {
  it("wraps driver code inside a Solution call", () => {
    const source = mainSource("writeJson(sol.twoSum(in[\"nums\"], in[\"target\"]));");
    expect(source).toContain("#include \"solution.cpp\"");
    expect(source).toContain("writeJson(sol.twoSum");
  });
});
