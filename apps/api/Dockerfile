FROM node:20-alpine

WORKDIR /app

# Install pnpm globally
RUN npm install -g pnpm

# Set npm registry timeout and retries
ENV NPM_CONFIG_FETCH_TIMEOUT=120000
ENV NPM_CONFIG_FETCH_RETRIES=4

# Copy workspace files
COPY pnpm.workspace.yaml pnpm-lock.yaml package.json ./
COPY apps/api/package.json apps/api/package.json

# Install dependencies with network optimizations
RUN pnpm install --filter @banter/api... --config.fetch-timeout=120000

# Copy API source
COPY apps/api apps/api

WORKDIR /app/apps/api

EXPOSE 5000

CMD ["pnpm", "dev"]