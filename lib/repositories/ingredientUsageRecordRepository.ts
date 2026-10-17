import type { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { ingredientStatusReverseMap } from '@/prisma/enumMaps';
import { initialIngredientUsageRecords } from '@/lib/mockData';
import { safeDb } from './safeDb';
import type { DbClient } from './types';

export async function findAll(client: DbClient = prisma) {
  return safeDb(
    async () => {
      const rows = await client.ingredientUsageRecord.findMany({ orderBy: { id: 'asc' } });
      return rows.map((r) => ({ ...r, status: ingredientStatusReverseMap[r.status] }));
    },
    initialIngredientUsageRecords
  );
}

export async function deleteAll(client: DbClient = prisma) {
  return safeDb(() => client.ingredientUsageRecord.deleteMany({}), { count: 0 });
}

export async function createMany(
  rows: Prisma.IngredientUsageRecordCreateManyInput[],
  client: DbClient = prisma,
) {
  return safeDb(() => client.ingredientUsageRecord.createMany({ data: rows }), { count: rows.length });
}
