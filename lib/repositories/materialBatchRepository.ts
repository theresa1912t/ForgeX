import { randomUUID } from 'crypto';
import { $Enums } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { batchStatusMap, batchStatusReverseMap } from '@/prisma/enumMaps';
import { initialMaterialBatches } from '@/lib/mockData';
import { safeDb } from './safeDb';
import type { MaterialBatch } from '@/lib/types';
import type { DbClient } from './types';

function serialize<T extends { status: $Enums.MaterialBatchStatus }>(row: T) {
  return { ...row, status: batchStatusReverseMap[row.status] };
}

export async function findAll(client: DbClient = prisma) {
  return safeDb(
    async () => {
      const rows = await client.materialBatch.findMany({ orderBy: { id: 'asc' } });
      return rows.map(serialize);
    },
    initialMaterialBatches
  );
}

export async function findByRelatedAlert(alertId: string, client: DbClient = prisma) {
  return safeDb(
    async () => {
      const rows = await client.materialBatch.findMany({
        where: { relatedAlertIds: { has: alertId } },
        orderBy: { id: 'asc' },
      });
      return rows.map(serialize);
    },
    () => initialMaterialBatches.filter((b) => b.relatedAlertIds?.includes(alertId))
  );
}

export async function create(data: Omit<MaterialBatch, 'id'>, client: DbClient = prisma) {
  const batchId = `mb-user-${randomUUID()}`;
  return safeDb(
    async () => {
      const row = await client.materialBatch.create({
        data: {
          id: batchId,
          materialId: data.materialId,
          batchCode: data.batchCode,
          supplierName: data.supplierName,
          supplierBatchNo: data.supplierBatchNo,
          receivedDate: data.receivedDate,
          expiryDate: data.expiryDate,
          initialQuantityKg: data.initialQuantityKg,
          currentQuantityKg: data.currentQuantityKg,
          qualityStatus: data.qualityStatus,
          status: batchStatusMap[data.status],
          labTests: data.labTests as any,
          coaUrl: data.coaUrl,
          assignedLineId: data.assignedLineId,
          assignedMachineId: data.assignedMachineId,
          notes: data.notes,
          relatedAlertIds: data.relatedAlertIds,
        },
      });
      return serialize(row);
    },
    () => ({ id: batchId, ...data })
  );
}
