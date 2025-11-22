# Database Setup Guide

This guide explains how to set up and manage the PostgreSQL database for the Memory Service.

## Overview

The Memory Service uses PostgreSQL with Prisma ORM. The database schema includes:
- **users** - User profiles (students, teachers, admins)
- **chats** - Conversation threads
- **messages** - Individual messages within chats
- **memories** - Synthesized memories from conversations

## Initial Setup

### Prerequisites
- PostgreSQL 15+ running (via Docker or locally)
- Database connection configured in `.env` file

### Automatic Initialization (Recommended)

The service includes a smart initialization script that **only creates tables if the database is empty**.

```bash
npm run db:init
```

This script will:
1. ✅ Check if the database already has tables
2. ✅ Skip initialization if tables exist
3. ✅ Create all tables only if database is empty
4. ✅ Apply all migrations safely

**Safe to run multiple times** - it will not drop or recreate existing tables.

### Manual Migration Commands

If you prefer more control:

```bash
# Generate Prisma Client
npm run prisma:generate

# Apply migrations to an empty database
npm run prisma:migrate:deploy

# Create a new migration (development)
npm run prisma:migrate

# View migration status
npx prisma migrate status

# Open Prisma Studio (database GUI)
npm run prisma:studio
```

## Database Schema

### Users Table
```sql
CREATE TABLE users (
  user_id VARCHAR(255) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  role UserRole NOT NULL,  -- 'student' | 'teacher' | 'admin'
  user_info JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Chats Table
```sql
CREATE TABLE chats (
  chat_id VARCHAR(255) PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id VARCHAR(255) NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  title VARCHAR(500),
  created_at TIMESTAMP DEFAULT NOW(),
  last_updated_at TIMESTAMP DEFAULT NOW(),
  message_count INTEGER DEFAULT 0,
  INDEX idx_chats_user_id (user_id, last_updated_at DESC)
);
```

### Messages Table
```sql
CREATE TABLE messages (
  message_id VARCHAR(255) PRIMARY KEY DEFAULT gen_random_uuid(),
  chat_id VARCHAR(255) NOT NULL REFERENCES chats(chat_id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  sender MessageSender NOT NULL,  -- 'user' | 'assistant' | 'system'
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT NOW(),
  sequence_number SERIAL,
  INDEX idx_messages_chat_id (chat_id, sequence_number DESC)
);
```

### Memories Table
```sql
CREATE TABLE memories (
  memory_id VARCHAR(255) PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id VARCHAR(255) NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  mem0_memory_id VARCHAR(255),
  source_chat_ids TEXT[] DEFAULT '{}',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  INDEX idx_memories_user_id (user_id)
);
```

## Development Workflow

### Starting Fresh (Drop & Recreate)

If you need to completely reset the database:

```bash
# Drop all tables and recreate from scratch
npx prisma migrate reset

# Or manually using Docker
docker-compose down -v  # Removes volumes
docker-compose up -d
npm run db:init
```

### Making Schema Changes

1. **Edit** `prisma/schema.prisma`
2. **Create migration**: `npm run prisma:migrate`
3. **Review** the generated SQL in `prisma/migrations/`
4. **Apply** to other environments: `npm run prisma:migrate:deploy`

### Checking Database State

```bash
# View migration history
npx prisma migrate status

# Check if database is empty
npm run db:init  # Will report current state

# Open database GUI
npm run prisma:studio
```

## Production Deployment

### Firebase Cloud SQL

For production deployment with Firebase Cloud SQL:

1. **Set up Cloud SQL instance** (PostgreSQL 15)
2. **Update DATABASE_URL** in production `.env`:
   ```
   DATABASE_URL="postgresql://user:password@/memory_service?host=/cloudsql/project:region:instance"
   ```

3. **Run migrations**:
   ```bash
   npm run prisma:migrate:deploy
   ```

### Environment-Specific Migrations

- **Development**: Use `npm run prisma:migrate` (interactive)
- **Production**: Use `npm run prisma:migrate:deploy` (non-interactive)
- **CI/CD**: Always use `migrate deploy` in automated pipelines

## Troubleshooting

### "Database schema is not in sync"

If you see drift warnings:

```bash
# Pull current database state
npx prisma db pull

# Mark existing migrations as applied
npx prisma migrate resolve --applied "migration_name"
```

### "Tables already exist"

This is expected! The `db:init` script handles this gracefully:

```bash
npm run db:init
# Output: ✅ Database already contains tables. Skipping initialization.
```

### Connection Issues

Check your `.env` file:
```bash
# Local development
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/memory_service?schema=public"

# Verify connection
docker ps  # Check if postgres container is running
```

## Migration Files

All migrations are stored in `prisma/migrations/`:

```
prisma/migrations/
├── 20251121_baseline_init/
│   └── migration.sql          # Initial schema
└── migration_lock.toml        # Migration lock file
```

## Best Practices

1. ✅ **Always run `db:init`** on a fresh environment
2. ✅ **Review migration SQL** before applying to production
3. ✅ **Backup production database** before major migrations
4. ✅ **Use transactions** for data modifications
5. ✅ **Never edit migration files** after they're applied
6. ✅ **Test migrations** in staging environment first

## Related Documentation

- [README.md](./README.md) - Main service documentation
- [IMPLEMENTATION.md](./IMPLEMENTATION.md) - Implementation details
- [Prisma Schema](./prisma/schema.prisma) - Schema definition
- [Prisma Docs](https://www.prisma.io/docs) - Official Prisma documentation
