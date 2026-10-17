import { randomUUID } from 'crypto';
import type { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import type { NotificationItem } from '@/lib/types';
import type { DbClient } from './types';

export async function findAll(client: DbClient = prisma) {
  return client.notificationItem.findMany({ orderBy: { id: 'asc' } });
}

export async function findById(id: string, client: DbClient = prisma) {
  return client.notificationItem.findUnique({ where: { id } });
}

export async function create(
  data: Omit<NotificationItem, 'id' | 'timestamp' | 'read'>,
  client: DbClient = prisma,
) {
  return client.notificationItem.create({
    data: {
      id: `notif-${randomUUID()}`,
      title: data.title,
      message: data.message,
      severity: data.severity,
      category: data.category,
      linkModule: data.linkModule ?? null,
      linkId: data.linkId ?? null,
      timestamp: 'Just now',
      read: false,
    },
  });
}

export async function updateRead(id: string, read: boolean, client: DbClient = prisma) {
  return client.notificationItem.update({ where: { id }, data: { read } });
}

export async function markAllRead(client: DbClient = prisma) {
  return client.notificationItem.updateMany({ where: { read: false }, data: { read: true } });
}

// Bulk reset/seed path: rows are already Prisma-shaped (built by prisma/seedData.ts).
export async function deleteAll(client: DbClient = prisma) {
  return client.notificationItem.deleteMany({});
}

export async function createMany(
  rows: Prisma.NotificationItemCreateManyInput[],
  client: DbClient = prisma,
) {
  return client.notificationItem.createMany({ data: rows });
}
