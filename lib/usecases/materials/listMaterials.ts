import * as materialRepository from '@/lib/repositories/materialRepository';

export async function listMaterials() {
  return materialRepository.findAll();
}
