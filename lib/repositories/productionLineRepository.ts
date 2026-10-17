import type { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import type { DbClient } from './types';
import { initialProductionLines } from '@/lib/mockData';
import { safeDb } from './safeDb';

export async function findAll(client: DbClient = prisma) {
  return safeDb(
    () => client.productionLine.findMany({ orderBy: { id: 'asc' } }),
    initialProductionLines
  );
}

export async function findById(id: string, client: DbClient = prisma) {
  return safeDb(
    () => client.productionLine.findUnique({ where: { id } }),
    () => initialProductionLines.find((l) => l.id === id) || initialProductionLines[0]
  );
}

export async function update(
  id: string,
  data: Prisma.ProductionLineUpdateInput,
  client: DbClient = prisma,
) {
  return safeDb(
    () => client.productionLine.update({ where: { id }, data }),
    () => ({ ...initialProductionLines.find((l) => l.id === id), ...(data as any) })
  );
}
