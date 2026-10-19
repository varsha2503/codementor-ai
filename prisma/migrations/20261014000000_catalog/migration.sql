CREATE TYPE "CatalogLicense" AS ENUM ('LINK_ONLY', 'LOCAL_STATEMENT');

CREATE TYPE "CatalogImportStatus" AS ENUM ('IMPORTED', 'REJECTED');

CREATE TABLE "ProblemCatalogEntry" (
    "id" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "externalSlug" TEXT NOT NULL,
    "externalId" TEXT,
    "title" TEXT NOT NULL,
    "difficulty" "Difficulty" NOT NULL,
    "topics" TEXT[],
    "tags" TEXT[],
    "canonicalUrl" TEXT NOT NULL,
    "licenseStatus" "CatalogLicense" NOT NULL,
    "permissionNote" TEXT NOT NULL,
    "attribution" TEXT,
    "importStatus" "CatalogImportStatus" NOT NULL,
    "rejectionReason" TEXT,
    "importedAt" TIMESTAMP(3),
    "problemId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProblemCatalogEntry_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "ProblemCatalogEntry_source_externalSlug_key" ON "ProblemCatalogEntry"("source", "externalSlug");

CREATE INDEX "ProblemCatalogEntry_importStatus_title_idx" ON "ProblemCatalogEntry"("importStatus", "title");

CREATE INDEX "ProblemCatalogEntry_problemId_idx" ON "ProblemCatalogEntry"("problemId");

ALTER TABLE "ProblemCatalogEntry" ADD CONSTRAINT "ProblemCatalogEntry_problemId_fkey" FOREIGN KEY ("problemId") REFERENCES "Problem"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "AIInteraction" ALTER COLUMN "problemId" DROP NOT NULL;

ALTER TABLE "AIInteraction" ADD COLUMN "catalogEntryId" TEXT;

CREATE INDEX "AIInteraction_userId_catalogEntryId_type_createdAt_idx" ON "AIInteraction"("userId", "catalogEntryId", "type", "createdAt");

ALTER TABLE "AIInteraction" ADD CONSTRAINT "AIInteraction_catalogEntryId_fkey" FOREIGN KEY ("catalogEntryId") REFERENCES "ProblemCatalogEntry"("id") ON DELETE CASCADE ON UPDATE CASCADE;
