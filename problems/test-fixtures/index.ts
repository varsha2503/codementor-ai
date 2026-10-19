export function extraTests(slug: string) {
  if (slug !== "pair-target") return [];
  const count = 80_000;
  const nums = Array.from({ length: count }, (_, index) => index + 1);
  nums[count - 1] = 1_000_000_000;
  return [
    {
      input: { nums, target: nums[0]! + 1_000_000_000 },
      expectedOutput: [0, count - 1],
      visibility: "HIDDEN" as const,
    },
  ];
}
