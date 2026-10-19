import request from "supertest";
import { createApp } from "../../app.js";
import { authHeader, sampleProblem, stubAuthUser, USER_ID } from "../../test/helpers.js";
import { enqueueExecutionMock, resetEnqueueMock } from "../../test/mocks/enqueue.js";
import { prismaMock, resetPrismaMock } from "../../test/mocks/db.js";
import { resetRedisMock } from "../../test/mocks/redis.js";

const validCode = "class Solution { public: vector<int> twoSum(vector<int>& nums, int target) { return {}; } };";

describe("submissions API", () => {
  beforeEach(() => {
    resetPrismaMock();
    resetRedisMock();
    resetEnqueueMock();
    stubAuthUser();
  });

  describe("POST /api/v1/submissions/run", () => {
    it("queues a run with optional custom input", async () => {
      prismaMock.problem.findFirst.mockResolvedValue(sampleProblem);
      prismaMock.attempt.create.mockResolvedValue({ id: "attempt-1" });
      prismaMock.executionJob.create.mockResolvedValue({ id: "job-row-1" });
      const res = await request(createApp())
        .post("/api/v1/submissions/run")
        .set(authHeader())
        .send({ problemId: sampleProblem.slug, language: "cpp", code: validCode, customInput: { nums: [1, 2] } });
      expect(res.status).toBe(202);
      expect(res.body.submissionId).toBe("attempt-1");
      expect(enqueueExecutionMock).toHaveBeenCalledWith("attempt-1", { nums: [1, 2] });
    });

    it("rejects code that includes main", async () => {
      const res = await request(createApp())
        .post("/api/v1/submissions/run")
        .set(authHeader())
        .send({ problemId: sampleProblem.slug, language: "cpp", code: "int main(){return 0;}" });
      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe("CODE_POLICY");
    });

    it("queues python3 when Solution class is valid", async () => {
      prismaMock.problem.findFirst.mockResolvedValue(sampleProblem);
      prismaMock.attempt.create.mockResolvedValue({ id: "attempt-py" });
      prismaMock.executionJob.create.mockResolvedValue({ id: "job-py" });
      const code = "class Solution:\n    def twoSum(self, nums, target):\n        return []\n";
      const res = await request(createApp())
        .post("/api/v1/submissions/run")
        .set(authHeader())
        .send({ problemId: sampleProblem.slug, language: "python3", code });
      expect(res.status).toBe(202);
      expect(prismaMock.attempt.create).toHaveBeenCalledWith(
        expect.objectContaining({ data: expect.objectContaining({ language: "python3" }) }),
      );
    });

    it("queues java when Solution class is valid", async () => {
      prismaMock.problem.findFirst.mockResolvedValue(sampleProblem);
      prismaMock.attempt.create.mockResolvedValue({ id: "attempt-java" });
      prismaMock.executionJob.create.mockResolvedValue({ id: "job-java" });
      const code = "class Solution { public int[] twoSum(int[] nums, int target) { return new int[0]; } }";
      const res = await request(createApp())
        .post("/api/v1/submissions/run")
        .set(authHeader())
        .send({ problemId: sampleProblem.slug, language: "java", code });
      expect(res.status).toBe(202);
      expect(prismaMock.attempt.create).toHaveBeenCalledWith(
        expect.objectContaining({ data: expect.objectContaining({ language: "java" }) }),
      );
    });
  });

  describe("POST /api/v1/submissions", () => {
    it("queues a full submit", async () => {
      prismaMock.problem.findFirst.mockResolvedValue(sampleProblem);
      prismaMock.attempt.create.mockResolvedValue({ id: "attempt-2" });
      prismaMock.executionJob.create.mockResolvedValue({ id: "job-row-2" });
      const res = await request(createApp())
        .post("/api/v1/submissions")
        .set(authHeader())
        .send({ problemId: sampleProblem.id, language: "cpp", code: validCode });
      expect(res.status).toBe(202);
      expect(enqueueExecutionMock).toHaveBeenCalledWith("attempt-2", undefined);
    });

    it("rejects custom input on submit", async () => {
      const res = await request(createApp())
        .post("/api/v1/submissions")
        .set(authHeader())
        .send({ problemId: sampleProblem.id, language: "cpp", code: validCode, customInput: { nums: [] } });
      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe("CUSTOM_INPUT");
    });
  });

  describe("GET /api/v1/submissions/:id", () => {
    it("returns attempt details for the owner", async () => {
      prismaMock.attempt.findFirst.mockResolvedValue({
        id: "attempt-1",
        kind: "SUBMIT",
        language: "cpp",
        code: validCode,
        verdict: "ACCEPTED",
        runtimeMs: 12,
        memoryKb: 1024,
        testsPassed: 4,
        testsTotal: 4,
        message: null,
        compileOutput: null,
        testSummary: [],
        createdAt: new Date(),
        finishedAt: new Date(),
        problem: sampleProblem,
        issues: [],
        interactions: [],
      });
      const res = await request(createApp()).get("/api/v1/submissions/attempt-1").set(authHeader());
      expect(res.status).toBe(200);
      expect(res.body.submission.verdict).toBe("ACCEPTED");
    });

    it("returns 404 for missing submissions", async () => {
      prismaMock.attempt.findFirst.mockResolvedValue(null);
      const res = await request(createApp()).get("/api/v1/submissions/missing").set(authHeader(USER_ID));
      expect(res.status).toBe(404);
    });
  });
});
