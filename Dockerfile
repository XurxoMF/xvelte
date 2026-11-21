FROM oven/bun:latest AS build

WORKDIR /app

COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

COPY . .
RUN bun run build:web

FROM nginx/nginx-unprivileged:alpine AS production

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build --chown=nginx:nginx /app/build/web /usr/share/nginx/xvelte

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
	CMD wget -q -O /dev/null http://127.0.0.1:3000/health || exit 1
