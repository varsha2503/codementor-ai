FROM node:22-bookworm

RUN apt-get update \
  && apt-get install -y --no-install-recommends docker.io ca-certificates \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY package.json package-lock.json* ./
COPY apps/api/package.json apps/api/package.json
COPY apps/web/package.json apps/web/package.json
COPY workers/judge/package.json workers/judge/package.json
COPY packages/shared/package.json packages/shared/package.json
RUN npm install
COPY prisma prisma
COPY packages/shared packages/shared
COPY workers/judge workers/judge
RUN npx prisma generate
CMD ["npx", "tsx", "workers/judge/src/consumer.ts"]
