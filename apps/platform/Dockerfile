# Build context is the repo root (pnpm workspace).
FROM node:22-slim
ENV PNPM_HOME=/pnpm
ENV PATH=$PNPM_HOME:$PATH
RUN corepack enable
WORKDIR /app

COPY . .
RUN pnpm install --frozen-lockfile
RUN pnpm --filter loome-platform build

ENV NODE_ENV=production
ENV PORT=3301
EXPOSE 3301

# Migrations run inside the infra right before the server starts.
CMD ["sh", "-c", "pnpm --filter @loome/db db:migrate && pnpm --filter loome-platform start"]
