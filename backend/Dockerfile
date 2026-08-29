# ==========================
# Backend Dockerfile
# ==========================
FROM node:20-alpine AS base
WORKDIR /app

# Install system dependencies required for Puppeteer headless Chromium
RUN apk add --no-cache \
    chromium \
    nss \
    freetype \
    harfbuzz \
    ca-certificates \
    ttf-freefont

ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true

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
COPY --from=deps /app ./
COPY . .
RUN npm run build --workspace=backend

# Production image
FROM base AS runner
WORKDIR /app/backend

ARG NODE_ENV=production
ARG PORT=3001
ARG PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser

ENV NODE_ENV=${NODE_ENV}
ENV PORT=${PORT}
ENV PUPPETEER_EXECUTABLE_PATH=${PUPPETEER_EXECUTABLE_PATH}

COPY --from=builder /app/node_modules /app/node_modules
COPY --from=builder /app/backend /app/backend
COPY --from=builder /app/package.json /app/package.json

EXPOSE ${PORT}

CMD ["npm", "run", "start:prod"]
