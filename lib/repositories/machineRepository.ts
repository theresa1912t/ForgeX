import { $Enums } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { machineStatusMap, machineStatusReverseMap } from '@/prisma/enumMaps';
import { initialMachines } from '@/lib/mockData';
import { safeDb } from './safeDb';
import type { Machine } from '@/lib/types';
import type { DbClient } from './types';

function serialize<T extends { status: $Enums.MachineStatus }>(
  row: T,
): Omit<T, 'status'> & { status: Machine['status'] } {
  return { ...row, status: machineStatusReverseMap[row.status] };
}

export async function findAll(client: DbClient = prisma) {
  return safeDb(
    async () => {
      const rows = await client.machine.findMany({ orderBy: { id: 'asc' } });
      return rows.map(serialize);
    },
    initialMachines
  );
}

export async function findById(id: string, client: DbClient = prisma) {
  return safeDb(
    async () => {
      const row = await client.machine.findUnique({ where: { id } });
      return row ? serialize(row) : null;
    },
    () => initialMachines.find((m) => m.id === id) || initialMachines[0]
  );
}

export async function update(id: string, data: Partial<Machine>, client: DbClient = prisma) {
  return safeDb(
    async () => {
      const row = await client.machine.update({
        where: { id },
        data: { ...data, status: data.status ? machineStatusMap[data.status] : undefined },
      });
      return serialize(row);
    },
    () => {
      const existing = initialMachines.find((m) => m.id === id) || initialMachines[0];
      return { ...existing, ...data };
    }
  );
}
