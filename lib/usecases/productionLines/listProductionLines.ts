import * as productionLineRepository from '@/lib/repositories/productionLineRepository';

export async function listProductionLines() {
  return productionLineRepository.findAll();
}
