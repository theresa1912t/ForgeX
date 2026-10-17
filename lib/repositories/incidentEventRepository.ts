import { prisma } from '@/lib/prisma';
import type { DbClient } from './types';

export async function create(
  data: {
    alertId: string;
    eventType: string;
    actorName?: string | null;
    fromStatus?: string | null;
    toStatus?: string | null;
    message: string;
  },
  client: DbClient = prisma,
) {
  return client.incidentEvent.create({ data });
}

export async function findByAlert(alertId: string, client: DbClient = prisma) {
  return client.incidentEvent.findMany({
    where: { alertId },
    orderBy: { createdAt: 'asc' },
  });
}

// Bulk reset/seed path: mirrors every other repository's deleteAll. Must run before
// alertRepository.deleteAll() — IncidentEvent.alertId is a required FK into Alert.
export async function deleteAll(client: DbClient = prisma) {
  return client.incidentEvent.deleteMany({});
}
