FROM node:20-alpine

WORKDIR /app

RUN npm install -g pnpm

COPY apps/api/package.json ./

RUN pnpm install

COPY apps/api .

EXPOSE 5000

CMD ["pnpm", "dev"]