# Production release playbook (Render + AWS worker)

Use this when you change **code/UI**, **add problems**, or **update test cases**.

| What changed | What to run |
|--------------|-------------|
| API / Web / shared TS | Push `main` → CI + Deploy (Render rebuilds if connected) |
| New Prisma migration | Push `main` → Deploy **migrate** job, or `npm run deploy:migrate` locally |
| New/changed problems in `problems/manifests/` | `npm run deploy:seed` (production `DATABASE_URL`) |
| Judge / worker / runner | Push `main` → Deploy **aws-worker** job, or SSH script on EC2 |
| Sheet JSON only (`problems/catalog/`) | Redeploy **codementor-api** on Render (catalog files ship in API image) |

---

## One-time GitHub secrets

Repository: **varsha2503/codementor-ai** → Settings → Secrets → Actions

| Secret | Purpose |
|--------|---------|
| `DATABASE_URL` | Render Postgres **External** URL (`?sslmode=require`) |
| `RENDER_DEPLOY_HOOK_API` | Optional; API manual deploy hook |
| `RENDER_DEPLOY_HOOK_WEB` | Optional; Web manual deploy hook |
| `AWS_SSH_HOST` | EC2 public IP |
| `AWS_SSH_USER` | e.g. `ubuntu` |
| `AWS_SSH_KEY` | PEM private key |
| `AWS_APP_DIR` | e.g. `/home/ubuntu/codementor` |

Render env (dashboard, not GitHub):

| Service | Variable |
|---------|----------|
| **codementor-web** | `API_UPSTREAM=https://codementor-api-9gkf.onrender.com` |
| **codementor-api** | `WEB_ORIGIN=https://codementor-web.onrender.com` |

---

## Standard release (code or UI)

1. Commit and push to **`main`**.
2. GitHub **Actions → Deploy** runs: test → migrate → (optional hooks) → EC2 worker.
3. If Render auto-deploy is off, trigger deploy hooks or **Manual Deploy** on API + Web.
4. Smoke test:
   - `curl -s https://codementor-api-9gkf.onrender.com/api/v1/health`
   - Login on https://codementor-web.onrender.com
   - **Run** on a problem (2 sample tests)

---

## Add or update problems / test cases

1. Edit manifests under `problems/manifests/` (and run `npm test` locally).
2. Push to `main` (migrations only if you changed `prisma/schema.prisma`).
3. **Seed production DB** (from your Mac):

```bash
export DATABASE_URL='postgresql://...@dpg-....oregon-postgres.render.com/codementor_wrj9?sslmode=require'
npm run deploy:seed
```

Or use `.env` with the same URL and run `npm run deploy:seed`.

Takes **15–45+ minutes** on Render Postgres (446 problems). Do not cancel.

**Manual seed from GitHub:** Actions → **Deploy** → **Run workflow** → check **Seed problems and test cases**.

---

## Deploy worker only (EC2)

SSH:

```bash
bash ~/codementor/scripts/deploy/ec2-worker-deploy.sh
```

Or push to `main` with `AWS_SSH_*` secrets set (Deploy workflow **aws-worker** job).

---

## Local commands (summary)

```bash
npm run deploy:migrate   # DATABASE_URL → prisma migrate deploy
npm run deploy:seed      # migrate + prisma db seed (problems + test cases)
```

---

## Troubleshooting

| Symptom | Check |
|---------|--------|
| 0/0 tests, Runner error | EC2: `/var/codementor-jobs`, `JUDGE_TMP_ROOT`, `codementor-runner:1` |
| Stuck QUEUED | Worker logs; Redis `PONG` from EC2; allow list IP |
| Sheet 500 | Redeploy API (needs `problems/catalog` in image) |
| Login 500 | `npx prisma migrate deploy` on production |

See also: [DEPLOY-AWS.md](./DEPLOY-AWS.md), [DEPLOY.md](./DEPLOY.md).
