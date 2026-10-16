import * as qualityRecordRepository from '@/lib/repositories/qualityRecordRepository';

export async function listQualityRecords() {
  return qualityRecordRepository.findAll();
}
