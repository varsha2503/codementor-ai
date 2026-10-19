#!/bin/sh
set -eu

upstream="${API_UPSTREAM:-http://api:4000}"
case "$upstream" in
  http://* | https://*) ;;
  *) upstream="https://${upstream}" ;;
esac
export API_UPSTREAM="$upstream"

envsubst '${API_UPSTREAM}' < /etc/nginx/templates/default.conf.template > /etc/nginx/conf.d/default.conf
exec nginx -g 'daemon off;'
