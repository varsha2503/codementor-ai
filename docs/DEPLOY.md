# Deploy: Render (Postgres, Redis, API, Web) + GCP (judge worker)

## Architecture

| Component | Platform |
|-----------|----------|
| PostgreSQL | Render Postgres |
| Redis | Render Key Value (Redis) |
| API | Render Web Service (`apps/api/Dockerfile`) |
| Web | Render Web Service (`apps/web/Dockerfile`) |
| Judge worker + runner | GCP Compute Engine VM |

API and worker use the **same** `DATABASE_URL` and `REDIS_URL`. The web container proxies `/api` to the Render API URL via `API_UPSTREAM`.

---

## Part 1 — GitHub

1. Create a repository and push this monorepo.
2. Later add **Actions secrets** (Settings → Secrets and variables → Actions):

| Secret | Purpose |
|--------|---------|
| `DATABASE_URL` | Render Postgres **External** connection string (for `prisma migrate deploy` in CI) |
| `RENDER_DEPLOY_HOOK_API` | Optional; from Render API service → Settings → Deploy Hook |
| `RENDER_DEPLOY_HOOK_WEB` | Optional; from Render Web service → Deploy Hook |
| `GCP_SSH_HOST` | VM public IP or hostname |
| `GCP_SSH_USER` | e.g. `ubuntu` |
| `GCP_SSH_KEY` | Private key (PEM) for SSH |
| `GCP_APP_DIR` | Optional; repo path on VM, default `~/codementor` |

Render can also **auto-deploy on push** when the repo is connected; deploy hooks are optional if auto-deploy is enabled.

---

## Part 2 — Render (Postgres, Redis, API, Web)

### Option A — Blueprint (`render.yaml`)

1. Render Dashboard → **New** → **Blueprint**.
2. Connect the GitHub repo; apply `render.yaml`.
3. After services exist, open **codementor-api** → Environment:
   - Set **`WEB_ORIGIN`** to the web service URL, e.g. `https://codementor-web.onrender.com` (no trailing slash).
4. Open **codementor-web** → Environment:
   - Set **`API_UPSTREAM`** to the API URL, e.g. `https://codementor-api.onrender.com` (no trailing slash).

### Option B — Manual services

1. **PostgreSQL** — New → PostgreSQL (free). Note **External Database URL**.
2. **Redis** — New → Key Value (free). Note **Internal/External Redis URL** (use the connection string Render shows; often `rediss://...`).
3. **API** — New → Web Service → Docker:
   - Build context: repository root.
   - Dockerfile: `apps/api/Dockerfile`.
   - Env: `DATABASE_URL`, `REDIS_URL`, `JWT_SECRET`, `PORT=4000`, `WEB_ORIGIN`, optional `LLM_*`.
   - Health check path: `/api/v1/health`.
4. **Web** — New → Web Service → Docker:
   - Dockerfile: `apps/web/Dockerfile`.
   - Env: `API_UPSTREAM=https://<your-api>.onrender.com`.

### First database migration

From your laptop (once), or rely on GitHub Actions after `DATABASE_URL` secret is set:

```bash
export DATABASE_URL="<Render Postgres external URL>"
npm ci
npx prisma migrate deploy
```

Optional seed (usually skip in production):

```bash
npx prisma db seed
```

### Verify Render

1. `curl https://<api>.onrender.com/api/v1/health` → `{"ok":true,"db":true,"queue":true}`.
2. Open `https://<web>.onrender.com` → sign up / log in.

---

## Part 3 — GCP VM (worker + runner)

### 3.1 Create VM

1. Google Cloud Console → Compute Engine → VM instances → Create.
2. **e2-micro** (or e2-small if runs OOM), Ubuntu 22.04/24.04, 30 GB disk.
3. Firewall: allow **TCP 22** from your IP only (worker needs no public HTTP).
4. Note the **external IP**.

### 3.2 Install Docker on the VM

```bash
sudo apt-get update
sudo apt-get install -y ca-certificates curl git
sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu $(. /etc/os-release && echo $VERSION_CODENAME) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
sudo apt-get update
sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin
sudo usermod -aG docker "$USER"
# log out and back in
```

### 3.3 Clone repo and configure env

```bash
git clone https://github.com/<you>/<repo>.git ~/codementor
cd ~/codementor
cp .env.example .env
```

Edit `.env` on the VM (**only what the worker needs**):

```env
DATABASE_URL=<same Render Postgres URL as API — use External URL with SSL>
REDIS_URL=<same Render Redis URL as API>
RUNNER_IMAGE=codementor-runner:1
```

Use the **same** `DATABASE_URL` and `REDIS_URL` as the Render API service. If Redis is internal-only on Render, allow **external** access for the Key Value instance or use the external connection string Render provides.

### 3.4 Build runner image and start worker

```bash
cd ~/codementor
docker build -t codementor-runner:1 workers/judge/docker
docker compose -f docker-compose.worker.yml up -d --build
docker compose -f docker-compose.worker.yml logs -f worker
```

You should see: `[worker] listening for execution jobs`.

### 3.5 SSH key for GitHub Actions

On your laptop:

```bash
ssh-keygen -t ed25519 -f gcp_deploy -N ""
# Add gcp_deploy.pub to VM ~/.ssh/authorized_keys
```

Add **`GCP_SSH_KEY`** = contents of `gcp_deploy` (private key) to GitHub Secrets.

---

## Part 4 — CI/CD (GitHub Actions)

Workflows in `.github/workflows/`:

| Workflow | When | What |
|----------|------|------|
| **ci.yml** | Every PR and push | `npm ci`, `prisma generate`, `npm test` |
| **deploy.yml** | Push to `main` (+ manual) | test → `prisma migrate deploy` → optional Render hooks → SSH GCP worker redeploy |

### Enable deploy pipeline

1. Add GitHub secret **`DATABASE_URL`** (Render Postgres external URL).
2. Add GCP SSH secrets (see above).
3. Push to **`main`**.

If Render is connected to GitHub with auto-deploy, API/Web rebuild on push without deploy hooks. Hooks are still useful to **order** deploy after migrate.

### Recommended order on each release

1. CI tests pass.
2. Migrations applied (`deploy.yml` **migrate** job).
3. Render redeploys API + Web.
4. GCP worker pulls latest code and rebuilds (`deploy.yml` **gcp-worker** job).

---

## Part 5 — End-to-end smoke test

1. Health: API returns `ok: true`.
2. In the app: open a problem → **Run** (sample tests).
3. Submission should leave `QUEUED` and finish (check worker logs on GCP if stuck).

Common issues:

| Symptom | Fix |
|---------|-----|
| Health `queue: false` | Wrong `REDIS_URL` on API; Redis not reachable from Render |
| Stuck `QUEUED` | Worker down, wrong Redis/Postgres on VM, or runner image missing |
| CORS errors | `WEB_ORIGIN` must exactly match web URL (scheme + host, no path) |
| 502 on `/api` | `API_UPSTREAM` on web service wrong or API sleeping (Render free tier) |

---

## Environment reference

| Variable | API (Render) | Web (Render) | Worker (GCP) |
|----------|--------------|--------------|--------------|
| `DATABASE_URL` | yes | no | yes |
| `REDIS_URL` | yes | no | yes |
| `JWT_SECRET` | yes | no | no |
| `WEB_ORIGIN` | yes | no | no |
| `PORT` | yes (`4000`) | no | no |
| `API_UPSTREAM` | no | yes | no |
| `RUNNER_IMAGE` | no | no | yes |
| `LLM_*` | optional | no | no |
