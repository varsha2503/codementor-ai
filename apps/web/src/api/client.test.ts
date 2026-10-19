import { ApiError, api, getToken, setToken } from "./client";

describe("token storage", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("stores and retrieves the auth token", () => {
    setToken("abc");
    expect(getToken()).toBe("abc");
    setToken(null);
    expect(getToken()).toBeNull();
  });
});

describe("api client", () => {
  beforeEach(() => {
    localStorage.clear();
    jest.restoreAllMocks();
    global.fetch = jest.fn();
  });

  it("sends JSON requests with bearer auth", async () => {
    setToken("secret");
    const fetchMock = jest.spyOn(global, "fetch").mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ ok: true }),
    } as Response);

    const body = await api<{ ok: boolean }>("/api/me", { method: "POST", body: JSON.stringify({}) });
    expect(body.ok).toBe(true);
    const [, init] = fetchMock.mock.calls[0] ?? [];
    const headers = new Headers((init as RequestInit).headers);
    expect(headers.get("Authorization")).toBe("Bearer secret");
    expect(headers.get("Content-Type")).toBe("application/json");
  });

  it("clears the token on 401 and throws ApiError", async () => {
    setToken("secret");
    jest.spyOn(global, "fetch").mockResolvedValue({
      ok: false,
      status: 401,
      json: async () => ({ error: { message: "Sign in again." } }),
    } as Response);

    await expect(api("/api/me")).rejects.toMatchObject({ status: 401, message: "Sign in again." });
    expect(getToken()).toBeNull();
  });

  it("wraps unknown failures in ApiError", async () => {
    jest.spyOn(global, "fetch").mockResolvedValue({
      ok: false,
      status: 500,
      json: async () => ({}),
    } as Response);

    await expect(api("/api/me")).rejects.toBeInstanceOf(ApiError);
  });
});
