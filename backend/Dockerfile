# ==========================
# Backend Dockerfile
# ==========================
FROM node:20-alpine AS base
WORKDIR /app

# Install dependencies
FROM base AS deps
WORKDIR /app
COPY package.json package-lock.json* ./
COPY frontend/package.json ./frontend/
COPY backend/package.json ./backend/
RUN npm ci --workspace=backend

# Build the NestJS application
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build --workspace=backend

# Production image
FROM base AS runner
WORKDIR /app/backend

ENV NODE_ENV=production
ENV PORT=3001

COPY --from=builder /app/node_modules /app/node_modules
COPY --from=builder /app/backend /app/backend
COPY --from=builder /app/package.json /app/package.json

EXPOSE 3001

CMD ["npm", "run", "start:prod"]
