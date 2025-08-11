docker-compose down
# PlanTogather - Docker Setup

This document explains how to run PlanTogather with Docker using MongoDB Atlas (cloud) as the database. No local MongoDB container is started. Secrets are provided via environment variables.

## Overview

The stack consists of:
- Frontend: React (served as static files by Express)
- Backend: Node.js/Express API
- Database: MongoDB Atlas (via `MONGO_URI`)

## Files

- `Dockerfile` — multi-stage build for client and server
- `docker-compose.yml` — single-service app container; expects `MONGO_URI` via env
- `.dockerignore` — excludes unnecessary files from build context

Note: `mongo-init.js` is kept for reference only and is not used when connecting to Atlas.

## Quick start

1) Provide secrets as environment variables.

Option A — system environment (recommended for CI/CD):
```bash
setx MONGO_URI "<your-atlas-connection-string>"
setx JWT_SECRET "<your-strong-jwt-secret>"
```

Option B — .env file (never commit to Git): create `server/.env`:
```env
MONGO_URI=<your-atlas-connection-string>
JWT_SECRET=<your-strong-jwt-secret>
PORT=5000
```

2) Build and run the app:
```bash
docker-compose up --build

# Run in background
docker-compose up -d --build

# Stop
docker-compose down
```

3) Open the app:
- `http://localhost:5000`

4) Compose file template

Do not commit your real `docker-compose.yml`. Instead, keep a template in the repo and create your own local file:

```bash
# In the repository (already included):
docker-compose.yml.example

# Create your local compose from the template
cp docker-compose.yml.example docker-compose.yml

# Provide environment variables (system env or .env) and run
docker-compose up --build
```

The template expects `MONGO_URI` to be provided from your environment. Keeping `docker-compose.yml` in `.gitignore` prevents leaking credentials.

## docker-compose.yml explained

The compose file defines a single service `app`:
- Builds from the root using the provided `Dockerfile`
- Exposes port `5000:5000`
- Reads `MONGO_URI` from the environment (`${MONGO_URI}`)

Example of providing variables when running (without .env):
```bash
MONGO_URI="<atlas-uri>" JWT_SECRET="<secret>" docker-compose up --build
```

## Environment variables

- `MONGO_URI` (required): your MongoDB Atlas connection string
- `JWT_SECRET` (required): secret used to sign JWT tokens
- `PORT` (optional): server port (default 5000)
- `NODE_ENV` (optional): `production` by default in the container

## Security

- Do not commit secrets to the repository
- Use `${MONGO_URI}` in compose instead of hardcoding credentials
- The container runs as a non-root user and uses `dumb-init` for proper signal handling

## Troubleshooting

Logs:
```bash
docker-compose logs -f app
```

Verify which DB the container points to:
```bash
docker exec plantogather-app env | findstr MONGO
```

Rebuild without cache (force refresh of copied files):
```bash
docker-compose down
docker system prune -f
docker-compose up --build --force-recreate
```

## Production notes

- Keep `MONGO_URI` and `JWT_SECRET` in your secret manager (CI/CD, Docker secrets, etc.)
- Put a reverse proxy (e.g., Nginx) in front if you need TLS/HTTP/2
- Scale by running multiple app containers and a managed Atlas cluster

## Image layout

```
plantogather:latest
├── /app
│   ├── /client/build (React build files)
│   ├── /server (Node.js application)
│   └── start.sh (Startup script)
└── nodejs user (non-root)
```
