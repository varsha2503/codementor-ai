#!/usr/bin/env bash
set -eu
cd "$(dirname "$0")/../.."
# shellcheck disable=SC1091
source scripts/deploy/lib.sh

require_database_url
echo "→ prisma migrate deploy (production)"
npm ci
npx prisma generate
npx prisma migrate deploy
echo "✓ Migrations applied."
