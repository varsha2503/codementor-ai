import jwt from "jsonwebtoken";
import { HttpError, errorHandler, readUserId, signToken } from "./http.js";

function mockResponse() {
  const res = {
    statusCode: 200,
    body: undefined as unknown,
    status(code: number) {
      this.statusCode = code;
      return this;
    },
    json(payload: unknown) {
      this.body = payload;
      return this;
    },
  };
  return res;
}

describe("token helpers", () => {
  it("signs and verifies a user id", () => {
    const token = signToken("user-1");
    expect(readUserId(token)).toBe("user-1");
  });

  it("returns null for invalid tokens", () => {
    expect(readUserId("not-a-jwt")).toBeNull();
  });
});

describe("errorHandler", () => {
  it("formats HttpError responses", () => {
    const res = mockResponse();
    errorHandler(new HttpError(403, "Forbidden", "FORBIDDEN"), {} as never, res as never, () => {});
    expect(res.statusCode).toBe(403);
    expect(res.body).toEqual({ error: { code: "FORBIDDEN", message: "Forbidden" } });
  });

  it("maps tagged errors with status fields", () => {
    const res = mockResponse();
    errorHandler({ status: 429, message: "Slow down", code: "RATE" }, {} as never, res as never, () => {});
    expect(res.body).toEqual({ error: { code: "RATE", message: "Slow down" } });
  });

  it("falls back to internal errors", () => {
    const res = mockResponse();
    const spy = jest.spyOn(console, "error").mockImplementation(() => {});
    errorHandler(new Error("boom"), {} as never, res as never, () => {});
    expect(res.statusCode).toBe(500);
    expect(res.body).toEqual({ error: { code: "INTERNAL", message: "Something went wrong." } });
    spy.mockRestore();
  });
});

describe("signToken configuration", () => {
  const original = process.env.JWT_SECRET;

  afterEach(() => {
    process.env.JWT_SECRET = original;
  });

  it("throws when JWT_SECRET is missing", () => {
    delete process.env.JWT_SECRET;
    expect(() => signToken("user-1")).toThrow(HttpError);
  });
});

describe("readUserId payload shape", () => {
  it("ignores tokens whose subject is not a string", () => {
    const secret = process.env.JWT_SECRET ?? "jest-test-jwt-secret";
    const token = jwt.sign({ sub: 123 }, secret);
    expect(readUserId(token)).toBeNull();
  });
});
