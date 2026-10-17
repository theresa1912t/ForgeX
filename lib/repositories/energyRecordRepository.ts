import { prisma } from '@/lib/prisma';
import { initialEnergyRecords } from '@/lib/mockData';
import { safeDb } from './safeDb';
import type { DbClient } from './types';

export async function findAll(client: DbClient = prisma) {
  return safeDb(
    () => client.energyRecord.findMany({ orderBy: { id: 'asc' } }),
    initialEnergyRecords
  );
}
