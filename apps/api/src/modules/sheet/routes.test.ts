import request from "supertest";
import { createApp } from "../../app.js";
import { authHeader, stubAuthUser } from "../../test/helpers.js";
import { prismaMock, resetPrismaMock } from "../../test/mocks/db.js";
import { resetRedisMock } from "../../test/mocks/redis.js";

describe("GET /api/v1/sheet", () => {
  beforeEach(() => {
    resetPrismaMock();
    resetRedisMock();
    stubAuthUser();
  });

  it("requires authentication", async () => {
    const res = await request(createApp()).get("/api/v1/sheet");
    expect(res.status).toBe(401);
  });

  it("returns grouped sheet progress", async () => {
    prismaMock.attempt.findMany.mockResolvedValue([
      { verdict: "ACCEPTED", problem: { slug: "pair-target" } },
      { verdict: "WRONG_ANSWER", problem: { slug: "reverse-array" } },
    ]);
    const res = await request(createApp()).get("/api/v1/sheet").set(authHeader());
    expect(res.status).toBe(200);
    expect(res.body.title).toContain("Striver");
    expect(res.body.summary.total).toBeGreaterThan(0);
    expect(res.body.summary.practicable).toBeGreaterThan(200);
    expect(Array.isArray(res.body.topics)).toBe(true);
    expect(res.body.topics[0]?.subtopics?.length).toBeGreaterThan(0);
  });
});
