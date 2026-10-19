# Load testing (k6)

Requires [k6](https://k6.io/docs/get-started/installation/). Use **staging** API credentials, not production users.

## Environment

| Variable | Description |
|----------|-------------|
| `API_BASE` | e.g. `https://codementor-api.onrender.com` |
| `AUTH_TOKEN` | Bearer token from `POST /api/v1/auth/login` |
| `PROBLEM_ID` | Slug or id, default `count-digits` |

## Order of execution

1. `health.js` — API capacity (no auth)
2. `submit-one-per-language.js` — real runner (one VU each language)
3. `submit-concurrent.js` — low concurrency mixed languages
4. `submit-ramp.js` — gradual increase (watch worker queue)
5. `submit-stress.js` — only on staging with confirmed limits

```bash
export API_BASE=https://your-api.onrender.com
export AUTH_TOKEN=...

k6 run scripts/load/health.js
k6 run scripts/load/submit-one-per-language.js
k6 run scripts/load/submit-concurrent.js
k6 run scripts/load/submit-ramp.js
# k6 run scripts/load/submit-stress.js
```

Measure queue wait separately: poll `GET /api/v1/submissions/:id` until terminal verdict and compare timestamps to submission time.

## Multi-user capacity experiment (resume / report)

Creates **10 users**, each k6 VU uses its **own JWT** (avoids per-user 429 conflating global capacity).

**Prerequisites:** API + Postgres + Redis + worker + runner image; `jq`, `k6`.

```bash
export API_BASE=http://localhost:4000

# 1) Register 10 test users → scripts/load/tokens.json (gitignored)
npm run load:seed-users

# 2) 10 VUs, GET /problems, 2 minutes
npm run load:experiment:read
# Read the "Resume line" printed at the end (p95, error rate)

# 3) 10 VUs, POST run every ~5s + poll until verdict (queue wait + ACCEPTED rate)
npm run load:experiment:run
# Read queue_wait_ms p95 and 429 count in summary
```

Optional env: `VUS=10`, `DURATION=2m`, `PROBLEM_ID=count-digits`, `POLL_MAX_SEC=90`.

**Interpretation:**

- **Read test:** how many concurrent **browsing** users this host handles (thresholds: &lt;2% errors, p95 &lt;2s).
- **Run test:** **10 concurrent runners** on **1 worker** → expect **queue wait p95** ≫ single-run ~1s; **429** should stay **low** (separate tokens). ACCEPTED rate should stay high if worker + Docker healthy.
