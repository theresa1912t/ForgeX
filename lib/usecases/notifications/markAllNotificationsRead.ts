import * as notificationRepository from '@/lib/repositories/notificationRepository';

export async function markAllNotificationsRead() {
  await notificationRepository.markAllRead();
}
