# Find maximum capacity (3 scenarios)

## Prerequisites

```bash
export API_BASE=http://localhost:4000
docker compose up -d postgres redis
npm run dev   # api + worker + web
npm run runner:build
```

---

## 1. Browsing — max concurrent read users

**Limit:** API CPU, Postgres, RAM — **not** a fixed number in code.

**Method:** Ramp VUs until p95 ≥ 2s or errors ≥ 2%.

```bash
# Seed enough accounts (≥ peak VUs you plan to test)
COUNT=50 npm run load:seed-users

# Start at peak 50; increase until RESULT says thresholds FAILED
PEAK_VUS=50 npm run load:find-max:read

# Bisect: if 50 passed, try 75, then 100
PEAK_VUS=75 npm run load:find-max:read
PEAK_VUS=100 npm run load:find-max:read
```

**Max users (browse)** = highest `PEAK_VUS` where summary says **Thresholds HELD** and p95 stays &lt; 2s.

Your baseline: **10 VUs, p95 ~20 ms, 0% errors** — headroom is large locally.

---

## 2. Run/Submit — concurrent runners on one worker

**Hard limit in code:** **1 execution at a time** per worker (`concurrency: 1`).

**What you measure:** How many users can **click Run** at once before **queue wait** or **ACCEPTED rate** breaks your SLO (default: p95 queue &lt; 15s, ACCEPTED &gt; 90%).

```bash
COUNT=30 npm run load:seed-users

PEAK_VUS=15 npm run load:find-max:run
PEAK_VUS=20 npm run load:find-max:run
PEAK_VUS=30 npm run load:find-max:run
```

**Max concurrent runners (practical)** = highest `PEAK_VUS` with acceptable queue p95 — **not** “parallel sandboxes.”

Your baseline: **10 runners, queue p95 ~3 s, 100% ACCEPTED**.

To increase parallel execution you must **scale workers** or raise worker `concurrency` (RAM).

---

## 3. Per-user spam — rate limits (fixed in code)

**Limits:** **20 runs/min**, **10 submits/min** per user (Redis).

```bash
npm run load:seed-users   # uses first user’s token

KIND=run npm run load:test:rate-limit
KIND=submit npm run load:test:rate-limit
```

**Expected:** ~20 (or ~10) × **202**, then mostly **429**. That **is** the maximum — not load-dependent.

Optional faster hammer:

```bash
INTERVAL_SEC=0.1 DURATION=90s KIND=run npm run load:test:rate-limit
```

---

## Quick reference

| Scenario | Max in repo | How to find number |
|----------|-------------|-------------------|
| Browsing | No cap in code | `load:find-max:read` + raise `PEAK_VUS` |
| Run queue | 1 sandbox at a time | `load:find-max:run` + queue p95 / ACCEPTED |
| Per-user runs | **20/min** | `load:test:rate-limit` KIND=run |
| Per-user submits | **10/min** | `load:test:rate-limit` KIND=submit |
