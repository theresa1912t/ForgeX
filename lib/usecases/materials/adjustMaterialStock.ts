import * as materialRepository from '@/lib/repositories/materialRepository';
import { NotFoundError, ValidationError } from '@/lib/usecases/errors';

export async function adjustMaterialStock(materialId: string, newStock: number) {
  if (typeof newStock !== 'number') {
    throw new ValidationError('newStock (number) is required');
  }

  const existing = await materialRepository.findById(materialId);
  if (!existing) {
    throw new NotFoundError('Material not found');
  }

  return materialRepository.update(materialId, { currentStock: Math.max(0, newStock) });
}
