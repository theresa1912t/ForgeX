import { prisma } from '@/lib/prisma';
import { downtimeCategoryReverseMap } from '@/prisma/enumMaps';
import { initialDowntimeRecords } from '@/lib/mockData';
import { safeDb } from './safeDb';
import type { DbClient } from './types';

export async function findAll(client: DbClient = prisma) {
  return safeDb(
    async () => {
      const rows = await client.downtimeRecord.findMany({ orderBy: { id: 'asc' } });
      return rows.map((r) => ({ ...r, category: downtimeCategoryReverseMap[r.category] }));
    },
    initialDowntimeRecords
  );
}

export async function findByMachine(machineId: string, client: DbClient = prisma) {
  return safeDb(
    async () => {
      const rows = await client.downtimeRecord.findMany({
        where: { machineId },
        orderBy: { id: 'asc' },
      });
      return rows.map((r) => ({ ...r, category: downtimeCategoryReverseMap[r.category] }));
    },
    () => initialDowntimeRecords.filter((d) => d.machineId === machineId)
  );
}
