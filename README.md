# Make My Resume - Monorepo

This project is organized as a monorepo featuring a Next.js frontend and a NestJS backend managed via npm workspaces.

## Structure

```text
├── frontend/             # Next.js frontend application (Port 3000)
│   ├── src/
│   ├── public/
│   ├── Dockerfile        # Dedicated frontend Dockerfile
│   ├── next.config.ts
│   └── package.json
├── backend/              # NestJS backend application (Port 3001)
│   ├── src/
│   ├── test/
│   ├── Dockerfile        # Dedicated backend Dockerfile
│   └── package.json
├── package.json          # Root workspace configuration and scripts
└── docker-compose.yml    # Full-stack Docker compose configuration
```

## Getting Started

### 1. Install Dependencies
Install all monorepo dependencies across workspaces from the root:
```bash
npm install
```

### 2. Development

- **Run both applications concurrently:**
  ```bash
  npm run dev
  ```
- **Run Frontend only:**
  ```bash
  npm run dev:frontend
  ```
- **Run Backend only:**
  ```bash
  npm run dev:backend
  ```

- Frontend is available at: [http://localhost:3000](http://localhost:3000)
- Backend is available at: [http://localhost:3001](http://localhost:3001) (Health check: [http://localhost:3001/health](http://localhost:3001/health))

### 3. Production Build & Run

- **Build all applications:**
  ```bash
  npm run build
  ```
- **Build individual workspace:**
  ```bash
  npm run build:frontend
  npm run build:backend
  ```
- **Run production servers:**
  ```bash
  npm start
  # or individually:
  npm run start:frontend
  npm run start:backend
  ```

### 4. Testing & Linting

- **Run backend tests:**
  ```bash
  npm run test
  # or
  npm run test:backend
  ```
- **Lint all workspaces:**
  ```bash
  npm run lint
  ```

## Docker Deployment

All services—**PostgreSQL database**, **NestJS backend**, and **Next.js frontend**—are containerized and orchestrated with Docker Compose. All configuration is driven by the root `.env` file.

### 1. Environment Setup
Copy the example environment file if you haven't already:
```bash
cp .env.example .env
```
Key variables:
- `DB_PORT`: Host port for PostgreSQL (defaults to `5433` to avoid collision with any existing host port 5432).
- `OPENAI_API_KEY`: Required for the resume extraction AI agent.
- `AUTH_SECRET`, `AUTH_GOOGLE_ID`, `AUTH_GOOGLE_SECRET`: NextAuth authentication credentials.

### 2. Start All Services
Build and start PostgreSQL, Backend, and Frontend:
```bash
npm run docker:up
# or directly:
docker compose up --build
```

To run in detached (background) mode:
```bash
docker compose up -d --build
```

### 3. Service Access
- **Frontend**: [http://localhost:3000](http://localhost:3000)
- **Backend API**: [http://localhost:3001](http://localhost:3001)
- **Swagger Docs**: [http://localhost:3001/api/docs](http://localhost:3001/api/docs)
- **PostgreSQL**: `localhost:5433` (DB: `resume_db`, User: `postgres`)

### 4. Stop Services
```bash
npm run docker:down
# or directly:
docker compose down
```

To stop services and clear database volume data:
```bash
docker compose down -v
```

### 5. Build Individual Docker Images
- **Frontend:**
  ```bash
  docker build -f frontend/Dockerfile -t make-my-resume-frontend .
  ```
- **Backend (includes Chromium for ATS vector PDF rendering):**
  ```bash
  docker build -f backend/Dockerfile -t make-my-resume-backend .
  ```

