#build studio
FROM node:14.20-alpine AS build-nodejs

WORKDIR /w3bstream-studio

RUN apk add --no-cache curl
RUN curl -fsSL "https://github.com/pnpm/pnpm/releases/latest/download/pnpm-linuxstatic-x64" -o /bin/pnpm
RUN chmod +x /bin/pnpm

COPY package.json pnpm-lock.yaml ./
COPY prisma ./prisma
RUN pnpm i --frozen-lockfile;
COPY . .
RUN pnpm build:standalone
RUN sed -i 's,"http://localhost:8888",process.env.NEXT_PUBLIC_API_URL,g' .next/standalone/server.js


#run
FROM node:14.20-alpine

EXPOSE 3000

RUN apk add --no-cache curl
RUN curl -fsSL "https://github.com/pnpm/pnpm/releases/latest/download/pnpm-linuxstatic-x64" -o /bin/pnpm
RUN chmod +x /bin/pnpm

WORKDIR /w3bstream-studio

COPY --from=build-nodejs /w3bstream-studio/public ./public
COPY --from=build-nodejs /w3bstream-studio/.next/standalone ./
COPY --from=build-nodejs /w3bstream-studio/.next/static .next/static
