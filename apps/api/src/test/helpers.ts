import bcrypt from "bcryptjs";
import { signToken } from "../middleware/http.js";
import { prismaMock } from "./mocks/db.js";

export const USER_ID = "user-test-1";

export const publicUser = {
  id: USER_ID,
  email: "ada@example.com",
  displayName: "Ada",
  createdAt: new Date("2026-01-01T00:00:00.000Z"),
};

export async function passwordHash(password: string) {
  return bcrypt.hash(password, 10);
}

export function authHeader(userId = USER_ID) {
  return { Authorization: `Bearer ${signToken(userId)}` };
}

export function stubAuthUser(userId = USER_ID) {
  prismaMock.user.findUnique.mockImplementation(async (args: { where: { id?: string; email?: string } }) => {
    if (args.where.id === userId) return { id: userId };
    if (args.where.email) {
      return {
        id: userId,
        email: args.where.email,
        displayName: publicUser.displayName,
        passwordHash: await passwordHash("password123"),
        createdAt: publicUser.createdAt,
      };
    }
    return null;
  });
}

export const sampleProblem = {
  id: "problem-1",
  slug: "pair-target",
  title: "Pair Target",
  difficulty: "EASY",
  topics: ["arrays"],
  tags: [],
  statement: "Find two numbers.",
  constraints: ["2 <= n <= 10^4"],
  examples: [{ input: "nums = [2,7], target = 9", output: "[0,1]" }],
  starterCode: "class Solution {};",
  functionName: "twoSum",
  version: 1,
  timeLimitMs: 2000,
  memoryLimitKb: 262144,
  expectedTime: "O(n)",
  expectedSpace: "O(n)",
  hintLadder: [{ level: 1, text: "Think about pairs." }],
  driverCode: 'numbersOut("sol.twoSum(in[\\"nums\\"].asIntVector(), in[\\"target\\"].asInt())");',
};
