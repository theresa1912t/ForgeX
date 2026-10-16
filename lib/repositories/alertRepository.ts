import { $Enums, type Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { alertStatusMap, alertStatusReverseMap } from '@/prisma/enumMaps';
import type { AlertStatus } from '@/lib/types';
import type { DbClient } from './types';

function serialize<T extends { status: $Enums.AlertStatus }>(row: T) {
  return { ...row, status: alertStatusReverseMap[row.status] };
}

export async function findAll(client: DbClient = prisma) {
  const rows = await client.alert.findMany();
  return rows.map(serialize);
}

export async function findById(id: string, client: DbClient = prisma) {
  const row = await client.alert.findUnique({ where: { id } });
  return row ? serialize(row) : null;
}

export async function updateStatus(
  id: string,
  status: AlertStatus,
  extra: { resolvedAt?: string } = {},
  client: DbClient = prisma,
) {
  const row = await client.alert.update({
    where: { id },
    data: { status: alertStatusMap[status], ...extra },
  });
  return serialize(row);
}

// Bulk reset/seed path: rows are already Prisma-shaped (built by prisma/seedData.ts).
export async function deleteAll(client: DbClient = prisma) {
  return client.alert.deleteMany({});
}

export async function createMany(rows: Prisma.AlertCreateManyInput[], client: DbClient = prisma) {
  return client.alert.createMany({ data: rows });
}
