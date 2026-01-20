FROM node:20-alpine

WORKDIR /app

RUN corepack enable

COPY pnpm.workspace.yaml  pnpm-lock.yaml package.json ./
COPY apps/web/package.json apps/web/package.json

RUN pnpm install --filter @banter/web...

COPY apps/web apps/web

WORKDIR /app/apps/web

EXPOSE 3000

CMD ["pnpm", "dev"]