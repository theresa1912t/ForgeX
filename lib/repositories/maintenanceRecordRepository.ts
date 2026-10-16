import { randomUUID } from 'crypto';
import { $Enums, type Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { maintenanceStatusMap, maintenanceStatusReverseMap } from '@/prisma/enumMaps';
import type { MaintenanceRecord } from '@/lib/types';
import type { DbClient } from './types';

function serialize<T extends { status: $Enums.MaintenanceStatus }>(row: T) {
  return { ...row, status: maintenanceStatusReverseMap[row.status] };
}

export async function findAll(client: DbClient = prisma) {
  const rows = await client.maintenanceRecord.findMany();
  return rows.map(serialize);
}

export async function create(data: Omit<MaintenanceRecord, 'id'>, client: DbClient = prisma) {
  const row = await client.maintenanceRecord.create({
    data: {
      id: `maint-${randomUUID()}`,
      machineId: data.machineId,
      machineName: data.machineName,
      date: data.date,
      type: data.type,
      issue: data.issue,
      failureType: data.failureType,
      repairDurationMinutes: data.repairDurationMinutes,
      technician: data.technician,
      notes: data.notes,
      status: maintenanceStatusMap[data.status],
    },
  });
  return serialize(row);
}

// Bulk reset/seed path: rows are already Prisma-shaped (built by prisma/seedData.ts).
export async function deleteAll(client: DbClient = prisma) {
  return client.maintenanceRecord.deleteMany({});
}

export async function createMany(
  rows: Prisma.MaintenanceRecordCreateManyInput[],
  client: DbClient = prisma,
) {
  return client.maintenanceRecord.createMany({ data: rows });
}
