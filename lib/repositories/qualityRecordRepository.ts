import { prisma } from '@/lib/prisma';
import type { DbClient } from './types';

export async function findAll(client: DbClient = prisma) {
  return client.qualityRecord.findMany({ orderBy: { id: 'asc' } });
}
