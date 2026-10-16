import * as sensorReadingRepository from '@/lib/repositories/sensorReadingRepository';

export async function getMachineReadings(machineId: string) {
  return sensorReadingRepository.findRecentByMachine(machineId);
}
