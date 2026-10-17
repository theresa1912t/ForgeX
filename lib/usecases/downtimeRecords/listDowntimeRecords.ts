import * as downtimeRecordRepository from '@/lib/repositories/downtimeRecordRepository';

export async function listDowntimeRecords() {
  return downtimeRecordRepository.findAll();
}
