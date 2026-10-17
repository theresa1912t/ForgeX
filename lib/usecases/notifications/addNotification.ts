import * as notificationRepository from '@/lib/repositories/notificationRepository';
import { ValidationError } from '@/lib/usecases/errors';
import type { NotificationItem } from '@/lib/types';

export async function addNotification(input: Omit<NotificationItem, 'id' | 'timestamp' | 'read'>) {
  if (!input.title || !input.message || !input.severity || !input.category) {
    throw new ValidationError('title, message, severity, and category are required');
  }
  return notificationRepository.create(input);
}
