import { prisma } from '@/lib/prisma';
import { initialProducts } from '@/lib/mockData';
import { safeDb } from './safeDb';
import type { DbClient } from './types';

export async function findAll(client: DbClient = prisma) {
  return safeDb(
    () => client.product.findMany({ orderBy: { id: 'asc' } }),
    initialProducts
  );
}

export async function findByName(name: string, client: DbClient = prisma) {
  return safeDb(
    () => client.product.findFirst({ where: { name } }),
    () => initialProducts.find((p) => p.name === name) || initialProducts[0]
  );
}

export async function findById(id: string, client: DbClient = prisma) {
  return safeDb(
    () => client.product.findUnique({ where: { id } }),
    () => initialProducts.find((p) => p.id === id) || initialProducts[0]
  );
}
