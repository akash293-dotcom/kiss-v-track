import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

describe('PostgreSQL integration', () => {
  beforeAll(async () => {
    expect(process.env.DATABASE_URL).toBeTruthy();
    await prisma.$connect();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('connects to PostgreSQL and executes a query', async () => {
    const result = await prisma.$queryRaw<Array<{ ok: number }>>`SELECT 1 AS ok`;
    expect(result).toEqual([{ ok: 1 }]);
  });

  it('can read the migrated schema', async () => {
    const result = await prisma.$queryRaw<Array<{ count: bigint }>>`
      SELECT COUNT(*)::bigint AS count
      FROM information_schema.tables
      WHERE table_schema = 'public'
    `;
    expect(Number(result[0]?.count || 0)).toBeGreaterThan(0);
  });
});
