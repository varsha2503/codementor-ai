#!/usr/bin/env bash
# Create N load-test users and write JWTs to scripts/load/tokens.json
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
API_BASE="${API_BASE:-http://localhost:4000}"
COUNT="${COUNT:-10}"
PASSWORD="${LOADTEST_PASSWORD:-loadtest123456}"
OUT="${OUT:-$ROOT/scripts/load/tokens.json}"

if ! command -v jq >/dev/null 2>&1; then
  echo "jq is required. Install: brew install jq"
  exit 1
fi

echo "API_BASE=$API_BASE"
echo "Creating or logging in $COUNT users..."

users=()
for i in $(seq 1 "$COUNT"); do
  email="loadtest${i}@example.com"
  display="Load User $i"
  reg=$(curl -s -X POST "$API_BASE/api/v1/auth/register" \
    -H "Content-Type: application/json" \
    -d "$(jq -nc --arg e "$email" --arg p "$PASSWORD" --arg d "$display" '{email:$e,password:$p,displayName:$d}')")
  token=$(echo "$reg" | jq -r '.token // empty')
  if [ -z "$token" ]; then
    login=$(curl -s -X POST "$API_BASE/api/v1/auth/login" \
      -H "Content-Type: application/json" \
      -d "$(jq -nc --arg e "$email" --arg p "$PASSWORD" '{email:$e,password:$p}')")
    token=$(echo "$login" | jq -r '.token // empty')
  fi
  if [ -z "$token" ]; then
    echo "Failed for $email: $reg" >&2
    exit 1
  fi
  users+=("$(jq -nc --arg e "$email" --arg t "$token" '{email:$e,token:$t}')")
  echo "  ok $email"
done

jq -nc \
  --arg base "$API_BASE" \
  --argjson arr "[$(IFS=,; echo "${users[*]}")]" \
  '{apiBase:$base, users:$arr}' > "$OUT"

echo "Wrote $OUT (${#users[@]} tokens)"
