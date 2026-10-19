import { translateDriver } from "./driver-translate.js";

describe("translateDriver", () => {
  it("translates a simple numeric driver to Python and Java", () => {
    const cpp = 'printJson(Json::number(sol.countDigits((int)in["n"].asInt())));';
    expect(translateDriver(cpp, "python3")).toBe('print_json(sol.countDigits(in_["n"]))');
    expect(translateDriver(cpp, "java")).toBe('Support.printJson(sol.countDigits(Support.getInt(in, "n")));');
  });

  it("expands numbersOut for vector results", () => {
    const cpp = 'numbersOut("sol.twoSum(in[\\"nums\\"].asIntVector(), in[\\"target\\"].asInt())");';
    expect(translateDriver(cpp, "python3")).toContain("print_json(sol.twoSum");
    expect(translateDriver(cpp, "java")).toContain("Support.printJson(sol.twoSum");
  });
});
