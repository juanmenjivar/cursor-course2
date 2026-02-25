# Docker Setup Guide

This guide explains how to run the `jomr-cursor-proj` application using Docker.

> **Note:** This project uses Yarn. If `yarn.lock` is missing, run this one-off command from the project root to create it:
> ```bash
> docker run --rm -v "<project-path>:/app" -w /app node:20-alpine sh -c "yarn install"
> ```
> Replace `<project-path>` with your project directory (e.g. `%cd%` in cmd, `${PWD}` in PowerShell, `$(pwd)` in bash).

## Prerequisites

- [Docker](https://www.docker.com/get-started) installed (version 20.10 or later)
- [Docker Compose](https://docs.docker.com/compose/install/) installed (usually included with Docker Desktop)
- Supabase project URL and anon key (see [SUPABASE_SETUP.md](./SUPABASE_SETUP.md))

## Quick Start

### 0. Update Lockfile (after changing package.json or resolutions)

If you changed `package.json` or `resolutions`, update the lockfile via Docker:

```powershell
docker run --rm -v "${PWD}:/app" -w /app node:20-alpine sh -c "yarn config set strict-ssl false && yarn install"
```

This writes the updated `yarn.lock` to your project. Commit it before building.

### 1. Set Up Environment Variables

Docker Compose loads env from **`./src/app/.env.local`** by default. Create that file (or put `.env.local` in the project root and change `env_file` in `docker-compose.yml` / `docker-compose.dev.yml` to `- .env.local`).

Required contents:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

**For AI Chat (LangChain + Gemini):**

```env
GOOGLE_API_KEY=your-google-api-key
```

Get a key from [Google AI Studio](https://aistudio.google.com/app/apikey). See [LANGCHAIN_SETUP.md](./LANGCHAIN_SETUP.md) for details.

### 2. Run the Application

#### Production Mode (Optimized Build)

```bash
# Build and start the container
docker-compose up --build

# Or run in detached mode (background)
docker-compose up -d --build
```

The application will be available at `http://localhost:3000`

#### Development Mode (Hot Reload)

```bash
# Build and start the development container
docker-compose -f docker-compose.dev.yml up --build

# Or run in detached mode
docker-compose -f docker-compose.dev.yml up -d --build
```

## Available Commands

### Production Mode

```bash
# Start containers
docker-compose up

# Start in background
docker-compose up -d

# Stop containers
docker-compose down

# Stop and remove volumes
docker-compose down -v

# View logs
docker-compose logs -f app

# Rebuild containers
docker-compose build --no-cache
```

### Development Mode

```bash
# Start development server
docker-compose -f docker-compose.dev.yml up

# Stop development server
docker-compose -f docker-compose.dev.yml down

# View logs
docker-compose -f docker-compose.dev.yml logs -f app

# Execute commands in container
docker-compose -f docker-compose.dev.yml exec app yarn lint
```

## Docker Files Overview

### `Dockerfile`
Multi-stage production build:
- **Stage 1 (deps)**: Installs dependencies
- **Stage 2 (builder)**: Builds the Next.js application
- **Stage 3 (runner)**: Creates minimal production image

### `Dockerfile.dev`
Development build with:
- Hot reload support
- Volume mounting for live code changes
- Development dependencies

### `docker-compose.yml`
Production configuration:
- Optimized build
- Health checks
- Environment variable management

### `docker-compose.dev.yml`
Development configuration:
- Source code mounting
- Hot reload enabled
- Development server

## Environment Variables

Environment variables can be set in two ways:

1. **`.env.local` file** (recommended)
   - Automatically loaded by docker-compose
   - Not committed to git

2. **Directly in docker-compose.yml**
   - Under the `environment` section
   - Useful for CI/CD pipelines

## Troubleshooting

### "Connection failed" at http://localhost:3000

1. **Port mapping**: The app listens on **port 3000** inside the container. Compose must map `3000:3000`. If you see `8000:8000` or similar, change it to `3000:3000` in both `docker-compose.yml` and `docker-compose.dev.yml`.

2. **Binding inside container**: Next.js must listen on `0.0.0.0` (not `127.0.0.1`) so the host can reach it. The setup uses `HOSTNAME=0.0.0.0` and `next dev -H 0.0.0.0` for this.

3. **Check the container is running**:
   ```bash
   docker ps
   ```
   You should see `jomr-cursor-proj` or `jomr-cursor-proj-dev` with port `0.0.0.0:3000->3000/tcp`.

4. **Check logs** for errors (build/runtime):
   ```bash
   docker-compose logs -f app
   # or for dev:
   docker-compose -f docker-compose.dev.yml logs -f app
   ```

5. **Rebuild and run**:
   ```bash
   docker-compose down
   docker-compose up --build
   ```
   Then open **http://localhost:3000** (not 8000).

### Port Already in Use

If port 3000 is already in use, change it in `docker-compose.yml`:

```yaml
ports:
  - "3001:3000"  # Use port 3001 on host
```
Then open http://localhost:3001

### Container Won't Start

1. Check logs:
   ```bash
   docker-compose logs app
   ```

2. Verify environment variables:
   ```bash
   docker-compose exec app env | grep SUPABASE
   ```

3. Rebuild from scratch:
   ```bash
   docker-compose down -v
   docker-compose build --no-cache
   docker-compose up
   ```

### Changes Not Reflecting (Development)

- Ensure you're using `docker-compose.dev.yml`
- Check that volumes are mounted correctly
- Restart the container: `docker-compose -f docker-compose.dev.yml restart`

### Build Fails

1. Clear Docker cache:
   ```bash
   docker system prune -a
   ```

2. Rebuild without cache:
   ```bash
   docker-compose build --no-cache
   ```

### "Missing Supabase environment variables" (Docker)

**Cause:** In Docker Compose, the `environment` section **overrides** `env_file`. If you set `NEXT_PUBLIC_SUPABASE_URL=${NEXT_PUBLIC_SUPABASE_URL:-}` in `environment`, that value is interpolated on the **host** (where it’s usually unset), so the container gets empty values and overwrites the ones from `env_file`.

**Fix:** The compose files no longer set `NEXT_PUBLIC_*` in `environment`; they come only from `env_file` (e.g. `./src/app/.env.local`). Ensure that file exists and contains the two variables. Restart the stack after changing it:

```bash
docker-compose -f docker-compose.dev.yml down && docker-compose -f docker-compose.dev.yml up --build
```

### Missing Supabase Environment Variables / "env_file not found"

Compose uses **`./src/app/.env.local`** by default. If your file is in the project root (`.env.local`), either:

- Copy it: `cp .env.local src/app/.env.local`, or  
- Edit `docker-compose.yml` and `docker-compose.dev.yml`: set `env_file` to `- .env.local` instead of `- ./src/app/.env.local`.

Ensure the file contains:

```env
NEXT_PUBLIC_SUPABASE_URL=your-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-key
GOOGLE_API_KEY=your-google-api-key   # optional, for AI Chat
```

## Production Deployment

For production deployment:

1. Build the image:
   ```bash
   docker build -t jomr-cursor-proj:latest .
   ```

2. Run the container:
   ```bash
   docker run -p 3000:3000 \
     -e NEXT_PUBLIC_SUPABASE_URL=your-url \
     -e NEXT_PUBLIC_SUPABASE_ANON_KEY=your-key \
     jomr-cursor-proj:latest
   ```

Or use docker-compose in production:

```bash
docker-compose -f docker-compose.yml up -d
```

## Container Details

- **Base Image**: `node:20-alpine` (lightweight Alpine Linux)
- **Port**: 3000 (configurable)
- **User**: Runs as non-root user (`nextjs`) for security
- **Health Check**: Built-in health check endpoint

## Additional Resources

- [Next.js Docker Documentation](https://nextjs.org/docs/deployment#docker-image)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Supabase Setup Guide](./SUPABASE_SETUP.md)
