FROM node:22-bookworm-slim
WORKDIR /app
COPY package.json package-lock.json* ./
COPY apps/api/package.json apps/api/package.json
COPY apps/web/package.json apps/web/package.json
COPY workers/judge/package.json workers/judge/package.json
COPY packages/shared/package.json packages/shared/package.json
RUN npm install
COPY prisma prisma
COPY packages/shared packages/shared
COPY problems/catalog problems/catalog
COPY apps/api apps/api
RUN npx prisma generate
EXPOSE 4000
CMD ["npx", "tsx", "apps/api/src/index.ts"]
