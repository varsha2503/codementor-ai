-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "Difficulty" AS ENUM ('EASY', 'MEDIUM', 'HARD');

-- CreateEnum
CREATE TYPE "Visibility" AS ENUM ('SAMPLE', 'HIDDEN');

-- CreateEnum
CREATE TYPE "CompareMode" AS ENUM ('EXACT', 'UNORDERED', 'TOPOLOGICAL');

-- CreateEnum
CREATE TYPE "AttemptKind" AS ENUM ('RUN', 'SUBMIT');

-- CreateEnum
CREATE TYPE "Verdict" AS ENUM ('QUEUED', 'COMPILING', 'RUNNING', 'EVALUATING', 'ACCEPTED', 'WRONG_ANSWER', 'COMPILE_ERROR', 'TIME_LIMIT_EXCEEDED', 'MEMORY_LIMIT_EXCEEDED', 'RUNTIME_ERROR', 'CANCELLED', 'INTERNAL_ERROR');

-- CreateEnum
CREATE TYPE "InteractionType" AS ENUM ('HINT', 'ANALYSIS', 'CLASSIFICATION', 'TEST_GENERATION');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Problem" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "difficulty" "Difficulty" NOT NULL,
    "topics" TEXT[],
    "tags" TEXT[],
    "statement" TEXT NOT NULL,
    "constraints" TEXT[],
    "examples" JSONB NOT NULL,
    "starterCode" TEXT NOT NULL,
    "functionName" TEXT NOT NULL,
    "driverCode" TEXT NOT NULL,
    "compareMode" "CompareMode" NOT NULL,
    "timeLimitMs" INTEGER NOT NULL,
    "memoryLimitKb" INTEGER NOT NULL,
    "expectedTime" TEXT NOT NULL,
    "expectedSpace" TEXT NOT NULL,
    "referenceSolution" TEXT NOT NULL,
    "hintLadder" JSONB NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Problem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TestCase" (
    "id" TEXT NOT NULL,
    "problemId" TEXT NOT NULL,
    "input" JSONB NOT NULL,
    "expectedOutput" JSONB NOT NULL,
    "visibility" "Visibility" NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "ordinal" INTEGER NOT NULL,

    CONSTRAINT "TestCase_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Attempt" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "problemId" TEXT NOT NULL,
    "problemVersion" INTEGER NOT NULL,
    "code" TEXT NOT NULL,
    "language" TEXT NOT NULL,
    "kind" "AttemptKind" NOT NULL,
    "verdict" "Verdict" NOT NULL,
    "runtimeMs" INTEGER,
    "memoryKb" INTEGER,
    "testsPassed" INTEGER NOT NULL DEFAULT 0,
    "testsTotal" INTEGER NOT NULL DEFAULT 0,
    "message" TEXT,
    "compileOutput" TEXT,
    "testSummary" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "finishedAt" TIMESTAMP(3),

    CONSTRAINT "Attempt_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AIInteraction" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "problemId" TEXT NOT NULL,
    "attemptId" TEXT,
    "type" "InteractionType" NOT NULL,
    "level" INTEGER,
    "response" JSONB NOT NULL,
    "model" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AIInteraction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AttemptIssue" (
    "id" TEXT NOT NULL,
    "attemptId" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "severity" TEXT NOT NULL,
    "confidence" TEXT NOT NULL,
    "rationale" TEXT,

    CONSTRAINT "AttemptIssue_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExecutionJob" (
    "id" TEXT NOT NULL,
    "attemptId" TEXT NOT NULL,
    "status" "Verdict" NOT NULL,
    "queueJobId" TEXT,
    "startedAt" TIMESTAMP(3),
    "finishedAt" TIMESTAMP(3),
    "failureCode" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ExecutionJob_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EvaluationCase" (
    "id" TEXT NOT NULL,
    "problemId" TEXT NOT NULL,
    "input" JSONB NOT NULL,
    "expectedOutput" JSONB,
    "source" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "rejectionReason" TEXT,
    "batchId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EvaluationCase_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Problem_slug_key" ON "Problem"("slug");

-- CreateIndex
CREATE INDEX "TestCase_problemId_visibility_ordinal_idx" ON "TestCase"("problemId", "visibility", "ordinal");

-- CreateIndex
CREATE INDEX "Attempt_userId_createdAt_idx" ON "Attempt"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "Attempt_problemId_userId_idx" ON "Attempt"("problemId", "userId");

-- CreateIndex
CREATE INDEX "AIInteraction_userId_problemId_type_createdAt_idx" ON "AIInteraction"("userId", "problemId", "type", "createdAt");

-- CreateIndex
CREATE INDEX "AttemptIssue_attemptId_idx" ON "AttemptIssue"("attemptId");

-- CreateIndex
CREATE INDEX "AttemptIssue_category_idx" ON "AttemptIssue"("category");

-- CreateIndex
CREATE UNIQUE INDEX "ExecutionJob_attemptId_key" ON "ExecutionJob"("attemptId");

-- CreateIndex
CREATE INDEX "ExecutionJob_status_createdAt_idx" ON "ExecutionJob"("status", "createdAt");

-- CreateIndex
CREATE INDEX "EvaluationCase_problemId_status_idx" ON "EvaluationCase"("problemId", "status");

-- AddForeignKey
ALTER TABLE "TestCase" ADD CONSTRAINT "TestCase_problemId_fkey" FOREIGN KEY ("problemId") REFERENCES "Problem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Attempt" ADD CONSTRAINT "Attempt_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Attempt" ADD CONSTRAINT "Attempt_problemId_fkey" FOREIGN KEY ("problemId") REFERENCES "Problem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AIInteraction" ADD CONSTRAINT "AIInteraction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AIInteraction" ADD CONSTRAINT "AIInteraction_problemId_fkey" FOREIGN KEY ("problemId") REFERENCES "Problem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AIInteraction" ADD CONSTRAINT "AIInteraction_attemptId_fkey" FOREIGN KEY ("attemptId") REFERENCES "Attempt"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AttemptIssue" ADD CONSTRAINT "AttemptIssue_attemptId_fkey" FOREIGN KEY ("attemptId") REFERENCES "Attempt"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExecutionJob" ADD CONSTRAINT "ExecutionJob_attemptId_fkey" FOREIGN KEY ("attemptId") REFERENCES "Attempt"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EvaluationCase" ADD CONSTRAINT "EvaluationCase_problemId_fkey" FOREIGN KEY ("problemId") REFERENCES "Problem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

