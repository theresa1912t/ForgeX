import { randomUUID } from 'crypto';
import { $Enums, type Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { maintenanceStatusMap, maintenanceStatusReverseMap } from '@/prisma/enumMaps';
import { initialMaintenanceRecords } from '@/lib/mockData';
import { safeDb } from './safeDb';
import type { MaintenanceRecord } from '@/lib/types';
import type { DbClient } from './types';

function serialize<T extends { status: $Enums.MaintenanceStatus }>(row: T) {
  return { ...row, status: maintenanceStatusReverseMap[row.status] };
}

export async function findAll(client: DbClient = prisma) {
  return safeDb(
    async () => {
      const rows = await client.maintenanceRecord.findMany({ orderBy: { id: 'asc' } });
      return rows.map(serialize);
    },
    initialMaintenanceRecords
  );
}

export async function create(data: Omit<MaintenanceRecord, 'id'>, client: DbClient = prisma) {
  const maintId = `maint-${randomUUID()}`;
  return safeDb(
    async () => {
      const row = await client.maintenanceRecord.create({
        data: {
          id: maintId,
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
    },
    () => ({ id: maintId, ...data })
  );
}

export async function deleteAll(client: DbClient = prisma) {
  return safeDb(() => client.maintenanceRecord.deleteMany({}), { count: 0 });
}

export async function createMany(
  rows: Prisma.MaintenanceRecordCreateManyInput[],
  client: DbClient = prisma,
) {
  return safeDb(() => client.maintenanceRecord.createMany({ data: rows }), { count: rows.length });
}
