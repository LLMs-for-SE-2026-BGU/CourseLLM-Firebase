# Memory Service

A NestJS microservice that provides persistent conversational memory for the CourseWise platform. It stores complete conversation history in PostgreSQL and uses mem0.ai to synthesize meaningful student insights for personalized learning experiences.

## Features

- **User Registration**: Initialize users in the memory system
- **Message Persistence**: Save and retrieve conversation messages
- **Conversation Management**: Paginated message retrieval and conversation listing
- **Memory Synthesis**: Extract learning insights using mem0.ai
- **RESTful API**: Versioned endpoints (`/api/v1/memory/*`)
- **Swagger Documentation**: Auto-generated API docs

## Architecture

- **Runtime**: Node.js with TypeScript
- **Framework**: NestJS 10.x
- **Database**: PostgreSQL 15+ (Prisma ORM)
- **Memory Engine**: mem0.ai SDK
- **API Documentation**: Swagger/OpenAPI

## Prerequisites

- Node.js 18+ and npm
- Docker and Docker Compose (for local PostgreSQL)
- mem0.ai API key (sign up at https://mem0.ai)

## Quick Start

### Option 1: Docker (Recommended)

**Production:**
```bash
cd src/services/memory-service
cp .env.example .env
# Edit .env with your MEM0_API_KEY
docker-compose up -d
```

**Development (with hot reload):**
```bash
cd src/services/memory-service
cp .env.example .env
# Edit .env with your MEM0_API_KEY
docker-compose -f docker-compose.dev.yml up -d
```

📖 See [DOCKER.md](./DOCKER.md) for complete Docker documentation.

### Option 2: Local Development

**1. Install Dependencies**

```bash
cd src/services/memory-service
npm install
```

**2. Set Up Environment Variables**

```bash
cp .env.example .env
```

Edit `.env` with your configuration:

```env
NODE_ENV=development
PORT=3001
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/memory_service?schema=public"
MEM0_API_KEY=your_mem0_api_key_here
LOG_LEVEL=debug
```

### 3. Start PostgreSQL Database

```bash
docker-compose up -d
```

This starts a local PostgreSQL instance on port 5432.

### 4. Run Database Migrations

```bash
npm run prisma:generate
npm run prisma:migrate
```

### 5. Start the Service

```bash
# Development mode with hot reload
npm run start:dev

# Production mode
npm run build
npm run start:prod
```

The service will be available at:
- API: http://localhost:3001
- Swagger Docs: http://localhost:3001/api/docs

## API Endpoints

### User Registration
**POST** `/api/v1/memory/register`

Register a new user in the memory system (idempotent).

```json
{
  "userID": "user_abc123",
  "name": "John Doe",
  "role": "student",
  "userInfo": {}
}
```

### Save Message
**POST** `/api/v1/memory/messages`

Save a message to a conversation. Creates new conversation if `chatID` is null.

```json
{
  "chatID": "chat_xyz789",
  "userID": "user_abc123",
  "content": "Can you explain derivatives?",
  "sender": "user",
  "metadata": {}
}
```

### Get Conversation (Paginated)
**GET** `/api/v1/memory/conversations/:chatID?page=1&pageSize=20`

Retrieve messages from a conversation with pagination (newest first).

### Get User Conversations
**GET** `/api/v1/memory/users/:userID/conversations?limit=50`

Get all conversations for a user (most recent first).

### Synthesize Memories
**POST** `/api/v1/memory/synthesize`

Generate synthesized memories from conversation history using mem0.ai.

```json
{
  "chatID": "chat_xyz789",
  "query": "learning preferences and knowledge gaps"
}
```

### Get User Memories
**GET** `/api/v1/memory/users/:userID/memories`

Retrieve all synthesized memories for a user.

## Database Schema

### Users
- `user_id` (PK): Unique identifier
- `name`: Display name
- `role`: student | teacher | admin
- `user_info`: JSONB metadata

### Chats
- `chat_id` (PK): Unique identifier
- `user_id` (FK): References users
- `title`: Auto-generated conversation title
- `message_count`: Total messages
- `last_updated_at`: Timestamp

### Messages
- `message_id` (PK): Unique identifier
- `chat_id` (FK): References chats
- `content`: Message text
- `sender`: user | assistant | system
- `sequence_number`: Auto-incrementing order

### Memories
- `memory_id` (PK): Unique identifier
- `user_id` (FK): References users
- `content`: Synthesized memory text
- `mem0_memory_id`: Reference to mem0.ai
- `source_chat_ids`: Array of originating chats

## Development Commands

```bash
# Start development server
npm run start:dev

# Run linter
npm run lint

# Format code
npm run format

# Run tests
npm run test

# Generate Prisma client
npm run prisma:generate

# Create migration
npm run prisma:migrate

# Open Prisma Studio
npm run prisma:studio
```

## Production Deployment

### Firebase Cloud SQL

1. Create a Cloud SQL PostgreSQL instance in Firebase
2. Update `DATABASE_URL` to use Cloud SQL socket:
   ```
   DATABASE_URL="postgresql://user:password@/memory_service?host=/cloudsql/project:region:instance"
   ```
3. Set environment variables in Cloud Run/Functions

### Build for Production

```bash
npm run build
npm run start:prod
```

## Testing

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov
```

## mem0.ai Integration

The service uses mem0.ai for semantic memory synthesis. To configure:

1. Sign up at https://mem0.ai and get an API key
2. Set `MEM0_API_KEY` in your `.env` file
3. The service will automatically synthesize memories when `/synthesize` is called

**Note**: The current implementation includes a mock mem0 service. To use the real mem0.ai SDK, install the package and update `src/memories/mem0.service.ts`.

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | Environment mode | `development` |
| `PORT` | Server port | `3001` |
| `DATABASE_URL` | PostgreSQL connection string | - |
| `MEM0_API_KEY` | mem0.ai API key | - |
| `MEM0_API_URL` | mem0.ai API endpoint | `https://api.mem0.ai` |

## Troubleshooting

### Database Connection Issues

```bash
# Check if PostgreSQL is running
docker-compose ps

# View PostgreSQL logs
docker-compose logs postgres

# Restart PostgreSQL
docker-compose restart postgres
```

### Prisma Issues

```bash
# Reset database
npm run prisma:migrate reset

# Push schema without migration
npx prisma db push
```

## License

MIT

## Support

For issues and questions, please file an issue on the GitHub repository.
