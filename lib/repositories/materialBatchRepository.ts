import { randomUUID } from 'crypto';
import { $Enums } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { batchStatusMap, batchStatusReverseMap } from '@/prisma/enumMaps';
import { initialMaterialBatches } from '@/lib/mockData';
import { safeDb } from './safeDb';
import type { MaterialBatch } from '@/lib/types';
import type { DbClient } from './types';

function serialize<
  T extends {
    status: $Enums.MaterialBatchStatus;
    viscosityDeviationPct: number | null;
    defectRateImpact: string | null;
  },
>(
  row: T,
): Omit<T, 'status' | 'viscosityDeviationPct' | 'defectRateImpact'> & {
  status: MaterialBatch['status'];
  viscosityDeviationPct?: MaterialBatch['viscosityDeviationPct'];
  defectRateImpact?: MaterialBatch['defectRateImpact'];
} {
  const { status, viscosityDeviationPct, defectRateImpact, ...rest } = row;
  return {
    ...rest,
    status: batchStatusReverseMap[status],
    viscosityDeviationPct: viscosityDeviationPct ?? undefined,
    defectRateImpact: defectRateImpact ?? undefined,
  };
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
          supplier: data.supplier,
          receivedDate: data.receivedDate,
          expiryDate: data.expiryDate,
          quantity: data.quantity,
          unitOfMeasure: data.unitOfMeasure,
          status: batchStatusMap[data.status],
          viscosityDeviationPct: data.viscosityDeviationPct ?? null,
          associatedProducts: data.associatedProducts ?? [],
          defectRateImpact: data.defectRateImpact ?? null,
          relatedAlertIds: data.relatedAlertIds ?? [],
        },
      });
      return serialize(row);
    },
    () => ({ id: batchId, ...data })
  );
}
