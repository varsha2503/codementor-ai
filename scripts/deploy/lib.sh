#!/usr/bin/env bash
# Shared helpers for production deploy scripts.

require_database_url() {
  if [ -z "${DATABASE_URL:-}" ]; then
    if [ -f .env ]; then
      set -a
      # shellcheck disable=SC1091
      source .env
      set +a
    fi
  fi
  if [ -z "${DATABASE_URL:-}" ]; then
    echo "ERROR: Set DATABASE_URL to Render Postgres External URL (with ?sslmode=require)." >&2
    exit 1
  fi
  if [[ "$DATABASE_URL" == *localhost* ]] || [[ "$DATABASE_URL" == *127.0.0.1* ]]; then
    echo "ERROR: DATABASE_URL looks local. Use production Render External URL." >&2
    exit 1
  fi
}
