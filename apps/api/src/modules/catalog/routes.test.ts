import request from "supertest";
import { createApp } from "../../app.js";
import { authHeader, stubAuthUser } from "../../test/helpers.js";
import { prismaMock, resetPrismaMock } from "../../test/mocks/db.js";
import { resetRedisMock } from "../../test/mocks/redis.js";

const catalogEntry = {
  id: "cat-1",
  source: "leetcode",
  externalSlug: "two-sum",
  externalId: null,
  title: "Two Sum",
  difficulty: "EASY",
  topics: ["arrays"],
  tags: [],
  canonicalUrl: "https://leetcode.com/problems/two-sum/",
  licenseStatus: "LINK_ONLY",
  permissionNote: "Metadata only.",
  attribution: null,
  importStatus: "IMPORTED",
  importedAt: new Date(),
  problemId: null,
  problem: null,
};

describe("catalog API", () => {
  beforeEach(() => {
    resetPrismaMock();
    resetRedisMock();
    stubAuthUser();
  });

  describe("GET /api/v1/catalog", () => {
    it("lists imported catalog entries", async () => {
      prismaMock.problemCatalogEntry.count.mockResolvedValue(1);
      prismaMock.problemCatalogEntry.findMany.mockResolvedValue([
        { ...catalogEntry, problem: null },
      ]);
      const res = await request(createApp()).get("/api/v1/catalog").set(authHeader());
      expect(res.status).toBe(200);
      expect(res.body.entries).toHaveLength(1);
      expect(res.body.total).toBe(1);
    });
  });

  describe("GET /api/v1/catalog/:source/:slug", () => {
    it("returns a catalog entry", async () => {
      prismaMock.problemCatalogEntry.findUnique.mockResolvedValue(catalogEntry);
      const res = await request(createApp()).get("/api/v1/catalog/leetcode/two-sum").set(authHeader());
      expect(res.status).toBe(200);
      expect(res.body.entry.externalSlug).toBe("two-sum");
      expect(res.body.entry.statementStored).toBe(false);
    });

    it("returns 404 when not imported", async () => {
      prismaMock.problemCatalogEntry.findUnique.mockResolvedValue(null);
      const res = await request(createApp()).get("/api/v1/catalog/leetcode/missing").set(authHeader());
      expect(res.status).toBe(404);
    });
  });

  describe("GET /api/v1/catalog/:source/:slug/interview", () => {
    it("returns 409 when the entry is backed by a local problem", async () => {
      prismaMock.problemCatalogEntry.findUnique.mockResolvedValue({
        ...catalogEntry,
        problemId: "problem-1",
        problem: { slug: "pair-target", title: "Pair Target" },
      });
      const res = await request(createApp()).get("/api/v1/catalog/leetcode/two-sum/interview").set(authHeader());
      expect(res.status).toBe(409);
      expect(res.body.error.code).toBe("USE_LOCAL_PROBLEM");
    });

    it("opens a catalog interview session", async () => {
      prismaMock.problemCatalogEntry.findUnique.mockResolvedValue(catalogEntry);
      prismaMock.aIInteraction.findFirst.mockResolvedValue(null);
      prismaMock.aIInteraction.create.mockResolvedValue({ id: "turn-1" });
      prismaMock.aIInteraction.findMany.mockResolvedValue([
        {
          response: {
            role: "interviewer",
            stage: "introduction",
            message: 'I\'m your interviewer for "Two Sum".',
            followUp: "Say when you are ready.",
          },
        },
      ]);
      const res = await request(createApp()).get("/api/v1/catalog/leetcode/two-sum/interview").set(authHeader());
      expect(res.status).toBe(200);
      expect(res.body.stage).toBe("introduction");
      expect(res.body.turns.length).toBeGreaterThan(0);
    });
  });

  describe("POST /api/v1/catalog/:source/:slug/interview", () => {
    it("rejects empty messages", async () => {
      prismaMock.problemCatalogEntry.findUnique.mockResolvedValue(catalogEntry);
      const res = await request(createApp())
        .post("/api/v1/catalog/leetcode/two-sum/interview")
        .set(authHeader())
        .send({ message: "   " });
      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe("EMPTY_MESSAGE");
    });

    it("records a candidate turn and interviewer reply", async () => {
      prismaMock.problemCatalogEntry.findUnique.mockResolvedValue(catalogEntry);
      prismaMock.aIInteraction.findFirst.mockResolvedValue({ id: "existing" });
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
      prismaMock.aIInteraction.create.mockResolvedValue({ id: "saved" });
      const res = await request(createApp())
        .post("/api/v1/catalog/leetcode/two-sum/interview")
        .set(authHeader())
        .send({ message: "I'm ready." });
      expect(res.status).toBe(200);
      expect(res.body.turns.length).toBeGreaterThan(0);
      expect(prismaMock.$transaction).toHaveBeenCalled();
    });

    it("resets the interview transcript", async () => {
      prismaMock.problemCatalogEntry.findUnique.mockResolvedValue(catalogEntry);
      prismaMock.aIInteraction.deleteMany.mockResolvedValue({ count: 2 });
      prismaMock.aIInteraction.findFirst.mockResolvedValue(null);
      prismaMock.aIInteraction.create.mockResolvedValue({ id: "open" });
      prismaMock.aIInteraction.findMany.mockResolvedValue([
        {
          response: {
            role: "interviewer",
            stage: "introduction",
            message: "Fresh start.",
            followUp: "Ready?",
          },
        },
      ]);
      const res = await request(createApp())
        .post("/api/v1/catalog/leetcode/two-sum/interview")
        .set(authHeader())
        .send({ reset: true });
      expect(res.status).toBe(200);
      expect(res.body.stage).toBe("introduction");
      expect(prismaMock.aIInteraction.deleteMany).toHaveBeenCalled();
    });
  });
});
