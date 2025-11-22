import { PrismaClient } from '@prisma/client';
import { execSync } from 'child_process';

const prisma = new PrismaClient();

async function isDatabaseEmpty(): Promise<boolean> {
  try {
    // Check if any tables exist in the public schema
    const result = await prisma.$queryRaw<Array<{ table_name: string }>>`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
        AND table_type = 'BASE TABLE'
        AND table_name NOT IN ('_prisma_migrations')
    `;

    return result.length === 0;
  } catch (error) {
    console.error('Error checking database state:', error);
    throw error;
  }
}

async function initializeDatabase() {
  console.log('🔍 Checking database state...');

  try {
    const isEmpty = await isDatabaseEmpty();

    if (!isEmpty) {
      console.log('✅ Database already contains tables. Skipping initialization.');
      console.log('   If you want to reinitialize, please drop the database first.');
      return;
    }

    console.log('📊 Database is empty. Initializing schema...');

    // Run Prisma migrations
    console.log('🔨 Running Prisma migrations...');
    execSync('npx prisma migrate deploy', {
      stdio: 'inherit',
      cwd: __dirname + '/..'
    });

    console.log('✅ Database initialized successfully!');
    console.log('\n📋 Created tables:');
    console.log('   - users');
    console.log('   - chats');
    console.log('   - messages');
    console.log('   - memories');

  } catch (error) {
    console.error('❌ Error initializing database:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run if executed directly
if (require.main === module) {
  initializeDatabase()
    .then(() => {
      console.log('\n✨ Database initialization complete!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Database initialization failed:', error);
      process.exit(1);
    });
}

export { initializeDatabase, isDatabaseEmpty };
