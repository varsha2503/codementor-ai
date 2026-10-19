import { problem } from "./helpers.js";

export const arrayProblems = [
  problem({
    slug: "pair-target",
    title: "Two Sum",
    difficulty: "EASY",
    topics: ["arrays"],
    tags: ["hash-map"],
    statement:
      "A warehouse labels every bin with an integer code. For a packing target, choose two different bins whose codes add up to the target and return their indexes.\n\nExactly one answer exists. Either index order is accepted.",
    constraints: [
      "2 <= nums.length <= 100000",
      "-1e9 <= nums[i], target <= 1e9",
      "Exactly one valid pair exists.",
    ],
    examples: [
      { input: "nums = [2, 7, 11, 15], target = 9", output: "[0, 1]", explanation: "2 + 7 = 9." },
      { input: "nums = [3, 2, 4], target = 6", output: "[1, 2]" },
    ],
    signature: "vector<int> twoSum(vector<int>& nums, int target)",
    functionName: "twoSum",
    driver: `auto nums = in["nums"].asIntVector();\n    printJson(Json::ints(sol.twoSum(nums, (int)in["target"].asInt())));`,
    method: `vector<int> twoSum(vector<int>& nums, int target) {
        unordered_map<int, int> seen;
        for (int i = 0; i < (int)nums.size(); i++) {
            int need = target - nums[i];
            if (seen.count(need)) return {seen[need], i};
            seen[nums[i]] = i;
        }
        return {};
    }`,
    expectedTime: "O(n)",
    expectedSpace: "O(n)",
    hints: [
      "Each bin is currently compared with many bins you have already walked past. Can you remember a value the moment you see it, so the matching bin does not require another scan?",
      "A hash map from code to index answers 'have I already seen the complement?' in constant time.",
      "For each value x at index i, look up target - x. If it is present, return the stored index and i. If it is absent, store x after the lookup so a value is not paired with itself.",
      "One pass with a hash map is enough. Time is linear on average and extra memory is linear in the number of bins. Insert only after the complement lookup. Either order of the two indexes is correct.",
    ],
    alternates: [
      undefined,
      {
        whenCodeHas: "unordered_map|map<",
        alternateText:
          "The map is already there. Check whether target - x was stored before you insert x. Inserting first lets a value match itself when 2x equals the target.",
      },
    ],
    tests: [
      { input: { nums: [2, 7, 11, 15], target: 9 }, expectedOutput: [0, 1], visibility: "SAMPLE" },
      { input: { nums: [3, 2, 4], target: 6 }, expectedOutput: [1, 2], visibility: "SAMPLE" },
      { input: { nums: [3, 3], target: 6 }, expectedOutput: [0, 1], visibility: "HIDDEN" },
      { input: { nums: [-1, -2, -3, -4, -5], target: -8 }, expectedOutput: [2, 4], visibility: "HIDDEN" },
      { input: { nums: [0, 4, 3, 0], target: 0 }, expectedOutput: [0, 3], visibility: "HIDDEN" },
    ],
    compareMode: "UNORDERED",
  }),
];
