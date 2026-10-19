import { render, screen } from "@testing-library/react";
import type { Problem } from "../../types/models";
import { ProblemStatement } from "./ProblemStatement";

const problem: Problem = {
  id: "p1",
  slug: "pair-target",
  title: "Pair Target",
  difficulty: "EASY",
  topics: ["arrays"],
  tags: [],
  statement: "Find two numbers that add up to the target.",
  constraints: ["2 <= nums.length <= 10^4"],
  examples: [{ input: "nums = [2,7], target = 9", output: "[0,1]" }],
  starterCode: "class Solution {};",
  expectedTime: "O(n)",
  expectedSpace: "O(n)",
  timeLimitMs: 2000,
  memoryLimitKb: 262144,
};

describe("ProblemStatement", () => {
  it("renders the statement, constraints, and examples", () => {
    render(<ProblemStatement problem={problem} />);
    expect(screen.getByText(/Find two numbers/)).toBeInTheDocument();
    expect(screen.getByText(/nums\.length/)).toBeInTheDocument();
    expect(screen.getByText(/Input:/)).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Examples" })).toBeInTheDocument();
  });
});
