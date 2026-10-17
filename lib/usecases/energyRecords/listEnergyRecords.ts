import * as energyRecordRepository from '@/lib/repositories/energyRecordRepository';

export async function listEnergyRecords() {
  return energyRecordRepository.findAll();
}
