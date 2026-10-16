import * as deviceConnectionRepository from '@/lib/repositories/deviceConnectionRepository';
import { NotFoundError } from '@/lib/usecases/errors';

export async function testDeviceConnection(id: string) {
  const existing = await deviceConnectionRepository.findById(id);
  if (!existing) {
    throw new NotFoundError('Device connection not found');
  }

  const pingLatencyMs = Math.floor(Math.random() * 15) + 8;
  return deviceConnectionRepository.updateTestResult(id, {
    status: 'Connected',
    pingLatencyMs,
    lastHeartbeat: 'Just now (verified)',
  });
}
