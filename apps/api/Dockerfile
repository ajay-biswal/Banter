FROM node:20-alpine

WORKDIR /app

RUN npm install -g pnpm

COPY . .

RUN pnpm install

EXPOSE 5000

CMD ["pnpm", "--filter", "@banter/api", "dev"]