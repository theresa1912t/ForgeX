import * as machineRepository from '@/lib/repositories/machineRepository';

export async function listMachines() {
  return machineRepository.findAll();
}
