#!/bin/sh
set -e

echo "Starting Memory Service..."

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

# Generate Prisma Client (in case it's not already generated)
echo "Generating Prisma Client..."
npx prisma@6 generate

# Initialize database (only creates tables if empty)
echo "Initializing database schema..."
npm run db:init || npx prisma@6 migrate deploy

echo "Starting application..."
# Execute the main command
exec "$@"
