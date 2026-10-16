import type { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import type { DbClient } from './types';

export async function findAll(client: DbClient = prisma) {
  return client.productionLine.findMany();
}

export async function update(
  id: string,
  data: Prisma.ProductionLineUpdateInput,
  client: DbClient = prisma,
) {
  return client.productionLine.update({ where: { id }, data });
}
