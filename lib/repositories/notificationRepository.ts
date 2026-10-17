import { randomUUID } from 'crypto';
import type { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { initialNotifications } from '@/lib/mockData';
import { safeDb } from './safeDb';
import type { NotificationItem } from '@/lib/types';
import type { DbClient } from './types';

export async function findAll(client: DbClient = prisma) {
  return safeDb(
    () => client.notificationItem.findMany({ orderBy: { id: 'asc' } }),
    initialNotifications
  );
}

export async function findById(id: string, client: DbClient = prisma) {
  return safeDb(
    () => client.notificationItem.findUnique({ where: { id } }),
    () => initialNotifications.find((n) => n.id === id) || initialNotifications[0]
  );
}

export async function create(
  data: Omit<NotificationItem, 'id' | 'timestamp' | 'read'>,
  client: DbClient = prisma,
) {
  const notifId = `notif-${randomUUID()}`;
  return safeDb(
    () => client.notificationItem.create({
      data: {
        id: notifId,
        title: data.title,
        message: data.message,
        severity: data.severity,
        category: data.category,
        linkModule: data.linkModule ?? null,
        linkId: data.linkId ?? null,
        timestamp: 'Just now',
        read: false,
      },
    }),
    () => ({ id: notifId, ...data, timestamp: 'Just now', read: false })
  );
}

export async function updateRead(id: string, read: boolean, client: DbClient = prisma) {
  return safeDb(
    () => client.notificationItem.update({ where: { id }, data: { read } }),
    () => ({ ...initialNotifications.find((n) => n.id === id), read })
  );
}

export async function markAllRead(client: DbClient = prisma) {
  return safeDb(
    () => client.notificationItem.updateMany({ where: { read: false }, data: { read: true } }),
    { count: initialNotifications.length }
  );
}

export async function deleteAll(client: DbClient = prisma) {
  return safeDb(() => client.notificationItem.deleteMany({}), { count: 0 });
}

export async function createMany(
  rows: Prisma.NotificationItemCreateManyInput[],
  client: DbClient = prisma,
) {
  return safeDb(() => client.notificationItem.createMany({ data: rows }), { count: rows.length });
}
