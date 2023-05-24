#build studio
FROM node:18-slim AS build-nodejs

WORKDIR /w3bstream-studio

RUN npm i pnpm -g
COPY package.json pnpm-lock.yaml ./
COPY prisma ./prisma
RUN pnpm i
COPY . .
RUN pnpm build:standalone


#run
FROM node:18-slim

EXPOSE 3000

WORKDIR /w3bstream-studio

COPY --from=build-nodejs /w3bstream-studio/public ./public
COPY --from=build-nodejs /w3bstream-studio/.next/standalone ./
COPY --from=build-nodejs /w3bstream-studio/.next/static .next/static
COPY package.json  ./
