import { prisma } from '@/lib/prisma';
import { initialQualityRecords } from '@/lib/mockData';
import { safeDb } from './safeDb';
import type { DbClient } from './types';

export async function findAll(client: DbClient = prisma) {
  return safeDb(
    () => client.qualityRecord.findMany({ orderBy: { id: 'asc' } }),
    initialQualityRecords
  );
}
