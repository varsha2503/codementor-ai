FROM node:22-bookworm-slim AS build
WORKDIR /app
COPY package.json package-lock.json* ./
COPY apps/api/package.json apps/api/package.json
COPY apps/web/package.json apps/web/package.json
COPY workers/judge/package.json workers/judge/package.json
COPY packages/shared/package.json packages/shared/package.json
RUN npm install
COPY packages/shared packages/shared
COPY apps/web apps/web
RUN npm run build -w @codementor/web

FROM nginx:1.27-alpine
RUN apk add --no-cache gettext
COPY apps/web/nginx.conf.template /etc/nginx/templates/default.conf.template
COPY apps/web/docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh
COPY --from=build /app/apps/web/dist /usr/share/nginx/html
ENV API_UPSTREAM=http://api:4000
EXPOSE 80
ENTRYPOINT ["/docker-entrypoint.sh"]
