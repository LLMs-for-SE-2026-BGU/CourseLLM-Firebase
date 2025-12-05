#!/bin/sh
set -e

echo "Starting Memory Service (Development Mode)..."

# Wait for database to be ready
echo "Waiting for database connection..."
until node -e "
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
prisma.\$connect()
  .then(() => {
    console.log('Database connected');
    process.exit(0);
  })
  .catch(() => {
    console.log('Database not ready yet...');
    process.exit(1);
  });
" 2>/dev/null; do
  echo "Database is unavailable - sleeping"
  sleep 2
done

echo "Database is ready!"

# Generate Prisma Client
echo "Generating Prisma Client..."
npx prisma generate

# Initialize database (only creates tables if empty)
echo "Initializing database schema..."
npm run db:init || npx prisma migrate deploy

echo "Starting development server with hot reload..."
# Execute the main command
exec "$@"
