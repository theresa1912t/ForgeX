import { prisma } from '@/lib/prisma';
import { downtimeCategoryReverseMap } from '@/prisma/enumMaps';
import type { DbClient } from './types';

export async function findAll(client: DbClient = prisma) {
  const rows = await client.downtimeRecord.findMany({ orderBy: { id: 'asc' } });
  return rows.map((r) => ({ ...r, category: downtimeCategoryReverseMap[r.category] }));
}

export async function findByMachine(machineId: string, client: DbClient = prisma) {
  const rows = await client.downtimeRecord.findMany({
    where: { machineId },
    orderBy: { id: 'asc' },
  });
  return rows.map((r) => ({ ...r, category: downtimeCategoryReverseMap[r.category] }));
}
