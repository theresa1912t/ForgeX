import * as wasteRecordRepository from '@/lib/repositories/wasteRecordRepository';
import { ValidationError } from '@/lib/usecases/errors';
import type { WasteRecord } from '@/lib/types';

export async function addWasteRecord(input: Omit<WasteRecord, 'id' | 'timestamp'>) {
  if (!input.materialName || !input.lineName || typeof input.wasteQuantityKg !== 'number' || !input.wasteReason) {
    throw new ValidationError('materialName, lineName, wasteQuantityKg, and wasteReason are required');
  }
  return wasteRecordRepository.create(input);
}
