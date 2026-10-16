import { randomUUID } from 'crypto';
import { $Enums } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { batchStatusMap, batchStatusReverseMap } from '@/prisma/enumMaps';
import type { MaterialBatch } from '@/lib/types';
import type { DbClient } from './types';

function serialize<T extends { status: $Enums.MaterialBatchStatus }>(row: T) {
  return { ...row, status: batchStatusReverseMap[row.status] };
}

export async function findAll(client: DbClient = prisma) {
  const rows = await client.materialBatch.findMany();
  return rows.map(serialize);
}

export async function create(data: Omit<MaterialBatch, 'id'>, client: DbClient = prisma) {
  const row = await client.materialBatch.create({
    data: {
      id: `mb-user-${randomUUID()}`,
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
}
