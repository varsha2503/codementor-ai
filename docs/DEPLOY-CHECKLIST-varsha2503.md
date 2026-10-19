# Deployment checklist (varsha2503)

Architecture: **Render** (Postgres, Redis, API, Web) + **GCP VM** (judge worker only).

---

## Phase A — GitHub (done once)

1. Repo: `https://github.com/varsha2503/codementor-ai`
2. Branch: **`main`** (Render + Actions watch this)
3. **Settings → Secrets and variables → Actions** — add later after Render/GCP:

| Secret | Source |
|--------|--------|
| `DATABASE_URL` | Render Postgres **External** URL |
| `RENDER_DEPLOY_HOOK_API` | Render → codementor-api → Deploy Hook |
| `RENDER_DEPLOY_HOOK_WEB` | Render → codementor-web → Deploy Hook |
| `GCP_SSH_HOST` | GCP VM external IP |
| `GCP_SSH_USER` | e.g. `ubuntu` |
| `GCP_SSH_KEY` | Private key PEM |
| `GCP_APP_DIR` | e.g. `/home/ubuntu/codementor` |

---

## Phase B — Render Blueprint

1. [Render Dashboard](https://dashboard.render.com) → **New** → **Blueprint**
2. Connect **GitHub** → `varsha2503/codementor-ai` → apply **`render.yaml`**
3. Wait for Postgres, Redis, API, Web to deploy (API may fail health until migrate — run migrate below)

### After first deploy

4. Note URLs:
   - API: `https://codementor-api.onrender.com` (name may vary)
   - Web: `https://codementor-web.onrender.com`
5. **codementor-api** → Environment:
   - `WEB_ORIGIN` = web URL (no trailing slash), e.g. `https://codementor-web.onrender.com`
6. **codementor-web** → Environment:
   - `API_UPSTREAM` = API URL, e.g. `https://codementor-api.onrender.com`
7. Redeploy web (and API if you changed WEB_ORIGIN)

### Redis external access (for GCP worker)

8. **codementor-redis** → enable **external** connection if GCP is outside Render private network
9. Copy **External Redis URL** for the VM `.env`

### Migrate database

Either API **preDeployCommand** on redeploy, or locally / GitHub Action:

```bash
export DATABASE_URL='<Render Postgres External URL>'
npm ci && npx prisma migrate deploy
```

### Health check

```bash
curl -s https://<api-host>/api/v1/health | jq .
# ok: true, db: true, queue: true
```

---

## Phase C — GCP VM (worker)

1. **Compute Engine** → Ubuntu 22.04, e2-small recommended, 30GB disk
2. Firewall: **TCP 22** from your IP only
3. SSH in → install Docker (see `docs/DEPLOY.md`)
4. Clone:

```bash
git clone https://github.com/varsha2503/codementor-ai.git ~/codementor
cd ~/codementor
```

5. Create `.env`:

```env
DATABASE_URL=<Render Postgres External URL — same as API>
REDIS_URL=<Render Redis External URL>
RUNNER_IMAGE=codementor-runner:1
```

6. Build runner + start worker:

```bash
docker build -t codementor-runner:1 workers/judge/docker
docker compose -f docker-compose.worker.yml up -d --build
docker compose -f docker-compose.worker.yml logs -f worker
```

7. Add deploy SSH public key → GitHub secret `GCP_SSH_KEY`

---

## Phase D — Verify end-to-end

1. Open **web URL** → register / login
2. **Run** on `count-digits` → verdict should leave QUEUED
3. Push to `main` → GitHub Actions: test → migrate → hooks → GCP worker (when secrets set)

---

## Render deploy hooks (optional)

If Render auto-deploys on git push, hooks are optional. Hooks help run deploy **after** migrate job in Actions.

API → Settings → Deploy Hook → copy URL → `RENDER_DEPLOY_HOOK_API`
