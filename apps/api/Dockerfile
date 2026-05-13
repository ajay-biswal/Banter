FROM node:20-alpine

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy files
COPY package.json .
COPY pnpm-lock.yaml ./
COPY tsconfig.json ./

# Install dependencies
RUN pnpm install

# Copy source
COPY . .

# Build app
RUN pnpm build

EXPOSE 5000

# Start production server
CMD ["pnpm", "start"]