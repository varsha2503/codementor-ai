import request from "supertest";
import { createApp } from "./app.js";
import { prismaMock, resetPrismaMock } from "./test/mocks/db.js";
import { redisMock, resetRedisMock } from "./test/mocks/redis.js";

describe("GET /api/v1/health", () => {
  beforeEach(() => {
    resetPrismaMock();
    resetRedisMock();
  });

  it("returns 200 when the database and queue are reachable", async () => {
    prismaMock.$queryRaw.mockResolvedValue([{ "?column?": 1 }]);
    redisMock.ping.mockResolvedValue("PONG");
    const res = await request(createApp()).get("/api/v1/health");
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ ok: true, db: true, queue: true });
  });

  it("returns 503 when either dependency is down", async () => {
    prismaMock.$queryRaw.mockRejectedValue(new Error("db down"));
    redisMock.ping.mockResolvedValue("PONG");
    const res = await request(createApp()).get("/api/v1/health");
    expect(res.status).toBe(503);
    expect(res.body.ok).toBe(false);
    expect(res.body.db).toBe(false);
  });
});
