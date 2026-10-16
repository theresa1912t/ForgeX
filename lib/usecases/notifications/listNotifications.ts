import * as notificationRepository from '@/lib/repositories/notificationRepository';

export async function listNotifications() {
  return notificationRepository.findAll();
}
