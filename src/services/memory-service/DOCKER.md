# Docker Setup Guide

This service uses lightweight **Alpine Linux** based Docker images for optimal performance and minimal image size.

## Quick Start

### Production

```bash
# Build and start all services
docker-compose up -d

# View logs
docker-compose logs -f app

# Stop services
docker-compose down
```

### Development (with Hot Reload)

```bash
# Build and start development environment
docker-compose -f docker-compose.dev.yml up -d

# View logs
docker-compose -f docker-compose.dev.yml logs -f app

# Stop services
docker-compose -f docker-compose.dev.yml down
```

---

## Docker Images

### Production Image (`Dockerfile`)

**Multi-stage build** for optimal size and security:

1. **Stage 1 (deps)**: Installs production dependencies
2. **Stage 2 (builder)**: Builds the application
3. **Stage 3 (runner)**: Creates minimal runtime image

**Features:**
- Base image: `node:20-alpine` (~40MB)
- Non-root user execution
- Health checks
- Signal handling with dumb-init
- Production-optimized

**Final image size:** ~200-250MB (vs ~1GB with standard node image)

### Development Image (`Dockerfile.dev`)

**Single-stage build** optimized for development:

**Features:**
- Base image: `node:20-alpine`
- Hot reload support
- Debug port exposed (9229)
- All dev dependencies included
- Volume mounts for source code

---

## Environment Variables

Create a `.env` file in the root directory:

```env
# Database
DATABASE_URL=postgresql://postgres:postgres@postgres:5432/memory_service

# Mem0.ai Configuration
MEM0_API_KEY=your_api_key_here
MEM0_API_URL=https://api.mem0.ai

# Logging
LOG_LEVEL=info  # or 'debug' for development
```

---

## Docker Compose Services

### Production (`docker-compose.yml`)

Services:
- **postgres**: PostgreSQL 15 Alpine
- **app**: Memory Service (production build)

Features:
- Automatic health checks
- Restart policies
- Volume persistence
- Network isolation

### Development (`docker-compose.dev.yml`)

Services:
- **postgres**: PostgreSQL 15 Alpine (separate dev database)
- **app**: Memory Service (hot reload enabled)

Features:
- Source code volume mounts
- Debug port exposed
- Interactive terminal support
- Separate dev database

---

## Common Commands

### Production

```bash
# Build images
docker-compose build

# Start services (detached)
docker-compose up -d

# View logs
docker-compose logs -f
docker-compose logs -f app      # App logs only
docker-compose logs -f postgres # DB logs only

# Execute commands in container
docker-compose exec app sh
docker-compose exec app npm run prisma:studio

# Run Prisma migrations
docker-compose exec app npx prisma migrate deploy

# Restart specific service
docker-compose restart app

# Stop services
docker-compose stop

# Remove containers and volumes
docker-compose down -v
```

### Development

```bash
# Start with build
docker-compose -f docker-compose.dev.yml up --build

# Attach to container (interactive)
docker-compose -f docker-compose.dev.yml exec app sh

# Run Prisma migrations
docker-compose -f docker-compose.dev.yml exec app npx prisma migrate dev

# Generate Prisma client
docker-compose -f docker-compose.dev.yml exec app npx prisma generate

# View real-time logs
docker-compose -f docker-compose.dev.yml logs -f app
```

---

## Health Checks

The application includes a `/health` endpoint that checks:
- Application status
- Database connectivity
- Service uptime
- Response time

**Access:**
```bash
# From host
curl http://localhost:3001/health

# Expected response
{
  "status": "ok",
  "timestamp": "2025-11-21T10:30:45.123Z",
  "uptime": 12345,
  "database": "connected",
  "responseTime": "5ms"
}
```

**Docker health checks:**
- Production: HTTP check every 30s
- Start period: 40s (allows for initialization)
- Retries: 3

---

## Database Management

### Run Migrations

**Production:**
```bash
docker-compose exec app npx prisma migrate deploy
```

**Development:**
```bash
docker-compose -f docker-compose.dev.yml exec app npx prisma migrate dev
```

### Access Prisma Studio

```bash
# Production
docker-compose exec app npx prisma studio

# Development
docker-compose -f docker-compose.dev.yml exec app npx prisma studio
```

Then visit: http://localhost:5555

### Backup Database

```bash
docker-compose exec postgres pg_dump -U postgres memory_service > backup.sql
```

### Restore Database

```bash
docker-compose exec -T postgres psql -U postgres memory_service < backup.sql
```

---

## Troubleshooting

### View Container Status

```bash
docker-compose ps
```

### Check Container Resources

```bash
docker stats
```

### View Container Logs

```bash
# Last 100 lines
docker-compose logs --tail=100 app

# Follow logs
docker-compose logs -f app

# Logs with timestamps
docker-compose logs -t app
```

### Rebuild from Scratch

```bash
# Stop and remove everything
docker-compose down -v --rmi all

# Rebuild
docker-compose build --no-cache

# Start fresh
docker-compose up -d
```

### Access Database Directly

```bash
docker-compose exec postgres psql -U postgres -d memory_service
```

### Fix Permission Issues

If you encounter permission issues with logs:

```bash
# Create logs directory with proper permissions
mkdir -p logs
chmod 777 logs
```

---

## Performance Optimization

### Image Size Comparison

| Image Type | Size |
|-----------|------|
| node:20 (standard) | ~1.1GB |
| node:20-alpine | ~180MB |
| Production build | ~200-250MB |

### Build Cache

Docker uses layer caching. To optimize:

```bash
# Use BuildKit for better caching
DOCKER_BUILDKIT=1 docker-compose build
```

### Multi-platform Builds

```bash
# Build for multiple platforms
docker buildx build --platform linux/amd64,linux/arm64 -t memory-service .
```

---

## Security Best Practices

✅ **Implemented:**
- Non-root user execution
- Minimal Alpine base image
- Multi-stage builds (secrets not in final image)
- Health checks
- Network isolation
- No hardcoded credentials

🔒 **Additional recommendations:**
- Use Docker secrets for sensitive data
- Scan images for vulnerabilities: `docker scan memory-service`
- Keep base images updated
- Use specific image tags (not `latest`)

---

## CI/CD Integration

### GitHub Actions Example

```yaml
name: Docker Build

on: [push]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Build Docker image
        run: docker-compose build
      - name: Run tests
        run: docker-compose run app npm test
```

---

## Monitoring

### View Container Resources

```bash
docker stats memory_service_app
```

### Export Logs

```bash
docker-compose logs app > app.log
```

### Monitor Health

```bash
# Continuous health check
watch -n 5 'curl -s http://localhost:3001/health | jq'
```

---

## Production Deployment

### Best Practices

1. **Use environment-specific compose files**
   ```bash
   docker-compose -f docker-compose.yml -f docker-compose.prod.yml up
   ```

2. **Enable log rotation**
   ```yaml
   logging:
     driver: "json-file"
     options:
       max-size: "10m"
       max-file: "3"
   ```

3. **Resource limits**
   ```yaml
   deploy:
     resources:
       limits:
         cpus: '1'
         memory: 512M
       reservations:
         memory: 256M
   ```

4. **Use secrets**
   ```bash
   docker secret create mem0_api_key ./mem0_key.txt
   ```

---

## Development Workflow

1. Start development environment:
   ```bash
   docker-compose -f docker-compose.dev.yml up
   ```

2. Make code changes (hot reload automatic)

3. Run migrations if schema changes:
   ```bash
   docker-compose -f docker-compose.dev.yml exec app npx prisma migrate dev
   ```

4. Test in container:
   ```bash
   docker-compose -f docker-compose.dev.yml exec app npm test
   ```

5. Commit changes

6. Build production image:
   ```bash
   docker-compose build
   ```

7. Test production image:
   ```bash
   docker-compose up
   ```

---

## Additional Resources

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Reference](https://docs.docker.com/compose/compose-file/)
- [Alpine Linux](https://alpinelinux.org/)
- [Node.js Docker Best Practices](https://github.com/nodejs/docker-node/blob/main/docs/BestPractices.md)
