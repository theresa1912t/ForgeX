import { prisma } from '@/lib/prisma';
import type { DbClient } from './types';

export async function findAll(client: DbClient = prisma) {
  return client.product.findMany({ orderBy: { id: 'asc' } });
}

export async function findByName(name: string, client: DbClient = prisma) {
  return client.product.findFirst({ where: { name } });
}

export async function findById(id: string, client: DbClient = prisma) {
  return client.product.findUnique({ where: { id } });
}
