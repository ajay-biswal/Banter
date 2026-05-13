FROM node:20-alpine

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy workspace files
COPY pnpm-workspace.yaml .
COPY pnpm-lock.yaml .
COPY package.json .

# Copy api package.json
COPY apps/api/package.json apps/api/package.json

# Install dependencies
RUN pnpm install --filter @banter/api...

# Copy source code
COPY apps/api apps/api

# Move to api workspace
WORKDIR /app/apps/api

# Build app
RUN pnpm build

EXPOSE 5000

CMD ["pnpm", "start"]