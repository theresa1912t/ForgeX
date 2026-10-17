import { prisma } from '@/lib/prisma';
import type { Material } from '@/lib/types';
import type { DbClient } from './types';

export async function findAll(client: DbClient = prisma) {
  return client.material.findMany({ orderBy: { id: 'asc' } });
}

export async function findById(id: string, client: DbClient = prisma) {
  return client.material.findUnique({ where: { id } });
}

export async function update(id: string, data: Partial<Material>, client: DbClient = prisma) {
  return client.material.update({ where: { id }, data });
}
