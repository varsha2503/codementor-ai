#!/usr/bin/env bash
set -eu
cd "$(dirname "$0")/../.."
# shellcheck disable=SC1091
source scripts/deploy/lib.sh

require_database_url
echo "→ prisma migrate deploy"
npm ci
npx prisma generate
npx prisma migrate deploy
echo "→ prisma db seed (all manifests → problems + test cases; may take 15–45+ min)"
npx prisma db seed
echo "✓ Seed complete."
