import request from "supertest";
import { createApp } from "../../app.js";
import { prismaMock, resetPrismaMock } from "../../test/mocks/db.js";
import { resetRedisMock } from "../../test/mocks/redis.js";
import { passwordHash, publicUser, USER_ID } from "../../test/helpers.js";

describe("auth API", () => {
  beforeEach(() => {
    resetPrismaMock();
    resetRedisMock();
  });

  describe("POST /api/v1/auth/register", () => {
    it("creates an account and returns a token", async () => {
      prismaMock.user.findUnique.mockResolvedValue(null);
      prismaMock.user.create.mockResolvedValue({ ...publicUser, passwordHash: "hash" });
      const res = await request(createApp()).post("/api/v1/auth/register").send({
        email: "ada@example.com",
        password: "password123",
        displayName: "Ada",
      });
      expect(res.status).toBe(200);
      expect(res.body.token).toBeTruthy();
      expect(res.body.user.email).toBe("ada@example.com");
      expect(res.headers["set-cookie"]?.[0]).toMatch(/token=/);
    });

    it("rejects duplicate emails", async () => {
      prismaMock.user.findUnique.mockResolvedValue({ id: USER_ID });
      const res = await request(createApp()).post("/api/v1/auth/register").send({
        email: "ada@example.com",
        password: "password123",
        displayName: "Ada",
      });
      expect(res.status).toBe(409);
      expect(res.body.error.code).toBe("EMAIL_TAKEN");
    });

    it("validates the request body", async () => {
      const res = await request(createApp()).post("/api/v1/auth/register").send({
        email: "not-an-email",
        password: "short",
        displayName: "",
      });
      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe("VALIDATION");
    });
  });

  describe("POST /api/v1/auth/login", () => {
    it("returns a token for valid credentials", async () => {
      const hash = await passwordHash("password123");
      prismaMock.user.findUnique.mockResolvedValue({ ...publicUser, passwordHash: hash });
      const res = await request(createApp()).post("/api/v1/auth/login").send({
        email: "ada@example.com",
        password: "password123",
      });
      expect(res.status).toBe(200);
      expect(res.body.user.id).toBe(USER_ID);
    });

    it("rejects invalid credentials", async () => {
      prismaMock.user.findUnique.mockResolvedValue(null);
      const res = await request(createApp()).post("/api/v1/auth/login").send({
        email: "ada@example.com",
        password: "wrong",
      });
      expect(res.status).toBe(401);
      expect(res.body.error.code).toBe("INVALID_LOGIN");
    });
  });
});
