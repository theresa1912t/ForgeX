import * as deviceConnectionRepository from '@/lib/repositories/deviceConnectionRepository';

export async function listDeviceConnections() {
  return deviceConnectionRepository.findAll();
}
