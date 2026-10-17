import { $Enums } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { machineStatusMap, machineStatusReverseMap } from '@/prisma/enumMaps';
import type { Machine } from '@/lib/types';
import type { DbClient } from './types';

function serialize<T extends { status: $Enums.MachineStatus }>(row: T) {
  return { ...row, status: machineStatusReverseMap[row.status] };
}

export async function findAll(client: DbClient = prisma) {
  const rows = await client.machine.findMany({ orderBy: { id: 'asc' } });
  return rows.map(serialize);
}

export async function findById(id: string, client: DbClient = prisma) {
  const row = await client.machine.findUnique({ where: { id } });
  return row ? serialize(row) : null;
}

export async function update(id: string, data: Partial<Machine>, client: DbClient = prisma) {
  const row = await client.machine.update({
    where: { id },
    data: { ...data, status: data.status ? machineStatusMap[data.status] : undefined },
  });
  return serialize(row);
}
