import type { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import type { DbClient } from './types';

export async function findAll(client: DbClient = prisma) {
  return client.productionLine.findMany({ orderBy: { id: 'asc' } });
}

export async function findById(id: string, client: DbClient = prisma) {
  return client.productionLine.findUnique({ where: { id } });
}

export async function update(
  id: string,
  data: Prisma.ProductionLineUpdateInput,
  client: DbClient = prisma,
) {
  return client.productionLine.update({ where: { id }, data });
}
