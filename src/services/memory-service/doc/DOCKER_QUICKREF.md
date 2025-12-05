# Docker Quick Reference

## Start Services

| Command | Description |
|---------|-------------|
| `docker-compose up -d` | Start production services (detached) |
| `docker-compose -f docker-compose.dev.yml up -d` | Start development with hot reload |
| `docker-compose up --build` | Rebuild and start |

## View Logs

| Command | Description |
|---------|-------------|
| `docker-compose logs -f` | Follow all logs |
| `docker-compose logs -f app` | Follow app logs only |
| `docker-compose logs --tail=100 app` | Last 100 lines |

## Stop Services

| Command | Description |
|---------|-------------|
| `docker-compose stop` | Stop services |
| `docker-compose down` | Stop and remove containers |
| `docker-compose down -v` | Stop, remove containers and volumes |

## Database Operations

| Command | Description |
|---------|-------------|
| `docker-compose exec app npx prisma migrate deploy` | Run migrations (prod) |
| `docker-compose exec app npx prisma studio` | Open Prisma Studio |
| `docker-compose exec postgres psql -U postgres memory_service` | Access DB directly |

## Container Access

| Command | Description |
|---------|-------------|
| `docker-compose exec app sh` | Shell into app container |
| `docker-compose ps` | List running containers |
| `docker stats` | View resource usage |

## Troubleshooting

| Command | Description |
|---------|-------------|
| `docker-compose build --no-cache` | Rebuild without cache |
| `docker-compose restart app` | Restart app service |
| `curl http://localhost:3001/health` | Check health |

## Image Sizes

- **node:20** → ~1.1 GB
- **node:20-alpine** → ~180 MB
- **Production build** → ~200-250 MB ✅

## Ports

- **3001** → Memory Service API
- **5432** → PostgreSQL
- **9229** → Node.js debugger (dev only)

## Health Check

```bash
curl http://localhost:3001/health
```

Response:
```json
{
  "status": "ok",
  "timestamp": "2025-11-21T10:30:45.123Z",
  "uptime": 12345,
  "database": "connected",
  "responseTime": "5ms"
}
```
