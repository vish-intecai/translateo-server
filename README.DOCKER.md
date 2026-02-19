# Docker Setup for Translateo Server

This directory contains Docker configuration files for running the Translateo server backend.

## Files

- `Dockerfile` - Docker image definition
- `docker-compose.yml` - Docker Compose configuration
- `.dockerignore` - Files to exclude from Docker build context

## Prerequisites

- Docker and Docker Compose installed
- `.env` file configured (see `.env.example`)

## Quick Start

### Using Docker Compose (Recommended)

1. Ensure your `.env` file is configured:
   ```bash
   PORT=3001
   FRONTEND_URL=http://localhost:3000
   ```

2. Build and start the container:
   ```bash
   docker-compose up -d
   ```

3. View logs:
   ```bash
   docker-compose logs -f
   ```

4. Stop the container:
   ```bash
   docker-compose down
   ```

### Using Docker directly

1. Build the image:
   ```bash
   docker build -t translateo-server .
   ```

2. Run the container:
   ```bash
   docker run -d \
     --name translateo-server \
     -p 3001:3001 \
     --env-file .env \
     translateo-server
   ```

## Environment Variables

The following environment variables can be set:

- `PORT` - Server port (default: 3001)
- `FRONTEND_URL` - Frontend URL for CORS (default: http://localhost:3000)

These can be set in:
1. `.env` file (recommended)
2. `docker-compose.yml` environment section
3. Command line with `-e` flag

## Health Check

The container includes a health check endpoint at `/health`. Docker will automatically check this endpoint.

## Networking

The docker-compose setup creates a bridge network (`translateo-network`) that can be used to connect multiple services.

## Development

For development, you may want to mount the source code as a volume:

```yaml
volumes:
  - ./src:/app/src
  - ./dist:/app/dist
```

However, this requires running `npm run build` on the host machine or using a different setup for hot-reloading.
