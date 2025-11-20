# Memory Service Implementation Guide

This document provides step-by-step instructions for setting up and running the Memory Service.

## Project Structure

```
src/services/memory-service/
├── prisma/
│   └── schema.prisma          # Database schema
├── src/
│   ├── main.ts                # Application entry point
│   ├── app.module.ts          # Root module
│   ├── database/              # Prisma service
│   ├── users/                 # User registration module
│   ├── chats/                 # Conversation retrieval module
│   ├── messages/              # Message persistence module
│   ├── memories/              # Memory synthesis module
│   └── common/                # Shared filters, pipes, DTOs
├── test/                      # E2E tests
├── docker-compose.yml         # Local PostgreSQL setup
├── package.json               # Dependencies
├── .env.example               # Environment template
└── README.md                  # Documentation
```

## Initial Setup

### Step 1: Navigate to the Service Directory

```bash
cd src/services/memory-service
```

### Step 2: Install Dependencies

```bash
npm install
```

This will install:
- NestJS framework (@nestjs/common, @nestjs/core, @nestjs/platform-express)
- Prisma ORM (@prisma/client, prisma)
- Swagger documentation (@nestjs/swagger)
- Validation libraries (class-validator, class-transformer)
- mem0.ai SDK (mem0ai)

### Step 3: Set Up Environment Variables

```bash
cp .env.example .env
```

Edit the `.env` file with your settings:

```env
NODE_ENV=development
PORT=3001
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/memory_service?schema=public"
MEM0_API_KEY=your_actual_mem0_api_key
MEM0_API_URL=https://api.mem0.ai
```

**Important**: Get your mem0.ai API key from https://mem0.ai

### Step 4: Start PostgreSQL Database

```bash
docker-compose up -d
```

Verify it's running:
```bash
docker-compose ps
```

You should see the `memory_service_postgres` container running.

### Step 5: Initialize Database

Generate Prisma client:
```bash
npm run prisma:generate
```

Run migrations:
```bash
npm run prisma:migrate
```

This creates the database schema with tables:
- users
- chats
- messages
- memories

### Step 6: Start the Service

Development mode (with hot reload):
```bash
npm run start:dev
```

The service will start on http://localhost:3001

### Step 7: Verify Installation

Open your browser to:
- **Swagger Docs**: http://localhost:3001/api/docs
- You should see all 5 API endpoints documented

Test the health of the service:
```bash
curl http://localhost:3001/api/v1/memory/register \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{"userID": "test_user", "name": "Test User", "role": "student"}'
```

Expected response:
```json
{
  "success": true,
  "message": "User registered successfully",
  "userID": "test_user"
}
```

## Running Tests

### Unit Tests

```bash
npm run test
```

### E2E Tests

Make sure the database is running, then:

```bash
npm run test:e2e
```

### Test Coverage

```bash
npm run test:cov
```

## Development Workflow

### 1. Making Database Changes

Edit `prisma/schema.prisma`, then:

```bash
# Create a new migration
npm run prisma:migrate

# Or push schema without creating migration (dev only)
npx prisma db push
```

### 2. Viewing Database

```bash
npm run prisma:studio
```

Opens Prisma Studio at http://localhost:5555

### 3. Debugging

Start in debug mode:
```bash
npm run start:debug
```

Attach your IDE's debugger to port 9229.

### 4. Code Formatting

```bash
# Format code
npm run format

# Run linter
npm run lint
```

## API Usage Examples

### 1. Register a User

```bash
curl -X POST http://localhost:3001/api/v1/memory/register \
  -H "Content-Type: application/json" \
  -d '{
    "userID": "student_123",
    "name": "Alice Johnson",
    "role": "student",
    "userInfo": {"grade": "10", "subject": "Math"}
  }'
```

### 2. Create Conversation and Save Message

```bash
curl -X POST http://localhost:3001/api/v1/memory/messages \
  -H "Content-Type: application/json" \
  -d '{
    "chatID": null,
    "userID": "student_123",
    "content": "Can you help me understand derivatives?",
    "sender": "user"
  }'
```

Response includes `chatID` for the new conversation.

### 3. Add More Messages to Conversation

```bash
curl -X POST http://localhost:3001/api/v1/memory/messages \
  -H "Content-Type: application/json" \
  -d '{
    "chatID": "chat_xyz789",
    "content": "Sure! A derivative represents the rate of change...",
    "sender": "assistant"
  }'
```

### 4. Get Conversation Messages

```bash
curl http://localhost:3001/api/v1/memory/conversations/chat_xyz789?page=1&pageSize=20
```

### 5. Get User's Conversations

```bash
curl http://localhost:3001/api/v1/memory/users/student_123/conversations?limit=10
```

### 6. Synthesize Memories

```bash
curl -X POST http://localhost:3001/api/v1/memory/synthesize \
  -H "Content-Type: application/json" \
  -d '{
    "chatID": "chat_xyz789",
    "query": "learning preferences and knowledge gaps"
  }'
```

### 7. Get User Memories

```bash
curl http://localhost:3001/api/v1/memory/users/student_123/memories
```

## Production Deployment

### Firebase Cloud SQL Setup

1. Create a Cloud SQL PostgreSQL instance in Google Cloud Console
2. Note the connection name: `project-id:region:instance-name`
3. Update DATABASE_URL in production environment:

```env
DATABASE_URL="postgresql://user:password@/memory_service?host=/cloudsql/project-id:region:instance-name"
```

### Build for Production

```bash
npm run build
```

Outputs to `dist/` directory.

### Run Production Build

```bash
npm run start:prod
```

### Environment Variables for Production

Ensure these are set in your production environment (Cloud Run, Cloud Functions, etc.):
- `NODE_ENV=production`
- `PORT=3001` (or as required)
- `DATABASE_URL` (Cloud SQL connection string)
- `MEM0_API_KEY`
- `MEM0_API_URL`

## Troubleshooting

### Issue: Cannot connect to database

**Solution**:
```bash
# Check if PostgreSQL container is running
docker-compose ps

# View logs
docker-compose logs postgres

# Restart
docker-compose restart postgres
```

### Issue: Prisma client not generated

**Solution**:
```bash
npm run prisma:generate
```

### Issue: Migration errors

**Solution**:
```bash
# Reset database (WARNING: deletes all data)
npm run prisma:migrate reset

# Or manually drop and recreate
docker-compose down -v
docker-compose up -d
npm run prisma:migrate
```

### Issue: mem0.ai integration not working

The current implementation uses a mock mem0 service. To integrate the real mem0.ai SDK:

1. Verify `mem0ai` npm package is installed
2. Update `src/memories/mem0.service.ts` to use actual SDK calls
3. Ensure `MEM0_API_KEY` is set correctly

### Issue: Port 3001 already in use

**Solution**:
```bash
# Change PORT in .env file
PORT=3002

# Or kill process using port
lsof -ti:3001 | xargs kill -9
```

## Next Steps

1. **Implement Real mem0.ai Integration**: Replace mock implementation in `mem0.service.ts`
2. **Add Authentication**: Integrate Firebase Auth middleware
3. **Add Rate Limiting**: Protect endpoints from abuse
4. **Set Up Monitoring**: Add logging, metrics, and alerts
5. **Write More Tests**: Increase test coverage
6. **CI/CD Pipeline**: Automate testing and deployment

## Support

- Swagger Docs: http://localhost:3001/api/docs
- Prisma Studio: http://localhost:5555 (run `npm run prisma:studio`)
- GitHub Issues: [Create issue]

---

**Implementation Complete!** 🎉

You now have a fully functional Memory Service ready for development and testing.
