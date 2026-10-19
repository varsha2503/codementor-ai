# Deploy judge worker on AWS EC2 (Render unchanged for API/Web/DB)

Render hosts **Postgres, Redis, API, and Web**. AWS runs **only** the judge worker (Docker + runner image).

**Note:** You create an **EC2** instance; **EBS** is the attached disk (configured below). You do not deploy the worker “on EBS” alone.

---

## Part A — Render changes for AWS (manual, ~5 minutes)

No changes to `WEB_ORIGIN`, `API_UPSTREAM`, or API env vars. The API keeps using **internal** Redis from the Blueprint.

| Render resource | Action |
|-----------------|--------|
| **codementor-api** | None |
| **codementor-web** | None |
| **codementor-postgres** | Copy **External Database URL** for the EC2 `.env` |
| **codementor-redis** | Enable external access + allow **EC2 public IP** |

### Redis (required)

1. **codementor-redis** → **Info** / **Networking**.
2. **Inbound IP allow list** → add your EC2 **Elastic IP** as `x.x.x.x/32` (description: `aws-worker`).
3. Copy the **External Redis URL** (`rediss://...` or `redis://...`).

Use an **Elastic IP** on EC2 so this IP does not change after reboot.

### Postgres

1. **codementor-postgres** → **Connect** → copy **External Database URL** (same URL the API uses, with SSL).

---

## Part B — AWS EC2 + EBS

### Recommended spec

| Setting | Value |
|---------|--------|
| Service | **EC2** → Launch instance |
| Name | `codementor-worker` |
| AMI | **Ubuntu Server 22.04 LTS** |
| Instance type | **t3.small** (2 vCPU, 2 GiB) — use **t3.micro** only for light testing |
| Key pair | Create/download `.pem` (SSH) |
| **EBS root volume** | **30 GiB**, **gp3** (default is fine) |
| Public IP | Assign **Elastic IP** and associate with this instance |

See `infra/aws/README.md` for security group rules.

### Security group

| Direction | Type | Port | Source |
|-----------|------|------|--------|
| Inbound | SSH | 22 | **Your laptop IP**/32 |
| Inbound | — | — | No HTTP/HTTPS required |
| Outbound | All | All | `0.0.0.0/0` (reach Render Postgres/Redis) |

---

## Part C — Install worker on EC2

SSH (replace key, user, host):

```bash
chmod 400 ~/Downloads/codementor-worker.pem
ssh -i ~/Downloads/codementor-worker.pem ubuntu@YOUR_ELASTIC_IP
```

### Option 1 — Automated bootstrap (user data)

When launching the instance, paste contents of `infra/aws/ec2-user-data.sh` into **Advanced → User data** (edit `GITHUB_REPO` if needed). After first boot, SSH in and create `.env` only:

```bash
nano ~/codementor/.env
```

### Option 2 — Manual (copy/paste on the VM)

```bash
sudo apt-get update
sudo apt-get install -y ca-certificates curl git
sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu $(. /etc/os-release && echo $VERSION_CODENAME) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
sudo apt-get update
sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin
sudo usermod -aG docker ubuntu
# log out and SSH back in

git clone https://github.com/varsha2503/codementor-ai.git ~/codementor
cd ~/codementor
nano .env
```

**`.env` on EC2:**

```env
DATABASE_URL=postgresql://...   # Render Postgres External URL
REDIS_URL=rediss://...          # Render Redis External URL
RUNNER_IMAGE=codementor-runner:1
```

**Start worker:**

```bash
cd ~/codementor
docker build -t codementor-runner:1 workers/judge/docker
docker compose -f docker-compose.worker.yml up -d --build
docker compose -f docker-compose.worker.yml logs -f worker
```

Expect: `[worker] listening for execution jobs`.

---

## Part D — Verify

1. `curl -s https://codementor-api.onrender.com/api/v1/health` → `"queue":true`
2. Web app → **Run** on a problem → leaves **QUEUED** and completes.

---

## Part E — GitHub Actions auto-deploy (optional)

Repo secrets (**Settings → Secrets → Actions**):

| Secret | Example |
|--------|---------|
| `AWS_SSH_HOST` | Elastic IP |
| `AWS_SSH_USER` | `ubuntu` |
| `AWS_SSH_KEY` | Private key PEM (same as `.pem` contents) |
| `AWS_APP_DIR` | `/home/ubuntu/codementor` |

Push to `main` → **Deploy** workflow → **aws-worker** job.

---

## Troubleshooting

| Symptom | Fix |
|---------|-----|
| `AUTH failed ... not in the allowlist` | Add Elastic IP to Render Redis allow list |
| Stuck QUEUED | Worker logs; check `REDIS_URL` / `DATABASE_URL` |
| Docker permission denied | Re-login after `usermod -aG docker` |
| IP changed after restart | Use **Elastic IP**; update Render Redis allow list |

---

## Cost (rough)

**t3.small** 24/7 ≈ **$15–20 USD/month** + **30 GiB gp3 EBS** ≈ **$2–3/month**. Stop the instance when not testing to reduce compute (EBS still billed).
