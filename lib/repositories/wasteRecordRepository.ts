import { randomUUID } from 'crypto';
import { $Enums, type Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import {
  wasteDefectCategoryMap,
  wasteDefectCategoryReverseMap,
  wasteReasonMap,
  wasteReasonReverseMap,
} from '@/prisma/enumMaps';
import { initialWasteRecords } from '@/lib/mockData';
import { safeDb } from './safeDb';
import type { WasteRecord } from '@/lib/types';
import type { DbClient } from './types';

function serialize<T extends { defectCategory: $Enums.WasteDefectCategory | null; wasteReason: $Enums.WasteReason }>(
  row: T,
) {
  return {
    ...row,
    defectCategory: row.defectCategory ? wasteDefectCategoryReverseMap[row.defectCategory] : null,
    wasteReason: wasteReasonReverseMap[row.wasteReason],
  };
}

export async function findAll(client: DbClient = prisma) {
  return safeDb(
    async () => {
      const rows = await client.wasteRecord.findMany({ orderBy: { id: 'asc' } });
      return rows.map(serialize);
    },
    initialWasteRecords
  );
}

export async function findByMachine(machineId: string, client: DbClient = prisma) {
  return safeDb(
    async () => {
      const rows = await client.wasteRecord.findMany({ where: { machineId }, orderBy: { id: 'asc' } });
      return rows.map(serialize);
    },
    () => initialWasteRecords.filter((w) => w.machineId === machineId)
  );
}

export async function create(
  data: Omit<WasteRecord, 'id' | 'timestamp'>,
  client: DbClient = prisma,
) {
  const wasteId = `w-user-${randomUUID()}`;
  return safeDb(
    async () => {
      const row = await client.wasteRecord.create({
        data: {
          id: wasteId,
          materialId: data.materialId ?? null,
          materialName: data.materialName,
          batchCode: data.batchCode ?? null,
          lineId: data.lineId,
          lineName: data.lineName,
          machineId: data.machineId ?? null,
          machineName: data.machineName ?? null,
          productId: data.productId ?? null,
          productName: data.productName ?? null,
          quantityKg: data.quantityKg,
          costImpactUsd: data.costImpactUsd,
          wasteReason: wasteReasonMap[data.wasteReason],
          defectCategory: data.defectCategory ? wasteDefectCategoryMap[data.defectCategory] : null,
          timestamp: 'Just now',
          shift: data.shift,
          notes: data.notes,
        },
      });
      return serialize(row);
    },
    () => ({ id: wasteId, ...data, timestamp: 'Just now' })
  );
}

export async function deleteAll(client: DbClient = prisma) {
  return safeDb(() => client.wasteRecord.deleteMany({}), { count: 0 });
}

export async function createMany(
  rows: Prisma.WasteRecordCreateManyInput[],
  client: DbClient = prisma,
) {
  return safeDb(() => client.wasteRecord.createMany({ data: rows }), { count: rows.length });
}
