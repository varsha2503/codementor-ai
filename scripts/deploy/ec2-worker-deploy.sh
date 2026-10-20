#!/usr/bin/env bash
# Run ON the EC2 instance (or via: ssh ubuntu@HOST 'bash -s' < scripts/deploy/ec2-worker-deploy.sh)
set -eu

APP_DIR="${APP_DIR:-$HOME/codementor}"

sudo mkdir -p /var/codementor-jobs
sudo chmod 1777 /var/codementor-jobs

cd "$APP_DIR"
git fetch origin main
git checkout main
git pull --ff-only origin main

docker build -t codementor-runner:1 workers/judge/docker
docker compose -f docker-compose.worker.yml up -d --build
docker compose -f docker-compose.worker.yml ps

echo "✓ Worker deployed. JUDGE_TMP_ROOT:"
docker compose -f docker-compose.worker.yml exec -T worker printenv JUDGE_TMP_ROOT || true
