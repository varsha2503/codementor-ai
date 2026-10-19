import { jest } from "@jest/globals";

function model() {
  return {
    findUnique: jest.fn(),
    findFirst: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    createMany: jest.fn(),
    update: jest.fn(),
    deleteMany: jest.fn(),
    count: jest.fn(),
    upsert: jest.fn(),
  };
}

export const prismaMock = {
  user: model(),
  problem: model(),
  attempt: model(),
  executionJob: model(),
  evaluationCase: model(),
  problemCatalogEntry: model(),
  aIInteraction: model(),
  attemptIssue: model(),
  $queryRaw: jest.fn(),
  $transaction: jest.fn(),
};

export function resetPrismaMock() {
  for (const key of Object.keys(prismaMock) as (keyof typeof prismaMock)[]) {
    const value = prismaMock[key];
    if (key.startsWith("$") || typeof value !== "object" || value === null) continue;
    for (const fn of Object.values(value as Record<string, unknown>)) {
      if (typeof fn === "function" && "mockReset" in fn) (fn as jest.Mock).mockReset();
    }
  }
  prismaMock.$queryRaw.mockReset();
  prismaMock.$transaction.mockReset();
  prismaMock.$transaction.mockImplementation(async (arg: unknown) => {
    if (typeof arg === "function") return (arg as (tx: typeof prismaMock) => unknown)(prismaMock);
    if (Array.isArray(arg)) return Promise.all(arg as Promise<unknown>[]);
    return arg;
  });
}

resetPrismaMock();
