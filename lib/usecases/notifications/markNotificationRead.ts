import * as notificationRepository from '@/lib/repositories/notificationRepository';
import { NotFoundError, ValidationError } from '@/lib/usecases/errors';

export async function markNotificationRead(id: string, read: unknown) {
  if (typeof read !== 'boolean') {
    throw new ValidationError('read (boolean) is required');
  }

  const existing = await notificationRepository.findById(id);
  if (!existing) {
    throw new NotFoundError('Notification not found');
  }

  return notificationRepository.updateRead(id, read);
}
