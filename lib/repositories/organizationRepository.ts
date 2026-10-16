import { prisma } from '@/lib/prisma';
import type { DbClient } from './types';

export async function findFirst(client: DbClient = prisma) {
  return client.organization.findFirst();
}
