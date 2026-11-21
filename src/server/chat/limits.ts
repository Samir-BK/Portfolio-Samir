import 'server-only';
import { randomUUID } from 'node:crypto';
import { writeDatabase } from '../db.ts';
import type { ChatLimits } from './config.ts';

type Admission =
  | { accepted: true; release: () => Promise<void> }
  | { accepted: false; retryAfter: number; reason: 'rate' | 'budget' | 'busy' };

export async function admit(limits: ChatLimits): Promise<Admission> {
  const id = randomUUID();
  const result = await writeDatabase(async (tx) => {
    // A transaction-scoped lock serializes reservations across all app replicas.
    await tx.$executeRaw`SELECT pg_advisory_xact_lock(1928771206)`;
    const [{ now }] = await tx.$queryRaw<
      { now: Date }[]
    >`SELECT clock_timestamp() AS now`;
    const timestamp = now.getTime();
    const minute = Math.floor(timestamp / 60_000) * 60_000;
    const day = Date.UTC(
      now.getUTCFullYear(),
      now.getUTCMonth(),
      now.getUTCDate(),
    );
    const month = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1);
    const windows = [
      {
        key: 'minute:' + minute,
        expiresAt: new Date(minute + 60_000),
        ceiling: limits.perMinute,
        reason: 'rate',
      },
      {
        key: 'day:' + day,
        expiresAt: new Date(day + 86_400_000),
        ceiling: limits.perDay,
        reason: 'budget',
      },
      {
        key: 'month:' + month,
        expiresAt: new Date(
          Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1),
        ),
        ceiling: limits.perMonth,
        reason: 'budget',
      },
    ] as const;
    await tx.assistantRequestLease.deleteMany({
      where: { expiresAt: { lte: now } },
    });
    await tx.assistantUsageWindow.deleteMany({
      where: { expiresAt: { lte: now } },
    });
    const counts = await tx.assistantUsageWindow.findMany({
      where: { key: { in: windows.map(({ key }) => key) } },
    });
    const capped = windows.filter(
      ({ key, ceiling }) =>
        (counts.find((row) => row.key === key)?.count ?? 0) >= ceiling,
    );
    const blocked = capped.at(-1);
    if (blocked) {
      return {
        accepted: false,
        reason: blocked.reason,
        retryAfter: Math.max(
          1,
          Math.ceil((blocked.expiresAt.getTime() - timestamp) / 1000),
        ),
      } as const;
    }
    if ((await tx.assistantRequestLease.count()) >= limits.concurrent) {
      return { accepted: false, reason: 'busy', retryAfter: 3 } as const;
    }
    for (const { key, expiresAt } of windows) {
      await tx.assistantUsageWindow.upsert({
        where: { key },
        create: { key, count: 1, expiresAt },
        update: { count: { increment: 1 } },
      });
    }
    await tx.assistantRequestLease.create({
      data: { id, expiresAt: new Date(timestamp + limits.timeoutMs + 15_000) },
    });
    return { accepted: true } as const;
  });
  if (!result.accepted) return result;
  return {
    accepted: true,
    async release() {
      await writeDatabase(async (tx) => {
        await tx.assistantRequestLease.deleteMany({ where: { id } });
      });
    },
  };
}
