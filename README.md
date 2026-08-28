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

### Run with Docker Compose
Start both frontend and backend services in containers:
```bash
docker compose up --build
```

### Build Individual Docker Images
- **Frontend:**
  ```bash
  docker build -f frontend/Dockerfile -t make-my-resume-frontend .
  ```
- **Backend:**
  ```bash
  docker build -f backend/Dockerfile -t make-my-resume-backend .
  ```
