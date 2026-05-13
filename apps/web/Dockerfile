FROM node:20-alpine

WORKDIR /app

# Install pnpm globally
RUN npm install -g pnpm

# Set npm registry timeout and retries
ENV NPM_CONFIG_FETCH_TIMEOUT=120000
ENV NPM_CONFIG_FETCH_RETRIES=4

# Copy workspace files
COPY pnpm.workspace.yaml pnpm-lock.yaml package.json ./
COPY apps/web/package.json apps/web/package.json

# Install dependencies with network optimizations
RUN pnpm install --filter @banter/web... --config.fetch-timeout=120000

# Copy web source
COPY apps/web apps/web

WORKDIR /app/apps/web

EXPOSE 3000

CMD ["pnpm", "dev"]