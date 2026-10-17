import * as materialBatchRepository from '@/lib/repositories/materialBatchRepository';

export async function listMaterialBatches() {
  return materialBatchRepository.findAll();
}
