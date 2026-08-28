# ==========================
# Frontend Dockerfile
# ==========================
FROM node:20-alpine AS base
WORKDIR /app

# Install dependencies based on the preferred package manager
FROM base AS deps
WORKDIR /app
COPY package.json package-lock.json* ./
COPY frontend/package.json ./frontend/
COPY backend/package.json ./backend/
RUN npm ci --workspace=frontend

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build --workspace=frontend

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app/frontend

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

COPY --from=builder /app/node_modules /app/node_modules
COPY --from=builder /app/frontend /app/frontend
COPY --from=builder /app/package.json /app/package.json

EXPOSE 3000

CMD ["npm", "run", "start"]
