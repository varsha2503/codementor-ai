import { PrismaClient, type Prisma } from "@prisma/client";
import bcrypt from "bcryptjs";
import { extraTests } from "../problems/test-fixtures/index.js";
import { problems } from "../problems/manifests/index.js";

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash("practice-locally", 10);
  await prisma.user.upsert({
    where: { email: "ada@codementor.local" },
    update: { passwordHash, displayName: "Ada" },
    create: { email: "ada@codementor.local", passwordHash, displayName: "Ada" },
  });

  await prisma.problem.deleteMany({
    where: { slug: { notIn: problems.map((problem) => problem.slug) } },
  });

  for (const problem of problems) {
    const tests = [...problem.tests, ...extraTests(problem.slug)];
    const data = {
      title: problem.title,
      difficulty: problem.difficulty,
      topics: problem.topics,
      tags: problem.tags,
      statement: problem.statement,
      constraints: problem.constraints,
      examples: problem.examples as Prisma.InputJsonValue,
      starterCode: problem.starterCode,
      functionName: problem.functionName,
      driverCode: problem.driverCode,
      compareMode: problem.compareMode,
      timeLimitMs: problem.timeLimitMs,
      memoryLimitKb: problem.memoryLimitKb,
      expectedTime: problem.expectedTime,
      expectedSpace: problem.expectedSpace,
      referenceSolution: problem.referenceSolution,
      hintLadder: problem.hintLadder as Prisma.InputJsonValue,
      version: 1,
    };
    const saved = await prisma.problem.upsert({
      where: { slug: problem.slug },
      create: { slug: problem.slug, ...data },
      update: data,
    });
    await prisma.testCase.deleteMany({ where: { problemId: saved.id } });
    await prisma.testCase.createMany({
      data: tests.map((test, ordinal) => ({
        problemId: saved.id,
        input: test.input as Prisma.InputJsonValue,
        expectedOutput: test.expectedOutput as Prisma.InputJsonValue,
        visibility: test.visibility,
        ordinal,
        version: 1,
      })),
    });
  }

  console.log(`Seeded ${problems.length} problems and the local demo account ada@codementor.local`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
