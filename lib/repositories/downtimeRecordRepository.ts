import { prisma } from '@/lib/prisma';
import { downtimeCategoryReverseMap } from '@/prisma/enumMaps';
import type { DbClient } from './types';

export async function findAll(client: DbClient = prisma) {
  const rows = await client.downtimeRecord.findMany();
  return rows.map((r) => ({ ...r, category: downtimeCategoryReverseMap[r.category] }));
}
