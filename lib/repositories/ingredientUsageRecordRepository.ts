import type { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { ingredientStatusReverseMap } from '@/prisma/enumMaps';
import type { DbClient } from './types';

export async function findAll(client: DbClient = prisma) {
  const rows = await client.ingredientUsageRecord.findMany();
  return rows.map((r) => ({ ...r, status: ingredientStatusReverseMap[r.status] }));
}

// Bulk reset/seed path: rows are already Prisma-shaped (built by prisma/seedData.ts).
export async function deleteAll(client: DbClient = prisma) {
  return client.ingredientUsageRecord.deleteMany({});
}

export async function createMany(
  rows: Prisma.IngredientUsageRecordCreateManyInput[],
  client: DbClient = prisma,
) {
  return client.ingredientUsageRecord.createMany({ data: rows });
}
