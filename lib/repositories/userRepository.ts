import { prisma } from '@/lib/prisma';
import type { DbClient } from './types';

// Excludes passwordHash — this is the public-facing shape served by /api/v1/users.
const PUBLIC_SELECT = {
  id: true,
  name: true,
  email: true,
  role: true,
  title: true,
  avatar: true,
  organizationId: true,
} as const;

export async function findAll(client: DbClient = prisma) {
  return client.user.findMany({ select: PUBLIC_SELECT, orderBy: { id: 'asc' } });
}

export async function findById(id: string, client: DbClient = prisma) {
  return client.user.findUnique({ where: { id }, select: PUBLIC_SELECT });
}

// The only place passwordHash is ever read — used exclusively by the auth authorize() callback.
export async function findByEmailWithPassword(email: string, client: DbClient = prisma) {
  return client.user.findUnique({ where: { email } });
}
