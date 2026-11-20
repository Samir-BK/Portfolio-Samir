import 'server-only';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient, Prisma } from '../generated/prisma/client.ts';

export function createDatabase(connectionString: string) {
  return new PrismaClient({
    adapter: new PrismaPg({ connectionString, connectionTimeoutMillis: 5_000 }),
  });
}

const globalDatabase = globalThis as typeof globalThis & {
  portfolioDatabase?: PrismaClient;
};

function database() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error('Missing DATABASE_URL');
  return (globalDatabase.portfolioDatabase ??= createDatabase(url));
}

export async function readDatabase<T>(
  query: (tx: Prisma.TransactionClient) => Promise<T>,
) {
  try {
    return await database().$transaction(query, {
      isolationLevel: 'RepeatableRead',
    });
  } catch (error) {
    const code =
      error instanceof Prisma.PrismaClientKnownRequestError &&
      /^P\d{4}$/.test(error.code)
        ? error.code
        : 'unknown';
    console.error('Portfolio content read failed.', { code });
    throw new Error('Portfolio content is temporarily unavailable.');
  }
}
