import * as deviceConnectionRepository from '@/lib/repositories/deviceConnectionRepository';
import { ValidationError } from '@/lib/usecases/errors';
import type { DeviceConnection } from '@/lib/types';

export async function addDeviceConnection(input: Omit<DeviceConnection, 'id'>) {
  if (!input.name || !input.protocol || !input.endpointUrl) {
    throw new ValidationError('name, protocol, and endpointUrl are required');
  }
  return deviceConnectionRepository.create({ ...input, status: input.status ?? 'Connected' });
}
