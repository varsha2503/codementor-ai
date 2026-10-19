import request from "supertest";
import { createApp } from "../../app.js";
import { authHeader, publicUser, sampleProblem, stubAuthUser, USER_ID } from "../../test/helpers.js";
import { prismaMock, resetPrismaMock } from "../../test/mocks/db.js";
import { resetRedisMock } from "../../test/mocks/redis.js";

describe("users / analytics API", () => {
  beforeEach(() => {
    resetPrismaMock();
    resetRedisMock();
    stubAuthUser();
  });

  describe("GET /api/v1/users/me", () => {
    it("requires authentication", async () => {
      const res = await request(createApp()).get("/api/v1/users/me");
      expect(res.status).toBe(401);
    });

    it("returns the signed-in profile", async () => {
      prismaMock.user.findUnique.mockResolvedValue(publicUser);
      const res = await request(createApp()).get("/api/v1/users/me").set(authHeader());
      expect(res.status).toBe(200);
      expect(res.body.user.displayName).toBe("Ada");
    });
  });

  describe("PATCH /api/v1/users/me", () => {
    it("updates the display name", async () => {
      prismaMock.user.update.mockResolvedValue({ ...publicUser, displayName: "Grace" });
      const res = await request(createApp()).patch("/api/v1/users/me").set(authHeader()).send({ displayName: "Grace" });
      expect(res.status).toBe(200);
      expect(res.body.user.displayName).toBe("Grace");
    });
  });

  describe("GET /api/v1/users/me/attempts", () => {
    it("lists recent attempts", async () => {
      prismaMock.attempt.findMany.mockResolvedValue([
        {
          id: "attempt-1",
          kind: "SUBMIT",
          verdict: "ACCEPTED",
          testsPassed: 4,
          testsTotal: 4,
          runtimeMs: 10,
          createdAt: new Date(),
          problem: { slug: sampleProblem.slug, title: sampleProblem.title, difficulty: "EASY", topics: ["arrays"] },
        },
      ]);
      const res = await request(createApp()).get("/api/v1/users/me/attempts").set(authHeader());
      expect(res.status).toBe(200);
      expect(res.body.attempts).toHaveLength(1);
    });
  });

  describe("GET /api/v1/users/me/analytics", () => {
    it("aggregates progress metrics", async () => {
      prismaMock.attempt.findMany.mockResolvedValue([
        {
          problemId: sampleProblem.id,
          kind: "SUBMIT",
          verdict: "ACCEPTED",
          createdAt: new Date(),
          problem: { id: sampleProblem.id, topics: ["arrays"], difficulty: "EASY" },
        },
      ]);
      prismaMock.aIInteraction.findMany.mockResolvedValue([]);
      prismaMock.attemptIssue.findMany.mockResolvedValue([]);
      prismaMock.problem.findMany.mockResolvedValue([sampleProblem]);
      const res = await request(createApp()).get("/api/v1/users/me/analytics").set(authHeader());
      expect(res.status).toBe(200);
      expect(res.body.solved).toBe(1);
      expect(res.body.topics).toBeDefined();
    });
  });

  describe("GET /api/v1/users/me/recommendations", () => {
    it("returns recommended problems", async () => {
      prismaMock.attempt.findMany.mockResolvedValue([]);
      prismaMock.problem.findMany.mockResolvedValue([sampleProblem, { ...sampleProblem, id: "p2", slug: "other", title: "Other" }]);
      const res = await request(createApp()).get("/api/v1/users/me/recommendations").set(authHeader());
      expect(res.status).toBe(200);
      expect(res.body.problems.length).toBeGreaterThan(0);
    });
  });
});
