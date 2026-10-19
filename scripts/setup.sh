#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."

if [[ ! -f .env ]]; then
  cp .env.example .env
  echo "Created .env from .env.example"
fi

docker compose up -d postgres redis
echo "Waiting for Postgres..."
until docker compose exec -T postgres pg_isready -U codementor -d codementor >/dev/null 2>&1; do
  sleep 1
done

npm install
npm run db:generate
npm run db:migrate
npm run db:seed
npm run runner:build
echo "CodeMentor is ready. Start it with: npm run dev"
