#!/bin/sh
set -eu

upstream="${API_UPSTREAM:-http://api:4000}"
case "$upstream" in
  http://* | https://*) ;;
  *) upstream="https://${upstream}" ;;
esac
if [ "$upstream" = "http://api:4000" ] && [ -n "${RENDER:-}" ]; then
  echo "ERROR: Set API_UPSTREAM on Render (e.g. https://codementor-api-9gkf.onrender.com) and redeploy web." >&2
  exit 1
fi
export API_UPSTREAM="$upstream"
echo "nginx API upstream: $API_UPSTREAM"

envsubst '${API_UPSTREAM}' < /etc/nginx/templates/default.conf.template > /etc/nginx/conf.d/default.conf
exec nginx -g 'daemon off;'
