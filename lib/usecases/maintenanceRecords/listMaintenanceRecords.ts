import * as maintenanceRecordRepository from '@/lib/repositories/maintenanceRecordRepository';

export async function listMaintenanceRecords() {
  return maintenanceRecordRepository.findAll();
}
