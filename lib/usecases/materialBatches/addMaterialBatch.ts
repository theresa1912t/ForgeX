import { prisma } from '@/lib/prisma';
import * as materialRepository from '@/lib/repositories/materialRepository';
import * as materialBatchRepository from '@/lib/repositories/materialBatchRepository';
import { NotFoundError, ValidationError } from '@/lib/usecases/errors';
import type { MaterialBatch } from '@/lib/types';

export async function addMaterialBatch(input: Omit<MaterialBatch, 'id'>) {
  if (!input.materialId || !input.batchCode || typeof input.quantity !== 'number') {
    throw new ValidationError('materialId, batchCode, and quantity are required');
  }

  return prisma.$transaction(async (tx) => {
    const material = await materialRepository.findById(input.materialId, tx);
    if (!material) {
      throw new NotFoundError('Material not found');
    }

    const batch = await materialBatchRepository.create(input, tx);

    await materialRepository.update(
      input.materialId,
      {
        currentStock: material.currentStock + input.quantity,
        activeBatchCount: material.activeBatchCount + 1,
      },
      tx,
    );

    return batch;
  });
}
