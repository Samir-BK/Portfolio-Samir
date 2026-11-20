import { createDatabase } from '../src/server/db.ts';
import { seedDemo } from './demo-data.ts';
import { localDatabaseUrl } from './local-database.ts';

if (process.env.NODE_ENV === 'production') {
  throw new Error('Demo seeding is disabled in production.');
}

const url = localDatabaseUrl(process.env.DATABASE_URL, 'dev');
const db = createDatabase(url);
try {
  await seedDemo(db);
  console.log('Demo content seeded. Existing records were preserved.');
} catch {
  console.error(
    'Demo seed failed. Check that the development database is running and migrated.',
  );
  process.exitCode = 1;
} finally {
  await db.$disconnect();
}
