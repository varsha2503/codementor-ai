import request from "supertest";
import { createApp } from "../../app.js";
import { authHeader, sampleProblem, stubAuthUser, USER_ID } from "../../test/helpers.js";
import { prismaMock, resetPrismaMock } from "../../test/mocks/db.js";
import { executionQueueMock, resetRedisMock } from "../../test/mocks/redis.js";

describe("problems API", () => {
  beforeEach(() => {
    resetPrismaMock();
    resetRedisMock();
    stubAuthUser();
  });

  describe("GET /api/v1/problems", () => {
    it("requires authentication", async () => {
      const res = await request(createApp()).get("/api/v1/problems");
      expect(res.status).toBe(401);
    });

    it("applies difficulty and topic filters", async () => {
      prismaMock.problem.count.mockResolvedValue(0);
      prismaMock.problem.findMany.mockResolvedValue([]);
      prismaMock.attempt.findMany.mockResolvedValue([]);
      const res = await request(createApp())
        .get("/api/v1/problems")
        .query({ difficulty: "easy", topic: "arrays", q: "pair", page: 2, limit: 10 })
        .set(authHeader());
      expect(res.status).toBe(200);
      expect(prismaMock.problem.findMany).toHaveBeenCalled();
    });

    it("returns paginated problems with solved flags", async () => {
      prismaMock.problem.count.mockResolvedValue(1);
      prismaMock.problem.findMany.mockResolvedValue([sampleProblem]);
      prismaMock.attempt.findMany.mockResolvedValue([{ problemId: sampleProblem.id }]);
      const res = await request(createApp()).get("/api/v1/problems").set(authHeader());
      expect(res.status).toBe(200);
      expect(res.body.problems[0].solved).toBe(true);
      expect(res.body.total).toBe(1);
    });
  });

  describe("GET /api/v1/problems/:slug", () => {
    it("returns 404 for unknown slugs", async () => {
      prismaMock.problem.findUnique.mockResolvedValue(null);
      const res = await request(createApp()).get("/api/v1/problems/missing").set(authHeader());
      expect(res.status).toBe(404);
    });

    it("returns a full problem payload", async () => {
      prismaMock.problem.findUnique.mockResolvedValue(sampleProblem);
      prismaMock.problemCatalogEntry.findFirst.mockResolvedValue(null);
      const res = await request(createApp()).get("/api/v1/problems/pair-target").set(authHeader());
      expect(res.status).toBe(200);
      expect(res.body.problem.slug).toBe("pair-target");
      expect(res.body.problem.catalog).toBeNull();
    });
  });

  describe("POST /api/v1/problems/:slug/evaluation-pool", () => {
    it("queues screened candidate cases", async () => {
      prismaMock.problem.findUnique.mockResolvedValue({
        ...sampleProblem,
        testCases: [{ input: { nums: [2, 7], target: 9 } }],
        evaluationCases: [],
      });
      prismaMock.evaluationCase.create.mockResolvedValue({ id: "case-1" });
      const res = await request(createApp()).post("/api/v1/problems/pair-target/evaluation-pool").set(authHeader());
      expect(res.status).toBe(202);
      expect(res.body.pending).toBeGreaterThan(0);
      expect(executionQueueMock.add).toHaveBeenCalled();
    });
  });

  describe("GET /api/v1/problems/:slug/evaluation-pool", () => {
    it("summarizes evaluation case statuses", async () => {
      prismaMock.problem.findUnique.mockResolvedValue({ id: sampleProblem.id });
      prismaMock.evaluationCase.findMany.mockResolvedValue([
        { status: "PENDING", rejectionReason: null },
        { status: "REJECTED", rejectionReason: "Wrong answer on reference." },
      ]);
      const res = await request(createApp()).get("/api/v1/problems/pair-target/evaluation-pool").set(authHeader());
      expect(res.status).toBe(200);
      expect(res.body.counts.PENDING).toBe(1);
      expect(res.body.rejectionReasons).toHaveLength(1);
    });
  });
});
