import {
  canonicalStage,
  loginSchema,
  registerSchema,
  validateSource,
} from "./schemas/index.js";

describe("canonicalStage", () => {
  it("accepts normalized stage names", () => {
    expect(canonicalStage("coding")).toBe("coding");
    expect(canonicalStage("  APPROACH  ")).toBe("approach");
    expect(canonicalStage("understanding")).toBe("understanding");
  });

  it("maps legacy stage aliases", () => {
    expect(canonicalStage("clarify")).toBe("understanding");
    expect(canonicalStage("code")).toBe("coding");
    expect(canonicalStage("debrief")).toBe("feedback");
  });

  it("rejects unknown values", () => {
    expect(canonicalStage("solve")).toBeNull();
    expect(canonicalStage(null)).toBeNull();
  });
});

describe("auth schemas", () => {
  it("requires a valid email and minimum password length on register", () => {
    expect(registerSchema.safeParse({ email: "bad", password: "short", displayName: "Ada" }).success).toBe(false);
    expect(
      registerSchema.safeParse({ email: "ada@example.com", password: "longenough", displayName: "Ada" }).success,
    ).toBe(true);
  });

  it("accepts login credentials with any non-empty password", () => {
    expect(loginSchema.safeParse({ email: "ada@example.com", password: "x" }).success).toBe(true);
  });
});

describe("validateSource", () => {
  it("rejects user-supplied main and null bytes", () => {
    expect(validateSource("int main() {}")).toMatch(/Solution method/);
    expect(validateSource("class Solution {};\0")).toMatch(/null byte/);
  });
});
