import request from "supertest";
import { createApp } from "../../app.js";
import { authHeader, sampleProblem, stubAuthUser, USER_ID } from "../../test/helpers.js";
import { prismaMock, resetPrismaMock } from "../../test/mocks/db.js";
import { redisMock, resetRedisMock } from "../../test/mocks/redis.js";

const validCode = "class Solution { public: vector<int> twoSum(vector<int>& nums, int target) { return {}; } };";

describe("AI API", () => {
  beforeEach(() => {
    resetPrismaMock();
    resetRedisMock();
    stubAuthUser();
  });

  describe("GET /api/v1/ai/hints", () => {
    it("returns stored hints for a problem", async () => {
      prismaMock.problem.findFirst.mockResolvedValue({ id: sampleProblem.id });
      prismaMock.aIInteraction.findMany.mockResolvedValue([
        {
          response: { hintLevel: 1, hint: "Think about pairs.", concept: "Conceptual nudge", nextStep: "Try an example." },
        },
      ]);
      const res = await request(createApp()).get("/api/v1/ai/hints").query({ problemId: sampleProblem.slug }).set(authHeader());
      expect(res.status).toBe(200);
      expect(res.body.hints[0].hintLevel).toBe(1);
    });
  });

  describe("POST /api/v1/ai/hints", () => {
    it("creates the next hint level", async () => {
      prismaMock.problem.findFirst.mockResolvedValue(sampleProblem);
      prismaMock.aIInteraction.findMany.mockResolvedValue([]);
      prismaMock.attempt.findFirst.mockResolvedValue(null);
      prismaMock.aIInteraction.create.mockResolvedValue({ id: "hint-1" });
      const res = await request(createApp())
        .post("/api/v1/ai/hints")
        .set(authHeader())
        .send({ problemId: sampleProblem.id, code: validCode });
      expect(res.status).toBe(200);
      expect(res.body.hintLevel).toBe(1);
      expect(prismaMock.aIInteraction.create).toHaveBeenCalled();
    });
  });

  describe("POST /api/v1/ai/analyze", () => {
    it("returns analysis and classification", async () => {
      prismaMock.problem.findFirst.mockResolvedValue(sampleProblem);
      prismaMock.attempt.findFirst.mockResolvedValue({
        id: "attempt-1",
        verdict: "WRONG_ANSWER",
        testsPassed: 1,
        testsTotal: 2,
        message: null,
        compileOutput: null,
        testSummary: [],
        issues: [],
      });
      prismaMock.aIInteraction.create.mockResolvedValue({ id: "analysis-1" });
      const res = await request(createApp())
        .post("/api/v1/ai/analyze")
        .set(authHeader())
        .send({ problemId: sampleProblem.slug, code: validCode });
      expect(res.status).toBe(200);
      expect(res.body.analysis.estimatedTimeComplexity).toBeTruthy();
      expect(res.body.classification.category).toBeTruthy();
    });
  });

  describe("GET /api/v1/ai/interview", () => {
    it("returns interview turns for a problem", async () => {
      prismaMock.problem.findFirst.mockResolvedValue({ id: sampleProblem.id, title: sampleProblem.title });
      prismaMock.aIInteraction.findFirst.mockResolvedValue(null);
      prismaMock.aIInteraction.create.mockResolvedValue({ id: "open" });
      prismaMock.aIInteraction.findMany.mockResolvedValue([
        {
          response: {
            role: "interviewer",
            stage: "introduction",
            message: "Welcome.",
            followUp: "Ready?",
          },
        },
      ]);
      const res = await request(createApp()).get("/api/v1/ai/interview").query({ problemId: sampleProblem.id }).set(authHeader());
      expect(res.status).toBe(200);
      expect(res.body.stage).toBe("introduction");
    });
  });

  describe("POST /api/v1/ai/interview", () => {
    it("rejects empty candidate messages", async () => {
      prismaMock.problem.findFirst.mockResolvedValue(sampleProblem);
      const res = await request(createApp())
        .post("/api/v1/ai/interview")
        .set(authHeader())
        .send({ problemId: sampleProblem.id, message: "  " });
      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe("EMPTY_MESSAGE");
    });

    it("rejects invalid client turn ids", async () => {
      const res = await request(createApp())
        .post("/api/v1/ai/interview")
        .set(authHeader())
        .send({ problemId: sampleProblem.id, clientTurnId: "bad", message: "hello" });
      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe("INVALID_TURN");
    });

    it("persists a candidate turn and returns updated interview state", async () => {
      prismaMock.problem.findFirst.mockResolvedValue(sampleProblem);
      prismaMock.aIInteraction.findFirst.mockResolvedValue({ id: "open" });
      prismaMock.aIInteraction.findMany.mockResolvedValue([
        {
          response: {
            role: "interviewer",
            stage: "introduction",
            message: "Welcome.",
            followUp: "Ready?",
          },
        },
      ]);
      prismaMock.attempt.findFirst.mockResolvedValue(null);
      prismaMock.aIInteraction.create.mockResolvedValue({ id: "saved" });
      redisMock.set.mockResolvedValue("OK");
      const res = await request(createApp())
        .post("/api/v1/ai/interview")
        .set(authHeader())
        .send({ problemId: sampleProblem.slug, message: "I'm ready." });
      expect(res.status).toBe(200);
      expect(["introduction", "understanding", "approach", "coding", "complexity", "feedback"]).toContain(res.body.stage);
      expect(res.body.turns.length).toBeGreaterThan(0);
      expect(prismaMock.$transaction).toHaveBeenCalled();
    });

    it("resets a problem interview", async () => {
      prismaMock.problem.findFirst.mockResolvedValue(sampleProblem);
      prismaMock.aIInteraction.deleteMany.mockResolvedValue({ count: 3 });
      prismaMock.aIInteraction.findFirst.mockResolvedValue(null);
      prismaMock.aIInteraction.create.mockResolvedValue({ id: "open" });
      prismaMock.aIInteraction.findMany.mockResolvedValue([
        {
          response: {
            role: "interviewer",
            stage: "introduction",
            message: "Fresh.",
            followUp: "Ready?",
          },
        },
      ]);
      const res = await request(createApp())
        .post("/api/v1/ai/interview")
        .set(authHeader())
        .send({ problemId: sampleProblem.id, reset: true });
      expect(res.status).toBe(200);
      expect(res.body.stage).toBe("introduction");
    });
  });
});
