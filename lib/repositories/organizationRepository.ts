import { prisma } from '@/lib/prisma';
import type { DbClient } from './types';
import { initialOrganization } from '@/lib/mockData';
import { safeDb } from './safeDb';

export async function findFirst(client: DbClient = prisma) {
  return safeDb(
    () => client.organization.findFirst(),
    initialOrganization
  );
}
