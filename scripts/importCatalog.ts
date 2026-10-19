import dotenv from "dotenv";
import fs from "node:fs";
import path from "node:path";
import { PrismaClient } from "@prisma/client";
import { inspectCatalogFile } from "../apps/api/src/modules/catalog/inspect.js";
import { storeCatalogDrafts } from "../apps/api/src/modules/catalog/store.js";

dotenv.config({ path: path.resolve(process.cwd(), ".env") });

const fileArg = process.argv[2];
if (!fileArg) {
  console.error("Usage: npm run catalog:import -- problems/catalog/leetcode.sample.json");
  process.exit(1);
}

const prisma = new PrismaClient();

async function main() {
  const fullPath = path.resolve(process.cwd(), fileArg);
  const bytes = fs.readFileSync(fullPath);
  if (bytes.byteLength > 1_000_000) throw new Error("Catalog file exceeds 1MB.");
  const raw = JSON.parse(bytes.toString("utf8")) as unknown;
  const localProblems = await prisma.problem.findMany({ select: { slug: true, title: true } });
  const inspected = inspectCatalogFile(raw, localProblems);
  for (const rejected of inspected.rejected) {
    console.error(`rejected ${rejected.externalSlug ?? "file"}: ${rejected.reason}`);
  }
  if (inspected.accepted.length === 0) {
    throw new Error("No catalog entries were accepted.");
  }
  const saved = await storeCatalogDrafts(prisma, inspected.accepted, localProblems);
  console.log(JSON.stringify({ imported: saved, rejected: inspected.rejected.length }, null, 2));
}

main()
  .catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
