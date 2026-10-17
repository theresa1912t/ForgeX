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

function serialize<
  T extends {
    materialId: string | null;
    machineId: string | null;
    machineName: string | null;
    defectCategory: $Enums.WasteDefectCategory | null;
    wasteReason: $Enums.WasteReason;
    relatedAnomaly: string | null;
    relatedInvestigationId: string | null;
    recoveryActionTaken: string | null;
  },
>(
  row: T,
): Omit<
  T,
  | 'materialId'
  | 'machineId'
  | 'machineName'
  | 'defectCategory'
  | 'wasteReason'
  | 'relatedAnomaly'
  | 'relatedInvestigationId'
  | 'recoveryActionTaken'
> & {
  materialId?: WasteRecord['materialId'];
  machineId?: WasteRecord['machineId'];
  machineName?: WasteRecord['machineName'];
  defectCategory?: WasteRecord['defectCategory'];
  wasteReason: WasteRecord['wasteReason'];
  relatedAnomaly?: WasteRecord['relatedAnomaly'];
  relatedInvestigationId?: WasteRecord['relatedInvestigationId'];
  recoveryActionTaken?: WasteRecord['recoveryActionTaken'];
} {
  const {
    materialId,
    machineId,
    machineName,
    defectCategory,
    wasteReason,
    relatedAnomaly,
    relatedInvestigationId,
    recoveryActionTaken,
    ...rest
  } = row;
  return {
    ...rest,
    materialId: materialId ?? undefined,
    machineId: machineId ?? undefined,
    machineName: machineName ?? undefined,
    defectCategory: defectCategory ? wasteDefectCategoryReverseMap[defectCategory] : undefined,
    wasteReason: wasteReasonReverseMap[wasteReason],
    relatedAnomaly: relatedAnomaly ?? undefined,
    relatedInvestigationId: relatedInvestigationId ?? undefined,
    recoveryActionTaken: recoveryActionTaken ?? undefined,
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
  const timestamp = new Date().toISOString();
  return safeDb(
    async () => {
      const row = await client.wasteRecord.create({
        data: {
          id: wasteId,
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
          timestamp,
        },
      });
      return serialize(row);
    },
    () => ({ id: wasteId, ...data, timestamp })
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
