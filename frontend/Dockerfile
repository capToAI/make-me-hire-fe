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
ARG NEXT_PUBLIC_API_URL=http://localhost:3001
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}

COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build --workspace=frontend

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app/frontend

ARG NODE_ENV=production
ARG PORT=3000
ARG HOSTNAME="0.0.0.0"

ENV NODE_ENV=${NODE_ENV}
ENV PORT=${PORT}
ENV HOSTNAME=${HOSTNAME}

COPY --from=builder /app/node_modules /app/node_modules
COPY --from=builder /app/frontend /app/frontend
COPY --from=builder /app/package.json /app/package.json

EXPOSE ${PORT}

CMD ["npm", "run", "start"]
