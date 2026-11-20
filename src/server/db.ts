import 'server-only';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient, Prisma } from '../generated/prisma/client.ts';

function serializeTransaction(
  tx: Awaited<
    ReturnType<Awaited<ReturnType<PrismaPg['connect']>>['startTransaction']>
  >,
): typeof tx {
  // Prisma can dispatch relation queries concurrently on a single transaction client.
  // Keep this queue local to the transaction until prisma/orm#30925 is fixed.
  let tail = Promise.resolve();
  function ordered<Args extends unknown[], Result>(
    operation: (...args: Args) => Promise<Result>,
  ) {
    return (...args: Args) => {
      const result = tail.then(() => operation(...args));
      // A failed operation still needs to let the adapter roll back.
      tail = result.then(
        () => undefined,
        () => undefined,
      );
      return result;
    };
  }
  return {
    provider: tx.provider,
    adapterName: tx.adapterName,
    options: tx.options,
    queryRaw: ordered(tx.queryRaw.bind(tx)),
    executeRaw: ordered(tx.executeRaw.bind(tx)),
    commit: ordered(tx.commit.bind(tx)),
    rollback: ordered(tx.rollback.bind(tx)),
    createSavepoint: tx.createSavepoint && ordered(tx.createSavepoint.bind(tx)),
    rollbackToSavepoint:
      tx.rollbackToSavepoint && ordered(tx.rollbackToSavepoint.bind(tx)),
    releaseSavepoint:
      tx.releaseSavepoint && ordered(tx.releaseSavepoint.bind(tx)),
  };
}

export function createDatabase(connectionString: string) {
  const pg = new PrismaPg({ connectionString, connectionTimeoutMillis: 5_000 });
  return new PrismaClient({
    adapter: {
      provider: pg.provider,
      adapterName: pg.adapterName,
      async connect() {
        const driver = await pg.connect();
        return {
          provider: driver.provider,
          adapterName: driver.adapterName,
          queryRaw: driver.queryRaw.bind(driver),
          executeRaw: driver.executeRaw.bind(driver),
          executeScript: driver.executeScript.bind(driver),
          getConnectionInfo: driver.getConnectionInfo.bind(driver),
          dispose: driver.dispose.bind(driver),
          async startTransaction(isolationLevel) {
            return serializeTransaction(
              await driver.startTransaction(isolationLevel),
            );
          },
        };
      },
    },
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
