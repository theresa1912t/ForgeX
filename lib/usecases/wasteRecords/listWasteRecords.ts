import * as wasteRecordRepository from '@/lib/repositories/wasteRecordRepository';

export async function listWasteRecords() {
  return wasteRecordRepository.findAll();
}
