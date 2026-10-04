# Built from the repo root: docker compose build api
FROM node:22-alpine

WORKDIR /app

# Install dependencies first, so this layer is reused until a package.json or the lockfile changes.
COPY package.json package-lock.json ./
COPY apps/api/package.json apps/api/
COPY packages/shared/package.json packages/shared/
RUN npm ci --omit=dev --workspace=@artura/api --workspace=@artura/shared

COPY packages/shared packages/shared
COPY apps/api apps/api

USER node
WORKDIR /app/apps/api
EXPOSE 3000

# Apply any new migrations, then start the API (which also starts the packet worker).
CMD ["sh", "-c", "npx sequelize-cli db:migrate && exec npx tsx src/server.ts"]
