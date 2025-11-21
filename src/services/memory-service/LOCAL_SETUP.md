# Local Setup Guide - Memory Service

This guide will help you start the Memory Service locally using Docker.

---

## Prerequisites

- Docker Desktop installed and running
- Docker Compose installed (included with Docker Desktop)
- At least 2GB of free disk space

---

## Quick Start (Production Mode)

### 1. Navigate to the service directory

```bash
cd src/services/memory-service
```

### 2. Create environment file (optional)

```bash
cp .env.example .env
```

Edit `.env` if you want to customize settings:
```env
MEM0_API_KEY=your_api_key_here
LOG_LEVEL=info
```

**Note:** The service will work with default values if you don't create a `.env` file.

### 3. Start the services

```bash
docker-compose up -d
```

This command will:
- Build the Docker image (first time only, ~2-3 minutes)
- Start PostgreSQL database
- Wait for database to be ready
- Run database migrations automatically
- Start the Memory Service

### 4. Verify it's running

Check the logs:
```bash
docker-compose logs -f app
```

You should see:
```
Starting Memory Service...
Waiting for database connection...
Database is ready!
Running database migrations...
Starting application...
Memory Service started successfully on port 3001
```

### 5. Test the API

**Health check:**
```bash
curl http://localhost:3001/health
```

Expected response:
```json
{
  "status": "ok",
  "timestamp": "2025-11-21T10:30:45.123Z",
  "uptime": 12,
  "database": "connected",
  "responseTime": "5ms"
}
```

**Swagger docs:**
```bash
open http://localhost:3001/api/docs
```

---

## Quick Start (Development Mode with Hot Reload)

### 1. Navigate to the service directory

```bash
cd src/services/memory-service
```

### 2. Start development services

```bash
docker-compose -f docker-compose.dev.yml up -d
```

This will:
- Build the development Docker image
- Start PostgreSQL database (separate from production)
- Run migrations
- Start with hot reload enabled
- Set LOG_LEVEL=debug

### 3. View logs

```bash
docker-compose -f docker-compose.dev.yml logs -f app
```

### 4. Make code changes

Edit files in `src/` - the app will automatically reload!

---

## Stopping the Services

**Production:**
```bash
docker-compose down
```

**Development:**
```bash
docker-compose -f docker-compose.dev.yml down
```

**To remove all data (databases):**
```bash
docker-compose down -v
```

---

## Common Commands

### View Logs

```bash
# Production - all services
docker-compose logs -f

# Production - app only
docker-compose logs -f app

# Development
docker-compose -f docker-compose.dev.yml logs -f app

# Last 100 lines
docker-compose logs --tail=100 app
```

### Restart Services

```bash
# Production
docker-compose restart app

# Development
docker-compose -f docker-compose.dev.yml restart app
```

### Access Container Shell

```bash
# Production
docker-compose exec app sh

# Development
docker-compose -f docker-compose.dev.yml exec app sh
```

### Run Prisma Commands

```bash
# Production - view Prisma Studio
docker-compose exec app npx prisma studio

# Development - generate Prisma client
docker-compose -f docker-compose.dev.yml exec app npx prisma generate

# Development - create new migration
docker-compose -f docker-compose.dev.yml exec app npx prisma migrate dev --name migration_name
```

### Access Database Directly

```bash
# Production
docker-compose exec postgres psql -U postgres -d memory_service

# Development
docker-compose -f docker-compose.dev.yml exec postgres psql -U postgres -d memory_service_dev
```

---

## Troubleshooting

### Issue: Port 3001 already in use

**Solution 1:** Stop the conflicting service
```bash
# Find what's using the port
lsof -i :3001

# Kill the process
kill -9 <PID>
```

**Solution 2:** Change the port
Edit `docker-compose.yml`:
```yaml
ports:
  - '3002:3001'  # Use port 3002 instead
```

### Issue: Port 5432 already in use (PostgreSQL)

**Solution:** Stop local PostgreSQL or change the port
```yaml
ports:
  - '5433:5432'  # Use port 5433 instead
```

Then update DATABASE_URL in your `.env`:
```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5433/memory_service
```

### Issue: Database connection failed

**Check if PostgreSQL is healthy:**
```bash
docker-compose ps
```

You should see `healthy` status for postgres.

**View PostgreSQL logs:**
```bash
docker-compose logs postgres
```

**Restart PostgreSQL:**
```bash
docker-compose restart postgres
```

### Issue: Build failed or slow

**Clear Docker cache and rebuild:**
```bash
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

### Issue: App crashes on startup

**View detailed logs:**
```bash
docker-compose logs app
```

**Common causes:**
- Database not ready (wait 10-15 seconds)
- Migration failed (check logs)
- Invalid environment variables

**Reset everything:**
```bash
docker-compose down -v
docker-compose up -d
```

### Issue: Hot reload not working (dev mode)

**Ensure volumes are mounted:**
```bash
docker-compose -f docker-compose.dev.yml config
```

**Restart the service:**
```bash
docker-compose -f docker-compose.dev.yml restart app
```

---

## Verification Checklist

After starting the services, verify:

- [ ] PostgreSQL is running: `docker-compose ps`
- [ ] App is running: `docker-compose ps`
- [ ] Health check passes: `curl http://localhost:3001/health`
- [ ] Swagger docs available: `http://localhost:3001/api/docs`
- [ ] Logs show no errors: `docker-compose logs app`

---

## What Happens on Startup?

### Production Mode (`docker-compose up`)

1. **PostgreSQL starts**
   - Creates database volume
   - Initializes database

2. **App container starts**
   - Waits for PostgreSQL to be ready
   - Runs `npx prisma migrate deploy` (applies migrations)
   - Generates Prisma Client
   - Starts Node.js application

3. **Health checks begin**
   - Docker monitors `/health` endpoint
   - Marks container as healthy when responsive

### Development Mode (`docker-compose -f docker-compose.dev.yml up`)

1. **PostgreSQL starts** (separate dev database)

2. **App container starts**
   - Waits for PostgreSQL
   - Runs `npx prisma migrate dev` (interactive migrations)
   - Generates Prisma Client
   - Starts with `npm run start:dev` (hot reload)

3. **Hot reload active**
   - Watches `src/` directory for changes
   - Automatically restarts on file changes

---

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `NODE_ENV` | `production` | Runtime environment |
| `PORT` | `3001` | Application port |
| `DATABASE_URL` | Auto-configured | PostgreSQL connection string |
| `MEM0_API_KEY` | `test_key` | mem0.ai API key |
| `MEM0_API_URL` | `https://api.mem0.ai` | mem0.ai API URL |
| `LOG_LEVEL` | `info` (prod) / `debug` (dev) | Logging level |

---

## Ports Used

| Port | Service | Description |
|------|---------|-------------|
| 3001 | Memory Service | REST API |
| 5432 | PostgreSQL | Database (production) |
| 5432 | PostgreSQL | Database (development - separate) |
| 9229 | Node Debugger | Debug port (dev only) |

---

## Data Persistence

### Production
- Database data: `memory_service_postgres_data` volume
- Logs: `./logs/` directory

### Development
- Database data: `memory_service_postgres_dev_data` volume
- Logs: `./logs/` directory

**To view volumes:**
```bash
docker volume ls | grep memory_service
```

**To remove volumes:**
```bash
docker-compose down -v
```

---

## Next Steps

Once the service is running:

1. **Test the API** via Swagger UI:
   - Open http://localhost:3001/api/docs
   - Try the `/api/v1/memory/users/register` endpoint

2. **Register a test user:**
   ```bash
   curl -X POST http://localhost:3001/api/v1/memory/users/register \
     -H "Content-Type: application/json" \
     -d '{
       "userID": "test_user_123",
       "name": "Test User",
       "role": "student"
     }'
   ```

3. **View logs in real-time:**
   ```bash
   docker-compose logs -f app
   ```

4. **Explore the database:**
   ```bash
   docker-compose exec app npx prisma studio
   ```
   Then open http://localhost:5555

---

## Production Deployment

For production deployment, see:
- [DOCKER.md](./DOCKER.md) - Complete Docker guide
- [DOCKER_QUICKREF.md](./DOCKER_QUICKREF.md) - Quick reference

Key considerations:
- Set proper `MEM0_API_KEY`
- Use `LOG_LEVEL=info` or `error`
- Configure resource limits
- Set up log rotation
- Use Docker secrets for sensitive data
- Enable automatic restarts

---

## Getting Help

If you encounter issues:

1. Check the logs: `docker-compose logs app`
2. Verify Docker is running: `docker ps`
3. Check disk space: `df -h`
4. View this guide: [LOCAL_SETUP.md](./LOCAL_SETUP.md)
5. Full Docker docs: [DOCKER.md](./DOCKER.md)
