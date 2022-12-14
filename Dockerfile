#build studio
FROM node:16 AS build-nodejs

WORKDIR /w3bstream-studio

RUN npm i pnpm -g
COPY package.json pnpm-lock.yaml ./
COPY prisma ./prisma
RUN pnpm i --frozen-lockfile
COPY . .
RUN pnpm build:standalone
RUN sed -i 's,"http://localhost:8888",process.env.NEXT_PUBLIC_API_URL,g' .next/standalone/server.js


#run
FROM node:16-alpine

EXPOSE 3000

WORKDIR /w3bstream-studio

COPY --from=build-nodejs /w3bstream-studio/public ./public
COPY --from=build-nodejs /w3bstream-studio/.next/standalone ./
COPY --from=build-nodejs /w3bstream-studio/.next/static .next/static
