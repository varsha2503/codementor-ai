/** Ping health (via same-origin /api proxy) until Render cold start finishes. */
export async function ensureBackendReady(maxWaitMs = 90_000): Promise<void> {
  if (typeof window !== "undefined") {
    const host = window.location.hostname;
    if (host === "localhost" || host === "127.0.0.1") return;
  }

  const started = Date.now();
  while (Date.now() - started < maxWaitMs) {
    try {
      const response = await fetch("/api/v1/health", { credentials: "same-origin" });
      if (response.ok) {
        const body = (await response.json().catch(() => ({}))) as { ok?: boolean };
        if (body.ok) return;
      }
    } catch {
      // 502 / network while services spin up
    }
    await new Promise((resolve) => setTimeout(resolve, 3000));
  }
}
