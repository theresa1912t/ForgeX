import { randomUUID } from 'crypto';
import { $Enums, type Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import {
  wasteDefectCategoryMap,
  wasteDefectCategoryReverseMap,
  wasteReasonMap,
  wasteReasonReverseMap,
} from '@/prisma/enumMaps';
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
  const rows = await client.wasteRecord.findMany({ orderBy: { id: 'asc' } });
  return rows.map(serialize);
}

export async function findByMachine(machineId: string, client: DbClient = prisma) {
  const rows = await client.wasteRecord.findMany({ where: { machineId }, orderBy: { id: 'asc' } });
  return rows.map(serialize);
}

export async function create(
  data: Omit<WasteRecord, 'id' | 'timestamp'>,
  client: DbClient = prisma,
) {
  const row = await client.wasteRecord.create({
    data: {
      id: `w-user-${randomUUID()}`,
      materialId: data.materialId ?? null,
      materialName: data.materialName,
      productionBatchCode: data.productionBatchCode,
      lineName: data.lineName,
      machineId: data.machineId ?? null,
      machineName: data.machineName ?? null,
      wasteQuantityKg: data.wasteQuantityKg,
      wasteType: data.wasteType,
      defectCategory: data.defectCategory ? wasteDefectCategoryMap[data.defectCategory] : null,
      wasteReason: wasteReasonMap[data.wasteReason],
      wasteCost: data.wasteCost,
      relatedAnomaly: data.relatedAnomaly ?? null,
      relatedInvestigationId: data.relatedInvestigationId ?? null,
      recoveryActionTaken: data.recoveryActionTaken ?? null,
      timestamp: new Date().toISOString(),
    },
  });
  return serialize(row);
}

// Bulk reset/seed path: rows are already Prisma-shaped (built by prisma/seedData.ts).
export async function deleteAll(client: DbClient = prisma) {
  return client.wasteRecord.deleteMany({});
}

export async function createMany(
  rows: Prisma.WasteRecordCreateManyInput[],
  client: DbClient = prisma,
) {
  return client.wasteRecord.createMany({ data: rows });
}
