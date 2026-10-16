import { prisma } from '@/lib/prisma';
import type { DbClient } from './types';

export async function findAll(client: DbClient = prisma) {
  return client.product.findMany();
}

export async function findByName(name: string, client: DbClient = prisma) {
  return client.product.findFirst({ where: { name } });
}
