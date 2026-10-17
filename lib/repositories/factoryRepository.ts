import { prisma } from '@/lib/prisma';
import type { DbClient } from './types';
import { initialFactories } from '@/lib/mockData';
import { safeDb } from './safeDb';

export async function findAll(client: DbClient = prisma) {
  return safeDb(
    () => client.factory.findMany({ orderBy: { id: 'asc' } }),
    initialFactories
  );
}
