import { codeDiscussionPrompt, codeLooksLikeStub } from "./interview-code.js";

describe("codeLooksLikeStub", () => {
  it("flags empty or trivial solution shells", () => {
    expect(codeLooksLikeStub("class Solution {};")).toBe(true);
    const real =
      "class Solution { public: vector<int> twoSum(vector<int>& nums, int target) { for (int i = 0; i < nums.size(); ++i) return {i, i}; return {}; } };";
    expect(codeLooksLikeStub(real)).toBe(false);
  });
});

describe("codeDiscussionPrompt", () => {
  it("asks about hash maps when one appears in the code", () => {
    const prompt = codeDiscussionPrompt(
      "Pair Target",
      "class Solution { public: vector<int> twoSum(vector<int>& nums, int target) { unordered_map<int,int> seen; for (int i = 0; i < nums.size(); ++i) { if (seen.count(target - nums[i])) return {seen[target-nums[i]], i}; seen[nums[i]] = i; } return {}; } };",
    );
    expect(prompt).toMatch(/hash-based structure/i);
  });

  it("returns null for stubs", () => {
    expect(codeDiscussionPrompt("Pair Target", "class Solution {};")).toBeNull();
  });
});
