import { prisma } from '@/lib/prisma';
import { initialMaterials } from '@/lib/mockData';
import { safeDb } from './safeDb';
import type { Material } from '@/lib/types';
import type { DbClient } from './types';

export async function findAll(client: DbClient = prisma) {
  return safeDb(
    () => client.material.findMany({ orderBy: { id: 'asc' } }),
    initialMaterials
  );
}

export async function findById(id: string, client: DbClient = prisma) {
  return safeDb(
    () => client.material.findUnique({ where: { id } }),
    () => initialMaterials.find((m) => m.id === id) || initialMaterials[0]
  );
}

export async function update(id: string, data: Partial<Material>, client: DbClient = prisma) {
  return safeDb(
    () => client.material.update({ where: { id }, data }),
    () => {
      const existing = initialMaterials.find((m) => m.id === id) || initialMaterials[0];
      return { ...existing, ...data };
    }
  );
}
