import type { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import type { DbClient } from './types';

export async function findByMachine(machineId: string, limit = 50, client: DbClient = prisma) {
  return client.productionMetric.findMany({
    where: { machineId },
    orderBy: { intervalStart: 'desc' },
    take: limit,
  });
}

export async function createMany(
  rows: Prisma.ProductionMetricCreateManyInput[],
  client: DbClient = prisma,
) {
  return client.productionMetric.createMany({ data: rows });
}

// Bulk reset/seed path: mirrors every other repository's deleteAll.
export async function deleteAll(client: DbClient = prisma) {
  return client.productionMetric.deleteMany({});
}
