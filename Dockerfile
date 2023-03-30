#build studio
FROM node:16 AS build-nodejs

WORKDIR /w3bstream-studio

RUN npm i pnpm -g
COPY package.json pnpm-lock.yaml ./
COPY prisma ./prisma
RUN pnpm i --no-frozen-lockfile
COPY . .
RUN pnpm build:standalone


#run
FROM node:16

EXPOSE 3000

WORKDIR /w3bstream-studio

COPY --from=build-nodejs /w3bstream-studio/public ./public
COPY --from=build-nodejs /w3bstream-studio/.next/standalone ./
COPY --from=build-nodejs /w3bstream-studio/.next/static .next/static
