FROM node:20-alpine

WORKDIR /app

#Enable pnpm
RUN corepack enable

#Copy workspace file (required for pnpm)
COPY pnpm.workspace.yaml pnpm-lock.yaml package.json ./

#Copy only API package.json (dependency graph)
COPY apps/api/package.json apps/api/package.json

#Install only dependencies
RUN pnpm install --filter @banter/api...

#Copy API source
COPY apps/api apps/api

WORKDIR /app/apps/api

EXPOSE 5000

CMD ["pnpm", "dev"]