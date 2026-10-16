import * as machineConnectivityProfileRepository from '@/lib/repositories/machineConnectivityProfileRepository';

export async function listMachineProfiles() {
  return machineConnectivityProfileRepository.findAll();
}
