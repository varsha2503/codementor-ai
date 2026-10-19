#!/bin/bash
# EC2 user data (Ubuntu 22.04): install Docker, clone CodeMentor repo.
# Paste into Launch instance → Advanced details → User data.
# You must still create ~/codementor/.env with DATABASE_URL and REDIS_URL from Render.

set -eu
export DEBIAN_FRONTEND=noninteractive

GITHUB_REPO="${GITHUB_REPO:-https://github.com/varsha2503/codementor-ai.git}"
APP_DIR="/home/ubuntu/codementor"

apt-get update
apt-get install -y ca-certificates curl git
install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg
echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu $(. /etc/os-release && echo "$VERSION_CODENAME") stable" \
  > /etc/apt/sources.list.d/docker.list
apt-get update
apt-get install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin
usermod -aG docker ubuntu

if [ ! -d "$APP_DIR/.git" ]; then
  sudo -u ubuntu git clone "$GITHUB_REPO" "$APP_DIR"
fi

cat > /home/ubuntu/WORKER-SETUP.txt <<'EOF'
Next steps (SSH as ubuntu):
1. Create /home/ubuntu/codementor/.env with DATABASE_URL, REDIS_URL, RUNNER_IMAGE=codementor-runner:1
2. Add this EC2 Elastic IP to Render codementor-redis inbound allow list
3. cd ~/codementor && docker build -t codementor-runner:1 workers/judge/docker
4. docker compose -f docker-compose.worker.yml up -d --build
EOF
chown ubuntu:ubuntu /home/ubuntu/WORKER-SETUP.txt
