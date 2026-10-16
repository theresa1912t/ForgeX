import { $Enums, type Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { recommendationStatusMap, recommendationStatusReverseMap } from '@/prisma/enumMaps';
import type { RecommendedAction } from '@/lib/types';
import type { DbClient } from './types';

function serialize<T extends { status: $Enums.RecommendationStatus }>(row: T) {
  return { ...row, status: recommendationStatusReverseMap[row.status] };
}

export async function findById(id: string, client: DbClient = prisma) {
  const row = await client.recommendedAction.findUnique({ where: { id } });
  return row ? serialize(row) : null;
}

export async function updateStatus(
  id: string,
  status: RecommendedAction['status'],
  client: DbClient = prisma,
) {
  const row = await client.recommendedAction.update({
    where: { id },
    data: { status: recommendationStatusMap[status] },
  });
  return serialize(row);
}

// Bulk reset/seed path: rows are already Prisma-shaped (built by prisma/seedData.ts).
export async function deleteAll(client: DbClient = prisma) {
  return client.recommendedAction.deleteMany({});
}

export async function createMany(
  rows: Prisma.RecommendedActionCreateManyInput[],
  client: DbClient = prisma,
) {
  return client.recommendedAction.createMany({ data: rows });
}
