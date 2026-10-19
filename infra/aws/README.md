# AWS infrastructure notes (judge worker EC2)

This folder documents the **minimum AWS setup** for the CodeMentor judge worker. Render runs API/Web/Postgres/Redis.

## EC2 launch checklist

1. **Region:** Any (e.g. `ap-south-1` Mumbai); worker only needs outbound HTTPS to Render.
2. **AMI:** Ubuntu 22.04 LTS (64-bit x86).
3. **Instance type:** `t3.small` (recommended) or `t3.micro` (testing only).
4. **Key pair:** Create → save `.pem` locally.
5. **Network settings:** Create/select security group (see below).
6. **Storage (EBS):**

   | Setting | Value |
   |---------|--------|
   | Root volume size | **30 GiB** |
   | Volume type | **gp3** |
   | Delete on termination | Yes (default for root) |

7. **Elastic IP:** Allocate → Associate with this instance (stable IP for Render Redis allow list).
8. **User data (optional):** Paste `ec2-user-data.sh` under Advanced details.

## Security group (`codementor-worker-sg`)

**Inbound**

| Protocol | Port | Source | Purpose |
|----------|------|--------|---------|
| TCP | 22 | `YOUR_IP/32` | SSH admin |

**Outbound**

| Protocol | Port | Destination | Purpose |
|----------|------|-------------|---------|
| All | All | `0.0.0.0/0` | Render Postgres/Redis, Docker Hub, GitHub |

No inbound 80/443 — the worker does not serve HTTP.

## After launch

Follow **`docs/DEPLOY-AWS.md`**: Render Redis allow list → `.env` on EC2 → `docker compose -f docker-compose.worker.yml up -d --build`.

## IAM

Default **EC2 instance profile** with no extra AWS permissions is enough (worker does not call AWS APIs).
