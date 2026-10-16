import * as machineConnectivityProfileRepository from '@/lib/repositories/machineConnectivityProfileRepository';
import { NotFoundError, ValidationError } from '@/lib/usecases/errors';

export async function updateMachineProfileGateway(machineId: string, gatewayId: string) {
  if (!gatewayId) {
    throw new ValidationError('gatewayId is required');
  }

  const existing = await machineConnectivityProfileRepository.findByMachineId(machineId);
  if (!existing) {
    throw new NotFoundError('Machine connectivity profile not found');
  }

  return machineConnectivityProfileRepository.updateGateway(machineId, gatewayId);
}
