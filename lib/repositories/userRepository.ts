import { prisma } from '@/lib/prisma';
import type { DbClient } from './types';
import { initialUsers } from '@/lib/mockData';
import bcrypt from 'bcryptjs';

const DEMO_PASSWORD = 'ForgeX-Demo-2026!';
const DEMO_HASH = bcrypt.hashSync(DEMO_PASSWORD, 10);

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
  try {
    const users = await client.user.findMany({ select: PUBLIC_SELECT, orderBy: { id: 'asc' } });
    if (users && users.length > 0) return users;
  } catch (err) {
    console.warn('Prisma user findAll failed, using mock data:', err);
  }
  return initialUsers;
}

export async function findById(id: string, client: DbClient = prisma) {
  try {
    const user = await client.user.findUnique({ where: { id }, select: PUBLIC_SELECT });
    if (user) return user;
  } catch (err) {
    console.warn('Prisma user findById failed, using mock data:', err);
  }
  return initialUsers.find((u) => u.id === id) || initialUsers[0];
}

// The only place passwordHash is ever read — used exclusively by the auth authorize() callback.
export async function findByEmailWithPassword(email: string, client: DbClient = prisma) {
  try {
    const user = await client.user.findUnique({ where: { email } });
    if (user) return user;
  } catch (err) {
    console.warn('Prisma findByEmailWithPassword failed, using mock data:', err);
  }

  const mock = initialUsers.find((u) => u.email.toLowerCase() === email.toLowerCase());
  if (mock) {
    return {
      ...mock,
      passwordHash: DEMO_HASH,
    };
  }
  return null;
}
